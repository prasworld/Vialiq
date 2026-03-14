# Debug Visibility Model

> Part of `@vi/state-fp` — observability and debugging reference.

---

## Overview

Debuggability in `@vi/state-fp` is a **first-class feature**, not an
afterthought or an external plugin. The library ships with a complete debug
layer that includes:

- Structured, queryable **Event Log**
- **Snapshot Manager** with configurable interval
- **Time-Travel** replay for recreating any historical state
- **DevTools Bridge** accessible from browser console without extensions
- **Metrics** for performance monitoring
- **Source Location Capture** linking state transitions to application code

All debug infrastructure is zero-cost in production — it is tree-shaken
out when `debug: false` (the default in production builds).

---

## 1. Debug Layer Activation

```ts
import { createKernel } from '@vi/state-fp/kernel';
import { createDevTools, noopDevTools } from '@vi/state-fp/devtools';

// Development — explicit devtools
const kernel = createKernel({
  devtools: createDevTools({
    maxEventLogSize:  500,   // rolling window; default 200
    snapshotInterval: 50,   // snapshot every N events; default 50
  }),
});

// Production — no devtools allocated (zero cost)
const kernel = createKernel({ devtools: noopDevTools });

// Convenience shorthand — devtools enabled when env flag is set
const kernel = createKernel({
  devtools: process.env['NODE_ENV'] !== 'production'
    ? createDevTools()
    : noopDevTools,
});

// Access the debug interface via the plugin registry
// (or by keeping a reference to the devtools object)
const devtools = createDevTools();
const dbg = devtools; // EventLog, SnapshotManager, TimeTravelController
```

When `noopDevTools` is used:
- `devtools.record()` is a synchronous no-op (`() => void 0`)
- All debug private fields (`EventLog`, `SnapshotManager`) are never allocated
- Dead-code elimination removes the import entirely in bundled production builds

---

## 2. DebugEntry — The Atomic Unit of Observability

Every call to `kernel.execute()` produces exactly one `DebugEntry` (when devtools are attached).

```ts
type DebugEntry<S = unknown> = {
  /** UUIDv4 — unique identifier for this entry */
  readonly id:             string;

  /** Shared across chained events (user action → effects → sub-dispatches) */
  readonly correlationId:  string;

  /** `id` of the event that caused this dispatch (causality chain) */
  readonly prevEventId:    string | null;

  /** The atom that was targeted */
  readonly atomKey:        string;

  /** The event.type that was dispatched */
  readonly eventType:      string;

  /** Full event payload (serialised copy) */
  readonly event:          unknown;

  /** State before the reducer ran */
  readonly prevState:      S;

  /** State after the reducer ran (same as prevState on error) */
  readonly nextState:      S;

  /** JSON-patch style diff between prevState and nextState */
  readonly diff:           Patch[];

  /** Wall-clock time of dispatch */
  readonly timestamp:      number;

  /** Time spent in CommandHandler + EventApplier + storage write (ms) */
  readonly durationMs:     number;

  /** Present only when CommandHandler returned an error */
  readonly error?:         CommandError;

  /** First non-library stack frame (dev mode only — null in production) */
  readonly sourceLocation?: SourceLocation;
};

type Patch = {
  op:    'add' | 'remove' | 'replace';
  path:  string;    // JSON Pointer, e.g. "/count"
  value?: unknown;  // absent for 'remove'
};

type SourceLocation = {
  file:   string;
  line:   number;
  column: number;
};
```

---

## 3. Event Log

The event log is an **append-only, indexed, bounded circular buffer**.

### Interface

```ts
interface EventLog {
  /** Append a new DebugEntry */
  append(entry: DebugEntry): void;

  /** Retrieve all entries (oldest first) */
  getAll(): ReadonlyArray<DebugEntry>;

  /** Entries for a specific atom */
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

  /** Total number of events dispatched (monotonically increasing, even after clear) */
  readonly totalCount: number;

  /** Serialise log to JSON string for export */
  export(): string;
}
```

### Circular Buffer Internals

The event log uses a fixed-size circular buffer backed by a typed array index.
When `maxEventLogSize` is reached, the oldest entry is evicted
(FIFO). Secondary indices are maintained for efficient queries:

```
Primary:          Array<DebugEntry>        O(1) append, O(n) full scan
byAtom:           Map<atomKey, string[]>   O(1) lookup by atom
byCorrelation:    Map<cid, string[]>       O(1) lookup by correlation
```

