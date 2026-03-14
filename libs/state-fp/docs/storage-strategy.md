# Storage Strategy

> Part of `@vi/state-fp` — persistence layer reference.

---

## Overview

Storage in `@vi/state-fp` is a **first-class citizen**, not a plugin.
Every atom declares its persistence strategy at definition time. The kernel
hydrates all atoms from storage at startup and writes through on every
successful command execution.

The storage layer is built on a single `StorageAdapter` interface so that
any backend — in-memory, browser storage, IndexedDB, or custom — can be
used interchangeably.

---

## 1. Principles

| Principle | Description |
|---|---|
| **Declarative** | Storage backend, key, TTL, and serialiser are declared on the atom, not in reducer logic |
| **Fail-safe** | Storage errors never crash the store; they produce typed `Either<StorageError, T>` values |
| **Transparent** | Storage reads and writes are traced in the event log |
| **Pluggable** | Any class implementing `StorageAdapter` is a valid backend |
| **Isolated** | Each atom uses a distinct storage key; no namespace collisions |
| **Secure by Default** | Sensitive atoms should declare a `StorageSecurityPolicy`; localStorage/sessionStorage values are plaintext-visible in browser DevTools — treat them accordingly |

---

## 2. StorageAdapter Interface

```ts
type StorageError = {
  readonly code:    'NOT_FOUND' | 'SERIALISE_ERROR' | 'DESERIALISE_ERROR' | 'QUOTA_EXCEEDED' | 'UNKNOWN';
  readonly message: string;
  readonly cause?:  unknown;
};

type StorageResult<T> = Promise<Either<StorageError, T>>;

interface StorageAdapter {
  /** Human-readable backend name — used in debug traces */
  readonly name: string;

  /** Read a value by key. Returns Nothing on miss or expired entry. */
  get<T>(key: string): StorageResult<Maybe<T>>;

  /** Write a value. TTL in milliseconds; undefined = no expiry. */
  set<T>(key: string, value: T, ttl?: number): StorageResult<void>;

  /** Remove a key. Resolves Right(void) even if key not present. */
  delete(key: string): StorageResult<void>;

  /** Remove all keys matching an optional prefix, or all keys if no prefix. */
  clear(prefix?: string): StorageResult<void>;

  /** List all keys matching an optional prefix. */
  keys(prefix?: string): StorageResult<string[]>;

  /** Check if a key exists and is not expired. */
  exists(key: string): StorageResult<boolean>;
}
```

---

## 3. Storage Envelope

Every value stored by any adapter is wrapped in a metadata envelope before
serialisation. This makes the format self-describing and allows TTL
enforcement on both read and background sweeps.

```ts
type StorageEntry<T> = {
  /** The stored value */
  v:  T;
  /** Write timestamp in epoch milliseconds */
  t:  number;
  /** Expiry timestamp in epoch milliseconds. Absent = immortal. */
  x?: number;
  /** Atom key — used for prefix queries and grouped invalidation */
  tag: string;
  /** Adapter-specific format version */
  fv: 1;
};
```

### Serialised form (JSON)

```json
{
  "v":  { "count": 3 },
  "t":  1741200000000,
  "x":  1741286400000,
  "tag": "vi/counter",
  "fv": 1
}
```

---

## 4. Built-in Adapters

### 4.1 MemoryAdapter

```
Backend:    JavaScript Map<string, StorageEntry<unknown>>
Durability: Process lifetime only — lost on page reload / tab close
Async:      Synchronous operations wrapped in resolved Promises
Capacity:   Only limited by JS heap
TTL:        Enforced on every read; optional background sweep
```

**Implementation notes:**
- Default adapter when no `storage` config is set on an atom
- Suitable for ephemeral UI state, caches, computed intermediaries
- The background sweep runs every 60 seconds when `debug: false`; every 10
  seconds in debug mode to keep metrics accurate

```ts
const adapter = new MemoryAdapter({ sweepIntervalMs: 60_000 });
```

### 4.2 SessionAdapter

```
Backend:    window.sessionStorage
Durability: Tab session — survives page refresh, lost on tab close
Async:      Synchronous (wrapped)
Capacity:   ~5 MB (browser-dependent)
TTL:        Enforced via envelope.x on read
```

**Implementation notes:**
- All values are JSON-serialised through the StorageEntry envelope
- Quota errors (`DOMException: QuotaExceededError`) are caught and returned
  as `left({ code: 'QUOTA_EXCEEDED', ... })`
- Keys are automatically namespaced with the atom's `storage.key` — no
  conflict with other libraries using sessionStorage

```ts
const adapter = new SessionAdapter();
```

### 4.3 LocalAdapter

