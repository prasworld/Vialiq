/**
 * @vi/state-fp/kernel
 *
 * CQRS engine — Command routing, Event application, Query resolution.
 * Depends only on `@vi/state-fp/core`. Zero external runtime dependencies.
 *
 * @example
 * import {
 *   defineAtom,
 *   createKernel,
 *   command, domainEvent, query,
 *   createCommandHandler, createEventApplier, createQueryHandler,
 * } from '@vi/state-fp/kernel';
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type {
  // CQRS primitives
  Command,
  CommandMeta,
  DomainEvent,
  DomainEventMeta,
  Query,
  CommandError,
  // Handlers
  CommandHandler,
  AsyncCommandHandler,
  AsyncHandlerContext,
  EventApplier,
  QueryHandler,
  // Atom
  Atom,
  AtomDefinition,
  ComputedAtom,
  ComputedAtomDefinition,
  AtomStorageConfig,
  StorageAdapterLike,
  // Plugin + debug
  KernelPlugin,
  DebugInterface,
  KernelDebugEntry,
  KernelOptions,
  SsrHydrationOptions,
  ExecuteOptimisticOptions,
  // Kernel
  Kernel,
  // Utility
  Unsubscribe,
} from './types.js';

// ─── Atom ─────────────────────────────────────────────────────────────────────

export { defineAtom, defineComputedAtom, statesAreEqual } from './atom.js';

// ─── DomainEvent ──────────────────────────────────────────────────────────────

export {
  domainEvent,
  createEventApplier,
  DomainEventBus,
} from './event.js';

// ─── Command ──────────────────────────────────────────────────────────────────

export {
  command,
  createCommandHandler,
} from './command.js';

// ─── Query ────────────────────────────────────────────────────────────────────

export {
  query,
  createQueryHandler,
} from './query.js';

// ─── Kernel ───────────────────────────────────────────────────────────────────

export { createKernel } from './kernel.js';
