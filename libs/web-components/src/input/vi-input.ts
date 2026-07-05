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
import { ifNonEmpty } from '../base/if-non-empty.js';
import inputStyles from './vi-input.scss?inline';

/**
 * Supported input types.
 * Constrained to the subset that renders as a single-line text field —
 * multi-line (textarea) and specialised pickers (date, color, file) are
 * separate components.
 */
export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'search'
  | 'tel'
  | 'url'
  | 'number';

export type InputSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * vi-input
 * Form-associated single-line text input using Flux UI token fallbacks.
 *
 * @element vi-input
 *
 * @attr {InputType} type         - Input type (default: text)
 * @attr {string}    placeholder  - Native input placeholder
 * @attr {string}    name         - Form field name
 * @attr {string}    value        - Current value
 * @attr {boolean}   disabled     - Disables the input (reflected)
 * @attr {boolean}   readonly     - Makes the input read-only (reflected)
 * @attr {boolean}   required     - Marks the field as required (reflected)
 * @attr {ControlStatus} status     - Visual state: 'default' | 'valid' | 'invalid' (reflected)
 *
 * @slot helper - Helper text shown below the input.
 *
 * @fires {CustomEvent<{value:string}>} vialiq-input  - Every keystroke. Bubbles, composed.
 * @fires {CustomEvent<{value:string}>} vialiq-change - Value committed (blur). Bubbles, composed.
 * @fires {Event}                       invalid        - Cancelable; fires when checkValidity() fails.
 *
 * @csspart field      - The outer `<div>` wrapper
 * @csspart input      - The native `<input>` element
 * @csspart helper     - The persistent helper slot wrapper
 * @csspart validation - The validation message span (error or success)
 *
 * @cssprop [--vi-input-border-color]              - Border colour (default: `$color-border` token)
 * @cssprop [--vi-input-focus-ring-color]          - Focus ring colour (default: `$color-primary`)
 * @cssprop [--vi-input-background-color]          - Background (default: `$color-background`)
 * @cssprop [--vi-input-text-color]                - Text colour (default: `$color-foreground`)
 * @cssprop [--vi-input-placeholder-color]         - Placeholder colour (default: `$color-grey-400`)
 * @cssprop [--vi-input-helper-color]              - Helper text colour (default: `$color-grey-500`)
 * @cssprop [--vi-input-error-color]               - Error text colour (default: `$color-error`)
 * @cssprop [--vi-input-success-color]             - Success message colour (default: `$color-success`)
 * @cssprop [--vi-input-shape-border-radius]       - Border radius (default: `$border-radius-md`)
 * @cssprop [--vi-input-spacing-padding-block]     - Vertical padding (default: `$spacing-xs`)
 * @cssprop [--vi-input-spacing-padding-inline]    - Horizontal padding (default: `$spacing-sm`)
 * @cssprop [--vi-input-typography-font-size]      - Font size (default: `$font-size-base`)
 */
@customElement('vi-input')
export class ViInput extends ValidityMixin(FocusableMixin(ViElement)) {
  static formAssociated = true;
  static override styles = css`
    ${unsafeCSS(inputStyles)}
  `;

  protected readonly _internals = this.attachInternals();

  protected override get _focusableElement(): HTMLInputElement | null {
    return this.shadowRoot?.querySelector('input') ?? null;
  }

  // ── ValidityMixin contract — must be declared as @property —————————————

  @property({ reflect: true }) accessor status: ControlStatus = 'default';
  @property({ type: Boolean, reflect: true }) accessor required = false;
  @property() accessor validityMessage = '';

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Input type. Controls the keyboard/picker on mobile and browser validation hints. */
  @property({ type: String, reflect: true }) accessor type: InputType = 'text';

  /** Native input placeholder text. */
  @property() accessor placeholder = '';

  /** Form field name. Submitted with the form when set. */
  @property() accessor name = '';

  /** Current value. Synced to ElementInternals for form participation. */
  @property() accessor value = '';

  /** When true, disables the input and removes it from the tab order. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Size scale — controls padding and font-size. */
  @property({ type: String, reflect: true }) accessor size: InputSize = 'md';