```
Backend:    window.localStorage
Durability: Persistent — survives browser restart
Async:      Synchronous (wrapped)
Capacity:   ~10 MB (browser-dependent)
TTL:        Enforced via envelope.x on read
```

**Implementation notes:**
- Ideal for user preferences, tokens, theme settings, onboarding state
- Same quota error handling as SessionAdapter
- Can be used with a custom serialiser (e.g. LZString compression for large
  state slices)

```ts
const adapter = new LocalAdapter();
```

### 4.4 IndexedDbAdapter

```
Backend:    window.indexedDB (IDBObjectStore)
Durability: Persistent — survives browser restart and device reboot
Async:      Fully async — all methods return Promises
Capacity:   50 MB–1 GB (origin quota + browser limits)
TTL:        Enforced on read + background sweep using IDBIndex on `x`
```

**Implementation notes:**
- Wraps IDB with a clean promise-based API; no third-party IDB wrappers used
- Uses a single database (`vi-state-fp`) with one object store per adapter
  instance. The object store is named by the `storeName` option.
- Transaction retry logic: if a transaction times out (>5 s), the adapter
  retries once then returns `left({ code: 'UNKNOWN', ... })`
- Background TTL sweep uses `IDBIndex` on the `x` field for efficient range
  deletion without a full table scan

```ts
const adapter = new IndexedDbAdapter({
  dbName:    'vi-state-fp',
  storeName: 'atoms',
  version:   1,
});

// Must be opened before use (async)
await adapter.open();
```

---

## 5. Hydration Pipeline

At `kernel.hydrate()`, the kernel iterates all registered atoms and attempts
to restore their state from storage in priority order.

### Priority Order

```
IndexedDB → localStorage → sessionStorage → memory → initialState
```

Each adapter returns `Maybe<T>`:
- `Just(value)` — hydration succeeds; store updates the atom
- `Nothing`      — key absent or expired; fall through to next adapter
- `Left(error)`  — adapter error; log warning, fall through to next

```ts
async function hydrateAtom<S>(atom: Atom<S>, adapters: StorageAdapter[]): Promise<S> {
  for (const adapter of adapters) {
    const result = await adapter.get<S>(atom.definition.storage?.key ?? atom.definition.key);
    if (isRight(result) && isJust(result.right)) {
      return result.right.value; // ✅ restored
    }
  }
  return atom.definition.initialState; // 🔄 fallback
}
```

### Parallel Hydration

All atoms are hydrated in parallel using `Promise.allSettled`:

```ts
await Promise.allSettled(
  kernel.listAtoms().map(atom => hydrateAtom(atom, adapters))
);
```

Failures on individual atoms do not block other atoms from hydrating.

---

## 6. Write-Through on Execute

After each successful command execution (Right path in the CQRS pipeline),
the new atom state is written to the atom's configured storage backend.

```
kernel.execute(atom, command)
  └── CommandHandler.handle → Right(events[])
        └── EventApplier.apply → nextState
              └── storageAdapter.set(key, nextState, ttl)  ← write-through
                    └── notifySubscribers
```

Storage write errors are:
- Logged to the event log as a `DebugEntry` with `error.code: 'STORAGE_WRITE_ERROR'`
- Surfaced according to the `storageErrorBehavior` setting — by default (`'warn'`) execution still
  returns `Right(newState)` so the in-memory state is always consistent

### Write-Through Options

```ts
type StoreOptions = {
  storageErrorBehavior:
    | 'warn'   // log warning, return Right anyway (default)
    | 'throw'  // throw StorageError (for strict environments)
    | 'ignore' // silent — useful during tests
};
```

---

## 7. TTL Enforcement

TTL (time-to-live) is specified in milliseconds on the `StorageConfig`.

```ts
const userSessionAtom = defineAtom({
  key: 'vi/user-session',
  initialState: null,
  storage: {
    backend: 'local',
    key: 'vi:userSession',
    ttl: 30 * 60 * 1000, // 30 minutes
  },
});
```

### How TTL Works

1. On `adapter.set()`, the expiry timestamp is computed:
   `entry.x = Date.now() + ttl`
2. On `adapter.get()`, if `entry.x !== undefined && Date.now() > entry.x`,
   the entry is deleted and `Nothing` is returned — triggering fallback to
   `initialState`
3. Background sweeps (`MemoryAdapter`, `IndexedDbAdapter`) periodically
   remove expired entries to avoid unbounded growth

### TTL Extension (Sliding Window)

To implement "session keeps alive while user is active", execute any command
against the atom — the write-through on each `kernel.execute()` will reset the TTL clock.

---

## 8. Data Invalidation

### 8.1 Explicit Invalidation via Command

> Phase 2 planned API

