namespace Vialiq.Validation.Tests;

public class ValidationAssemblyTests
{
    [Fact]
    public void ValidationAssembly_LoadsCleanly()
    {
        Assert.Equal("Vialiq.Validation", typeof(ValidationAssemblyMarker).Assembly.GetName().Name);
    }
}

