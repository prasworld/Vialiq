# @vi/state-fp — Onboarding Guide

> **Audience:** A developer joining the team who is about to write or review code that uses
> or extends `@vi/state-fp`. Read this doc first, then use the links to go deeper on any
> topic.
>
> **Time to read:** ~15 minutes.  
> **After reading you will be able to:**
> - Run the tests and build pipeline locally
> - Orient yourself in the source tree and know which file owns which responsibility
> - Add a new atom + command + query from scratch
> - Know where to look when something goes wrong

---

## Table of Contents

1. [Quick Start — Get It Running](#1-quick-start--get-it-running)
2. [Repository Layout](#2-repository-layout)
3. [Source File Map](#3-source-file-map)
4. [Mental Model in 5 Minutes](#4-mental-model-in-5-minutes)
5. [Adding a Feature — Step by Step](#5-adding-a-feature--step-by-step)
6. [Where Each Concern Belongs](#6-where-each-concern-belongs)
7. [Documentation Index](#7-documentation-index)
8. [Common Day-1 Mistakes](#8-common-day-1-mistakes)

---

## 1. Quick Start — Get It Running

```bash
# From the Nx workspace root
pnpm install

# Run all state-fp tests (Vitest)
npx nx test state-fp

# Run tests in watch mode
npx nx test state-fp --watch

# Typecheck only (no test runner)
npx tsc --project libs/state-fp/tsconfig.json --noEmit

# Lint
npx nx lint state-fp

# Build the library
npx nx build state-fp

# Run tests for a specific file
npx nx test state-fp --testFile=src/core/either.spec.ts
```

CI runs `test`, `typecheck`, and `lint` on every commit to the `state-fp-refactor` and
`master` branches.

**Coverage:** After `npx nx test state-fp`, open `coverage/state-fp/index.html` in a browser.

---

## 2. Repository Layout

```
libs/state-fp/
├── src/                       ← All implementation code
│   ├── core/                  ← FP primitives (no state management knowledge)
│   ├── kernel/                ← CQRS engine: atoms, commands, events, queries
│   ├── storage/               ← StorageAdapter interface + memory adapter
│   ├── sync/                  ← Cross-tab BroadcastChannel sync
│   ├── devtools/              ← Event log, snapshots, time-travel, bridge
│   ├── adapter/               ← Angular / React / Lit / Vanilla wrappers
│   ├── bus/                   ← Cross-MFE ephemeral event bus
│   └── index.ts               ← Root barrel (re-exports all public APIs)
│
├── docs/                      ← All documentation (markdown)
│   ├── onboarding.md          ← THIS FILE
│   ├── functionality-analysis.md  ← Evidence of 4 core library capabilities
│   ├── developer-guide.md     ← Deep dive: concepts, file API reference, decisions
│   ├── architecture.md        ← Architecture diagrams and module dependency graph
│   ├── decision-log.md        ← ADR-format architectural decisions
│   ├── mfe-framework-guide.md ← Angular / React / Lit integration + tricky patterns
│   ├── debug-model.md         ← Debug layer concepts and debug entry types
│   ├── debugging-guide.md     ← Practical debugging cookbook (step-by-step recipes)
│   ├── modules/               ← Quick API reference per module
│   │   ├── core.md
│   │   ├── kernel.md
│   │   ├── storage.md
│   │   ├── sync.md
│   │   ├── devtools.md
│   │   └── adapter.md
│   ├── examples/
│   │   └── shopping-cart.md   ← End-to-end shopping cart walkthrough
│   ├── phases.md              ← Roadmap and implementation phases
│   └── feature-comparison.md  ← Library vs. competitors comparison
│
├── package.json               ← "exports" map: sub-path entry points
├── tsconfig.json              ← TypeScript config (strict mode)
├── vitest.config.mts          ← Vitest configuration
└── README.md                  ← NPM-facing README
```

---

## 3. Source File Map

Each file has one clear responsibility. When you're not sure where something lives:

### `src/core/` — Think "FP utilities"

| File | What it does | Imports from |
|------|-------------|--------------|
| `maybe.ts` | `Maybe<T>` monad — optional values without null | nothing |
| `either.ts` | `Either<E,A>` monad — typed errors without throw | nothing |
| `io.ts` | `IO<A>` monad + `IORef<A>` for controlled mutation | nothing |
| `lens.ts` | Composable getters/setters for nested state | nothing |
| `stream.ts` | `EphemeralStream<T>` — high-frequency reactive values | nothing |
| `utils.ts` | `pipe`, `compose`, `uuid`, `deepClone`, `shallowDiff` | nothing |
| `types.ts` | Type aliases shared across core | nothing |
| `index.ts` | Public re-exports for `@vi/state-fp/core` | all above |

### `src/kernel/` — Think "CQRS engine"

| File | What it does | Imports from |
|------|-------------|--------------|
| `types.ts` | All kernel type definitions (Atom, Command, DomainEvent, Kernel, etc.) | `../core/types` |
| `atom.ts` | `defineAtom()` + internal `Atom` implementation | `types.ts` |
| `command.ts` | `command()`, `createCommandHandler()`, `createEventApplier()` | `types.ts`, `../core` |
| `event.ts` | `domainEvent()`, event factory helpers | `types.ts` |
| `query.ts` | `createQueryHandler()` — pure projections over state | `types.ts` |
| `kernel.ts` | `createKernel()` — wires everything together; `execute`, `query`, `subscribe` | all above |
| `storage-guard.ts` | Validates storage policies; prevents insecure configurations | `types.ts`, `storage` |
| `index.ts` | Public re-exports for `@vi/state-fp/kernel` | all above |

### `src/storage/` — Think "pluggable persistence"

| File | What it does |
|------|-------------|
| `types.ts` | `StorageAdapter` interface, `StorageError`, `StorageOptions` |
| `memory.ts` | `MemoryAdapter` — default in-process store; TTL-aware; thread-safe |
| `index.ts` | Public re-exports for `@vi/state-fp/storage` |

> **Note:** Only `MemoryAdapter` is supplied. All other adapters (Redis, IndexedDB, etc.)
> must be implemented by consumers using the `StorageAdapter` interface.

### `src/sync/` — Think "cross-tab state replication"

| File | What it does |
|------|-------------|
| `types.ts` | `SyncEngine`, `SyncTransport`, `StateMessage`, `EventFilter` types |
| `broadcast.ts` | `createBroadcastBridge()` — BroadcastChannel transport |
| `transport.ts` | `createAutoTransport()` — browser=BC, SSR=noop |
| `version.ts` | Lamport vector clock: `increment`, `dominates`, `merge` |
| `conflict.ts` | `resolveConflict()` — owner-wins / last-write-wins strategies |
| `sync-engine.ts` | `createSyncEngine()` + `sync.share()` — main entry point |
| `index.ts` | Public re-exports for `@vi/state-fp/sync` |

### `src/devtools/` — Think "debug infrastructure"

| File | What it does |
|------|-------------|
| `types.ts` | `DebugEntry`, `DevTools`, `DevToolsBridge`, `TimeTravelState` types |
| `event-log.ts` | Circular buffer O(1) event ring with secondary indices (by atomKey, correlationId) |
| `snapshot.ts` | `SnapshotManager` — point-in-time state captures for replay |
| `time-travel.ts` | `TimeTravelController` — `stepBackward()`, `stepForward()`, `jumpTo()` |
| `bridge.ts` | `attachBridge()` — installs `window.__VI_STATE_FP__` console interface |
| `devtools.ts` | `createDevTools()` — composes event-log + snapshot + time-travel + bridge |
| `index.ts` | Public re-exports for `@vi/state-fp/devtools` |

### `src/adapter/` — Think "framework glue"

| File | What it does |
|------|-------------|
| `angular.ts` | `createAngularAdapter()` — `toSignal`, `toQuerySignal`, `commandDispatcher` |
| `react.ts` | `createReactAdapter()` — `useAtom`, `useCommand`, `useQuery`, `useEphemeral` |
| `lit.ts` | `createLitController()` + `createLitStreamController()` — Reactive Controllers |
| `vanilla.ts` | `createVanillaAdapter()` — manual subscribe/unsubscribe helpers |
| `index.ts` | Public re-exports for `@vi/state-fp/adapter` |

### `src/bus/` — Think "cross-MFE ephemeral events"

| File | What it does |
|------|-------------|
| `types.ts` | `CrossMFEEvent`, `EventFilter`, `SharedEventBus` interface |
| `shared-bus.ts` | `createSharedBus()` — BroadcastChannel-backed pub-sub bus |
| `index.ts` | Public re-exports for `@vi/state-fp/bus` |

---

## 4. Mental Model in 5 Minutes

There are four things you need to understand. Everything else follows from these.

### 1. An Atom is the unit of state

An atom holds a single slice of application state with a string key:
```ts
const cartAtom = defineAtom({ key: 'vi/cart', initialState: { items: [] } });
```

Atoms are not singletons — you can create multiple instances of the same atom key (in
different MFEs) and they sync via BroadcastChannel.

### 2. Commands describe intent; Events record facts

A **Command** is what you *want* to happen. A command handler validates it and produces
**Domain Events** — which are immutable records of what *did* happen.

```
AddItem({ sku: 'X1', qty: 2 })    ← Command: "Please add this item"
       ↓
CommandHandler                     ← validates: stock > 0 ? proceed : err
       ↓
domainEvent('cart/itemAdded', X1) ← Event: "This item was added"
       ↓
EventApplier                       ← pure function: (state, event) → newState
       ↓
atom.state = { items: [X1] }
```

### 3. Queries read state without side effects

A **Query** is a pure function over atom state. It never changes state.

```ts
// Define once
const BuildTotal = createQueryHandler({ queryType: 'cart/total',
  handle: (state) => state.items.reduce((s, i) => s + i.price * i.qty, 0) });

// Execute at any time
const total = kernel.query(cartAtom, BuildTotal());   // number
```

### 4. The kernel wires it all together

```ts
const kernel = createKernel();
kernel.register(cartAtom, addItemHandler, cartApplier);   // register atom + handlers + applier
kernel.registerQuery(cartAtom, buildTotalHandler);         // register queries separately

kernel.subscribe(cartAtom, state => console.log(state));   // push notification
kernel.execute(cartAtom, AddItem({ sku: 'X1', qty: 1 }));  // change state
kernel.query(cartAtom, BuildTotal());                       // read state
```

**That's it.** The sync engine, adapters, and devtools are all optional layers on top.

### 4.1 Import Reference by Module

When writing code, use these imports:

```ts
// 📍 @vi/state-fp/core — FP primitives
import { just, nothing, foldMaybe } from '@vi/state-fp/core';  // Maybe
import { left, right, foldEither, match } from '@vi/state-fp/core';  // Either (Result)
import { IO } from '@vi/state-fp/core';  // Lazy computation

// 📍 @vi/state-fp/kernel — CQRS engine
import { createKernel, defineAtom } from '@vi/state-fp/kernel';
import { command, createCommandHandler } from '@vi/state-fp/kernel';
import { domainEvent, createEventApplier } from '@vi/state-fp/kernel';
import { createQueryHandler } from '@vi/state-fp/kernel';

// 📍 @vi/state-fp/sync — Cross-tab / cross-MFE sync
import { createSyncEngine } from '@vi/state-fp/sync';

// 📍 @vi/state-fp/devtools — Debug layer
import { createDevTools, noopDevTools } from '@vi/state-fp/devtools';
import type { KernelPlugin } from '@vi/state-fp/kernel';

// 📍 Framework adapters
import { createAngularAdapter } from '@vi/state-fp/adapter';  // Angular
import { createReactAdapter } from '@vi/state-fp/adapter';    // React
import { createLitController } from '@vi/state-fp/adapter';   // Lit
```

---

## 5. Adding a Feature — Step by Step

This is the checklist for adding a new piece of state to the library.

### Step 1 — Define the atom

```ts
// src/kernel/atoms/cart.ts
import { defineAtom } from '../atom';

export type CartItem  = { sku: string; qty: number; price: number };
export type CartState = { items: CartItem[]; lastModified: number };

export const cartAtom = defineAtom<CartState>({
  key:          'vi/cart',               // must be globally unique
  initialState: { items: [], lastModified: 0 },
  // optional: storage: { adapter: new MemoryAdapter(), ttl: 3600_000 }
});
```

### Step 2 — Define commands and their handlers

```ts
// src/kernel/atoms/cart.ts (same file — co-location is convention)
import { command, createCommandHandler } from '../command.js';
import { domainEvent, createEventApplier } from '../event.js';
import { ok, err } from '../../core/either.js';
import { CartState } from './types.js';

// Command factories
export const AddItem    = (p: CartItem) => command('cart/addItem', p);
export const RemoveItem = (sku: string) => command('cart/removeItem', { sku });

// Handlers
export const addItemHandler = createCommandHandler<CartState, ReturnType<typeof AddItem>>({
  commandType: 'cart/addItem',
  handle: (state, cmd) => {
    if (cmd.payload.qty < 1)
      return err({ code: 'INVALID_QTY', message: 'Quantity must be at least 1' });
    return ok([domainEvent('cart/itemAdded', { item: cmd.payload })]);
  },
});

export const removeItemHandler = createCommandHandler<CartState, ReturnType<typeof RemoveItem>>({
  commandType: 'cart/removeItem',
  handle: (_state, cmd) =>
    ok([domainEvent('cart/itemRemoved', { sku: cmd.payload.sku })]),
});
```

### Step 3 — Define the event applier

```ts
import { createEventApplier } from '../event.js';

export const cartApplier = createEventApplier<CartState>({
  'cart/itemAdded': (state, e) => ({
    items: [...state.items, e.payload.item],
    lastModified: e.meta.timestamp,
  }),
  'cart/itemRemoved': (state, e) => ({
    items: state.items.filter(i => i.sku !== e.payload.sku),
    lastModified: e.meta.timestamp,
  }),
});
```

### Step 4 — Define queries (optional but recommended)

```ts
import { createQueryHandler } from '../query';

export const BuildTotal    = () => ({ _kind: 'Query' as const, type: 'cart/total' });
export const GetItemCount  = () => ({ _kind: 'Query' as const, type: 'cart/count' });

export const buildTotalHandler = createQueryHandler<CartState, ReturnType<typeof BuildTotal>, number>({
  queryType: 'cart/total',
  memo: true,
  handle: (state) => state.items.reduce((s, i) => s + i.price * i.qty, 0),
});
```

### Step 5 — Write tests

```ts
// src/kernel/atoms/cart.spec.ts
import { describe, it, expect } from 'vitest';
import { ok, isOk, isErr }      from '../../core/either';
import { cartAtom, cartApplier, addItemHandler, buildTotalHandler, AddItem } from './cart';

describe('addItemHandler', () => {
  it('accepts a valid item and emits itemAdded event', () => {
    const result = addItemHandler.handle(
      { items: [], lastModified: 0 },
      AddItem({ sku: 'X1', qty: 2, price: 10 }),
    );
    expect(isOk(result)).toBe(true);
    // ok: result.right[0].type === 'cart/itemAdded'
  });

  it('rejects qty < 1', () => {
    const result = addItemHandler.handle(
      { items: [], lastModified: 0 },
      AddItem({ sku: 'X1', qty: 0, price: 10 }),
    );
    expect(isErr(result)).toBe(true);
  });
});

describe('cartApplier', () => {
  it('adds an item to the cart', () => {
    const event = { type: 'cart/itemAdded', payload: { item: { sku: 'X1', qty: 2, price: 10 } },
                    meta: { id: '1', version: 1, timestamp: 0 } };
    const state = cartApplier['cart/itemAdded']({ items: [], lastModified: 0 }, event as any);
    expect(state.items).toHaveLength(1);
  });
});
```

**Rules for tests:**
- Command handlers are pure functions — test `handle()` directly, no kernel setup needed.
- Event appliers are pure functions — test the event map directly.
- Integration tests (kernel + atom wire-up) live in `*.integration.spec.ts` files.

### Step 6 — Register with the kernel

```ts
// In app bootstrapping code (e.g., app.config.ts, main.ts)
kernel.register(cartAtom, addItemHandler, cartApplier);
kernel.register(cartAtom, removeItemHandler, cartApplier);
kernel.registerQuery(cartAtom, buildTotalHandler);
```

---

## 6. Where Each Concern Belongs

| If you want to… | Go to |
|----------------|-------|
| Define new state shape and atom | `src/kernel/` (or the app feature directory) |
| Add a command that changes state | `createCommandHandler` in same file as atom |
| Add a query (pure read) | `createQueryHandler` in same file as atom |
| Persist atom state across reloads | `storage` option on `defineAtom`, use `MemoryAdapter` |
| Sync atom state across browser tabs | `@vi/state-fp/sync` — `createSyncEngine().share()` |
| Sync atom state across MFEs | `@vi/state-fp/sync` — same as above with a shared channel name |
| Broadcast an event to other MFEs | `@vi/state-fp/bus` — `createSharedBus().publish()` |
| Subscribe to events from other MFEs | `@vi/state-fp/bus` — `createSharedBus().subscribe()` |
| Add an Angular Signal for atom state | `createAngularAdapter().toSignal()` |
| Add a React hook for atom state | `createReactAdapter().useAtom()` |
| Add debug recording | `kernel.use(devtools.plugin)` |
| Add analytics / logging for state changes | `KernelPlugin.onExecute` hook |
| Implement a custom storage backend | Implement `StorageAdapter` interface |
| Support a new sync transport (e.g., WebSocket) | Implement `SyncTransport` interface |
| Add a new framework adapter | `createXxxAdapter(apis)` factory pattern |
| Add an architectural decision | `docs/decision-log.md` — copy ADR template |

---

## 7. Documentation Index

| Doc | Purpose | Best for |
|-----|---------|----------|
| [README.md](../README.md) | NPM-facing overview + quick start | First look |
| **[onboarding.md](./onboarding.md)** | This file — day-1 orientation | You are here |
| [developer-guide.md](./developer-guide.md) | Deep concepts + full file API reference | Learning FP + CQRS concepts |
| [architecture.md](./architecture.md) | Architecture diagrams, dependency graph, write/read paths | Understanding the design |
| [decision-log.md](./decision-log.md) | ADR-format architecture decisions (why things are the way they are) | Evaluating design choices |
| [functionality-analysis.md](./functionality-analysis.md) | Evidence that library meets 4 core requirements | Library capability review |
| [mfe-framework-guide.md](./mfe-framework-guide.md) | Angular/React/Lit integration + tricky patterns | Building MFE components |
| [debug-model.md](./debug-model.md) | Debug layer concepts, DevTools, DebugEntry types | Understanding observability |
| [debugging-guide.md](./debugging-guide.md) | Step-by-step debugging recipes | When something is broken |
| [modules/kernel.md](./modules/kernel.md) | Quick kernel API reference | Looking up an API |
| [modules/core.md](./modules/core.md) | Quick core API reference (Maybe, Either, etc.) | Looking up an FP util |
| [modules/storage.md](./modules/storage.md) | Storage adapter API reference | Implementing storage |
| [modules/sync.md](./modules/sync.md) | Sync engine API reference | Cross-tab sync setup |
| [modules/devtools.md](./modules/devtools.md) | DevTools API reference | Setting up devtools |
| [modules/adapter.md](./modules/adapter.md) | Adapter factory API reference | Framework integration |
| [examples/shopping-cart.md](./examples/shopping-cart.md) | Complete shopping cart walkthrough | End-to-end reference |
| [phases.md](./phases.md) | Roadmap and implementation phases | Upcoming features |
| [feature-comparison.md](./feature-comparison.md) | Library vs. NgRx, Redux, Zustand | Stakeholder presentations |
| [functional-primitives.md](./functional-primitives.md) | Deep FP theory behind Maybe/Either/IO | Advanced FP learning |
| [SECURITY.md](./SECURITY.md) | Security model and policies | Sensitive data handling |

---

## 8. Common Day-1 Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Calling `kernel.execute()` on a borrowed atom | State appears to change locally but never syncs back; devtools show orphaned commands | Only execute commands on owned atoms. Borrowers call only `atom.get()` and `kernel.subscribe()`. |
| Using `kernel.execute()` synchronously and expecting async result | `result.right` is `Promise<Either>` not a resolved value | Use `await kernel.executeAsync()` for `AsyncCommandHandler`s |
| Forgetting to call `kernel.register()` before `kernel.execute()` | `execute()` returns `err({ code: 'NO_HANDLER', ... })` | Always `register()` all handlers before the first `execute()`, typically in `APP_INITIALIZER` or `main.ts` |
| Importing `@vi/state-fp` (root) instead of a sub-path | Tree-shaking pulls in all modules | Import from the correct sub-path: `@vi/state-fp/kernel`, `@vi/state-fp/sync`, etc. |
| Mutating state directly in an applier | `atom.get()` returns stale data; subscribers not notified | Appliers must return a **new** object — never mutate `state`. Use spread: `{ ...state, items: [...state.items, newItem] }` |
| Using `Either.left` / `Either.right` fields in component code | Fragile — implementation details; TypeScript union narrowing awkward | Use `match(result, { ok, err })` or `isOk(result)` / `isErr(result)` |
| Calling `attachBridge()` unconditionally | `window.__VI_STATE_FP__` exposed in production | Guard: `if (isDevMode()) attachBridge(devtools)` |
| Creating one giant atom for all state | Every component re-renders on any state change | Split into domain-specific atoms: `cartAtom`, `authAtom`, `checkoutAtom` |
| Not cleaning up `kernel.subscribe()` in components | Memory leak; stale listeners firing after component teardown | Store the returned `Unsubscribe` function and call it in `ngOnDestroy`, `useEffect` cleanup, or `hostDisconnected` |
| Using `MemoryAdapter` in the atom definition but not calling `kernel.hydrate()` | State is not restored from storage on page load | Call `await kernel.hydrate()` in `APP_INITIALIZER` (Angular) or on `app.whenReady()` (React) |
