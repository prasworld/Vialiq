/**
 * Phase 4 (continued) feature tests:
 *   4-5 ORM entity → DTO profile helper (profileFromColumns, profileFromDescriptor)
 *   4-6 Fetch / query adapter (createMappedFetcher, createMappedArrayFetcher,
 *        createMappedQueryFn, createMappedSWRFetcher)
 *   4-7 Deep-clone utility (deepClone, registerWasmClone, resetCloneBackend,
 *        mapWithClone)
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createMapper } from '../core';
import {
  profileFromColumns,
  profileFromDescriptor,
} from '../integrations/orm';
import {
  createMappedFetcher,
  createMappedArrayFetcher,
  createMappedQueryFn,
  createMappedSWRFetcher,
} from '../integrations/fetch-adapter';
import {
  deepClone,
  registerWasmClone,
  resetCloneBackend,
  mapWithClone,
} from '../utils/deep-clone';

// ── ORM entity → DTO profile helpers (4-5) ───────────────────────────────────

describe('profileFromColumns (4-5)', () => {
  it('maps listed columns from source to destination', () => {
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(
      Object,
      'UserDto',
      profileFromColumns<Record<string, unknown>, { id: string; email: string }>(
        ['id', 'email']
      )
    );
    const result = mapper.map(
      { id: 1, email: 'alice@example.com', password: 'secret' },
      'UserDto'
    ) as any;
    expect(result.id).toBe(1);
    expect(result.email).toBe('alice@example.com');
    expect(result.password).toBeUndefined();
  });

  it('applies per-column transform functions', () => {
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(
      Object,
      'Dto',
      profileFromColumns<{ id: number; createdAt: Date }, { id: string; createdAt: string }>(
        ['id', 'createdAt'],
        {
          transforms: {
            id: (v) => String(v),
            createdAt: (v) => (v as Date).toISOString(),
          },
        }
      )
    );
    const date = new Date('2024-01-15T00:00:00.000Z');
    const result = mapper.map({ id: 42, createdAt: date }, 'Dto') as any;
    expect(result.id).toBe('42');
    expect(result.createdAt).toBe('2024-01-15T00:00:00.000Z');
  });

  it('transform receives both value and source object', () => {
    const mapper = createMapper({ autoMap: false });
    const receivedSrcs: unknown[] = [];
    mapper.addProfile(
      Object,
      'Dto',
      profileFromColumns<{ name: string; role: string }, { label: string }>(
        ['label' as any],
        {
          transforms: {
            label: (v, src) => {
              receivedSrcs.push(src);
              return `${(src as any).name} (${(src as any).role})`;
            },
          },
        }
      )
    );
    const src = { name: 'Alice', role: 'admin', label: '' };
    const result = mapper.map(src, 'Dto') as any;
    expect(result.label).toBe('Alice (admin)');
    expect(receivedSrcs[0]).toBe(src);
  });

  it('overrides callback can add extra forMember rules', () => {
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(
      Object,
      'Dto',
      profileFromColumns(['name'], {
        overrides: (b) =>
          (b as any).forMember('upper', (o: any) =>
            o.mapFrom((s: any) => s.name.toUpperCase())
          ),
      })
    );
    const result = mapper.map({ name: 'alice' }, 'Dto') as any;
    expect(result.name).toBe('alice');
    expect(result.upper).toBe('ALICE');
  });

  it('empty column list produces empty destination', () => {
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(Object, 'Dto', profileFromColumns([]));
    const result = mapper.map({ x: 1, y: 2 }, 'Dto') as any;
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe('profileFromDescriptor (4-5)', () => {
  it('maps columns defined in descriptor', () => {
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(
      Object,
      'Dto',
      profileFromDescriptor({ columns: ['name', 'age'] })
    );
    const result = mapper.map({ name: 'Bob', age: 40, hidden: true }, 'Dto') as any;
    expect(result.name).toBe('Bob');
    expect(result.age).toBe(40);
    expect(result.hidden).toBeUndefined();
  });

  it('descriptor transforms are applied', () => {
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(
      Object,
      'Dto',
      profileFromDescriptor({
        columns: ['score'],
        transforms: { score: (v) => (v as number) * 2 },
      })
    );
    const result = mapper.map({ score: 5 }, 'Dto') as any;
    expect(result.score).toBe(10);
  });

  it('accepts an overrides callback as second argument', () => {
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(
      Object,
      'Dto',
      profileFromDescriptor({ columns: ['x'] }, (b) =>
        (b as any).forMember('y', (o: any) => o.mapFrom((s: any) => s.x + 1))
      )
    );
    const result = mapper.map({ x: 10 }, 'Dto') as any;
    expect(result.x).toBe(10);
    expect(result.y).toBe(11);
  });
});

// ── Fetch / query adapter (4-6) ───────────────────────────────────────────────

describe('createMappedFetcher (4-6)', () => {
  // Build a minimal fake fetch that returns the given body
  function mockFetch(body: unknown, status = 200): typeof fetch {
    return vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(body),
    }) as unknown as typeof fetch;
  }

  function buildMapper() {
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(Object, 'Dto', profileFromColumns(['name', 'score']));
    return mapper;
  }

  it('fetches URL and maps JSON response to destination type', async () => {
    const fakeFetch = mockFetch({ name: 'Alice', score: 99, secret: 'x' });
    const mapper = buildMapper();
    const fetcher = createMappedFetcher(mapper, 'Dto', { fetchImpl: fakeFetch });

    const result = await fetcher('https://api.example.com/user/1') as any;
    expect(result.name).toBe('Alice');
    expect(result.score).toBe(99);
    expect(result.secret).toBeUndefined();
    expect(fakeFetch).toHaveBeenCalledWith(
      'https://api.example.com/user/1',
      expect.any(Object)
    );
  });

  it('passes RequestInit overrides through to fetch', async () => {
    const fakeFetch = mockFetch({ name: 'Bob', score: 80 });
    const mapper = buildMapper();
    const fetcher = createMappedFetcher(mapper, 'Dto', {
      fetchImpl: fakeFetch,
      requestInit: { headers: { Authorization: 'Bearer token' } },
    });
    await fetcher('https://api.example.com/user/2');
    expect(fakeFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: { Authorization: 'Bearer token' } })
    );
  });

  it('throws when response is not ok', async () => {
    const fakeFetch = mockFetch({ error: 'Not Found' }, 404);
    const mapper = buildMapper();
    const fetcher = createMappedFetcher(mapper, 'Dto', { fetchImpl: fakeFetch });
    await expect(fetcher('https://api.example.com/missing')).rejects.toThrow('404');
  });

  it('per-call RequestInit overrides default requestInit', async () => {
    const fakeFetch = mockFetch({ name: 'Carol', score: 70 });
    const mapper = buildMapper();
    const fetcher = createMappedFetcher(mapper, 'Dto', {
      fetchImpl: fakeFetch,
      requestInit: { method: 'GET' },
    });
    await fetcher('https://api.example.com/user/3', { method: 'POST' });
    expect(fakeFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('createMappedArrayFetcher (4-6)', () => {
  function mockFetch(body: unknown, status = 200): typeof fetch {
    return vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status, statusText: 'OK',
      json: () => Promise.resolve(body),
    }) as unknown as typeof fetch;
  }

  it('maps each element of a JSON array response', async () => {
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(Object, 'Dto', profileFromColumns(['name']));
    const fakeFetch = mockFetch([{ name: 'A', x: 1 }, { name: 'B', x: 2 }]);
    const fetcher = createMappedArrayFetcher(mapper, 'Dto', { fetchImpl: fakeFetch });
    const result = await fetcher('https://api.example.com/users') as any[];
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('A');
    expect(result[1].name).toBe('B');
    expect(result[0].x).toBeUndefined();
  });

  it('throws on non-ok response', async () => {
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(Object, 'Dto', profileFromColumns(['name']));
    const fakeFetch = mockFetch({}, 500);
    const fetcher = createMappedArrayFetcher(mapper, 'Dto', { fetchImpl: fakeFetch });
    await expect(fetcher('https://api.example.com/users')).rejects.toThrow('500');
  });
});

describe('createMappedQueryFn (4-6)', () => {
  it('is functionally equivalent to createMappedFetcher', async () => {
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(Object, 'Dto', profileFromColumns(['id']));
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, statusText: 'OK',
      json: () => Promise.resolve({ id: 7, extra: true }),
    }) as unknown as typeof fetch;
    const queryFn = createMappedQueryFn(mapper, 'Dto', { fetchImpl: fakeFetch });
    const result = await queryFn('/api/item/7') as any;
    expect(result.id).toBe(7);
    expect(result.extra).toBeUndefined();
  });
});

describe('createMappedSWRFetcher (4-6)', () => {
  it('accepts a single key string (SWR pattern)', async () => {
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(Object, 'Dto', profileFromColumns(['title']));
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, statusText: 'OK',
      json: () => Promise.resolve({ title: 'Hello', hidden: true }),
    }) as unknown as typeof fetch;
    const swrFetcher = createMappedSWRFetcher(mapper, 'Dto', { fetchImpl: fakeFetch });
    const result = await swrFetcher('/api/posts/1') as any;
    expect(result.title).toBe('Hello');
    expect(result.hidden).toBeUndefined();
  });
});

// ── Deep-clone utility (4-7) ──────────────────────────────────────────────────

describe('deepClone (4-7)', () => {
  afterEach(() => {
    resetCloneBackend();
  });

  it('clones primitive values unchanged', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBeNull();
    expect(deepClone(undefined)).toBeUndefined();
  });

  it('produces a deep copy of a plain object', () => {
    const src = { name: 'Alice', scores: [1, 2, 3] };
    const copy = deepClone(src);
    expect(copy).toEqual(src);
    expect(copy).not.toBe(src);
    expect(copy.scores).not.toBe(src.scores);
  });

  it('nested objects are not shared', () => {
    const src = { a: { b: { c: 42 } } };
    const copy = deepClone(src);
    copy.a.b.c = 99;
    expect(src.a.b.c).toBe(42);
  });

  it('clones arrays deeply', () => {
    const src = [{ x: 1 }, { x: 2 }];
    const copy = deepClone(src);
    expect(copy).toEqual(src);
    expect(copy).not.toBe(src);
    expect(copy[0]).not.toBe(src[0]);
  });

  it('clones Date instances', () => {
    const src = new Date('2024-01-01');
    const copy = deepClone(src);
    expect(copy).toEqual(src);
    expect(copy).not.toBe(src);
    expect(copy instanceof Date).toBe(true);
  });

  it('clones RegExp instances', () => {
    const src = /hello/gi;
    const copy = deepClone(src);
    expect(copy.source).toBe(src.source);
    expect(copy.flags).toBe(src.flags);
    expect(copy).not.toBe(src);
  });

  it('handles circular references without throwing', () => {
    const src: Record<string, unknown> = { name: 'circular' };
    src['self'] = src;
    expect(() => deepClone(src)).not.toThrow();
    const copy = deepClone(src) as any;
    expect(copy.name).toBe('circular');
  });

  it('registerWasmClone() replaces the backend', () => {
    const customBackend = vi.fn((v: unknown) => ({ custom: true, original: v }));
    registerWasmClone(customBackend as never);
    deepClone({ x: 1 });
    expect(customBackend).toHaveBeenCalledWith({ x: 1 });
  });

  it('resetCloneBackend() restores default JS backend', () => {
    const customBackend = vi.fn((v: unknown) => v);
    registerWasmClone(customBackend as never);
    resetCloneBackend();
    // Call deepClone after reset — custom backend must NOT be invoked
    const src = { a: 1 };
    const copy = deepClone(src);
    expect(customBackend).not.toHaveBeenCalled();
    // And JS deep-clone still works correctly
    expect(copy).toEqual(src);
    expect(copy).not.toBe(src);
  });
});

describe('mapWithClone (4-7)', () => {
  it('maps source without mutating original', () => {
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(Object, 'Dto', profileFromColumns(['name']));
    const src = { name: 'Alice', secret: 'pass' };
    const result = mapWithClone(mapper, src, 'Dto') as any;
    expect(result.name).toBe('Alice');
    // original unmodified
    expect(src.secret).toBe('pass');
  });

  it('clones before mapping so source mutation after call does not affect result', () => {
    const mapper = createMapper({ autoMap: true });
    class Src { value = 1 }
    mapper.addProfile(Src, 'Dto', (b: any) =>
      b.forMember('value', (o: any) => o.mapFrom((s: any) => s.value))
    );
    const src = new Src();
    // Note: mapWithClone clones the src; mapping runs on the clone.
    const result = mapWithClone(mapper, src, 'Dto') as any;
    src.value = 999; // mutate after clone — result should still have 1
    expect(result.value).toBe(1);
  });
});
