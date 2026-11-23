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
}
