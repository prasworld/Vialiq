/**
 * SnapshotManager — takes and stores point-in-time state snapshots.
 *
 * Snapshots are used by the time-travel controller to avoid replaying the
 * entire event log from the beginning; instead it finds the nearest snapshot
 * and replays only the delta.
 */

import type { Snapshot, SnapshotManagerInterface } from './types.js';
import type { Maybe } from '../core/types.js';
import { just, nothing } from '../core/maybe.js';
import { deepClone, uuid, now } from '../core/utils.js';

export class SnapshotManager implements SnapshotManagerInterface {
  readonly #snapshots:     Snapshot[] = [];
  readonly #maxSnapshots:  number;

  constructor(maxSnapshots = 30) {
    this.#maxSnapshots = maxSnapshots;
  }

  /**
   * Capture the current state of all atoms.
   *
   * @param atomStates       - Map of atomKey → current state (caller provides)
   * @param triggerEventId   - The event id that triggered this capture
   * @param totalEventCount  - Total event count in the log at capture time
   * @param label            - Optional human-readable label
   */
  capture(
    atomStates:      Record<string, unknown>,
    triggerEventId:  string | undefined,
    totalEventCount: number,
    label?:          string,
  ): Snapshot {
    const frozen: Record<string, unknown> = {};
    for (const [key, state] of Object.entries(atomStates)) {
      frozen[key] = deepClone(state);
    }

    const snapshot: Snapshot = Object.freeze({
      id:             uuid(),
      timestamp:      now(),
      eventCount:     totalEventCount,
      triggerEventId,
      state:          Object.freeze(frozen),
      label,
    });

    this.#snapshots.push(snapshot);
    this.prune(this.#maxSnapshots);
    return snapshot;
  }

  list(): ReadonlyArray<Snapshot> {
    return [...this.#snapshots];
  }

  get(id: string): Maybe<Snapshot> {
    const found = this.#snapshots.find(s => s.id === id);
    return found ? just(found) : nothing();
  }

  /**
   * Find the most recent snapshot whose `eventCount` is ≤ `eventCount`.
   * Used by the time-travel controller to start replay from a checkpoint.
   */
  nearestBefore(eventCount: number): Maybe<Snapshot> {
    let best: Snapshot | undefined;
    for (const s of this.#snapshots) {
      if (s.eventCount <= eventCount) best = s;
      else break;
    }
    return best ? just(best) : nothing();
  }

  /** Evict oldest snapshots, keeping at most `keepLast`. */
  prune(keepLast: number): void {
    if (this.#snapshots.length > keepLast) {
      this.#snapshots.splice(0, this.#snapshots.length - keepLast);
    }
  }

  /** Serialize the snapshot list as a JSON string. */
  export(): string {
    return JSON.stringify(this.#snapshots, null, 2);
  }

  /** Replace the snapshot list from a previously exported JSON string. */
  import(json: string): void {
    const parsed: Snapshot[] = JSON.parse(json);
    this.#snapshots.length = 0;
    this.#snapshots.push(...parsed);
  }
}
