/**
 * Conflict resolution strategies.
 *
 * When two peers produce concurrent writes (neither causally dominates), a
 * resolution strategy picks the winner deterministically.
 *
 * All built-in strategies are pure functions with no side effects.
 */

import type { VersionVector, ConflictResolution } from './types.js';
import { dominates, clockSum } from './version.js';

// ─── Candidate type ───────────────────────────────────────────────────────────

export type Candidate<S> = {
  state:     S;
  version:   VersionVector;
  timestamp: number;
  /** Peer that produced this state. */
  peerId?:   string;
};

// ─── Built-in resolvers ───────────────────────────────────────────────────────

/**
 * Last-Write-Wins — the candidate with the higher wall-clock timestamp wins.
 * Ties are broken by lexicographic peerId comparison (deterministic across peers).
 */
export function lastWriteWins<S>(local: Candidate<S>, remote: Candidate<S>): S {
  if (remote.timestamp > local.timestamp) return remote.state;
  if (remote.timestamp < local.timestamp) return local.state;
  // tie-break by peerId
  if ((remote.peerId ?? '') > (local.peerId ?? '')) return remote.state;
  return local.state;
}

/**
 * First-Write-Wins — the candidate with the lower wall-clock timestamp wins.
 */
export function firstWriteWins<S>(local: Candidate<S>, remote: Candidate<S>): S {
  if (remote.timestamp < local.timestamp) return remote.state;
  if (remote.timestamp > local.timestamp) return local.state;
  if ((remote.peerId ?? '') < (local.peerId ?? '')) return remote.state;
  return local.state;
}

/**
 * Owner-Wins — local state always wins in a conflict.
 * Suitable for authoritative-owner models (e.g. the host tab owns the state).
 */
export function ownerWins<S>(local: Candidate<S>, _remote: Candidate<S>): S {
  return local.state;
}

/**
 * Version-Wins — the candidate whose version vector has the higher total clock
 * sum wins. If equal, falls back to last-write-wins.
 */
export function versionWins<S>(local: Candidate<S>, remote: Candidate<S>): S {
  if (dominates(remote.version, local.version)) return remote.state;
  if (dominates(local.version,  remote.version)) return local.state;
  const remoteSum = clockSum(remote.version);
  const localSum  = clockSum(local.version);
  if (remoteSum > localSum) return remote.state;
  if (remoteSum < localSum) return local.state;
  return lastWriteWins(local, remote);
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

/**
 * Apply a `ConflictResolution<S>` to resolve a conflict between two candidates.
 * Returns the winning state.
 */
export function resolveConflict<S>(
  strategy: ConflictResolution<S>,
  local:    Candidate<S>,
  remote:   Candidate<S>,
): S {
  if (typeof strategy === 'function') {
    return strategy(local, remote);
  }
  switch (strategy) {
    case 'last-write-wins':  return lastWriteWins(local, remote);
    case 'first-write-wins': return firstWriteWins(local, remote);
    case 'owner-wins':       return ownerWins(local, remote);
    case 'version-wins':     return versionWins(local, remote);
    default: throw new Error(`[@vi/state-fp/sync] Unknown conflict strategy: "${String(strategy)}"`);
  }
}
