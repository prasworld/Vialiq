/**
 * @vi/state-fp — root barrel
 *
 * Re-exports all six sub-modules for convenience. Prefer importing from the
 * specific sub-path for optimal tree-shaking:
 *
 * ```ts
 * import { just, nothing }    from '@vi/state-fp/core';
 * import { createKernel }     from '@vi/state-fp/kernel';
 * import { MemoryAdapter }    from '@vi/state-fp/storage';
 * import { createSyncEngine } from '@vi/state-fp/sync';
 * import { createDevTools }   from '@vi/state-fp/devtools';
 * import { createAdapter }    from '@vi/state-fp/adapter';
 * ```
 */

// ─── @vi/state-fp/core ───────────────────────────────────────────────────────
export type {
  Maybe, Nothing, Just,
  Either, Left, Right,
  IO, IORef,
  Lens, OptionalLens,
  Patch,
} from './core/types.js';

export {
  nothing, just, fromNullable as fromNullableMaybe,
  tryCatch as tryCatchMaybe,
  isNothing, isJust,
  mapMaybe, apMaybe, chainMaybe, flatMapMaybe,
  foldMaybe,
  getOrElse as getOrElseMaybe,
  getOrElseL as getOrElseLMaybe,
  toNullable, maybeToEither, maybeToArray,
  lift2Maybe, filterMaybe,
} from './core/maybe.js';

export {
  left, right, fromNullableEither,
  fromTry as tryCatchEither, fromTryAsync as tryCatchAsyncEither,
  isLeft, isRight,
  mapEither, bimapEither, mapLeft,
  chainEither, flatMapEither,
  foldEither, apEither,
  getOrElse as getOrElseEither,
  getOrElseL as getOrElseLEither,
  eitherToMaybe, sequenceEither, swapEither,
} from './core/either.js';

export {
  io, liftIO, mapIO, chainIO, flatMapIO, apIO,
  sequenceIO, sequenceIO_, replicateIO,
  newIORef, voidIO, tapIO,
} from './core/io.js';

export {
  lens, prop, index as indexLens, optional,
  composeLens, view, over, set as setLens,
} from './core/lens.js';

export {
  pipe, compose, identity, constant, memoize,
  uuid, now, deepClone,
  defaultSerialize, defaultDeserialize, shallowDiff,
} from './core/utils.js';

// ─── @vi/state-fp/kernel ─────────────────────────────────────────────────────
export type {
  Unsubscribe, Command, CommandMeta,
  DomainEvent, DomainEventMeta,
  Query, CommandError,
  AtomDefinition, Atom,
  CommandHandler, EventApplier, QueryHandler,
  KernelPlugin, KernelOptions,
  Kernel,
} from './kernel/types.js';

export {
  defineAtom, statesAreEqual,
} from './kernel/atom.js';

export {
  domainEvent, stampEvent, createEventApplier, DomainEventBus,
} from './kernel/event.js';

export {
  command, createCommandHandler, CommandBus,
} from './kernel/command.js';

export {
  query, createQueryHandler, QueryBus,
} from './kernel/query.js';

export { createKernel } from './kernel/kernel.js';

// ─── @vi/state-fp/storage ────────────────────────────────────────────────────
export type {
  StorageAdapter, StorageEntry, StorageError, StorageResult,
} from './storage/types.js';

export { MemoryAdapter }    from './storage/memory.js';
export { LocalAdapter }     from './storage/local.js';
export { SessionAdapter }   from './storage/session.js';
export { IndexedDbAdapter } from './storage/indexed-db.js';

// ─── @vi/state-fp/sync ───────────────────────────────────────────────────────
export type {
  VersionVector, ConflictStrategy, ConflictResolution, ShareOptions,
  SyncState, SyncMessage,
} from './sync/types.js';

export {
  createVersionVector, increment as incrementVersion, merge as mergeVersions,
  isStale, isConcurrent,
} from './sync/version.js';

export {
  lastWriteWins, firstWriteWins, ownerWins, versionWins, resolveConflict,
} from './sync/conflict.js';

export { createBroadcastBridge } from './sync/broadcast.js';
export { createSyncEngine }      from './sync/sync-engine.js';

// ─── @vi/state-fp/devtools ───────────────────────────────────────────────────
export type {
  DebugEntry, Snapshot, DevToolsBridge, DevToolsOptions,
} from './devtools/types.js';

export { EventLog }        from './devtools/event-log.js';
export { SnapshotManager } from './devtools/snapshot.js';
export { createDevTools }  from './devtools/devtools.js';

// ─── @vi/state-fp/adapter ────────────────────────────────────────────────────
export type { VanillaAdapter } from './adapter/vanilla.js';
export { createAdapter }       from './adapter/vanilla.js';

export type {
  WriteableSignalLike,
  DestroyRefLike,
  AngularAPIs,
  AngularKernelAdapter,
} from './adapter/angular.js';
export { createAngularAdapter } from './adapter/angular.js';
