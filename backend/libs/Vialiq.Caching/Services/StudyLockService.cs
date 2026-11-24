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
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models;

/// <summary>
/// Production dual-write implementation of <see cref="IStudyLockService"/>.
/// Persists durable clinical form leases in MongoDB (<c>study_edit_leases</c>) and synchronizes fast-path 15-minute TTL locks in Redis.
/// </summary>
public sealed class StudyLockService : IStudyLockService
{
    private readonly IMongoCollection<StudyLockEntity>? _locksCollection;
    private readonly IConnectionPoolManager? _poolManager;
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

    /// <summary>
    /// Initializes a new instance of <see cref="StudyLockService"/> using dynamic multi-cluster connection pool routing.
    /// Used in API host dependency injection containers where study databases are resolved per request.
    /// </summary>
    /// <param name="poolManager">The multi-cluster connection pool manager used to resolve study databases dynamically.</param>
    /// <param name="redisFactory">The Redis connection factory managing failover and database connectivity.</param>
    /// <param name="logger">The structured logger instance.</param>
    /// <exception cref="ArgumentNullException">Thrown when any required parameter is null.</exception>
    public StudyLockService(
        IConnectionPoolManager poolManager,
        IRedisConnectionFactory redisFactory,
        ILogger<StudyLockService> logger)
    {
        _poolManager = poolManager ?? throw new ArgumentNullException(nameof(poolManager));
        _redisFactory = redisFactory ?? throw new ArgumentNullException(nameof(redisFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _locksCollection = null;
    }

    /// <summary>
    /// Initializes a new instance of <see cref="StudyLockService"/> bound directly to an explicit MongoDB study database.
    /// Primarily used for isolated integration tests or single-study scopes.
    /// </summary>
    /// <param name="studyDb">The target MongoDB study database containing the <c>study_edit_leases</c> collection.</param>
    /// <param name="redisFactory">The Redis connection factory managing failover and database connectivity.</param>
    /// <param name="logger">The structured logger instance.</param>
    /// <exception cref="ArgumentNullException">Thrown when any required parameter is null.</exception>
    public StudyLockService(
        IMongoDatabase studyDb,
        IRedisConnectionFactory redisFactory,
        ILogger<StudyLockService> logger)
    {
        ArgumentNullException.ThrowIfNull(studyDb);
        _locksCollection = studyDb.GetCollection<StudyLockEntity>(MongoClusterConstants.CollectionNames.StudyEditLeases);
        _redisFactory = redisFactory ?? throw new ArgumentNullException(nameof(redisFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _poolManager = null;
    }

    /// <summary>
    /// Resolves the canonical MongoDB collection for study edit leases.
    /// </summary>
    /// <param name="studyId">The study identifier used to dynamically format the database name when pool manager is active.</param>
    /// <returns>The <see cref="IMongoCollection{StudyLockEntity}"/> instance.</returns>
    /// <exception cref="InvalidOperationException">Thrown if neither direct collection nor connection pool manager was initialized.</exception>
    private IMongoCollection<StudyLockEntity> GetLocksCollection(string studyId)
    {
        if (_locksCollection != null)
        {
            return _locksCollection;
        }

        if (_poolManager != null)
        {
            var dbName = MongoClusterConstants.DatabaseConventions.FormatStudyProdDatabaseName(studyId);
            return _poolManager.GetProdClusterClient()
                .GetDatabase(dbName)
                .GetCollection<StudyLockEntity>(MongoClusterConstants.CollectionNames.StudyEditLeases);
        }

        throw new InvalidOperationException(InfrastructureErrorMessages.StudyLockServiceNotInitialized);
    }

    /// <summary>
    /// Builds the canonical Redis key for form lock coordination.
    /// </summary>
    /// <param name="tenantId">The sponsor tenant identifier.</param>
    /// <param name="studyId">The clinical study identifier.</param>
    /// <param name="crfId">The target Case Report Form identifier.</param>
    /// <returns>A formatted colon-delimited Redis key.</returns>
    private static string BuildRedisKey(string tenantId, string studyId, string crfId) =>
        $"{MongoClusterConstants.CacheSegments.Edc}{MongoClusterConstants.Delimiters.Colon}" +
        $"{MongoClusterConstants.CacheSegments.FormLock}{MongoClusterConstants.Delimiters.Colon}" +
        $"{tenantId}{MongoClusterConstants.Delimiters.Colon}" +
        $"{studyId}{MongoClusterConstants.Delimiters.Colon}" +
        $"{crfId}";

    /// <inheritdoc />
    public async Task<LockResult> AcquireFormLockAsync(
        string studyId, 
        string crfId, 
        UserContext user, 
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(studyId);
        ArgumentException.ThrowIfNullOrWhiteSpace(crfId);
        ArgumentNullException.ThrowIfNull(user);

        var redisKey = BuildRedisKey(user.TenantId, studyId, crfId);
        var redis = _redisFactory.GetDatabase();
        var now = DateTime.UtcNow;
        var collection = GetLocksCollection(studyId);

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
                    var activeDbLock = await collection.Find(l =>
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
        var lockToken = Guid.NewGuid().ToString("N");

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
            .Set(l => l.LockToken, lockToken)
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
            var updated = await collection.FindOneAndUpdateAsync(filter, update, options, ct).ConfigureAwait(false);
            if (updated == null)
            {
                var currentLock = await collection.Find(l =>
                    l.TenantId == user.TenantId &&
                    l.StudyId == studyId &&
                    l.TargetCrfId == crfId &&
                    l.Status == LockStatus.Active &&
                    l.ExpiresAtUtc > now).FirstOrDefaultAsync(ct).ConfigureAwait(false);

                if (currentLock != null && currentLock.LockedByUserId != user.UserId)
                {
                    return LockResult.Denied(currentLock.LockedByUserId, currentLock.LockedByFullName, currentLock.ExpiresAtUtc);
                }
            }
        }
        catch (MongoCommandException ex) when (ex.Code == 11000) // Duplicate key race condition
        {
            var currentLock = await collection.Find(l =>
                l.TenantId == user.TenantId &&
                l.StudyId == studyId &&
                l.TargetCrfId == crfId &&
                l.Status == LockStatus.Active &&
                l.ExpiresAtUtc > now).FirstOrDefaultAsync(ct).ConfigureAwait(false);

            if (currentLock != null && currentLock.LockedByUserId == user.UserId)
            {
                return LockResult.Acquired(currentLock.ExpiresAtUtc, currentLock.LockToken);
            }

            return currentLock != null
                ? LockResult.Denied(currentLock.LockedByUserId, currentLock.LockedByFullName, currentLock.ExpiresAtUtc)
                : LockResult.Denied(user.UserId, user.FullName, expiresAt);
        }

        // 3. SYNCHRONOUS CACHE WRITE: Write-through to Redis
        try
        {
            var payload = JsonSerializer.Serialize(new LockPayload(user.UserId, user.FullName, expiresAt, lockToken));
            await redis.StringSetAsync(redisKey, payload, LockTtl).ConfigureAwait(false);
        }
        catch (Exception cacheEx)
        {
            _logger.LogWarning(cacheEx, CachingLogMessages.RedisLockWriteDegraded, crfId);
        }

        return LockResult.Acquired(expiresAt, lockToken);
    }

    /// <inheritdoc />
    public async Task ReleaseFormLockAsync(
        string studyId, 
        string crfId, 
        UserContext user, 
        string? lockToken = null,
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(studyId);
        ArgumentException.ThrowIfNullOrWhiteSpace(crfId);
        ArgumentNullException.ThrowIfNull(user);

        var now = DateTime.UtcNow;
        var collection = GetLocksCollection(studyId);

        // 1. Update DB Source of Truth: ensure lockToken matches if specified
        var filterBuilder = Builders<StudyLockEntity>.Filter;
        var filters = new List<FilterDefinition<StudyLockEntity>>
        {
            filterBuilder.Eq(l => l.TenantId, user.TenantId),
            filterBuilder.Eq(l => l.StudyId, studyId),
            filterBuilder.Eq(l => l.TargetCrfId, crfId),
            filterBuilder.Eq(l => l.LockedByUserId, user.UserId),
            filterBuilder.Eq(l => l.Status, LockStatus.Active)
        };

        if (!string.IsNullOrWhiteSpace(lockToken))
        {
            filters.Add(filterBuilder.Eq(l => l.LockToken, lockToken));
        }

        await collection.UpdateOneAsync(
            filterBuilder.And(filters),
            Builders<StudyLockEntity>.Update
                .Set(l => l.Status, LockStatus.Released)
                .Set(l => l.ReleasedAtUtc, now),
            cancellationToken: ct).ConfigureAwait(false);

        // 2. Safe Synchronous Cache Eviction: compare and delete
        try
        {
            var redisKey = BuildRedisKey(user.TenantId, studyId, crfId);
            var redis = _redisFactory.GetDatabase();
            var existingRedisLock = await redis.StringGetAsync(redisKey).ConfigureAwait(false);
            if (existingRedisLock.HasValue)
            {
                var lockData = JsonSerializer.Deserialize<LockPayload>((string)existingRedisLock!);
                if (lockData?.UserId == user.UserId &&
                    (string.IsNullOrWhiteSpace(lockToken) || lockData.LockToken == lockToken))
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

    /// <inheritdoc />
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
        var collection = GetLocksCollection(studyId);

        // 1. Break active, live lock in MongoDB source of truth with immutable audit history entry
        await collection.UpdateOneAsync(
            l => l.TenantId == user.TenantId &&
                 l.StudyId == studyId &&
                 l.TargetCrfId == crfId &&
                 l.Status == LockStatus.Active &&
                 l.ExpiresAtUtc > now,
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
            var redisKey = BuildRedisKey(user.TenantId, studyId, crfId);
            await _redisFactory.GetDatabase().KeyDeleteAsync(redisKey).ConfigureAwait(false);
        }
        catch (Exception cacheEx)
        {
            _logger.LogWarning(cacheEx, CachingLogMessages.FailedToEvictRedisLock, crfId);
        }
    }
}
