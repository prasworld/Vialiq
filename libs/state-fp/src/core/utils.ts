/**
 * @vi/state-fp/core — Utility functions.
 *
 * pipe, compose, identity, constant, memoize, uuid, deepClone, shallowDiff.
 * No external dependencies; safe in all JS environments.
 */

import type { Patch } from './types.js';

// ─── pipe — left-to-right function application ───────────────────────────────

export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, f1: (a: A) => B): B;
export function pipe<A, B, C>(a: A, f1: (a: A) => B, f2: (b: B) => C): C;
export function pipe<A, B, C, D>(a: A, f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D): D;
export function pipe<A, B, C, D, E>(
  a: A, f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D, f4: (d: D) => E,
): E;
export function pipe<A, B, C, D, E, F>(
  a: A,
  f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D, f4: (d: D) => E, f5: (e: E) => F,
): F;
export function pipe<A, B, C, D, E, F, G>(
  a: A,
  f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F, f6: (f: F) => G,
): G;
export function pipe<A, B, C, D, E, F, G, H>(
  a: A,
  f1: (a: A) => B, f2: (b: B) => C, f3: (c: C) => D,
  f4: (d: D) => E, f5: (e: E) => F, f6: (f: F) => G, f7: (g: G) => H,
): H;
export function pipe(a: unknown, ...fns: Array<(x: unknown) => unknown>): unknown {
  return fns.reduce((acc, fn) => fn(acc), a);
}

// ─── compose — right-to-left function composition ────────────────────────────

export function compose<A>(a: A): A;
export function compose<A, B>(f1: (a: A) => B): (a: A) => B;
export function compose<A, B, C>(f2: (b: B) => C, f1: (a: A) => B): (a: A) => C;
export function compose<A, B, C, D>(f3: (c: C) => D, f2: (b: B) => C, f1: (a: A) => B): (a: A) => D;
export function compose<R>(...fns: Array<(x: unknown) => unknown>): (a: unknown) => R {
  return (a: unknown) => fns.reduceRight((acc, fn) => fn(acc), a) as R;
}

// ─── identity and constant ────────────────────────────────────────────────────

export const identity = <A>(a: A): A => a;

export const constant = <A>(a: A) => (_: unknown): A => a;

// ─── Memoize — single-argument function (by reference) ───────────────────────

export const memoize = <A, B>(f: (a: A) => B): ((a: A) => B) => {
  const cache = new Map<A, B>();
  return (a: A): B => {
    if (cache.has(a)) return cache.get(a) as B;
    const result = f(a);
    cache.set(a, result);
    return result;
  };
};

// ─── UUID v4 ──────────────────────────────────────────────────────────────────

/** Generate a RFC-4122 UUID v4. Prefers `crypto.randomUUID()` when available. */
export const uuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ─── Timestamp ────────────────────────────────────────────────────────────────

export const now = (): number => Date.now();

// ─── Deep Clone ───────────────────────────────────────────────────────────────

/** Deep-clone a serialisable value. Prefers `structuredClone` in modern runtimes. */
export const deepClone = <T>(value: T): T => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
};

// ─── JSON serialiser helpers ─────────────────────────────────────────────────

const REPLACER = (_key: string, value: unknown): unknown => {
  if (value instanceof Date) return { __type: 'Date',   value: value.toISOString() };
  if (value instanceof Map)  return { __type: 'Map',    entries: [...value.entries()] };
  if (value instanceof Set)  return { __type: 'Set',    values:  [...value.values()] };
  if (typeof value === 'bigint') return { __type: 'BigInt', value: value.toString() };
  return value;
};

const REVIVER = (_key: string, value: unknown): unknown => {
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    if (obj['__type'] === 'Date')   return new Date(obj['value'] as string);
    if (obj['__type'] === 'Map')    return new Map(obj['entries'] as [unknown, unknown][]);
    if (obj['__type'] === 'Set')    return new Set(obj['values'] as unknown[]);
    if (obj['__type'] === 'BigInt') return BigInt(obj['value'] as string);
  }
  return value;
};

/** Serialize any serialisable value to JSON (handles Date, Map, Set, BigInt). */
export const defaultSerialize   = <T>(v: T): string => JSON.stringify(v, REPLACER);

/** Deserialize a JSON string produced by `defaultSerialize`. */
export const defaultDeserialize = <T>(s: string): T => JSON.parse(s, REVIVER) as T;

// ─── Shallow JSON-patch diff ──────────────────────────────────────────────────

/** Compute a shallow JSON-patch-style diff between two serialisable values. */
export const shallowDiff = (prev: unknown, next: unknown): Patch[] => {
  if (prev === next) return [];
  if (
    typeof prev !== 'object' || prev === null ||
    typeof next !== 'object' || next === null
  ) {
    return [{ op: 'replace', path: '', value: next }];
  }

  const patches: Patch[] = [];
  const prevObj = prev as Record<string, unknown>;
  const nextObj = next as Record<string, unknown>;

  for (const key of Object.keys(prevObj)) {
    if (!Object.hasOwn(nextObj, key)) {
      patches.push({ op: 'remove', path: `/${key}` });
    } else if (!Object.is(prevObj[key], nextObj[key])) {
      patches.push({ op: 'replace', path: `/${key}`, value: nextObj[key] });
    }
  }
  for (const key of Object.keys(nextObj)) {
    if (!Object.hasOwn(prevObj, key)) {
      patches.push({ op: 'add', path: `/${key}`, value: nextObj[key] });
    }
  }
  return patches;
};
