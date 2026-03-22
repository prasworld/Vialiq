# @vi/state-fp — Functionality Analysis

> **Purpose:** Evidenced assessment of the library against the four core functional requirements.  
> **Scope:** `libs/state-fp/` as of the `state-fp-refactor` branch.  
> **Conclusion:** All four requirements are fully implemented across `@vi/state-fp/bus`,
> `@vi/state-fp/kernel`, `@vi/state-fp/sync`, and `@vi/state-fp/adapter`.

---

## Requirements Under Review

| ID | Requirement |
|----|-------------|
| **1a** | MFE-to-MFE event / action communication with data |
| **1b** | Read the current state of any atom |
| **1c** | React to state changes (push-based, zero polling) |
| **1d** | Ready for extension / extensibility |

---

## 1a — MFE-to-MFE Event / Action Communication

### Verdict: ✅ Fully implemented via two complementary layers

The library provides two distinct communication lanes, each suited to a different use case:

| Lane | Module | Mechanism | Best for |
|------|--------|-----------|----------|
| **State sync** | `@vi/state-fp/sync` | BroadcastChannel + vector-clock | Shared persistent state (auth, theme, session) |
| **Domain event bus** | `@vi/state-fp/bus` | BroadcastChannel (filtered) | Fire-and-forget cross-MFE events (analytics, toasts, telemetry) |

---

### Layer 1: State Sync (`@vi/state-fp/sync`)

The owner MFE registers and executes commands against an atom. The `SyncEngine` broadcasts
every state change via BroadcastChannel to all borrower MFEs that have called `sync.share()`
on the same channel. Conflict resolution is automatic (configurable strategies: `owner-wins`,
`last-write-wins`, `timestamp`).

```ts
// ── Shell (owner) ──────────────────────────────────────────────────────────
import { createKernel, defineAtom, command, domainEvent, ok } from '@vi/state-fp/kernel';
import { createSyncEngine }                                    from '@vi/state-fp/sync';

const kernel  = createKernel();
const myAtom  = defineAtom({ key: 'vi/shared-data', initialState: { count: 0 } });
const handler = createCommandHandler({
  commandType: 'inc',
  handle: (s, cmd) => ok([domainEvent('incr', { by: cmd.payload.by })]),
});
const applier = createEventApplier({
  'incr': (s, e) => ({ count: s.count + e.payload.by }),
});

kernel.register(myAtom, handler, applier);

const sync = createSyncEngine({ kernel });
sync.share(myAtom, { channel: 'vi-shared-data' });   // broadcasts changes

// ── Remote (borrower) ──────────────────────────────────────────────────────
import { createKernel, defineAtom } from '@vi/state-fp/kernel';
import { createSyncEngine }         from '@vi/state-fp/sync';

const remoteKernel = createKernel();
const remoteAtom   = defineAtom({ key: 'vi/shared-data', initialState: { count: 0 } });

const sync = createSyncEngine({ kernel: remoteKernel });
sync.share(remoteAtom, { channel: 'vi-shared-data', conflict: 'owner-wins' });
// Remote receives every state update from the shell automatically
```

**Conflict resolution is built-in:**
```ts
// src/sync/conflict.ts — detects concurrent writes via Lamport vector clocks
const isConcurrent = (localVec: VersionVector, remoteVec: VersionVector) =>
  !dominates(localVec, remoteVec) && !dominates(remoteVec, localVec);

// When concurrent: apply configured strategy ('owner-wins' | 'last-write-wins')
```

**Transport API** — replaceable without changing application code:
```ts
// Built-in: BroadcastChannel (same origin, same browser)
const sync = createSyncEngine({ kernel });         // auto-selects best transport

// Explicit BroadcastChannel
import { createBroadcastBridge } from '@vi/state-fp/sync';
const sync = createSyncEngine({ kernel, transport: () => createBroadcastBridge('chan') });

// Custom (e.g. PostMessage for cross-origin):
const sync = createSyncEngine({ kernel, transport: (ch) => myCustomTransport(ch) });
```

---

### Layer 2: Domain Event Bus (`@vi/state-fp/bus`)

For cross-MFE events that are **not** about persisted state (toasts, analytics, navigation
triggers), `createSharedBus` publishes and subscribes to `CrossMFEEvent` objects.

