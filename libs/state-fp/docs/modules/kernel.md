# `@vi/state-fp/kernel` — API Reference

> CQRS event-sourcing kernel: atoms, commands, events, queries, and the kernel itself.
> Full design rationale: [`../architecture.md`](../architecture.md), [`../developer-guide.md`](../developer-guide.md)

---

## Import

```ts
import {
  defineAtom, defineComputedAtom, createKernel,
  command, domainEvent, query,
  createCommandHandler, createEventApplier, createQueryHandler,
} from '@vi/state-fp/kernel';
import type { Atom, Command, DomainEvent, Query, Kernel, Unsubscribe } from '@vi/state-fp/kernel';
```

---

## Atom

An atom holds reactive state for a single domain slice. Atoms are defined once and shared.

```ts
type Atom<S> = {
  readonly key:        string;
  get():               S;
  subscribe(listener: (state: S) => void): Unsubscribe;
};
```

### `defineAtom<S>(options)`

```ts
const counterAtom = defineAtom({
  key:          'counter',
  initialState: { count: 0 },

  // Optional: co-located handlers — kernel.register(counterAtom) reads these automatically
  commands: [incrementHandler],
  applier:  counterApplier,
  queries:  [totalQuery],

  // Optional: persistence
  storage: {
    adapter: myAdapter,  // implements StorageAdapterLike<S>
    key:     'counter-v1',
    ttl:     3600_000,   // ms; omit for no expiry
  },
});
```

### `defineComputedAtom<S, D extends readonly Atom<unknown>[]>(options)`

Derives its state from one or more source atoms. Recomputes whenever any dependency changes.

```ts
const totalAtom = defineComputedAtom({
  key:     'cart/total',
  deps:    [cartAtom, taxAtom],
  compute: ([cart, tax]) => cart.subtotal * (1 + tax.rate),
});
```

---

## Command / DomainEvent / Query builders

These builder functions stamp boilerplate metadata (type, `_kind`, `meta`) so domain code stays readable.

### `command(type, payload?): Command`

```ts
const cmd = command('counter/Increment', { amount: 5 });
// { _kind: 'Command', type: 'counter/Increment', payload: { amount: 5 }, meta: { ... } }
```

### `domainEvent(type, payload?): DomainEvent`

```ts
const event = domainEvent('counter/Incremented', { amount: 5 });
```

### `query(type, payload?): Query`

```ts
const q = query('counter/GetTotal');
```

---

## CommandHandler

Validates a command and emits domain events. Returns `Either<CommandError, DomainEvent[]>`.

### `createCommandHandler<S, C extends Command>(options)`

```ts
const incrementHandler = createCommandHandler<CounterState, Command<'counter/Increment', { amount: number }>>(
  {
    commandType: 'counter/Increment',
    // validate runs before handle; returning Left short-circuits execution
    validate: (payload) => {
      const p = payload as { amount: number };
      return p.amount > 0
        ? right(undefined)
        : left({ code: 'INVALID_CMD', message: 'amount must be > 0' });
    },
    handle: (_state, cmd) =>
      right([domainEvent('counter/Incremented', { amount: cmd.payload.amount })]),
  }
);
```

---

## EventApplier

Pure state reducer — applies a single domain event to produce the next state.

### `createEventApplier<S, E extends DomainEvent>(options)`

```ts
const countApplier = createEventApplier<CounterState>({
  'counter/Incremented': (state, event) => ({
    ...state,
    count: state.count + (event as DomainEvent<string, { amount: number }>).payload.amount,
  }),
});
```

---

## QueryHandler

Derives a value from current atom state without mutation.

### `createQueryHandler<S, Q extends Query, R>(options)`

```ts
const totalQuery = createQueryHandler<CounterState, Query, number>({
  queryType: 'counter/GetTotal',
  handle: (state) => state.count,
});
```

---

## Kernel

### `createKernel(options?): Kernel`

```ts
const kernel = createKernel({
  debug:   true,   // enable DebugInterface hooks (attach devtools.plugin)
  plugins: [],     // KernelPlugin[] — lifecycle hooks
});
```

### `Kernel` interface

| Method | Signature | Description |
|---|---|---|
| `register` | `(atom, handlers?, appliers?, queries?) => void` | Register atom handlers |
| `execute` | `(atom, cmd) => Either<CommandError, DomainEvent[]>` | Run command synchronously |
| `executeAsync` | `(atom, cmd) => Promise<Either<...>>` | Run command asynchronously |
| `subscribe` | `(atom, listener) => Unsubscribe` | React to state changes |
| `query` | `<R>(atom, q) => R` | Execute a query |
| `hydrate` | `(atom) => Promise<void>` | Load persisted state |
| `use` | `(plugin) => void` | Attach a KernelPlugin |

---

## Types quick reference

```ts
type Command      = { _kind: 'Command';     type: string; payload?: unknown; meta: CommandMeta     };
type DomainEvent  = { _kind: 'DomainEvent'; type: string; payload?: unknown; meta: DomainEventMeta };
type Query        = { _kind: 'Query';       type: string; payload?: unknown };
type CommandError = { code: string; message: string; details?: unknown };
type Unsubscribe  = () => void;
```
