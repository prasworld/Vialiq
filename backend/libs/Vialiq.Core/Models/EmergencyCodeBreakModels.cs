namespace Vialiq.Core.Models;

using System;

/// <summary>
/// Request model for executing an emergency unblinding code break under FDA 21 CFR Part 11.
/// Requires electronic signature re-authentication (username + password) and mandatory clinical justification.
/// </summary>
/// <param name="SubjectId">The clinical trial subject identifier to unblind.</param>
/// <param name="EmergencyReason">The acute emergency reason (e.g., adverse event, emergency surgery).</param>
/// <param name="ClinicalJustification">Detailed medical justification for breaking the double blind.</param>
/// <param name="Username">Electronic signature username for re-authentication.</param>
/// <param name="Password">Electronic signature password for re-authentication.</param>
public sealed record EmergencyCodeBreakRequest(
    string SubjectId,
    string EmergencyReason,
    string ClinicalJustification,
    string Username,
    string Password);

/// <summary>
/// Result returned following a successful emergency code break execution.
/// </summary>
/// <param name="Success">Indicates whether the code break was authorized and executed.</param>
/// <param name="SubjectId">The subject identifier.</param>
/// <param name="AssignedTreatmentArm">The revealed actual treatment arm (e.g. Active Drug 50mg or Placebo).</param>
/// <param name="KitDescription">The investigational product kit details.</param>
/// <param name="UnblindedAtUtc">The UTC timestamp when unblinding occurred.</param>
/// <param name="AuditSequence">The permanent Part 11 audit sequence assigned to this event.</param>
public sealed record EmergencyCodeBreakResult(
    bool Success,
    string SubjectId,
    string AssignedTreatmentArm,
    string KitDescription,
    DateTime UnblindedAtUtc,
    long AuditSequence);
