namespace Vialiq.Caching.Services;

using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using StackExchange.Redis;
using Vialiq.Caching.Abstractions;
using Vialiq.Caching.Abstractions.Models;
using Vialiq.Caching.Constants;
using Vialiq.Core.Constants;
using Vialiq.Core.Entities;
using Vialiq.Core.Models;

public sealed class StudyLockService : IStudyLockService
{
    private readonly IMongoCollection<StudyLockEntity> _locksCollection;
    private readonly IRedisConnectionFactory _redisFactory;
    private readonly ILogger<StudyLockService> _logger;
    private static readonly TimeSpan LockTtl = TimeSpan.FromMinutes(15);

    private static readonly HashSet<string> AuthorizedBreakLockRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        ClinicalUserRoles.Investigator,
        ClinicalUserRoles.Crc,
        ClinicalUserRoles.Cra,
        ClinicalUserRoles.DataManager,
        ClinicalUserRoles.StudyAdmin,
        ClinicalUserRoles.SuperAdmin
    };

    public StudyLockService(
        IMongoDatabase studyDb,
        IRedisConnectionFactory redisFactory,
        ILogger<StudyLockService> logger)
    {
        ArgumentNullException.ThrowIfNull(studyDb);
        _locksCollection = studyDb.GetCollection<StudyLockEntity>(MongoClusterConstants.CollectionNames.StudyEditLeases);
        _redisFactory = redisFactory ?? throw new ArgumentNullException(nameof(redisFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<LockResult> AcquireFormLockAsync(
        string studyId, 
        string crfId, 
        UserContext user, 
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(studyId);
        ArgumentException.ThrowIfNullOrWhiteSpace(crfId);
        ArgumentNullException.ThrowIfNull(user);

        var redisKey = $"edc:form_lock:{user.TenantId}:{studyId}:{crfId}";
        var redis = _redisFactory.GetDatabase();
        var now = DateTime.UtcNow;

        // 1. Check Redis fast path with database verification
        try
        {
            var existingRedisLock = await redis.StringGetAsync(redisKey).ConfigureAwait(false);
            if (existingRedisLock.HasValue)
            {
                var lockData = JsonSerializer.Deserialize<LockPayload>((string)existingRedisLock!);
                if (lockData != null && lockData.UserId != user.UserId && lockData.ExpiresAtUtc > now)
                {
                    // Check if MongoDB confirms this active lock
                    var activeDbLock = await _locksCollection.Find(l =>
                        l.TenantId == user.TenantId &&
                        l.StudyId == studyId &&
                        l.TargetCrfId == crfId &&
                        l.Status == LockStatus.Active &&
                        l.ExpiresAtUtc > now).FirstOrDefaultAsync(ct).ConfigureAwait(false);

                    if (activeDbLock != null && activeDbLock.LockedByUserId != user.UserId)
                    {
                        return LockResult.Denied(activeDbLock.LockedByUserId, activeDbLock.LockedByFullName, activeDbLock.ExpiresAtUtc);
                    }

                    // Stale Redis key detected (MongoDB was released/broken); evict stale Redis key
                    await redis.KeyDeleteAsync(redisKey).ConfigureAwait(false);
                }
            }
        }
        catch (Exception cacheEx)
        {
            _logger.LogWarning(cacheEx, CachingLogMessages.FastPathRedisReadFailed, redisKey);
        }

        // 2. ATOMIC DB WRITE: MongoDB is canonical source of truth
        var expiresAt = now.Add(LockTtl);

        var filter = Builders<StudyLockEntity>.Filter.And(
            Builders<StudyLockEntity>.Filter.Eq(l => l.TenantId, user.TenantId),
            Builders<StudyLockEntity>.Filter.Eq(l => l.StudyId, studyId),
            Builders<StudyLockEntity>.Filter.Eq(l => l.TargetCrfId, crfId),
            Builders<StudyLockEntity>.Filter.Or(
                Builders<StudyLockEntity>.Filter.Eq(l => l.Status, LockStatus.Released),
                Builders<StudyLockEntity>.Filter.Eq(l => l.Status, LockStatus.Broken),
                Builders<StudyLockEntity>.Filter.Lt(l => l.ExpiresAtUtc, now),
                Builders<StudyLockEntity>.Filter.Eq(l => l.LockedByUserId, user.UserId)
            )
        );

        var update = Builders<StudyLockEntity>.Update
            .Set(l => l.TenantId, user.TenantId)
            .Set(l => l.StudyId, studyId)
            .Set(l => l.TargetCrfId, crfId)
            .Set(l => l.LockedByUserId, user.UserId)
            .Set(l => l.LockedByFullName, user.FullName)
            .Set(l => l.LockedAtUtc, now)
            .Set(l => l.ExpiresAtUtc, expiresAt)
            .Set(l => l.Status, LockStatus.Active)
            .Set(l => l.ReleasedAtUtc, null)
            .Set(l => l.BrokenByUserId, null)
            .Set(l => l.BrokenReason, null)
            .Set(l => l.BrokenAtUtc, null);

        var options = new FindOneAndUpdateOptions<StudyLockEntity>
        {
            IsUpsert = true,
            ReturnDocument = ReturnDocument.After
        };

        try
        {
            var updated = await _locksCollection.FindOneAndUpdateAsync(filter, update, options, ct).ConfigureAwait(false);
            if (updated == null)
            {
                var currentLock = await _locksCollection.Find(l =>
                    l.TenantId == user.TenantId &&
                    l.StudyId == studyId &&
                    l.TargetCrfId == crfId &&
                    l.Status == LockStatus.Active).FirstOrDefaultAsync(ct).ConfigureAwait(false);

                if (currentLock != null && currentLock.LockedByUserId != user.UserId)
                {
                    return LockResult.Denied(currentLock.LockedByUserId, currentLock.LockedByFullName, currentLock.ExpiresAtUtc);
                }
            }
        }
        catch (MongoCommandException ex) when (ex.Code == 11000) // Duplicate key race condition
        {
            var currentLock = await _locksCollection.Find(l =>
                l.TenantId == user.TenantId &&
                l.StudyId == studyId &&
                l.TargetCrfId == crfId &&
                l.Status == LockStatus.Active).FirstOrDefaultAsync(ct).ConfigureAwait(false);

            if (currentLock != null && currentLock.LockedByUserId == user.UserId)
            {
                return LockResult.Acquired(currentLock.ExpiresAtUtc);
            }

            return currentLock != null
                ? LockResult.Denied(currentLock.LockedByUserId, currentLock.LockedByFullName, currentLock.ExpiresAtUtc)
                : LockResult.Denied(user.UserId, user.FullName, expiresAt);
        }

        // 3. SYNCHRONOUS CACHE WRITE: Write-through to Redis
        try
        {
            var payload = JsonSerializer.Serialize(new LockPayload(user.UserId, user.FullName, expiresAt));
            await redis.StringSetAsync(redisKey, payload, LockTtl).ConfigureAwait(false);
        }
        catch (Exception cacheEx)
        {
            _logger.LogWarning(cacheEx, CachingLogMessages.RedisLockWriteDegraded, crfId);
        }

        return LockResult.Acquired(expiresAt);
    }

    public async Task ReleaseFormLockAsync(
        string studyId, 
        string crfId, 
        UserContext user, 
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(studyId);
        ArgumentException.ThrowIfNullOrWhiteSpace(crfId);
        ArgumentNullException.ThrowIfNull(user);

        var now = DateTime.UtcNow;

        // 1. Update DB Source of Truth
        await _locksCollection.UpdateOneAsync(
            l => l.TenantId == user.TenantId &&
                 l.StudyId == studyId &&
                 l.TargetCrfId == crfId &&
                 l.LockedByUserId == user.UserId &&
                 l.Status == LockStatus.Active,
            Builders<StudyLockEntity>.Update
                .Set(l => l.Status, LockStatus.Released)
                .Set(l => l.ReleasedAtUtc, now),
            cancellationToken: ct).ConfigureAwait(false);

        // 2. Safe Synchronous Cache Eviction: compare and delete
        try
        {
            var redisKey = $"edc:form_lock:{user.TenantId}:{studyId}:{crfId}";
            var redis = _redisFactory.GetDatabase();
            var existingRedisLock = await redis.StringGetAsync(redisKey).ConfigureAwait(false);
            if (existingRedisLock.HasValue)
            {
                var lockData = JsonSerializer.Deserialize<LockPayload>((string)existingRedisLock!);
                if (lockData?.UserId == user.UserId)
                {
                    await redis.KeyDeleteAsync(redisKey).ConfigureAwait(false);
                }
            }
        }
        catch (Exception cacheEx)
        {
            _logger.LogWarning(cacheEx, CachingLogMessages.FailedToEvictRedisLock, crfId);
        }
    }

    public async Task BreakFormLockAsync(
        string studyId, 
        string crfId, 
        string auditReason, 
        UserContext user, 
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(studyId);
        ArgumentException.ThrowIfNullOrWhiteSpace(crfId);
        ArgumentNullException.ThrowIfNull(user);

        if (string.IsNullOrWhiteSpace(auditReason))
        {
            throw new ArgumentException(InfrastructureErrorMessages.AuditReasonRequired, nameof(auditReason));
        }

        if (!AuthorizedBreakLockRoles.Contains(user.Role))
        {
            throw new UnauthorizedAccessException(InfrastructureErrorMessages.UnauthorizedBreakLock(user.Role));
        }

        var now = DateTime.UtcNow;
        var breakEntry = new LockBreakAuditEntry(user.UserId, auditReason, now);

        // 1. Break lock in MongoDB source of truth with immutable audit history entry
        await _locksCollection.UpdateOneAsync(
            l => l.TenantId == user.TenantId && l.StudyId == studyId && l.TargetCrfId == crfId,
            Builders<StudyLockEntity>.Update
                .Set(l => l.Status, LockStatus.Broken)
                .Set(l => l.BrokenByUserId, user.UserId)
                .Set(l => l.BrokenReason, auditReason)
                .Set(l => l.BrokenAtUtc, now)
                .Push(l => l.BreakHistory, breakEntry),
            cancellationToken: ct).ConfigureAwait(false);

        // 2. Evict from Redis
        try
        {
            var redisKey = $"edc:form_lock:{user.TenantId}:{studyId}:{crfId}";
            await _redisFactory.GetDatabase().KeyDeleteAsync(redisKey).ConfigureAwait(false);
        }
        catch (Exception cacheEx)
        {
            _logger.LogWarning(cacheEx, CachingLogMessages.FailedToEvictRedisLock, crfId);
        }
    }
}
