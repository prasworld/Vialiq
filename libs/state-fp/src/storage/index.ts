/**
 * @vi/state-fp/storage
 *
 * Pluggable persistence adapters for atoms.
 *
 * - `MemoryAdapter`    — in-process Map, TTL, no persistence
 * - `LocalAdapter`     — localStorage (browser), survives page reload
 * - `SessionAdapter`   — sessionStorage (browser), tab-scoped
 * - `IndexedDbAdapter` — IndexedDB (browser), async, high-capacity
 *
 * All adapters implement `StorageAdapter` and return `StorageResult<T>`
 * (`Promise<Either<StorageError, T>>`), so failures are explicit and
 * type-safe rather than thrown.
 *
 * @module
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type {
  StorageEntry,
  StorageError,
  StorageResult,
  StorageAdapter,
} from './types.js';

// ─── Adapters ─────────────────────────────────────────────────────────────────

export { MemoryAdapter }        from './memory.js';
export { LocalAdapter }         from './local.js';
export { SessionAdapter }       from './session.js';
export { IndexedDbAdapter }     from './indexed-db.js';

// ─── Re-export options types ──────────────────────────────────────────────────

export type { MemoryAdapterOptions }    from './memory.js';
export type { IndexedDbAdapterOptions } from './indexed-db.js';
