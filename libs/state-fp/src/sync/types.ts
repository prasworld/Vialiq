/**
 * @vi/state-fp/sync — shared types.
 *
 * All sync types live here so every other sync file can import from
 * `./types.js` and circular deps are impossible.
 */

import type { DomainEvent } from '../kernel/types.js';

// ─── Version vector ───────────────────────────────────────────────────────────

/**
 * A Lamport-style version vector: maps peerId → logical clock.
 * Incremented each time a peer produces a write.
 */
export type VersionVector = Readonly<Record<string, number>>;

// ─── Conflict strategies ──────────────────────────────────────────────────────

/** Built-in conflict strategies. */
export type ConflictStrategy =
  | 'last-write-wins'
  | 'first-write-wins'
  | 'owner-wins'
  | 'version-wins';

/** Custom resolver receives both candidate states and must return the winner. */
export type CustomConflictResolver<S> = (
  local:   { state: S; version: VersionVector; timestamp: number },
  remote:  { state: S; version: VersionVector; timestamp: number },
) => S;

/** Union of built-in strategy name or a custom resolver function. */
export type ConflictResolution<S> = ConflictStrategy | CustomConflictResolver<S>;

// ─── Share options ────────────────────────────────────────────────────────────

/** Options for sharing an atom across tabs / workers. */
export type ShareOptions<S = unknown> = {
  /** BroadcastChannel name. Defaults to the atom key. */
  channel?:   string;
  /** Conflict resolution strategy. Default: `'last-write-wins'`. */
  conflict?:  ConflictResolution<S>;
  /** Identity of the local peer. Auto-generated if not supplied. */
  peerId?:    string;
  /** Propagate storage writes to remote peers. Default: `true`. */
  propagate?: boolean;
};

// ─── Wire protocol ────────────────────────────────────────────────────────────

/** All messages broadcast over the channel carry this discriminated union. */
export type SyncMessage<S = unknown> =
  | HelloMessage
  | StateMessage<S>
  | RequestMessage
  | EventMessage;

/** Peer announces presence and its current version vector. */
export type HelloMessage = {
  readonly type:     'vi/sync/hello';
  readonly peerId:   string;
  readonly atomKey:  string;
  readonly version:  VersionVector;
  readonly ts:       number;
};

/** Peer broadcasts its full state after a write. */
export type StateMessage<S> = {
  readonly type:     'vi/sync/state';
  readonly peerId:   string;
  readonly atomKey:  string;
  readonly state:    S;
  readonly version:  VersionVector;
  readonly ts:       number;
  /** Optional: domain events that caused this state transition. */
  readonly events?:  ReadonlyArray<DomainEvent>;
};

/** Peer requests the current state from any peer who has it. */
export type RequestMessage = {
  readonly type:     'vi/sync/request';
  readonly peerId:   string;
  readonly atomKey:  string;
  readonly ts:       number;
};

/** Peer replicates individual domain events (for event-sourced sync). */
export type EventMessage = {
  readonly type:     'vi/sync/event';
  readonly peerId:   string;
  readonly atomKey:  string;
  readonly event:    DomainEvent;
  readonly ts:       number;
};

// ─── SyncState ────────────────────────────────────────────────────────────────

/** Runtime sync state tracked per atom. */
export type SyncState<S> = {
  /** Local peer identifier. */
  readonly peerId:   string;
  /** Current version vector for this atom. */
  version:           VersionVector;
  /** Whether this atom is currently connected to the channel. */
  connected:         boolean;
  /** Snapshot of remote peer version vectors (for diagnostics). */
  peers:             Map<string, VersionVector>;
  /** Number of conflicts resolved since connection. */
  conflictsResolved: number;
  /** Pending state awaiting conflict resolution (internal). */
  _pending:          S | undefined;
};
