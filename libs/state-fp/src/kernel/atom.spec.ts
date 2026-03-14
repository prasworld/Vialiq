import { describe, it, expect, vi } from 'vitest';
import { defineAtom, statesAreEqual } from './atom.js';

// ─── defineAtom ───────────────────────────────────────────────────────────────

describe('defineAtom', () => {
  it('exposes the definition', () => {
    const atom = defineAtom({ key: 'test/atom', initialState: 0 });
    expect(atom.definition.key).toBe('test/atom');
    expect(atom.definition.initialState).toBe(0);
  });

  it('get() returns the initial state', () => {
    const atom = defineAtom({ key: 'test/atom', initialState: { count: 0 } });
    expect(atom.get()).toEqual({ count: 0 });
  });

  it('key getter mirrors definition.key', () => {
    const atom = defineAtom({ key: 'vi/counter', initialState: 0 });
    expect(atom.key).toBe('vi/counter');
  });

  it('version starts at 0', () => {
    const atom = defineAtom({ key: 'v', initialState: null });
    expect(atom.version).toBe(0);
  });
});

// ─── _setState ────────────────────────────────────────────────────────────────

describe('_setState', () => {
  it('updates the value returned by get()', () => {
    const atom = defineAtom({ key: 'a', initialState: 'old' });
    atom._setState('new');
    expect(atom.get()).toBe('new');
  });

  it('increments the version by 1 on each call', () => {
    const atom = defineAtom({ key: 'a', initialState: 0 });
    atom._setState(1);
    expect(atom.version).toBe(1);
    atom._setState(2);
    expect(atom.version).toBe(2);
  });

  it('accepts an explicit version override', () => {
    const atom = defineAtom({ key: 'a', initialState: 0 });
    atom._setState(99, 42);
    expect(atom.version).toBe(42);
  });
});

// ─── subscribe ────────────────────────────────────────────────────────────────

describe('subscribe', () => {
  it('notifies the listener synchronously on _setState', () => {
    const atom = defineAtom({ key: 'a', initialState: 0 });
    const received: number[] = [];
    atom.subscribe(s => received.push(s));

    atom._setState(1);
    atom._setState(2);

    expect(received).toEqual([1, 2]);
  });

  it('supports multiple independent listeners', () => {
    const atom = defineAtom({ key: 'a', initialState: 0 });
    const a: number[] = [];
    const b: number[] = [];
    atom.subscribe(s => a.push(s));
    atom.subscribe(s => b.push(s));

    atom._setState(5);
    expect(a).toEqual([5]);
    expect(b).toEqual([5]);
  });

  it('returns an unsubscribe function that stops notifications', () => {
    const atom = defineAtom({ key: 'a', initialState: 0 });
    const received: number[] = [];
    const unsub = atom.subscribe(s => received.push(s));

    atom._setState(1);
    unsub();
    atom._setState(2);

    expect(received).toEqual([1]);
  });

  it('does not call removed listeners after unsubscribe', () => {
    const atom  = defineAtom({ key: 'a', initialState: 0 });
    const spy1  = vi.fn();
    const spy2  = vi.fn();
    const unsub = atom.subscribe(spy1);
    atom.subscribe(spy2);

    unsub();
    atom._setState(99);

    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalledWith(99);
  });
});

// ─── statesAreEqual ───────────────────────────────────────────────────────────

describe('statesAreEqual', () => {
  it('returns true for the same primitive', () => {
    expect(statesAreEqual(1, 1)).toBe(true);
    expect(statesAreEqual('a', 'a')).toBe(true);
    expect(statesAreEqual(null, null)).toBe(true);
  });

  it('returns false for different primitives', () => {
    expect(statesAreEqual(1, 2)).toBe(false);
  });

  it('returns true for the same object reference', () => {
    const obj = { x: 1 };
    expect(statesAreEqual(obj, obj)).toBe(true);
  });

  it('returns false for structurally equal but distinct objects (uses Object.is)', () => {
    expect(statesAreEqual({ x: 1 }, { x: 1 })).toBe(false);
  });
});
