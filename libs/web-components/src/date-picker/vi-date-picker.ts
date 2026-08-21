import { html, css, unsafeCSS, type PropertyValues } from 'lit';
import {
  customElement,
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import type { Instance } from 'flatpickr/dist/types/instance';
import { ViElement } from '../base/vi-element.js';
import { FlatpickrMixin } from '../base/flatpickr-mixin.js';
import {
  resolveLocale,
  resolveTimeZone,
  formatDisplay,
  getTodayLabel,
} from './i18n.js';
import datePickerStyles from './vi-date-picker.scss?inline';
import { getISOWeek } from './iso-week.js';
import { ViMonthYearPlugin } from './plugins/vi-month-year-plugin.js';
import { ViShadowDomPlugin } from './plugins/vi-shadow-dom-plugin.js';
import { ViRangePlugin } from './plugins/vi-range-plugin.js';
import { isViPlugin } from './plugin-utils.js';
import type { ViDatePickerInput } from './vi-date-picker-input.js';
import type {
  DatePickerMode,
  DatePickerChangeDetail,
  DatePickerPluginInput,
  DateComponents,
  ControlStatus,
} from './types.js';

/** Emitted when the user selects a date. Detail: DatePickerChangeDetail. */
export const VIALIQ_CHANGE = 'vialiq-change';

/** Emitted on every segment keystroke (future partial input). */
export const VIALIQ_INPUT = 'vialiq-input';

/**
 * A form-associated date-picker built on flatpickr.
 *
 * @element vi-date-picker
 *
 * @fires {CustomEvent<DatePickerChangeDetail>} vialiq-change  - Date selection changed.
 *
 * @attr {string}          value            - ISO date string (read/write).
 * @attr {string}          name             - Form field name.
 * @attr {DatePickerMode}  mode             - 'date' | 'range' | 'month' | 'month-year' | 'year' | 'week'
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
@customElement('vi-date-picker')
export class ViDatePicker extends FlatpickrMixin(ViElement) {
  static readonly formAssociated = true;
  private _internals!: ElementInternals;

  // ── Lit TC39 stage-3 accessors ──────────────────────────────────────────

  @property({ type: String, reflect: true }) accessor value = '';
  @property({ type: String }) accessor name = '';
  @property({ type: String, reflect: true }) accessor mode: DatePickerMode =
    'date';
  @property({ type: Boolean, reflect: true }) accessor flat = false;
  @property({ type: String }) accessor min = '';
  @property({ type: String }) accessor max = '';
  @property({ type: String }) accessor locale: string | null = null;
  @property({ type: Boolean, reflect: true }) accessor disabled = false;
  @property({ type: Boolean, reflect: true }) accessor required = false;
  @property({ type: Boolean, attribute: 'week-numbers' }) accessor weekNumbers =
    false;
  @property({ type: String, reflect: true }) accessor status: ControlStatus =
    'default';
  @property({ type: String, attribute: 'validity-message' })
  accessor validityMessage = '';
  @property({ type: String, attribute: 'today-label' }) accessor todayLabel:
    | string
    | undefined = undefined;

  /** Consumer plugins — set programmatically, not via attribute. */
  plugins: DatePickerPluginInput[] = [];

  // ── Internal state ────────────────────────────────────────────────────────

  @state() private accessor _resolvedLocale = 'en';
  @state() private accessor _displayValue = '';

  @query('#fp-input') private accessor _fpInput!: HTMLInputElement;
  @queryAssignedElements({ selector: 'vi-date-picker-input' })
  private accessor _inputs!: ViDatePickerInput[];
  /** Light DOM container for flatpickr inline mode to inherit global CSS */
  private _inlineContainer?: HTMLDivElement;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  override connectedCallback() {
    super.connectedCallback();
    this._resolvedLocale = resolveLocale(this.locale);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this._inlineContainer) {
      this._inlineContainer.remove();
      this._inlineContainer = undefined;
    }
  }

  // ── Form lifecycle ────────────────────────────────────────────────────────

  formResetCallback() {
    this.clear();
  }

  override async firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    // Wait for all projected inputs to finish rendering so their internal `inputElement` is available
    if (this._inputs && this._inputs.length > 0) {
      await Promise.all(this._inputs.map((input) => input.updateComplete));
    }

    if (this.flat && !this._inlineContainer) {
      this._inlineContainer = document.createElement('div');
      this._inlineContainer.slot = 'inline-container';
      // Fallback part for styling if needed, though light DOM CSS usually styles it directly
      this._inlineContainer.part.add('inline-calendar');
      this.appendChild(this._inlineContainer);
    }

    await this._initFlatpickr(
      this._buildFpConfig(),
      this.mode,
      this._resolvedLocale,
    );
  }

  override async updated(changed: PropertyValues) {
    super.updated(changed);

    const localeChanged = changed.has('locale');
    const modeChanged = changed.has('mode');
    const minMaxChanged = changed.has('min') || changed.has('max');

    if (localeChanged) {
      this._resolvedLocale = resolveLocale(this.locale);
    }

    // Re-init when mode or locale change (flatpickr locale is set at init time only)
    if ((localeChanged || modeChanged) && this._fp) {
      await this._initFlatpickr(
        this._buildFpConfig(),
        this.mode,
        this._resolvedLocale,
      );
      return;
    }

    if (minMaxChanged && this._fp) {
      if (this.min) this._fp.set('minDate', this.min);
      if (this.max) this._fp.set('maxDate', this.max);
    }

    if (changed.has('value') && this._fp) {
      const fpDates = this._fp.selectedDates;
      const start = fpDates[0] ?? null;
      const end = fpDates[1] ?? null;
      if (this.value !== this._buildIsoValue(start, end)) {
        this._fp.setDate(this.value, false);
        this._syncInputValues(this._fp.selectedDates);
      }
    }

    if (changed.has('disabled')) {
      if (this._inputs) {
        this._inputs.forEach((input) => {
          input.disabled = this.disabled;
        });
      }
      if (this._fp) {
        this._fp.set('clickOpens', !this.disabled);
      }
    }
  }

  // ── FlatpickrMixin contract ───────────────────────────────────────────────

  protected override _getHiddenInput(): HTMLInputElement | null {
    return this._fpInput ?? null;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  override focus(options?: FocusOptions) {
    if (this._inputs && this._inputs.length > 0) {
      this._inputs[0].focus(options);
    } else if (this._fpInput) {
      this._fpInput.focus(options);
    } else {
      super.focus(options);
    }
  }

  /** Opens the calendar popup. No-op when flat=true. */
  openCalendar(): void {
    this._fp?.open();
  }

  /** Closes the calendar popup. No-op when flat=true. */
  closeCalendar(): void {
    this._fp?.close();
  }

  /** Clears the selected date(s). */
  clear(): void {
    this._fp?.clear();
    this.value = '';
    this._internals.setFormValue('');
    this._inputs.forEach((input) => {
      input.value = '';
    });
    this._emitChange([], '');
  }

  // ── Config builder ────────────────────────────────────────────────────────

  private _buildFpConfig() {
    // Check if consumers already provided these plugins
    const hasMonthYear = this.plugins.some(
      (p) => isViPlugin(p) && p.id === 'ViMonthYearPlugin',
    );
    const hasShadowDomFix = this.plugins.some(
      (p) => isViPlugin(p) && p.id === 'ViShadowDomPlugin',
    );

    // Construct internal plugins
    const internalPlugins = [];
    if (!hasMonthYear) {
      // Force hideDays if mode is exactly 'month'
      internalPlugins.push(
        ViMonthYearPlugin({ hideDays: this.mode === 'month' }),
      );
    }
    if (!hasShadowDomFix) {
      internalPlugins.push(ViShadowDomPlugin());
    }

    if (this.mode === 'range') {
      const toInput = this._inputs.find((i) => i.kind === 'to');
      if (toInput) {
        internalPlugins.push(
          ViRangePlugin({ input: toInput.inputElement as HTMLInputElement }),
        );
      }
    }

    const primaryInput =
      this._inputs.find((i) => i.kind === 'from') || this._inputs[0];

    return {
      inline: this.flat,
      mode: this.mode === 'range' ? ('range' as const) : ('single' as const),
      dateFormat: 'Y-m-d',
      disableMobile: true,
      ...(this.flat && this._inlineContainer
        ? { appendTo: this._inlineContainer }
        : {}),
      ...(primaryInput && !this.flat
        ? { positionElement: primaryInput.inputElement }
        : {}),
      ...(this.min ? { minDate: this.min } : {}),
      ...(this.max ? { maxDate: this.max } : {}),
      weekNumbers: this.weekNumbers,
      plugins: internalPlugins,
      onReady: (selectedDates: Date[], dateStr: string, instance: Instance) => {
        if (this.mode === 'date') {
          this._setupTodayButton(instance);
        }
        this._removeFpAria();
      },
      onOpen: () => {
        if (this._inputs) this._inputs.forEach(i => i.expanded = true);
        this._removeFpAria();
      },
      onClose: () => {
        if (this._inputs) this._inputs.forEach(i => i.expanded = false);
        this._removeFpAria();
      },
      onChange: (dates: Date[], dateStr: string, fp: Instance) => {
        this._onFlatpickrChange(dates, dateStr, fp);
      },
    };
  }

  private _removeFpAria() {
    // Flatpickr blindly attaches ARIA properties to the bound input.
    // Since our bound input is type="hidden", this causes a11y audit failures.
    if (this._fpInput) {
      this._fpInput.removeAttribute('aria-expanded');
      this._fpInput.removeAttribute('aria-haspopup');
      this._fpInput.removeAttribute('readonly');
    }
  }

  // ── Change handler ────────────────────────────────────────────────────────

  private _syncInputValues(dates: Date[]) {
    const start = dates[0] ?? null;
    const end = dates[1] ?? null;

    if (this.mode !== 'range' || !this._inputs.find((i) => i.kind === 'to')) {
      // If single mode, or range mode but no 'to' input provided, sync formatted string to the first input
      const primaryInput =
        this._inputs.find((i) => i.kind === 'from') || this._inputs[0];
      if (primaryInput) {
        primaryInput.value = start
          ? formatDisplay(
              start,
              this._resolvedLocale,
              this.mode,
              primaryInput.placeholder,
            )
          : '';
      }
    } else {
      // vi-range-plugin handles updating the 'to' input's value, but since we are using custom elements,
      // it's cleaner to sync them here as well based on lit properties, though vi-range-plugin triggers 'input' event.
      const fromInput = this._inputs.find((i) => i.kind === 'from');
      const toInput = this._inputs.find((i) => i.kind === 'to');
      if (fromInput) {
        fromInput.value = start
          ? formatDisplay(
              start,
              this._resolvedLocale,
              'date',
              fromInput.placeholder,
            )
          : '';
      }
      if (toInput) {
        toInput.value = end
          ? formatDisplay(
              end,
              this._resolvedLocale,
              'date',
              toInput.placeholder,
            )
          : '';
      }
    }
  }

  private _onFlatpickrChange(
    dates: Date[],
    _dateStr: string,
    _fp: Instance,
  ): void {
    const start = dates[0] ?? null;
    const end = dates[1] ?? null;

    const isoValue = this._buildIsoValue(start, end) ?? '';
    this.value = isoValue;

    this._syncInputValues(dates);

    let formattedValue = '';
    const fromInput = this._inputs.find((i) => i.kind === 'from') || this._inputs[0];
    const toInput = this._inputs.find((i) => i.kind === 'to');
    
    if (this.mode === 'range' && toInput) {
      if (fromInput && toInput && start && end) {
        formattedValue = `${fromInput.value} to ${toInput.value}`;
      } else if (fromInput && start) {
        formattedValue = fromInput.value;
      }
    } else if (fromInput) {
      formattedValue = fromInput.value;
    }

    this._internals.setFormValue(isoValue);
    this._emitChange(dates, formattedValue);
  }

  private _emitChange(dates: Date[], formattedValue: string): void {
    const start = dates[0] ?? null;
    const end = dates[1] ?? null;

    const toComponents = (d: Date | null): DateComponents | null =>
      d
        ? { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() }
        : null;

    const detail: DatePickerChangeDetail = {
      value: this._buildIsoValue(start, end),
      type: this.mode,
      isoValue: this._buildIsoValue(start, end),
      utcIso: start
        ? new Date(
            Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()),
          ).toISOString()
        : null,
      formattedValue,
      rawValue: toComponents(start),
      rawEndValue: toComponents(end),
      weekNumber: start ? getISOWeek(start) : null,
      locale: this._resolvedLocale,
      timeZone: resolveTimeZone(),
      partial: false,
    };

    this.dispatchEvent(
      new CustomEvent<DatePickerChangeDetail>(VIALIQ_CHANGE, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _buildIsoValue(start: Date | null, end: Date | null): string | null {
    if (!start) return null;
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    switch (this.mode) {
      case 'range':
        return end ? `${fmt(start)} to ${fmt(end)}` : fmt(start);
      case 'month':
      case 'month-year':
        return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
      case 'year':
        return `${start.getFullYear()}`;
      case 'week': {
        const week = getISOWeek(start);
        return `${start.getFullYear()}-W${String(week).padStart(2, '0')}`;
      }
      default:
        return fmt(start);
    }
  }

  private _setupTodayButton(fp: Instance) {
    const todayBtn = document.createElement('button');
    todayBtn.type = 'button';
    todayBtn.className = 'vi-calendar-today-btn';
    todayBtn.textContent =
      this.todayLabel || getTodayLabel(this._resolvedLocale);

    todayBtn.addEventListener('click', () => {
      fp.setDate(new Date(), true);
      fp.close();
    });

    const footer = document.createElement('div');
    footer.className = 'vi-calendar-footer';
    footer.appendChild(todayBtn);

    fp.calendarContainer.appendChild(footer);
  }

  private async _handleSlotChange() {
    if (this._inputs && this._inputs.length > 0) {
      await Promise.all(this._inputs.map((input) => input.updateComplete));
    }

    this._inputs.forEach((input) => {
      input.disabled = this.disabled;
    });

    // We should re-init flatpickr to register the range plugin if the 'to' input was just slotted
    if (this._fp) {
      this._initFlatpickr(
        this._buildFpConfig(),
        this.mode,
        this._resolvedLocale,
      );
    }
  }

  private _handleInputsClick(e: Event) {
    if (this.disabled || this.flat || !this._fp) return;
    
    // Check if the click came from a trigger button inside an input
    const path = e.composedPath();
    const inputWrapper = path.find(node => (node as Element).tagName?.toLowerCase() === 'vi-date-picker-input') as ViDatePickerInput | undefined;
    
    if (inputWrapper && inputWrapper.inputElement) {
      this._fp.config.positionElement = inputWrapper.inputElement;
      this._fp.open();
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  protected override render() {
    return html`
      <!-- Hidden input flatpickr binds to -->
      <input
        type="hidden"
        id="fp-input"
        tabindex="-1"
        aria-hidden="true"
        name="${this.name}"
        .value="${this.value}"
      />

      ${this.flat
        ? html`<slot name="inline-container"></slot>`
        : html`
            <div part="control" class="control">
              <div class="inputs-container" @click="${this._handleInputsClick}">
                <slot @slotchange="${this._handleSlotChange}"></slot>
              </div>
              ${this.validityMessage
                ? html`<span
                    part="validity-message"
                    class="validity-msg"
                    role="alert"
                  >
                    ${this.validityMessage}
                  </span>`
                : ''}
            </div>
          `}

      <slot name="helper"></slot>
    `;
  }

  static override styles = css`
    ${unsafeCSS(datePickerStyles)}
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-date-picker': ViDatePicker;
  }
}
