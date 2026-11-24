namespace Vialiq.Core.Constants;

/// <summary>
/// Strongly-typed configuration section names and keys for 12-factor application settings.
/// Eliminates bare string literals in dependency injection and options binding code.
/// </summary>
public static class ConfigurationConstants
{
    /// <summary>
    /// Configuration section names in appsettings.json.
    /// </summary>
    public static class Sections
    {
        /// <summary>Configuration section name for MongoDB multi-cluster options.</summary>
        public const string MongoMultiCluster = "MongoMultiCluster";

        /// <summary>Standard ASP.NET Core connection strings section name.</summary>
        public const string ConnectionStrings = "ConnectionStrings";

        /// <summary>Configuration section name for legacy or default MongoDB options.</summary>
        public const string MongoOptions = "MongoOptions";

        /// <summary>Configuration section name for Redis settings.</summary>
        public const string Redis = "Redis";
    }

    /// <summary>
    /// Connection string names and configuration keys.
    /// </summary>
    public static class Keys
    {
        /// <summary>Connection string name for Layer 1 Admin cluster.</summary>
        public const string MongoAdminConnectionString = "MongoAdmin";

        /// <summary>Connection string name for Layer 2 Dev cluster.</summary>
        public const string MongoDevConnectionString = "MongoDev";

        /// <summary>Connection string name for Layer 3 Prod cluster.</summary>
        public const string MongoProdConnectionString = "MongoProd";

        /// <summary>Configuration key prefix for dynamically named replica set clusters.</summary>
        public const string MongoClusterPrefix = "MongoCluster_";

        /// <summary>Configuration path for default Admin database name.</summary>
        public const string AdminDatabaseOption = "MongoOptions:AdminDatabase";

        /// <summary>Configuration path for default Dev database name.</summary>
        public const string DevDatabaseOption = "MongoOptions:DevDatabase";

        /// <summary>Configuration path for default Prod database name.</summary>
        public const string ProdDatabaseOption = "MongoOptions:ProdDatabase";

        /// <summary>Connection string name for standalone or direct Redis cluster.</summary>
        public const string RedisConnectionString = "Redis";

        /// <summary>Connection string name for High-Availability Redis Sentinel setup.</summary>
        public const string RedisSentinelConnectionString = "RedisSentinel";
    }
}
