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
     - [5.3a Phase 2.5 — Computed Atoms](#53a-phase-25--computed-atoms)
     - [5.3b Phase 2.6 — Optimistic Updates](#53b-phase-26--optimistic-updates)
     - [5.3c Security — DevTools Visibility and State Protection](#53c-security--devtools-visibility-and-state-protection)
   - [5.4 devtools module](#54-devtools-module)
   - [5.5 sync module](#55-sync-module)
   - [5.6 adapter module](#56-adapter-module)
     - [5.6a React](#56a-react)
     - [5.6b Angular](#56b-angular-17-signals)
     - [5.6c Lit](#56c-lit-reactive-controllers)
     - [5.6d Vanilla JS](#56d-vanilla-js--typescript)
6. [How to Add a Feature: Step-by-Step](#6-how-to-add-a-feature-step-by-step)
7. [Write Path Walkthrough](#7-write-path-walkthrough)
8. [Read Path Walkthrough](#8-read-path-walkthrough)
9. [Testing Patterns](#9-testing-patterns)
10. [Decision Log](#10-decision-log)
    - [D1: FP-first, no classes](#d1-why-functional-primitives-instead-of-classes)
    - [D2: CQRS over simple atoms](#d2-why-cqrs-instead-of-reactive-atoms)
    - [D3: fire-and-forget storage](#d3-why-fire-and-forget-storage-writes)
    - [D4: no shared kernel singleton](#d4-why-no-shared-kernel-singleton)
    - [D5: AbortSignal for async commands](#d5-why-abortsignal-for-async-command-cancellation)
    - [D6: co-located atom registration](#d6-why-co-located-atom-registration)
    - [D7: in-process devtools](#d7-why-in-process-devtools-instead-of-redux-devtools-extension)
    - [D8: no EncryptedAdapter](#d8-why-there-is-no-encryptedadapter)

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

**Phase 1.3 — Co-located registration (shipped):**
`defineAtom` accepts `commands`, `applier`, and `queries` directly to reduce bootstrapping
ceremonial calls:

```ts
export const counterAtom = defineAtom<CounterState>({
  key:          'vi/counter',
  initialState: { count: 0 },
  // Co-located handlers — kernel.register(counterAtom) reads these automatically
  commands: [incrementHandler],
  applier:  counterApplier,
  queries:  [getCountHandler],
});

// Bootstrap: one call instead of three
await kernel.register(counterAtom);   // reads .commands, .applier, .queries from definition
```

**Phase 2.5 — Computed atoms (shipped):**
`defineComputedAtom` creates a read-only projection of one or more source atoms.
The compute function is called only when a dependency changes; `Object.is` equality
prevents spurious downstream notifications.

```ts
import { defineComputedAtom } from '@vi/state-fp/kernel';

// cartAtom and discountAtom are regular Atom<S> instances
export const cartTotalAtom = defineComputedAtom({
  key:     'vi/cart-total',
  deps:    [cartAtom, discountAtom],
  compute: ([cart, discount]) =>
    cart.items.reduce((sum, i) => sum + i.price * i.qty, 0) * (1 - discount.rate),
});

// Register with the kernel to wire up dependency tracking
kernel.registerComputed(cartTotalAtom);

// Subscribe like any other atom
kernel.subscribe(cartTotalAtom, total => console.log('Cart total:', total));

// Read synchronously
const total = cartTotalAtom.get();
```

**Key rules for computed atoms:**
- `compute` must be a pure function — no I/O, no side effects
- `kernel.execute(cartTotalAtom, cmd)` is rejected with `Left({ code: 'COMPUTED_ATOM' })`
- Dependency tracking is set up at `registerComputed` time; a computed atom not registered will never update

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
import { createKernel } from '@vi/state-fp/kernel';
import { createDevTools } from '@vi/state-fp/devtools';

// Minimal — no devtools (production default)
const kernel = createKernel();

// With devtools (development)
const devtools = createDevTools({ maxLogSize: 500 });
const kernel   = createKernel({ debug: true });
kernel.use(devtools.plugin);          // wire devtools into the kernel via the plugin API

kernel.register(cartAtom, addItemHandler, cartApplier);
kernel.registerQuery(cartAtom, cartTotalHandler);

kernel.execute(cartAtom, addItem({ sku: 'SKU-123', name: 'Item', price: 9.99, qty: 2 }));
kernel.query(cartAtom, getCartTotal());
```

> **Note:** `createDevTools()` returns a `DevToolsInstance` — not a `KernelOptions`
> value. It is connected via `kernel.use(devtools.plugin)`. The `debug: true` flag
> on `KernelOptions` enables the internal `KernelDebugEntry` recording path which the
> plugin also uses. Both serve different purposes: the kernel's built-in `DebugInterface`
> records `KernelDebugEntry` objects; the devtools plugin records the richer `DebugEntry`
> objects into the `EventLog` with per-event resolution.

The **full Kernel interface** (as defined in `kernel/types.ts`):

```ts
interface Kernel {
  // ── Synchronous execute (Phase 1) ─────────────────────────────────────────
  // Stamping → CommandHandler → EventApplier → atom._setState → storage(fire-and-forget)
  // → recomputeDependents → plugins.onExecute → debugLayer.record
  execute<S>(atom: Atom<S>, cmd: Command): Either<CommandError, S>;

  // ── Async execute with AbortSignal (Phase 1.4) ─────────────────────────────
  // Falls back to synchronous execute() when no AsyncCommandHandler is registered.
  executeAsync<S>(
    atom:     Atom<S>,
    cmd:      Command,
    options?: { signal?: AbortSignal },
  ): Promise<Either<CommandError, S>>;

  // ── Optimistic execute with rollback (Phase 2.6) ───────────────────────────
  // 1. optimisticApplier(state, cmd) → writes optimistic state immediately
  // 2. confirm(optimisticState) → async API call
  // 3a. Right(void)  → keep optimistic state, notify plugins.onExecute
  // 3b. Left(error)  → atom._setState(preOptimisticState) directly (no commands),
  //                    call onRollback(error), notify plugins.onError
  executeOptimistic<S>(
    atom: Atom<S>,
    cmd:  Command,
    opts: ExecuteOptimisticOptions<S>,
  ): Promise<Either<CommandError, S>>;

  // ── Query (Phase 1) ────────────────────────────────────────────────────────
  query<R = unknown>(atom: Atom<unknown>, q: Query): R;

  // ── Registration ───────────────────────────────────────────────────────────
  // Explicit form
  register<S>(atom: Atom<S>, handler: CommandHandler<S, Command>, applier: EventApplier<S>): void;
  // Co-located form (Phase 1.3): reads atom.definition.commands, .applier, .queries
  register<S>(atom: Atom<S>): void;

  // Register an AsyncCommandHandler (Phase 1.4)
  registerAsync<S>(
    atom:    Atom<S>,
    handler: AsyncCommandHandler<S, Command>,
    applier: EventApplier<S>,
  ): void;

  // Register a query handler
  registerQuery<S, Q extends Query, R>(atom: Atom<S>, handler: QueryHandler<S, Q, R>): void;

  // Phase 2.5 — register a computed atom (wires up dependency tracking)
  registerComputed<R>(computed: ComputedAtom<R>): void;

  // ── Subscriptions ──────────────────────────────────────────────────────────
  subscribe<S>(atom: Atom<S>, listener: (s: S) => void): Unsubscribe;
  subscribeComputed<R>(computed: ComputedAtom<R>, listener: (v: R) => void): Unsubscribe;
  onEvent(listener: (e: DomainEvent) => void): Unsubscribe;

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  hydrate(): Promise<void>;
  destroy(): Promise<void>;

  // ── Plugin system (OCP) ───────────────────────────────────────────────────
  use(plugin: KernelPlugin): void;

  // ── Debug interface ───────────────────────────────────────────────────────
  readonly debug: DebugInterface; // noopDebug unless debug:true in options
}
```

**`KernelOptions`** (all fields):

```ts
type KernelOptions = {
  /**
   * Enable kernel-level debug recording.
   * - `false` / absent — zero overhead (noopDebug object; no allocations)
   * - `true`           — enables `isEnabled` flag; record() is still a no-op
   *                       unless a plugin processes the KernelDebugEntry
   * - `DebugInterface` — custom recorder; implement `record(KernelDebugEntry)` directly
   */
  debug?: boolean | DebugInterface;

  /**
   * MFE identifier — stamped onto `command.meta.issuedBy` for every executed command.
   * Useful for cross-MFE audit logs and correlation.
   */
  instanceId?: string;

  /**
   * Redact sensitive atom state before it reaches the debug layer.
   * Follows the Redux DevTools Extension / NgRx @ngrx/store-devtools pattern.
   *
   * Called before every debugLayer.record() invocation (7 call sites in kernel.ts).
   * The real in-memory state is NEVER modified — only the debug snapshot is replaced.
   * Not called at all when debug is disabled (noopDebug short-circuits).
   *
   * @param atomKey The atom's key (e.g. 'vi/auth').
   * @param state   The raw state value (before or after the command).
   * @returns       A safe-to-display version — e.g. with tokens redacted.
   */
  stateSanitizer?: (atomKey: string, state: unknown) => unknown;
};
```

**`ExecuteOptimisticOptions<S>`** (Phase 2.6 — the exact API):

```ts
type ExecuteOptimisticOptions<S> = {
  /**
   * Pure function: apply the optimistic change to the current state synchronously.
   * The result is written to the atom immediately before confirm() is called.
   * Subscribers see this optimistic state while the confirmation is in flight.
   *
   * @param state  The atom's current state before the optimistic change.
   * @param cmd    The command passed to executeOptimistic(), available for payload access.
   * @returns      The new optimistic state.
   */
  optimisticApplier: (state: S, cmd: Command) => S;

  /**
   * Async function that confirms the change with an external source (API, DB, etc.).
   * Receives the optimistic state so you can send it as the body of an API call.
   *
   * - Return `right(undefined)` to confirm and keep the optimistic state.
   * - Return `left(error)` to trigger atomic rollback to the pre-optimistic state.
   *   The `onRollback` callback (if provided) is then called with the error.
   *
   * Note: Never throw inside confirm() — wrap with try/catch and return left(…).
   */
  confirm: (optimisticState: S) => Promise<Either<CommandError, void>>;

  /**
   * Optional. Called when confirm() returns Left (rollback has already happened by
   * the time this runs). Use for UI side-effects: toasts, error messages, logging.
   * The atom state is already restored to the pre-optimistic value before this runs.
   */
  onRollback?: (error: CommandError) => void | Promise<void>;
};
```

**`KernelPlugin`** (the Open/Closed extension point):

```ts
type KernelPlugin = {
  /** Unique name for the plugin (used in error messages). */
  readonly name: string;

  /** Called when any atom is registered via kernel.register() or registerComputed(). */
  onRegister?: (atom: Atom<unknown>) => void;

  /**
   * Called after every successful execute() cycle — both sync and async variants.
   * Receives a rich params object: command, emitted events, before/after state,
   * atom key, and wall-clock duration.
   */
  onExecute?: (params: {
    command:    Command;
    events:     DomainEvent[];
    prevState:  unknown;
    nextState:  unknown;
    atomKey:    string;
    durationMs: number;
  }) => void;

  /** Called when a command handler returns Left (validation error). */
  onError?: (params: {
    command: Command;
    error:   CommandError;
    atomKey: string;
  }) => void;

  /** Called once when kernel.destroy() is invoked. */
  onDestroy?: () => void;
};
```

**Decision:** Why not combine register and defineAtom?

`defineAtom` lives in every environment (browser, server, test). `kernel.register` only
makes sense when you have a Kernel running. Separating them means you can define atoms
in a shared library file and register different handlers per environment
(production vs test vs storybook).

---

#### Phase 1.4 — AsyncCommandHandler and `executeAsync`

For commands that involve network calls, timers, or any async work, use `registerAsync` +
`executeAsync`. The async handler runs outside the synchronous CQRS pipeline:

```ts
import { createAsyncCommandHandler } from '@vi/state-fp/kernel';
import { right, left }               from '@vi/state-fp/core';

// 1. Define the async handler type
type SyncCart = Command<'cart/syncWithServer', { userId: string }>;

// 2. Implement — receives { signal, correlationId } as context
export const syncCartHandler = createAsyncCommandHandler<CartState, SyncCart>({
  commandType: 'cart/syncWithServer',
  handleAsync: async (currentState, cmd, ctx) => {
    const { signal, correlationId } = ctx;

    // Use signal for cancellation:
    const response = await fetch(`/api/cart/${cmd.payload.userId}`, { signal });

    if (signal.aborted) {
      return left({ code: 'CANCELLED', message: 'Request was cancelled' });
    }

    if (!response.ok) {
      return left({ code: 'API_ERROR', message: `HTTP ${response.status}` });
    }

    const serverCart: CartState = await response.json();
    return right(serverCart);  // return the new state directly
  },
});

// 3. Register with the kernel
kernel.registerAsync(cartAtom, syncCartHandler, cartApplier);

// 4. Execute with optional AbortSignal
const controller = new AbortController();

const result = await kernel.executeAsync(
  cartAtom,
  syncCart({ userId: 'user-123' }),
  { signal: controller.signal },
);

// 5. Cancel if needed
controller.abort();               // result will be Left({ code: 'CANCELLED' })
```

**Key differences vs synchronous handlers:**

| Aspect | `CommandHandler` | `AsyncCommandHandler` |
|---|---|---|
| Return type | `Either<CommandError, DomainEvent[]>` | `Promise<Either<CommandError, S>>` |
| Returns | Events (state derived via applier) | New state directly |
| Cancellation | Not supported | `ctx.signal: AbortSignal` |
| Fallback | N/A | If no async handler: falls back to sync `execute()` |
| Storage write | Still fire-and-forget | Same |

> **Fallback behaviour:** If `executeAsync()` is called for an atom+command type that
> has no registered `AsyncCommandHandler`, it falls back to synchronous `execute()`
> wrapped in `Promise.resolve()`. This means `executeAsync()` is safe to use for all
> command dispatching even when mixing sync and async handlers.

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
- Auth token → **NO persistent storage** — use `MemoryAdapter` (default, `memory-only` policy) and re-authenticate on page reload
- User preferences (theme, locale) → `LocalAdapter` (persists across browser restarts, non-sensitive)
- Cart in-progress → `SessionAdapter` (cleared when tab closes)
- Offline product cache → `IndexedDbAdapter` (large, structured)
- Computed intermediaries → `MemoryAdapter` (ephemeral)

#### `obfuscated.ts`

`ObfuscatedAdapter` — wraps any `StorageAdapter`. Computes a deterministic SHA-256 hash of
the storage key before writing. Values are stored in plaintext; only the key is hidden.
Requires `SubtleCrypto` (Node 18+, all modern browsers).

```ts
import { ObfuscatedAdapter, LocalAdapter } from '@vi/state-fp/storage';

// localStorage key will show "3af29b1d..." instead of "vi:user"
const adapter = new ObfuscatedAdapter(new LocalAdapter(), {
  salt: `${appName}@${appVersion}`,  // salt makes key unique across deploy versions
});
```

Use when: the data value is not sensitive, but you don’t want DevTools to reveal
your application’s internal atom key structure.
---

### 5.3a Phase 2.5 — Computed Atoms

Computed atoms are **read-only projections** derived from one or more source atoms.
They sit at the intersection of CQRS (read model) and reactive primitives (auto-update).

#### Defining a computed atom

```ts
import { defineComputedAtom } from '@vi/state-fp/kernel';

// Source atoms (regular mutable atoms)
const cartAtom     = defineAtom<CartState>(/* ... */);
const discountAtom = defineAtom<DiscountState>(/* ... */);

// Computed atom — automatically re-derives when either dep changes
export const cartTotalAtom = defineComputedAtom({
  key:  'vi/cart-total',
  deps: [cartAtom, discountAtom],
  compute: ([cart, discount]) =>
    cart.items.reduce((sum, i) => sum + i.price * i.qty, 0)
    * (1 - discount.rate),
});
```

#### Registering with the kernel

```ts
// Wire up dependency tracking so the kernel knows to recompute
// when cartAtom or discountAtom changes
kernel.registerComputed(cartTotalAtom);
```

`registerComputed` must be called before the first `execute()` that changes any
dependency. Calling it after is safe for initial values but early state changes will
not propagate if registration is deferred.

#### Using a computed atom

```ts
// Synchronous read
const total = cartTotalAtom.get(); // number

// Subscribe to updates (same API as regular atoms)
const off = kernel.subscribe(cartTotalAtom, total => {
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;
});
off(); // unsubscribe

// Dispatching commands is rejected at runtime
// kernel.execute(cartTotalAtom, someCommand()); // Left({ code: 'COMPUTED_ATOM' })
```

#### Memoization

The compute function is called only when **at least one dependency state reference
changes** (checked with `Object.is`). This means:

- If `cartAtom.get()` returns the same object reference after an execute (because the
  command left the state unchanged), `cartTotalAtom` will NOT recompute.
- Computed atoms recompute synchronously on the same tick as the originating `execute()`
  call — before subscribers are notified.

> **Performance note:** The `compute` function receives the raw dep state objects. For
> expensive computations with deps that frequently return new object references, stabilize
> references in the EventApplier so the compute function can short-circuit via `Object.is`.

#### Testing computed atoms

```ts
import { createKernel, defineAtom, defineComputedAtom } from '@vi/state-fp/kernel';

const cartAtom  = defineAtom<CartState>({ key: 'vi/cart', initialState: { items: [] } });
const totalAtom = defineComputedAtom({
  key:  'vi/cart-total',
  deps: [cartAtom],
  compute: ([cart]) => cart.items.reduce((s, i) => s + i.price * i.qty, 0),
});

describe('cartTotalAtom', () => {
  let kernel: Kernel;
  beforeEach(() => {
    kernel = createKernel();
    kernel.register(cartAtom, addItemHandler, cartApplier);
    kernel.registerComputed(totalAtom);
  });

  it('starts at 0', () => {
    expect(totalAtom.get()).toBe(0);
  });

  it('recomputes after adding an item', () => {
    kernel.execute(cartAtom, addItem({ sku: 'A', name: 'A', price: 10, qty: 2 }));
    expect(totalAtom.get()).toBe(20);
  });

  it('notifies subscriber on change', () => {
    const totals: number[] = [];
    kernel.subscribe(totalAtom, t => totals.push(t));
    kernel.execute(cartAtom, addItem({ sku: 'A', name: 'A', price: 5, qty: 1 }));
    expect(totals).toEqual([5]);
  });
});
```

---

### 5.3b Phase 2.6 — Optimistic Updates

Optimistic updates allow the UI to reflect a state change **immediately**, before the
server or async operation confirms it. If the operation fails, the kernel atomically
restores the pre-optimistic state and calls your `onRollback` callback for side-effects.

#### The pattern

```
1. optimisticApplier(state, cmd)   — pure fn: compute new state immediately
   atom._setState(optimisticState)  — write to atom (subscribers notified NOW)
   
2. await confirm(optimisticState)  — async operation: API call, DB write, etc.

3a.  Right(void)                   — Keep optimistic state as-is.
                                     Notify plugins.onExecute.
                                     Return Right(optimisticState).
     
3b.  Left(error)                   — Rollback: atom._setState(preOptimisticState) directly.
                                     recomputeDependents() for computed atom propagation.
                                     await onRollback?.(error)  — side-effects only.
                                     Notify plugins.onError.
                                     Return Left(error).
```

> **CQRS note:** Rollback does **NOT** dispatch a rollback command through the CQRS pipeline.
> The kernel restores the pre-optimistic state via `atom._setState()` directly — a targeted,
> atomic restoration. This is intentional: there is no rollback "event" in CQRS; the optimistic
> state simply never happened as far as the audit trail is concerned.

#### Usage

```ts
import { createKernel, defineAtom }  from '@vi/state-fp/kernel';
import { right, left, isLeft }       from '@vi/state-fp/core';

const result = await kernel.executeOptimistic(
  cartAtom,
  // Pass the originating command for context — payload accessible in optimisticApplier
  addItem({ sku: 'WIDGET-1', name: 'Widget', price: 9.99, qty: 1 }),
  {
    // 1. Pure function — compute optimistic state from current + command payload
    //    Subscribers see this result BEFORE confirm() is awaited
    optimisticApplier: (state, cmd) => ({
      ...state,
      items: [
        ...state.items,
        { sku: cmd.payload.sku, name: cmd.payload.name,
          price: cmd.payload.price, qty: cmd.payload.qty },
      ],
    }),

    // 2. Async confirmation — call your API/backend
    //    Return right(undefined) to keep optimistic state
    //    Return left(error) to trigger atomic rollback
    confirm: async (optimisticState) => {
      try {
        await cartApi.addItem('WIDGET-1', 1);
        return right(undefined);
      } catch (err) {
        return left({ code: 'API_ERROR', message: String(err) });
      }
    },

    // 3. Optional: called AFTER rollback is complete (for UI side-effects only)
    //    Atom is already restored to pre-optimistic state when this runs
    onRollback: (error) => {
      toast.error(`Failed to add item: ${error.message}`);
    },
  },
);

if (isLeft(result)) {
  // Atom state is already restored — onRollback already fired
  console.log('Optimistic update failed:', result.left.code);
}
```

#### Key design choices

- **No rollback command.** Unlike a compensating CQRS command, rollback here is a direct
  `atom._setState(preOptimisticState)` — atomic and zero-latency. This avoids the need for
  a symmetrical undo command for every mutating command.
- **`confirm()` returns `Right<void>`, not `Right<ServerState>`.** The optimistic state is
  the intended final state. If the server returns a canonical state that differs from the
  optimistic prediction, you should do a subsequent `kernel.execute()` after the confirmation.
- **`onRollback` is for side-effects only.** It runs after the state is already restored.
  Use it for toasts, error logging, and analytics — not for state mutation.
- **`confirm()` must return `Either` — never throw.** Wrap API calls in `try/catch` and
  return `left(...)`. An unhandled throw inside `confirm()` is treated as a rollback trigger.
- **Subscribers are notified twice on failure.** Once when the optimistic state is applied,
  and once when it is rolled back. Components must handle rapid bidirectional updates.

#### Testing optimistic updates

```ts
import { createKernel } from '@vi/state-fp/kernel';
import { right, left, isRight, isLeft } from '@vi/state-fp/core';

describe('optimistic cart update', () => {
  const testItem = { sku: 'WIDGET-1', name: 'Widget', price: 9.99, qty: 1 };

  it('keeps optimistic state when confirm resolves Right', async () => {
    const kernel = createKernel();
    kernel.register(cartAtom, addItemHandler, cartApplier);

    const result = await kernel.executeOptimistic(cartAtom, addItem(testItem), {
      optimisticApplier: (state, cmd) => ({
        ...state,
        items: [...state.items, cmd.payload],
      }),
      confirm: async () => right(undefined),  // simulated success
    });

    expect(isRight(result)).toBe(true);
    expect(cartAtom.get().items).toHaveLength(1);
    expect(cartAtom.get().items[0].sku).toBe('WIDGET-1');
  });

  it('rolls back to pre-optimistic state when confirm returns Left', async () => {
    const kernel = createKernel();
    kernel.register(cartAtom, addItemHandler, cartApplier);
    const initialState = cartAtom.get();

    const result = await kernel.executeOptimistic(cartAtom, addItem(testItem), {
      optimisticApplier: (state, cmd) => ({
        ...state,
        items: [...state.items, cmd.payload],
      }),
      confirm: async () => left({ code: 'API_ERROR', message: 'Network failure' }),
    });

    expect(isLeft(result)).toBe(true);
    expect(cartAtom.get().items).toHaveLength(0);        // rolled back
    expect(cartAtom.get()).toEqual(initialState);         // exact pre-optimistic state
  });

  it('calls onRollback with error after rollback completes', async () => {
    const kernel = createKernel();
    kernel.register(cartAtom, addItemHandler, cartApplier);
    const rollbackErrors: CommandError[] = [];

    await kernel.executeOptimistic(cartAtom, addItem(testItem), {
      optimisticApplier: (state, cmd) => ({ ...state, items: [...state.items, cmd.payload] }),
      confirm: async () => left({ code: 'API_ERROR', message: 'Server down' }),
      onRollback: (err) => rollbackErrors.push(err),
    });

    expect(rollbackErrors).toHaveLength(1);
    expect(rollbackErrors[0].code).toBe('API_ERROR');
    // Verify rollback is complete before onRollback was called
    expect(cartAtom.get().items).toHaveLength(0);
  });

  it('notifies subscribers on both optimistic apply and rollback', async () => {
    const kernel = createKernel();
    kernel.register(cartAtom, addItemHandler, cartApplier);
    const snapshots: CartState[] = [];
    kernel.subscribe(cartAtom, (s) => snapshots.push(s));

    await kernel.executeOptimistic(cartAtom, addItem(testItem), {
      optimisticApplier: (state, cmd) => ({ ...state, items: [...state.items, cmd.payload] }),
      confirm: async () => left({ code: 'REJECTED', message: 'rejected' }),
    });

    expect(snapshots).toHaveLength(2);                   // optimistic + rollback
    expect(snapshots[0].items).toHaveLength(1);          // optimistic state
    expect(snapshots[1].items).toHaveLength(0);          // rolled back
  });
});
```

---

### 5.3c Security — DevTools Visibility and State Protection

> **`localStorage`, `sessionStorage`, and `IndexedDB` are fully readable in Chrome DevTools
> → Application tab. Any value stored in plaintext is visible to anyone with DevTools access.**

Two controls are available: `stateSanitizer` (DevTools redaction) and `memory-only`
(no persistence). For the full rationale on why client-side encryption was not adopted,
see Decision Log D8.

#### stateSanitizer — Protecting DevTools Output

`stateSanitizer` is an option on `KernelOptions`. It is the same pattern used by
Redux DevTools Extension and NgRx `@ngrx/store-devtools`.

**The guarantee:** The real in-memory state seen by your components is **never modified**.
Only the DevTools snapshot is replaced with the sanitized version.

```ts
import { createKernel }   from '@vi/state-fp/kernel';
import { createDevTools } from '@vi/state-fp/devtools';

const devtools = createDevTools();
const kernel   = createKernel({
  debug: true,                        // enables debug recording path
  stateSanitizer: (atomKey: string, state: unknown) => {
    switch (atomKey) {
      case 'vi/auth': {
        const s = state as AuthState;
        return { ...s, token: '[REDACTED]', refreshToken: '[REDACTED]' };
      }
      case 'vi/user': {
        const s = state as UserState;
        return { ...s, email: '[REDACTED]', ssn: '[REDACTED]' };
      }
      default: return state;  // non-sensitive atoms pass through unchanged
    }
  },
});
kernel.use(devtools.plugin);          // wire devtools in via plugin API

// Components see the FULL state (stateSanitizer never touches this):
authAtom.get(); // { isAuthenticated: true, token: 'eyJhbGci...', userId: 'u_12345' }

// DevTools shows the SAFE version (via devtools.eventLog.getAll()):
// stateBefore: { isAuthenticated: true, token: '[REDACTED]', userId: 'u_12345' }
// stateAfter:  { isAuthenticated: true, token: '[REDACTED]', userId: 'u_12345' }
```

**Coverage:** All 7 paths where the kernel calls `debugLayer.record()` route state through
the sanitizer before recording — both the success and error paths of `execute()`,
`executeAsync()`, and `executeOptimistic()`.

**Production behavior:** When `debug` is absent or `false`, `stateSanitizer` is
never called — zero runtime overhead (the `noopDebug` object short-circuits).

#### memory-only — Never Persisting Sensitive State

For the highest-sensitivity atoms (auth tokens, credentials), the safest approach is to
**never write to browser storage at all**.

```ts
// Option 1: No storage config (defaults to MemoryAdapter)
const authAtom = defineAtom<AuthState>({
  key:          'vi/auth',
  initialState: { isAuthenticated: false, token: null, userId: null },
  // State lives in JS heap only — invisible to all browser DevTools
});

// Option 2: Explicit memory-only (adapter declared, kernel enforces skip)
const authAtom = defineAtom<AuthState>({
  key:          'vi/auth',
  initialState: { isAuthenticated: false, token: null, userId: null },
  storage: {
    adapter:  new LocalAdapter(),  // listed for documentation; ignored at runtime
    key:      'vi:auth',
    security: 'memory-only',       // kernel skips hydrate() and writeToStorage()
  },
});
```

#### Security policy decision table

| Atom contains | Recommended policy |
|---|---|
| Auth token, session ID, refresh token | `memory-only` (never persist) |
| PII (email, address, SSN) | `memory-only` preferred; `obfuscated` + `stateSanitizer` if persistence required |
| Health / financial data | `memory-only` (never persist client-side) |
| Application structure (key names) | `obfuscated` (SHA-256 key hash, value still plaintext) |
| Non-sensitive UI state | `visible` (default — no overhead) |


### 5.4 devtools module

**Location:** `src/devtools/`  
**Import path:** `@vi/state-fp/devtools`  
**Purpose:** Zero-cost debug infrastructure — event log, snapshots, time-travel, browser bridge.

#### Integration pattern

```ts
import { createKernel }   from '@vi/state-fp/kernel';
import { createDevTools } from '@vi/state-fp/devtools';

const devtools = createDevTools({
  maxLogSize:    500,   // circular buffer size (default 500)
  maxSnapshots:  30,    // max deep-clone snapshots (default 30)
  snapshotEvery: 50,    // auto-snapshot every N events (default 50, 0 = never)
  installBridge: true,  // window.__VI_STATE_FP__ (default: true in browser)
});

const kernel = createKernel({ debug: true }); // enable kernel debug recording
kernel.use(devtools.plugin);                   // wire the devtools KernelPlugin in

// Now you can access devtools on the returned DevToolsInstance:
devtools.eventLog.getAll()               // ReadonlyArray<DebugEntry>
devtools.eventLog.getByAtom('vi/cart')   // entries for one atom
devtools.snapshots.list()                // ReadonlyArray<Snapshot>
devtools.timeTravel.goTo(entryId)        // replay to any point
devtools.uninstall()                     // remove window.__VI_STATE_FP__
```

`createDevTools()` returns a **`DevToolsInstance`**:

```ts
type DevToolsInstance = {
  plugin:      KernelPlugin;       // pass to kernel.use()
  eventLog:    EventLog;           // circular DebugEntry buffer
  snapshots:   SnapshotManager;    // periodic deep-clone captures
  timeTravel:  TimeTravelController;
  uninstall(): void;               // remove window bridge
};
```

#### `types.ts` — Core DevTools types

**`DebugEntry`** — one entry per emitted DomainEvent (per `execute()` cycle that produced events):

```ts
type DebugEntry = {
  readonly id:            string;    // uuid — unique per entry
  readonly atomKey:       string;    // e.g. 'vi/cart'
  readonly correlationId: string;    // groups all entries from one user action
  readonly causationId:   string | undefined;  // parent command's correlationId (if any)
  readonly commandType:   string | undefined;  // e.g. 'cart/addItem'
  readonly event:         DomainEvent;         // the individual domain event
  readonly stateBefore:   unknown;   // deep-clone of state before the event
  readonly stateAfter:    unknown;   // deep-clone of state after the event
  readonly timestamp:     number;    // wall-clock ms
  readonly version:       number;    // atom version at time of event
};
```

> **Important:** There is no `diff`, no `durationMs`, and no `sourceLocation` on `DebugEntry`.
> Duration and error info live in the kernel's internal `KernelDebugEntry` (fed to
> `debug.record()`). The devtools plugin creates `DebugEntry` objects from the
> richer `onExecute` callback — separate from the kernel's debug recording.

A concrete example after `kernel.execute(counterAtom, incrementBy(3))`:

```ts
{
  id:            'a1b2c3d4-...',
  atomKey:       'vi/counter',
  correlationId: 'z9y8x7w6-...',   // same as cmd.meta.correlationId
  causationId:   undefined,         // top-level command has no causation
  commandType:   'counter/incrementBy',
  event:         { type: 'counter/incremented', payload: { by: 3 }, meta: { version: 4, ... } },
  stateBefore:   { count: 0 },
  stateAfter:    { count: 3 },
  timestamp:     1741200000000,
  version:       4,
}
```

**`Snapshot`** — a full deep-clone of all registered atom states:

```ts
type Snapshot = {
  readonly id:             string;
  readonly timestamp:      number;
  readonly eventCount:     number;           // total events in log at time of capture
  readonly triggerEventId: string | undefined;  // entry id that triggered auto-snapshot
  readonly state:          Readonly<Record<string, unknown>>;  // keyed by atom key
  readonly label:          string | undefined;   // human label for manual snapshots
};
```

#### `event-log.ts`

Bounded circular buffer with three O(1) secondary indices:
- **By atom key** — all entries for `'vi/cart'`
- **By correlation ID** — trace every state change caused by one user action
- **By time range** — entries within a wall-clock window

When the buffer is full (default 500 entries), the oldest entry is evicted. The
`totalCount` property is monotonically increasing — it tracks lifetime event count
regardless of buffer eviction, enabling snapshot alignment.

```ts
// All EventLog methods:
eventLog.getAll()                          // ReadonlyArray<DebugEntry>
eventLog.getByAtom('vi/cart')              // entries for one atom — O(1)
eventLog.getByCorrelation(correlationId)   // all side-effects of one command — O(1)
eventLog.getByTimeRange(from, to)          // entries in a time window
eventLog.last(n)                          // last N entries
eventLog.latest()                         // Maybe<DebugEntry> — most recent
eventLog.clear()
eventLog.totalCount                        // monotonic; survives circular eviction
```

#### `snapshot.ts`

`SnapshotManager` takes a deep-clone of all atom states every `snapshotEvery` events
(default 50). Snapshots are the starting points for time-travel replay.

```ts
// SnapshotManager methods:
snapshots.capture(atomStates, triggerEventId, totalEventCount, label?)   // → Snapshot
snapshots.list()                     // ReadonlyArray<Snapshot> oldest-first
snapshots.get(id)                    // Maybe<Snapshot>
snapshots.nearestBefore(eventCount)  // Maybe<Snapshot> — for time-travel alignment
snapshots.export()                   // JSON string for crash reports
snapshots.import(json)               // restore from JSON
```

#### `time-travel.ts`

Algorithm to replay events to any historical state:

1. Find the target `DebugEntry` by ID in the event log
2. Find the nearest `Snapshot` before that entry (`nearestBefore(entry.version)`)
3. Reset all registered atoms to the snapshot state
4. Re-run the `EventApplier` functions (NOT command handlers) from snapshot forward
5. Mark the kernel as `replayMode = true` (blocks new `execute()` calls during replay)
6. Notify subscribers with the replayed state

**Important invariants:**
- Time-travel does NOT write to storage — entirely in-memory and reversible
- EventAppliers are re-run (pure functions), not EventHandlers (which have validation side-effects)
- Replay exits automatically when the target event is reached

#### `bridge.ts`

Attaches `window.__VI_STATE_FP__` in browser environments. This exposes the entire debug
surface from the browser console — no extension required.

```ts
type DevToolsBridge = {
  getLog():               ReadonlyArray<DebugEntry>;
  getAtoms():             Record<string, unknown>;
  timeTravelTo(id: string): Promise<void>;
  exportLog():            string;
  importLog(json: string): void;
  readonly version:       string;
};
```

```js
// In browser console — no extension needed:
window.__VI_STATE_FP__.getLog()                         // all debug entries
window.__VI_STATE_FP__.getAtoms()                       // current atom states
window.__VI_STATE_FP__.timeTravelTo('a1b2c3d4-...')    // replay to this point
window.__VI_STATE_FP__.exportLog()                      // JSON for bug reports
```

#### `devtools.ts`

`createDevTools(options?)` — wires event-log, snapshot manager, time-travel, and bridge
into a `DevToolsInstance`. The returned `plugin` is a `KernelPlugin` that hooks into
`onRegister` (to track atoms for time-travel) and `onExecute` (to record `DebugEntry`
objects). It does NOT hook into `onError` — command errors appear in the kernel's own
debug layer via `debugLayer.record()`.

> **Why `noopDebug` instead of `if (debug) { ... }` everywhere?**
>
> `if` statements in hot code paths prevent dead-code elimination by bundlers. The
> `noopDebug` object (`{ isEnabled: false, record: () => void 0 }`) enables bundler
> tree-shaking to eliminate the entire debug branch from production bundles.
> The `KernelPlugin` pattern achieves the same effect for the devtools layer.

---

### 5.5 sync module

**Location:** `src/sync/`  
**Import path:** `@vi/state-fp/sync`  
**Purpose:** Cross-MFE state synchronisation via BroadcastChannel.

#### API overview

```ts
import { createSyncEngine } from '@vi/state-fp/sync';

// Create the engine — requires a KernelLike (subscribe method)
const sync = createSyncEngine({ kernel });

// Begin synchronising an atom across tabs/workers
// Returns an unsync() function — call it to stop sync for that atom
const unsync = sync.share(authAtom, {
  conflict:   'owner-wins',      // conflict resolution strategy
  channel:    'vi-auth-channel', // BroadcastChannel name (defaults to atom key)
  peerId:     'shell-mfe',       // unique peer identifier (defaults to random uuid)
  propagate:  true,              // reply to hello messages with current state
});

// Inspect current sync state for an atom
const state = sync.getState<AuthState>('vi/auth');
// → { peerId, version, connected, peers, conflictsResolved, _pending }

// Clean up all shared atoms, listeners, and BroadcastChannels
sync.destroy();

// Stop sync for one specific atom
unsync();
```

**`SyncEngine` interface** (full):

```ts
type SyncEngine = {
  // Start synchronising an atom across BroadcastChannel peers
  share<S>(atom: Atom<S>, options?: ShareOptions<S>): Unsubscribe;

  // Inspect sync state (version vector, peer list, conflicts) for an atom
  getState<S>(atomKey: string): SyncState<S> | undefined;

  // Tear down all channels, subscriptions, and resources
  destroy(): void;
};
```

**`ShareOptions<S>`** (per-atom options passed to `share()`):

```ts
type ShareOptions<S> = {
  // Conflict resolution strategy. Default: 'last-write-wins'
  conflict?: 'last-write-wins' | 'first-write-wins' | 'owner-wins' | 'version-wins'
           | ((local: SyncState<S>, remote: SyncState<S>) => S);

  // Unique ID for this peer. Default: random uuid
  peerId?: string;

  // BroadcastChannel name. Default: atom.key (so all peers sharing same atom
  // automatically use the same channel)
  channel?: string;

  // Whether to reply to 'vi/sync/hello' messages with our current state.
  // Default: true. Set to false for read-only borrowers.
  propagate?: boolean;
};
```

#### `types.ts`

Messages sent over BroadcastChannel:
```ts
// Announces presence and current version vector when connecting
{ type: 'vi/sync/hello',   peerId, version, atoms: string[] }

// Broadcasts full state after every write
{ type: 'vi/sync/state',   peerId, atomKey, state, version, ts }

// Requests current state from peers (used when a version gap is detected)
{ type: 'vi/sync/request', peerId, atomKey }
```

> **Note:** There is no `vi/sync/event` message in the current implementation —
> the sync engine broadcasts the resulting *state* (projection), not the commands
> or events. This means receivers do not need to know the sender's command handlers.

#### `version.ts`

Vector-clock utilities for ordering concurrent updates:

```ts
isStale(incoming, local)      // incoming.version ≤ local.version → discard
isConcurrent(v1, v2)          // neither is strictly ahead → conflict
increment(vector, peerId)      // bump peerId's clock in the vector
merge(v1, v2)                  // component-wise max of two vectors
```

**Version gap detection:** When `incoming.version > local.version + 1`, the engine
requests a full resync from the other peer (`'vi/sync/request'` message).

#### `conflict.ts`

Four built-in conflict resolvers:

| Strategy | Behaviour |
|---|---|
| `last-write-wins` | Latest wall-clock timestamp wins (default — may cause data loss under clock skew) |
| `first-write-wins` | Lowest timestamp wins |
| `owner-wins` | The peer whose `peerId` matches the atom's declared owner wins |
| `version-wins` | Higher vector clock version wins |

For nuanced cases, pass a custom resolver function:

```ts
sync.share(productCacheAtom, {
  conflict: (local, remote) =>
    local.version >= remote.version ? local.state : remote.state,
});
```

#### `broadcast.ts`

Thin wrapper over `BroadcastChannel` with serialisation/deserialisation. In test
environments, `BroadcastBridge` can be replaced with an in-memory bus to avoid
the browser-only `BroadcastChannel` API.

**Decision:** Why propagate *state* instead of *events* over BroadcastChannel?

Because propagating events (commands) cross-MFE boundary would require every receiving
MFE to run the same command handlers. This creates tight version coupling. By broadcasting
the *resulting state* (the projection), borrowers apply it directly — no business rule
knowledge required. The receiving MFE accesses auth state without knowing the auth commands.

---

### 5.6 adapter module

**Location:** `src/adapter/`  
**Import path:** `@vi/state-fp/adapter`  
**Purpose:** Framework-specific wrappers around the kernel CQRS API.

All adapters use a **factory pattern** — you pass the framework's primitives in at setup time. The library has zero compile-time dependency on React, Angular, or Lit. The same principle makes every adapter fully testable with plain mock objects — no real framework runtime required.

| File | Adapter factory | Status |
|---|---|---|
| `react.ts` | `createReactAdapter(ReactAPIs)` | Available |
| `angular.ts` | `createAngularAdapter(AngularAPIs)` | Available |
| `lit.ts` | `createLitController / createLitStreamController` | Available |
| `vanilla.ts` | `createAdapter(kernel)` | Available |

---

#### 5.6a React

**Sequence diagram:** `docs/fig/13-sequence-react-adapter.puml`

`createReactAdapter(apis)` accepts React's hook functions and returns a `ReactKernelAdapter` object with a `Provider` component and four hooks. Call it once per app and reuse the adapter object.

```ts
// src/app/adapter.ts
import { useState, useEffect, useRef, useMemo, useContext, createContext, createElement } from 'react';
import { createReactAdapter } from '@vi/state-fp/adapter';

export const reactAdapter = createReactAdapter({
  useState, useEffect, useRef, useMemo, useContext, createContext, createElement,
});
```

**Wrap your app in `<Provider>`** to inject the kernel into all descendant hooks:

```tsx
// App.tsx
function App() {
  return (
    <reactAdapter.Provider kernel={kernel}>
      <Routes />
    </reactAdapter.Provider>
  );
}
```

**`useAtom(atom)`** — subscribe to state, re-render on change:

```tsx
function CounterDisplay() {
  const [state, atom] = reactAdapter.useAtom(counterAtom);
  //     ^S            ^Atom<S> — stable reference
  return <p>Count: {state.count}</p>;
}
```

- Seeds `useState` from `atom.get()` before the first effect fires — no `undefined` flicker.
- `useEffect` sets up `kernel.subscribe()` and returns the unsubscribe function for automatic cleanup on unmount.

**`useCommand(atom)`** — get a stable dispatch function:

```tsx
function IncrementButton() {
  const dispatch = reactAdapter.useCommand(counterAtom);
  //     stable — does not change between renders

  const handleClick = () => {
    const result = dispatch(IncrementBy(1));
    if (isLeft(result)) console.error(result.left.message);
  };

  return <button onClick={handleClick}>+</button>;
}
```

- The returned function reference is stable across renders (backed by `useRef`) so it is safe to pass to `React.memo` children without causing unnecessary re-renders.

**`useQuery(atom, query)`** — memoised derived value:

```tsx
function CartTotal() {
  const total = reactAdapter.useQuery(cartAtom, BuildTotal());
  //     ^R — re-computed only when atom state reference changes
  return <span>Total: {total}</span>;
}
```

- Internally calls `useAtom` for the subscription, then wraps `kernel.query()` in `useMemo` keyed on the state reference. The query handler is only re-invoked when state changes.

**`useEphemeral(stream, animated?)`** — subscribe to an `EphemeralStream`:

```tsx
function MouseTracker() {
  // animated=true (default): RAF-batched, max 60 fps
  const pos = reactAdapter.useEphemeral(mousePosStream);
  //     ^{ x: number; y: number } | undefined

  // animated=false: synchronous, every emit
  const rawFps = reactAdapter.useEphemeral(fpsStream, false);

  return <div>Mouse: {pos?.x},{pos?.y} | FPS: {rawFps}</div>;
}
```

- Seeds from `stream.last` so there is no flash of `undefined` if the stream has already emitted.
- Cleans up the RAF subscription on unmount automatically.

**Testing without a real React runtime:**

```ts
// Unit test — no React, no jsdom required
const mockAPIs = {
  useState:      vi.fn().mockImplementation(<S>(v: S) => [v, vi.fn()]),
  useEffect:     vi.fn(),
  useRef:        vi.fn().mockImplementation((v) => ({ current: v })),
  useMemo:       vi.fn().mockImplementation((fn) => fn()),
  useContext:    vi.fn().mockReturnValue(kernel),
  createContext: vi.fn().mockReturnValue({ _currentValue: null, Provider: vi.fn() }),
};
const adapter = createReactAdapter(mockAPIs);
// test adapter.useAtom, adapter.useCommand etc. directly
```

---

#### 5.6b Angular (17+ Signals)

**Sequence diagram:** `docs/fig/15-sequence-angular-adapter.puml`

##### Architectural note — adapter vs store layer

`createAngularAdapter` provides low-level primitives (`toSignal`, `commandDispatcher`, …).
In a production app you never call these directly in a component.
Instead you call them once inside an **Angular injectable store service** — the same
pattern you would use with NgRx facades. Components inject the store and consume
signals; they have **zero knowledge of atoms, kernels, or the adapter API**.

```
adapter API (primitives)
      ↓  called once per store
  *.store.ts  (injectable service)
      ↓  inject()
  *.component.ts  (reads signals, calls store methods)
```

This keeps components clean and keeps all state-management wiring in one testable place.

---

##### Full production example — Cart feature

Below is a realistic production structure. Each file is a separate module.

**File tree:**
```
src/
  app/
    app.config.ts             ← kernel setup, DI token
  core/
    state/
      ng-adapter.ts           ← adapter instance (created once)
  features/
    cart/
      cart.domain.ts          ← atom, commands, events, handlers, appliers
      cart.store.ts           ← injectable store (kernel wiring lives here)
      cart-summary.component.ts
      cart-item-list.component.ts
      cart.routes.ts
```

---

**`src/app/app.config.ts`** — kernel setup, DI token, provider

```ts
import { ApplicationConfig, InjectionToken } from '@angular/core';
import { createKernel }                       from '@vi/state-fp/kernel';
import type { Kernel }                        from '@vi/state-fp/kernel';
import { cartDomain }                         from '../features/cart/cart.domain';

// Single kernel instance for the whole app.
// Exported so other features can register their own atoms against the same kernel.
export const kernel = createKernel();

// Register the cart feature
kernel.register(cartDomain.atom, cartDomain.handler, cartDomain.applier);
kernel.registerQuery(cartDomain.atom, cartDomain.queryHandler);

// DI token — keeps the kernel out of the global scope while making it injectable
export const KERNEL = new InjectionToken<Kernel>('vi/kernel', {
  providedIn: 'root',
  factory:    () => kernel,
});

export const appConfig: ApplicationConfig = {
  providers: [
    // nothing extra needed — KERNEL is providedIn root
  ],
};
```

---

**`src/core/state/ng-adapter.ts`** — adapter instance (created once, imported everywhere)

```ts
import { signal, inject, DestroyRef } from '@angular/core';
import { createAngularAdapter }       from '@vi/state-fp/adapter';

// Created once. Import `ngAdapter` in every store that needs it.
// No Angular runtime is imported by @vi/state-fp itself — this file
// is the only place where the framework meets the library.
export const ngAdapter = createAngularAdapter({ signal, inject, DestroyRef });
```

---

**`src/features/cart/cart.domain.ts`** — pure domain model, zero Angular dependency

```ts
import {
  defineAtom,
  command, domainEvent,
  createCommandHandler, createEventApplier,
  query, createQueryHandler,
} from '@vi/state-fp/kernel';

// ── State shape ───────────────────────────────────────────────────────────────
export interface CartItem  { sku: string; name: string; qty: number; price: number }
export interface CartState { items: CartItem[]; coupon: string | null; isCheckingOut: boolean }

const initial: CartState = { items: [], coupon: null, isCheckingOut: false };

// ── Atom ──────────────────────────────────────────────────────────────────────
export const cartAtom = defineAtom<CartState>({ key: 'cart', initialState: initial });

// ── Command factories ─────────────────────────────────────────────────────────
export const AddItem      = (item: CartItem)   => command('cart/addItem',      { item });
export const RemoveItem   = (sku: string)      => command('cart/removeItem',   { sku });
export const ApplyCoupon  = (code: string)     => command('cart/applyCoupon',  { code });
export const StartCheckout = ()                => command('cart/startCheckout', {});
export const CancelCheckout = ()               => command('cart/cancelCheckout', {});

// ── Domain events ─────────────────────────────────────────────────────────────
const itemAdded      = (item: CartItem)  => domainEvent('cart/itemAdded',      { item });
const itemRemoved    = (sku: string)     => domainEvent('cart/itemRemoved',    { sku });
const couponApplied  = (code: string)   => domainEvent('cart/couponApplied',  { code });
const checkoutStarted  = ()             => domainEvent('cart/checkoutStarted',  {});
const checkoutCancelled = ()            => domainEvent('cart/checkoutCancelled', {});

// ── Command handlers ──────────────────────────────────────────────────────────
const addItemHandler = createCommandHandler<CartState, ReturnType<typeof AddItem>>({
  commandType: 'cart/addItem',
  validate: (state, cmd) => {
    if (state.isCheckingOut) return { code: 'CHECKOUT_ACTIVE', message: 'Cannot add items during checkout' };
    if (cmd.payload.item.qty <= 0) return { code: 'INVALID_QTY', message: 'Quantity must be > 0' };
    return undefined;
  },
  handle: (_state, cmd) => [itemAdded(cmd.payload.item)],
});

const removeItemHandler = createCommandHandler<CartState, ReturnType<typeof RemoveItem>>({
  commandType: 'cart/removeItem',
  handle: (_state, cmd) => [itemRemoved(cmd.payload.sku)],
});

const applyCouponHandler = createCommandHandler<CartState, ReturnType<typeof ApplyCoupon>>({
  commandType: 'cart/applyCoupon',
  validate: (state, cmd) => {
    if (state.coupon) return { code: 'COUPON_ALREADY_APPLIED', message: 'A coupon is already applied' };
    if (!cmd.payload.code.trim()) return { code: 'INVALID_CODE', message: 'Coupon code cannot be empty' };
    return undefined;
  },
  handle: (_state, cmd) => [couponApplied(cmd.payload.code)],
});

const startCheckoutHandler = createCommandHandler<CartState, ReturnType<typeof StartCheckout>>({
  commandType: 'cart/startCheckout',
  validate: (state) => state.items.length === 0
    ? { code: 'EMPTY_CART', message: 'Cannot check out an empty cart' }
    : undefined,
  handle: () => [checkoutStarted()],
});

const cancelCheckoutHandler = createCommandHandler<CartState, ReturnType<typeof CancelCheckout>>({
  commandType: 'cart/cancelCheckout',
  handle: () => [checkoutCancelled()],
});

// ── Event applier (single applier handles all events for this atom) ────────────
const cartApplier = createEventApplier<CartState>({
  'cart/itemAdded': (s, e) => ({
    ...s,
    items: [...s.items, e.payload.item],
  }),
  'cart/itemRemoved': (s, e) => ({
    ...s,
    items: s.items.filter(i => i.sku !== e.payload.sku),
  }),
  'cart/couponApplied': (s, e) => ({ ...s, coupon: e.payload.code }),
  'cart/checkoutStarted':   (s) => ({ ...s, isCheckingOut: true }),
  'cart/checkoutCancelled': (s) => ({ ...s, isCheckingOut: false }),
});

// ── Query handler ─────────────────────────────────────────────────────────────
export const CartTotal    = () => query('cart/total');
export const CartItemCount = () => query('cart/itemCount');

const cartQueryHandler = createQueryHandler<CartState>({
  'cart/total':     (s) => s.items.reduce((sum, i) => sum + i.price * i.qty, 0),
  'cart/itemCount': (s) => s.items.reduce((sum, i) => sum + i.qty, 0),
});

// ── Exported domain bundle (consumed only by app.config.ts) ───────────────────
export const cartDomain = {
  atom:         cartAtom,
  handler:      [addItemHandler, removeItemHandler, applyCouponHandler, startCheckoutHandler, cancelCheckoutHandler],
  applier:      cartApplier,
  queryHandler: cartQueryHandler,
} as const;
```

---

**`src/features/cart/cart.store.ts`** — injectable store, the only file that touches the adapter API

```ts
import { Injectable, inject }         from '@angular/core';
import { isLeft }                      from '@vi/state-fp/core';
import { KERNEL }                      from '../../app/app.config';
import { ngAdapter }                   from '../../core/state/ng-adapter';
import {
  cartAtom, CartTotal, CartItemCount,
  AddItem, RemoveItem, ApplyCoupon, StartCheckout, CancelCheckout,
} from './cart.domain';
import type { CartItem }               from './cart.domain';

/**
 * CartStore — single point of truth for cart state in the UI layer.
 *
 * Components inject this service and consume its signals.
 * Nothing else in the UI layer knows about atoms, kernels, or the adapter.
 */
@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly kernel = inject(KERNEL);

  // ── Public signals (read-only to consumers) ─────────────────────────────────

  /** Full cart state — items, coupon, isCheckingOut */
  readonly cart       = ngAdapter.toSignal(cartAtom, this.kernel);

  /** Total price, re-derived on every cart change */
  readonly total      = ngAdapter.toQuerySignal(cartAtom, this.kernel,
    (s) => s.items.reduce((sum, i) => sum + i.price * i.qty, 0),
  );

  /** Total item count, re-derived on every cart change */
  readonly itemCount  = ngAdapter.toQuerySignal(cartAtom, this.kernel,
    (s) => s.items.reduce((sum, i) => sum + i.qty, 0),
  );

  /** True when checkout is in progress — drives UI disabled states */
  readonly isCheckingOut = ngAdapter.toQuerySignal(cartAtom, this.kernel,
    (s) => s.isCheckingOut,
  );

  // ── Private dispatch (stable, no injection context needed) ──────────────────
  private readonly dispatch = ngAdapter.commandDispatcher(cartAtom, this.kernel);

  // ── Public command methods ───────────────────────────────────────────────────

  addItem(item: CartItem): string | null {
    const result = this.dispatch(AddItem(item));
    return isLeft(result) ? result.left.message : null;
  }

  removeItem(sku: string): void {
    this.dispatch(RemoveItem(sku));  // remove never fails
  }

  applyCoupon(code: string): string | null {
    const result = this.dispatch(ApplyCoupon(code));
    return isLeft(result) ? result.left.message : null;
  }

  startCheckout(): string | null {
    const result = this.dispatch(StartCheckout());
    return isLeft(result) ? result.left.message : null;
  }

  cancelCheckout(): void {
    this.dispatch(CancelCheckout());
  }
}
```

> **Key point:** after this file, neither Angular, the kernel, nor the adapter is
> mentioned anywhere in the UI layer. Components speak only `CartStore`.

---

**`src/features/cart/cart-summary.component.ts`** — component is just signals + store methods

```ts
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe }                                from '@angular/common';
import { CartStore }                                   from './cart.store';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cart-summary">
      <h2>Cart ({{ store.itemCount() }} items)</h2>

      <p class="total">Total: {{ store.total() | currency }}</p>

      @if (store.cart().coupon) {
        <p class="coupon">Coupon applied: {{ store.cart().coupon }}</p>
      }

      <button
        (click)="onCheckout()"
        [disabled]="store.isCheckingOut() || store.itemCount() === 0">
        {{ store.isCheckingOut() ? 'Processing…' : 'Checkout' }}
      </button>

      @if (errorMsg) {
        <p class="error" role="alert">{{ errorMsg }}</p>
      }
    </section>
  `,
})
export class CartSummaryComponent {
  readonly store = inject(CartStore);
  errorMsg: string | null = null;

  onCheckout(): void {
    this.errorMsg = this.store.startCheckout();
  }
}
```

---

**`src/features/cart/cart-item-list.component.ts`** — list component, zero state logic

```ts
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe }                                from '@angular/common';
import { CartStore }                                   from './cart.store';
import type { CartItem }                               from './cart.domain';

@Component({
  selector: 'app-cart-item-list',
  standalone: true,
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="cart-items">
      @for (item of store.cart().items; track item.sku) {
        <li>
          <span>{{ item.name }} × {{ item.qty }}</span>
          <span>{{ item.price * item.qty | currency }}</span>
          <button
            (click)="onRemove(item)"
            [disabled]="store.isCheckingOut()">
            Remove
          </button>
        </li>
      } @empty {
        <li class="empty">Your cart is empty.</li>
      }
    </ul>
  `,
})
export class CartItemListComponent {
  readonly store = inject(CartStore);

  onRemove(item: CartItem): void {
    this.store.removeItem(item.sku);
  }
}
```

---

**`src/features/cart/cart.routes.ts`** — lazy route

```ts
import { Routes } from '@angular/router';

export const CART_ROUTES: Routes = [
  {
    path: 'cart',
    loadComponent: () =>
      import('./cart-summary.component').then(m => m.CartSummaryComponent),
  },
];
```

---

##### What component files never contain

| Concern | Lives in | Not in component |
|---|---|---|
| Atom definition | `cart.domain.ts` | ✅ |
| Command factories | `cart.domain.ts` | ✅ |
| Kernel reference | `cart.store.ts` | ✅ |
| Adapter API calls | `cart.store.ts` | ✅ |
| Error classification (`isLeft`) | `cart.store.ts` | ✅ |
| Signal creation | `cart.store.ts` | ✅ |
| Lifecycle / unsubscribe | handled by `DestroyRef` inside adapter | ✅ |

Components only ever call `inject(SomeStore)` and read `.someSignal()` or call `.someMethod()`.
That is **identical** to how you would structure an NgRx facade — the adapter does not add a new mental model.

---

##### Why no `ngOnDestroy`?

`toSignal` and `toQuerySignal` call `inject(DestroyRef)` internally and register
the unsubscribe callback via `destroyRef.onDestroy()`. Angular fires these
when the service or component leaves the DI tree. If the store is
`providedIn: 'root'`, it lives for the app lifetime — cleanup runs on app
teardown. If scoped to a component or route, cleanup runs when that scope is destroyed.

---

##### Testing without `@angular/core`

The store is a plain class with injected dependencies — you can test it without TestBed:

```ts
// cart.store.spec.ts — no TestBed, no Angular module
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartStore }                             from './cart.store';
import { cartAtom, AddItem, CartTotal }          from './cart.domain';
import { createKernel }                          from '@vi/state-fp/kernel';
import { cartDomain }                            from './cart.domain';

// Minimal signal mock — same shape as Angular's WritableSignal
function mockSignal<T>(v: T) {
  let _val = v;
  const s = () => _val;
  s.set = (x: T) => { _val = x; };
  return s;
}

const mockDestroyRef = { onDestroy: vi.fn() };

describe('CartStore', () => {
  let store: CartStore;

  beforeEach(() => {
    // Real kernel, real domain — only Angular is mocked
    const kernel = createKernel();
    kernel.register(cartDomain.atom, cartDomain.handler, cartDomain.applier);
    kernel.registerQuery(cartDomain.atom, cartDomain.queryHandler);

    const { createAngularAdapter } = await import('@vi/state-fp/adapter');
    const adapter = createAngularAdapter({
      signal:     mockSignal,
      inject:     (_token: unknown) => mockDestroyRef,
      DestroyRef: {},
    });

    // Manually construct the store (bypass Angular DI)
    store = Object.create(CartStore.prototype);
    Object.defineProperty(store, 'kernel', { value: kernel });
    // Re-run field initialisers against the real adapter
    store['cart']          = adapter.toSignal(cartAtom, kernel);
    store['total']         = adapter.toQuerySignal(cartAtom, kernel, s => s.items.reduce((sum, i) => sum + i.price * i.qty, 0));
    store['itemCount']     = adapter.toQuerySignal(cartAtom, kernel, s => s.items.reduce((sum, i) => sum + i.qty, 0));
    store['isCheckingOut'] = adapter.toQuerySignal(cartAtom, kernel, s => s.isCheckingOut);
    store['dispatch']      = adapter.commandDispatcher(cartAtom, kernel);
  });

  it('starts with an empty cart', () => {
    expect(store.itemCount()).toBe(0);
    expect(store.total()).toBe(0);
  });

  it('addItem updates signals', () => {
    store.addItem({ sku: 'A1', name: 'Widget', qty: 2, price: 9.99 });
    expect(store.itemCount()).toBe(2);
    expect(store.total()).toBeCloseTo(19.98);
  });

  it('addItem returns error message on validation failure', () => {
    const err = store.addItem({ sku: 'A1', name: 'Widget', qty: -1, price: 9.99 });
    expect(err).toMatch(/quantity/i);
    expect(store.itemCount()).toBe(0);
  });

  it('startCheckout fails on empty cart', () => {
    const err = store.startCheckout();
    expect(err).toMatch(/empty cart/i);
  });

  it('startCheckout succeeds and sets isCheckingOut', () => {
    store.addItem({ sku: 'A1', name: 'Widget', qty: 1, price: 5 });
    const err = store.startCheckout();
    expect(err).toBeNull();
    expect(store.isCheckingOut()).toBe(true);
  });
});
```

---

#### 5.6c Lit (Reactive Controllers)

**Sequence diagram:** `docs/fig/14-sequence-lit-adapter.puml`

Lit controllers implement the `ReactiveController` interface structurally — no compile-time `lit` import in the library. Place them in field initialisers; Lit calls `hostConnected` and `hostDisconnected` automatically.

**`createLitController(host, kernel, atom)`** — tracks atom state:

```ts
import { LitElement, html }    from 'lit';
import { customElement }        from 'lit/decorators.js';
import { createLitController } from '@vi/state-fp/adapter';

@customElement('counter-button')
class CounterButton extends LitElement {
  // Registered via host.addController() in the factory.
  // Lit calls hostConnected() on DOM attach and hostDisconnected() on removal.
  private counter = createLitController(this, kernel, counterAtom);

  render() {
    const { count } = this.counter.state;  // current atom state
    return html`
      <button @click=${() => this.counter.dispatch(IncrementBy(1))}>
        Count: ${count}
      </button>
    `;
  }

  // Synchronous derived value — no subscription needed
  get total() {
    return this.counter.query(BuildTotal());
  }
}
```

**`createLitStreamController(host, stream, animated?)`** — tracks an `EphemeralStream`:

```ts
import { createLitStreamController } from '@vi/state-fp/adapter';

@customElement('mouse-tracker')
class MouseTracker extends LitElement {
  // animated=true (default): subscribeAnimated — RAF-batched 60 fps
  // animated=false           : subscribe        — synchronous every emit
  private mouse = createLitStreamController(this, mousePosStream);

  render() {
    const pos = this.mouse.value;  // undefined before first emit
    return html`<div>Mouse: ${pos?.x ?? '-'},${pos?.y ?? '-'}</div>`;
  }
}
```

**Controller API:**

| Property / Method | Type | Description |
|---|---|---|
| `controller.state` | `S` | Current atom state; updated by `kernel.subscribe` |
| `controller.dispatch(cmd)` | `Either<CommandError, S>` | Executes command via kernel |
| `controller.query(q)` | `R` | Synchronous derived value |
| `streamCtrl.value` | `T \| undefined` | Last emitted stream value |

**Testing without a real LitElement:**

```ts
// Unit test — plain mock object, no custom element registration
const mockHost = {
  addController:  vi.fn(),
  requestUpdate:  vi.fn(),
};
const ctrl = createLitController(mockHost, kernel, counterAtom);
ctrl.hostConnected();
// atom state changes → expect(mockHost.requestUpdate).toHaveBeenCalled()
```

---

#### 5.6d Vanilla JS / TypeScript

`createAdapter(kernel)` — returns a `VanillaAdapter`. No framework required.

```ts
import { createAdapter } from '@vi/state-fp/adapter';

const app = createAdapter(kernel);

// Watch: subscribe to state changes
const off = app.watch(counterAtom, (state) => {
  document.getElementById('count')!.textContent = String(state.count);
});

// Run: execute a command
app.run(counterAtom, IncrementBy(3));

// Read: query state synchronously
const total = app.read(cartAtom, GetTotal());

// Snapshot: raw current state without a query
const raw = app.snapshot(counterAtom);

// Unsubscribe individual listener
off();

// Destroy all listeners
app.destroy();
```

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
  private adapter = createAngularAdapter({ signal, inject, DestroyRef });

  readonly itemCount = this.adapter.toQuerySignal(cartAtom, kernel, getItemCount);
  readonly total     = this.adapter.toQuerySignal(cartAtom, kernel, getTotal);
  readonly dispatch  = this.adapter.commandDispatcher(cartAtom, kernel);

  add() {
    const result = this.dispatch(addItem({ sku: 'DEMO-1', name: 'Demo Item', price: 9.99, qty: 1 }));
    if (isLeft(result)) console.error(result.left.message);
  }
}
```

---

## 7. Write Path Walkthrough

Tracing `kernel.execute(cartAtom, addItem({ sku: 'SKU-1', name: 'Item', price: 9.99, qty: 1 }))` step by step through `kernel.ts`:

```
1. Stamp command metadata
   │ fullCmd.meta = {
   │   correlationId: cmd.meta?.correlationId ?? uuid(),
   │   timestamp:     cmd.meta?.timestamp     ?? now(),
   │   issuedBy:      options.instanceId (if set),
   │ }
   │ Guard: if atom is a ComputedAtom → return Left({ code: 'COMPUTED_ATOM' })
   │
2. commandBus.execute(atomKey, currentState, fullCmd)
   │   → dispatches to registered CommandHandler by type
   │   → Left(CommandError): plugins.onError() + debugLayer.record() → return Left
   │   → Right(DomainEvent[]): continue
   │
3. applyEvents(atom, rawEvents, correlationId, causationId)
   │   For each event:
   │     a. stampEvent(): assign id, correlationId, causationId, atomKey, version
   │     b. applierMap.get("atomKey::*")(state, stampedEvent) → nextState
   │
4. atom._setState(nextState)   ← in-memory update
   │
4.5 recomputeDependents(atomKey) [PHASE 2.5]
   │   For each ComputedAtom that depends on atomKey:
   │     a. collect depStates: computed.definition.deps.map(d => d.get())
   │     b. prevValue = computed.get()
   │     c. nextValue = computed.definition.compute(depStates)
   │     d. if !Object.is(prevValue, nextValue):
   │           computed._setComputed(nextValue)
   │           → computed atom subscribers notified
   │   This runs synchronously, before storage write or subscriber notification
   │   for the originating atom.
   │
5. writeToStorage(atom, newState)   [fire-and-forget — non-blocking]
   │   if !storageConfig → skip
   │   if security === 'memory-only' → skip
   │   storageConfig.adapter.set(key, state, ttl)
   │   .catch(err → plugins.onError({ code: 'STORAGE_WRITE_ERROR', ... }))
   │
6. eventBus.emit(stampedEvents)   [for SyncEngine subscribers + onEvent listeners]
   │
7. plugins.forEach(p => p.onExecute?.(params))
   │   params: { command, events, prevState, nextState, atomKey, durationMs }
   │   This is where createDevTools().plugin records DebugEntry objects
   │   into the EventLog.
   │
8. if debugLayer.isEnabled:
   │   debugLayer.record({
   │     commandType, correlationId, atomKey, events,
   │     prevState: sanitize(atomKey, currentState),   ← stateSanitizer applied
   │     nextState: sanitize(atomKey, newState),       ← stateSanitizer applied
   │     durationMs, timestamp,
   │   })
   │
9. Return Right(newState)
```

**Concurrency notes:**

- **Step 4 is synchronous.** `atom._setState()` happens before step 5 returns. Subscribers
  that read from `atom.get()` inside their callbacks will see the latest state.
- **Step 4.5 is synchronous.** Computed atoms are updated before subscribers of the source
  atom are called. When a source atom subscriber fires, computed atoms derived from it
  are already reflecting the new value.
- **Step 5 is async but detached.** `execute()` returns before the storage write resolves.
  Storage errors are routed to `plugins.onError()` — they never throw into `execute()`.
- **Steps 6 and 7 are both synchronous.** Event bus subscribers and plugin `onExecute`
  hooks run before `execute()` returns `Right(newState)`.

**What `execute()` does NOT do:**

- Does NOT handle AbortSignal — use `executeAsync()` for cancellable operations
- Does NOT apply `optimisticApplier` — use `executeOptimistic()` for optimistic updates
- Does NOT dispatch a rollback command — use `executeOptimistic()` with `onRollback`

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
- Queries NEVER cause side effects
- Queries complete in O(state) time — no external I/O

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

describe('Cart integration', () => {
  let kernel: Kernel;

  beforeEach(() => {
    // createKernel() with no options uses noopDebug — zero overhead in tests
    kernel = createKernel();
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

The correct pattern is to create a `DevToolsInstance` and wire it in via `kernel.use()`.
The `eventLog.getAll()` method returns all `DebugEntry` objects (one per DomainEvent emitted):

```ts
import { createKernel } from '@vi/state-fp/kernel';
import { createDevTools } from '@vi/state-fp/devtools';

it('records DebugEntry on execute', () => {
  const devtools = createDevTools({ installBridge: false }); // no window bridge in tests
  const kernel   = createKernel({ debug: true });
  kernel.use(devtools.plugin);                               // wire devtools in
  kernel.register(cartAtom, addItemHandler, cartApplier);

  kernel.execute(cartAtom, addItem({ sku: 'X', name: 'X', price: 5, qty: 1 }));

  const entries = devtools.eventLog.getByAtom('vi/cart');
  expect(entries).toHaveLength(1);
  expect(entries[0].commandType).toBe('cart/addItem');
  expect(entries[0].stateAfter).toMatchObject({ items: [{ sku: 'X' }] });
});

it('stateSanitizer redacts sensitive fields in DevTools', () => {
  const devtools = createDevTools({ installBridge: false });
  const kernel   = createKernel({
    debug: true,
    stateSanitizer: (key, state) =>
      key === 'vi/auth' ? { ...state as AuthState, token: '[REDACTED]' } : state,
  });
  kernel.use(devtools.plugin);
  kernel.register(authAtom, loginHandler, authApplier);

  kernel.execute(authAtom, login({ username: 'alice', token: 'eyJhbGci...' }));

  const [entry] = devtools.eventLog.getByAtom('vi/auth');
  // stateAfter in the event log has the token redacted
  expect((entry.stateAfter as AuthState).token).toBe('[REDACTED]');
  // But the real in-memory state is intact
  expect(authAtom.get().token).toBe('eyJhbGci...');
});
```

### Testing async commands

```ts
import { createKernel, defineAtom } from '@vi/state-fp/kernel';
import { right, left, isRight, isLeft } from '@vi/state-fp/core';

it('executeAsync falls back to synchronous execute if no async handler registered', async () => {
  const kernel = createKernel();
  kernel.register(counterAtom, incrementHandler, counterApplier);

  const result = await kernel.executeAsync(counterAtom, increment(5));
  expect(isRight(result)).toBe(true);
  expect(counterAtom.get().count).toBe(5);
});

it('executeAsync respects AbortSignal', async () => {
  const kernel     = createKernel();
  const controller = new AbortController();
  kernel.registerAsync(counterAtom, slowIncrementHandler, counterApplier);

  controller.abort();   // abort before execute starts
  const result = await kernel.executeAsync(counterAtom, increment(5), {
    signal: controller.signal,
  });

  expect(isLeft(result)).toBe(true);
  expect(result.left.code).toBe('CANCELLED');
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

### D8: Why there is no EncryptedAdapter

**Rejected alternative:** `EncryptedAdapter` — an AES-GCM wrapper over any `StorageAdapter`
that derives a key via PBKDF2 from a caller-provided secret.

**Reason client-side encryption was removed:**

1. **The encryption key must arrive as plaintext JavaScript.** No matter how the key is derived
   (server nonce, session token, PBKDF2), it must arrive in the JavaScript runtime as a plain
   string at some point. A DevTools breakpoint on the `secretProvider()` call exposes it before
   it reaches `crypto.subtle`.

2. **Post-decryption plaintext lives in the JS heap.** After `crypto.subtle.decrypt()` resolves,
   the decrypted value lives in a JavaScript ArrayBuffer or string. The Memory profiler in Chrome
   DevTools can capture live heap snapshots that include it.

3. **Attackers can replay the decryption.** The IV and ciphertext are stored in `localStorage`
   alongside the ciphertext. Anyone who steals the key (see step 1) can call
   `crypto.subtle.decrypt()` directly in the DevTools console.

4. **Redux, NgRx, MobX, and Zustand all reached the same conclusion.** None of them offer
   client-side storage encryption. All of them recommend `stateSanitizer` + `memory-only` for
   sensitive data.

**What to use instead:**

- `stateSanitizer` on `KernelOptions` — redacts sensitive fields before DevTools recording.
  The real in-memory state is never modified. See Section 5.3c.
- `memory-only` storage policy — for data that must never survive a page reload (auth tokens,
  credentials, one-time session data).
- Server-side data management — for HIPAA/GDPR regulated data, do not persist client-side at
  all. Surface the data in a `memory-only` atom for the current session and refetch on re-auth.

---

*This guide is a living document. When you make a design decision, add it to Section 10.*  
*When you encounter a concept that needed more explanation, improve the relevant section.*
