import {
  css,
  html,
  nothing,
  unsafeCSS,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FocusableMixin } from '../base/focusable-mixin.js';
import { ValidityMixin, type ControlStatus } from '../base/validity-mixin.js';
import { ViElement } from '../base/vi-element.js';
import { classMap } from 'lit/directives/class-map.js';
import switchStyles from './vi-switch.scss?inline';

export type SwitchSize = 'sm' | 'md' | 'lg';
export type LabelPlacement = 'start' | 'end';

/**
 * vi-switch
 * Form-associated switch control using Flux UI tokens.
 *
 * @element vi-switch
 *
 * @attr {boolean} checked       - Checked state of the switch
 * @attr {string} value          - Form submission value when checked (default: 'on')
 * @attr {string} name           - Form field name
 * @attr {boolean} disabled      - Disables the switch
 * @attr {string} size           - Visual size of the switch ('sm' | 'md' | 'lg')
 * @attr {string} label-placement - Label position relative to switch ('start' | 'end')
 *
 * @slot - Label text/content.
 * @slot on-label - Optional text inside the track when on
 * @slot off-label - Optional text inside the track when off
 *
 * @fires {CustomEvent<{checked:boolean}>} vi-switch-change - Fires when user toggles checked state.
 *
 * @csspart track - The pill-shaped background
 * @csspart thumb - The sliding circle
 * @csspart label - Label text span
 */
@customElement('vi-switch')
export class ViSwitch extends ValidityMixin(FocusableMixin(ViElement)) {
  static override styles = css`
    ${unsafeCSS(switchStyles)}
  `;

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

  /** Size scale — controls size, padding, and font-size. */
  @property({ type: String, reflect: true }) accessor size: SwitchSize = 'md';

  /** Label position relative to switch. */
  @property({ type: String, reflect: true, attribute: 'label-placement' })
  accessor labelPlacement: LabelPlacement = 'end';

  /** Form submission value when checked. */
  @property() accessor value = 'on';

  /** Form field name. */
  @property() accessor name = '';

  /** Disables the switch. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  // ── ValidityMixin hook ───────────────────────────────────────────────────

  protected _testValidity(): Partial<ValidityStateFlags> {
    const input = this._focusableElement;
    if (input) {
      if (input.checked !== this.checked) {
        input.checked = this.checked;
      }
      const validity = input.validity;
      if (!validity.valid) {
        this.validityMessage = input.validationMessage;
        return {
          customError: validity.customError,
        };
      }
    }
    this.validityMessage = '';
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
  }

  /** Resets value and validation state when the associated form resets. */
  formResetCallback(): void {
    this.checked = this._initialChecked;
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

    this.dispatchEvent(
      new CustomEvent<{ checked: boolean }>('vi-switch-change', {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  override render(): TemplateResult {
    const isValDisabled = this.disabled;
    const inputClasses = classMap({
      'switch-input': true,
      'sr-only': true,
    });

    const wrapperClasses = classMap({
      'switch-wrapper': true,
      'switch-wrapper--disabled': isValDisabled,
    });

    return html`
      <label class=${wrapperClasses} data-placement=${this.labelPlacement}>
        ${this.labelPlacement === 'start'
          ? html`<span part="label" class="switch-label"><slot></slot></span>`
          : nothing}

        <input
          type="checkbox"
          role="switch"
          class=${inputClasses}
          .name=${this.name}
          .value=${this.value}
          ?checked=${this.checked}
          ?disabled=${isValDisabled}
          aria-checked=${this.checked ? 'true' : 'false'}
          @change=${this._onChange}
        />
        <span part="track" class="switch-track" aria-hidden="true">
          <span part="thumb" class="switch-thumb"></span>
        </span>

        ${this.labelPlacement === 'end'
          ? html`<span part="label" class="switch-label"><slot></slot></span>`
          : nothing}
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-switch': ViSwitch;
  }
}
