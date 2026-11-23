namespace Vialiq.Core.Models;

/// <summary>
/// Ambient multi-tenant context resolved for the active HTTP request or background task.
/// </summary>
public sealed record TenantStudyContext(
    string TenantId,
    string StudyId,
    string Environment,
    string? SiteId = null);
