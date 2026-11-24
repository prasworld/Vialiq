namespace Vialiq.Core.Entities;

using System;
using System.Collections.Generic;

/// <summary>
/// Status enumeration for clinical form concurrency edit leases.
/// </summary>
public enum LockStatus
{
    /// <summary>
    /// The lease is currently active and exclusively held by the designated editor.
    /// </summary>
    Active = 1,

    /// <summary>
    /// The lease was explicitly released by the editor upon saving or navigating away.
    /// </summary>
    Released = 2,

    /// <summary>
    /// The 15-minute lease duration elapsed without renewal or activity.
    /// </summary>
    Expired = 3,

    /// <summary>
    /// The lease was forcefully broken by an authorized role with mandatory audit logging.
    /// </summary>
    Broken = 4
}

/// <summary>
/// Regulatory FDA 21 CFR Part 11 audit entry recording an administrative or clinical override break of an active lease.
/// </summary>
/// <param name="BrokenByUserId">The unique identifier of the authorized user who broke the lock.</param>
/// <param name="BrokenReason">The regulatory audit explanation justifying the lock break.</param>
/// <param name="BrokenAtUtc">The UTC timestamp when the override was executed.</param>
public sealed record LockBreakAuditEntry(
    string BrokenByUserId,
    string BrokenReason,
    DateTime BrokenAtUtc);

/// <summary>
/// MongoDB canonical durable source of truth for clinical form concurrency locks.
/// Stored in <c>study_{id}_prod.study_edit_leases</c> collection.
/// Guarantees Single-Editor / Multi-Reader form concurrency per ADR 003.
/// </summary>
public sealed class StudyLockEntity
{
    /// <summary>
    /// The unique document identifier in MongoDB.
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// The multi-tenant sponsor identifier.
    /// </summary>
    public string TenantId { get; set; } = string.Empty;

    /// <summary>
    /// The clinical study identifier.
    /// </summary>
    public string StudyId { get; set; } = string.Empty;

    /// <summary>
    /// The target Case Report Form (CRF) identifier locked for single-editor editing.
    /// </summary>
    public string TargetCrfId { get; set; } = string.Empty;

    /// <summary>
    /// The unique identifier of the user who acquired the lease.
    /// </summary>
    public string LockedByUserId { get; set; } = string.Empty;

    /// <summary>
    /// The full name of the user who acquired the lease.
    /// </summary>
    public string LockedByFullName { get; set; } = string.Empty;

    /// <summary>
    /// The unique fencing token issued upon acquisition to protect against delayed releases from older tabs/sessions.
    /// </summary>
    public string LockToken { get; set; } = string.Empty;

    /// <summary>
    /// The UTC timestamp when the lease was acquired.
    /// </summary>
    public DateTime LockedAtUtc { get; set; }

    /// <summary>
    /// The UTC timestamp when the lease will expire.
    /// </summary>
    public DateTime ExpiresAtUtc { get; set; }

    /// <summary>
    /// The current operational status of the lease.
    /// </summary>
    public LockStatus Status { get; set; } = LockStatus.Active;

    /// <summary>
    /// The UTC timestamp when the lease was released, or null if not released.
    /// </summary>
    public DateTime? ReleasedAtUtc { get; set; }

    /// <summary>
    /// The user ID of the user who broke the lock, or null if never broken.
    /// </summary>
    public string? BrokenByUserId { get; set; }

    /// <summary>
    /// The 21 CFR Part 11 audit reason provided when the lock was broken, or null if never broken.
    /// </summary>
    public string? BrokenReason { get; set; }

    /// <summary>
    /// The UTC timestamp when the lock was broken, or null if never broken.
    /// </summary>
    public DateTime? BrokenAtUtc { get; set; }

    /// <summary>
    /// Historical chronological audit trail of all override breaks on this target form.
    /// </summary>
    public List<LockBreakAuditEntry> BreakHistory { get; set; } = new();
}
