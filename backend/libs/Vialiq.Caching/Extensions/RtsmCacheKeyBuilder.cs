namespace Vialiq.Caching.Extensions;

using Vialiq.Core.Models;

public static class RtsmCacheKeyBuilder
{
    private const string BlindedSegment = "blinded";
    private const string UnblindedSegment = "unblinded";

    /// <summary>
    /// Constructs role-scoped cache keys for form schemas and visit matrices.
    /// Strictly guarantees that Blinded and Unblinded users never share cache entries.
    /// </summary>
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
