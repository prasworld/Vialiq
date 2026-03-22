# Functional Primitives

> Part of `@vi/state-fp` — design reference for the FP primitive layer.

---

## Overview

The functional primitive layer provides the mathematical building blocks
that power `@vi/state-fp`. Every primitive is:

- **Pure** — no side effects, same input always produces same output
- **Composable** — primitives combine through standard Functor/Monad laws
- **Zero-dependency** — implemented directly in TypeScript, no libraries
- **Tree-shakeable** — each type lives in its own module

---

## 1. Maybe — Safe Null Handling

### Motivation

TypeScript's `T | null | undefined` is a compile-time construct. Forgotten
null checks still produce runtime crashes. `Maybe<A>` encodes the
presence-or-absence of a value at the _type level_, forcing callers to
handle the empty case.

### Type Definition

```ts
export type Nothing = { readonly _tag: 'Nothing' };
export type Just<A> = { readonly _tag: 'Just'; readonly value: A };
export type Maybe<A> = Nothing | Just<A>;
```

### Constructors

```ts
export const nothing = <A = never>(): Maybe<A> => ({ _tag: 'Nothing' });
export const just    = <A>(a: A): Maybe<A> => ({ _tag: 'Just', value: a });

// Lift a nullable value into Maybe
export const fromNullable = <A>(a: A | null | undefined): Maybe<A> =>
  a == null ? nothing() : just(a);

// Lift a potentially-throwing expression
export const tryCatch = <A>(f: () => A): Maybe<A> => {
  try {
    return just(f());
  } catch {
    return nothing();
  }
};
```

### Functor (map)

Applies a function to the value inside Just, passes through Nothing.

```ts
export const mapMaybe =
  <A, B>(f: (a: A) => B) =>
  (m: Maybe<A>): Maybe<B> =>
    m._tag === 'Nothing' ? nothing() : just(f(m.value));
```

### Applicative (ap)

Applies a wrapped function to a wrapped value.

```ts
export const apMaybe =
  <A, B>(mf: Maybe<(a: A) => B>) =>
  (ma: Maybe<A>): Maybe<B> =>
    mf._tag === 'Nothing' ? nothing() : mapMaybe(mf.value)(ma);
```

### Monad (flatMap / chain)

Sequences Maybe computations — if any step is Nothing, the whole chain
short-circuits.

```ts
export const chainMaybe =
  <A, B>(f: (a: A) => Maybe<B>) =>
  (m: Maybe<A>): Maybe<B> =>
    m._tag === 'Nothing' ? nothing() : f(m.value);

// Alias
export const flatMapMaybe = chainMaybe;
```

### Pattern Matching (fold)

```ts
export const foldMaybe =
  <A, B>(onNothing: () => B, onJust: (a: A) => B) =>
  (m: Maybe<A>): B =>
    m._tag === 'Nothing' ? onNothing() : onJust(m.value);
```

### Utility Functions

```ts
// Get value or default
export const getOrElseMaybe =
  <A>(defaultValue: A) =>
  (m: Maybe<A>): A =>
    m._tag === 'Nothing' ? defaultValue : m.value;

// Type guard
export const isNothing = <A>(m: Maybe<A>): m is Nothing => m._tag === 'Nothing';
export const isJust    = <A>(m: Maybe<A>): m is Just<A> => m._tag === 'Just';

// Convert to Either
export const toEither =
  <E, A>(onNothing: () => E) =>
  (m: Maybe<A>): Either<E, A> =>
    m._tag === 'Nothing' ? left(onNothing()) : right(m.value);
```

### Usage in @vi/state-fp

| Location | Usage |
|---|---|
| `atom.get()` | Returns `Maybe<S>` — Nothing before first hydration |
| `StorageAdapter.get()` | Returns `Maybe<T>` — Nothing on cache miss |
| `eventLog.last()` | Returns `Maybe<DebugEntry>` — Nothing if log empty |

### Laws Verified

