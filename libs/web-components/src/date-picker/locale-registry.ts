import type { CustomLocale, key as LocaleKey } from 'flatpickr/dist/types/locale';

// Shape of the default export of every flatpickr dist/l10n/*.js module:
// a map keyed by locale code, each value being a CustomLocale (or undefined).
type L10nMap = Partial<Record<LocaleKey, CustomLocale>>;

/** Loader function type — returns the module's default export (the locale map) */
type LocaleLoader = () => Promise<L10nMap>;

async function loadL10n(importer: () => Promise<{ default: L10nMap }>): Promise<L10nMap> {
  const mod = await importer();
  return mod.default;
}

// Map of BCP 47 locale tags to flatpickr l10n imports.
// Each entry wraps the dynamic import so callers receive only the typed L10nMap.
const LOCALE_MAP: Record<string, LocaleLoader> = {
  ar:      () => loadL10n(() => import('flatpickr/dist/l10n/ar.js')),
  de:      () => loadL10n(() => import('flatpickr/dist/l10n/de.js')),
  'de-DE': () => loadL10n(() => import('flatpickr/dist/l10n/de.js')),
  es:      () => loadL10n(() => import('flatpickr/dist/l10n/es.js')),
  'es-ES': () => loadL10n(() => import('flatpickr/dist/l10n/es.js')),
  fr:      () => loadL10n(() => import('flatpickr/dist/l10n/fr.js')),
  'fr-FR': () => loadL10n(() => import('flatpickr/dist/l10n/fr.js')),
  it:      () => loadL10n(() => import('flatpickr/dist/l10n/it.js')),
  ja:      () => loadL10n(() => import('flatpickr/dist/l10n/ja.js')),
  ko:      () => loadL10n(() => import('flatpickr/dist/l10n/ko.js')),
  nl:      () => loadL10n(() => import('flatpickr/dist/l10n/nl.js')),
  'pt-BR': () => loadL10n(() => import('flatpickr/dist/l10n/pt.js')),
  pt:      () => loadL10n(() => import('flatpickr/dist/l10n/pt.js')),
  'zh-CN': () => loadL10n(() => import('flatpickr/dist/l10n/zh.js')),
  zh:      () => loadL10n(() => import('flatpickr/dist/l10n/zh.js')),
};

const localeCache = new Map<string, CustomLocale | null>();

/**
 * Lazily loads a flatpickr locale definition for a given BCP 47 tag.
 * Returns null for English (flatpickr's built-in default) or unsupported locales.
 */
export async function loadLocale(bcp47: string): Promise<CustomLocale | null> {
  // English is built-in
  if (bcp47.startsWith('en')) {
    return null;
  }

  // Check cache
  if (localeCache.has(bcp47)) {
    return localeCache.get(bcp47) ?? null;
  }

  const loadFn = LOCALE_MAP[bcp47] ?? LOCALE_MAP[bcp47.split('-')[0]];

  if (!loadFn) {
    localeCache.set(bcp47, null);
    return null;
  }

  try {
    const l10nMap = await loadFn();
    // Try the full BCP 47 key first, then the language-only prefix.
    const langKey = bcp47.split('-')[0] as LocaleKey;
    const locale = l10nMap[bcp47 as LocaleKey] ?? l10nMap[langKey] ?? null;
    localeCache.set(bcp47, locale);
    return locale;
  } catch (e) {
    console.warn(`[vi-date-picker] Failed to load locale: ${bcp47}`, e);
    localeCache.set(bcp47, null);
    return null;
  }
}

export function __clearLocaleCacheForTest() {
  localeCache.clear();
}