---

## 4. Snapshot Manager

A snapshot is an immutable copy of all atom states at a single point.

### When Snapshots Are Taken

| Trigger | Condition |
|---|---|
| Automatic | Every `snapshotInterval` events (default 50) |
| Manual | `devtools.snapshots.take('label')` — explicit programmer call |
| Pre-hydration | Before `kernel.hydrate()` overwrites existing state |
| Pre-invalidation | Before a bulk `kernel.invalidateAll()` |

### Snapshot Shape

```ts
type Snapshot = {
  /** UUIDv4 */
  readonly id:           string;

  /** Wall-clock timestamp */
  readonly timestamp:    number;

  /** The DebugEntry.id that triggered this snapshot */
  readonly triggerEventId: string;

  /** Total event count at this point — used for time-travel ordering */
  readonly eventCount:   number;

  /** Deep-cloned state of every registered atom */
  readonly state:        Readonly<Record<string, unknown>>;

  /** Human-readable label (set by `devtools.snapshots.take('label')`) */
  readonly label?:       string;
};
```

### Snapshot Manager Interface

```ts
interface SnapshotManager {
  /** Take an explicit snapshot with an optional label */
  take(label?: string): Snapshot;

  /** List all snapshots ordered by eventCount asc */
  list(): ReadonlyArray<Snapshot>;

  /** Get a snapshot by id */
  get(id: string): Maybe<Snapshot>;

  /** Get the snapshot nearest to (but not after) a given event count */
  nearestBefore(eventCount: number): Maybe<Snapshot>;

  /** Prune snapshots older than the head by N entries (rolling window) */
  prune(keepLast: number): void;

  /** Serialise all snapshots to JSON */
  export(): string;

  /** Import previously exported snapshots (for replay in CI / bug reproduction) */
  import(json: string): void;
}
```

### Snapshot Retention

By default, the last `maxSnapshots` (default 20) snapshots are retained.
Older snapshots are pruned automatically after each new snapshot is taken.
Pruned snapshots can be exported before removal.

---

## 5. Time-Travel

Time-travel allows the developer (or automated tests) to replay the event
log to any historical point in time.

### Algorithm

```
timeTravelTo(targetEventId):

1. Find the DebugEntry with id = targetEventId
2. Identify its eventCount position N
3. Find snapshot S = snapshotManager.nearestBefore(N)
4. Reset all atoms to S.state (deep clone)
5. Re-dispatch events from snapshot.eventCount + 1 to N
   — each re-dispatch goes through the reducer pipeline
   — storage writes are SKIPPED (read-only replay)
   — subscribers ARE notified (so UI can reflect replayed state)
6. Mark store.replayMode = true (new dispatches are blocked during replay)
7. Return the final state snapshot

exitReplay():
  Restore latest real state from before replay started
  store.replayMode = false
```

### Interface

```ts
interface TimeTravelInterface {
  /** Is the store currently in replay mode? */
  readonly replayMode: boolean;

  /** Travel to the state immediately after a specific event */
  to(eventId: string): Promise<Either<TimeTravelError, void>>;

  /** Travel to the state at a specific snapshot */
  toSnapshot(snapshotId: string): Either<TimeTravelError, void>;

  /** Step forward one event from current replay position */
  stepForward(): Either<TimeTravelError, void>;

  /** Step backward one event from current replay position */
  stepBackward(): Either<TimeTravelError, void>;

  /** Exit replay mode and restore current live state */
  exit(): void;

  /** Replay the entire log from scratch (useful for test verification) */
  replayAll(): Promise<Either<TimeTravelError, void>>;
}
```

### Constraints

- Time-travel **does not write to storage** — it is a read-only operation
- `kernel.execute()` is **blocked** while `replayMode === true`
- Async effects are **not replayed** — only the resulting state transitions
  are (because effects are IO boundaries, not pure functions)
- Calling `timeTravelTo` from a subscriber callback will throw
  `TimeTravelError { code: 'REENTRANT_REPLAY' }`

---

## 6. DevTools Bridge

The DevTools Bridge is a structured `window.__VI_STATE_FP__` object
attached to the global scope in browser environments when `attachBridge()` is called.

```ts
import { createDevTools, attachBridge } from '@vi/state-fp/devtools';

const devtools = createDevTools();
const kernel = createKernel({ devtools });
attachBridge(devtools);  // window.__VI_STATE_FP__ is now available
```

