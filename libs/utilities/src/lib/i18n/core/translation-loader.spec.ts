import { loader } from './translation-loader';
import { engine } from './translation-engine';
import { vi } from 'vitest';

describe('TranslationLoader', () => {
  let originalFetch: typeof globalThis.fetch;
  let fetchMock: any;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock;

    loader.clearCache();
    (engine as any).registry.clear();
    
    // Silence console.warn in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should fetch and register translations', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ FORM: { TEST: 'test-value' } })
    });

    await loader.load('form', 'en', '/assets/en.json');

    expect(fetchMock).toHaveBeenCalledWith('/assets/en.json', expect.anything());
    expect(engine.instant('FORM.TEST')).toBe('test-value');
  });


  it('should use cache and not fetch twice for the same locale', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    await loader.load('form', 'en', '/assets/en.json');
    await loader.load('form', 'en', '/assets/en.json');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should throw on fetch error and log warning', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    await expect(loader.load('form', 'en', '/assets/en.json')).rejects.toThrow();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      '[vi18n] Failed to load translations for form:en',
      expect.any(Error)
    );
  });

  it('should throw on invalid JSON and clear cache', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => { throw new SyntaxError('Unexpected token'); }
    });

    await expect(loader.load('form', 'en', '/assets/en.json')).rejects.toThrow(SyntaxError);
    
    // Cache should be cleared so a subsequent attempt tries again
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });
    
    await loader.load('form', 'en', '/assets/en.json');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should pass abort signal to fetch', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });
    
    const abortController = new AbortController();
    await loader.load('form', 'en', '/assets/en.json', abortController.signal);
    
    expect(fetchMock).toHaveBeenCalledWith('/assets/en.json', { signal: abortController.signal });
  });

  it('should loadAll manifests', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({})
    });

    await loader.loadAll([
      { namespace: 'n1', baseUrl: '/n1' },
      { namespace: 'n2', baseUrl: '/n2' }
    ], 'en');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith('/n1/en.json', expect.anything());
    expect(fetchMock).toHaveBeenCalledWith('/n2/en.json', expect.anything());
  });
  it('should cache and reuse the identical Promise for concurrent duplicate fetches', async () => {
    // We delay the fetch response so we can fire multiple concurrent load calls
    let resolveFetch: (value: any) => void;
    const fetchPromise = new Promise(res => { resolveFetch = res; });
    fetchMock.mockReturnValue(fetchPromise);

    // Fire two identical loads simultaneously
    const promise1 = loader.load('form', 'en', '/assets/en.json');
    const promise2 = loader.load('form', 'en', '/assets/en.json');
    
    // The promises should be identical due to caching
    expect(promise1).toBe(promise2);

    // The actual fetch should only be triggered once
    expect(fetchMock).toHaveBeenCalledTimes(1);
    
    // Resolve the mock fetch
    resolveFetch!({
      ok: true,
      json: async () => ({ FORM: { CONCURRENT: 'success' } })
    });
    
    await promise1;
    expect(engine.instant('FORM.CONCURRENT')).toBe('success');
  });

  it('should reject the entire load and clear cache if the base en layer fails to load', async () => {
    // When loading 'fr', it will fetch 'en' concurrently.
    // If 'en' fails (e.g. 500 error), the whole load should reject and clear both caches.
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('en.json')) {
        return { ok: false, status: 500 };
      }
      return { ok: true, json: async () => ({}) }; // fr.json succeeds
    });

    await expect(loader.load('form', 'fr', '/assets/fr.json')).rejects.toThrow('HTTP 500');

    // Check that cache is cleared for both 'fr' and 'en'
    expect((loader as any).cache.has('form:fr')).toBe(false);
    expect((loader as any).cache.has('form:en')).toBe(false);
  });

  // ─── URL rewriting ──────────────────────────────────────────────────────────

  it('should rewrite only the filename and not a locale token appearing in the baseUrl path', async () => {
    // baseUrl has 'fr' in its directory segment: /assets/fr/translations/fr.json
    // en url must be: /assets/fr/translations/en.json (NOT /assets/en/translations/fr.json)
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });

    await loader.load('app', 'fr', '/assets/fr/translations/fr.json');

    const calledUrls: string[] = fetchMock.mock.calls.map((c: any[]) => c[0] as string);
    // en url must preserve the /fr/ path segment and only change the filename
    expect(calledUrls).toContain('/assets/fr/translations/en.json');
    // The broken form must NOT appear
    expect(calledUrls).not.toContain('/assets/en/translations/fr.json');
  });

  // ─── Asymmetric cache (target locale fails, en succeeds) ────────────────────

  it('should retain the en cache entry when only the target locale fetch fails', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith('fr.json')) return { ok: false, status: 503 };
      return { ok: true, json: async () => ({ KEY: 'English' }) };
    });

    await expect(loader.load('app', 'fr', '/assets/fr.json')).rejects.toThrow();

    // fr failed → its cache entry is cleared
    expect((loader as any).cache.has('app:fr')).toBe(false);
    // en succeeded → its cache entry is retained
    expect((loader as any).cache.has('app:en')).toBe(true);
  });

  // ─── Empty manifests ────────────────────────────────────────────────────────

  it('should resolve immediately when loadAll is called with an empty manifests list', async () => {
    await expect(loader.loadAll([], 'en')).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

