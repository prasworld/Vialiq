import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLitController, createLitStreamController } from './lit.js';
import type { ReactiveHost, ReactiveControllerLike }       from './lit.js';
import type { Kernel, Atom, Unsubscribe }                  from '../kernel/types.js';
import type { EphemeralStream }                            from '../core/stream.js';
import { right }                                           from '../core/either.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAtom<S>(initial: S): Atom<S> & { _setState(s: S): void } {
  let _state = initial;
  const listeners = new Set<(s: S) => void>();
  return {
    definition: { key: 'test/atom', initialState: initial },
    key: 'test/atom',
    get: () => _state,
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    get version() { return 0; },
    _setState: (s: S) => {
      _state = s;
      listeners.forEach(fn => fn(s));
    },
  };
}

function makeKernel<S>(atom: Atom<S>): Kernel {
  return {
    execute:           vi.fn().mockReturnValue(right(atom.get())),
    executeAsync:      vi.fn().mockResolvedValue(right(atom.get())),
    executeOptimistic: vi.fn(),
    query:             vi.fn().mockReturnValue(99),
    register:          vi.fn(),
    registerAsync:     vi.fn(),
    registerQuery:     vi.fn(),
    registerComputed:  vi.fn(),
    subscribe:         (a: Atom<unknown>, fn: (s: unknown) => void) => a.subscribe(fn),
    subscribeComputed: vi.fn().mockReturnValue(() => {}),
    onEvent:           vi.fn().mockReturnValue(() => {}),
    hydrate:           vi.fn().mockResolvedValue(undefined),
    destroy:           vi.fn().mockResolvedValue(undefined),
    use:               vi.fn(),
    debug:             { isEnabled: false, record: vi.fn() },
  } as unknown as Kernel;
}

function makeHost(): ReactiveHost & { controllers: ReactiveControllerLike[] } {
  const controllers: ReactiveControllerLike[] = [];
  return {
    controllers,
    addController:    (c) => controllers.push(c),
    removeController: (c) => {
      const i = controllers.indexOf(c);
      if (i >= 0) controllers.splice(i, 1);
    },
    requestUpdate: vi.fn(),
  };
}

function makeStream<T>(last?: T): EphemeralStream<T> & { _emit(v: T): void } {
  const syncListeners = new Set<(v: T) => void>();
  const rafListeners  = new Set<(v: T) => void>();
  let _last = last;
  const stream = {
    get last() { return _last; },
    emit: vi.fn() as (v: T) => void,
    subscribe: vi.fn().mockImplementation((fn: (v: T) => void) => {
      syncListeners.add(fn);
      return () => syncListeners.delete(fn);
    }) as (fn: (v: T) => void) => () => void,
    subscribeAnimated: vi.fn().mockImplementation((fn: (v: T) => void) => {
      rafListeners.add(fn);
      return () => rafListeners.delete(fn);
    }) as (fn: (v: T) => void) => () => void,
    _emit(v: T) {
      _last = v;
      syncListeners.forEach(fn => fn(v));
      rafListeners.forEach(fn => fn(v));
    },
  };
  return stream;
}

// ─── createLitController ─────────────────────────────────────────────────────

describe('createLitController', () => {
  let atom:   ReturnType<typeof makeAtom<{ count: number }>>;
  let kernel: Kernel;
  let host:   ReturnType<typeof makeHost>;

  beforeEach(() => {
    atom   = makeAtom({ count: 0 });
    kernel = makeKernel(atom);
    host   = makeHost();
  });

  it('registers itself with the host on construction', () => {
    const ctrl = createLitController(host, kernel, atom);
    expect(host.controllers).toContain(ctrl);
  });

  it('exposes initial atom state before connection', () => {
    const ctrl = createLitController(host, kernel, atom);
    expect(ctrl.state).toEqual({ count: 0 });
  });

  it('re-syncs state on hostConnected', () => {
    atom._setState({ count: 5 });
    const ctrl = createLitController(host, kernel, atom);
    ctrl.hostConnected!();
    expect(ctrl.state).toEqual({ count: 5 });
  });

  it('subscribes to kernel on hostConnected', () => {
    const subscribeSpy = vi.spyOn(kernel, 'subscribe');
    const ctrl = createLitController(host, kernel, atom);
    ctrl.hostConnected!();
    expect(subscribeSpy).toHaveBeenCalledWith(atom, expect.any(Function));
  });

  it('calls host.requestUpdate() immediately on hostConnected (initial render)', () => {
    const ctrl = createLitController(host, kernel, atom);
    ctrl.hostConnected!();
    expect(host.requestUpdate).toHaveBeenCalledOnce();
  });

  it('calls host.requestUpdate() when atom emits after connection', () => {
    const ctrl = createLitController(host, kernel, atom);
    ctrl.hostConnected!();

    atom._setState({ count: 10 });
    expect(host.requestUpdate).toHaveBeenCalled();
    expect(ctrl.state).toEqual({ count: 10 });
  });

  it('does NOT call requestUpdate after hostDisconnected', () => {
    const ctrl = createLitController(host, kernel, atom);
    ctrl.hostConnected!();
    ctrl.hostDisconnected!();

    vi.mocked(host.requestUpdate).mockClear();
    atom._setState({ count: 99 });

    expect(host.requestUpdate).not.toHaveBeenCalled();
  });

  it('unsubscribes cleanly on hostDisconnected (no memory leak)', () => {
    const unsubSpy = vi.fn();
    kernel.subscribe = vi.fn().mockReturnValue(unsubSpy);

    const ctrl = createLitController(host, kernel, atom);
    ctrl.hostConnected!();
    ctrl.hostDisconnected!();

    expect(unsubSpy).toHaveBeenCalledOnce();
  });

  it('dispatch proxies to kernel.execute', () => {
    const ctrl = createLitController(host, kernel, atom);
    const cmd  = { _kind: 'Command' as const, type: 'test/inc', meta: { correlationId: '1', timestamp: 0 } };
    ctrl.dispatch(cmd);
    expect(kernel.execute).toHaveBeenCalledWith(atom, cmd);
  });

  it('query proxies to kernel.query', () => {
    const ctrl = createLitController(host, kernel, atom);
    const q    = { _kind: 'Query' as const, type: 'test/total' };
    const res  = ctrl.query<number>(q);
    expect(res).toBe(99);
    expect(kernel.query).toHaveBeenCalledWith(atom, q);
  });

  it('reconnect after disconnect re-subscribes', () => {
    const subscribeSpy = vi.spyOn(kernel, 'subscribe');
    const ctrl = createLitController(host, kernel, atom);
    ctrl.hostConnected!();
    ctrl.hostDisconnected!();
    ctrl.hostConnected!();
    expect(subscribeSpy).toHaveBeenCalledTimes(2);
  });
});

