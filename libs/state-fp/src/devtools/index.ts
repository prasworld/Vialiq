/**
 * @vi/state-fp/devtools
 *
 * Debug tooling for state-fp: event log, snapshots, time-travel, and a
 * `window.__VI_STATE_FP__` browser bridge for external devtools.
 *
 * Quick start:
 * ```ts
 * import { createKernel }   from '@vi/state-fp/kernel';
 * import { createDevTools } from '@vi/state-fp/devtools';
 *
 * const kernel  = createKernel({ debug: true });
 * const devt    = createDevTools({ maxLogSize: 1000, snapshotEvery: 100 });
 * kernel.use(devt.plugin);
 *
 * // In browser console / DevTools extension:
 * window.__VI_STATE_FP__.getLog();
 * window.__VI_STATE_FP__.timeTravelTo('<event-id>');
 * ```
 *
 * @module
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type {
  DebugEntry,
  Snapshot,
  TimeTravelError,
  DevToolsBridge,
  EventLogInterface,
  SnapshotManagerInterface,
  DevToolsOptions,
} from './types.js';

export type {
  TimeTravelController,
} from './time-travel.js';

export type {
  DevToolsInstance,
} from './devtools.js';

// ─── Classes ──────────────────────────────────────────────────────────────────

export { EventLog }          from './event-log.js';
export { SnapshotManager }   from './snapshot.js';

// ─── Factories ────────────────────────────────────────────────────────────────

export { createTimeTravelController } from './time-travel.js';
export { createDevTools, noopDevTools } from './devtools.js';

// ─── Bridge ───────────────────────────────────────────────────────────────────

export {
  installBridge,
  BRIDGE_GLOBAL_KEY,
  BRIDGE_VERSION,
} from './bridge.js';
