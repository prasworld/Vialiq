/**
 * @vi/state-fp/bus — Cross-MFE Domain Event Bus types.
 *
 * The bus is a thin BroadcastChannel wrapper for routing domain events between
 * Micro-Frontend remotes. It does NOT apply state — only routes events cross-frame.
 * No kernel coupling exists in this module.
 */

import type { DomainEvent } from '../kernel/types.js';
import type { Unsubscribe }  from '../kernel/types.js';

// ─── CrossMFEEvent ────────────────────────────────────────────────────────────

/** A domain event annotated with the originating MFE instance ID. */
export type CrossMFEEvent = {
  /** MFE instance that emitted the event. */
  source: string;
  /** The domain event payload. */
  event:  DomainEvent;
};

// ─── EventFilter ─────────────────────────────────────────────────────────────

/** Filter options for `SharedEventBus.subscribe`. */
export type EventFilter = {
  /** Only receive events whose `event.type` matches. */
  type?:   string;
  /** Only receive events emitted by this source MFE. */
  source?: string;
};

// ─── SharedEventBus ───────────────────────────────────────────────────────────

export type SharedEventBus = {
  /**
   * Publish a `CrossMFEEvent` to all subscribers on the channel (including self).
   */
  publish(event: CrossMFEEvent): void;

  /**
   * Subscribe to all events on the bus.
   * Returns an unsubscribe function.
   */
  subscribe(cb: (e: CrossMFEEvent) => void): Unsubscribe;
  /**
   * Subscribe to events matching `filter`.
   * Pass `{}` or omit `filter` to subscribe to all events.
   * Returns an unsubscribe function.
   */
  subscribe(filter: EventFilter, cb: (e: CrossMFEEvent) => void): Unsubscribe;

  /**
   * Close the underlying BroadcastChannel and release all listeners.
   */
  close(): void;

  /** Whether the underlying channel is still open. */
  readonly isOpen: boolean;
};

// ─── SharedBusOptions ─────────────────────────────────────────────────────────

export type SharedBusOptions = {
  /** BroadcastChannel name. All MFEs sharing the same channel must use the same value. */
  channel: string;
};
