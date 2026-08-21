import type { CustomLocale } from 'flatpickr/dist/types/locale';

/** Loader function type — returns the module namespace object */
type LocaleLoader = () => Promise<CustomLocale | null>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadL10n(importer: () => Promise<any>): Promise<CustomLocale | null> {
  const mod = await importer();
  
  const isLocale = (v: unknown): v is CustomLocale => 
    !!v && typeof v === 'object' && 'weekdays' in v && 'months' in v;

  // 1. Check if the module exports a named locale directly (e.g. exports.French)
  for (const key of Object.keys(mod)) {
    if (key !== 'default' && isLocale(mod[key])) {
      return mod[key] as CustomLocale;
    }
  }

  // 2. Check if mod.default is the locale directly
  if (isLocale(mod.default)) {
    return mod.default as CustomLocale;
  }

  // 3. Check if mod.default is an l10ns map (e.g. { fr: CustomLocale })
  if (mod.default && typeof mod.default === 'object') {
    const l10ns = mod.default as Record<string, unknown>;
    for (const key of Object.keys(l10ns)) {
      if (isLocale(l10ns[key])) {
        return l10ns[key] as CustomLocale;
      }
    }
  }

  // 4. Check if mod itself is the l10ns map
  for (const key of Object.keys(mod)) {
    if (isLocale(mod[key])) {
      return mod[key] as CustomLocale;
    }
  }

  return null;
}

// Map of BCP 47 locale tags to flatpickr l10n imports.
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
    const locale = await loadFn();
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
