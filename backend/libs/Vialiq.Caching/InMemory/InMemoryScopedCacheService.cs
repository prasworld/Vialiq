namespace Vialiq.Caching.InMemory;

using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using Vialiq.Caching.Abstractions;
using Vialiq.Core.Interfaces;

/// <summary>
/// Lightweight in-memory implementation of IScopedCacheService.
/// Ideal for unit tests, local test suites, and offline development environments.
/// </summary>
public sealed class InMemoryScopedCacheService : IScopedCacheService
{
    private readonly ConcurrentDictionary<string, object?> _store = new();
    private readonly ITenantStudyContextAccessor? _contextAccessor;

    public InMemoryScopedCacheService(ITenantStudyContextAccessor? contextAccessor = null)
    {
        _contextAccessor = contextAccessor;
    }

    public async ValueTask<T> GetOrCreateStudyAsync<T>(
        string resource, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var tenant = _contextAccessor?.CurrentContext?.TenantId ?? "test-tenant";
        var study = _contextAccessor?.CurrentContext?.StudyId ?? "test-study";
        var env = _contextAccessor?.CurrentContext?.Environment ?? "test";
        var fullKey = $"study:{tenant}:{study}:{env}:{resource}:{key}";

        if (_store.TryGetValue(fullKey, out var existing) && existing is T typedVal)
        {
            return typedVal;
        }

        var created = await factory(ct);
        _store[fullKey] = created;
        return created;
    }

    public async ValueTask<T> GetOrCreateClientLibraryAsync<T>(
        string resource, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var tenant = _contextAccessor?.CurrentContext?.TenantId ?? "test-tenant";
        var fullKey = $"tenant:{tenant}:lib:{resource}:{key}";

        if (_store.TryGetValue(fullKey, out var existing) && existing is T typedVal)
        {
            return typedVal;
        }

        var created = await factory(ct);
        _store[fullKey] = created;
        return created;
    }

    public async ValueTask<T> GetOrCreateGlobalAsync<T>(
        string dictionary, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default)
    {
        var fullKey = $"global:standards:{dictionary}:{key}";

        if (_store.TryGetValue(fullKey, out var existing) && existing is T typedVal)
        {
            return typedVal;
        }

        var created = await factory(ct);
        _store[fullKey] = created;
        return created;
    }

    public Task InvalidateStudyKeyAsync(string resource, string key, CancellationToken ct = default)
    {
        var tenant = _contextAccessor?.CurrentContext?.TenantId ?? "test-tenant";
        var study = _contextAccessor?.CurrentContext?.StudyId ?? "test-study";
        var env = _contextAccessor?.CurrentContext?.Environment ?? "test";
        var fullKey = $"study:{tenant}:{study}:{env}:{resource}:{key}";

        _store.TryRemove(fullKey, out _);
        return Task.CompletedTask;
    }
}
