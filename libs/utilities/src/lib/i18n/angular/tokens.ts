import { InjectionToken } from '@angular/core';

/**
 * Injection token for the namespace of the current Micro-Frontend.
 * This is used by the TranslatePipe and TranslateDirective to scope key lookups
 * strictly to their own MFE, preventing cross-MFE key bleed.
 */
export const MFE_NAMESPACE = new InjectionToken<string>('vi18n.MFE_NAMESPACE');

/**
 * Interface for a custom translation loader.
 */
export interface ViTranslationLoader {
  loadAll(manifests: { namespace: string; baseUrl: string }[], locale: string): Promise<void>;
  load(namespace: string, locale: string, url: string): Promise<void>;
}

/**
 * Injection token for swappable translation loaders.
 */
export const TRANSLATION_LOADER = new InjectionToken<ViTranslationLoader>('vi18n.TRANSLATION_LOADER');

/**
 * Interface for handling missing keys in production.
 */
export interface ViMissingKeyHandler {
  handle(key: string, namespace?: string): string;
}

/**
 * Injection token for swappable missing key handlers (e.g., to log to Sentry).
 */
export const MISSING_KEY_HANDLER = new InjectionToken<ViMissingKeyHandler>('vi18n.MISSING_KEY_HANDLER');
