/**
 * @vi/state-fp/storage — Memory-Only Storage Module.
 *
 * ARCHITECTURAL SECURITY DECISION: @vi/state-fp enforces memory-only storage for all
 * application state. Browser-persistent storage (localStorage, sessionStorage, IndexedDB)
 * is NOT available from this module.
 *
 * ## Available Adapters
 *
 * - `MemoryAdapter`    — In-process Map (JS heap), TTL, automatic cleanup
 *   ✅ Ephemeral (cleared on page reload)
 *   ✅ Invisible to DevTools (js heap only, no browser inspection)
 *   ✅ No plaintext on disk
 *   ✅ Matches Redux/NgRx production posture
 *
 * ## Why No Browser Persistence
 *
 * All browser-persistent storage suffers from fundamental vulnerabilities:
 *  • Data stored in plaintext (zero encryption)
 *  • Accessible via browser DevTools with minimal knowledge
 *  • Vulnerable to XSS attacks (malicious JS can read all data)
 *  • No application-level access control within same-origin
 *
 * For internal contractors, disgruntled employees, or social engineers,
 * production secrets (auth tokens, API keys, user PII) stored in localStorage/IndexedDB
 * can be extracted in seconds using DevTools.
 *
 * This is not a temporary limitation — it is a core security constraint.
 *
 * ## For Non-Sensitive Configuration Data
 *
 * If you need to persist non-sensitive data (theme, locale, feature flags),
 * use the separate `@vi/config` library:
 *   - Explicit persistence semantics
 *   - Can use LocalAdapter, SessionAdapter, IndexedDbAdapter
 *   - Clear separation of concerns from application state
 *
 * ## Result Type Safety
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
  StorageSecurityPolicy,
} from './types.js';

// ─── Adapters ─────────────────────────────────────────────────────────────────

export { MemoryAdapter }        from './memory.js';

// ─── Re-export options types ──────────────────────────────────────────────────

export type { MemoryAdapterOptions }       from './memory.js';