| Law | Description |
|---|---|
| **Left identity** | `chainMaybe(f)(just(a)) ≡ f(a)` |
| **Right identity** | `chainMaybe(just)(m) ≡ m` |
| **Associativity** | `chainMaybe(g)(chainMaybe(f)(m)) ≡ chainMaybe(x => chainMaybe(g)(f(x)))(m)` |
| **Functor identity** | `mapMaybe(x => x)(m) ≡ m` |
| **Functor composition** | `mapMaybe(g ∘ f)(m) ≡ mapMaybe(g)(mapMaybe(f)(m))` |

---

## 2. Either — Typed Error Handling

### Motivation

`Either<E, A>` captures a computation that can succeed with `A` or fail
with `E`. Unlike throwing exceptions, errors are part of the return type —
the compiler enforces handling both branches.

### Type Definition

```ts
export type Left<E>  = { readonly _tag: 'Left';  readonly left: E };
export type Right<A> = { readonly _tag: 'Right'; readonly right: A };
export type Either<E, A> = Left<E> | Right<A>;
```

### Constructors

```ts
export const left  = <E, A = never>(e: E): Either<E, A> => ({ _tag: 'Left',  left: e });
export const right = <E = never, A = unknown>(a: A): Either<E, A> => ({ _tag: 'Right', right: a });

export const fromNullable =
  <E, A>(onNull: () => E) =>
  (a: A | null | undefined): Either<E, A> =>
    a == null ? left(onNull()) : right(a);

export const tryCatch =
  <E, A>(f: () => A, onError: (e: unknown) => E): Either<E, A> => {
    try {
      return right(f());
    } catch (e) {
      return left(onError(e));
    }
  };
```

### Functor (map) — maps over the Right

```ts
export const mapEither =
  <E, A, B>(f: (a: A) => B) =>
  (e: Either<E, A>): Either<E, B> =>
    e._tag === 'Left' ? e : right(f(e.right));
```

### Bifunctor (bimap)

```ts
export const bimapEither =
  <E1, E2, A, B>(onLeft: (e: E1) => E2, onRight: (a: A) => B) =>
  (e: Either<E1, A>): Either<E2, B> =>
    e._tag === 'Left' ? left(onLeft(e.left)) : right(onRight(e.right));

// Map only the error
export const mapLeftEither =
  <E1, E2>(f: (e: E1) => E2) =>
  <A>(e: Either<E1, A>): Either<E2, A> =>
    e._tag === 'Right' ? e : left(f(e.left));
```

### Monad (chain)

```ts
export const chainEither =
  <E, A, B>(f: (a: A) => Either<E, B>) =>
  (e: Either<E, A>): Either<E, B> =>
    e._tag === 'Left' ? e : f(e.right);

export const flatMapEither = chainEither;
```

### Pattern Matching

```ts
export const foldEither =
  <E, A, B>(onLeft: (e: E) => B, onRight: (a: A) => B) =>
  (e: Either<E, A>): B =>
    e._tag === 'Left' ? onLeft(e.left) : onRight(e.right);
```

### Type Guards

```ts
export const isLeft  = <E, A>(e: Either<E, A>): e is Left<E>  => e._tag === 'Left';
export const isRight = <E, A>(e: Either<E, A>): e is Right<A> => e._tag === 'Right';
```

### Sequence (traverse array)

When the entire array must succeed or the whole operation fails:

```ts
export const sequenceEitherArray =
  <E, A>(arr: ReadonlyArray<Either<E, A>>): Either<E, ReadonlyArray<A>> => {
    const result: A[] = [];
    for (const item of arr) {
      if (item._tag === 'Left') return item;
      result.push(item.right);
    }
    return right(result);
  };
```

### Usage in @vi/state-fp

| Location | Usage |
|---|---|
| `kernel.execute()` | Returns `Result<CommandError, S>` (= `Either<CommandError, S>`) — both success and typed failure paths |
| `CommandHandler.handle()` | Returns `Result<CommandError, DomainEvent[]>` |
| `StorageAdapter.set/get/delete` | Returns `Promise<Either<StorageError, T>>` |

