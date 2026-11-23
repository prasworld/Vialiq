namespace Vialiq.TenantAdmin.Api.Tests;

public class ArchitectureBoundaryTests
{
    [Fact]
    public void TenantAdminApi_MustNotReference_ProductOrSuperAdminAssemblies()
    {
        var referencedNames = typeof(Program).Assembly
            .GetReferencedAssemblies()
            .Select(a => a.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        Assert.DoesNotContain("Vialiq.Edc.Api", referencedNames);
        Assert.DoesNotContain("Vialiq.Validation", referencedNames);
        Assert.DoesNotContain("Vialiq.SuperAdmin.Api", referencedNames);
    }
}

