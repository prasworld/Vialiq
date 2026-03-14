/**
 * @vi/state-fp/core — Type definitions.
 *
 * Contains only pure FP type primitives used across core combinators.
 * These types are re-exported from the core barrel (index.ts).
 */

// ─── Maybe ────────────────────────────────────────────────────────────────────

export type Nothing  = { readonly _tag: 'Nothing' };
export type Just<A>  = { readonly _tag: 'Just'; readonly value: A };
export type Maybe<A> = Nothing | Just<A>;

// ─── Either ───────────────────────────────────────────────────────────────────

export type Left<E>      = { readonly _tag: 'Left';  readonly left:  E };
export type Right<A>     = { readonly _tag: 'Right'; readonly right: A };
export type Either<E, A> = Left<E> | Right<A>;

// ─── IO ───────────────────────────────────────────────────────────────────────

export type IO<A> = { readonly run: () => A };

/** Mutable reference inside IO — wraps a mutable cell in a pure interface. */
export type IORef<A> = {
  readonly read:   IO<A>;
  readonly write:  (a: A) => IO<void>;
  readonly modify: (f: (a: A) => A) => IO<void>;
};

// ─── Lens ─────────────────────────────────────────────────────────────────────

export type Lens<S, A> = {
  readonly get: (s: S) => A;
  readonly set: (a: A) => (s: S) => S;
};

export type OptionalLens<S, A> = {
  readonly get: (s: S) => A | undefined;
  readonly set: (a: A) => (s: S) => S;
};

// ─── Patch ────────────────────────────────────────────────────────────────────

/** JSON-patch-inspired shallow diff entry. */
export type Patch = {
  readonly op:    'add' | 'remove' | 'replace';
  readonly path:  string;
  readonly value?: unknown;
};
