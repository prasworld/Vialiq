namespace Vialiq.Caching.Extensions;

using Vialiq.Core.Models;

public static class RtsmCacheKeyBuilder
{
    /// <summary>
    /// Constructs role-scoped cache keys for form schemas and visit matrices.
    /// Strictly guarantees that Blinded and Unblinded users never share cache entries.
    /// </summary>
    public static string BuildSchemaKey(
        string tenantId,
        string studyId,
        string protocolVersion,
        BlindingScope scope,
        string formId)
    {
        var scopeSegment = scope == BlindingScope.Unblinded ? "unblinded" : "blinded";
        return $"vialiq:study:{tenantId}:{studyId}:{protocolVersion}:scope:{scopeSegment}:form:{formId}:schema";
    }
}
