/**
 * @vi/state-fp/devtools — shared types.
 *
 * Standalone type definitions for the devtools module.
 * Other devtools files import from here to avoid circular dependencies.
 */

import type { DomainEvent } from '../kernel/types.js';
import type { Maybe }       from '../core/types.js';

// ─── Debug entry ─────────────────────────────────────────────────────────────

/**
 * A single entry in the debug event log.
 * Records the full before/after state transition with its causing event.
 */
export type DebugEntry = {
  readonly id:            string;
  readonly atomKey:       string;
  readonly correlationId: string;
  readonly causationId:   string | undefined;
  readonly commandType:   string | undefined;
  readonly event:         DomainEvent;
  readonly stateBefore:   unknown;
  readonly stateAfter:    unknown;
  readonly timestamp:     number;
  readonly version:       number;
};

// ─── Snapshot ────────────────────────────────────────────────────────────────

/**
 * A point-in-time snapshot of all atom states.
 * Used for time-travel navigation and crash reporting.
 */
export type Snapshot = {
  readonly id:             string;
  /** Wall-clock time when the snapshot was taken. */
  readonly timestamp:      number;
  /** Total event count in the log at the time of capture. */
  readonly eventCount:     number;
  /** The event id that triggered the capture (`undefined` for manual snapshots). */
  readonly triggerEventId: string | undefined;
  /** Deep-frozen copy of each atom's state, keyed by atom key. */
  readonly state:          Readonly<Record<string, unknown>>;
  /** Optional human label. */
  readonly label:          string | undefined;
};

// ─── Time-travel ─────────────────────────────────────────────────────────────

export type TimeTravelError = {
  code:    'EVENT_NOT_FOUND' | 'SNAPSHOT_NOT_FOUND' | 'REENTRANT_REPLAY' | 'UNKNOWN';
  message: string;
};

// ─── DevTools bridge ─────────────────────────────────────────────────────────

/** The object attached to `window.__VI_STATE_FP__` when the bridge is installed. */
export type DevToolsBridge = {
  /** All entries in the event log, oldest-first. */
  getLog():               ReadonlyArray<DebugEntry>;
  /** Current state of every registered atom, keyed by atom key. */
  getAtoms():             Record<string, unknown>;
  /** Apply the state from the log entry with the given id. */
  timeTravelTo(id: string): Promise<void>;
  /** Serialize the full log to a JSON string. */
  exportLog():            string;
  /** Restore the log from a previously exported JSON string. */
  importLog(json: string): void;
  /** Version of the bridge protocol. */
  readonly version:       string;
};

// ─── Public interface of EventLog ────────────────────────────────────────────

export type EventLogInterface = {
  append(entry: DebugEntry): void;
  getAll():                   ReadonlyArray<DebugEntry>;
  getByAtom(key: string):     ReadonlyArray<DebugEntry>;
  getByCorrelation(id: string): ReadonlyArray<DebugEntry>;
  getByTimeRange(from: number, to: number): ReadonlyArray<DebugEntry>;
  last(n: number):            ReadonlyArray<DebugEntry>;
  latest():                   Maybe<DebugEntry>;
  clear():                    void;
  readonly totalCount:        number;
};

// ─── Public interface of SnapshotManager ─────────────────────────────────────

export type SnapshotManagerInterface = {
  capture(
    atomStates:      Record<string, unknown>,
    triggerEventId:  string | undefined,
    totalEventCount: number,
    label?:          string,
  ): Snapshot;
  list():                ReadonlyArray<Snapshot>;
  get(id: string):       Maybe<Snapshot>;
  nearestBefore(eventCount: number): Maybe<Snapshot>;
  prune(keepLast: number): void;
  export():              string;
  import(json: string):  void;
};

// ─── DevTools plugin options ──────────────────────────────────────────────────

export type DevToolsOptions = {
  /** Max entries kept in the circular event log buffer. Default: `500`. */
  maxLogSize?:     number;
  /** Max snapshots kept. Default: `30`. */
  maxSnapshots?:   number;
  /** How often (in event count) to auto-snapshot. `0` = never. Default: `50`. */
  snapshotEvery?:  number;
  /** Whether to install the `window.__VI_STATE_FP__` bridge. Default: `true` if window available. */
  installBridge?:  boolean;
};
