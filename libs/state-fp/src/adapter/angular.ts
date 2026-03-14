/**
 * Angular adapter for @vi/state-fp.
 *
 * Uses a **dependency-injection factory pattern** — consumers pass Angular
 * primitives rather than this library importing `@angular/core`. This gives:
 *
 * - Zero compile-time dependency on Angular in the state-fp library
 * - Full testability: mock `AngularAPIs` in unit tests, no Angular TestBed needed
 * - Framework-agnostic core: the same Kernel works with any Signal library
 *
 * ## Setup (Angular 17+ with Signals)
 *
 * ```ts
 * // src/app/state.ts
 * import { signal, inject, DestroyRef } from '@angular/core';
 * import { createAngularAdapter }       from '@vi/state-fp/adapter';
 *
 * export const ngAdapter = createAngularAdapter({ signal, inject, DestroyRef });
 * ```
 *
 * ## Component usage
 *
 * ```ts
 * import { InjectionToken, inject } from '@angular/core';
 * import { ngAdapter }              from './state';
 *
 * export const KERNEL_TOKEN = new InjectionToken<Kernel>('vi/kernel');
 *
 * \@Component({ template: `Count: {{ count() }}` })
 * export class CounterComponent {
 *   private kernel = inject(KERNEL_TOKEN);
 *   readonly count = ngAdapter.toSignal(counterAtom, this.kernel);
 *   dispatch       = ngAdapter.commandDispatcher(counterAtom, this.kernel);
 * }
 * ```
 *
 * @module
 */

import type { Kernel, Atom, Command } from '../kernel/types.js';

// ─── Minimal Angular API shapes (no @angular/core import needed) ──────────────

/**
 * A writable Angular-compatible signal — minimal surface.
 * Matches Angular's `WritableSignal<T>` interface.
 */
export type WriteableSignalLike<T> = {
  (): T;
  set(value: T): void;
};

/** Minimal shape of Angular's `DestroyRef`. */
export type DestroyRefLike = {
  onDestroy(cb: () => void): void;
};

/**
 * The Angular APIs required by this adapter.
 * Pass the real APIs from `@angular/core` at setup time.
 *
 * @example
 * ```ts
 * import { signal, inject, DestroyRef } from '@angular/core';
 * createAngularAdapter({ signal, inject, DestroyRef });
 * ```
 */
export type AngularAPIs = {
  /** `inject()` from `@angular/core` — resolves `DestroyRef` in component context. */
  inject:     <T>(token: unknown) => T;
  /** `signal()` from `@angular/core` — creates a reactive writable signal. */
  signal:     <T>(initial: T) => WriteableSignalLike<T>;
  /** The `DestroyRef` class from `@angular/core` — used as a DI token. */
  DestroyRef: unknown;
};

// ─── Adapter public interface ─────────────────────────────────────────────────

/**
 * The Angular kernel adapter returned by `createAngularAdapter`.
 * All `toSignal` / `toQuerySignal` methods must be called inside an Angular
 * injection context (constructor, field initialiser, `inject()` call).
 */
export type AngularKernelAdapter = {
  /**
   * Create an Angular Signal that tracks atom state.
   * Automatically unsubscribes when the calling component/service is destroyed.
   *
   * Must be called inside an Angular injection context.
   */
  toSignal<S>(atom: Atom<S>, kernel: Kernel): WriteableSignalLike<S>;

  /**
   * Create a Signal for a derived value computed from atom state.
   * Re-evaluates `queryFn` on every state change.
   *
   * Must be called inside an Angular injection context.
   */
  toQuerySignal<S, R>(
    atom:    Atom<S>,
    kernel:  Kernel,
    queryFn: (state: S) => R,
  ): WriteableSignalLike<R>;

  /**
   * Returns a stable command dispatch function for the given atom.
   * Does NOT require an injection context — safe to call anywhere.
   */
  commandDispatcher<S>(
    atom:   Atom<S>,
    kernel: Kernel,
  ): (cmd: Command) => ReturnType<Kernel['execute']>;
};

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Create an Angular kernel adapter by providing the Angular primitives.
 *
 * Call once at application startup and reuse the returned adapter object.
 *
 * @example
 * ```ts
 * import { signal, inject, DestroyRef } from '@angular/core';
 * import { createAngularAdapter }       from '@vi/state-fp/adapter';
 *
 * export const ngAdapter = createAngularAdapter({ signal, inject, DestroyRef });
 * ```
 */
export function createAngularAdapter(apis: AngularAPIs): AngularKernelAdapter {
  return {
    toSignal<S>(atom: Atom<S>, kernel: Kernel): WriteableSignalLike<S> {
      const sig        = apis.signal<S>(atom.get());
      const destroyRef = apis.inject<DestroyRefLike>(apis.DestroyRef);
      const off        = kernel.subscribe(atom, (s: S) => sig.set(s));
      destroyRef.onDestroy(off);
      return sig;
    },

    toQuerySignal<S, R>(
      atom:    Atom<S>,
      kernel:  Kernel,
      queryFn: (s: S) => R,
    ): WriteableSignalLike<R> {
      const sig        = apis.signal<R>(queryFn(atom.get()));
      const destroyRef = apis.inject<DestroyRefLike>(apis.DestroyRef);
      const off        = kernel.subscribe(atom, (s: S) => sig.set(queryFn(s)));
      destroyRef.onDestroy(off);
      return sig;
    },

    commandDispatcher<S>(
      atom:   Atom<S>,
      kernel: Kernel,
    ): (cmd: Command) => ReturnType<Kernel['execute']> {
      return (cmd: Command) => kernel.execute(atom, cmd);
    },
  };
}