```ts
import { createSharedBus }    from '@vi/state-fp/bus';
import { domainEvent }        from '@vi/state-fp/kernel';

// ── Publisher (any MFE) ────────────────────────────────────────────────────
const bus = createSharedBus({ channel: 'vi-domain-events' });

bus.publish({
  source: 'shell',
  event:  domainEvent('order/placed', { orderId: '001', total: 99.99 }),
});

// ── Subscriber (any other MFE) ─────────────────────────────────────────────
const bus = createSharedBus({ channel: 'vi-domain-events' });

bus.subscribe({ source: 'shell', type: 'order/placed' }, (msg) => {
  showToast(`Order ${msg.event.payload.orderId} placed`);
});
```

**Filtering is first-class:**
```ts
// Filter by event type only
bus.subscribe({ type: 'auth/loggedIn' }, handler);

// Filter by source only
bus.subscribe({ source: 'cart-remote' }, handler);

// Source + type (exact match)
bus.subscribe({ source: 'cart-remote', type: 'item/added' }, handler);

// No filter — receive all events on the channel
bus.subscribe(undefined, handler);
```

**Forwarding kernel events to the bus** (common pattern for shell):
```ts
kernel.onEvent((event) => {
  bus.publish({ source: 'shell', event });
});
```

---

### What is NOT implemented (by design)

| Gap | Decision |
|-----|----------|
| Event-level replication across tabs | Phase 5+; BroadcastChannel can't guarantee atomic delivery |
| Request/response (RPC) pattern | Only pub-sub; add correlation IDs manually if needed |
| Multi-atom transactional updates across MFEs | Workaround: define a single compound atom |
| Cross-origin sync (iframe relay) | Planned via custom `SyncTransport` in Phase 4.6 |

---

## 1b — Read Current Atom State

### Verdict: ✅ Three access patterns, zero polling

**Pattern 1 — Synchronous snapshot (any time, any code):**
```ts
const currentState = atom.get();   // returns S — always current
```
`atom.get()` is O(1), synchronous, can be called anywhere: component, service, middleware,
test assertion. The atom's state is written in-place on every applier run; `.get()` simply
reads that reference.

**Pattern 2 — Query projection (derives typed data):**
```ts
// Define a query handler once
const BuildTotal = () => ({ _kind: 'Query' as const, type: 'cart/total' });

// Execute at any time — synchronous
const total: number = kernel.query(cartAtom, BuildTotal());
```
Queries are synchronous functions over state. They are memoized when `memo: true` is set
in `createQueryHandler`.

**Pattern 3 — Framework reactive hooks:**
```ts
// Angular — returns a WritableSignal<S> that auto-tracks changes
readonly auth = ngAdapter.toSignal(authAtom, kernel);

// React — returns [S, dispatch] tuple
const [auth, dispatch] = reactAdapter.useAtom(authAtom);

// Lit — controller exposes .state getter
readonly ctrl = createLitController(this, kernel, authAtom);
// → this.ctrl.state always reflects current atom state
```

**Remote MFE state access:** A remote that has called `sync.share(atom, options)` gets the
same three patterns. The borrowed atom's state is updated automatically when the owner
broadcasts; `atom.get()` on the remote always returns the latest synced value.

---

## 1c — Reactivity (Push-based, Zero Polling)

### Verdict: ✅ Full push model with framework adapters and RAF batching

**Core subscription:**
```ts
const unsubscribe = kernel.subscribe(atom, (newState: S) => {
  // called synchronously in the Kernel's execute() loop
});
```

From `src/kernel/kernel.ts`:
```ts
// After every successful command:
for (const listener of this.#subscribers.get(atom) ?? []) {
  listener(atom.get());   // ← synchronous, no scheduler, no RxJS
}
```

**There is no polling** — the notification loop is triggered only by a successful `execute()`.
Subscriptions are stored in a `Map<Atom, Set<Listener>>` and iterated synchronously.

---

### Angular Signals Integration

```ts
// src/adapter/angular.ts
readonly toSignal = <S>(atom: Atom<S>, kernel: Kernel): WritableSignal<S> => {
  const sig = apis.signal<S>(atom.get());                   // initial value
  const destroyRef = apis.inject(apis.DestroyRef);

  const off = kernel.subscribe(atom, (s) => sig.set(s));    // push every change
  destroyRef.onDestroy(off);                                // auto-cleanup
  return sig;
};
```

The Signal is driven by `kernel.subscribe()`. Angular Change Detection sees signal writes
and marks the view for re-render. No zone.js patching needed; fully compatible with
`ChangeDetectionStrategy.OnPush`.

