/**
 * Vanilla (framework-agnostic) adapter for @vi/state-fp.
 *
 * Provides a thin integration layer that wraps a `Kernel` with convenience
 * methods suitable for plain TypeScript / JavaScript projects.
 *
 * ```ts
 * import { createKernel, defineAtom } from '@vi/state-fp/kernel';
 * import { createAdapter }            from '@vi/state-fp/adapter';
 *
 * const kernel  = createKernel();
 * const counter = defineAtom({ key: 'counter', initialState: 0 });
 * const app     = createAdapter(kernel);
 *
 * // Subscribe to state changes
 * const off = app.watch(counter, state => console.log(state));
 *
 * // Execute a command
 * await app.run(counter, incrementCmd);
 *
 * // Read current state synchronously
 * const current = app.read(counter);
 *
 * // Clean up
 * off();
 * app.destroy();
 * ```
 */

import type { Kernel, Atom, Command, Query, Unsubscribe } from '../kernel/types.js';
import type { Either } from '../core/types.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type VanillaAdapter = {
  /**
   * Subscribe to state changes for `atom`.
   * The `listener` is called immediately with the current state, then on
   * every subsequent change.
   * Returns an unsubscribe function.
   */
  watch<S>(atom: Atom<S>, listener: (state: S) => void): Unsubscribe;

  /**
   * Execute a command against `atom` through the kernel.
   * Returns `Either<CommandError, DomainEvent[]>`.
   */
  run<S, C extends Command>(
    atom:    Atom<S>,
    command: C,
  ): ReturnType<Kernel['execute']>;

  /**
   * Read the current state of `atom` synchronously.
   */
  read<S>(atom: Atom<S>): S;

  /**
   * Run a query against `atom` synchronously.
   */
  query<S, Q extends Query, R>(atom: Atom<S>, q: Q): R;

  /**
   * Tear down the adapter (does NOT destroy the kernel).
   * All subscriptions created via `watch` are cleared.
   */
  destroy(): void;
};

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createAdapter(kernel: Kernel): VanillaAdapter {
  const unsubs = new Set<Unsubscribe>();

  return {
    watch<S>(atom: Atom<S>, listener: (state: S) => void): Unsubscribe {
      // Emit current state immediately
      listener(atom.get());
      const off = kernel.subscribe(atom, listener);
      const wrapped = () => {
        off();
        unsubs.delete(wrapped);
      };
      unsubs.add(wrapped);
      return wrapped;
    },

    run<S, C extends Command>(atom: Atom<S>, command: C) {
      return kernel.execute(atom, command);
    },

    read<S>(atom: Atom<S>): S {
      return atom.get();
    },

    query<S, Q extends Query, R>(atom: Atom<S>, q: Q): R {
      return kernel.query<R>(atom as Atom<unknown>, q);
    },

    destroy(): void {
      for (const off of unsubs) off();
      unsubs.clear();
    },
  };
}
