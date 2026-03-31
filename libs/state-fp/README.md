# @vialiq/state-fp

> Modular CQRS functional state management — composable, lightweight, zero runtime dependencies.

## Overview

`@vialiq/state-fp` is a TypeScript-first state management library organized around **six independently importable modules** following a strict **CQRS** (Command / Query Responsibility Segregation) architecture.

| Module          | Import path                  | Purpose                                      |
|-----------------|------------------------------|----------------------------------------------|
| **core**        | `@vialiq/state-fp/core`          | FP primitives: Maybe, Either, IO, Lens, utils |
| **kernel**      | `@vialiq/state-fp/kernel`        | Atoms, commands, events, queries, kernel      |
| **storage**     | `@vialiq/state-fp/storage`       | Pluggable adapters: memory, localStorage, IDB |
| **sync**        | `@vialiq/state-fp/sync`          | Cross-tab sync via BroadcastChannel           |
| **devtools**    | `@vialiq/state-fp/devtools`      | Event log, snapshots, time-travel, bridge     |
| **adapter**     | `@vialiq/state-fp/adapter`       | React hooks, Angular signals, Lit controllers, vanilla JS |

Import only what you need — all modules are individually tree-shakeable.

---

## Installation

```bash
npm install @vialiq/state-fp
# or
pnpm add @vialiq/state-fp
```

---

## Quick Start — Counter

```ts
import { defineAtom, createKernel, command,
         createCommandHandler, createEventApplier, domainEvent,
         ok, err, match }
  from '@vialiq/state-fp/kernel';

// 1. Define the atom (state container)
const counterAtom = defineAtom({
  key:          'counter',
  initialState: 0,
});

// 2. Command handler — pure function: validates and produces events.
//    Return ok([...events]) on success, err({code, message}) on failure.
const counterHandler = createCommandHandler<number, ReturnType<typeof command<'counter/increment', { by: number }>>>({
  commandType: 'counter/increment',
  validate: (payload) => {
    const p = payload as { by: number };
    return p.by > 0
      ? ok(undefined)
      : err({ code: 'VALIDATION_ERROR' as const, message: 'by must be > 0' });
  },
  handle: (_state, cmd) => ok([domainEvent('counter/incremented', { by: cmd.payload.by })]),
});

// 3. Event applier — pure function: folds events into next state
const counterApplier = createEventApplier<number>({
  'counter/incremented': (s, e) => s + e.payload.by,
  'counter/decremented': (s, e) => s - e.payload.by,
});

// 4. Wire together
const kernel = createKernel();
kernel.register(counterAtom, counterHandler, counterApplier);

// 5. Subscribe + execute
kernel.subscribe(counterAtom, state => console.log('count:', state));

const result = kernel.execute(counterAtom, command('counter/increment', { by: 5 }));
// → count: 5

// 6. Handle the result with match() — no Left/Right needed
const newCount = match(result, {
  ok:  (state) => state,
  err: (e)     => { console.error(e.message); return -1; },
});
```

---

## Module Reference

### `@vialiq/state-fp/core`

FP primitives with zero dependencies.

```ts
import {
  // Maybe — optional value
  just, nothing, fromNullable, isJust, isNothing,
  mapMaybe, chainMaybe, foldMaybe, getOrElseMaybe,
  // Result (idiomatic success/failure) — preferred API
  ok, err, isOk, isErr, match,
  // Either (traditional FP names — same runtime type as Result)
  left, right, isLeft, isRight, fromTry, fromTryAsync,
  mapEither, chainEither, foldEither,
  // IO monad
  io, liftIO, mapIO, chainIO, newIORef,
  // Lens
  lens, prop, composeLens, view, over, set,
  // Utils
  pipe, compose, uuid, now, deepClone, memoize,
} from '@vialiq/state-fp/core';
```

> **Naming convention:** `ok` / `err` / `isOk` / `isErr` / `match` are the preferred
> names for result handling. `right` / `left` / `isRight` / `isLeft` are identical
> functions kept for completeness; use whichever reads more naturally for the context.

