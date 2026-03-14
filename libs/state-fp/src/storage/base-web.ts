/**
 * WebStorageAdapter — shared implementation for localStorage and sessionStorage.
 * Both adapters use the same StorageEntry envelope and TTL mechanism.
 */

import type { StorageResult, StorageEntry, StorageAdapter } from './types.js';
import type { Maybe } from '../core/types.js';
import { left, right } from '../core/either.js';
import { just, nothing } from '../core/maybe.js';
import { defaultSerialize, defaultDeserialize, now } from '../core/utils.js';

export abstract class WebStorageAdapter implements StorageAdapter {
  abstract readonly name: string;
  protected abstract readonly storage: Storage;

  async get<T>(key: string): StorageResult<Maybe<T>> {
    try {
      const raw = this.storage.getItem(key);
      if (raw === null) return right(nothing<T>());

      const entry = defaultDeserialize<StorageEntry<T>>(raw);
      if (this.#isExpired(entry)) {
        this.storage.removeItem(key);
        return right(nothing<T>());
      }
      return right(just(entry.v));
    } catch (cause) {
      return left({ code: 'DESERIALISE_ERROR', message: 'Failed to deserialise storage entry', cause });
    }
  }

  async set<T>(key: string, value: T, ttl?: number): StorageResult<void> {
    try {
      const t = now();
      const entry: StorageEntry<T> = {
        v:   value,
        t,
        ...(ttl !== undefined && { x: t + ttl }),
        tag: key,
        fv:  1,
      };
      this.storage.setItem(key, defaultSerialize(entry));
      return right(undefined);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'QuotaExceededError') {
        return left({ code: 'QUOTA_EXCEEDED', message: 'Storage quota exceeded', cause });
      }
      return left({ code: 'UNKNOWN', message: 'Failed to write to storage', cause });
    }
  }

  async delete(key: string): StorageResult<void> {
    this.storage.removeItem(key);
    return right(undefined);
  }

  async clear(prefix?: string): StorageResult<void> {
    if (prefix === undefined) {
      this.storage.clear();
    } else {
      const toRemove = Object.keys(this.storage).filter(k => k.startsWith(prefix));
      toRemove.forEach(k => this.storage.removeItem(k));
    }
    return right(undefined);
  }

  async keys(prefix?: string): StorageResult<string[]> {
    const all = Object.keys(this.storage);
    return right(prefix === undefined ? all : all.filter(k => k.startsWith(prefix)));
  }

  async exists(key: string): StorageResult<boolean> {
    try {
      const raw = this.storage.getItem(key);
      if (raw === null) return right(false);
      const entry = defaultDeserialize<StorageEntry<unknown>>(raw);
      if (this.#isExpired(entry)) {
        this.storage.removeItem(key);
        return right(false);
      }
      return right(true);
    } catch {
      return right(false);
    }
  }

  #isExpired(entry: StorageEntry<unknown>): boolean {
    return entry.x !== undefined && now() > entry.x;
  }
}