### API

```ts
// Available in browser DevTools console
window.__VI_STATE_FP__ = {
  // Inspect
  getLog():       DebugEntry[]           // full event log
  getAtoms():     Record<string, unknown> // current state of all atoms
  getMetrics():   Metrics                 // dispatch counts, timings

  // Snapshots
  getSnapshots(): Snapshot[]
  snapshot(label?: string): Snapshot     // take a manual snapshot

  // Time-travel
  timeTravelTo(eventId: string): void    // fire-and-forget for console use
  stepForward():  void
  stepBackward(): void
  exitReplay():   void
  replayMode():   boolean

  // Import/Export for bug reproduction
  exportLog():    string                 // JSON of full event log
  importLog(json: string): void          // replay a previously exported log

  // Debugging utilities
  findAtom(key: string):                 // get current state of a single atom
    Maybe<unknown>
  traceCorrelation(cid: string):         // show all events in a causal chain
    DebugEntry[]
}
```

### Usage Examples

```js
// In browser DevTools console:

// Q: What state is vi/counter in right now?
window.__VI_STATE_FP__.findAtom('vi/counter')
// → { _tag: 'Just', value: { count: 7 } }

// Q: What did this user action affect?
window.__VI_STATE_FP__.traceCorrelation('abc-123-def')
// → [ DebugEntry('counter/increment'), DebugEntry('dashboard/refresh') ]

// Q: What state was vi/cart in 30 events ago?
const log = window.__VI_STATE_FP__.getLog()
const target = log[log.length - 30]
window.__VI_STATE_FP__.timeTravelTo(target.id)
// → store replays; UI updates to that historical state

// Q: Export for sharing with teammate
copy(window.__VI_STATE_FP__.exportLog())
// → JSON on clipboard; teammate can importLog() to reproduce bug exactly
```

---

## 7. Source Location Capture

In development mode (`debug: true`), the store captures the call-site
stack frame at the moment `dispatch()` is called.

```ts
// Simplified implementation
function captureSourceLocation(): SourceLocation | null {
  const stack = new Error().stack ?? '';
  const frames = stack.split('\n');
  // Skip frames from within @vi/state-fp itself
  const appFrame = frames.find(line =>
    !line.includes('@vi/state-fp') &&
    !line.includes('node_modules')
  );
  return appFrame ? parseStackFrame(appFrame) : null;
}
```

This means each `DebugEntry` carries a `sourceLocation` pointing to the
exact file and line number in application code that triggered the state
change. No external sourcemap tooling is required.

---

## 8. Metrics

```ts
type Metrics = {
  /** Total dispatches since store creation */
  totalDispatches:    number;

  /** Number of dispatches that returned Left (error) */
  errorCount:         number;

  /** Dispatches that resulted in a no-op (state unchanged) */
  noOpCount:          number;

  /** Average dispatch duration in milliseconds */
  averageDurationMs:  number;

  /** The slowest dispatch on record */
  slowestDispatch:    DebugEntry | null;

  /** Storage hit rate during hydration (0–1) */
  storageHitRate:     number;

  /** Per-atom dispatch counts */
  byAtom:             Record<string, number>;
};
```

Access via: `devtools.metrics`

---

## 9. Structured Log Export

The event log `export()` method produces a JSON array compatible with
standard log aggregators:

```json
[
  {
    "id": "a1b2-...",
    "correlationId": "z9y8-...",
    "atomKey": "vi/counter",
    "eventType": "counter/increment",
    "event": { "type": "counter/increment" },
    "prevState": { "count": 3 },
    "nextState": { "count": 4 },
    "diff": [{ "op": "replace", "path": "/count", "value": 4 }],
    "timestamp": 1741200000000,
    "durationMs": 0.8,
    "sourceLocation": {
      "file": "/src/app/counter/counter.component.ts",
      "line": 42,
      "column": 14
    }
  }
]
```

This format can be piped to:
- **Datadog Logs** via the browser SDK
- **Loki** via HTTP push
- **CloudWatch** via `console.log` (since CloudWatch ingests structured
  JSON from browser applications via Kinesis)

---

## 10. Debug in Tests

The debug layer is fully accessible in Vitest unit tests:

