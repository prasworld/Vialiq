import { ControlStatus } from '../base/validity-mixin.js';
export type TimeFormat = '12' | '24';
export interface TimeComponents {
    hours: number | null;
    minutes: number | null;
    seconds?: number | null;
    period?: 'AM' | 'PM';
    rawHours?: string;
    rawMinutes?: string;
    rawSeconds?: string;
    isPartial?: boolean;
}
export type DisabledHoursFn = (hour: number) => boolean;
export type DisabledMinutesFn = (minute: number, hour?: number) => boolean;
export type DisabledSecondsFn = (second: number, minute?: number, hour?: number) => boolean;
export interface TimePickerChangeDetail {
    /** The value string: "14:30", "02:30 PM", "??:??", or "14:??" */
    value: string | null;
    /** Normalized 24-hour string: "14:30", "14:30:00", or with timezone offset */
    isoValue: string | null;
    /** Parsed numeric hours (0-23 in 24h, 1-12 in 12h, or null when unknown) */
    hours: number | null;
    /** Parsed numeric minutes (0-59, or null when unknown) */
    minutes: number | null;
    /** Parsed numeric seconds (0-59, if enabled, or null when unknown) */
    seconds?: number | null;
    /** Active period in 12-hour format ('AM' | 'PM' | null) */
    period?: 'AM' | 'PM' | null;
    /** True when marked as completely unknown ("??:??") */
    isUnknown: boolean;
    /** True when partially known (e.g., "14:??" or "??:30") per CDISC SDTM */
    isPartialUnknown?: boolean;
    /** Active timezone label or offset (if specified) */
    timezone?: string;
    /** Localized display string */
    formattedValue: string;
}
export interface TimePickerI18n {
    /** Placeholder for hours segment (default: format === '12' ? 'hh' : 'HH') */
    hoursPlaceholder?: string;
    /** Placeholder for minutes segment (default: 'mm') */
    minutesPlaceholder?: string;
    /** Placeholder for seconds segment (default: 'ss') */
    secondsPlaceholder?: string;
    /** Accessible label for hours spinbutton (default: 'Hours, 0 to 23' or 'Hours, 1 to 12') */
    hoursAriaLabel?: string;
    /** Accessible label for minutes spinbutton (default: 'Minutes, 0 to 59') */
    minutesAriaLabel?: string;
    /** Accessible label for seconds spinbutton (default: 'Seconds, 0 to 59') */
    secondsAriaLabel?: string;
    /** Accessible label for the group/control container (default: 'Time picker') */
    groupAriaLabel?: string;
    /** Accessible label for the clock popup button (default: 'Choose time from popup') */
    clockAriaLabel?: string;
    /** Accessible label for the clear button (default: 'Clear time') */
    clearAriaLabel?: string;
    /** Accessible label for the period toggle button (default: 'Toggle AM/PM, currently {period}') */
    periodAriaLabel?: string;
    /** Label for clinical EDC unknown time checkbox (default: 'Time unknown') */
    unknownLabel?: string;
    /** Accessible label for floating popup container (default: 'Time popup') */
    popupAriaLabel?: string;
    /** Label for the quick "Now" action button (default: 'Now') */
    nowLabel?: string;
    /** Accessible label for "Now" action button (default: 'Set to current time') */
    nowAriaLabel?: string;
    /** Accessible label for timezone indicator (default: 'Timezone') */
    timezoneAriaLabel?: string;
    /** Validation error message when required field is empty */
    requiredMessage?: string;
    /** Validation error message when format/input is invalid */
    invalidMessage?: string;
    /** Validation error message when time is before min constraint */
    minMessage?: string;
    /** Validation error message when time is after max constraint */
    maxMessage?: string;
    /** Validation error message when time is disabled via disabledHours/disabledMinutes/disabledSeconds */
    disabledTimeMessage?: string;
    /** Label for empty spinbutton value text (default: 'Empty') */
    emptyValueText?: string;
    /** Label for unknown spinbutton value text (default: 'Unknown') */
    unknownValueText?: string;
    /** Unit word for hours in aria-valuetext (default: 'hours') */
    hoursUnit?: string;
    /** Unit word for minutes in aria-valuetext (default: 'minutes') */
    minutesUnit?: string;
    /** Unit word for seconds in aria-valuetext (default: 'seconds') */
    secondsUnit?: string;
}
export type TimePickerConfig = TimePickerI18n;
export interface ITimePickerLocaleRegistry {
    /** Register a synchronous dictionary for a locale */
    register(locale: string, dictionary: Partial<TimePickerI18n>): void;
    /** Register an asynchronous loader function (e.g., fetch from assets or CMS) */
    registerLoader(loader: (locale: string) => Promise<Partial<TimePickerI18n> | null>): void;
    /** Retrieve localized dictionary for a locale with fallback to default English */
    getLocale(locale: string, format?: TimeFormat): Required<TimePickerI18n>;
    /** Async resolver when async loaders are configured */
    resolveLocale(locale: string): Promise<Required<TimePickerI18n>>;
    /** Check if a locale is registered */
    has(locale: string): boolean;
    /** Clears custom registrations (useful for test isolation) */
    clear(): void;
}
export declare const TIME_PICKER_LOCALE_REGISTRY_TOKEN: unique symbol;
export type { ControlStatus };
//# sourceMappingURL=types.d.ts.map