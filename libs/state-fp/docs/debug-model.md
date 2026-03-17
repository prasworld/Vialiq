# Debug Visibility Model

> Part of `@vi/state-fp` — observability and debugging reference.

---

## Overview

Debuggability in `@vi/state-fp` is a **first-class feature**, not an afterthought or an external plugin. The library ships with a complete debug layer that includes:

- Structured, queryable **Event Log** (circular buffer with O(1) secondary indices)
- **Snapshot Manager** with configurable auto-interval and manual capture
- **Time-Travel** controller for navigating to any historical atom state
- **DevTools Bridge** attached to `window.__VI_STATE_FP__` in browser environments
- **KernelPlugin API** for integrating the devtools stack with the kernel

All debug infrastructure is opt-in. Pass `debug: true` in `KernelOptions` to wire the kernel's internal `DebugInterface`, then attach the devtools plugin with `kernel.use(devtools.plugin)`. In production omit both — no devtools objects are allocated.

---

## 1. Debug Layer Activation

```ts
import { createKernel }   from '@vi/state-fp/kernel';
import { createDevTools } from '@vi/state-fp/devtools';

// 1. Create the devtools instance (event log + snapshots + time-travel + bridge)
const devtools = createDevTools({
  maxLogSize:    500,   // rolling circular buffer size; default 500
  maxSnapshots:  30,    // max snapshots retained; default 30
  snapshotEvery: 50,    // auto-snapshot every N events; 0 = never; default 50
  installBridge: true,  // install window.__VI_STATE_FP__ bridge; default true if window exists
});

// 2. Create the kernel with debug mode enabled (enables internal DebugInterface)
const kernel = createKernel({ debug: true });

// 3. Connect devtools to the kernel via the KernelPlugin API
kernel.use(devtools.plugin);
```

**Why two separate steps?**  
`createKernel({ debug: true })` enables the kernel's internal debug recording hooks (the `DebugInterface` wired to `kernel.debug`). These hooks call `record()` on any registered `DebugInterface`. The devtools plugin (`devtools.plugin`) is a `KernelPlugin` that implements `onRegister` and `onExecute` — connecting the devtools event log to those hooks. This decoupling means you can attach any custom `DebugInterface` without using the devtools module at all.

**Production pattern:**  
Simply omit `debug: true` and don't call `kernel.use(devtools.plugin)`. The kernel's debug path short-circuits immediately (`if (!this.#debug) return`) — no allocation, no string building, zero overhead.

---

## 2. DebugEntry — The Atomic Unit of Observability

Every command execution that produces domain events results in one `DebugEntry` **per event** appended to the event log. A command that emits N events produces N entries — all sharing the same `correlationId`, linking them as part of one logical operation.

```ts
type DebugEntry = {
  /** UUIDv4 — unique identifier for this log entry */
  readonly id:            string;

  /** The atom key that was targeted by the command */
  readonly atomKey:       string;

  /** Shared across all events from the same top-level command (causality root) */
  readonly correlationId: string;

  /** The `id` of a parent DebugEntry that caused this entry (`undefined` for root commands) */
  readonly causationId:   string | undefined;

  /** The command type that triggered this event (`undefined` if driven by side-effect) */
  readonly commandType:   string | undefined;

  /** The single domain event this entry records */
  readonly event:         DomainEvent;

  /** Deep clone of atom state BEFORE the event applier ran */
  readonly stateBefore:   unknown;

  /** Deep clone of atom state AFTER the event applier ran */
  readonly stateAfter:    unknown;

  /** Wall-clock timestamp (ms since epoch) */
  readonly timestamp:     number;

  /** Monotonically-increasing event version (from event.meta.version) */
  readonly version:       number;
};
```

> **What is NOT in DebugEntry:**  
> - No `diff: Patch[]` — compute diffs from `stateBefore`/`stateAfter` if needed  
> - No `durationMs` — timing information lives in `KernelDebugEntry` (internal kernel type)  
> - No `error` — failed commands produce no events and therefore no DebugEntry  
> - No `sourceLocation` — not captured; not in the type  
> - No `prevState`/`nextState` — the correct field names are `stateBefore`/`stateAfter`  

### KernelDebugEntry (internal)

The kernel maintains a separate `KernelDebugEntry` type for its own internal debug hook:

