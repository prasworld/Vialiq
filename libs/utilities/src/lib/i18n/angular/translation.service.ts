import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { from, tap } from 'rxjs';
import { engine } from '../core/translation-engine';
import { loader, TranslationManifest } from '../core/translation-loader';
import { INITIAL_LOCALE, LOCALE_STORAGE } from './locale-storage';
import { installDevConsole } from '../bridge/dev-console';

import { MISSING_KEY_HANDLER, TRANSLATION_LOADER } from './tokens';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(LOCALE_STORAGE, { optional: true });
  private readonly customLoader = inject(TRANSLATION_LOADER, { optional: true });
  private readonly missingKeyHandler = inject(MISSING_KEY_HANDLER, { optional: true });

  // Expose the active loader (custom or default)
  private get activeLoader() {
    return this.customLoader ?? loader;
  }

  constructor() {
    installDevConsole(this);
    if (this.missingKeyHandler) {
      engine.missingKeyHandler = (key, namespace) => this.missingKeyHandler?.handle(key, namespace) ?? key;
    }
  }

  // Locale resolution order (first non-null wins):
  //   1. LOCALE_STORAGE (persisted user preference)
  //   2. INITIAL_LOCALE token (host-app / SSR override)
  //   3. navigator.language (browser default)
  private readonly _initialLocale = inject(INITIAL_LOCALE, { optional: true });
  private readonly _requestedLocale = signal<string>(
    this.storage?.get()
    ?? this._initialLocale
    ?? (typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en')
  );

  private _previousLocale = this._requestedLocale();
  private readonly _manifests = signal<TranslationManifest[]>([]);

  // rxResource: manages async translation file loading
  private readonly _resource = rxResource({
    params: () => ({ locale: this._requestedLocale(), manifests: this._manifests() }),
    stream: ({ params }) => from(this.activeLoader.loadAll(params.manifests, params.locale)).pipe(
      tap(() => {
        this._previousLocale = params.locale;
        engine.setLocale(params.locale);
        this.document.documentElement.lang = params.locale;
      })
    ),
  });

  // PUBLIC API

  // Signal that updates only when translations are fully loaded.
  // Pipe reads this to avoid race conditions.
  readonly translations = computed(() => this._resource.value());

  // Effective locale — only updates when load completes, never flickers mid-flight
  readonly locale = computed(() =>
    this._resource.status() === 'resolved' ? this._requestedLocale() : this._previousLocale
  );

  readonly isLoading = computed(() => this._resource.status() === 'loading');

  /**
   * Synchronous translation. Returns the translated string immediately.
   */
  instant(key: string, params?: Record<string, unknown>, namespace?: string): string {
    return engine.instant(key, params, namespace);
  }

  /**
   * Async translation. Waits for the current in-flight load to settle, then resolves.
   */
  async get(key: string, params?: Record<string, unknown>, namespace?: string): Promise<string> {
    if (this._resource.status() === 'loading') {
      // Wait for the resource to resolve.
      // rxResource's underlying mechanisms don't easily expose a Promise for the *current* load,
      // but we know it will resolve when `status()` is no longer 'loading'.
      // A simple polling or returning the instant if resolved is one way.
      // Since it's RxJS backed, we can convert it. But let's just use `loader.loadAll` directly if needed,
      // or just await `loader.loadAll` again (it's cached anyway).
      await loader.loadAll(this._manifests(), this._requestedLocale());
    }
    return engine.instant(key, params, namespace);
  }

  registerNamespace(manifest: TranslationManifest): void {
    engine.registerManifest(manifest);
    const current = this._manifests();
    if (!current.some(m => m.namespace === manifest.namespace)) {
      this._manifests.set([...current, manifest]);
    }
  }

  /**
   * Imperatively loads a specific namespace.
   * Use this in a route resolver to block a lazy-loaded route until its translations are ready.
   */
  async loadNamespace(namespace: string): Promise<void> {
    const manifest = this._manifests().find(m => m.namespace === namespace);
    if (!manifest) throw new Error(`[vi18n] Namespace "${namespace}" not registered`);
    await this.activeLoader.loadAll([manifest], this._requestedLocale());
  }

  /**
   * Called by provideTranslations() APP_INITIALIZER.
   */
  async loadInitial(): Promise<void> {
    await this.activeLoader.loadAll(this._manifests(), this._requestedLocale());
    this._previousLocale = this._requestedLocale();
    engine.setLocale(this._requestedLocale());
    this.document.documentElement.lang = this._requestedLocale();
  }

  /**
   * Switches locale. Triggers rxResource to fetch new JSON files.
   * Also persists to LOCALE_STORAGE.
   */
  setLocale(locale: string): void {
    if (locale === this._requestedLocale()) return;
    this.storage?.set(locale);
    this._requestedLocale.set(locale);
  }
}
