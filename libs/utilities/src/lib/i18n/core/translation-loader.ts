declare const process: { env: Record<string, string> };
import { engine } from './translation-engine';

export interface TranslationManifest {
  namespace: string;
  baseUrl: string;
}

export class TranslationLoader {
  // Cache to prevent duplicate fetches. Key: `${namespace}:${locale}`
  private cache = new Map<string, Promise<void>>();

  /**
   * Loads a single namespace for a given locale.
   */
  load(namespace: string, locale: string, url: string, abortSignal?: AbortSignal): Promise<void> {
    const cacheKey = `${namespace}:${locale}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const promise = (async () => {
      const fetches: Promise<void>[] = [];

      // Fetch 'en' as a fallback base layer.
      if (locale !== 'en') {
        // Anchor the replace to the end of the URL so a locale token in the
        // base path (e.g. /assets/fr/translations/fr.json) is not affected.
        const enUrl = url.replace(new RegExp(`/${locale}\\.json$`), '/en.json');
        fetches.push(this.load(namespace, 'en', enUrl, abortSignal));
      }

      fetches.push(this.fetchAndRegister(namespace, locale, url, abortSignal));
      await Promise.all(fetches);
    })();

    const resultPromise = promise.catch(e => {
      this.cache.delete(cacheKey);
      throw e;
    });

    this.cache.set(cacheKey, resultPromise);
    return resultPromise;
  }

  /**
   * Loads all manifests for a given locale in parallel.
   */
  async loadAll(manifests: TranslationManifest[], locale: string, abortSignal?: AbortSignal): Promise<void> {
    const promises = manifests.map(m => 
      this.load(m.namespace, locale, `${m.baseUrl}/${locale}.json`, abortSignal)
    );
    await Promise.all(promises);
  }

  clearCache(): void {
    this.cache.clear();
  }

  private async fetchAndRegister(namespace: string, locale: string, url: string, abortSignal?: AbortSignal): Promise<void> {
    try {
      const res = await fetch(url, { signal: abortSignal });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      engine.register(namespace, locale, json);
    } catch (err) {
      // AbortError = intentional cancellation (rapid locale switch). Completely silent.
      if (err instanceof Error && err.name === 'AbortError') throw err;
      if (typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'production') {
        console.warn(`[vi18n] Failed to load translations for ${namespace}:${locale}`, err);
      }
      throw err;
    }
  }
}

export const loader = new TranslationLoader();
