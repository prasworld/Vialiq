/**
 * IO monad — deferred, composable side effects.
 *
 * An IO<A>, when `.run()` is called, executes a side effect and returns A.
 * Composing IO values builds a description of effects; execution only
 * happens at the imperative boundary.
 *
 * Laws:
 *   Functor identity:    mapIO(identity)(ia)         ≡ ia
 *   Monad left identity: chainIO(f)(liftIO(a))       ≡ f(a)
 *   Monad right identity:chainIO(liftIO)(ia)         ≡ ia
 */

import type { IO, IORef } from './types.js';

// ─── Constructors ─────────────────────────────────────────────────────────────

/** Wrap a thunk in IO. */
export const io     = <A>(f: () => A): IO<A> => ({ run: f });

/** Lift a pure value into IO. */
export const liftIO = <A>(a: A): IO<A> => io(() => a);

// ─── Functor ──────────────────────────────────────────────────────────────────

/** Map over the IO value without executing it. */
export const mapIO =
  <A, B>(f: (a: A) => B) =>
  (ia: IO<A>): IO<B> =>
    io(() => f(ia.run()));

// ─── Monad ────────────────────────────────────────────────────────────────────

/** Sequence IO computations — result of first is input to second. */
export const chainIO =
  <A, B>(f: (a: A) => IO<B>) =>
  (ia: IO<A>): IO<B> =>
    io(() => f(ia.run()).run());

/** Alias for chainIO. */
export const flatMapIO = chainIO;

// ─── Applicative ──────────────────────────────────────────────────────────────

export const apIO =
  <A, B>(iof: IO<(a: A) => B>) =>
  (ioa: IO<A>): IO<B> =>
    io(() => iof.run()(ioa.run()));

// ─── Sequencing ───────────────────────────────────────────────────────────────

/** Run all effects in order and collect results. */
export const sequenceIO =
  <A>(effects: ReadonlyArray<IO<A>>): IO<ReadonlyArray<A>> =>
    io(() => effects.map(e => e.run()));

/** Run all effects in order, discarding results (for side-effect-only chains). */
export const sequenceIO_ =
  (effects: ReadonlyArray<IO<unknown>>): IO<void> =>
    io(() => { effects.forEach(e => e.run()); });

/** Run an IO effect N times. */
export const replicateIO =
  <A>(n: number, effect: IO<A>): IO<ReadonlyArray<A>> =>
    io(() => Array.from({ length: n }, () => effect.run()));

// ─── IORef — Mutable cell inside IO ───────────────────────────────────────────

/** Create a new mutable reference with an initial value. */
export const newIORef = <A>(initial: A): IORef<A> => {
  let current = initial;
  return {
    read:   io(() => current),
    write:  (a) => io(() => { current = a; }),
    modify: (f) => io(() => { current = f(current); }),
  };
};

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Discard the produced value (returns IO<void>). */
export const voidIO = <A>(ia: IO<A>): IO<void> =>
  mapIO(() => undefined)(ia);

/**
 * Tap — run a side effect without changing the IO value.
 * Useful for logging / debugging inside a pipeline.
 */
export const tapIO =
  <A>(f: (a: A) => void) =>
  (ia: IO<A>): IO<A> =>
    io(() => {
      const value = ia.run();
      f(value);
      return value;
    });
