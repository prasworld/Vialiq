import { describe, it, expect, vi } from 'vitest';
import type { Atom } from '../kernel/types.js';
import { createAngularAdapter } from './angular.js';
import type { AngularAPIs } from './angular.js';

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

    const adapter = createAngularAdapter(apis as unknown as AngularAPIs);
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

    const adapter = createAngularAdapter(apis as unknown as AngularAPIs);
    const qSig = adapter.toQuerySignal(atom, kernel as any, (v) => v * 10);

    expect(qSig()).toBe(20);
    atom._setState(4);
    expect(qSig()).toBe(40);

    const dispatch = adapter.commandDispatcher(atom, kernel as any);
    dispatch({ _kind: 'Command', type: 'counter/inc', meta: { correlationId: 'c1', timestamp: Date.now() } });
    expect(kernel.execute).toHaveBeenCalled();
  });

  it('commandDispatcher returns the Either result from kernel.execute', () => {
    const apis = {
      inject: vi.fn(() => ({ onDestroy: (_cb: () => void) => {} })),
      signal: vi.fn((initial: number) => {
        let val = initial;
        return Object.assign(() => val, { set: (n: number) => { val = n; } });
      }),
      DestroyRef: Symbol('DestroyRef'),
    };

    const atom = createAtom('counter', 0);
    const expected = { _tag: 'Left' as const, left: { code: 'INVALID', message: 'bad' } };
    const kernel = {
      subscribe: vi.fn((a: Atom<number>, l: (v: number) => void) => a.subscribe(l)),
      execute: vi.fn(() => expected),
      query: vi.fn(),
    };

    const adapter = createAngularAdapter(apis as unknown as AngularAPIs);
    const dispatch = adapter.commandDispatcher(atom, kernel as any);
    const result = dispatch({ _kind: 'Command', type: 'counter/inc', meta: { correlationId: 'c2', timestamp: 0 } });
    expect(result).toBe(expected);
  });

  it('toSignal unsubscribes when DestroyRef onDestroy fires', () => {
    const destroyCallbacks: Array<() => void> = [];
    let signalValue = 0;

    const apis = {
      inject: vi.fn(() => ({ onDestroy: (cb: () => void) => destroyCallbacks.push(cb) })),
      signal: vi.fn((initial: number) => {
        signalValue = initial;
        return Object.assign(() => signalValue, { set: (n: number) => { signalValue = n; } });
      }),
      DestroyRef: Symbol('DestroyRef'),
    };

    const atom = createAtom('counter', 10);
    // Return the REAL atom unsub so destroying the component actually stops updates
    const kernel = {
      subscribe: vi.fn((_a: Atom<number>, l: (v: number) => void) => atom.subscribe(l)),
      execute: vi.fn(),
      query: vi.fn(),
    };

    const adapter = createAngularAdapter(apis as unknown as AngularAPIs);
    adapter.toSignal(atom, kernel as any);

    atom._setState(20);
    expect(signalValue).toBe(20);

    // Simulate component destruction — adapter registered the kernel unsub via destroyRef.onDestroy
    destroyCallbacks.forEach(cb => cb());

    // State changes after destruction should not propagate
    atom._setState(30);
    expect(signalValue).toBe(20);
  });
});