```ts
import { createKernel, defineAtom, createCommandHandler, createEventApplier,
         command, domainEvent } from '@vi/state-fp/kernel';
import { createDevTools } from '@vi/state-fp/devtools';
import { right } from '@vi/state-fp/core';

// Test atoms and handlers (defined once, reused across tests)
const counterAtom = defineAtom({ key: 'vi/counter', initialState: { count: 0 } });
const increment = () => command('counter/increment', {});

const incrementHandler = createCommandHandler({
  commandType: 'counter/increment',
  handle: (state) => right([domainEvent('counter/incremented', { by: 1 })]),
});
const counterApplier = createEventApplier<{ count: number }>({
  'counter/incremented': (state, e) => ({ count: state.count + e.payload.by }),
});

describe('counter kernel', () => {
  it('records events correctly', () => {
    const devtools = createDevTools();
    const kernel = createKernel({ devtools });
    kernel.register(counterAtom, incrementHandler, counterApplier);

    kernel.execute(counterAtom, increment());
    kernel.execute(counterAtom, increment());

    const log = devtools.getLog();
    const byAtom = log.filter(e => e.atomKey === 'vi/counter');
    expect(byAtom).toHaveLength(2);
    expect(byAtom[1].nextState).toEqual({ count: 2 });
    expect(byAtom[1].diff).toEqual([{ op: 'replace', path: '/count', value: 2 }]);
  });

  it('time-travels to a previous state', async () => {
    const devtools = createDevTools();
    const kernel = createKernel({ devtools });
    kernel.register(counterAtom, incrementHandler, counterApplier);

    kernel.execute(counterAtom, increment()); // event 1
    kernel.execute(counterAtom, increment()); // event 2
    kernel.execute(counterAtom, increment()); // event 3

    const log = devtools.getLog();
    const event1Id = log.filter(e => e.atomKey === 'vi/counter')[0].id;
    await devtools.timeTravel.to(event1Id);

    // State reflects position after event 1
    expect(kernel.query(counterAtom, { _kind: 'Query', type: 'counter/getCount' })).toEqual(1);

    devtools.timeTravel.exit();
    // Restored to live state
    expect(kernel.query(counterAtom, { _kind: 'Query', type: 'counter/getCount' })).toEqual(3);
  });
});
```

---

## 11. Performance Considerations

| Concern | Mitigation |
|---|---|
| `structuredClone` on every dispatch | Only in debug mode; no-op in production |
| Stack trace capture | Lazy — only when `debug: true` AND `captureSourceLocation` option enabled |
| Event log indices (3× Map overhead) | Bounded by `maxEventLogSize`; entries pruned as circle advances |
| Snapshot deep-clone | Background microtask after dispatch settles; never on the synchronous hot path |
| `window.__VI_STATE_FP__` global | Assigned once at `createKernel` + `attachBridge` time; `Object.freeze`-compatible |

---

## 12. DevExtension Protocol — Custom State Visualizers

> **Motivation:** The built-in `window.__VI_STATE_FP__` bridge is useful for ad-hoc debugging
> but is not extensible to third-party tools (Redux DevTools extension, custom dashboards,
> team-specific log shippers, etc.). The `DevExtension` protocol provides a stable interface
> for building exactly-once integration points.

### DevExtension Interface

Any object implementing `DevExtension` can be registered as a visualizer. The devtools
module calls these hooks on every state transition, synchronously, in registration order.

```ts
/**
 * Implement this interface to build custom state visualizers, log shippers,
 * or integration bridges (e.g. Redux DevTools, DataDog, Sentry).
 *
 * Register via: devtools.addExtension(myExtension)
 *
 * IMPORTANT: Extensions are ONLY called when devtools are active (debug: true / createDevTools()).
 * In production (noopDevTools), hook calls are fully eliminated by dead-code removal.
 */
interface DevExtension {
  /** Human-readable name — shown in DevTools console and log exports */
  readonly name: string;

  /**
   * Called synchronously after each successful command execution.
   * Receives the full DebugEntry — command, events, state diff, timing.
   * MUST NOT mutate the entry or dispatch any command inside this hook.
   */
  onEntry(entry: Readonly<DebugEntry>): void;

  /**
   * Called when a snapshot is taken (automatic or manual).
   * Receives a deep-frozen copy of all atom states.
   */
  onSnapshot?(snapshot: Readonly<Snapshot>): void;

  /**
   * Called when time-travel is initiated. Receives the target eventId and
   * the complete state produced by replaying to that point.
   */
  onTimeTravel?(targetEventId: string, state: Readonly<Record<string, unknown>>): void;

  /**
   * Called when time-travel is exited and live state is restored.
   */
  onTimeTravelExit?(): void;

  /**
   * Called when `kernel.destroy()` is invoked. Clean up extension resources.
   */
  onDestroy?(): void;
}
```