### `@vialiq/state-fp/kernel`

CQRS engine: atoms, commands, events, queries.

```ts
import {
  defineAtom,
  createKernel,
  command, domainEvent,
  createCommandHandler, createEventApplier,
  query, createQueryHandler,
  // Result helpers re-exported here for convenience —
  // no extra import needed when writing command handlers
  ok, err, isOk, isErr, match,
} from '@vialiq/state-fp/kernel';
```

**CQRS write path:**
```
command → CommandHandler(state, cmd) → Result<CommandError, DomainEvent[]>
                                     ↓
                          EventApplier(state, event) → S
```

**CQRS read path:**
```
query → QueryHandler(state, query) → R   (pure, synchronous, never fails)
```

### `@vialiq/state-fp/storage`

Pluggable persistence backends.

```ts
import {
  MemoryAdapter,      // in-process Map, TTL, cleared on page reload
} from '@vialiq/state-fp/storage';
```

All adapter methods return `StorageResult<T>` = `Promise<Either<StorageError, T>>` so
failures are explicit and type-safe.

> **Note:** `LocalAdapter`, `SessionAdapter`, and `IndexedDbAdapter` are not available
> in `@vialiq/state-fp/storage`. Only `MemoryAdapter` is exported — all application state
> is kept in process memory. See `src/storage/index.ts` for the rationale.

### `@vialiq/state-fp/sync`

Cross-tab / cross-worker atom synchronisation.

```ts
import { createSyncEngine } from '@vialiq/state-fp/sync';

const sync   = createSyncEngine({ kernel });
const unsync = sync.share(counterAtom, {
  conflict: 'last-write-wins',  // or 'first-write-wins' | 'owner-wins' | 'version-wins' | fn
});

// later
unsync();
sync.destroy();
```

Conflict strategies:

| Strategy           | Description                                       |
|--------------------|---------------------------------------------------|
| `last-write-wins`  | Highest wall-clock timestamp wins (default)        |
| `first-write-wins` | Lowest wall-clock timestamp wins                   |
| `owner-wins`       | Local state always wins                            |
| `version-wins`     | Vector with highest total clock wins               |
| `(local, remote) => S` | Custom resolver function                      |

### `@vialiq/state-fp/devtools`

Event log, snapshot manager, and time-travel.

```ts
import { createDevTools } from '@vialiq/state-fp/devtools';

const devt = createDevTools({
  maxLogSize:   500,
  snapshotEvery: 50,
  installBridge: true,  // attaches window.__VI_STATE_FP__
});

kernel.use(devt.plugin);

// Programmatic access
devt.eventLog.getAll();
devt.snapshots.list();
await devt.timeTravel.to('<event-id>');
devt.timeTravel.stepForward();
devt.timeTravel.exit();

// Browser console
window.__VI_STATE_FP__.getLog();
window.__VI_STATE_FP__.timeTravelTo('<id>');
window.__VI_STATE_FP__.exportLog();
```

### `@vialiq/state-fp/adapter`

Framework integration helpers — all adapters use a **factory pattern** so the library has zero compile-time dependency on any UI framework.

#### Defining Commands and Queries

Commands and queries are **plain functions you define** using helpers from `@vialiq/state-fp/kernel`. The adapter examples below all reference `IncrementBy` and `BuildTotal` — here is how to define them:

