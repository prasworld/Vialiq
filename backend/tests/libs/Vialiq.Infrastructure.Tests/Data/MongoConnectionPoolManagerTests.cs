namespace Vialiq.Infrastructure.Tests.Data;

using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Vialiq.Core.Constants;
using Vialiq.Core.Models.Database;
using Vialiq.Infrastructure.Data;
using Xunit;

public class MongoConnectionPoolManagerTests : IDisposable
{
    private const string UsClusterId = "rs-prod-us-01";
    private const string EuClusterId = "rs-prod-eu-01";
    private const string UsConnString = "mongodb://127.0.0.1:27047/?replicaSet=rs-prod-us-01";
    private const string EuConnString = "mongodb://127.0.0.1:27057/?replicaSet=rs-prod-eu-01";
    private const string AdminConnString = "mongodb://127.0.0.1:27017/?replicaSet=rs-admin";
    private const string DevConnString = "mongodb://127.0.0.1:27027/?replicaSet=rs-dev";
    private const string ProdConnString = "mongodb://127.0.0.1:27037/?replicaSet=rs-prod";
    private const string TestSandboxDb = "vialiq_sandbox";
    private const string TestProdDb = "vialiq_production";
    private const string NonexistentCluster = "nonexistent-cluster-99";

    private readonly MongoMultiClusterOptions _options;
    private readonly MongoConnectionPoolManager _poolManager;

    public MongoConnectionPoolManagerTests()
    {
        _options = new MongoMultiClusterOptions
        {
            Admin = new MongoClusterEndpointOptions
            {
                ConnectionString = AdminConnString,
                ReplicaSetName = MongoClusterConstants.CanonicalClusterIds.Admin,
                DefaultDatabaseName = MongoClusterConstants.DatabaseNames.ControlPlane,
                MaxConnectionPoolSize = 100
            },
            Dev = new MongoClusterEndpointOptions
            {
                ConnectionString = DevConnString,
                ReplicaSetName = MongoClusterConstants.CanonicalClusterIds.Dev,
                DefaultDatabaseName = TestSandboxDb,
                MaxConnectionPoolSize = 200
            },
            Prod = new MongoClusterEndpointOptions
            {
                ConnectionString = ProdConnString,
                ReplicaSetName = MongoClusterConstants.CanonicalClusterIds.Prod,
                DefaultDatabaseName = TestProdDb,
                MaxConnectionPoolSize = 250
            }
        };

        // Configure Dynamic Multi-Cluster Prod Farm clusters for multi-zone studies
        _options.Clusters[UsClusterId] = new MongoClusterEndpointOptions
        {
            ConnectionString = UsConnString,
            ReplicaSetName = UsClusterId,
            MaxConnectionPoolSize = 150
        };

        _options.Clusters[EuClusterId] = new MongoClusterEndpointOptions
        {
            ConnectionString = EuConnString,
            ReplicaSetName = EuClusterId,
            MaxConnectionPoolSize = 180
        };

        var optionsWrapper = Options.Create(_options);
        _poolManager = new MongoConnectionPoolManager(optionsWrapper, NullLogger<MongoConnectionPoolManager>.Instance);
    }

    [Fact]
    public async Task GetClientAsync_WhenCalledRepeatedlyForSameTier_ReturnsSameSingletonInstance()
    {
        var client1 = await _poolManager.GetClientAsync(MongoClusterTier.Admin);
        var client2 = await _poolManager.GetClientAsync(MongoClusterTier.Admin);

        Assert.NotNull(client1);
        Assert.Same(client1, client2);
    }

    [Fact]
    public async Task GetClientAsync_ConcurrentMultiThreadedAccess_ProducesSingleInstanceWithoutRaceCondition()
    {
        // Concurrently invoke GetClientAsync from 50 parallel thread-pool tasks
        var tasks = Enumerable.Range(0, 50)
            .Select(_ => Task.Run(() => _poolManager.GetClientAsync(MongoClusterTier.Dev)))
            .ToArray();

        var clients = await Task.WhenAll(tasks);

        Assert.Equal(50, clients.Length);
        var firstClient = clients[0];
        Assert.NotNull(firstClient);

        // Every concurrent thread must receive the exact same pooled singleton reference
        foreach (var client in clients)
        {
            Assert.Same(firstClient, client);
        }
    }

    [Fact]
    public async Task SpecializedAccessors_Async_ReturnExpectedClientsForTiers()
    {
        var adminClient = await _poolManager.GetAdminClusterClientAsync();
        var devClient = await _poolManager.GetDevClusterClientAsync();
        var prodClient = await _poolManager.GetProdClusterClientAsync();

        Assert.NotNull(adminClient);
        Assert.NotNull(devClient);
        Assert.NotNull(prodClient);

        Assert.Equal(MongoClusterConstants.CanonicalClusterIds.Admin, adminClient.Settings.ReplicaSetName);
        Assert.Equal(MongoClusterConstants.CanonicalClusterIds.Dev, devClient.Settings.ReplicaSetName);
        Assert.Equal(MongoClusterConstants.CanonicalClusterIds.Prod, prodClient.Settings.ReplicaSetName);
    }

    [Fact]
    public void SpecializedAccessors_Sync_ReturnExpectedClientsForTiers()
    {
        var adminClient = _poolManager.GetAdminClusterClient();
        var devClient = _poolManager.GetDevClusterClient();
        var prodClient = _poolManager.GetProdClusterClient();

        Assert.NotNull(adminClient);
        Assert.NotNull(devClient);
        Assert.NotNull(prodClient);

        Assert.Equal(MongoClusterConstants.CanonicalClusterIds.Admin, adminClient.Settings.ReplicaSetName);
        Assert.Equal(MongoClusterConstants.CanonicalClusterIds.Dev, devClient.Settings.ReplicaSetName);
        Assert.Equal(MongoClusterConstants.CanonicalClusterIds.Prod, prodClient.Settings.ReplicaSetName);
    }

