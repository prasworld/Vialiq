namespace Vialiq.Core.Constants;

/// <summary>
/// Strongly-typed configuration section names and keys for 12-factor application settings.
/// Eliminates bare string literals in dependency injection and options binding code.
/// </summary>
public static class ConfigurationConstants
{
    /// <summary>
    /// Configuration section names.
    /// </summary>
    public static class Sections
    {
        public const string MongoMultiCluster = "MongoMultiCluster";
        public const string ConnectionStrings = "ConnectionStrings";
        public const string MongoOptions = "MongoOptions";
        public const string Redis = "Redis";
    }

    /// <summary>
    /// Connection string names and configuration keys.
    /// </summary>
    public static class Keys
    {
        public const string MongoAdminConnectionString = "MongoAdmin";
        public const string MongoDevConnectionString = "MongoDev";
        public const string MongoProdConnectionString = "MongoProd";
        public const string MongoClusterPrefix = "MongoCluster_";

        public const string AdminDatabaseOption = "MongoOptions:AdminDatabase";
        public const string DevDatabaseOption = "MongoOptions:DevDatabase";
        public const string ProdDatabaseOption = "MongoOptions:ProdDatabase";

        public const string RedisConnectionString = "Redis";
        public const string RedisSentinelConnectionString = "RedisSentinel";
    }
}
