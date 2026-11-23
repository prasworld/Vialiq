namespace Vialiq.Caching.Tests;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Vialiq.Caching.InMemory;
using Vialiq.Core.Models;
using Xunit;

public class ProtocolWarmupServiceTests
{
    [Fact]
    public async Task PreWarmAmendmentCacheAsync_PreWarmsOnlyModifiedForms()
    {
        // Arrange
        var warmupService = new InMemoryProtocolWarmupService();
        var manifest = new ProtocolAmendmentManifest(
            AmendmentId: "AMEND-003",
            TenantId: "tenant-novartis",
            StudyId: "onco-101",
            TargetVersion: "v3.0",
            ModifiedFormIds: new List<string> { "form_vitals", "form_labs" },
            ModifiedVisitIds: new List<string> { "visit_wk4" },
            ModifiedCodelistIds: new List<string>()
        );

        // Act
        await warmupService.PreWarmAmendmentCacheAsync(
            manifest, 
            formId => Task.FromResult($"{{\"formId\":\"{formId}\",\"version\":\"v3.0\"}}"));

        // Assert
        Assert.Equal(2, warmupService.WarmedCache.Count);
        Assert.True(warmupService.WarmedCache.ContainsKey("study:tenant-novartis:onco-101:v3.0:schema:form_vitals"));
        Assert.True(warmupService.WarmedCache.ContainsKey("study:tenant-novartis:onco-101:v3.0:schema:form_labs"));
        Assert.Equal("{\"formId\":\"form_vitals\",\"version\":\"v3.0\"}", 
            warmupService.WarmedCache["study:tenant-novartis:onco-101:v3.0:schema:form_vitals"]);
    }

    [Fact]
    public async Task EvictAbortedAmendmentCacheAsync_EvictsPreWarmedTargetVersionKeys()
    {
        // Arrange
        var warmupService = new InMemoryProtocolWarmupService();
        var manifest = new ProtocolAmendmentManifest(
            AmendmentId: "AMEND-003",
            TenantId: "tenant-novartis",
            StudyId: "onco-101",
            TargetVersion: "v3.0",
            ModifiedFormIds: new List<string> { "form_vitals", "form_labs" },
            ModifiedVisitIds: new List<string>(),
            ModifiedCodelistIds: new List<string>()
        );

        // Pre-warm
        await warmupService.PreWarmAmendmentCacheAsync(
            manifest, 
            formId => Task.FromResult($"{{\"formId\":\"{formId}\"}}"));

        Assert.Equal(2, warmupService.WarmedCache.Count);

        // Act - Lead CRA rejects the amendment before study is unlocked
        await warmupService.EvictAbortedAmendmentCacheAsync(manifest);

        // Assert - Aborted keys are evicted
        Assert.Empty(warmupService.WarmedCache);
    }
}
