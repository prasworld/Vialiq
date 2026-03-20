# `@vi/state-fp/adapter` — API Reference

> Framework adapters: Vanilla TS, Angular Signals, React hooks, Lit Reactive Controllers.
> Full integration guide: [`../developer-guide.md`](../developer-guide.md)

---

## Import

```ts
import {
  createAdapter,          // Vanilla TS
  createAngularAdapter,   // Angular 17+ Signals
  createReactAdapter,     // React 18+
  createLitController,    // Lit / LitElement
  createLitStreamController,
} from '@vi/state-fp/adapter';
import type { VanillaAdapter, AngularKernelAdapter, ReactKernelAdapter, AtomController, StreamController } from '@vi/state-fp/adapter';
```

---

## Design principle

All four adapters use a **factory + dependency-injection pattern**: framework primitives
(hooks, `signal`, `inject`) are passed in at setup time, so this library has **zero
compile-time dependency on any framework**. Tests work without framework runtimes.

---

## Vanilla adapter

```ts
import { createKernel, defineAtom } from '@vi/state-fp/kernel';
import { createAdapter }            from '@vi/state-fp/adapter';

const kernel  = createKernel();
const counter = defineAtom({ key: 'counter', initialState: 0 });
const app     = createAdapter(kernel);

// Subscribe to state
const off = app.watch(counter, n => console.log(n));

// Read current state synchronously
const current = app.read(counter);

// Execute a command
app.run(counter, IncrementCmd({ amount: 1 }));

// Query
const total = app.query(counter, GetTotal());

// Clean up
off();
app.destroy();
```

### VanillaAdapter interface

| Method | Return type | Description |
|---|---|---|
| `watch(atom, listener)` | `Unsubscribe` | Subscribe; calls listener immediately with current state |
| `run(atom, cmd)` | `Either<CommandError, DomainEvent[]>` | Execute command |
| `read(atom)` | `S` | Read current state synchronously |
| `query(atom, q)` | `R` | Execute a query |
| `destroy()` | `void` | Cancel all subscriptions |

---

## Angular adapter (Signals)

```ts
// src/app/state.ts — call once at startup
import { signal, inject, DestroyRef } from '@angular/core';
import { createAngularAdapter }       from '@vi/state-fp/adapter';

export const ngAdapter = createAngularAdapter({ signal, inject, DestroyRef });
```

```ts
// In a Component / injectable
export class CartComponent {
  private kernel = inject(KERNEL_TOKEN);

  readonly count = ngAdapter.toSignal(counterAtom, this.kernel);
  // count() returns number; auto-unsubscribes via DestroyRef

  readonly itemCount = ngAdapter.toQuerySignal(cartAtom, this.kernel, s => s.items.length);
  // itemCount() returns number

  readonly dispatch = ngAdapter.commandDispatcher(counterAtom, this.kernel);
  // dispatch(IncrementCmd({ amount: 1 }))
}
```

### AngularKernelAdapter interface

| Method | Return type | Description |
|---|---|---|
| `toSignal(atom, kernel)` | `WriteableSignalLike<S>` | Signal tracking atom state — auto-cleans up |
| `toQuerySignal(atom, kernel, queryFn)` | `WriteableSignalLike<R>` | Signal for derived state |
| `commandDispatcher(atom, kernel)` | `(cmd) => Either` | Stable dispatch function |

Must be called inside an Angular injection context for `toSignal` / `toQuerySignal`.

---

## React adapter

```ts
// src/adapter.ts — call once
import { useState, useEffect, useRef, useMemo, useContext, createContext, createElement } from 'react';
import { createReactAdapter } from '@vi/state-fp/adapter';

export const reactAdapter = createReactAdapter({
  useState, useEffect, useRef, useMemo, useContext, createContext, createElement,
});
```

```tsx
// Wrap your tree
function App() {
  return (
    <reactAdapter.Provider kernel={kernel}>
      <Routes />
    </reactAdapter.Provider>
  );
}

// In any child component
function CartButton() {
  const [cart]    = reactAdapter.useAtom(cartAtom);
  const dispatch  = reactAdapter.useCommand(cartAtom);
  const total     = reactAdapter.useQuery(cartAtom, BuildTotal());
  const lastEvent = reactAdapter.useEphemeral(cartEvents);

  return <button onClick={() => dispatch(AddItem({ sku: 'ABC' }))}>…</button>;
}
```

### ReactKernelAdapter interface

| Method | Return type | Description |
|---|---|---|
| `Provider(props)` | `unknown` (React element) | Context provider — wrap your tree |
| `useAtom(atom)` | `readonly [S, Atom<S>]` | Subscribe to atom state |
| `useCommand(atom)` | `(cmd) => Either` | Stable dispatch function (memo-safe) |
| `useQuery(atom, q)` | `R` | Memoised derived value |
| `useEphemeral(stream, animated?)` | `T \| undefined` | Subscribe to an EphemeralStream |

All hook methods must be called inside a `<Provider>`.

---

## Lit adapter

### `createLitController<S>(host, kernel, atom): AtomController<S>`

Implements the Lit `ReactiveController` interface. Auto-subscribes on `hostConnected`, unsubscribes on `hostDisconnected`.

```ts
import { LitElement, html } from 'lit';
import { customElement }    from 'lit/decorators.js';
import { createLitController } from '@vi/state-fp/adapter';

@customElement('vi-counter')
class CounterElement extends LitElement {
  private counter = createLitController(this, kernel, counterAtom);

  render() {
    return html`
      <p>Count: ${this.counter.state.count}</p>
      <button @click=${() => this.counter.dispatch(IncrementBy(1))}>+</button>
    `;
  }
}
```

### `AtomController<S>` interface

| Property | Type | Description |
|---|---|---|
| `state` | `S` | Current atom state |
| `dispatch(cmd)` | `Either` | Execute a command |
| `query<R>(q)` | `R` | Execute a query |

### `createLitStreamController<T>(host, stream, animated?): StreamController<T>`

Subscribes to an `EphemeralStream` and triggers host re-render on each value.

```ts
private events = createLitStreamController(this, orderEvents);
// this.events.value is T | undefined
```

| Property | Type | Description |
|---|---|---|
| `value` | `T \| undefined` | Latest stream value (`undefined` before first emit) |
