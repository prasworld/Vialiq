/**
 * @vi/state-fp/bus — SharedEventBus implementation.
 *
 * Thin BroadcastChannel wrapper for cross-MFE domain event routing.
 * Publish domain events from one MFE; subscribe in another.
 *
 * ## Usage
 * ```ts
 * // shell MFE — forward kernel events onto the bus
 * const bus = createSharedBus({ channel: 'vi-events' });
 * kernel.onEvent(e => bus.publish({ source: 'shell', event: e }));
 *
 * // notification MFE — react to specific events
 * const bus = createSharedBus({ channel: 'vi-events' });
 * bus.subscribe({ type: 'order/placed' }, e => showToast(e.event));
 * ```
 */

import type {
  CrossMFEEvent,
  EventFilter,
  SharedEventBus,
  SharedBusOptions,
} from './types.js';

// ─── Wire format ──────────────────────────────────────────────────────────────

type BusWireMessage = CrossMFEEvent;

// ─── createSharedBus ─────────────────────────────────────────────────────────

/**
 * Create a `SharedEventBus` backed by a `BroadcastChannel`.
 *
 * Gracefully handles unavailable BroadcastChannel environments (SSR / Node.js)
 * by returning a fully functional no-op bus that never throws.
 */
export function createSharedBus({ channel }: SharedBusOptions): SharedEventBus {
  // Graceful degradation in SSR / Node.js / test environments without BroadcastChannel
  if (typeof BroadcastChannel === 'undefined') {
    return createNoopBus();
  }

  const bc       = new BroadcastChannel(channel);
  let   _isOpen  = true;

  // Subscriber registry: store filter + callback pairs
  const subscribers = new Set<{ filter: EventFilter; cb: (e: CrossMFEEvent) => void }>();

  bc.onmessage = (ev: MessageEvent<unknown>) => {
    let msg: BusWireMessage;
    try {
      msg = (typeof ev.data === 'string'
        ? JSON.parse(ev.data)
        : ev.data) as BusWireMessage;
    } catch {
      return; // malformed — ignore
    }
    dispatch(msg);
  };

  function dispatch(msg: CrossMFEEvent): void {
    for (const { filter, cb } of subscribers) {
      if (filter.type   !== undefined && filter.type   !== msg.event.type) continue;
      if (filter.source !== undefined && filter.source !== msg.source)     continue;
      try { cb(msg); } catch { /* isolate subscriber errors */ }
    }
  }

  return {
    publish(event: CrossMFEEvent): void {
      if (!_isOpen) return;
      // Dispatch locally to own subscribers (BroadcastChannel doesn't echo to self)
      dispatch(event);
      // Guard against non-serializable payloads (circular refs, BigInt, etc.) —
      // remote delivery is skipped but local dispatch above already succeeded.
      try {
        bc.postMessage(JSON.stringify(event));
      } catch {
        // payload not serializable — local subscribers already notified above
      }
    },

    subscribe(filter: EventFilter = {}, cb?: (e: CrossMFEEvent) => void) {
      // Support both overloads: subscribe(cb) and subscribe(filter, cb)
      const actualCb = cb ?? (filter as any);
      const actualFilter = typeof (filter as any) === 'function' ? {} : filter;
      
      const entry = { filter: actualFilter, cb: actualCb };
      subscribers.add(entry);
      return () => subscribers.delete(entry);
    },

    close(): void {
      if (!_isOpen) return;
      _isOpen = false;
      subscribers.clear();
      bc.close();
    },

    get isOpen(): boolean {
      return _isOpen;
    },
  };
}

// ─── No-op bus (SSR / Node.js) ────────────────────────────────────────────────

function createNoopBus(): SharedEventBus {
  return {
    publish:   () => void 0,
    subscribe: () => () => void 0,
    close:     () => void 0,
    isOpen:    false,
  };
}
