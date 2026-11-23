namespace Vialiq.Core.Models;

/// <summary>
/// Authenticated clinical user context (Investigator, CRC, CRA, Data Manager, Unblinded Pharmacist).
/// </summary>
public sealed record UserContext(
    string UserId,
    string FullName,
    string Email,
    string Role,
    string TenantId,
    BlindingScope BlindingScope = BlindingScope.Blinded);