```ts
// Dispatching the built-in invalidate command resets the atom
kernel.execute(userAtom, command('vi/invalidate', {}));

// The kernel will:
// 1. Delete the storage entry
// 2. Reset atom state to initialState
// 3. Log a DebugEntry with commandType 'vi/invalidate'
// 4. Notify all atom subscribers
```

### 8.2 Cascading Invalidation Rules

> Phase 2 planned API

```ts
// When userAtom is invalidated, also invalidate these dependents
kernel.addInvalidationRule(userAtom, [dashboardAtom, cartAtom]);
```

Rules are evaluated breadth-first. Cycles are detected and stopped.

### 8.3 Bulk Invalidation

> Phase 2 planned API

```ts
// Invalidate all atoms with a given prefix
kernel.invalidateByPrefix('vi/user');

// Invalidate all atoms
kernel.invalidateAll();
```

### 8.4 Cross-MFE Invalidation via BroadcastChannel

When a storage entry is invalidated in one MFE, a message is broadcast
so peer MFEs can sync:

```ts
type InvalidateBroadcast = {
  type:          'vi/state-fp/invalidate';
  atomKey:       string;
  correlationId: string;
  timestamp:     number;
  origin:        string; // MFE identifier
};
```

Receiving MFEs apply the invalidation without re-dispatching events
(to avoid feedback loops).

---

## 9. Custom Serialisation

By default, values are serialised using a `JSON.stringify` / `JSON.parse`
pair with a replacer that handles `Date`, `Map`, `Set`, and `BigInt`.

For atoms with special types:

```ts
const settingsAtom = defineAtom({
  key: 'vi/settings',
  initialState: new Map<string, boolean>(),
  storage: {
    backend: 'local',
    key: 'vi:settings',
    serialize:   (v: Map<string, boolean>) => JSON.stringify([...v.entries()]),
    deserialize: (s: string) => new Map(JSON.parse(s) as [string, boolean][]),
  },
});
```

Kernel-level custom serialiser (applies to all atoms unless overridden at atom-level):

> Phase 2 planned API

```ts
const kernel = createKernel({
  serialiser: {
    serialize:   (v) => superjson.stringify(v),
    deserialize: (s) => superjson.parse(s),
  },
});
```

---

## 10. Storage Quota Handling

| Condition | Behavior |
|---|---|
| `DOMException: QuotaExceededError` | Returns `Left({ code: 'QUOTA_EXCEEDED' })` |
| `storageErrorBehavior: 'warn'` | Latest state kept in memory; warning in event log |
| `storageErrorBehavior: 'throw'` | `StorageError` thrown at call site |
| Eviction policy | LRU eviction from the oldest atom-key entries, configurable via `maxStorageBytes` |

> Phase 2 planned API

```ts
const kernel = createKernel({
  storageErrorBehavior: 'warn',
  maxStorageBytes: 2 * 1024 * 1024, // 2 MB soft cap for MemoryAdapter
});
```

---

## 11. Testing Storage

Every `StorageAdapter` is independently testable against a shared contract
test suite via `createAdapterContract(adapter)`.

```ts
import { createAdapterContract } from '@vi/state-fp/testing';

describe('MyCustomAdapter', () => {
  createAdapterContract(() => new MyCustomAdapter());
});
```

The contract suite exercises:
- Basic get/set/delete/clear/keys/exists
- TTL expiry
- Large value handling
- Concurrent writes
- Error scenarios (quota, serialise errors)

---

## 12. Production Storage Security

> **Critical:** `localStorage`, `sessionStorage`, and `IndexedDB` are all fully readable in
> Chrome DevTools → Application tab. Any value stored there in plaintext is visible to anyone
> with physical access to the device and a browser. **Never store sensitive state in browser
> storage without appropriate protection.**

### What "visible" means

```
Chrome DevTools → Application → Storage → Local storage → https://app.example.com
  Key                         Value
  ──────────────────────────────────────────────────────────────
  vi:user-session             {"token":"eyJhbGciO...", "userId":"u_12345"}  ← PLAINTEXT
  vi:cart                     {"items":[{"sku":"ABC","price":29.99}]}        ← PLAINTEXT
```

Every developer, QA engineer, or support agent who opens DevTools on a production machine
can read this data instantly. In regulated industries (HIPAA, PCI-DSS, GDPR), this
constitutes a data handling violation.

### Browser DevTools Visibility Matrix

| Adapter | Visible in DevTools? | Notes |
|---|---|---|
| `MemoryAdapter` | ❌ Never | JS heap only — no DevTools surface |
| `SessionAdapter` | ✅ Always (plaintext) | Application → Session Storage |
| `LocalAdapter` | ✅ Always (plaintext) | Application → Local Storage |
| `IndexedDbAdapter` | ✅ Always (plaintext) | Application → IndexedDB |
| `ObfuscatedAdapter(Local)` | ⚠️ Key hidden, value plain | Application → Local Storage |
| `EncryptedAdapter(Local)` | ✅ Key hidden, value ciphertext | Application → Local Storage |

