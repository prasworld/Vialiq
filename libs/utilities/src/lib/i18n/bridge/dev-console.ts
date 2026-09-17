import { isDevMode } from '@angular/core';
import { engine } from '../core/translation-engine';
import { loader } from '../core/translation-loader';

/** Minimal interface of TranslationService needed by the dev console — avoids a circular import. */
interface DevConsoleHost {
  setLocale(locale: string): void;
  loadInitial(): Promise<void>;
}

export function installDevConsole(translationService: DevConsoleHost): void {
  if (typeof window === 'undefined') return; // SSR guard
  if (!isDevMode()) return;                  // Tree-shaken in production

  (window as Window & { __vi18n?: unknown }).__vi18n = {
    setLocale: async (locale: string) => {
      translationService.setLocale(locale);
      console.info(`[vi18n] Locale switched to "${locale}"`);
    },
    getLocale: () => engine.currentLocale,
    namespaces: () => Array.from(engine.getNamespaces()),
    keys: (ns: string) => engine.dump(ns),
    t: (key: string, params?: Record<string, unknown>) => engine.instant(key, params),
    reload: async () => {
      loader.clearCache();
      await translationService.loadInitial();
      console.info('[vi18n] Translations reloaded');
    }
  };

  console.info(
    '%c[vi18n] Dev console ready → window.__vi18n',
    'color: #7c3aed; font-weight: bold; font-size: 12px;'
  );
}