> **Idiomatic aliases:** When writing command handlers, prefer `ok`, `err`, `isOk`, `isErr`, and `match` (all exported from `@vi/state-fp/kernel` and `@vi/state-fp/core`). These are exact aliases for `right`, `left`, `isRight`, `isLeft`, and a convenience for `foldEither` — no FP background required to read the code.

---

## 3. IO — Deferred Side Effects

### Motivation

An `IO<A>` is a thunk that, when `.run()` is called, produces a value `A`
via a side effect. By wrapping side effects in `IO`, we keep the functional
core pure and push all execution to the boundary.

### Type Definition

```ts
export type IO<A> = { readonly run: () => A };
```

### Constructors

```ts
export const io     = <A>(f: () => A): IO<A> => ({ run: f });
export const liftIO = <A>(a: A): IO<A> => io(() => a);
```

### Functor (map)

```ts
export const mapIO =
  <A, B>(f: (a: A) => B) =>
  (ia: IO<A>): IO<B> => io(() => f(ia.run()));
```

### Monad (chain)

```ts
export const chainIO =
  <A, B>(f: (a: A) => IO<B>) =>
  (ia: IO<A>): IO<B> => io(() => f(ia.run()).run());
```

### Sequencing (run multiple effects in order)

```ts
export const sequenceIO =
  <A>(effects: ReadonlyArray<IO<A>>): IO<ReadonlyArray<A>> =>
    io(() => effects.map(e => e.run()));
```

### IORef — Mutable Cell with IO Wrapper

Provides a controlled mutation point that integrates with the IO typeclass:

```ts
export type IORef<A> = {
  read:  IO<A>;
  write: (a: A) => IO<void>;
  modify:(f: (a: A) => A) => IO<void>;
};

export const newIORef = <A>(initial: A): IORef<A> => {
  let current = initial;
  return {
    read:   io(() => current),
    write:  (a) => io(() => { current = a; }),
    modify: (f) => io(() => { current = f(current); }),
  };
};
```

### Usage in @vi/state-fp

| Location | Usage |
|---|---|
| Execute pipeline | Storage writes in `kernel.execute()` are wrapped in `IO` — deferred until after state update |
| Subscriber notification | `notifySubscribers()` returns `IO<void>` — execution boundary is explicit |
| `DevTools.record()` | Records debug entry as a deferred `IO` — never on the hot synchronous path |

---

## 4. Lens — Immutable Nested Updates

### Motivation

Deeply nested state updates like
`{ ...s, user: { ...s.user, address: { ...s.user.address, city: 'NYC' } } }`
are verbose and error-prone. A `Lens<S, A>` encapsulates this pattern into a
composable, reusable accessor.

### Type Definition

```ts
export type Lens<S, A> = {
  readonly get: (s: S) => A;
  readonly set: (a: A) => (s: S) => S;
};
```

### Constructor

```ts
export const lens =
  <S, A>(get: (s: S) => A, set: (a: A) => (s: S) => S): Lens<S, A> =>
    ({ get, set });
```

### Derivation helpers

```ts
// Get and modify (apply a function to the focused value)
export const over =
  <S, A>(l: Lens<S, A>) =>
  (f: (a: A) => A) =>
  (s: S): S =>
    l.set(f(l.get(s)))(s);

// View (alias for readability)
export const view = <S, A>(l: Lens<S, A>) => (s: S): A => l.get(s);
```

### Composition

```ts
// Compose two lenses: outer zooms into A, inner zooms into B within A
export const composeLens =
  <S, A, B>(outer: Lens<S, A>, inner: Lens<A, B>): Lens<S, B> =>
    lens(
      (s) => inner.get(outer.get(s)),
      (b) => (s) => outer.set(inner.set(b)(outer.get(s)))(s),
    );
```

### Property Lens (generated from key)

```ts
export const prop =
  <S extends object, K extends keyof S>(key: K): Lens<S, S[K]> =>
    lens(
      (s) => s[key],
      (a) => (s) => ({ ...s, [key]: a }),
    );
```

