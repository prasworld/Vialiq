namespace Vialiq.Core.Models;

/// <summary>
/// Ambient multi-tenant context resolved for the active HTTP request or background task.
/// Enforces clinical blinding isolation and protocol epoch/version partitioning.
/// </summary>
/// <param name="TenantId">The unique sponsor tenant identifier.</param>
/// <param name="StudyId">The clinical study identifier.</param>
/// <param name="Environment">The runtime environment (e.g., <c>"prod"</c>, <c>"dev"</c>, <c>"uat"</c>).</param>
/// <param name="SiteId">The optional clinical site identifier where the request originated.</param>
/// <param name="BlindingScope">The clinical blinding scope (<see cref="BlindingScope.Blinded"/> or <see cref="BlindingScope.Unblinded"/>).</param>
/// <param name="ProtocolVersion">The approved protocol amendment version (e.g., <c>"v1.2"</c>), or null for the active default version.</param>
public sealed record TenantStudyContext(
    string TenantId,
    string StudyId,
    string Environment,
    string? SiteId = null,
    BlindingScope BlindingScope = BlindingScope.Blinded,
    string? ProtocolVersion = null);
