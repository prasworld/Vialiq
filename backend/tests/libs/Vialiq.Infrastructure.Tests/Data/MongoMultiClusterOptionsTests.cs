namespace Vialiq.Infrastructure.Tests.Data;

using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Vialiq.Core.Constants;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models.Database;
using Vialiq.Infrastructure.Extensions;
using Xunit;

public class MongoMultiClusterOptionsTests
{
    private const string AdminConn = "mongodb://localhost:27017/?replicaSet=rs-admin&directConnection=true";
    private const string DevConn = "mongodb://localhost:27027/?replicaSet=rs-dev&directConnection=true";
    private const string ProdConn = "mongodb://localhost:27037/?replicaSet=rs-prod&directConnection=true";
    private const string UsConn = "mongodb://localhost:27047/?replicaSet=rs-prod-us-01";
    private const string EuConn = "mongodb://cluster-eu.internal:27057/?replicaSet=rs-prod-eu-01";
    private const string CnConn = "mongodb://china-mongo.internal:27067/?replicaSet=rs-prod-cn-01";

    private const string UsClusterId = "rs-prod-us-01";
    private const string EuClusterId = "rs-prod-eu-01";
    private const string CnClusterId = "rs-prod-cn-01";

    private const string SandboxDb = "vialiq_study_sandbox";
    private const string ProdDb = "vialiq_study_prod";

