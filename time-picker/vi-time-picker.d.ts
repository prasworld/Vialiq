import { PropertyValues } from 'lit';
import { ViElement } from '../base/vi-element.js';
import { TimeFormat, TimePickerConfig, DisabledHoursFn, DisabledMinutesFn, DisabledSecondsFn } from './types.js';
export declare const VI_TIME_PICKER_CHANGE = "vi-time-picker-change";
declare const ViTimePicker_base: (new (...args: any[]) => import('../base/flatpickr-mixin.js').FlatpickrMixinInterface) & typeof ViElement & (new (...args: any[]) => import('../base/validity-mixin.js').ValidityInterface<unknown>);
/**
 * vi-time-picker
 * A form-associated, accessible time input control supporting 12h/24h formats,
 * direct numeric segment keyboard entry, Flatpickr scroll popup, and clinical
 * EDC unknown time capture.
 *
 * @element vi-time-picker
 *
 * @fires {CustomEvent<TimePickerChangeDetail>} vi-time-picker-change - Fires when time value changes
 * @fires {CustomEvent<TimePickerChangeDetail>} vialiq-change - Legacy alias for change event
 * @fires {CustomEvent<void>} vialiq-clear - Fires when clear button is clicked
 *
 * @attr {string} value - Current time string (read/write, reflected)
 * @attr {string} name - Form field name
 * @attr {TimeFormat} format - '12' | '24' (default: '24')
 * @attr {number} step - Minute step increment (default: 15)
 * @attr {boolean} show-seconds - Include seconds segment (default: false)
 * @attr {string} min - Minimum time constraint ('HH:mm')
 * @attr {string} max - Maximum time constraint ('HH:mm')
 * @attr {boolean} disabled - Disables the control (reflected)
 * @attr {boolean} required - Marks field as required (reflected)
 * @attr {boolean} readonly - Prevents value modification (reflected)
 * @attr {boolean} allow-unknown - Enables clinical "Time unknown" (??:??) mode
 * @attr {boolean} clearable - Shows clear button when value is present
 * @attr {boolean} hoist - Hoists popup to escape overflow containers
 * @attr {string} locale - BCP 47 locale tag (e.g. 'fr', 'de', 'es', 'en')
 * @attr {ControlStatus} status - Validation state: 'default' | 'valid' | 'invalid'
 * @attr {string} validity-message - Validation error or feedback message
 *
 * @csspart control - Outer container holding segments and buttons
 * @csspart hours-input - Hours numeric input
 * @csspart minutes-input - Minutes numeric input
 * @csspart seconds-input - Seconds numeric input (when show-seconds)
 * @csspart separator - Colon : separator spans
 * @csspart period-btn - AM/PM toggle button (12h format only)
 * @csspart clock-btn - Clock popup trigger button
 * @csspart clear-btn - Clear × button
 * @csspart popup - Floating container for Flatpickr popup
 * @csspart unknown-wrapper - "Time unknown" checkbox container
 * @csspart unknown-checkbox - "Time unknown" checkbox input
 * @csspart helper - Persistent helper text wrapper
 * @csspart validation - Validation message span
 */