```ts
type KernelDebugEntry = {
  readonly commandType:   string;
  readonly correlationId: string;
  readonly atomKey:       string;
  readonly events:        DomainEvent[];  // all events from this command
  readonly prevState:     unknown;
  readonly nextState:     unknown;
  readonly durationMs:    number;         // timing IS available at the kernel level
  readonly error?:        CommandError;
  readonly timestamp:     number;
};
```

This type is used internally by `kernel.debug.record()` and powers the `onExecute` callback of `KernelPlugin`. The devtools plugin's `onExecute` hook receives `KernelDebugEntry`-shaped params and produces one `DebugEntry` per event.

---

## 3. Event Log

The event log is an **append-only, indexed, bounded circular buffer**.

### Interface

```ts
// From EventLogInterface (devtools/types.ts)
interface EventLogInterface {
  /** Append a new DebugEntry (called by devtools plugin's onExecute) */
  append(entry: DebugEntry): void;

  /** All buffered entries, oldest first */
  getAll(): ReadonlyArray<DebugEntry>;

  /** Entries for a specific atom, oldest first */
  getByAtom(atomKey: string): ReadonlyArray<DebugEntry>;

  /** Entries sharing a correlation ID (trace a user action's full impact) */
  getByCorrelation(correlationId: string): ReadonlyArray<DebugEntry>;

  /** Entries within a UTC timestamp range */
  getByTimeRange(from: number, to: number): ReadonlyArray<DebugEntry>;

  /** Last N entries */
  last(n: number): ReadonlyArray<DebugEntry>;

  /** Most recent entry — Nothing if empty */
  latest(): Maybe<DebugEntry>;

  /** Clear all entries */
  clear(): void;

  /** Total number of events appended (monotonically increasing, even after clear) */
  readonly totalCount: number;
}
```

The `EventLog` class also exposes `serialize(): string` and `deserialize(json: string): void` methods used internally by the bridge for `exportLog`/`importLog`.

### Circular Buffer Internals

The event log uses a fixed-size circular buffer backed by a plain array + a head pointer. When `maxLogSize` is reached the oldest entry is evicted (FIFO). Two secondary indices are maintained for efficient queries:

```
Primary:          DebugEntry[]                     O(1) append, O(n) full scan
#byAtom:          Map<atomKey, entryId[]>           O(1) lookup by atom key
#byCorrelation:   Map<correlationId, entryId[]>     O(1) lookup by correlation ID
```

Both secondary indices are updated on every append and pruned on every eviction, so the index size is always bounded by `maxLogSize`.

---

## 4. Snapshot Manager

A snapshot is an immutable, deep-frozen copy of all atom states at a single point in time.

### Snapshot Shape

```ts
type Snapshot = {
  /** UUIDv4 — unique snapshot identifier */
  readonly id:             string;

  /** Wall-clock time when the snapshot was taken */
  readonly timestamp:      number;

  /** Total event count in the log at capture time (used for time-travel ordering) */
  readonly eventCount:     number;

  /** The DebugEntry id that triggered this snapshot; undefined for manual snapshots */
  readonly triggerEventId: string | undefined;

  /** Deep-frozen copy of every registered atom's state, keyed by atom key */
  readonly state:          Readonly<Record<string, unknown>>;

  /** Optional human-readable label set by manual `snapshots.capture(...)` calls */
  readonly label:          string | undefined;
};
```

### When Snapshots Are Taken

| Trigger | Condition |
|---|---|
| Automatic | Every `snapshotEvery` events (default 50); configurable in `DevToolsOptions` |
| Manual | `devtools.snapshots.capture(atomStates, undefined, log.totalCount, 'my-label')` |
| Test setup | Manually before executing commands to create a known baseline |

> **Note:** There is no automatic pre-hydration or pre-invalidation snapshot — callers must
> take a manual snapshot before `kernel.hydrate()` if they want a baseline.

### SnapshotManager Interface

```ts
class SnapshotManager implements SnapshotManagerInterface {
  /**
   * Capture the current atom states into a new snapshot.
   * Called automatically by the devtools plugin's onExecute hook every N events.
   */
  capture(
    atomStates:      Record<string, unknown>,
    triggerEventId:  string | undefined,
    totalEventCount: number,
    label?:          string,
  ): Snapshot;

  /** All snapshots ordered by eventCount ascending */
  list(): ReadonlyArray<Snapshot>;

  /** Get a specific snapshot by id */
  get(id: string): Maybe<Snapshot>;

  /** The most recent snapshot whose eventCount is ≤ the given value */
  nearestBefore(eventCount: number): Maybe<Snapshot>;

  /** Evict oldest snapshots, keeping at most keepLast */
  prune(keepLast: number): void;

  /** Serialize all snapshots to a JSON string */
  export(): string;

  /** Replace the snapshot list from a previously exported JSON string */
  import(json: string): void;
}
```

