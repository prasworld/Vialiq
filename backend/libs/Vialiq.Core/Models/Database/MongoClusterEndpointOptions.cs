namespace Vialiq.Core.Models.Database;

using System;

/// <summary>
/// Configuration options for a single physical MongoDB cluster endpoint in the 3-layer architecture.
/// Populated via ASP.NET Core Dependency Injection Options pattern (IOptions&lt;MongoMultiClusterOptions&gt;).
/// Contains ZERO hardcoded connection strings or server endpoints.
/// </summary>
public sealed class MongoClusterEndpointOptions
{
    public string ConnectionString { get; set; } = string.Empty;
    public string ReplicaSetName { get; set; } = string.Empty;
    public string DefaultDatabaseName { get; set; } = string.Empty;
    public int MaxConnectionPoolSize { get; set; } = 200;
    public int MinConnectionPoolSize { get; set; } = 10;
    public TimeSpan ConnectTimeout { get; set; } = TimeSpan.FromSeconds(10);
    public TimeSpan SocketTimeout { get; set; } = TimeSpan.FromSeconds(30);
    public TimeSpan ServerSelectionTimeout { get; set; } = TimeSpan.FromSeconds(5);
    public TimeSpan WaitQueueTimeout { get; set; } = TimeSpan.FromSeconds(5);
    public bool RetryWrites { get; set; } = true;
    public bool RetryReads { get; set; } = true;

    /// <summary>
    /// Normalizes effective timeouts, ensuring sensible fallbacks if zero/unspecified.
    /// </summary>
    public TimeSpan EffectiveConnectTimeout => ConnectTimeout > TimeSpan.Zero ? ConnectTimeout : TimeSpan.FromSeconds(10);
    public TimeSpan EffectiveSocketTimeout => SocketTimeout > TimeSpan.Zero ? SocketTimeout : TimeSpan.FromSeconds(30);
    public TimeSpan EffectiveServerSelectionTimeout => ServerSelectionTimeout > TimeSpan.Zero ? ServerSelectionTimeout : TimeSpan.FromSeconds(5);
    public TimeSpan EffectiveWaitQueueTimeout => WaitQueueTimeout > TimeSpan.Zero ? WaitQueueTimeout : TimeSpan.FromSeconds(5);
}
