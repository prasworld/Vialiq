import { LOCAL_STORAGE_LOCALE_PROVIDER, NOOP_LOCALE_PROVIDER, COOKIE_LOCALE_PROVIDER, LOCALE_STORAGE, LocaleStorage } from './locale-storage';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

describe('LocaleStorage', () => {
  describe('LOCAL_STORAGE_LOCALE_PROVIDER', () => {
    let storage: LocaleStorage;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [LOCAL_STORAGE_LOCALE_PROVIDER]
      });
      storage = TestBed.inject(LOCALE_STORAGE);
      
      // Mock localStorage
      const mockStorage: Record<string, string> = {};
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => mockStorage[key] ?? null);
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
        mockStorage[key] = value;
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should set and get locale', () => {
      expect(storage.get()).toBeNull();
      storage.set('fr');
      expect(storage.get()).toBe('fr');
      expect(localStorage.getItem).toHaveBeenCalledWith('vi18n:locale');
      expect(localStorage.setItem).toHaveBeenCalledWith('vi18n:locale', 'fr');
    });
  });

  describe('NOOP_LOCALE_PROVIDER', () => {
    let storage: LocaleStorage;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [NOOP_LOCALE_PROVIDER]
      });
      storage = TestBed.inject(LOCALE_STORAGE);
    });

    it('should do nothing', () => {
      expect(storage.get()).toBeNull();
      storage.set('fr');
      expect(storage.get()).toBeNull();
    });
  });

  // ─── COOKIE_LOCALE_PROVIDER ──────────────────────────────────────────────────

  describe('COOKIE_LOCALE_PROVIDER', () => {
    let storage: LocaleStorage;
    let cookieJar = '';

    beforeEach(() => {
      cookieJar = '';
      TestBed.configureTestingModule({
        providers: [COOKIE_LOCALE_PROVIDER]
      });
      storage = TestBed.inject(LOCALE_STORAGE);

      // Intercept document.cookie reads and writes
      vi.spyOn(document, 'cookie', 'get').mockImplementation(() => cookieJar);
      vi.spyOn(document, 'cookie', 'set').mockImplementation((val: string) => {
        // Simulate a simple cookie jar — extract key=value
        const [pair] = val.split(';');
        const [rawKey, rawVal] = pair.split('=');
        cookieJar = `${rawKey}=${rawVal}`;
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return null when the locale cookie is absent', () => {
      cookieJar = '';
      expect(storage.get()).toBeNull();
    });

    it('should read the locale from document.cookie', () => {
      cookieJar = 'vi18n:locale=fr';
      expect(storage.get()).toBe('fr');
    });

    it('should write the locale to document.cookie', () => {
      storage.set('de');
      expect(document.cookie).toContain('vi18n:locale');
      expect(document.cookie).toContain('de');
    });

    it('should URL-encode a locale with special characters when writing', () => {
      storage.set('zh-Hans');
      // encodeURIComponent('zh-Hans') === 'zh-Hans' but '-' is safe; 
      // use a locale that actually needs encoding
      storage.set('pt+BR');
      expect(document.cookie).toContain(encodeURIComponent('pt+BR'));
    });

    it('should URL-decode the locale value when reading', () => {
      cookieJar = `vi18n:locale=${encodeURIComponent('pt+BR')}`;
      expect(storage.get()).toBe('pt+BR');
    });
  });
});

