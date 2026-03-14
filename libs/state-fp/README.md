# @vi/state-fp

> Modular CQRS functional state management — composable, lightweight, zero runtime dependencies.

## Overview

`@vi/state-fp` is a TypeScript-first state management library organized around **six independently importable modules** following a strict **CQRS** (Command / Query Responsibility Segregation) architecture.

| Module          | Import path                  | Purpose                                      |
|-----------------|------------------------------|----------------------------------------------|
| **core**        | `@vi/state-fp/core`          | FP primitives: Maybe, Either, IO, Lens, utils |
| **kernel**      | `@vi/state-fp/kernel`        | Atoms, commands, events, queries, kernel      |
| **storage**     | `@vi/state-fp/storage`       | Pluggable adapters: memory, localStorage, IDB |
| **sync**        | `@vi/state-fp/sync`          | Cross-tab sync via BroadcastChannel           |
| **devtools**    | `@vi/state-fp/devtools`      | Event log, snapshots, time-travel, bridge     |
| **adapter**     | `@vi/state-fp/adapter`       | Angular signals, vanilla JS, React (Phase 5)  |

Import only what you need — all modules are individually tree-shakeable.

---

## Installation

```bash
npm install @vi/state-fp
# or
pnpm add @vi/state-fp
```

---

## Quick Start — Counter

```ts
import { defineAtom }          from '@vi/state-fp/kernel';
import { createKernel }        from '@vi/state-fp/kernel';
import { command, createCommandHandler, createEventApplier, domainEvent }
                                from '@vi/state-fp/kernel';

// 1. Define the atom (state container)
const counterAtom = defineAtom({
  key:          'counter',
  initialState: 0,
});

// 2. Define commands
const increment = (by = 1) => command('counter/increment', { by });
const decrement = (by = 1) => command('counter/decrement', { by });

// 3. Define domain events (emitted by command handlers)
const incremented = (by: number) => domainEvent('counter/incremented', { by });
const decremented = (by: number) => domainEvent('counter/decremented', { by });

// 4. Command handler — pure function: (state, cmd) → Either<Error, Event[]>
const counterHandler = createCommandHandler<number, ReturnType<typeof increment>>({
  commandType: 'counter/increment',
  validate:    (state, cmd) => cmd.payload.by > 0
    ? undefined
    : { code: 'VALIDATION_ERROR' as const, message: 'by must be > 0' },
  handle: (_state, cmd) => [incremented(cmd.payload.by)],
});

// 5. Event applier — pure function: (state, event) → state
const counterApplier = createEventApplier<number>({
  'counter/incremented': (s, e) => s + e.payload.by,
  'counter/decremented': (s, e) => s - e.payload.by,
});

// 6. Wire it all together
const kernel = createKernel();

kernel.register(counterAtom, counterHandler, counterApplier);

// Subscribe to state changes
kernel.subscribe(counterAtom, state => console.log('count:', state));

// Execute commands
const result = await kernel.execute(counterAtom, increment(5));
// count: 5

if (result._tag === 'Right') {
  console.log('events:', result.right); // [{ type: 'counter/incremented', ... }]
}
```

---

## Module Reference

### `@vi/state-fp/core`

FP primitives with zero dependencies.

```ts
import {
  // Maybe monad
  just, nothing, fromNullable, isJust, isNothing,
  mapMaybe, chainMaybe, foldMaybe, getOrElse,
  // Either monad
  left, right, fromTry, isLeft, isRight,
  mapEither, chainEither, foldEither,
  // IO monad
  io, liftIO, mapIO, chainIO, newIORef,
  // Lens
  lens, prop, composeLens, view, over, set,
  // Utils
  pipe, compose, uuid, now, deepClone, memoize,
} from '@vi/state-fp/core';
```

### `@vi/state-fp/kernel`

CQRS engine: atoms, commands, events, queries.

```ts
import {
  defineAtom,
  createKernel,
  command, domainEvent,
  createCommandHandler, createEventApplier,
  query, createQueryHandler,
} from '@vi/state-fp/kernel';
```

**CQRS write path:**
```
command → CommandHandler(state, cmd) → Either<CommandError, DomainEvent[]>
                                     ↓
                          EventApplier(state, event) → S
```

**CQRS read path:**
```
query → QueryHandler(state, query) → R   (pure, synchronous, never fails)
```

### `@vi/state-fp/storage`

Pluggable persistence backends.

```ts
import {
  MemoryAdapter,      // in-process Map, TTL, no persistence
  LocalAdapter,       // localStorage — survives page reload
  SessionAdapter,     // sessionStorage — tab-scoped
  IndexedDbAdapter,   // IndexedDB — async, large capacity
} from '@vi/state-fp/storage';

const kernel = createKernel({
  storage: new LocalAdapter(),
});
```

All adapters return `StorageResult<T>` = `Promise<Either<StorageError, T>>` so
failures are explicit and type-safe.

### `@vi/state-fp/sync`

Cross-tab / cross-worker atom synchronisation.

```ts
import { createSyncEngine } from '@vi/state-fp/sync';

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

### `@vi/state-fp/devtools`

Event log, snapshot manager, and time-travel.

```ts
import { createDevTools } from '@vi/state-fp/devtools';

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

### `@vi/state-fp/adapter`

Framework integration helpers.

#### Vanilla JS / TypeScript

```ts
import { createAdapter } from '@vi/state-fp/adapter';

const app = createAdapter(kernel);

const off = app.watch(counterAtom, state => render(state));
await app.run(counterAtom, increment(1));
const current = app.read(counterAtom);
app.destroy();
```

#### Angular (17+, Signals)

```ts
// app.config.ts
import { provideStateFp } from '@vi/state-fp/adapter';
export const appConfig: ApplicationConfig = {
  providers: [provideStateFp(kernel)],
};

// counter.component.ts
import { injectAtom, injectCommand } from '@vi/state-fp/adapter';

@Component({ template: `Count: {{ count() }}` })
export class CounterComponent {
  readonly count    = injectAtom(counterAtom);        // Signal<number>
  readonly dispatch = injectCommand(counterAtom);
}
```

#### React (Phase 5 — stub)

```ts
import { useAtom, useCommand } from '@vi/state-fp/adapter';
// Full implementation planned for Phase 5
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
| 5     | adapter module               | ✅ Phase 1    | 0.5.0   |
| 6     | DX hardening, full test suite | 🚧 Planned   | 1.0.0   |

See [docs/phases.md](docs/phases.md) for the full phase breakdown and
[docs/architecture.md](docs/architecture.md) for the complete CQRS modular
architecture design reference.

---

## License

MIT © vi