---

### React Hooks Integration

```ts
// src/adapter/react.ts
const useAtom = <S>(atom: Atom<S>): [S, Atom<S>] => {
  const kernel = useKernel();
  const [state, setState] = useState<S>(() => atom.get());

  useEffect(() => {
    setState(atom.get());                                    // sync on mount
    const off = kernel.subscribe(atom, setState);           // push every change
    return off;                                              // cleanup on unmount
  }, [atom, kernel]);

  return [state, atom];
};
```

React state updates via `setState` trigger a re-render. The `useEffect` cleanup removes the
subscription when the component unmounts, preventing memory leaks.

---

### Lit Reactive Controller

```ts
// src/adapter/lit.ts
const createLitController = <S>(host: ReactiveHost, kernel: Kernel, atom: Atom<S>) => {
  let _state: S = atom.get();

  return {
    get state() { return _state; },
    hostConnected() {
      const off = kernel.subscribe(atom, (s) => {
        _state = s;
        host.requestUpdate();   // schedule Lit re-render
      });
      this._off = off;
    },
    hostDisconnected() { this._off?.(); },
  };
};
```

---

### High-Frequency State — RAF-Batched EphemeralStreams

For state that changes faster than the frame rate (mouse position, scroll, canvas), use
`EphemeralStream` with `subscribeAnimated()`:

```ts
import { createEphemeralStream } from '@vi/state-fp/kernel';

const mousePos = createEphemeralStream<{ x: number; y: number }>();

window.addEventListener('mousemove', (e) => {
  mousePos.emit({ x: e.clientX, y: e.clientY });   // called 100+/sec
});

// Subscriber fires at most once per animation frame with the LAST emitted value
mousePos.subscribeAnimated((pos) => {
  canvas.style.transform = `translate(${pos.x}px,${pos.y}px)`;
});
```

The RAF deduplication logic in `src/core/stream.ts` ensures only one
`requestAnimationFrame` is queued per stream regardless of how many `emit()` calls occur
in the same frame.

---

### Reactivity Gaps (by design)

| Gap | Notes |
|-----|-------|
| Multi-source computed atoms | Atoms derive from single state; multi-atom derivation requires manual wiring with `computed()` (Angular) or `useMemo` (React) |
| RxJS integration | Not built-in; wrap `kernel.subscribe()` in `new Observable()` manually |

---

## 1d — Extensibility

### Verdict: ✅ Four independent extension points

### Extension Point 1: Kernel Plugins (`KernelPlugin`)

Plugins intercept the kernel lifecycle without modifying any kernel source:

```ts
interface KernelPlugin {
  name: string;
  onRegister?(atom: Atom<unknown>): void;
  onExecute?(params: {
    command: Command;    events: DomainEvent[];
    prevState: unknown;  nextState: unknown;
    atomKey: string;     durationMs: number;
  }): void;
  onError?(params: { command: Command; error: CommandError; atomKey: string }): void;
}

kernel.use(analyticsPlugin);
kernel.use(devtools.plugin);   // DevTools itself is a KernelPlugin
kernel.use(loggingPlugin);     // Stack multiple plugins
```

**Example — analytics plugin:**
```ts
const analyticsPlugin: KernelPlugin = {
  name: '@app/analytics',
  onExecute({ command, atomKey, durationMs, nextState }) {
    gtag.event('command', { type: command.type, atom: atomKey, ms: durationMs });
  },
  onError({ command, error }) {
    Sentry.captureException(error, { extra: { commandType: command.type } });
  },
};
```

---

### Extension Point 2: Framework Adapter Factory

All adapters are created via a factory function that receives framework primitives as
arguments. This makes adapters testable without a real browser and allows multiple
framework versions to coexist:

```ts
// Angular adapter
export const ngAdapter = createAngularAdapter({ signal, inject, DestroyRef });

// React adapter
export const reactAdapter = createReactAdapter({ useState, useEffect, useRef, useContext, createContext });

// Lit adapter — no factory needed, functions take the host reference directly
```

