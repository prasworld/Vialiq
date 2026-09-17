import { LOCAL_STORAGE_LOCALE_PROVIDER, NOOP_LOCALE_PROVIDER, LOCALE_STORAGE, LocaleStorage } from './locale-storage';
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
});