### Snapshot Retention

Snapshots are kept rolling via `prune(maxSnapshots)` called after every `capture()`. With default `maxSnapshots: 30` and `snapshotEvery: 50`, approximately the last 1500 events are covered by checkpoints — meaning time-travel to any event in that window replays at most 49 events from the nearest snapshot.

---

## 5. Time-Travel

Time-travel allows replaying the event log to re-materialize any historical atom state.

### TimeTravelController Interface

```ts
type TimeTravelController = {
  /** Whether the controller is currently in replay mode */
  readonly replayMode:     boolean;

  /** Current replay position (index into event log) — 0 when not in replay mode */
  readonly replayPosition: number;

  /** Jump to the state immediately after the event with the given id */
  to(eventId: string): Promise<Either<TimeTravelError, void>>;

  /** Jump to the atom states captured in a snapshot */
  toSnapshot(snapshotId: string): Either<TimeTravelError, void>;

  /** Advance one event forward (valid only in replay mode) */
  stepForward(): Either<TimeTravelError, void>;

  /** Step one event backward (valid only in replay mode) */
  stepBackward(): Either<TimeTravelError, void>;

  /** Exit replay mode and restore the live state saved before replay began */
  exit(): void;
};

type TimeTravelError = {
  code:    'EVENT_NOT_FOUND' | 'SNAPSHOT_NOT_FOUND' | 'REENTRANT_REPLAY' | 'UNKNOWN';
  message: string;
};
```

### Algorithm

```
timeTravel.to(targetEventId):

1. Save current live atom states in preReplayState (deepClone of every atom.get())
2. Find the DebugEntry with id = targetEventId; get its index N in the log
3. Find snapshot S = snapshots.nearestBefore(N + 1)
4. If S exists:
     - Restore atom states from S.state via atom._setState()
     - Re-apply log entries from S.eventCount to N (inclusive)
   Else:
     - Re-apply all entries from index 0 to N
5. Set replayMode = true, replayPosition = N

timeTravel.exit():
  Restore preReplayState to all atoms via atom._setState()
  Set replayMode = false, replayPosition = 0
```

### Important Invariants

- **Storage adapters are never written during replay** — `atom._setState()` bypasses the
  kernel's CQRS pipeline entirely; no `execute()` call occurs.
- **The kernel itself is not "blocked"** — there is no flag preventing `kernel.execute()` calls
  during replay. However doing so will immediately mutate atoms that are mid-replay, producing
  confusing results. Do not call `execute()` while `replayMode` is `true`.
- **Async effects are not replayed** — only state transitions are; IO boundaries are not
  idempotent and are outside the replay scope.
- **Computed atoms are updated** — `atom._setState()` calls do not go through
  `recomputeDependents()`. If computed atoms need to reflect historical state, their source
  atoms must be set correctly first (the event applier entries already do this for direct atoms).

---

## 6. DevTools Bridge

The bridge exposes a read-oriented API on `window.__VI_STATE_FP__` in browser environments. It is installed automatically by `createDevTools()` unless `installBridge: false` is passed.

```ts
// From DevToolsBridge (devtools/types.ts)
type DevToolsBridge = {
  /** All entries in the event log, oldest-first */
  getLog(): ReadonlyArray<DebugEntry>;

  /** Current state of every registered atom, keyed by atom key */
  getAtoms(): Record<string, unknown>;

  /** Apply the state corresponding to the log entry with the given id */
  timeTravelTo(id: string): Promise<void>;

  /** Serialize the full log to a JSON string */
  exportLog(): string;

  /** Restore the log from a previously exported JSON string */
  importLog(json: string): void;

  /** Bridge protocol version */
  readonly version: string;  // '0.1.0'
};
```

### Usage in Browser Console

```js
// Inspect current state
window.__VI_STATE_FP__.getAtoms()
// → { 'vi/counter': { count: 7 }, 'vi/cart': { items: [] } }

// View recent log entries
window.__VI_STATE_FP__.getLog().slice(-5)
// → [ DebugEntry, DebugEntry, ... ]

// Jump to a past state
const log = window.__VI_STATE_FP__.getLog();
const target = log[log.length - 10];
window.__VI_STATE_FP__.timeTravelTo(target.id);
// Atom states now reflect the point in time after that event

// Export for sharing
copy(window.__VI_STATE_FP__.exportLog());
// JSON on clipboard — teammate can importLog() to reproduce

// Import a colleague's log for replay
window.__VI_STATE_FP__.importLog(pastedJson);
```

