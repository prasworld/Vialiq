import { PropertyValues } from 'lit';
import { ViElement } from '../base/vi-element.js';
import { DatePickerMode } from './types.js';
/** Emitted when the user selects a date. Detail: DatePickerChangeDetail. */
export declare const VIALIQ_CHANGE = "vialiq-change";
declare const ViDatePicker_base: (new (...args: any[]) => import('../base/flatpickr-mixin.js').FlatpickrMixinInterface) & typeof ViElement & (new (...args: any[]) => import('../base/validity-mixin.js').ValidityInterface<unknown>);
/**
 * A form-associated date-picker built on flatpickr.
 *
 * @element vi-date-picker
 *
 * @fires {CustomEvent<DatePickerChangeDetail>} vialiq-change  - Date selection changed.
 *
 * @attr {string}          value            - ISO date string (read/write).
 * @attr {string}          name             - Form field name.
 * @attr {DatePickerMode}  mode             - 'date' | 'range' | 'month' | 'month-year' | 'week'
 * @attr {boolean}         flat             - Renders inline (no popup).
 * @attr {string}          min              - Min date.
 * @attr {string}          max              - Min date.
 * @attr {string}          locale           - BCP 47 locale tag.
 * @attr {boolean}         disabled         - Disables the control.
 * @attr {boolean}         required         - Required field.
 * @attr {boolean}         week-numbers     - Show ISO week numbers.
 * @attr {ControlStatus}   status           - 'default' | 'valid' | 'invalid'
 * @attr {string}          validity-message - Validation message shown below input.
 * @attr {string}          today-label      - Explicit label for the "Today" button.
 */
export declare class ViDatePicker extends ViDatePicker_base {
    accessor value: string;
    accessor name: string;
    accessor mode: DatePickerMode;
    accessor flat: boolean;
    accessor hoist: boolean;
    accessor min: string;
    accessor max: string;
    accessor locale: string | null;
    accessor disabled: boolean;
    accessor weekNumbers: boolean;
    accessor todayLabel: string | undefined;
    private accessor _resolvedLocale;
    private accessor _displayValue;
    private accessor _fpInput;
    private accessor _floatingMenuContainer;
    private accessor _inputs;
    /** Light DOM container for flatpickr inline mode to inherit global CSS */
    private _inlineContainer?;
    private _initialValue;
    accessor labelPrevMonth: string | undefined;
    accessor labelNextMonth: string | undefined;
    accessor labelSelectMonth: string | undefined;
    accessor labelSelectYear: string | undefined;
    private _floatingController;
    protected _getModePluginConfig(): {
        ariaLabels: {
            prevMonth: string | undefined;
            nextMonth: string | undefined;
            selectMonth: string | undefined;
            selectYear: string | undefined;
        };
    };
    protected _testValidity(): Partial<ValidityStateFlags>;
    connectedCallback(): void;
    disconnectedCallback(): void;
    formResetCallback(): void;
    firstUpdated(_changedProperties: PropertyValues): Promise<void>;
    private _setupFlatpickr;
    updated(changed: PropertyValues): Promise<void>;
    protected _getHiddenInput(): HTMLInputElement | null;
    focus(options?: FocusOptions): void;
    /** Opens the calendar popup. No-op when flat=true. */
    openCalendar(): void;
    /** Closes the calendar popup. No-op when flat=true. */
    closeCalendar(): void;
    /** Clears the selected date(s). */
    clear(): void;
    private _buildFpConfig;
    private _removeFpAria;
    private _setFpValue;
    private _syncInputValues;
    private _onFlatpickrChange;
    private _emitChange;
    private _buildIsoValue;
    private _setupTodayButton;
    private _handleSlotChange;
    private _handleInputsClick;
    protected render(): import('lit-html').TemplateResult<1>;
    static styles: import('lit').CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-date-picker': ViDatePicker;
    }
}
export {};
//# sourceMappingURL=vi-date-picker.d.ts.map