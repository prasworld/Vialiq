import { describe, it, expect, vi } from 'vitest';
import {
  pipe, compose, identity, constant, memoize, uuid, now,
  deepClone, defaultSerialize, defaultDeserialize, shallowDiff,
} from './utils.js';

// ─── pipe ─────────────────────────────────────────────────────────────────────

describe('pipe', () => {
  it('returns the value unchanged with one argument', () => {
    expect(pipe(42)).toBe(42);
  });

  it('applies a single transform', () => {
    expect(pipe(5, x => x * 2)).toBe(10);
  });

  it('chains transforms left-to-right', () => {
    const result = pipe(
      1,
      x => x + 1,      // 2
      x => x * 3,      // 6
      x => `${x}!`,    // '6!'
    );
    expect(result).toBe('6!');
  });

  it('supports 7-step pipeline', () => {
    const result = pipe(
      0,
      x => x + 1,
      x => x + 1,
      x => x + 1,
      x => x + 1,
      x => x + 1,
      x => x + 1,
      x => x * 10,
    );
    expect(result).toBe(60);
  });
});

// ─── compose ─────────────────────────────────────────────────────────────────

describe('compose', () => {
  it('composes right-to-left', () => {
    const addOne  = (x: number) => x + 1;
    const double  = (x: number) => x * 2;
    // compose(addOne, double)(3) = addOne(double(3)) = 7
    const fn = compose(addOne, double);
    expect(fn(3)).toBe(7);
  });

  it('identity element: compose(f, identity) === f', () => {
    const f  = (x: number) => x + 5;
    const g  = compose(f, identity as (x: number) => number);
    expect(g(3)).toBe(f(3));
  });
});

// ─── identity ────────────────────────────────────────────────────────────────

describe('identity', () => {
  it('returns its argument unchanged', () => {
    expect(identity(42)).toBe(42);
    expect(identity('hi')).toBe('hi');
    const obj = { a: 1 };
    expect(identity(obj)).toBe(obj);
  });
});

// ─── constant ────────────────────────────────────────────────────────────────

describe('constant', () => {
  it('always returns the first argument', () => {
    const always5 = constant(5);
    expect(always5(0)).toBe(5);
    expect(always5(999)).toBe(5);
    expect(always5('anything')).toBe(5);
  });
});

// ─── memoize ─────────────────────────────────────────────────────────────────

describe('memoize', () => {
  it('caches results by first argument', () => {
    let callCount = 0;
    const expensive = memoize((n: number) => { callCount++; return n * 2; });
    expect(expensive(3)).toBe(6);
    expect(expensive(3)).toBe(6);
    expect(callCount).toBe(1); // called only once for same input
  });

  it('recomputes for different arguments', () => {
    let callCount = 0;
    const fn = memoize((n: number) => { callCount++; return n + 1; });
    fn(1);
    fn(2);
    fn(1);
    expect(callCount).toBe(2); // 1 and 2 are distinct keys
  });
});

// ─── uuid ─────────────────────────────────────────────────────────────────────

