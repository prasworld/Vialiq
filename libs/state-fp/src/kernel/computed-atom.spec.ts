/**
 * @vi/state-fp/kernel — Phase 2.5 Computed Atoms tests
 * 
 * Tests memoisation, dependency tracking, and reactive updates.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { defineAtom, defineComputedAtom, createKernel, domainEvent } from './index.js';
import type { Command, CommandHandler, EventApplier, Atom } from './types.js';

// Helper to widen Atom types for deps arrays
// Uses 'unknown as' (not 'any') to safely escape Atom<T> invariance without direct 'any' escape
function depsArray(deps: readonly unknown[]): readonly Atom<unknown>[] {
  return deps as unknown as readonly Atom<unknown>[];
}

interface CounterState {
  readonly value: number;
}

const IncrementCmd = (): Command<'counter/increment'> => ({
  _kind: 'Command' as const,
  type: 'counter/increment',
  meta: { correlationId: 'test', timestamp: Date.now() },
});

const incrementHandler: CommandHandler<CounterState> = {
  commandType: 'counter/increment',
  handle: (_state) => ({
    _tag: 'Right',
    right: [domainEvent('counter/incremented', { by: 1 })],
  }),
};

const applier: EventApplier<CounterState> = (state, event) => {
  if (event.type === 'counter/incremented') {
    const incrementEvent = event as Extract<ReturnType<typeof domainEvent>, { type: 'counter/incremented' }>;
    return { value: state.value + (incrementEvent.payload as { by: number }).by };
  }
  return state;
};

describe('Phase 2.5 — Computed Atoms', () => {
  let kernel: ReturnType<typeof createKernel>;
  let counterAtom: ReturnType<typeof defineAtom<CounterState>>;

  beforeEach(() => {
    // Create fresh atom for each test to avoid state pollution
    counterAtom = defineAtom<CounterState>({
      key: 'vi/counter',
      initialState: { value: 0 },
    });
    kernel = createKernel();
    kernel.register(counterAtom, incrementHandler, applier);
  });

  describe('initialization and registration', () => {
    it('should throw when accessing before registration', () => {
      const doubledAtom = defineComputedAtom({
        key: 'vi/doubled',
        deps: depsArray([counterAtom]),
        compute: (depStates: readonly unknown[]) => {
          const counter = depStates[0] as CounterState;
          return counter.value * 2;
        },
      });

      expect(() => doubledAtom.get()).toThrow('not initialized');
    });

    it('should compute initial value on registration', () => {
      const doubledAtom = defineComputedAtom({
        key: 'vi/doubled',
        deps: depsArray([counterAtom]),
        compute: (depStates: readonly unknown[]) => {
          const counter = depStates[0] as CounterState;
          return counter.value * 2;
        },
      });

      kernel.registerComputed(doubledAtom);
      expect(doubledAtom.get()).toBe(0);
    });
  });

  describe('basic functionality', () => {
    it('should recompute when a dependency changes', () => {
      const doubledAtom = defineComputedAtom({
        key: 'vi/doubled',
        deps: depsArray([counterAtom]),
        compute: (depStates: readonly unknown[]) => {
          const counter = depStates[0] as CounterState;
          return counter.value * 2;
        },
      });

      kernel.registerComputed(doubledAtom);
      kernel.execute(counterAtom, IncrementCmd());
      expect(doubledAtom.get()).toBe(2);

      kernel.execute(counterAtom, IncrementCmd());
      expect(doubledAtom.get()).toBe(4);
    });

    it('should notify subscribers on change', async () => {
      const doubledAtom = defineComputedAtom({
        key: 'vi/doubled',
        deps: depsArray([counterAtom]),
        compute: (depStates: readonly unknown[]) => {
          const counter = depStates[0] as CounterState;
          return counter.value * 2;
        },
      });

      kernel.registerComputed(doubledAtom);

      let callCount = 0;
      return new Promise<void>((resolve) => {
        kernel.subscribeComputed(doubledAtom, (value) => {
          callCount++;
          if (callCount === 1) {
            // subscribeComputed immediately notifies with current value
            expect(value).toBe(0);
            kernel.execute(counterAtom, IncrementCmd());
          } else if (callCount === 2) {
            expect(value).toBe(2);
            resolve();
          }
        });
      });
    });

    it('should skip notification if computed value unchanged', () => {
      let computeCount = 0;
      const evenAtom = defineComputedAtom({
        key: 'vi/is-even',
        deps: depsArray([counterAtom]),
        compute: (depStates: readonly unknown[]) => {
          computeCount++;
          const counter = depStates[0] as CounterState;
          return counter.value % 2 === 0;
        },
      });

      kernel.registerComputed(evenAtom);
      expect(computeCount).toBe(1);

      const notified: boolean[] = [];
      kernel.subscribeComputed(evenAtom, (v) => notified.push(v));

      // subscribeComputed immediately notifies with current value (true for 0)
      // Add 1 (odd)
      kernel.execute(counterAtom, IncrementCmd());
      // Add 1 (even again)
      kernel.execute(counterAtom, IncrementCmd());

      // Should be: initial 0 (even=true) + change to 1 (false/odd) + change to 2 (true/even)
      expect(notified).toEqual([true, false, true]);
      expect(computeCount).toBe(3);
    });

    it('should not recompute if dependency reference stays identical', () => {
      const stableState = { value: 0 };
      const stableAtom = defineAtom<CounterState>({
        key: 'vi/stable',
        initialState: stableState,
      });

      const noOpApplier: EventApplier<CounterState> = (state) => state;
      const noOpHandler: CommandHandler<CounterState> = {
        commandType: 'stable/noop',
        handle: () => ({ _tag: 'Right', right: [domainEvent('stable/noop', {})] }),
      };
      kernel.register(stableAtom, noOpHandler, noOpApplier);

      let computeCount = 0;
      const computed = defineComputedAtom({
        key: 'vi/stable-computed',
        deps: depsArray([stableAtom]),
        compute: () => {
          computeCount++;
          return 'ok';
        },
      });

      kernel.registerComputed(computed);
      expect(computeCount).toBe(1);

      kernel.execute(stableAtom, { _kind: 'Command', type: 'stable/noop', meta: { correlationId: 'x', timestamp: Date.now() } });
      expect(computeCount).toBe(1); // should not recompute
    });
  });

  describe('error handling', () => {
    it('should throw during registerComputed if compute fails', () => {
      const errorAtom = defineComputedAtom({
        key: 'vi/error',
        deps: depsArray([counterAtom]),
        compute: () => {
          throw new Error('Compute failed');
        },
      });

      expect(() => kernel.registerComputed(errorAtom)).toThrow('Compute failed');
    });
  });

  describe('subscription management', () => {
    it('should allow unsubscribing', () => {
      const doubledAtom = defineComputedAtom({
        key: 'vi/doubled',
        deps: depsArray([counterAtom]),
        compute: (depStates: readonly unknown[]) => {
          const counter = depStates[0] as CounterState;
          return counter.value * 2;
        },
      });

      kernel.registerComputed(doubledAtom);

      const changes: number[] = [];
      const unsub = kernel.subscribeComputed(doubledAtom, (v) => changes.push(v));

      // subscribeComputed immediately notifies with current value
      expect(changes).toEqual([0]);

      kernel.execute(counterAtom, IncrementCmd());
      expect(changes).toEqual([0, 2]);

      unsub();
      kernel.execute(counterAtom, IncrementCmd());

      // After unsubscribe, no new notifications
      expect(changes).toEqual([0, 2]);
    });

    it('should support multiple subscribers', () => {
      const sum1: number[] = [];
      const sum2: number[] = [];

      const sumAtom = defineComputedAtom({
        key: 'vi/sum',
        deps: depsArray([counterAtom]),
        compute: (depStates: readonly unknown[]) => {
          const counter = depStates[0] as CounterState;
          return counter.value + 10;
        },
      });

      kernel.registerComputed(sumAtom);

      kernel.subscribeComputed(sumAtom, (v) => sum1.push(v));
      kernel.subscribeComputed(sumAtom, (v) => sum2.push(v));

      // Both subscribers should receive initial value immediately
      expect(sum1).toEqual([10]);
      expect(sum2).toEqual([10]);

      kernel.execute(counterAtom, IncrementCmd());

      expect(sum1).toEqual([10, 11]);
      expect(sum2).toEqual([10, 11]);
    });
  });

  describe('lifecycle', () => {
    it('should preserve values across updates', () => {
      const tripleAtom = defineComputedAtom({
        key: 'vi/triple',
        deps: depsArray([counterAtom]),
        compute: (depStates: readonly unknown[]) => {
          const counter = depStates[0] as CounterState;
          return counter.value * 3;
        },
      });

      kernel.registerComputed(tripleAtom);

      for (let i = 1; i <= 5; i++) {
        kernel.execute(counterAtom, IncrementCmd());
        expect(tripleAtom.get()).toBe(i * 3);
      }
    });

    it('should clean up on kernel destroy', async () => {
      const doubledAtom = defineComputedAtom({
        key: 'vi/doubled',
        deps: depsArray([counterAtom]),
        compute: (depStates: readonly unknown[]) => {
          const counter = depStates[0] as CounterState;
          return counter.value * 2;
        },
      });

      kernel.registerComputed(doubledAtom);
      await kernel.destroy();

      // After destroy, registries are cleared but atoms still exist
      const newKernel = createKernel();
      newKernel.register(counterAtom, incrementHandler, applier);
      expect(() => newKernel.execute(counterAtom, IncrementCmd())).not.toThrow();
    });
  });
});
