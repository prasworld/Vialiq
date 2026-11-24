namespace Vialiq.Core.Models.Database;

using System;

/// <summary>
/// Configuration options for a single physical MongoDB cluster endpoint in the 3-layer architecture.
/// Populated via ASP.NET Core Dependency Injection Options pattern (<c>IOptions&lt;MongoMultiClusterOptions&gt;</c>).
/// Contains ZERO hardcoded connection strings or server endpoints.
/// </summary>
public sealed class MongoClusterEndpointOptions
{
    /// <summary>The MongoDB connection string URI targeting the replica set.</summary>
    public string ConnectionString { get; set; } = string.Empty;

    /// <summary>The designated replica set name (e.g., rs-admin, rs-dev, rs-prod).</summary>
    public string ReplicaSetName { get; set; } = string.Empty;

    /// <summary>The default database name to bind when connecting without an explicit database.</summary>
    public string DefaultDatabaseName { get; set; } = string.Empty;

    /// <summary>The maximum connection pool size. Defaults to 200.</summary>
    public int MaxConnectionPoolSize { get; set; } = 200;

    /// <summary>The minimum warm connection pool size. Defaults to 10.</summary>
    public int MinConnectionPoolSize { get; set; } = 10;

    /// <summary>Connection establishment timeout.</summary>
    public TimeSpan ConnectTimeout { get; set; } = TimeSpan.FromSeconds(10);

    /// <summary>Socket read/write timeout.</summary>
    public TimeSpan SocketTimeout { get; set; } = TimeSpan.FromSeconds(30);

    /// <summary>Server selection timeout for primary replica node election.</summary>
    public TimeSpan ServerSelectionTimeout { get; set; } = TimeSpan.FromSeconds(5);

    /// <summary>Timeout when waiting for an available connection from the pool.</summary>
    public TimeSpan WaitQueueTimeout { get; set; } = TimeSpan.FromSeconds(5);

    /// <summary>Indicates whether MongoDB driver retryable writes are enabled.</summary>
    public bool RetryWrites { get; set; } = true;

    /// <summary>Indicates whether MongoDB driver retryable reads are enabled.</summary>
    public bool RetryReads { get; set; } = true;

    /// <summary>Normalizes effective connect timeout, ensuring fallback if zero.</summary>
    public TimeSpan EffectiveConnectTimeout => ConnectTimeout > TimeSpan.Zero ? ConnectTimeout : TimeSpan.FromSeconds(10);

    /// <summary>Normalizes effective socket timeout, ensuring fallback if zero.</summary>
    public TimeSpan EffectiveSocketTimeout => SocketTimeout > TimeSpan.Zero ? SocketTimeout : TimeSpan.FromSeconds(30);

    /// <summary>Normalizes effective server selection timeout, ensuring fallback if zero.</summary>
    public TimeSpan EffectiveServerSelectionTimeout => ServerSelectionTimeout > TimeSpan.Zero ? ServerSelectionTimeout : TimeSpan.FromSeconds(5);

    /// <summary>Normalizes effective wait queue timeout, ensuring fallback if zero.</summary>
    public TimeSpan EffectiveWaitQueueTimeout => WaitQueueTimeout > TimeSpan.Zero ? WaitQueueTimeout : TimeSpan.FromSeconds(5);
}
