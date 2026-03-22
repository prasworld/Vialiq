import { describe, it, expect } from 'vitest';
import {
  left,
  right,
  fromNullableEither,
  fromTry,
  fromTryAsync,
  isLeft,
  isRight,
  mapEither,
  bimapEither,
  mapLeft,
  chainEither,
  foldEither,
  apEither,
  getOrElse,
  getOrElseL,
  eitherToMaybe,
  sequenceEither,
  swapEither,
} from './either.js';
import type { Either } from './types.js';

// ─── Constructors ─────────────────────────────────────────────────────────────

describe('left / right', () => {
  it('left creates a Left value', () => {
    const e = left('error');
    expect(e._tag).toBe('Left');
    expect((e as { left: string }).left).toBe('error');
  });

  it('right creates a Right value', () => {
    const e = right(42);
    expect(e._tag).toBe('Right');
    expect((e as { right: number }).right).toBe(42);
  });
});

describe('fromNullableEither', () => {
  // Signature: fromNullableEither(() => E)(a) — curried with thunk for Left value
  it('returns Right for non-null', () => {
    expect(fromNullableEither(() => 'missing')(5)._tag).toBe('Right');
  });

  it('returns Left for null', () => {
    const e = fromNullableEither(() => 'missing')(null);
    expect(e._tag).toBe('Left');
    expect((e as { left: string }).left).toBe('missing');
  });

  it('returns Left for undefined', () => {
    expect(fromNullableEither(() => 'err')(undefined)._tag).toBe('Left');
  });
});

// ─── fromTry ─────────────────────────────────────────────────────────────────

describe('fromTry', () => {
  // Signature: fromTry(f, onError) — NOT curried; needs error mapper
  it('returns Right when thunk succeeds', () => {
    const e = fromTry(() => JSON.parse('"hi"') as string, (err) => err);
    expect(e._tag).toBe('Right');
    expect((e as { right: string }).right).toBe('hi');
  });

  it('returns Left wrapping the mapped error when thunk throws', () => {
    const e = fromTry<unknown, string>(() => { throw new Error('bang'); }, (err) => err);
    expect(e._tag).toBe('Left');
    expect((e as { left: unknown }).left).toBeInstanceOf(Error);
  });
});

describe('fromTryAsync', () => {
  it('returns Right when promise resolves', async () => {
    const e = await fromTryAsync(() => Promise.resolve(99), (err) => err);
    expect(e._tag).toBe('Right');
    expect((e as { right: number }).right).toBe(99);
  });

  it('returns Left when promise rejects', async () => {
    const e = await fromTryAsync<unknown, number>(
      () => Promise.reject(new Error('async fail')),
      (err) => err,
    );
    expect(e._tag).toBe('Left');
    expect((e as { left: unknown }).left).toBeInstanceOf(Error);
  });
});

// ─── Type guards ──────────────────────────────────────────────────────────────

describe('isLeft / isRight', () => {
  it('isLeft', () => {
    expect(isLeft(left(1))).toBe(true);
    expect(isLeft(right(1))).toBe(false);
  });

  it('isRight', () => {
    expect(isRight(right(1))).toBe(true);
    expect(isRight(left(1))).toBe(false);
  });
});

// ─── Functor / Applicative / Monad ────────────────────────────────────────────

describe('mapEither', () => {
  // Curried: mapEither(f)(e)
  it('transforms Right', () => {
    const e = mapEither((x: number) => x * 2)(right(3));
    expect((e as { right: number }).right).toBe(6);
  });

  it('passes Left through unchanged', () => {
    const e = mapEither((x: number) => x * 2)(left('err'));
    expect(e._tag).toBe('Left');
    expect((e as { left: string }).left).toBe('err');
  });
});

describe('bimapEither', () => {
  // Curried: bimapEither(onLeft, onRight)(e)
  it('maps over Right', () => {
    const e = bimapEither((e: string) => `E:${e}`, (x: number) => x + 1)(right(5));
    expect((e as { right: number }).right).toBe(6);
  });

  it('maps over Left', () => {
    const e = bimapEither((e: string) => `E:${e}`, (x: number) => x)(left('fail'));
    expect((e as { left: string }).left).toBe('E:fail');
  });
});

