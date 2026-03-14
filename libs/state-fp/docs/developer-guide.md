# Developer Guide — @vi/state-fp

> **This guide is written for you if:**
> - You are joining the team and have not worked with CQRS before
> - You understand TypeScript but have little functional programming (FP) exposure
> - You have used React/Angular state (useState, NgRx, Redux) before but find `@vi/state-fp` unfamiliar
> - You want to understand every design decision, not just how to use the API

If you are an experienced FP developer you may prefer to start with
[architecture.md](./architecture.md) and the [API surface](./architecture.md#17-public-api-surface).

---

## Table of Contents

1. [Persona Definition](#1-persona-definition)
2. [What Problem Does This Solve?](#2-what-problem-does-this-solve)
3. [Concepts You Need First](#3-concepts-you-need-first)
   - [3.1 CQRS in Plain English](#31-cqrs-in-plain-english)
   - [3.2 FP Primitives in Plain English](#32-fp-primitives-in-plain-english)
   - [3.3 Micro-Frontends](#33-micro-frontends)
   - [3.4 Atoms](#34-atoms)
4. [Library Structure](#4-library-structure)
5. [File-by-File Reference](#5-file-by-file-reference)
   - [5.1 core module](#51-core-module)
   - [5.2 kernel module](#52-kernel-module)
   - [5.3 storage module](#53-storage-module)
   - [5.4 devtools module](#54-devtools-module)
   - [5.5 sync module](#55-sync-module)
   - [5.6 adapter module](#56-adapter-module)
6. [How to Add a Feature: Step-by-Step](#6-how-to-add-a-feature-step-by-step)
7. [Write Path Walkthrough](#7-write-path-walkthrough)
8. [Read Path Walkthrough](#8-read-path-walkthrough)
9. [Testing Patterns](#9-testing-patterns)
10. [Decision Log](#10-decision-log)

---

## 1. Persona Definition

> This guide is written for a **mid-level TypeScript developer** who:
>
> - Has 2–5 years of frontend experience
> - Knows TypeScript generics, union types, and interfaces well
> - Has used a state management library (Redux, Vuex, NgRx, Zustand)
> - Has NOT used CQRS or event sourcing before
> - Has little or no experience with functional programming beyond `Array.map / filter / reduce`
> - May be new to Micro-Frontend architecture
> - Wants to understand *why* decisions were made, not just *what* to type

The goal of this guide is that after reading it, you can:
1. Add a new atom with commands and queries
2. Understand what every file in `src/` does
3. Explain to another engineer why this library looks the way it does
4. Debug a state problem using the devtools bridge
5. Write tests for your command handler and event applier independently

---

## 2. What Problem Does This Solve?

### The standard story (and why it breaks in MFE)

In a regular Single-Page App, you have one Angular or React app in one browser tab. You
put state in a store (NgRx, Redux, Zustand). All components read from and write to the same
store. This works because:

- There's only one JavaScript runtime
- All code ships in one bundle
- "Who owns this state?" is never a hard question

In a **Micro-Frontend** (MFE) app, the shell and each remote are separately deployed
applications. They may be built by different teams, with different versions of Angular, and
loaded into the same browser at the same time. Suddenly:

- Sharing one Redux store means every team must depend on the same store version
- If the cart team updates their Redux version, they can break the header team
- "Who is allowed to change the user's auth token?" becomes a real policy question

### What this library adds

`@vi/state-fp` gives you:

| Feature | Why it matters |
|---|---|
| **Atom-based isolation** | Each slice of state is its own unit. Cart state and user state do not share a store object. |
| **CQRS discipline** | Only one place can change state: a `CommandHandler`. No back-door mutations. |
| **Typed errors** | A command either succeeds or fails with a typed error. No `try/catch` spaghetti. |
| **BroadcastChannel sync** | When shell auth changes, cart remote gets updated automatically via BroadcastChannel \u2014 no shared JS runtime needed. |
| **In-process devtools** | Time-travel and event log without a browser extension. Essential in enterprise environments. |
| **ESM sub-paths** | You can import just `@vi/state-fp/kernel` without pulling in Angular/React code. |

---

## 3. Concepts You Need First

### 3.1 CQRS in Plain English

**CQRS** stands for **Command Query Responsibility Segregation**. It sounds complicated but
the idea is simple:

> Separate the code that **changes** state from the code that **reads** state.

In Redux you have one `dispatch` function that handles both. In `@vi/state-fp` you have:

- **`kernel.execute(atom, command)`** — changes state (Command side)
- **`kernel.query(atom, query)`** — reads state (Query side)

**A Command is a request to change state**

```ts
// "Please increment the counter by 3"
const cmd = command('counter/incrementBy', { n: 3 });
```

A command can be **rejected** (returns a typed error) or **accepted** (produces Domain Events).

**A Domain Event is a fact that happened**

```ts
// "The counter was incremented by 3"
domainEvent('counter/incremented', { by: 3 })
```

Unlike commands, events cannot fail. They are immutable records of what happened.

**The flow:**

```
You                   Kernel
 │                      │
 │  execute(atom, cmd)  │
 ├─────────────────────►│
 │                      │  CommandHandler.handle(state, cmd)
 │                      ├──────────────────────────────────────►│
 │                      │  Either<Error, DomainEvent[]>          │
 │                      │◄──────────────────────────────────────┤
 │                      │
 │                      │  (for each event) EventApplier(state, event) → newState
 │                      │
 │ Either<Error, State> │
 │◄─────────────────────┤
```

**Why two functions (CommandHandler + EventApplier)?**

Because it separates two concerns:

- `CommandHandler` answers: *"Is this command valid and what should happen?"*
- `EventApplier` answers: *"Given something happened, what does state look like now?"*

The `EventApplier` can be replayed without re-running business rules. This enables time-travel debugging.

---

### 3.2 FP Primitives in Plain English

This library uses four FP types. Here is what they mean for you — no category theory required.

#### Maybe\<T\> — A value that might not exist

Think of `Maybe<T>` as a better version of `T | null | undefined`.

```ts
type Maybe<T> = Just<T> | Nothing;
```

- `Just(value)` — the value exists
- `Nothing`    — no value (like null, but safer)

**Why not just use `null`?**

Because TypeScript can't always force you to check for `null`. With `Maybe`, the type forces
you to handle both cases:

```ts
const name: Maybe<string> = getUsername(); // might be Nothing

// This won't compile unless you handle Nothing:
const greeting = foldMaybe(
  () => 'Hello, Guest',         // Nothing case
  (n) => `Hello, ${n}`,         // Just case
)(name);
```

**Where you'll see it:** `StorageAdapter.get()` returns `Maybe<T>` so you always handle cache misses.

---

#### Either\<Error, Value\> — A value OR a typed error

```ts
type Either<E, A> = Left<E> | Right<A>;
```

- `Right(value)` — success (the "happy path")
- `Left(error)`  — failure with a typed error

**Why not just `throw`?**

Because `throw` is invisible in TypeScript's type system. If a function can throw, you have
to read its implementation to know. With `Either`, it's in the return type:

```ts
// Without Either: can this fail? You don't know without reading the code
function doSomething(): string { ... }

// With Either: TypeScript FORCES you to handle the failure case
function doSomething(): Either<MyError, string> { ... }
```

**Where you'll see it:** `kernel.execute()` returns `Either<CommandError, State>`. You must
check which branch you got before using the result.

---

#### IO\<T\> — A deferred side effect

```ts
type IO<T> = { run: () => T };
```

An `IO` is just a function wrapper. The effect (writing to storage, notifying subscribers)
doesn't happen until `.run()` is called.

**Where you'll see it:** Storage writes and subscriber notifications are wrapped in `IO` so
the kernel controls exactly when they execute and in what order.

---

#### Lens\<S, A\> — A focused, composable getter+setter

A `Lens` is a pair of `get`/`set` functions that zoom into a nested property of a larger object.

```ts
// Instead of writing:
const updated = { ...state, user: { ...state.user, city: 'Seattle' } };

// You use a lens:
const cityLens = composeLens(prop('user'), prop('city'));
const updated  = cityLens.set('Seattle')(state);
```

**Where you'll see it:** Inside `EventApplier` implementations for readable nested state updates.

---

### 3.3 Micro-Frontends

A **Micro-Frontend** is a web application where the shell (the outer container) loads
independently deployed remotes (feature sub-applications) at runtime.

```
Browser Tab
└── Shell (header, nav, auth) — deployed by Platform team
    ├── /cart  → Cart Remote     — deployed by Commerce team
    ├── /order → Orders Remote   — deployed by Fulfilment team
    └── /user  → Profile Remote  — deployed by Identity team
```

Each remote:
- Has its own deployment pipeline
- May use a different version of Angular
- Runs in the same browser, same JavaScript context (not iframes)
- Should NOT have to know what state the other remotes hold

`@vi/state-fp` solves the cross-remote state sharing problem:

- Shell *owns* auth state — only shell's kernel can execute auth commands
- Remotes *borrow* auth state — they receive updates via BroadcastChannel
- No remote imports the shell's kernel instance directly

---

### 3.4 Atoms

An **Atom** is the smallest named unit of state. It is not a React/Jotai concept here — it
is a kernel-registered state container with a unique key.

```ts
const counterAtom = defineAtom({
  key:          'vi/counter',   // globally unique identifier
  initialState: { count: 0 },  // TypeScript infers CounterState from this
});
```

The atom:
- Holds the current state in memory
- Tracks a monotonically increasing version counter
- Lets you `subscribe` to state changes
- Can be configured to persist state in IndexedDB, localStorage, etc.

The atom does **NOT** know how to change its own state. That is the kernel's job.

---

## 4. Library Structure

```
libs/state-fp/src/
├── core/          — FP primitives (Maybe, Either, IO, Lens, pipe, utils)
├── kernel/        — CQRS engine (Atom, Command, Event, Query, Kernel)
├── storage/       — Persistence (Memory, Local, Session, IndexedDB adapters)
├── devtools/      — Debug layer (EventLog, Snapshots, TimeTravel, Bridge)
├── sync/          — MFE sync (BroadcastChannel, conflict resolution)
└── adapter/       — Framework wrappers (Angular, Vanilla, React)
```

Each folder is a **separate entry point** in `package.json#exports`. You can import from
individual paths:

```ts
import { pipe, Either }        from '@vi/state-fp/core';
import { defineAtom, Kernel }  from '@vi/state-fp/kernel';
import { MemoryAdapter }       from '@vi/state-fp/storage';
import { createDevTools }      from '@vi/state-fp/devtools';
import { createSyncEngine }    from '@vi/state-fp/sync';
import { createAngularAdapter } from '@vi/state-fp/adapter';
```

The dependency direction is strictly upward — `core` never imports from `kernel`:

```
adapter → kernel → core
storage → core
devtools → core  (uses kernel types as peer)
sync     → core  (uses kernel types as peer)
```

---

## 5. File-by-File Reference

### 5.1 core module

**Location:** `src/core/`  
**Import path:** `@vi/state-fp/core`  
**Purpose:** Pure FP utilities. No knowledge of state management.

#### `maybe.ts`

Implements the `Maybe<T>` monad.

| Export | What it does |
|---|---|
| `just(value)` | Wraps a value: `Just<T>` |
| `nothing()` | The empty case: `Nothing` |
| `fromNullable(value)` | `null`/`undefined` → `Nothing`, anything else → `Just` |
| `mapMaybe(fn)(m)` | Transform the value if it exists |
| `chainMaybe(fn)(m)` | Like map, but `fn` itself returns `Maybe` (avoids `Just(Just(x))`) |
| `foldMaybe(onNothing, onJust)(m)` | Extract value from either branch |
| `isJust(m)` / `isNothing(m)` | Type guard |

**Decision:** Why not just use `T | null`?

TypeScript's `strictNullChecks` helps, but `Maybe` forces explicit handling at every call
site via `foldMaybe`. With `T | null` it is easy to forget the null check. `Maybe` is also
a functor — you can `mapMaybe` over it without unwrapping first.

---

#### `either.ts`

Implements the `Either<E, A>` monad.

| Export | What it does |
|---|---|
| `left(error)` | Wraps a failure |
| `right(value)` | Wraps a success |
| `isLeft(e)` / `isRight(e)` | Type guards |
| `mapEither(fn)(e)` | Transform the success value; pass through failures |
| `chainEither(fn)(e)` | Like map, but `fn` returns `Either` |
| `bimapEither(onLeft, onRight)(e)` | Transform both branches |
| `foldEither(onLeft, onRight)(e)` | Extract a value from either branch |
| `sequenceEitherArray(arr)` | All-or-nothing: first `Left` in array short-circuits |
| `tryCatch(fn, onError)` | Turn a throwing function into `Either` |

**Decision:** Why not `throw`/`try`/`catch`?

Exceptions are an invisible second return type. `Either` makes the error channel part of
the function signature. This is the single biggest safety improvement in the library —
every `CommandHandler` that can fail must declare the failure type.

---

#### `io.ts`

Implements the `IO<A>` monad and `IORef<A>` for controlled mutation.

Key exports: `io(fn)`, `liftIO(value)`, `mapIO`, `chainIO`, `newIORef`.

**Decision:** Why wrap side effects in IO?

The kernel's execute pipeline is a sequence of steps: validate → apply events → write storage
→ notify subscribers. Wrapping each step in `IO` lets the kernel compose the pipeline
declaratively and control the execution order precisely.

---

#### `lens.ts`

Implements `Lens<S, A>`.

Key exports: `lens(get, set)`, `prop(key)`, `composeLens(outer, inner)`, `over(l)(fn)(s)`, `view(l)(s)`.

**Decision:** Why lenses instead of spread operators?

`{ ...state, user: { ...state.user, address: { ...state.user.address, city: 'Seattle' } } }` 
is verbose, error-prone, and not reusable. A lens is defined once and applied anywhere. It
is also composable — you build complex lenses from simple ones.

---

#### `utils.ts`

Exports `pipe`, `compose`, `identity`, `constant`, `uuid`, `now`, `deepClone`, `shallowDiff`.

`pipe(value, fn1, fn2, fn3)` — applies functions left to right. The most-used utility in the codebase:

```ts
const result = pipe(
  initialState,
  applyEvent(event1),
  applyEvent(event2),
  applyEvent(event3),
);
```

---

### 5.2 kernel module

**Location:** `src/kernel/`  
**Import path:** `@vi/state-fp/kernel`  
**Purpose:** The CQRS engine. Wires atoms, commands, events, and queries together.

#### `types.ts`

Type definitions only — no runtime code.

Key types:

| Type | Description |
|---|---|
| `Atom<S>` | A named state container with `key`, `get()`, `subscribe()` |
| `AtomDefinition<S>` | The config you pass to `defineAtom()` |
| `Command<T, P>` | An intent to change state. Has `type`, `payload`, and `meta` |
| `DomainEvent<T, P>` | A fact that happened. Has `type`, `payload`, and `meta` |
| `Query<T, P>` | A request for derived data |
| `CommandHandler<S, C>` | `{ commandType, handle(state, cmd) → Either<CommandError, DomainEvent[]> }` |
| `EventApplier<S>` | `(state, event) → state` — pure fold function |
| `QueryHandler<S, Q, R>` | `{ queryType, handle(state, query) → R }` — pure read |
| `Kernel` | The runtime interface (see below) |
| `KernelPlugin` | `{ onRegister?(atom), onExecute?(params) }` — extension point |
| `CommandError` | `{ code: string, message: string }` |

**Decision:** Why a separate `types.ts`?

TypeScript does not support circular type imports well. Keeping all type declarations in
`types.ts` gives other modules (devtools, sync) a single import target. It also makes
refactoring far easier — you can search for a type's definition in one file.

---

#### `atom.ts`

Implements `defineAtom<S>(definition)` and the internal `AtomRuntime<S>`.

```ts
const counterAtom = defineAtom({
  key:          'vi/counter',
  initialState: { count: 0 },
});
```

The returned atom has:
- `atom.key` — the string identifier (read-only)
- `atom.get()` — returns current state
- `atom.subscribe(fn)` — returns an `Unsubscribe` function

Internally, the atom also has `_setState(s)` which only the kernel calls. Components and
handlers cannot call `_setState` directly — this is the "no back-door writes" invariant.

**Decision:** Why does the atom not know its own handlers?

Separation of concerns. The atom is a pure data container. Handlers are registered
separately on the `Kernel` so that:
1. Handlers can be swapped without replacing the atom
2. Multiple atoms can share the same handler logic
3. Testing is easier — you can register a mock handler without modifying the atom

> **Phase 1.3 note:** Future versions will allow `defineAtom({ ..., commands: [...] })`
> for co-location convenience. The kernel will read handlers from the definition.

---

#### `command.ts`

Exports `command(type, payload)` factory and `CommandHandler` infrastructure.

```ts
// Creating a command (the "intent")
type AddItem = Command<'cart/addItem', { sku: string; qty: number }>;
const addItem = (sku: string, qty: number): AddItem =>
  command('cart/addItem', { sku, qty });

// Handler (the "business logic")
const addItemHandler = createCommandHandler<CartState, AddItem>({
  commandType: 'cart/addItem',
  handle: (state, cmd) => {
    if (cmd.payload.qty <= 0)
      return left({ code: 'INVALID_QTY', message: 'qty must be positive' });

    return right([
      domainEvent('cart/itemAdded', {
        sku: cmd.payload.sku,
        qty: cmd.payload.qty,
      }),
    ]);
  },
});
```

**Key rule:** `handle` must be a **pure function**. No `fetch()`, no `console.log()`,
no `Date.now()` (use `cmd.meta.timestamp` for time). Pure means: given the same
state and command, it always returns the same events.

**Decision:** Why return events from the command handler, not new state?

Because separation of concerns:
- The handler decides *what happened* (events)
- The applier decides *what state looks like* given what happened

This means you can write event appliers once and replay events many times (time-travel).

---

#### `event.ts`

Exports `domainEvent(type, payload)` factory and `EventApplier` infrastructure.

```ts
type CartApplierMap = {
  'cart/itemAdded': (state: CartState, event: CartItemAdded) => CartState;
};

const cartApplier = createEventApplier<CartState>({
  'cart/itemAdded': (state, event) => ({
    ...state,
    items: [...state.items, { sku: event.payload.sku, qty: event.payload.qty }],
  }),
});
```

The `EventApplier` maps event types to pure functions. Events not handled by the map
return the state unchanged (safe default).

**Key rule:** Event appliers must be **pure functions**. No async, no side effects.

---

#### `query.ts`

Exports `query(type, payload)` factory and `QueryHandler` infrastructure.

```ts
type GetCartTotal = Query<'cart/getTotal', {}>;
const getCartTotal = (): GetCartTotal => query('cart/getTotal', {});

const cartTotalHandler = createQueryHandler<CartState, GetCartTotal, number>({
  queryType: 'cart/getTotal',
  handle: (state) => state.items.reduce((sum, i) => sum + i.price * i.qty, 0),
});

// Usage
const total = kernel.query(cartAtom, getCartTotal()); // number
```

**Key rule:** Query handlers are **read-only and synchronous**. They never call `execute()`,
never mutate state, and never cause side effects.

---

#### `kernel.ts`

Implements `createKernel(options?)` — the main runtime that wires everything together.

```ts
const kernel = createKernel({
  devtools: process.env.NODE_ENV !== 'production'
    ? createDevTools()
    : noopDevTools,
});

kernel.register(cartAtom, addItemHandler, cartApplier);
kernel.registerQuery(cartAtom, cartTotalHandler);

kernel.execute(cartAtom, addItem('SKU-123', 2));
kernel.query(cartAtom, getCartTotal());
```

The Kernel interface (full):

```ts
interface Kernel {
  execute<S>(atom: Atom<S>, cmd: Command): Either<CommandError, S>;
  executeAsync<S>(atom: Atom<S>, cmd: Command): Promise<Either<CommandError, S>>;
  query<R>(atom: Atom<unknown>, q: Query): R;
  register<S>(atom: Atom<S>, handler: CommandHandler<S, Command>, applier: EventApplier<S>): void;
  registerQuery<S, R>(atom: Atom<S>, handler: QueryHandler<S, Query, R>): void;
  subscribe<S>(atom: Atom<S>, listener: (s: S) => void): Unsubscribe;
  onEvent(listener: (e: DomainEvent) => void): Unsubscribe;
  hydrate(): Promise<void>;
  destroy(): Promise<void>;
  use(plugin: KernelPlugin): void;
  readonly debug: DebugInterface;
}
```

**Decision:** Why not combine register and defineAtom?

`defineAtom` lives in every environment (browser, server, test). `kernel.register` only
makes sense when you have a Kernel running. Separating them means you can define atoms
in a shared library file and register different handlers per environment
(production vs test vs storybook).

---

#### `index.ts`

Barrel re-export. Exports the public API of the kernel module. Keep this file in sync when
adding new exports to any kernel file.

---

### 5.3 storage module

**Location:** `src/storage/`  
**Import path:** `@vi/state-fp/storage`  
**Purpose:** Pluggable, TTL-aware persistence adapters.

#### `types.ts`

Declares `StorageAdapter`, `StorageEntry<T>`, `StorageError`, `StorageConfig`.

The `StorageEntry<T>` envelope wraps every value with metadata:

```ts
type StorageEntry<T> = {
  v:   T;       // the value
  t:   number;  // write timestamp  
  x?:  number;  // expiry timestamp (absent = immortal)
  tag: string;  // atom key for grouped queries
  fv:  1;       // format version (for migrations)
};
```

#### `memory.ts`

`MemoryAdapter` — Map-backed storage that lives in process memory. Default when no storage
is declared on an atom. TTL enforced on every `get()`. Background sweep runs every 60 seconds.

```ts
const adapter = new MemoryAdapter({ sweepIntervalMs: 60_000 });
```

#### `base-web.ts`

Abstract base for `LocalAdapter` and `SessionAdapter`. Handles JSON serialization and the
`StorageEntry` envelope on top of the raw `Storage` interface.

#### `local.ts` and `session.ts`

`LocalAdapter` wraps `window.localStorage`. `SessionAdapter` wraps `window.sessionStorage`.
Both handle `QuotaExceededError` as `Left({ code: 'QUOTA_EXCEEDED' })`.

#### `indexed-db.ts`

`IndexedDbAdapter` — fully async, persistent, up to 1 GB. Uses a single IDB object store.
TTL sweep uses a secondary IDB index on the `x` field — no full-table scan required.

```ts
const adapter = new IndexedDbAdapter({ dbName: 'vi-state-fp', storeName: 'atoms' });
await adapter.open(); // must be called before use
```

**Decision:** Why four adapters instead of one?

Different state has different durability requirements:
- Auth token → `LocalAdapter` (persists across browser restarts)
- Cart in-progress → `SessionAdapter` (cleared when tab closes)
- Offline product cache → `IndexedDbAdapter` (large, structured)
- Computed intermediaries → `MemoryAdapter` (ephemeral)

---

### 5.4 devtools module

**Location:** `src/devtools/`  
**Import path:** `@vi/state-fp/devtools`  
**Purpose:** Zero-cost debug infrastructure — event log, snapshots, time-travel, browser bridge.

#### `types.ts`

Declares `DebugEntry`, `Snapshot`, `DebugInterface`, `Patch`, `SourceLocation`.

`DebugEntry` is the unit of observability. One is produced per `kernel.execute()` call:

```ts
// What a DebugEntry looks like after: kernel.execute(counterAtom, incrementBy(3))
{
  id:            'a1b2-...',
  correlationId: 'z9y8-...',
  atomKey:       'vi/counter',
  commandType:   'counter/incrementBy',
  events:        [{ type: 'counter/incremented', payload: { by: 3 } }],
  prevState:     { count: 0 },
  nextState:     { count: 3 },
  diff:          [{ op: 'replace', path: '/count', value: 3 }],
  timestamp:     1741200000000,
  durationMs:    0.4,
}
```

#### `event-log.ts`

Bounded circular buffer with three O(1) indices:
- By atom key
- By correlation ID (to trace all effects of one user action)
- By time range

When the buffer is full (default 200 entries), the oldest entry is evicted. The total count
is preserved (monotonically increasing) for time-ordering.

#### `snapshot.ts`

Takes a full deep-clone of all atom states every N events (default 50). Snapshots are the
starting points for time-travel replay — you never have to replay the entire event log
from the beginning.

#### `time-travel.ts`

Algorithm to replay events to any historical state:

1. Find the target `DebugEntry` by ID
2. Find the nearest `Snapshot` before that entry
3. Reset all atoms to the snapshot state
4. Re-run the event appliers (not command handlers!) from the snapshot forward
5. Mark the kernel as `replayMode = true` (blocks new `execute()` calls)
6. Notify subscribers with the replayed state

**Important:** Time-travel does NOT write to storage. It is entirely in-memory and reversible.

#### `bridge.ts`

Attaches `window.__VI_STATE_FP__` in browser environments. This exposes the entire debug
surface from the browser console — no extension required.

#### `devtools.ts`

`createDevTools(options?)` — wires event-log, snapshot manager, and time-travel together
into a `DebugInterface` implementation.

`noopDevTools` — a `DebugInterface` where every method is a no-op. Zero allocations.
Used in production.

**Decision:** Why `noopDevTools` instead of `if (debug) { ... }` everywhere?

Because `if` statements in hot code paths have overhead and prevent dead-code elimination.
By using the `noopDevTools` object, TypeScript's type system and bundler tree-shaking can
entirely remove the debug branch from production bundles.

---

### 5.5 sync module

**Location:** `src/sync/`  
**Import path:** `@vi/state-fp/sync`  
**Purpose:** Cross-MFE state synchronisation via BroadcastChannel.

#### `types.ts`

Declares `SyncMessage`, `SyncState<S>`, `ConflictStrategy`, `ShareOptions`.

Messages sent over BroadcastChannel:
```ts
// State broadcast (from owner to borrowers)
{ type: 'vi/sync/state',   atomKey, state, version, correlationId, origin }

// Resync request (borrower has a gap in version history)
{ type: 'vi/sync/request', atomKey, correlationId, origin }

// Hello (announce presence when connecting)
{ type: 'vi/sync/hello',   atoms: string[], correlationId, origin }
```

#### `version.ts`

Vector-clock utilities: `isStale(incoming, local)` and `isGap(incoming, local)`.

- Stale: incoming version ≤ local version → discard
- Gap: incoming version > local + 1 → request full resync
- Otherwise: apply and increment

#### `conflict.ts`

Four built-in conflict resolvers: `lastWriteWins`, `firstWriteWins`, `ownerWins`, `versionWins`.

For nuanced cases, pass a `CustomConflictResolver`:

```ts
createSyncEngine({
  channel: 'vi-state',
  kernel,
  conflict: (local, remote) => local.version >= remote.version ? local.state : remote.state,
});
```

#### `broadcast.ts`

Thin wrapper over `BroadcastChannel` that add serialisation and deserialization. In test
environments, the `BroadcastBridge` can be replaced with an in-memory bus.

#### `sync-engine.ts`

The main `createSyncEngine(options)` factory:

```ts
const sync = createSyncEngine({ channel: 'vi-state', kernel });

sync.share(authAtom, { conflict: 'owner-wins' });  // shell broadcasts auth state
sync.borrow(authAtom);                              // remote listens for updates
sync.start();  // begins listening
sync.stop();   // cleanup
```

**Decision:** Why share atom state over BroadcastChannel instead of events?

Because propagating events (commands) cross-MFE boundary would require every receiving
MFE to run the same command handlers. This creates tight version coupling. By broadcasting
the *resulting state* (the projection), borrowers apply it directly. The receiver doesn't
need to know about the sender's business rules.

---

### 5.6 adapter module

**Location:** `src/adapter/`  
**Import path:** `@vi/state-fp/adapter`  
**Purpose:** Framework-specific wrappers around the kernel CQRS API.

#### `angular.ts`

`createAngularAdapter(apis)` — factory pattern. You pass Angular's APIs as plain objects.
The adapter is fully testable without `@angular/core`:

```ts
import { createAngularAdapter } from '@vi/state-fp/adapter';
import { signal, effect, DestroyRef, inject } from '@angular/core';

const adapter = createAngularAdapter({ signal, effect, DestroyRef, inject });
```

Methods on the returned adapter:

| Method | Description |
|---|---|
| `adapter.toSignal(kernel, atom)` | Returns an Angular `Signal<S>` that auto-unsubscribes via `DestroyRef` |
| `adapter.toQuerySignal(kernel, atom, query)` | Returns a `computed(() => kernel.query(...))` signal |
| `adapter.commandDispatcher(kernel, atom)` | Returns a typed `(cmd) => Either<CommandError, S>` function |

**How to use in a component:**

```ts
@Component({ ... })
class CartComponent {
  private adapter = createAngularAdapter({ signal, effect, inject(DestroyRef), inject });

  readonly cartState = this.adapter.toSignal(this.kernel, cartAtom);
  readonly total     = this.adapter.toQuerySignal(this.kernel, cartAtom, getCartTotal());
  readonly addItem   = this.adapter.commandDispatcher(this.kernel, cartAtom);

  onAddClick(sku: string) {
    const result = this.addItem(AddItem(sku, 1));
    if (isLeft(result)) {
      this.toastService.error(result.left.message);
    }
  }
}
```

**Decision:** Why factory pattern instead of `inject()` inside the adapter?

`inject()` is only callable in an injection context (component/service constructor or
`runInInjectionContext`). Calling it in library code makes the library hard to test — you
need an actual Angular `TestBed` or `InjectionContext`. The factory pattern accepts
Angular APIs as parameters, allowing test code to pass mock objects:

```ts
// In a unit test
const mockSignal = <T>(v: T) => ({ value: v });
const adapter = createAngularAdapter({ signal: mockSignal, effect: jest.fn(), ... });
// No TestBed needed
```

#### `vanilla.ts`

`createAdapter(kernel)` — returns a `VanillaAdapter` with `watch`, `run`, `read`, `snapshot`.

```ts
const adapter = createAdapter(kernel);

// Watch: subscribe to state changes
const off = adapter.watch(counterAtom, (state) => {
  document.getElementById('count')!.textContent = String(state.count);
});

// Run: execute a command
adapter.run(counterAtom, IncrementBy(3));

// Read: query state
const total = adapter.read(cartAtom, GetTotal());

// Snapshot: synchronous current state
const currentState = adapter.snapshot(cartAtom);

// Cleanup
off();
```

#### `react.ts` (stub)

Type declarations only for Phase 5:

```ts
export declare function useAtom<S>(atom: Atom<S>): [S, (cmd: Command) => void];
export declare function useQuery<S, R>(atom: Atom<S>, q: Query): R;
```

Full React adapter via factory pattern is planned in Phase 5.4.

---

## 6. How to Add a Feature: Step-by-Step

Here is the complete process for adding a new feature — a **shopping cart** — from scratch.

### Step 1: Define your state shape

```ts
// src/cart/types.ts
export type CartItem  = { sku: string; name: string; price: number; qty: number };
export type CartState = { items: CartItem[]; coupon: string | null };
```

### Step 2: Define the atom

```ts
// src/cart/atom.ts  
import { defineAtom } from '@vi/state-fp/kernel';
import { CartState }  from './types';

export const cartAtom = defineAtom<CartState>({
  key:          'vi/cart',
  initialState: { items: [], coupon: null },
  storage: {               // optional — persist across page loads
    adapter: new LocalAdapter(),
    key:     'vi:cart',
    ttl:     24 * 60 * 60 * 1000, // 24 hours
  },
});
```

### Step 3: Define commands

```ts
// src/cart/commands.ts
import { command, Command } from '@vi/state-fp/kernel';

// Types
export type AddItem    = Command<'cart/addItem',    { sku: string; name: string; price: number; qty: number }>;
export type RemoveItem = Command<'cart/removeItem', { sku: string }>;
export type ApplyCoupon = Command<'cart/applyCoupon', { code: string }>;

// Factories
export const addItem     = (item: AddItem['payload']): AddItem =>
  command('cart/addItem', item);
export const removeItem  = (sku: string): RemoveItem =>
  command('cart/removeItem', { sku });
export const applyCoupon = (code: string): ApplyCoupon =>
  command('cart/applyCoupon', { code });
```

### Step 4: Write command handlers (pure functions)

```ts
// src/cart/handlers.ts
import { createCommandHandler } from '@vi/state-fp/kernel';
import { right, left }         from '@vi/state-fp/core';
import { CartState, AddItem, RemoveItem, ApplyCoupon } from './types';

export const addItemHandler = createCommandHandler<CartState, AddItem>({
  commandType: 'cart/addItem',
  handle: (state, cmd) => {
    const { sku, name, price, qty } = cmd.payload;
    if (qty <= 0) return left({ code: 'INVALID_QTY', message: 'Quantity must be positive' });
    if (price < 0) return left({ code: 'INVALID_PRICE', message: 'Price must be non-negative' });

    const existing = state.items.find(i => i.sku === sku);
    const items = existing
      ? state.items.map(i => i.sku === sku ? { ...i, qty: i.qty + qty } : i)
      : [...state.items, { sku, name, price, qty }];

    return right([domainEvent('cart/itemAdded', { sku, name, price, qty })]);
  },
});

export const removeItemHandler = createCommandHandler<CartState, RemoveItem>({
  commandType: 'cart/removeItem',
  handle: (state, cmd) => {
    if (!state.items.some(i => i.sku === cmd.payload.sku))
      return left({ code: 'ITEM_NOT_FOUND', message: `SKU ${cmd.payload.sku} not in cart` });

    return right([domainEvent('cart/itemRemoved', { sku: cmd.payload.sku })]);
  },
});
```

### Step 5: Write the event applier (pure function)

```ts
// src/cart/applier.ts
import { createEventApplier } from '@vi/state-fp/kernel';
import { CartState }          from './types';

export const cartApplier = createEventApplier<CartState>({
  'cart/itemAdded': (state, event) => ({
    ...state,
    items: [
      ...state.items.filter(i => i.sku !== event.payload.sku),
      {
        sku:   event.payload.sku,
        name:  event.payload.name,
        price: event.payload.price,
        qty:   (state.items.find(i => i.sku === event.payload.sku)?.qty ?? 0) + event.payload.qty,
      },
    ],
  }),
  'cart/itemRemoved': (state, event) => ({
    ...state,
    items: state.items.filter(i => i.sku !== event.payload.sku),
  }),
});
```

### Step 6: Write query handlers (pure functions)

```ts
// src/cart/queries.ts
import { createQueryHandler, query, Query } from '@vi/state-fp/kernel';
import { CartState }                        from './types';

type GetTotal = Query<'cart/getTotal', {}>;
export const getTotal = (): GetTotal => query('cart/getTotal', {});

export const cartTotalHandler = createQueryHandler<CartState, GetTotal, number>({
  queryType: 'cart/getTotal',
  handle: (state) => state.items.reduce((sum, i) => sum + i.price * i.qty, 0),
});

type GetItemCount = Query<'cart/getItemCount', {}>;
export const getItemCount = (): GetItemCount => query('cart/getItemCount', {});
export const cartItemCountHandler = createQueryHandler<CartState, GetItemCount, number>({
  queryType: 'cart/getItemCount',
  handle: (state) => state.items.reduce((sum, i) => sum + i.qty, 0),
});
```

### Step 7: Register with the kernel

```ts
// src/cart/register.ts  (or wherever you bootstrap your kernel)
import { kernel }            from '../kernel';   // your app's createKernel() instance
import { cartAtom }          from './atom';
import { addItemHandler, removeItemHandler } from './handlers';
import { cartApplier }       from './applier';
import { cartTotalHandler, cartItemCountHandler } from './queries';

// Register command handler + event applier together
kernel.register(cartAtom, addItemHandler, cartApplier);
kernel.register(cartAtom, removeItemHandler, cartApplier);   // same applier — it handles both events

// Register query handlers
kernel.registerQuery(cartAtom, cartTotalHandler);
kernel.registerQuery(cartAtom, cartItemCountHandler);

// Hydrate from storage at startup
await kernel.hydrate();
```

### Step 8: Use in a component

```ts
// Angular component
@Component({ template: `
  <p>Items: {{ itemCount() }}</p>
  <p>Total: {{ total() | currency }}</p>
  <button (click)="add()">Add item</button>
` })
class CartSummaryComponent {
  private adapter = createAngularAdapter({ signal, effect, inject, DestroyRef: inject(DestroyRef) });

  readonly itemCount = this.adapter.toQuerySignal(kernel, cartAtom, getItemCount());
  readonly total     = this.adapter.toQuerySignal(kernel, cartAtom, getTotal());
  readonly dispatch  = this.adapter.commandDispatcher(kernel, cartAtom);

  add() {
    const result = this.dispatch(addItem({ sku: 'DEMO-1', name: 'Demo Item', price: 9.99, qty: 1 }));
    if (isLeft(result)) console.error(result.left.message);
  }
}
```

---

## 7. Write Path Walkthrough

Tracing `kernel.execute(cartAtom, addItem('SKU-1', 1))`:

```
1. Stamp command metadata
   │ cmd.meta = { correlationId: uuid(), timestamp: Date.now(), ... }
   │
2. Look up CommandHandler for 'cart/addItem'
   │ Found: addItemHandler
   │ Not found → return Left({ code: 'NO_HANDLER' })
   │
3. addItemHandler.handle(currentState, cmd)
   │ → Left(error): record to DevTools, return Left(CommandError) immediately
   │ → Right([cart/itemAdded{...}]): continue
   │
4. For each DomainEvent:
   │ a. Stamp event meta: id, causationId, version, timestamp, atomKey
   │ b. cartApplier(currentState, event) → nextState
   │ c. atom._setState(nextState) — in-memory update
   │
5. storageAdapter.set(key, nextState, ttl)    [if configured — async, non-blocking]
   │
6. atom._subscribers.forEach(fn => fn(nextState))   [synchronous push]
   │
7. domainEventBus.emit(events)   [for SyncEngine + DevTools listeners]
   │
8. devtools.record(debugEntry)   [only if devtools attached]
   │
9. Return Right(nextState)
```

**Important subtleties:**

- Step 3's handler returns events, not state. State is computed in step 4.
- Step 5 is async but does NOT block the return in step 9. If storage fails,
  it is handled by `storageErrorBehavior` policy.
- Step 6 is synchronous — subscribers see state changes before `execute()` returns.

---

## 8. Read Path Walkthrough

Tracing `kernel.query(cartAtom, getTotal())`:

```
1. Look up QueryHandler for 'cart/getTotal'
   │ Not found → throw Error('No query handler for cart/getTotal')
   │ Found: cartTotalHandler
   │
2. cartTotalHandler.handle(cartAtom.get(), query)
   │ → returns number synchronously
   │
3. Return number
```

**Key rules:**
- Queries are NEVER async
- Queries NEVER call `execute()`
- Queries complete in `O(state)` time — no external I/O

---

## 9. Testing Patterns

### Testing a CommandHandler in isolation

```ts
// cart/handlers.spec.ts
import { addItemHandler } from './handlers';
import { isLeft, isRight } from '@vi/state-fp/core';

const emptyCart = { items: [], coupon: null };

describe('addItemHandler', () => {
  it('rejects zero quantity', () => {
    const cmd = command('cart/addItem', { sku: 'A', name: 'A', price: 5, qty: 0 });
    const result = addItemHandler.handle(emptyCart, cmd);
    expect(isLeft(result)).toBe(true);
    // No kernel required — handlers are pure functions
  });

  it('emits itemAdded event on valid command', () => {
    const cmd = command('cart/addItem', { sku: 'B', name: 'B', price: 10, qty: 2 });
    const result = addItemHandler.handle(emptyCart, cmd);
    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.right[0].type).toBe('cart/itemAdded');
      expect(result.right[0].payload.qty).toBe(2);
    }
  });
});
```

### Testing an EventApplier in isolation

```ts
// cart/applier.spec.ts
import { cartApplier } from './applier';

describe('cartApplier', () => {
  it('adds a new item to empty cart', () => {
    const state = { items: [], coupon: null };
    const event = domainEvent('cart/itemAdded', { sku: 'A', name: 'A', price: 5, qty: 1 });
    const next  = cartApplier(state, event);
    expect(next.items).toHaveLength(1);
    expect(next.items[0].qty).toBe(1);
    // Also pure — no kernel required
  });

  it('accumulates qty on repeated add of same SKU', () => {
    const state = { items: [{ sku: 'A', name: 'A', price: 5, qty: 1 }], coupon: null };
    const event = domainEvent('cart/itemAdded', { sku: 'A', name: 'A', price: 5, qty: 2 });
    const next  = cartApplier(state, event);
    expect(next.items[0].qty).toBe(3);
  });
});
```

### Integration test with a real Kernel

```ts
// cart/cart.integration.spec.ts
import { createKernel } from '@vi/state-fp/kernel';
import { noopDevTools }  from '@vi/state-fp/devtools';

describe('Cart integration', () => {
  let kernel: Kernel;

  beforeEach(() => {
    kernel = createKernel({ devtools: noopDevTools });
    kernel.register(cartAtom, addItemHandler, cartApplier);
    kernel.registerQuery(cartAtom, cartTotalHandler);
  });

  it('adds item and reflects in total query', () => {
    kernel.execute(cartAtom, addItem({ sku: 'A', name: 'A', price: 10, qty: 2 }));
    const total = kernel.query(cartAtom, getTotal());
    expect(total).toBe(20);
  });

  it('subscriber is notified on state change', () => {
    const states: CartState[] = [];
    kernel.subscribe(cartAtom, s => states.push(s));
    kernel.execute(cartAtom, addItem({ sku: 'A', name: 'A', price: 10, qty: 1 }));
    expect(states).toHaveLength(1);
    expect(states[0].items).toHaveLength(1);
  });
});
```

### Testing with DevTools

```ts
it('records debug entry on execute', () => {
  const devtools = createDevTools();
  const kernel   = createKernel({ devtools });
  kernel.register(cartAtom, addItemHandler, cartApplier);

  kernel.execute(cartAtom, addItem({ sku: 'X', name: 'X', price: 5, qty: 1 }));

  const entries = devtools.getLog().filter(e => e.atomKey === 'vi/cart');
  expect(entries).toHaveLength(1);
  expect(entries[0].commandType).toBe('cart/addItem');
  expect(entries[0].nextState.items).toHaveLength(1);
});
```

### Testing Storage Adapters

```ts
import { MemoryAdapter } from '@vi/state-fp/storage';
import { isRight, isJust } from '@vi/state-fp/core';

it('stores and retrieves a value', async () => {
  const adapter = new MemoryAdapter();
  await adapter.set('test-key', { count: 42 });
  const result = await adapter.get<{ count: number }>('test-key');
  expect(isRight(result)).toBe(true);
  if (isRight(result)) {
    expect(isJust(result.right)).toBe(true);
    if (isJust(result.right)) {
      expect(result.right.value.count).toBe(42);
    }
  }
});
```

---

## 10. Decision Log

A record of **why** the library was designed the way it is. Reference this when the
design seems strange and you want to understand the reasoning.

### D1: Why CQRS instead of a simple Flux/Redux reducer?

**Rejected alternative:** A Redux-style `dispatch(action)` → `reducer(state, action) → state`.

**Reason CQRS was chosen:**

1. **Separation of validation and projection.** In Redux, a reducer both validates the action
   and computes new state. In CQRS, the `CommandHandler` validates and emits events; the
   `EventApplier` maps events to state. This means event appliers are always simple switch
   statements, while handlers can hold complex rules without polluting the state projection.

2. **Time-travel correctness.** When replaying events for time-travel, you can re-run the
   `EventApplier` without re-running business rule validation. This is the same correctness
   guarantee that event-sourced systems have.

3. **Named intent.** `command('cart/addItem', ...)` communicates *what you want*.
   `{ type: 'CART_ADD_ITEM' }` communicates *a raw instruction*. Names matter under code review.

### D2: Why FP primitives (Maybe, Either) instead of null/undefined/throw?

**Rejected alternatives:** `T | null | undefined` for nullable, `throw` for errors.

**Reason:**

1. TypeScript will coerce `null` checks away if you're not careful.
   `Maybe<T>` makes the branch visible in the type and forces pattern matching.

2. Exceptions are invisible. A function that can throw forces callers to read the source.
   `Either<Error, T>` puts the failure type in the signature. TypeScript then **enforces** that
   callers handle the `Left` case.

3. At the kernel boundary, `kernel.execute()` returning `Either<CommandError, S>` means
   no component can `execute()` and silently swallow errors.

### D3: Why factory adapter pattern instead of Angular DI?

**Rejected alternative:** `@Injectable()` adapter that calls `inject()` internally.

**Reason:**

1. `inject()` is only callable inside injection contexts. An adapter that calls `inject()`
   internally is not testable without `TestBed`. This makes unit tests harder and slower.

2. Factory pattern accepts Angular APIs as plain objects. Any test can pass mock objects
   without Angular's injection machinery.

3. Zero compile-time `@angular/core` dependency. The adapter file never imports from
   `@angular/core`. This means the adapter can be built without Angular in CI.

### D4: Why ESM-only, no CJS?

**Rejected alternative:** Dual ESM + CJS output (`"require"` conditions in exports map).

**Reason:**

1. The entire MFE ecosystem (Vite, webpack 5+, esbuild, Nx esbuild) supports `"import"`
   conditions natively. CJS interop adds build complexity with no benefit.

2. CJS cannot be statically tree-shaken. ESM modules can be tree-shaken at entry-point
   granularity. The 6 sub-path entry points only deliver the code you actually import.

3. `"type": "module"` in `package.json` prevents accidental `require()` calls at runtime.
   Fail fast is better than silent dual-format confusion.

### D5: Why sub-path exports (`/core`, `/kernel`, etc.)?

**Rejected alternative:** Single entry point `@vi/state-fp` that exports everything.

**Reason:**

1. An MFE remote that only needs `kernel` and `storage` should not pull in the Angular
   adapter or devtools. Sub-paths enable selective imports.

2. Each sub-path is an independent chunk in the bundle. An error in `devtools` cannot
   affect `core` or `kernel` at runtime.

3. Version negotiation across MFEs is simpler. A remote can declare
   `"@vi/state-fp": "^1.0.0"` and only use `@vi/state-fp/kernel`.

### D6: Why BroadcastChannel instead of shared kernel instance?

**Rejected alternative:** Shell exposes a kernel instance via Module Federation shared scope.

**Reason:**

1. A shared kernel instance creates a hard runtime coupling between shell and remotes.
   If the shell is at `@vi/state-fp@1.1.0` and a remote is at `@1.2.0`, they cannot share
   the singleton — this is the classic MFE version mismatch problem.

2. BroadcastChannel is a browser native API. It works across independently bundled JavaScript
   contexts. There is no version conflict because only serialised JSON crosses the boundary.

3. The sync protocol propagates *state* (not commands), so receivers do not need to know
   the sending app's business rules.

### D7: Why in-process devtools instead of Redux DevTools Extension?

**Rejected alternative:** Integrate with `redux-devtools-extension` or a separate protocol.

**Reason:**

1. Redux DevTools Extension requires a browser extension. Enterprise environments often
   block browser extension installation.

2. The Redux DevTools protocol ties the library to Redux's action/reducer mental model.
   `@vi/state-fp` uses Commands and DomainEvents — a different model.

3. `window.__VI_STATE_FP__` gives every developer the full debug surface from the browser
   console with no tooling installation. The correlation query
   `window.__VI_STATE_FP__.traceCorrelation(id)` has no equivalent in the extension model.

---

*This guide is a living document. When you make a design decision, add it to Section 10.*  
*When you encounter a concept that needed more explanation, improve the relevant section.*
