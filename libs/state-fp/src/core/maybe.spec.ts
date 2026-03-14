import { describe, it, expect } from 'vitest';
import {
  just,
  nothing,
  fromNullable,
  tryCatch,
  isJust,
  isNothing,
  mapMaybe,
  apMaybe,
  chainMaybe,
  foldMaybe,
  getOrElse,
  getOrElseL,
  toNullable,
  maybeToEither,
  maybeToArray,
  lift2Maybe,
  filterMaybe,
} from './maybe.js';

// All combinators in this module follow curried point-free style:
//   mapMaybe(f)(m)  — NOT mapMaybe(m, f)
// `nothing` is a zero-arg function: nothing() — NOT a constant.

// ─── Constructors ─────────────────────────────────────────────────────────────

describe('just', () => {
  it('creates a Just wrapping the value', () => {
    const m = just(42);
    expect(m._tag).toBe('Just');
    expect((m as { _tag: 'Just'; value: number }).value).toBe(42);
  });

  it('can wrap falsy values', () => {
    expect(just(0)._tag).toBe('Just');
    expect(just('')._tag).toBe('Just');
    expect(just(false)._tag).toBe('Just');
  });
});

describe('nothing', () => {
  it('creates a Nothing', () => {
    expect(nothing()._tag).toBe('Nothing');
  });
});

describe('fromNullable', () => {
  it('returns Just for non-null values', () => {
    expect(fromNullable(1)._tag).toBe('Just');
    expect(fromNullable('x')._tag).toBe('Just');
  });

  it('returns Nothing for null', () => {
    expect(fromNullable(null)._tag).toBe('Nothing');
  });

  it('returns Nothing for undefined', () => {
    expect(fromNullable(undefined)._tag).toBe('Nothing');
  });
});

describe('tryCatch', () => {
  it('returns Just when the thunk succeeds', () => {
    const m = tryCatch(() => JSON.parse('"hello"') as string);
    expect(m._tag).toBe('Just');
    expect((m as { _tag: 'Just'; value: string }).value).toBe('hello');
  });

  it('returns Nothing when the thunk throws', () => {
    const m = tryCatch<string>(() => { throw new Error('oops'); });
    expect(m._tag).toBe('Nothing');
  });
});

// ─── Type guards ──────────────────────────────────────────────────────────────

describe('isJust / isNothing', () => {
  it('isJust returns true for Just', () => {
    expect(isJust(just(1))).toBe(true);
    expect(isJust(nothing())).toBe(false);
  });

  it('isNothing returns true for Nothing', () => {
    expect(isNothing(nothing())).toBe(true);
    expect(isNothing(just(1))).toBe(false);
  });
});

// ─── Functor / Applicative / Monad ────────────────────────────────────────────

describe('mapMaybe', () => {
  it('transforms the inner value for Just', () => {
    const result = mapMaybe((x: number) => x * 3)(just(2));
    expect((result as { value: number }).value).toBe(6);
  });

  it('returns Nothing unchanged', () => {
    expect(mapMaybe((x: unknown) => x)(nothing())._tag).toBe('Nothing');
    expect(mapMaybe(() => 99)(nothing())._tag).toBe('Nothing');
  });
});

describe('apMaybe', () => {
  it('applies a Just function to a Just value', () => {
    const fn = just((x: number) => x + 10);
    const result = apMaybe(fn)(just(5));
    expect((result as { value: number }).value).toBe(15);
  });

  it('returns Nothing when function is Nothing', () => {
    expect(apMaybe(nothing<(x: number) => number>())(just(5))._tag).toBe('Nothing');
  });

  it('returns Nothing when value is Nothing', () => {
    expect(apMaybe(just((x: number) => x))(nothing<number>())._tag).toBe('Nothing');
  });
});

describe('chainMaybe', () => {
  it('chains to another Maybe for Just', () => {
    const result = chainMaybe((x: number) => (x > 0 ? just(x * 2) : nothing<number>()))(just(3));
    expect((result as { value: number }).value).toBe(6);
  });

  it('returns Nothing from the chain function', () => {
    const result = chainMaybe((x: number) => (x > 0 ? just(x) : nothing<number>()))(just(-1));
    expect(result._tag).toBe('Nothing');
  });

  it('short-circuits on Nothing input', () => {
    const result = chainMaybe(() => just(99))(nothing());
    expect(result._tag).toBe('Nothing');
  });
});

