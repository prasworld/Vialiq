import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createBroadcastBridge } from './broadcast.js';
import type { SyncMessage } from './types.js';

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

describe('createBroadcastBridge', () => {
  beforeEach(() => {
    (globalThis as unknown as { BroadcastChannel: typeof FakeBroadcastChannel }).BroadcastChannel = FakeBroadcastChannel;
  });

  afterEach(() => {
    delete (globalThis as unknown as { BroadcastChannel?: typeof FakeBroadcastChannel }).BroadcastChannel;
    FakeBroadcastChannel.channels.clear();
  });

  it('sends and receives structured messages', () => {
    const a = createBroadcastBridge<number>('c1');
    const b = createBroadcastBridge<number>('c1');
    const received: SyncMessage<number>[] = [];

    b.subscribe((msg) => received.push(msg));
    a.send({
      type: 'vi/sync/state',
      atomKey: 'counter',
      peerId: 'a',
      state: 42,
      version: { a: 1 },
      ts: 1,
    });

    expect(received.length).toBe(1);
    expect(received[0].type).toBe('vi/sync/state');
  });

  it('ignores malformed messages and closes cleanly', () => {
    const a = createBroadcastBridge('c1');
    const b = createBroadcastBridge('c1');
    const received: unknown[] = [];

    b.subscribe((msg) => received.push(msg));
    const raw = new FakeBroadcastChannel('c1');
    raw.postMessage('{not valid json');

    expect(received.length).toBe(0);
    expect(a.isOpen).toBe(true);
    a.close();
    expect(a.isOpen).toBe(false);
  });

  it('throws when BroadcastChannel is not available', () => {
    // Temporarily remove BroadcastChannel to simulate SSR / Node.js
    delete (globalThis as unknown as { BroadcastChannel?: unknown }).BroadcastChannel;
    expect(() => createBroadcastBridge('test')).toThrow(/BroadcastChannel is not available/);
    // Restore for afterEach cleanup
    (globalThis as unknown as { BroadcastChannel: typeof FakeBroadcastChannel }).BroadcastChannel = FakeBroadcastChannel;
  });

  it('handles object (non-string) data arriving via BroadcastChannel', () => {
    const bridge = createBroadcastBridge<number>('c1');
    const received: SyncMessage<number>[] = [];
    bridge.subscribe(msg => received.push(msg));

    // Send an object directly (not a JSON string) via the fake channel
    const raw = new FakeBroadcastChannel('c1');
    const msg: SyncMessage<number> = { type: 'vi/sync/state', peerId: 'r', atomKey: 'a', state: 99, version: { r: 1 }, ts: 0 };
    raw.postMessage(msg); // sends as object, not string

    expect(received.length).toBe(1);
    expect(received[0].type).toBe('vi/sync/state');
    bridge.close();
  });

  it('send() is a no-op when bridge is closed', () => {
    const bridge = createBroadcastBridge<number>('c1');
    bridge.close();
    // Should not throw when sending after close
    expect(() => bridge.send({ type: 'vi/sync/state', peerId: 'x', atomKey: 'a', state: 1, version: {}, ts: 0 })).not.toThrow();
  });

  it('close() is idempotent — calling twice is safe', () => {
    const bridge = createBroadcastBridge<number>('c1');
    bridge.close();
    expect(() => bridge.close()).not.toThrow();
    expect(bridge.isOpen).toBe(false);
  });
});
