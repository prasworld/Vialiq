namespace Vialiq.Caching.Abstractions;

using System;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
/// Multi-tenant scoped caching service enforcing strict tenant isolation across Study, Client Library, and Global scopes.
/// </summary>
public interface IScopedCacheService
{
    ValueTask<T> GetOrCreateStudyAsync<T>(
        string resource, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default);

    ValueTask<T> GetOrCreateClientLibraryAsync<T>(
        string resource, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default);

    ValueTask<T> GetOrCreateGlobalAsync<T>(
        string dictionary, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default);

    Task InvalidateStudyKeyAsync(string resource, string key, CancellationToken ct = default);
}
