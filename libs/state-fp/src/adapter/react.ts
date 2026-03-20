/**
 * React adapter for @vi/state-fp.
 *
 * Uses a **factory pattern** — consumers inject React primitives, so this
 * library has zero compile-time dependency on `react`. This keeps the core
 * bundle framework-agnostic and allows the adapter to be tested without a
 * real React runtime.
 *
 * ## Setup (call once at app bootstrap)
 *
 * ```tsx
 * import { useState, useEffect, useRef, useMemo, useContext, createContext } from 'react';
 * import { createReactAdapter } from '@vi/state-fp/adapter';
 *
 * export const reactAdapter = createReactAdapter({
 *   useState, useEffect, useRef, useMemo, useContext, createContext,
 * });
 * ```
 *
 * ## Usage
 *
 * ```tsx
 * function App() {
 *   return (
 *     <reactAdapter.Provider kernel={kernel}>
 *       <Routes />
 *     </reactAdapter.Provider>
 *   );
 * }
 *
 * function CartButton() {
 *   const [cartState] = reactAdapter.useAtom(cartAtom);
 *   const dispatch    = reactAdapter.useCommand(cartAtom);
 *   const total       = reactAdapter.useQuery(cartAtom, BuildTotal());
 *   return <button onClick={() => dispatch(AddItem({ sku: 'ABC' }))}>…</button>;
 * }
 * ```
 *
 * @module
 */

import type { Kernel, Atom, Command, Query, Unsubscribe } from '../kernel/types.js';
import type { Either }                                     from '../core/types.js';
import type { EphemeralStream }                            from '../core/stream.js';

// ─── React API shape (no react import) ───────────────────────────────────────

/**
 * Minimal subset of React hooks required by this adapter.
 * Pass the real hooks from `react` at setup time.
 */
export type ReactAPIs = {
  useState:      <S>(initial: S | (() => S)) => [S, (s: S | ((prev: S) => S)) => void];
  useEffect:     (effect: () => (() => void) | void, deps?: readonly unknown[]) => void;
  useRef:        <T>(initial: T) => { current: T };
  useMemo:       <T>(factory: () => T, deps: readonly unknown[]) => T;
  useContext:    <T>(ctx: ReactContextLike<T>) => T;
  createContext: <T>(defaultValue: T) => ReactContextLike<T>;
};

/** Minimal React context shape (no react import needed). */
export type ReactContextLike<T> = {
  readonly _currentValue: T;
  Provider: (props: { value: T; children: unknown }) => unknown;
};

// ─── Public types ─────────────────────────────────────────────────────────────

/** Props for the root kernel context provider. */
export type StateFpProviderProps = {
  kernel:   Kernel;
  children: unknown;
};

/** Return value of `useAtom`. */
export type UseAtomResult<S> = readonly [
  /** Current atom state — triggers re-render on change. */
  state: S,
  /** The atom reference — stable across renders. */
  atom:  Atom<S>,
];

/** Return value of `useCommand`. */
export type UseCommandResult<S> = {
  /** Stable dispatch function. Does not change between renders. */
  execute(cmd: Command): Either<ReturnType<Kernel['execute']> extends Either<infer E, infer A> ? E : never, S>;
};

/** Return value of `useQuery`. */
export type UseQueryResult<R> = R;

// ─── Adapter interface ────────────────────────────────────────────────────────

export type ReactKernelAdapter = {
  /**
   * Root context provider — wraps your React tree and injects the kernel.
   * Must be rendered above any component that calls `useAtom` / `useCommand`.
   */
  Provider(props: StateFpProviderProps): unknown;

  /**
   * Subscribe to an atom's state. The component re-renders on every
   * state change. Subscription is cleaned up automatically on unmount.
   *
   * Must be rendered inside a `<Provider>`.
   */
  useAtom<S>(atom: Atom<S>): UseAtomResult<S>;

  /**
   * Get a **stable** dispatch function for a given atom.
   * The returned function reference is stable across renders — safe to pass
   * to memoised child components without causing unnecessary re-renders.
   *
   * Must be rendered inside a `<Provider>`.
   */
  useCommand<S>(atom: Atom<S>): (cmd: Command) => ReturnType<Kernel['execute']>;

  /**
   * Run a query against the atom and return the derived value.
   * The result is memoised — the query handler is only re-invoked when the
   * atom state reference changes.
   *
   * Must be rendered inside a `<Provider>`.
   */
  useQuery<S, Q extends Query, R>(atom: Atom<S>, q: Q): R;

  /**
   * Subscribe to an `EphemeralStream` inside a React component.
   * The component re-renders at most once per animation frame (when the stream
   * uses RAF batching via `subscribeAnimated`), or synchronously on every
   * `emit()` when `animated` is `false`.
   *
   * Returns `undefined` before the first emit.
   *
   * @param stream    The EphemeralStream to subscribe to.
   * @param animated  When `true` (default), uses `subscribeAnimated`
   *                  for RAF-batched 60 fps rendering. Set to `false`
   *                  for synchronous delivery.
   */
  useEphemeral<T>(stream: EphemeralStream<T>, animated?: boolean): T | undefined;
};

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create a React kernel adapter by injecting the React hooks.
 *
 * Call once at app bootstrap and reuse the returned adapter object.
 *
 * @example
 * ```ts
 * import { useState, useEffect, useRef, useMemo, useContext, createContext } from 'react';
 * import { createReactAdapter } from '@vi/state-fp/adapter';
 *
 * export const reactAdapter = createReactAdapter({
 *   useState, useEffect, useRef, useMemo, useContext, createContext,
 * });
 * ```
 */
