namespace Vialiq.Caching.Constants;

/// <summary>
/// Strongly-typed structured log messages for the caching and distributed locking subsystem.
/// Eliminates bare string literals in caching services.
/// </summary>
public static class CachingLogMessages
{
    /// <summary>
    /// Log message when fast-path Redis read fails and falls back to MongoDB.
    /// </summary>
    public const string FastPathRedisReadFailed =
        "Fast-path Redis read failed for {RedisKey}. Falling back to MongoDB.";

    /// <summary>
    /// Log message when synchronous Redis lock write degrades to MongoDB only.
    /// </summary>
    public const string RedisLockWriteDegraded =
        "Failed to write lock to Redis for CRF {CrfId}. Degraded to MongoDB-only lock.";

    /// <summary>
    /// Log message when lock eviction from Redis fails.
    /// </summary>
    public const string FailedToEvictRedisLock =
        "Failed to evict lock from Redis for CRF {CrfId}.";

    /// <summary>
    /// Log message when key invalidation in Redis fails.
    /// </summary>
    public const string FailedToInvalidateRedisKey =
        "Failed to invalidate Redis key {Key}";

    /// <summary>
    /// Log message when a Redis connection failure occurs.
    /// </summary>
    public const string RedisConnectionFailed =
        "Redis connection failed on endpoint {Endpoint}. Type: {FailureType}";

    /// <summary>
    /// Log message when a Redis connection is successfully restored.
    /// </summary>
    public const string RedisConnectionRestored =
        "Redis connection restored on endpoint {Endpoint}.";

    /// <summary>
    /// Log message when a Redis server error occurs.
    /// </summary>
    public const string RedisServerError =
        "Redis server error on endpoint {Endpoint}: {Message}";

    /// <summary>
    /// Log message when a Redis cache read fails and falls back to the database.
    /// </summary>
    public const string RedisReadFailed =
        "Redis read failed for {Key}. Falling back to database.";

    /// <summary>
    /// Log message when a Redis cache write fails.
    /// </summary>
    public const string RedisWriteFailed =
        "Redis write failed for {Key}.";
}
