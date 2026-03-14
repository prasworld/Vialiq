/**
 * DevToolsBridge — attaches `window.__VI_STATE_FP__` for browser devtools
 * integration and external tooling.
 *
 * The bridge is purely read-oriented (no writes go through it) except for
 * `timeTravelTo`, which uses the time-travel controller.
 *
 * Install/uninstall is idempotent — multiple calls are safe.
 */

import type { DevToolsBridge } from './types.js';
import type { EventLog }       from './event-log.js';
import type { SnapshotManager } from './snapshot.js';
import type { TimeTravelController } from './time-travel.js';
import type { Atom }           from '../kernel/types.js';

export const BRIDGE_GLOBAL_KEY = '__VI_STATE_FP__';
export const BRIDGE_VERSION    = '0.1.0';

// Augment window for TypeScript consumers
declare global {
  interface Window {
    __VI_STATE_FP__?: DevToolsBridge;
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function installBridge(
  eventLog:    EventLog,
  snapshots:   SnapshotManager,
  timeTravel:  TimeTravelController,
  getAtoms:    () => ReadonlyArray<Atom<unknown>>,
): () => void {
  if (typeof window === 'undefined') {
    return () => { /* no-op in non-browser environments */ };
  }

  const bridge: DevToolsBridge = {
    version: BRIDGE_VERSION,

    getLog() {
      return eventLog.getAll();
    },

    getAtoms() {
      const result: Record<string, unknown> = {};
      for (const atom of getAtoms()) {
        result[atom.key] = atom.get();
      }
      return result;
    },

    async timeTravelTo(id: string): Promise<void> {
      const result = await timeTravel.to(id);
      if (result._tag === 'Left') {
        console.warn(`[@vi/state-fp/devtools] timeTravelTo("${id}") failed:`, result.left.message);
      }
    },

    exportLog() {
      return eventLog.serialize();
    },

    importLog(json: string) {
      eventLog.deserialize(json);
    },
  };

  window[BRIDGE_GLOBAL_KEY] = bridge;

  return function uninstall(): void {
    if (typeof window !== 'undefined') {
      delete window[BRIDGE_GLOBAL_KEY];
    }
  };
}
