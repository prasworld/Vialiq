/**
 * @vi/state-fp/storage — MemoryAdapter tests
 *
 * Tests TTL enforcement, synchronous API, and background sweep cleanup.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryAdapter } from './memory';

interface TestPayload {
  readonly id: number;
  readonly name: string;
}

describe('MemoryAdapter', () => {
  let adapter: MemoryAdapter;

  beforeEach(() => {
    adapter = new MemoryAdapter({ sweepIntervalMs: 100 });
  });

  afterEach(() => {
    adapter.dispose();
  });

  describe('set/get basic operations', () => {
    it('should store and retrieve values', async () => {
      const value: TestPayload = { id: 1, name: 'Alice' };
      await adapter.set('user:1', value);

      const result = await adapter.get<TestPayload>('user:1');
      expect(result._tag).toBe('Right');
      if (result._tag === 'Right') {
        expect(result.right._tag).toBe('Just');
        if (result.right._tag === 'Just') {
          expect(result.right.value).toEqual(value);
        }
      }
    });

    it('should return a cloned value so mutations do not affect stored state', async () => {
      const value: TestPayload = { id: 1, name: 'Alice' };
      await adapter.set('user:1', value);

      const firstRead = await adapter.get<TestPayload>('user:1');
      if (firstRead._tag === 'Right' && firstRead.right._tag === 'Just') {
        firstRead.right.value.name = 'Evil';
      }

      const secondRead = await adapter.get<TestPayload>('user:1');
      if (secondRead._tag === 'Right') {
        expect(secondRead.right._tag).toBe('Just');
        if (secondRead.right._tag === 'Just') {
          expect(secondRead.right.value.name).toBe('Alice');
        }
      }
    });

    it('should return Nothing for missing keys', async () => {
      const result = await adapter.get<TestPayload>('nonexistent');
      expect(result._tag).toBe('Right');
      if (result._tag === 'Right') {
        expect(result.right._tag).toBe('Nothing');
      }
    });

    it('should overwrite existing values', async () => {
      const v1 = { id: 1, name: 'Alice' };
      const v2 = { id: 1, name: 'Alan' };

      await adapter.set('user:1', v1);
      await adapter.set('user:1', v2);

      const result = await adapter.get<TestPayload>('user:1');
      if (result._tag === 'Right' && result.right._tag === 'Just') {
        expect(result.right.value).toEqual(v2);
      }
    });

    it('should isolate keys', async () => {
      const v1 = { id: 1, name: 'Alice' };
      const v2 = { id: 2, name: 'Bob' };

      await adapter.set('user:1', v1);
      await adapter.set('user:2', v2);

      const result1 = await adapter.get<TestPayload>('user:1');
      const result2 = await adapter.get<TestPayload>('user:2');

      if (result1._tag === 'Right' && result1.right._tag === 'Just') {
        expect(result1.right.value).toEqual(v1);
      }
      if (result2._tag === 'Right' && result2.right._tag === 'Just') {
        expect(result2.right.value).toEqual(v2);
      }
    });
  });

  describe('TTL and expiry', () => {
    it('should return Nothing for expired entries on read', async () => {
      const value = { id: 1, name: 'Alice' };
      await adapter.set('user:1', value, 50); // 50ms TTL

      // Should exist immediately
      let result = await adapter.get<TestPayload>('user:1');
      expect(result._tag).toBe('Right');
      if (result._tag === 'Right') {
        expect(result.right._tag).toBe('Just');
      }

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should be gone
      result = await adapter.get<TestPayload>('user:1');
      if (result._tag === 'Right') {
        expect(result.right._tag).toBe('Nothing');
      }
    });

    it('should clean up expired entries during background sweep', async () => {
      const value = { id: 1, name: 'Alice' };
      await adapter.set('user:1', value, 50); // 50ms TTL

      // Wait for sweep interval + expiry margin
      await new Promise(resolve => setTimeout(resolve, 200));

      // Entry should be evicted from memory
      expect(adapter.size).toBe(0);
    });

    it('should not expire entries without TTL', async () => {
      const value = { id: 1, name: 'Alice' };
      await adapter.set('user:1', value); // no TTL

      // Wait well beyond a typical sweep
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = await adapter.get<TestPayload>('user:1');
      if (result._tag === 'Right') {
        expect(result.right._tag).toBe('Just');
      }
    });

    it('should respect partial TTL values', async () => {
      const v1 = { id: 1, name: 'Alice' };
      const v2 = { id: 2, name: 'Bob' };

      await adapter.set('user:1', v1, 30); // expires soon
      await adapter.set('user:2', v2);     // never expires

      await new Promise(resolve => setTimeout(resolve, 100));

      const result1 = await adapter.get<TestPayload>('user:1');
      const result2 = await adapter.get<TestPayload>('user:2');

      if (result1._tag === 'Right') {
        expect(result1.right._tag).toBe('Nothing');
      }
      if (result2._tag === 'Right') {
        expect(result2.right._tag).toBe('Just');
      }
    });
  });

  describe('delete and clear operations', () => {
    it('should delete a specific key', async () => {
      const value = { id: 1, name: 'Alice' };
      await adapter.set('user:1', value);
      await adapter.delete('user:1');

      const result = await adapter.get<TestPayload>('user:1');
      if (result._tag === 'Right') {
        expect(result.right._tag).toBe('Nothing');
      }
    });

    it('should handle deletion of nonexistent keys gracefully', async () => {
      const result = await adapter.delete('nonexistent');
      expect(result._tag).toBe('Right');
    });

    it('should clear all entries', async () => {
      await adapter.set('user:1', { id: 1, name: 'Alice' });
      await adapter.set('user:2', { id: 2, name: 'Bob' });
      expect(adapter.size).toBe(2);

      await adapter.clear();
      expect(adapter.size).toBe(0);
    });

    it('should clear entries matching a prefix', async () => {
      await adapter.set('user:1', { id: 1, name: 'Alice' });
      await adapter.set('user:2', { id: 2, name: 'Bob' });
      await adapter.set('cart:1', { id: 1, items: [] });

      await adapter.clear('user:');
      expect(adapter.size).toBe(1);

      const cartResult = await adapter.get('cart:1');
      expect(cartResult._tag).toBe('Right');
      if (cartResult._tag === 'Right') {
        expect(cartResult.right._tag).toBe('Just');
      }
    });
  });

  describe('keys and exists operations', () => {
    it('should return all keys', async () => {
      await adapter.set('user:1', { id: 1, name: 'Alice' });
      await adapter.set('user:2', { id: 2, name: 'Bob' });
      await adapter.set('cart:1', { id: 1, items: [] });

      const result = await adapter.keys();
      expect(result._tag).toBe('Right');
      if (result._tag === 'Right') {
        expect(result.right.sort()).toEqual(['cart:1', 'user:1', 'user:2']);
      }
    });

    it('should filter keys by prefix', async () => {
      await adapter.set('user:1', { id: 1, name: 'Alice' });
      await adapter.set('user:2', { id: 2, name: 'Bob' });
      await adapter.set('cart:1', { id: 1, items: [] });

      const result = await adapter.keys('user:');
      expect(result._tag).toBe('Right');
      if (result._tag === 'Right') {
        expect(result.right.sort()).toEqual(['user:1', 'user:2']);
      }
    });

    it('should check key existence', async () => {
      await adapter.set('user:1', { id: 1, name: 'Alice' });

      const exists = await adapter.exists('user:1');
      const notExists = await adapter.exists('user:999');

      expect(exists._tag).toBe('Right');
      expect(notExists._tag).toBe('Right');
      if (exists._tag === 'Right') expect(exists.right).toBe(true);
      if (notExists._tag === 'Right') expect(notExists.right).toBe(false);
    });

    it('should report expired entries as non-existent', async () => {
      await adapter.set('user:1', { id: 1, name: 'Alice' }, 50);

      let exists = await adapter.exists('user:1');
      if (exists._tag === 'Right') expect(exists.right).toBe(true);

      await new Promise(resolve => setTimeout(resolve, 100));

      exists = await adapter.exists('user:1');
      if (exists._tag === 'Right') expect(exists.right).toBe(false);
    });
  });

  describe('disposal and cleanup', () => {
    it('should stop the background sweep on disposal (but get() still evicts expired entries)', async () => {
      const value = { id: 1, name: 'Alice' };
      await adapter.set('user:1', value, 50);

      // Stop the sweep timer; expired entries should no longer be removed automatically
      adapter.dispose();

      // Wait beyond the TTL + the sweep interval to prove sweep is stopped
      await new Promise(resolve => setTimeout(resolve, 200));

      // Since dispose() stopped the sweep, the entry is still present in the store
      expect(adapter.size).toBe(1);

      // However, get() still enforces TTL and should evict expired entries even without sweep
      const result = await adapter.get<TestPayload>('user:1');
      expect(result._tag).toBe('Right');
      if (result._tag === 'Right') {
        expect(result.right._tag).toBe('Nothing');
      }
      expect(adapter.size).toBe(0);
    });

    it('should handle multiple dispose calls gracefully', async () => {
      adapter.dispose();
      expect(() => adapter.dispose()).not.toThrow();
    });
  });

  describe('serialization edge cases', () => {
    it('should store complex nested objects', async () => {
      const complex = {
        id: 1,
        nested: { level2: { level3: 'value' } },
        array: [1, 2, 3],
        date: new Date('2024-01-01').toISOString(),
      };

      await adapter.set('complex', complex);
      const result = await adapter.get('complex');

      expect(result._tag).toBe('Right');
      if (result._tag === 'Right' && result.right._tag === 'Just') {
        expect(result.right.value).toEqual(complex);
      }
    });

    it('should store null and undefined safely', async () => {
      await adapter.set('null-value', null);
      await adapter.set('undefined-value', undefined);

      const nullResult = await adapter.get('null-value');
      const undefinedResult = await adapter.get('undefined-value');

      expect(nullResult._tag).toBe('Right');
      expect(undefinedResult._tag).toBe('Right');
    });

    it('should store empty objects and arrays', async () => {
      await adapter.set('empty-obj', {});
      await adapter.set('empty-array', []);

      const objResult = await adapter.get('empty-obj');
      const arrResult = await adapter.get('empty-array');

      if (objResult._tag === 'Right' && objResult.right._tag === 'Just') {
        expect(objResult.right.value).toEqual({});
      }
      if (arrResult._tag === 'Right' && arrResult.right._tag === 'Just') {
        expect(arrResult.right.value).toEqual([]);
      }
    });
  });

  describe('size tracking', () => {
    it('should track the number of entries correctly', async () => {
      expect(adapter.size).toBe(0);

      await adapter.set('user:1', { id: 1, name: 'Alice' });
      expect(adapter.size).toBe(1);

      await adapter.set('user:2', { id: 2, name: 'Bob' });
      expect(adapter.size).toBe(2);

      await adapter.delete('user:1');
      expect(adapter.size).toBe(1);

      await adapter.clear();
      expect(adapter.size).toBe(0);
    });
  });
});
