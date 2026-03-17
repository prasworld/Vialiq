import { describe, it, expect } from 'vitest';
import type { Atom } from '../kernel/types.js';
import type { DebugEntry } from './types.js';
import { EventLog } from './event-log.js';
import { SnapshotManager } from './snapshot.js';
import { createTimeTravelController } from './time-travel.js';

function createAtom<S>(key: string, initial: S): Atom<S> {
  let state = initial;
  const listeners = new Set<(v: S) => void>();
  return {
    definition: { key, initialState: initial },
    key,
    get: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    get version() {
      return 0;
    },
    _setState: (next) => {
      state = next;
      listeners.forEach(fn => fn(next));
    },
  };
}

function entry(id: string, atomKey: string, after: unknown, version: number): DebugEntry {
  return {
    id,
    atomKey,
    correlationId: 'corr',
    causationId: 'cause',
    commandType: 'counter/inc',
    event: {
      _kind: 'DomainEvent',
      type: 'counter/incremented',
      meta: {
        id: `ev-${id}`,
        correlationId: 'corr',
        causationId: 'cause',
        atomKey,
        timestamp: version,
        version,
      },
    },
    stateBefore: { count: version - 1 },
    stateAfter: after,
    timestamp: version,
    version,
  };
}

describe('TimeTravelController', () => {
  it('jumps to an event and restores original state on exit', async () => {
    const atom = createAtom('counter', { count: 10 });
    const log = new EventLog(20);
    const snaps = new SnapshotManager(10);
    log.append(entry('e1', 'counter', { count: 1 }, 1));
    log.append(entry('e2', 'counter', { count: 2 }, 2));

    const tt = createTimeTravelController(() => [atom], log, snaps);
    const result = await tt.to('e1');

    expect(result._tag).toBe('Right');
    expect(tt.replayMode).toBe(true);
    expect(atom.get()).toEqual({ count: 1 });

    tt.exit();
    expect(tt.replayMode).toBe(false);
    expect(atom.get()).toEqual({ count: 10 });
  });

  it('supports stepForward and stepBackward in replay mode', async () => {
    const atom = createAtom('counter', { count: 0 });
    const log = new EventLog(20);
    const snaps = new SnapshotManager(10);
    log.append(entry('e1', 'counter', { count: 1 }, 1));
    log.append(entry('e2', 'counter', { count: 2 }, 2));
    log.append(entry('e3', 'counter', { count: 3 }, 3));

    const tt = createTimeTravelController(() => [atom], log, snaps);
    await tt.to('e1');

    expect(tt.stepForward()._tag).toBe('Right');
    expect(atom.get()).toEqual({ count: 2 });

    expect(tt.stepBackward()._tag).toBe('Right');
    expect(atom.get()).toEqual({ count: 1 });
  });

  it('returns typed errors for unknown event and unknown snapshot', async () => {
    const atom = createAtom('counter', { count: 0 });
    const log = new EventLog(5);
    const snaps = new SnapshotManager(5);
    const tt = createTimeTravelController(() => [atom], log, snaps);

    const eventErr = await tt.to('missing');
    expect(eventErr._tag).toBe('Left');
    if (eventErr._tag === 'Left') expect(eventErr.left.code).toBe('EVENT_NOT_FOUND');

    const snapErr = tt.toSnapshot('missing');
    expect(snapErr._tag).toBe('Left');
    if (snapErr._tag === 'Left') expect(snapErr.left.code).toBe('SNAPSHOT_NOT_FOUND');
  });
});
