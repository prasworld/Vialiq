/**
 * BroadcastBridge — thin wrapper around the browser BroadcastChannel API.
 *
 * Handles JSON serialisation/deserialisation and provides a clean typed
 * interface for the sync engine to send and receive `SyncMessage` payloads.
 *
 * A single BroadcastBridge instance is shared for a given channel name; the
 * sync engine attaches/detaches listeners as atoms are shared/unshared.
 */

import type { SyncMessage } from './types.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageListener<S = unknown> = (msg: SyncMessage<S>) => void;

export type BroadcastBridge<S = unknown> = {
  /** Send a message to all other peers on this channel. */
  send(msg: SyncMessage<S>): void;
  /** Register a listener. Returns an unsubscribe function. */
  subscribe(listener: MessageListener<S>): () => void;
  /** Close the BroadcastChannel. */
  close(): void;
  /** Whether the channel is still open. */
  readonly isOpen: boolean;
};

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create a BroadcastBridge wrapping a `BroadcastChannel` of the given name.
 *
 * @throws `Error` if `BroadcastChannel` is not available in the current environment.
 */
export function createBroadcastBridge<S = unknown>(
  channelName: string,
): BroadcastBridge<S> {
  if (typeof BroadcastChannel === 'undefined') {
    throw new Error(
      `[@vi/state-fp/sync] BroadcastChannel is not available in this environment. ` +
      `Use a polyfill or restrict sync to browser contexts.`,
    );
  }

  const channel   = new BroadcastChannel(channelName);
  const listeners = new Set<MessageListener<S>>();
  let   _isOpen   = true;

  channel.onmessage = (ev: MessageEvent<unknown>) => {
    let parsed: SyncMessage<S>;
    try {
      parsed = (typeof ev.data === 'string'
        ? JSON.parse(ev.data)
        : ev.data) as SyncMessage<S>;
    } catch {
      return; // malformed message — silently ignore
    }
    for (const listener of listeners) {
      try { listener(parsed); } catch { /* isolate listener errors */ }
    }
  };

  return {
    send(msg: SyncMessage<S>): void {
      if (!_isOpen) return;
      channel.postMessage(JSON.stringify(msg));
    },

    subscribe(listener: MessageListener<S>): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    close(): void {
      if (!_isOpen) return;
      _isOpen = false;
      listeners.clear();
      channel.close();
    },

    get isOpen(): boolean {
      return _isOpen;
    },
  };
}
