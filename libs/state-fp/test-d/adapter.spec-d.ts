/**
 * Type-level tests for @vi/state-fp/adapter.
 *
 * Asserts compile-time type correctness of all four adapter factories.
 * Uses `declare const` at module scope for adapter-level values so no
 * real Angular / React runtime is required.
 */
import { describe, it, expectTypeOf } from 'vitest';
import {
  createAdapter,
  createLitController,
  createLitStreamController,
} from '../src/adapter/index.js';
import type {
  VanillaAdapter,
  ReactKernelAdapter,
  AngularKernelAdapter,
  AtomController,
  StreamController,
  StateFpProviderProps,
  UseAtomResult,
  UseCommandResult,
  ReactiveHost,
  WriteableSignalLike,
} from '../src/adapter/index.js';
import { defineAtom, createKernel } from '../src/kernel/index.js';
import { createEphemeralStream }    from '../src/core/index.js';
import type { Kernel, Atom, Command, Query, Unsubscribe } from '../src/kernel/index.js';
import type { Either, EphemeralStream } from '../src/core/index.js';

// ─── Module-level declares (compile-time only; never executed at runtime) ─────
//
// Angular and React adapters require framework primitives at construction time,
// which are unavailable in a pure Node test environment.  We assert types
// against the public interfaces directly without calling the factories.
// Vanilla and Lit adapters work without framework dependencies and are
// exercised via real constructor calls below.

declare const reactAdapter:   ReactKernelAdapter;
declare const angularAdapter: AngularKernelAdapter;
declare const kernel:         Kernel;
declare const numberAtom:     Atom<number>;
declare const objectAtom:     Atom<{ count: number }>;
declare const stringAtom:     Atom<string>;
declare const itemsAtom:      Atom<{ items: number[] }>;
declare const q:              Query;

// ─── Vanilla adapter ─────────────────────────────────────────────────────────

describe('createAdapter (vanilla) types', () => {
  const adapter = createAdapter(createKernel());

  it('returns a VanillaAdapter', () => {
    expectTypeOf(adapter).toMatchTypeOf<VanillaAdapter>();
  });

  it('watch() returns Unsubscribe', () => {
    const atom = defineAtom({ key: 'type-test/watch', initialState: 0 });
    expectTypeOf(adapter.watch(atom, _n => {})).toEqualTypeOf<Unsubscribe>();
  });

  it('read() returns the state type', () => {
    const atom = defineAtom({ key: 'type-test/read', initialState: { count: 0 } });
    expectTypeOf(adapter.read(atom)).toEqualTypeOf<{ count: number }>();
  });

  it('run() returns Either', () => {
    const atom = defineAtom({ key: 'type-test/run', initialState: 0 });
    type RunReturn = ReturnType<VanillaAdapter['run']>;
    expectTypeOf<RunReturn>().toMatchTypeOf<Either<unknown, unknown>>();
  });
});

// ─── React adapter ───────────────────────────────────────────────────────────

describe('ReactKernelAdapter interface types', () => {
  it('Provider accepts StateFpProviderProps', () => {
    // reactAdapter is declare const (undefined at runtime); use type-level assertion
    expectTypeOf<ReactKernelAdapter['Provider']>()
      .parameter(0)
      .toMatchTypeOf<StateFpProviderProps>();
  });

  it('useAtom<S> returns UseAtomResult<S>', () => {
    type Result = ReturnType<ReactKernelAdapter['useAtom']>;
    // UseAtomResult is a readonly tuple [S, Atom<S>]
    expectTypeOf<Result[0]>().toBeUnknown(); // S is unknown at this level
  });

  it('useAtom with concrete S returns [S, Atom<S>]', () => {
    type Result = UseAtomResult<{ count: number }>;
    expectTypeOf<Result[0]>().toEqualTypeOf<{ count: number }>();
    expectTypeOf<Result[1]>().toMatchTypeOf<Atom<{ count: number }>>();
  });

  it('UseCommandResult is a stable dispatch function', () => {
    expectTypeOf<UseCommandResult>().toMatchTypeOf<(cmd: Command) => unknown>();
  });

  it('useQuery<S,Q,R> returns R', () => {
    type R = ReturnType<ReactKernelAdapter['useQuery']>;
    expectTypeOf<R>().toBeUnknown(); // R is generic
  });

  it('useEphemeral<T> returns T | undefined', () => {
    // Generic method — check type signature matches the concrete instantiation
    type UEFn = ReactKernelAdapter['useEphemeral'];
    expectTypeOf<UEFn>().toMatchTypeOf<
      (s: EphemeralStream<number>, animated?: boolean) => number | undefined
    >();
  });
});

