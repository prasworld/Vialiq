namespace Vialiq.Infrastructure.Constants;

/// <summary>
/// Structured logging template constants for infrastructure services.
/// Eliminates bare string literals in loggers while preserving high-performance structured logging parameters.
/// </summary>
public static class InfrastructureLogMessages
{
    public const string InitializingPooledClient =
        "Initializing pooled IMongoClient for cluster {ClusterId} (ReplicaSet: {ReplicaSet}, Endpoint: {ConnectionString})";

    public const string HeartbeatFailed =
        "MongoDB Heartbeat failed on {ClusterId} server {Endpoint}: {Error}";

    public const string PingFailedWarning =
        "Ping failed for MongoDB cluster {ClusterId}";

    public const string ErrorDisposingClient =
        "Error disposing MongoClient";

    public const string ErrorDisposingClientAsync =
        "Error disposing MongoClient asynchronously";

    public const string ErrorDisposingLock =
        "Error disposing SemaphoreSlim lock";

    public const string FailedToInvalidateRedisKey =
        "Failed to invalidate Redis key {Key}";

    public const string FailedToEvictRedisLock =
        "Failed to evict lock from Redis for CRF {CrfId}";

    public const string RedisLockWriteDegraded =
        "Failed to write lock to Redis for CRF {CrfId}. Degraded to MongoDB-only lock.";

    public const string FastPathRedisReadFailed =
        "Fast-path Redis read failed for {RedisKey}. Falling back to MongoDB.";
}
