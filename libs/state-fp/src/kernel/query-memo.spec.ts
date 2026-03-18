/**
 * Phase 3.6 — Query Memoisation.
 *
 * When `memo: true` is set on a QueryHandler, the kernel caches the last result
 * and only re-invokes `handle` when the atom state reference or query payload changes.
 * Cache is invalidated by `kernel.hydrate()` and `kernel.destroy()`.
 */

import { describe, it, expect, vi } from 'vitest';
import { createKernel }                          from './kernel.js';
import { defineAtom }                            from './atom.js';
import { command, createCommandHandler }         from './command.js';
import { domainEvent, createEventApplier }       from './event.js';
import { query, createQueryHandler }             from './query.js';
import { right }                                 from '../core/either.js';
import type { Command }                          from './types.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

type CounterState = { count: number };
type IncrCmd = Command<'counter/increment', { by: number }>;
type GetCount = ReturnType<typeof query<'counter/getCount'>>;

const makeCounter = () =>
  defineAtom<CounterState>({ key: 'vi/counter', initialState: { count: 0 } });

const incrementHandler = createCommandHandler<CounterState, IncrCmd>({
  commandType: 'counter/increment',
  handle: (state, cmd) =>
    right([domainEvent('counter/incremented', { by: (cmd as IncrCmd).payload.by })]),
});

const counterApplier = createEventApplier<CounterState>({
  'counter/incremented': (state, event) => ({
    count: state.count + (event as { payload?: { by: number } }).payload!.by,
  }),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 3.6 — Query Memoisation', () => {
  it('memo: true — handle is called only once when state has not changed', () => {
    const handleSpy = vi.fn((state: CounterState) => state.count);

    const memoHandler = createQueryHandler<CounterState, GetCount, number>({
      queryType: 'counter/getCount',
      memo:      true,
      handle:    handleSpy,
    });

    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);
    kernel.registerQuery(counter, memoHandler);

    kernel.query(counter, query('counter/getCount')); // call 1 — populates cache
    kernel.query(counter, query('counter/getCount')); // same state ref → cache hit
    kernel.query(counter, query('counter/getCount')); // same state ref → cache hit

    expect(handleSpy).toHaveBeenCalledTimes(1);
  });

  it('memo: true — handle is re-run after state changes (state reference changes)', () => {
    const handleSpy = vi.fn((state: CounterState) => state.count);

    const memoHandler = createQueryHandler<CounterState, GetCount, number>({
      queryType: 'counter/getCount',
      memo:      true,
      handle:    handleSpy,
    });

    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);
    kernel.registerQuery(counter, memoHandler);

    const r1 = kernel.query<number>(counter, query('counter/getCount')); // call 1
    kernel.execute(counter, command('counter/increment', { by: 3 }));    // mutates state
    const r2 = kernel.query<number>(counter, query('counter/getCount')); // call 2 — new state
    kernel.query(counter, query('counter/getCount'));                     // call 2 state — cache hit

    expect(handleSpy).toHaveBeenCalledTimes(2);
    expect(r1).toBe(0);
    expect(r2).toBe(3);
  });

  it('memo: false (default) — handle is always re-run regardless of state', () => {
    const handleSpy = vi.fn((state: CounterState) => state.count);

    const handler = createQueryHandler<CounterState, GetCount, number>({
      queryType: 'counter/getCount',
      handle:    handleSpy,
      // memo not set → defaults to false
    });

    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);
    kernel.registerQuery(counter, handler);

    kernel.query(counter, query('counter/getCount'));
    kernel.query(counter, query('counter/getCount'));
    kernel.query(counter, query('counter/getCount'));

    expect(handleSpy).toHaveBeenCalledTimes(3);
  });

  it('memo: true — cache is invalidated after kernel.hydrate()', async () => {
    const handleSpy = vi.fn((state: CounterState) => state.count);

    const memoHandler = createQueryHandler<CounterState, GetCount, number>({
      queryType: 'counter/getCount',
      memo:      true,
      handle:    handleSpy,
    });

    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);
    kernel.registerQuery(counter, memoHandler);

    kernel.query(counter, query('counter/getCount')); // call 1 — populates cache
    await kernel.hydrate();                           // clears cache
    kernel.query(counter, query('counter/getCount')); // call 2 — cache cleared

    expect(handleSpy).toHaveBeenCalledTimes(2);
  });

  it('memo: true — different query payload causes cache miss; same payload+state → cache hit', () => {
    type GetByKey = ReturnType<typeof query<'counter/getByKey', { key: string }>>;
    const handleSpy = vi.fn((_state: CounterState, q: GetByKey) => q.payload.key);

    const handler = createQueryHandler<CounterState, GetByKey, string>({
      queryType: 'counter/getByKey',
      memo:      true,
      handle:    handleSpy,
    });

    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);
    kernel.registerQuery(counter as any, handler as any);

    // Single-slot cache: each (stateRef, payloadKey) pair is the full cache key
    kernel.query(counter, query('counter/getByKey', { key: 'a' })); // call 1 — miss
    kernel.query(counter, query('counter/getByKey', { key: 'b' })); // call 2 — miss (different payload)
    kernel.query(counter, query('counter/getByKey', { key: 'b' })); // call 2 state — cache hit
    kernel.query(counter, query('counter/getByKey', { key: 'b' })); // still hit

    expect(handleSpy).toHaveBeenCalledTimes(2);
  });

  it('memo: true — cache is cleared after kernel.destroy()', async () => {
    const handleSpy = vi.fn((state: CounterState) => state.count);

    const memoHandler = createQueryHandler<CounterState, GetCount, number>({
      queryType: 'counter/getCount',
      memo:      true,
      handle:    handleSpy,
    });

    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);
    kernel.registerQuery(counter, memoHandler);

    kernel.query(counter, query('counter/getCount')); // call 1
    await kernel.destroy();

    // Rebuild on a fresh kernel using same atom — cache was cleared
    const kernel2 = createKernel();
    kernel2.register(counter, incrementHandler, counterApplier);
    kernel2.registerQuery(counter, memoHandler);
    kernel2.query(counter, query('counter/getCount')); // call 2 — fresh kernel, no cache

    expect(handleSpy).toHaveBeenCalledTimes(2);
  });
});