describe('mapLeft', () => {
  // Curried: mapLeft(f)(e)
  it('maps over Left', () => {
    const e = mapLeft((n: number) => `code:${n}`)(left(42));
    expect((e as { left: string }).left).toBe('code:42');
  });

  it('passes Right through', () => {
    expect(mapLeft(() => 'x')(right('ok'))._tag).toBe('Right');
  });
});

describe('chainEither', () => {
  // Curried: chainEither(f)(e)
  it('chains Right → Right', () => {
    const e = chainEither((x: number) => right(x * 2))(right(4));
    expect((e as { right: number }).right).toBe(8);
  });

  it('chains Right → Left', () => {
    const e = chainEither((x: number) => (x > 0 ? right(x) : left('negative')))(right(-1));
    expect(e._tag).toBe('Left');
  });

  it('short-circuits on Left input', () => {
    const e = chainEither(() => right(99))(left('err'));
    expect(e._tag).toBe('Left');
    expect((e as { left: string }).left).toBe('err');
  });
});

// Monad laws
describe('monad laws (Either)', () => {
  const f = (x: number): Either<string, number> => x > 0 ? right(x * 2) : left('negative');

  it('left identity: chainEither(f)(right(a)) === f(a)', () => {
    const a = 3;
    expect(chainEither(f)(right(a))).toEqual(f(a));
  });

  it('right identity: chainEither(right)(m) === m', () => {
    const m = right(7);
    expect(chainEither(right)(m)).toEqual(m);
  });

  it('associativity', () => {
    const g = (x: number): Either<string, number> => right(x + 1);
    const m = right(2);
    const lhs = chainEither(g)(chainEither(f)(m));
    const rhs = chainEither((x: number) => chainEither(g)(f(x)))(m);
    expect(lhs).toEqual(rhs);
  });
});

describe('foldEither', () => {
  // Curried: foldEither(onLeft, onRight)(e)
  it('uses onRight for Right', () => {
    expect(foldEither(() => -1, (x: number) => x + 1)(right(5))).toBe(6);
  });

  it('uses onLeft for Left', () => {
    expect(foldEither((e: string) => e.toUpperCase(), () => '')(left('err'))).toBe('ERR');
  });
});

describe('apEither', () => {
  // Curried: apEither(ef)(ea)
  it('applies Right function to Right value', () => {
    const fn = right((x: number) => x * 3);
    expect((apEither(fn)(right(4)) as { right: number }).right).toBe(12);
  });

  it('returns Left when function is Left', () => {
    expect(apEither(left('no fn'))(right(4))._tag).toBe('Left');
  });

  it('returns Left when value is Left', () => {
    expect(apEither(right((x: number) => x))(left('no val'))._tag).toBe('Left');
  });
});

// ─── getOrElse / getOrElseL ───────────────────────────────────────────────────

describe('getOrElse', () => {
  // Curried: getOrElse(defaultValue)(e)
  it('returns Right value', () => {
    expect(getOrElse(0)(right(10))).toBe(10);
  });

  it('returns default for Left', () => {
    expect(getOrElse(99)(left('err'))).toBe(99);
  });
});

describe('getOrElseL', () => {
  // Curried: getOrElseL(errMapper)(e) — errMapper receives the Left value
  it('calls thunk only for Left', () => {
    let called = 0;
    expect(getOrElseL((err: string) => { called++; return 7; })(left('x'))).toBe(7);
    expect(called).toBe(1);
  });

  it('does NOT call thunk for Right', () => {
    let called = 0;
    getOrElseL((err: string) => { called++; return 0; })(right(5));
    expect(called).toBe(0);
  });
});

// ─── Conversions ──────────────────────────────────────────────────────────────

describe('eitherToMaybe', () => {
  it('Right → Just', () => {
    expect(eitherToMaybe(right(3))._tag).toBe('Just');
  });

  it('Left → Nothing', () => {
    expect(eitherToMaybe(left('err'))._tag).toBe('Nothing');
  });
});

