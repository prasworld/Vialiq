import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReactAdapter, StateFpProvider, useAtom, useCommand, useQuery } from './react.js';
import type { ReactAPIs, ReactContextLike }                                    from './react.js';
import type { Kernel, Atom, Unsubscribe }                                      from '../kernel/types.js';
import type { EphemeralStream }                                                from '../core/stream.js';
import { right }                                                               from '../core/either.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAtom<S>(initial: S): Atom<S> {
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

function makeKernel(atom: Atom<unknown>): Kernel {
  return {
    execute:          vi.fn().mockReturnValue(right(atom.get())),
    executeAsync:     vi.fn().mockResolvedValue(right(atom.get())),
    executeOptimistic: vi.fn(),
    query:            vi.fn().mockImplementation((_a, _q) => 42),
    register:         vi.fn(),
    registerAsync:    vi.fn(),
    registerQuery:    vi.fn(),
    registerComputed: vi.fn(),
    subscribe:        (a: Atom<unknown>, fn: (s: unknown) => void) => a.subscribe(fn),
    subscribeComputed: vi.fn().mockReturnValue(() => {}),
    onEvent:          vi.fn().mockReturnValue(() => {}),
    hydrate:          vi.fn().mockResolvedValue(undefined),
    destroy:          vi.fn().mockResolvedValue(undefined),
    use:              vi.fn(),
    debug:            { isEnabled: false, record: vi.fn() },
  } as unknown as Kernel;
}