### StorageSecurityPolicy Types

```ts
/**
 * Declares what level of protection is applied to a stored atom.
 * Set as `storage.security` on the atom definition.
 */
type StorageSecurityPolicy =
  | 'visible'      // default — keys + values readable; suitable for non-sensitive state
  | 'obfuscated'   // keys SHA-256 hashed; values still plaintext — prevents structure inference
  | 'encrypted'    // keys hashed + values AES-GCM encrypted via SubtleCrypto
  | 'memory-only'; // MemoryAdapter regardless of declared adapter — invisible, non-persistent
```

### ObfuscatedAdapter — Hiding the Key

When your data is not sensitive but you don't want the storage key to reveal the application's
internal structure, wrap any adapter with `ObfuscatedAdapter`:

```ts
import { ObfuscatedAdapter, LocalAdapter } from '@vi/state-fp/storage';

const adapter = new ObfuscatedAdapter(new LocalAdapter(), {
  // Salt prevents the obfuscated key from being predictable across deploy versions
  salt: `${appName}@${appVersion}`,
});

const userPrefsAtom = defineAtom<UserPrefs>({
  key: 'vi/user-prefs',
  initialState: defaultPrefs,
  storage: {
    adapter,
    key: 'vi:user-prefs',   // ← will be hashed to "3af29b1..." in storage
  },
});
```

**DevTools will show:** `3af29b1d...` → `{ "theme": "dark", "locale": "en" }` (value is still readable)

### EncryptedAdapter — Full Value Encryption

For sensitive data that must persist (PII, financial information, health data), wrap any
adapter with `EncryptedAdapter`. Values are encrypted using AES-GCM via the browser's
native `SubtleCrypto` API.

```ts
import { EncryptedAdapter, LocalAdapter } from '@vi/state-fp/storage';

// The secret must NOT be hardcoded — derive it from a server-side nonce.
// A common pattern: fetch a short-lived nonce from the auth endpoint on login,
// store it ONLY in memory (not in storage), and use it as the encryption secret.
const adapter = new EncryptedAdapter(new LocalAdapter(), {
  secretProvider: async () => authService.getEncryptionNonce(), // returns Promise<string>
  algorithm:      'AES-GCM',
  keyDerivation:  'PBKDF2',
  iterations:     100_000,   // NIST recommended minimum
});

const medicalRecordAtom = defineAtom<MedicalRecord>({
  key: 'vi/medical-record',
  initialState: emptyRecord,
  storage: {
    adapter,
    key: 'vi:medical',
    security: 'encrypted',
  },
});
```

**DevTools will show:** `9f3a2c...` → `<binary ciphertext>` — completely opaque in production.

> ⚠️ **Hardcoded secrets are not secure.** If the `secretProvider` returns a value derived
> from a constant in the bundle (e.g., `() => 'my-secret-key'`), an attacker who reads your
> bundle can decrypt the stored values. The nonce must come from the server and exist only
> in the JS runtime memory.

### Memory-Only Pattern (Maximum Security)

For the highest-sensitivity atoms (auth tokens, session credentials), the safest approach
is to **never persist to browser storage at all**. Accept the UX trade-off that users must
re-authenticate after a page reload:

```ts
// No storage config → defaults to MemoryAdapter
const authAtom = defineAtom<AuthState>({
  key: 'vi/auth',
  initialState: { isAuthenticated: false, token: null, userId: null },
  // Intentionally no storage: {} block
  // State exists only in the JS heap — not visible anywhere in browser DevTools
});
```

Combine with BroadcastChannel sync so that a new tab can request the current auth
state from an existing tab:

```ts
// In the shell — new tab requests state from owner tab
sync.share(authAtom, {
  conflict:    'owner-wins',
  syncOnOpen:  true,   // new tab immediately receives current state from owner
});
```

### Decision Checklist

Before choosing a storage adapter, answer these questions:

- [ ] Does this atom contain PII (name, email, address, phone)?  → **`encrypted` or `memory-only`**
- [ ] Does this atom contain credentials (token, session ID)?    → **`memory-only`**
- [ ] Does this atom contain health or financial data?           → **`encrypted`** (regulatory requirement)
- [ ] Is the data sensitive but the VALUE is not?                → **`obfuscated`** (hides structure)
- [ ] Is this UI state only (theme, locale, scroll pos)?         → **`visible`** (no risk)
- [ ] Is this ephemeral (per-session only)?                      → **`SessionAdapter` or `MemoryAdapter`**