> **Important:** The bridge does NOT expose `traceCorrelation`, `findAtom`, `getMetrics`,
> or `stepForward/stepBackward` directly. Use `devtools.eventLog.getByCorrelation()`,
> `devtools.timeTravel.stepForward()` etc. from application code for those operations.

---

## 7. Computed Atoms in Debug Context (Phase 2.5)

Computed atoms (`defineComputedAtom`) do not accept commands and do not appear as the
`atomKey` of any `DebugEntry`. Their state changes are derived from source atoms.

When a source atom changes via `kernel.execute()`, the kernel calls `recomputeDependents(atomKey)`
synchronously at step 4.5 of the write path — **before** any storage write and **before**
any subscriber notifications. This means:

- Computed atom state is always current when subscribers are notified of source atom changes
- The devtools event log does not record computed atom recomputations separately
- To inspect a computed atom's state in devtools: use `window.__VI_STATE_FP__.getAtoms()`;
  the computed atom key will appear there with its current derived value

### Debugging Computed State

```ts
// Manually check which atoms are computed vs source
const atoms = window.__VI_STATE_FP__.getAtoms();
// All atoms (source + computed) are listed here

// To understand what changed a computed atom, trace the source atom:
const entries = devtools.eventLog.getByAtom('vi/cart');
// These are the source events that would drive a computed 'vi/cart/total'
```

---

## 8. Optimistic Updates in Debug Context (Phase 2.6)

`kernel.executeOptimistic()` applies an optimistic state immediately via `atom._setState()`,
then calls `confirm()`, and on failure restores the pre-optimistic state via `atom._setState()`.

**Important:** Optimistic state changes via `atom._setState()` do **not** produce `DebugEntry`
records in the event log. The event log only records entries from the confirmed `confirm()`
operation (which goes through the standard CQRS pipeline).

This means:

| Scenario | Event Log Entry? | State Change? |
|---|---|---|
| Optimistic apply (before confirm) | **No** | Yes |
| Confirm succeeds → `execute()` runs | Yes (normal entry) | Yes |
| Confirm fails → rollback `_setState` | **No** | Yes (reverted) |

### Debugging Optimistic Updates

When debugging unexpected state, check if an optimistic update has been applied but not yet
confirmed — the event log will appear behind the actual atom state:

```ts
// The event log shows committed state only
const log = devtools.eventLog.getByAtom('vi/order');
const lastCommitted = log[log.length - 1]?.stateAfter;  // last known good state

// The actual current state may reflect an un-confirmed optimistic write
const current = window.__VI_STATE_FP__.getAtoms()['vi/order'];

// If current !== lastCommitted, an optimistic update is pending
```

---

## 9. Debug in Tests

The debug layer is fully accessible in Vitest unit tests. Use `debug: true` so the kernel's
internal `DebugInterface` records to the plugin, then attach `devtools.plugin` before registering atoms.

