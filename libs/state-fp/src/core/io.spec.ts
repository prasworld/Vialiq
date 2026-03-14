import { describe, it, expect, vi } from 'vitest';
import {
  io,
  liftIO,
  mapIO,
  chainIO,
  apIO,
  sequenceIO,
  sequenceIO_,
  replicateIO,
  newIORef,
  voidIO,
  tapIO,
} from './io.js';

// ─── io / liftIO ─────────────────────────────────────────────────────────────

describe('io', () => {
  it('wraps a deferred computation — does not run on construction', () => {
    let ran = false;
    const effect = io(() => { ran = true; return 1; });
    expect(ran).toBe(false);
    effect.run();
    expect(ran).toBe(true);
  });

  it('returns the value produced by the thunk', () => {
    expect(io(() => 42).run()).toBe(42);
  });
});

describe('liftIO', () => {
  it('wraps an already-computed value in IO', () => {
    const effect = liftIO(99);
    expect(effect.run()).toBe(99);
  });
});

// ─── mapIO ────────────────────────────────────────────────────────────────────

describe('mapIO', () => {
  // Curried: mapIO(f)(ia)
  it('transforms the result lazily', () => {
    let runs = 0;
    const base   = io(() => { runs++; return 5; });
    const mapped = mapIO((x: number) => x * 2)(base);
    expect(runs).toBe(0);
    expect(mapped.run()).toBe(10);
    expect(runs).toBe(1);
  });
});

// ─── chainIO ─────────────────────────────────────────────────────────────────

describe('chainIO', () => {
  // Curried: chainIO(f)(ia)
  it('composes two IO effects', () => {
    const log: string[] = [];
    const a = io(() => { log.push('a'); return 3; });
    const b = chainIO((x: number) => io(() => { log.push('b'); return x * 2; }))(a);
    expect(log).toEqual([]);
    expect(b.run()).toBe(6);
    expect(log).toEqual(['a', 'b']);
  });
});

// ─── apIO ─────────────────────────────────────────────────────────────────────

describe('apIO', () => {
  // Curried: apIO(iof)(ioa)
  it('applies an IO function to an IO value', () => {
    const fn  = liftIO((x: number) => x + 10);
    const val = liftIO(5);
    expect(apIO(fn)(val).run()).toBe(15);
  });
});

// ─── sequenceIO ──────────────────────────────────────────────────────────────

describe('sequenceIO', () => {
  it('runs all effects and collects results in order', () => {
    const order: number[] = [];
    const effects = [
      io(() => { order.push(1); return 'a'; }),
      io(() => { order.push(2); return 'b'; }),
      io(() => { order.push(3); return 'c'; }),
    ];
    const result = sequenceIO(effects).run();
    expect(result).toEqual(['a', 'b', 'c']);
    expect(order).toEqual([1, 2, 3]);
  });

  it('returns empty array for empty input', () => {
    expect(sequenceIO([]).run()).toEqual([]);
  });
});

// ─── sequenceIO_ ─────────────────────────────────────────────────────────────

describe('sequenceIO_', () => {
  it('runs all effects for side effects and returns void', () => {
    const log: string[] = [];
    const effects = [
      io(() => { log.push('x'); }),
      io(() => { log.push('y'); }),
    ];
    const result = sequenceIO_(effects).run();
    expect(log).toEqual(['x', 'y']);
    expect(result).toBeUndefined();
  });
});

// ─── replicateIO ─────────────────────────────────────────────────────────────

describe('replicateIO', () => {
  it('runs the effect n times and collects results', () => {
    let count = 0;
    const effect = io(() => ++count);
    const result = replicateIO(3, effect).run();
    expect(result).toEqual([1, 2, 3]);
  });

  it('returns empty array for 0 repetitions', () => {
    expect(replicateIO(0, liftIO(1)).run()).toEqual([]);
  });
});

// ─── IORef ────────────────────────────────────────────────────────────────────

describe('newIORef', () => {
  it('initialises with the provided value', () => {
    const ref = newIORef(10);
    expect(ref.read.run()).toBe(10);
  });

  it('write replaces the value', () => {
    const ref = newIORef(10);
    ref.write(99).run();
    expect(ref.read.run()).toBe(99);
  });

  it('modify applies a function to the current value', () => {
    const ref = newIORef(5);
    ref.modify(x => x * 3).run();
    expect(ref.read.run()).toBe(15);
  });

  it('sequences read/write correctly without running eagerly', () => {
    const ref = newIORef(0);
    // chainIO(f)(ia) — curried
    const program = chainIO((v: number) =>
      chainIO(() => ref.read)(ref.write(v + 1)),
    )(ref.read);
    expect(ref.read.run()).toBe(0);  // nothing run yet
    expect(program.run()).toBe(1);   // runs the chain
    expect(ref.read.run()).toBe(1);  // state persisted in closure
  });
});

// ─── voidIO ───────────────────────────────────────────────────────────────────

describe('voidIO', () => {
  it('discards the result', () => {
    const effect = io(() => 42);
    expect(voidIO(effect).run()).toBeUndefined();
  });
});

// ─── tapIO ────────────────────────────────────────────────────────────────────

describe('tapIO', () => {
  // Curried: tapIO(f)(ia)
  it('runs the side-effect and returns the original value', () => {
    const spy = vi.fn();
    const result = tapIO((v: number) => spy(v))(liftIO(7)).run();
    expect(result).toBe(7);
    expect(spy).toHaveBeenCalledWith(7);
  });
});
