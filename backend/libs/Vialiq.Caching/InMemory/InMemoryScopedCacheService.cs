namespace Vialiq.Caching.InMemory;

using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using Vialiq.Caching.Abstractions;
using Vialiq.Core.Constants;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models;

/// <summary>
/// Lightweight in-memory implementation of <see cref="IScopedCacheService"/>.
/// Ideal for unit tests, local test suites, and offline development environments.
/// </summary>
public sealed class InMemoryScopedCacheService : IScopedCacheService
{
    private readonly ConcurrentDictionary<string, object?> _store = new();
    private readonly ITenantStudyContextAccessor? _contextAccessor;

    /// <summary>
    /// Initializes a new instance of <see cref="InMemoryScopedCacheService"/>.
    /// </summary>
    /// <param name="contextAccessor">Optional ambient request context accessor providing tenant and study context.</param>
    public InMemoryScopedCacheService(ITenantStudyContextAccessor? contextAccessor = null)
    {
        _contextAccessor = contextAccessor;
    }

    /// <inheritdoc />
    public ValueTask<T> GetOrCreateStudyAsync<T>(
        string resource, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var scope = _contextAccessor?.CurrentContext?.BlindingScope ?? BlindingScope.Blinded;
        return GetOrCreateStudyAsync(resource, key, scope, factory, ct);
    }

    /// <inheritdoc />
    public async ValueTask<T> GetOrCreateStudyAsync<T>(
        string resource, 
        string key, 
        BlindingScope scope,
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var tenant = _contextAccessor?.CurrentContext?.TenantId ?? "test-tenant";
        var study = _contextAccessor?.CurrentContext?.StudyId ?? "test-study";
        var env = _contextAccessor?.CurrentContext?.Environment ?? "test";
        var version = !string.IsNullOrWhiteSpace(_contextAccessor?.CurrentContext?.ProtocolVersion)
            ? _contextAccessor.CurrentContext.ProtocolVersion
            : MongoClusterConstants.CacheSegments.Current;
        var scopeSegment = scope == BlindingScope.Unblinded 
            ? MongoClusterConstants.CacheSegments.Unblinded 
            : MongoClusterConstants.CacheSegments.Blinded;

        var fullKey = $"{MongoClusterConstants.CacheSegments.Study}:{tenant}:{study}:{env}:{version}:{MongoClusterConstants.CacheSegments.Scope}:{scopeSegment}:{resource}:{key}";

        if (_store.TryGetValue(fullKey, out var existing) && existing is T typedVal)
        {
            return typedVal;
        }

        var created = await factory(ct);
        _store[fullKey] = created;
        return created;
    }

    /// <inheritdoc />
    public async ValueTask<T> GetOrCreateClientLibraryAsync<T>(
        string resource, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var tenant = _contextAccessor?.CurrentContext?.TenantId ?? "test-tenant";
        var fullKey = $"{MongoClusterConstants.CacheSegments.Tenant}:{tenant}:{MongoClusterConstants.CacheSegments.Lib}:{resource}:{key}";

        if (_store.TryGetValue(fullKey, out var existing) && existing is T typedVal)
        {
            return typedVal;
        }

        var created = await factory(ct);
        _store[fullKey] = created;
        return created;
    }

    /// <inheritdoc />
    public async ValueTask<T> GetOrCreateGlobalAsync<T>(
        string dictionary, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var fullKey = $"{MongoClusterConstants.CacheSegments.Global}:{MongoClusterConstants.CacheSegments.Standards}:{dictionary}:{key}";

        if (_store.TryGetValue(fullKey, out var existing) && existing is T typedVal)
        {
            return typedVal;
        }

        var created = await factory(ct);
        _store[fullKey] = created;
        return created;
    }

    /// <inheritdoc />
    public Task InvalidateStudyKeyAsync(string resource, string key, CancellationToken ct = default)
    {
        var tenant = _contextAccessor?.CurrentContext?.TenantId ?? "test-tenant";
        var study = _contextAccessor?.CurrentContext?.StudyId ?? "test-study";
        var env = _contextAccessor?.CurrentContext?.Environment ?? "test";
        var version = !string.IsNullOrWhiteSpace(_contextAccessor?.CurrentContext?.ProtocolVersion)
            ? _contextAccessor.CurrentContext.ProtocolVersion
            : MongoClusterConstants.CacheSegments.Current;

        var blindedKey = $"{MongoClusterConstants.CacheSegments.Study}:{tenant}:{study}:{env}:{version}:{MongoClusterConstants.CacheSegments.Scope}:{MongoClusterConstants.CacheSegments.Blinded}:{resource}:{key}";
        var unblindedKey = $"{MongoClusterConstants.CacheSegments.Study}:{tenant}:{study}:{env}:{version}:{MongoClusterConstants.CacheSegments.Scope}:{MongoClusterConstants.CacheSegments.Unblinded}:{resource}:{key}";

        _store.TryRemove(blindedKey, out _);
        _store.TryRemove(unblindedKey, out _);
        return Task.CompletedTask;
    }
}
