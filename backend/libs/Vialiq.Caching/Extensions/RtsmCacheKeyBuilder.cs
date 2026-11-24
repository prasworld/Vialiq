namespace Vialiq.Caching.Extensions;

using Vialiq.Core.Models;

/// <summary>
/// Utility builder for RTSM and form schema cache keys enforcing clinical blinding scope boundaries.
/// </summary>
public static class RtsmCacheKeyBuilder
{
    private const string BlindedSegment = "blinded";
    private const string UnblindedSegment = "unblinded";

    /// <summary>
    /// Constructs role-scoped cache keys for form schemas and visit matrices.
    /// Strictly guarantees that Blinded and Unblinded users never share cache entries.
    /// </summary>
    /// <param name="tenantId">The unique tenant/sponsor identifier.</param>
    /// <param name="studyId">The clinical study identifier.</param>
    /// <param name="environment">The deployment environment (e.g., prod, dev, uat).</param>
    /// <param name="protocolVersion">The active protocol amendment version string.</param>
    /// <param name="scope">The blinding scope (<see cref="BlindingScope.Blinded"/> or <see cref="BlindingScope.Unblinded"/>).</param>
    /// <param name="formId">The unique Case Report Form identifier.</param>
    /// <returns>A colon-delimited, scope-isolated cache key string.</returns>
    public static string BuildSchemaKey(
        string tenantId,
        string studyId,
        string environment,
        string protocolVersion,
        BlindingScope scope,
        string formId)
    {
        var scopeSegment = scope == BlindingScope.Unblinded ? UnblindedSegment : BlindedSegment;
        return $"vialiq:study:{tenantId}:{studyId}:{environment}:{protocolVersion}:scope:{scopeSegment}:form:{formId}:schema";
    }
}
