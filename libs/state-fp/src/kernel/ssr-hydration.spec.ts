/**
 * Phase 3.7 — SSR Hydration Protocol.
 *
 * The `ssr` option on `createKernel` lets Angular Universal / Next.js server-rendered
 * state seed atoms before client-side storage adapters run.
 *
 * Priority semantics:
 *  - 'ssr-first'     (default) — SSR applied first; storage overlays on top (storage wins)
 *  - 'storage-first' — storage applied first; SSR overlays on top (SSR wins)
 */

import { describe, it, expect } from 'vitest';
import { createKernel }         from './kernel.js';
import { defineAtom }           from './atom.js';
import { createCommandHandler } from './command.js';
import { domainEvent, createEventApplier } from './event.js';
import { right }                from '../core/either.js';
import { just, nothing }        from '../core/maybe.js';
import type { Command }         from './types.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

type CounterState = { count: number };
type IncrCmd = Command<'counter/increment', { by: number }>;

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

function makeStorageAdapter(storedCount: number | null) {
  return {
    name: 'test' as const,
    get:  async () =>
      storedCount !== null
        ? right(just({ count: storedCount }))
        : right(nothing<CounterState>()),
    set:  async () => right(undefined as void),
    remove: () => Promise.resolve(),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 3.7 — SSR Hydration Protocol', () => {
  it('seeds atoms from SSR payload when no storage is configured', async () => {
    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 0 },
    });

    const kernel = createKernel({
      ssr: {
        source: () => ({ 'vi/counter': { count: 42 } }),
      },
    });
    kernel.register(counter, incrementHandler, counterApplier);
    await kernel.hydrate();

    expect(counter.get().count).toBe(42);
  });

  it('ssr-first: SSR applied first, storage overlays — storage wins for conflicts', async () => {
    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 0 },
      storage:      { adapter: makeStorageAdapter(99) },
    });

    const kernel = createKernel({
      ssr: {
        source:   () => ({ 'vi/counter': { count: 7 } }),
        priority: 'ssr-first',
      },
    });
    kernel.register(counter, incrementHandler, counterApplier);
    await kernel.hydrate();

    // Storage (99) overrides SSR (7) because storage runs second
    expect(counter.get().count).toBe(99);
  });

  it('storage-first: storage applied first, SSR overlays — SSR wins for conflicts', async () => {
    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 0 },
      storage:      { adapter: makeStorageAdapter(99) },
    });

    const kernel = createKernel({
      ssr: {
        source:   () => ({ 'vi/counter': { count: 7 } }),
        priority: 'storage-first',
      },
    });
    kernel.register(counter, incrementHandler, counterApplier);
    await kernel.hydrate();

    // SSR (7) overrides storage (99) because SSR runs second
    expect(counter.get().count).toBe(7);
  });

  it('SSR source errors do not block startup — falls back to storage / initialState', async () => {
    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 0 },
    });

    const kernel = createKernel({
      ssr: {
        source: () => { throw new Error('SSR serialization error'); },
      },
    });
    kernel.register(counter, incrementHandler, counterApplier);

    await expect(kernel.hydrate()).resolves.not.toThrow();
    expect(counter.get().count).toBe(0); // Falls back to initialState
  });

  it('SSR source returning null/undefined is treated as no-op', async () => {
    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 5 },
    });

    const kernel = createKernel({
      ssr: { source: () => null },
    });
    kernel.register(counter, incrementHandler, counterApplier);
    await kernel.hydrate();

    // SSR source returned null → initialState preserved
    expect(counter.get().count).toBe(5);
  });

  it('SSR payload only seeds atoms whose key appears in the payload', async () => {
    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 0 },
    });
    const other = defineAtom<{ name: string }>({
      key:          'vi/other',
      initialState: { name: 'default' },
    });

    const kernel = createKernel({
      ssr: {
        // Only provides 'vi/counter' — 'vi/other' is absent
        source: () => ({ 'vi/counter': { count: 99 } }),
      },
    });
    kernel.register(counter, incrementHandler, counterApplier);
    // 'vi/other' is registered but not in SSR payload
    await kernel.hydrate();

    expect(counter.get().count).toBe(99);
    expect(other.get().name).toBe('default'); // unchanged
  });

  it('without ssr option, hydrate() works exactly as before', async () => {
    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 0 },
      storage:      { adapter: makeStorageAdapter(55) },
    });

    const kernel = createKernel(); // no ssr option
    kernel.register(counter, incrementHandler, counterApplier);
    await kernel.hydrate();

    expect(counter.get().count).toBe(55);
  });

  it('ssr-first with no atom in storage — SSR value is used (storage returns nothing)', async () => {
    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 0 },
      storage:      { adapter: makeStorageAdapter(null) }, // storage has no value
    });

    const kernel = createKernel({
      ssr: {
        source:   () => ({ 'vi/counter': { count: 42 } }),
        priority: 'ssr-first',
      },
    });
    kernel.register(counter, incrementHandler, counterApplier);
    await kernel.hydrate();

    // SSR applied first → { count: 42 }; storage returned nothing → SSR value preserved
    expect(counter.get().count).toBe(42);
  });
});
