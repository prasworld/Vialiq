namespace Vialiq.Caching.Abstractions;

using System;
using System.Threading;
using System.Threading.Tasks;
using Vialiq.Core.Models;

/// <summary>
/// Pre-warms amended study schemas and edit check rules into Redis during the Stage 5 maintenance window.
/// Guarantees a 0% runtime cache miss rate when the study is unlocked for investigators.
/// </summary>
public interface IProtocolWarmupService
{
    Task PreWarmAmendmentCacheAsync(
        ProtocolAmendmentManifest manifest,
        Func<string, Task<string>> formSchemaCompiler,
        CancellationToken ct = default);

    Task EvictAbortedAmendmentCacheAsync(
        ProtocolAmendmentManifest manifest,
        CancellationToken ct = default);
}
