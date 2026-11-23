namespace Vialiq.Core.Entities;

using System;

public enum LockStatus
{
    Active = 1,
    Released = 2,
    Expired = 3,
    Broken = 4
}

public sealed record LockBreakAuditEntry(
    string BrokenByUserId,
    string BrokenReason,
    DateTime BrokenAtUtc);

/// <summary>
/// MongoDB canonical durable source of truth for clinical form concurrency locks.
/// Stored in study_{id}_prod.study_edit_leases collection.
/// </summary>
public sealed class StudyLockEntity
{
    public string Id { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string StudyId { get; set; } = string.Empty;
    public string TargetCrfId { get; set; } = string.Empty;
    public string LockedByUserId { get; set; } = string.Empty;
    public string LockedByFullName { get; set; } = string.Empty;
    public DateTime LockedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public LockStatus Status { get; set; } = LockStatus.Active;
    public DateTime? ReleasedAtUtc { get; set; }
    public string? BrokenByUserId { get; set; }
    public string? BrokenReason { get; set; }
    public DateTime? BrokenAtUtc { get; set; }
    public System.Collections.Generic.List<LockBreakAuditEntry> BreakHistory { get; set; } = new();
}
