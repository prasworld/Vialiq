# `@vi/state-fp/storage` — API Reference

> Pluggable persistence for atoms: memory, localStorage, sessionStorage, IndexedDB.
> Full design rationale: [`../storage-strategy.md`](../storage-strategy.md)

---

## Import

```ts
import {
  MemoryAdapter, LocalAdapter, SessionAdapter, IndexedDbAdapter,
} from '@vi/state-fp/storage';
import type { StorageAdapter, StorageError } from '@vi/state-fp/storage';
```

---

## Overview

Storage adapters plug into atoms at definition time:

```ts
import { defineAtom }    from '@vi/state-fp/kernel';
import { LocalAdapter }  from '@vi/state-fp/storage';

const counterAtom = defineAtom({
  key:          'counter',
  initialState: { count: 0 },
  storage: {
    adapter: new LocalAdapter<{ count: number }>(),
    key:     'counter-v1',
    ttl:     86_400_000, // 24 hours; omit for permanent
  },
});
```

The kernel calls `adapter.get(key)` on startup (`kernel.hydrate(atom)`) and
`adapter.set(key, state)` after every successful command execution.

---

## StorageAdapter&lt;T&gt; interface

```ts
type StorageAdapter<T> = {
  get(key: string): Promise<Either<StorageError, Maybe<T>>>;
  set(key: string, value: T): Promise<Either<StorageError, void>>;
  delete(key: string): Promise<Either<StorageError, void>>;
  clear(): Promise<Either<StorageError, void>>;
};
```

All operations return `Either<StorageError, ...>` — errors never throw.

### StorageError codes

| Code | Meaning |
|---|---|
| `DESERIALISE_ERROR` | JSON.parse failed on stored value |
| `SERIALISE_ERROR` | JSON.stringify failed on state |
| `QUOTA_EXCEEDED` | Storage quota exceeded (localStorage / IDB) |
| `NOT_AVAILABLE` | Storage backend not available in this environment |
| `UNKNOWN` | Unexpected error — `cause` contains the original error |

---

## MemoryAdapter&lt;T&gt;

In-memory Map-backed adapter. Data does not survive page reload.
Suitable for tests, server-side rendering, and ephemeral state.

```ts
const adapter = new MemoryAdapter<MyState>();
```

- Thread-safe for synchronous JS (no locking needed)
- Zero serialisation overhead

---

## LocalAdapter&lt;T&gt;

Persists to `window.localStorage` using `JSON.stringify` / `JSON.parse`.
Data survives page reloads and browser restarts.

```ts
const adapter = new LocalAdapter<MyState>();
```

**Security note:** `localStorage` is always plaintext and accessible to any
JavaScript on the same origin (including third-party scripts). Never store
credentials, tokens, or sensitive business data in localStorage. See
[`../SECURITY.md`](../SECURITY.md) for the full policy.

---

## SessionAdapter&lt;T&gt;

Persists to `window.sessionStorage`. Data survives page reloads but is
cleared when the browser tab is closed.

```ts
const adapter = new SessionAdapter<MyState>();
```

Same security constraints as `LocalAdapter`.

---

## IndexedDbAdapter&lt;T&gt;

Asynchronous persistence backed by IndexedDB. Suitable for large state
objects or offline-capable applications.

```ts
const adapter = new IndexedDbAdapter<MyState>({ dbName: 'my-app', storeName: 'atoms' });
```

- Async get/set — does not block the main thread
- Survives page reloads and browser restarts
- Limited to same origin

---

## StorageSecurityPolicy

Atoms can declare a security policy annotation to document intent:

```ts
import type { StorageSecurityPolicy } from '@vi/state-fp/storage';
// 'memory-only' — the only currently recognised value.
// Signals that this atom must never be persisted to disk.
```

This is a **documentation type** — the library does not enforce it at runtime.
Enforcement is the responsibility of the application integration layer.
See [`../SECURITY.md`](../SECURITY.md) for rationale.

---

## Custom adapters

Implement `StorageAdapter<T>` directly:

```ts
import { right, left } from '@vi/state-fp/core';
import type { StorageAdapter } from '@vi/state-fp/storage';

class RedisAdapter<T> implements StorageAdapter<T> {
  constructor(private readonly client: RedisClient) {}

  async get(key: string) {
    try {
      const raw = await this.client.get(key);
      if (raw === null) return right(nothing<T>());
      return right(just(JSON.parse(raw) as T));
    } catch (e) {
      return left({ code: 'DESERIALISE_ERROR', message: String(e), cause: e });
    }
  }
  // ... set, delete, clear
}
```
