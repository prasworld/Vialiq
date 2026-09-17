import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { LOCALE_STORAGE } from './locale-storage';
import { loader } from '../core/translation-loader';
import { engine } from '../core/translation-engine';
import { DOCUMENT } from '@angular/common';
import { vi } from 'vitest';

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
    expect(loadAllMock).toHaveBeenCalledWith([], 'fr'); // no manifests registered yet
    
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
});
