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

  // ── subscribeAnimated internals (demand-driven — one shared RAF per stream) ─
  //
  // A single RAF is scheduled per stream only when a value is emitted AND there
  // are animated subscribers. The frame is NOT rescheduled when idle, so streams
  // that receive no new values cost zero CPU between emits.

  type AnimatedEntry = { pending: T | undefined; hasPending: boolean };
  const animatedListeners = new Map<(value: T) => void, AnimatedEntry>();
  let rafId      = 0;
  let rafPending = false;

  /** Deliver the buffered last-value to every animated subscriber. */
  function flushAnimated(): void {
    rafPending = false;
    for (const [listener, entry] of animatedListeners) {
      if (!entry.hasPending) continue;
      entry.hasPending = false;
      const value = entry.pending as T;
      try { listener(value); } catch { /* isolate subscriber errors */ }
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    emit(value: T): void {
      _last = value;

      // Notify plain subscribers synchronously
      for (const listener of listeners) {
        try { listener(value); } catch { /* isolate subscriber errors */ }
      }

      // Mark animated subscribers pending and schedule ONE RAF if not already
      // scheduled. All subsequent emits before the frame fires just overwrite
      // the pending value — only the last value is delivered per frame.
      if (typeof requestAnimationFrame === 'function' && animatedListeners.size > 0) {
        for (const entry of animatedListeners.values()) {
          entry.pending    = value;
          entry.hasPending = true;
        }
        if (!rafPending) {
          rafPending = true;
          rafId = requestAnimationFrame(flushAnimated);
        }
      }
    },

    subscribe(listener: (value: T) => void): Unsubscribe {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    subscribeAnimated(listener: (value: T) => void): Unsubscribe {
      if (typeof requestAnimationFrame !== 'function') {
        // SSR / Node.js fallback — close over `listeners` directly to avoid
        // relying on `this` binding (safe even when the method is destructured).
        listeners.add(listener);
        return () => listeners.delete(listener);
      }

      animatedListeners.set(listener, { pending: undefined, hasPending: false });

      return () => {
        animatedListeners.delete(listener);
        // Cancel the pending RAF if no animated subscribers remain.
        if (animatedListeners.size === 0 && rafPending) {
          cancelAnimationFrame(rafId);
          rafPending = false;
        }
      };
    },

    get last(): T | undefined {
      return _last;
    },
  };
}
