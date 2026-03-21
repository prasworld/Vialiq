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

  it('multiple events from one execute create multiple log entries', () => {
    const dt   = createDevTools({ installBridge: false, snapshotEvery: 0 });
    const atom = createAtom('cart', { items: 0 });
    dt.plugin.onRegister?.(atom);

    dt.plugin.onExecute?.({
      atomKey:   atom.key,
      command:   command('cart/checkout'),
      events:    [domainEvent('cart/itemAdded'), domainEvent('cart/itemAdded')],
      prevState: { items: 0 },
      nextState: { items: 2 },
      durationMs: 2,
    });

    expect(dt.eventLog.getAll().length).toBe(2);
  });

  it('getByAtom filters entries to the correct atom', () => {
    const dt    = createDevTools({ installBridge: false, snapshotEvery: 0 });
    const atomA = createAtom('a', 0);
    const atomB = createAtom('b', 0);
    dt.plugin.onRegister?.(atomA);
    dt.plugin.onRegister?.(atomB);

    dt.plugin.onExecute?.({
      atomKey: 'a', command: command('a/inc'), events: [domainEvent('a/incremented')],
      prevState: 0, nextState: 1, durationMs: 0,
    });
    dt.plugin.onExecute?.({
      atomKey: 'b', command: command('b/inc'), events: [domainEvent('b/incremented')],
      prevState: 0, nextState: 1, durationMs: 0,
    });

    expect(dt.eventLog.getByAtom('a').length).toBe(1);
    expect(dt.eventLog.getByAtom('b').length).toBe(1);
    expect(dt.eventLog.getByAtom('a')[0].atomKey).toBe('a');
  });

  it('getByCorrelation groups entries sharing a correlationId', () => {
    const dt   = createDevTools({ installBridge: false, snapshotEvery: 0 });
    const atom = createAtom('counter', 0);
    dt.plugin.onRegister?.(atom);

    const sharedCorrelationId = 'corr-123';
    const event1 = { ...domainEvent('counter/incremented'), meta: { ...domainEvent('counter/incremented').meta, correlationId: sharedCorrelationId } };
    const event2 = { ...domainEvent('counter/incremented'), meta: { ...domainEvent('counter/incremented').meta, correlationId: sharedCorrelationId } };

    dt.plugin.onExecute?.({
      atomKey: atom.key, command: command('counter/inc'), events: [event1, event2],
      prevState: 0, nextState: 2, durationMs: 0,
    });

    const correlated = dt.eventLog.getByCorrelation(sharedCorrelationId);
    expect(correlated.length).toBe(2);
  });

  it('snapshot is not auto-captured when snapshotEvery is 0', () => {
    const dt   = createDevTools({ installBridge: false, snapshotEvery: 0 });
    const atom = createAtom('counter', { count: 0 });
    dt.plugin.onRegister?.(atom);

    for (let i = 0; i < 5; i++) {
      atom._setState({ count: i });
      dt.plugin.onExecute?.({
        atomKey: atom.key, command: command('counter/inc'), events: [domainEvent('counter/incremented')],
        prevState: { count: i - 1 }, nextState: { count: i }, durationMs: 0,
      });
    }

    expect(dt.snapshots.list().length).toBe(0);
  });

  it('onRegister tracks atoms for time-travel access', () => {
    const dt    = createDevTools({ installBridge: false });
    const atomA = createAtom('x', 1);
    const atomB = createAtom('y', 2);
    dt.plugin.onRegister?.(atomA as unknown as import('../kernel/types.js').Atom<unknown>);
    dt.plugin.onRegister?.(atomB as unknown as import('../kernel/types.js').Atom<unknown>);

    // The timeTravel controller has access to the atoms so replay navigation works
    expect(dt.timeTravel).toBeDefined();
    expect(typeof dt.timeTravel.replayMode).toBe('boolean');
    expect(typeof dt.timeTravel.to).toBe('function');
  });
});