```ts
import { createKernel, defineAtom, createCommandHandler, createEventApplier,
         command, domainEvent } from '@vi/state-fp/kernel';
import { createDevTools } from '@vi/state-fp/devtools';
import { right } from '@vi/state-fp/core';

const counterAtom = defineAtom({ key: 'vi/counter', initialState: { count: 0 } });
const increment   = () => command('counter/increment', {});

const handler = createCommandHandler({
  commandType: 'counter/increment',
  handle: (_state) => right([domainEvent('counter/incremented', { by: 1 })]),
});
const applier = createEventApplier<{ count: number }>({
  'counter/incremented': (state, e) => ({ count: state.count + e.payload.by }),
});

describe('counter devtools', () => {
  let kernel:   ReturnType<typeof createKernel>;
  let devtools: ReturnType<typeof createDevTools>;

  beforeEach(() => {
    devtools = createDevTools({ installBridge: false });  // no window in Node
    kernel   = createKernel({ debug: true });
    kernel.use(devtools.plugin);
    kernel.register(counterAtom, handler, applier);
  });

  it('records one entry per event', () => {
    kernel.execute(counterAtom, increment());
    kernel.execute(counterAtom, increment());

    const log = devtools.eventLog.getByAtom('vi/counter');
    expect(log).toHaveLength(2);
    expect(log[0].stateBefore).toEqual({ count: 0 });
    expect(log[0].stateAfter).toEqual({ count: 1 });
    expect(log[1].stateAfter).toEqual({ count: 2 });
    expect(log[0].commandType).toBe('counter/increment');
  });

  it('correlates events from one command', () => {
    kernel.execute(counterAtom, increment());

    const log = devtools.eventLog.getAll();
    expect(log[0].correlationId).toBeDefined();
    // causationId is undefined for root commands
    expect(log[0].causationId).toBeUndefined();
  });

  it('time-travels to a previous state', async () => {
    kernel.execute(counterAtom, increment()); // event 1 → count: 1
    kernel.execute(counterAtom, increment()); // event 2 → count: 2
    kernel.execute(counterAtom, increment()); // event 3 → count: 3

    const log = devtools.eventLog.getByAtom('vi/counter');
    const event1Id = log[0].id;

    const result = await devtools.timeTravel.to(event1Id);
    expect(result._tag).toBe('Right');
    expect(counterAtom.get()).toEqual({ count: 1 });

    devtools.timeTravel.exit();
    expect(counterAtom.get()).toEqual({ count: 3 });
  });

  it('takes a snapshot every 50 events by default', () => {
    for (let i = 0; i < 50; i++) {
      kernel.execute(counterAtom, increment());
    }
    expect(devtools.snapshots.list()).toHaveLength(1);
    expect(devtools.snapshots.list()[0].eventCount).toBe(50);
  });
});
```

---

## 10. Structured Log Export

The event log `serialize()` / `exportLog()` method produces a JSON array. Each entry contains the full `DebugEntry`:

```json
[
  {
    "id": "a1b2c3d4-...",
    "atomKey": "vi/counter",
    "correlationId": "z9y8x7w6-...",
    "causationId": null,
    "commandType": "counter/increment",
    "event": {
      "_kind": "Event",
      "type": "counter/incremented",
      "payload": { "by": 1 },
      "meta": {
        "correlationId": "z9y8x7w6-...",
        "causationId": null,
        "version": 1,
        "timestamp": 1741200000000
      }
    },
    "stateBefore": { "count": 0 },
    "stateAfter":  { "count": 1 },
    "timestamp":   1741200000000,
    "version":     1
  }
]
```

This can be imported via the browser bridge for bug reproduction:

```js
// In browser console
window.__VI_STATE_FP__.importLog(pastedJson)
// Log state is restored — time-travel then works against the imported history
```

---

## 11. Performance Characteristics

| Operation | Cost | Notes |
|---|---|---|
| `eventLog.append()` | O(1) amortized | Circular buffer pointer bump + 2 index updates |
| `eventLog.getByAtom()` | O(k) | k = entries for that atom; Map lookup then array resolve |
| `eventLog.getByCorrelation()` | O(k) | Same as getByAtom |
| `eventLog.getAll()` | O(n) | n = buffer size; array slice + concat |
| `deepClone` per entry | O(m) | m = state object size; called twice (stateBefore + stateAfter) |
| `snapshots.capture()` | O(atoms × state) | Deep-clones all atom states; triggered every 50 events |
| `timeTravel.to()` | O(delta) | delta = events since nearest snapshot; typically < 50 |
| Bridge `getAtoms()` | O(atoms) | Iterates live atom map — real-time; not cached |

All debug operations occur **outside** the synchronous command execution hot path. `deepClone` in the devtools plugin's `onExecute` hook runs after the state has already been applied — it does not add latency to the CQRS pipeline from the observable caller's perspective.

---

## 12. Production Safety Invariants

| Invariant | Detail |
|---|---|
| **D1** | `window.__VI_STATE_FP__` is attached only when `installBridge: true` (default when `window` exists) and `createDevTools()` is called |
| **D2** | Do not call `createDevTools()` or `kernel.use(devtools.plugin)` in production builds |
| **D3** | Omitting `debug: true` in `KernelOptions` disables the kernel's internal recording — `kernel.debug.record()` becomes a no-op |
| **D4** | `deepClone` of `stateBefore`/`stateAfter` is only performed inside the devtools `onExecute` plugin hook — never on the default code path |
| **D5** | No global state leaks: `atoms` map and event log are held only by the `DevToolsInstance` closure — garbage-collected when it goes out of scope |
| **D6** | `devtools.uninstall()` removes `window.__VI_STATE_FP__` and is idempotent |