### Usage Examples

```ts
type User = { name: string; address: { city: string; zip: string } };

const cityLens = composeLens(prop<User, 'address'>('address'), prop<User['address'], 'city'>('city'));

const user: User = { name: 'Alice', address: { city: 'Boston', zip: '02134' } };

view(cityLens)(user);                   // 'Boston'
cityLens.set('Seattle')(user);          // { name: 'Alice', address: { city: 'Seattle', zip: '02134' } }
over(cityLens)(c => c.toUpperCase())(user); // { ..., city: 'BOSTON' }
```

### Usage in @vi/state-fp

| Location | Usage |
|---|---|
| `EventApplier` helpers | `over(lens)(updateFn)` for precise immutable state changes within an applier |
| `QueryHandler.handle` | Focused read over atom state via composed lenses for nested projections |

---

## 5. Pipe and Compose

### pipe — Left-to-Right Composition

Applies a sequence of transformations left-to-right. Fully typed up to 10 arguments via overloads.

```ts
export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, ab: (a: A) => B): B;
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
// ...up to N overloads
export function pipe(a: unknown, ...fns: Array<(x: unknown) => unknown>): unknown {
  return fns.reduce((acc, fn) => fn(acc), a);
}
```

### compose — Right-to-Left Composition

```ts
export const compose =
  <A>(...fns: Array<(x: unknown) => unknown>) =>
  (a: A): unknown =>
    fns.reduceRight((acc, fn) => fn(acc), a as unknown);
```

### identity and constant

```ts
export const identity = <A>(a: A): A => a;
export const constant = <A>(a: A) => (_: unknown): A => a;
```

---

## 6. Monad Laws Verification Strategy

All monad instances (Maybe, Either, IO, Task, Reader, StateM) will be tested against the monad
laws using property-based tests powered by `fast-check`.

```ts
// Example: Maybe left identity
it('Maybe left identity', () => {
  fc.assert(fc.property(
    fc.integer(),
    fc.func(fc.option(fc.integer())),
    (a, f) => {
      const result1 = chainMaybe(x => fromNullable(f(x)))(just(a));
      const result2 = fromNullable(f(a));
      expect(result1).toEqual(result2);
    }
  ));
});
```

---

## 7. Task — Async IO Monad

### Motivation

`IO<A>` models synchronous effects. For asynchronous operations (HTTP calls, IndexedDB reads,
async command handlers), we need an async version. `Task<A>` is an `IO` whose `run()` returns
a `Promise<A>`.

Unlike raw `Promise`, a `Task<A>` is **lazy** — it does not start executing until `.run()` is
called. This makes side effects composable and testable without triggering them at definition time.

### Type Definition

```ts
export type Task<A> = { readonly run: () => Promise<A> };
```

### Constructors

```ts
export const task = <A>(f: () => Promise<A>): Task<A> => ({ run: f });

// Lift a plain value into a resolved Task
export const liftTask = <A>(a: A): Task<A> => task(() => Promise.resolve(a));

// Convert a Promise factory into a Task (captures the factory, not the promise)
export const taskFromPromise = <A>(factory: () => Promise<A>): Task<A> => task(factory);

// Convert an IO<A> into Task<A>
export const taskFromIO = <A>(io: IO<A>): Task<A> => task(() => Promise.resolve(io.run()));

// Task that resolves Either — for async operations that can fail
export const taskEither = <E, A>(
  f: () => Promise<Either<E, A>>,
): Task<Either<E, A>> => task(f);
```

### Functor (map)

```ts
export const mapTask =
  <A, B>(f: (a: A) => B) =>
  (ta: Task<A>): Task<B> =>
    task(() => ta.run().then(f));
```

### Monad (chain)

Sequences async operations — if the first fails, the rest is short-circuited:

```ts
export const chainTask =
  <A, B>(f: (a: A) => Task<B>) =>
  (ta: Task<A>): Task<B> =>
    task(() => ta.run().then(a => f(a).run()));

export const flatMapTask = chainTask;
```