```ts
import {
  command, domainEvent,
  createCommandHandler, createEventApplier,
  query, createQueryHandler,
  ok, err,
} from '@vialiq/state-fp/kernel';

// --- State shape ---
interface Counter { count: number; total: number }

// --- Command factories ---
// These are just functions that return a command object.
// Name them however suits your domain.
const IncrementBy = (by: number) => command('counter/increment', { by });
const DecrementBy = (by: number) => command('counter/decrement', { by });
const ResetCounter = ()          => command('counter/reset', {});

// --- Domain events (produced by handlers) ---
const incremented = (by: number) => domainEvent('counter/incremented', { by });

// --- Command handler: (state, cmd) → Result<Error, DomainEvent[]> ---
const incrementHandler = createCommandHandler<Counter, ReturnType<typeof IncrementBy>>({
  commandType: 'counter/increment',
  validate: (payload) => {
    const p = payload as { by: number };
    return p.by > 0 ? ok(undefined) : err({ code: 'VALIDATION_ERROR' as const, message: 'by must be > 0' });
  },
  handle: (_state, cmd) => ok([incremented(cmd.payload.by)]),
});

// --- Event applier: (state, event) → state (pure, no side-effects) ---
const counterApplier = createEventApplier<Counter>({
  'counter/incremented': (s, e) => ({ ...s, count: s.count + e.payload.by, total: s.total + e.payload.by }),
});

// --- Query factory: synchronous, pure, never fails ---
const BuildTotal = () => query('counter/total');

const totalHandler = createQueryHandler<Counter, Query, number>({
  queryType: 'counter/total',
  handle: (state) => state.total,
});

// --- Wire up ---
const counterAtom = defineAtom<Counter>({ key: 'counter', initialState: { count: 0, total: 0 } });
const kernel      = createKernel();
kernel.register(counterAtom, incrementHandler, counterApplier);
kernel.registerQuery(counterAtom, totalHandler);
```

> **Rule of thumb:** one command factory per user intent, one handler per command type, one applier per atom. Handlers and appliers are pure functions — no network calls, no side-effects.

#### React

Call `createReactAdapter` once at app bootstrap, passing in the real React hooks.  
See sequence diagram: `docs/fig/13-sequence-react-adapter.puml`

```tsx
// src/app/adapter.ts — create once, import everywhere
import { useState, useEffect, useRef, useMemo, useContext, createContext, createElement } from 'react';
import { createReactAdapter } from '@vialiq/state-fp/adapter';

export const reactAdapter = createReactAdapter({
  useState, useEffect, useRef, useMemo, useContext, createContext, createElement,
});

// src/app/App.tsx — wrap your tree with Provider
function App() {
  return (
    <reactAdapter.Provider kernel={kernel}>
      <Routes />
    </reactAdapter.Provider>
  );
}

// src/features/counter/CounterButton.tsx
// IncrementBy, BuildTotal, counterAtom — defined in your domain model (see above)
import { IncrementBy, BuildTotal, counterAtom } from './counter.commands';

function CounterButton() {
  const [state]    = reactAdapter.useAtom(counterAtom);
  const dispatch   = reactAdapter.useCommand(counterAtom);
  const total      = reactAdapter.useQuery(counterAtom, BuildTotal());

  // Optional: high-frequency EphemeralStream (RAF-batched by default)
  const mousePos   = reactAdapter.useEphemeral(mousePosStream);

  return (
    <button onClick={() => dispatch(IncrementBy(1))}>
      Count: {state.count} | Total: {total} | Mouse: {mousePos?.x},{mousePos?.y}
    </button>
  );
}
```

| Hook | Returns | Notes |
|---|---|---|
| `useAtom(atom)` | `[state, atom]` | Re-renders on every state change; no undefined flicker |
| `useCommand(atom)` | `dispatch` fn | Stable reference — safe for memoised children |
| `useQuery(atom, query)` | derived value | `useMemo` keyed on state ref — only re-runs on change |
| `useEphemeral(stream, animated?)` | `T \| undefined` | RAF-batched (`animated=true`) or synchronous |

#### Angular (17+, Signals)

Call `createAngularAdapter` once at bootstrap, passing Angular primitives.  
See sequence diagram: `docs/fig/15-sequence-angular-adapter.puml`  
See full production example: `docs/developer-guide.md` → §5.6b

The adapter provides low-level primitives. In production you wrap them in an
**injectable store service** — components inject the store, not the kernel directly.

