import { CustomLocale } from 'flatpickr/dist/types/locale';
import { TimeFormat, TimePickerI18n } from './types.js';
/**
 * Resolves the effective BCP 47 locale tag from an attribute/prop or navigator.
 */
export declare function resolveLocale(localeAttr: string | null): string;
export declare const LOCALE_DICTIONARIES: Record<string, Partial<TimePickerI18n>>;
/**
 * Returns default i18n messages and labels.
 * Can be overridden via props or custom `i18n` dictionary.
 */
export declare function getDefaultTimePickerI18n(locale?: string, format?: TimeFormat): Required<TimePickerI18n>;
/**
 * Lazily loads a Flatpickr locale definition for a given BCP 47 tag.
 * Reuses the cached locale registry from date-picker.
 */
export declare function loadLocale(bcp47: string): Promise<CustomLocale | null>;
//# sourceMappingURL=i18n.d.ts.map