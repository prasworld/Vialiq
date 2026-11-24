namespace Vialiq.Core.Entities;

using System;
using Vialiq.Core.Models;

/// <summary>
/// Regulatory Part 11 audit record stored in study_{id}_prod.audit_unblinding.
/// Captures emergency code break events with full legal accountability.
/// </summary>
public sealed class EmergencyUnblindingAuditEntity
{
    /// <summary>Unique MongoDB document identifier.</summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>Multi-tenant sponsor identifier.</summary>
    public string TenantId { get; set; } = string.Empty;

    /// <summary>Clinical study identifier.</summary>
    public string StudyId { get; set; } = string.Empty;

    /// <summary>Enrolled clinical subject identifier whose code was broken.</summary>
    public string SubjectId { get; set; } = string.Empty;

    /// <summary>Authoritative server timestamp metadata and monotonic causal sequence number (ADR 009).</summary>
    public AuditTimestampMetadata TimestampMeta { get; set; } = null!;

    /// <summary>Cryptographic hash of the previous record in the unblinding chain (ADR 006).</summary>
    public string PreviousHash { get; set; } = string.Empty;

    /// <summary>Cryptographic SHA-256 hash of this record establishing tamper-evident chain integrity.</summary>
    public string CurrentHash { get; set; } = string.Empty;

    /// <summary>User ID of the physician performing the emergency unblinding (21 CFR Part 11 § 11.50).</summary>
    public string PerformedByUserId { get; set; } = string.Empty;

    /// <summary>Full name of the physician performing the emergency unblinding.</summary>
    public string PerformedByFullName { get; set; } = string.Empty;

    /// <summary>Clinical role of the physician.</summary>
    public string PerformedByUserRole { get; set; } = string.Empty;

    /// <summary>Emergency medical reason triggering the code break.</summary>
    public string EmergencyReason { get; set; } = string.Empty;

    /// <summary>Comprehensive medical justification for breaking the trial double blind.</summary>
    public string ClinicalJustification { get; set; } = string.Empty;

    /// <summary>The revealed actual treatment arm stored securely in the unblinding collection.</summary>
    public string RevealedTreatmentArm { get; set; } = string.Empty;

    /// <summary>The revealed investigational kit number.</summary>
    public string RevealedKitNumber { get; set; } = string.Empty;
}
