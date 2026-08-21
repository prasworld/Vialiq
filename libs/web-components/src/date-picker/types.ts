import type { Plugin } from 'flatpickr/dist/types/options';
import type { CustomLocale, key as LocaleKey, Locale } from 'flatpickr/dist/types/locale';

export type DatePickerMode = 'date' | 'month' | 'month-year' | 'year' | 'range' | 'week';

export interface DateComponents {
  day: number;
  month: number;
  year: number;
}

export type SegmentOrder = 'DMY' | 'MDY' | 'YMD';

export interface DatePickerChangeDetail {
  value: string | null;
  type: DatePickerMode;
  isoValue: string | null;
  utcIso: string | null;
  formattedValue: string;
  rawValue: DateComponents | null;
  rawEndValue?: DateComponents | null;
  weekNumber: number | null;
  locale: string;
  timeZone: string;
}

export interface ViDatePickerPlugin {
  id: string;
  label: string;
  factory: Plugin;
  defaultConfig?: Record<string, unknown>;
}

/** Shape of a flatpickr dist/l10n/*.js module's default export */
export type L10nModule = Partial<Record<LocaleKey, CustomLocale>> & { default: Locale };

export type DatePickerPluginInput = Plugin | ViDatePickerPlugin;

export type ControlStatus = 'default' | 'valid' | 'invalid';
