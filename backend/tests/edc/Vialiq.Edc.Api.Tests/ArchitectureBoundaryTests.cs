namespace Vialiq.Edc.Api.Tests;

public class ArchitectureBoundaryTests
{
    [Fact]
    public void EdcApi_MustNotReference_ControlPlaneApiHosts()
    {
        var referencedNames = typeof(Program).Assembly
            .GetReferencedAssemblies()
            .Select(a => a.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        Assert.DoesNotContain("Vialiq.SuperAdmin.Api", referencedNames);
        Assert.DoesNotContain("Vialiq.TenantAdmin.Api", referencedNames);
    }
}

