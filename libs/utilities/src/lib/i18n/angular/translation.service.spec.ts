import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { LOCALE_STORAGE } from './locale-storage';
import { loader } from '../core/translation-loader';
import { engine } from '../core/translation-engine';
import { DOCUMENT } from '@angular/common';
import { vi } from 'vitest';
import { MISSING_KEY_HANDLER } from './tokens';

describe('TranslationService', () => {
  let service: TranslationService;
  let loadAllMock: any;
  let document: Document;

  beforeEach(() => {
    // Reset singleton engine
    (engine as any).registry.clear();
    (engine as any)._currentLocale = 'en';

    loadAllMock = vi.spyOn(loader, 'loadAll').mockResolvedValue(undefined);

    const mockStorage = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        TranslationService,
        { provide: LOCALE_STORAGE, useValue: mockStorage }
      ]
    });

    service = TestBed.inject(TranslationService);
    document = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register manifests', () => {
    service.registerNamespace({ namespace: 'app', baseUrl: '/assets' });
    service.registerNamespace({ namespace: 'auth', baseUrl: '/assets' });
    
    // Test deduplication
    service.registerNamespace({ namespace: 'app', baseUrl: '/assets' });

    expect((service as any)._manifests().length).toBe(2);
  });

  it('should switch locale, update storage and HTML lang', async () => {
    const storage = TestBed.inject(LOCALE_STORAGE);
    
    // Set a new locale
    service.setLocale('fr');
    
    // Triggers rxResource async fetch
    TestBed.flushEffects(); 
    await Promise.resolve(); // allow promises to resolve
    await Promise.resolve(); // extra cycle for rxResource

    expect(storage.set).toHaveBeenCalledWith('fr');
    expect(loadAllMock).toHaveBeenCalledWith([], 'fr', expect.anything()); // no manifests registered yet
    
    expect(document.documentElement.lang).toBe('fr');
    expect(engine.currentLocale).toBe('fr');
  });

  it('should load initial data', async () => {
    service.registerNamespace({ namespace: 'app', baseUrl: '/assets' });
    
    await service.loadInitial();

    expect(loadAllMock).toHaveBeenCalledWith(
      [{ namespace: 'app', baseUrl: '/assets' }], 
      'en' // default locale
    );
  });

  it('should expose translations and locale signals', async () => {
    // Wait for the initial rxResource resolution
    TestBed.flushEffects();
    await Promise.resolve();
    await Promise.resolve();

    expect(service.isLoading()).toBe(false);
    expect(service.locale()).toBe('en');
    
    service.setLocale('fr');
    TestBed.flushEffects();
    // Mid-flight
    expect(service.isLoading()).toBe(true);
    expect(service.locale()).toBe('en'); // Should retain previous locale mid-flight

    await Promise.resolve(); // Resolve the fetch
    await Promise.resolve();
    
    expect(service.isLoading()).toBe(false);
    expect(service.locale()).toBe('fr');
  });

  it('should resolve async get() waiting for loadAll', async () => {
    // Since get() just manually calls loadAll if loading, we mock it.
    // It's mostly a pass-through to engine.instant after waiting.
    loadAllMock.mockResolvedValue(undefined);
    vi.spyOn(engine, 'instant').mockReturnValue('translated-value');

    const result = await service.get('TEST');
    
    expect(result).toBe('translated-value');
  });

  it('should abort stale fetches on rapid locale switching (race condition fix)', async () => {
    // Setup manifests
    service.registerNamespace({ namespace: 'app', baseUrl: '/assets' });

    // Mock loadAll to check if it receives an AbortSignal
    let passedSignal: AbortSignal | undefined;
    loadAllMock.mockImplementation(async (manifests: any[], locale: string, signal?: AbortSignal) => {
      passedSignal = signal;
      return new Promise((resolve) => setTimeout(resolve, 50));
    });

    service.setLocale('fr');
    TestBed.flushEffects();
    await Promise.resolve();

    const firstSignal = passedSignal;
    expect(firstSignal).toBeDefined();
    expect(firstSignal?.aborted).toBe(false);

    // Rapidly switch to ES before FR finishes
    service.setLocale('es');
    TestBed.flushEffects();
    await Promise.resolve();

    // The first signal should now be aborted!
    expect(firstSignal?.aborted).toBe(true);
    expect(passedSignal).not.toBe(firstSignal);
  });

  it('should NOT throw on loadInitial if translations fail (graceful degradation)', async () => {
    loadAllMock.mockRejectedValue(new Error('Network error'));
    
    await expect(service.loadInitial()).resolves.toBeUndefined();
  });

  it('should NOT throw on loadNamespace if translations fail (graceful degradation)', async () => {
    service.registerNamespace({ namespace: 'lazy', baseUrl: '/assets' });
    loadAllMock.mockRejectedValue(new Error('Network error'));
    
    await expect(service.loadNamespace('lazy')).resolves.toBeUndefined();
  });
  it('should wire up custom MISSING_KEY_HANDLER if provided in DI', () => {
    TestBed.resetTestingModule();
    engine.missingKeyHandler = undefined;

    const mockHandler = {
      handle: vi.fn().mockReturnValue('CUSTOM_MISSING_FORMAT')
    };

    TestBed.configureTestingModule({
      providers: [
        TranslationService,
        { provide: MISSING_KEY_HANDLER, useValue: mockHandler }
      ]
    });
    
    // Injecting triggers the constructor
    TestBed.inject(TranslationService);
    
    // Trigger missing key
    const result = engine.instant('NON_EXISTENT_KEY', undefined, 'test_ns');
    
    expect(mockHandler.handle).toHaveBeenCalledWith('NON_EXISTENT_KEY', 'test_ns');
    expect(result).toBe('CUSTOM_MISSING_FORMAT');
    
    // Reset missingKeyHandler to avoid polluting other tests
    engine.missingKeyHandler = undefined;
  });

  // ─── Same-locale no-op ──────────────────────────────────────────────────────

  it('setLocale() should be a no-op when called with the already active locale', async () => {
    const storage = TestBed.inject(LOCALE_STORAGE);

    // locale is 'en' by default
    await service.setLocale('en');

    expect(loadAllMock).not.toHaveBeenCalled();
    expect(storage.set).not.toHaveBeenCalled();
  });

  // ─── reload() stale key verification ────────────────────────────────────────

  it('reload() should clear the loader cache and re-fetch, removing stale keys', async () => {
    // Prime the engine with a key that will be absent after reload
    engine.register('app', 'en', { OLD_KEY: 'old value', KEEP: 'keep' });
    service.registerNamespace({ namespace: 'app', baseUrl: '/assets' });

    // After reload, only KEEP remains
    loadAllMock.mockImplementation(() => {
      engine.register('app', 'en', { KEEP: 'keep' });
      return Promise.resolve();
    });

    await service.reload();

    expect(engine.has('KEEP')).toBe(true);
    expect(engine.has('OLD_KEY')).toBe(false);
  });

  it('reload() should call clearCache() on the active loader before loading', async () => {
    const clearCacheSpy = vi.spyOn(loader, 'clearCache');
    await service.reload();
    expect(clearCacheSpy).toHaveBeenCalledOnce();
  });

  // ─── registerNamespace() triggers rxResource ─────────────────────────────────

  it('registerNamespace() should trigger rxResource reload with the new manifest', async () => {
    service.registerNamespace({ namespace: 'lazy', baseUrl: '/lazy' });

    TestBed.flushEffects();
    await Promise.resolve();
    await Promise.resolve();

    expect(loadAllMock).toHaveBeenCalledWith(
      expect.arrayContaining([{ namespace: 'lazy', baseUrl: '/lazy' }]),
      expect.any(String),
      expect.anything()
    );
  });

  // ─── loadNamespace() unregistered namespace ───────────────────────────────────

  it('loadNamespace() should throw for a namespace that was never registered', async () => {
    await expect(service.loadNamespace('never-registered'))
      .rejects.toThrow('[vi18n] Namespace "never-registered" not registered');
  });
});

