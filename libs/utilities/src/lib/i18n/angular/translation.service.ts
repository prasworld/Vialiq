import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { from, tap, filter, firstValueFrom, skip } from 'rxjs';
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
  private readonly _version = signal(0);

  private notifyTranslationsChanged(): void {
    this._version.update(v => v + 1);
  }

  // rxResource: manages async translation file loading
  private readonly _resource = rxResource({
    params: () => ({ locale: this._requestedLocale(), manifests: this._manifests() }),
    stream: ({ params, abortSignal }) => from(this.activeLoader.loadAll(params.manifests, params.locale, abortSignal)).pipe(
      tap(() => {
        this._previousLocale = params.locale;
        engine.setLocale(params.locale);
        this.document.documentElement.lang = params.locale;
        this.notifyTranslationsChanged();
      })
    ),
  });

  private readonly _status$ = toObservable(this._resource.status);

  // PUBLIC API

  // Signal that updates only when translations are fully loaded.
  // Pipe reads this to avoid race conditions.
  readonly translations = this._version.asReadonly();

  // Effective locale — only updates when load completes, never flickers mid-flight
  readonly locale = computed(() =>
    this._resource.status() === 'resolved' ? this._requestedLocale() : this._previousLocale
  );

  readonly isLoading = computed(() => this._resource.isLoading());

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
    if (this._resource.isLoading()) {
      await this.waitForResource();
    }
    return engine.instant(key, params, namespace);
  }

  private async waitForResource(): Promise<void> {
    const finalStatus = await firstValueFrom(
      this._status$.pipe(
        skip(1), // skip the current synchronous emission; wait for the next transition
        filter(s => s === 'resolved' || s === 'error'),
      ),
      { defaultValue: 'resolved' as const }
    );
    if (finalStatus === 'error') {
      throw this._resource.error();
    }
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
    try {
      await this.activeLoader.loadAll([manifest], this._requestedLocale());
      this.notifyTranslationsChanged();
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return;
      // TODO: wire to a proper error-reporting surface once the error bus
      // architecture is finalised (ownership, MFE sharing, DI scope).
      console.error(`[vi18n] Failed to load namespace: ${namespace}`, e);
      throw e;
    }
  }

  /**
   * Called by provideTranslations() APP_INITIALIZER.
   */
  async loadInitial(): Promise<void> {
    try {
      await this.activeLoader.loadAll(this._manifests(), this._requestedLocale());
      this.notifyTranslationsChanged();
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return;
      // TODO: wire to a proper error-reporting surface once the error bus
      // architecture is finalised (ownership, MFE sharing, DI scope).
      console.error('[vi18n] Failed to load initial translations', e);
    }
    this._previousLocale = this._requestedLocale();
    engine.setLocale(this._requestedLocale());
    this.document.documentElement.lang = this._requestedLocale();
  }

  /**
   * Switches locale. Triggers rxResource to fetch new JSON files.
   * Also persists to LOCALE_STORAGE.
   */
  async setLocale(locale: string): Promise<void> {
    if (locale === this._requestedLocale()) return;
    this.storage?.set(locale);
    this._requestedLocale.set(locale);
    
    // Wait for rxResource to finish loading to coordinate the awaited completion.
    // We do not call activeLoader.loadAll() manually here because rxResource already handles
    // abort signals; a manual uncancellable loadAll() would circumvent the abort process 
    // and pollute the loader cache on rapid locale switches.
    try {
      await this.waitForResource();
    } catch (e: unknown) {
      // TODO: wire to a proper error-reporting surface once the error bus
      // architecture is finalised (ownership, MFE sharing, DI scope).
      console.error('[vi18n] Failed to set locale', e);
    }
  }
  /**
   * Clears the active loader's cache and reloads the initial translation manifests.
   */
  async reload(): Promise<void> {
    if (this.activeLoader.clearCache) {
      this.activeLoader.clearCache();
    }
    await this.loadInitial();
  }
}