// ─── createLitStreamController ───────────────────────────────────────────────

describe('createLitStreamController', () => {
  let host: ReturnType<typeof makeHost>;

  beforeEach(() => {
    host = makeHost();
  });

  it('registers itself with the host on construction', () => {
    const stream = makeStream<number>();
    const ctrl   = createLitStreamController(host, stream);
    expect(host.controllers).toContain(ctrl);
  });

  it('value is stream.last immediately after construction', () => {
    const stream = makeStream<number>(7);
    const ctrl   = createLitStreamController(host, stream);
    expect(ctrl.value).toBe(7);
  });

  it('value is undefined when stream has no last value', () => {
    const stream = makeStream<number>();
    const ctrl   = createLitStreamController(host, stream);
    expect(ctrl.value).toBeUndefined();
  });

  it('uses subscribeAnimated by default', () => {
    const stream = makeStream<number>();
    const ctrl   = createLitStreamController(host, stream);
    ctrl.hostConnected!();

    expect(stream.subscribeAnimated).toHaveBeenCalled();
    // subscribe (sync) should NOT have been called
    expect(stream.subscribe).not.toHaveBeenCalled();
  });

  it('uses subscribe when animated=false', () => {
    const stream = makeStream<number>();
    const ctrl   = createLitStreamController(host, stream, false);
    ctrl.hostConnected!();

    expect(stream.subscribe).toHaveBeenCalled();
    expect(stream.subscribeAnimated).not.toHaveBeenCalled();
  });

  it('updates value and calls requestUpdate on emit (animated)', () => {
    const stream = makeStream<number>();
    const ctrl   = createLitStreamController(host, stream);
    ctrl.hostConnected!();

    stream._emit(42);
    expect(ctrl.value).toBe(42);
    expect(host.requestUpdate).toHaveBeenCalled();
  });

  it('updates value and calls requestUpdate on emit (sync)', () => {
    const stream = makeStream<number>();
    const ctrl   = createLitStreamController(host, stream, false);
    ctrl.hostConnected!();

    stream._emit(100);
    expect(ctrl.value).toBe(100);
    expect(host.requestUpdate).toHaveBeenCalled();
  });

  it('does NOT call requestUpdate after hostDisconnected', () => {
    const stream = makeStream<number>();
    const ctrl   = createLitStreamController(host, stream);
    ctrl.hostConnected!();
    ctrl.hostDisconnected!();

    vi.mocked(host.requestUpdate).mockClear();
    stream._emit(999);

    expect(host.requestUpdate).not.toHaveBeenCalled();
  });

  it('unsubscribes cleanly on hostDisconnected (no memory leak)', () => {
    const stream = makeStream<number>();
    // Spy on the unsubscribe returned by subscribeAnimated
    const unsubSpy       = vi.fn();
    const origSubAnimated = stream.subscribeAnimated;
    stream.subscribeAnimated = vi.fn().mockReturnValue(unsubSpy);

    const ctrl = createLitStreamController(host, stream);
    ctrl.hostConnected!();
    ctrl.hostDisconnected!();

    expect(unsubSpy).toHaveBeenCalledOnce();
    stream.subscribeAnimated = origSubAnimated;
  });

  it('syncs to stream.last on reconnect', () => {
    const stream = makeStream<number>(1);
    const ctrl   = createLitStreamController(host, stream);
    ctrl.hostConnected!();
    ctrl.hostDisconnected!();

    // Simulate value emitted while disconnected (listeners were removed, so
    // _emit only updates _last without calling any registered callbacks).
    stream._emit(55);
    ctrl.hostConnected!();

    expect(ctrl.value).toBe(55);
  });
});
