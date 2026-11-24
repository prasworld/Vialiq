namespace Vialiq.Caching.Abstractions;

using System;
using System.Threading;
using System.Threading.Tasks;
using Vialiq.Core.Models;

/// <summary>
/// Multi-tenant scoped caching service enforcing strict tenant isolation across Study, Client Library, and Global scopes.
/// Guarantees clinical trial double-blind isolation and protocol epoch/version partitioning.
/// <para>
/// <b>CRITICAL ARCHITECTURAL BOUNDARY (ADR 007-A Decision 1.1):</b><br/>
/// Strictly restricted to invariant structural metadata (approved form schemas, rules ASTs, codelists, visit matrices, and reference dictionaries).
/// Live patient CRF responses, subject records, and clinical data entry are strictly banned from cache and are always fetched directly from MongoDB with per-request CSFLE.
/// </para>
/// </summary>
public interface IScopedCacheService
{
    /// <summary>
    /// Asynchronously retrieves or computes an invariant study structural metadata resource using the ambient blinding scope from context.
    /// </summary>
    /// <typeparam name="T">The type of the cached metadata object.</typeparam>
    /// <param name="resource">The structural metadata resource category (e.g., <c>"schema"</c>, <c>"form"</c>, <c>"codelist"</c>, <c>"rules"</c>).</param>
    /// <param name="key">The specific resource key or form identifier within the study scope.</param>
    /// <param name="factory">The asynchronous factory function invoked to compute the value on cache miss.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while retrieving or computing the cached resource.</param>
    /// <returns>A <see cref="ValueTask{T}"/> containing the cached or freshly computed metadata instance.</returns>
    /// <exception cref="System.Security.SecurityException">Thrown when ambient TenantId or StudyId is missing from context.</exception>
    ValueTask<T> GetOrCreateStudyAsync<T>(
        string resource, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default);

    /// <summary>
    /// Asynchronously retrieves or computes an invariant study structural metadata resource partitioned explicitly by blinding scope (<see cref="BlindingScope.Blinded"/> vs <see cref="BlindingScope.Unblinded"/>).
    /// Prevents role-sensitive schema or codelist metadata written by unblinded requests from being returned to blinded users.
    /// </summary>
    /// <typeparam name="T">The type of the cached metadata object.</typeparam>
    /// <param name="resource">The structural metadata resource category (e.g., <c>"schema"</c>, <c>"form"</c>, <c>"codelist"</c>, <c>"rules"</c>).</param>
    /// <param name="key">The specific resource key or form identifier within the study scope.</param>
    /// <param name="scope">The explicit <see cref="BlindingScope"/> (<c>Blinded</c> or <c>Unblinded</c>) to isolate this cache key partition.</param>
    /// <param name="factory">The asynchronous factory function invoked to compute the value on cache miss.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while retrieving or computing the cached resource.</param>
    /// <returns>A <see cref="ValueTask{T}"/> containing the cached or freshly computed metadata instance.</returns>
    /// <exception cref="System.Security.SecurityException">Thrown when ambient TenantId or StudyId is missing from context.</exception>
    ValueTask<T> GetOrCreateStudyAsync<T>(
        string resource, 
        string key, 
        BlindingScope scope,
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default);

    /// <summary>
    /// Asynchronously retrieves or computes a tenant-level standards library metadata definition (ADR 007-A Category 1).
    /// Isolated strictly by tenant ID to prevent cross-tenant standards leakage.
    /// </summary>
    /// <typeparam name="T">The type of the cached standards library object.</typeparam>
    /// <param name="resource">The standards library resource category (e.g., <c>"form_template"</c>, <c>"codelist"</c>).</param>
    /// <param name="key">The specific template or codelist identifier.</param>
    /// <param name="factory">The asynchronous factory function invoked to compute the value on cache miss.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while retrieving or computing the cached resource.</param>
    /// <returns>A <see cref="ValueTask{T}"/> containing the cached or freshly computed standards instance.</returns>
    /// <exception cref="System.Security.SecurityException">Thrown when ambient TenantId is missing from context.</exception>
    ValueTask<T> GetOrCreateClientLibraryAsync<T>(
        string resource, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default);

    /// <summary>
    /// Asynchronously retrieves or computes global cross-tenant reference data, such as MedDRA and WHODrug medical dictionaries (ADR 007-A Category 2).
    /// </summary>
    /// <typeparam name="T">The type of the cached global reference dictionary object.</typeparam>
    /// <param name="dictionary">The global reference dictionary name (e.g., <c>"meddra"</c>, <c>"whodrug"</c>).</param>
    /// <param name="key">The dictionary term, code, or hierarchy level key.</param>
    /// <param name="factory">The asynchronous factory function invoked to compute the value on cache miss.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while retrieving or computing the cached resource.</param>
    /// <returns>A <see cref="ValueTask{T}"/> containing the cached or freshly computed dictionary instance.</returns>
    ValueTask<T> GetOrCreateGlobalAsync<T>(
        string dictionary, 
        string key, 
        Func<CancellationToken, ValueTask<T>> factory, 
        CancellationToken ct = default);

    /// <summary>
    /// Asynchronously invalidates study metadata across both <see cref="BlindingScope.Blinded"/> and <see cref="BlindingScope.Unblinded"/> partitions,
    /// and broadcasts the eviction notice across the multi-instance Redis backplane.
    /// </summary>
    /// <param name="resource">The structural metadata resource category to invalidate.</param>
    /// <param name="key">The specific resource key to evict.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while performing the invalidation.</param>
    /// <returns>A <see cref="Task"/> representing the asynchronous invalidation operation.</returns>
    Task InvalidateStudyKeyAsync(string resource, string key, CancellationToken ct = default);
}
