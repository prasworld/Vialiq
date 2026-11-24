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
    /// <summary>Unique MongoDB document identifier.</summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>Multi-tenant sponsor identifier.</summary>
    public string TenantId { get; set; } = string.Empty;

    /// <summary>Clinical study identifier.</summary>
    public string StudyId { get; set; } = string.Empty;

    /// <summary>Clinical subject identifier.</summary>
    public string SubjectId { get; set; } = string.Empty;

    /// <summary>Case Report Form identifier being modified.</summary>
    public string TargetCrfId { get; set; } = string.Empty;

    /// <summary>Authoritative server timestamp metadata and monotonic causal sequence number (ADR 009).</summary>
    public AuditTimestampMetadata TimestampMeta { get; set; } = null!;

    /// <summary>Cryptographic hash of the previous record in the study chain (ADR 006).</summary>
    public string PreviousHash { get; set; } = string.Empty;

    /// <summary>Cryptographic SHA-256 hash of this record establishing tamper-evident chaining (ADR 006).</summary>
    public string CurrentHash { get; set; } = string.Empty;

    /// <summary>Identifier of the user who performed the change (21 CFR Part 11 § 11.50).</summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>Legal full name of the user who performed the change.</summary>
    public string UserFullName { get; set; } = string.Empty;

    /// <summary>Clinical role of the user at the time of the event.</summary>
    public string UserRole { get; set; } = string.Empty;

    /// <summary>Type of clinical event (e.g. FormSave, ValueChange, QueryRaise, Signature).</summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>Regulatory reason for change required on updates to existing data.</summary>
    public string? ReasonForChange { get; set; }

    /// <summary>Dictionary of changed field identifiers and their old/new values.</summary>
    public Dictionary<string, object?> ChangedFields { get; set; } = new();
}
