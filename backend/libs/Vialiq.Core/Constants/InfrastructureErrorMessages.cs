namespace Vialiq.Core.Constants;

using Vialiq.Core.Models.Database;

/// <summary>
/// Strongly-typed exception and error messages for infrastructure operations.
/// Eliminates bare string literals in exceptions and domain results.
/// </summary>
public static class InfrastructureErrorMessages
{
    /// <summary>Error message when options value is null.</summary>
    public const string OptionsValueCannotBeNull = "Options value cannot be null.";

    /// <summary>Error message when a database name is null or whitespace.</summary>
    public const string DatabaseNameCannotBeEmpty = "Database name cannot be null or whitespace.";

    /// <summary>
    /// Formats an error message when a cluster connection string is not configured.
    /// </summary>
    /// <param name="clusterId">The cluster identifier.</param>
    /// <returns>A formatted error message.</returns>
    public static string ClusterConnectionStringNotConfigured(string clusterId) =>
        $"MongoDB connection string for cluster '{clusterId}' is not configured. " +
        $"Please configure MongoMultiCluster:Clusters:{clusterId}:ConnectionString or tier-specific connection strings.";

    /// <summary>
    /// Formats an error message when a requested cluster is not configured in options.
    /// </summary>
    /// <param name="clusterId">The cluster identifier.</param>
    /// <returns>A formatted error message.</returns>
    public static string ClusterNotConfigured(string clusterId) =>
        $"MongoDB cluster '{clusterId}' is not configured in MongoMultiCluster:Clusters or standard tiers (Admin, Dev, Prod).";

    /// <summary>
    /// Formats a ping diagnostic failure message.
    /// </summary>
    /// <param name="clusterId">The cluster identifier.</param>
    /// <param name="errorMessage">The underlying exception message.</param>
    /// <returns>A formatted diagnostic string.</returns>
    public static string PingFailed(string clusterId, string errorMessage) =>
        $"Ping failed for {clusterId}: {errorMessage}";

    /// <summary>
    /// Formats an error message when an unsupported cluster tier enum is encountered.
    /// </summary>
    /// <param name="tier">The cluster tier.</param>
    /// <returns>A formatted error message.</returns>
    public static string UnsupportedClusterTier(MongoClusterTier tier) =>
        $"Unsupported cluster tier: {tier}";

    /// <summary>Error message when neither Redis nor Sentinel connection string is configured.</summary>
    public const string RedisConnectionStringNotConfigured =
        "Redis connection string is not configured. Please configure ConnectionStrings:Redis or ConnectionStrings:RedisSentinel.";

    /// <summary>Regulatory error message when a 21 CFR Part 11 audit reason is missing.</summary>
    public const string AuditReasonRequired =
        "A mandatory 21 CFR Part 11 audit reason is required to break a form lock.";

    /// <summary>
    /// Formats an unauthorized error message when a user role cannot break form locks.
    /// </summary>
    /// <param name="role">The unauthorized role name.</param>
    /// <returns>A formatted error message.</returns>
    public static string UnauthorizedBreakLock(string role) =>
        $"User role '{role}' is not authorized to break form locks.";

    /// <summary>Security violation message when attempting to access study cache without authenticated context.</summary>
    public const string StudyCacheAccessDenied =
        "Security Violation: Attempted to access Study cache without authenticated Tenant and Study context.";

    /// <summary>Security violation message when attempting to access client library cache without authenticated tenant context.</summary>
    public const string ClientLibraryCacheAccessDenied =
        "Security Violation: Attempted to access Client Library cache without authenticated Tenant context.";

    /// <summary>Error message when StudyLockService is invoked without initialized database or connection pool manager.</summary>
    public const string StudyLockServiceNotInitialized =
        "Neither MongoDB database nor connection pool manager was initialized for StudyLockService.";
}
