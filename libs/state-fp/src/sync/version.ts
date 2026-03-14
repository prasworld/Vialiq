/**
 * VersionVector utilities.
 *
 * A version vector is a map of peerId → logical clock value.
 * Used to determine causal ordering of state updates across peers.
 *
 * @example
 * ```ts
 * const v1 = createVersionVector('alice', 0);
 * const v2 = increment(v1, 'alice');
 * isConcurrent(v1, v2); // false — v2 strictly dominates
 * ```
 */

import type { VersionVector } from './types.js';

// ─── Factory ──────────────────────────────────────────────────────────────────

/** Create a new vector initialised with a single peer at a given clock value. */
export function createVersionVector(peerId: string, clock = 0): VersionVector {
  return { [peerId]: clock };
}

/** Return an empty version vector (no peers). */
export function emptyVersionVector(): VersionVector {
  return {};
}

// ─── Mutation (immutable) ─────────────────────────────────────────────────────

/** Increment the clock for `peerId` and return a new vector. */
export function increment(v: VersionVector, peerId: string): VersionVector {
  return { ...v, [peerId]: (v[peerId] ?? 0) + 1 };
}

/** Merge two vectors by taking the max clock for each peer. */
export function merge(a: VersionVector, b: VersionVector): VersionVector {
  const result: Record<string, number> = { ...a };
  for (const [peer, clock] of Object.entries(b)) {
    result[peer] = Math.max(result[peer] ?? 0, clock);
  }
  return result;
}

// ─── Ordering predicates ──────────────────────────────────────────────────────

/**
 * `isStale(local, remote)` — returns `true` when `remote` is causally prior to
 * or equal to `local` (i.e. local has already seen everything remote has).
 *
 * Formally: ∀ peer, remote[peer] ≤ local[peer].
 */
export function isStale(local: VersionVector, remote: VersionVector): boolean {
  for (const [peer, clock] of Object.entries(remote)) {
    if ((local[peer] ?? 0) < clock) return false;
  }
  return true;
}

/**
 * `isGap(local, remote)` — returns `true` when `remote` skips at least one
 * intermediate version that `local` has not seen (i.e. remote is strictly
 * ahead by more than 1 for at least one peer).
 */
export function isGap(local: VersionVector, remote: VersionVector): boolean {
  for (const [peer, clock] of Object.entries(remote)) {
    const localClock = local[peer] ?? 0;
    if (clock > localClock + 1) return true;
  }
  return false;
}

/**
 * `dominates(a, b)` — returns `true` when `a` is causally after `b`:
 * ∀ peer a[peer] ≥ b[peer] AND ∃ peer a[peer] > b[peer].
 */
export function dominates(a: VersionVector, b: VersionVector): boolean {
  const allPeers = new Set([...Object.keys(a), ...Object.keys(b)]);
  let hasStrictlyGreater = false;
  for (const peer of allPeers) {
    const av = a[peer] ?? 0;
    const bv = b[peer] ?? 0;
    if (av < bv) return false;
    if (av > bv) hasStrictlyGreater = true;
  }
  return hasStrictlyGreater;
}

/**
 * `isConcurrent(a, b)` — returns `true` when neither vector dominates the
 * other (a conflict exists).
 */
export function isConcurrent(a: VersionVector, b: VersionVector): boolean {
  return !dominates(a, b) && !dominates(b, a) && !vectorsEqual(a, b);
}

/** Deep equality of two version vectors. */
export function vectorsEqual(a: VersionVector, b: VersionVector): boolean {
  const allPeers = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const peer of allPeers) {
    if ((a[peer] ?? 0) !== (b[peer] ?? 0)) return false;
  }
  return true;
}

/** Return the sum of all clock values (useful for rough "how far ahead?" checks). */
export function clockSum(v: VersionVector): number {
  return Object.values(v).reduce((acc, c) => acc + c, 0);
}
