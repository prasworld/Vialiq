namespace Vialiq.Core.Models;

/// <summary>
/// Authenticated clinical user context (Investigator, CRC, CRA, Data Manager, Unblinded Pharmacist).
/// </summary>
/// <param name="UserId">The unique user identifier from the identity provider.</param>
/// <param name="FullName">The legal full name of the clinical user for 21 CFR Part 11 audit records.</param>
/// <param name="Email">The verified email address of the user.</param>
/// <param name="Role">The clinical role assigned to this user (e.g., Investigator, CRC, CRA).</param>
/// <param name="TenantId">The sponsor tenant organization identifier.</param>
/// <param name="BlindingScope">The user's assigned blinding scope (<see cref="BlindingScope.Blinded"/> or <see cref="BlindingScope.Unblinded"/>).</param>
public sealed record UserContext(
    string UserId,
    string FullName,
    string Email,
    string Role,
    string TenantId,
    BlindingScope BlindingScope = BlindingScope.Blinded);
