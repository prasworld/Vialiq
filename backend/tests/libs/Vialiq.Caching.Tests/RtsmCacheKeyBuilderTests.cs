namespace Vialiq.Caching.Tests;

using Vialiq.Caching.Extensions;
using Vialiq.Core.Models;
using Xunit;

public class RtsmCacheKeyBuilderTests
{
    private const string TenantId = "roche";
    private const string StudyId = "onco-101";
    private const string Environment = "prod";
    private const string Version = "v2.0";
    private const string FormId = "pharmacy-dispensation";
    private const string BlindedExpectedKey = "vialiq:study:roche:onco-101:prod:v2.0:scope:blinded:form:pharmacy-dispensation:schema";
    private const string UnblindedExpectedKey = "vialiq:study:roche:onco-101:prod:v2.0:scope:unblinded:form:pharmacy-dispensation:schema";

    [Fact]
    public void BuildSchemaKey_ShouldProduceDisjointKeys_ForBlindedAndUnblindedRoles()
    {
        // Act
        var blindedKey = RtsmCacheKeyBuilder.BuildSchemaKey(
            TenantId, StudyId, Environment, Version, BlindingScope.Blinded, FormId);

        var unblindedKey = RtsmCacheKeyBuilder.BuildSchemaKey(
            TenantId, StudyId, Environment, Version, BlindingScope.Unblinded, FormId);

        // Assert
        Assert.NotEqual(blindedKey, unblindedKey);
        Assert.Equal(BlindedExpectedKey, blindedKey);
        Assert.Equal(UnblindedExpectedKey, unblindedKey);
    }
}
