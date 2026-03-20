# `@vi/state-fp/core` — API Reference

> Functional primitives: Maybe, Either, IO, Lens, pipe, compose, EphemeralStream.
> Full design rationale: [`../functional-primitives.md`](../functional-primitives.md)

---

## Import

```ts
import { just, nothing, fromNullable, ... } from '@vi/state-fp/core';
import type { Maybe, Either, IO, Lens, EphemeralStream } from '@vi/state-fp/core';
```

---

## Maybe&lt;A&gt;

Encodes presence or absence of a value without `null` / `undefined`.

```ts
type Nothing  = { readonly _tag: 'Nothing' };
type Just<A>  = { readonly _tag: 'Just'; readonly value: A };
type Maybe<A> = Nothing | Just<A>;
```

| Function | Signature | Description |
|---|---|---|
| `just` | `(a: A) => Just<A>` | Lift a value |
| `nothing` | `() => Nothing` | Empty Maybe |
| `fromNullable` | `(a: A \| null \| undefined) => Maybe<A>` | Lift nullable |
| `isJust` | `(m: Maybe<A>) => m is Just<A>` | Narrow to Just |
| `isNothing` | `(m: Maybe<A>) => m is Nothing` | Narrow to Nothing |
| `mapMaybe` | `(f: A → B) => (m: Maybe<A>) => Maybe<B>` | Functor map |
| `chainMaybe` | `(f: A → Maybe<B>) => (m: Maybe<A>) => Maybe<B>` | Monad bind |
| `foldMaybe` | `(onNothing: () → B, onJust: A → B) => (m: Maybe<A>) => B` | Catamorphism |
| `getOrElseMaybe` | `(fallback: A) => (m: Maybe<A>) => A` | Extract with default |

---

## Either&lt;E, A&gt;

Encodes success (`Right<A>`) or failure (`Left<E>`) — used for typed errors throughout the kernel.

```ts
type Left<E>  = { readonly _tag: 'Left';  readonly left:  E };
type Right<A> = { readonly _tag: 'Right'; readonly right: A };
type Either<E, A> = Left<E> | Right<A>;
```

| Function | Signature | Description |
|---|---|---|
| `right` | `(a: A) => Right<A>` | Success branch |
| `left` | `(e: E) => Left<E>` | Failure branch |
| `isRight` | `(e: Either<E,A>) => e is Right<A>` | Guard |
| `isLeft` | `(e: Either<E,A>) => e is Left<E>` | Guard |
| `mapEither` | `(f: A → B) => Either<E,A> → Either<E,B>` | Functor map |
| `chainEither` | `(f: A → Either<E,B>) => Either<E,A> → Either<E,B>` | Monad bind |
| `foldEither` | `(onLeft: E → B, onRight: A → B) => Either<E,A> → B` | Catamorphism |

---

## IO&lt;A&gt;

Lazy wrapper for side-effectful computations — deferred until `.run()`.

```ts
type IO<A> = { run: () => A };
```

| Function | Signature | Description |
|---|---|---|
| `io` | `(f: () => A) => IO<A>` | Wrap a thunk |
| `liftIO` | `(f: () => A) => IO<A>` | Alias for `io` |
| `mapIO` | `(f: A → B) => IO<A> → IO<B>` | Functor map |

---

## Lens&lt;S, A&gt;

Composable, immutable focus into a nested data structure.

```ts
type Lens<S, A> = {
  readonly get:  (s: S) => A;
  readonly set:  (a: A) => (s: S) => S;
};
```

| Function | Signature | Description |
|---|---|---|
| `lens` | `(get, set) => Lens<S,A>` | Construct a Lens |
| `prop` | `<K extends keyof S>(key: K) => Lens<S, S[K]>` | Lens onto a property |
| `composeLens` | `(a: Lens<S,A>, b: Lens<A,B>) => Lens<S,B>` | Sequential composition |
| `view` | `(l: Lens<S,A>) => (s: S) => A` | Read focus |
| `over` | `(l: Lens<S,A>, f: A→A) => (s: S) => S` | Modify focus |
| `set` | `(l: Lens<S,A>, a: A) => (s: S) => S` | Write focus |

---

## pipe / compose

```ts
// Left-to-right function application
pipe(value, f1, f2, f3)   // f3(f2(f1(value)))

// Right-to-left function composition (returns a new function)
compose(f3, f2, f1)(value) // f3(f2(f1(value)))
```

Both support up to 9 functions with full TypeScript type inference.

---

## EphemeralStream&lt;T&gt;

Push-based event bus — values are not replayed; subscribers only see events emitted after subscription.

```ts
type EphemeralStream<T> = {
  emit:               (value: T) => void;
  subscribe:          (listener: (value: T) => void) => Unsubscribe;
  subscribeAnimated:  (listener: (value: T) => void) => Unsubscribe;  // RAF-batched
  last:               T | undefined;  // most recent value (no replay guarantee)
};
```

| Function | Description |
|---|---|
| `createEphemeralStream<T>()` | Create a new stream |

```ts
const events = createEphemeralStream<{ type: string }>();
const off     = events.subscribe(e => console.log(e));
events.emit({ type: 'click' });
off(); // unsubscribe
```
