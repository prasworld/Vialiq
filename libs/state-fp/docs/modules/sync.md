# `@vi/state-fp/sync` — API Reference

> Cross-tab and cross-worker atom synchronisation via BroadcastChannel.

---

## Import

```ts
import { createSyncEngine, createBroadcastBridge } from '@vi/state-fp/sync';
import type { SyncEngine, ShareOptions, ConflictStrategy } from '@vi/state-fp/sync';
```

---

## Quick start

```ts
import { createKernel, defineAtom } from '@vi/state-fp/kernel';
import { createSyncEngine }         from '@vi/state-fp/sync';

const kernel  = createKernel();
const counter = defineAtom({ key: 'counter', initialState: 0 });

const sync   = createSyncEngine({ kernel });
const unsync = sync.share(counter, { conflict: 'last-write-wins' });

// Stop sharing
unsync();
// or
sync.destroy();
```

---

## `createSyncEngine(options): SyncEngine`

| Option | Type | Default | Description |
|---|---|---|---|
| `kernel` | `Kernel` | required | The kernel managing atoms |
| `transport` | `TransportFactory` | `createAutoTransport()` | Custom transport; auto-detects BroadcastChannel |
| `peerId` | `string` | `crypto.randomUUID()` | Stable peer identifier |

### `SyncEngine` interface

| Method | Description |
|---|---|
| `share(atom, options)` | Start syncing an atom across tabs/workers; returns `Unsubscribe` |
| `getState(atom)` | Inspect sync state for an atom |
| `destroy()` | Stop all sync, close transport |

---

## Conflict strategies (`ShareOptions.conflict`)

| Strategy | Description |
|---|---|
| `'last-write-wins'` | Most recent timestamp wins |
| `'first-write-wins'` | Earliest timestamp wins |
| `'owner-wins'` | The tab that called `share()` first wins |
| `'version-wins'` | Highest version vector wins |
| Custom resolver | `(a: Candidate<S>, b: Candidate<S>) => ConflictResolution` |

```ts
sync.share(cartAtom, {
  conflict: (a, b) => a.state.updatedAt > b.state.updatedAt ? 'keep-local' : 'accept-remote',
});
```

---

## Version vectors

Logical clocks that track causality across peers — used internally for conflict detection.

```ts
import { createVersionVector, increment, merge, isConcurrent } from '@vi/state-fp/sync';

const v1  = createVersionVector('peer-a');
const v1b = increment(v1, 'peer-a');
const v2  = createVersionVector('peer-b');
const v2b = increment(v2, 'peer-b');

isConcurrent(v1b, v2b); // true — independent writes, needs conflict resolution
```

---

## Transport

By default `createAutoTransport()` is used, which picks `BroadcastChannel` (same origin, all tabs/workers) automatically.

For cross-frame / Service Worker messaging use `createPostMessageTransport`:

```ts
import { createPostMessageTransport } from '@vi/state-fp/sync';

const sync = createSyncEngine({
  kernel,
  transport: () => createPostMessageTransport({
    target: serviceWorker,
    origin: self.location.origin,
  }),
});
```

`createNoopTransport()` disables network sync entirely — useful in SSR or tests.

---

## BroadcastBridge

Low-level wrapper around `BroadcastChannel`. Used internally by `createAutoTransport`. Exposed for custom integrations.

```ts
import { createBroadcastBridge } from '@vi/state-fp/sync';

const bridge = createBroadcastBridge('my-channel');
bridge.send({ type: 'custom', payload: 42 });
const off = bridge.listen(msg => console.log(msg));
off();
bridge.close();
```
