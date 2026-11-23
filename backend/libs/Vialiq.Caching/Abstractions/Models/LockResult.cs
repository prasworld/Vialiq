namespace Vialiq.Caching.Abstractions.Models;

using System;

public sealed record LockPayload(
    string UserId,
    string FullName,
    DateTime ExpiresAtUtc);

public sealed record LockResult(
    bool IsAcquired,
    string? LockedByUserId,
    string? LockedByFullName,
    DateTime? ExpiresAtUtc)
{
    public static LockResult Acquired(DateTime expiresAtUtc) =>
        new(true, null, null, expiresAtUtc);

    public static LockResult Denied(string lockedByUserId, string lockedByFullName, DateTime expiresAtUtc) =>
        new(false, lockedByUserId, lockedByFullName, expiresAtUtc);
}
