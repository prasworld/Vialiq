/**
 * createDevTools — builds a `KernelPlugin` that wires the full devtools stack:
 * EventLog → SnapshotManager → TimeTravelController → DevToolsBridge.
 *
 * Register with `kernel.use(createDevTools())` before any commands are executed.
 *
 * ## Example
 * ```ts
 * import { createKernel } from '@vi/state-fp/kernel';
 * import { createDevTools } from '@vi/state-fp/devtools';
 *
 * const kernel = createKernel({ debug: true });
 * kernel.use(createDevTools({ maxLogSize: 1000, snapshotEvery: 100 }));
 * ```
 */

import type { KernelPlugin, Atom, DomainEvent } from '../kernel/types.js';
import { uuid, now, deepClone }                 from '../core/utils.js';
import type { DevToolsOptions, DebugEntry }      from './types.js';
import { EventLog }                              from './event-log.js';
import { SnapshotManager }                       from './snapshot.js';
import { createTimeTravelController }            from './time-travel.js';
import type { TimeTravelController }             from './time-travel.js';
import { installBridge }                         from './bridge.js';

// ─── Public shape returned alongside the plugin ───────────────────────────────

export type DevToolsInstance = {
  /** The kernel plugin (pass to `kernel.use()`). */
  plugin:      KernelPlugin;
  /** Direct access to the event log. */
  eventLog:    EventLog;
  /** Direct access to snapshots. */
  snapshots:   SnapshotManager;
  /** Time-travel controller for programmatic navigation. */
  timeTravel:  TimeTravelController;
  /** Uninstall the `window.__VI_STATE_FP__` bridge. */
  uninstall(): void;
};

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createDevTools(options: DevToolsOptions = {}): DevToolsInstance {
  const {
    maxLogSize    = 500,
    maxSnapshots  = 30,
    snapshotEvery = 50,
    installBridge: doInstall = typeof window !== 'undefined',
  } = options;

  const eventLog   = new EventLog(maxLogSize);
  const snapshots  = new SnapshotManager(maxSnapshots);

  // Atom registry tracked by the plugin
  const atoms = new Map<string, Atom<unknown>>();

  // Time-travel controller — reads from atoms map via closure
  const timeTravel = createTimeTravelController(
    () => atoms.values(),
    eventLog,
    snapshots,
  );

  // Install window bridge (lazily — atoms map grows as kernel registers them)
  let uninstall = () => { /* no-op */ };
  if (doInstall) {
    uninstall = installBridge(
      eventLog,
      snapshots,
      timeTravel,
      () => [...atoms.values()],
    );
  }

  // ─── KernelPlugin ──────────────────────────────────────────────────────────

  const plugin: KernelPlugin = {
    name: '@vi/devtools',

    onRegister(atom) {
      // Track atoms so time-travel controller can access them
      atoms.set(atom.key, atom);
    },

    onExecute(params) {
      for (const event of params.events) {
        const entry: DebugEntry = {
          id:            uuid(),
          atomKey:       params.atomKey,
          correlationId: event.meta.correlationId,
          causationId:   event.meta.causationId,
          commandType:   params.command.type,
          event,
          stateBefore:   deepClone(params.prevState),
          stateAfter:    deepClone(params.nextState),
          timestamp:     now(),
          version:       event.meta.version,
        };
        eventLog.append(entry);

        // Auto-snapshot every N events
        if (snapshotEvery > 0 && eventLog.totalCount % snapshotEvery === 0) {
          const atomStates: Record<string, unknown> = {};
          for (const [key, a] of atoms) atomStates[key] = a.get();
          snapshots.capture(atomStates, entry.id, eventLog.totalCount);
        }
      }
    },
  };

  return { plugin, eventLog, snapshots, timeTravel, uninstall };
}
