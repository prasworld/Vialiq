namespace Vialiq.Core.Models;

using System;

public sealed record EmergencyCodeBreakRequest(
    string SubjectId,
    string EmergencyReason,
    string ClinicalJustification,
    string Username,
    string Password);

public sealed record EmergencyCodeBreakResult(
    bool Success,
    string SubjectId,
    string AssignedTreatmentArm,
    string KitDescription,
    DateTime UnblindedAtUtc,
    long AuditSequence);
