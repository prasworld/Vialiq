declare const process: { env: Record<string, string> };
import { engine } from './translation-engine';

export interface TranslationManifest {
  namespace: string;
  baseUrl: string;
}

export class TranslationLoader {
  // Cache to prevent duplicate fetches. Key: `${namespace}:${locale}`
  private cache = new Set<string>();

  /**
   * Loads a single namespace for a given locale.
   */
  async load(namespace: string, locale: string, url: string): Promise<void> {
    const cacheKey = `${namespace}:${locale}`;
    if (this.cache.has(cacheKey)) {
      return;
    }

    try {
      const fetches: Promise<void>[] = [this.fetchAndRegister(namespace, locale, url)];

      // Also fetch 'en' as a fallback base layer (ADR Q4 — fallback chain [currentLocale, 'en']).
      // The engine merges registrations, so en keys that fr doesn't override remain available.
      if (locale !== 'en') {
        const enCacheKey = `${namespace}:en`;
        if (!this.cache.has(enCacheKey)) {
          const enUrl = url.replace(new RegExp(`${locale}\\.json$`), 'en.json');
          fetches.push(this.fetchAndRegister(namespace, 'en', enUrl));
        }
      }

      await Promise.allSettled(fetches);
    } catch (err) {
      // Unexpected synchronous error — should not occur in normal operation
      if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'production') {
        console.warn(`[vi18n] Failed to load translations for ${namespace}:${locale}`, err);
      }
    }
  }

  /**
   * Loads all manifests for a given locale in parallel.
   */
  async loadAll(manifests: TranslationManifest[], locale: string): Promise<void> {
    const promises = manifests.map(m => 
      this.load(m.namespace, locale, `${m.baseUrl}/${locale}.json`)
    );
    await Promise.allSettled(promises);
  }

  clearCache(): void {
    this.cache.clear();
  }

  private async fetchAndRegister(namespace: string, locale: string, url: string): Promise<void> {
    const cacheKey = `${namespace}:${locale}`;
    
    // Optimistically add to cache so parallel requests don't duplicate
    this.cache.add(cacheKey);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        this.cache.delete(cacheKey);
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      engine.register(namespace, json);
    } catch (err) {
      this.cache.delete(cacheKey);
      if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'production') {
        console.warn(`[vi18n] Failed to load translations for ${namespace}:${locale}`, err);
      }
    }
  }
}

export const loader = new TranslationLoader();
