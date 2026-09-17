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

    expect(fetchMock).toHaveBeenCalledWith('/assets/en.json');
    expect(engine.instant('FORM.TEST')).toBe('test-value');
  });

  it('should load fallback en.json if locale is not en', async () => {
    // Setup for fr.json
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ FORM: { TEST: 'fr-value' } })
    });
    // Setup for en.json fallback
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ FORM: { TEST: 'en-value', OTHER: 'other-en' } })
    });

    await loader.load('form', 'fr', '/assets/fr.json');

    expect(fetchMock).toHaveBeenCalledTimes(2);
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

  it('should recover from fetch error and log warning', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    await loader.load('form', 'en', '/assets/en.json');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      '[vi18n] Failed to load translations for form:en',
      expect.any(Error)
    );
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
    expect(fetchMock).toHaveBeenCalledWith('/n1/en.json');
    expect(fetchMock).toHaveBeenCalledWith('/n2/en.json');
  });
});
