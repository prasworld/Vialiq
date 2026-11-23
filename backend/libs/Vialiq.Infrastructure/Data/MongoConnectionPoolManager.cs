namespace Vialiq.Infrastructure.Data;

using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using Vialiq.Core.Common;
using Vialiq.Core.Constants;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models.Database;
using Vialiq.Infrastructure.Constants;

/// <summary>
/// Thread-safe, persistent connection pool manager supporting both the 3-layer architecture
/// and dynamic multi-cluster production farm (rs-prod-us-01, rs-prod-eu-01, rs-prod-cn-01, etc.).
/// Standardizes on asynchronous-first execution patterns (Task/async/await).
/// Employs non-blocking SemaphoreSlim synchronization to prevent thread-pool starvation and duplicate connection initialization.
/// </summary>
public sealed class MongoConnectionPoolManager : IConnectionPoolManager
{
    private readonly MongoMultiClusterOptions _options;
    private readonly ILogger<MongoConnectionPoolManager> _logger;
    private readonly ConcurrentDictionary<string, IMongoClient> _clientPool;
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _initLocks;
    private bool _disposed;

    public MongoConnectionPoolManager(
        IOptions<MongoMultiClusterOptions> options,
        ILogger<MongoConnectionPoolManager> logger)
    {
        ArgumentNullException.ThrowIfNull(options);
        _options = options.Value ?? throw new ArgumentException(InfrastructureErrorMessages.OptionsValueCannotBeNull, nameof(options));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _clientPool = new ConcurrentDictionary<string, IMongoClient>(StringComparer.OrdinalIgnoreCase);
        _initLocks = new ConcurrentDictionary<string, SemaphoreSlim>(StringComparer.OrdinalIgnoreCase);
    }

