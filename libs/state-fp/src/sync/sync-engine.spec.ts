import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Atom } from '../kernel/types.js';
import { createBroadcastBridge } from './broadcast.js';
import { createSyncEngine } from './sync-engine.js';

class FakeBroadcastChannel {
  static channels = new Map<string, Set<FakeBroadcastChannel>>();

  readonly name: string;
  onmessage: ((ev: MessageEvent) => void) | null = null;

  constructor(name: string) {
    this.name = name;
    if (!FakeBroadcastChannel.channels.has(name)) {
      FakeBroadcastChannel.channels.set(name, new Set());
    }
    FakeBroadcastChannel.channels.get(name)!.add(this);
  }

  postMessage(data: unknown): void {
    const peers = FakeBroadcastChannel.channels.get(this.name) ?? new Set();
    for (const peer of peers) {
      if (peer === this) continue;
      peer.onmessage?.({ data } as MessageEvent);
    }
  }

  close(): void {
    FakeBroadcastChannel.channels.get(this.name)?.delete(this);
  }
}

function createAtom<S>(key: string, initial: S): Atom<S> {
  let state = initial;
  const listeners = new Set<(v: S) => void>();

  return {
    definition: { key, initialState: initial },
    key,
    get: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    get version() {
      return 0;
    },
    _setState: (next) => {
      state = next;
      listeners.forEach(fn => fn(next));
    },
  };
}

describe('createSyncEngine', () => {
  beforeEach(() => {
    (globalThis as unknown as { BroadcastChannel: typeof FakeBroadcastChannel }).BroadcastChannel = FakeBroadcastChannel;
  });

  afterEach(() => {
    delete (globalThis as unknown as { BroadcastChannel?: typeof FakeBroadcastChannel }).BroadcastChannel;
    FakeBroadcastChannel.channels.clear();
  });

  it('shares atom state and applies remote state updates', async () => {
    const atom = createAtom('counter', 0);
    const kernel = {
      subscribe: <S>(a: Atom<S>, listener: (v: S) => void) => a.subscribe(listener),
    };

    const engine = createSyncEngine({ kernel });
    const unsync = engine.share(atom, { channel: 'counter-channel', peerId: 'local' });

    const remoteBridge = createBroadcastBridge<number>('counter-channel');
    remoteBridge.send({
      type: 'vi/sync/state',
      atomKey: atom.key,
      peerId: 'remote',
      state: 7,
      version: { remote: 1 },
      ts: Date.now(),
    });

    await Promise.resolve();
    expect(atom.get()).toBe(7);

    const state = engine.getState<number>(atom.key);
    expect(state).toBeDefined();
    expect(state?.connected).toBe(true);

    unsync();
    expect(engine.getState(atom.key)).toBeUndefined();
  });

  it('broadcasts local writes and resolves conflicts', async () => {
    const atom = createAtom('counter', 0);
    const kernel = {
      subscribe: <S>(a: Atom<S>, listener: (v: S) => void) => a.subscribe(listener),
    };

    const engine = createSyncEngine({ kernel });
    engine.share(atom, { channel: 'counter-channel', peerId: 'local', conflict: 'last-write-wins' });

    const observer = createBroadcastBridge<number>('counter-channel');
    const seen: string[] = [];
    observer.subscribe(msg => seen.push(msg.type));

    atom._setState(1);
    await Promise.resolve();
    expect(seen).toContain('vi/sync/state');

    observer.send({
      type: 'vi/sync/state',
      atomKey: atom.key,
      peerId: 'remote',
      state: 99,
      version: { remote: 1 },
      ts: Date.now() + 1000,
    });

    await Promise.resolve();
    const state = engine.getState<number>(atom.key);
    expect(state?.conflictsResolved).toBeGreaterThanOrEqual(1);

    engine.destroy();
    expect(engine.getState(atom.key)).toBeUndefined();
  });

  it('2-MFE integration: two sync engines share state across a channel', async () => {
    // Simulates shell MFE (engine A) and remote1 MFE (engine B), each with their own
    // kernel + atom instance, connected via the same FakeBroadcastChannel.
    const atomA = createAtom('vi/counter', 0);
    const atomB = createAtom('vi/counter', 0);

    const kernelA = { subscribe: <S>(a: Atom<S>, l: (v: S) => void) => a.subscribe(l) };
    const kernelB = { subscribe: <S>(a: Atom<S>, l: (v: S) => void) => a.subscribe(l) };

    const engineA = createSyncEngine({ kernel: kernelA });
    const engineB = createSyncEngine({ kernel: kernelB });

    engineA.share(atomA, { channel: 'vi/counter', peerId: 'mfe-shell',   conflict: 'last-write-wins' });
    engineB.share(atomB, { channel: 'vi/counter', peerId: 'mfe-remote1', conflict: 'last-write-wins' });

    // Shell updates its atom — should propagate to remote1
    atomA._setState(42);
    await Promise.resolve();
    expect(atomB.get()).toBe(42);

    // Remote1 updates its atom — should propagate back to shell
    atomB._setState(99);
    await Promise.resolve();
    expect(atomA.get()).toBe(99);

    engineA.destroy();
    engineB.destroy();
  });

  it('2-MFE integration: stale messages from an old peer are discarded', async () => {
    const atom = createAtom('vi/data', 'initial');
    const kernel = { subscribe: <S>(a: Atom<S>, l: (v: S) => void) => a.subscribe(l) };

    const engine = createSyncEngine({ kernel });
    engine.share(atom, { channel: 'vi/data', peerId: 'local' });

    // First apply a fresh message so local version is { remote: 2 }
    const bridge = createBroadcastBridge<string>('vi/data');
    bridge.send({
      type:    'vi/sync/state',
      peerId:  'remote',
      atomKey: 'vi/data',
      state:   'v2',
      version: { remote: 2 },
      ts:      Date.now(),
    });
    await Promise.resolve();
    expect(atom.get()).toBe('v2');

    // Now send a stale message with older version — should be discarded
    bridge.send({
      type:    'vi/sync/state',
      peerId:  'remote',
      atomKey: 'vi/data',
      state:   'old-stale-value',
      version: { remote: 1 },
      ts:      Date.now() - 5000,
    });
    await Promise.resolve();
    expect(atom.get()).toBe('v2'); // unchanged

    engine.destroy();
  });
});
