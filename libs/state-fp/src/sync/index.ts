/**
 * @vi/state-fp/sync
 *
 * Cross-tab and cross-worker atom synchronisation powered by BroadcastChannel.
 *
 * Quick start:
 * ```ts
 * import { createKernel, defineAtom } from '@vi/state-fp/kernel';
 * import { createSyncEngine }         from '@vi/state-fp/sync';
 *
 * const kernel = createKernel();
 * const counter = defineAtom({ key: 'counter', initialState: 0 });
 *
 * const sync   = createSyncEngine({ kernel });
 * const unsync = sync.share(counter, { conflict: 'last-write-wins' });
 * ```
 *
 * @module
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type {
  VersionVector,
  ConflictStrategy,
  CustomConflictResolver,
  ConflictResolution,
  ShareOptions,
  SyncState,
  SyncMessage,
  HelloMessage,
  StateMessage,
  RequestMessage,
  EventMessage,
} from './types.js';

export type { Candidate }          from './conflict.js';
export type { MessageListener,
              BroadcastBridge }    from './broadcast.js';
export type { KernelLike,
              SyncEngine,
              SyncEngineOptions }  from './sync-engine.js';

// ─── Version vector ───────────────────────────────────────────────────────────

export {
  createVersionVector,
  emptyVersionVector,
  increment,
  merge,
  isStale,
  isGap,
  dominates,
  isConcurrent,
  vectorsEqual,
  clockSum,
} from './version.js';

// ─── Conflict resolution ──────────────────────────────────────────────────────

export {
  lastWriteWins,
  firstWriteWins,
  ownerWins,
  versionWins,
  resolveConflict,
} from './conflict.js';

// ─── BroadcastBridge ─────────────────────────────────────────────────────────

export { createBroadcastBridge } from './broadcast.js';

// ─── SyncEngine ───────────────────────────────────────────────────────────────

export { createSyncEngine } from './sync-engine.js';
