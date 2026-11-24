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
        /// <summary>Layer 1: Admin / Control Plane cluster.</summary>
        public const string Admin = "rs-admin";

        /// <summary>Layer 2: Dev sandbox cluster.</summary>
        public const string Dev = "rs-dev";

        /// <summary>Layer 3: Qualified Live Production GxP cluster.</summary>
        public const string Prod = "rs-prod";
    }

    /// <summary>
    /// Common aliases accepted during cluster resolution.
    /// </summary>
    public static class Aliases
    {
        /// <summary>Alias for Admin tier.</summary>
        public const string AdminAlias = "admin";

        /// <summary>Alias for Dev tier.</summary>
        public const string DevAlias = "dev";

        /// <summary>Alias for Prod tier.</summary>
        public const string ProdAlias = "prod";
    }

    /// <summary>
    /// Well-known database names.
    /// </summary>
    public static class DatabaseNames
    {
        /// <summary>System admin database used for cluster ping/readiness probes.</summary>
        public const string Admin = "admin";

        /// <summary>Control-plane database hosting tenant registry and global metadata.</summary>
        public const string ControlPlane = "vialiq_control_plane";
    }

    /// <summary>
    /// Database prefix, suffix, and naming conventions.
    /// </summary>
    public static class DatabaseConventions
    {
        /// <summary>Standard prefix for study-specific databases.</summary>
        public const string StudyPrefix = "study_";

        /// <summary>Standard suffix for production study databases.</summary>
        public const string ProdSuffix = "_prod";

        /// <summary>
        /// Formats the canonical production study database name for a given study ID.
        /// </summary>
        /// <param name="studyId">The clinical study identifier.</param>
        /// <returns>A formatted database name, e.g. <c>"study_{studyId}_prod"</c>.</returns>
        public static string FormatStudyProdDatabaseName(string studyId) => $"{StudyPrefix}{studyId}{ProdSuffix}";
    }

    /// <summary>
    /// Low-level MongoDB admin commands.
    /// </summary>
    public static class Commands
    {
        /// <summary>MongoDB ping command.</summary>
        public const string Ping = "ping";
    }

    /// <summary>
    /// Placeholder for redacted credentials in structured logs.
    /// </summary>
    public const string Redacted = "[REDACTED]";

    /// <summary>
    /// Default mask token for blinded clinical trial data.
    /// </summary>
    public const string DefaultMaskValue = "BLINDED";

    /// <summary>
    /// Well-known character delimiters.
    /// </summary>
    public static class Delimiters
    {
        /// <summary>Comma delimiter.</summary>
        public const string Comma = ",";

        /// <summary>Colon delimiter.</summary>
        public const string Colon = ":";
    }

    /// <summary>
    /// Canonical collection names across study databases.
    /// </summary>
    public static class CollectionNames
    {
        /// <summary>Collection storing durable clinical form concurrency edit leases.</summary>
        public const string StudyEditLeases = "study_edit_leases";
    }

    /// <summary>
    /// Well-known cache key segments and scope qualifiers.
    /// Eliminates bare string literals in cache key generation.
    /// </summary>
    public static class CacheSegments
    {
        /// <summary>Top-level namespace segment.</summary>
        public const string Vialiq = "vialiq";

        /// <summary>Study scope segment.</summary>
        public const string Study = "study";

        /// <summary>Tenant scope segment.</summary>
        public const string Tenant = "tenant";

        /// <summary>Global scope segment.</summary>
        public const string Global = "global";

        /// <summary>Standards library segment.</summary>
        public const string Standards = "standards";

        /// <summary>Client library segment.</summary>
        public const string Lib = "lib";

        /// <summary>Scope qualifier segment.</summary>
        public const string Scope = "scope";

        /// <summary>Blinded partition segment.</summary>
        public const string Blinded = "blinded";

        /// <summary>Unblinded partition segment.</summary>
        public const string Unblinded = "unblinded";

        /// <summary>Fallback protocol version segment.</summary>
        public const string Current = "current";

        /// <summary>Form resource segment.</summary>
        public const string Form = "form";

        /// <summary>Schema resource segment.</summary>
        public const string Schema = "schema";

        /// <summary>EDC subsystem prefix segment.</summary>
        public const string Edc = "edc";

        /// <summary>Form lock resource segment.</summary>
        public const string FormLock = "form_lock";

        /// <summary>Redis pub/sub channel for cross-pod cache invalidations.</summary>
        public const string InvalidationsChannel = "vialiq:cache:invalidations";
    }
}