// Monad laws
describe('monad laws (maybe)', () => {
  const f = (x: number) => (x > 0 ? just(x * 2) : nothing<number>());

  it('left identity: chainMaybe(f)(just(a)) === f(a)', () => {
    const a = 5;
    const lhs = chainMaybe(f)(just(a));
    const rhs = f(a);
    expect(lhs).toEqual(rhs);
  });

  it('right identity: chainMaybe(just)(m) === m', () => {
    const m = just(7);
    expect(chainMaybe(just)(m)).toEqual(m);
  });

  it('associativity', () => {
    const g = (x: number) => just(x + 1);
    const m = just(3);
    const lhs = chainMaybe(g)(chainMaybe(f)(m));
    const rhs = chainMaybe((x: number) => chainMaybe(g)(f(x)))(m);
    expect(lhs).toEqual(rhs);
  });
});

// ─── Fold / Elimination ───────────────────────────────────────────────────────

describe('foldMaybe', () => {
  it('runs onJust for Just', () => {
    expect(foldMaybe(() => 0, (x: number) => x + 1)(just(10))).toBe(11);
  });

  it('runs onNothing for Nothing', () => {
    expect(foldMaybe(() => -1, (x: number) => x)(nothing<number>())).toBe(-1);
  });
});

describe('getOrElse', () => {
  it('returns the inner value for Just', () => {
    expect(getOrElse(0)(just(5))).toBe(5);
  });

  it('returns the default for Nothing', () => {
    expect(getOrElse(42)(nothing<number>())).toBe(42);
  });
});

describe('getOrElseL', () => {
  it('calls the thunk only for Nothing', () => {
    let called = 0;
    const result = getOrElseL(() => { called++; return 99; })(nothing<number>());
    expect(result).toBe(99);
    expect(called).toBe(1);
  });

  it('does NOT call the thunk for Just', () => {
    let called = 0;
    getOrElseL(() => { called++; return 0; })(just(1));
    expect(called).toBe(0);
  });
});

// ─── Conversions ──────────────────────────────────────────────────────────────

describe('toNullable', () => {
  it('returns the value for Just', () => {
    expect(toNullable(just('hi'))).toBe('hi');
  });

  it('returns undefined for Nothing', () => {
    expect(toNullable(nothing())).toBeUndefined();
  });
});

describe('maybeToEither', () => {
  it('converts Just to Right', () => {
    const e = maybeToEither(() => 'err')(just(1));
    expect(e._tag).toBe('Right');
  });

  it('converts Nothing to Left with the provided error', () => {
    const e = maybeToEither(() => 'missing')(nothing<number>());
    expect(e._tag).toBe('Left');
    expect((e as { left: string }).left).toBe('missing');
  });
});

describe('maybeToArray', () => {
  it('returns a single-element array for Just', () => {
    expect(maybeToArray(just(7))).toEqual([7]);
  });

  it('returns an empty array for Nothing', () => {
    expect(maybeToArray(nothing<number>())).toEqual([]);
  });
});

// ─── Utilities ────────────────────────────────────────────────────────────────

describe('lift2Maybe', () => {
  it('lifts a binary function over two Justs', () => {
    const add = (a: number, b: number) => a + b;
    expect((lift2Maybe(add)(just(3))(just(4)) as { value: number }).value).toBe(7);
  });

  it('returns Nothing if first input is Nothing', () => {
    expect(lift2Maybe((a: number, b: number) => a + b)(nothing<number>())(just(1))._tag).toBe('Nothing');
  });

  it('returns Nothing if second input is Nothing', () => {
    expect(lift2Maybe((a: number, b: number) => a + b)(just(1))(nothing<number>())._tag).toBe('Nothing');
  });
});

describe('filterMaybe', () => {
  it('keeps Just when predicate is true', () => {
    expect(filterMaybe((x: number) => x > 0)(just(5))._tag).toBe('Just');
  });

  it('converts Just to Nothing when predicate is false', () => {
    expect(filterMaybe((x: number) => x > 0)(just(-1))._tag).toBe('Nothing');
  });

  it('passes Nothing through unchanged', () => {
    expect(filterMaybe(() => true)(nothing<number>())._tag).toBe('Nothing');
  });
});