### Registering an Extension

```ts
import { createDevTools } from '@vi/state-fp/devtools';

const devtools = createDevTools({ maxEventLogSize: 500 });

devtools.addExtension({
  name: 'my-audit-logger',
  onEntry(entry) {
    auditService.record({
      action:   entry.commandType,
      actor:    entry.atomKey,
      before:   entry.prevState,
      after:    entry.nextState,
      ts:       entry.timestamp,
    });
  },
});

const kernel = createKernel({ devtools });
```

### Built-In Extensions

#### Redux DevTools Bridge (`createReduxDevToolsBridge`)

Connects `@vi/state-fp` to the Redux DevTools browser extension, making every
`DebugEntry` visible in the familiar Redux DevTools timeline:

```ts
import { createDevTools, createReduxDevToolsBridge } from '@vi/state-fp/devtools';

const devtools = createDevTools();

if (typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
  devtools.addExtension(createReduxDevToolsBridge({
    name:          'vi/state-fp',
    actionCreator: (entry) => ({ type: `[${entry.atomKey}] ${entry.commandType}` }),
  }));
}
```

The Redux DevTools bridge uses the `__REDUX_DEVTOOLS_EXTENSION__.connect()` API so it is
fully compatible with the browser extension's time-travel UI, action log, and diff viewer.

#### Performance Observer Extension

Surfaces slow commands (> threshold ms) to the browser Performance Observer API:

```ts
import { createPerfExtension } from '@vi/state-fp/devtools';

devtools.addExtension(createPerfExtension({
  slowThresholdMs: 16,   // flag anything slower than one frame
  onSlowCommand: (entry) => {
    console.warn(`Slow command: ${entry.commandType} took ${entry.durationMs}ms`, entry);
  },
}));
```

#### Sentry / DataDog / OpenTelemetry Integration

```ts
// Any APM tool can be bridged via DevExtension
devtools.addExtension({
  name: 'sentry-state-bridge',
  onEntry(entry) {
    if (entry.error) {
      Sentry.captureException(new Error(entry.error.message), {
        extra: { commandType: entry.commandType, atomKey: entry.atomKey },
      });
    }
  },
});
```

---

## 13. Production Safety Invariants

The debug layer is built with the following production safety invariants that
**must not be violated** during implementation:

| Invariant | Detail |
|---|---|
| **D1** | `window.__VI_STATE_FP__` is **never** attached unless `attachBridge()` is explicitly called |
| **D2** | `attachBridge()` must only be called in non-production environments (developer or debug builds) |
| **D3** | `noopDevTools` allocates no objects — all hooks are synchronous no-ops returning `void 0` |
| **D4** | `DevExtension.onEntry` is never called when `noopDevTools` is active — dead-code eliminated |
| **D5** | `structuredClone` and stack trace capture are never executed in production |
| **D6** | Source location data (`SourceLocation`) is `null` in production builds |
| **D7** | The `devtools` import itself is excluded from prod bundles when only `noopDevTools` is referenced |

### Safe Setup Pattern

```ts
// app/kernel.ts — shared kernel setup
import { createKernel }   from '@vi/state-fp/kernel';
import { createDevTools, noopDevTools, attachBridge } from '@vi/state-fp/devtools';

const isProduction = process.env['NODE_ENV'] === 'production';

const devtools = isProduction
  ? noopDevTools
  : createDevTools({ maxEventLogSize: 500, snapshotInterval: 50 });

export const kernel = createKernel({ devtools });

// DevTools bridge — development only
// In production this block is dead code and tree-shaken by bundlers
if (!isProduction && typeof window !== 'undefined') {
  attachBridge(devtools);
  // Now accessible: window.__VI_STATE_FP__.getLog(), .timeTravelTo(), etc.
}
```

> Never call `attachBridge()` in a code path that can execute in production.
> The bridge exposes the full internal state of all atoms — in the wrong hands,
> this could leak auth tokens or PII from memory-resident atoms.
