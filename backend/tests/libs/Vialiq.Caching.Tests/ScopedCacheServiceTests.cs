namespace Vialiq.Caching.Tests;

using System.Threading.Tasks;
using Vialiq.Caching.Abstractions;
using Vialiq.Caching.InMemory;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models;
using Xunit;

public class ScopedCacheServiceTests
{
    private sealed class MockContextAccessor : ITenantStudyContextAccessor
    {
        public TenantStudyContext? CurrentContext { get; set; }
    }

    [Fact]
    public async Task GetOrCreateStudyAsync_WhenKeyCached_DoesNotInvokeFactorySecondTime()
    {
        // Arrange
        var contextAccessor = new MockContextAccessor
        {
            CurrentContext = new TenantStudyContext("tenant-a", "study-101", "prod")
        };
        var cache = new InMemoryScopedCacheService(contextAccessor);
        var invocationCount = 0;

        // Act
        var first = await cache.GetOrCreateStudyAsync("schema", "form-vs", _ =>
        {
            invocationCount++;
            return ValueTask.FromResult("{\"title\":\"Vital Signs\"}");
        });

        var second = await cache.GetOrCreateStudyAsync("schema", "form-vs", _ =>
        {
            invocationCount++;
            return ValueTask.FromResult("{\"title\":\"Mutated\"}");
        });

        // Assert
        Assert.Equal(1, invocationCount);
        Assert.Equal("{\"title\":\"Vital Signs\"}", first);
        Assert.Equal("{\"title\":\"Vital Signs\"}", second);
    }

    [Fact]
    public async Task GetOrCreateStudyAsync_EnforcesTenantIsolation()
    {
        // Arrange
        var contextAccessor = new MockContextAccessor
        {
            CurrentContext = new TenantStudyContext("tenant-novartis", "study-101", "prod")
        };
        var cache = new InMemoryScopedCacheService(contextAccessor);

        // Populate Tenant Novartis Cache
        await cache.GetOrCreateStudyAsync("schema", "form-vs", _ => ValueTask.FromResult("Novartis Schema"));

        // Switch Context to Tenant Roche
        contextAccessor.CurrentContext = new TenantStudyContext("tenant-roche", "study-101", "prod");

        // Act - Tenant Roche fetches same resource & key
        var rocheSchema = await cache.GetOrCreateStudyAsync("schema", "form-vs", _ => ValueTask.FromResult("Roche Schema"));

        // Assert
        Assert.Equal("Roche Schema", rocheSchema);
    }

    [Fact]
    public async Task InvalidateStudyKeyAsync_EvictsKeyAndCausesFactoryReinvocation()
    {
        // Arrange
        var contextAccessor = new MockContextAccessor
        {
            CurrentContext = new TenantStudyContext("tenant-a", "study-101", "prod")
        };
        var cache = new InMemoryScopedCacheService(contextAccessor);
        var value = "Version 1";

        await cache.GetOrCreateStudyAsync("schema", "form-vs", _ => ValueTask.FromResult(value));

        // Invalidate
        await cache.InvalidateStudyKeyAsync("schema", "form-vs");

        // Act
        value = "Version 2 (Amended)";
        var refreshed = await cache.GetOrCreateStudyAsync("schema", "form-vs", _ => ValueTask.FromResult(value));

        // Assert
        Assert.Equal("Version 2 (Amended)", refreshed);
    }
}
