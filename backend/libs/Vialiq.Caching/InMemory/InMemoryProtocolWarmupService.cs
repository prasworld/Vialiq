namespace Vialiq.Caching.InMemory;

using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using Vialiq.Caching.Abstractions;
using Vialiq.Core.Models;

/// <summary>
/// In-memory implementation of <see cref="IProtocolWarmupService"/> for unit tests and offline development.
/// </summary>
public sealed class InMemoryProtocolWarmupService : IProtocolWarmupService
{
    /// <summary>
    /// In-memory dictionary storing pre-warmed schema strings keyed by cache key.
    /// </summary>
    public ConcurrentDictionary<string, string> WarmedCache { get; } = new();

    /// <inheritdoc />
    public async Task PreWarmAmendmentCacheAsync(
        ProtocolAmendmentManifest manifest, 
        Func<string, Task<string>> formSchemaCompiler, 
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(manifest);
        ArgumentNullException.ThrowIfNull(formSchemaCompiler);

        foreach (var formId in manifest.ModifiedFormIds)
        {
            ct.ThrowIfCancellationRequested();
            var compiled = await formSchemaCompiler(formId);
            ct.ThrowIfCancellationRequested();
            var cacheKey = $"study:{manifest.TenantId}:{manifest.StudyId}:{manifest.TargetVersion}:schema:{formId}";
            WarmedCache[cacheKey] = compiled;
        }
    }

    /// <inheritdoc />
    public Task EvictAbortedAmendmentCacheAsync(
        ProtocolAmendmentManifest manifest, 
        CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(manifest);

        ct.ThrowIfCancellationRequested();
        foreach (var formId in manifest.ModifiedFormIds)
        {
            ct.ThrowIfCancellationRequested();
            var cacheKey = $"study:{manifest.TenantId}:{manifest.StudyId}:{manifest.TargetVersion}:schema:{formId}";
            WarmedCache.TryRemove(cacheKey, out _);
        }
        return Task.CompletedTask;
    }
}
