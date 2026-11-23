namespace Vialiq.Core.Entities;

using System;
using System.Collections.Generic;
using Vialiq.Core.Models;

/// <summary>
/// Canonical Part 11 audit trail record stored in study_{id}_prod audit collections.
/// Satisfies FDA 21 CFR Part 11 § 11.10(a),(e), EU Annex 11 § 9, and ICH GCP E6(R3).
/// </summary>
public sealed class ClinicalAuditRecordEntity
{
    public string Id { get; set; } = string.Empty;

    public string TenantId { get; set; } = string.Empty;
    public string StudyId { get; set; } = string.Empty;
    public string SubjectId { get; set; } = string.Empty;
    public string TargetCrfId { get; set; } = string.Empty;

    // Legal Timestamp Authority & Monotonic Ordering (ADR 009)
    public AuditTimestampMetadata TimestampMeta { get; set; } = null!;

    // Cryptographic Chain (ADR 006)
    public string PreviousHash { get; set; } = string.Empty;
    public string CurrentHash { get; set; } = string.Empty;

    // Actor Information (21 CFR Part 11 § 11.50)
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;

    // Clinical Change Details
    public string EventType { get; set; } = string.Empty; // FormSave, ValueChange, QueryRaise, Signature
    public string? ReasonForChange { get; set; }
    public Dictionary<string, object?> ChangedFields { get; set; } = new();
}