### Parallel Execution

```ts
// Run all tasks concurrently, collect results (first error rejects all)
export const parallelTask =
  <A>(tasks: ReadonlyArray<Task<A>>): Task<ReadonlyArray<A>> =>
    task(() => Promise.all(tasks.map(t => t.run())));

// Run with concurrency limit
export const parallelBoundedTask =
  <A>(tasks: ReadonlyArray<Task<A>>, concurrency: number): Task<ReadonlyArray<A>> =>
    task(async () => {
      const results: A[] = [];
      for (let i = 0; i < tasks.length; i += concurrency) {
        const batch = tasks.slice(i, i + concurrency);
        results.push(...await Promise.all(batch.map(t => t.run())));
      }
      return results;
    });
```

### Usage in @vi/state-fp

| Location | Usage |
|---|---|
| `AsyncCommandHandler.handleAsync` | Returns `Task<Either<CommandError, DomainEvent[]>>` — async command pipeline |
| `StorageAdapter` methods | Internally use `Task` for type-safe async reads/writes |
| `kernel.hydrate()` | Wraps all hydration reads in `parallelTask` |
| `kernel.executeOptimistic` | Wraps the confirmation async call in `Task` for cancellation support |

### Laws Verified

| Law | Description |
|---|---|
| **Left identity** | `chainTask(f)(liftTask(a)) ≡ f(a)` |
| **Right identity** | `chainTask(liftTask)(t) ≡ t` (up to Promise equality) |
| **Associativity** | `chainTask(g)(chainTask(f)(t)) ≡ chainTask(x => chainTask(g)(f(x)))(t)` |

---

## 8. Reader — Dependency Injection Monad

### Motivation

Any computation that depends on an environment (a configuration object, a service,
the kernel instance) can be expressed as `Reader<R, A>` — a function `(env: R) => A`.
The key benefit: the dependency is never global, never imported directly. It is
passed in at the last moment via `runReader(reader, env)`.

This is the FP equivalent of Angular's dependency injection or Constructor Injection in OOP —
but for pure functions.

### Type Definition

```ts
export type Reader<R, A> = { readonly run: (env: R) => A };
```

### Constructors

```ts
export const reader    = <R, A>(f: (env: R) => A): Reader<R, A> => ({ run: f });
export const askReader = <R>(): Reader<R, R> => reader(env => env);    // expose the environment
export const ofReader  = <R, A>(a: A): Reader<R, A> => reader(() => a); // lift pure value
```

### Functor (map)

```ts
export const mapReader =
  <R, A, B>(f: (a: A) => B) =>
  (ra: Reader<R, A>): Reader<R, B> =>
    reader(env => f(ra.run(env)));
```

### Monad (chain)

```ts
export const chainReader =
  <R, A, B>(f: (a: A) => Reader<R, B>) =>
  (ra: Reader<R, A>): Reader<R, B> =>
    reader(env => f(ra.run(env)).run(env));
```

### Running a Reader

```ts
export const runReader = <R, A>(ra: Reader<R, A>, env: R): A => ra.run(env);
```

### Usage in @vi/state-fp

```ts
// A command handler that needs access to the clock (for date-stamping events)
// instead of importing Date.now() directly (hard to test), declare the dependency:

type HandlerEnv = { clock: () => number };

const createInvoiceHandler = reader<HandlerEnv, CommandHandler<InvoiceState, CreateInvoice>>(
  ({ clock }) => ({
    commandType: 'invoice/create',
    handle: (state, cmd) =>
      ok([
        domainEvent('invoice/created', {
          id:        uuid(),
          createdAt: clock(),   // injected — not hard-coded Date.now()
          ...cmd.payload,
        }),
      ]),
  })
);

// In tests — inject a deterministic clock
const handler = runReader(createInvoiceHandler, { clock: () => 1741200000000 });

// In production — inject the real clock
const handler = runReader(createInvoiceHandler, { clock: Date.now });
```

