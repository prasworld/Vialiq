import {
  css,
  html,
  unsafeCSS,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FocusableMixin } from '../base/focusable-mixin.js';
import { ValidityMixin, type ControlStatus } from '../base/validity-mixin.js';
import { ViElement } from '../base/vi-element.js';
import { classMap } from 'lit/directives/class-map.js';
import checkboxStyles from './vi-checkbox.scss?inline';

export type CheckboxSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * vi-checkbox
 * Form-associated checkbox control using Flux UI tokens.
 *
 * NOTE: For correct roving tabindex, form submission, and mutual exclusivity,
 * vi-checkbox should be used within a layout fieldset or form.
 *
 * @element vi-checkbox
 *
 * @attr {boolean} checked       - Checked state of the checkbox
 * @attr {boolean} indeterminate - Indeterminate (partial) state of the checkbox
 * @attr {string} value          - Form submission value when checked (default: 'on')
 * @attr {string} name           - Form field name
 * @attr {boolean} disabled      - Disables the checkbox
 * @attr {boolean} required      - Marks the field as required
 * @attr {ControlStatus} status  - Validation state: 'default' | 'valid' | 'invalid'
 *
 * @slot - Label text/content.
 *
 * @fires {CustomEvent<{checked:boolean; value:string}>} vialiq-change - Fires when user toggles checked state.
 *
 * @csspart box   - The visual checkbox square (custom-drawn box).
 * @csspart check - The SVG checkmark/indeterminate dash container.
 * @csspart label - The label text wrapper.
 */
@customElement('vi-checkbox')
export class ViCheckbox extends ValidityMixin(FocusableMixin(ViElement)) {
  static formAssociated = true;
  static override styles = css`
    ${unsafeCSS(checkboxStyles)}
  `;

  protected readonly _internals = this.attachInternals();
  private _initialChecked = false;

  protected override get _focusableElement(): HTMLInputElement | null {
    return this.shadowRoot?.querySelector('input') ?? null;
  }

  // ── ValidityMixin contract ───────────────────────────────────────────────

  @property({ reflect: true }) accessor status: ControlStatus = 'default';
  @property({ type: Boolean, reflect: true }) accessor required = false;
  @property() accessor validityMessage = '';

  // ── Public API ────────────────────────────────────────────────────────────

  /** Checked state. */
  @property({ type: Boolean, reflect: true }) accessor checked = false;

  /** Indeterminate (partial) state. */
  @property({ type: Boolean, reflect: true }) accessor indeterminate = false;

  /** Size scale — controls size, padding, and font-size. */
  @property({ type: String, reflect: true }) accessor size: CheckboxSize = 'md';

  /** Form submission value when checked. */
  @property() accessor value = 'on';

  /** Form field name. */
  @property() accessor name = '';

  /** Disables the checkbox. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  // ── ValidityMixin hook ───────────────────────────────────────────────────

  protected _testValidity(): Partial<ValidityStateFlags> {
    if (this.required && !this.checked) {
      this.validityMessage = 'Please check this box if you want to proceed.';
      return { valueMissing: true };
    }
    return {};
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    this._initialChecked = this.hasAttribute('checked');
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);

    // Sync form value for form submission participation
    if (changed.has('checked') || changed.has('value')) {
      this._internals.setFormValue(this.checked ? this.value : null);
    }

    // Centralize host focusability via FocusableMixin
    if (changed.has('disabled')) {
      this._setHostFocusable(!this.disabled);
    }

    // Sync inner input's tabindex with host's tabIndex (which is managed by FocusableMixin)
    const input = this._focusableElement;
    if (input && input.tabIndex !== this.tabIndex) {
      input.tabIndex = this.tabIndex;
    }
  }

  /** Resets value and validation state when the associated form resets. */
  formResetCallback(): void {
    this.checked = this._initialChecked;
    this.indeterminate = false;
    this.status = 'default';
    this.validityMessage = '';
  }

  /** Keeps disabled in sync when a containing fieldset or form is disabled. */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  // ── Event Handlers ─────────────────────────────────────────────────────────

  private _onChange(e: Event): void {
    e.stopPropagation();
    if (this.disabled) return;

    const input = e.target as HTMLInputElement;
    this.checked = input.checked;
    this.indeterminate = input.indeterminate;

    this.dispatchEvent(
      new CustomEvent<{ checked: boolean; value: string }>('vialiq-change', {
        detail: { checked: this.checked, value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  override render(): TemplateResult {
    const isValDisabled = this.disabled;
    const inputClasses = classMap({
      'checkbox-input': true,
      'sr-only': true,
      'checkbox-input--indeterminate': this.indeterminate,
    });

    const wrapperClasses = classMap({
      'checkbox-wrapper': true,
      'checkbox-wrapper--disabled': isValDisabled,
    });

    return html`
      <label class=${wrapperClasses}>
        <input
          type="checkbox"
          class=${inputClasses}
          .name=${this.name}
          .value=${this.value}
          ?checked=${this.checked}
          .indeterminate=${this.indeterminate}
          ?disabled=${isValDisabled}
          ?required=${this.required}
          aria-required=${this.required ? 'true' : 'false'}
          aria-checked=${this.indeterminate ? 'mixed' : this.checked ? 'true' : 'false'}
          @change=${this._onChange}
        />
        <span part="box" class="checkbox-box" aria-hidden="true">
          <svg part="check" class="checkbox-check" viewBox="0 0 12 12">
            <!-- Checkmark path shown when checked -->
            <polyline class="check-mark" points="2,6 5,9 10,3"/>
            <!-- Dash shown when indeterminate -->
            <line class="check-dash" x1="2" y1="6" x2="10" y2="6"/>
          </svg>
        </span>
        <span part="label" class="checkbox-label">
          <slot></slot>
        </span>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-checkbox': ViCheckbox;
  }
}
