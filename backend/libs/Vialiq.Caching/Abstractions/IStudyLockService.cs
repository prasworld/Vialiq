namespace Vialiq.Caching.Abstractions;

using System.Threading;
using System.Threading.Tasks;
using Vialiq.Caching.Abstractions.Models;
using Vialiq.Core.Models;

/// <summary>
/// Clinical form concurrency lock manager coordinating single-editor leases (ADR 003).
/// Adheres to the Dual-Write Synchronous Completion Principle (MongoDB durable record + Redis fast lock).
/// </summary>
public interface IStudyLockService
{
    Task<LockResult> AcquireFormLockAsync(string studyId, string crfId, UserContext user, CancellationToken ct = default);
    Task ReleaseFormLockAsync(string studyId, string crfId, UserContext user, CancellationToken ct = default);
    Task BreakFormLockAsync(string studyId, string crfId, string auditReason, UserContext user, CancellationToken ct = default);
}
