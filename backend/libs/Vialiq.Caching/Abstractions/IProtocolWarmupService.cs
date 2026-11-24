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
    /// <summary>
    /// Asynchronously compiles and pre-populates Redis cache keys for all modified forms in an approved protocol amendment.
    /// </summary>
    /// <param name="manifest">The amendment manifest specifying target study, version, and modified forms.</param>
    /// <param name="formSchemaCompiler">Asynchronous compilation delegate compiling raw form JSON into validated schema.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while pre-warming the cache.</param>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
    Task PreWarmAmendmentCacheAsync(
        ProtocolAmendmentManifest manifest,
        Func<string, Task<string>> formSchemaCompiler,
        CancellationToken ct = default);

    /// <summary>
    /// Asynchronously evicts pre-warmed cache keys when an in-flight protocol amendment is aborted or rolled back.
    /// </summary>
    /// <param name="manifest">The amendment manifest specifying keys to remove.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while evicting keys.</param>
    /// <returns>A <see cref="Task"/> representing the asynchronous operation.</returns>
    Task EvictAbortedAmendmentCacheAsync(
        ProtocolAmendmentManifest manifest,
        CancellationToken ct = default);
}
