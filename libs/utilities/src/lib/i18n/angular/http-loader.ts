import { inject, Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ViTranslationLoader } from './tokens';
import { engine } from '../core/translation-engine';

@Injectable({ providedIn: 'root' })
export class HttpTranslationLoader implements ViTranslationLoader {
  private readonly http = inject(HttpClient);
  private readonly cache = new Set<string>();

  async loadAll(manifests: { namespace: string; baseUrl: string }[], locale: string): Promise<void> {
    const promises = manifests.map(m => this.load(m.namespace, locale, `${m.baseUrl}/${locale}.json`));
    await Promise.all(promises);
  }

  async load(namespace: string, locale: string, url: string): Promise<void> {
    const fetches: Promise<void>[] = [this.fetchAndRegister(namespace, locale, url)];

    // Fetch 'en' as fallback
    if (locale !== 'en') {
      const enCacheKey = `${namespace}:en`;
      if (!this.cache.has(enCacheKey)) {
        const enUrl = url.replace(new RegExp(`${locale}\\.json$`), 'en.json');
        fetches.push(this.fetchAndRegister(namespace, 'en', enUrl));
      }
    }

    await Promise.allSettled(fetches);
  }

  private async fetchAndRegister(namespace: string, locale: string, url: string): Promise<void> {
    const cacheKey = `${namespace}:${locale}`;
    
    // Optimistic cache
    this.cache.add(cacheKey);

    try {
      const json = await firstValueFrom(this.http.get<Record<string, unknown>>(url));
      engine.register(namespace, json);
    } catch (err) {
      this.cache.delete(cacheKey);
      if (isDevMode()) {
        console.warn(`[vi18n] Failed to load translations for ${namespace}:${locale}`, err);
      }
    }
  }
}