/** Build a minimal React-like API backed by plain function calls. */
function makeReactAPIs(): ReactAPIs & {
  _triggerEffect(): void;
  _getState<T>(): T;
} {
  let _state: unknown;
  let _setState: ((s: unknown) => void) | undefined;
  let _effect:   (() => (() => void) | void) | undefined;
  let _cleanup:  (() => void) | undefined;
  let _contextValue: unknown = null;

  const ctx: ReactContextLike<unknown> = {
    _currentValue: null,
    Provider: ({ value }: { value: unknown; children: unknown }) => {
      _contextValue = value;
    },
  };

  const apis: ReactAPIs = {
    useState: <S>(initial: S | (() => S)) => {
      _state = typeof initial === 'function' ? (initial as () => S)() : initial;
      _setState = (s: S | ((prev: S) => S)) => {
        _state = typeof s === 'function' ? (s as (prev: S) => S)(_state as S) : s;
      };
      return [_state as S, _setState as (s: S | ((prev: S) => S)) => void];
    },
    useEffect: (effect, _deps) => {
      _effect  = effect;
    },
    useRef: <T>(initial: T) => ({ current: initial }),
    useMemo: <T>(factory: () => T, _deps: readonly unknown[]) => factory(),
    useContext: <T>(_ctx: ReactContextLike<T>) => _contextValue as T,
    createContext: <T>(_default: T) => ctx as unknown as ReactContextLike<T>,
  };

  return Object.assign(apis, {
    _triggerEffect() {
      if (_cleanup) { _cleanup(); _cleanup = undefined; }
      if (_effect) {
        const result = _effect();
        _cleanup = typeof result === 'function' ? result : undefined;
        _effect  = undefined;
      }
    },
    _getState<T>() { return _state as T; },
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('legacy stubs (backward compat)', () => {
  it('StateFpProvider throws with migration hint', () => {
    expect(() => (StateFpProvider as () => unknown)()).toThrow(/legacy stub/i);
  });

  it('useAtom throws with migration hint', () => {
    expect(() => (useAtom as unknown as () => unknown)()).toThrow(/legacy stub/i);
  });

  it('useCommand throws with migration hint', () => {
    expect(() => (useCommand as unknown as () => unknown)()).toThrow(/legacy stub/i);
  });

  it('useQuery throws with migration hint', () => {
    expect(() => (useQuery as unknown as () => unknown)()).toThrow(/legacy stub/i);
  });
});

describe('createReactAdapter', () => {
  let atom:   Atom<{ count: number }>;
  let kernel: Kernel;

  beforeEach(() => {
    atom   = makeAtom({ count: 0 }) as Atom<{ count: number }>;
    kernel = makeKernel(atom as unknown as Atom<unknown>);
  });

  describe('Provider', () => {
    it('renders without throwing', () => {
      const apis    = makeReactAPIs();
      const adapter = createReactAdapter(apis);
      expect(() =>
        (adapter.Provider as (p: { kernel: Kernel; children: unknown }) => unknown)({
          kernel: kernel,
          children: null,
        }),
      ).not.toThrow();
    });
  });

  describe('useAtom', () => {
    it('returns initial atom state without waiting for subscription', () => {
      const apis    = makeReactAPIs();
      // Provide kernel via context
      apis.useContext = () => kernel as unknown as never;

      const adapter = createReactAdapter(apis);
      const [state] = adapter.useAtom(atom);
      expect(state).toEqual({ count: 0 });
    });

    it('subscribes to the atom on effect trigger and unsubscribes on cleanup', () => {
      const apis    = makeReactAPIs();
      apis.useContext = () => kernel as unknown as never;

      const subscribeSpy = vi.spyOn(kernel, 'subscribe');
      const adapter = createReactAdapter(apis);
      adapter.useAtom(atom);

      // Subscription not yet set up — effect hasn't run
      expect(subscribeSpy).not.toHaveBeenCalled();

      apis._triggerEffect();
      expect(subscribeSpy).toHaveBeenCalledWith(atom, expect.any(Function));
    });

    it('updates state when atom emits', () => {
      const apis    = makeReactAPIs();
      apis.useContext = () => kernel as unknown as never;

      // Override subscribe to capture listener directly
      let listener: ((s: { count: number }) => void) | undefined;
      kernel.subscribe = (_a: Atom<unknown>, fn: (s: unknown) => void) => {
        listener = fn as (s: { count: number }) => void;
        return () => { listener = undefined; };
      };

      const adapter = createReactAdapter(apis);
      adapter.useAtom(atom);
      apis._triggerEffect();

      expect(listener).toBeDefined();
      listener!({ count: 99 });
      expect(apis._getState<{ count: number }>()).toEqual({ count: 99 });
    });
  });

  describe('useCommand', () => {
    it('returns a stable dispatch function', () => {
      const apis    = makeReactAPIs();
      apis.useContext = () => kernel as unknown as never;

      const adapter  = createReactAdapter(apis);
      const dispatch = adapter.useCommand(atom);
      expect(typeof dispatch).toBe('function');
    });

    it('calls kernel.execute with the atom and command', () => {
      const apis    = makeReactAPIs();
      apis.useContext = () => kernel as unknown as never;

      const adapter  = createReactAdapter(apis);
      const dispatch = adapter.useCommand(atom);
      const cmd      = { _kind: 'Command' as const, type: 'test/inc', meta: { correlationId: '1', timestamp: 0 } };
      dispatch(cmd);

      expect(kernel.execute).toHaveBeenCalledWith(atom, cmd);
    });
  });

  describe('useQuery', () => {
    it('calls kernel.query and returns the result', () => {
      const apis    = makeReactAPIs();
      apis.useContext = () => kernel as unknown as never;

      const adapter = createReactAdapter(apis);
      const q       = { _kind: 'Query' as const, type: 'test/total' };
      const result  = adapter.useQuery(atom, q);
      expect(result).toBe(42);
      expect(kernel.query).toHaveBeenCalledWith(atom, q);
    });
  });

  describe('useEphemeral', () => {
    it('returns undefined before first emit', () => {
      const apis   = makeReactAPIs();
      const stream: EphemeralStream<number> = {
        emit:               vi.fn(),
        subscribe:          vi.fn().mockReturnValue(() => {}),
        subscribeAnimated:  vi.fn().mockReturnValue(() => {}),
        last:               undefined,
      };

      const adapter = createReactAdapter(apis);
      const val     = adapter.useEphemeral(stream);
      expect(val).toBeUndefined();
    });

    it('returns stream.last as initial value', () => {
      const apis   = makeReactAPIs();
      const stream: EphemeralStream<number> = {
        emit:               vi.fn(),
        subscribe:          vi.fn().mockReturnValue(() => {}),
        subscribeAnimated:  vi.fn().mockReturnValue(() => {}),
        last:               42,
      };

      const adapter = createReactAdapter(apis);
      const val     = adapter.useEphemeral(stream);
      expect(val).toBe(42);
    });

    it('uses subscribeAnimated by default', () => {
      const apis   = makeReactAPIs();
      const stream: EphemeralStream<number> = {
        emit:               vi.fn(),
        subscribe:          vi.fn().mockReturnValue(() => {}),
        subscribeAnimated:  vi.fn().mockReturnValue(() => {}),
        last:               undefined,
      };

      const adapter = createReactAdapter(apis);
      adapter.useEphemeral(stream);
      apis._triggerEffect();

      expect(stream.subscribeAnimated).toHaveBeenCalled();
      expect(stream.subscribe).not.toHaveBeenCalled();
    });

    it('uses subscribe when animated=false', () => {
      const apis   = makeReactAPIs();
      const stream: EphemeralStream<number> = {
        emit:               vi.fn(),
        subscribe:          vi.fn().mockReturnValue(() => {}),
        subscribeAnimated:  vi.fn().mockReturnValue(() => {}),
        last:               undefined,
      };

      const adapter = createReactAdapter(apis);
      adapter.useEphemeral(stream, false);
      apis._triggerEffect();

      expect(stream.subscribe).toHaveBeenCalled();
      expect(stream.subscribeAnimated).not.toHaveBeenCalled();
    });

    it('throws when called outside Provider', () => {
      const apis    = makeReactAPIs();
      // Leave context at null (default)
      const adapter = createReactAdapter(apis);

      expect(() => adapter.useAtom(atom)).toThrow(/outside of.*Provider/i);
    });
  });
});
