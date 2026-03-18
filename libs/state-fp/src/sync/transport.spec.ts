/**
 * Phase 4.6 — Universal Transport Guard tests.
 *
 * Tests cover: NoopTransport, AutoTransport environment detection,
 * PostMessageTransport send/receive, and PostMessageRelay origin validation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createNoopTransport,
  createAutoTransport,
  createPostMessageTransport,
  createPostMessageRelay,
} from './transport.js';
import { createBroadcastBridge } from './broadcast.js';
import type { SyncMessage }      from './types.js';

// ─── Fake BroadcastChannel ───────────────────────────────────────────────────

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
    for (const peer of FakeBroadcastChannel.channels.get(this.name) ?? []) {
      if (peer !== this) peer.onmessage?.({ data } as MessageEvent);
    }
  }
  close() { FakeBroadcastChannel.channels.get(this.name)?.delete(this); }
}

const dummyMsg: SyncMessage = {
  type: 'vi/sync/state', peerId: 'p1', atomKey: 'counter',
  state: 42, version: { p1: 1 }, ts: 0,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 4.6 — Universal Transport Guard', () => {

  // ── createNoopTransport ───────────────────────────────────────────────────

  describe('createNoopTransport', () => {
    it('isOpen is false', () => {
      expect(createNoopTransport().isOpen).toBe(false);
    });

    it('send() is a no-op and does not throw', () => {
      const t = createNoopTransport();
      expect(() => t.send(dummyMsg)).not.toThrow();
    });

    it('subscribe() returns an unsubscribe function that does not throw', () => {
      const t = createNoopTransport();
      const unsub = t.subscribe(() => {});
      expect(() => unsub()).not.toThrow();
    });

    it('close() does not throw', () => {
      const t = createNoopTransport();
      expect(() => t.close()).not.toThrow();
    });

    it('listeners are never called after send()', () => {
      const t   = createNoopTransport();
      const spy = vi.fn();
      t.subscribe(spy);
      t.send(dummyMsg);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  // ── createAutoTransport ───────────────────────────────────────────────────

  // In Node environment BroadcastChannel is not native, so by default the auto
  // transport returns a noop. Setting globalThis.BroadcastChannel activates it.

  describe('createAutoTransport — no BroadcastChannel (SSR / Node.js)', () => {
    it('returns a noop transport when BroadcastChannel is unavailable', () => {
      // In the node test environment BroadcastChannel is not defined by default.
      const hadBC = typeof (globalThis as any).BroadcastChannel !== 'undefined';
      if (hadBC) delete (globalThis as any).BroadcastChannel;

      const t = createAutoTransport('test-channel');
      expect(t.isOpen).toBe(false);

      if (hadBC) (globalThis as any).BroadcastChannel = FakeBroadcastChannel;
    });

    it('no-ops silently when send() is called without BroadcastChannel', () => {
      const hadBC = typeof (globalThis as any).BroadcastChannel !== 'undefined';
      if (hadBC) delete (globalThis as any).BroadcastChannel;

      const t = createAutoTransport('test-channel');
      expect(() => t.send(dummyMsg)).not.toThrow();

      if (hadBC) (globalThis as any).BroadcastChannel = FakeBroadcastChannel;
    });
  });

  describe('createAutoTransport — browser context with BroadcastChannel', () => {
    beforeEach(() => {
      (globalThis as any).BroadcastChannel = FakeBroadcastChannel;
    });

    afterEach(() => {
      delete (globalThis as any).BroadcastChannel;
      FakeBroadcastChannel.channels.clear();
    });

    it('returns an open transport when BroadcastChannel is available', () => {
      const t = createAutoTransport('test-channel');
      expect(t.isOpen).toBe(true);
      t.close();
    });

    it('can send and receive messages via BroadcastChannel', () => {
      const t1 = createAutoTransport<number>('test-channel');
      const t2 = createBroadcastBridge<number>('test-channel');

      const received: SyncMessage<number>[] = [];
      t2.subscribe(msg => received.push(msg));

      t1.send(dummyMsg as SyncMessage<number>);

      expect(received).toHaveLength(1);
      expect(received[0].type).toBe('vi/sync/state');

      t1.close();
      t2.close();
    });
  });

  // ── createPostMessageTransport ────────────────────────────────────────────

  describe('createPostMessageTransport', () => {
    it('returns noop when window is undefined', () => {
      // In node environment window is undefined by default
      const t = createPostMessageTransport('ch', { targetOrigin: 'https://example.com' });
      expect(t.isOpen).toBe(false);
    });

    it('sends messages via postMessage and receives them via addEventListener', () => {
      const messageHandlers: Array<(ev: MessageEvent) => void> = [];
      const postedMessages: Array<{ data: unknown; origin: string }> = [];

      // Stub a minimal window with addEventListener / removeEventListener / parent
      const mockTargetWindow = {
        postMessage: (data: unknown, origin: string) => {
          postedMessages.push({ data, origin });
          // Simulate the receiving end — fire the message back to the transport
          const ev = new MessageEvent('message', {
            data,
            origin: 'https://example.com',
          });
          messageHandlers.forEach(h => h(ev));
        },
      };

      vi.stubGlobal('window', {
        addEventListener:    (type: string, handler: any) => { if (type === 'message') messageHandlers.push(handler); },
        removeEventListener: (type: string, handler: any) => { if (type === 'message') { const i = messageHandlers.indexOf(handler); if (i !== -1) messageHandlers.splice(i, 1); } },
        parent: mockTargetWindow,
      });

      const t = createPostMessageTransport<number>('vi-events', {
        targetOrigin: 'https://example.com',
        targetWindow: mockTargetWindow as any,
      });

      const received: SyncMessage<number>[] = [];
      t.subscribe(msg => received.push(msg));

      t.send(dummyMsg as SyncMessage<number>);

      expect(postedMessages).toHaveLength(1);
      expect(received).toHaveLength(1);
      expect(received[0].type).toBe('vi/sync/state');

      t.close();
      vi.unstubAllGlobals();
    });

    it('discards messages from untrusted origins', () => {
      const received: SyncMessage[] = [];
      const messageHandlers: Array<(ev: MessageEvent) => void> = [];

      vi.stubGlobal('window', {
        addEventListener:    (type: string, handler: any) => { if (type === 'message') messageHandlers.push(handler); },
        removeEventListener: () => {},
        parent: { postMessage: () => {} },
      });

      const t = createPostMessageTransport('vi-events', {
        targetOrigin: 'https://trusted.com',
        targetWindow: { postMessage: () => {} } as any,
      });
      t.subscribe(msg => received.push(msg));

      // Fire a message from an untrusted origin
      const malicious = new MessageEvent('message', {
        data: JSON.stringify({ __vi_sync__: true, channel: 'vi-events', msg: dummyMsg }),
        origin: 'https://evil.com',
      });
      messageHandlers.forEach(h => h(malicious));

      expect(received).toHaveLength(0);

      t.close();
      vi.unstubAllGlobals();
    });
  });

  // ── createPostMessageRelay ────────────────────────────────────────────────

  describe('createPostMessageRelay', () => {
    // Each test gets its own local message dispatch event system
    let windowListeners: Array<(ev: MessageEvent) => void> = [];

    const dispatchWindowMessage = (ev: MessageEvent) =>
      windowListeners.forEach(h => h(ev));

    beforeEach(() => {
      windowListeners = [];
      (globalThis as any).BroadcastChannel = FakeBroadcastChannel;
      vi.stubGlobal('window', {
        addEventListener:    (type: string, handler: any) => { if (type === 'message') windowListeners.push(handler); },
        removeEventListener: (type: string, handler: any) => { if (type === 'message') { const i = windowListeners.indexOf(handler); if (i !== -1) windowListeners.splice(i, 1); } },
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      delete (globalThis as any).BroadcastChannel;
      FakeBroadcastChannel.channels.clear();
      windowListeners = [];
    });

    it('returns noop when window is undefined', () => {
      vi.unstubAllGlobals();  // remove window stub
      const relay = createPostMessageRelay('ch', { trustedOrigins: ['https://trusted.com'] });
      expect(() => relay.destroy()).not.toThrow();
    });

    it('forwards messages from trusted origin onto BroadcastChannel', () => {
      const bc = createBroadcastBridge<unknown>('vi-relay');
      const received: SyncMessage[] = [];
      bc.subscribe(msg => received.push(msg));

      const relay = createPostMessageRelay('vi-relay', {
        trustedOrigins: ['https://trusted.com'],
      });

      // Simulate a postMessage from a trusted origin
      const evt = new MessageEvent('message', {
        data: JSON.stringify({ __vi_sync__: true, channel: 'vi-relay', msg: dummyMsg }),
        origin: 'https://trusted.com',
      });
      dispatchWindowMessage(evt);

      expect(received).toHaveLength(1);
      expect(received[0].type).toBe('vi/sync/state');

      relay.destroy();
      bc.close();
    });

    it('drops messages from origins not in the allow-list', () => {
      const bc = createBroadcastBridge<unknown>('vi-relay-guard');
      const received: SyncMessage[] = [];
      bc.subscribe(msg => received.push(msg));

      const relay = createPostMessageRelay('vi-relay-guard', {
        trustedOrigins: ['https://trusted.com'],
      });

      const malicious = new MessageEvent('message', {
        data: JSON.stringify({ __vi_sync__: true, channel: 'vi-relay-guard', msg: dummyMsg }),
        origin: 'https://attacker.com',
      });
      dispatchWindowMessage(malicious);

      expect(received).toHaveLength(0);

      relay.destroy();
      bc.close();
    });
  });
});
