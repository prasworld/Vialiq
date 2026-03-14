# @vi/state-fp — Architecture Design (v2)

> **Status:** Revised — Modular CQRS Architecture  
> **Pattern:** CQRS (Command Query Responsibility Segregation)  
> **Guiding law:** *Build the minimum needed. Leave room for complexity.*

---

## Table of Contents

1. [Why CQRS?](#1-why-cqrs)
2. [Module Map](#2-module-map)
3. [Dependency Graph](#3-dependency-graph)
4. [CQRS Pattern in @vi/state-fp](#4-cqrs-pattern-in-vi-state-fp)
5. [Module — core](#5-module--core)
6. [Module — kernel](#6-module--kernel)
7. [Module — storage](#7-module--storage)
8. [Module — sync](#8-module--sync)
9. [Module — devtools](#9-module--devtools)
10. [Module — adapter](#10-module--adapter)
11. [Write Path (Command → Event → State)](#11-write-path)
12. [Read Path (Query → Projection)](#12-read-path)
13. [Event Sourcing Layer](#13-event-sourcing-layer)
14. [Storage Strategy](#14-storage-strategy)
15. [Cross-MFE Sync Protocol](#15-cross-mfe-sync-protocol)
16. [Debug Visibility Model](#16-debug-visibility-model)
17. [Public API Surface](#17-public-api-surface)
18. [Composition Examples](#18-composition-examples)
19. [Design Invariants](#19-design-invariants)
20. [Phase-Wise Scope Boundaries](#20-phase-wise-scope-boundaries)

---

## 1. Why CQRS?

The previous single-`dispatch` model blurs **intent** (what the user wants to happen) with **fact** (what actually happened). CQRS makes this explicit:

| Concern | Model | API |
|---|---|---|
| Change state | **Command** — an intent | `kernel.execute(atom, command)` |
| Read state | **Query** — a request for data | `kernel.query(atom, query)` |
| State changed | **DomainEvent** — an immutable fact | emitted by `CommandHandler` |

### Why this matters for MFE scale

```
Without CQRS:
  dispatch({ type: 'user/load', userId })   ← is this a read? a write? both?
  Effect produces another dispatch           ← side effects embedded in dispatch

With CQRS:
  kernel.execute(userAtom, LoadUser({ userId }))   ← intent is named, validated
  → CommandHandler validates, returns [UserLoaded(profile)]
  → Kernel applies event to atom (pure)
  → EventBus broadcasts DomainEvent to all listeners
  → DevTools captures the full causal chain

  kernel.query(userAtom, GetDisplayName())         ← pure read, never mutates
```

### Benefits won

- **Testability** — command handlers and query handlers are pure functions; test without a store
- **Auditability** — DomainEvents are the legal record of what happened (not commands)
- **Replayability** — replay events only (no re-validation) → correct time-travel
- **Separation of complexity** — validation lives in command handlers; projection lives in queries
- **Named intent** — `AddItemToCart` communicates meaning; `dispatch({ type: 'CART_ADD' })` does not

---

## 2. Module Map

```
@vi/state-fp/core      — FP primitives (Maybe, Either, IO, Task, Reader, StateM, Lens, pipe)
@vi/state-fp/kernel    — CQRS engine: CommandBus, QueryBus, DomainEventBus, Atom, Kernel, KernelPlugin
@vi/state-fp/storage   — StorageAdapter interface + Memory, LocalStorage, SessionStorage, IndexedDB,
                          ObfuscatedAdapter, EncryptedAdapter
@vi/state-fp/sync      — Cross-MFE sync: BroadcastChannel, conflict resolution, versioning
@vi/state-fp/devtools  — EventLog, Snapshots, TimeTravelController, DevToolsBridge, DevExtension
@vi/state-fp/adapter   — Framework wrappers: Angular (Signals), React (hooks), Lit (ReactiveController), Vanilla
```

Each module is a separate entry-point in `package.json#exports`. Modules compose upward — never downward.

---

## 3. Dependency Graph

```
          ┌──────────────────────────────────────────────────────────┐
          │                    @vi/state-fp/adapter                  │
          │        Angular · React · Lit · Vanilla shells             │
          └────────────────┬──────────────────────────────────────────┘
                           │ depends on
          ┌────────────────▼──────────────────────────────────────────┐
          │                 @vi/state-fp/kernel                       │
          │   CommandBus · QueryBus · DomainEventBus · Atom · Kernel  │
          │   KernelPlugin (OCP extension point)                      │
          └──────┬───────────────────────┬───────────────────────────┘
                 │ depends on            │ peer-extends
    ┌────────────▼────────┐  ┌──────────▼──────────┐  ┌───────────────────┐
    │ @vi/state-fp/storage│  │@vi/state-fp/devtools │  │ @vi/state-fp/sync │
    │ Memory/Local/Session│  │ EventLog · Snapshots │  │ Broadcast·Conflict│
    │ IndexedDB adapters  │  │ TimeTravel · Bridge  │  │ Versioning        │
    │ Obfuscated·Encrypted│  │ DevExtension proto.  │  │                   │
    └────────────┬────────┘  └──────────┬───────────┘  └─────────┬─────────┘
                 │                      │                         │
          ┌──────▼──────────────────────▼─────────────────────────▼──────────┐
          │                      @vi/state-fp/core                            │
          │    Maybe · Either · IO · Task · Reader · StateM · Lens · pipe     │
          └───────────────────────────────────────────────────────────────────┘
```

**Rules:**
- `core` depends on nothing
- `kernel` depends only on `core`
- `storage` depends only on `core`
- `devtools` depends on `core`; uses `kernel` types (`DomainEvent`, `Command`, `CommandError`, `KernelPlugin`) as peer types
- `sync` depends on `core`; uses `kernel` types (`DomainEvent`, `Atom`) as peer types
- `adapter` depends on `kernel` (and optionally `devtools`)
- No circular dependencies — ever

> **Peer dependency** means the module declares types from `kernel` but does not import from
> `@vi/state-fp/kernel` at runtime. The kernel passes its objects (atoms, events) into devtools
> and sync — they receive them, not import them. This preserves the ability to deploy devtools and
> sync without bundling the kernel twice.

---

## 4. CQRS Pattern in @vi/state-fp

### Vocabulary

| Term | Definition |
|---|---|
| **Atom** | The smallest named unit of state (`defineAtom`) |
| **Command** | A named intent to change state (`RegisterUser`, `AddItemToCart`) |
| **CommandHandler** | Pure fn: `(state, command) → Either<CommandError, DomainEvent[]>` |
| **DomainEvent** | Immutable fact: what happened (`UserRegistered`, `ItemAdded`) |
| **EventApplier** | Pure fn: `(state, event) → state` — applies one event to produce next state |
| **Query** | A named request for derived data (`GetCartTotal`, `GetUserDisplayName`) |
| **QueryHandler** | Pure fn: `(state, query) → Result` — never mutates |
| **Kernel** | Runtime: holds atoms, routes commands/queries, applies events, persists state |
| **Projection** | Current state = fold of all domain events via EventApplier from initialState |

### Why two different pure function types?

```
CommandHandler  answers: "Is this command valid? What events should be emitted?"
EventApplier    answers: "Given this event happened, what does state look like now?"

Separating these means:
  - Events can be re-applied (time-travel) WITHOUT re-running command validation
  - Command handlers can express complex business rules independently
  - Event appliers are always simple switch statements — easy to audit
```

### Minimal CQRS (Phase 1 scope)

The minimum viable implementation does NOT require a full event store. Phase 1 uses an in-memory event log and stores **current state** rather than the full event history. This is standard CQRS without full event-sourcing:

```
Phase 1:  Command → Handler → DomainEvent[] → EventApplier → current state (stored)
Phase 3+: Command → Handler → DomainEvent[] → EventApplier → current state + event log (stored)
```

---

## 5. Module — core

**Import path:** `@vi/state-fp/core`  
**Depends on:** nothing  
**Tree-shakeable:** yes — each export is independent

### Exports

| Export | Purpose |
|---|---|
| `Maybe<A>` | Safe null — `Just<A>` or `Nothing` |
| `Either<E,A>` | Typed error — `Right<A>` or `Left<E>` |
| `IO<A>` | Deferred synchronous side effect |
| `Task<A>` | Deferred asynchronous effect (async IO monad) |
| `Reader<R,A>` | Dependency-injection monad — computation depending on an environment `R` |
| `StateM<S,A>` | State-computation monad — pure function `S → [A, S]` for composable state transitions |
| `Lens<S,A>` | Composable immutable update |
| `pipe(a, ...fns)` | Left-to-right composition |
| `compose(...fns)` | Right-to-left composition |
| Constructors | `just`, `nothing`, `left`, `right`, `io`, `task`, `reader`, `stateM` |
| Combinators | `mapMaybe`, `chainMaybe`, `mapEither`, `chainEither`, `mapIO`, `chainIO`, `mapTask`, `chainTask`, `runReader`, `execStateM` |
| Helpers | `over`, `view`, `prop`, `composeLens` |

### Design note

`core` exports are **pure mathematical abstractions**. They have no knowledge of state, commands, or storage. They are safe to import in any environment (Node.js, browser, worker, Deno).

---

## 6. Module — kernel

**Import path:** `@vi/state-fp/kernel`  
**Depends on:** `core` only  
**Peer-optional:** `storage` (for persistence), `devtools` (for tracing)

### What lives here

```
kernel/
  atom.ts         — defineAtom, Atom<S> runtime
  command.ts      — Command type, CommandHandler, CommandBus
  query.ts        — Query type, QueryHandler, QueryBus
  event.ts        — DomainEvent type, EventApplier, DomainEventBus
  kernel.ts       — createKernel (wires everything)
  types.ts        — all kernel-specific types
  index.ts        — barrel
```

### Atom

An Atom is a named slice of state with a version counter for optimistic concurrency.

```ts
const counterAtom = defineAtom<CounterState>({
  key: 'vi/counter',
  initialState: { count: 0 },
});
```

### Command

A Command expresses **intent**. Commands are rejected if validation fails.

```ts
// Definition
type IncrementBy = Command<'counter/incrementBy', { amount: number }>;

// Factory (recommended)
const incrementBy = (amount: number): IncrementBy =>
  command('counter/incrementBy', { amount });
```

```ts
type Command<T extends string = string, P = void> = {
  readonly _kind:    'Command';
  readonly type:     T;
  readonly payload:  P extends void ? never : P;
  readonly meta: {
    readonly correlationId: string;
    readonly causationId?:  string;
    readonly issuedBy?:     string;
    readonly timestamp:     number;
  };
};
```

### CommandHandler

```ts
type CommandHandler<S, C extends Command> = {
  commandType: C['type'];
  handle: (state: S, command: C) => Either<CommandError, DomainEvent[]>;
};

// Example
const incrementByHandler: CommandHandler<CounterState, IncrementBy> = {
  commandType: 'counter/incrementBy',
  handle: (state, cmd) =>
    cmd.payload.amount <= 0
      ? left({ code: 'INVALID_AMOUNT', message: 'amount must be > 0' })
      : right([
          domainEvent('counter/incremented', {
            by:       cmd.payload.amount,
            newCount: state.count + cmd.payload.amount,
          }),
        ]),
};
```

### DomainEvent

A DomainEvent is a **fact** — it cannot fail and carries exactly what changed.

```ts
type DomainEvent<T extends string = string, P = void> = {
  readonly _kind:   'DomainEvent';
  readonly type:    T;
  readonly payload: P extends void ? never : P;
  readonly meta: {
    readonly id:            string;
    readonly correlationId: string;
    readonly causationId:   string;
    readonly atomKey:       string;
    readonly timestamp:     number;
    readonly version:       number;    // atom version at emission
  };
};
```

### EventApplier

```ts
type EventApplier<S> = (state: S, event: DomainEvent) => S;

// Example
const counterApplier: EventApplier<CounterState> = (state, event) => {
  switch (event.type) {
    case 'counter/incremented': return { ...state, count: event.payload.newCount };
    default: return state;
  }
};
```

### Query

```ts
type Query<T extends string = string, P = void> = {
  readonly _kind: 'Query';
  readonly type:  T;
  readonly payload: P extends void ? never : P;
};

type QueryHandler<S, Q extends Query, R> = {
  queryType: Q['type'];
  handle: (state: S, query: Q) => R;
};
```

### Kernel API

```ts
interface Kernel {
  // Write side
  execute<S>(atom: Atom<S>, cmd: Command): Either<CommandError, S>;
  executeAsync<S>(atom: Atom<S>, cmd: Command): Promise<Either<CommandError, S>>;

  // Read side
  query<S, R>(atom: Atom<S>, q: Query): R;

  // Registration
  register<S>(
    atom:     Atom<S>,
    handler:  CommandHandler<S, Command>,
    applier:  EventApplier<S>,
  ): void;

  registerQuery<S, R>(
    atom:    Atom<S>,
    handler: QueryHandler<S, Query, R>,
  ): void;

  // Subscriptions
  subscribe<S>(atom: Atom<S>, listener: (s: S) => void): Unsubscribe;
  onEvent(listener: (e: DomainEvent) => void): Unsubscribe;

  // Lifecycle
  hydrate(): Promise<void>;
  destroy(): Promise<void>;

  // Extension points
  use(plugin: KernelPlugin): void;

  // Debug interface (noopDebug when debug:false)
  readonly debug: DebugInterface;
}
```

### Execute pipeline

```
kernel.execute(atom, command)
  │
  1. Stamp command.meta (correlationId, timestamp) if absent
  │
  2. Look up CommandHandler for command.type
  │   └─ No handler → Left(CommandError { code: 'NO_HANDLER' })
  │
  3. handler.handle(currentState, command)
  │   └─ Left(e)  → record in EventLog, return Left(CommandError)
  │   └─ Right([DomainEvent...]) ↓
  │
  4. For each DomainEvent:
  │   a. Stamp meta (id, causationId, version, timestamp)
  │   b. applier(currentState, event) → nextState
  │   c. atom._setState(nextState)
  │
  5. Persist nextState to StorageAdapter (if configured)
  │
  6. Notify atom subscribers
  │
  7. Emit events on DomainEventBus
  │
  8. Record to DevTools EventLog (if debug: true)
  │
  9. Return Right(finalState)
```

---

## 7. Module — storage

**Import path:** `@vi/state-fp/storage`  
**Depends on:** `core` only  
**No kernel dependency** — storage is a plain adapter

### StorageAdapter interface

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

### Adapters shipped

| Adapter | Backend | Async | Capacity | TTL |
|---|---|---|---|---|
| `MemoryAdapter` | `Map` | sync-wrapped | heap | ✅ |
| `LocalAdapter` | `localStorage` | sync-wrapped | ~10MB | ✅ |
| `SessionAdapter` | `sessionStorage` | sync-wrapped | ~5MB | ✅ |
| `IndexedDbAdapter` | IndexedDB | fully async | ~1GB | ✅ |

### Storage envelope

```ts
type StorageEntry<T> = {
  v:   T;        // value
  t:   number;   // written timestamp
  x?:  number;   // expiry timestamp (absent = immortal)
  tag: string;   // atom key
  fv:  1;        // format version
};
```

### Atom storage config

```ts
const userAtom = defineAtom<UserState>({
  key:          'vi/user',
  initialState: guestUser,
  storage: {
    adapter: new LocalAdapter(),
    key:     'vi:user',
    ttl:     8 * 60 * 60 * 1000, // 8 hours
  },
});
```

### Hydration priority

When `kernel.hydrate()` runs, adapters are tried in order:

```
IndexedDB → localStorage → sessionStorage → memory → initialState
```

---

## 8. Module — sync

**Import path:** `@vi/state-fp/sync`  
**Depends on:** `core` only (peer: `kernel`)  
**Purpose:** Cross-MFE state synchronisation without tight coupling

### Problem

In a Micro-Frontend shell, multiple remotes may hold copies of the same atom. Without a protocol, they diverge.

### Design

The sync module synchronises the _result_ (DomainEvent or persisted state slice). This avoids re-running command validation in receiving MFEs.

```
MFE-A (shell, owner)          MFE-B (remote)
    │                              │
    │  kernel.execute(authAtom,    │
    │    LogIn({ token }))         │
    │                              │
    │── BroadcastChannel ─────────►│
    │  { type: 'vi/sync',          │
    │    atomKey: 'vi/auth-token', │
    │    state: { token: '...' },  │
    │    version: 5,               │
    │    correlationId: 'abc' }    │
    │                              │  MFE-B applies state directly
```

### ConflictStrategy

```ts
type ConflictStrategy =
  | 'last-write-wins'
  | 'first-write-wins'
  | 'owner-wins'
  | 'version-wins'
  | CustomConflictResolver;

type CustomConflictResolver<S> = (
  local:   SyncState<S>,
  remote:  SyncState<S>,
) => S;
```

### SyncEngine API (minimal)

```ts
interface SyncEngine {
  start(): void;
  stop(): void;
  share(atom: Atom<unknown>, options?: ShareOptions): void;
  borrow(atom: Atom<unknown>): void;
}

type ShareOptions = {
  conflict?: ConflictStrategy;
  debounce?: number;
};
```

### Version checking

Each shared atom maintains a monotonically increasing `version` counter. Messages with version ≤ local are discarded. Gaps trigger a full resync.

---

## 9. Module — devtools

**Import path:** `@vi/state-fp/devtools`  
**Depends on:** `core` only (peer: `kernel`)  
**Zero-cost in production** — fully tree-shaken when not imported

### What ships

```
devtools/
  event-log.ts      — append-only circular buffer with O(1) indexed queries
  snapshot.ts       — periodic full-state snapshots
  time-travel.ts    — replay events to any historical state
  bridge.ts         — window.__VI_STATE_FP__ global + console API
  types.ts
  index.ts
```

### DebugEntry

```ts
type DebugEntry = {
  id:              string;
  correlationId:   string;
  causationId:     string;
  atomKey:         string;
  commandType:     string;
  events:          DomainEvent[];
  prevState:       unknown;
  nextState:       unknown;
  diff:            Patch[];
  timestamp:       number;
  durationMs:      number;
  error?:          CommandError;
  sourceLocation?: SourceLocation;
};
```

### DevTools bridge

```js
window.__VI_STATE_FP__.getLog()
window.__VI_STATE_FP__.getAtoms()
window.__VI_STATE_FP__.timeTravelTo(id)
window.__VI_STATE_FP__.exportLog()
window.__VI_STATE_FP__.importLog(json)
```

### Attaching devtools to the kernel

```ts
import { createKernel } from '@vi/state-fp/kernel';
import { createDevTools } from '@vi/state-fp/devtools';

const kernel = createKernel({ debug: false });           // production
const kernel = createKernel({ debug: true });            // development
// — or — explicit:
const devtools = createDevTools({ maxEvents: 500, maxSnapshots: 20 });
const kernel   = createKernel({ devtools });
```

---

## 10. Module — adapter

**Import path:** `@vi/state-fp/adapter`  
**Depends on:** `kernel`  
**Purpose:** Thin wrappers exposing the kernel CQRS API to framework components

### Angular

> **Factory pattern** — zero compile-time `@angular/core` dependency.
> Angular APIs are passed in at call-time, making the adapter testable without `TestBed`.

```ts
import { createAngularAdapter, type AngularAPIs } from '@vi/state-fp/adapter';
import { signal, effect, DestroyRef, inject } from '@angular/core';
import { createKernel } from '@vi/state-fp/kernel';

// Create the adapter once (e.g. in a service or factory provider)
const adapter = createAngularAdapter({ signal, effect, DestroyRef, inject });
const kernel  = createKernel({ devtools: environment.production ? noopDevTools : createDevTools() });

// component
@Component({ ... })
class CounterComponent {
  // Reactive atom as a signal — auto-unsubscribes on component destroy
  readonly count  = adapter.toSignal(kernel, counterAtom);
  // Derived query as a computed signal
  readonly name   = adapter.toQuerySignal(kernel, userAtom, GetDisplayName());
  // Bound command dispatcher
  readonly incr   = adapter.commandDispatcher(kernel, counterAtom);

  increment() {
    this.incr(IncrementBy(1));
  }
}
```

### React

```tsx
import { StateFpProvider, useAtom, useCommand, useQuery } from '@vi/state-fp/adapter';

// Root — provides the kernel to the subtree via Context
<StateFpProvider kernel={kernel}>
  <App />
</StateFpProvider>

// Inside a component
function CounterComponent() {
  const [state]  = useAtom(counterAtom);           // re-renders on state change
  const dispatch = useCommand(counterAtom);        // stable reference
  const total    = useQuery(counterAtom, TotalQ()); // memoised derived value

  return <button onClick={() => dispatch(IncrementBy(1))}>{state.count}</button>;
}
```

### Lit

> **Reactive Controller pattern** — integrates with Lit's reactive update lifecycle without any compile-time Lit dependency.

```ts
import { createLitController } from '@vi/state-fp/adapter';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-counter')
class CounterElement extends LitElement {
  // AtomController implements Lit ReactiveController — auto-subscribes and
  // schedules requestUpdate() on every state change; cleans up on disconnect
  private counter = createLitController(this, kernel, counterAtom);

  render() {
    return html`
      <p>Count: ${this.counter.state.count}</p>
      <button @click=${() => this.counter.dispatch(IncrementBy(1))}>+</button>
    `;
  }
}
```

### Vanilla JS

```ts
import { createAdapter } from '@vi/state-fp/adapter';

const adapter = createAdapter(kernel);

const off = adapter.watch(counterAtom, state => {
  document.getElementById('count')!.textContent = String(state.count);
});

adapter.run(counterAtom, IncrementBy(1));
const count = adapter.read(counterAtom, GetCurrentCount());
```

---

## 11. Write Path

Full sequence from user action to persisted, notified, traced state:

```
Component → kernel.execute(cartAtom, AddItem({ sku: 'ABC', qty: 2 }))
  │
  1. Stamp command metadata (correlationId, timestamp)
  │
  2. Route to CommandHandler
  │   addItemHandler.handle(state, cmd)
  │   └─ Left(err)  → record + return Left(CommandError)
  │   └─ Right([ItemAdded{...}]) ↓
  │
  3. For each DomainEvent:
  │   a. Stamp meta (id, causationId, version)
  │   b. cartApplier(state, ItemAdded) → CartState
  │
  4. atom._setState(newCartState)
  │
  5. StorageAdapter.set(key, state)   [async, non-blocking]
  │
  6. Notify subscribers (sync push)
  │
  7. Emit on DomainEventBus
  │
  8. DevTools.record(entry)           [only if devtools attached]
  │
  9. Return Right(newCartState)
```

---

## 12. Read Path

```
kernel.query(dashboardAtom, BuildSummary())
  │
  1. Look up QueryHandler for 'BuildSummary'
  │   └─ No handler → throws (queries MUST be registered)
  │
  2. handler.handle(currentAtomState, query)
     └─ Pure function — no persistence, no notification
     └─ Returns R synchronously
```

**Multi-atom query** — define a Projection atom updated by a DomainEventBus listener and query it as a regular atom.

---

## 13. Event Sourcing Layer

Phase 1 uses **state-first** storage: current folded state is persisted, not the event log.

### Minimum (Phase 1)
```
Command → DomainEvent[] → apply → persist currentState
```

### Full event sourcing (Phase 4+)
```
Command → DomainEvent[] → append to EventLog → apply
  Replay: tail(EventLog) from nearest snapshot → fold(applier) → currentState
```

The Phase 1 implementation does not prevent moving to full event sourcing — the `EventApplier` is already the fold function, the `DomainEventBus` already emits all events. No API surface changes.

---

## 14. Storage Strategy

Each atom declares `storage.adapter` + `storage.key` + optional `storage.ttl`. No storage = `MemoryAdapter` (default). `kernel.hydrate()` reads from declared adapter; falls back to `initialState`. Write-through: storage is written on every successful `execute()`.

`storageErrorBehavior`: `'warn'` (default) | `'throw'` | `'ignore'`

---

## 15. Cross-MFE Sync Protocol

### Ownership model

| Role | Behaviour |
|---|---|
| **Owner** | Executes commands, broadcasts state after each successful execute |
| **Borrower** | Receives state updates, applies directly (no command re-dispatch) |
| **Observer** | Subscribes to events only — never applies state |

### Three-step protocol

```
1. SHARE  — owner declares atom as shared
2. BORROW — borrower declares it wants updates
3. SYNC   — on first borrow, owner sends full state snapshot
```

---

## 16. Debug Visibility Model

What a DebugEntry captures across the full write path:

```
Command  → CommandHandler → DomainEvent[] → EventApplier → next state
    ↑              ↑                 ↑              ↑
  logged        logged             logged          logged
```

A single `DebugEntry` links: the **command** (intent), the **domain events** (facts), the **state diff** (change), and the **duration** (perf) in one record. Debugging does not require a browser extension.

---

## 17. Public API Surface

### @vi/state-fp/core
```ts
just, nothing, fromNullableMaybe, isNothing, isJust, mapMaybe, chainMaybe, foldMaybe
left, right, isLeft, isRight, mapEither, chainEither, foldEither, bimapEither
io, liftIO, mapIO, chainIO
task, liftTask, mapTask, chainTask, taskFromPromise        // async IO monad
reader, runReader, mapReader, chainReader, askReader        // dependency-injection monad
stateM, runStateM, execStateM, evalStateM, mapStateM       // state-computation monad
lens, prop, composeLens, over, view, set
pipe, compose, identity
uuid, now, deepClone, shallowDiff
```

### @vi/state-fp/kernel
```ts
defineAtom
command, domainEvent, query            // constructors
createKernel
createCommandHandler
createEventApplier
createQueryHandler
// Extension (OCP)
KernelPlugin                           // interface — implement to extend kernel behaviour
```

### @vi/state-fp/storage
```ts
MemoryAdapter, LocalAdapter, SessionAdapter, IndexedDbAdapter
ObfuscatedAdapter                      // wraps any adapter; SHA-256 hashes storage keys
EncryptedAdapter                       // wraps any adapter; AES-GCM encrypts values + obfuscates keys
StorageSecurityPolicy                  // enum: 'visible' | 'obfuscated' | 'encrypted' | 'memory-only'
```

### @vi/state-fp/sync
```ts
createSyncEngine, shareAtom, borrowAtom
```

### @vi/state-fp/devtools
```ts
createDevTools, noopDevTools
attachBridge, detachBridge
DevExtension                           // interface — implement to plug in custom state visualizers
```

### @vi/state-fp/adapter
```ts
// Angular (factory pattern — zero @angular/core compile dependency)
createAngularAdapter
AngularAPIs, AngularKernelAdapter, WriteableSignalLike, DestroyRefLike
// React (Context + hooks)
StateFpProvider, useAtom, useCommand, useQuery
ReactAPIs, ReactKernelAdapter
// Lit (Reactive Controller)
createLitController
AtomController, LitKernelAdapter
// Vanilla
createAdapter
VanillaAdapter
```

---

## 18. Composition Examples

### Minimal — counter (Phase 1)

```ts
import { defineAtom, createKernel, command, domainEvent,
         createCommandHandler, createEventApplier, createQueryHandler } from '@vi/state-fp/kernel';
import { right, left } from '@vi/state-fp/core';

// 1. Atom
const counterAtom = defineAtom({ key: 'vi/counter', initialState: { count: 0 } });

// 2. Command + Handler
const incrementHandler = createCommandHandler({
  commandType: 'counter/incrementBy',
  handle: (state, cmd) =>
    cmd.payload.n > 0
      ? right([domainEvent('counter/incremented', { by: cmd.payload.n })])
      : left({ code: 'INVALID', message: 'n must be positive' }),
});

// 3. Event Applier
const counterApplier = createEventApplier<{ count: number }>({
  'counter/incremented': (state, event) => ({ count: state.count + event.payload.by }),
});

// 4. Query handler
const getCountHandler = createQueryHandler({
  queryType: 'counter/getCount',
  handle: (state) => state.count,
});

// 5. Kernel
const kernel = createKernel();
kernel.register(counterAtom, incrementHandler, counterApplier);
kernel.registerQuery(counterAtom, getCountHandler);

// 6. Use
kernel.execute(counterAtom, command('counter/incrementBy', { n: 3 })); // Right({ count: 3 })
kernel.query(counterAtom, { _kind: 'Query', type: 'counter/getCount' }); // 3
```

### With persistence (Phase 2)

```ts
import { LocalAdapter } from '@vi/state-fp/storage';

const counterAtom = defineAtom({
  key: 'vi/counter',
  initialState: { count: 0 },
  storage: { adapter: new LocalAdapter(), key: 'vi:counter' },
});

await kernel.hydrate(); // restore from localStorage
```

### With devtools (Phase 3)

```ts
import { createDevTools } from '@vi/state-fp/devtools';

const kernel = createKernel({
  devtools: createDevTools({ maxEvents: 500 }),
});
// window.__VI_STATE_FP__.timeTravelTo(eventId) in browser console
```

### With MFE sync (Phase 4)

```ts
import { createSyncEngine } from '@vi/state-fp/sync';

const sync = createSyncEngine({ channel: 'vi-state', kernel });
sync.share(authAtom, { conflict: 'owner-wins' });
sync.start();
```

---

## 19. Design Invariants

| # | Invariant |
|---|---|
| I1 | `CommandHandler.handle` is always a pure function — no I/O, no async |
| I2 | `EventApplier` is always a pure function — no I/O, no async |
| I3 | `QueryHandler.handle` is always read-only — never calls `execute` or mutates |
| I4 | DomainEvents are immutable once emitted |
| I5 | `core` module never imports from any other module |
| I6 | `kernel` module never imports from `storage`, `devtools`, `sync`, or `adapter` |
| I7 | Storage errors never throw — always `Either<StorageError, T>` |
| I8 | Subscribers are `(state: S) => void` — no RxJS, no Subjects |
| I9 | `kernel.execute()` is synchronous for the reduce step; storage write is async but non-blocking |
| I10 | Debug layer is always zero-cost when devtools not attached |
| I11 | `window.__VI_STATE_FP__` is **never** attached in production builds — devtools bridge is dev-only |
| I12 | Storage adapters that persist to browser storage (Local, Session, IndexedDB) **must** declare their `StorageSecurityPolicy` |
| I13 | `KernelPlugin` hooks are the only way to extend kernel behaviour — the kernel itself is never modified |
| I14 | Framework adapters (Angular, React, Lit) have zero compile-time dependency on their respective frameworks — APIs are injected at runtime |
| I15 | `BroadcastChannel` (and all browser APIs) must be guarded with `typeof BroadcastChannel !== 'undefined'` before use — sync code is always safe in Node.js/SSR/worker contexts |
| I16 | High-frequency UI state (scroll, drag, resize ≥ 10 events/second) must **never** go through the kernel — use `EphemeralStream<T>` instead |
| I17 | `AsyncCommandHandler.handleAsync` must accept and honour an `AbortSignal` — in-flight async commands must resolve `Left({ code: 'CANCELLED' })` when the signal fires |

---

## 20. Phase-Wise Scope Boundaries

| Phase | Module(s) | What ships | Minimum usable? |
|---|---|---|---|
| **1 — FP Core** | `core`, `kernel` | Atom, Command, DomainEvent, EventApplier, Query, Kernel (memory-only) | ✅ Yes |
| **2 — Persistence** | `storage` | All adapters, TTL, hydration, SSR guards, ObfuscatedAdapter, EncryptedAdapter | ✅ Yes |
| **3 — Observability** | `devtools` | EventLog, Snapshots, TimeTravelController, DevToolsBridge, DevExtension, SSR hydration | ✅ Yes |
| **4 — MFE Sync** | `sync` | BroadcastChannel, conflict resolution, versioning, Universal transport (SSR/Node.js/cross-origin), EphemeralStream | ✅ Yes |
| **5 — Framework** | `adapter` | Angular adapter (Signals + DI), React adapter (hooks + useEphemeral), Lit adapter (ReactiveController), Vanilla | ✅ Yes |
| **8 — Offline-First** | `sync+`, `core+` | CRDT merge strategies (6 types), offline event queue, sync-on-reconnect, merge composition with Lens | ✅ Yes (opt-in) |

Each phase is independently shippable as a semver minor release.

---

## 21. Open/Closed Extension Model (OCP)

> **Open for extension, closed for modification.**  
> All kernel behaviour is extended via `KernelPlugin` — never by editing the kernel itself.

### KernelPlugin Interface

```ts
/**
 * A KernelPlugin is the single extension point for the kernel.
 * Plugins are registered via `kernel.use(plugin)` and receive lifecycle hooks.
 * All hooks are optional — implement only the ones you need.
 */
interface KernelPlugin {
  /** Human-readable name — appears in debug traces */
  readonly name: string;

  /**
   * Called before a command is routed to its handler.
   * Returning Left short-circuits execution with the error.
   * Returning a Command replaces the original (use for command decoration).
   * Returning void passes through unchanged.
   */
  beforeExecute?<S>(
    atom: Atom<S>,
    cmd:  Command,
  ): Command | Left<CommandError> | void;

  /**
   * Called after a successful command execution (Right path only).
   * Use for analytics, logging, or triggering side effects.
   * Cannot modify the result.
   */
  afterExecute?<S>(
    atom:   Atom<S>,
    cmd:    Command,
    result: S,
    events: DomainEvent[],
  ): void;

  /**
   * Called on every domain event emitted by the event bus.
   * Receives all events from all atoms — filter by atomKey or type.
   */
  onEvent?(event: DomainEvent): void;

  /**
   * Called once after `kernel.hydrate()` completes.
   * Receives the initial state of all atoms after hydration.
   */
  onHydrate?(snapshot: Record<string, unknown>): void;

  /**
   * Called when a command handler returns Left (validation failure).
   * Use for error telemetry or user-facing notifications.
   */
  onCommandError?(atom: Atom<unknown>, cmd: Command, error: CommandError): void;

  /**
   * Called when `kernel.destroy()` is invoked — clean up plugin resources.
   */
  onDestroy?(): void;
}
```

### Built-In Plugins

| Plugin | Source | Purpose |
|---|---|---|
| `createLoggingPlugin()` | `@vi/state-fp/kernel` | `console.log` every command + event |
| `createAnalyticsPlugin(tracker)` | `@vi/state-fp/kernel` | Forwards commands/events to an analytics sink |
| `createReduxDevToolsBridge()` | `@vi/state-fp/devtools` | Connects to Redux DevTools browser extension |
| `createDevExtensionPlugin(ext)` | `@vi/state-fp/devtools` | Bridges any `DevExtension` implementor into the kernel |

### Plugin Registration

```ts
const kernel = createKernel();

// Logging (dev only)
if (!environment.production) {
  kernel.use(createLoggingPlugin({ verbose: true }));
}

// Analytics (prod + dev)
kernel.use(createAnalyticsPlugin(analyticsService));

// Custom plugin — conforms to KernelPlugin interface
kernel.use({
  name: 'my-audit-log',
  afterExecute(atom, cmd, result, events) {
    auditService.log({ atom: atom.definition.key, cmd: cmd.type, events });
  },
});
```

### Why not modify the kernel directly?

Adding a new concern directly to `kernel.ts` would violate OCP:
- Future changes create merge conflicts in the kernel
- Every test must account for the new concern even if not relevant
- Teams cannot ship independent kernel extensions as separate packages

With `KernelPlugin`, each concern is a separate, independently testable unit.
The kernel itself is never touched.

---

## 22. Storage Security — Production Visibility

> **Data stored in `localStorage` and `sessionStorage` is fully visible in Chrome DevTools → Application → Storage in plaintext.**  
> `IndexedDB` is also visible. Only `MemoryAdapter` is invisible to browser DevTools.

### Threat Model

An attacker (or curious support engineer) with physical access to a machine can open
Chrome DevTools in a production tab and read all `localStorage` keys and values. For most
UI state (theme, pagination cursor) this is harmless. For sensitive state (auth tokens, PII,
session data) this is a security risk.

For compliance-sensitive applications (HIPAA, PCI-DSS, GDPR), this is a requirement:
**sensitive state must not be readable from browser DevTools in production**.

### StorageSecurityPolicy

```ts
type StorageSecurityPolicy =
  | 'visible'      // default — keys + values readable in browser DevTools
  | 'obfuscated'   // keys are SHA-256 hashed — structure hidden, values still plain
  | 'encrypted'    // keys hashed + values AES-GCM encrypted via SubtleCrypto
  | 'memory-only'; // MemoryAdapter only — completely invisible, lost on page reload
```

Declare the policy on the atom:

```ts
const authAtom = defineAtom<AuthState>({
  key: 'vi/auth',
  initialState: guestState,
  storage: {
    adapter: new LocalAdapter(),
    key:     'vi:auth',
    ttl:     8 * 60 * 60 * 1000,
    security: 'encrypted',  // ← values will be AES-GCM encrypted before writing
  },
});
```

### ObfuscatedAdapter

Wraps any `StorageAdapter`. Replaces the human-readable storage key with a
deterministic SHA-256 hash. The value is still stored in plaintext.

```ts
import { ObfuscatedAdapter, LocalAdapter } from '@vi/state-fp/storage';

const adapter = new ObfuscatedAdapter(new LocalAdapter(), { salt: appVersion });
// localStorage will show: "a3f29b..." instead of "vi:user"
```

Use when: the data itself is not sensitive but you want to prevent casual inspection
of what atoms exist.

### EncryptedAdapter

Wraps any `StorageAdapter`. Derives an AES-GCM key via PBKDF2 from a provided
secret (typically derived from a session token or server-provided nonce), encrypts
values before writing, and decrypts on read. Keys are also hashed.

```ts
import { EncryptedAdapter, LocalAdapter } from '@vi/state-fp/storage';

// Secret should be derived from a server-provided session nonce, NOT a
// hardcoded string — hardcoded secrets are easily extracted from bundle.
const adapter = new EncryptedAdapter(new LocalAdapter(), {
  secretProvider: () => sessionTokenService.getNonce(), // async fn → string
  algorithm:      'AES-GCM',
  keyDerivation:  'PBKDF2',
  iterations:     100_000,
});
```

> **Security note:** The `EncryptedAdapter` uses the browser's `SubtleCrypto` API — no
> third-party crypto library is needed. The derived key is held in memory only (never stored).
> The nonce used for each encryption operation is stored alongside the ciphertext.

### Memory-Only (Maximum Security)

The most secure option for sensitive state is to **never persist it** — use `MemoryAdapter`.
State is lost on page reload but can be restored by re-authenticating.

```ts
const authAtom = defineAtom<AuthState>({
  key: 'vi/auth',
  initialState: guestState,
  // No storage config → MemoryAdapter is the default
  // State is invisible to DevTools; restored by re-auth on reload
});
```

### Recommended Policy Per Data Category

| Data category | Recommended policy | Rationale |
|---|---|---|
| Auth token / session | `memory-only` | Invisible; short-lived; restored by re-auth |
| User PII (name, email) | `encrypted` | Must persist but not readable in DevTools |
| User preferences (theme, locale) | `visible` or `obfuscated` | Not sensitive |
| Shopping cart | `obfuscated` | Low sensitivity; key hiding prevents casual inspection |
| Pagination / scroll offset | `visible` (MemoryAdapter) | Ephemeral; no persistence needed |
| Feature flags | `visible` | Not sensitive |

---

## 23. Universal / SSR Rendering Support

Angular Universal, Next.js, and Astro execute JavaScript on the server. Any code that
references browser-only globals (`window`, `localStorage`, `BroadcastChannel`) will
**crash the process** with `ReferenceError` unless guarded.

### Kernel behaviour in SSR

The kernel itself is pure TypeScript with no browser imports — it is inherently SSR-safe.
The three areas that require guards are storage, devtools bridge, and sync transport.

### Storage SSR guard

```ts
// src/storage/env.ts — single environment check for all browser storage adapters
export const isBrowser =
  typeof window    !== 'undefined' &&
  typeof document  !== 'undefined' &&
  typeof localStorage !== 'undefined';
```

Every `WebStorage`-backed adapter wraps its access:
```ts
async get(key: string): Promise<Maybe<T>> {
  if (!isBrowser) return nothing;          // silent no-op in SSR
  return fromNullable(localStorage.getItem(key));
}
```

`MemoryAdapter` is always SSR-safe — it uses a `Map` with no DOM dependency.

### Devtools bridge SSR guard

```ts
// Never attach window.__VI_STATE_FP__ in SSR
export function attachBridge(devtools: DevTools): void {
  if (typeof window === 'undefined') return;  // server: no-op
  (window as any).__VI_STATE_FP__ = createBridgeAPI(devtools);
}
```

### Sync transport SSR guard

See Section 4.6 in the phases document for the full `createAutoTransport` design.
In SSR contexts, `createSyncEngine` automatically selects `createNoopTransport` —
all `sync.share()` and `sync.borrow()` calls become no-ops without throwing:

```ts
function createAutoTransport<S>(channelName: string): SyncTransport<S> {
  if (typeof BroadcastChannel !== 'undefined') return createBroadcastBridge(channelName);
  if (typeof window           === 'undefined') return createNoopTransport();  // SSR / Node.js
  return createPostMessageTransport(channelName);
}
```

### SSR hydration flow (Angular Universal / Next.js)

```
Server:
  1. Execute command handlers against in-memory atoms (no storage, no sync)
  2. Collect atom states: kernel.snapshotAll()
  3. Serialize to HTML: <script>window.__INITIAL_STATE__ = { ... }</script>

Client:
  1. createKernel({ ssr: { source: () => window.__INITIAL_STATE__, priority: 'ssr-first' } })
  2. kernel.hydrate()
     a. Reads SSR payload first (priority: 'ssr-first')
     b. Then overlays with browser storage adapters (avoids stale cache overwriting fresh SSR data)
  3. Attaches devtools bridge (dev-only)
  4. Starts sync engine (BroadcastChannel available now)
```

### Invariants confirmed by this section

- **I15**: All browser APIs guarded with `typeof X !== 'undefined'` checks
- `MemoryAdapter` is the **recommended default storage adapter** for SSR applications

---

## 24. High-Frequency UI State (EphemeralStream)

Not all UI state belongs in an atom. Atoms are optimised for **business-logic state**:
they have a full CQRS cycle (command → handler → events → applier), are persisted,
logged to DevTools, and synced cross-MFE. Forcing high-frequency UI state through this
pipeline creates unnecessary overhead.

### The problem with atoms for scroll / drag / resize

```
atom._setState(newState)
  └─► subscribers.forEach(fn => fn(state))   ← called 60×/second
       ├─► Angular signal.set()                  ← triggers change detection
       ├─► React useState setter                ← schedules reconciler
       ├─► Lit host.requestUpdate()             ← schedules re-render
       ├─► SyncEngine.broadcast()               ← BroadcastChannel.postMessage() 💥
       ├─► DevTools.record()                    ← structuredClone(state) 💥
       └─► StorageAdapter.set()                 ← async storage write 💥
```

At 60 fps, this fires 3 600 times per minute. `BroadcastChannel.postMessage` and
`structuredClone` on every mouse-move event would be catastrophic.

### EphemeralStream<T> — the solution

`EphemeralStream<T>` is a lightweight reactive primitive from `@vi/state-fp/core` that
has **no CQRS overhead** — no command, no event, no applier, no storage, no sync:

```
stream.emit(value)
  └─► subscribers.forEach(fn => fn(value))   ← that's it
```

For rendering, `subscribeAnimated` caps updates to one per animation frame,
always delivering the **latest** value (not every intermediate position):

```ts
const mousePos = createEphemeralStream<{ x: number; y: number }>();

// Chrome DevTools Performance panel: mousemove fires 300+/s
window.addEventListener('mousemove', e => mousePos.emit({ x: e.clientX, y: e.clientY }));

// Component only re-renders at 60 fps regardless of event rate
const pos = reactAdapter.useEphemeral(mousePos);
```

### Decision table

| Question | Yes → | No → |
|---|---|---|
| Does this state need to outlive the page? | Atom | EphemeralStream |
| Does this state need to be shared cross-MFE? | Atom | EphemeralStream |
| Does this state update > 10 times/second? | EphemeralStream | Either |
| Does this state need undo/time-travel? | Atom | EphemeralStream |
| Is this triggered by a human action (click, form submit)? | Atom | EphemeralStream |
| Is this driven by a browser API (scroll, resize, pointermove)? | EphemeralStream | Either |

### Invariant I16 enforced

The kernel enforces **I16** structurally: there is no API to execute a command against
an `EphemeralStream`. Streams are not registered with the kernel; they have no `key`
property and no `_setState` method. Passing one to `kernel.execute()` is a compile-time
type error.

---

*Last updated: v3 — Added I15-I17 invariants, Phase 8 (CRDT/offline-first), Section 23 (SSR/Universal), Section 24 (EphemeralStream / High-Frequency State).*
