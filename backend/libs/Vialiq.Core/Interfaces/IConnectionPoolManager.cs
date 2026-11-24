namespace Vialiq.Core.Interfaces;

using System;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Driver;
using Vialiq.Core.Common;
using Vialiq.Core.Models.Database;

/// <summary>
/// Manages persistent, connection-pooled <see cref="IMongoClient"/> instances targeting physical replica set endpoints:
/// <list type="bullet">
/// <item><description>Layer 1: Admin / Control Plane (rs-admin:27017)</description></item>
/// <item><description>Layer 2: Dev Sandbox (rs-dev:27027)</description></item>
/// <item><description>Layer 3: Prod Live GxP Default (rs-prod:27037)</description></item>
/// <item><description>Dynamic Multi-Cluster Prod Farm: Sovereign regional clusters (rs-prod-us-01, rs-prod-eu-01, rs-prod-cn-01, etc.)</description></item>
/// </list>
/// Standardizes on asynchronous-first execution (Task and async/await) with explicit thread-safe synchronization.
/// </summary>
public interface IConnectionPoolManager : IAsyncDisposable, IDisposable
{
    /// <summary>
    /// Asynchronously retrieves the thread-safe, singleton <see cref="IMongoClient"/> for the designated cluster ID.
    /// Thread-safe non-blocking initialization guarantees zero connection duplication under high concurrency.
    /// </summary>
    /// <param name="clusterId">The target cluster identifier or alias.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task resolving to the initialized <see cref="IMongoClient"/>.</returns>
    Task<IMongoClient> GetClientAsync(string clusterId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Asynchronously retrieves the thread-safe, singleton <see cref="IMongoClient"/> for the designated cluster tier.
    /// </summary>
    /// <param name="tier">The cluster tier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task resolving to the initialized <see cref="IMongoClient"/>.</returns>
    Task<IMongoClient> GetClientAsync(MongoClusterTier tier, CancellationToken cancellationToken = default) =>
        GetClientAsync(tier.ToCanonicalClusterId(), cancellationToken);

    /// <summary>
    /// Synchronously retrieves the initialized singleton <see cref="IMongoClient"/> for the designated cluster ID.
    /// </summary>
    /// <param name="clusterId">The target cluster identifier or alias.</param>
    /// <returns>The initialized <see cref="IMongoClient"/>.</returns>
    IMongoClient GetClient(string clusterId);

    /// <summary>
    /// Synchronously retrieves the initialized singleton <see cref="IMongoClient"/> for the designated tier.
    /// </summary>
    /// <param name="tier">The cluster tier.</param>
    /// <returns>The initialized <see cref="IMongoClient"/>.</returns>
    IMongoClient GetClient(MongoClusterTier tier) => GetClient(tier.ToCanonicalClusterId());

    /// <summary>
    /// Asynchronously retrieves the client for Layer 1 Admin (rs-admin:27017).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task resolving to the Admin cluster client.</returns>
    Task<IMongoClient> GetAdminClusterClientAsync(CancellationToken cancellationToken = default) =>
        GetClientAsync(MongoClusterTier.Admin, cancellationToken);

    /// <summary>
    /// Asynchronously retrieves the client for Layer 2 Dev (rs-dev:27027).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task resolving to the Dev cluster client.</returns>
    Task<IMongoClient> GetDevClusterClientAsync(CancellationToken cancellationToken = default) =>
        GetClientAsync(MongoClusterTier.Dev, cancellationToken);

    /// <summary>
    /// Asynchronously retrieves the client for Layer 3 Prod default (rs-prod:27037).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task resolving to the Prod cluster client.</returns>
    Task<IMongoClient> GetProdClusterClientAsync(CancellationToken cancellationToken = default) =>
        GetClientAsync(MongoClusterTier.Prod, cancellationToken);

    /// <summary>Synchronously retrieves the client for Layer 1 Admin (rs-admin:27017).</summary>
    /// <returns>The Admin cluster client.</returns>
    IMongoClient GetAdminClusterClient() => GetClient(MongoClusterTier.Admin);

    /// <summary>Synchronously retrieves the client for Layer 2 Dev (rs-dev:27027).</summary>
    /// <returns>The Dev cluster client.</returns>
    IMongoClient GetDevClusterClient() => GetClient(MongoClusterTier.Dev);

    /// <summary>Synchronously retrieves the client for Layer 3 Prod default (rs-prod:27037).</summary>
    /// <returns>The Prod cluster client.</returns>
    IMongoClient GetProdClusterClient() => GetClient(MongoClusterTier.Prod);

    /// <summary>
    /// Asynchronously executes a function within the context of a designated cluster <see cref="IMongoClient"/>.
    /// </summary>
    /// <typeparam name="TResult">The operation return type.</typeparam>
    /// <param name="clusterId">The target cluster identifier.</param>
    /// <param name="func">The function to execute.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the executed function.</returns>
    Task<TResult> WithClientAsync<TResult>(
        string clusterId,
        Func<IMongoClient, Task<TResult>> func,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Asynchronously executes a function within the context of a cluster tier <see cref="IMongoClient"/>.
    /// </summary>
    /// <typeparam name="TResult">The operation return type.</typeparam>
    /// <param name="tier">The target cluster tier.</param>
    /// <param name="func">The function to execute.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the executed function.</returns>
    Task<TResult> WithClientAsync<TResult>(
        MongoClusterTier tier,
        Func<IMongoClient, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithClientAsync(tier.ToCanonicalClusterId(), func, cancellationToken);

    /// <summary>
    /// Higher-order async transform execution passing cancellation token directly to the callback.
    /// </summary>
    /// <typeparam name="TResult">The operation return type.</typeparam>
    /// <param name="clusterId">The target cluster identifier.</param>
    /// <param name="func">The function accepting client and token to execute.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the executed function.</returns>
    Task<TResult> WithClientAsync<TResult>(
        string clusterId,
        Func<IMongoClient, CancellationToken, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithClientAsync(clusterId, client => func(client, cancellationToken), cancellationToken);

    /// <summary>
    /// Higher-order async transform execution by tier passing cancellation token directly to the callback.
    /// </summary>
    /// <typeparam name="TResult">The operation return type.</typeparam>
    /// <param name="tier">The target cluster tier.</param>
    /// <param name="func">The function accepting client and token to execute.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the executed function.</returns>
    Task<TResult> WithClientAsync<TResult>(
        MongoClusterTier tier,
        Func<IMongoClient, CancellationToken, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithClientAsync(tier.ToCanonicalClusterId(), func, cancellationToken);

    /// <summary>
    /// Higher-order synchronous transform execution.
    /// </summary>
    /// <typeparam name="TResult">The operation return type.</typeparam>
    /// <param name="clusterId">The target cluster identifier.</param>
    /// <param name="func">The synchronous function to execute.</param>
    /// <returns>The result of the function.</returns>
    TResult WithClient<TResult>(string clusterId, Func<IMongoClient, TResult> func);

    /// <summary>
    /// Higher-order synchronous transform execution by tier.
    /// </summary>
    /// <typeparam name="TResult">The operation return type.</typeparam>
    /// <param name="tier">The target cluster tier.</param>
    /// <param name="func">The synchronous function to execute.</param>
    /// <returns>The result of the function.</returns>
    TResult WithClient<TResult>(MongoClusterTier tier, Func<IMongoClient, TResult> func) =>
        WithClient(tier.ToCanonicalClusterId(), func);

    /// <summary>
    /// Asynchronously executes a function directly on an isolated database in the designated cluster.
    /// </summary>
    /// <typeparam name="TResult">The operation return type.</typeparam>
    /// <param name="clusterId">The target cluster identifier.</param>
    /// <param name="databaseName">The database name.</param>
    /// <param name="func">The function to execute on the database.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the function.</returns>
    Task<TResult> WithDatabaseAsync<TResult>(
        string clusterId,
        string databaseName,
        Func<IMongoDatabase, Task<TResult>> func,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Asynchronously executes a function directly on an isolated database in the designated tier.
    /// </summary>
    /// <typeparam name="TResult">The operation return type.</typeparam>
    /// <param name="tier">The target cluster tier.</param>
    /// <param name="databaseName">The database name.</param>
    /// <param name="func">The function to execute on the database.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the function.</returns>
    Task<TResult> WithDatabaseAsync<TResult>(
        MongoClusterTier tier,
        string databaseName,
        Func<IMongoDatabase, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithDatabaseAsync(tier.ToCanonicalClusterId(), databaseName, func, cancellationToken);

    /// <summary>
    /// Asynchronously executes a function directly on an isolated database in the designated cluster passing cancellation token to the callback.
    /// </summary>
    /// <typeparam name="TResult">The operation return type.</typeparam>
    /// <param name="clusterId">The target cluster identifier.</param>
    /// <param name="databaseName">The database name.</param>
    /// <param name="func">The function to execute on the database.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the function.</returns>
    Task<TResult> WithDatabaseAsync<TResult>(
        string clusterId,
        string databaseName,
        Func<IMongoDatabase, CancellationToken, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithDatabaseAsync(clusterId, databaseName, db => func(db, cancellationToken), cancellationToken);

    /// <summary>
    /// Asynchronously executes a function directly on an isolated database in the designated tier passing cancellation token to the callback.
    /// </summary>
    /// <typeparam name="TResult">The operation return type.</typeparam>
    /// <param name="tier">The target cluster tier.</param>
    /// <param name="databaseName">The database name.</param>
    /// <param name="func">The function to execute on the database.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the function.</returns>
    Task<TResult> WithDatabaseAsync<TResult>(
        MongoClusterTier tier,
        string databaseName,
        Func<IMongoDatabase, CancellationToken, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithDatabaseAsync(tier.ToCanonicalClusterId(), databaseName, func, cancellationToken);

    /// <summary>
    /// Higher-order synchronous database execution by cluster ID.
    /// </summary>
    /// <typeparam name="TResult">The operation return type.</typeparam>
    /// <param name="clusterId">The target cluster identifier.</param>
    /// <param name="databaseName">The database name.</param>
    /// <param name="func">The synchronous function to execute.</param>
    /// <returns>The result of the function.</returns>
    TResult WithDatabase<TResult>(string clusterId, string databaseName, Func<IMongoDatabase, TResult> func);

    /// <summary>
    /// Higher-order synchronous database execution by tier.
    /// </summary>
    /// <typeparam name="TResult">The operation return type.</typeparam>
    /// <param name="tier">The target cluster tier.</param>
    /// <param name="databaseName">The database name.</param>
    /// <param name="func">The synchronous function to execute.</param>
    /// <returns>The result of the function.</returns>
    TResult WithDatabase<TResult>(MongoClusterTier tier, string databaseName, Func<IMongoDatabase, TResult> func) =>
        WithDatabase(tier.ToCanonicalClusterId(), databaseName, func);

    /// <summary>
    /// Retrieves the configured immutable endpoint options for the given cluster ID.
    /// </summary>
    /// <param name="clusterId">The target cluster identifier.</param>
    /// <returns>The configured <see cref="MongoClusterEndpointOptions"/>.</returns>
    MongoClusterEndpointOptions GetEndpointOptions(string clusterId);

    /// <summary>
    /// Retrieves the configured immutable endpoint options for the given tier.
    /// </summary>
    /// <param name="tier">The target cluster tier.</param>
    /// <returns>The configured <see cref="MongoClusterEndpointOptions"/>.</returns>
    MongoClusterEndpointOptions GetEndpointOptions(MongoClusterTier tier) =>
        GetEndpointOptions(tier.ToCanonicalClusterId());

    /// <summary>
    /// Healthcheck / readiness probe: Asynchronously pings the cluster primary via the admin command { ping: 1 }.
    /// Returns a functional Result indicating success or diagnostic error details.
    /// </summary>
    /// <param name="clusterId">The target cluster identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A functional <see cref="Result{TValue, TError}"/> holding true or an error string.</returns>
    Task<Result<bool, string>> PingClusterAsync(string clusterId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Healthcheck / readiness probe by tier.
    /// </summary>
    /// <param name="tier">The target cluster tier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A functional <see cref="Result{TValue, TError}"/> holding true or an error string.</returns>
    Task<Result<bool, string>> PingClusterAsync(MongoClusterTier tier, CancellationToken cancellationToken = default) =>
        PingClusterAsync(tier.ToCanonicalClusterId(), cancellationToken);
}
