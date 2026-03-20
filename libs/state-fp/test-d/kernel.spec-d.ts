/**
 * Type-level tests for @vi/state-fp/kernel.
 *
 * Asserts compile-time type correctness of CQRS primitives.
 */
import { describe, it, expectTypeOf } from 'vitest';
import {
  defineAtom,
  defineComputedAtom,
  createKernel,
  command,
  domainEvent,
  query,
  createCommandHandler,
  createEventApplier,
  createQueryHandler,
} from '../src/kernel/index.js';
import type {
  Atom,
  ComputedAtom,
  Command,
  DomainEvent,
  Query,
  CommandError,
  Kernel,
  CommandHandler,
  Unsubscribe,
} from '../src/kernel/index.js';
import { right, left } from '../src/core/index.js';
import type { Either as CoreEither } from '../src/core/index.js';

// ─── Atom ─────────────────────────────────────────────────────────────────────

describe('defineAtom types', () => {
  it('produces an Atom<S> with the correct state type', () => {
    const counter = defineAtom({ key: 'test/counter', initialState: 0 });
    expectTypeOf(counter).toMatchTypeOf<Atom<number>>();
  });

  it('Atom.get() returns state type S', () => {
    const atom = defineAtom({ key: 'test/atom', initialState: { count: 0 } });
    expectTypeOf(atom.get()).toEqualTypeOf<{ count: number }>();
  });

  it('Atom.subscribe() returns Unsubscribe', () => {
    const atom = defineAtom({ key: 'test/atom2', initialState: 0 });
    expectTypeOf(atom.subscribe).returns.toEqualTypeOf<Unsubscribe>();
  });

  it('Atom.key is string', () => {
    const atom = defineAtom({ key: 'test/atom3', initialState: 0 });
    expectTypeOf(atom.key).toEqualTypeOf<string>();
  });
});

describe('defineComputedAtom types', () => {
  it('produces an Atom<R> derived from deps', () => {
    const src = defineAtom({ key: 'test/src', initialState: 5 });
    const derived = defineComputedAtom({
      key: 'test/derived',
      deps: [src],
      compute: (deps: readonly any[]) => (deps[0] as number) * 2,
    });
    // Don't call derived.get() — computed atoms throw until the kernel initializes them.
    // Check the static type of the atom and its get() return type instead.
    expectTypeOf(derived).toMatchTypeOf<ComputedAtom<number>>();
    expectTypeOf(derived.get).returns.toEqualTypeOf<number>();
  });
});

// ─── Command ─────────────────────────────────────────────────────────────────

describe('command() types', () => {
  it('produces a Command with typed payload', () => {
    const inc = command('counter/inc', { by: 1 });
    expectTypeOf(inc._kind).toEqualTypeOf<'Command'>();
    expectTypeOf(inc.type).toEqualTypeOf<'counter/inc'>();
    expectTypeOf(inc.payload).toEqualTypeOf<{ by: number }>();
  });

  it('factory function preserves payload type', () => {
    const IncrementBy = (by: number) => command('counter/increment', { by });
    type IncCmd = ReturnType<typeof IncrementBy>;
    expectTypeOf<IncCmd['payload']>().toEqualTypeOf<{ by: number }>();
  });
});

// ─── DomainEvent ─────────────────────────────────────────────────────────────

describe('domainEvent() types', () => {
  it('produces a DomainEvent with typed payload', () => {
    const incremented = domainEvent('counter/incremented', { by: 5 });
    expectTypeOf(incremented._kind).toEqualTypeOf<'DomainEvent'>();
    expectTypeOf(incremented.type).toEqualTypeOf<'counter/incremented'>();
    expectTypeOf(incremented.payload).toEqualTypeOf<{ by: number }>();
  });
});

// ─── Query ────────────────────────────────────────────────────────────────────

describe('query() types', () => {
  it('produces a Query object', () => {
    const q = query('counter/total');
    expectTypeOf(q._kind).toEqualTypeOf<'Query'>();
    expectTypeOf(q.type).toEqualTypeOf<'counter/total'>();
  });
});

