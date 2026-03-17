import { describe, it, expect } from 'vitest';
import type { Atom } from '../kernel/types.js';
import { domainEvent, command } from '../kernel/index.js';
import { createDevTools } from './devtools.js';

function createAtom<S>(key: string, initial: S): Atom<S> {
  let state = initial;
  const listeners = new Set<(value: S) => void>();
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

describe('createDevTools', () => {
  it('records execute entries and captures snapshots on schedule', () => {
    const dt = createDevTools({ installBridge: false, snapshotEvery: 1, maxLogSize: 10, maxSnapshots: 10 });
    const atom = createAtom('counter', { count: 0 });
    dt.plugin.onRegister?.(atom);

    atom._setState({ count: 1 });
    dt.plugin.onExecute?.({
      atomKey: atom.key,
      command: command('counter/inc'),
      events: [domainEvent('counter/incremented')],
      prevState: { count: 0 },
      nextState: { count: 1 },
      durationMs: 1,
    });

    expect(dt.eventLog.getAll().length).toBe(1);
    expect(dt.snapshots.list().length).toBe(1);
    expect(dt.snapshots.list()[0].state.counter).toEqual({ count: 1 });
  });

  it('exposes uninstall safely when bridge is disabled', () => {
    const dt = createDevTools({ installBridge: false });
    expect(() => dt.uninstall()).not.toThrow();
  });
});