describe('sequenceEither', () => {
  it('returns Right of array when all are Right', () => {
    const e = sequenceEither([right(1), right(2), right(3)]);
    expect(e._tag).toBe('Right');
    expect((e as { right: number[] }).right).toEqual([1, 2, 3]);
  });

  it('returns first Left when any is Left', () => {
    const e = sequenceEither([right(1), left('fail'), right(3)]);
    expect(e._tag).toBe('Left');
    expect((e as { left: string }).left).toBe('fail');
  });

  it('returns Right [] for empty array', () => {
    const e = sequenceEither([]);
    expect(e._tag).toBe('Right');
    expect((e as { right: unknown[] }).right).toEqual([]);
  });
});

describe('swapEither', () => {
  it('swaps Right to Left', () => {
    expect(swapEither(right('x'))._tag).toBe('Left');
    expect((swapEither(right('x')) as { left: string }).left).toBe('x');
  });

  it('swaps Left to Right', () => {
    expect(swapEither(left(42))._tag).toBe('Right');
    expect((swapEither(left(42)) as { right: number }).right).toBe(42);
  });
});

// ─── Idiomatic Result API ─────────────────────────────────────────────────────

import { ok, err, isOk, isErr, match } from './either.js';

describe('ok / err constructors', () => {
  it('ok(value) produces the same structure as right(value)', () => {
    expect(ok(42)).toEqual(right(42));
  });

  it('err(error) produces the same structure as left(error)', () => {
    expect(err('bad')).toEqual(left('bad'));
  });
});

describe('isOk / isErr guards', () => {
  it('isOk returns true for ok()', () => {
    expect(isOk(ok(1))).toBe(true);
  });

  it('isOk returns false for err()', () => {
    expect(isOk(err('x'))).toBe(false);
  });

  it('isErr returns true for err()', () => {
    expect(isErr(err('x'))).toBe(true);
  });

  it('isErr returns false for ok()', () => {
    expect(isErr(ok(1))).toBe(false);
  });

  it('isOk and isRight agree on the same value', () => {
    const r = ok(99);
    expect(isOk(r)).toBe(isRight(r));
  });

  it('isErr and isLeft agree on the same value', () => {
    const r = err('e');
    expect(isErr(r)).toBe(isLeft(r));
  });
});

describe('match', () => {
  it('calls ok branch with the value for a success', () => {
    const result = match(ok(42), {
      ok:  (v) => v * 2,
      err: ()  => -1,
    });
    expect(result).toBe(84);
  });

  it('calls err branch with the error for a failure', () => {
    const result = match(err('boom'), {
      ok:  ()    => 'success',
      err: (msg) => `failed: ${msg}`,
    });
    expect(result).toBe('failed: boom');
  });

  it('is a total function — both branches must return the same type', () => {
    // Type-check: ok and err must agree on return type R
    const n: number = match(ok<string, number>(5), {
      ok:  (v) => v,
      err: ()  => 0,
    });
    expect(n).toBe(5);
  });

  it('works identically on a value produced by right()', () => {
    const r = right(7);
    expect(match(r, { ok: (v) => v, err: () => -1 })).toBe(7);
  });

  it('works identically on a value produced by left()', () => {
    const r = left('nope');
    expect(match(r, { ok: () => 'yes', err: (e) => e })).toBe('nope');
  });

  it('propagates exceptions thrown from both branches', () => {
    const r = left('error');
    expect(() => match(r, {
      ok: () => { throw new Error('ok failed'); },
      err: () => { throw new Error('err failed'); },
    })).toThrow('err failed');
  });
});

// ─── Realistic command handler usage ─────────────────────────────────────────

describe('ok / err in a command handler pattern', () => {
  type CounterState = { count: number };
  interface IncrPayload { by: number }

  function handleIncrement(state: CounterState, payload: IncrPayload) {
    if (payload.by <= 0) {
      return err({ code: 'INVALID' as const, message: 'by must be > 0' });
    }
    return ok({ count: state.count + payload.by });
  }

  it('returns ok for valid command', () => {
    const result = handleIncrement({ count: 0 }, { by: 5 });
    expect(isOk(result)).toBe(true);
    expect(match(result, { ok: (s) => s.count, err: () => -1 })).toBe(5);
  });

  it('returns err for invalid command', () => {
    const result = handleIncrement({ count: 0 }, { by: -1 });
    expect(isErr(result)).toBe(true);
    expect(match(result, { ok: () => '', err: (e) => e.code })).toBe('INVALID');
  });
});
