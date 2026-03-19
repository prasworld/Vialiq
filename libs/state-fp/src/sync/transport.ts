/**
 * @vi/state-fp/sync — Universal Transport Guard (Phase 4.6).
 *
 * Provides three `SyncTransport<S>` implementations and an auto-selector factory:
 *
 *  1. `createNoopTransport`       — safe no-op for SSR / Node.js / worker environments
 *  2. `createPostMessageTransport` — cross-origin relay via `window.postMessage`
 *  3. `createPostMessageRelay`    — shell-side relay that forwards cross-origin messages
 *  4. `createAutoTransport`       — selects the right transport at runtime:
 *       - BroadcastChannel available → `createBroadcastBridge`
 *       - BroadcastChannel unavailable (SSR, Node.js, etc.) → `createNoopTransport`
 *
 * Note: `PostMessage` transport is NOT automatically selected. For cross-origin
 * deployments, supply a custom `transport` factory to `createSyncEngine`.
 *
 * ## Security
 * `createPostMessageRelay` validates `event.origin` against a provided allow-list
 * and silently drops messages from untrusted origins.
 */

import type { SyncMessage, SyncTransport } from './types.js';
import { createBroadcastBridge }           from './broadcast.js';

// ─── No-op transport ─────────────────────────────────────────────────────────

/**
 * No-op transport for SSR / Node.js / Deno / Bun / isolated workers.
 * All operations are safe no-ops; `isOpen` is always `false`.
 */
export function createNoopTransport<S = unknown>(): SyncTransport<S> {
  return {
    send:      () => void 0,
    subscribe: () => () => void 0,
    close:     () => void 0,
    isOpen:    false,
  };
}

// ─── PostMessage transport ───────────────────────────────────────────────────

export type PostMessageTransportOptions = {
  /**
   * The origin of the shell/relay window to send messages to.
   * E.g. `'https://app.example.com'`.
   */
  targetOrigin: string;
  /**
   * Reference to the target window (e.g. `window.parent` or `opener`).
   * Defaults to `window.parent`.
   */
  targetWindow?: Window;
};

/**
 * Cross-origin transport using `window.postMessage`.
 * Designed for MFEs served from different origins that communicate via a
 * trusted shell relay (`createPostMessageRelay`).
 *
 * Messages are JSON-serialized with a `__vi_sync__` wrapper to namespace them.
 */
export function createPostMessageTransport<S = unknown>(
  channelName: string,
  options: PostMessageTransportOptions,
): SyncTransport<S> {
  if (typeof window === 'undefined') {
    return createNoopTransport<S>();
  }

  const { targetOrigin } = options;
  const targetWin        = options.targetWindow ?? window.parent;

  const listeners = new Set<(msg: SyncMessage<S>) => void>();
  let   _isOpen   = true;

  const onMessage = (ev: MessageEvent<unknown>) => {
    if (!_isOpen) return;
    // Validate the sender's origin. This prevents cross-origin frames from
    // injecting messages. Same-origin senders are accepted by design because:
    //  1. The `__vi_sync__` wrapper + `channel` field namespace all messages,
    //     so accidental collisions with unrelated postMessage callers are
    //     practically impossible.
    //  2. `ev.source` is a WindowProxy and cannot be compared to a plain
    //     object reference in library code without imposing a Window-shaped
    //     API constraint on callers.
    // Consumers requiring stronger isolation can wrap this transport and add
    // their own `ev.source === expectedWindow` guard after construction.
    if (ev.origin !== targetOrigin) return;

    let wrapper: { __vi_sync__: true; channel: string; msg: SyncMessage<S> };
    try {
      wrapper = (typeof ev.data === 'string'
        ? JSON.parse(ev.data)
        : ev.data) as typeof wrapper;
    } catch {
      return;
    }
    if (!wrapper?.__vi_sync__ || wrapper.channel !== channelName) return;

    const parsed = wrapper.msg;
    for (const listener of listeners) {
      try { listener(parsed); } catch { /* isolate errors */ }
    }
  };

  window.addEventListener('message', onMessage);

  return {
    send(msg: SyncMessage<S>): void {
      if (!_isOpen) return;
      const payload = JSON.stringify({ __vi_sync__: true, channel: channelName, msg });
      targetWin.postMessage(payload, targetOrigin);
    },

    subscribe(listener: (msg: SyncMessage<S>) => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    close(): void {
      if (!_isOpen) return;
      _isOpen = false;
      listeners.clear();
      window.removeEventListener('message', onMessage);
    },

    get isOpen(): boolean { return _isOpen; },
  };
}

// ─── PostMessage relay ───────────────────────────────────────────────────────

export type PostMessageRelayOptions = {
  /**
   * Origins allowed to communicate through this relay.
   * Messages from unlisted origins are silently dropped (security guard).
   */
  trustedOrigins: string[];
};

export type PostMessageRelay = {
  /** Stop listening and clean up. */
  destroy(): void;
};

/**
 * Shell-side relay that bridges cross-origin `postMessage` traffic onto a local
 * `BroadcastChannel`, making it reachable by same-origin remotes.
 *
 * Security: only messages whose `event.origin` appears in `trustedOrigins` are forwarded.
 *
 * @example
 * // In the shell:
 * const relay = createPostMessageRelay({
 *   trustedOrigins: ['https://remote.partner.com'],
 * });
 */
export function createPostMessageRelay(
  channelName: string,
  options: PostMessageRelayOptions,
): PostMessageRelay {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return { destroy: () => void 0 };
  }

  const { trustedOrigins } = options;
  const bc = new BroadcastChannel(channelName);

  const onMessage = (ev: MessageEvent<unknown>) => {
    // Security: drop messages from untrusted origins
    if (!trustedOrigins.includes(ev.origin)) return;

    let wrapper: { __vi_sync__: true; channel: string; msg: unknown };
    try {
      wrapper = (typeof ev.data === 'string'
        ? JSON.parse(ev.data)
        : ev.data) as typeof wrapper;
    } catch {
      return;
    }
    if (!wrapper?.__vi_sync__ || wrapper.channel !== channelName) return;

    // Forward onto the local BroadcastChannel for same-origin peers
    try {
      bc.postMessage(JSON.stringify(wrapper.msg));
    } catch {
      // ignore serialization errors
    }
  };

  window.addEventListener('message', onMessage);

  return {
    destroy(): void {
      window.removeEventListener('message', onMessage);
      bc.close();
    },
  };
}

// ─── Auto transport ───────────────────────────────────────────────────────────

/**
 * Selects the best available transport for the current runtime environment:
 *
 * 1. Browser with `BroadcastChannel`        → `BroadcastBridge`
 * 2. Node.js / SSR (no `BroadcastChannel`) → no-op transport
 *
 * Note: `PostMessage` transport is NOT automatically selected. To use a PostMessage relay
 * for cross-origin deployments, supply a custom `transport` factory to `createSyncEngine`.
 */
export function createAutoTransport<S = unknown>(channelName: string): SyncTransport<S> {
  // BroadcastChannel is the canonical cross-context messaging API.
  // It is available in browsers, Service Workers, and Shared Workers.
  // When absent (actual Node.js/SSR/Deno without polyfill) → safe no-op.
  if (typeof BroadcastChannel !== 'undefined') {
    return createBroadcastBridge<S>(channelName) as SyncTransport<S>;
  }
  return createNoopTransport<S>();
}
