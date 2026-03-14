# @vi/state-fp — Phase-Wise Development Plan

> **Guiding principle:** Ship the minimum that is useful. Extend in stable increments.  
> Each phase produces a complete, independently usable semver minor release.

---

## Table of Contents

1. [Phase 0 — Scaffolding (Done)](#phase-0--scaffolding-done)
2. [Phase 1 — FP Core + CQRS Kernel (Active)](#phase-1--fp-core--cqrs-kernel)
   - [Phase 1.3 — Co-located Command Handler Registration](#phase-13--co-located-command-handler-registration-dx)
   - [Phase 1.4 — executeAsync Contract](#phase-14--executeasync-contract)
3. [Phase 2 — Persistence (Storage)](#phase-2--persistence-storage)
   - [Phase 2.5 — Computed / Derived Atoms](#phase-25--computed--derived-atoms)
   - [Phase 2.6 — Optimistic Updates + Rollback](#phase-26--optimistic-updates--rollback)
4. [Phase 3 — Observability (DevTools)](#phase-3--observability-devtools)
   - [Phase 3.5 — Command Payload Validation](#phase-35--command-payload-validation)
   - [Phase 3.6 — Query Memoisation](#phase-36--query-memoisation)
   - [Phase 3.7 — SSR Hydration Protocol](#phase-37--ssr-hydration-protocol)
5. [Phase 4 — MFE Sync](#phase-4--mfe-sync)
   - [Phase 4.5 — Cross-MFE Domain Event Bus](#phase-45--cross-mfe-domain-event-bus)
   - [Phase 4.6 — Universal Transport Guard (SSR + Node.js + Workers)](#phase-46--universal-transport-guard)
   - [Phase 4.7 — High-Frequency UI State (EphemeralStream)](#phase-47--high-frequency-ui-state)
6. [Phase 5 — Framework Adapters](#phase-5--framework-adapters)
   - [Phase 5.3 — Lit Adapter (Reactive Controller)](#53--lit-adapter-reactive-controller)
   - [Phase 5.4 — React Adapter (full implementation)](#54--react-adapter-full-implementation)
   - [Phase 5.5 — Vanilla Adapter](#55--vanilla-js-adapter)
   - [Phase 5.6 — Storage Security Adapters](#56--storage-security-adapters-phase-5-co-deliverable)
7. [Phase 6 — DX & Release Hardening](#phase-6--dx--release-hardening)
8. [Phase 7 — Saga / Process Manager](#phase-7--saga--process-manager)
9. [Phase 8 — Offline-First / CRDT Conflict Merging](#phase-8--offline-first--crdt-conflict-merging)
10. [Milestone Summary Table](#milestone-summary-table)
11. [Dependency Between Phases](#dependency-between-phases)
12. [Non-Goals Per Phase](#non-goals-per-phase)

---

## Phase 0 — Scaffolding (Done)

**Goal:** Nx library scaffold with working build, test, and lint pipelines.

### Deliverables

- [x] `libs/state-fp/project.json` — Nx targets (build, test, lint)
- [x] `libs/state-fp/package.json` — library manifest (`@vi/state-fp`)
- [x] `libs/state-fp/tsconfig.json` + `tsconfig.lib.json` + `tsconfig.spec.json`
- [x] `libs/state-fp/vitest.config.mts`
- [x] Initial `src/lib/` source files (monolithic — superseded in Phase 1)
- [x] Initial `docs/architecture.md` (monolithic — superseded by CQRS version)

### Exit criteria

- `nx build state-fp` succeeds
- `nx test state-fp` succeeds with ≥ 0 tests (empty suite)
- `nx lint state-fp` clean

---

## Phase 1 — FP Core + CQRS Kernel

**Goal:** Deliver the minimal, fully usable CQRS state engine without any persistence or external dependencies.

**Modules shipped:** `@vi/state-fp/core`, `@vi/state-fp/kernel`

**Import path after this phase:**
```ts
import { Maybe, Either, pipe }                         from '@vi/state-fp/core';
import { defineAtom, createKernel, command, domainEvent } from '@vi/state-fp/kernel';
```

---

### 1.1 — core module

**Directory:** `src/core/`

| File | Exports | Notes |
|---|---|---|
| `maybe.ts` | `Maybe<A>`, `just`, `nothing`, `fromNullable`, `isJust`, `isNothing`, `mapMaybe`, `chainMaybe`, `foldMaybe`, `toNullable` | Pure monad — no IO |
| `either.ts` | `Either<E,A>`, `left`, `right`, `isLeft`, `isRight`, `mapEither`, `chainEither`, `foldEither`, `bimapEither`, `sequenceEither`, `fromTry` | Error channel |
| `io.ts` | `IO<A>`, `io`, `liftIO`, `mapIO`, `chainIO`, `IORef`, `sequenceIO` | Deferred effects |
| `lens.ts` | `Lens<S,A>`, `lens`, `prop`, `composeLens`, `over`, `view`, `set`, `index`, `optional` | Immutable updates |
| `utils.ts` | `pipe`, `compose`, `identity`, `constant`, `uuid`, `now`, `deepClone`, `shallowDiff` | Shared utilities |
| `index.ts` | Re-exports all of the above | Barrel |

**Testing requirements:**
- `maybe.spec.ts` — all combinators, edge cases (null, undefined)
- `either.spec.ts` — Left propagation, fromTry, sequence
- `io.spec.ts` — deferred execution, compositionality
- `lens.spec.ts` — nested updates, array index, composeLens
- `utils.spec.ts` — pipe/compose arity, deepClone correctness

**Exit criteria:**
- All types are structurally sound (no `any`)
- 100% of exported fns documented with JSDoc
- ≥ 90% line coverage

---

### 1.2 — kernel module

**Directory:** `src/kernel/`

| File | Exports | Notes |
|---|---|---|
| `types.ts` | `Command<T,P>`, `DomainEvent<T,P>`, `Query<T,P>`, `CommandError`, `Atom<S>`, `AtomDefinition<S>`, `KernelPlugin`, `Unsubscribe`, `DebugInterface` | Type-only — no runtime |
| `atom.ts` | `defineAtom`, `AtomRuntime<S>` (internal) | Holds state, version, subscribers |
| `event.ts` | `DomainEventBus`, `domainEvent`, `EventApplier<S>`, `createEventApplier` | DomainEvent construction + bus |
| `command.ts` | `command`, `CommandHandler<S,C>`, `CommandBus`, `createCommandHandler` | Command construction + routing |
| `query.ts` | `query`, `QueryHandler<S,Q,R>`, `QueryBus`, `createQueryHandler` | Query construction + routing |
| `kernel.ts` | `createKernel`, `Kernel` | Main entry — wires all buses |
| `index.ts` | Re-exports all public kernel names | Barrel |

#### Atom runtime shape (internal)

```ts
type AtomRuntime<S> = {
  readonly definition: AtomDefinition<S>;
  _state: S;
  _version: number;
  _subscribers: Set<(s: S) => void>;
  _setState(s: S): void;
  get(): S;
  subscribe(fn: (s: S) => void): Unsubscribe;
};
```

#### Kernel internals (Phase 1 scope)

```
Kernel {
  _commandHandlers:  Map<string, CommandHandler<unknown, Command>>
  _eventAppliers:    Map<string, Map<string, EventApplier<unknown>>>
  _queryHandlers:    Map<string, QueryHandler<unknown, Query, unknown>>
  _atoms:            Map<string, AtomRuntime<unknown>>
  _eventBus:         DomainEventBus
  _plugins:          KernelPlugin[]
  _debug:            DebugInterface
}
```

#### Phase 1 kernel constraints

- `execute()` is **synchronous** in Phase 1 — no async steps
- Storage plugin is a no-op in Phase 1 (MemoryAdapter built-in to atom)
- `devtools` plugin slot exists but is no-op by default
- `executeAsync()` exists and delegates to `execute()` wrapped in `Promise.resolve()`

**Testing requirements:**
- `atom.spec.ts` — subscribe/unsubscribe lifecycle, version increments
- `command.spec.ts` — routing, NO_HANDLER error, correlationId stamping
- `event.spec.ts` — EventBus fan-out, causationId propagation
- `query.spec.ts` — synchronous return, unregistered query throws
- `kernel.spec.ts` — full integration: register → execute → query → subscribe

**Exit criteria:**
- All invariants I1–I10 from architecture doc satisfied
- Full write path tests (happy path, validation failure, no handler)
- No runtime `any` in kernel layer
- ≥ 90% line coverage

---

### Phase 1 package.json exports (minimal)

> **ESM-only** — CJS is intentionally not shipped. All consumers must use bundlers that
> support `"exports"` with `"import"` conditions (Vite, webpack 5+, esbuild, Nx).

```json
{
  "type": "module",
  "exports": {
    "./core":   { "import": "./dist/core/index.js",   "types": "./dist/core/index.d.ts" },
    "./kernel": { "import": "./dist/kernel/index.js", "types": "./dist/kernel/index.d.ts" }
  }
}
```

### Phase 1 Definition of Done

- [ ] `src/core/` — all 6 files created, tests passing
- [ ] `src/kernel/` — all 7 files created, tests passing
- [ ] `package.json#exports` updated with `./core` and `./kernel`
- [ ] `tsconfig.json#paths` has `@vi/state-fp/core` and `@vi/state-fp/kernel`
- [ ] `nx build state-fp` succeeds with ESM-only output (no `.cjs` files)
- [ ] `nx test state-fp` — all tests pass, ≥ 90% coverage
- [ ] `docs/architecture.md` updated ✅
- [ ] `docs/phases.md` created ✅
- [ ] `README.md` updated with Phase 1 examples

---

### Phase 1.3 — Co-located Command Handler Registration (DX)

**Motivation:** Importing the atom definition and importing handlers separately creates
a registration ceremony spread across multiple files. Co-location mirrors Effector's
`sample` / `guard` model and dramatically reduces boilerplate.

```ts
const counterAtom = defineAtom({
  key:          'vi/counter',
  initialState: { count: 0 },
  commands:     [incrementByHandler],   // pure — unit-testable standalone
  applier:      counterApplier,         // pure — unit-testable standalone
  queries:      [getCurrentCountHandler],
});

// Replaces: kernel.register(counterAtom, incrementByHandler, counterApplier)
kernel.register(counterAtom);
```

`defineAtom` signature gain is backwards-compatible — `commands`/`applier`/`queries` are
optional. Handlers declared in the definition are merged with explicit `register()` calls.

**Exit criteria:**
- [ ] `atom.ts` accepts optional `commands`, `applier`, `queries` in `AtomDefinition`
- [ ] `kernel.register(atom)` reads these fields if present
- [ ] Existing `kernel.register(atom, handler, applier)` signature unchanged
- [ ] Tests confirm both registration forms work identically

---

### Phase 1.4 — `executeAsync` Contract

**Motivation:** Phase 1 `executeAsync` wraps synchronous `execute()` in `Promise.resolve()`.
This is insufficient for commands requiring async validation (uniqueness check), async
side-effects (HTTP call before emitting events), or cancellable operations.

```ts
type AsyncCommandHandler<S, C extends Command> = {
  commandType: C['type'];
  handleAsync: (
    state:   S,
    command: C,
    ctx:     AsyncHandlerContext,
  ) => Promise<Either<CommandError, DomainEvent[]>>;
};

type AsyncHandlerContext = {
  signal: AbortSignal;         // for cancellation
  correlationId: string;       // for tracing sub-commands
};
```

`executeAsync` dispatches to `handleAsync` if registered, falls back to synchronous
`handle` wrapped in a Promise otherwise.

**Exit criteria:**
- [ ] `AsyncCommandHandler` type defined in `kernel/types.ts`
- [ ] `kernel.registerAsync(atom, asyncHandler, applier)` added
- [ ] `kernel.executeAsync()` calls `handleAsync` when async handler registered
- [ ] Cancellation via `AbortSignal` works — in-flight promise resolves `Left({ code: 'CANCELLED' })`
- [ ] Tests: async success, async failure, cancellation

---

## Phase 2 — Persistence (Storage)

**Goal:** Make state outlive the page / tab / browser restart through pluggable, TTL-aware storage adapters.

**Module shipped:** `@vi/state-fp/storage`

**Import path:**
```ts
import { MemoryAdapter, LocalAdapter, SessionAdapter, IndexedDbAdapter } from '@vi/state-fp/storage';
```

---

### 2.1 — storage module

**Directory:** `src/storage/`

| File | Exports | Notes |
|---|---|---|
| `types.ts` | `StorageAdapter`, `StorageEntry<T>`, `StorageError`, `StorageConfig`, `StorageResult<T>` | Interfaces only |
| `base-web.ts` | `WebStorageAdapter` (abstract) | Shared logic for local/session |
| `memory.ts` | `MemoryAdapter` | Map-backed, TTL sweep |
| `local.ts` | `LocalAdapter extends WebStorageAdapter` | `window.localStorage` |
| `session.ts` | `SessionAdapter extends WebStorageAdapter` | `window.sessionStorage` |
| `indexed-db.ts` | `IndexedDbAdapter` | Full async, 1GB, TTL |
| `index.ts` | Barrel | |

### 2.2 — Kernel storage integration

Kernel's `execute()` pipeline gains a **Phase 2 storage step**:

```
Step 5 (previously no-op):
  if atom.definition.storage:
    const entry = { v: nextState, t: now(), tag: atom.definition.key }
    atom.definition.storage.adapter.set(key, entry, ttl)
      → fire-and-forget with error surfaced to storageErrorBehavior handler
```

`kernel.hydrate()` gains real implementation:

```
For each registered atom:
  1. Check atom.definition.storage is defined
  2. adapter.get(key) → Maybe<StorageEntry<S>>
  3. isNothing → use initialState
  4. isExpired(entry) → use initialState, delete stale entry
  5. isJust → parse + validate → set atom state
```

### 2.3 — Storage envelope

```ts
type StorageEntry<T> = {
  v:   T;        // value
  t:   number;   // written unix ms
  x?:  number;   // expiry unix ms
  tag: string;   // atom key
  fv:  1;        // format version (for future migrations)
};
```

### 2.4 — Error handling strategy

```ts
type StorageErrorBehavior = 'warn' | 'throw' | 'ignore';
// Default: 'warn' — console.warn, continue with in-memory state
```

**Testing requirements:**
- `memory.spec.ts` — TTL expiry, key isolation
- `web-storage.spec.ts` — envelope serialisation, TTL on read
- `indexed-db.spec.ts` — async read/write, TTL sweep  
  (use vitest's built-in fake IndexedDB via `fake-indexeddb`)
- Integration test: `hydrate()` reads from adapter and sets atom state

**Phase 2 Definition of Done:**

- [ ] `src/storage/` — all 7 files, tests passing
- [ ] `package.json#exports` gains `./storage`
- [ ] `kernel.hydrate()` reads from declared adapters
- [ ] `kernel.execute()` writes through to declared adapter
- [ ] `nx test state-fp` — new tests pass, coverage maintained

---

### Phase 2.5 — Computed / Derived Atoms

**Motivation:** Every production application needs values derived from one or more atoms
(cart total, unread count, display name from user state). Currently this requires
manual `DomainEventBus` subscriptions. Derived atoms make this declarative.

```ts
const cartTotalAtom = defineComputedAtom({
  key:     'vi/cart-total',
  deps:    [cartAtom],
  compute: ([cart]: [CartState]) =>
    cart.items.reduce((sum, item) => sum + item.price * item.qty, 0),
});

// Read-only — no command handlers or applier needed
const total = kernel.get(cartTotalAtom);       // number
kernel.subscribe(cartTotalAtom, v => ...);
```

Computed atoms recompute only when a dependency atom changes (reference-equal short-circuit).
They cannot accept commands — they are strictly read-only projections.

**Exit criteria:**
- [ ] `defineComputedAtom(config)` factory in `kernel/atom.ts`
- [ ] `kernel.get(atom)` for synchronous read (no query needed for simple projection)
- [ ] Reactive: subscribers notified when any dep changes
- [ ] Memoised: `compute` not re-run if deps are reference-equal
- [ ] `kernel.execute(computedAtom, cmd)` returns `Left({ code: 'COMPUTED_ATOM' })`

---

### Phase 2.6 — Optimistic Updates + Rollback

**Motivation:** For responsive UIs (add to cart, like a post), the UI should reflect the
optimistic state immediately without waiting for async confirmation.

```ts
const result = await kernel.executeOptimistic(cartAtom, AddItem(sku), {
  optimisticApplier: (state, cmd) => ({ ...state, items: [...state.items, provisional(cmd)] }),
  confirm: async (optimisticState) => serverApi.addToCart(sku),
  onRollback: (err) => toastService.error('Could not add item'),
});
```

On `confirm` failure:
1. atom state is reverted to the pre-optimistic snapshot
2. `onRollback` is called
3. `executeOptimistic` returns `Left(CommandError)`

**Exit criteria:**
- [ ] `kernel.executeOptimistic(atom, cmd, opts)` in `kernel.ts`
- [ ] State reverted atomically on failure (no partial optimistic state leaks)
- [ ] DevTools records both the optimistic entry and the rollback entry
- [ ] Tests: success path (state confirmed), failure path (rollback to original)

---

## Phase 3 — Observability (DevTools)

**Goal:** Make every state transition inspectable, replayable, and exportable without a browser extension.

**Module shipped:** `@vi/state-fp/devtools`

**Import path:**
```ts
import { createDevTools, attachBridge } from '@vi/state-fp/devtools';
```

---

### 3.1 — devtools module

**Directory:** `src/devtools/`

| File | Exports | Notes |
|---|---|---|
| `types.ts` | `DebugEntry`, `Snapshot`, `DebugInterface`, `Patch`, `SourceLocation`, `TimeTravelState` | Type-only |
| `event-log.ts` | `EventLog`, `createEventLog` | Circular buffer, O(1) indexed queries |
| `snapshot.ts` | `SnapshotManager`, `createSnapshotManager` | Policy-driven snapshots |
| `time-travel.ts` | `TimeTravelController`, `createTimeTravelController` | Step ± N events, go-to event |
| `bridge.ts` | `attachBridge`, `detachBridge`, `DevToolsBridge` | `window.__VI_STATE_FP__` |
| `devtools.ts` | `createDevTools`, `noopDevTools` | Creates configured debug layer |
| `index.ts` | Barrel | |

### 3.2 — DebugInterface (kernel protocol)

The kernel uses a `DebugInterface` internally. When no devtools are attached, this is `noopDevTools` — zero overhead, zero allocations.

```ts
interface DebugInterface {
  record(entry: DebugEntry): void;
  getLog(): DebugEntry[];
  getSnapshot(id: string): Snapshot | undefined;
  isEnabled: boolean;
}

const noopDevTools: DebugInterface = {
  record:      () => void 0,
  getLog:      () => [],
  getSnapshot: () => undefined,
  isEnabled:   false,
};
```

### 3.3 — EventLog

Bounded circular buffer with three O(1) indices:

```ts
interface EventLog {
  append(entry: DebugEntry): void;
  getAll(): ReadonlyArray<DebugEntry>;
  getByAtom(key: string): ReadonlyArray<DebugEntry>;
  getByCorrelation(id: string): ReadonlyArray<DebugEntry>;
  getByTimeRange(from: number, to: number): ReadonlyArray<DebugEntry>;
  last(n: number): ReadonlyArray<DebugEntry>;
  clear(): void;
  export(): string;    // JSON
  import(json: string): void;
  readonly size: number;
  readonly maxSize: number;
}
```

### 3.4 — TimeTravelController

```ts
interface TimeTravelController {
  to(eventId: string): Either<string, void>;
  stepForward(): Either<string, void>;
  stepBackward(): Either<string, void>;
  exit(): void;

  readonly isReplaying: boolean;
  readonly currentEventId: string | undefined;
}
```

Time-travel algorithm:

```
to(targetEventId):
  1. Find entry with id === targetEventId in EventLog
  2. Find nearest Snapshot with eventCount ≤ entry.index
  3. Reset all atoms to snapshot.state
  4. Replay entries from snapshot forward until targetEventId
  5. Set isReplaying = true (blocks execute() during replay)
  6. Notify all atom subscribers with replayed states
```

**Testing requirements:**
- `event-log.spec.ts` — circular eviction, index correctness
- `snapshot.spec.ts` — interval policy, prune, export/import
- `time-travel.spec.ts` — full replay correctness, step navigation
- `bridge.spec.ts` — window attachment, console API methods

**Phase 3 Definition of Done:**

- [ ] `src/devtools/` — all 7 files, tests passing
- [ ] `package.json#exports` gains `./devtools`
- [ ] `createKernel({ devtools: createDevTools() })` causes DebugEntry per execute
- [ ] `window.__VI_STATE_FP__` accessible when bridge is attached
- [ ] Time-travel produces correct state at each event in test scenarios
- [ ] `noopDevTools` has zero allocations (verified by benchmark)

---

### Phase 3.5 — Command Payload Validation

**Motivation:** `kernel.execute()` accepts any `Command` whose `type` matches a
registered handler. Payload correctness is not enforced at the kernel boundary.
Adding an optional `validate` hook lets handlers declare their schema constraints
once and have the kernel enforce them before `handle` is ever called.

```ts
import { z } from 'zod';

const schema = z.object({ amount: z.number().positive() });

const incrementHandler = createCommandHandler<CounterState, IncrementBy>({
  commandType: 'counter/incrementBy',
  validate: (payload) =>
    schema.safeParse(payload).success
      ? right(payload)
      : left({ code: 'VALIDATION_ERROR', message: 'amount must be positive' }),
  handle: (state, cmd) => right([domainEvent('counter/incremented', { by: cmd.payload.amount })]),
});
```

`validate` runs before `handle`. Returning `Left` short-circuits — `handle` is never called.
`validate` is optional — existing handlers without it are unaffected.

**Exit criteria:**
- [ ] `CommandHandler` type gains optional `validate` field in `kernel/types.ts`
- [ ] `kernel.execute()` calls `validate` before `handle` when present
- [ ] DevTools records validation errors as `DebugEntry.error` with `code: 'VALIDATION_ERROR'`
- [ ] Tests: valid payload → handle called, invalid payload → Left returned, handle not called

---

### Phase 3.6 — Query Memoisation

**Motivation:** Query handlers are pure functions of `(state, query)`. Re-running them
on every call when upstream state has not changed is wasteful for expensive derivations.

```ts
const getExpensiveSummaryHandler = createQueryHandler({
  queryType: 'dashboard/summary',
  memo: true,   // cache last result; recompute only when atom state reference changes
  handle: (state, q) => buildSummary(state),
});
```

Memoisation is per-handler, using the atom's current state reference as cache key.
Query payload equality is shallow-compared as a secondary cache dimension.

**Exit criteria:**
- [ ] `createQueryHandler` accepts optional `memo: boolean`
- [ ] Memoised handlers only re-run `handle` when atom state changes
- [ ] Cache is invalidated correctly on `kernel.hydrate()` and atom reset
- [ ] Tests confirm `handle` call count with and without `memo: true`

---

### Phase 3.7 — SSR Hydration Protocol

**Motivation:** Angular Universal and Next.js serialize server state into a script tag.
`@vi/state-fp` needs a first-class way to receive this payload and seed atom states
before the client-side storage adapters run.

```ts
const kernel = createKernel({
  ssr: {
    source: () => (window as any).__INITIAL_STATE__ as Record<string, unknown>,
    validate: false,   // skip type checking for perf in production
    priority: 'ssr-first',  // 'ssr-first' | 'storage-first'
  },
});
await kernel.hydrate();
// Order with priority 'ssr-first': SSR payload → then storage adapters overlay
```

#### SSR-safe storage guard

All browser storage adapters (`LocalAdapter`, `SessionAdapter`, `IndexedDbAdapter`) must
check for a browser context before accessing `window`/`document`:

```ts
// base-web.ts — shared guard for all WebStorage adapters
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function isBrowserEnvironment(): boolean {
  return isBrowser;
}

// LocalAdapter.get() — safe in Node.js/Deno/Bun
async get(key: string): Promise<Maybe<T>> {
  if (!isBrowserEnvironment()) return nothing;
  // ... normal localStorage logic
}
```

The kernel's storage integration already uses fire-and-forget writes with error capture;
the SSR guard makes the error branch silent (returns `nothing`) for non-browser environments
instead of throwing `ReferenceError: window is not defined`.

**Exit criteria:**
- [ ] `KernelOptions.ssr` config accepted in `createKernel`
- [ ] `kernel.hydrate()` reads SSR source before storage adapters when `priority: 'ssr-first'`
- [ ] SSR payload errors do not block startup (falls back to storage / initialState)
- [ ] `LocalAdapter`, `SessionAdapter`, `IndexedDbAdapter` each guard `typeof window` before any DOM access
- [ ] `MemoryAdapter` is the default in SSR mode (zero browser API calls)
- [ ] Tests with mocked `window.__INITIAL_STATE__` confirm correct hydration order
- [ ] Tests in a simulated Node.js context (`window = undefined`) confirm adapters return `nothing` gracefully

---

## Phase 4 — MFE Sync

**Goal:** Allow multiple Micro-Frontend remotes to share atom state via BroadcastChannel with explicit ownership and conflict resolution.

**Module shipped:** `@vi/state-fp/sync`

**Import path:**
```ts
import { createSyncEngine } from '@vi/state-fp/sync';
```

---

### 4.1 — sync module

**Directory:** `src/sync/`

| File | Exports | Notes |
|---|---|---|
| `types.ts` | `SyncState<S>`, `SyncMessage`, `ShareOptions`, `ConflictStrategy`, `CustomConflictResolver<S>` | Type-only |
| `version.ts` | `VersionVector`, `createVersionVector`, `isStale`, `isGap` | Optimistic concurrency check |
| `conflict.ts` | `lastWriteWins`, `firstWriteWins`, `ownerWins`, `versionWins`, `resolveConflict` | Resolution strategies |
| `broadcast.ts` | `BroadcastBridge`, `createBroadcastBridge` | BroadcastChannel abstraction |
| `sync-engine.ts` | `SyncEngine`, `createSyncEngine` | Main sync entry |
| `index.ts` | Barrel | |

### 4.2 — SyncMessage protocol

```ts
type SyncMessage<S = unknown> =
  | { type: 'vi/sync/state';   atomKey: string; state: S;    version: number; correlationId: string; origin: string }
  | { type: 'vi/sync/request'; atomKey: string;                               correlationId: string; origin: string }
  | { type: 'vi/sync/hello';   atoms: string[];                               correlationId: string; origin: string };
```

### 4.3 — Conflict resolution

```
Incoming message arrives:
  1. isStale(incoming.version, localVersion) → discard
  2. isGap(incoming.version, localVersion)   → request resync
  3. Otherwise → resolveConflict(local, remote, strategy) → apply
```

### 4.4 — SyncEngine internals

```ts
createSyncEngine({ channel, kernel, instanceId? })
  → subscribes to kernel DomainEventBus (for outbound broadcast on shared atoms)
  → subscribes to BroadcastChannel (for inbound state application on borrowed atoms)
  → owns ownership registry: Set<atomKey> sharedByThisInstance
  → owns borrow registry:    Set<atomKey> borrowedByThisInstance
```

**Phase 4 Definition of Done:**

- [ ] `src/sync/` — all 6 files, tests passing
- [ ] `package.json#exports` gains `./sync`
- [ ] `createSyncEngine().share(atom)` broadcasts after each execute on that atom
- [ ] `createSyncEngine().borrow(atom)` applies received state updates
- [ ] Stale + gap detection correctly discards / requests resync
- [ ] All 4 built-in conflict strategies have unit tests with clear outcomes
- [ ] Integration test: 2 simulated MFE contexts, shared atom stays in sync

---

### Phase 4.5 — Cross-MFE Domain Event Bus

**Motivation:** The sync module propagates full atom state. But some MFE patterns need
to react to specific domain events from other remotes without owning the atom that
produced them (e.g. a notification remote listening for `OrderPlaced` events from
the order remote).

**Module:** `@vi/state-fp/bus`

```ts
import { createSharedBus } from '@vi/state-fp/bus';

type CrossMFEEvent = {
  source:  string;        // MFE instance ID
  event:   DomainEvent;
};

interface SharedEventBus {
  publish(event: CrossMFEEvent): void;
  subscribe(
    filter: { type?: string; source?: string },
    cb: (e: CrossMFEEvent) => void,
  ): Unsubscribe;
}

// shell
const bus = createSharedBus({ channel: 'vi-events' });
kernel.onEvent(e => bus.publish({ source: instanceId, event: e }));

// notification remote
const bus = createSharedBus({ channel: 'vi-events' });
bus.subscribe({ type: 'order/placed' }, e => showToast(e.event.payload));
```

The bus is a thin BroadcastChannel wrapper — it does NOT apply state. It only routes
events cross-frame. No kernel coupling in the bus module.

**Exit criteria:**
- [ ] `src/bus/` module created with `createSharedBus`, `SharedEventBus` type
- [ ] `package.json#exports` gains `./bus`
- [ ] Publish and subscribe work across simulated BroadcastChannel contexts in tests
- [ ] Filter by `type` and `source` tested independently
- [ ] `unsubscribe` removes listener; no memory leaks

---

### Phase 4.6 — Universal Transport Guard

**Motivation:** `BroadcastChannel` is unavailable in Node.js (Angular Universal, Next.js server),
Deno, Bun, some web workers, and test environments. A hard `new BroadcastChannel(name)` call
crashes the process in SSR context. The sync engine needs a pluggable transport layer
that degrades gracefully.

```ts
// Transport abstraction — same interface as BroadcastBridge
type SyncTransport<S> = {
  send(msg: SyncMessage<S>): void;
  subscribe(listener: MessageListener<S>): () => void;
  close(): void;
  readonly isOpen: boolean;
};

// Factory selects the right transport automatically
function createAutoTransport<S>(channelName: string): SyncTransport<S> {
  // 1. Full browser — BroadcastChannel (same-origin, multi-tab, multi-frame)
  if (typeof BroadcastChannel !== 'undefined') {
    return createBroadcastBridge(channelName);
  }
  // 2. Node.js / SSR — no-op transport (sync is meaningless server-side)
  if (typeof window === 'undefined') {
    return createNoopTransport();
  }
  // 3. Cross-origin or isolated worker — PostMessage relay via shell
  return createPostMessageTransport(channelName);
}
```

#### Transport registry

```ts
type TransportFactory<S> = (channelName: string) => SyncTransport<S>;

const kernel = createKernel();
const sync = createSyncEngine({
  kernel,
  transport: createAutoTransport,   // default; can inject custom
});
```

#### No-op transport (SSR / Node.js)

When running server-side, the kernel operates in **standalone mode** — no BroadcastChannel,
no shared state across tabs (there are no tabs). The no-op transport makes the sync engine
a safe no-op:

```ts
function createNoopTransport<S>(): SyncTransport<S> {
  return {
    send:      () => void 0,
    subscribe: () => () => void 0,
    close:     () => void 0,
    isOpen:    false,
  };
}
```

#### PostMessage relay (cross-origin MFEs)

For micro-frontends served from different origins (e.g. `app.example.com` and
`remote.partner.com`), `BroadcastChannel` cannot cross the origin boundary.
A `PostMessageTransport` uses `window.postMessage` through a trusted shell relay:

```ts
// Shell registers as relay
const relay = createPostMessageRelay({ trustedOrigins: ['https://remote.partner.com'] });

// Remote uses PostMessage transport
const sync = createSyncEngine({
  kernel: remoteKernel,
  transport: (channel) => createPostMessageTransport(channel, {
    targetOrigin: 'https://app.example.com',
  }),
});
```

Security: the relay checks `event.origin` against `trustedOrigins` before forwarding —
arriving messages from untrusted origins are silently dropped.

**Exit criteria:**
- [ ] `SyncTransport<S>` type extracted as the core sync interface in `sync/types.ts`
- [ ] `createBroadcastBridge` implements `SyncTransport`
- [ ] `createNoopTransport` exported from `@vi/state-fp/sync`
- [ ] `createSyncEngine` accepts optional `transport` factory; defaults to `createAutoTransport`
- [ ] `createAutoTransport` detects Node.js environment and returns no-op
- [ ] `createPostMessageTransport` + `createPostMessageRelay` exported
- [ ] PostMessage relay validates `event.origin` against allow-list (security)
- [ ] Tests: BroadcastChannel context works; Node.js context returns no-op silently; cross-origin relay forwards and drops untrusted

---

### Phase 4.7 — High-Frequency UI State (EphemeralStream)

**Motivation:** Atoms are designed for **business-logic state** — state that has semantic
meaning, needs CQRS, DevTools inspection, and cross-MFE sharing. They are the wrong
tool for high-frequency, ephemeral UI state like:

- Mouse position / drag coordinates (60 fps)
- Scroll offset (fires thousands of times per page load)
- Window resize dimensions
- Canvas / WebGL render parameters
- Touch gesture delta values

Pushing 60 updates/second through the atom `Set<subscriber>` loop and triggering
Angular change detection / React reconciliation on every event would devastate
performance. `EphemeralStream<T>` provides a **zero-kernel-overhead** reactive
primitive for this class of state.

```ts
import { createEphemeralStream } from '@vi/state-fp/core';

// Create a stream — not an atom, not registered with any kernel
const mousePos = createEphemeralStream<{ x: number; y: number }>();

// Emit at native event rate — zero kernel overhead
window.addEventListener('mousemove', (e) => {
  mousePos.emit({ x: e.clientX, y: e.clientY });
});
```

#### EphemeralStream interface

```ts
type EphemeralStream<T> = {
  /** Emit a new value to all subscribers. */
  emit(value: T): void;

  /** Subscribe — returns unsubscribe. Listener is called synchronously on each emit. */
  subscribe(listener: (value: T) => void): Unsubscribe;

  /**
   * Subscribe with `requestAnimationFrame` batching.
   * Listener fires at most once per animation frame with the LAST emitted value.
   * Ideal for rendering (60 fps cap).
   */
  subscribeAnimated(listener: (value: T) => void): Unsubscribe;

  /** Returns the last emitted value, or undefined before first emit. */
  readonly last: T | undefined;
};

function createEphemeralStream<T>(): EphemeralStream<T>;
```

#### Framework integration

**Angular** — use `subscribeAnimated` inside an `effect()` and write to a local `Signal`:

```ts
readonly mousePos = signal({ x: 0, y: 0 });

constructor(private destroyRef: DestroyRef) {
  const off = mousePos.subscribeAnimated(pos => this.mousePos.set(pos));
  destroyRef.onDestroy(off);
}
```

**React** — `useEphemeral` hook (ships alongside framework adapters in Phase 5):

```tsx
function DragHandle() {
  // Re-renders at most once per animation frame — no tearing
  const pos = reactAdapter.useEphemeral(mousePos);
  return <div style={{ left: pos?.x, top: pos?.y }} />;
}
```

**Lit** — `subscribeAnimated` in `hostConnected`:

```ts
hostConnected() {
  this._off = mousePos.subscribeAnimated(pos => {
    this._pos = pos;
    this.host.requestUpdate();
  });
}
hostDisconnected() { this._off?.(); }
```

#### When to use EphemeralStream vs Atom

| | `EphemeralStream<T>` | `Atom<S>` + kernel |
|---|---|---|
| **Update frequency** | Up to native event rate (60–120 fps) | Human-speed interactions |
| **DevTools tracing** | No | Yes — full EventLog + time-travel |
| **Persistence** | No | Yes (via StorageAdapter) |
| **Cross-MFE sharing** | No (single-frame only) | Yes (BroadcastChannel sync) |
| **Command validation** | No | Yes (CommandHandler) |
| **History / undo** | No | Yes (snapshot + replay) |
| **Use case** | Drag, scroll, resize, canvas params | Cart, auth, settings, form data |

**Exit criteria:**
- [ ] `createEphemeralStream<T>()` factory in `src/core/stream.ts`
- [ ] `subscribe(listener)` — synchronous fan-out
- [ ] `subscribeAnimated(listener)` — RAF-batched, fires with last value each frame
- [ ] `last` accessor returns last emitted value or `undefined`
- [ ] `package.json#exports` — `EphemeralStream` exported from `@vi/state-fp/core`
- [ ] `reactAdapter.useEphemeral(stream)` hook added to React adapter (Phase 5 co-deliverable)
- [ ] Angular integration documented
- [ ] Tests: subscriber count, RAF batching confirmed (last-value semantics), unsubscribe cleanup

---

## Phase 5 — Framework Adapters

**Goal:** Provide zero-boilerplate integration for Angular (primary) and Vanilla JS (secondary). React is a stub.

**Module shipped:** `@vi/state-fp/adapter`

**Import path:**
```ts
import { provideStateFp, injectAtom, injectKernel, injectQuery } from '@vi/state-fp/adapter';
```

---

### 5.1 — Angular adapter

**File:** `src/adapter/angular.ts`

> **Factory pattern** — zero compile-time `@angular/core` dependency. Angular APIs are
> injected at call-time, making the adapter fully testable without Angular's `TestBed`.

```ts
import { createAngularAdapter, type AngularAPIs } from '@vi/state-fp/adapter';
import { signal, effect, DestroyRef, inject } from '@angular/core';

const adapter = createAngularAdapter({ signal, effect, DestroyRef, inject });
```

| Export | Type | Description |
|---|---|---|
| `createAngularAdapter(apis)` | `AngularAPIs → AngularKernelAdapter` | Factory — creates adapter from injected Angular APIs |
| `AngularAPIs` | interface | `{ signal, effect, DestroyRef, inject }` shape |
| `AngularKernelAdapter` | interface | Returned adapter with `toSignal`, `toQuerySignal`, `commandDispatcher` |
| `WriteableSignalLike<T>` | type | Minimal writeable signal interface |  
| `DestroyRefLike` | type | Minimal DestroyRef interface |

**Implementation notes:**
- `adapter.toSignal(kernel, atom)` wraps `kernel.subscribe` in the injected `signal()` and auto-unsubscribes
  via `DestroyRef.onDestroy()`
- `adapter.toQuerySignal(kernel, atom, query)` computes `computed(() => kernel.query(atom, query))`
- `adapter.commandDispatcher(kernel, atom)` returns a typed function `(cmd) => kernel.execute(atom, cmd)`
- Zero `@angular/core` import in `angular.ts` — testable with mock `AngularAPIs` objects

### 5.2 — Vanilla JS adapter

**File:** `src/adapter/vanilla.ts`

```ts
interface VanillaAdapter {
  watch<S>(atom: Atom<S>, fn: (s: S) => void): Unsubscribe;
  run<S>(atom: Atom<S>, cmd: Command): Either<CommandError, S>;
  read<S, R>(atom: Atom<S>, q: Query): R;
  snapshot<S>(atom: Atom<S>): S;
}
```

### 5.3 — Lit adapter (Reactive Controller)

**File:** `src/adapter/lit.ts`

> **Reactive Controller pattern** — integrates with Lit's update lifecycle without any
> compile-time `lit` dependency. The controller implements Lit's `ReactiveController` 
> interface shape, accepted directly by any `LitElement`.

```ts
import { createLitController } from '@vi/state-fp/adapter';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-counter')
class CounterElement extends LitElement {
  // AtomController subscribes to atom state and calls host.requestUpdate()
  // on every state change. Cleans up via hostDisconnected() lifecycle hook.
  private counter = createLitController(this, kernel, counterAtom);

  render() {
    return html`
      <p>Count: ${this.counter.state.count}</p>
      <button @click=${() => this.counter.dispatch(IncrementBy(1))}>+</button>
    `;
  }
}

// With a query
@customElement('my-cart')
class CartElement extends LitElement {
  private cartCtrl = createLitController(this, kernel, cartAtom);

  get total() {
    return this.cartCtrl.query(BuildTotal());
  }

  render() {
    return html`<p>Total: ${this.total}</p>`;
  }
}
```

### AtomController shape

```ts
/**
 * Returned by createLitController — implements the Lit ReactiveController interface.
 * The Lit ReactiveController interface is matched structurally (no import required).
 */
interface AtomController<S> {
  /** Current atom state — updated reactively on every state change */
  readonly state: S;
  /** Dispatch a command against the atom */
  dispatch(cmd: Command): Either<CommandError, S>;
  /** Run a query against current state */
  query<R>(q: Query): R;
  // Lit ReactiveController lifecycle hooks
  hostConnected(): void;
  hostDisconnected(): void;
}
```

| Export | Type | Description |
|---|---|---|
| `createLitController(host, kernel, atom)` | `(ReactiveHost, Kernel, Atom<S>) → AtomController<S>` | Creates a reactive Lit controller |
| `AtomController<S>` | interface | Returned controller type |
| `ReactiveHost` | type | Structural match for `LitElement` host methods |

**Implementation notes:**
- `createLitController` does NOT import from `lit` — it takes the host's `addController` method
  structurally, compatible with any `LitElement` or custom ReactiveController host
- `hostConnected()` subscribes to atom; `hostDisconnected()` unsubscribes (no leaks)
- State changes call `host.requestUpdate()` to schedule a Lit re-render
- No framework peer dependency in `lit.ts` — pass Lit APIs via the host reference

---

### 5.4 — React adapter (full implementation)

**File:** `src/adapter/react.ts` (full implementation)

> **Context + Hooks pattern** — standard React integration. Provides `StateFpProvider` for
> DI via React Context, and `useAtom`, `useCommand`, `useQuery` hooks for component-level access.
> Zero compile-time `react` dependency in the library — hooks are injected via factory pattern.

```tsx
import { createReactAdapter } from '@vi/state-fp/adapter';
import { useState, useEffect, useRef, useMemo, useContext, createContext } from 'react';

// On app bootstrap (once per React tree)
export const reactAdapter = createReactAdapter({
  useState, useEffect, useRef, useMemo, useContext, createContext,
});

// Root provider — inject the kernel into the React tree
function App() {
  return (
    <reactAdapter.Provider kernel={kernel}>
      <Routes />
    </reactAdapter.Provider>
  );
}

// Inside any component
function CartButton() {
  // Subscribe to atom state — re-renders on every state change
  const [cartState] = reactAdapter.useAtom(cartAtom);
  // Stable dispatch reference — does not change between renders
  const dispatch    = reactAdapter.useCommand(cartAtom);
  // Memoised derived value — only recomputes when atom state reference changes
  const total       = reactAdapter.useQuery(cartAtom, BuildTotal());

  return (
    <button onClick={() => dispatch(AddItem({ sku: 'ABC', qty: 1 }))}>
      Cart ({cartState.items.length}) — ${total}
    </button>
  );
}
```

### React adapter hooks

| Hook | Signature | Description |
|---|---|---|
| `useAtom(atom)` | `Atom<S> → [S, Atom<S>]` | Subscribe to atom; re-renders on state change |
| `useCommand(atom)` | `Atom<S> → (cmd: Command) => Either<…>` | Stable dispatch fn (stable ref, no dep churn) |
| `useQuery(atom, q)` | `(Atom<S>, Query) → R` | Memoised query result; recomputes only on state change |
| `useAtomAsync(atom, cmd)` | `(Atom<S>, Command) → [S, AsyncDispatch, loading, error]` | For async command handlers with loading state |

```ts
// Async command with loading state
function CheckoutButton() {
  const [state, dispatch, loading, error] = reactAdapter.useAtomAsync(cartAtom);

  const handleCheckout = async () => {
    const result = await dispatch(StartCheckout({ userId }));
    // result is Either<CommandError, CartState>
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Processing…' : 'Checkout'}
    </button>
  );
}
```

**Implementation notes:**
- `useAtom` uses `useState` for current state + `useEffect` to subscribe/unsubscribe — cleanup
  on unmount guaranteed
- `useCommand` uses `useRef` to hold a stable dispatch function that always captures the
  latest kernel reference without causing re-renders
- `useQuery` uses `useMemo` keyed on the atom state reference — query handler is only
  re-invoked when state changes, never on every render
- `NO react` in `package.json#dependencies` — treated as `peerDependency` (externalized)

---

### 5.5 — Vanilla JS adapter

**File:** `src/adapter/vanilla.ts`

```ts
interface VanillaAdapter {
  watch<S>(atom: Atom<S>, fn: (s: S) => void): Unsubscribe;
  run<S>(atom: Atom<S>, cmd: Command): Either<CommandError, S>;
  read<S, R>(atom: Atom<S>, q: Query): R;
  snapshot<S>(atom: Atom<S>): S;
}
```

**Phase 5 Definition of Done:**

- [ ] `src/adapter/` — 5 files (angular, react, lit, vanilla, index)
- [ ] `package.json#exports` gains `./adapter`, `./adapter/angular`, `./adapter/react`, `./adapter/lit`
- [ ] Angular adapter tested with mock `AngularAPIs` (no `TestBed` required)
- [ ] React adapter tested with mock `ReactAPIs` (no React renderer required)
- [ ] Lit controller tested with mock `ReactiveHost` (no `LitElement` required)
- [ ] All adapters confirm: subscription cleaned up on destroy/disconnect
- [ ] `AtomController` structurally matches Lit `ReactiveController` (type test)

---

### 5.6 — Storage Security Adapters (Phase 5 co-deliverable)

Shipping alongside the framework adapters as part of `@vi/state-fp/storage`.

**Motivation:** Production apps using Angular/React/Lit MFEs need assurance that
sensitive atom state (auth tokens, PII) stored with `LocalAdapter` or `SessionAdapter`
is not readable in plain text in Chrome DevTools → Application → Storage.

**New exports from `@vi/state-fp/storage`:**

```ts
import {
  ObfuscatedAdapter,   // wraps any adapter; SHA-256 hashes storage keys
  EncryptedAdapter,    // wraps any adapter; AES-GCM encrypts values + obfuscates keys
} from '@vi/state-fp/storage';
```

See [Storage Strategy — Section 12](../storage-strategy.md) for the security design, 
threat model, and recommended policy per data category.

**Exit criteria:**
- [ ] `ObfuscatedAdapter` wraps any adapter; uses SHA-256 + salt for key obfuscation
- [ ] `EncryptedAdapter` wraps any adapter; uses SubtleCrypto AES-GCM for value encryption
- [ ] `EncryptedAdapter.secretProvider` is async — accepts a `() => Promise<string>`
- [ ] Decryption failure returns `left({ code: 'DESERIALISE_ERROR', ... })` — no exceptions
- [ ] Integration test: `EncryptedAdapter(LocalAdapter)` → value in storage is ciphertext →
  re-read with same key decrypts correctly

---

## Phase 7 — Saga / Process Manager

**Goal:** Support long-running multi-step business processes that span multiple atoms,
commands, and async steps — with compensation (rollback) on partial failure.

**Module addition:** `@vi/state-fp/kernel` (saga types + `kernel.useSaga`)

---

### 7.1 — `createSaga`

```ts
const checkoutSaga = createSaga<CheckoutContext>({
  key:     'vi/checkout-saga',
  trigger: 'order/checkoutStarted',

  steps: [
    {
      atom:    inventoryAtom,
      command: (ctx) => ReserveItems(ctx.event.payload.items),
      compensate: (ctx) => ReleaseItems(ctx.event.payload.items),
    },
    {
      atom:    paymentAtom,
      command: (ctx) => Charge(ctx.event.payload.total),
      compensate: (ctx) => Refund(ctx.event.payload.total),
    },
    {
      atom:    orderAtom,
      command: (ctx) => ConfirmOrder(ctx.correlationId),
    },
  ],

  onComplete: (ctx) => { /* final notification */ },
  onError:    (failedStep, err, ctx) => ctx.compensate(failedStep),
});

kernel.useSaga(checkoutSaga);
```

### 7.2 — Saga semantics

- When the `trigger` event type is emitted on the `DomainEventBus`, the saga starts
- Each step's `command` is executed via `kernel.executeAsync`
- If any step returns `Left`, `onError` is called with the failing step index
- `ctx.compensate(n)` runs all preceding steps' `compensate` commands in reverse order
- Compensation commands are also executed via `kernel.executeAsync`; failures are logged
- Saga execution is non-blocking — does not hold up the triggering `execute()` call

### 7.3 — Saga DevTools integration

When devtools are attached:
- Each saga run appears as a correlated group in the EventLog
- Compensation steps are marked `{ sagas: true, compensating: true }`
- `window.__VI_STATE_FP__.getSagas()` lists all active / completed saga runs

**Phase 7 Definition of Done:**

- [ ] `saga.ts` added to `src/kernel/`
- [ ] `createSaga`, `SagaDefinition`, `SagaContext` types exported from `@vi/state-fp/kernel`
- [ ] `kernel.useSaga(saga)` registers trigger listener on DomainEventBus
- [ ] Compensation runs in reverse order on step failure
- [ ] DevTools records saga runs as correlated groups
- [ ] Integration test: 3-step saga with failure at step 2 → steps 1 and 2 compensated

---

## Phase 8 — Offline-First / CRDT Conflict Merging

**Goal:** Allow atoms to be edited while the browser is offline and reconcile concurrent
edits from multiple tabs/users correctly when connectivity is restored — beyond the
current `last-write-wins` and `owner-wins` strategies.

**Modules extended:** `@vi/state-fp/sync` (new CRDT strategies), `@vi/state-fp/kernel`
(offline queue)

---

### 8.1 — Why `last-write-wins` is insufficient

The current conflict resolution (Phase 4) works well when one peer owns an atom and
others borrow it. It breaks when **two peers both write the same atom while disconnected**:

```
Tab A (offline):  cart = [sku-1, sku-2]   (added sku-2)
Tab B (offline):  cart = [sku-1, sku-3]   (added sku-3)

last-write-wins on reconnect: only ONE of sku-2/sku-3 survives.
CRDT merge:  cart = [sku-1, sku-2, sku-3]  ← correct
```

CRDT (Conflict-free Replicated Data Type) merge functions guarantee that concurrent
transformations converge to the same result regardless of order of application.

---

### 8.2 — Offline Event Queue

```ts
// Kernel extended with offline queue
const kernel = createKernel({
  offlineQueue: {
    enabled: true,
    maxSize: 100,         // max commands buffered while offline
    storage: new LocalAdapter(),   // persists queue across page reloads
  },
});

// Commands while offline are queued, not silently dropped
window.addEventListener('offline', () => kernel.setOnline(false));
window.addEventListener('online',  () => kernel.setOnline(true));
// On kernel.setOnline(true) → drains queue via executeAsync in order
```

```ts
type OfflineQueueConfig = {
  enabled:  boolean;
  maxSize:  number;
  storage?: StorageAdapterLike;   // persistence across page reloads
  onOverflow?: 'drop-oldest' | 'drop-newest' | 'error';
};
```

The queue is a `DomainEvent[]` log — not a Command queue. Commands are executed
immediately against the in-memory atom (optimistic), and their resulting events
are queued for replay on the server / sync partner when online.

---

### 8.3 — CRDT Merge Strategies

Built on top of the `CustomConflictResolver<S>` extension point from Phase 4:

```ts
import { crdtMerge } from '@vi/state-fp/sync';

// G-Set (Grow-only Set) — union of both sides, no deletions
const cartAtom = defineAtom<CartState>({
  key: 'vi/cart',
  initialState: { items: [] },
});

const sync = createSyncEngine({ kernel });
sync.share(cartAtom, {
  conflict: crdtMerge({
    type:   'g-set',
    getSet: (state) => state.items,
    setSet: (state, items) => ({ ...state, items }),
    id:     (item) => item.sku,      // identity function for dedup
  }),
});
```

#### Built-in CRDT merge types

| CRDT | Type string | Use case |
|---|---|---|
| G-Set (Grow-only Set) | `'g-set'` | Append-only collections (cart items, liked posts) |
| 2P-Set (Two-Phase Set) | `'2p-set'` | Collections with deletions (items that can be removed) |
| LWW-Register (Last-Write-Wins Element) | `'lww-register'` | Single-value fields with timestamp comparison |
| LWW-Map (Last-Write-Wins Map) | `'lww-map'` | Per-field LWW — each field resolved independently |
| PN-Counter (Positive-Negative Counter) | `'pn-counter'` | Counters (likes, view counts) — survives concurrent increments |
| OR-Set (Observed-Remove Set) | `'or-set'` | Sets where add always beats concurrent remove |

```ts
// LWW-Map example — form fields independently resolved
sync.share(profileAtom, {
  conflict: crdtMerge({
    type:   'lww-map',
    fields: ['displayName', 'avatar', 'locale'],   // only these fields merged; rest: owner-wins
  }),
});
```

---

### 8.4 — Merge Function Composition

For complex state shapes, CRDT strategies can be composed using the `Lens` primitive
from `@vi/state-fp/core`:

```ts
import { composeCRDT, lensedCRDT } from '@vi/state-fp/sync';

// Cart: items use G-Set, discount uses LWW-Register, qty per item uses PN-Counter
const cartCRDT = composeCRDT<CartState>([
  lensedCRDT(prop<CartState>()('items'),    crdtMerge({ type: 'g-set',      id: i => i.sku })),
  lensedCRDT(prop<CartState>()('discount'), crdtMerge({ type: 'lww-register' })),
]);

sync.share(cartAtom, { conflict: cartCRDT });
```

---

### 8.5 — Sync-on-Reconnect Protocol

When the tab comes back online:

```
1. kernel.setOnline(true) fires
2. SyncEngine sends vi/sync/hello with current version vector
3. Remote peers respond with their version vectors
4. For any vector where remote > local:
   a. Request full state (vi/sync/request)
   b. Apply CRDT merge between local optimistic state and remote state
5. Drain offline event queue (replay queued DomainEvents in order)
6. Notify all atom subscribers with merged final state
```

---

### 8.6 — DevTools integration

- Offline queue appears in EventLog with `{ offline: true }` flag
- CRDT merges appear as `{ type: 'vi/crdt/merge', mergeStrategy: 'g-set', conflicts: [...] }`
- `window.__VI_STATE_FP__.getOfflineQueue()` shows pending events
- Time-travel respects offline queue — replaying past a merge shows the pre-merge state

---

**Phase 8 Definition of Done:**

- [ ] `offlineQueue` config accepted in `createKernel`
- [ ] `kernel.setOnline(bool)` method added
- [ ] Offline event queue persisted across page reloads via configured storage adapter
- [ ] `crdtMerge()` factory in `src/sync/crdt.ts` with all 6 CRDT types
- [ ] `composeCRDT()` and `lensedCRDT()` composition utilities
- [ ] Sync-on-reconnect protocol implemented in `SyncEngine`
- [ ] CRDT merge entries appear in DevTools EventLog
- [ ] `window.__VI_STATE_FP__.getOfflineQueue()` exposed via bridge
- [ ] Unit tests: each of 6 CRDT types with conflict scenario
- [ ] Integration test: Tab A + Tab B diverge offline → reconnect → merged state verified
- [ ] Offline queue overflow strategies tested (`drop-oldest`, `drop-newest`)

---

## Phase 6 — DX & Release Hardening

**Goal:** Polish the library for external consumption — type tests, comprehensive docs, release pipeline.

---

### 6.1 — Type-level tests

Use `tsd` to assert compile-time type correctness:

```
test/types/core.test-d.ts
test/types/kernel.test-d.ts
test/types/adapter.test-d.ts
```

Example: `expectType<Maybe<string>>(just('hello'))` — ensures API contracts hold across TS versions.

### 6.2 — Bundle size audit

```
@vi/state-fp/core    → target < 2 KB gzip
@vi/state-fp/kernel  → target < 5 KB gzip
@vi/state-fp/storage → target < 3 KB gzip
@vi/state-fp/devtools→ target < 6 KB gzip (not imported in production)
@vi/state-fp/sync    → target < 3 KB gzip
@vi/state-fp/adapter → target < 4 KB gzip
```

Run with `bundlesize` or `size-limit`.

### 6.3 — Per-module documentation

```
docs/modules/
  core.md       moved from docs/functional-primitives.md + updated
  kernel.md     new — CQRS kernel deep-dive
  storage.md    moved from docs/storage-strategy.md + updated
  sync.md       new
  devtools.md   moved from docs/debug-model.md + updated
  adapter.md    new — Angular/Vanilla integration guide
```

### 6.4 — CHANGELOG and semver policy

- CHANGELOG.md with `Keep a Changelog` format
- Semver: each phase = minor bump (0.x.0)
- Breaking changes only on major version

### 6.5 — Automated release pipeline

- `nx release` with version inference from conventional commits
- CI gate: all tests pass + coverage ≥ 90% + no lint errors

**Phase 6 Definition of Done:**

- [ ] All type-level tests pass
- [ ] Bundle size within targets
- [ ] `docs/modules/` — 6 files complete
- [ ] `CHANGELOG.md` present
- [ ] `nx release` pipeline configured
- [ ] README shows all 6 import paths with minimal working examples

---

## Milestone Summary Table

| Phase | Semver | Modules | Key Capabilities | Status |
|---|---|---|---|---|
| 0 | 0.0.1 | scaffold | Build + test pipeline | Done ✅ |
| 1 | 0.1.0 | core + kernel | CQRS engine, in-memory only, Task/Reader/StateM monads | Active 🔄 |
| 2 | 0.2.0 | storage | Persistent adapters, TTL, hydration, SSR guards, ObfuscatedAdapter, EncryptedAdapter | Not started |
| 3 | 0.3.0 | devtools | EventLog, time-travel, browser bridge, DevExtension protocol, SSR hydration | Not started |
| 4 | 0.4.0 | sync | MFE broadcast, conflict resolution, event bus, Universal transport guard, EphemeralStream | Not started |
| 5 | 0.5.0 | adapter | Angular, React (hooks + useEphemeral), Lit (ReactiveController), Vanilla, Storage security | Not started |
| 6 | 1.0.0 | (all) | DX hardening, docs, bundle audit, release pipeline | Not started |
| 7 | 1.1.0 | kernel+ | Saga / process manager, compensation | Not started |
| 8 | 1.2.0 | sync+ / core+ | CRDT conflict merging (6 types), offline queue, sync-on-reconnect, merge composition | Not started |

---

## Dependency Between Phases

```
Phase 0 ─────► Phase 1 ─────► Phase 2 (storage adapters + SSR guards + security)
                   │              │
                   ├──────────► Phase 3 (devtools + SSR hydration)
                   │
                   ├──────────► Phase 4 (MFE sync + event bus + universal transport + EphemeralStream)
                   │                │
                   │                └──────────► Phase 8 (CRDT + offline queue)  ← requires Phase 4
                   │
                   └──────────► Phase 5 (Angular + React + Lit adapters + useEphemeral)
                                   │
                           Phase 6 ◄┤ (all phases complete)
                                   │
                           Phase 7 ◄┘ (requires Phase 1.4 executeAsync)
```

Phases 2, 3, 4, and 5 are **parallel after Phase 1** — they each extend the kernel without depending on each other.  
Phase 7 (Saga) requires Phase 1.4 (`executeAsync` contract) to be complete first.  
Phase 8 (CRDT) requires Phase 4 (version vectors + SyncEngine) and Phase 2 (StorageAdapter for offline queue persistence).

---

## Non-Goals Per Phase

| Phase | NOT in scope |
|---|---|
| 1 | Storage, devtools, sync, async execute |
| 2 | Conflict resolution, cross-MFE sync |
| 3 | React/Angular integration, replay on remote machines |
| 4 | Server-Sent Events, WebSocket sync, CRDT (Phase 8) |
| 4.7 | Atoms for high-frequency state — use `EphemeralStream` for scroll/drag/resize |
| 5 | Vue adapter (out of scope for v1) |
| 7 | Distributed saga (multi-server coordination) |
| 8 | Server-side CRDT (multi-user backend sync), CRDTs for all atom types by default |
| Any | ORM capabilities, backend state management, GraphQL |

---

## Tech Debt & Known Issues

### Phase 1 — Applier Composition Order (Phase 2 candidate)

**Issue:** When `kernel.register()` is called multiple times for the same atom with different handlers, the appliers are composed in registration order:
```typescript
const composed: EventApplier<S> = (state, event) =>
  applier(existing(state, event), event);
```

This creates a chain where the newest applier operates on the post-modified state from all previous appliers, even for event types it doesn't handle. While the convention is that unknown events return state unchanged, this composition order has two implications:

1. **Order dependency:** Behavior depends on which applier was registered first, not explicit priority
2. **Last-wins semantic:** If two appliers handle the same event type, the most recently registered one "wins" because it sees the modified state first

**Impact:**
- Works correctly for the common case: appliers handle **disjoint event types**
- Surprising behavior if appliers overlap or have stateful side-effects
- Not documented, making accidental misuse possible

**Mitigation (Phase 1):** Document that appliers should handle disjoint event types. Tests confirm all applied events are from registered handlers.

**Resolution (Phase 2+):** One of:
1. **Validation:** Throw error at registration time if overlapping event types detected
2. **Independent appliers:** Collect all appliers and apply each independently (not composed)
3. **Event routing:** Route each event to exactly one applier based on type

**Ticket:** Track as Phase 2 enhancement — `feature/explicit-event-routing`

---

*This document is the authoritative development roadmap for @vi/state-fp.*  
*Update phase checkboxes as items are completed.*
