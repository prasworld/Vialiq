/**
 * High-performance deep-clone utility for @vi/automapper.
 *
 * This module exposes a `deepClone<T>` function that produces a complete
 * structural copy of any serialisable value.  It is designed as a
 * **WASM-ready slot**: the native `structuredClone` implementation is used
 * by default, providing correct deep-cloning of all structured-cloneable
 * types (plain objects, arrays, Date, RegExp, Map, Set, TypedArrays,
 * circular references, etc.).  When a WASM binary with a native
 * deep-clone implementation is available it can be loaded via
 * `registerWasmClone()` and all subsequent `deepClone()` calls will
 * delegate to it — no changes to consumer code required.
 *
 * ## Supported types (via structuredClone)
 *
 * - Primitives: string, number, boolean, null, undefined, BigInt
 * - Objects, Arrays (deeply)
 * - Date, RegExp, Map, Set, ArrayBuffer, TypedArray
 * - Circular references (handled without errors)
 *
 * ## Not supported (structuredClone will throw)
 *
 * - Functions
 * - DOM nodes
 * - Objects with Symbol-keyed properties
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

// The default backend is the platform-native structuredClone, which is
// available in all modern browsers and Node ≥ 17 (our minimum target).
const defaultBackend: CloneBackend = structuredClone as CloneBackend;

// Module-level slot — starts as structuredClone, replaceable via registerWasmClone().
let activeBackend: CloneBackend = defaultBackend;

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
 * Reset the clone backend to the default `structuredClone` implementation.
 * Useful for test teardown after calling `registerWasmClone`.
 */
export function resetCloneBackend(): void {
  activeBackend = defaultBackend;
}

/**
 * Deep-clone any serialisable value using the active clone backend.
 *
 * The default backend is `structuredClone` (always available in modern
 * browsers and Node ≥ 17).  Non-serialisable values (functions, DOM nodes)
 * will throw a `DataCloneError` — pass only data objects to this function.
 *
 * @example
 * const copy = deepClone({ name: 'Alice', scores: [1, 2, 3] });
 * copy.scores.push(4); // original is unaffected
 */
export function deepClone<T>(value: T): T {
  return activeBackend(value);
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