```ts
// ─── src/core/state/ng-adapter.ts — created once, imported by stores ─────────
import { signal, inject, DestroyRef } from '@angular/core';
import { createAngularAdapter }       from '@vialiq/state-fp/adapter';

export const ngAdapter = createAngularAdapter({ signal, inject, DestroyRef });
```

```ts
// ─── src/features/counter/counter.store.ts — all wiring lives here ────────────
import { Injectable, inject }  from '@angular/core';
import { isErr }                from '@vialiq/state-fp/core';
import { KERNEL }               from '../../app/app.config';  // InjectionToken<Kernel>
import { ngAdapter }            from '../../core/state/ng-adapter';
import { counterAtom, IncrementBy, DecrementBy } from './counter.domain';

@Injectable({ providedIn: 'root' })
export class CounterStore {
  private readonly kernel = inject(KERNEL);

  // Signals — auto-unsubscribe via DestroyRef, no ngOnDestroy needed
  readonly counter   = ngAdapter.toSignal(counterAtom, this.kernel);
  readonly total     = ngAdapter.toQuerySignal(
    counterAtom, this.kernel,
    state => state.count * state.unitPrice,  // re-derived on every change
  );

  private readonly dispatch = ngAdapter.commandDispatcher(counterAtom, this.kernel);

  increment(by = 1): string | null {
    const result = this.dispatch(IncrementBy(by));
    return isErr(result) ? result.left.message : null;
  }

  decrement(by = 1): void { this.dispatch(DecrementBy(by)); }
}
```

```ts
// ─── src/features/counter/counter.component.ts — zero state-mgmt knowledge ───
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CounterStore }                                from './counter.store';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>Count: {{ store.counter().count }}</p>
    <p>Total: {{ store.total() }}</p>
    <button (click)="store.increment()">+</button>
    <button (click)="store.decrement()">-</button>
    @if (errorMsg) { <p class="error">{{ errorMsg }}</p> }
  `,
})
export class CounterComponent {
  readonly store   = inject(CounterStore);
  errorMsg: string | null = null;

  onIncrement(): void { this.errorMsg = this.store.increment(); }
}
```

| Method | Returns | Notes |
|---|---|---|
| `toSignal(atom, kernel)` | `WritableSignal<S>` | Seeds from `atom.get()`; cleanup via `DestroyRef` |
| `toQuerySignal(atom, kernel, fn)` | `WritableSignal<R>` | Derived; re-runs `fn(state)` on every change |
| `commandDispatcher(atom, kernel)` | `dispatch` fn | No injection context needed; stable reference |

#### Lit (Reactive Controllers)

Place controllers in element field initialisers — Lit auto-manages lifecycle.  
See sequence diagram: `docs/fig/14-sequence-lit-adapter.puml`

```ts
import { LitElement, html }      from 'lit';
import { customElement }          from 'lit/decorators.js';
import {
  createLitController,
  createLitStreamController,
} from '@vialiq/state-fp/adapter';

// IncrementBy, BuildTotal, counterAtom, kernel — defined in your domain model (see above)
import { IncrementBy, BuildTotal, counterAtom } from './counter.commands';

@customElement('counter-button')
class CounterButton extends LitElement {
  // AtomController — subscribes on connect, unsubscribes on disconnect
  private counter = createLitController(this, kernel, counterAtom);

  // StreamController — RAF-batched by default (pass false for sync)
  private mouse   = createLitStreamController(this, mousePosStream);

  render() {
    const { count } = this.counter.state;
    const pos        = this.mouse.value;       // undefined before first emit
    return html`
      <button @click=${() => this.counter.dispatch(IncrementBy(1))}>
        Count: ${count}
      </button>
      <span>Mouse: ${pos?.x},${pos?.y}</span>
    `;
  }

  // Access a derived value synchronously
  get total() {
    return this.counter.query(BuildTotal());
  }
}
```

| Factory | Returns | Notes |
|---|---|---|
| `createLitController(host, kernel, atom)` | `AtomController<S>` | `state`, `dispatch()`, `query()` |
| `createLitStreamController(host, stream, animated?)` | `StreamController<T>` | `.value` updated each frame/emit |

#### Vanilla JS / TypeScript

```ts
import { createAdapter } from '@vialiq/state-fp/adapter';

