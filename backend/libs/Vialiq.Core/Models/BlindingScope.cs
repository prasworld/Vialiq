namespace Vialiq.Core.Models;

/// <summary>
/// Defines clinical trial double-blind data sensitivity scope.
/// Enforces strict cache isolation and API payload masking.
/// </summary>
public enum BlindingScope
{
    /// <summary>
    /// Standard clinical investigator/coordinator scope.
    /// Confidential randomization codes, treatment arms, and investigational kit IDs are masked or hidden.
    /// </summary>
    Blinded = 1,

    /// <summary>
    /// Unblinded user scope (e.g. Unblinded Pharmacist, Data Safety Monitoring Board).
    /// Permitted to view confidential treatment arm allocations and kit descriptions.
    /// </summary>
    Unblinded = 2
}
