/**
 * Either monad — typed error handling.
 *
 * Either<E, A> is either:
 *   - Left<E>  — a failure, carrying an error of type E
 *   - Right<A> — a success, carrying a value of type A
 *
 * Laws:
 *   Functor identity:    mapEither(identity)(e)           ≡ e
 *   Monad left identity: chainEither(f)(right(a))         ≡ f(a)
 *   Monad right identity:chainEither(right)(e)            ≡ e
 */

import type { Either, Left, Right, Maybe } from './types.js';

// ─── Constructors ─────────────────────────────────────────────────────────────

export const left  = <E, A = never>(e: E): Either<E, A>      => ({ _tag: 'Left',  left:  e });
export const right = <E = never, A = unknown>(a: A): Either<E, A> => ({ _tag: 'Right', right: a });

/** Lift a nullable — null/undefined becomes Left, otherwise Right. */
export const fromNullableEither =
  <E, A>(onNull: () => E) =>
  (a: A | null | undefined): Either<E, A> =>
    a == null ? left(onNull()) : right(a);

/** Lift a throwing expression into Either. */
export const fromTry =
  <E, A>(f: () => A, onError: (e: unknown) => E): Either<E, A> => {
    try    { return right(f()); }
    catch (e) { return left(onError(e)); }
  };

/** Async version of fromTry. */
export const fromTryAsync =
  <E, A>(f: () => Promise<A>, onError: (e: unknown) => E): Promise<Either<E, A>> =>
    f().then(right<E, A>, (e: unknown) => left<E, A>(onError(e)));

// ─── Type Guards ──────────────────────────────────────────────────────────────

export const isLeft  = <E, A>(e: Either<E, A>): e is Left<E>  => e._tag === 'Left';
export const isRight = <E, A>(e: Either<E, A>): e is Right<A> => e._tag === 'Right';

// ─── Functor ──────────────────────────────────────────────────────────────────

/** Map over the Right value; Left passes through unchanged. */
export const mapEither =
  <E, A, B>(f: (a: A) => B) =>
  (e: Either<E, A>): Either<E, B> =>
    e._tag === 'Left' ? (e as unknown as Either<E, B>) : right(f(e.right));

// ─── Bifunctor ────────────────────────────────────────────────────────────────

/** Map over both Left and Right independently. */
export const bimapEither =
  <E1, E2, A, B>(onLeft: (e: E1) => E2, onRight: (a: A) => B) =>
  (e: Either<E1, A>): Either<E2, B> =>
    e._tag === 'Left' ? left(onLeft(e.left)) : right(onRight(e.right));

/** Map over the Left value only. */
export const mapLeft =
  <E1, E2>(f: (e: E1) => E2) =>
  <A>(e: Either<E1, A>): Either<E2, A> =>
    e._tag === 'Right' ? (e as unknown as Either<E2, A>) : left(f(e.left));

// ─── Monad ────────────────────────────────────────────────────────────────────

/** Sequence Either computations — short-circuits to Left on the first failure. */
export const chainEither =
  <E, A, B>(f: (a: A) => Either<E, B>) =>
  (e: Either<E, A>): Either<E, B> =>
    e._tag === 'Left' ? (e as unknown as Either<E, B>) : f(e.right);

/** Alias for chainEither. */
export const flatMapEither = chainEither;

// ─── Pattern Matching ─────────────────────────────────────────────────────────

export const foldEither =
  <E, A, B>(onLeft: (e: E) => B, onRight: (a: A) => B) =>
  (e: Either<E, A>): B =>
    e._tag === 'Left' ? onLeft(e.left) : onRight(e.right);

// ─── Applicative ──────────────────────────────────────────────────────────────

export const apEither =
  <E, A, B>(ef: Either<E, (a: A) => B>) =>
  (ea: Either<E, A>): Either<E, B> =>
    ef._tag === 'Left' ? left<E, B>(ef.left) : mapEither<E, A, B>(ef.right)(ea);

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Extract the Right value or return a default. */
export const getOrElse =
  <E, A>(defaultValue: A) =>
  (e: Either<E, A>): A =>
    e._tag === 'Left' ? defaultValue : e.right;

/** Extract the Right value or compute a default from the error. */
export const getOrElseL =
  <E, A>(getDefault: (err: E) => A) =>
  (e: Either<E, A>): A =>
    e._tag === 'Left' ? getDefault(e.left) : e.right;

/** Convert Either to Maybe — Left becomes Nothing. */
export const eitherToMaybe = <E, A>(e: Either<E, A>): Maybe<A> =>
  e._tag === 'Left'
    ? { _tag: 'Nothing' }
    : { _tag: 'Just', value: e.right };

/**
 * Sequence an array of Eithers.
 * Returns Right(array) if all succeed, or the first Left encountered.
 */
export const sequenceEither =
  <E, A>(arr: ReadonlyArray<Either<E, A>>): Either<E, ReadonlyArray<A>> => {
    const result: A[] = [];
    for (const item of arr) {
      if (item._tag === 'Left') return item as unknown as Either<E, ReadonlyArray<A>>;
      result.push(item.right);
    }
    return right(result);
  };

/** Swap Left and Right. */
export const swapEither = <E, A>(e: Either<E, A>): Either<A, E> =>
  e._tag === 'Left' ? right(e.left) : left(e.right);