export declare class ViTimePicker extends ViTimePicker_base {
    accessor value: string;
    accessor name: string;
    accessor format: TimeFormat;
    accessor step: number;
    accessor hourStep: number;
    accessor secondStep: number;
    accessor showSeconds: boolean;
    accessor min: string;
    accessor max: string;
    accessor disabled: boolean;
    accessor readonly: boolean;
    accessor allowUnknown: boolean;
    accessor label: string;
    accessor helperText: string;
    accessor clearable: boolean;
    accessor showNow: boolean;
    accessor timezone: string;
    accessor hoist: boolean;
    accessor disabledHours: number[] | DisabledHoursFn | null;
    accessor disabledMinutes: number[] | DisabledMinutesFn | null;
    accessor disabledSeconds: number[] | DisabledSecondsFn | null;
    accessor locale: string | null;
    /**
     * Unified configuration object for placeholders, labels, messages, and formatting.
     * Changes to this object (including in-place property mutations) are automatically watched.
     */
    accessor config: Partial<TimePickerConfig>;
    /**
     * Alias for `config`, supporting internationalization terminology.
     */
    accessor i18n: Partial<TimePickerConfig>;
    accessor hoursPlaceholder: string;
    accessor minutesPlaceholder: string;
    accessor secondsPlaceholder: string;
    private _proxySet;
    private _isProxy;
    private _createConfigProxy;
    /**
     * Merges partial configuration updates into the existing config and triggers reactivity.
     */
    setConfig(updates: Partial<TimePickerConfig>): void;
    /**
     * Merges partial configuration updates into the existing i18n and triggers reactivity.
     */
    setI18n(updates: Partial<TimePickerConfig>): void;
    private accessor _hours;
    private accessor _minutes;
    private accessor _seconds;
    private accessor _period;
    private accessor _isUnknown;
    private accessor _isOpen;
    private accessor _resolvedLocale;
    private accessor _fpInput;
    private accessor _hoursInput;
    private accessor _minutesInput;
    private accessor _secondsInput;
    private accessor _periodBtn;
    private accessor _controlEl;
    private accessor _clockBtn;
    private accessor _floatingMenuContainer;
    private _initialValue;
    private _isSyncingFromFp;
    private _floatingController;
    private _getLocaleRegistry;
    /** Returns the localized string for a given key, resolving direct props > config > i18n > registry > default. */
    getI18nText(key: keyof TimePickerConfig): string;
    connectedCallback(): void;
    willUpdate(changed: PropertyValues): void;
    firstUpdated(_changed: PropertyValues): Promise<void>;
    disconnectedCallback(): void;
    updated(changed: PropertyValues): Promise<void>;
    protected _getHiddenInput(): HTMLInputElement | null;
    private _setupFlatpickr;
    private _buildFpConfig;
    private _setupPopupFocusableElements;
    private _syncFlatpickrValue;
    private _customValidityText;
    setCustomValidity(message: string): void;
    _syncValidity(): void;
    protected _testValidity(): Partial<ValidityStateFlags>;
    private _isHourDisabled;
    private _isMinuteDisabled;
    private _isSecondDisabled;
    private _isTimeDisabled;
    formResetCallback(): void;
    focus(options?: FocusOptions): void;
    open(): void;
    close(): void;
    clear(): void;
    stepUp(segment?: 'hours' | 'minutes' | 'seconds'): void;
    stepDown(segment?: 'hours' | 'minutes' | 'seconds'): void;
    /** Sets the time picker to the current system time */
    setCurrentTime(): void;
    /** Alias for setCurrentTime */
    now(): void;
    private _syncStateFromValue;
    /**
     * Normalizes this.value and the form value to match this.format and this.showSeconds,
     * enforcing a single source of truth between displayed segments and public value.
     */
    private _normalizeCurrentValue;
    private _onFlatpickrChange;
    private _handleUnknownToggle;
    private _togglePeriod;
    private _focusPrimary;
    private _handleControlClick;
    private _handlePaste;
    private _handleSegmentFocus;
    private _handleHoursBlur;
    private _handleMinutesBlur;
    private _handleSecondsBlur;
    private _handleControlFocusout;
    private _handleHoursInput;
    private _handleMinutesInput;
    private _handleSecondsInput;
    private _handleHoursKeydown;
    private _handleMinutesKeydown;
    private _handleSecondsKeydown;
    private _handlePeriodKeydown;
    private _handlePopupKeydown;
    private _stepSegment;
    private _commitTime;
    private _emitChange;
    protected render(): import('lit-html').TemplateResult<1>;
    static styles: import('lit').CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-time-picker': ViTimePicker;
    }
}
export {};
//# sourceMappingURL=vi-time-picker.d.ts.map