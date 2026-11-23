namespace Vialiq.SuperAdmin.Api.Tests;

public class ArchitectureBoundaryTests
{
    [Fact]
    public void SuperAdminApi_MustNotReference_ProductSpecificAssemblies()
    {
        var referencedNames = typeof(Program).Assembly
            .GetReferencedAssemblies()
            .Select(a => a.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        Assert.DoesNotContain("Vialiq.Edc.Api", referencedNames);
        Assert.DoesNotContain("Vialiq.Validation", referencedNames);
        Assert.DoesNotContain("Vialiq.TenantAdmin.Api", referencedNames);
    }
}

