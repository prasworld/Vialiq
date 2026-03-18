import { describe, expect, it } from 'vitest';
import { defineAtom } from './atom.js';
import { createKernel } from './kernel.js';
import type { Atom } from './types.js';
import { MemoryAdapter } from '../storage/memory.js';

// Mock adapters for testing guard enforcement.
// Real implementations are intentionally removed from source.
class LocalAdapterMock {
  readonly name = 'local';
}

class SessionAdapterMock {
  readonly name = 'session';
}

class IndexedDbAdapterMock {
  readonly name = 'indexeddb';
}

describe('application storage safety guard', () => {
  it('allows MemoryAdapter', () => {
    expect(() => defineAtom({
      key: 'vi/safe-memory',
      initialState: { ok: true },
      storage: { adapter: new MemoryAdapter() },
    })).not.toThrow();
  });

  it('forbids LocalAdapter', () => {
    expect(() => defineAtom({
      key: 'vi/unsafe-local',
      initialState: { token: 'x' },
      storage: { adapter: new LocalAdapterMock() },
    })).toThrow(/Forbidden storage adapter "local"/i);
  });

  it('forbids SessionAdapter', () => {
    expect(() => defineAtom({
      key: 'vi/unsafe-session',
      initialState: { token: 'x' },
      storage: { adapter: new SessionAdapterMock() },
    })).toThrow(/Forbidden storage adapter "session"/i);
  });

  it('forbids IndexedDbAdapter', () => {
    expect(() => defineAtom({
      key: 'vi/unsafe-idb',
      initialState: { cache: [] as string[] },
      storage: { adapter: new IndexedDbAdapterMock() },
    })).toThrow(/Forbidden storage adapter "indexeddb"/i);
  });

  it('throws when adapter is present but has no name property', () => {
    expect(() => defineAtom({
      key: 'vi/unnamed-adapter',
      initialState: 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      storage: { adapter: { get: () => void 0 } as any }, // valid-looking adapter, no name
    })).toThrow(/exposes no "name" property/i);
  });

  it('defends at kernel.register for forged atoms', () => {
    const kernel = createKernel();
    const forgedAtom = {
      definition: {
        key: 'vi/forged',
        initialState: 0,
        storage: { adapter: { name: 'local' } },
      },
      key: 'vi/forged',
      version: 0,
      get: () => 0,
      subscribe: () => () => void 0,
      _setState: () => void 0,
    } as unknown as Atom<number>;

    expect(() => kernel.register(forgedAtom)).toThrow(/Forbidden storage adapter "local"/i);
  });
});
