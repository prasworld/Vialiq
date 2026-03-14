/**
 * EventLog — append-only, bounded circular buffer with secondary indices.
 *
 * Stores `DebugEntry` items containing the full before/after state transition
 * for every command execution recorded by the kernel debug layer.
 *
 * When the buffer is full the oldest entry is evicted and secondary index
 * references are cleaned up automatically.
 */

import type { DebugEntry, EventLogInterface } from './types.js';
import type { Maybe }  from '../core/types.js';
import { just, nothing } from '../core/maybe.js';

export class EventLog implements EventLogInterface {
  readonly #maxSize:  number;
  readonly #buffer:   DebugEntry[] = [];

  /** Secondary index: atomKey → Set of entry ids in buffer. */
  readonly #byAtom        = new Map<string, string[]>();
  /** Secondary index: correlationId → Set of entry ids in buffer. */
  readonly #byCorrelation = new Map<string, string[]>();

  #totalCount = 0;
  /** Circular-buffer head pointer (index of the oldest slot). */
  #head       = 0;

  constructor(maxSize = 500) {
    this.#maxSize = maxSize;
  }

  get totalCount(): number { return this.#totalCount; }

  append(entry: DebugEntry): void {
    this.#totalCount++;

    if (this.#buffer.length < this.#maxSize) {
      this.#buffer.push(entry);
    } else {
      // Evict oldest entry
      const evicted = this.#buffer[this.#head];
      if (evicted) {
        this.#removeFromIndex(this.#byAtom,        evicted.atomKey,       evicted.id);
        this.#removeFromIndex(this.#byCorrelation, evicted.correlationId, evicted.id);
      }
      this.#buffer[this.#head] = entry;
      this.#head = (this.#head + 1) % this.#maxSize;
    }

    this.#addToIndex(this.#byAtom,        entry.atomKey,       entry.id);
    this.#addToIndex(this.#byCorrelation, entry.correlationId, entry.id);
  }

  /** All buffered entries, oldest first. */
  getAll(): ReadonlyArray<DebugEntry> {
    if (this.#buffer.length < this.#maxSize) return [...this.#buffer];
    return [
      ...this.#buffer.slice(this.#head),
      ...this.#buffer.slice(0, this.#head),
    ];
  }

  /** Entries for a specific atom, oldest first. */
  getByAtom(atomKey: string): ReadonlyArray<DebugEntry> {
    const ids = this.#byAtom.get(atomKey) ?? [];
    return this.#resolveIds(ids);
  }

  /** Entries sharing a correlationId, oldest first. */
  getByCorrelation(correlationId: string): ReadonlyArray<DebugEntry> {
    const ids = this.#byCorrelation.get(correlationId) ?? [];
    return this.#resolveIds(ids);
  }

  /** Entries whose timestamp falls within [from, to]. */
  getByTimeRange(from: number, to: number): ReadonlyArray<DebugEntry> {
    return this.getAll().filter(e => e.timestamp >= from && e.timestamp <= to);
  }

  /** Last `n` entries. */
  last(n: number): ReadonlyArray<DebugEntry> {
    const all = this.getAll();
    return all.slice(Math.max(0, all.length - n));
  }

  /** Most recent entry, or Nothing. */
  latest(): Maybe<DebugEntry> {
    const all = this.getAll();
    return all.length === 0 ? nothing() : just(all[all.length - 1]);
  }

  /** Evict all entries and reset indices. */
  clear(): void {
    this.#buffer.length = 0;
    this.#byAtom.clear();
    this.#byCorrelation.clear();
    this.#head = 0;
  }

  /** Serialize the entire log as a JSON string (for exportLog). */
  serialize(): string {
    return JSON.stringify(this.getAll());
  }

  /** Replace log contents from a previously serialized JSON string. */
  deserialize(json: string): void {
    const entries: DebugEntry[] = JSON.parse(json);
    this.clear();
    for (const e of entries) this.append(e);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  #addToIndex(map: Map<string, string[]>, key: string, id: string): void {
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(id);
  }

  #removeFromIndex(map: Map<string, string[]>, key: string, id: string): void {
    const ids = map.get(key);
    if (!ids) return;
    const idx = ids.indexOf(id);
    if (idx !== -1) ids.splice(idx, 1);
    if (ids.length === 0) map.delete(key);
  }

  #resolveIds(ids: string[]): ReadonlyArray<DebugEntry> {
    const all = this.getAll();
    const idSet = new Set(ids);
    return all.filter(e => idSet.has(e.id));
  }
}
