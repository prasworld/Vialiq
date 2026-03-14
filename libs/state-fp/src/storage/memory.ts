/**
 * MemoryAdapter — in-process, ephemeral storage.
 *
 * Data lives only for the lifetime of the current JS context.
 * Default when no storage config is declared on an atom.
 * TTL is enforced on read and periodically swept.
 */

import type { StorageResult, StorageEntry, StorageAdapter } from './types.js';
import type { Maybe } from '../core/types.js';
import { left, right } from '../core/either.js';
import { just, nothing } from '../core/maybe.js';
import { defaultSerialize, defaultDeserialize, now } from '../core/utils.js';

type Entry = StorageEntry<unknown>;

/** Options accepted by {@link MemoryAdapter}. */
export type MemoryAdapterOptions = { sweepIntervalMs?: number };

export class MemoryAdapter implements StorageAdapter {
  readonly name = 'memory';

  readonly #store = new Map<string, Entry>();
  readonly #sweepIntervalMs: number;
  #sweepTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options: MemoryAdapterOptions = {}) {
    this.#sweepIntervalMs = options.sweepIntervalMs ?? 60_000;
    this.#startSweep();
  }

  async get<T>(key: string): StorageResult<Maybe<T>> {
    const entry = this.#store.get(key);
    if (!entry) return right(nothing<T>());
    if (this.#isExpired(entry)) {
      this.#store.delete(key);
      return right(nothing<T>());
    }
    try {
      const value = defaultDeserialize<T>(defaultSerialize(entry.v));
      return right(just<T>(value));
    } catch (cause) {
      return left({ code: 'DESERIALISE_ERROR', message: 'Failed to deserialise value', cause });
    }
  }

  async set<T>(key: string, value: T, ttl?: number): StorageResult<void> {
    const t: number = now();
    const entry: Entry = {
      v:   value,
      t,
      ...(ttl !== undefined && { x: t + ttl }),
      tag: key,
      fv:  1,
    };
    this.#store.set(key, entry);
    return right(undefined);
  }

  async delete(key: string): StorageResult<void> {
    this.#store.delete(key);
    return right(undefined);
  }

  async clear(prefix?: string): StorageResult<void> {
    if (prefix === undefined) {
      this.#store.clear();
    } else {
      for (const k of this.#store.keys()) {
        if (k.startsWith(prefix)) this.#store.delete(k);
      }
    }
    return right(undefined);
  }

  async keys(prefix?: string): StorageResult<string[]> {
    const all = [...this.#store.keys()];
    return right(prefix === undefined ? all : all.filter(k => k.startsWith(prefix)));
  }

  async exists(key: string): StorageResult<boolean> {
    const entry = this.#store.get(key);
    if (!entry) return right(false);
    if (this.#isExpired(entry)) {
      this.#store.delete(key);
      return right(false);
    }
    return right(true);
  }

  /** Stop the background TTL sweep (call in teardown). */
  dispose(): void {
    if (this.#sweepTimer !== null) {
      clearInterval(this.#sweepTimer);
      this.#sweepTimer = null;
    }
  }

  /** Number of non-expired entries currently in memory. */
  get size(): number {
    return this.#store.size;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  #isExpired(entry: Entry): boolean {
    return entry.x !== undefined && now() > entry.x;
  }

  #startSweep(): void {
    if (typeof setInterval === 'undefined') return;
    this.#sweepTimer = setInterval(() => {
      for (const [key, entry] of this.#store) {
        if (this.#isExpired(entry)) this.#store.delete(key);
      }
    }, this.#sweepIntervalMs);

    // Prevent holding the Node.js event loop open in tests / SSR
    if (this.#sweepTimer && typeof (this.#sweepTimer as unknown as { unref?: () => void }).unref === 'function') {
      (this.#sweepTimer as unknown as { unref: () => void }).unref();
    }
  }
}
