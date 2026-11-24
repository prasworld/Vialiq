namespace Vialiq.Caching.Abstractions;

using System.Threading;
using System.Threading.Tasks;
using Vialiq.Caching.Abstractions.Models;
using Vialiq.Core.Models;

/// <summary>
/// Clinical form concurrency lock manager coordinating single-editor leases (ADR 003).
/// Adheres to the Dual-Write Synchronous Completion Principle (MongoDB durable record + Redis fast lock).
/// Guarantees that only one clinical user (Investigator, CRC, CRA) can edit a Case Report Form (CRF) at any given time.
/// </summary>
public interface IStudyLockService
{
    /// <summary>
    /// Asynchronously attempts to acquire an exclusive 15-minute edit lease for a specific clinical form (CRF).
    /// </summary>
    /// <param name="studyId">The unique identifier of the target clinical study.</param>
    /// <param name="crfId">The unique identifier of the target Case Report Form (CRF).</param>
    /// <param name="user">The authenticated user context representing the editor requesting the lease.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while waiting for the acquisition to complete.</param>
    /// <returns>
    /// A <see cref="LockResult"/> indicating whether the lease was acquired successfully.
    /// If acquired, includes the expiration time and an immutable fencing token (<c>LockToken</c>);
    /// if denied, includes details of the current active lease holder.
    /// </returns>
    /// <exception cref="System.ArgumentException">Thrown when <paramref name="studyId"/> or <paramref name="crfId"/> is null or whitespace.</exception>
    /// <exception cref="System.ArgumentNullException">Thrown when <paramref name="user"/> is null.</exception>
    Task<LockResult> AcquireFormLockAsync(string studyId, string crfId, UserContext user, CancellationToken ct = default);

    /// <summary>
    /// Asynchronously releases an active edit lease for a clinical form held by the authenticated user.
    /// Supports fencing via an optional <paramref name="lockToken"/> to prevent delayed network requests from older sessions/tabs releasing newer leases.
    /// </summary>
    /// <param name="studyId">The unique identifier of the target clinical study.</param>
    /// <param name="crfId">The unique identifier of the target Case Report Form (CRF).</param>
    /// <param name="user">The authenticated user context of the user releasing the lease.</param>
    /// <param name="lockToken">
    /// Optional fencing token returned during acquisition. If supplied, only a lease matching this exact token is released.
    /// </param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while waiting for the release to complete.</param>
    /// <returns>A <see cref="Task"/> representing the asynchronous release operation.</returns>
    /// <exception cref="System.ArgumentException">Thrown when <paramref name="studyId"/> or <paramref name="crfId"/> is null or whitespace.</exception>
    /// <exception cref="System.ArgumentNullException">Thrown when <paramref name="user"/> is null.</exception>
    Task ReleaseFormLockAsync(string studyId, string crfId, UserContext user, string? lockToken = null, CancellationToken ct = default);

    /// <summary>
    /// Asynchronously breaks an active edit lease held by another user with a mandatory FDA 21 CFR Part 11 audit reason.
    /// Only authorized clinical roles (Investigator, CRC, CRA, DataManager, StudyAdmin, SuperAdmin) may execute this action.
    /// Restricts mutation strictly to currently active, unexpired leases.
    /// </summary>
    /// <param name="studyId">The unique identifier of the target clinical study.</param>
    /// <param name="crfId">The unique identifier of the target Case Report Form (CRF).</param>
    /// <param name="auditReason">A non-empty 21 CFR Part 11 regulatory audit explanation justifying the override.</param>
    /// <param name="user">The authenticated user context of the authorized user performing the override.</param>
    /// <param name="ct">A <see cref="CancellationToken"/> to observe while waiting for the break operation to complete.</param>
    /// <returns>A <see cref="Task"/> representing the asynchronous break operation.</returns>
    /// <exception cref="System.ArgumentException">Thrown when <paramref name="studyId"/>, <paramref name="crfId"/>, or <paramref name="auditReason"/> is null or whitespace.</exception>
    /// <exception cref="System.ArgumentNullException">Thrown when <paramref name="user"/> is null.</exception>
    /// <exception cref="System.UnauthorizedAccessException">Thrown when <paramref name="user"/> lacks an authorized clinical role.</exception>
    Task BreakFormLockAsync(string studyId, string crfId, string auditReason, UserContext user, CancellationToken ct = default);
}
