namespace Vialiq.Core.Constants;

/// <summary>
/// Immutable, strongly-typed constants for the 3-layer MongoDB architecture and dynamic multi-cluster production farm.
/// Eliminates bare string literals across the platform codebase.
/// </summary>
public static class MongoClusterConstants
{
    /// <summary>
    /// Canonical replica set cluster identifiers.
    /// </summary>
    public static class CanonicalClusterIds
    {
        public const string Admin = "rs-admin";
        public const string Dev = "rs-dev";
        public const string Prod = "rs-prod";
    }

    /// <summary>
    /// Common aliases accepted during cluster resolution.
    /// </summary>
    public static class Aliases
    {
        public const string AdminAlias = "admin";
        public const string DevAlias = "dev";
        public const string ProdAlias = "prod";
    }

    /// <summary>
    /// Well-known database names.
    /// </summary>
    public static class DatabaseNames
    {
        public const string Admin = "admin";
        public const string ControlPlane = "vialiq_control_plane";
    }

    /// <summary>
    /// Low-level MongoDB admin commands.
    /// </summary>
    public static class Commands
    {
        public const string Ping = "ping";
    }

    /// <summary>
    /// Placeholder for redacted credentials in structured logs.
    /// </summary>
    public const string Redacted = "[REDACTED]";

    /// <summary>
    /// Well-known character delimiters.
    /// </summary>
    public static class Delimiters
    {
        public const string Comma = ",";
        public const string Colon = ":";
    }

    /// <summary>
    /// Canonical collection names across study databases.
    /// </summary>
    public static class CollectionNames
    {
        public const string StudyEditLeases = "study_edit_leases";
    }
}
