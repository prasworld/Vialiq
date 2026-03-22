/**
 * @vi/state-fp/core — Type definitions.
 *
 * Contains only pure FP type primitives used across core combinators.
 * These types are re-exported from the core barrel (index.ts).
 */

// ─── Maybe ────────────────────────────────────────────────────────────────────
/**
 * Represents an optional value: either present (Just) or absent (Nothing).
 */
export type Nothing  = { readonly _tag: 'Nothing' };
export type Just<A>  = { readonly _tag: 'Just'; readonly value: A };
export type Maybe<A> = Nothing | Just<A>;

// ─── Either ───────────────────────────────────────────────────────────────────
/**
 * Represents a value that can be one of two types: a Left (usually an error) or a Right (usually a success).
 * The Left and Right types are tagged with a discriminant (_tag) to allow type-safe pattern matching.
 * The Either type is a union of Left and Right, parameterized by the types of the Left and Right values.
 */
export type Left<E>      = { readonly _tag: 'Left';  readonly left:  E };
export type Right<A>     = { readonly _tag: 'Right'; readonly right: A };
export type Either<E, A> = Left<E> | Right<A>;

/**
 * Idiomatic alias for `Either<E, A>`.
 *
 * Use `Result` when you want names that read naturally in application code.
 * Pair with `ok()`, `err()`, `isOk()`, `isErr()`, and `match()` from the
 * same module.
 *
 * ```ts
 * import { ok, err, match, Result } from '@vi/state-fp/core';
 * // or from '@vi/state-fp/kernel' (re-exported for command handlers)
 *
 * function divide(a: number, b: number): Result<string, number> {
 *   return b === 0 ? err('division by zero') : ok(a / b);
 * }
 *
 * const count = match(kernel.execute(counterAtom, cmd), {
 *   ok:  (state) => state.count,
 *   err: (e)     => 0,
 * });
 * ```
 */
export type Result<E, A> = Either<E, A>;

// ─── IO ───────────────────────────────────────────────────────────────────────
/**
 * IO<A> represents a computation that produces a value of type A and may have side effects.
 * It is a pure description of an effectful computation, which can be executed at the imperative boundary.
 * The run method encapsulates the side effects and allows for lazy execution.
 *
 * IO is a Monad, Functor, and Applicative, allowing for composition of effectful computations.
 * It can be used to model any side-effecting operation, such as reading from or writing to a database, making HTTP requests, or interacting with the file system.
 */
export type IO<A> = { readonly run: () => A };

/** Mutable reference inside IO — wraps a mutable cell in a pure interface. */
export type IORef<A> = {
  readonly read:   IO<A>;
  readonly write:  (a: A) => IO<void>;
  readonly modify: (f: (a: A) => A) => IO<void>;
};

// ─── Lens ─────────────────────────────────────────────────────────────────────
/**
 * A Lens<S, A> focuses on a single property of a larger structure:
 *  S — the whole structure (e.g. an object)
 *   A — the focused part (e.g. a property value)
 * Provides:
 *  - get  — read the focused value from S
 *   - set  — replace the focused value, returning a new S (pure)
 *  - over — apply a function to the focused value
 */
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
