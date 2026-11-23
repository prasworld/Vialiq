namespace Vialiq.Caching.Services;

using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using StackExchange.Redis;
using Vialiq.Caching.Abstractions;
using Vialiq.Caching.Abstractions.Models;
using Vialiq.Core.Entities;
using Vialiq.Core.Models;

public sealed class StudyLockService : IStudyLockService
{
    private readonly IMongoCollection<StudyLockEntity> _locksCollection;
    private readonly IRedisConnectionFactory _redisFactory;
    private readonly ILogger<StudyLockService> _logger;
    private static readonly TimeSpan LockTtl = TimeSpan.FromMinutes(15);

    public StudyLockService(
        IMongoDatabase studyDb,
        IRedisConnectionFactory redisFactory,
        ILogger<StudyLockService> logger)
    {
        _locksCollection = studyDb.GetCollection<StudyLockEntity>("study_locks");
        _redisFactory = redisFactory;
        _logger = logger;
    }

    public async Task<LockResult> AcquireFormLockAsync(
        string studyId, 
        string crfId, 
        UserContext user, 
        CancellationToken ct = default)
    {
        var redisKey = $"edc:form_lock:{studyId}:{crfId}";
        var redis = _redisFactory.GetDatabase();

        // 1. Check Redis fast path
        try
        {
            var existingRedisLock = await redis.StringGetAsync(redisKey);
            if (existingRedisLock.HasValue)
            {
                var lockData = JsonSerializer.Deserialize<LockPayload>(existingRedisLock!);
                if (lockData?.UserId != user.UserId)
                {
                    return LockResult.Denied(lockData!.UserId, lockData.FullName, lockData.ExpiresAtUtc);
                }
            }
        }
        catch (Exception cacheEx)
        {
            _logger.LogWarning(cacheEx, "Fast-path Redis read failed for {RedisKey}. Falling back to MongoDB.", redisKey);
        }

        // 2. ATOMIC DB WRITE: MongoDB is canonical source of truth
        var now = DateTime.UtcNow;
        var expiresAt = now.Add(LockTtl);

        var filter = Builders<StudyLockEntity>.Filter.And(
            Builders<StudyLockEntity>.Filter.Eq(l => l.StudyId, studyId),
            Builders<StudyLockEntity>.Filter.Eq(l => l.TargetCrfId, crfId),
            Builders<StudyLockEntity>.Filter.Or(
                Builders<StudyLockEntity>.Filter.Eq(l => l.Status, LockStatus.Released),
                Builders<StudyLockEntity>.Filter.Lt(l => l.ExpiresAtUtc, now),
                Builders<StudyLockEntity>.Filter.Eq(l => l.LockedByUserId, user.UserId)
            )
        );

        var update = Builders<StudyLockEntity>.Update
            .Set(l => l.LockedByUserId, user.UserId)
            .Set(l => l.LockedByFullName, user.FullName)
            .Set(l => l.LockedAtUtc, now)
            .Set(l => l.ExpiresAtUtc, expiresAt)
            .Set(l => l.Status, LockStatus.Active);

        var options = new FindOneAndUpdateOptions<StudyLockEntity>
        {
            IsUpsert = true,
            ReturnDocument = ReturnDocument.After
        };

        try
        {
            await _locksCollection.FindOneAndUpdateAsync(filter, update, options, ct);
        }
        catch (MongoCommandException ex) when (ex.Code == 11000) // Duplicate key race condition
        {
            var currentLock = await _locksCollection.Find(l => l.StudyId == studyId && l.TargetCrfId == crfId).FirstOrDefaultAsync(ct);
            return LockResult.Denied(currentLock.LockedByUserId, currentLock.LockedByFullName, currentLock.ExpiresAtUtc);
        }

        // 3. SYNCHRONOUS CACHE WRITE: Write-through to Redis
        try
        {
            var payload = JsonSerializer.Serialize(new LockPayload(user.UserId, user.FullName, expiresAt));
            await redis.StringSetAsync(redisKey, payload, LockTtl);
        }
        catch (Exception cacheEx)
        {
            _logger.LogWarning(cacheEx, "Failed to write lock to Redis for CRF {CrfId}. Degraded to MongoDB-only lock.", crfId);
            // System remains safe because MongoDB holds the canonical source of truth
        }

        return LockResult.Acquired(expiresAt);
    }

    public async Task ReleaseFormLockAsync(
        string studyId, 
        string crfId, 
        UserContext user, 
        CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;

        // 1. Update DB Source of Truth
        await _locksCollection.UpdateOneAsync(
            l => l.StudyId == studyId && l.TargetCrfId == crfId && l.LockedByUserId == user.UserId,
            Builders<StudyLockEntity>.Update
                .Set(l => l.Status, LockStatus.Released)
                .Set(l => l.ReleasedAtUtc, now),
            cancellationToken: ct);

        // 2. Synchronous Cache Eviction
        try
        {
            var redisKey = $"edc:form_lock:{studyId}:{crfId}";
            await _redisFactory.GetDatabase().KeyDeleteAsync(redisKey);
        }
        catch (Exception cacheEx)
        {
            _logger.LogWarning(cacheEx, "Failed to evict lock from Redis for CRF {CrfId}.", crfId);
        }
    }

    public async Task BreakFormLockAsync(
        string studyId, 
        string crfId, 
        string auditReason, 
        UserContext user, 
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(auditReason))
        {
            throw new ArgumentException("A mandatory 21 CFR Part 11 audit reason is required to break a form lock.", nameof(auditReason));
        }

        var now = DateTime.UtcNow;

        // 1. Break lock in MongoDB source of truth with audit reason
        await _locksCollection.UpdateOneAsync(
            l => l.StudyId == studyId && l.TargetCrfId == crfId,
            Builders<StudyLockEntity>.Update
                .Set(l => l.Status, LockStatus.Broken)
                .Set(l => l.BrokenByUserId, user.UserId)
                .Set(l => l.BrokenReason, auditReason)
                .Set(l => l.BrokenAtUtc, now),
            cancellationToken: ct);

        // 2. Evict from Redis
        try
        {
            var redisKey = $"edc:form_lock:{studyId}:{crfId}";
            await _redisFactory.GetDatabase().KeyDeleteAsync(redisKey);
        }
        catch (Exception cacheEx)
        {
            _logger.LogWarning(cacheEx, "Failed to evict lock from Redis for CRF {CrfId}.", crfId);
        }
    }
}
