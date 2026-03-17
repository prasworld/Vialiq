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
});
