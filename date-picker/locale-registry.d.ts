import { CustomLocale } from 'flatpickr/dist/types/locale';
/**
 * Lazily loads a flatpickr locale definition for a given BCP 47 tag.
 * Returns null for English (flatpickr's built-in default) or unsupported locales.
 */
export declare function loadLocale(bcp47: string): Promise<CustomLocale | null>;
export declare function __clearLocaleCacheForTest(): void;
//# sourceMappingURL=locale-registry.d.ts.map