describe('uuid', () => {
  it('returns a valid UUID v4 string', () => {
    const id = uuid();
    expect(typeof id).toBe('string');
    // RFC 4122 UUID v4 pattern
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('generates unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => uuid()));
    expect(ids.size).toBe(100);
  });

  it('falls back to Math.random-based UUID when crypto.randomUUID is unavailable', () => {
    const savedCrypto = (globalThis as { crypto?: Crypto }).crypto;
    // Remove crypto to force Math.random fallback
    delete (globalThis as { crypto?: Crypto }).crypto;
    try {
      const id = uuid();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    } finally {
      (globalThis as { crypto?: Crypto }).crypto = savedCrypto;
    }
  });
});

// ─── now ─────────────────────────────────────────────────────────────────────

describe('now', () => {
  it('returns a positive number', () => {
    expect(now()).toBeGreaterThan(0);
  });

  it('is monotonically non-decreasing', () => {
    const t1 = now();
    const t2 = now();
    expect(t2).toBeGreaterThanOrEqual(t1);
  });
});

// ─── deepClone ───────────────────────────────────────────────────────────────

describe('deepClone', () => {
  it('produces a structurally equal but distinct object', () => {
    const orig = { a: 1, b: { c: 2 } };
    const cloned = deepClone(orig);
    expect(cloned).toEqual(orig);
    expect(cloned).not.toBe(orig);
    expect(cloned.b).not.toBe(orig.b);
  });

  it('clones arrays', () => {
    const arr = [1, [2, 3]];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
  });

  it('falls back to JSON round-trip when structuredClone is unavailable', () => {
    const savedStructuredClone = (globalThis as { structuredClone?: typeof structuredClone }).structuredClone;
    delete (globalThis as { structuredClone?: typeof structuredClone }).structuredClone;

    const stringifySpy = vi.spyOn(JSON, 'stringify');
    const parseSpy = vi.spyOn(JSON, 'parse');
    try {
      const orig   = { a: 1, b: { c: 2 } };
      const cloned = deepClone(orig);

      expect(cloned).toEqual(orig);
      expect(cloned).not.toBe(orig);
      expect(cloned.b).not.toBe(orig.b);

      expect(stringifySpy).toHaveBeenCalled();
      expect(parseSpy).toHaveBeenCalled();
    } finally {
      stringifySpy.mockRestore();
      parseSpy.mockRestore();
      (globalThis as { structuredClone?: typeof structuredClone }).structuredClone = savedStructuredClone;
    }
  });
});

// ─── defaultSerialize / defaultDeserialize ───────────────────────────────────

describe('defaultSerialize / defaultDeserialize round-trip', () => {
  it('handles plain objects', () => {
    const obj = { x: 1, y: 'hello' };
    expect(defaultDeserialize(defaultSerialize(obj))).toEqual(obj);
  });

  it('handles Map', () => {
    const m = new Map([['a', 1], ['b', 2]]);
    const result = defaultDeserialize<Map<string, number>>(defaultSerialize(m));
    expect(result).toBeInstanceOf(Map);
    expect(result.get('a')).toBe(1);
  });

  it('handles Set', () => {
    const s = new Set([1, 2, 3]);
    const result = defaultDeserialize<Set<number>>(defaultSerialize(s));
    expect(result).toBeInstanceOf(Set);
    expect(result.has(2)).toBe(true);
  });

  it('handles BigInt', () => {
    const big = BigInt('9007199254740993');
    const result = defaultDeserialize<bigint>(defaultSerialize(big));
    expect(result).toBe(big);
  });

  it('handles Map nested inside an object', () => {
    const obj = { data: new Map([['k', 42]]) };
    const result = defaultDeserialize<typeof obj>(defaultSerialize(obj));
    expect(result.data).toBeInstanceOf(Map);
    expect(result.data.get('k')).toBe(42);
  });
});

// ─── shallowDiff ─────────────────────────────────────────────────────────────

describe('shallowDiff', () => {
  it('returns empty array for identical references', () => {
    const obj = { a: 1 };
    expect(shallowDiff(obj, obj)).toEqual([]);
  });

  it('returns replace patch for scalar changes', () => {
    const patches = shallowDiff(1, 2);
    expect(patches).toEqual([{ op: 'replace', path: '', value: 2 }]);
  });

  it('detects replaced keys', () => {
    const prev = { a: 1, b: 2 };
    const next = { a: 1, b: 99 };
    const patches = shallowDiff(prev, next);
    expect(patches).toContainEqual({ op: 'replace', path: '/b', value: 99 });
    expect(patches.find(p => p.path === '/a')).toBeUndefined();
  });

  it('detects added keys', () => {
    const patches = shallowDiff({ a: 1 }, { a: 1, b: 2 });
    expect(patches).toContainEqual({ op: 'add', path: '/b', value: 2 });
  });

  it('detects removed keys', () => {
    const patches = shallowDiff({ a: 1, b: 2 }, { a: 1 });
    expect(patches).toContainEqual({ op: 'remove', path: '/b' });
  });

  it('handles non-object prev (replace everything)', () => {
    expect(shallowDiff(null, { a: 1 })).toEqual([{ op: 'replace', path: '', value: { a: 1 } }]);
  });
});