// ─── Angular adapter ─────────────────────────────────────────────────────────

describe('AngularKernelAdapter interface types', () => {
  it('toSignal returns WriteableSignalLike<S>', () => {
    // angularAdapter is declare const (undefined at runtime); use type-level assertions
    type TSFn = AngularKernelAdapter['toSignal'];
    expectTypeOf<TSFn>().toMatchTypeOf<
      (atom: Atom<{ count: number }>, kernel: Kernel) => WriteableSignalLike<{ count: number }>
    >();
  });

  it('toQuerySignal returns WriteableSignalLike<R> for query result', () => {
    type TQFn = AngularKernelAdapter['toQuerySignal'];
    expectTypeOf<TQFn>().toMatchTypeOf<
      (atom: Atom<{ items: number[] }>, kernel: Kernel, queryFn: (s: { items: number[] }) => number) => WriteableSignalLike<number>
    >();
  });

  it('commandDispatcher returns (cmd: Command) => Either', () => {
    type CDFn = AngularKernelAdapter['commandDispatcher'];
    expectTypeOf<CDFn>().toMatchTypeOf<
      (atom: Atom<number>, kernel: Kernel) => (cmd: Command) => unknown
    >();
  });
});

// ─── Lit adapter ─────────────────────────────────────────────────────────────

// createLitController/StreamController work in Node — host mock is just two methods.
const litHost: ReactiveHost = { addController: () => {}, requestUpdate: () => {} };

describe('createLitController types', () => {
  it('returns an AtomController<S>', () => {
    const atom       = defineAtom({ key: 'type-test/lit-atom', initialState: { count: 0 } });
    const controller = createLitController(litHost, createKernel(), atom);
    expectTypeOf(controller).toMatchTypeOf<AtomController<{ count: number }>>();
  });

  it('controller.state matches the atom state type', () => {
    const atom       = defineAtom({ key: 'type-test/lit-state', initialState: { count: 0 } });
    const controller = createLitController(litHost, createKernel(), atom);
    expectTypeOf(controller.state).toEqualTypeOf<{ count: number }>();
  });

  it('controller.dispatch accepts a Command', () => {
    const atom       = defineAtom({ key: 'type-test/lit-dispatch', initialState: 0 });
    const controller = createLitController(litHost, createKernel(), atom);
    expectTypeOf(controller.dispatch).parameter(0).toMatchTypeOf<Command>();
  });

  it('controller.query<R>(q) returns R', () => {
    const atom       = defineAtom({ key: 'type-test/lit-query', initialState: 0 });
    const controller = createLitController(litHost, createKernel(), atom);
    // Don't call query at runtime — no handler registered; check method signature type
    type QueryMethod = typeof controller.query;
    expectTypeOf<QueryMethod>().toMatchTypeOf<(q: Query) => unknown>();
  });
});

describe('createLitStreamController types', () => {
  it('returns a StreamController<T>', () => {
    const stream     = createEphemeralStream<{ x: number }>();
    const controller = createLitStreamController(litHost, stream);
    expectTypeOf(controller).toMatchTypeOf<StreamController<{ x: number }>>();
  });

  it('value is T | undefined', () => {
    const stream     = createEphemeralStream<number>();
    const controller = createLitStreamController(litHost, stream);
    expectTypeOf(controller.value).toEqualTypeOf<number | undefined>();
  });
});
