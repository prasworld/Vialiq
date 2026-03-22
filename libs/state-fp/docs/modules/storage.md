# `@vi/state-fp/storage` — API Reference

> Pluggable persistence for atoms: memory, localStorage, sessionStorage, IndexedDB.
> Full design rationale: [`../storage-strategy.md`](../storage-strategy.md)

---

## Import

```ts
import { MemoryAdapter } from '@vi/state-fp/storage';
import type { StorageAdapter, StorageError, StorageResult } from '@vi/state-fp/storage';
```

---

## Overview

Atoms use `MemoryAdapter` by default — state lives in the JS heap and is invisible to browser
storage tools. To configure explicitly, or to add a TTL, pass a `storage` option:

```ts
import { defineAtom }    from '@vi/state-fp/kernel';
import { MemoryAdapter } from '@vi/state-fp/storage';

const counterAtom = defineAtom({
  key:          'counter',
  initialState: { count: 0 },
  storage: {
    adapter: new MemoryAdapter<{ count: number }>(),
    key:     'counter-v1',
    ttl:     3_600_000, // 1 hour; omit for no expiry
  },
});
```

The kernel calls `adapter.get(key)` on startup (`kernel.hydrate()`) and
`adapter.set(key, state)` after every successful command execution.

---

## StorageAdapter interface

```ts
interface StorageAdapter {
  readonly name: string;                                      // required; inspected by storage-guard
  get<T>(key: string):                    StorageResult<Maybe<T>>;
  set<T>(key: string, value: T, ttl?: number): StorageResult<void>;
  delete(key: string):                    StorageResult<void>;
  clear(prefix?: string):                 StorageResult<void>;
  keys(prefix?: string):                  StorageResult<string[]>;
  exists(key: string):                    StorageResult<boolean>;
}
```

where `StorageResult<T> = Promise<Either<StorageError, T>>` — errors are always
returned as `Left<StorageError>` and never thrown.

### StorageError codes

| Code | Meaning |
|---|---|
| `DESERIALISE_ERROR` | JSON.parse failed on stored value |
| `SERIALISE_ERROR` | JSON.stringify failed on state |
| `QUOTA_EXCEEDED` | Storage quota exceeded (localStorage / IDB) |
| `NOT_AVAILABLE` | Storage backend not available in this environment |
| `UNKNOWN` | Unexpected error — `cause` contains the original error |

---

## MemoryAdapter

The **only** adapter exported from `@vi/state-fp/storage`.
All other browser-persistent adapters (`LocalAdapter`, `SessionAdapter`, `IndexedDbAdapter`)
were intentionally removed — see the security rationale in `src/storage/index.ts`.

```ts
const adapter = new MemoryAdapter();
```

- Map-backed; state lives in the JS heap only
- Data does not survive page reload
- Invisible to browser DevTools (Application / Storage tabs)
- Zero serialisation overhead
- TTL enforced lazily on every `get()` and via a periodic background sweep

> **Non-sensitive UI state** (theme, locale, feature flags) that genuinely needs
> to survive page reloads should be managed by a separate `@vi/config` library
> with explicit, opt-in browser-storage semantics.

---

## StorageSecurityPolicy

```ts
import type { StorageSecurityPolicy } from '@vi/state-fp/storage';
// type StorageSecurityPolicy = 'memory-only'
```

This policy is **actively enforced at runtime** by `storage-guard.ts`:

- When `security: 'memory-only'` is declared on an atom's storage config, the kernel
  **completely skips** both `adapter.get()` (hydration) and `adapter.set()` (persistence).
  The atom's state exists only in the JS heap for the lifetime of the page.
- Any adapter passed alongside `security: 'memory-only'` is silently bypassed — its
  `get`/`set` methods are never called.
- Passing any adapter that is not a `MemoryAdapter` (or equivalent in-memory type)
  **without** setting `security: 'memory-only'` raises a runtime error from
  `assertApplicationStoragePolicy` — browser-persistent adapters are not permitted.

See `src/kernel/storage-guard.ts` for the exact enforcement logic.

---

## Custom adapters

Implement `StorageAdapter` directly:

```ts
import { ok, err, just, nothing } from '@vi/state-fp/core';
import type { StorageAdapter, StorageResult } from '@vi/state-fp/storage';

class RedisAdapter implements StorageAdapter {
  readonly name = 'RedisAdapter';
  constructor(private readonly client: RedisClient) {}

  async get(key: string) {
    try {
      const raw = await this.client.get(key);
      if (raw === null) return ok(nothing<T>());
      return ok(just(JSON.parse(raw) as T));
    } catch (e) {
      return err({ code: 'DESERIALISE_ERROR', message: String(e), cause: e });
    }
  }
  // ... set, delete, clear
}
```
