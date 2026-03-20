# `@vi/state-fp/devtools` — API Reference

> Structured event log, snapshots, time-travel, and a browser DevTools bridge.
> Full design rationale: [`../debug-model.md`](../debug-model.md)

---

## Import

```ts
import { createDevTools, createTimeTravelController, EventLog, SnapshotManager } from '@vi/state-fp/devtools';
import type { DevToolsInstance, DebugEntry, Snapshot, DevToolsOptions } from '@vi/state-fp/devtools';
```

---

## Quick start

```ts
import { createKernel }   from '@vi/state-fp/kernel';
import { createDevTools } from '@vi/state-fp/devtools';

const kernel   = createKernel({ debug: true });   // enable debug hooks
const devtools = createDevTools({
  maxLogSize:    500,   // circular buffer size
  maxSnapshots:  30,
  snapshotEvery: 50,    // auto-snapshot every N events; 0 = never
  installBridge: true,  // attach window.__VI_STATE_FP__
});

kernel.use(devtools.plugin);   // wire devtools to kernel lifecycle
```

In production: omit `debug: true` and skip `kernel.use(devtools.plugin)` entirely. No allocations, no overhead.

---

## `createDevTools(options?): DevToolsInstance`

### `DevToolsOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `maxLogSize` | `number` | `500` | Max event log entries (circular buffer) |
| `maxSnapshots` | `number` | `30` | Max retained snapshots |
| `snapshotEvery` | `number` | `50` | Auto-snapshot interval (events); `0` = manual only |
| `installBridge` | `boolean` | `true` if `window` exists | Install `window.__VI_STATE_FP__` browser bridge |

### `DevToolsInstance`

| Property | Type | Description |
|---|---|---|
| `plugin` | `KernelPlugin` | Pass to `kernel.use()` to wire event recording |
| `log` | `EventLog` | Queryable event log |
| `snapshots` | `SnapshotManager` | Snapshot store |
| `timeTravel` | `TimeTravelController` | Navigate to historical states |
| `bridge` | `DevToolsBridge \| null` | Browser bridge (`window.__VI_STATE_FP__`) |

---

## EventLog

Circular buffer of `DebugEntry` objects. O(1) indexed by event id, atom key, and correlation id.

```ts
const log = devtools.log;

log.append(entry);
log.getAll();                        // all entries, newest first
log.findByAtom('counter');           // entries for one atom
log.findByCorrelation('uuid-xxx');   // entries in one command cycle
log.findById('entry-uuid');          // one entry by id
log.size;                            // current entry count
log.clear();
```

### DebugEntry shape

```ts
type DebugEntry = {
  id:            string;   // UUIDv4
  atomKey:       string;
  commandType:   string;
  eventType:     string;
  correlationId: string;
  stateBefore:   unknown;
  stateAfter:    unknown;
  timestamp:     number;   // Date.now()
  durationMs:    number;
};
```

---

## SnapshotManager

Stores atom state snapshots indexed by event id.

```ts
const snaps = devtools.snapshots;

// Manual snapshot
snaps.capture('counter', state, 'corr-uuid');

// Retrieve
const snap = snaps.getLatest('counter');
const all  = snaps.getAll('counter');
const at   = snaps.getAt('entry-uuid');
snaps.clear('counter');
snaps.clearAll();
```

---

## TimeTravelController

Navigate to any historical snapshot to inspect past state.

```ts
const tt = devtools.timeTravel;

// Jump to snapshot at a specific event id
const result = tt.travelTo('entry-uuid');
if (isLeft(result)) console.error(result.left);  // TimeTravelError

// Return to present
tt.returnToPresent();
```

---

## Browser Bridge (`window.__VI_STATE_FP__`)

Automatically installed when `installBridge: true` (default in browser environments).

```js
// In browser DevTools console:
window.__VI_STATE_FP__.getLog();                  // all DebugEntry[]
window.__VI_STATE_FP__.getSnapshots('counter');    // Snapshot[]
window.__VI_STATE_FP__.timeTravelTo('<entry-id>'); // jump to state
window.__VI_STATE_FP__.returnToPresent();
window.__VI_STATE_FP__.version;                    // bridge semver
```

Using the bridge programmatically:

```ts
import { installBridge, BRIDGE_GLOBAL_KEY } from '@vi/state-fp/devtools';

installBridge(devtools.log, devtools.snapshots, devtools.timeTravel);
// window[BRIDGE_GLOBAL_KEY] is now set
```