  /** When true, the value cannot be edited but is still submitted. */
  @property({ type: Boolean, reflect: true }) accessor readonly = false;

  /** The accessibility label. */
  @property({ attribute: 'aria-label' }) accessor ariaLabel = '';

  /** Reference to an element id containing the label. */
  @property({ attribute: 'aria-labelledby' }) accessor ariaLabelledby = '';

  // ── ValidityMixin hook ─────────────────────────────────────────────────────

  // _testValidity is declared protected in ValidityInterface, but TypeScript's
  // mixin intersection type does not always surface protected members for
  // `override` checking. The method is still an override at runtime.
  protected _testValidity(): Partial<ValidityStateFlags> {
    if (this._internals.validity.customError) {
      return { customError: true };
    }

    const input = this._focusableElement;
    if (input) {
      if (input.value !== this.value) {
        input.value = this.value;
      }
      const validity = input.validity;
      if (!validity.valid) {
        this.validityMessage = input.validationMessage;
        return {
          badInput: validity.badInput,
          customError: validity.customError,
          patternMismatch: validity.patternMismatch,
          rangeOverflow: validity.rangeOverflow,
          rangeUnderflow: validity.rangeUnderflow,
          stepMismatch: validity.stepMismatch,
          tooLong: validity.tooLong,
          tooShort: validity.tooShort,
          typeMismatch: validity.typeMismatch,
          valueMissing: validity.valueMissing,
        };
      }
    } else if (this.required && !this.value) {
      this.validityMessage = 'Please fill out this field.';
      return { valueMissing: true };
    }
    return {};
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('value')) {
      this._internals.setFormValue(this.value);
    }
    if (changed.has('disabled')) {
      this._setHostFocusable(!this.disabled);
    }
  }

  /** Resets value and validation state when the associated form resets. */
  formResetCallback(): void {
    this.value = this.getAttribute('value') ?? '';
    this.status = 'default';
    this.validityMessage = '';
  }

  /** Keeps disabled in sync when a containing fieldset or form is disabled. */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  private _onInput(e: Event): void {
    e.stopPropagation();
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.dispatchEvent(
      new CustomEvent<{ value: string }>('vialiq-input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onChange(e: Event): void {
    e.stopPropagation();
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.dispatchEvent(
      new CustomEvent<{ value: string }>('vialiq-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  private get _helperContent(): TemplateResult {
    return html`<span id="helper-text" class="input-helper" part="helper"
      ><slot name="helper"></slot
    ></span>`;
  }

  private get _validationMessage(): TemplateResult {
    if (!this.validityMessage) return html``;
    const cls =
      this.status === 'invalid'
        ? 'input-validation--invalid'
        : this.status === 'valid'
          ? 'input-validation--valid'
          : '';
    return html`<span
      id="validation-message"
      class="input-validation ${cls}"
      part="validation"
      role="alert"
      aria-live="polite"
      >${this.validityMessage}</span
    >`;
  }

  override render(): TemplateResult {
    const { type, placeholder, name, value, disabled, required, readonly } =
      this;

    return html`
      <div class="input-field" part="field">
        <input
          class="input-control"
          part="input"
          tabindex="0"
          type=${type}
          .value=${value}
          ?disabled=${disabled}
          ?readonly=${readonly}
          ?required=${required}
          aria-required=${ifNonEmpty(required ? 'true' : '')}
          aria-invalid=${this.status === 'invalid' ? 'true' : 'false'}
          aria-label=${ifNonEmpty(this.ariaLabel)}
          aria-labelledby=${ifNonEmpty(this.ariaLabelledby)}
          aria-describedby=${this.validityMessage
            ? 'helper-text validation-message'
            : 'helper-text'}
          aria-errormessage=${ifNonEmpty(
            this.status === 'invalid' && this.validityMessage
              ? 'validation-message'
              : '',
          )}
          placeholder=${ifNonEmpty(placeholder)}
          name=${ifNonEmpty(name)}
          @input=${this._onInput}
          @change=${this._onChange}
        />
        ${this._helperContent} ${this._validationMessage}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-input': ViInput;
  }
}
