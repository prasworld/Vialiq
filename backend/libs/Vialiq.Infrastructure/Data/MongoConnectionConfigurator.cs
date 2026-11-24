namespace Vialiq.Infrastructure.Data;

using System;
using MongoDB.Driver;
using MongoDB.Driver.Core.Configuration;
using Vialiq.Core.Models.Database;

/// <summary>
/// Pure functional configurator that constructs and tunes MongoClientSettings from immutable MongoClusterEndpointOptions.
/// Standardizes 21 CFR Part 11 consistency, retryable writes, replica set discovery, and connection pool bounds.
/// </summary>
public static class MongoConnectionConfigurator
{
    /// <summary>
    /// Pure function: Transforms immutable endpoint options into hardened MongoClientSettings.
    /// </summary>
    /// <param name="options">The immutable endpoint options.</param>
    /// <param name="configureCluster">Optional functional delegate to enrich the low-level ClusterBuilder.</param>
    /// <returns>Hardened MongoClientSettings.</returns>
    public static MongoClientSettings BuildClientSettings(
        MongoClusterEndpointOptions options,
        Action<ClusterBuilder>? configureCluster = null,
        string? replicaSetNameOverride = null)
    {
        ArgumentNullException.ThrowIfNull(options);

        var url = new MongoUrl(options.ConnectionString);
        var settings = MongoClientSettings.FromUrl(url);

        // 1. Replica Set Discovery & Verification (pure functional - no mutation of input options)
        var effectiveReplicaSetName = !string.IsNullOrWhiteSpace(replicaSetNameOverride)
            ? replicaSetNameOverride
            : options.ReplicaSetName;

        if (!string.IsNullOrWhiteSpace(effectiveReplicaSetName))
        {
            settings.ReplicaSetName = effectiveReplicaSetName;
        }

        // 2. Strict Operational Timeouts (Prevent thread-pool starvation under cluster partitions)
        settings.ConnectTimeout = options.EffectiveConnectTimeout;
        settings.SocketTimeout = options.EffectiveSocketTimeout;
        settings.ServerSelectionTimeout = options.EffectiveServerSelectionTimeout;
        settings.WaitQueueTimeout = options.EffectiveWaitQueueTimeout;

        // 3. Connection Pool Dimensions
        settings.MaxConnectionPoolSize = options.MaxConnectionPoolSize;
        settings.MinConnectionPoolSize = options.MinConnectionPoolSize;

        // 4. Retryable Operations (GxP transient failure tolerance)
        settings.RetryWrites = options.RetryWrites;
        settings.RetryReads = options.RetryReads;

        // 5. GxP Read/Write Consistency
        // - ReadPreference.Primary: Guarantees Read-Your-Own-Writes and zero stale reads during clinic visits.
        // - ReadConcern.Majority: Guarantees reads have been committed to a quorum of nodes.
        // - WriteConcern.WMajority: Guarantees clinical mutations and audit entries persist across replica failovers.
        settings.ReadPreference = ReadPreference.Primary;
        settings.ReadConcern = ReadConcern.Majority;
        settings.WriteConcern = WriteConcern.WMajority;

        // 6. ClusterConfigurator Hooks
        if (configureCluster != null)
        {
            var existingConfigurator = settings.ClusterConfigurator;
            settings.ClusterConfigurator = cb =>
            {
                existingConfigurator?.Invoke(cb);
                configureCluster(cb);
            };
        }

        return settings;
    }
}
