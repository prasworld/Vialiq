import { engine } from '../core/translation-engine';
import { loader, TranslationManifest } from '../core/translation-loader';

/**
 * Vanilla JS/TS translation bridge.
 * Exposes the TranslationEngine to React, Lit, and Web Components without Angular dependencies.
 *
 * ⚠️  SINGLETON REQUIREMENT: For locale changes and registered dictionaries to cross the Module
 * Federation boundary, `@vialiq/utilities` MUST be listed as a shared singleton in every
 * host and remote's Module Federation config. Without this, each MFE bundles its own copy of
 * the engine and loader — locale changes will be local-only and will not propagate to other MFEs.
 *
 * Example (module-federation.config.ts):
 *   shared: (libName, config) => libName === '@vialiq/utilities' ? { ...config, singleton: true, strictVersion: false } : config
 */
let _abortController: AbortController | undefined;


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
    if (_abortController) {
      _abortController.abort();
    }
    _abortController = new AbortController();
    const signal = _abortController.signal;

    try {
      await loader.loadAll(engine.getManifests(), locale, signal);
      if (!signal.aborted) {
        engine.setLocale(locale); // fires onChange → all framework listeners re-render
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      // TODO: wire to a proper error-reporting surface once the error bus
      // architecture is finalised (ownership, MFE sharing, DI scope).
      console.error('[vi18n] Failed to switch locale', err);
    }
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
