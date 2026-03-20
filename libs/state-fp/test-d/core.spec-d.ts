/**
 * Type-level tests for @vi/state-fp/core.
 *
 * These tests assert compile-time type correctness using vitest's `expectTypeOf`.
 * They do NOT test runtime behaviour — that is covered by the unit tests in src/core/*.spec.ts.
 */
import { describe, it, expectTypeOf } from 'vitest';
import {
  // Maybe
  just, nothing, fromNullable, isJust, isNothing,
  mapMaybe, chainMaybe, foldMaybe, getOrElseMaybe,
  // Either
  left, right, isLeft, isRight, mapEither, chainEither, foldEither,
  // IO
  io, liftIO, mapIO,
  // Lens
  lens, prop, composeLens, view, over, set,
  // Utils
  pipe, compose,
  // Stream
  createEphemeralStream,
} from '../src/core/index.js';
import type { Maybe, Just, Nothing, Either, Left, Right, IO, Lens, EphemeralStream } from '../src/core/index.js';

// ─── Maybe ────────────────────────────────────────────────────────────────────

describe('Maybe types', () => {
  it('just() returns Maybe<T>', () => {
    expectTypeOf(just(42)).toEqualTypeOf<Maybe<number>>();
    expectTypeOf(just('hello')).toEqualTypeOf<Maybe<string>>();
    expectTypeOf(just({ id: 1 })).toEqualTypeOf<Maybe<{ id: number }>>();
  });

  it('nothing() returns Maybe<A>', () => {
    expectTypeOf(nothing<number>()).toEqualTypeOf<Maybe<number>>();
  });

  it('fromNullable() produces Maybe<T>', () => {
    expectTypeOf(fromNullable(42)).toEqualTypeOf<Maybe<number>>();
    expectTypeOf(fromNullable<number>(null)).toEqualTypeOf<Maybe<number>>();
    expectTypeOf(fromNullable<number>(undefined)).toEqualTypeOf<Maybe<number>>();
  });

  it('isJust narrows to Just<T>', () => {
    const m: Maybe<number> = just(1);
    if (isJust(m)) {
      expectTypeOf(m).toEqualTypeOf<Just<number>>();
      expectTypeOf(m.value).toEqualTypeOf<number>();
    }
  });

  it('isNothing narrows to Nothing', () => {
    const m: Maybe<number> = nothing();
    if (isNothing(m)) {
      expectTypeOf(m).toEqualTypeOf<Nothing>();
    }
  });

  it('mapMaybe preserves outer type', () => {
    expectTypeOf(mapMaybe((n: number) => n.toString())(just(1))).toEqualTypeOf<Maybe<string>>();
    expectTypeOf(mapMaybe((n: number) => n.toString())(nothing<number>())).toEqualTypeOf<Maybe<string>>();
  });

  it('chainMaybe/flatMap changes inner type', () => {
    const result = chainMaybe((n: number) => (n > 0 ? just(n.toString()) : nothing<string>()))(just(1));
    expectTypeOf(result).toEqualTypeOf<Maybe<string>>();
  });

  it('foldMaybe returns union of both branches', () => {
    const result = foldMaybe(() => 'nothing', (n: number) => n.toString())(just(1));
    expectTypeOf(result).toEqualTypeOf<string>();
  });

  it('getOrElseMaybe unwraps or returns default', () => {
    expectTypeOf(getOrElseMaybe(0)(just(1))).toEqualTypeOf<number>();
    expectTypeOf(getOrElseMaybe(0)(nothing<number>())).toEqualTypeOf<number>();
  });
});

// ─── Either ──────────────────────────────────────────────────────────────────

describe('Either types', () => {
  it('right() produces Either<E, A>', () => {
    expectTypeOf(right<string, number>(42)).toEqualTypeOf<Either<string, number>>();
    expectTypeOf(right<string, string>('ok')).toEqualTypeOf<Either<string, string>>();
  });

  it('left() produces Either<E, A>', () => {
    expectTypeOf(left<string, number>('error')).toEqualTypeOf<Either<string, number>>();
    expectTypeOf(left<{ code: string }, number>({ code: 'ERR' })).toEqualTypeOf<Either<{ code: string }, number>>();
  });

  it('isRight narrows to Right<A>', () => {
    const e: Either<string, number> = right(1);
    if (isRight(e)) {
      expectTypeOf(e).toEqualTypeOf<Right<number>>();
      expectTypeOf(e.right).toEqualTypeOf<number>();
    }
  });

  it('isLeft narrows to Left<E>', () => {
    const e: Either<string, number> = left('err');
    if (isLeft(e)) {
      expectTypeOf(e).toEqualTypeOf<Left<string>>();
      expectTypeOf(e.left).toEqualTypeOf<string>();
    }
  });

  it('mapEither transforms Right value', () => {
    const e: Either<string, number> = right(2);
    const result = mapEither<string, number, number>((n) => n * 2)(e);
    expectTypeOf(result).toEqualTypeOf<Either<string, number>>();
  });

  it('chainEither transforms Right and can return new Left', () => {
    const e: Either<string, number> = right(2);
    const result = chainEither((n: number) => n > 0 ? right<string, number>(n * 2) : left<string, number>('neg'))(e);
    expectTypeOf(result).toEqualTypeOf<Either<string, number>>();
  });

  it('foldEither collapses to a single type', () => {
    const e: Either<string, number> = right(1);
    const result = foldEither((_err: string) => -1, (n: number) => n)(e);
    expectTypeOf(result).toEqualTypeOf<number>();
  });
});

