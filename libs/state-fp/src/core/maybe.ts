/**
 * Maybe monad — safe null/undefined handling.
 *
 * A Maybe<A> is either:
 *   - Nothing  — the absence of a value
 *   - Just<A>  — a present value of type A
 *
 * Laws:
 *   Functor identity:       mapMaybe(identity)(m) ≡ m
 *   Functor composition:    mapMaybe(g ∘ f)       ≡ mapMaybe(g) ∘ mapMaybe(f)
 *   Monad left identity:    chainMaybe(f)(just(a)) ≡ f(a)
 *   Monad right identity:   chainMaybe(just)(m)    ≡ m
 */

import type { Either, Maybe, Nothing, Just } from './types.js';

// ─── Constructors ─────────────────────────────────────────────────────────────

/** Construct an absent value. */
export const nothing = <A = never>(): Maybe<A> => ({ _tag: 'Nothing' });

/** Construct a present value. */
export const just = <A>(a: A): Maybe<A> => ({ _tag: 'Just', value: a });

/**
 * Lift a nullable value into Maybe.
 * `null | undefined` → Nothing
 * `A`               → Just<A>
 */
export const fromNullable = <A>(a: A | null | undefined): Maybe<A> =>
  a == null ? nothing() : just(a);

/**
 * Safely wrap a potentially-throwing expression.
 * Throws → Nothing; Returns A → Just<A>
 */
export const tryCatch = <A>(f: () => A): Maybe<A> => {
  try    { return just(f()); }
  catch  { return nothing(); }
};

// ─── Type Guards ──────────────────────────────────────────────────────────────

export const isNothing = <A>(m: Maybe<A>): m is Nothing => m._tag === 'Nothing';
export const isJust    = <A>(m: Maybe<A>): m is Just<A>  => m._tag === 'Just';

// ─── Functor ──────────────────────────────────────────────────────────────────

/** Apply a function to the value inside Just; pass Nothing through. */
export const mapMaybe =
  <A, B>(f: (a: A) => B) =>
  (m: Maybe<A>): Maybe<B> =>
    m._tag === 'Nothing' ? (m as unknown as Maybe<B>) : just(f(m.value));

// ─── Applicative ──────────────────────────────────────────────────────────────

export const apMaybe =
  <A, B>(mf: Maybe<(a: A) => B>) =>
  (ma: Maybe<A>): Maybe<B> =>
    mf._tag === 'Nothing' ? nothing() : mapMaybe(mf.value)(ma);

// ─── Monad ────────────────────────────────────────────────────────────────────

/** Sequence Maybe computations — short-circuits to Nothing on first absent value. */
export const chainMaybe =
  <A, B>(f: (a: A) => Maybe<B>) =>
  (m: Maybe<A>): Maybe<B> =>
    m._tag === 'Nothing' ? nothing() : f(m.value);

/** Alias for chainMaybe. */
export const flatMapMaybe = chainMaybe;

// ─── Pattern Matching ─────────────────────────────────────────────────────────

export const foldMaybe =
  <A, B>(onNothing: () => B, onJust: (a: A) => B) =>
  (m: Maybe<A>): B =>
    m._tag === 'Nothing' ? onNothing() : onJust(m.value);

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Extract value or return a default. */
export const getOrElse =
  <A>(defaultValue: A) =>
  (m: Maybe<A>): A =>
    m._tag === 'Nothing' ? defaultValue : m.value;

/** Extract value or compute a default lazily. */
export const getOrElseL =
  <A>(getDefault: () => A) =>
  (m: Maybe<A>): A =>
    m._tag === 'Nothing' ? getDefault() : m.value;

/** Unwrap Just value or return undefined. */
export const toNullable = <A>(m: Maybe<A>): A | undefined =>
  m._tag === 'Nothing' ? undefined : m.value;

/** Convert Maybe to Either, using onNothing to produce the Left value. */
export const maybeToEither =
  <E, A>(onNothing: () => E) =>
  (m: Maybe<A>): Either<E, A> => {
    // avoid circular import — construct manually
    if (m._tag === 'Nothing') return { _tag: 'Left',  left:  onNothing() };
    return                           { _tag: 'Right', right: m.value };
  };

/** Convert Maybe to an array — [] or [value]. */
export const maybeToArray = <A>(m: Maybe<A>): A[] =>
  m._tag === 'Nothing' ? [] : [m.value];

/** Combine two Maybes — Nothing if either is Nothing. */
export const lift2Maybe =
  <A, B, C>(f: (a: A, b: B) => C) =>
  (ma: Maybe<A>) =>
  (mb: Maybe<B>): Maybe<C> =>
    ma._tag === 'Nothing' || mb._tag === 'Nothing'
      ? nothing()
      : just(f(ma.value, mb.value));

/** Filter — returns Nothing if predicate fails. */
export const filterMaybe =
  <A>(predicate: (a: A) => boolean) =>
  (m: Maybe<A>): Maybe<A> =>
    m._tag === 'Nothing' || predicate(m.value) ? m : nothing();