    [Fact]
    public void DependencyInjection_AddMongoMultiCluster_BindsFromConnectionStrings()
    {
        var configData = new Dictionary<string, string?>
        {
            [$"{ConfigurationConstants.Sections.ConnectionStrings}:{ConfigurationConstants.Keys.MongoAdminConnectionString}"] = AdminConn,
            [$"{ConfigurationConstants.Sections.ConnectionStrings}:{ConfigurationConstants.Keys.MongoDevConnectionString}"] = DevConn,
            [$"{ConfigurationConstants.Sections.ConnectionStrings}:{ConfigurationConstants.Keys.MongoProdConnectionString}"] = ProdConn,
            [$"{ConfigurationConstants.Sections.ConnectionStrings}:{ConfigurationConstants.Keys.MongoClusterPrefix}{UsClusterId}"] = UsConn,
            [ConfigurationConstants.Keys.AdminDatabaseOption] = MongoClusterConstants.DatabaseNames.ControlPlane,
            [ConfigurationConstants.Keys.DevDatabaseOption] = SandboxDb,
            [ConfigurationConstants.Keys.ProdDatabaseOption] = ProdDb
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddMongoMultiCluster(configuration);

        var serviceProvider = services.BuildServiceProvider();

        // 1. Verify IOptions<MongoMultiClusterOptions> was resolved via DI
        var options = serviceProvider.GetRequiredService<IOptions<MongoMultiClusterOptions>>().Value;

        Assert.Equal(AdminConn, options.Admin.ConnectionString);
        Assert.Equal(MongoClusterConstants.CanonicalClusterIds.Admin, options.Admin.ReplicaSetName);
        Assert.Equal(MongoClusterConstants.DatabaseNames.ControlPlane, options.Admin.DefaultDatabaseName);

        Assert.Equal(DevConn, options.Dev.ConnectionString);
        Assert.Equal(MongoClusterConstants.CanonicalClusterIds.Dev, options.Dev.ReplicaSetName);
        Assert.Equal(SandboxDb, options.Dev.DefaultDatabaseName);

        Assert.Equal(ProdConn, options.Prod.ConnectionString);
        Assert.Equal(MongoClusterConstants.CanonicalClusterIds.Prod, options.Prod.ReplicaSetName);
        Assert.Equal(ProdDb, options.Prod.DefaultDatabaseName);

        // Verify dynamic cluster farm was populated from ConnectionStrings:MongoCluster_
        Assert.True(options.HasCluster(UsClusterId));
        var usCluster = options.GetEndpoint(UsClusterId);
        Assert.Equal(UsConn, usCluster.ConnectionString);
        Assert.Equal(UsClusterId, usCluster.ReplicaSetName);

        // 2. Verify IConnectionPoolManager was resolved via DI as Singleton
        var poolManager = serviceProvider.GetRequiredService<IConnectionPoolManager>();
        Assert.NotNull(poolManager);

        var adminClient = poolManager.GetAdminClusterClient();
        Assert.NotNull(adminClient);
        Assert.Equal(MongoClusterConstants.CanonicalClusterIds.Admin, adminClient.Settings.ReplicaSetName);
    }

    [Fact]
    public void DependencyInjection_AddMongoMultiCluster_BindsFromStructuredSection()
    {
        var configData = new Dictionary<string, string?>
        {
            [$"{ConfigurationConstants.Sections.MongoMultiCluster}:Admin:ConnectionString"] = "mongodb://cluster-admin.internal:27017/?replicaSet=rs-admin-prod",
            [$"{ConfigurationConstants.Sections.MongoMultiCluster}:Admin:ReplicaSetName"] = "rs-admin-prod",
            [$"{ConfigurationConstants.Sections.MongoMultiCluster}:Admin:DefaultDatabaseName"] = "prod_control_plane",
            [$"{ConfigurationConstants.Sections.MongoMultiCluster}:Admin:MaxConnectionPoolSize"] = "350",
            [$"{ConfigurationConstants.Sections.MongoMultiCluster}:Dev:ConnectionString"] = "mongodb://cluster-dev.internal:27027/?replicaSet=rs-dev-cloud",
            [$"{ConfigurationConstants.Sections.MongoMultiCluster}:Dev:ReplicaSetName"] = "rs-dev-cloud",
            [$"{ConfigurationConstants.Sections.MongoMultiCluster}:Prod:ConnectionString"] = "mongodb://cluster-prod.internal:27037/?replicaSet=rs-prod-cloud",
            [$"{ConfigurationConstants.Sections.MongoMultiCluster}:Prod:ReplicaSetName"] = "rs-prod-cloud",
            [$"{ConfigurationConstants.Sections.MongoMultiCluster}:Prod:DefaultDatabaseName"] = "cloud_production",
            [$"{ConfigurationConstants.Sections.MongoMultiCluster}:Clusters:{EuClusterId}:ConnectionString"] = EuConn,
            [$"{ConfigurationConstants.Sections.MongoMultiCluster}:Clusters:{EuClusterId}:ReplicaSetName"] = EuClusterId,
            [$"{ConfigurationConstants.Sections.MongoMultiCluster}:Clusters:{EuClusterId}:MaxConnectionPoolSize"] = "400"
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configData)
            .Build();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddMongoMultiCluster(configuration);

        var serviceProvider = services.BuildServiceProvider();
        var options = serviceProvider.GetRequiredService<IOptions<MongoMultiClusterOptions>>().Value;

        Assert.Equal("mongodb://cluster-admin.internal:27017/?replicaSet=rs-admin-prod", options.Admin.ConnectionString);
        Assert.Equal("rs-admin-prod", options.Admin.ReplicaSetName);
        Assert.Equal("prod_control_plane", options.Admin.DefaultDatabaseName);
        Assert.Equal(350, options.Admin.MaxConnectionPoolSize);

        // Verify dynamic EU cluster in structured section
        Assert.True(options.HasCluster(EuClusterId));
        var euCluster = options.GetEndpoint(EuClusterId);
        Assert.Equal(EuConn, euCluster.ConnectionString);
        Assert.Equal(400, euCluster.MaxConnectionPoolSize);
    }

    [Fact]
    public void GetEndpoint_SelectsCorrectTier()
    {
        var options = new MongoMultiClusterOptions();

        Assert.Same(options.Admin, options.GetEndpoint(MongoClusterTier.Admin));
        Assert.Same(options.Dev, options.GetEndpoint(MongoClusterTier.Dev));
        Assert.Same(options.Prod, options.GetEndpoint(MongoClusterTier.Prod));
    }

    [Fact]
    public void GetEndpoint_ByName_ResolvesCanonicalAndDynamicClusters()
    {
        var options = new MongoMultiClusterOptions();
        options.Clusters[CnClusterId] = new MongoClusterEndpointOptions
        {
            ConnectionString = CnConn
        };

        Assert.Same(options.Admin, options.GetEndpoint(MongoClusterConstants.CanonicalClusterIds.Admin));
        Assert.Same(options.Admin, options.GetEndpoint(MongoClusterConstants.Aliases.AdminAlias));
        Assert.Same(options.Dev, options.GetEndpoint(MongoClusterConstants.CanonicalClusterIds.Dev));
        Assert.Same(options.Dev, options.GetEndpoint(MongoClusterConstants.Aliases.DevAlias));
        Assert.Same(options.Prod, options.GetEndpoint(MongoClusterConstants.CanonicalClusterIds.Prod));
        Assert.Same(options.Prod, options.GetEndpoint(MongoClusterConstants.Aliases.ProdAlias));

        Assert.Same(options.Clusters[CnClusterId], options.GetEndpoint(CnClusterId));
    }
}
