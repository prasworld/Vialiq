/**
 * Lens — composable, type-safe immutable updates for nested structures.
 *
 * A Lens<S, A> focuses on a sub-part A of a larger structure S.
 * Provides:
 *   - get  — read the focused value
 *   - set  — replace the focused value, returning a new S (pure)
 *   - over — apply a function to the focused value
 *
 * Lenses compose: outer Lens<S,A> + inner Lens<A,B> = Lens<S,B>
 */

import type { Lens, OptionalLens } from './types.js';

// ─── Constructor ──────────────────────────────────────────────────────────────

/** Build a Lens from explicit getter and setter. */
export const lens =
  <S, A>(
    get: (s: S) => A,
    set: (a: A) => (s: S) => S,
  ): Lens<S, A> => ({ get, set });

// ─── Property Lens ────────────────────────────────────────────────────────────

/** Derive a Lens for a specific object key. */
export const prop =
  <S extends object, K extends keyof S>(key: K): Lens<S, S[K]> =>
    lens(
      (s) => s[key],
      (a) => (s) => ({ ...s, [key]: a }),
    );

// ─── Array Index Lens ─────────────────────────────────────────────────────────

/** Derive a Lens for an array element by index (value may be undefined for out-of-bounds). */
export const index =
  <A>(i: number): OptionalLens<ReadonlyArray<A>, A> =>
    ({
      get: (arr) => arr[i] as A | undefined,
      set: (a) => (arr) => {
        const copy = [...arr] as A[];
        if (a !== undefined) copy[i] = a;
        return copy as ReadonlyArray<A>;
      },
    });

// ─── Composition ──────────────────────────────────────────────────────────────

/**
 * Compose two lenses.
 * `outer` focuses on A within S; `inner` focuses on B within A.
 * Result: Lens<S, B> — reads B from S, updates B inside S.
 */
export const composeLens =
  <S, A, B>(outer: Lens<S, A>, inner: Lens<A, B>): Lens<S, B> =>
    lens(
      (s) => inner.get(outer.get(s)),
      (b) => (s) => outer.set(inner.set(b)(outer.get(s)))(s),
    );

// ─── Derived Helpers ──────────────────────────────────────────────────────────

/** Read the focused value. Alias for `l.get`. */
export const view =
  <S, A>(l: Lens<S, A>) =>
  (s: S): A =>
    l.get(s);

/** Apply a function to the focused value and return a new S. */
export const over =
  <S, A>(l: Lens<S, A>) =>
  (f: (a: A) => A) =>
  (s: S): S =>
    l.set(f(l.get(s)))(s);

/** Set a specific value via lens, returning a new S. */
export const set =
  <S, A>(l: Lens<S, A>) =>
  (a: A) =>
  (s: S): S =>
    l.set(a)(s);

// ─── Optional Lens ────────────────────────────────────────────────────────────

/** Partial lens for nullable/optional sub-fields. */
export const optional =
  <S extends object, K extends keyof S>(key: K): OptionalLens<S, NonNullable<S[K]>> =>
    ({
      get: (s) => s[key] as NonNullable<S[K]> | undefined,
      set: (a) => (s) => ({ ...s, [key]: a }),
    });
