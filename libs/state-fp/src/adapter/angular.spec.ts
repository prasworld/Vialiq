import { describe, it, expect, vi } from 'vitest';
import type { Atom } from '../kernel/types.js';
import { createAngularAdapter } from './angular.js';

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

describe('createAngularAdapter', () => {
  it('binds atom state to signal and unsubscribes via DestroyRef', () => {
    const destroyCallbacks: Array<() => void> = [];
    let signalValue = 0;

    const apis = {
      inject: vi.fn(() => ({ onDestroy: (cb: () => void) => destroyCallbacks.push(cb) })),
      signal: vi.fn((initial: number) => {
        signalValue = initial;
        return Object.assign(() => signalValue, {
          set: (next: number) => {
            signalValue = next;
          },
        });
      }),
      DestroyRef: Symbol('DestroyRef'),
    };

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

    const adapter = createAngularAdapter(apis);
    const sig = adapter.toSignal(atom, kernel as any);

    expect(sig()).toBe(1);
    atom._setState(3);
    expect(sig()).toBe(3);

    destroyCallbacks[0]?.();
    expect(off).toHaveBeenCalled();
  });

  it('creates query signals and dispatchers', () => {
    const destroyCallbacks: Array<() => void> = [];
    let signalValue = 0;

    const apis = {
      inject: vi.fn(() => ({ onDestroy: (cb: () => void) => destroyCallbacks.push(cb) })),
      signal: vi.fn((initial: number) => {
        signalValue = initial;
        return Object.assign(() => signalValue, {
          set: (next: number) => {
            signalValue = next;
          },
        });
      }),
      DestroyRef: Symbol('DestroyRef'),
    };

    const atom = createAtom('counter', 2);
    const kernel = {
      subscribe: vi.fn((a: Atom<number>, listener: (value: number) => void) => a.subscribe(listener)),
      execute: vi.fn(() => ({ _tag: 'Right', right: [] })),
      query: vi.fn(),
    };

    const adapter = createAngularAdapter(apis);
    const qSig = adapter.toQuerySignal(atom, kernel as any, (v) => v * 10);

    expect(qSig()).toBe(20);
    atom._setState(4);
    expect(qSig()).toBe(40);

    const dispatch = adapter.commandDispatcher(atom, kernel as any);
    dispatch({ _kind: 'Command', type: 'counter/inc', meta: { correlationId: 'c1', timestamp: Date.now() } });
    expect(kernel.execute).toHaveBeenCalled();
  });
});
