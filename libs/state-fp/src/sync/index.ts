/**
 * @vialiq/state-fp/sync
 *
 * Cross-tab and cross-worker atom synchronisation powered by BroadcastChannel.
 *
 * Quick start:
 * ```ts
 * import { createKernel, defineAtom } from '@vialiq/state-fp/kernel';
 * import { createSyncEngine }         from '@vialiq/state-fp/sync';
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
  SyncTransport,
} from './types.js';

export type { Candidate }          from './conflict.js';
export type { MessageListener,
              BroadcastBridge }    from './broadcast.js';
export type { KernelLike,
              SyncEngine,
              SyncEngineOptions,
              TransportFactory }  from './sync-engine.js';

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

// ─── Transport (Phase 4.6) ────────────────────────────────────────────────────

export type {
  PostMessageTransportOptions,
  PostMessageRelayOptions,
  PostMessageRelay,
} from './transport.js';

export {
  createNoopTransport,
  createAutoTransport,
  createPostMessageTransport,
  createPostMessageRelay,
} from './transport.js';

// ─── SyncEngine ───────────────────────────────────────────────────────────────

export { createSyncEngine } from './sync-engine.js';
