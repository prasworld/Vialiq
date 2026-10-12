import { ITimePickerLocaleRegistry, TimePickerI18n, TimeFormat } from './types.js';
/**
 * Singleton Locale Registry for TimePicker, managed via Dependency Inversion.
 *
 * Allows consumers and plugins to dynamically register new locales or asynchronous loaders
 * without modifying library source code.
 */
export declare class ViTimePickerLocaleRegistry implements ITimePickerLocaleRegistry {
    private _dictionaries;
    private _loaders;
    private _fallbackLocale;
    constructor();
    private _seedDefaults;
    /**
     * Registers or extends translations for a BCP 47 locale tag (e.g. 'sv', 'it', 'de-AT').
     */
    register(locale: string, dictionary: Partial<TimePickerI18n>): void;
    /**
     * Registers an asynchronous loader (e.g., fetch from `/assets/i18n/time-picker/${locale}.json` or CMS).
     */
    registerLoader(loader: (locale: string) => Promise<Partial<TimePickerI18n> | null>): void;
    /**
     * Checks whether a locale is registered (directly or by language base code).
     */
    has(locale: string): boolean;
    /**
     * Retrieves the combined dictionary for the given locale with automatic fallback to English defaults.
     */
    getLocale(locale: string, format?: TimeFormat): Required<TimePickerI18n>;
    /**
     * Asynchronously resolves a locale, calling registered loaders if not yet registered.
     */
    resolveLocale(locale: string): Promise<Required<TimePickerI18n>>;
    /**
     * Resets the registry back to default starter locales (useful in test teardown).
     */
    clear(): void;
    /**
     * Returns the singleton instance resolved from the global tsyringe container.
     */
    static getInstance(): ViTimePickerLocaleRegistry;
}
/**
 * Default global singleton instance of ViTimePickerLocaleRegistry.
 */
export declare const timePickerLocaleRegistry: ViTimePickerLocaleRegistry;
//# sourceMappingURL=vi-time-picker-locale-registry.d.ts.map