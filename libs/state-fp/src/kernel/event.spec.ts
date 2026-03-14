import { describe, it, expect, vi } from 'vitest';
import {
  domainEvent,
  stampEvent,
  createEventApplier,
  DomainEventBus,
} from './event.js';
import type { DomainEvent } from './types.js';

// ─── domainEvent() factory ───────────────────────────────────────────────────

describe('domainEvent', () => {
  it('sets _kind to DomainEvent', () => {
    expect(domainEvent('counter/incremented')._kind).toBe('DomainEvent');
  });

  it('sets the event type', () => {
    expect(domainEvent('user/loggedIn').type).toBe('user/loggedIn');
  });

  it('attaches a payload', () => {
    const e = domainEvent('counter/incremented', { by: 3 });
    expect((e as { payload: { by: number } }).payload).toEqual({ by: 3 });
  });

  it('initialises meta fields to empty/zero (will be stamped by kernel)', () => {
    const e = domainEvent('x');
    expect(e.meta.id).toBe('');
    expect(e.meta.correlationId).toBe('');
    expect(e.meta.version).toBe(0);
  });
});

// ─── stampEvent() ────────────────────────────────────────────────────────────

describe('stampEvent', () => {
  it('fills meta with the provided options', () => {
    const raw = domainEvent('counter/incremented') as DomainEvent;
    const stamped = stampEvent(raw, {
      correlationId: 'corr-1',
      causationId:   'cause-1',
      atomKey:       'vi/counter',
      version:       3,
    });

    expect(stamped.meta.correlationId).toBe('corr-1');
    expect(stamped.meta.causationId).toBe('cause-1');
    expect(stamped.meta.atomKey).toBe('vi/counter');
    expect(stamped.meta.version).toBe(3);
    expect(typeof stamped.meta.id).toBe('string');
    expect(stamped.meta.id.length).toBeGreaterThan(0);
    expect(stamped.meta.timestamp).toBeGreaterThan(0);
  });

  it('does not mutate the original event', () => {
    const raw = domainEvent('x') as DomainEvent;
    const originalId = raw.meta.id;
    stampEvent(raw, { correlationId: 'c', causationId: 'c', atomKey: 'a', version: 1 });
    expect(raw.meta.id).toBe(originalId);
  });
});

// ─── createEventApplier() ────────────────────────────────────────────────────

describe('createEventApplier', () => {
  type CounterState = { count: number };

  const applier = createEventApplier<CounterState>({
    'counter/incremented': (state, event) => ({
      count: state.count + (event as DomainEvent<string, { by: number }>).payload!.by,
    }),
  });

  it('applies a matching event type', () => {
    const e = domainEvent('counter/incremented', { by: 5 }) as DomainEvent;
    const next = applier({ count: 0 }, e);
    expect(next.count).toBe(5);
  });

  it('passes through state for unknown event types', () => {
    const e = domainEvent('unknown/event') as DomainEvent;
    const state = { count: 10 };
    expect(applier(state, e)).toBe(state); // same reference — not copied
  });
});

// ─── DomainEventBus ───────────────────────────────────────────────────────────

describe('DomainEventBus', () => {
  it('starts with no listeners', () => {
    const bus = new DomainEventBus();
    expect(bus.size).toBe(0);
  });

  it('subscribe adds a listener', () => {
    const bus = new DomainEventBus();
    bus.subscribe(() => void 0);
    expect(bus.size).toBe(1);
  });

  it('emit calls all listeners synchronously', () => {
    const bus     = new DomainEventBus();
    const received: DomainEvent[] = [];

    bus.subscribe(e => received.push(e));
    const e1 = domainEvent('a') as DomainEvent;
    const e2 = domainEvent('b') as DomainEvent;
    bus.emit([e1, e2]);

    expect(received).toHaveLength(2);
    expect(received[0].type).toBe('a');
    expect(received[1].type).toBe('b');
  });

  it('fans out to multiple listeners', () => {
    const bus  = new DomainEventBus();
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    bus.subscribe(spy1);
    bus.subscribe(spy2);

    bus.emit([domainEvent('x') as DomainEvent]);

    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });

  it('unsubscribe removes the listener', () => {
    const bus  = new DomainEventBus();
    const spy  = vi.fn();
    const unsub = bus.subscribe(spy);

    unsub();
    bus.emit([domainEvent('y') as DomainEvent]);

    expect(spy).not.toHaveBeenCalled();
    expect(bus.size).toBe(0);
  });

  it('emit is a no-op when there are no listeners', () => {
    const bus = new DomainEventBus();
    // Should not throw
    expect(() => bus.emit([domainEvent('z') as DomainEvent])).not.toThrow();
  });

  it('clear() removes all listeners', () => {
    const bus  = new DomainEventBus();
    const spy  = vi.fn();
    bus.subscribe(spy);
    bus.clear();

    bus.emit([domainEvent('a') as DomainEvent]);

    expect(spy).not.toHaveBeenCalled();
    expect(bus.size).toBe(0);
  });
});
