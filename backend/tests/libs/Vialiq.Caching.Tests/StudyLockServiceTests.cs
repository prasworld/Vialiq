namespace Vialiq.Caching.Tests;

using System;
using System.Threading.Tasks;
using Vialiq.Caching.Abstractions;
using Vialiq.Caching.InMemory;
using Vialiq.Core.Constants;
using Vialiq.Core.Models;
using Xunit;

public class StudyLockServiceTests
{
    private readonly IStudyLockService _lockService = new InMemoryStudyLockService();

    private readonly UserContext _user1 = new(
        UserId: "user-crc-001",
        FullName: "Dr. Alice Smith",
        Email: "alice@site101.org",
        Role: ClinicalUserRoles.Investigator,
        TenantId: "tenant-novartis"
    );

    private readonly UserContext _user2 = new(
        UserId: "user-crc-002",
        FullName: "Bob Jones, CRC",
        Email: "bob@site101.org",
        Role: ClinicalUserRoles.Crc,
        TenantId: "tenant-novartis"
    );

    private readonly UserContext _unauthorizedUser = new(
        UserId: "user-auditor-001",
        FullName: "Auditor John",
        Email: "auditor@compliance.org",
        Role: ClinicalUserRoles.Auditor,
        TenantId: "tenant-novartis"
    );

    private readonly UserContext _differentTenantUser = new(
        UserId: "user-roche-001",
        FullName: "Dr. Carol Danvers",
        Email: "carol@roche-site.org",
        Role: ClinicalUserRoles.Investigator,
        TenantId: "tenant-roche"
    );

    [Fact]
    public async Task AcquireFormLockAsync_WhenFree_AcquiresSuccessfully()
    {
        // Act
        var result = await _lockService.AcquireFormLockAsync("study-101", "crf-vitals-01", _user1);

        // Assert
        Assert.True(result.IsAcquired);
        Assert.NotNull(result.ExpiresAtUtc);
        Assert.Null(result.LockedByUserId);
    }

    [Fact]
    public async Task AcquireFormLockAsync_WhenHeldByAnotherUser_DeniesAccessWithLockHolderInfo()
    {
        // Arrange
        await _lockService.AcquireFormLockAsync("study-101", "crf-vitals-01", _user1);

        // Act
        var result = await _lockService.AcquireFormLockAsync("study-101", "crf-vitals-01", _user2);

        // Assert
        Assert.False(result.IsAcquired);
        Assert.Equal(_user1.UserId, result.LockedByUserId);
        Assert.Equal(_user1.FullName, result.LockedByFullName);
    }

    [Fact]
    public async Task AcquireFormLockAsync_DifferentTenants_DoNotBlockEachOther()
    {
        // Arrange - User 1 in Tenant Novartis acquires lock
        var result1 = await _lockService.AcquireFormLockAsync("study-101", "crf-vitals-01", _user1);
        Assert.True(result1.IsAcquired);

        // Act - User in Tenant Roche acquires the exact same study and CRF ID
        var resultRoche = await _lockService.AcquireFormLockAsync("study-101", "crf-vitals-01", _differentTenantUser);

        // Assert - Both should succeed because they are in different tenants
        Assert.True(resultRoche.IsAcquired);
    }

    [Fact]
    public async Task ReleaseFormLockAsync_AllowsAnotherUserToAcquire()
    {
        // Arrange
        await _lockService.AcquireFormLockAsync("study-101", "crf-vitals-01", _user1);
        await _lockService.ReleaseFormLockAsync("study-101", "crf-vitals-01", _user1);

        // Act
        var result = await _lockService.AcquireFormLockAsync("study-101", "crf-vitals-01", _user2);

        // Assert
        Assert.True(result.IsAcquired);
    }

    [Fact]
    public async Task BreakFormLockAsync_WithoutReason_ThrowsArgumentException()
    {
        // Arrange
        await _lockService.AcquireFormLockAsync("study-101", "crf-vitals-01", _user1);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() =>
            _lockService.BreakFormLockAsync("study-101", "crf-vitals-01", "", _user2));
    }

    [Fact]
    public async Task BreakFormLockAsync_UnauthorizedRole_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        await _lockService.AcquireFormLockAsync("study-101", "crf-vitals-01", _user1);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _lockService.BreakFormLockAsync("study-101", "crf-vitals-01", "Valid audit reason here", _unauthorizedUser));
    }

    [Fact]
    public async Task BreakFormLockAsync_WithValidPart11Reason_BreaksLockAndAllowsAcquisition()
    {
        // Arrange
        await _lockService.AcquireFormLockAsync("study-101", "crf-vitals-01", _user1);

        // Act
        await _lockService.BreakFormLockAsync(
            "study-101", 
            "crf-vitals-01", 
            "Investigator uncontactable; urgent safety visit data entry required.", 
            _user2);

        var result = await _lockService.AcquireFormLockAsync("study-101", "crf-vitals-01", _user2);

        // Assert
        Assert.True(result.IsAcquired);
    }
}
