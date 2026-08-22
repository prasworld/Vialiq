import { SegmentOrder, DatePickerMode } from './types.js';
/** Resolves the effective BCP 47 locale tag. */
export declare function resolveLocale(localeAttr: string | null): string;
/** Reads the browser's IANA time zone from Intl. */
export declare function resolveTimeZone(): string;
/**
 * Returns the localized word for "Today" (e.g. "today", "hoy", "aujourd'hui")
 * capitalized properly using native Intl formatting.
 */
export declare function getTodayLabel(locale: string): string;
/**
 * Derives the segment order from the locale using the browser's Intl API,
 * or from an explicit format string.
 * Formats a known reference date and reads back the field order from the parts.
 * Reference: 2001-01-02 — day=2, month=1, year=2001
 */
export declare function resolveSegmentOrder(locale: string, format?: string): SegmentOrder;
export declare function formatDisplay(date: Date, locale: string, mode: DatePickerMode, formatStr?: string): string;
//# sourceMappingURL=i18n.d.ts.map