export function createReactAdapter(apis: ReactAPIs): ReactKernelAdapter {
  // One shared context per adapter instance.
  // Typed as Kernel | null — null signals "no provider in tree".
  const KernelContext = apis.createContext<Kernel | null>(null);

  function useKernel(): Kernel {
    const kernel = apis.useContext(KernelContext);
    if (kernel === null) {
      throw new Error(
        '[@vi/state-fp/adapter] useAtom / useCommand / useQuery called outside of <Provider>. ' +
        'Wrap your component tree with <reactAdapter.Provider kernel={kernel}>.',
      );
    }
    return kernel;
  }

  function Provider(props: StateFpProviderProps): unknown {
    return (KernelContext.Provider as (p: { value: Kernel | null; children: unknown }) => unknown)({
      value:    props.kernel,
      children: props.children,
    });
  }

  function useAtom<S>(atom: Atom<S>): UseAtomResult<S> {
    const kernel = useKernel();

    // useState initialised with the current atom value so there is no
    // "undefined flicker" between mount and first subscription callback.
    const [state, setState] = apis.useState<S>(() => atom.get());

    apis.useEffect(() => {
      // Sync with current state in case it changed between render and effect.
      setState(atom.get());
      const off: Unsubscribe = kernel.subscribe(atom, (s: S) => setState(s));
      return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [atom.key]);

    return [state, atom] as const;
  }

  function useCommand<S>(atom: Atom<S>): (cmd: Command) => ReturnType<Kernel['execute']> {
    const kernel = useKernel();

    // Use a ref to always capture the latest kernel/atom without re-creating
    // the dispatch function and without it appearing in the dependency array.
    const kernelRef = apis.useRef(kernel);
    const atomRef   = apis.useRef(atom);
    kernelRef.current = kernel;
    atomRef.current   = atom;

    // Stable function reference — created once per mount.
    const dispatch = apis.useRef<(cmd: Command) => ReturnType<Kernel['execute']>>(
      (cmd: Command) => kernelRef.current.execute(atomRef.current, cmd),
    );

    return dispatch.current;
  }

  function useQuery<S, Q extends Query, R>(atom: Atom<S>, q: Q): R {
    const kernel = useKernel();

    // Memoised by atom state identity — handler is only re-run when state changes.
    // atom.get() returns the same reference when state is unchanged, so useMemo
    // with the state reference as dep correctly avoids redundant computation.
    const [state] = useAtom(atom);

    return apis.useMemo<R>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => kernel.query<R>(atom as Atom<any>, q),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state],
    );
  }

  function useEphemeral<T>(stream: EphemeralStream<T>, animated = true): T | undefined {
    const [value, setValue] = apis.useState<T | undefined>(() => stream.last);

    apis.useEffect(() => {
      // Sync with any value emitted between render and effect.
      if (stream.last !== undefined) {
        setValue(stream.last);
      }
      const off: Unsubscribe = animated
        ? stream.subscribeAnimated((v: T) => setValue(v))
        : stream.subscribe((v: T) => setValue(v));
      return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stream, animated]);

    return value;
  }

  return { Provider, useAtom, useCommand, useQuery, useEphemeral };
}

// ─── Legacy stub exports (kept for backward compatibility) ────────────────────
// These were the Phase 4 stubs. Replaced by the factory above.
// Exported as named constants so existing imports don't break.

/** @deprecated Use `createReactAdapter` instead. */
export const StateFpProvider: unknown = () => {
  throw new Error(
    '[@vi/state-fp/adapter] StateFpProvider is a legacy stub. ' +
    'Use createReactAdapter({ useState, useEffect, useRef, useMemo, useContext, createContext }).Provider instead.',
  );
};

/** @deprecated Use `createReactAdapter` instead. */
export const useAtom = (): never => {
  throw new Error('[@vi/state-fp/adapter] useAtom is a legacy stub. Use createReactAdapter(...).useAtom instead.');
};

/** @deprecated Use `createReactAdapter` instead. */
export const useCommand = (): never => {
  throw new Error('[@vi/state-fp/adapter] useCommand is a legacy stub. Use createReactAdapter(...).useCommand instead.');
};

/** @deprecated Use `createReactAdapter` instead. */
export const useQuery = (): never => {
  throw new Error('[@vi/state-fp/adapter] useQuery is a legacy stub. Use createReactAdapter(...).useQuery instead.');
};
