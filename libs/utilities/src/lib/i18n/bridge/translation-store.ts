import { engine } from '../core/translation-engine';
import { loader, TranslationManifest } from '../core/translation-loader';

/**
 * Vanilla JS/TS translation bridge.
 * Exposes the TranslationEngine to React, Lit, and Web Components without Angular dependencies.
 * Shared as a Module Federation singleton across the MFE.
 */
export const translationStore = {
  /**
   * Translate a key synchronously using the shared engine.
   */
  instant: (key: string, params?: Record<string, unknown>, namespace?: string): string => 
    engine.instant(key, params, namespace),

  /**
   * Switch locale — fetches new JSON for all registered namespaces, then notifies listeners.
   */
  setLocale: async (locale: string): Promise<void> => {
    await loader.loadAll(engine.getManifests(), locale);
    engine.setLocale(locale); // fires onChange → all framework listeners re-render
  },

  /**
   * Subscribe to locale changes. Returns a cleanup function.
   * Useful for React `useEffect` or Lit `connectedCallback`.
   */
  onLocaleChange: (cb: () => void): (() => void) => engine.onChange(cb),

  /**
   * Get the currently active locale.
   */
  getLocale: (): string => engine.currentLocale,

  /**
   * Register a new namespace and immediately load it for the current locale.
   */
  loadNamespace: (manifest: TranslationManifest): Promise<void> => {
    engine.registerManifest(manifest);
    return loader.load(manifest.namespace, engine.currentLocale, `${manifest.baseUrl}/${engine.currentLocale}.json`);
  },
};
