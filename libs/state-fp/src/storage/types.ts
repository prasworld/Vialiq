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

// ─── Security Policy ──────────────────────────────────────────────────────

/**
 * Declares the browser-storage visibility posture of an atom.
 *
 * ⚠️ **@vi/state-fp enforces MEMORY-ONLY storage exclusively.**
 * Only `'memory-only'` is supported. Other policies are intentionally excluded
 * from the type union as a design constraint (enforced by `storage-guard.ts`).
 *
 * | Policy           | Persistence | DevTools Access | Plaintext on Disk | Use Case |
 * |------------------|-------------|-----------------|-------------------|----------|
 * | `memory-only`    | No          | No (JS heap)    | No                | ✅ Only supported policy in @vi/state-fp |
 *
 * ### Why Only Memory-Only Storage?
 *
 * Previous designs considered `visible` and `obfuscated` policies for browser storage adapters:
 *   - `visible`: localStorage/IndexedDB with plaintext storage → DevTools accessible
 *   - `obfuscated`: localStorage/IndexedDB with SHA-256 key hashing → false sense of security
 *
 * Both were **permanently removed** (source files deleted) because:
 *   1. **Plaintext data is always readable via DevTools** even when keys are hashed
 *   2. **Values are ALWAYS plaintext** on disk (no client-side encryption)
 *   3. **Obfuscating keys provides zero security** — only hides values from casual inspection
 *   4. **XSS attackers can read all data** regardless of policy (no access control at app level)
 *   5. **Malicious insiders** with physical/DevTools access can inspect memory dumps
 *
 * ### Why There is No `encrypted` Policy
 *
 * Client-side encryption is NOT a security control for browser DevTools visibility.
 * The encryption key (or the secret used to derive it) must arrive in JavaScript as a
 * plaintext string — any debugger breakpoint on the network response exposes it.
 *
 * After decryption, the plaintext value exists in the JS heap and is visible to the
 * browser's Memory profiler. An attacker with DevTools access can also call
 * `crypto.subtle.decrypt()` themselves using the IV and ciphertext from Application storage.
 *
 * **Conclusion**: For sensitive application state, the ONLY secure pattern is memory-only
 * (matching Redux, NgRx, Zustand, etc. in production mode).
 *
 * This is the same conclusion reached by Redux, NgRx, MobX, and Zustand:
 * none of them offer encryption; all of them recommend:
 *   1. `stateSanitizer` — redact sensitive fields in DevTools output only (debug mode).
 *   2. `memory-only` — for data that must not survive a page reload (tokens, credentials).
 *   3. Don't persist sensitive data client-side — refetch from the server after auth.
 *
 * ### Migration from Earlier Versions
 *
 * If upgrading from 0.1.x which shipped LocalAdapter, SessionAdapter, IndexedDbAdapter:
 *   - Remove all references to those adapters
 *   - Use MemoryAdapter (or no storage) in production for sensitive state
 *   - Store non-sensitive UI state (theme, locale, feature flags) in localStorage manually
 *     (as a separate layer, e.g. via a new `@vi/config` library in a future phase)
 */
export type StorageSecurityPolicy = 'memory-only';

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
