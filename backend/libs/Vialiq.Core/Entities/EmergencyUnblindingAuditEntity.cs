namespace Vialiq.Core.Entities;

using System;
using Vialiq.Core.Models;

/// <summary>
/// Regulatory Part 11 audit record stored in study_{id}_prod.audit_unblinding.
/// Captures emergency code break events with full legal accountability.
/// </summary>
public sealed class EmergencyUnblindingAuditEntity
{
    public string Id { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string StudyId { get; set; } = string.Empty;
    public string SubjectId { get; set; } = string.Empty;

    // Legal Authority & Ordering (ADR 009)
    public AuditTimestampMetadata TimestampMeta { get; set; } = null!;

    // Cryptographic Chain (ADR 006)
    public string PreviousHash { get; set; } = string.Empty;
    public string CurrentHash { get; set; } = string.Empty;

    // Actor Information (21 CFR Part 11 § 11.50)
    public string PerformedByUserId { get; set; } = string.Empty;
    public string PerformedByFullName { get; set; } = string.Empty;
    public string PerformedByUserRole { get; set; } = string.Empty;

    // Clinical Justification
    public string EmergencyReason { get; set; } = string.Empty;
    public string ClinicalJustification { get; set; } = string.Empty;

    // Unblinded Payload (Stored in encrypted MongoDB collection)
    public string RevealedTreatmentArm { get; set; } = string.Empty;
    public string RevealedKitNumber { get; set; } = string.Empty;
}