const app = createAdapter(kernel);

const off = app.watch(counterAtom, state => render(state));
await app.run(counterAtom, increment(1));
const current = app.read(counterAtom);
app.destroy();
```

---

## Design Principles

1. **Command failure is an `Either`, not a thrown exception** — write paths never throw.
2. **Query failure does not exist** — read paths are pure functions that always succeed.
3. **Events are the canonical record of truth** — state is derived by replaying events.
4. **Atoms are the unit of state** — fine-grained subscriptions, no selector overhead.
5. **Modules are independently importable** — `core` has zero deps; each layer adds one.
6. **Storage is a plugin, not a requirement** — atoms work without persistence.
7. **Devtools are zero-cost in production** — the debug layer is a tree-shakeable plugin.
8. **Sync is opt-in per atom** — call `sync.share(atom)` only for atoms that need it.

---

## Dependency Graph

```
 core  ←  kernel  ←  storage
                  ←  devtools
                  ←  sync
                  ←  adapter
```

`core` depends on nothing. No circular dependencies are permitted anywhere.

---

## Phase Roadmap

| Phase | Deliverable                  | Status       | Version |
|-------|------------------------------|--------------|---------|
| 0     | Monorepo scaffold, tooling   | ✅ Complete   | —       |
| 1     | core + kernel (CQRS)         | ✅ Complete   | 0.1.0   |
| 2     | storage module               | ✅ Complete   | 0.2.0   |
| 3     | devtools module              | ✅ Complete   | 0.3.0   |
| 4     | sync module                  | ✅ Complete   | 0.4.0   |
| 5     | adapter module               | ✅ Complete   | 0.5.0   |
| 6     | DX hardening, full test suite | ✅ Complete  | 1.0.0   |

See [docs/phases.md](docs/phases.md) for the full phase breakdown and
[docs/architecture.md](docs/architecture.md) for the complete CQRS modular
architecture design reference.

---

## Package Entrypoints (npm consumers)

All of the following modules are individually importable as subpath exports. Import only what you need — unused subpaths are never loaded by your bundler.

| Subpath | Contents |
|---|---|
| `@vialiq/state-fp` | Full re-export of all modules (convenience; prefer subpaths for tree-shaking) |
| `@vialiq/state-fp/core` | FP primitives: Maybe, Either, IO, Lens, pipe, compose, utilities |
| `@vialiq/state-fp/kernel` | Atoms, commands, events, queries, CQRS kernel |
| `@vialiq/state-fp/storage` | Pluggable persistence adapters (MemoryAdapter) |
| `@vialiq/state-fp/sync` | Cross-tab / cross-worker atom synchronisation |
| `@vialiq/state-fp/devtools` | Event log, snapshots, time-travel |
| `@vialiq/state-fp/adapter` | React hooks, Angular signals, Lit controllers, vanilla JS |
| `@vialiq/state-fp/bus` | Event bus / message bus primitives |

The `exports` map in `package.json` is what Node and modern bundlers use to resolve these paths. Each entry maps to a pre-built ESM chunk in the published tarball:

```
@vialiq/state-fp/core        → dist/core/index.js
@vialiq/state-fp/kernel      → dist/kernel/index.js
@vialiq/state-fp/storage     → dist/storage/index.js
...
```

### Publish strategy

`libs/state-fp/package.json` is the source metadata file only — it does **not** contain `exports` or `files`. A separate `libs/state-fp/publish-package.json` holds the full dist manifest (`exports`, `files`, `sideEffects`). The `postbuild-publish` Nx target copies it over `dist/libs/state-fp/package.json` after the build, so npm consumers always get the correct manifest.

Do **not** add `exports` to the source `package.json` — they belong only in `publish-package.json`.

---

## License

MIT © vi
