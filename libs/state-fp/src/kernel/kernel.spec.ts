/**
 * Integration tests for createKernel().
 *
 * Covers:
 *  - register → execute → subscribe pipeline
 *  - Right on success, Left on validation failure, Left on NO_HANDLER
 *  - query after execute
 *  - onEvent listener called after execute
 *  - Plugin hooks (onExecute, onError, onRegister, onDestroy)
 *  - hydrate with mock storage adapter
 *  - Phase 1.3: co-located registration via atom.definition.commands/applier/queries
 *  - Phase 1.4: executeAsync with real AsyncCommandHandler + AbortSignal cancellation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createKernel } from './kernel.js';
import { defineAtom } from './atom.js';
import { command, createCommandHandler } from './command.js';
import { domainEvent, createEventApplier } from './event.js';
import { query, createQueryHandler } from './query.js';
import { right, left } from '../core/either.js';
import { just, nothing } from '../core/maybe.js';
import type {
  Kernel,
  Command,
  DomainEvent,
  KernelPlugin,
  AsyncCommandHandler,
  AsyncHandlerContext,
} from './types.js';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

type CounterState = { count: number };

const makeCounter = () =>
  defineAtom<CounterState>({ key: 'vi/counter', initialState: { count: 0 } });

type IncrCmd = Command<'counter/increment', { by: number }>;
type DecrCmd = Command<'counter/decrement', { by: number }>;
type GetCount = ReturnType<typeof query<'counter/getCount'>>;

const incrementHandler = createCommandHandler<CounterState, IncrCmd>({
  commandType: 'counter/increment',
  handle: (state, cmd) =>
    (cmd as IncrCmd).payload.by > 0
      ? right([domainEvent('counter/incremented', { by: (cmd as IncrCmd).payload.by })])
      : left({ code: 'INVALID', message: 'n must be positive' }),
});

const counterApplier = createEventApplier<CounterState>({
  'counter/incremented': (state, event) => ({
    count: state.count + (event as DomainEvent<string, { by: number }>).payload!.by,
  }),
  'counter/decremented': (state, event) => ({
    count: state.count - (event as DomainEvent<string, { by: number }>).payload!.by,
  }),
});

const getCountHandler = createQueryHandler<CounterState, GetCount, number>({
  queryType: 'counter/getCount',
  handle:   (state) => state.count,
});

// ─── Basic execute ────────────────────────────────────────────────────────────

describe('execute — success path', () => {
  it('returns Right with new state after a successful command', () => {
    const kernel  = createKernel();
    const counter = makeCounter();

    kernel.register(counter, incrementHandler, counterApplier);
    const result = kernel.execute(counter, command('counter/increment', { by: 3 }));

    expect(result._tag).toBe('Right');
    expect((result as { right: CounterState }).right.count).toBe(3);
  });

  it('mutates the atom state after successful execute', () => {
    const kernel  = createKernel();
    const counter = makeCounter();

    kernel.register(counter, incrementHandler, counterApplier);
    kernel.execute(counter, command('counter/increment', { by: 5 }));

    expect(counter.get().count).toBe(5);
  });

  it('accumulates state across multiple commands', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);

    kernel.execute(counter, command('counter/increment', { by: 1 }));
    kernel.execute(counter, command('counter/increment', { by: 4 }));
    kernel.execute(counter, command('counter/increment', { by: 10 }));

    expect(counter.get().count).toBe(15);
  });
});

describe('execute — error paths', () => {
  it('returns Left(NO_HANDLER) when no handler is registered', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    const result  = kernel.execute(counter, command('counter/increment', { by: 1 }));

    expect(result._tag).toBe('Left');
    expect((result as { left: { code: string } }).left.code).toBe('NO_HANDLER');
  });

  it('returns Left from the handler for invalid commands', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);

    const result = kernel.execute(counter, command('counter/increment', { by: -1 }));
    expect(result._tag).toBe('Left');
    expect((result as { left: { code: string } }).left.code).toBe('INVALID');
  });

  it('does NOT change atom state when the handler returns Left', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);

    kernel.execute(counter, command('counter/increment', { by: -5 }));
    expect(counter.get().count).toBe(0);
  });
});

// ─── subscribe ────────────────────────────────────────────────────────────────

describe('subscribe', () => {
  it('notifies listeners on successful execute', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);

    const received: CounterState[] = [];
    kernel.subscribe(counter, s => received.push(s));
    kernel.execute(counter, command('counter/increment', { by: 2 }));

    expect(received).toHaveLength(1);
    expect(received[0].count).toBe(2);
  });

  it('does NOT notify listeners when handler returns Left', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);

    const spy = vi.fn();
    kernel.subscribe(counter, spy);
    kernel.execute(counter, command('counter/increment', { by: -1 }));

    expect(spy).not.toHaveBeenCalled();
  });

  it('unsubscribe stops notifications', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);

    const spy   = vi.fn();
    const unsub = kernel.subscribe(counter, spy);
    kernel.execute(counter, command('counter/increment', { by: 1 }));
    unsub();
    kernel.execute(counter, command('counter/increment', { by: 1 }));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

// ─── onEvent ──────────────────────────────────────────────────────────────────

describe('onEvent', () => {
  it('emits stamped DomainEvents after successful execute', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);

    const events: DomainEvent[] = [];
    kernel.onEvent(e => events.push(e));
    kernel.execute(counter, command('counter/increment', { by: 3 }));

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('counter/incremented');
    expect(events[0].meta.correlationId).toBeTruthy();
    expect(events[0].meta.atomKey).toBe('vi/counter');
  });

  it('does NOT emit when handler returns Left', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);

    const spy = vi.fn();
    kernel.onEvent(spy);
    kernel.execute(counter, command('counter/increment', { by: -1 }));
    expect(spy).not.toHaveBeenCalled();
  });

  it('onEvent unsubscribe works', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);

    const spy   = vi.fn();
    const unsub = kernel.onEvent(spy);
    kernel.execute(counter, command('counter/increment', { by: 1 }));
    unsub();
    kernel.execute(counter, command('counter/increment', { by: 1 }));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

// ─── query ────────────────────────────────────────────────────────────────────

describe('query', () => {
  it('returns a derived value from the atom state', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);
    kernel.registerQuery(counter, getCountHandler);

    kernel.execute(counter, command('counter/increment', { by: 7 }));
    const count = kernel.query<number>(counter, query('counter/getCount'));
    expect(count).toBe(7);
  });

  it('throws when no query handler is registered', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    expect(() =>
      kernel.query(counter, query('counter/getCount')),
    ).toThrow();
  });
});

// ─── Plugin hooks ─────────────────────────────────────────────────────────────

describe('plugin hooks', () => {
  it('calls onRegister when register() is called', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    const onRegister = vi.fn();
    kernel.use({ onRegister });

    kernel.register(counter, incrementHandler, counterApplier);
    expect(onRegister).toHaveBeenCalledWith(counter);
  });

  it('calls onExecute after successful execute', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    const onExecute = vi.fn();
    kernel.use({ onExecute });

    kernel.register(counter, incrementHandler, counterApplier);
    kernel.execute(counter, command('counter/increment', { by: 1 }));

    expect(onExecute).toHaveBeenCalledTimes(1);
    const call = onExecute.mock.calls[0][0];
    expect(call.atomKey).toBe('vi/counter');
    expect(call.nextState.count).toBe(1);
    expect(call.prevState.count).toBe(0);
  });

  it('calls onError when the handler returns Left', () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    const onError = vi.fn();
    kernel.use({ onError });

    kernel.register(counter, incrementHandler, counterApplier);
    kernel.execute(counter, command('counter/increment', { by: -1 }));

    expect(onError).toHaveBeenCalledTimes(1);
    const call = onError.mock.calls[0][0];
    expect(call.error.code).toBe('INVALID');
  });

  it('calls onDestroy when destroy() is called', async () => {
    const kernel    = createKernel();
    const onDestroy = vi.fn();
    kernel.use({ onDestroy });

    await kernel.destroy();
    expect(onDestroy).toHaveBeenCalledTimes(1);
  });
});

// ─── hydrate ─────────────────────────────────────────────────────────────────

describe('hydrate', () => {
  it('loads state from a storage adapter', async () => {
    const savedState: CounterState = { count: 42 };

    const mockAdapter = {
      get: vi.fn().mockResolvedValue(just(savedState)),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 0 },
      storage:      { adapter: mockAdapter },
    });

    const kernel = createKernel();
    kernel.register(counter, incrementHandler, counterApplier);
    await kernel.hydrate();

    expect(counter.get().count).toBe(42);
    expect(mockAdapter.get).toHaveBeenCalledWith('vi/counter');
  });

  it('does not change state when the adapter returns Nothing', async () => {
    const mockAdapter = {
      get: vi.fn().mockResolvedValue(nothing()),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 0 },
      storage:      { adapter: mockAdapter },
    });

    const kernel = createKernel();
    kernel.register(counter, incrementHandler, counterApplier);
    await kernel.hydrate();

    expect(counter.get().count).toBe(0);
  });

  it('silently handles storage read failures', async () => {
    const mockAdapter = {
      get: vi.fn().mockRejectedValue(new Error('storage offline')),
      set: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 0 },
      storage:      { adapter: mockAdapter },
    });

    const kernel = createKernel();
    kernel.register(counter, incrementHandler, counterApplier);

    await expect(kernel.hydrate()).resolves.toBeUndefined(); // should not throw
    expect(counter.get().count).toBe(0);
  });
});

// ─── Phase 1.3 — Co-located registration ─────────────────────────────────────

describe('Phase 1.3 — co-located registration via atom.definition', () => {
  it('register(atom) with no handler/applier args reads from definition.commands + definition.applier', () => {
    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 0 },
      commands:     [incrementHandler],
      applier:      counterApplier,
    });

    const kernel = createKernel();
    kernel.register(counter); // single-arg overload

    const result = kernel.execute(counter, command('counter/increment', { by: 10 }));
    expect(result._tag).toBe('Right');
    expect(counter.get().count).toBe(10);
  });

  it('co-located queries are registered automatically', () => {
    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 0 },
      commands:     [incrementHandler],
      applier:      counterApplier,
      queries:      [getCountHandler],
    });

    const kernel = createKernel();
    kernel.register(counter);
    kernel.execute(counter, command('counter/increment', { by: 3 }));

    const count = kernel.query<number>(counter, query('counter/getCount'));
    expect(count).toBe(3);
  });

  it('register(atom) is a no-op when definition has no commands or applier', () => {
    const counter = defineAtom<CounterState>({
      key:          'vi/counter',
      initialState: { count: 0 },
      // no commands, no applier
    });

    const kernel = createKernel();
    kernel.register(counter); // must not throw

    const result = kernel.execute(counter, command('counter/increment', { by: 1 }));
    expect(result._tag).toBe('Left'); // no handler registered
  });
});

// ─── Phase 1.4 — AsyncCommandHandler ─────────────────────────────────────────

describe('Phase 1.4 — executeAsync', () => {
  type LoadCmd = Command<'counter/load'>;

  const makeAsyncHandler = (): AsyncCommandHandler<CounterState, LoadCmd> => ({
    commandType: 'counter/load',
    handleAsync: async (state, cmd, ctx) => {
      if (ctx.signal.aborted) {
        return left({ code: 'CANCELLED', message: 'aborted' });
      }
      // Simulate async work
      await Promise.resolve();
      return right([domainEvent('counter/loaded', { value: 99 })]);
    },
  });

  const loadApplier = createEventApplier<CounterState>({
    'counter/loaded': (_, event) => ({
      count: (event as DomainEvent<string, { value: number }>).payload!.value,
    }),
  });

  it('falls back to synchronous execute when no async handler is registered', async () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);

    const result = await kernel.executeAsync(counter, command('counter/increment', { by: 5 }));
    expect(result._tag).toBe('Right');
    expect((result as { right: CounterState }).right.count).toBe(5);
  });

  it('calls handleAsync when an AsyncCommandHandler is registered', async () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.registerAsync(counter, makeAsyncHandler(), loadApplier);

    const result = await kernel.executeAsync(counter, command('counter/load'));
    expect(result._tag).toBe('Right');
    expect(counter.get().count).toBe(99);
  });

  it('applies the event + updates atom state after successful handleAsync', async () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.registerAsync(counter, makeAsyncHandler(), loadApplier);

    await kernel.executeAsync(counter, command('counter/load'));
    expect(counter.get().count).toBe(99);
  });

  it('notifies subscribers and emits DomainEvents after successful async execute', async () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.registerAsync(counter, makeAsyncHandler(), loadApplier);

    const states: CounterState[]  = [];
    const events: DomainEvent[]   = [];
    kernel.subscribe(counter, s => states.push(s));
    kernel.onEvent(e => events.push(e));

    await kernel.executeAsync(counter, command('counter/load'));

    expect(states).toHaveLength(1);
    expect(states[0].count).toBe(99);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('counter/loaded');
  });

  it('returns Left(CANCELLED) when signal is already aborted before call', async () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.registerAsync(counter, makeAsyncHandler(), loadApplier);

    const ac = new AbortController();
    ac.abort();

    const result = await kernel.executeAsync(counter, command('counter/load'), { signal: ac.signal });
    expect(result._tag).toBe('Left');
    expect((result as { left: { code: string } }).left.code).toBe('CANCELLED');
    expect(counter.get().count).toBe(0); // state unchanged
  });

  it('returns Left when async handler returns Left', async () => {
    const kernel  = createKernel();
    const counter = makeCounter();

    const failHandler: AsyncCommandHandler<CounterState, LoadCmd> = {
      commandType: 'counter/load',
      handleAsync: async () => left({ code: 'API_ERROR', message: 'server down' }),
    };

    kernel.registerAsync(counter, failHandler, loadApplier);
    const result = await kernel.executeAsync(counter, command('counter/load'));
    expect(result._tag).toBe('Left');
    expect((result as { left: { code: string } }).left.code).toBe('API_ERROR');
    expect(counter.get().count).toBe(0);
  });

  it('returns Left(HANDLER_ERROR) when handleAsync throws', async () => {
    const kernel  = createKernel();
    const counter = makeCounter();

    const throwHandler: AsyncCommandHandler<CounterState, LoadCmd> = {
      commandType: 'counter/load',
      handleAsync: async () => { throw new Error('unexpected crash'); },
    };

    kernel.registerAsync(counter, throwHandler, loadApplier);
    const result = await kernel.executeAsync(counter, command('counter/load'));
    expect(result._tag).toBe('Left');
    expect((result as { left: { code: string } }).left.code).toBe('HANDLER_ERROR');
  });
});

// ─── destroy ─────────────────────────────────────────────────────────────────

describe('destroy', () => {
  it('clears all state so subsequent commands return NO_HANDLER', async () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);
    await kernel.destroy();

    const result = kernel.execute(counter, command('counter/increment', { by: 1 }));
    expect(result._tag).toBe('Left');
    expect((result as { left: { code: string } }).left.code).toBe('NO_HANDLER');
  });

  it('clears event bus listeners', async () => {
    const kernel  = createKernel();
    const counter = makeCounter();
    kernel.register(counter, incrementHandler, counterApplier);

    const spy = vi.fn();
    kernel.onEvent(spy);
    await kernel.destroy();

    // After destroy, registrations and listeners are gone
    kernel.register(counter, incrementHandler, counterApplier);
    kernel.execute(counter, command('counter/increment', { by: 1 }));
    expect(spy).not.toHaveBeenCalled();
  });
});

// ─── debug interface ─────────────────────────────────────────────────────────

describe('debug interface', () => {
  it('debug.isEnabled is false by default', () => {
    const kernel = createKernel();
    expect(kernel.debug.isEnabled).toBe(false);
  });

  it('debug.isEnabled is true when debug: true option is set', () => {
    const kernel = createKernel({ debug: true });
    expect(kernel.debug.isEnabled).toBe(true);
  });

  it('executeAsync records to debug layer when debug is enabled', async () => {
    type LoadCmd = Command<'counter/load'>;

    const recordSpy = vi.fn();
    const customDebug = { isEnabled: true, record: recordSpy };
    const kernel  = createKernel({ debug: customDebug });
    const counter = makeCounter();

    const asyncHandler: AsyncCommandHandler<CounterState, LoadCmd> = {
      commandType: 'counter/load',
      handleAsync: async () =>
        right([domainEvent('counter/loaded', { value: 77 })]),
    };
    const debugLoadApplier = createEventApplier<CounterState>({
      'counter/loaded': (_, e) => ({
        count: (e as DomainEvent<string, { value: number }>).payload!.value,
      }),
    });

    kernel.registerAsync(counter, asyncHandler, debugLoadApplier);
    await kernel.executeAsync(counter, command('counter/load'));

    // debug layer should have been called with the command info
    expect(recordSpy).toHaveBeenCalledTimes(1);
    const entry = recordSpy.mock.calls[0][0];
    expect(entry.commandType).toBe('counter/load');
  });

  it('registerAsync composes appliers when one already exists', async () => {
    // This tests the `existing` branch in registerAsync
    type Cmd1 = Command<'counter/cmd1'>;
    type Cmd2 = Command<'counter/cmd2'>;

    const kernel  = createKernel();
    const counter = makeCounter();

    const handler1: AsyncCommandHandler<CounterState, Cmd1> = {
      commandType: 'counter/cmd1',
      handleAsync: async () => right([domainEvent('counter/inc1', {})]),
    };
    const handler2: AsyncCommandHandler<CounterState, Cmd2> = {
      commandType: 'counter/cmd2',
      handleAsync: async () => right([domainEvent('counter/inc2', {})]),
    };
    const applier1 = createEventApplier<CounterState>({
      'counter/inc1': (s) => ({ count: s.count + 10 }),
    });
    const applier2 = createEventApplier<CounterState>({
      'counter/inc2': (s) => ({ count: s.count + 1 }),
    });

    // Register two async handlers — second call exercises the `existing` branch
    kernel.registerAsync(counter, handler1, applier1);
    kernel.registerAsync(counter, handler2, applier2);

    await kernel.executeAsync(counter, command('counter/cmd1'));
    expect(counter.get().count).toBe(10);
    await kernel.executeAsync(counter, command('counter/cmd2'));
    expect(counter.get().count).toBe(11);
  });

  it('returns Left(CANCELLED) when abort fires while handler is executing (rejection path)', async () => {
    type LoadCmd = Command<'counter/load'>;
    const kernel  = createKernel();
    const counter = makeCounter();
    const ac      = new AbortController();

    const asyncHandler: AsyncCommandHandler<CounterState, LoadCmd> = {
      commandType: 'counter/load',
      // Throws an error after abort; we want the rejection handler to see signal.aborted=true
      handleAsync: (_state, _cmd, ctx) =>
        new Promise((_resolve, reject) => {
          ctx.signal.addEventListener('abort', () => reject(new Error('aborted by signal')));
          setTimeout(() => ac.abort(), 5);
        }),
    };

    kernel.registerAsync(counter, asyncHandler, counterApplier);
    const result = await kernel.executeAsync(counter, command('counter/load'), { signal: ac.signal });
    expect(result._tag).toBe('Left');
    expect((result as { left: { code: string } }).left.code).toBe('CANCELLED');
  });
});
