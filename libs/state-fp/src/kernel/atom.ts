/**
 * @vi/state-fp/kernel — Atom runtime.
 *
 * `defineAtom()` creates the smallest named unit of state.
 * State transitions happen only via `kernel.execute()`.
 * Atoms are plain objects — no Observables, no RxJS.
 */

import type { Atom, AtomDefinition, Unsubscribe } from './types.js';

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
