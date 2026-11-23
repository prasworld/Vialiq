namespace Vialiq.Core.Interfaces;

using System;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Driver;
using Vialiq.Core.Common;
using Vialiq.Core.Models.Database;

/// <summary>
/// Manages persistent, connection-pooled IMongoClient instances targeting physical replica set endpoints:
/// - Layer 1: Admin / Control Plane (rs-admin:27017)
/// - Layer 2: Dev Sandbox (rs-dev:27027)
/// - Layer 3: Prod Live GxP Default (rs-prod:27037)
/// - Dynamic Multi-Cluster Prod Farm: Sovereign regional clusters (rs-prod-us-01, rs-prod-eu-01, rs-prod-cn-01, etc.)
/// 
/// Standardizes on asynchronous-first execution (Task and async/await) with explicit thread-safe synchronization.
/// </summary>
public interface IConnectionPoolManager : IAsyncDisposable, IDisposable
{
    /// <summary>
    /// Primary Asynchronous Accessor: Asynchronously retrieves the thread-safe, singleton IMongoClient for the designated cluster ID.
    /// Thread-safe non-blocking initialization guarantees zero connection duplication under high concurrency.
    /// </summary>
    Task<IMongoClient> GetClientAsync(string clusterId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Asynchronously retrieves the thread-safe, singleton IMongoClient for the designated cluster tier.
    /// </summary>
    Task<IMongoClient> GetClientAsync(MongoClusterTier tier, CancellationToken cancellationToken = default) =>
        GetClientAsync(tier.ToCanonicalClusterId(), cancellationToken);

    /// <summary>
    /// Synchronous convenience accessor: Retrieves the initialized singleton IMongoClient for the designated cluster ID.
    /// </summary>
    IMongoClient GetClient(string clusterId);

    /// <summary>
    /// Synchronous convenience accessor: Retrieves the initialized singleton IMongoClient for the designated tier.
    /// </summary>
    IMongoClient GetClient(MongoClusterTier tier) => GetClient(tier.ToCanonicalClusterId());

    /// <summary>
    /// Asynchronous convenience accessor for Layer 1 Admin (rs-admin:27017).
    /// </summary>
    Task<IMongoClient> GetAdminClusterClientAsync(CancellationToken cancellationToken = default) =>
        GetClientAsync(MongoClusterTier.Admin, cancellationToken);

    /// <summary>
    /// Asynchronous convenience accessor for Layer 2 Dev (rs-dev:27027).
    /// </summary>
    Task<IMongoClient> GetDevClusterClientAsync(CancellationToken cancellationToken = default) =>
        GetClientAsync(MongoClusterTier.Dev, cancellationToken);

    /// <summary>
    /// Asynchronous convenience accessor for Layer 3 Prod default (rs-prod:27037).
    /// </summary>
    Task<IMongoClient> GetProdClusterClientAsync(CancellationToken cancellationToken = default) =>
        GetClientAsync(MongoClusterTier.Prod, cancellationToken);

    /// <summary>
    /// Synchronous convenience accessors.
    /// </summary>
    IMongoClient GetAdminClusterClient() => GetClient(MongoClusterTier.Admin);
    IMongoClient GetDevClusterClient() => GetClient(MongoClusterTier.Dev);
    IMongoClient GetProdClusterClient() => GetClient(MongoClusterTier.Prod);

    /// <summary>
    /// Primary Higher-Order Execution: Asynchronously executes a function within the context of a designated cluster IMongoClient.
    /// </summary>
    Task<TResult> WithClientAsync<TResult>(
        string clusterId,
        Func<IMongoClient, Task<TResult>> func,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Asynchronously executes a function within the context of a cluster tier IMongoClient.
    /// </summary>
    Task<TResult> WithClientAsync<TResult>(
        MongoClusterTier tier,
        Func<IMongoClient, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithClientAsync(tier.ToCanonicalClusterId(), func, cancellationToken);

    /// <summary>
    /// Higher-order async transform execution passing cancellation token directly to the callback.
    /// </summary>
    Task<TResult> WithClientAsync<TResult>(
        string clusterId,
        Func<IMongoClient, CancellationToken, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithClientAsync(clusterId, client => func(client, cancellationToken), cancellationToken);

    /// <summary>
    /// Higher-order async transform execution by tier passing cancellation token directly to the callback.
    /// </summary>
    Task<TResult> WithClientAsync<TResult>(
        MongoClusterTier tier,
        Func<IMongoClient, CancellationToken, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithClientAsync(tier.ToCanonicalClusterId(), func, cancellationToken);

    /// <summary>
    /// Higher-order synchronous transform execution.
    /// </summary>
    TResult WithClient<TResult>(string clusterId, Func<IMongoClient, TResult> func);

    /// <summary>
    /// Higher-order synchronous transform execution by tier.
    /// </summary>
    TResult WithClient<TResult>(MongoClusterTier tier, Func<IMongoClient, TResult> func) =>
        WithClient(tier.ToCanonicalClusterId(), func);

    /// <summary>
    /// Primary Higher-Order Execution: Asynchronously executes a function directly on an isolated database in the designated cluster.
    /// </summary>
    Task<TResult> WithDatabaseAsync<TResult>(
        string clusterId,
        string databaseName,
        Func<IMongoDatabase, Task<TResult>> func,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Primary Higher-Order Execution: Asynchronously executes a function directly on an isolated database in the designated tier.
    /// </summary>
    Task<TResult> WithDatabaseAsync<TResult>(
        MongoClusterTier tier,
        string databaseName,
        Func<IMongoDatabase, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithDatabaseAsync(tier.ToCanonicalClusterId(), databaseName, func, cancellationToken);

    /// <summary>
    /// Primary Higher-Order Execution: Asynchronously executes a function directly on an isolated database in the designated cluster passing cancellation token to the callback.
    /// </summary>
    Task<TResult> WithDatabaseAsync<TResult>(
        string clusterId,
        string databaseName,
        Func<IMongoDatabase, CancellationToken, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithDatabaseAsync(clusterId, databaseName, db => func(db, cancellationToken), cancellationToken);

    /// <summary>
    /// Primary Higher-Order Execution: Asynchronously executes a function directly on an isolated database in the designated tier passing cancellation token to the callback.
    /// </summary>
    Task<TResult> WithDatabaseAsync<TResult>(
        MongoClusterTier tier,
        string databaseName,
        Func<IMongoDatabase, CancellationToken, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithDatabaseAsync(tier.ToCanonicalClusterId(), databaseName, func, cancellationToken);

    /// <summary>
    /// Higher-order synchronous database execution by cluster ID.
    /// </summary>
    TResult WithDatabase<TResult>(string clusterId, string databaseName, Func<IMongoDatabase, TResult> func);

    /// <summary>
    /// Higher-order synchronous database execution by tier.
    /// </summary>
    TResult WithDatabase<TResult>(MongoClusterTier tier, string databaseName, Func<IMongoDatabase, TResult> func) =>
        WithDatabase(tier.ToCanonicalClusterId(), databaseName, func);

    /// <summary>
    /// Retrieves the configured immutable endpoint options for the given cluster ID.
    /// </summary>
    MongoClusterEndpointOptions GetEndpointOptions(string clusterId);

    /// <summary>
    /// Retrieves the configured immutable endpoint options for the given tier.
    /// </summary>
    MongoClusterEndpointOptions GetEndpointOptions(MongoClusterTier tier) =>
        GetEndpointOptions(tier.ToCanonicalClusterId());

    /// <summary>
    /// Healthcheck / readiness probe: Asynchronously pings the cluster primary via the admin command { ping: 1 }.
    /// Returns a functional Result indicating success or diagnostic error details.
    /// </summary>
    Task<Result<bool, string>> PingClusterAsync(string clusterId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Healthcheck / readiness probe by tier.
    /// </summary>
    Task<Result<bool, string>> PingClusterAsync(MongoClusterTier tier, CancellationToken cancellationToken = default) =>
        PingClusterAsync(tier.ToCanonicalClusterId(), cancellationToken);
}
