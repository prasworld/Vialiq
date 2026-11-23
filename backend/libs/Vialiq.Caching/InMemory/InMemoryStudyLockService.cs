namespace Vialiq.Caching.InMemory;

using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using Vialiq.Caching.Abstractions;
using Vialiq.Caching.Abstractions.Models;
using Vialiq.Core.Models;

/// <summary>
/// Lightweight in-memory lock coordinator for testing and offline development.
/// </summary>
public sealed class InMemoryStudyLockService : IStudyLockService
{
    private readonly ConcurrentDictionary<string, LockPayload> _activeLocks = new();
    private static readonly TimeSpan LockTtl = TimeSpan.FromMinutes(15);

    public Task<LockResult> AcquireFormLockAsync(
        string studyId, 
        string crfId, 
        UserContext user, 
        CancellationToken ct = default)
    {
        var key = $"{studyId}:{crfId}";
        var now = DateTime.UtcNow;
        var expiresAt = now.Add(LockTtl);

        if (_activeLocks.TryGetValue(key, out var existing))
        {
            if (existing.ExpiresAtUtc > now && existing.UserId != user.UserId)
            {
                return Task.FromResult(LockResult.Denied(existing.UserId, existing.FullName, existing.ExpiresAtUtc));
            }
        }

        var newLock = new LockPayload(user.UserId, user.FullName, expiresAt);
        _activeLocks[key] = newLock;

        return Task.FromResult(LockResult.Acquired(expiresAt));
    }

    public Task ReleaseFormLockAsync(
        string studyId, 
        string crfId, 
        UserContext user, 
        CancellationToken ct = default)
    {
        var key = $"{studyId}:{crfId}";
        if (_activeLocks.TryGetValue(key, out var existing) && existing.UserId == user.UserId)
        {
            _activeLocks.TryRemove(key, out _);
        }
        return Task.CompletedTask;
    }

    public Task BreakFormLockAsync(
        string studyId, 
        string crfId, 
        string auditReason, 
        UserContext user, 
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(auditReason))
        {
            throw new ArgumentException("A mandatory 21 CFR Part 11 audit reason is required to break a form lock.", nameof(auditReason));
        }

        var key = $"{studyId}:{crfId}";
        _activeLocks.TryRemove(key, out _);
        return Task.CompletedTask;
    }
}
