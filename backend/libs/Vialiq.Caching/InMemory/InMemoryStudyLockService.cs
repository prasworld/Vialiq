namespace Vialiq.Caching.InMemory;

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Vialiq.Caching.Abstractions;
using Vialiq.Caching.Abstractions.Models;
using Vialiq.Core.Constants;
using Vialiq.Core.Models;

/// <summary>
/// Lightweight in-memory lock coordinator for testing and offline development.
/// Thread-safe and atomic with strict tenant isolation.
/// </summary>
public sealed class InMemoryStudyLockService : IStudyLockService
{
    private readonly ConcurrentDictionary<string, LockPayload> _activeLocks = new();
    private readonly object _syncRoot = new();
    private static readonly TimeSpan LockTtl = TimeSpan.FromMinutes(15);

    private static readonly HashSet<string> AuthorizedBreakLockRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        ClinicalUserRoles.Investigator,
        ClinicalUserRoles.Crc,
        ClinicalUserRoles.Cra,
        ClinicalUserRoles.DataManager,
        ClinicalUserRoles.StudyAdmin,
        ClinicalUserRoles.SuperAdmin
    };

    /// <inheritdoc />
    public Task<LockResult> AcquireFormLockAsync(
        string studyId, 
        string crfId, 
        UserContext user, 
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(studyId);
        ArgumentException.ThrowIfNullOrWhiteSpace(crfId);
        ArgumentNullException.ThrowIfNull(user);

        var key = $"{user.TenantId}:{studyId}:{crfId}";
        var now = DateTime.UtcNow;
        var expiresAt = now.Add(LockTtl);

        lock (_syncRoot)
        {
            if (_activeLocks.TryGetValue(key, out var existing))
            {
                if (existing.ExpiresAtUtc > now && existing.UserId != user.UserId)
                {
                    return Task.FromResult(LockResult.Denied(existing.UserId, existing.FullName, existing.ExpiresAtUtc));
                }
            }

            var lockToken = Guid.NewGuid().ToString("N");
            var newLock = new LockPayload(user.UserId, user.FullName, expiresAt, lockToken);
            _activeLocks[key] = newLock;

            return Task.FromResult(LockResult.Acquired(expiresAt, lockToken));
        }
    }

    /// <inheritdoc />
    public Task ReleaseFormLockAsync(
        string studyId, 
        string crfId, 
        UserContext user, 
        string? lockToken = null,
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(studyId);
        ArgumentException.ThrowIfNullOrWhiteSpace(crfId);
        ArgumentNullException.ThrowIfNull(user);

        var key = $"{user.TenantId}:{studyId}:{crfId}";
        lock (_syncRoot)
        {
            if (_activeLocks.TryGetValue(key, out var existing) && existing.UserId == user.UserId)
            {
                if (string.IsNullOrWhiteSpace(lockToken) || existing.LockToken == lockToken)
                {
                    _activeLocks.TryRemove(key, out _);
                }
            }
        }
        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task BreakFormLockAsync(
        string studyId, 
        string crfId, 
        string auditReason, 
        UserContext user, 
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(studyId);
        ArgumentException.ThrowIfNullOrWhiteSpace(crfId);
        ArgumentNullException.ThrowIfNull(user);

        if (string.IsNullOrWhiteSpace(auditReason))
        {
            throw new ArgumentException(InfrastructureErrorMessages.AuditReasonRequired, nameof(auditReason));
        }

        if (!AuthorizedBreakLockRoles.Contains(user.Role))
        {
            throw new UnauthorizedAccessException(InfrastructureErrorMessages.UnauthorizedBreakLock(user.Role));
        }

        var key = $"{user.TenantId}:{studyId}:{crfId}";
        var now = DateTime.UtcNow;
        lock (_syncRoot)
        {
            if (_activeLocks.TryGetValue(key, out var existing) && existing.ExpiresAtUtc > now)
            {
                _activeLocks.TryRemove(key, out _);
            }
        }
        return Task.CompletedTask;
    }
}
