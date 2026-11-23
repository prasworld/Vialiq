namespace Vialiq.Caching.Constants;

/// <summary>
/// Strongly-typed structured log messages for the caching and distributed locking subsystem.
/// Eliminates bare string literals in caching services.
/// </summary>
public static class CachingLogMessages
{
    public const string FastPathRedisReadFailed =
        "Fast-path Redis read failed for {RedisKey}. Falling back to MongoDB.";

    public const string RedisLockWriteDegraded =
        "Failed to write lock to Redis for CRF {CrfId}. Degraded to MongoDB-only lock.";

    public const string FailedToEvictRedisLock =
        "Failed to evict lock from Redis for CRF {CrfId}.";

    public const string FailedToInvalidateRedisKey =
        "Failed to invalidate Redis key {Key}";

    public const string RedisConnectionFailed =
        "Redis connection failed on endpoint {Endpoint}. Type: {FailureType}";

    public const string RedisConnectionRestored =
        "Redis connection restored on endpoint {Endpoint}.";

    public const string RedisServerError =
        "Redis server error on endpoint {Endpoint}: {Message}";

    public const string RedisReadFailed =
        "Redis read failed for {Key}. Falling back to database.";

    public const string RedisWriteFailed =
        "Redis write failed for {Key}.";
}
