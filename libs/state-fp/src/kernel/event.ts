/**
 * @vi/state-fp/kernel — DomainEvent types, factory, EventApplier, DomainEventBus.
 *
 * DomainEvents are immutable facts — they record what happened, not why.
 * Events are produced by CommandHandlers and cannot fail.
 * EventAppliers fold events into the next state (used for both execution and replay).
 */

import { uuid, now } from '../core/utils.js';
import type { DomainEvent, DomainEventMeta, EventApplier } from './types.js';

// ─── DomainEvent factory ──────────────────────────────────────────────────────

/**
 * Construct a DomainEvent value.
 * The kernel stamps `meta` (id, correlationId, causationId, atomKey, version, timestamp)
 * before delivering to appliers — callers only provide type + payload.
 *
 * @example
 * domainEvent('counter/incremented', { by: 3 })
 */
export function domainEvent<T extends string>(type: T): DomainEvent<T>;
export function domainEvent<T extends string, P>(type: T, payload: P): DomainEvent<T, P>;
export function domainEvent<T extends string, P>(
  type: T,
  payload?: P,
): DomainEvent<T, P> | DomainEvent<T> {
  // Produce an unstamped event; meta will be filled by the kernel pipeline.
  const partialMeta: DomainEventMeta = {
    id:            '',   // stamped by kernel
    correlationId: '',   // stamped by kernel
    causationId:   '',   // stamped by kernel
    atomKey:       '',   // stamped by kernel
    timestamp:     0,    // stamped by kernel
    version:       0,    // stamped by kernel
  };

  if (payload === undefined) {
    return { _kind: 'DomainEvent', type, meta: partialMeta } as DomainEvent<T>;
  }
  return { _kind: 'DomainEvent', type, payload, meta: partialMeta } as DomainEvent<T, P>;
}

/** Stamp a DomainEvent with full metadata (called internally by the kernel). */
export function stampEvent<E extends DomainEvent>(
  event:         E,
  opts: {
    correlationId: string;
    causationId:   string;
    atomKey:       string;
    version:       number;
  },
): E {
  const meta: DomainEventMeta = {
    id:            uuid(),
    correlationId: opts.correlationId,
    causationId:   opts.causationId,
    atomKey:       opts.atomKey,
    timestamp:     now(),
    version:       opts.version,
  };
  return { ...event, meta };
}

// ─── EventApplier factory ─────────────────────────────────────────────────────

/**
 * Build an EventApplier from a map of `{ [eventType]: (state, event) => state }`.
 * Unknown event types are silently passed through (state unchanged).
 *
 * @example
 * const counterApplier = createEventApplier<CounterState>({
 *   'counter/incremented': (state, event) => ({ count: state.count + event.payload.by }),
 * });
 */
export function createEventApplier<S>(
  handlers: { [eventType: string]: (state: S, event: DomainEvent) => S },
): EventApplier<S> {
  return (state: S, event: DomainEvent): S => {
    const handler = handlers[event.type];
    return handler ? handler(state, event) : state;
  };
}

// ─── DomainEventBus ───────────────────────────────────────────────────────────

type EventListener = (event: DomainEvent) => void;

/**
 * A lightweight synchronous pub-sub bus for DomainEvents.
 * Used internally by the kernel; exposed so devtools / sync modules can listen.
 *
 * - No RxJS, no Subjects
 * - Synchronous fan-out (listeners receive events inline on the call stack)
 * - Listeners do not affect the kernel's return value
 */
export class DomainEventBus {
  #listeners = new Set<EventListener>();

  /** Register a global listener for all DomainEvents emitted by the kernel. */
  subscribe(listener: EventListener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  /** @internal — called by the kernel after each successful execute. */
  emit(events: DomainEvent[]): void {
    if (this.#listeners.size === 0) return;
    for (const event of events) {
      this.#listeners.forEach(fn => fn(event));
    }
  }

  /** Remove all listeners. Called by kernel.destroy(). */
  clear(): void {
    this.#listeners.clear();
  }

  get size(): number {
    return this.#listeners.size;
  }
}
