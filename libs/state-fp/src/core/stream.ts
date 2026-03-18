/**
 * EphemeralStream<T> — zero-kernel-overhead reactive primitive for high-frequency
 * UI state (mouse position, scroll, drag, canvas params, etc.).
 *
 * Unlike atoms, ephemeral streams:
 *  - do NOT pass through the CQRS kernel
 *  - are NOT persisted, time-travelled, or replicated across MFEs
 *  - are safe to emit at native event rates (60–120 fps)
 *
 * @module
 *
 * @example
 * ```ts
 * import { createEphemeralStream } from '@vi/state-fp/core';
 *
 * const mousePos = createEphemeralStream<{ x: number; y: number }>();
 *
 * window.addEventListener('mousemove', (e) => {
 *   mousePos.emit({ x: e.clientX, y: e.clientY });
 * });
 *
 * // Angular — use subscribeAnimated() for a RAF-batched render hook
 * const off = mousePos.subscribeAnimated(pos => signal.set(pos));
 * destroyRef.onDestroy(off);
 * ```
 */

import type { Unsubscribe } from '../kernel/types.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type { Unsubscribe };

/**
 * Reactive primitive for high-frequency UI state.
 *
 * `subscribe`         — synchronous fan-out; fires on every `emit()`.
 * `subscribeAnimated` — RAF-batched; listener fires at most once per animation
 *                       frame, receiving the LAST emitted value that frame.
 *                       Falls back to synchronous delivery in environments where
 *                       `requestAnimationFrame` is unavailable (SSR / Node.js).
 * `last`              — the most-recently emitted value, or `undefined` before
 *                       the first `emit()`.
 */
export type EphemeralStream<T> = {
  /** Emit a new value — synchronously notifies all plain subscribers. */
  emit(value: T): void;

  /**
   * Subscribe to every emitted value.
   * The listener is called synchronously inside `emit()`.
   * @returns an unsubscribe function.
   */
  subscribe(listener: (value: T) => void): Unsubscribe;

  /**
   * Subscribe with `requestAnimationFrame` batching.
   * Listener fires at most once per animation frame, with the LAST value
   * emitted during that frame. Falls back to synchronous delivery when
   * `requestAnimationFrame` is not available.
   * @returns an unsubscribe function.
   */
  subscribeAnimated(listener: (value: T) => void): Unsubscribe;

  /** The last value passed to `emit()`, or `undefined` before any emit. */
  readonly last: T | undefined;
};

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create a new EphemeralStream.
 *
 * The stream holds no state beyond the most recent emitted value (`last`).
 * It is NOT connected to any kernel, storage, or BroadcastChannel.
 */
export function createEphemeralStream<T>(): EphemeralStream<T> {
  const listeners = new Set<(value: T) => void>();
  let _last: T | undefined;

  // ── subscribeAnimated internals ──────────────────────────────────────────

  // Maps each RAF-subscriber to the pending-frame bookkeeping for that listener
  const rafEntries = new Map<
    (value: T) => void,
    { rafId: number; pending: T | undefined; hasPending: boolean }
  >();

  const hasRAF = typeof requestAnimationFrame === 'function';

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    emit(value: T): void {
      _last = value;

      // Notify plain subscribers synchronously
      for (const listener of listeners) {
        try { listener(value); } catch { /* isolate subscriber errors */ }
      }

      // Update pending value for RAF subscribers
      for (const entry of rafEntries.values()) {
        entry.pending    = value;
        entry.hasPending = true;
      }
    },

    subscribe(listener: (value: T) => void): Unsubscribe {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    subscribeAnimated(listener: (value: T) => void): Unsubscribe {
      if (!hasRAF) {
        // SSR / Node.js fallback — behave like a plain synchronous subscriber
        return this.subscribe(listener);
      }

      const entry = { rafId: 0, pending: undefined as T | undefined, hasPending: false };
      rafEntries.set(listener, entry);

      const tick = () => {
        if (!rafEntries.has(listener)) return;  // already unsubscribed
        if (entry.hasPending) {
          entry.hasPending = false;
          const value = entry.pending as T;
          try { listener(value); } catch { /* isolate subscriber errors */ }
        }
        entry.rafId = requestAnimationFrame(tick);
      };

      entry.rafId = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(entry.rafId);
        rafEntries.delete(listener);
      };
    },

    get last(): T | undefined {
      return _last;
    },
  };
}
