namespace Vialiq.Infrastructure.Extensions;

using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Vialiq.Core.Constants;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models.Database;
using Vialiq.Infrastructure.Data;

/// <summary>
/// Service collection extension methods for registering MongoDB multi-cluster infrastructure services via ASP.NET Core Dependency Injection.
/// </summary>
public static class MongoServiceCollectionExtensions
{
    /// <summary>
    /// Registers the 3-layer MongoDB connection pool infrastructure and dynamic multi-cluster production farm
    /// via the standard Options pattern (IOptions&lt;MongoMultiClusterOptions&gt;).
    /// Automatically binds from the "MongoMultiCluster" configuration section, with fallback to standard "ConnectionStrings"
    /// (ConnectionStrings:MongoAdmin, ConnectionStrings:MongoDev, ConnectionStrings:MongoProd, and ConnectionStrings:MongoCluster_*).
    /// Injects IConnectionPoolManager as a singleton. Zero hardcoded secrets or connection strings in code.
    /// </summary>
    public static IServiceCollection AddMongoMultiCluster(
        this IServiceCollection services,
        IConfiguration configuration,
        Action<MongoMultiClusterOptions>? configureOptions = null)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        // 1. Configure and bind IOptions<MongoMultiClusterOptions> from IConfiguration
        services.AddOptions<MongoMultiClusterOptions>()
            .Bind(configuration.GetSection(MongoMultiClusterOptions.SectionName))
            .Configure(options =>
            {
                // Fall back to standard ConnectionStrings if not set in MongoMultiCluster section
                var adminConn = configuration.GetConnectionString(ConfigurationConstants.Keys.MongoAdminConnectionString);
                var devConn = configuration.GetConnectionString(ConfigurationConstants.Keys.MongoDevConnectionString);
                var prodConn = configuration.GetConnectionString(ConfigurationConstants.Keys.MongoProdConnectionString);

                if (!string.IsNullOrWhiteSpace(adminConn) && string.IsNullOrWhiteSpace(options.Admin.ConnectionString))
                {
                    options.Admin.ConnectionString = adminConn;
                }

                if (!string.IsNullOrWhiteSpace(devConn) && string.IsNullOrWhiteSpace(options.Dev.ConnectionString))
                {
                    options.Dev.ConnectionString = devConn;
                }

                if (!string.IsNullOrWhiteSpace(prodConn) && string.IsNullOrWhiteSpace(options.Prod.ConnectionString))
                {
                    options.Prod.ConnectionString = prodConn;
                }

                var adminDb = configuration[ConfigurationConstants.Keys.AdminDatabaseOption];
                var devDb = configuration[ConfigurationConstants.Keys.DevDatabaseOption];
                var prodDb = configuration[ConfigurationConstants.Keys.ProdDatabaseOption];

                if (!string.IsNullOrWhiteSpace(adminDb) && string.IsNullOrWhiteSpace(options.Admin.DefaultDatabaseName))
                {
                    options.Admin.DefaultDatabaseName = adminDb;
                }

                if (!string.IsNullOrWhiteSpace(devDb) && string.IsNullOrWhiteSpace(options.Dev.DefaultDatabaseName))
                {
                    options.Dev.DefaultDatabaseName = devDb;
                }

                if (!string.IsNullOrWhiteSpace(prodDb) && string.IsNullOrWhiteSpace(options.Prod.DefaultDatabaseName))
                {
                    options.Prod.DefaultDatabaseName = prodDb;
                }

                // Default replica set names matching 3-layer architecture if unassigned
                if (string.IsNullOrWhiteSpace(options.Admin.ReplicaSetName))
                {
                    options.Admin.ReplicaSetName = MongoClusterConstants.CanonicalClusterIds.Admin;
                }

                if (string.IsNullOrWhiteSpace(options.Dev.ReplicaSetName))
                {
                    options.Dev.ReplicaSetName = MongoClusterConstants.CanonicalClusterIds.Dev;
                }

                if (string.IsNullOrWhiteSpace(options.Prod.ReplicaSetName))
                {
                    options.Prod.ReplicaSetName = MongoClusterConstants.CanonicalClusterIds.Prod;
                }

                // Scan ConnectionStrings for dynamic cluster farm definitions (e.g., ConnectionStrings:MongoCluster_rs-prod-us-01)
                var connectionStringsSection = configuration.GetSection(ConfigurationConstants.Sections.ConnectionStrings);
                foreach (var child in connectionStringsSection.GetChildren())
                {
                    var prefix = ConfigurationConstants.Keys.MongoClusterPrefix;
                    if (child.Key.StartsWith(prefix, StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(child.Value))
                    {
                        var clusterId = child.Key[prefix.Length..];
                        if (!options.Clusters.TryGetValue(clusterId, out var clusterEndpoint))
                        {
                            clusterEndpoint = new MongoClusterEndpointOptions { ReplicaSetName = clusterId };
                            options.Clusters[clusterId] = clusterEndpoint;
                        }

                        if (string.IsNullOrWhiteSpace(clusterEndpoint.ConnectionString))
                        {
                            clusterEndpoint.ConnectionString = child.Value;
                        }
                    }
                }

                configureOptions?.Invoke(options);
            });

        // 2. Register IConnectionPoolManager as Singleton (injected with IOptions<MongoMultiClusterOptions>)
        services.AddSingleton<IConnectionPoolManager, MongoConnectionPoolManager>();

        return services;
    }
}
