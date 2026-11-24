namespace Vialiq.Core.Models.Database;

using System;
using System.Collections.Generic;
using Vialiq.Core.Constants;

/// <summary>
/// Options for the 3-layer MongoDB architecture and dynamic multi-cluster production farm.
/// Injected into services via Microsoft.Extensions.Options (<c>IOptions&lt;MongoMultiClusterOptions&gt;</c>).
/// Bound to configuration sections (e.g. <c>"MongoMultiCluster"</c>) or ConnectionStrings via Dependency Injection.
/// Contains ZERO hardcoded connection strings or environment secrets.
/// </summary>
public sealed class MongoMultiClusterOptions
{
    /// <summary>
    /// Standard configuration section name in appsettings.json.
    /// </summary>
    public const string SectionName = ConfigurationConstants.Sections.MongoMultiCluster;

    /// <summary>
    /// Layer 1: Admin / Control Plane cluster endpoint (canonical ID: "rs-admin").
    /// </summary>
    public MongoClusterEndpointOptions Admin { get; set; } = new();

    /// <summary>
    /// Layer 2: Development / UAT sandbox cluster endpoint (canonical ID: "rs-dev").
    /// </summary>
    public MongoClusterEndpointOptions Dev { get; set; } = new();

    /// <summary>
    /// Layer 3: Qualified Live Production GxP default cluster endpoint (canonical ID: "rs-prod").
    /// </summary>
    public MongoClusterEndpointOptions Prod { get; set; } = new();

    /// <summary>
    /// Dynamic Production Cluster Farm: Named physical replica set clusters (e.g. "rs-prod-us-01", "rs-prod-eu-01", "rs-prod-cn-01").
    /// Enables complex multi-zone clinical studies to target sovereign geographical clusters while maintaining a unified protocol.
    /// </summary>
    public Dictionary<string, MongoClusterEndpointOptions> Clusters { get; set; } =
        new(StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// Pure functional selector: retrieves the endpoint options for a specified cluster tier.
    /// </summary>
    /// <param name="tier">The target cluster tier (<see cref="MongoClusterTier.Admin"/>, <see cref="MongoClusterTier.Dev"/>, or <see cref="MongoClusterTier.Prod"/>).</param>
    /// <returns>The corresponding <see cref="MongoClusterEndpointOptions"/>.</returns>
    /// <exception cref="ArgumentOutOfRangeException">Thrown when an unknown tier is supplied.</exception>
    public MongoClusterEndpointOptions GetEndpoint(MongoClusterTier tier) => tier switch
    {
        MongoClusterTier.Admin => Admin,
        MongoClusterTier.Dev => Dev,
        MongoClusterTier.Prod => Prod,
        _ => throw new ArgumentOutOfRangeException(nameof(tier), tier, InfrastructureErrorMessages.UnsupportedClusterTier(tier))
    };

    /// <summary>
    /// Pure functional selector: retrieves endpoint options for a dynamic cluster ID or canonical tier name.
    /// Evaluates dynamic Clusters dictionary first, then falls back to canonical tier names ("rs-admin", "rs-dev", "rs-prod").
    /// </summary>
    /// <param name="clusterId">The cluster identifier or alias.</param>
    /// <returns>The resolved <see cref="MongoClusterEndpointOptions"/>.</returns>
    /// <exception cref="ArgumentException">Thrown when <paramref name="clusterId"/> is null or whitespace.</exception>
    /// <exception cref="KeyNotFoundException">Thrown when the requested cluster is not configured.</exception>
    public MongoClusterEndpointOptions GetEndpoint(string clusterId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(clusterId);

        var trimmed = clusterId.Trim();

        // 1. Check dynamic cluster registry
        if (Clusters.TryGetValue(trimmed, out var customEndpoint))
        {
            return customEndpoint;
        }

        // 2. Canonical cluster ID mappings
        if (string.Equals(trimmed, MongoClusterConstants.CanonicalClusterIds.Admin, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(trimmed, MongoClusterConstants.Aliases.AdminAlias, StringComparison.OrdinalIgnoreCase))
        {
            return Admin;
        }

        if (string.Equals(trimmed, MongoClusterConstants.CanonicalClusterIds.Dev, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(trimmed, MongoClusterConstants.Aliases.DevAlias, StringComparison.OrdinalIgnoreCase))
        {
            return Dev;
        }

        if (string.Equals(trimmed, MongoClusterConstants.CanonicalClusterIds.Prod, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(trimmed, MongoClusterConstants.Aliases.ProdAlias, StringComparison.OrdinalIgnoreCase))
        {
            return Prod;
        }

        throw new KeyNotFoundException(InfrastructureErrorMessages.ClusterNotConfigured(clusterId));
    }

    /// <summary>
    /// Checks whether a cluster endpoint is configured for the specified cluster ID and has a valid non-empty connection string.
    /// </summary>
    /// <param name="clusterId">The cluster identifier or alias to verify.</param>
    /// <returns><c>true</c> if configured with a non-empty connection string; otherwise <c>false</c>.</returns>
    public bool HasCluster(string clusterId)
    {
        if (string.IsNullOrWhiteSpace(clusterId)) return false;

        var trimmed = clusterId.Trim();
        if (Clusters.TryGetValue(trimmed, out var customEndpoint))
        {
            return !string.IsNullOrWhiteSpace(customEndpoint.ConnectionString);
        }

        if (string.Equals(trimmed, MongoClusterConstants.CanonicalClusterIds.Admin, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(trimmed, MongoClusterConstants.Aliases.AdminAlias, StringComparison.OrdinalIgnoreCase))
        {
            return !string.IsNullOrWhiteSpace(Admin.ConnectionString);
        }

        if (string.Equals(trimmed, MongoClusterConstants.CanonicalClusterIds.Dev, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(trimmed, MongoClusterConstants.Aliases.DevAlias, StringComparison.OrdinalIgnoreCase))
        {
            return !string.IsNullOrWhiteSpace(Dev.ConnectionString);
        }

        if (string.Equals(trimmed, MongoClusterConstants.CanonicalClusterIds.Prod, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(trimmed, MongoClusterConstants.Aliases.ProdAlias, StringComparison.OrdinalIgnoreCase))
        {
            return !string.IsNullOrWhiteSpace(Prod.ConnectionString);
        }

        return false;
    }
}
