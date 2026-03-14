/**
 * React adapter — stub for future implementation.
 *
 * Full implementation is planned for Phase 5 (adapter module).
 * See `docs/phases.md` → Phase 5 for the roadmap.
 *
 * ## Planned API (Phase 5)
 * ```tsx
 * import { StateFpProvider, useAtom, useCommand, useQuery } from '@vi/state-fp/adapter/react';
 *
 * // Root
 * <StateFpProvider kernel={kernel}>
 *   <App />
 * </StateFpProvider>
 *
 * // In a component
 * const [count] = useAtom(counterAtom);
 * const dispatch = useCommand(counterAtom);
 * const total = useQuery(counterAtom, totalsQuery);
 * ```
 *
 * ## Current phase
 * This file exports only TypeScript type declarations so that consumers can
 * reference the planned API without triggering import errors. No runtime
 * code is emitted.
 */

import type { Kernel, Atom, Command, Query } from '../kernel/types.js';

// ─── Planned type declarations ────────────────────────────────────────────────

/** Props for the root context provider. */
export type StateFpProviderProps = {
  kernel:   Kernel;
  children: unknown; // React.ReactNode
};

/** Return value of `useAtom`. */
export type UseAtomResult<S> = readonly [
  /** Current atom state. Re-renders on every state change. */
  state:    S,
  /** Direct reference to the atom for passing to `useCommand`. */
  atom:     Atom<S>,
];

/** Return value of `useCommand`. */
export type UseCommandResult<S> = {
  /** Dispatch a command against the atom. Returns a Promise of the execution result. */
  dispatch<C extends Command>(cmd: C): ReturnType<Kernel['execute']>;
};

/** Return value of `useQuery`. */
export type UseQueryResult<R> = R;

// ─── Stub errors (thrown at runtime if called before implementation) ──────────

const NOT_IMPLEMENTED = (name: string) => () => {
  throw new Error(
    `[@vi/state-fp/adapter] \`${name}\` is not yet implemented. ` +
    `React adapter is planned for Phase 5. Track progress in docs/phases.md.`,
  );
};

/**
 * Root provider — wraps your React tree and provides the kernel via context.
 *
 * @stub Phase 5
 */
export const StateFpProvider: unknown = NOT_IMPLEMENTED('StateFpProvider');

/**
 * Subscribe to an atom's state. Component re-renders on every state change.
 *
 * @stub Phase 5
 */
export const useAtom: <S>(atom: Atom<S>) => UseAtomResult<S> =
  NOT_IMPLEMENTED('useAtom') as never;

/**
 * Get a stable dispatch function for executing commands against an atom.
 *
 * @stub Phase 5
 */
export const useCommand: <S>(atom: Atom<S>) => UseCommandResult<S> =
  NOT_IMPLEMENTED('useCommand') as never;

/**
 * Subscribe to a derived query value. Re-renders only when the query result changes.
 *
 * @stub Phase 5
 */
export const useQuery: <S, Q extends Query, R>(atom: Atom<S>, q: Q) => UseQueryResult<R> =
  NOT_IMPLEMENTED('useQuery') as never;
