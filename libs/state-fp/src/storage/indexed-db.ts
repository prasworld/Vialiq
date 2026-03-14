/**
 * IndexedDbAdapter — IndexedDB backend.
 *
 * Persistent, async, high-capacity (50 MB–1 GB depending on browser/origin).
 * Suitable for large state slices and offline-capable applications.
 *
 * Usage:
 *   const adapter = new IndexedDbAdapter({ dbName: 'my-app' });
 *   // open() is called automatically on first use; call it eagerly for faster
 *   // first access if desired.
 */

import type { StorageAdapter, StorageResult, StorageEntry } from './types.js';
import type { Maybe } from '../core/types.js';
import { left, right } from '../core/either.js';
import { just, nothing } from '../core/maybe.js';
import { defaultSerialize, defaultDeserialize, now } from '../core/utils.js';

// ─── Options ─────────────────────────────────────────────────────────────────

export type IndexedDbAdapterOptions = {
  /** IDB database name. Default: `'vi-state-fp'` */
  dbName?:    string;
  /** Object-store name inside the database. Default: `'atoms'` */
  storeName?: string;
  /** IDB schema version. Default: `1` */
  version?:   number;
};

// ─── Adapter ─────────────────────────────────────────────────────────────────

export class IndexedDbAdapter implements StorageAdapter {
  readonly name = 'indexeddb';

  readonly #dbName:    string;
  readonly #storeName: string;
  readonly #version:   number;
  #db: IDBDatabase | null = null;

  constructor(options: IndexedDbAdapterOptions = {}) {
    this.#dbName    = options.dbName    ?? 'vi-state-fp';
    this.#storeName = options.storeName ?? 'atoms';
    this.#version   = options.version   ?? 1;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /** Eagerly open the database. Called automatically by every read/write. */
  async open(): Promise<void> {
    this.#db = await this.#openDb();
  }

  async get<T>(key: string): StorageResult<Maybe<T>> {
    try {
      const db  = await this.#ensureOpen();
      const raw = await this.#idbGet<string>(db, key);
      if (raw === undefined) return right(nothing<T>());

      const entry = defaultDeserialize<StorageEntry<T>>(raw);
      if (this.#isExpired(entry)) {
        await this.#idbDelete(db, key);
        return right(nothing<T>());
      }
      return right(just(entry.v));
    } catch (cause) {
      return left({ code: 'DESERIALISE_ERROR', message: 'Failed to deserialise IDB entry', cause });
    }
  }

  async set<T>(key: string, value: T, ttl?: number): StorageResult<void> {
    try {
      const db = await this.#ensureOpen();
      const t  = now();
      const entry: StorageEntry<T> = {
        v: value, t, ...(ttl !== undefined && { x: t + ttl }), tag: key, fv: 1,
      };
      await this.#idbPut(db, key, defaultSerialize(entry));
      return right(undefined);
    } catch (cause) {
      return left({ code: 'UNKNOWN', message: 'Failed to write to IndexedDB', cause });
    }
  }

  async delete(key: string): StorageResult<void> {
    try {
      const db = await this.#ensureOpen();
      await this.#idbDelete(db, key);
      return right(undefined);
    } catch (cause) {
      return left({ code: 'UNKNOWN', message: 'Failed to delete from IndexedDB', cause });
    }
  }

  async clear(prefix?: string): StorageResult<void> {
    try {
      const db = await this.#ensureOpen();
      if (prefix === undefined) {
        await this.#idbClear(db);
      } else {
        const allKeys = await this.#idbGetAllKeys(db);
        for (const k of allKeys.filter(k => k.startsWith(prefix))) {
          await this.#idbDelete(db, k);
        }
      }
      return right(undefined);
    } catch (cause) {
      return left({ code: 'UNKNOWN', message: 'Failed to clear IndexedDB', cause });
    }
  }

  async keys(prefix?: string): StorageResult<string[]> {
    try {
      const db  = await this.#ensureOpen();
      const all = await this.#idbGetAllKeys(db);
      return right(prefix === undefined ? all : all.filter(k => k.startsWith(prefix)));
    } catch (cause) {
      return left({ code: 'UNKNOWN', message: 'Failed to list IDB keys', cause });
    }
  }

  async exists(key: string): StorageResult<boolean> {
    const result = await this.get(key);
    if (result._tag === 'Left') return left(result.left);
    return right(result.right._tag === 'Just');
  }

  /**
   * Remove all entries whose TTL has elapsed.
   * Call this on a schedule, e.g. `setInterval(() => adapter.sweep(), 60_000)`.
   */
  async sweep(): Promise<void> {
    try {
      const db      = await this.#ensureOpen();
      const allKeys = await this.#idbGetAllKeys(db);
      for (const key of allKeys) {
        const raw = await this.#idbGet<string>(db, key);
        if (raw) {
          const entry = defaultDeserialize<StorageEntry<unknown>>(raw);
          if (this.#isExpired(entry)) await this.#idbDelete(db, key);
        }
      }
    } catch { /* best-effort sweep */ }
  }

  /** Close the IDB connection and release resources. */
  async destroy(): Promise<void> {
    this.#db?.close();
    this.#db = null;
  }

  // ─── Private IDB helpers ───────────────────────────────────────────────────

  async #ensureOpen(): Promise<IDBDatabase> {
    if (!this.#db) this.#db = await this.#openDb();
    return this.#db;
  }

  #openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.#dbName, this.#version);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.#storeName)) {
          db.createObjectStore(this.#storeName);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  #idbGet<T>(db: IDBDatabase, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const req = db
        .transaction(this.#storeName, 'readonly')
        .objectStore(this.#storeName)
        .get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror   = () => reject(req.error);
    });
  }

  #idbPut(db: IDBDatabase, key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = db
        .transaction(this.#storeName, 'readwrite')
        .objectStore(this.#storeName)
        .put(value, key);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  }

  #idbDelete(db: IDBDatabase, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = db
        .transaction(this.#storeName, 'readwrite')
        .objectStore(this.#storeName)
        .delete(key);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  }

  #idbClear(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = db
        .transaction(this.#storeName, 'readwrite')
        .objectStore(this.#storeName)
        .clear();
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  }

  #idbGetAllKeys(db: IDBDatabase): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const req = db
        .transaction(this.#storeName, 'readonly')
        .objectStore(this.#storeName)
        .getAllKeys();
      req.onsuccess = () => resolve(req.result as string[]);
      req.onerror   = () => reject(req.error);
    });
  }

  #isExpired(entry: StorageEntry<unknown>): boolean {
    return entry.x !== undefined && now() > entry.x;
  }
}
