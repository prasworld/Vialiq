namespace Vialiq.Core.Constants;

using Vialiq.Core.Models.Database;

/// <summary>
/// Strongly-typed exception and error messages for infrastructure operations.
/// Eliminates bare string literals in exceptions and domain results.
/// </summary>
public static class InfrastructureErrorMessages
{
    public const string OptionsValueCannotBeNull = "Options value cannot be null.";
    public const string DatabaseNameCannotBeEmpty = "Database name cannot be null or whitespace.";

    public static string ClusterConnectionStringNotConfigured(string clusterId) =>
        $"MongoDB connection string for cluster '{clusterId}' is not configured. " +
        $"Please configure MongoMultiCluster:Clusters:{clusterId}:ConnectionString or tier-specific connection strings.";

    public static string ClusterNotConfigured(string clusterId) =>
        $"MongoDB cluster '{clusterId}' is not configured in MongoMultiCluster:Clusters or standard tiers (Admin, Dev, Prod).";

    public static string PingFailed(string clusterId, string errorMessage) =>
        $"Ping failed for {clusterId}: {errorMessage}";

    public static string UnsupportedClusterTier(MongoClusterTier tier) =>
        $"Unsupported cluster tier: {tier}";
}
