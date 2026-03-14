/**
 * @vi/state-fp/storage — Type definitions.
 *
 * All storage types. No dependency on kernel or core implementations.
 */

import type { Either, Maybe } from '../core/types.js';

// ─── Storage envelope ─────────────────────────────────────────────────────────

/**
 * The on-disk / in-map envelope that wraps every stored value.
 * `fv` is the format version — used for future migrations.
 */
export type StorageEntry<T> = {
  readonly v:   T;        // value
  readonly t:   number;   // written unix ms
  readonly x?:  number;   // expiry unix ms (absent = immortal)
  readonly tag: string;   // atom key
  readonly fv:  1;        // format version
};

// ─── Error types ──────────────────────────────────────────────────────────────

export type StorageError = {
  readonly code:    'DESERIALISE_ERROR' | 'SERIALISE_ERROR' | 'QUOTA_EXCEEDED' | 'NOT_AVAILABLE' | 'UNKNOWN';
  readonly message: string;
  readonly cause?:  unknown;
};

// ─── StorageResult ────────────────────────────────────────────────────────────

export type StorageResult<T> = Promise<Either<StorageError, T>>;

// ─── StorageAdapter interface ─────────────────────────────────────────────────

/**
 * The contract every storage backend must conform to.
 * Errors are communicated as `Left<StorageError>` — they never throw.
 *
 * Invariant (I7): Storage errors never throw — always `Either<StorageError, T>`.
 */
export interface StorageAdapter {
  readonly name: string;
  get<T>(key: string): StorageResult<Maybe<T>>;
  set<T>(key: string, value: T, ttl?: number): StorageResult<void>;
  delete(key: string): StorageResult<void>;
  clear(prefix?: string): StorageResult<void>;
  keys(prefix?: string): StorageResult<string[]>;
  exists(key: string): StorageResult<boolean>;
}