// ─── IO ──────────────────────────────────────────────────────────────────────

describe('IO types', () => {
  it('io() wraps a thunk', () => {
    expectTypeOf(io(() => 42)).toEqualTypeOf<IO<number>>();
    expectTypeOf(io(() => 'hello')).toEqualTypeOf<IO<string>>();
  });

  it('liftIO() lifts a value', () => {
    expectTypeOf(liftIO(42)).toEqualTypeOf<IO<number>>();
  });

  it('mapIO transforms the inner value', () => {
    const iNum = io(() => 1);
    expectTypeOf(mapIO((n: number) => n.toString())(iNum)).toEqualTypeOf<IO<string>>();
  });
});

// ─── Lens ────────────────────────────────────────────────────────────────────

describe('Lens types', () => {
  type User = { name: string; age: number };

  it('lens() creates a correctly-typed Lens', () => {
    const nameLens = lens<User, string>(u => u.name, v => u => ({ ...u, name: v }));
    expectTypeOf(nameLens).toEqualTypeOf<Lens<User, string>>();
  });

  it('prop() creates a property lens', () => {
    const ageLens = prop<User, 'age'>('age');
    expectTypeOf(ageLens).toEqualTypeOf<Lens<User, number>>();
  });

  it('view extracts the focused value', () => {
    const nameLens = prop<User, 'name'>('name');
    const user: User = { name: 'Ada', age: 30 };
    expectTypeOf(view(nameLens)(user)).toEqualTypeOf<string>();
  });

  it('over applies fn to focused value, returns new S', () => {
    const ageLens = prop<User, 'age'>('age');
    const user: User = { name: 'Ada', age: 30 };
    expectTypeOf(over(ageLens)(n => n + 1)(user)).toEqualTypeOf<User>();
  });

  it('set replaces focused value, returns new S', () => {
    const nameLens = prop<User, 'name'>('name');
    const user: User = { name: 'Ada', age: 30 };
    expectTypeOf(set(nameLens)('Grace')(user)).toEqualTypeOf<User>();
  });

  it('composeLens composes two lenses', () => {
    type Org = { admin: User };
    const adminLens = prop<Org, 'admin'>('admin');
    const nameLens  = prop<User, 'name'>('name');
    const adminNameLens = composeLens(adminLens, nameLens);
    expectTypeOf(adminNameLens).toEqualTypeOf<Lens<Org, string>>();
  });
});

// ─── pipe / compose ──────────────────────────────────────────────────────────

describe('pipe / compose types', () => {
  it('pipe threads value through functions', () => {
    const result = pipe(1, n => n + 1, n => n.toString());
    expectTypeOf(result).toEqualTypeOf<string>();
  });

  it('compose composes right-to-left', () => {
    const fn = compose((n: number) => n.toString(), (s: string) => parseInt(s, 10));
    expectTypeOf(fn('42')).toEqualTypeOf<string>();
  });
});

// ─── EphemeralStream ─────────────────────────────────────────────────────────

describe('EphemeralStream types', () => {
  it('createEphemeralStream produces EphemeralStream<T>', () => {
    const stream = createEphemeralStream<number>();
    expectTypeOf(stream).toMatchTypeOf<EphemeralStream<number>>();
  });

  it('last is T | undefined', () => {
    const stream = createEphemeralStream<{ x: number }>();
    expectTypeOf(stream.last).toEqualTypeOf<{ x: number } | undefined>();
  });

  it('subscribe accepts typed listener', () => {
    const stream = createEphemeralStream<number>();
    expectTypeOf(stream.subscribe).parameter(0).toEqualTypeOf<(value: number) => void>();
  });
});
