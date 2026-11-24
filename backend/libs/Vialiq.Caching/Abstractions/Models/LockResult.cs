namespace Vialiq.Caching.Abstractions.Models;

using System;

/// <summary>
/// Lightweight Redis cache payload representing the active single-editor lease.
/// Synchronously mirrored from the MongoDB canonical source of truth for sub-millisecond fast-path verification.
/// </summary>
/// <param name="UserId">The unique identifier of the user holding the edit lease.</param>
/// <param name="FullName">The full name of the user holding the edit lease.</param>
/// <param name="ExpiresAtUtc">The UTC timestamp when this lease expires.</param>
/// <param name="LockToken">The unique fencing token associated with this lease acquisition.</param>
public sealed record LockPayload(
    string UserId,
    string FullName,
    DateTime ExpiresAtUtc,
    string? LockToken = null);

/// <summary>
/// Immutable result of a form concurrency lock acquisition attempt (ADR 003).
/// </summary>
/// <param name="IsAcquired">Indicates whether the edit lease was successfully acquired.</param>
/// <param name="LockedByUserId">The user ID of the current lock holder when acquisition is denied; otherwise null.</param>
/// <param name="LockedByFullName">The full name of the current lock holder when acquisition is denied; otherwise null.</param>
/// <param name="ExpiresAtUtc">The UTC expiration timestamp of the lease.</param>
/// <param name="LockToken">The unique fencing token issued upon successful acquisition; otherwise null.</param>
public sealed record LockResult(
    bool IsAcquired,
    string? LockedByUserId,
    string? LockedByFullName,
    DateTime? ExpiresAtUtc,
    string? LockToken = null)
{
    /// <summary>
    /// Creates a successful lock acquisition result with the specified lease expiry and optional fencing token.
    /// </summary>
    /// <param name="expiresAtUtc">The UTC timestamp when the acquired lease will expire.</param>
    /// <param name="lockToken">The unique fencing token assigned to this lease session.</param>
    /// <returns>A new <see cref="LockResult"/> instance representing successful acquisition.</returns>
    public static LockResult Acquired(DateTime expiresAtUtc, string? lockToken = null) =>
        new(true, null, null, expiresAtUtc, lockToken);

    /// <summary>
    /// Creates a denied lock result indicating the form is currently locked by another active user.
    /// </summary>
    /// <param name="lockedByUserId">The user ID of the current lock holder.</param>
    /// <param name="lockedByFullName">The full name of the current lock holder.</param>
    /// <param name="expiresAtUtc">The UTC timestamp when the existing lock expires.</param>
    /// <returns>A new <see cref="LockResult"/> instance representing denied acquisition.</returns>
    public static LockResult Denied(string lockedByUserId, string lockedByFullName, DateTime expiresAtUtc) =>
        new(false, lockedByUserId, lockedByFullName, expiresAtUtc);
}