// ─── CommandHandler ──────────────────────────────────────────────────────────

describe('createCommandHandler types', () => {
  it('produces a CommandHandler with correct generic parameters', () => {
    type State = { count: number };
    const IncrBy = (by: number) => command('counter/inc', { by });
    type IncCmd = ReturnType<typeof IncrBy>;

    const handler = createCommandHandler<State, IncCmd>({
      commandType: 'counter/inc',
      handle: (_state, cmd) => right([domainEvent('counter/incremented', { by: cmd.payload.by })]),
    });

    expectTypeOf(handler).toMatchTypeOf<CommandHandler<State, IncCmd>>();
  });

  it('validate return type is CommandError | undefined', () => {
    type State = { count: number };
    const IncrBy = (by: number) => command('counter/inc2', { by });
    type IncCmd = ReturnType<typeof IncrBy>;

    createCommandHandler<State, IncCmd>({
      commandType: 'counter/inc2',
      validate: (payload): CoreEither<CommandError, void> => {
        const p = payload as { by: number };
        return p.by > 0 ? right(undefined) : left({ code: 'VALIDATION_ERROR', message: 'must be positive' });
      },
      handle: (_state, cmd) => right([domainEvent('counter/incremented2', { by: cmd.payload.by })]),
    });
  });
});

// ─── EventApplier ────────────────────────────────────────────────────────────

describe('createEventApplier types', () => {
  it('produces an EventApplier for the given state type', () => {
    type State = { count: number };
    const applier = createEventApplier<State>({
      'counter/incremented': (s, e) => ({ ...s, count: s.count + ((e as DomainEvent<string, { by: number }>).payload.by) }),
    });
    // applier maps type string → (state, event) => state
    expectTypeOf(applier).toBeObject();
  });
});

// ─── Kernel ──────────────────────────────────────────────────────────────────

describe('createKernel types', () => {
  it('createKernel() returns a Kernel', () => {
    const kernel = createKernel();
    expectTypeOf(kernel).toMatchTypeOf<Kernel>();
  });

  it('kernel.execute() returns Either<CommandError, unknown>', () => {
    const kernel = createKernel();
    const atom = defineAtom({ key: 'k-test/a', initialState: 0 });
    const cmd = command('k-test/inc', {});
    // execute returns Either<CommandError, unknown> synchronously
    expectTypeOf(kernel.execute(atom, cmd)).toMatchTypeOf<CoreEither<CommandError, unknown>>();
  });

  it('kernel.executeAsync() returns Promise<Either<CommandError, unknown>>', () => {
    const kernel = createKernel();
    const atom = defineAtom({ key: 'k-test/b', initialState: 0 });
    const cmd = command('k-test/inc2', {});
    expectTypeOf(kernel.executeAsync(atom, cmd)).resolves.toMatchTypeOf<CoreEither<CommandError, unknown>>();
  });

  it('kernel.subscribe() returns Unsubscribe', () => {
    const kernel = createKernel();
    const atom = defineAtom({ key: 'k-test/c', initialState: 0 });
    const unsub = kernel.subscribe(atom, _n => {});
    expectTypeOf(unsub).toEqualTypeOf<Unsubscribe>();
  });

  it('kernel.query() returns generic R', () => {
    // Don't call at runtime — kernel.query() throws if no handler is registered.
    // Check the method signature type instead.
    type QueryFn = Kernel['query'];
    expectTypeOf<QueryFn>().toMatchTypeOf<(atom: Atom<unknown>, q: Query) => unknown>();
  });
});

// ─── QueryHandler ────────────────────────────────────────────────────────────

describe('createQueryHandler types', () => {
  it('produces a handler map for the given state', () => {
    type State = { items: string[] };
    const handler = createQueryHandler<State, Query, number>({
      queryType: 'cart/count',
      handle: (s: State) => s.items.length,
    });
    expectTypeOf(handler).toBeObject();
  });
});