    /// <inheritdoc />
    public async Task<IMongoClient> GetClientAsync(string clusterId, CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();
        ArgumentException.ThrowIfNullOrWhiteSpace(clusterId);

        var key = NormalizeClusterKey(clusterId);

        // 1. Lock-free read fast-path: if client is already pooled, return immediately with zero contention
        if (_clientPool.TryGetValue(key, out var existingClient))
        {
            return existingClient;
        }

        // 2. Thread-safe asynchronous slow-path: acquire the cluster-specific SemaphoreSlim
        var initLock = _initLocks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));
        await initLock.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            ThrowIfDisposed();

            // Double-checked locking under semaphore
            if (_clientPool.TryGetValue(key, out var clientUnderLock))
            {
                return clientUnderLock;
            }

            var newClient = CreateClient(key);
            _clientPool[key] = newClient;
            return newClient;
        }
        finally
        {
            initLock.Release();
        }
    }

    /// <inheritdoc />
    public Task<IMongoClient> GetClientAsync(MongoClusterTier tier, CancellationToken cancellationToken = default) =>
        GetClientAsync(tier.ToCanonicalClusterId(), cancellationToken);

    /// <inheritdoc />
    public IMongoClient GetClient(string clusterId)
    {
        ThrowIfDisposed();
        ArgumentException.ThrowIfNullOrWhiteSpace(clusterId);

        var key = NormalizeClusterKey(clusterId);

        if (_clientPool.TryGetValue(key, out var existingClient))
        {
            return existingClient;
        }

        var initLock = _initLocks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));
        initLock.Wait();
        try
        {
            ThrowIfDisposed();

            if (_clientPool.TryGetValue(key, out var clientUnderLock))
            {
                return clientUnderLock;
            }

            var newClient = CreateClient(key);
            _clientPool[key] = newClient;
            return newClient;
        }
        finally
        {
            initLock.Release();
        }
    }

    /// <inheritdoc />
    public IMongoClient GetClient(MongoClusterTier tier) =>
        GetClient(tier.ToCanonicalClusterId());

    /// <inheritdoc />
    public Task<IMongoClient> GetAdminClusterClientAsync(CancellationToken cancellationToken = default) =>
        GetClientAsync(MongoClusterTier.Admin, cancellationToken);

    /// <inheritdoc />
    public Task<IMongoClient> GetDevClusterClientAsync(CancellationToken cancellationToken = default) =>
        GetClientAsync(MongoClusterTier.Dev, cancellationToken);

    /// <inheritdoc />
    public Task<IMongoClient> GetProdClusterClientAsync(CancellationToken cancellationToken = default) =>
        GetClientAsync(MongoClusterTier.Prod, cancellationToken);

    /// <inheritdoc />
    public IMongoClient GetAdminClusterClient() => GetClient(MongoClusterTier.Admin);

    /// <inheritdoc />
    public IMongoClient GetDevClusterClient() => GetClient(MongoClusterTier.Dev);

    /// <inheritdoc />
    public IMongoClient GetProdClusterClient() => GetClient(MongoClusterTier.Prod);

    /// <inheritdoc />
    public async Task<TResult> WithClientAsync<TResult>(
        string clusterId,
        Func<IMongoClient, Task<TResult>> func,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(func);
        var client = await GetClientAsync(clusterId, cancellationToken).ConfigureAwait(false);
        return await func(client).ConfigureAwait(false);
    }

    /// <inheritdoc />
    public Task<TResult> WithClientAsync<TResult>(
        MongoClusterTier tier,
        Func<IMongoClient, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithClientAsync(tier.ToCanonicalClusterId(), func, cancellationToken);

    /// <inheritdoc />
    public TResult WithClient<TResult>(string clusterId, Func<IMongoClient, TResult> func)
    {
        ArgumentNullException.ThrowIfNull(func);
        var client = GetClient(clusterId);
        return func(client);
    }

    /// <inheritdoc />
    public TResult WithClient<TResult>(MongoClusterTier tier, Func<IMongoClient, TResult> func) =>
        WithClient(tier.ToCanonicalClusterId(), func);

    /// <inheritdoc />
    public async Task<TResult> WithDatabaseAsync<TResult>(
        string clusterId,
        string databaseName,
        Func<IMongoDatabase, Task<TResult>> func,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(func);
        ArgumentException.ThrowIfNullOrWhiteSpace(databaseName);

        var client = await GetClientAsync(clusterId, cancellationToken).ConfigureAwait(false);
        var database = client.GetDatabase(databaseName);
        return await func(database).ConfigureAwait(false);
    }

    /// <inheritdoc />
    public Task<TResult> WithDatabaseAsync<TResult>(
        MongoClusterTier tier,
        string databaseName,
        Func<IMongoDatabase, Task<TResult>> func,
        CancellationToken cancellationToken = default) =>
        WithDatabaseAsync(tier.ToCanonicalClusterId(), databaseName, func, cancellationToken);

    /// <inheritdoc />
    public TResult WithDatabase<TResult>(string clusterId, string databaseName, Func<IMongoDatabase, TResult> func)
    {
        ArgumentNullException.ThrowIfNull(func);
        ArgumentException.ThrowIfNullOrWhiteSpace(databaseName);

        var client = GetClient(clusterId);
        var database = client.GetDatabase(databaseName);
        return func(database);
    }

    /// <inheritdoc />
    public TResult WithDatabase<TResult>(MongoClusterTier tier, string databaseName, Func<IMongoDatabase, TResult> func) =>
        WithDatabase(tier.ToCanonicalClusterId(), databaseName, func);

    /// <inheritdoc />
    public MongoClusterEndpointOptions GetEndpointOptions(string clusterId) =>
        _options.GetEndpoint(clusterId);

    /// <inheritdoc />
    public MongoClusterEndpointOptions GetEndpointOptions(MongoClusterTier tier) =>
        _options.GetEndpoint(tier);

    /// <inheritdoc />
    public async Task<Result<bool, string>> PingClusterAsync(string clusterId, CancellationToken cancellationToken = default)
    {
        try
        {
            var client = await GetClientAsync(clusterId, cancellationToken).ConfigureAwait(false);
            var adminDatabase = client.GetDatabase(MongoClusterConstants.DatabaseNames.Admin);
            var pingCommand = new BsonDocument(MongoClusterConstants.Commands.Ping, 1);

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(_options.GetEndpoint(clusterId).EffectiveServerSelectionTimeout);

            await adminDatabase.RunCommandAsync<BsonDocument>(pingCommand, cancellationToken: cts.Token).ConfigureAwait(false);
            return Result<bool, string>.Success(true);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, InfrastructureLogMessages.PingFailedWarning, clusterId);
            return Result<bool, string>.Failure(InfrastructureErrorMessages.PingFailed(clusterId, ex.Message));
        }
    }

    /// <inheritdoc />
    public Task<Result<bool, string>> PingClusterAsync(MongoClusterTier tier, CancellationToken cancellationToken = default) =>
        PingClusterAsync(tier.ToCanonicalClusterId(), cancellationToken);

    private IMongoClient CreateClient(string clusterId)
    {
        var endpointOptions = _options.GetEndpoint(clusterId);

        if (string.IsNullOrWhiteSpace(endpointOptions.ConnectionString))
        {
            throw new InvalidOperationException(
                InfrastructureErrorMessages.ClusterConnectionStringNotConfigured(clusterId));
        }

        // Default replica set name if not specified
        if (string.IsNullOrWhiteSpace(endpointOptions.ReplicaSetName))
        {
            endpointOptions.ReplicaSetName = clusterId;
        }

        _logger.LogInformation(
            InfrastructureLogMessages.InitializingPooledClient,
            clusterId, endpointOptions.ReplicaSetName, SanitizeEndpoints(endpointOptions.ConnectionString));

        var settings = MongoConnectionConfigurator.BuildClientSettings(endpointOptions, cb =>
        {
            cb.Subscribe<MongoDB.Driver.Core.Events.ServerHeartbeatFailedEvent>(e =>
            {
                _logger.LogWarning(InfrastructureLogMessages.HeartbeatFailed,
                    clusterId, e.ServerId.EndPoint, e.Exception.Message);
            });
        });

        return new MongoClient(settings);
    }

    private static string NormalizeClusterKey(string clusterId)
    {
        var trimmed = clusterId.Trim();
        if (string.Equals(trimmed, MongoClusterConstants.Aliases.AdminAlias, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(trimmed, MongoClusterConstants.CanonicalClusterIds.Admin, StringComparison.OrdinalIgnoreCase))
        {
            return MongoClusterConstants.CanonicalClusterIds.Admin;
        }

        if (string.Equals(trimmed, MongoClusterConstants.Aliases.DevAlias, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(trimmed, MongoClusterConstants.CanonicalClusterIds.Dev, StringComparison.OrdinalIgnoreCase))
        {
            return MongoClusterConstants.CanonicalClusterIds.Dev;
        }

        if (string.Equals(trimmed, MongoClusterConstants.Aliases.ProdAlias, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(trimmed, MongoClusterConstants.CanonicalClusterIds.Prod, StringComparison.OrdinalIgnoreCase))
        {
            return MongoClusterConstants.CanonicalClusterIds.Prod;
        }

        return trimmed;
    }

    private static string SanitizeEndpoints(string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return MongoClusterConstants.Redacted;
        }

        try
        {
            var url = new MongoUrl(connectionString);
            return string.Join(MongoClusterConstants.Delimiters.Comma, url.Servers);
        }
        catch
        {
            return MongoClusterConstants.Redacted;
        }
    }

    private void ThrowIfDisposed()
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;

        foreach (var client in _clientPool.Values)
        {
            if (client is IDisposable disposableClient)
            {
                try
                {
                    disposableClient.Dispose();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, InfrastructureLogMessages.ErrorDisposingClient);
                }
            }
        }

        foreach (var initLock in _initLocks.Values)
        {
            try
            {
                initLock.Dispose();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, InfrastructureLogMessages.ErrorDisposingLock);
            }
        }

        _clientPool.Clear();
        _initLocks.Clear();
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed) return;
        _disposed = true;

        foreach (var client in _clientPool.Values)
        {
            if (client is IAsyncDisposable asyncDisposableClient)
            {
                try
                {
                    await asyncDisposableClient.DisposeAsync().ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, InfrastructureLogMessages.ErrorDisposingClientAsync);
                }
            }
            else if (client is IDisposable disposableClient)
            {
                try
                {
                    disposableClient.Dispose();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, InfrastructureLogMessages.ErrorDisposingClient);
                }
            }
        }

        foreach (var initLock in _initLocks.Values)
        {
            try
            {
                initLock.Dispose();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, InfrastructureLogMessages.ErrorDisposingLock);
            }
        }

        _clientPool.Clear();
        _initLocks.Clear();
    }
}