| Location | Usage |
|---|---|
| Command handlers that depend on services | Declare dependencies via `Reader<Env, CommandHandler>` |
| Adapter factories | `createAngularAdapter` is conceptually a `Reader<AngularAPIs, AngularKernelAdapter>` |
| Query handlers with external data | Queries that need a service passed in at registration time |

---

## 9. StateM — State Computation Monad

### Motivation

> Named `StateM` to avoid confusion with the library's own concept of "state" (atom state values).

A `StateM<S, A>` represents a **pure computation** that, given a state `S`, produces a value `A`
and a new state `S`. It is the functional encoding of "I need to read and possibly update state,
without any I/O."

This is especially powerful for composing complex `EventApplier` logic — instead of writing
deeply nested spread operations, individual state transitions can be composed with `chainStateM`.

### Type Definition

```ts
export type StateM<S, A> = { readonly run: (s: S) => readonly [A, S] };
```

### Constructors

```ts
export const stateM  = <S, A>(f: (s: S) => readonly [A, S]): StateM<S, A> => ({ run: f });
export const getState = <S>(): StateM<S, S> => stateM(s => [s, s]);
export const putState = <S>(next: S): StateM<S, void> => stateM(() => [undefined, next]);
export const modifyState = <S>(f: (s: S) => S): StateM<S, void> => stateM(s => [undefined, f(s)]);
export const ofStateM = <S, A>(a: A): StateM<S, A> => stateM(s => [a, s]);
```

### Running a StateM

```ts
// Returns [value, newState]
export const runStateM  = <S, A>(m: StateM<S, A>, s: S): readonly [A, S] => m.run(s);
// Returns only the final state (discards the value)
export const execStateM = <S, A>(m: StateM<S, A>, s: S): S => m.run(s)[1];
// Returns only the produced value (discards the new state)
export const evalStateM = <S, A>(m: StateM<S, A>, s: S): A => m.run(s)[0];
```

### Functor (map) and Monad (chain)

```ts
export const mapStateM =
  <S, A, B>(f: (a: A) => B) =>
  (m: StateM<S, A>): StateM<S, B> =>
    stateM(s => { const [a, s2] = m.run(s); return [f(a), s2]; });

export const chainStateM =
  <S, A, B>(f: (a: A) => StateM<S, B>) =>
  (m: StateM<S, A>): StateM<S, B> =>
    stateM(s => { const [a, s2] = m.run(s); return f(a).run(s2); });
```

### Usage in @vi/state-fp — Composable EventAppliers

```ts
// Before StateM — nested spread, hard to read
const cartApplier: EventApplier<CartState> = (state, event) => {
  switch (event.type) {
    case 'cart/itemAdded':
      return {
        ...state,
        items: [...state.items, event.payload.item],
        totalItems: state.totalItems + 1,
        lastModified: event.meta.timestamp,
      };
    // ...
  }
};

// With StateM — composable, unit-testable pieces
const addItem = (item: CartItem) =>
  pipe(
    modifyState<CartState>(s => ({ ...s, items: [...s.items, item] })),
    chainStateM(() => modifyState(s => ({ ...s, totalItems: s.totalItems + 1 }))),
    chainStateM(() => modifyState(s => ({ ...s, lastModified: Date.now() }))),
  );

// EventApplier using StateM
const cartApplier: EventApplier<CartState> = (state, event) => {
  switch (event.type) {
    case 'cart/itemAdded':
      return execStateM(addItem(event.payload.item), state);
    // ...
    default:
      return state;
  }
};
```

Every sub-operation (`addItem`, `incrementCount`, `updateTimestamp`) is independently
unit-testable against a plain state object — no kernel, no mocking required.

| Location | Usage |
|---|---|
| Complex `EventApplier` functions | Compose fine-grained state transitions via `chainStateM` |
| Multi-step atom reducers | Express multi-field updates as a sequence of `modifyState` operations |
| Test helpers | Use `evalStateM` to verify individual state transitions in isolation |
