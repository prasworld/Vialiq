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

There are **two related interfaces** for storage adapters:

**`StorageAdapterLike<S>`** (kernel-internal, in `@vi/state-fp/kernel/types`):  
The minimal duck-type the kernel's `AtomStorageConfig.adapter` field expects. Its `get()` returns `Promise<Maybe<S>>` directly.

**`StorageAdapter`** (full public interface, in `@vi/state-fp/storage`):  
The richer interface implemented by `MemoryAdapter`, `LocalAdapter`, `SessionAdapter`, and `IndexedDbAdapter`. Its `get()` returns `Promise<Either<StorageError, Maybe<T>>>`.

When using an adapter from `@vi/state-fp/storage` with `defineAtom`, wrap it or use it as a mock that conforms to `StorageAdapterLike<S>` by resolving directly to `Maybe<T>`. The kernel tests demonstrate this pattern with simple mock adapters:

```ts
const mockAdapter = {
  get: vi.fn().mockResolvedValue(just(savedState)),  // Promise<Maybe<S>> — no Either wrapper
  set: vi.fn().mockResolvedValue(undefined),
};
```

### StorageAdapter (full interface)

```ts
type StorageError = {
  readonly code:    'DESERIALISE_ERROR' | 'SERIALISE_ERROR' | 'QUOTA_EXCEEDED' | 'NOT_AVAILABLE' | 'UNKNOWN';
  readonly message: string;
  readonly cause?:  unknown;
};

// Promise<Either<StorageError, T>>
type StorageResult<T> = Promise<Either<StorageError, T>>;

interface StorageAdapter {
  /** Human-readable backend name */
  readonly name: string;

  /** Read a value by key. Returns Right(Nothing) on miss or expired entry. */
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

### How Hydration Works

Each atom declares its own storage adapter in its `storage.adapter` field. The kernel iterates all registered atoms and reads from each atom's declared adapter. There is no global priority chain — each atom independently configures its backend:

```ts
// Simplified hydration (see kernel.ts for full implementation)
async function hydrate(): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const [, reg] of atoms) {
    const { atom } = reg;
    const storageConfig = atom.definition.storage;
    if (!storageConfig) continue;                           // no storage → skip
    if (storageConfig.security === 'memory-only') continue; // memory-only → skip

    const key = storageConfig.key ?? atom.definition.key;
    promises.push(
      storageConfig.adapter.get(key).then((maybe) => {
        if (maybe._tag === 'Just' && maybe.value !== undefined) {
          atom._setState(maybe.value); // restore from storage
        }
        // Nothing → leave atom at initialState
      }).catch(() => {
        // Storage read failure → silently fall back to initialState
      }),
    );
  }

  await Promise.allSettled(promises);
}
```

**Notes:**
- Atoms without a `storage` config are skipped entirely
- All atoms hydrate concurrently via `Promise.allSettled` — failures on one atom do not block others
- The adapter's `get()` should return `Promise<Maybe<S>>` (see `StorageAdapterLike<S>` in the kernel types)
- `memory-only` security policy: adapter is ignored during both hydration and write-through

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
- Surfaced to kernel plugins via `onError()` as a synthetic `__storage_error__` command
- **Never thrown** — the `execute()` call always returns `Right(newState)` even if storage write fails
- In-memory atom state is always consistent; storage persistence is best-effort fire-and-forget

There is no `storageErrorBehavior` option in `KernelOptions`. Storage errors are always non-blocking.

---

## 7. TTL Enforcement

TTL (time-to-live) is specified in milliseconds on the `StorageConfig`.

```ts
const userSessionAtom = defineAtom({
  key: 'vi/user-session',
  initialState: null,
  storage: {
    adapter: new LocalAdapter(),
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

> **Status: Planned — not yet implemented in source.** The APIs in sections 8.1–8.4
> (`vi/invalidate` command, `kernel.addInvalidationRule`, `kernel.invalidateByPrefix`,
> `kernel.invalidateAll`) are Phase 2+ design targets. They do not exist in the
> current kernel.
>
> **Current workaround:** Dispatch a custom `reset` command whose handler returns
> `{ state: atom.initialState }`, clears storage via `adapter.delete(key)`, and returns
> an empty event list.

### 8.1 Explicit Invalidation via Command (Planned)

```ts
// PLANNED API — not yet implemented
// Dispatching the built-in invalidate command resets the atom
kernel.execute(userAtom, command('vi/invalidate', {}));

// The kernel will:
// 1. Delete the storage entry
// 2. Reset atom state to initialState
// 3. Log a DebugEntry with commandType 'vi/invalidate'
// 4. Notify all atom subscribers
```

### 8.2 Cascading Invalidation Rules (Planned)

```ts
// PLANNED API — not yet implemented
// When userAtom is invalidated, also invalidate these dependents
kernel.addInvalidationRule(userAtom, [dashboardAtom, cartAtom]);
```

Rules would be evaluated breadth-first. Cycles detected and stopped.

### 8.3 Bulk Invalidation (Planned)

```ts
// PLANNED API — not yet implemented
// Invalidate all atoms with a given prefix
kernel.invalidateByPrefix('vi/user');

// Invalidate all atoms
kernel.invalidateAll();
```

### 8.4 Cross-MFE Invalidation via BroadcastChannel (Planned)

When a storage entry is invalidated in one MFE, a message would be broadcast
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

Receiving MFEs would apply the invalidation without re-dispatching events
(to avoid feedback loops).

---

## 9. Custom Serialisation

By default, values are serialised using a `JSON.stringify` / `JSON.parse`
pair with a replacer that handles `Date`, `Map`, `Set`, and `BigInt`.

The `AtomStorageConfig` type (the `storage:` field in `defineAtom`) currently supports:

```ts
type AtomStorageConfig<S> = {
  adapter:   StorageAdapterLike<S>; // required — the storage backend (typically MemoryAdapter; see security policy below)
  key?:      string;                // optional — overrides the atom key as the storage key
  ttl?:      number;                // optional — per-atom TTL in milliseconds
  security?: StorageSecurityPolicy; // optional — currently only 'memory-only' is supported
};
```

There is **no built-in `serialize`/`deserialize` option** in `AtomStorageConfig` today.
If your atom holds non-JSON-serialisable types (e.g. `Map`, `Set`, class instances),
use a **custom adapter** that wraps serialisation internally:

```ts
import { defineAtom }   from '@vi/state-fp/kernel';
import { LocalAdapter } from '@vi/state-fp/storage';

// Custom adapter that handles Map<string, boolean> serialisation
class MapLocalAdapter implements StorageAdapterLike<Map<string, boolean>> {
  private inner = new LocalAdapter<string>();

  async get(key: string): Promise<Maybe<Map<string, boolean>>> {
    const raw = await this.inner.get(key);
    return isNothing(raw) ? nothing : just(new Map(JSON.parse(raw.value) as [string, boolean][]));
  }

  async set(key: string, value: Map<string, boolean>, ttl?: number): Promise<void> {
    await this.inner.set(key, JSON.stringify([...value.entries()]), ttl);
  }

  async delete(key: string): Promise<void> { await this.inner.delete(key); }
  async clear():              Promise<void> { await this.inner.clear(); }
}

const settingsAtom = defineAtom({
  key:          'vi/settings',
  initialState: new Map<string, boolean>(),
  storage: {
    adapter:  new MapLocalAdapter(),
    key:      'vi:settings',
  },
});
```

### Kernel-level serialiser (Planned)

> **Status: Planned — not yet implemented.**

A kernel-level `serialiser` option that applies to all atoms (unless overridden
per-atom) is a Phase 2+ design target:

```ts
// PLANNED API — not yet implemented
const kernel = createKernel({
  serialiser: {
    serialize:   (v) => superjson.stringify(v),
    deserialize: (s) => superjson.parse(s),
  },
});
```

Until then, use custom adapters (as above) for non-JSON types.

---

## 10. Storage Quota Handling

| Condition | Behavior |
|---|---|
| `DOMException: QuotaExceededError` | Adapter returns `Left({ code: 'QUOTA_EXCEEDED' })` |
| Storage write error | `onError()` called on kernel plugins; `execute()` still returns `Right(newState)` |
| Storage read failure (hydration) | Silently falls back to `atom.initialState` |

> **Note:** There is no `storageErrorBehavior` or `maxStorageBytes` option in `KernelOptions`. Storage write errors are always non-blocking. The in-memory state is always authoritative.

For environments where you want to log quota errors or react to storage failures, listen via `KernelPlugin.onError()`:

```ts
kernel.use({
  name: 'storage-error-logger',
  onError({ command, error }) {
    if (command.type === '__storage_error__') {
      console.warn('Storage write failed:', error.message);
    }
  },
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
| Any atom + `security: 'memory-only'` | ❌ Never | Adapter ignored at runtime — JS heap only (only supported policy) |
| Any atom + `stateSanitizer` | ✅ DevTools shows sanitized value | Redacts sensitive fields in debug log only; real in-memory state is always full |

### StorageSecurityPolicy Types

```ts
/**
 * Declares the browser-storage visibility posture of an atom.
 *
 * | Policy       | Keys in DevTools | Values in DevTools | Persisted? |
 * |--------------|------------------|--------------------|------------|
 * | 'visible'    | Plaintext        | Plaintext          | Yes        |
 * | 'obfuscated' | SHA-256 hash     | Plaintext          | Yes        |
 * | 'memory-only'| N/A              | N/A (JS heap only) | No         |
 *
 * ### Why there is no 'encrypted' policy
 *
 * Client-side encryption is NOT a security control for browser DevTools visibility.
 * The encryption key must arrive as a plaintext JavaScript string — any debugger
 * breakpoint on the secret-fetching call exposes it before it reaches SubtleCrypto.
 * Post-decryption plaintext lives in the JS heap and is visible in the Memory
 * profiler. An attacker with DevTools access can also call crypto.subtle.decrypt()
 * with the IV and ciphertext from the Application tab.
 *
 * Redux, NgRx, MobX, and Zustand all reached this same conclusion — none offer
 * encryption. The correct controls are:
 *   1. stateSanitizer on KernelOptions — redact sensitive fields in DevTools only.
 *   2. memory-only policy — for data that must not survive a page reload.
 *   3. Don't persist sensitive data client-side — refetch from server after auth.
 */
export type StorageSecurityPolicy =
  | 'visible'      // default — keys + values readable in DevTools; suitable for non-sensitive state
  | 'obfuscated'   // keys SHA-256 hashed; values still plaintext — hides application structure
  | 'memory-only'; // stays in JS heap only — invisible to DevTools, not persisted across reloads
```



### stateSanitizer — Redacting Sensitive Fields from DevTools

The `stateSanitizer` option on `KernelOptions` is the correct way to prevent sensitive
fields from appearing in the DevTools debug log. It is the same pattern used by
Redux DevTools Extension (`stateSanitizer`/`actionSanitizer`) and NgRx `@ngrx/store-devtools`.

**Key guarantee:** `stateSanitizer` only affects the DevTools snapshot that is recorded.
The real in-memory state is **never modified** — components always see the full, unsanitized state.

```ts
import { createKernel }   from '@vi/state-fp/kernel';
import { createDevTools } from '@vi/state-fp/devtools';

// stateSanitizer is a KernelOptions field — separate from devtools
const kernel = createKernel({
  debug: true,

  // Called before every debugLayer.record() — return a safe copy for DevTools
  stateSanitizer: (atomKey: string, state: unknown) => {
    if (atomKey === 'vi/auth') {
      const s = state as AuthState;
      // Replace sensitive fields with placeholder; other fields still visible in DevTools
      return { ...s, token: '[REDACTED]', refreshToken: '[REDACTED]' };
    }
    if (atomKey === 'vi/user') {
      const s = state as UserState;
      return { ...s, email: '[REDACTED]', ssn: '[REDACTED]' };
    }
    return state; // non-sensitive atoms pass through unchanged
  },
});

// Then attach devtools as a plugin
const devtools = createDevTools();
kernel.use(devtools.plugin);
```

**When `debug: true` is not set in KernelOptions**, `stateSanitizer` is never called —
zero runtime overhead in production builds.

**All kernel debug recording paths are covered:**

```
kernel.execute()  success path   → sanitize(atomKey, prevState) + sanitize(atomKey, nextState)
kernel.execute()  error path     → sanitize(atomKey, prevState) (nextState = prevState)
kernel.executeAsync() success    → same
kernel.executeAsync() error      → same
kernel.executeAsync() abort      → same
```

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

Before choosing a storage adapter and security policy, answer these questions:

- [ ] Does this atom contain credentials (token, session ID, refresh token)?  → **`memory-only`** (never persist)
- [ ] Does this atom contain health or financial data (HIPAA, PCI-DSS)?       → **`memory-only`** (never persist client-side — refetch from server)
- [ ] Does this atom contain PII (name, email, address, phone)?               → **`memory-only`** preferred; `obfuscated` + `stateSanitizer` if persistence is required
- [ ] Is the state sensitive but the VALUE itself is not a secret?            → **`obfuscated`** (hides application structure)
- [ ] Should sensitive fields be hidden only from the DevTools debug log?     → **`stateSanitizer`** on `KernelOptions`
- [ ] Is this UI-only state (theme, locale, scroll pos, feature flags)?       → **`visible`** (no risk)
- [ ] Is this ephemeral (per-session, discardable on tab close)?              → **`SessionAdapter`** or `MemoryAdapter`

> **Compliance note:** For HIPAA, PCI-DSS, and GDPR workloads, the recommended position is
> **never store regulated data in browser storage** regardless of policy. Use the server as
> the source of truth; surface data in atoms with `memory-only` for the current session only.
