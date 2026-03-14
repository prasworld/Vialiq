/**
 * TimeTravelController — navigate to any past state by replaying the event log.
 *
 * ## Algorithm
 * 1. Save current live atom states in `#preReplayState`.
 * 2. Find the nearest snapshot before the target event to reduce replay work.
 * 3. Restore the snapshot and replay events forward to the target position.
 * 4. In replay mode, `stepForward` / `stepBackward` navigate one event at a time.
 * 5. `exit()` restores the live state saved in step 1.
 *
 * ## Important invariants
 * - Storage adapters are NEVER written during replay.
 * - Atom `_setState()` is called directly (bypasses CQRS command validation).
 * - The kernel is NOT in replay mode — only atom states change.
 */

import type { Either }        from '../core/types.js';
import { left, right }        from '../core/either.js';
import { deepClone }          from '../core/utils.js';
import type { Atom }          from '../kernel/types.js';
import type { DebugEntry, TimeTravelError } from './types.js';
import type { EventLog }      from './event-log.js';
import type { SnapshotManager } from './snapshot.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimeTravelController = {
  readonly replayMode:    boolean;
  readonly replayPosition: number;

  /** Jump to the state immediately after event `id`. */
  to(eventId: string): Promise<Either<TimeTravelError, void>>;
  /** Jump to the state captured in snapshot `id`. */
  toSnapshot(snapshotId: string): Either<TimeTravelError, void>;
  /** Advance one event forward (only valid in replay mode). */
  stepForward():  Either<TimeTravelError, void>;
  /** Step one event backward (only valid in replay mode). */
  stepBackward(): Either<TimeTravelError, void>;
  /** Exit replay mode and restore the live state. */
  exit(): void;
};

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createTimeTravelController(
  getAtoms: () => Iterable<Atom<unknown>>,
  eventLog: EventLog,
  snapshots: SnapshotManager,
): TimeTravelController {
  function buildAtomMap(): Map<string, Atom<unknown>> {
    return new Map<string, Atom<unknown>>(
      [...getAtoms()].map(a => [a.key, a]),
    );
  }

  let _replayMode     = false;
  let _replayPosition = 0;
  let _preReplayState: Record<string, unknown> = {};

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function captureCurrentState(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, atom] of buildAtomMap()) {
      out[key] = deepClone(atom.get());
    }
    return out;
  }

  function applyStateRecord(record: Readonly<Record<string, unknown>>): void {
    const atomMap = buildAtomMap();
    for (const [key, state] of Object.entries(record)) {
      atomMap.get(key)?._setState(state);
    }
  }

  function applyEntry(entry: DebugEntry): void {
    const atom = buildAtomMap().get(entry.atomKey);
    if (!atom) return;
    atom._setState(entry.stateAfter);
  }

  function replayTo(
    allEvents: ReadonlyArray<DebugEntry>,
    targetIdx: number,
  ): Either<TimeTravelError, void> {
    // Try to find the nearest snapshot checkpoint
    const snapshotMaybe = snapshots.nearestBefore(targetIdx + 1);

    if (snapshotMaybe._tag === 'Just') {
      const snap = snapshotMaybe.value;
      applyStateRecord(snap.state);
      // replay events after the snapshot up to target
      for (let i = snap.eventCount; i <= targetIdx; i++) {
        if (allEvents[i]) applyEntry(allEvents[i]);
      }
    } else {
      // Reset all atoms to their initial state (unknown; approximate with index=0)
      for (const entry of allEvents.slice(0, targetIdx + 1)) {
        applyEntry(entry);
      }
    }
    return right(undefined);
  }

  // ─── Public controller ─────────────────────────────────────────────────────

  return {
    get replayMode():    boolean { return _replayMode; },
    get replayPosition(): number { return _replayPosition; },

    async to(eventId: string): Promise<Either<TimeTravelError, void>> {
      if (_replayMode) {
        return left({ code: 'REENTRANT_REPLAY', message: 'Already in replay mode — call exit() first.' });
      }

      const allEvents = [...eventLog.getAll()];
      const targetIdx = allEvents.findIndex(e => e.id === eventId);
      if (targetIdx === -1) {
        return left({ code: 'EVENT_NOT_FOUND', message: `No event with id "${eventId}" in the log.` });
      }

      _preReplayState  = captureCurrentState();
      _replayMode      = true;
      _replayPosition  = targetIdx;
      return replayTo(allEvents, targetIdx);
    },

    toSnapshot(snapshotId: string): Either<TimeTravelError, void> {
      const snap = snapshots.get(snapshotId);
      if (snap._tag === 'Nothing') {
        return left({ code: 'SNAPSHOT_NOT_FOUND', message: `No snapshot with id "${snapshotId}".` });
      }

      _preReplayState  = captureCurrentState();
      _replayMode      = true;
      _replayPosition  = snap.value.eventCount;
      applyStateRecord(snap.value.state);
      return right(undefined);
    },

    stepForward(): Either<TimeTravelError, void> {
      if (!_replayMode) return left({ code: 'UNKNOWN', message: 'Not in replay mode.' });
      const allEvents = eventLog.getAll();
      if (_replayPosition >= allEvents.length - 1) return right(undefined);
      _replayPosition++;
      applyEntry(allEvents[_replayPosition]);
      return right(undefined);
    },

    stepBackward(): Either<TimeTravelError, void> {
      if (!_replayMode) return left({ code: 'UNKNOWN', message: 'Not in replay mode.' });
      if (_replayPosition <= 0) return right(undefined);
      _replayPosition--;
      return replayTo([...eventLog.getAll()], _replayPosition);
    },

    exit(): void {
      if (!_replayMode) return;
      applyStateRecord(_preReplayState);
      _preReplayState = {};
      _replayMode     = false;
      _replayPosition = 0;
    },
  };
}
