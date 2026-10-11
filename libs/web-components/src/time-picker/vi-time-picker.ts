import { html, css, unsafeCSS, type PropertyValues, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import type { Options } from 'flatpickr/dist/types/options';
import type { CustomLocale } from 'flatpickr/dist/types/locale';
import { ViElement } from '../base/vi-element.js';
import { FlatpickrMixin } from '../base/flatpickr-mixin.js';
import { ValidityMixin } from '../base/validity-mixin.js';
import { FloatingController } from '../base/controllers/floating-controller.js';
import { ViShadowDomPlugin } from '../date-picker/plugins/vi-shadow-dom-plugin.js';
import timePickerStyles from './vi-time-picker.scss?inline';
import {
  resolveLocale,
  loadLocale,
} from './i18n.js';
import { container } from 'tsyringe';
import { ViTimePickerLocaleRegistry } from './vi-time-picker-locale-registry.js';
import {
  formatTime,
  isUnknownTime,
  isPartialUnknownTime,
  parsePastedTime,
  pad2,
  parseTime,
  stepSegment,
  to12Hour,
  to24Hour,
  toIsoTime,
  compareTimes,
} from './time-utils.js';
import {
  TIME_PICKER_LOCALE_REGISTRY_TOKEN,
  type ITimePickerLocaleRegistry,
  type TimeComponents,
  type TimeFormat,
  type TimePickerChangeDetail,
  type TimePickerConfig,
  type DisabledHoursFn,
  type DisabledMinutesFn,
  type DisabledSecondsFn,
} from './types.js';

export const VI_TIME_PICKER_CHANGE = 'vi-time-picker-change';

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
@customElement('vi-time-picker')
export class ViTimePicker extends ValidityMixin(FlatpickrMixin(ViElement)) {
  // ── Properties / Attributes ───────────────────────────────────────────────

  @property({ type: String, reflect: true }) accessor value = '';
  @property({ type: String }) accessor name = '';
  @property({ type: String, reflect: true }) accessor format: TimeFormat = '24';
  @property({ type: Number }) accessor step = 15;
  @property({ type: Number, attribute: 'hour-step' }) accessor hourStep = 1;
  @property({ type: Number, attribute: 'second-step' }) accessor secondStep = 1;
  @property({ type: Boolean, attribute: 'show-seconds' })
  accessor showSeconds = false;
  @property({ type: String }) accessor min = '';
  @property({ type: String }) accessor max = '';
  @property({ type: Boolean, reflect: true }) accessor disabled = false;
  @property({ type: Boolean, reflect: true }) accessor readonly = false;
  @property({ type: Boolean, attribute: 'allow-unknown' })
  accessor allowUnknown = false;
  @property({ type: String }) accessor label = '';
  @property({ type: String, attribute: 'helper-text' }) accessor helperText = '';
  @property({ type: Boolean }) accessor clearable = false;
  @property({ type: Boolean, attribute: 'show-now' }) accessor showNow = false;
  @property({ type: String, reflect: true }) accessor timezone = '';
  @property({ type: Boolean }) accessor hoist = false;

  @property({ attribute: false })
  accessor disabledHours: number[] | DisabledHoursFn | null = null;
  @property({ attribute: false })
  accessor disabledMinutes: number[] | DisabledMinutesFn | null = null;
  @property({ attribute: false })
  accessor disabledSeconds: number[] | DisabledSecondsFn | null = null;

  // ── Localization & Configuration Object ────────────────────────────────────

  @property({ type: String }) accessor locale: string | null = null;

  /**
   * Unified configuration object for placeholders, labels, messages, and formatting.
   * Changes to this object (including in-place property mutations) are automatically watched.
   */
  @property({ type: Object }) accessor config: Partial<TimePickerConfig> = {};

  /**
   * Alias for `config`, supporting internationalization terminology.
   */
  @property({ type: Object }) accessor i18n: Partial<TimePickerConfig> = {};

  @property({ type: String, attribute: 'hours-placeholder' })
  accessor hoursPlaceholder = '';

  @property({ type: String, attribute: 'minutes-placeholder' })
  accessor minutesPlaceholder = '';

  @property({ type: String, attribute: 'seconds-placeholder' })
  accessor secondsPlaceholder = '';

  private _proxySet = new WeakSet<object>();

  private _isProxy(obj: unknown): boolean {
    return !!obj && typeof obj === 'object' && this._proxySet.has(obj);
  }

  private _createConfigProxy(target: Partial<TimePickerConfig>): Partial<TimePickerConfig> {
    if (!target || typeof target !== 'object' || this._isProxy(target)) {
      return target;
    }
    const proxy = new Proxy(target, {
      set: (obj, prop, value, receiver) => {
        const res = Reflect.set(obj, prop, value, receiver);
        this._syncValidity();
        this.requestUpdate();
        return res;
      },
      deleteProperty: (obj, prop) => {
        const res = Reflect.deleteProperty(obj, prop);
        this._syncValidity();
        this.requestUpdate();
        return res;
      },
    });
    this._proxySet.add(proxy);
    return proxy;
  }

  /**
   * Merges partial configuration updates into the existing config and triggers reactivity.
   */
  public setConfig(updates: Partial<TimePickerConfig>): void {
    if (!this.config) {
      this.config = {};
    }
    Object.assign(this.config, updates);
    this._syncValidity();
    this.requestUpdate();
  }

  /**
   * Merges partial configuration updates into the existing i18n and triggers reactivity.
   */
  public setI18n(updates: Partial<TimePickerConfig>): void {
    if (!this.i18n) {
      this.i18n = {};
    }
    Object.assign(this.i18n, updates);
    this._syncValidity();
    this.requestUpdate();
  }

  // ── Internal State ────────────────────────────────────────────────────────

  @state() private accessor _hours = '';
  @state() private accessor _minutes = '';
  @state() private accessor _seconds = '';
  @state() private accessor _period: 'AM' | 'PM' = 'AM';
  @state() private accessor _isUnknown = false;
  @state() private accessor _isOpen = false;
  @state() private accessor _resolvedLocale = 'en';

  @query('#fp-input') private accessor _fpInput!: HTMLInputElement;
  @query('#hours-input') private accessor _hoursInput!: HTMLInputElement;
  @query('#minutes-input') private accessor _minutesInput!: HTMLInputElement;
  @query('#seconds-input')
  private accessor _secondsInput!: HTMLInputElement | null;
  @query('.timepicker-period-btn')
  private accessor _periodBtn!: HTMLButtonElement | null;
  @query('.timepicker-control') private accessor _controlEl!: HTMLElement;
  @query('.timepicker-clock-btn')
  private accessor _clockBtn!: HTMLButtonElement | null;
  @query('#floating-menu-container')
  private accessor _floatingMenuContainer!: HTMLDivElement;

  private _initialValue = '';

  private _floatingController = new FloatingController(this, {
    reference: () => this._controlEl,
    floating: () => this._fp?.calendarContainer ?? null,
    hoist: () => this.hoist,
    placement: () => 'bottom-start',
    offset: 4,
    matchWidth: 'none',
  });

  // ── i18n Resolution Helper & Dependency Inversion ──────────────────────────

  private _getLocaleRegistry(): ITimePickerLocaleRegistry {
    try {
      if (container.isRegistered(TIME_PICKER_LOCALE_REGISTRY_TOKEN)) {
        return container.resolve(TIME_PICKER_LOCALE_REGISTRY_TOKEN);
      }
      return container.resolve(ViTimePickerLocaleRegistry);
    } catch (_e) {
      return ViTimePickerLocaleRegistry.getInstance();
    }
  }

  /** Returns the localized string for a given key, resolving direct props > config > i18n > registry > default. */
  public getI18nText(key: keyof TimePickerConfig): string {
    if (key === 'hoursPlaceholder' && this.hoursPlaceholder) {
      return this.hoursPlaceholder;
    }
    if (key === 'minutesPlaceholder' && this.minutesPlaceholder) {
      return this.minutesPlaceholder;
    }
    if (key === 'secondsPlaceholder' && this.secondsPlaceholder) {
      return this.secondsPlaceholder;
    }
    const cfgVal = this.config?.[key];
    if (typeof cfgVal === 'string' && cfgVal.length > 0) {
      return cfgVal;
    }
    const i18nVal = this.i18n?.[key];
    if (typeof i18nVal === 'string' && i18nVal.length > 0) {
      return i18nVal;
    }
    const registry = this._getLocaleRegistry();
    const localized = registry.getLocale(this._resolvedLocale, this.format);
    return localized[key] ?? '';
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    if (this.config && !this._isProxy(this.config)) {
      this.config = this._createConfigProxy(this.config);
    }
    if (this.i18n && !this._isProxy(this.i18n)) {
      this.i18n = this._createConfigProxy(this.i18n);
    }
    this._resolvedLocale = resolveLocale(this.locale);
    if (!this.hasUpdated) {
      this._initialValue = this.value;
    }
    this._syncStateFromValue(this.value);

    if (this.hasUpdated && !this._fp) {
      this._setupFlatpickr();
    }
  }

  override willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    if (changed.has('config')) {
      if (this.config && !this._isProxy(this.config)) {
        this.config = this._createConfigProxy(this.config);
      }
    }
    if (changed.has('i18n')) {
      if (this.i18n && !this._isProxy(this.i18n)) {
        this.i18n = this._createConfigProxy(this.i18n);
      }
    }
  }

  override async firstUpdated(_changed: PropertyValues) {
    super.firstUpdated(_changed);
    this._resolvedLocale = resolveLocale(this.locale);
    await this._setupFlatpickr();
  }

  override async updated(changed: PropertyValues) {
    super.updated(changed);

    const valueChanged = changed.has('value');
    const formatChanged = changed.has('format');
    const stepChanged = changed.has('step');
    const secondsChanged = changed.has('showSeconds');
    const minMaxChanged = changed.has('min') || changed.has('max');
    const localeChanged = changed.has('locale');
    const configChanged = changed.has('config') || changed.has('i18n');

    if (localeChanged) {
      this._resolvedLocale = resolveLocale(this.locale);
      if (this._fp) {
        await this._setupFlatpickr();
      }
      this._syncValidity();
    }

    if (configChanged) {
      this._syncValidity();
    }

    if (valueChanged) {
      this._syncStateFromValue(this.value);
      this._internals.setFormValue(this.value);
      this._syncFlatpickrValue();
      this._syncValidity();
      const cb = this.renderRoot?.querySelector<HTMLInputElement>('#unknown-checkbox');
      if (cb) {
        cb.indeterminate = isPartialUnknownTime(this.value);
      }
    }

    if (formatChanged || stepChanged || secondsChanged) {
      if (this._fp) {
        await this._setupFlatpickr();
      }
    }

    if (minMaxChanged) {
      if (this._fp) {
        this._fp.set('minTime', this.min || undefined);
        this._fp.set('maxTime', this.max || undefined);
      }
      this._syncValidity();
    }
  }

  // ── FlatpickrMixin Contract ───────────────────────────────────────────────

  protected override _getHiddenInput(): HTMLInputElement | null {
    return this._fpInput ?? null;
  }

  private async _setupFlatpickr() {
    await this._getLocaleRegistry().resolveLocale(this._resolvedLocale);
    const fpLocale = await loadLocale(this._resolvedLocale);
    await this._initFlatpickr(this._buildFpConfig(fpLocale), 'time');
    if (this._fp?.calendarContainer) {
      this._fp.calendarContainer.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          this.close();
        }
      });
    }
    this._syncFlatpickrValue();
    this.requestUpdate();
  }

  private _buildFpConfig(fpLocale?: CustomLocale | null): Partial<Options> {
    return {
      enableTime: true,
      noCalendar: true,
      time_24hr: this.format === '24',
      minuteIncrement: this.step,
      enableSeconds: this.showSeconds,
      minTime: this.min || undefined,
      maxTime: this.max || undefined,
      ...(fpLocale ? { locale: fpLocale } : {}),
      dateFormat:
        this.format === '24'
          ? this.showSeconds
            ? 'H:i:S'
            : 'H:i'
          : this.showSeconds
            ? 'h:i:S K'
            : 'h:i K',
      disableMobile: true,
      clickOpens: false,
      static: false,
      ignoredFocusElements: [this],
      appendTo: this._floatingMenuContainer,
      plugins: [ViShadowDomPlugin()],
      onChange: (dates: Date[], dateStr: string) => {
        this._onFlatpickrChange(dates[0], dateStr);
      },
      onOpen: () => {
        this._isOpen = true;
        this._floatingController.start();
        this.requestUpdate();
        setTimeout(() => {
          const hourInput =
            this._fp?.calendarContainer?.querySelector<HTMLInputElement>(
              '.flatpickr-hour',
            );
          if (hourInput) {
            hourInput.tabIndex = 0;
            hourInput.focus();
            hourInput.select();
          }
        }, 50);
      },
      onClose: () => {
        this._isOpen = false;
        this._floatingController.stop();
        this._clockBtn?.focus();
        this.requestUpdate();
      },
    };
  }

  private _syncFlatpickrValue() {
    if (!this._fp) return;
    if (this._isUnknown || !this.value) {
      this._fp.clear(false);
      return;
    }
    const parsed = parseTime(this.value, this.format);
    if (!parsed || parsed.hours === null || parsed.minutes === null) {
      this._fp.clear(false);
      return;
    }
    const d = new Date();
    const h24 =
      parsed.period !== undefined
        ? to24Hour(parsed.hours, parsed.period)
        : parsed.hours;
    d.setHours(h24, parsed.minutes, parsed.seconds ?? 0, 0);
    this._fp.setDate(d, false);
  }

  // ── ValidityMixin Contract ────────────────────────────────────────────────

  private _customValidityText = '';

  override setCustomValidity(message: string): void {
    this._customValidityText = message;
    super.setCustomValidity(message);
  }

  override _syncValidity(): void {
    super._syncValidity();
    const flags = this._testValidity();
    const isValid = !Object.values(flags).some(Boolean);
    if (isValid) {
      this.validityMessage = '';
      if (this.status === 'invalid' && !this._customValidityText) {
        this.status = 'default';
      }
    }
  }

  protected override _testValidity(): Partial<ValidityStateFlags> {
    if (this._customValidityText) {
      this.validityMessage = this._customValidityText;
      return { customError: true };
    }

    if (this.required && !this.value) {
      const hasCustom = !!(this.config?.requiredMessage || this.i18n?.requiredMessage);
      if (hasCustom) {
        this.validityMessage = this.getI18nText('requiredMessage');
      } else {
        const temp = document.createElement('input');
        temp.required = true;
        this.validityMessage =
          temp.validationMessage || this.getI18nText('requiredMessage');
      }
      return { valueMissing: true };
    }

    if (this.value && !this._isUnknown) {
      if (!isPartialUnknownTime(this.value)) {
        const parsed = parseTime(this.value, this.format);
        if (!parsed) {
          this.validityMessage = this.getI18nText('invalidMessage');
          return { badInput: true };
        }

        if (this.min && compareTimes(this.value, this.min) < 0) {
          const hasCustom = !!(this.config?.minMessage || this.i18n?.minMessage);
          if (hasCustom) {
            this.validityMessage = this.getI18nText('minMessage').replace(
              '{min}',
              this.min,
            );
          } else {
            const temp = document.createElement('input');
            temp.type = 'time';
            temp.min = this.min;
            temp.value = '00:00';
            this.validityMessage =
              temp.validationMessage ||
              this.getI18nText('minMessage').replace('{min}', this.min);
          }
          return { rangeUnderflow: true };
        }

        if (this.max && compareTimes(this.value, this.max) > 0) {
          const hasCustom = !!(this.config?.maxMessage || this.i18n?.maxMessage);
          if (hasCustom) {
            this.validityMessage = this.getI18nText('maxMessage').replace(
              '{max}',
              this.max,
            );
          } else {
            const temp = document.createElement('input');
            temp.type = 'time';
            temp.max = this.max;
            temp.value = '23:59';
            this.validityMessage =
              temp.validationMessage ||
              this.getI18nText('maxMessage').replace('{max}', this.max);
          }
          return { rangeOverflow: true };
        }

        // Disabled times validation:
        if (parsed.hours !== null && parsed.hours !== undefined) {
          const h = parsed.hours;
          const m = parsed.minutes ?? 0;
          let isHourDisabled = false;
          if (typeof this.disabledHours === 'function') {
            isHourDisabled = this.disabledHours(h);
          } else if (Array.isArray(this.disabledHours)) {
            isHourDisabled = this.disabledHours.includes(h);
          }

          let isMinuteDisabled = false;
          if (typeof this.disabledMinutes === 'function') {
            isMinuteDisabled = this.disabledMinutes(m, h);
          } else if (Array.isArray(this.disabledMinutes)) {
            isMinuteDisabled = this.disabledMinutes.includes(m);
          }

          if (isHourDisabled || isMinuteDisabled) {
            this.validityMessage = this.getI18nText('disabledTimeMessage');
            return { customError: true };
          }
        }
      }
    }

    this.validityMessage = '';
    return {};
  }

  override formResetCallback() {
    super.formResetCallback();
    this.value = this._initialValue;
    this._syncStateFromValue(this.value);
    this._internals.setFormValue(this.value);
    this._syncFlatpickrValue();
    this._customValidityText = '';
    this.validityMessage = '';
    this.status = 'default';
  }

  // ── Public API ────────────────────────────────────────────────────────────

  override focus(options?: FocusOptions) {
    if (this._hoursInput) {
      this._hoursInput.focus(options);
    } else {
      super.focus(options);
    }
  }

  open(): void {
    if (this.disabled || this.readonly || this._isUnknown) return;
    this._fp?.open();
  }

  close(): void {
    this._isOpen = false;
    this._fp?.close();
    this._floatingController.stop();
    this._clockBtn?.focus();
    this.requestUpdate();
  }

  clear(): void {
    if (this.disabled || this.readonly) return;
    this._hours = '';
    this._minutes = '';
    this._seconds = '';
    this._period = 'AM';
    this._isUnknown = false;
    this.value = '';
    this._internals.setFormValue('');
    this._customValidityText = '';
    this.validityMessage = '';
    if (this.status === 'invalid') {
      this.status = 'default';
    }
    this._internals.setValidity({});
    this._fp?.clear(false);
    this._emitChange();
    this.dispatchEvent(
      new CustomEvent<void>('vialiq-clear', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  stepUp(segment: 'hours' | 'minutes' | 'seconds' = 'minutes'): void {
    if (this.disabled || this.readonly || this._isUnknown) return;
    this._stepSegment(segment, 'up');
  }

  stepDown(segment: 'hours' | 'minutes' | 'seconds' = 'minutes'): void {
    if (this.disabled || this.readonly || this._isUnknown) return;
    this._stepSegment(segment, 'down');
  }

  /** Sets the time picker to the current system time */
  setCurrentTime(): void {
    if (this.disabled || this.readonly) return;
    const now = new Date();
    const hours24 = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    if (this.format === '12') {
      const converted = to12Hour(hours24);
      this._hours = pad2(converted.hours);
      this._minutes = pad2(minutes);
      this._seconds = this.showSeconds ? pad2(seconds) : '';
      this._period = converted.period;
    } else {
      this._hours = pad2(hours24);
      this._minutes = pad2(minutes);
      this._seconds = this.showSeconds ? pad2(seconds) : '';
    }
    this._isUnknown = false;
    this._customValidityText = '';
    this.validityMessage = '';
    if (this.status === 'invalid') {
      this.status = 'default';
    }
    this._commitTime();
  }

  /** Alias for setCurrentTime */
  now(): void {
    this.setCurrentTime();
  }

  // ── Private Event & State Handlers ────────────────────────────────────────

  private _syncStateFromValue(val: string) {
    if (isUnknownTime(val)) {
      this._isUnknown = true;
      this._hours = '??';
      this._minutes = '??';
      this._seconds = this.showSeconds ? '??' : '';
      return;
    }

    if (isPartialUnknownTime(val)) {
      this._isUnknown = false;
      const parsed = parseTime(val, this.format);
      if (parsed) {
        this._hours =
          parsed.rawHours ??
          (parsed.hours !== null && parsed.hours !== undefined ? pad2(parsed.hours) : '??');
        this._minutes =
          parsed.rawMinutes ??
          (parsed.minutes !== null && parsed.minutes !== undefined ? pad2(parsed.minutes) : '??');
        this._seconds = this.showSeconds
          ? (parsed.rawSeconds ??
              (parsed.seconds !== null && parsed.seconds !== undefined ? pad2(parsed.seconds) : '??'))
          : '';
        if (this.format === '12' && parsed.period) {
          this._period = parsed.period;
        }
        return;
      }
    }

    this._isUnknown = false;
    const parsed = parseTime(val, this.format);
    if (!parsed) {
      this._hours = '';
      this._minutes = '';
      this._seconds = '';
      this._period = 'AM';
      return;
    }

    this._hours =
      parsed.hours !== null && parsed.hours !== undefined ? pad2(parsed.hours) : '';
    this._minutes =
      parsed.minutes !== null && parsed.minutes !== undefined ? pad2(parsed.minutes) : '';
    this._seconds =
      parsed.seconds !== null && parsed.seconds !== undefined ? pad2(parsed.seconds) : '';
    if (this.format === '12') {
      this._period = parsed.period || 'AM';
    }
  }

  private _onFlatpickrChange(date: Date | undefined, _dateStr: string) {
    if (!date) return;
    const hours24 = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (this.format === '12') {
      const converted = to12Hour(hours24);
      this._hours = pad2(converted.hours);
      this._minutes = pad2(minutes);
      this._seconds = this.showSeconds ? pad2(seconds) : '';
      this._period = converted.period;
    } else {
      this._hours = pad2(hours24);
      this._minutes = pad2(minutes);
      this._seconds = this.showSeconds ? pad2(seconds) : '';
    }

    this._isUnknown = false;
    this._customValidityText = '';
    this.validityMessage = '';
    if (this.status === 'invalid') {
      this.status = 'default';
    }

    this._commitTime();
  }

  private _handleUnknownToggle(e: Event) {
    if (this.disabled || this.readonly) return;
    const target = e.target as HTMLInputElement;
    this._isUnknown = target.checked;

    if (this._isUnknown) {
      const unknownStr = this.showSeconds ? '??:??:??' : '??:??';
      this._hours = '??';
      this._minutes = '??';
      this._seconds = this.showSeconds ? '??' : '';
      this.value = unknownStr;
      this._internals.setFormValue(unknownStr);
      this._fp?.clear(false);
      this._emitChange();
    } else {
      this.clear();
    }
  }

  private _togglePeriod() {
    if (this.disabled || this.readonly || this._isUnknown) return;
    this._period = this._period === 'AM' ? 'PM' : 'AM';
    this._commitTime();
  }

  private _focusPrimary() {
    if (this.disabled || this._isUnknown) return;
    this._hoursInput?.focus();
    this._hoursInput?.select();
  }

  private _handleControlClick(e: MouseEvent) {
    if (this.disabled || this._isUnknown) return;
    const target = e.target as HTMLElement;
    if (
      target === this._controlEl ||
      target.classList.contains('timepicker-inputs') ||
      target.classList.contains('timepicker-separator')
    ) {
      this._focusPrimary();
    }
  }

  private _handlePaste(e: ClipboardEvent) {
    if (this.disabled || this.readonly) return;
    const text = e.clipboardData?.getData('text');
    if (!text) return;

    const parsed = parsePastedTime(text, this.format);
    if (!parsed) return;

    e.preventDefault();
    e.stopPropagation();

    if (isUnknownTime(text)) {
      this._isUnknown = true;
      this._hours = '??';
      this._minutes = '??';
      this._seconds = this.showSeconds ? '??' : '';
    } else {
      this._isUnknown = false;
      this._hours =
        parsed.rawHours ??
        (parsed.hours !== null && parsed.hours !== undefined ? pad2(parsed.hours) : '??');
      this._minutes =
        parsed.rawMinutes ??
        (parsed.minutes !== null && parsed.minutes !== undefined ? pad2(parsed.minutes) : '??');
      this._seconds = this.showSeconds
        ? (parsed.rawSeconds ??
            (parsed.seconds !== null && parsed.seconds !== undefined ? pad2(parsed.seconds) : '00'))
        : '';
      if (this.format === '12' && parsed.period) {
        this._period = parsed.period;
      }
    }

    this._commitTime();
  }

  private _handleSegmentFocus(e: FocusEvent) {
    const input = e.target as HTMLInputElement;
    setTimeout(() => {
      if (document.activeElement === input) {
        input.select();
      }
    }, 0);
  }

  private _handleHoursBlur() {
    if (this._hours && this._hours !== '??') {
      const minHour = this.format === '12' ? 1 : 0;
      const val = parseInt(this._hours, 10);
      this._hours = pad2(Math.max(minHour, val));
      if (this._hoursInput) {
        this._hoursInput.value = this._hours;
      }
      this._commitTime();
    }
  }

  private _handleMinutesBlur() {
    if (this._minutes && this._minutes !== '??') {
      const val = parseInt(this._minutes, 10);
      this._minutes = pad2(val);
      if (this._minutesInput) {
        this._minutesInput.value = this._minutes;
      }
      this._commitTime();
    }
  }

  private _handleSecondsBlur() {
    if (this._seconds && this._seconds !== '??') {
      const val = parseInt(this._seconds, 10);
      this._seconds = pad2(val);
      if (this._secondsInput) {
        this._secondsInput.value = this._seconds;
      }
      this._commitTime();
    }
  }

  private _handleControlFocusout(e: FocusEvent) {
    const relatedTarget = e.relatedTarget as Node | null;
    if (relatedTarget && this._controlEl?.contains(relatedTarget)) {
      return;
    }
    // Entire control lost focus:
    if (this._hours && !this._minutes) {
      this._minutes = '00';
      if (this._minutesInput) this._minutesInput.value = '00';
      if (this.showSeconds && !this._seconds) {
        this._seconds = '00';
        if (this._secondsInput) this._secondsInput.value = '00';
      }
      this._commitTime();
    } else if (!this._hours && this._minutes) {
      this._hours = this.format === '12' ? '12' : '00';
      if (this._hoursInput) this._hoursInput.value = this._hours;
      if (this.showSeconds && !this._seconds) {
        this._seconds = '00';
        if (this._secondsInput) this._secondsInput.value = '00';
      }
      this._commitTime();
    }
  }

  private _handleHoursInput(e: Event) {
    const input = e.target as HTMLInputElement;

    if (this.allowUnknown && input.value.includes('?')) {
      this._hours = '??';
      input.value = '??';
      if (this._minutes === '??') {
        this._isUnknown = true;
      }
      this._commitTime();
      this._minutesInput?.focus();
      this._minutesInput?.select();
      return;
    }

    let raw = input.value.replace(/\D/g, '');

    if (!raw) {
      this._hours = '';
      input.value = '';
      if (!this._minutes) {
        this._commitTime();
      }
      return;
    }

    // When typing a new digit over existing 2 digits without selection, start fresh with the new digit
    if (raw.length > 2) {
      raw = raw.slice(-1);
    }

    let val = parseInt(raw, 10);
    const maxHour = this.format === '12' ? 12 : 23;
    const minHour = this.format === '12' ? 1 : 0;

    if (val > maxHour) {
      val = maxHour;
      raw = String(val);
    }

    this._hours = raw;
    input.value = raw;

    // Auto-advance logic:
    // In 24h mode: if 2 digits (e.g. "14", "08") OR 1 digit > 2 (e.g. "3" -> "03", "9" -> "09")
    // In 12h mode: if 2 digits (e.g. "12", "08") OR 1 digit > 1 (e.g. "2" -> "02", "9" -> "09")
    const shouldAdvance =
      raw.length >= 2 ||
      (this.format === '24' && val > 2) ||
      (this.format === '12' && val > 1);

    if (shouldAdvance) {
      this._hours = pad2(Math.max(minHour, val));
      input.value = this._hours;
      this._commitTime();
      this._minutesInput?.focus();
      this._minutesInput?.select();
    }
  }

  private _handleMinutesInput(e: Event) {
    const input = e.target as HTMLInputElement;

    if (this.allowUnknown && input.value.includes('?')) {
      this._minutes = '??';
      input.value = '??';
      if (this._hours === '??') {
        this._isUnknown = true;
      }
      this._commitTime();
      if (this.showSeconds && this._secondsInput) {
        this._secondsInput.focus();
        this._secondsInput.select();
      } else if (this.format === '12' && this._periodBtn) {
        this._periodBtn.focus();
      }
      return;
    }

    let raw = input.value.replace(/\D/g, '');

    if (!raw) {
      this._minutes = '';
      input.value = '';
      if (!this._hours) {
        this._commitTime();
      }
      return;
    }

    if (raw.length > 2) {
      raw = raw.slice(-1);
    }

    let val = parseInt(raw, 10);
    if (val > 59) {
      val = 59;
      raw = String(val);
    }

    this._minutes = raw;
    input.value = raw;

    const shouldAdvance = raw.length >= 2 || val > 5;

    if (shouldAdvance) {
      this._minutes = pad2(val);
      input.value = this._minutes;
      this._commitTime();
      if (this.showSeconds && this._secondsInput) {
        this._secondsInput.focus();
        this._secondsInput.select();
      } else if (this.format === '12' && this._periodBtn) {
        this._periodBtn.focus();
      }
    }
  }

  private _handleSecondsInput(e: Event) {
    const input = e.target as HTMLInputElement;

    if (this.allowUnknown && input.value.includes('?')) {
      this._seconds = '??';
      input.value = '??';
      this._commitTime();
      return;
    }

    let raw = input.value.replace(/\D/g, '');

    if (!raw) {
      this._seconds = '';
      input.value = '';
      this._commitTime();
      return;
    }

    if (raw.length > 2) {
      raw = raw.slice(-1);
    }

    let val = parseInt(raw, 10);
    if (val > 59) {
      val = 59;
      raw = String(val);
    }

    this._seconds = raw;
    input.value = raw;

    const shouldAdvance = raw.length >= 2 || val > 5;
    if (shouldAdvance) {
      this._seconds = pad2(val);
      input.value = this._seconds;
      this._commitTime();
      if (this.format === '12' && this._periodBtn) {
        this._periodBtn.focus();
      }
    }
  }

  private _handleHoursKeydown(e: KeyboardEvent) {
    if (this.disabled || this.readonly) return;

    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      this.open();
      return;
    }
    if (e.key === 'Escape' && this._isOpen) {
      e.preventDefault();
      this.close();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._stepSegment('hours', 'up', 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._stepSegment('hours', 'down', 1);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      this._stepSegment('hours', 'up', 5);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      this._stepSegment('hours', 'down', 5);
    } else if (e.key === 'Home') {
      e.preventDefault();
      this._hours = pad2(this.format === '12' ? 1 : 0);
      this._commitTime();
    } else if (e.key === 'End') {
      e.preventDefault();
      this._hours = pad2(this.format === '12' ? 12 : 23);
      this._commitTime();
    } else if (e.key === 'ArrowRight' || e.key === ':' || e.key === 'Enter') {
      e.preventDefault();
      this._minutesInput?.focus();
      this._minutesInput?.select();
    } else if (this.format === '12') {
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        this._period = 'AM';
        this._commitTime();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        this._period = 'PM';
        this._commitTime();
      }
    }
  }

  private _handleMinutesKeydown(e: KeyboardEvent) {
    if (this.disabled || this.readonly) return;

    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      this.open();
      return;
    }
    if (e.key === 'Escape' && this._isOpen) {
      e.preventDefault();
      this.close();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._stepSegment('minutes', 'up', this.step);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._stepSegment('minutes', 'down', this.step);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      this._stepSegment('minutes', 'up', 15);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      this._stepSegment('minutes', 'down', 15);
    } else if (e.key === 'Home') {
      e.preventDefault();
      this._minutes = '00';
      this._commitTime();
    } else if (e.key === 'End') {
      e.preventDefault();
      this._minutes = '59';
      this._commitTime();
    } else if (e.key === 'ArrowLeft' || (e.key === 'Backspace' && !this._minutes)) {
      e.preventDefault();
      this._hoursInput?.focus();
      this._hoursInput?.select();
    } else if (e.key === 'ArrowRight' || e.key === ':' || e.key === 'Enter') {
      e.preventDefault();
      if (this.showSeconds && this._secondsInput) {
        this._secondsInput.focus();
        this._secondsInput.select();
      } else if (this.format === '12' && this._periodBtn) {
        this._periodBtn.focus();
      }
    } else if (this.format === '12') {
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        this._period = 'AM';
        this._commitTime();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        this._period = 'PM';
        this._commitTime();
      }
    }
  }

  private _handleSecondsKeydown(e: KeyboardEvent) {
    if (this.disabled || this.readonly) return;

    if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      this.open();
      return;
    }
    if (e.key === 'Escape' && this._isOpen) {
      e.preventDefault();
      this.close();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._stepSegment('seconds', 'up', 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._stepSegment('seconds', 'down', 1);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      this._stepSegment('seconds', 'up', 15);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      this._stepSegment('seconds', 'down', 15);
    } else if (e.key === 'Home') {
      e.preventDefault();
      this._seconds = '00';
      this._commitTime();
    } else if (e.key === 'End') {
      e.preventDefault();
      this._seconds = '59';
      this._commitTime();
    } else if (e.key === 'ArrowLeft' || (e.key === 'Backspace' && !this._seconds)) {
      e.preventDefault();
      this._minutesInput?.focus();
      this._minutesInput?.select();
    } else if (e.key === 'ArrowRight' && this.format === '12' && this._periodBtn) {
      e.preventDefault();
      this._periodBtn.focus();
    } else if (this.format === '12') {
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        this._period = 'AM';
        this._commitTime();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        this._period = 'PM';
        this._commitTime();
      }
    }
  }

  private _handlePeriodKeydown(e: KeyboardEvent) {
    if (this.disabled || this.readonly || this._isUnknown) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (this.showSeconds && this._secondsInput) {
        this._secondsInput.focus();
        this._secondsInput.select();
      } else {
        this._minutesInput?.focus();
        this._minutesInput?.select();
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      this._togglePeriod();
    } else if (e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      this._period = 'AM';
      this._commitTime();
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      this._period = 'PM';
      this._commitTime();
    }
  }

  private _handlePopupKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.close();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = Array.from(
        this._floatingMenuContainer.querySelectorAll<HTMLElement>(
          'input:not([disabled]), button:not([disabled]), [tabindex="0"]',
        ),
      ).filter(
        (el) =>
          el.offsetParent !== null ||
          getComputedStyle(el).display !== 'none',
      );
      if (focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active =
          this.shadowRoot?.activeElement ||
          this._fp?.calendarContainer?.querySelector(':focus') ||
          document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  private _stepSegment(
    segment: 'hours' | 'minutes' | 'seconds',
    direction: 'up' | 'down',
    delta?: number,
  ) {
    if (segment === 'hours') {
      const step = delta ?? this.hourStep;
      const minH = this.format === '12' ? 1 : 0;
      const maxH = this.format === '12' ? 12 : 23;
      const current = parseInt(this._hours || (this.format === '12' ? '12' : '0'), 10);
      const stepped = stepSegment(current, step, minH, maxH, direction);
      this._hours = pad2(stepped);
      if (!this._minutes) this._minutes = '00';
      if (this.showSeconds && !this._seconds) this._seconds = '00';
    } else if (segment === 'minutes') {
      const step = delta ?? this.step;
      const current = parseInt(this._minutes || '0', 10);
      const stepped = stepSegment(current, step, 0, 59, direction);
      this._minutes = pad2(stepped);
      if (!this._hours) this._hours = this.format === '12' ? '12' : '00';
      if (this.showSeconds && !this._seconds) this._seconds = '00';
    } else if (segment === 'seconds') {
      const step = delta ?? this.secondStep;
      const current = parseInt(this._seconds || '0', 10);
      const stepped = stepSegment(current, step, 0, 59, direction);
      this._seconds = pad2(stepped);
      if (!this._hours) this._hours = this.format === '12' ? '12' : '00';
      if (!this._minutes) this._minutes = '00';
    }

    this._commitTime();
  }

  private _commitTime() {
    if (this._isUnknown) return;

    if (!this._hours && !this._minutes && (!this.showSeconds || !this._seconds)) {
      this.value = '';
      this._internals.setFormValue('');
      this._syncFlatpickrValue();
      this._emitChange();
      return;
    }

    const isPartial =
      this._hours === '??' || this._minutes === '??' || this._seconds === '??';
    if (isPartial) {
      const hStr = this._hours || '??';
      const mStr = this._minutes || '??';
      const sStr = this.showSeconds ? this._seconds || '??' : '';
      let formatted = `${hStr}:${mStr}`;
      if (this.showSeconds) formatted = `${formatted}:${sStr}`;
      if (this.format === '12') formatted = `${formatted} ${this._period}`;
      this.value = formatted;
      this._internals.setFormValue(this.value);
      this._emitChange();
      return;
    }

    // Do NOT commit incomplete partial strings like "14:" or ":30" during typing
    if (!this._hours || !this._minutes || (this.showSeconds && !this._seconds)) {
      return;
    }

    const h = parseInt(this._hours, 10);
    const m = parseInt(this._minutes, 10);
    const s = this.showSeconds ? parseInt(this._seconds, 10) : undefined;

    const components: TimeComponents = {
      hours: h,
      minutes: m,
      seconds: s,
      rawHours: this._hours,
      rawMinutes: this._minutes,
      rawSeconds: this._seconds,
      ...(this.format === '12' ? { period: this._period } : {}),
    };

    const formatted = formatTime(components, this.format, this.showSeconds);
    this.value = formatted;
    this._internals.setFormValue(this.value);
    this._syncFlatpickrValue();
    this._emitChange();
  }

  private _emitChange() {
    let components: TimeComponents | null = null;
    let isoValue: string | null = null;
    const isPartial = isPartialUnknownTime(this.value);

    if (!this._isUnknown && this.value) {
      components = parseTime(this.value, this.format);
      isoValue = toIsoTime(components, this.showSeconds, this.timezone);
    } else if (this._isUnknown) {
      isoValue = this.showSeconds ? '??:??:??' : '??:??';
    }

    const detail: TimePickerChangeDetail = {
      value: this.value || null,
      isoValue,
      hours: components ? components.hours : null,
      minutes: components ? components.minutes : null,
      seconds: components?.seconds ?? null,
      period: components?.period ?? null,
      isUnknown: this._isUnknown,
      isPartialUnknown: isPartial,
      timezone: this.timezone || undefined,
      formattedValue: this.value,
    };

    this.dispatchEvent(
      new CustomEvent<TimePickerChangeDetail>(VI_TIME_PICKER_CHANGE, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );

    // Legacy alias event
    this.dispatchEvent(
      new CustomEvent<TimePickerChangeDetail>('vialiq-change', {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  protected override render() {
    const hoursNumeric =
      this._hours && this._hours !== '??' ? parseInt(this._hours, 10) : undefined;
    const minutesNumeric =
      this._minutes && this._minutes !== '??'
        ? parseInt(this._minutes, 10)
        : undefined;
    const secondsNumeric =
      this._seconds && this._seconds !== '??'
        ? parseInt(this._seconds, 10)
        : undefined;

    const describedBy =
      this.status === 'invalid' && this.validityMessage
        ? 'validation-msg'
        : this.helperText
          ? 'helper-text'
          : nothing;

    const hoursPlaceholder = this.getI18nText('hoursPlaceholder');
    const minutesPlaceholder = this.getI18nText('minutesPlaceholder');
    const secondsPlaceholder = this.getI18nText('secondsPlaceholder');

    const hoursAriaLabel = this.getI18nText('hoursAriaLabel');
    const minutesAriaLabel = this.getI18nText('minutesAriaLabel');
    const secondsAriaLabel = this.getI18nText('secondsAriaLabel');

    const hoursUnit = this.getI18nText('hoursUnit');
    const minutesUnit = this.getI18nText('minutesUnit');
    const secondsUnit = this.getI18nText('secondsUnit');
    const emptyValueText = this.getI18nText('emptyValueText');
    const unknownValueText = this.getI18nText('unknownValueText');

    const hoursValueText =
      hoursNumeric !== undefined
        ? `${hoursNumeric} ${hoursUnit}`
        : this._hours === '??'
          ? `${unknownValueText} ${hoursUnit}`
          : emptyValueText;

    const minutesValueText =
      minutesNumeric !== undefined
        ? `${minutesNumeric} ${minutesUnit}`
        : this._minutes === '??'
          ? `${unknownValueText} ${minutesUnit}`
          : emptyValueText;

    const secondsValueText =
      secondsNumeric !== undefined
        ? `${secondsNumeric} ${secondsUnit}`
        : this._seconds === '??'
          ? `${unknownValueText} ${secondsUnit}`
          : emptyValueText;

    const groupAriaLabel = this.label || this.getI18nText('groupAriaLabel');
    const clockAriaLabel = this.getI18nText('clockAriaLabel');
    const clearAriaLabel = this.getI18nText('clearAriaLabel');
    const nowLabel = this.getI18nText('nowLabel');
    const nowAriaLabel = this.getI18nText('nowAriaLabel');
    const timezoneAriaLabel = this.getI18nText('timezoneAriaLabel');
    const periodAriaLabel = this.getI18nText('periodAriaLabel').replace(
      '{period}',
      this._period,
    );
    const unknownLabel = this.getI18nText('unknownLabel');
    const popupAriaLabel = this.getI18nText('popupAriaLabel');

    return html`
      ${this.label
        ? html`<label
            id="timepicker-label"
            for="hours-input"
            class="timepicker-label"
            part="label"
            @click="${this._focusPrimary}"
            >${this.label}</label
          >`
        : nothing}
      <slot name="label"></slot>

      <!-- Hidden input flatpickr binds to -->
      <input
        type="hidden"
        id="fp-input"
        tabindex="-1"
        aria-hidden="true"
        name="${this.name}"
        .value="${this.value}"
      />

      <div
        part="control"
        class="timepicker-control"
        role="group"
        aria-labelledby="${this.label ? 'timepicker-label' : nothing}"
        aria-label="${this.label || groupAriaLabel}"
        @click="${this._handleControlClick}"
        @focusout="${this._handleControlFocusout}"
        @paste="${this._handlePaste}"
      >
        <div class="timepicker-inputs" role="presentation" @paste="${this._handlePaste}">
          <input
            id="hours-input"
            part="hours-input"
            class="timepicker-segment"
            type="text"
            inputmode="numeric"
            role="spinbutton"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder="${hoursPlaceholder}"
            aria-label="${hoursAriaLabel}"
            aria-valuenow="${hoursNumeric ?? nothing}"
            aria-valuemin="${this.format === '12' ? 1 : 0}"
            aria-valuemax="${this.format === '12' ? 12 : 23}"
            aria-valuetext="${hoursValueText}"
            aria-required="${this.required}"
            aria-invalid="${this.status === 'invalid'}"
            aria-describedby="${describedBy}"
            ?disabled="${this.disabled || this._isUnknown}"
            ?readonly="${this.readonly}"
            .value="${this._hours}"
            @focus="${this._handleSegmentFocus}"
            @blur="${this._handleHoursBlur}"
            @input="${this._handleHoursInput}"
            @keydown="${this._handleHoursKeydown}"
            @paste="${this._handlePaste}"
          />
          <span part="separator" class="timepicker-separator" aria-hidden="true"
            >:</span
          >
          <input
            id="minutes-input"
            part="minutes-input"
            class="timepicker-segment"
            type="text"
            inputmode="numeric"
            role="spinbutton"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder="${minutesPlaceholder}"
            aria-label="${minutesAriaLabel}"
            aria-valuenow="${minutesNumeric ?? nothing}"
            aria-valuemin="0"
            aria-valuemax="59"
            aria-valuetext="${minutesValueText}"
            aria-required="${this.required}"
            aria-invalid="${this.status === 'invalid'}"
            aria-describedby="${describedBy}"
            ?disabled="${this.disabled || this._isUnknown}"
            ?readonly="${this.readonly}"
            .value="${this._minutes}"
            @focus="${this._handleSegmentFocus}"
            @blur="${this._handleMinutesBlur}"
            @input="${this._handleMinutesInput}"
            @keydown="${this._handleMinutesKeydown}"
            @paste="${this._handlePaste}"
          />
          ${this.showSeconds
            ? html`
                <span
                  part="separator"
                  class="timepicker-separator"
                  aria-hidden="true"
                  >:</span
                >
                <input
                  id="seconds-input"
                  part="seconds-input"
                  class="timepicker-segment"
                  type="text"
                  inputmode="numeric"
                  role="spinbutton"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  placeholder="${secondsPlaceholder}"
                  aria-label="${secondsAriaLabel}"
                  aria-valuenow="${secondsNumeric ?? nothing}"
                  aria-valuemin="0"
                  aria-valuemax="59"
                  aria-valuetext="${secondsValueText}"
                  aria-required="${this.required}"
                  aria-invalid="${this.status === 'invalid'}"
                  aria-describedby="${describedBy}"
                  ?disabled="${this.disabled || this._isUnknown}"
                  ?readonly="${this.readonly}"
                  .value="${this._seconds}"
                  @focus="${this._handleSegmentFocus}"
                  @blur="${this._handleSecondsBlur}"
                  @input="${this._handleSecondsInput}"
                  @keydown="${this._handleSecondsKeydown}"
                  @paste="${this._handlePaste}"
                />
              `
            : nothing}
          ${this.timezone
            ? html`
                <span
                  part="timezone"
                  class="timepicker-timezone"
                  aria-label="${timezoneAriaLabel}: ${this.timezone}"
                  title="${this.timezone}"
                  >${this.timezone}</span
                >
              `
            : nothing}
        </div>

        ${this.format === '12'
          ? html`
              <button
                type="button"
                role="button"
                part="period-btn"
                class="timepicker-period-btn"
                aria-label="${periodAriaLabel}"
                aria-pressed="${this._period === 'PM'}"
                ?disabled="${this.disabled || this.readonly || this._isUnknown}"
                @click="${this._togglePeriod}"
                @keydown="${this._handlePeriodKeydown}"
              >
                ${this._period}
              </button>
            `
          : nothing}

        <div class="timepicker-actions">
          ${this.showNow && !this.disabled && !this.readonly
            ? html`
                <button
                  type="button"
                  role="button"
                  part="now-btn"
                  class="timepicker-now-btn"
                  aria-label="${nowAriaLabel}"
                  title="${nowLabel}"
                  @click="${this.setCurrentTime}"
                >
                  ${nowLabel}
                </button>
              `
            : nothing}

          ${this.clearable && this.value && !this.disabled && !this.readonly
            ? html`
                <button
                  type="button"
                  role="button"
                  part="clear-btn"
                  class="timepicker-clear-btn"
                  aria-label="${clearAriaLabel}"
                  @click="${this.clear}"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              `
            : nothing}

          <button
            type="button"
            role="button"
            part="clock-btn"
            class="timepicker-clock-btn"
            aria-label="${clockAriaLabel}"
            aria-haspopup="dialog"
            aria-expanded="${this._isOpen}"
            ?disabled="${this.disabled || this.readonly || this._isUnknown}"
            @click="${() => (this._isOpen ? this.close() : this.open())}"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div
        id="floating-menu-container"
        part="popup"
        role="dialog"
        aria-modal="false"
        aria-label="${popupAriaLabel}"
        @keydown="${this._handlePopupKeydown}"
      ></div>

      ${this.allowUnknown
        ? html`
            <div part="unknown-wrapper" class="timepicker-unknown-wrapper">
              <input
                id="unknown-checkbox"
                part="unknown-checkbox"
                type="checkbox"
                aria-label="${unknownLabel}"
                .checked="${this._isUnknown}"
                .indeterminate="${isPartialUnknownTime(this.value)}"
                ?disabled="${this.disabled || this.readonly}"
                @change="${this._handleUnknownToggle}"
              />
              <label for="unknown-checkbox">${unknownLabel}</label>
            </div>
          `
        : nothing}
      ${this.status === 'invalid' && this.validityMessage
        ? html`<span
            id="validation-msg"
            part="validation"
            class="validity-msg"
            role="alert"
            aria-live="polite"
            >${this.validityMessage}</span
          >`
        : nothing}

      ${this.helperText
        ? html`<span id="helper-text" class="timepicker-helper" part="helper"
            >${this.helperText}</span
          >`
        : nothing}
      <slot name="helper"></slot>
    `;
  }

  static override styles = css`
    ${unsafeCSS(timePickerStyles)}
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-time-picker': ViTimePicker;
  }
}
