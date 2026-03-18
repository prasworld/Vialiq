/**
 * @vi/state-fp/kernel — Query types, factory, and QueryBus.
 *
 * Queries return derived data from current atom state.
 * They are pure, synchronous, and never mutate state.
 *
 * Invariant (I3): QueryHandler.handle is always read-only — never calls execute or mutates.
 */

import type { Query, QueryHandler } from './types.js';

// ─── Query factory ────────────────────────────────────────────────────────────

/**
 * Construct a Query value.
 *
 * @example
 * const GetCount = () => query('counter/getCount');
 * const GetItem  = (id: string) => query('cart/getItem', { id });
 */
export function query<T extends string>(type: T): Query<T>;
export function query<T extends string, P>(type: T, payload: P): Query<T, P>;
export function query<T extends string, P>(
  type:     T,
  payload?: P,
): Query<T, P> | Query<T> {
  if (payload === undefined) {
    return { _kind: 'Query', type } as Query<T>;
  }
  return { _kind: 'Query', type, payload } as Query<T, P>;
}

// ─── QueryHandler factory ─────────────────────────────────────────────────────

/**
 * Declare a QueryHandler — maps a query type string to a pure read function.
 *
 * @example
 * const getCountHandler = createQueryHandler({
 *   queryType: 'counter/getCount',
 *   handle: (state) => state.count,
 * });
 */
export function createQueryHandler<S, Q extends Query, R>(
  config: QueryHandler<S, Q, R>,
): QueryHandler<S, Q, R> {
  return config;
}

// ─── QueryBus ─────────────────────────────────────────────────────────────────

/** @internal — used by the Kernel to dispatch queries to handlers. */
export class QueryBus {
  #handlers = new Map<string, Map<string, QueryHandler<unknown, Query, unknown>>>();

  /**
   * Register a query handler for a specific query type on a specific atom.
   */
  register<S, Q extends Query, R>(
    atomKey: string,
    handler: QueryHandler<S, Q, R>,
  ): void {
    let atomHandlers = this.#handlers.get(handler.queryType);
    if (!atomHandlers) {
      atomHandlers = new Map();
      this.#handlers.set(handler.queryType, atomHandlers);
    }
    atomHandlers.set(atomKey, handler as unknown as QueryHandler<unknown, Query, unknown>);
  }

  /**
   * Resolve the handler for a given atom + query type, without executing.
   * Used by the kernel to check memo flags before calling execute().
   */
  resolve(atomKey: string, q: Query): QueryHandler<unknown, Query, unknown> | undefined {
    return this.#handlers.get(q.type)?.get(atomKey);
  }

  /**
   * Execute a query against the current atom state.
   * Throws if no handler is registered (queries MUST be registered — invariant I3).
   */
  execute(atomKey: string, state: unknown, q: Query): unknown {
    const handler = this.#handlers.get(q.type)?.get(atomKey);
    if (!handler) {
      throw new Error(
        `No QueryHandler registered for '${q.type}' on atom '${atomKey}'.`,
      );
    }
    return handler.handle(state, q);
  }

  clear(): void {
    this.#handlers.clear();
  }
}
