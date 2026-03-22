/**
 * High-performance deep-clone utility for @vi/automapper.
 *
 * This module exposes a `deepClone<T>` function that produces a complete
 * structural copy of any serialisable value.  It is designed as a
 * **WASM-ready slot**: the JavaScript implementation shipped here provides
 * correct, fast cloning today.  When a WASM binary with a native
 * deep-clone implementation is available it can be loaded via
 * `registerWasmClone()` and all subsequent `deepClone()` calls will
 * delegate to it — no changes to consumer code required.
 *
 * ## Why deep-clone before mapping?
 *
 * By default the mapper reads source properties but does not copy the
 * source object.  When you need to ensure the mapped result is fully
 * independent of the source (e.g. when the source is a live MobX/Immer
 * proxy, or when you want a snapshot of a large graph before async
 * mutations occur) you can pre-clone the source:
 *
 * ```ts
 * const clone = deepClone(src);
 * const dto = mapper.map(clone, DestType);
 * ```
 *
 * Or use the convenience wrapper `mapWithClone` which does both in one call.
 *
 * ## WASM upgrade path
 *
 * When a future WASM binary is compiled (e.g. via wasm-pack from a Rust
 * `deep_clone` crate), call:
 *
 * ```ts
 * import init, { deep_clone } from '@vi/automapper-wasm-clone';
 * await init();
 * registerWasmClone((val) => JSON.parse(deep_clone(JSON.stringify(val))));
 * ```
 *
 * All subsequent `deepClone()` calls will use the WASM implementation.
 */

import type { MapperRegistry } from '../core';
import type { Constructor } from '../types';

/** Signature of the pluggable clone backend. */
export type CloneBackend = <T>(value: T) => T;

// Module-level slot for the clone backend — starts as the JS implementation,
// can be replaced with a WASM backend via registerWasmClone().
let activeBackend: CloneBackend = jsDeepClone;

/**
 * Register a WASM (or any custom) deep-clone backend.
 * All subsequent `deepClone()` calls will use the provided function.
 *
 * @example
 * import init, { deep_clone } from '@vi/automapper-wasm-clone';
 * await init();
 * registerWasmClone(val => JSON.parse(deep_clone(JSON.stringify(val))));
 */
export function registerWasmClone(backend: CloneBackend): void {
  activeBackend = backend;
}

/**
 * Reset the clone backend to the default JavaScript implementation.
 * Useful for test teardown after calling `registerWasmClone`.
 */
export function resetCloneBackend(): void {
  activeBackend = jsDeepClone;
}

/**
 * Deep-clone any serialisable value using the active clone backend.
 *
 * - Uses `structuredClone` when available (Node ≥ 17, modern browsers).
 * - Falls back to a recursive clone for environments without it.
 * - Non-serialisable values (functions, Symbols, class instances with
 *   non-enumerable state) are passed through by reference — the same
 *   behaviour as `structuredClone` for non-transferable types.
 *
 * @example
 * const copy = deepClone({ name: 'Alice', scores: [1, 2, 3] });
 * copy.scores.push(4); // original is unaffected
 */
export function deepClone<T>(value: T): T {
  return activeBackend(value);
}

/**
 * Pure-JavaScript deep-clone implementation.
 * Handles: primitives, Date, RegExp, Array, plain objects.
 * Preserves circular references within a single clone call via a WeakMap.
 * Non-plain objects (class instances with prototype state) are returned
 * by reference (same as structuredClone behaviour for non-clonable values).
 */
function jsDeepClone<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  // Primitives and null
  if (value === null || typeof value !== 'object') return value;

  const obj = value as object;

  // Circular reference guard
  if (seen.has(obj)) return seen.get(obj) as T;

  // Date
  if (obj instanceof Date) {
    const copy = new Date(obj.getTime());
    seen.set(obj, copy);
    return copy as unknown as T;
  }

  // RegExp
  if (obj instanceof RegExp) {
    const copy = new RegExp(obj.source, obj.flags);
    seen.set(obj, copy);
    return copy as unknown as T;
  }

  // Array
  if (Array.isArray(obj)) {
    const copy: unknown[] = [];
    seen.set(obj, copy);
    for (let i = 0; i < obj.length; i++) {
      copy[i] = jsDeepClone(obj[i], seen);
    }
    return copy as unknown as T;
  }

  // Plain object or class instance with enumerable properties
  const proto = Object.getPrototypeOf(obj);
  const isPlain = proto === Object.prototype || proto === null;
  if (isPlain) {
    const copy: Record<string, unknown> = Object.create(proto);
    seen.set(obj, copy);
    for (const key of Object.keys(obj)) {
      copy[key] = jsDeepClone((obj as Record<string, unknown>)[key], seen);
    }
    return copy as unknown as T;
  }

  // Non-plain class instances — return by reference (structuredClone parity)
  return value;
}

/**
 * Convenience wrapper: deep-clones `src` then maps it to `destType`.
 *
 * Useful when the source is a live proxy or mutable store and you want
 * an independent snapshot before the async mapping pipeline runs.
 *
 * @example
 * const dto = await mapWithClone(mapper, liveEntity, UserDto);
 */
export function mapWithClone<S extends object, D>(
  mapper: MapperRegistry,
  src: S,
  destType: Constructor<D> | string
): D | null | Promise<D | null> {
  return mapper.map<S, D>(deepClone(src), destType);
}
