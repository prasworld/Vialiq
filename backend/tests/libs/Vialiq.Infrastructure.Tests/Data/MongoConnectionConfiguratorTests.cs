namespace Vialiq.Infrastructure.Tests.Data;

using System;
using MongoDB.Driver;
using Vialiq.Core.Constants;
using Vialiq.Core.Models.Database;
using Vialiq.Infrastructure.Data;
using Xunit;

public class MongoConnectionConfiguratorTests
{
    private const string AdminConn = "mongodb://127.0.0.1:27017/?replicaSet=rs-admin";
    private const string DevConn = "mongodb://127.0.0.1:27027/?replicaSet=rs-dev";
    private const string ProdConn = "mongodb://127.0.0.1:27037/?replicaSet=rs-prod";
    private const string SandboxDb = "vialiq_sandbox";
    private const string ProdDb = "vialiq_production";

    [Fact]
    public void BuildClientSettings_WithConfiguredOptions_ConfiguresCorrectReplicaSetAndTimeouts()
    {
        var options = new MongoClusterEndpointOptions
        {
            ConnectionString = AdminConn,
            ReplicaSetName = MongoClusterConstants.CanonicalClusterIds.Admin,
            DefaultDatabaseName = MongoClusterConstants.DatabaseNames.ControlPlane,
            MaxConnectionPoolSize = 150,
            MinConnectionPoolSize = 15,
            ConnectTimeout = TimeSpan.FromSeconds(8),
            SocketTimeout = TimeSpan.FromSeconds(25),
            ServerSelectionTimeout = TimeSpan.FromSeconds(4),
            WaitQueueTimeout = TimeSpan.FromSeconds(6),
            RetryWrites = true,
            RetryReads = true
        };

        var settings = MongoConnectionConfigurator.BuildClientSettings(options);

        Assert.Equal(MongoClusterConstants.CanonicalClusterIds.Admin, settings.ReplicaSetName);
        Assert.Equal(TimeSpan.FromSeconds(8), settings.ConnectTimeout);
        Assert.Equal(TimeSpan.FromSeconds(25), settings.SocketTimeout);
        Assert.Equal(TimeSpan.FromSeconds(4), settings.ServerSelectionTimeout);
        Assert.Equal(TimeSpan.FromSeconds(6), settings.WaitQueueTimeout);
        Assert.Equal(150, settings.MaxConnectionPoolSize);
        Assert.Equal(15, settings.MinConnectionPoolSize);
        Assert.True(settings.RetryWrites);
        Assert.True(settings.RetryReads);
    }

    [Fact]
    public void BuildClientSettings_EnforcesPart11Consistency_PrimaryAndMajority()
    {
        var options = new MongoClusterEndpointOptions
        {
            ConnectionString = ProdConn,
            ReplicaSetName = MongoClusterConstants.CanonicalClusterIds.Prod,
            DefaultDatabaseName = ProdDb
        };

        var settings = MongoConnectionConfigurator.BuildClientSettings(options);

        // GxP Operational Invariant: All clinical transactions must read from Primary
        // and enforce majority quorum for commit durability across replica failovers
        Assert.Equal(ReadPreference.Primary, settings.ReadPreference);
        Assert.Equal(ReadConcern.Majority, settings.ReadConcern);
        Assert.Equal(WriteConcern.WMajority, settings.WriteConcern);
    }

    [Fact]
    public void BuildClientSettings_WithClusterConfigurator_EnrichesBuilder()
    {
        var options = new MongoClusterEndpointOptions
        {
            ConnectionString = DevConn,
            ReplicaSetName = MongoClusterConstants.CanonicalClusterIds.Dev,
            DefaultDatabaseName = SandboxDb
        };

        var configuratorInvoked = false;
        var settings = MongoConnectionConfigurator.BuildClientSettings(options, _ =>
        {
            configuratorInvoked = true;
        });

        Assert.NotNull(settings.ClusterConfigurator);
        Assert.False(configuratorInvoked); // Invoked lazily when MongoClient connects
    }
}