    [Fact]
    public async Task MultiClusterProdFarm_CanResolveMultipleDistinctProdClusters()
    {
        var usClient = await _poolManager.GetClientAsync(UsClusterId);
        var euClient = await _poolManager.GetClientAsync(EuClusterId);

        Assert.NotNull(usClient);
        Assert.NotNull(euClient);
        Assert.NotSame(usClient, euClient);

        Assert.Equal(UsClusterId, usClient.Settings.ReplicaSetName);
        Assert.Equal(150, usClient.Settings.MaxConnectionPoolSize);

        Assert.Equal(EuClusterId, euClient.Settings.ReplicaSetName);
        Assert.Equal(180, euClient.Settings.MaxConnectionPoolSize);
    }

    [Fact]
    public async Task MultiClusterProdFarm_RepeatedCallsReturnCachedSingletonPerCluster()
    {
        var usClient1 = await _poolManager.GetClientAsync(UsClusterId);
        var usClient2 = await _poolManager.GetClientAsync(UsClusterId);

        Assert.Same(usClient1, usClient2);
    }

    [Fact]
    public async Task MultiClusterProdFarm_CanonicalTierMapping_MatchesStringLookup()
    {
        var tierAdmin = await _poolManager.GetClientAsync(MongoClusterTier.Admin);
        var stringAdmin = await _poolManager.GetClientAsync(MongoClusterConstants.CanonicalClusterIds.Admin);

        Assert.Same(tierAdmin, stringAdmin);
    }

    [Fact]
    public void WithClient_HigherOrderExecution_ReturnsTransformedResult()
    {
        var replicaName = _poolManager.WithClient(MongoClusterTier.Dev, client => client.Settings.ReplicaSetName);

        Assert.Equal(MongoClusterConstants.CanonicalClusterIds.Dev, replicaName);
    }

    [Fact]
    public async Task WithClientAsync_HigherOrderAsyncExecution_ReturnsTransformedResult()
    {
        var maxPoolSize = await _poolManager.WithClientAsync(
            MongoClusterTier.Prod,
            client => Task.FromResult(client.Settings.MaxConnectionPoolSize));

        Assert.Equal(250, maxPoolSize);
    }

    [Fact]
    public async Task WithClientAsync_NamedCluster_HigherOrderExecution_WorksSeamlessly()
    {
        var maxPoolSize = await _poolManager.WithClientAsync(
            UsClusterId,
            client => Task.FromResult(client.Settings.MaxConnectionPoolSize));

        Assert.Equal(150, maxPoolSize);
    }

    [Fact]
    public async Task WithDatabaseAsync_HigherOrderAsyncExecution_PassesDatabaseInstance()
    {
        var databaseName = await _poolManager.WithDatabaseAsync(
            MongoClusterTier.Admin,
            MongoClusterConstants.DatabaseNames.ControlPlane,
            db => Task.FromResult(db.DatabaseNamespace.DatabaseName));

        Assert.Equal(MongoClusterConstants.DatabaseNames.ControlPlane, databaseName);
    }

    [Fact]
    public void WithDatabase_HigherOrderExecution_PassesDatabaseInstance()
    {
        var databaseName = _poolManager.WithDatabase(
            MongoClusterTier.Admin,
            MongoClusterConstants.DatabaseNames.ControlPlane,
            db => db.DatabaseNamespace.DatabaseName);

        Assert.Equal(MongoClusterConstants.DatabaseNames.ControlPlane, databaseName);
    }

    [Fact]
    public void GetEndpointOptions_ReturnsMatchingConfiguredOptions()
    {
        var adminOptions = _poolManager.GetEndpointOptions(MongoClusterTier.Admin);

        Assert.Equal(MongoClusterConstants.CanonicalClusterIds.Admin, adminOptions.ReplicaSetName);
        Assert.Equal(MongoClusterConstants.DatabaseNames.ControlPlane, adminOptions.DefaultDatabaseName);
        Assert.Equal(100, adminOptions.MaxConnectionPoolSize);
    }

    [Fact]
    public void GetEndpointOptions_ForNamedCluster_ReturnsCorrectOptions()
    {
        var euOptions = _poolManager.GetEndpointOptions(EuClusterId);

        Assert.Equal(EuClusterId, euOptions.ReplicaSetName);
        Assert.Equal(180, euOptions.MaxConnectionPoolSize);
    }

    [Fact]
    public async Task GetClientAsync_WhenConnectionStringUnconfigured_ThrowsDescriptiveException()
    {
        var unconfiguredOptions = Options.Create(new MongoMultiClusterOptions());
        using var emptyManager = new MongoConnectionPoolManager(unconfiguredOptions, NullLogger<MongoConnectionPoolManager>.Instance);

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => emptyManager.GetClientAsync(MongoClusterTier.Admin));
        Assert.Contains(MongoClusterConstants.CanonicalClusterIds.Admin, ex.Message);
    }

    [Fact]
    public async Task GetClientAsync_WhenUnknownNamedClusterRequested_ThrowsKeyNotFoundException()
    {
        var ex = await Assert.ThrowsAsync<System.Collections.Generic.KeyNotFoundException>(
            () => _poolManager.GetClientAsync(NonexistentCluster));

        Assert.Contains(NonexistentCluster, ex.Message);
    }

    public void Dispose()
    {
        _poolManager.Dispose();
        GC.SuppressFinalize(this);
    }
}
