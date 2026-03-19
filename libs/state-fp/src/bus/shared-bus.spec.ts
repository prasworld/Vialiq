/**
 * Phase 4.5 — Shared Event Bus tests.
 *
 * `createSharedBus` routes CrossMFEEvents over a BroadcastChannel.
 * Tests cover: publish/subscribe, type filter, source filter, combined filter,
 * unsubscribe cleanup, local echo (self-delivery), and cross-bus delivery.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSharedBus }  from './shared-bus.js';
import type { CrossMFEEvent } from './types.js';

// ─── FakeBroadcastChannel ────────────────────────────────────────────────────

class FakeBroadcastChannel {
  static channels = new Map<string, Set<FakeBroadcastChannel>>();

  readonly name: string;
  onmessage: ((ev: MessageEvent) => void) | null = null;

  constructor(name: string) {
    this.name = name;
    if (!FakeBroadcastChannel.channels.has(name)) {
      FakeBroadcastChannel.channels.set(name, new Set());
    }
    FakeBroadcastChannel.channels.get(name)!.add(this);
  }

  postMessage(data: unknown): void {
    const peers = FakeBroadcastChannel.channels.get(this.name) ?? new Set();
    for (const peer of peers) {
      if (peer === this) continue; // BroadcastChannel does not echo to sender
      peer.onmessage?.({ data } as MessageEvent);
    }
  }

  close(): void {
    FakeBroadcastChannel.channels.get(this.name)?.delete(this);
  }
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeEvent(type: string, source: string): CrossMFEEvent {
  return {
    source,
    event: { _kind: 'DomainEvent', type, meta: { correlationId: 'c1', causationId: 'c1', timestamp: 0, atomKey: 'a', version: 1 } },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 4.5 — SharedEventBus', () => {
  beforeEach(() => {
    (globalThis as any).BroadcastChannel = FakeBroadcastChannel;
  });

  afterEach(() => {
    delete (globalThis as any).BroadcastChannel;
    FakeBroadcastChannel.channels.clear();
  });

  it('delivers published events to subscribers on the same bus instance (local echo)', () => {
    const bus = createSharedBus({ channel: 'vi-events' });
    const received: CrossMFEEvent[] = [];
    bus.subscribe({}, e => received.push(e));

    const evt = makeEvent('order/placed', 'shell');
    bus.publish(evt);

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual(evt);
    bus.close();
  });

  it('delivers published events to a second bus on the same channel (cross-MFE delivery)', async () => {
    const busA = createSharedBus({ channel: 'vi-events' });
    const busB = createSharedBus({ channel: 'vi-events' });

    const received: CrossMFEEvent[] = [];
    busB.subscribe({}, e => received.push(e));

    busA.publish(makeEvent('cart/item-added', 'shell'));

    // BroadcastChannel delivery is synchronous in FakeBroadcastChannel
    expect(received).toHaveLength(1);
    expect(received[0].event.type).toBe('cart/item-added');

    busA.close();
    busB.close();
  });

  it('filter by type — only matching event types are received', () => {
    const bus = createSharedBus({ channel: 'vi-events' });
    const received: string[] = [];

    bus.subscribe({ type: 'order/placed' }, e => received.push(e.event.type));

    bus.publish(makeEvent('order/placed',   'shell'));   // match
    bus.publish(makeEvent('cart/cleared',   'shell'));   // not match
    bus.publish(makeEvent('order/placed',   'remote1')); // match
    bus.publish(makeEvent('auth/logged-out', 'remote2')); // not match

    expect(received).toEqual(['order/placed', 'order/placed']);
    bus.close();
  });

  it('filter by source — only events from the specified MFE are received', () => {
    const bus = createSharedBus({ channel: 'vi-events' });
    const received: string[] = [];

    bus.subscribe({ source: 'remote1' }, e => received.push(e.source));

    bus.publish(makeEvent('x', 'shell'));    // not match
    bus.publish(makeEvent('y', 'remote1')); // match
    bus.publish(makeEvent('z', 'remote1')); // match
    bus.publish(makeEvent('w', 'remote2')); // not match

    expect(received).toEqual(['remote1', 'remote1']);
    bus.close();
  });

  it('combined filter — both type AND source must match', () => {
    const bus = createSharedBus({ channel: 'vi-events' });
    const received: CrossMFEEvent[] = [];

    bus.subscribe({ type: 'order/placed', source: 'remote1' }, e => received.push(e));

    bus.publish(makeEvent('order/placed', 'shell'));    // wrong source
    bus.publish(makeEvent('cart/cleared', 'remote1')); // wrong type
    bus.publish(makeEvent('order/placed', 'remote1')); // match

    expect(received).toHaveLength(1);
    bus.close();
  });

  it('unsubscribe removes listener — no further events received after unsubscribe', () => {
    const bus = createSharedBus({ channel: 'vi-events' });
    const received: CrossMFEEvent[] = [];

    const unsub = bus.subscribe({}, e => received.push(e));
    bus.publish(makeEvent('a', 's'));

    unsub(); // remove listener

    bus.publish(makeEvent('b', 's'));
    bus.publish(makeEvent('c', 's'));

    expect(received).toHaveLength(1); // only the first event
    bus.close();
  });

  it('multiple subscribers on the same bus each receive events independently', () => {
    const bus = createSharedBus({ channel: 'vi-events' });
    const a: string[] = [];
    const b: string[] = [];

    bus.subscribe({ type: 'ping' }, e => a.push(e.event.type));
    bus.subscribe({ type: 'pong' }, e => b.push(e.event.type));

    bus.publish(makeEvent('ping', 's'));
    bus.publish(makeEvent('pong', 's'));
    bus.publish(makeEvent('ping', 's'));

    expect(a).toEqual(['ping', 'ping']);
    expect(b).toEqual(['pong']);
    bus.close();
  });

  it('degrades gracefully when BroadcastChannel is unavailable (no-op bus)', () => {
    delete (globalThis as any).BroadcastChannel;

    const bus = createSharedBus({ channel: 'vi-events' });
    expect(bus.isOpen).toBe(false);

    // publish and subscribe should not throw
    expect(() => bus.publish(makeEvent('x', 's'))).not.toThrow();
    const unsub = bus.subscribe({}, () => {});
    expect(() => unsub()).not.toThrow();
    expect(() => bus.close()).not.toThrow();
  });

  it('close() stops delivery and releases listeners', () => {
    const bus = createSharedBus({ channel: 'vi-events' });
    const received: CrossMFEEvent[] = [];
    bus.subscribe({}, e => received.push(e));

    bus.publish(makeEvent('before-close', 's'));
    bus.close();

    // After close, publish is a no-op
    bus.publish(makeEvent('after-close', 's'));

    expect(received).toHaveLength(1);
    expect(received[0].event.type).toBe('before-close');
  });
});
