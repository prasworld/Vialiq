import { describe, it, expect, vi } from 'vitest';
import type { Atom } from '../kernel/types.js';
import { createAdapter } from './vanilla.js';

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

describe('createAdapter', () => {
  it('watch emits immediately and unsubscribes on destroy', () => {
    const atom = createAtom('counter', 1);
    const off = vi.fn();
    const kernel = {
      subscribe: vi.fn((_atom: Atom<number>, listener: (value: number) => void) => {
        atom.subscribe(listener);
        return off;
      }),
      execute: vi.fn(),
      query: vi.fn(),
    };

    const adapter = createAdapter(kernel as any);
    const seen: number[] = [];
    const unwatch = adapter.watch(atom, (v) => seen.push(v));

    expect(seen).toEqual([1]);
    atom._setState(2);
    expect(seen).toEqual([1, 2]);

    unwatch();
    expect(off).toHaveBeenCalled();

    adapter.destroy();
  });

  it('proxies run/read/query calls to kernel and atom', () => {
    const atom = createAtom('counter', 5);
    const kernel = {
      subscribe: vi.fn(),
      execute: vi.fn(() => ({ _tag: 'Right', right: [] })),
      query: vi.fn(() => 50),
    };

    const adapter = createAdapter(kernel as any);
    const cmd = { _kind: 'Command', type: 'counter/inc', meta: { correlationId: 'c1', timestamp: Date.now() } };
    const q = { _kind: 'Query', type: 'counter/value' };

    adapter.run(atom, cmd as any);
    expect(kernel.execute).toHaveBeenCalledWith(atom, cmd);
    expect(adapter.read(atom)).toBe(5);
    expect(adapter.query(atom, q as any)).toBe(50);
  });

  it('destroy() clears all active watch subscriptions', () => {
    const atom = createAtom('counter', 0);
    const off1 = vi.fn();
    const off2 = vi.fn();
    let callCount = 0;
    const kernel = {
      subscribe: vi.fn(() => (++callCount === 1 ? off1 : off2)),
      execute: vi.fn(),
      query: vi.fn(),
    };

    const adapter = createAdapter(kernel as any);
    adapter.watch(atom, () => {});
    adapter.watch(atom, () => {});

    adapter.destroy();
    expect(off1).toHaveBeenCalledTimes(1);
    expect(off2).toHaveBeenCalledTimes(1);
  });

  it('individual unwatch removes only that subscription from the set', () => {
    const atomA = createAtom('a', 1);
    const atomB = createAtom('b', 2);
    const offA = vi.fn();
    const offB = vi.fn();
    let idx = 0;
    const offs = [offA, offB];
    const kernel = {
      subscribe: vi.fn(() => offs[idx++]),
      execute: vi.fn(),
      query: vi.fn(),
    };

    const adapter = createAdapter(kernel as any);
    const unwatchA = adapter.watch(atomA, () => {});
    adapter.watch(atomB, () => {});

    unwatchA();
    expect(offA).toHaveBeenCalledTimes(1);

    // destroy should only trigger the remaining (B) subscription
    adapter.destroy();
    expect(offB).toHaveBeenCalledTimes(1);
    // offA not called a second time
    expect(offA).toHaveBeenCalledTimes(1);
  });

  it('run() returns the Either result from kernel.execute', () => {
    const atom = createAtom('counter', 0);
    const expected = { _tag: 'Left', left: { code: 'INVALID', message: 'bad' } };
    const kernel = {
      subscribe: vi.fn(),
      execute: vi.fn(() => expected),
      query: vi.fn(),
    };

    const adapter = createAdapter(kernel as any);
    const cmd = { _kind: 'Command', type: 'counter/inc', meta: { correlationId: 'c1', timestamp: 0 } };
    const result = adapter.run(atom, cmd as any);
    expect(result).toBe(expected);
  });
});
