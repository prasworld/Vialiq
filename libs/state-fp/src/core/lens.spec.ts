import { describe, it, expect } from 'vitest';
import {
  lens,
  prop,
  index,
  composeLens,
  view,
  over,
  set,
  optional,
} from './lens.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

type Address = { city: string; zip: string };
type Person  = { name: string; age: number; address: Address };

const alice: Person = {
  name: 'Alice',
  age: 30,
  address: { city: 'London', zip: 'EC1A' },
};

// ─── lens() ──────────────────────────────────────────────────────────────────

describe('lens', () => {
  // lens(get, curriedSet) — setter is (a: A) => (s: S) => S
  it('creates a lens from get/curried-set functions', () => {
    const ageLens = lens<Person, number>(
      p => p.age,
      (v) => (p) => ({ ...p, age: v }),
    );
    expect(view(ageLens)(alice)).toBe(30);
    const updated = set(ageLens)(31)(alice);
    expect(updated.age).toBe(31);
    expect(updated.name).toBe('Alice'); // unchanged
  });
});

// ─── prop() ──────────────────────────────────────────────────────────────────

describe('prop', () => {
  // prop<S, K>(key) — takes key directly (NOT curried twice)
  it('focuses on a single property', () => {
    const nameLens = prop<Person, 'name'>('name');
    expect(view(nameLens)(alice)).toBe('Alice');
    const updated = set(nameLens)('Bob')(alice);
    expect(updated.name).toBe('Bob');
    expect(updated.age).toBe(30); // unchanged
  });

  it('is immutable — original object is not mutated', () => {
    const nameLens = prop<Person, 'name'>('name');
    set(nameLens)('Bob')(alice);
    expect(alice.name).toBe('Alice');
  });
});

// ─── index() ─────────────────────────────────────────────────────────────────

describe('index', () => {
  // index returns OptionalLens; set is curried: set(value)(arr)
  it('focuses on an array element by position', () => {
    const secondLens = index<number>(1);
    const arr = [10, 20, 30];
    expect(secondLens.get(arr)).toBe(20);
    const updated = secondLens.set(99)(arr);
    expect(updated).toEqual([10, 99, 30]);
  });

  it('is immutable — original array is not mutated', () => {
    const arr = [1, 2, 3];
    index<number>(0).set(42)(arr);
    expect(arr[0]).toBe(1);
  });

  it('skips array slot when value is undefined (index out of bounds handling)', () => {
    const secondLens = index<number>(1);
    const arr = [10, 20, 30];
    // Calling set with undefined skips the copy[i] assignment
    const updated = (secondLens as { set: (a: number | undefined) => (arr: ReadonlyArray<number>) => ReadonlyArray<number> }).set(undefined as unknown as number)(arr);
    expect(updated).toEqual([10, 20, 30]);
  });
});

// ─── composeLens() ───────────────────────────────────────────────────────────

describe('composeLens', () => {
  it('composes two lenses to focus deeply', () => {
    const addressLens    = prop<Person, 'address'>('address');
    const cityLens       = prop<Address, 'city'>('city');
    const personCityLens = composeLens(addressLens, cityLens);

    expect(view(personCityLens)(alice)).toBe('London');
  });

  it('set updates the deeply nested value immutably', () => {
    const addressLens    = prop<Person, 'address'>('address');
    const cityLens       = prop<Address, 'city'>('city');
    const personCityLens = composeLens(addressLens, cityLens);

    const updated = set(personCityLens)('Paris')(alice);
    expect(updated.address.city).toBe('Paris');
    expect(updated.address.zip).toBe('EC1A'); // sibling unchanged
    expect(alice.address.city).toBe('London'); // original unchanged
  });

  it('over modifies via a function', () => {
    const ageLens = prop<Person, 'age'>('age');
    const updated = over(ageLens)(x => x + 1)(alice);
    expect(updated.age).toBe(31);
  });
});

// ─── view / over / set ───────────────────────────────────────────────────────

describe('view', () => {
  it('reads through a lens without modifying', () => {
    const ageLens = prop<Person, 'age'>('age');
    expect(view(ageLens)(alice)).toBe(30);
  });
});

describe('set', () => {
  it('replaces the focused value', () => {
    const ageLens = prop<Person, 'age'>('age');
    expect(set(ageLens)(99)(alice).age).toBe(99);
  });
});

describe('over', () => {
  it('applies a function to the focused value', () => {
    const ageLens = prop<Person, 'age'>('age');
    expect(over(ageLens)(n => n * 2)(alice).age).toBe(60);
  });
});

// ─── optional() ──────────────────────────────────────────────────────────────

describe('optional', () => {
  // optional<S, K>(key) — takes a keyof S, returns OptionalLens
  // get(s) returns S[K] | undefined (NOT a Maybe type)
  // set is curried: set(value)(s)
  it('get returns the value when key is present', () => {
    const opt = optional<Person, 'name'>('name');
    expect(opt.get(alice)).toBe('Alice');
  });

  it('get returns undefined when value is undefined', () => {
    type MaybeName = { name: string | undefined };
    const opt = optional<MaybeName, 'name'>('name');
    expect(opt.get({ name: undefined })).toBeUndefined();
  });

  it('set updates the value (curried)', () => {
    const opt = optional<Person, 'age'>('age');
    const updated = opt.set(25)(alice);
    expect(updated.age).toBe(25);
    expect(alice.age).toBe(30); // original unchanged
  });
});
