namespace Vialiq.Caching.Tests;

using Vialiq.Caching.Extensions;
using Vialiq.Core.Models;
using Xunit;

public class RtsmCacheKeyBuilderTests
{
    [Fact]
    public void BuildSchemaKey_ShouldProduceDisjointKeys_ForBlindedAndUnblindedRoles()
    {
        // Arrange
        const string tenantId = "roche";
        const string studyId = "onco-101";
        const string version = "v2.0";
        const string formId = "pharmacy-dispensation";

        // Act
        var blindedKey = RtsmCacheKeyBuilder.BuildSchemaKey(
            tenantId, studyId, version, BlindingScope.Blinded, formId);

        var unblindedKey = RtsmCacheKeyBuilder.BuildSchemaKey(
            tenantId, studyId, version, BlindingScope.Unblinded, formId);

        // Assert
        Assert.NotEqual(blindedKey, unblindedKey);
        Assert.Equal("vialiq:study:roche:onco-101:v2.0:scope:blinded:form:pharmacy-dispensation:schema", blindedKey);
        Assert.Equal("vialiq:study:roche:onco-101:v2.0:scope:unblinded:form:pharmacy-dispensation:schema", unblindedKey);
    }
}
