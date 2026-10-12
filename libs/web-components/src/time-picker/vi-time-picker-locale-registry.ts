import 'reflect-metadata';
import { singleton, container } from 'tsyringe';
import type {
  ITimePickerLocaleRegistry,
  TimePickerI18n,
  TimeFormat,
} from './types.js';
import { getDefaultTimePickerI18n, LOCALE_DICTIONARIES } from './i18n.js';

/**
 * Singleton Locale Registry for TimePicker, managed via Dependency Inversion.
 *
 * Allows consumers and plugins to dynamically register new locales or asynchronous loaders
 * without modifying library source code.
 */
@singleton()
export class ViTimePickerLocaleRegistry implements ITimePickerLocaleRegistry {
  private _dictionaries = new Map<string, Partial<TimePickerI18n>>();
  private _loaders: Array<
    (locale: string) => Promise<Partial<TimePickerI18n> | null>
  > = [];
  private _fallbackLocale = 'en';

  constructor() {
    this._seedDefaults();
  }

  private _seedDefaults(): void {
    for (const [key, dict] of Object.entries(LOCALE_DICTIONARIES)) {
      this._dictionaries.set(key.toLowerCase(), { ...dict });
    }
  }

  /**
   * Registers or extends translations for a BCP 47 locale tag (e.g. 'sv', 'it', 'de-AT').
   */
  public register(locale: string, dictionary: Partial<TimePickerI18n>): void {
    if (!locale) return;
    const key = locale.toLowerCase();
    const existing = this._dictionaries.get(key) || {};
    this._dictionaries.set(key, { ...existing, ...dictionary });
  }

  /**
   * Registers an asynchronous loader (e.g., fetch from `/assets/i18n/time-picker/${locale}.json` or CMS).
   */
  public registerLoader(
    loader: (locale: string) => Promise<Partial<TimePickerI18n> | null>,
  ): void {
    this._loaders.push(loader);
  }

  /**
   * Checks whether a locale is registered (directly or by language base code).
   */
  public has(locale: string): boolean {
    if (!locale) return false;
    const norm = locale.toLowerCase();
    const lang = norm.split('-')[0];
    return this._dictionaries.has(norm) || this._dictionaries.has(lang);
  }

  /**
   * Retrieves the combined dictionary for the given locale with automatic fallback to English defaults.
   */
  public getLocale(
    locale: string,
    format: TimeFormat = '24',
  ): Required<TimePickerI18n> {
    const norm = (locale || this._fallbackLocale).toLowerCase();
    const lang = norm.split('-')[0];

    const match =
      this._dictionaries.get(norm) ?? this._dictionaries.get(lang) ?? {};
    const baseFallback = getDefaultTimePickerI18n(this._fallbackLocale, format);

    return {
      ...baseFallback,
      ...match,
    };
  }

  /**
   * Asynchronously resolves a locale, calling registered loaders if not yet registered.
   */
  public async resolveLocale(locale: string): Promise<Required<TimePickerI18n>> {
    if (!locale) return this.getLocale(this._fallbackLocale);
    const norm = locale.toLowerCase();

    if (!this.has(norm) && this._loaders.length > 0) {
      for (const loader of this._loaders) {
        try {
          const loaded = await loader(norm);
          if (loaded) {
            this.register(norm, loaded);
            break;
          }
        } catch (_e) {
          // Continue to next loader on failure
        }
      }
    }

    return this.getLocale(norm);
  }

  /**
   * Resets the registry back to default starter locales (useful in test teardown).
   */
  public clear(): void {
    this._dictionaries.clear();
    this._loaders = [];
    this._seedDefaults();
  }

  /**
   * Returns the singleton instance resolved from the global tsyringe container.
   */
  public static getInstance(): ViTimePickerLocaleRegistry {
    return container.resolve(ViTimePickerLocaleRegistry);
  }
}

/**
 * Default global singleton instance of ViTimePickerLocaleRegistry.
 */
export const timePickerLocaleRegistry = ViTimePickerLocaleRegistry.getInstance();
