import { InjectionToken, Provider } from '@angular/core';

/**
 * Optional injection token that allows a host app or server to provide the initial locale.
 * Resolution order (first non-null wins):
 *   1. LOCALE_STORAGE value (persisted user preference)
 *   2. INITIAL_LOCALE token (host-app / SSR override)
 *   3. navigator.language (browser default)
 */
export const INITIAL_LOCALE = new InjectionToken<string>('vi18n:initial-locale');

export interface LocaleStorage {
  get(): string | null;
  set(locale: string): void;
}

export const LOCALE_STORAGE = new InjectionToken<LocaleStorage>('vi18n:locale-storage');

export const LOCAL_STORAGE_LOCALE_PROVIDER: Provider = {
  provide: LOCALE_STORAGE,
  useValue: {
    get: () => {
      try {
        if (typeof localStorage === 'undefined') return null;
        return localStorage.getItem('vi18n:locale');
      } catch (err: unknown) {
        // TODO: wire to a proper error-reporting surface once the error bus
        // architecture is finalised (ownership, MFE sharing, DI scope).
        console.error('[vi18n] Failed to read locale from localStorage', err);
        return null;
      }
    },
    set: (locale: string) => {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('vi18n:locale', locale);
        }
      } catch (err: unknown) {
        // TODO: wire to a proper error-reporting surface once the error bus
        // architecture is finalised (ownership, MFE sharing, DI scope).
        console.error('[vi18n] Failed to save locale to localStorage', err);
      }
    }
  } satisfies LocaleStorage
};

export const NOOP_LOCALE_PROVIDER: Provider = {
  provide: LOCALE_STORAGE,
  useValue: {
    get: () => null,
    set: () => { /* no-op */ }
  } satisfies LocaleStorage
};

/**
 * Cookie-backed locale storage.
 * Use this when you need SSR-compatible locale persistence (cookies are readable server-side).
 * Requires the consuming app to manage cookie consent.
 */
export const COOKIE_LOCALE_PROVIDER: Provider = {
  provide: LOCALE_STORAGE,
  useValue: {
    get: (): string | null => {
      try {
        if (typeof document === 'undefined') return null;
        const match = document.cookie.match(/(?:^|; )vi18n:locale=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : null;
      } catch (err: unknown) {
        // TODO: wire to a proper error-reporting surface once the error bus
        // architecture is finalised (ownership, MFE sharing, DI scope).
        console.error('[vi18n] Failed to read locale from cookie', err);
        return null; // ignore malformed cookies
      }
    },
    set: (locale: string): void => {
      try {
        if (typeof document !== 'undefined') {
          document.cookie = `vi18n:locale=${encodeURIComponent(locale)};path=/;max-age=31536000;SameSite=Lax`;
        }
      } catch (err: unknown) {
        // TODO: wire to a proper error-reporting surface once the error bus
        // architecture is finalised (ownership, MFE sharing, DI scope).
        console.error('[vi18n] Failed to save locale to cookie', err);
      }
    }
  } satisfies LocaleStorage
};
