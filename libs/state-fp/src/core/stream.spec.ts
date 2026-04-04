/**
 * Phase 4.7 — EphemeralStream tests.
 *
 * Covers: synchronous fan-out, last-value semantics, RAF batching
 * (last-write-wins per frame), subscribeAnimated SSR fallback,
 * unsubscribe cleanup, and isolation of subscriber errors.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createEphemeralStream } from './stream.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Flush the RAF queue: run all pending setTimeout(0) callbacks once. */
function _flushRAF(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 4.7 — EphemeralStream', () => {

  // ── last-value semantics ─────────────────────────────────────────────────

  describe('last accessor', () => {
    it('is undefined before any emit', () => {
      const s = createEphemeralStream<number>();
      expect(s.last).toBeUndefined();
    });

    it('returns the most recently emitted value', () => {
      const s = createEphemeralStream<number>();
      s.emit(1);
      expect(s.last).toBe(1);
      s.emit(42);
      expect(s.last).toBe(42);
    });

    it('updates last even when there are no subscribers', () => {
      const s = createEphemeralStream<string>();
      s.emit('hello');
      expect(s.last).toBe('hello');
    });
  });

  // ── synchronous subscribe ─────────────────────────────────────────────────

  describe('subscribe — synchronous fan-out', () => {
    it('calls subscriber immediately on each emit', () => {
      const s    = createEphemeralStream<number>();
      const seen: number[] = [];
      s.subscribe(v => seen.push(v));

      s.emit(1);
      s.emit(2);
      s.emit(3);

      expect(seen).toEqual([1, 2, 3]);
    });

    it('notifies multiple subscribers independently', () => {
      const s = createEphemeralStream<string>();
      const a: string[] = [];
      const b: string[] = [];
      s.subscribe(v => a.push(v));
      s.subscribe(v => b.push(v));

      s.emit('x');

      expect(a).toEqual(['x']);
      expect(b).toEqual(['x']);
    });

    it('unsubscribe stops delivery', () => {
      const s    = createEphemeralStream<number>();
      const seen: number[] = [];
      const off  = s.subscribe(v => seen.push(v));

      s.emit(1);
      off();
      s.emit(2);

      expect(seen).toEqual([1]);
    });

    it('isolates errors in one subscriber from others', () => {
      const s   = createEphemeralStream<number>();
      const spy = vi.fn();

      s.subscribe(() => { throw new Error('boom'); });
      s.subscribe(spy);

      expect(() => s.emit(1)).not.toThrow();
      // second subscriber still called even though first threw
      expect(spy).toHaveBeenCalledWith(1);
    });
  });

  // ── subscribeAnimated ─────────────────────────────────────────────────────

  describe('subscribeAnimated — RAF-batched delivery', () => {
    let rafCallbacks: FrameRequestCallback[] = [];
    let rafIdCounter = 0;
    let origRAF: typeof requestAnimationFrame | undefined;
    let origCancelRAF: typeof cancelAnimationFrame | undefined;

    beforeEach(() => {
      rafCallbacks = [];
      rafIdCounter = 0;
      origRAF = globalThis.requestAnimationFrame;
      origCancelRAF = globalThis.cancelAnimationFrame;

      vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        const id = ++rafIdCounter;
        rafCallbacks.push(cb);
        return id;
      });

      vi.stubGlobal('cancelAnimationFrame', (_id: number) => {
        // mark entry as invalid — simplest approach for test
        // (real impl just removes it from pending)
      });
    });

    afterEach(() => {
      if (origRAF) {
        globalThis.requestAnimationFrame = origRAF;
      }
      if (origCancelRAF) {
        globalThis.cancelAnimationFrame = origCancelRAF;
      }
      vi.unstubAllGlobals();
      rafCallbacks = [];
    });

    /** Run all currently queued RAF callbacks (one frame). */
    function runOneFrame(): void {
      const batch = [...rafCallbacks];
      rafCallbacks = [];
      batch.forEach(cb => cb(performance.now()));
    }

    it('fires listener once per frame with the LAST emitted value', () => {
      const s    = createEphemeralStream<number>();
      const seen: number[] = [];
      s.subscribeAnimated(v => seen.push(v));

      // Emit 3 values before the frame fires
      s.emit(1);
      s.emit(2);
      s.emit(3);

      // No delivery yet
      expect(seen).toHaveLength(0);

      runOneFrame();

      // Only the last value delivered
      expect(seen).toEqual([3]);
    });

    it('fires listener once per subsequent frame when values keep arriving', () => {
      const s    = createEphemeralStream<number>();
      const seen: number[] = [];
      s.subscribeAnimated(v => seen.push(v));

      s.emit(10);
      runOneFrame();
      expect(seen).toEqual([10]);

      s.emit(20);
      runOneFrame();
      expect(seen).toEqual([10, 20]);
    });

    it('does not fire if no values emitted that frame', () => {
      const s    = createEphemeralStream<number>();
      const seen: number[] = [];
      s.subscribeAnimated(v => seen.push(v));

      runOneFrame();  // no emit before frame

      expect(seen).toHaveLength(0);
    });

    it('unsubscribe cancels RAF delivery', () => {
      const cancelSpy = vi.fn();
      vi.stubGlobal('cancelAnimationFrame', cancelSpy);

      const s   = createEphemeralStream<number>();
      const spy = vi.fn();
      const off = s.subscribeAnimated(spy);

      s.emit(5);
      off();          // unsubscribe before frame fires — should cancel the pending RAF
      runOneFrame();

      expect(spy).not.toHaveBeenCalled();
      expect(cancelSpy).toHaveBeenCalledTimes(1); // RAF was cancelled (line 147 branch taken)
    });

    it('multiple animated subscribers are independent', () => {
      const s = createEphemeralStream<number>();
      const a: number[] = [];
      const b: number[] = [];
      s.subscribeAnimated(v => a.push(v));
      s.subscribeAnimated(v => b.push(v));

      s.emit(7);
      runOneFrame();

      expect(a).toEqual([7]);
      expect(b).toEqual([7]);
    });

    it('subscriber added after emit receives nothing until next emit (hasPending guard)', () => {
      // This specifically exercises line 96: `if (!entry.hasPending) continue;`
      // Subscriber B is added AFTER the emit so hasPending stays false when the frame fires
      const s = createEphemeralStream<number>();
      const aValues: number[] = [];
      const bValues: number[] = [];

      s.subscribeAnimated(v => aValues.push(v));   // A: added before emit
      s.emit(5);                                    // A.hasPending = true, RAF queued

      s.subscribeAnimated(v => bValues.push(v));   // B: added after emit, hasPending = false
      runOneFrame();                                // flushAnimated: A delivers 5; B skipped (continue)

      expect(aValues).toEqual([5]);
      expect(bValues).toEqual([]);                 // B was not pending, safely skipped
    });
  });

  // ── SSR / Node.js fallback ────────────────────────────────────────────────

  describe('subscribeAnimated — SSR fallback (no requestAnimationFrame)', () => {
    let originalRAF: typeof requestAnimationFrame | undefined;

    beforeEach(() => {
      originalRAF = (globalThis as any).requestAnimationFrame;
      delete (globalThis as any).requestAnimationFrame;
    });

    afterEach(() => {
      if (originalRAF !== undefined) {
        (globalThis as any).requestAnimationFrame = originalRAF;
      }
    });

    it('falls back to synchronous delivery when RAF is unavailable', () => {
      const s    = createEphemeralStream<string>();
      const seen: string[] = [];
      s.subscribeAnimated(v => seen.push(v));

      s.emit('ssr');

      // In SSR fallback, synchronous delivery — value arrives immediately
      expect(seen).toEqual(['ssr']);
    });

    it('SSR fallback unsubscribes correctly', () => {
      const s    = createEphemeralStream<string>();
      const seen: string[] = [];
      const off  = s.subscribeAnimated(v => seen.push(v));

      s.emit('a');
      off();
      s.emit('b');

      expect(seen).toEqual(['a']);
    });
  });
});
