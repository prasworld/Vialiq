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

  it('returns REENTRANT_REPLAY error when to() is called while already in replay mode', async () => {
    const atom = createAtom('counter', { count: 0 });
    const log  = new EventLog(20);
    const snaps = new SnapshotManager(10);
    log.append(entry('e1', 'counter', { count: 1 }, 1));
    log.append(entry('e2', 'counter', { count: 2 }, 2));

    const tt = createTimeTravelController(() => [atom], log, snaps);
    await tt.to('e1'); // enters replay mode

    const result = await tt.to('e2'); // should fail
    expect(result._tag).toBe('Left');
    if (result._tag === 'Left') expect(result.left.code).toBe('REENTRANT_REPLAY');
  });

  it('toSnapshot restores snapshot state and enters replay mode', async () => {
    const atom  = createAtom('counter', { count: 99 });
    const log   = new EventLog(20);
    const snaps = new SnapshotManager(10);
    log.append(entry('e1', 'counter', { count: 1 }, 1));
    // Manually capture a snapshot at event count 1
    snaps.capture({ counter: { count: 5 } }, 'e1', 1);
    const snapId = snaps.list()[0].id;

    const tt = createTimeTravelController(() => [atom], log, snaps);
    const result = tt.toSnapshot(snapId);

    expect(result._tag).toBe('Right');
    expect(tt.replayMode).toBe(true);
    expect(atom.get()).toEqual({ count: 5 });

    tt.exit();
    expect(atom.get()).toEqual({ count: 99 }); // original restored
  });

  it('stepForward at end of log returns Right without moving', async () => {
    const atom  = createAtom('counter', { count: 0 });
    const log   = new EventLog(20);
    const snaps = new SnapshotManager(10);
    log.append(entry('e1', 'counter', { count: 1 }, 1));

    const tt = createTimeTravelController(() => [atom], log, snaps);
    await tt.to('e1');

    const result = tt.stepForward(); // already at end
    expect(result._tag).toBe('Right');
  });

  it('stepBackward at position 0 returns Right without moving', async () => {
    const atom  = createAtom('counter', { count: 0 });
    const log   = new EventLog(20);
    const snaps = new SnapshotManager(10);
    log.append(entry('e1', 'counter', { count: 1 }, 1));

    const tt = createTimeTravelController(() => [atom], log, snaps);
    await tt.to('e1');

    const result = tt.stepBackward(); // already at position 0
    expect(result._tag).toBe('Right');
  });

  it('stepForward returns UNKNOWN error when not in replay mode', () => {
    const atom  = createAtom('counter', { count: 0 });
    const log   = new EventLog(20);
    const snaps = new SnapshotManager(10);
    const tt = createTimeTravelController(() => [atom], log, snaps);

    const result = tt.stepForward();
    expect(result._tag).toBe('Left');
    if (result._tag === 'Left') expect(result.left.code).toBe('UNKNOWN');
  });

  it('stepBackward returns UNKNOWN error when not in replay mode', () => {
    const atom  = createAtom('counter', { count: 0 });
    const log   = new EventLog(20);
    const snaps = new SnapshotManager(10);
    const tt = createTimeTravelController(() => [atom], log, snaps);

    const result = tt.stepBackward();
    expect(result._tag).toBe('Left');
    if (result._tag === 'Left') expect(result.left.code).toBe('UNKNOWN');
  });

  it('exit() is a no-op when not in replay mode', async () => {
    const atom = createAtom('counter', { count: 5 });
    const log  = new EventLog(20);
    const snaps = new SnapshotManager(10);
    const tt = createTimeTravelController(() => [atom], log, snaps);

    expect(() => tt.exit()).not.toThrow();
    expect(atom.get()).toEqual({ count: 5 }); // unchanged
  });

  it('uses snapshot checkpoint to replay only remaining events', async () => {
    const atom  = createAtom('counter', { count: 0 });
    const log   = new EventLog(20);
    const snaps = new SnapshotManager(10);
    for (let i = 1; i <= 5; i++) {
      log.append(entry(`e${i}`, 'counter', { count: i }, i));
    }
    // Capture snapshot at event count 3
    snaps.capture({ counter: { count: 3 } }, 'e3', 3);

    const tt = createTimeTravelController(() => [atom], log, snaps);
    const result = await tt.to('e5');

    expect(result._tag).toBe('Right');
    expect(atom.get()).toEqual({ count: 5 });
  });
});