**Adding a new framework (e.g., Svelte):**
```ts
type SvelteAPIs = {
  writable:  <T>(v: T)  => Writable<T>;
  onMount:   (fn: () => void) => void;
  onDestroy: (fn: () => void) => void;
};

export function createSvelteAdapter(apis: SvelteAPIs) {
  return {
    atomStore: <S>(atom: Atom<S>, kernel: Kernel): Writable<S> => {
      const store = apis.writable(atom.get());
      apis.onMount(() => {
        const off = kernel.subscribe(atom, (s) => store.set(s));
        apis.onDestroy(off);
      });
      return store;
    },
  };
}
```

---

### Extension Point 3: Custom Storage Adapter (`StorageAdapter`)

```ts
interface StorageAdapter {
  readonly name: string;
  get<T>(key: string): Promise<Either<StorageError, Maybe<T>>>;
  set<T>(key: string, value: T, ttl?: number): Promise<Either<StorageError, void>>;
  delete(key: string): Promise<Either<StorageError, void>>;
  clear(prefix?: string): Promise<Either<StorageError, void>>;
  keys(prefix?: string): Promise<Either<StorageError, string[]>>;
  exists(key: string): Promise<Either<StorageError, boolean>>;
}
```

Implement this interface to connect any storage backend (Redis, DynamoDB, SQLite, OPFS):
```ts
class RedisAdapter implements StorageAdapter {
  async get<T>(key: string) {
    try {
      const raw = await this.client.get(key);
      return right(raw ? just(JSON.parse(raw) as T) : nothing());
    } catch (e) {
      return left({ code: 'READ_ERROR', message: String(e) });
    }
  }
  // ... remaining methods
}

const userAtom = defineAtom({
  key: 'user',
  initialState: guestUser,
  storage: { adapter: new RedisAdapter(client), ttl: 8 * 3600 * 1000 },
});
```

---

### Extension Point 4: Custom Sync Transport (`SyncTransport`)

```ts
interface SyncTransport<S = unknown> {
  send(msg: SyncMessage<S>): void;
  subscribe(listener: (msg: SyncMessage<S>) => void): () => void;
  close(): void;
  readonly isOpen: boolean;
}
```

Replace BroadcastChannel with any messaging mechanism:
```ts
// WebSocket transport example
function createWebSocketTransport(url: string): SyncTransport {
  const ws = new WebSocket(url);
  const listeners = new Set<(msg: SyncMessage) => void>();

  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data) as SyncMessage;
    listeners.forEach((fn) => fn(msg));
  });

  return {
    send:      (msg) => ws.send(JSON.stringify(msg)),
    subscribe: (fn)  => { listeners.add(fn); return () => listeners.delete(fn); },
    close:     ()    => { listeners.clear(); ws.close(); },
    get isOpen()     { return ws.readyState === WebSocket.OPEN; },
  };
}

const sync = createSyncEngine({
  kernel,
  transport: () => createWebSocketTransport('wss://sync.example.com'),
});
```

---

## Summary Matrix

| Requirement | Status | Primary API | Module |
|-------------|--------|-------------|--------|
| **1a** MFE-to-MFE communication | ✅ Complete | `createSyncEngine` + `createSharedBus` | `sync` + `bus` |
| **1b** Read current state | ✅ Complete | `atom.get()`, `kernel.query()` | `kernel` |
| **1c** Reactivity | ✅ Complete | `kernel.subscribe()`, `toSignal()`, `useAtom()`, `createLitController()` | `kernel` + `adapter` |
| **1d** Extensibility | ✅ Complete | `kernel.use(plugin)`, adapter factories, `StorageAdapter`, `SyncTransport` | all modules |

---

## Cross-Cutting Concerns

### Security
- No encrypted adapter (client-side encryption is security theatre — keys arrive as plaintext)
- No localStorage/IndexedDB browser adapters — all persistent state in memory only
- `ObfuscatedAdapter` available for development visibility constraints (not cryptographic)
- See [SECURITY.md](./SECURITY.md) and [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md)

### SSR / Server-Side Rendering
- All adapters work in Node.js (`window` / `document` not required)
- `createAutoTransport(channel)` falls back to a noop transport when BroadcastChannel is not available
- `SharedEventBus` falls back to noop in SSR; `bus.isOpen === false`
- Hydration: initial state is provided via `kernel.hydrate()`; no cross-tab sync in SSR

### Testing
- All adapters accept injected framework APIs → swap with mocks in unit tests
- Command handlers and event appliers are pure functions — test without a kernel instance
- Queries are pure functions — test with any state object
- `DevTools` is a KernelPlugin — disable in tests by omitting `kernel.use(devtools.plugin)`
