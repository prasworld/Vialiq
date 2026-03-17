/**
 * @vi/state-fp/kernel — Atom runtime.
 *
 * `defineAtom()` creates the smallest named unit of state.
 * State transitions happen only via `kernel.execute()`.
 * Atoms are plain objects — no Observables, no RxJS.
 */

import type { Atom, AtomDefinition, ComputedAtom, ComputedAtomDefinition, Unsubscribe } from './types.js';
import { assertApplicationStoragePolicy } from './storage-guard.js';

// ─── Internal atom runtime ────────────────────────────────────────────────────

type AtomRuntime<S> = Atom<S> & {
  _state:        S;
  _version:      number;
  _subscribers:  Set<(s: S) => void>;
};

// ─── defineAtom ───────────────────────────────────────────────────────────────

/**
 * Create a new Atom.
 *
 * @example
 * const counterAtom = defineAtom({
 *   key: 'vi/counter',
 *   initialState: { count: 0 },
 * });
 */
export function defineAtom<S>(definition: AtomDefinition<S>): Atom<S> {
  // Fail fast when a browser-persistent adapter is configured.
  assertApplicationStoragePolicy(definition.key, definition.storage);

  const subscribers = new Set<(s: S) => void>();
  let currentState  = definition.initialState;
  let version       = 0;

  const atom: AtomRuntime<S> = {
    definition,
    _state:       currentState,
    _version:     version,
    _subscribers: subscribers,

    get key() {
      return definition.key;
    },

    get version() {
      return version;
    },

    get(): S {
      return currentState;
    },

    subscribe(listener: (s: S) => void): Unsubscribe {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },

    _setState(s: S, v?: number): void {
      currentState   = s;
      atom._state    = s;
      version        = v ?? version + 1;
      atom._version  = version;
      subscribers.forEach(fn => fn(s));
    },
  };

  return atom;
}

// ─── Equality helper ─────────────────────────────────────────────────────────

/**
 * Check state equality using `Object.is` for primitive states
 * or shallow reference equality for objects.
 *
 * Note: the kernel always applies events — it does not use equality
 * to skip transitions. This helper is provided for adapter layers.
 */
export function statesAreEqual<S>(a: S, b: S): boolean {
  return Object.is(a, b);
}

// ─── Phase 2.5: Computed Atoms ──────────────────────────────────────────────

type ComputedAtomRuntime<R> = ComputedAtom<R> & {
  _computed:    R | undefined;
  _subscribers: Set<(v: R) => void>;
};

/**
 * Create a computed (derived) atom.
 * Dependencies are read-only; the computed value is memoised based on dep references.
 *
 * Initial value remains undefined until kernel.registerComputed() is called,
 * which performs the first compute.
 *
 * @example
 * const cartTotalAtom = defineComputedAtom({
 *   key: 'vi/cart-total',
 *   deps: [cartAtom],
 *   compute: ([cart]) => cart.items.reduce((sum, item) => sum + item.price * item.qty, 0),
 * });
 */
export function defineComputedAtom<R>(definition: ComputedAtomDefinition<R>): ComputedAtom<R> {
  const subscribers = new Set<(v: R) => void>();
  let computed: R | undefined = undefined;

  const atom: ComputedAtomRuntime<R> = {
    definition,
    _computed:     computed,
    _subscribers:  subscribers,

    get key() {
      return definition.key;
    },

    get(): R {
      if (computed === undefined) {
        throw new Error(`Computed atom "${definition.key}" not initialized. Did you forget to call kernel.registerComputed()?`);
      }
      return computed;
    },

    subscribe(listener: (v: R) => void): Unsubscribe {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },

    _setComputed(v: R): void {
      computed = v;
      atom._computed = v;
      subscribers.forEach(fn => fn(v));
    },
  };

  return atom;
}

