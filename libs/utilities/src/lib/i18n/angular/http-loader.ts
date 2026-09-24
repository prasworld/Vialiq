import { inject, Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, fromEvent, takeUntil } from 'rxjs';
import { ViTranslationLoader } from './tokens';
import { engine } from '../core/translation-engine';

@Injectable({ providedIn: 'root' })
export class HttpTranslationLoader implements ViTranslationLoader {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Promise<void>>();

  async loadAll(manifests: { namespace: string; baseUrl: string }[], locale: string, abortSignal?: AbortSignal): Promise<void> {
    const promises = manifests.map(m => this.load(m.namespace, locale, `${m.baseUrl}/${locale}.json`, abortSignal));
    await Promise.all(promises);
  }

  load(namespace: string, locale: string, url: string, abortSignal?: AbortSignal): Promise<void> {
    const cacheKey = `${namespace}:${locale}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const promise = (async () => {
      const fetches: Promise<void>[] = [];

      // Fetch 'en' as a fallback base layer.
      // Thanks to the locale-isolated registry in the engine, these can now be fetched concurrently
      // without worrying about the fallback overwriting the active locale's keys.
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

  private async fetchAndRegister(namespace: string, locale: string, url: string, abortSignal?: AbortSignal): Promise<void> {
    try {
      let request$ = this.http.get<Record<string, unknown>>(url);
      if (abortSignal) {
        request$ = request$.pipe(takeUntil(fromEvent(abortSignal, 'abort')));
      }
      const json = await firstValueFrom(request$);
      engine.register(namespace, locale, json);
    } catch (err) {
      // AbortError = intentional cancellation (rapid locale switch). Completely silent.
      if (err instanceof Error && err.name === 'AbortError') throw err;
      if (isDevMode()) {
        console.warn(`[vi18n] Failed to load translations for ${namespace}:${locale}`, err);
      }
      throw err;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}
