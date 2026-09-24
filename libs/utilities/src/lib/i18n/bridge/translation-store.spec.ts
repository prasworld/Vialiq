import { translationStore } from './translation-store';
import { engine } from '../core/translation-engine';
import { loader } from '../core/translation-loader';
import { vi } from 'vitest';

describe('translationStore', () => {
  let originalFetch: typeof globalThis.fetch;
  let fetchMock: any;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock;

    loader.clearCache();
    (engine as any).registry.clear();
    (engine as any)._currentLocale = 'en';

    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // ─── instant() ──────────────────────────────────────────────────────────────

  it('instant() should delegate to engine.instant()', () => {
    engine.register('app', 'en', { SUBMIT: 'Submit' });
    expect(translationStore.instant('SUBMIT')).toBe('Submit');
    expect(translationStore.instant('SUBMIT', undefined, 'app')).toBe('Submit');
  });

  it('instant() should return humanized fallback for missing keys', () => {
    expect(translationStore.instant('FORM.UNKNOWN_KEY')).toBe('Unknown key');
  });

  // ─── getLocale() ─────────────────────────────────────────────────────────────

  it('getLocale() should return the current engine locale', () => {
    expect(translationStore.getLocale()).toBe('en');
    engine.setLocale('fr');
    expect(translationStore.getLocale()).toBe('fr');
  });

  // ─── setLocale() ─────────────────────────────────────────────────────────────

  it('setLocale() should fetch translations and update the engine locale', async () => {
    engine.registerManifest({ namespace: 'app', baseUrl: '/assets' });
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ KEY: 'Valeur' }) });

    await translationStore.setLocale('fr');

    expect(engine.currentLocale).toBe('fr');
  });

  it('setLocale() should abort the previous AbortController when called again', async () => {
    engine.registerManifest({ namespace: 'app', baseUrl: '/assets' });

    // Track all abort signals passed to fetch
    const capturedSignals: AbortSignal[] = [];
    fetchMock.mockImplementation(async (_url: string, opts: RequestInit) => {
      capturedSignals.push(opts.signal as AbortSignal);
      // Simulate a slow fetch that stays alive
      await new Promise(r => setTimeout(r, 200));
      return { ok: true, json: async () => ({}) };
    });

    // Start 'fr' fetch — don't await it
    const first = translationStore.setLocale('fr');
    // Yield one microtask so the fetch actually starts and we have a signal captured
    await Promise.resolve();

    // Now switch to 'de' — this should abort the previous controller
    const second = translationStore.setLocale('de');

    // The first signal that was captured should now be marked aborted
    if (capturedSignals.length > 0) {
      expect(capturedSignals[0].aborted).toBe(true);
    }

    // Wait for both to settle (second succeeds, first may be aborted mid-flight)
    await second;
    await first.catch(() => {});

    expect(engine.currentLocale).toBe('de');
  });

  // ─── onLocaleChange() ────────────────────────────────────────────────────────

  it('onLocaleChange() should call the listener when the locale changes', () => {
    let calls = 0;
    translationStore.onLocaleChange(() => calls++);
    engine.setLocale('fr');
    expect(calls).toBe(1);
  });

  it('onLocaleChange() cleanup should stop future notifications', () => {
    let calls = 0;
    const cleanup = translationStore.onLocaleChange(() => calls++);
    engine.setLocale('fr');
    expect(calls).toBe(1);
    cleanup();
    engine.setLocale('de');
    expect(calls).toBe(1); // should NOT have fired again
  });

  // ─── loadNamespace() ─────────────────────────────────────────────────────────

  it('loadNamespace() should register the manifest and load it for the current locale', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ TITLE: 'Test' }) });

    await translationStore.loadNamespace({ namespace: 'lazy', baseUrl: '/lazy' });

    expect(fetchMock).toHaveBeenCalledWith('/lazy/en.json', expect.anything());
    expect(engine.instant('TITLE', undefined, 'lazy')).toBe('Test');
  });

  it('loadNamespace() should register the manifest in the engine manifest registry', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });

    await translationStore.loadNamespace({ namespace: 'lazy2', baseUrl: '/lazy2' });

    const manifests = engine.getManifests();
    expect(manifests.some(m => m.namespace === 'lazy2')).toBe(true);
  });
});
