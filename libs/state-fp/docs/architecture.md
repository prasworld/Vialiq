# @vialiq/state-fp — Architecture Design (v2)

> **Status:** Revised — Modular CQRS Architecture  
> **Pattern:** CQRS (Command Query Responsibility Segregation)  
> **Guiding law:** *Build the minimum needed. Leave room for complexity.*  
> **Test Coverage:** 318 tests | 86.32% branch coverage ✅ | See [Feature Comparison](./feature-comparison.md)

---

## Table of Contents

1. [Why CQRS?](#1-why-cqrs)
2. [Module Map](#2-module-map)
3. [Dependency Graph](#3-dependency-graph)
4. [CQRS Pattern in @vialiq/state-fp](#4-cqrs-pattern-in-vi-state-fp)
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
21. **[Feature Coverage & Comparison](./feature-comparison.md)** — see separate doc

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
@vialiq/state-fp/core      — FP primitives (Maybe, Either, IO, Task, Reader, StateM, Lens, pipe)
@vialiq/state-fp/kernel    — CQRS engine: CommandBus, QueryBus, DomainEventBus, Atom, Kernel, KernelPlugin
@vialiq/state-fp/storage   — StorageAdapter interface + Memory, LocalStorage, SessionStorage, IndexedDB,
                          ObfuscatedAdapter
@vialiq/state-fp/sync      — Cross-MFE sync: BroadcastChannel, conflict resolution, versioning
@vialiq/state-fp/devtools  — EventLog, Snapshots, TimeTravelController, DevToolsBridge, DevExtension
@vialiq/state-fp/adapter   — Framework wrappers: Angular (Signals), Vanilla (shipped); React hooks + Lit (Phase 5 — stubs only)
```

Each module is a separate entry-point in `package.json#exports`. Modules compose upward — never downward.

---

## 3. Dependency Graph

```
          ┌──────────────────────────────────────────────────────────┐
          │                    @vialiq/state-fp/adapter                  │
          │        Angular · React · Lit · Vanilla shells             │
          └────────────────┬──────────────────────────────────────────┘
                           │ depends on
          ┌────────────────▼──────────────────────────────────────────┐
          │                 @vialiq/state-fp/kernel                       │
          │   CommandBus · QueryBus · DomainEventBus · Atom · Kernel  │
          │   KernelPlugin (OCP extension point)                      │
          └──────┬───────────────────────┬───────────────────────────┘
                 │ depends on            │ peer-extends
    ┌────────────▼────────┐  ┌──────────▼──────────┐  ┌───────────────────┐
    │ @vialiq/state-fp/storage│  │@vialiq/state-fp/devtools │  │ @vialiq/state-fp/sync │
    │ Memory/Local/Session│  │ EventLog · Snapshots │  │ Broadcast·Conflict│
    │ IndexedDB adapters  │  │ TimeTravel · Bridge  │  │ Versioning        │
    │ Obfuscated          │  │ DevExtension proto.  │  │                   │
    └────────────┬────────┘  └──────────┬───────────┘  └─────────┬─────────┘
                 │                      │                         │
          ┌──────▼──────────────────────▼─────────────────────────▼──────────┐
          │                      @vialiq/state-fp/core                            │
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
> `@vialiq/state-fp/kernel` at runtime. The kernel passes its objects (atoms, events) into devtools
> and sync — they receive them, not import them. This preserves the ability to deploy devtools and
> sync without bundling the kernel twice.

---

## 4. CQRS Pattern in @vialiq/state-fp

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

**Import path:** `@vialiq/state-fp/core`  
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

**Import path:** `@vialiq/state-fp/kernel`  
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

**Import path:** `@vialiq/state-fp/storage`  
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

**Import path:** `@vialiq/state-fp/sync`  
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

### SyncEngine API

```ts
type SyncEngine = {
  // Start synchronising an atom — returns unsync() to stop just that atom
  share<S>(atom: Atom<S>, options?: ShareOptions<S>): Unsubscribe;

  // Inspect current sync state (version, peers, conflicts) for an atom
  getState<S>(atomKey: string): SyncState<S> | undefined;

  // Tear down all channels and subscriptions
  destroy(): void;
};

type ShareOptions<S> = {
  conflict?:  ConflictStrategy<S>;  // default: 'last-write-wins'
  peerId?:    string;               // default: random uuid
  channel?:   string;               // BroadcastChannel name; default: atom.key
  propagate?: boolean;              // reply to hello messages; default: true
};
```

> **No `borrow()`, `start()`, or `stop()` methods.** Ownership asymmetry (owner vs borrower)
> is achieved via `propagate: true` (shell MFEs that own an atom) vs `propagate: false`
> (remote MFEs that just want to receive updates).

### Version checking

Each shared atom maintains a monotonically increasing `version` counter. Messages with version ≤ local are discarded. Gaps trigger a full resync.

---

## 9. Module — devtools

**Import path:** `@vialiq/state-fp/devtools`  
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

### DebugEntry (actual type in `devtools/types.ts`)

```ts
// One DebugEntry per DomainEvent emitted. A single execute() call emitting
// N events produces N DebugEntry objects in the EventLog.
type DebugEntry = {
  readonly id:            string;           // uuid — unique per entry
  readonly atomKey:       string;           // e.g. 'vi/cart'
  readonly correlationId: string;           // groups all entries from one user action
  readonly causationId:   string | undefined; // parent command's correlationId (if any)
  readonly commandType:   string | undefined; // e.g. 'cart/addItem'
  readonly event:         DomainEvent;      // the individual DomainEvent
  readonly stateBefore:   unknown;          // deep-clone before event applied
  readonly stateAfter:    unknown;          // deep-clone after event applied
  readonly timestamp:     number;           // wall-clock ms
  readonly version:       number;           // atom version at time of event
  // NOTE: No 'diff', no 'durationMs', no 'error', no 'sourceLocation'
  // Duration is available on KernelPlugin.onExecute params (separate from DevTools)
};
```

> **`KernelDebugEntry` vs `DebugEntry`:** The kernel has its own internal
> `KernelDebugEntry` (fed to `debug.record()`) that includes `durationMs` and `error?`.
> The devtools module creates the richer per-event `DebugEntry` objects in its
> `KernelPlugin.onExecute` hook — these are what `eventLog.getAll()` returns.

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
import { createKernel }   from '@vialiq/state-fp/kernel';
import { createDevTools } from '@vialiq/state-fp/devtools';

// Development — full devtools
const devtools = createDevTools({ maxLogSize: 500, snapshotEvery: 50 });
const kernel   = createKernel({ debug: true });
kernel.use(devtools.plugin);     // connect via KernelPlugin (onRegister + onExecute)

// Access the devtools instance:
devtools.eventLog.getAll()       // ReadonlyArray<DebugEntry>
devtools.snapshots.list()        // ReadonlyArray<Snapshot>
devtools.timeTravel.goTo(id)     // replay to any point

// Production — zero overhead (no devtools plugin; noopDebug object)
const kernel = createKernel();   // debug defaults to false; noopDebug object used
```

> **Pattern detail:** `createDevTools()` returns a `DevToolsInstance` — not a
> `KernelOptions` value. The `devtools.plugin` (a `KernelPlugin`) is what you pass to
> `kernel.use()`. The `debug: true` option on `KernelOptions` separately controls the
> kernel's internal `DebugInterface` recording for `KernelDebugEntry` objects.

---

## 10. Module — adapter

**Import path:** `@vialiq/state-fp/adapter`  
**Depends on:** `kernel`  
**Purpose:** Thin wrappers exposing the kernel CQRS API to framework components

### Angular

> **Factory pattern** — zero compile-time `@angular/core` dependency.
> Angular APIs are passed in at call-time, making the adapter testable without `TestBed`.

```ts
import { createAngularAdapter, type AngularAPIs } from '@vialiq/state-fp/adapter';
import { signal, DestroyRef, inject } from '@angular/core';
import { createKernel } from '@vialiq/state-fp/kernel';

// Create the adapter once (e.g. in a service or factory provider)
const adapter = createAngularAdapter({ signal, inject, DestroyRef });
const kernel  = createKernel({ debug: !environment.production });
if (!environment.production) { kernel.use(createDevTools().plugin); }

// component
@Component({ ... })
class CounterComponent {
  // Reactive atom as a signal — auto-unsubscribes on component destroy
  readonly count  = adapter.toSignal(counterAtom, kernel);
  // Derived query as a computed signal
  readonly name   = adapter.toQuerySignal(userAtom, kernel, GetDisplayName);
  // Bound command dispatcher
  readonly incr   = adapter.commandDispatcher(counterAtom, kernel);

  increment() {
    this.incr(IncrementBy(1));
  }
}
```

### React (Phase 5 — stub only)

> **Status: type stubs only.** `src/adapter/react.ts` exports type declarations but no
> implementation is shipped. React hooks will be added in Phase 5.4.

Planned API (factory pattern, same as Angular adapter):

```ts
// Phase 5.4 — planned
export declare function useAtom<S>(atom: Atom<S>): [S, (cmd: Command) => void];
export declare function useQuery<S, R>(atom: Atom<S>, q: Query): R;
export declare function useCommandDispatcher<S>(
  atom: Atom<S>,
  kernel: Kernel,
): (cmd: Command) => Either<CommandError, S>;
```

### Lit (Phase 5 — not yet implemented)

> **Status: no implementation.** `src/adapter/lit.ts` does not exist. A Lit
> `ReactiveController` adapter is planned for Phase 5.5. Use the `VanillaAdapter`
> for web-component integration in Lit elements until Phase 5.5 ships.

### Vanilla JS

```ts
import { createAdapter } from '@vialiq/state-fp/adapter';

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
  1. Stamp command metadata (correlationId, timestamp, issuedBy)
  │  Guard: if atom is ComputedAtom → return Left({ code: 'COMPUTED_ATOM' })
  │
  2. Route to CommandHandler
  │   addItemHandler.handle(state, cmd)
  │   └─ Left(err)  → plugins.onError + debugLayer.record → return Left(CommandError)
  │   └─ Right([ItemAdded{...}]) ↓
  │
  3. For each DomainEvent:
  │   a. Stamp meta (id, causationId, version, atomKey)
  │   b. cartApplier(state, ItemAdded) → CartState (EventApplier — pure fn)
  │
  4. atom._setState(newCartState)   ← synchronous in-memory update
  │
  4.5 recomputeDependents(atomKey) [Phase 2.5]  ← synchronous, before storage
  │   For each ComputedAtom depending on cartAtom:
  │     compute new value → if changed → computed._setComputed(nextValue)
  │     → computed subscribers notified before source atom subscribers
  │
  5. StorageAdapter.set(key, state)   [async, non-blocking — fire-and-forget]
  │   storage errors → plugins.onError({ code: 'STORAGE_WRITE_ERROR' })
  │
  6. eventBus.emit(stampedEvents)     [for SyncEngine + onEvent( ) listeners]
  │
  7. plugins.forEach(p => p.onExecute?.(params))   [devtools records here]
  │   params: { command, events, prevState, nextState, atomKey, durationMs }
  │
  8. if debugLayer.isEnabled:
  │   debugLayer.record({ ... sanitize(atomKey, prevState), sanitize(atomKey, nextState) ... })
  │
  9. Return Right(newCartState)
```

**Performance notes:**

- Steps 1–7 are synchronous. `execute()` returns before the `Promise` from step 5 resolves.
- Step 4.5 adds an O(deps) synchronous pass — each computed dep runs `Object.is` before recomputing.
- Steps 6 and 7 are O(listeners) synchronous pushes.
- The `noopDebug` object at step 8 is a no-op object call — zero branching overhead in production.

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

Each atom declares `storage.adapter` + `storage.key` + optional `storage.ttl`. No storage = `MemoryAdapter` (default). `kernel.hydrate()` reads from each atom's declared adapter; falls back to `initialState`. Write-through: storage is written fire-and-forget on every successful `execute()`. Storage write errors are surfaced to plugins via `onError()` but never block execution.

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

A single `DebugEntry` captures: the **command** (intent), one **domain event** (fact), and the full **before/after state** (change) in one record. A command that emits N events produces N entries — all sharing the same `correlationId`. Causality chains are tracked via `causationId`. Debugging does not require a browser extension.

---

## 17. Public API Surface

### @vialiq/state-fp/core
```ts
just, nothing, fromNullableMaybe, isNothing, isJust, mapMaybe, chainMaybe, foldMaybe
ok, err, isOk, isErr, match,
left, right, isLeft, isRight, mapEither, chainEither, foldEither, bimapEither
io, liftIO, mapIO, chainIO
task, liftTask, mapTask, chainTask, taskFromPromise        // async IO monad
reader, runReader, mapReader, chainReader, askReader        // dependency-injection monad
stateM, runStateM, execStateM, evalStateM, mapStateM       // state-computation monad
lens, prop, composeLens, over, view, set
pipe, compose, identity
uuid, now, deepClone, shallowDiff
```

### @vialiq/state-fp/kernel
```ts
defineAtom
defineComputedAtom              // Phase 2.5 — computed (read-only) projection from multiple atoms
command, domainEvent, query     // constructors
createKernel
createCommandHandler
createAsyncCommandHandler       // Phase 1.4 — async handler with AbortSignal support
createEventApplier
createQueryHandler
// Kernel instance methods (all phases)
// kernel.execute(atom, cmd)                           → Either<CommandError, S>
// kernel.executeAsync(atom, cmd, opts?)               → Promise<Either<CommandError, S>>
// kernel.executeOptimistic(atom, cmd, opts)           → Promise<Either<CommandError, S>>
// kernel.query(atom, q)                               → R
// kernel.register(atom, handler, applier)
// kernel.register(atom)                               → co-located form
// kernel.registerAsync(atom, asyncHandler, applier)
// kernel.registerQuery(atom, handler)
// kernel.registerComputed(computedAtom)
// kernel.subscribe(atom, listener)                    → Unsubscribe
// kernel.subscribeComputed(computedAtom, listener)    → Unsubscribe
// kernel.onEvent(listener)                            → Unsubscribe
// kernel.hydrate()                                    → Promise<void>
// kernel.destroy()                                    → Promise<void>
// kernel.use(plugin)
// kernel.debug                                        → DebugInterface (read-only)
// Extension (OCP)
KernelPlugin                    // type — implement to extend kernel behaviour
```

### @vialiq/state-fp/storage
```ts
MemoryAdapter, LocalAdapter, SessionAdapter, IndexedDbAdapter
ObfuscatedAdapter                      // wraps any adapter; SHA-256 hashes storage keys
StorageSecurityPolicy                  // 'visible' | 'obfuscated' | 'memory-only'
```

### @vialiq/state-fp/sync
```ts
createSyncEngine    // factory: createSyncEngine({ kernel }) → SyncEngine
// SyncEngine methods: .share(atom, opts), .getState(atomKey), .destroy()
// ShareOptions: conflict, peerId, channel, propagate
```

### @vialiq/state-fp/devtools
```ts
createDevTools      // factory: createDevTools(opts?) → DevToolsInstance
// DevToolsInstance: { plugin, eventLog, snapshots, timeTravel, uninstall }
// plugin: KernelPlugin — pass to kernel.use(devtools.plugin)
// eventLog: EventLog — .getAll(), .getByAtom(), .getByCorrelation(), etc.
// snapshots: SnapshotManager — .list(), .nearestBefore(), .export(), .import()
// timeTravel: TimeTravelController — .goTo(entryId)
```

### @vialiq/state-fp/adapter
```ts
// Angular (factory pattern — zero @angular/core compile dependency) — SHIPPED
createAngularAdapter
AngularAPIs, AngularKernelAdapter, WriteableSignalLike, DestroyRefLike
// Vanilla — SHIPPED
createAdapter
VanillaAdapter
// React (Context + hooks) — Phase 5 STUB ONLY (no implementation)
// Lit (ReactiveController) — Phase 5.5 NOT YET IMPLEMENTED
```

---

## 18. Composition Examples

### Minimal — counter (Phase 1)

```ts
import { defineAtom, createKernel, command, domainEvent,
         createCommandHandler, createEventApplier, createQueryHandler,
         ok, err } from '@vialiq/state-fp/kernel';

// 1. Atom
const counterAtom = defineAtom({ key: 'vi/counter', initialState: { count: 0 } });

// 2. Command + Handler
const incrementHandler = createCommandHandler({
  commandType: 'counter/incrementBy',
  handle: (state, cmd) =>
    cmd.payload.n > 0
      ? ok([domainEvent('counter/incremented', { by: cmd.payload.n })])
      : err({ code: 'INVALID', message: 'n must be positive' }),
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
kernel.execute(counterAtom, command('counter/incrementBy', { n: 3 })); // ok({ count: 3 })
kernel.query(counterAtom, { _kind: 'Query', type: 'counter/getCount' }); // 3
```

### With persistence (Phase 2)

```ts
import { LocalAdapter } from '@vialiq/state-fp/storage';

const counterAtom = defineAtom({
  key: 'vi/counter',
  initialState: { count: 0 },
  storage: { adapter: new LocalAdapter(), key: 'vi:counter' },
});

await kernel.hydrate(); // restore from localStorage
```

### With devtools (Phase 3)

```ts
import { createDevTools } from '@vialiq/state-fp/devtools';

// createDevTools() returns DevToolsInstance — connect via kernel.use()
const devtools = createDevTools({ maxLogSize: 500 });
const kernel   = createKernel({ debug: true });
kernel.use(devtools.plugin);
// window.__VI_STATE_FP__.timeTravelTo(entryId) in browser console
```

### With MFE sync (Phase 4)

```ts
import { createSyncEngine } from '@vialiq/state-fp/sync';

// channel is per-atom (in ShareOptions), not global
const sync = createSyncEngine({ kernel });

// shell MFE — owns the atom and broadcasts updates
const unsync = sync.share(authAtom, {
  conflict:  'owner-wins',
  channel:   'vi-auth',    // BroadcastChannel name
  propagate: true,
});

// remote MFE — receives updates without broadcasting
const unsyncRemote = sync.share(authAtom, {
  conflict:  'owner-wins',
  channel:   'vi-auth',
  propagate: false,        // do not reply to hello messages
});

// Clean up
unsync();
sync.destroy();
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

| Phase | Module(s) | What ships | Status |
|---|---|---|---|
| **1 — FP Core** | `core`, `kernel` | Atom, Command, DomainEvent, EventApplier, Query, Kernel (memory-only), co-located registration, `AsyncCommandHandler` with `AbortSignal` | ✅ Shipped |
| **2 — Persistence** | `storage`, `kernel` | All 5 storage adapters, TTL, hydration, TTL sweep, `ObfuscatedAdapter`, security policies (`visible`/`obfuscated`/`memory-only`); `defineComputedAtom`, `executeOptimistic`, `stateSanitizer` | ✅ Shipped |
| **3 — Observability** | `devtools` | `EventLog`, `SnapshotManager`, `TimeTravelController`, `DevToolsBridge` (`window.__VI_STATE_FP__`), `DevExtension` plugin | ✅ Shipped |
| **4 — MFE Sync** | `sync` | `createSyncEngine` — `BroadcastChannel` transport, version vectors, 4 conflict strategies (`last-write-wins`, `first-write-wins`, `owner-wins`, `version-wins`), cross-MFE `share()` | ⚠️ Partial — Universal/SSR transport, `EphemeralStream`, and extended peer protocols are planned (Phase 4.6–4.8) |
| **5 — Framework** | `adapter` | Angular adapter (`createAngularAdapter` — `toSignal`, `toQuerySignal`, `commandDispatcher`); Vanilla adapter (`createAdapter` — `watch`, `run`, `read`, `query`, `destroy`) | ⚠️ Partial — React (hooks) and Lit (`ReactiveController`) adapters are Phase 5 planned (stubs only in source) |
| **6 — Tooling** | `tools/` | Nx generators (`create-app`, `create-lib`) | ⏳ Planned |
| **7 — Saga / Process Manager** | `kernel+` | Process manager for multi-step command sequences | ⏳ Planned |
| **8 — Offline-First** | `sync+`, `core+` | CRDT merge strategies, offline event queue, sync-on-reconnect | ⏳ Planned |

Each phase is independently shippable as a semver minor release. Shipped phases are
backward-compatible; planned phases are subject to design change.

---

## 21. Open/Closed Extension Model (OCP)

> **Open for extension, closed for modification.**  
> All kernel behaviour is extended via `KernelPlugin` — never by editing the kernel itself.

### KernelPlugin Interface

The actual `KernelPlugin` type (from `kernel/types.ts`):

```ts
/**
 * A KernelPlugin is the single extension point for the kernel.
 * Plugins are registered via `kernel.use(plugin)` and receive lifecycle hooks.
 * All hooks are optional — implement only the ones you need.
 */
type KernelPlugin = {
  /** Human-readable name — appears in error messages and debug traces. */
  readonly name: string;

  /**
   * Called when any atom is registered via kernel.register() or registerComputed().
   * Used by the devtools plugin to track atoms for time-travel.
   */
  onRegister?: (atom: Atom<unknown>) => void;

  /**
   * Called after every successful execute() cycle (sync, async, and optimistic).
   * Use for analytics, logging, or triggering side effects.
   * Cannot modify the result — purely observational.
   *
   * Params include: command, emitted events, prevState, nextState, atomKey, durationMs.
   */
  onExecute?: (params: {
    command:    Command;
    events:     DomainEvent[];
    prevState:  unknown;
    nextState:  unknown;
    atomKey:    string;
    durationMs: number;
  }) => void;

  /**
   * Called when a command handler returns Left (validation failure) or when
   * a storage write fails.
   * Use for error telemetry, user-facing notifications, or retry logic.
   */
  onError?: (params: {
    command: Command;
    error:   CommandError;
    atomKey: string;
  }) => void;

  /**
   * Called once when kernel.destroy() is invoked — clean up plugin resources.
   */
  onDestroy?: () => void;
};
```

> **What's NOT in `KernelPlugin`:**
> - No `beforeExecute` / `afterExecute` — no way to intercept/reject commands via plugin
> - No `onEvent` — subscribe to domain events via `kernel.onEvent()` instead
> - No `onHydrate` — hook `kernel.hydrate()` externally if needed
> - No `onCommandError` alias — it's `onError`
>
> If you need pre-execute interception (e.g. command validation outside the handler),
> that pattern belongs in a command middleware layer in front of the kernel, not inside it.

### Shipped Plugins

| Plugin | Source | Purpose |
|---|---|---|
| `createDevTools().plugin` | `@vialiq/state-fp/devtools` | Records DebugEntry per event; manages EventLog, Snapshots, Bridge |

> **Planned for future phases:**
> - `createLoggingPlugin()` (Phase 3+) — `console.log` every command + event
> - `createAnalyticsPlugin(tracker)` (Phase 3+) — forwards to analytics sink
> - `createReduxDevToolsBridge()` (Phase 3+) — connects to Redux DevTools extension

### Plugin Registration

```ts
import { createKernel }   from '@vialiq/state-fp/kernel';
import { createDevTools } from '@vialiq/state-fp/devtools';

const kernel   = createKernel({ debug: true });
const devtools = createDevTools({ maxLogSize: 500 });

// Register the devtools plugin
kernel.use(devtools.plugin);

// Custom plugin — implements only the hooks you need
kernel.use({
  name: 'my-audit-log',
  onExecute(params) {
    // params: { command, events, prevState, nextState, atomKey, durationMs }
    auditService.log({
      atomKey:    params.atomKey,
      command:    params.command.type,
      eventTypes: params.events.map(e => e.type),
      durationMs: params.durationMs,
    });
  },
  onError(params) {
    errorTracker.capture(params.error, { atomKey: params.atomKey });
  },
});

// Plugin for analytics (prod + dev)
kernel.use({
  name: 'analytics',
  onExecute({ command, atomKey }) {
    analytics.track('kernel.execute', { command: command.type, atom: atomKey });
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
/**
 * | Policy       | Keys in DevTools | Values in DevTools | Persisted? |
 * |--------------|------------------|--------------------|------------|
 * | 'visible'    | Plaintext        | Plaintext          | Yes        |
 * | 'obfuscated' | SHA-256 hash     | Plaintext          | Yes        |
 * | 'memory-only'| N/A              | N/A (JS heap only) | No         |
 */
type StorageSecurityPolicy =
  | 'visible'      // default — keys + values readable in DevTools; suitable for non-sensitive state
  | 'obfuscated'   // keys SHA-256 hashed; values still plaintext — hides application structure
  | 'memory-only'; // stays in JS heap only — invisible to DevTools, not persisted across reloads
```

> **Why there is no `'encrypted'` policy:** Client-side encryption is NOT a security control
> for browser DevTools visibility. The encryption key must arrive in JavaScript as a plaintext
> string — any debugger breakpoint exposes it. After decryption the plaintext lives in the
> JS heap and is visible to the Memory profiler. An attacker can call `crypto.subtle.decrypt()`
> themselves with the IV and ciphertext from the Application tab.
>
> Redux, NgRx, MobX, and Zustand all reached this same conclusion — none of them offer
> encryption. The correct controls are `stateSanitizer` (redact DevTools output) and
> `memory-only` (never persist sensitive state).

Declare the policy on the atom's `storage.security` field:

```ts
// Sensitive credentials — never write to browser storage
const authAtom = defineAtom<AuthState>({
  key: 'vi/auth',
  initialState: guestState,
  storage: {
    adapter: new LocalAdapter(),   // adapter is ignored at runtime when memory-only
    key:     'vi:auth',
    security: 'memory-only',       // ← kernel enforces: no hydrate, no write-through
  },
});

// Non-sensitive preferences — obfuscate structure, value is still plaintext
const prefsAtom = defineAtom<UserPrefs>({
  key: 'vi/prefs',
  initialState: defaultPrefs,
  storage: {
    adapter: new ObfuscatedAdapter(new LocalAdapter(), { salt: appVersion }),
    key:     'vi:prefs',
    security: 'obfuscated',
  },
});
```

### ObfuscatedAdapter

Wraps any `StorageAdapter`. Replaces the human-readable storage key with a
deterministic SHA-256 hash. The value is still stored in plaintext.

```ts
import { ObfuscatedAdapter, LocalAdapter } from '@vialiq/state-fp/storage';

const adapter = new ObfuscatedAdapter(new LocalAdapter(), { salt: appVersion });
// localStorage will show: "a3f29b..." instead of "vi:user"
```

Use when: the data itself is not sensitive but you want to prevent casual inspection
of what atoms exist.

### stateSanitizer — Redacting Sensitive Fields from DevTools

The `stateSanitizer` option on `KernelOptions` is the correct way to prevent sensitive
fields from appearing in the DevTools debug log. It is the same pattern used by
Redux DevTools Extension and NgRx `@ngrx/store-devtools`.

**Critical:** `stateSanitizer` only affects the DevTools snapshot — the real in-memory
state is **never modified**. Components always see the full, unsanitized state.

```ts
const kernel = createKernel({
  debug: true,
  stateSanitizer: (atomKey, state) => {
    // Redact auth state in DevTools — real state in memory is untouched
    if (atomKey === 'vi/auth') {
      return { ...(state as AuthState), token: '[REDACTED]', refreshToken: '[REDACTED]' };
    }
    // Redact PII fields wherever they appear
    if (atomKey === 'vi/user') {
      return { ...(state as UserState), email: '[REDACTED]', phoneNumber: '[REDACTED]' };
    }
    // All other atoms pass through unchanged
    return state;
  },
});

// Attach devtools as a plugin (separate from kernel creation)
const devtools = createDevTools();
kernel.use(devtools.plugin);
```

When `stateSanitizer` is provided, **all 7 paths** where the kernel calls
`debugLayer.record()` route state through it first:

```
execute() success path   → sanitize(atomKey, prevState) + sanitize(atomKey, nextState)
execute() failure path   → sanitize(atomKey, prevState) (nextState = prevState on error)
executeAsync() success   → same
executeAsync() failure   → same
executeAsync() abort     → same
```

**When `debug: true` is not set in `KernelOptions`**, `stateSanitizer` is never called —
zero overhead in production.

### Memory-Only (Maximum Security)

The most secure option for sensitive state is to **never persist it**.
State is lost on page reload but can be restored by re-authenticating.

```ts
// No storage config at all → MemoryAdapter is the default
const authAtom = defineAtom<AuthState>({
  key: 'vi/auth',
  initialState: { isAuthenticated: false, token: null, userId: null },
  // State exists only in the JS heap — invisible to browser DevTools
  // Restored by re-authentication after page reload
});

// Explicit memory-only with BroadcastChannel sync (new tabs receive state from owner)
// In the shell — share auth state across tabs without persisting to browser storage
// sync.share(authAtom, { conflict: 'owner-wins', syncOnOpen: true });
```

### Recommended Policy Per Data Category

| Data category | Recommended policy | Rationale |
|---|---|---|
| Auth token / session | `memory-only` | Invisible to DevTools; non-persistent; restored by re-auth |
| PII (name, email, address) | `memory-only` or server-fetch | Client-side PII storage carries GDPR risk regardless of policy |
| Sensitive business data (health, financial) | `memory-only` | Never persist client-side — fetch from server after auth |
| User preferences (theme, locale) | `visible` or `obfuscated` | Not sensitive |
| Shopping cart | `obfuscated` | Low sensitivity; key hiding prevents casual inspection |
| Pagination / scroll offset | `visible` (MemoryAdapter) | Ephemeral; no persistence needed |
| Feature flags | `visible` | Not sensitive |

### Browser DevTools Visibility Matrix

| Adapter | Visible in DevTools? | Notes |
|---|---|---|
| `MemoryAdapter` | ❌ Never | JS heap only — no DevTools surface |
| `SessionAdapter` | ✅ Always (plaintext) | Application → Session Storage |
| `LocalAdapter` | ✅ Always (plaintext) | Application → Local Storage |
| `IndexedDbAdapter` | ✅ Always (plaintext) | Application → IndexedDB |
| `ObfuscatedAdapter(Local)` | ⚠️ Key hidden, value plain | Application → Local Storage |
| Any adapter + `memory-only` policy | ❌ Never | Adapter ignored at runtime by kernel |
| Any atom + `stateSanitizer` | ✅ DevTools shows sanitized value only | Real state in memory is always full |

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

### Sync transport in SSR contexts

The shipped `createSyncEngine` uses `BroadcastChannel` for cross-MFE communication.
In SSR / Node.js environments, `BroadcastChannel` is unavailable. The recommended
pattern is to **not attach the sync engine on the server** — only call `createSyncEngine`
in browser-only code paths:

```ts
// Only attach sync in browser environments
if (typeof BroadcastChannel !== 'undefined') {
  const sync = createSyncEngine({ kernel });
  sync.share(cartAtom, { channel: 'vi/cart', conflict: 'last-write-wins' });
}
```

> **Planned (Phase 4.6):** A `createAutoTransport` utility that selects the appropriate
> transport automatically (BroadcastChannel → PostMessage → NoopTransport) based on the
> runtime environment. Not yet shipped.

### SSR hydration pattern

The kernel is safe to use on the server. Use `MemoryAdapter` (the default) so storage
writes are no-ops. Serialize atom state to the HTML payload and rehydrate on the client:

```ts
// Server side — run commands against in-memory atoms
const kernel = createKernel({ debug: false });
await kernel.hydrate();
// ... execute commands, build page state ...

// Serialize state to transfer to client
// (Manual snapshot: iterate known atoms and call atom.get())
const payload = {
  cart:     cartAtom.get(),
  settings: settingsAtom.get(),
};
// Embed in HTML: <script>window.__INITIAL_STATE__ = { ... }</script>

// Client side — boot kernel with pre-hydrated values
const kernel = createKernel();
const initialState = (window as any).__INITIAL_STATE__;
if (initialState) {
  // Seed atoms directly before first render
  kernel.execute(cartAtom,     seedState(initialState.cart));
  kernel.execute(settingsAtom, seedState(initialState.settings));
}
// Then hydrate from storage (browser storage overlays SSR data)
await kernel.hydrate();
```

> **Planned (Phase 5+):** Built-in `createKernel({ ssr: { source, priority } })` option
> with `kernel.hydrate()` merging SSR state and browser storage automatically.
> Not yet shipped — implement the manual pattern above.

### Invariants confirmed by this section

- **I15**: All browser APIs guarded with `typeof X !== 'undefined'` checks
- `MemoryAdapter` is the **recommended default storage adapter** for SSR applications

---

## 24. High-Frequency UI State (EphemeralStream)

> **Status: Planned — Phase 4.7 design proposal. Not yet implemented in source.**
> The APIs below (`createEphemeralStream`, `subscribeAnimated`, `useEphemeral`) do not
> exist in the current codebase. This section documents the design intent.

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

### EphemeralStream<T> — the planned solution (Phase 4.7)

`EphemeralStream<T>` is designed as a lightweight reactive primitive from `@vialiq/state-fp/core`
with **no CQRS overhead** — no command, no event, no applier, no storage, no sync.

Proposed API:

```ts
// NOT YET IMPLEMENTED — Phase 4.7 design
const mousePos = createEphemeralStream<{ x: number; y: number }>();

// stream.emit(value) calls all subscribers synchronously — nothing else
window.addEventListener('mousemove', e => mousePos.emit({ x: e.clientX, y: e.clientY }));

// subscribeAnimated caps updates to one per animation frame (rAF-based)
mousePos.subscribeAnimated(pos => updateCursor(pos));

// React hook (Phase 5) — component only re-renders at 60 fps
const pos = reactAdapter.useEphemeral(mousePos);
```

**Current workaround (no EphemeralStream yet):** For high-frequency events, use
framework-native primitives directly (Angular `signal()`, React `useRef` / `useState`,
Lit `@state`) and only write to a state-fp atom on throttled/debounced boundaries (e.g.,
on `pointerup` or a `requestAnimationFrame` interval).

### Decision table

| Question | Yes → | No → |
|---|---|---|
| Does this state need to outlive the page? | Atom | EphemeralStream (planned) |
| Does this state need to be shared cross-MFE? | Atom | EphemeralStream (planned) |
| Does this state update > 10 times/second? | EphemeralStream (planned) | Either |
| Does this state need undo/time-travel? | Atom | EphemeralStream (planned) |
| Is this triggered by a human action (click, form submit)? | Atom | EphemeralStream (planned) |
| Is this driven by a browser API (scroll, resize, pointermove)? | EphemeralStream (planned) | Either |

### Invariant I16 (design intent)

The planned `EphemeralStream` enforces **I16** structurally: there is no API to execute
a command against a stream. Streams would have no `key` property and no `_setState`
method — passing one to `kernel.execute()` would be a compile-time type error.

---

*Last updated: v4 — Corrected Phase-Wise table (Phases 4/5/6/7/8 status), refactored Section 23 (SSR — removed unshipped APIs, added real BroadcastChannel guard pattern), labeled Section 24 (EphemeralStream) as Phase 4.7 planned design.*
