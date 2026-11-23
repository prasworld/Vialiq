namespace Vialiq.Caching.InMemory;

using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using Vialiq.Caching.Abstractions;
using Vialiq.Core.Models;

public sealed class InMemoryProtocolWarmupService : IProtocolWarmupService
{
    public ConcurrentDictionary<string, string> WarmedCache { get; } = new();

    public async Task PreWarmAmendmentCacheAsync(
        ProtocolAmendmentManifest manifest, 
        Func<string, Task<string>> formSchemaCompiler, 
        CancellationToken ct = default)
    {
        foreach (var formId in manifest.ModifiedFormIds)
        {
            var compiled = await formSchemaCompiler(formId);
            var cacheKey = $"study:{manifest.TenantId}:{manifest.StudyId}:{manifest.TargetVersion}:schema:{formId}";
            WarmedCache[cacheKey] = compiled;
        }
    }

    public Task EvictAbortedAmendmentCacheAsync(
        ProtocolAmendmentManifest manifest, 
        CancellationToken ct = default)
    {
        foreach (var formId in manifest.ModifiedFormIds)
        {
            var cacheKey = $"study:{manifest.TenantId}:{manifest.StudyId}:{manifest.TargetVersion}:schema:{formId}";
            WarmedCache.TryRemove(cacheKey, out _);
        }
        return Task.CompletedTask;
    }
}
