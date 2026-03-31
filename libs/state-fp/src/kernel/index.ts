/**
 * @vialiq/state-fp/kernel
 *
 * CQRS engine — Command routing, Event application, Query resolution.
 * Depends only on `@vialiq/state-fp/core`. Zero external runtime dependencies.
 *
 * @example
 * import {
 *   defineAtom,
 *   createKernel,
 *   command, domainEvent, query,
 *   createCommandHandler, createEventApplier, createQueryHandler,
 *   // Idiomatic result helpers (re-exported from core for convenience)
 *   ok, err, isOk, isErr, match,
 * } from '@vialiq/state-fp/kernel';
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

// ─── Result helpers (re-exported from core for command-handler ergonomics) ────
// Import these alongside createCommandHandler so you never need a second import.

export type { Either, Result } from '../core/types.js';
export { ok, err, isOk, isErr, match } from '../core/either.js';

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
