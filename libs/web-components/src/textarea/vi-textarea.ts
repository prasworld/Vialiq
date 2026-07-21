import {
  css,
  html,
  unsafeCSS,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FocusableMixin } from '../base/focusable-mixin.js';
import { ValidityMixin, type ControlStatus } from '../base/validity-mixin.js';
import { ViElement } from '../base/vi-element.js';
import { ifNonEmpty } from '../base/if-non-empty.js';
import textareaStyles from './vi-textarea.scss?inline';

export type TextareaResize = 'none' | 'vertical' | 'both';

/**
 * vi-textarea
 * Form-associated multi-line text input using Flux UI token fallbacks.
 *
 * @element vi-textarea
 *
 * @attr {string}         placeholder  - Native textarea placeholder
 * @attr {string}         name         - Form field name
 * @attr {string}         value        - Current text value (reflected)
 * @attr {number}         rows         - Initial visible text lines
 * @attr {number}         maxlength    - Character limit
 * @attr {boolean}        disabled     - Disables the input (reflected)
 * @attr {boolean}        readonly     - Makes the input read-only (reflected)
 * @attr {boolean}        required     - Marks the field as required (reflected)
 * @attr {TextareaResize} resize       - CSS resize direction: 'none' | 'vertical' | 'both' (reflected)
 * @attr {ControlStatus}  status       - Visual state: 'default' | 'valid' | 'invalid' (reflected)
 * @attr {string}         validity-message - Error or success message
 * @attr {boolean}        char-count   - Show character counter
 *
 * @slot helper - Helper text shown below the textarea
 *
 * @fires {CustomEvent<{value:string}>} vialiq-textarea-input  - Triggered on every keystroke. Bubbles, composed.
 * @fires {CustomEvent<{value:string}>} vialiq-textarea-change - Triggered on blur (committed value). Bubbles, composed.
 * @fires {Event}                       invalid        - Fired when checkValidity() fails.
 *
 * @csspart field        - The outer `<div>` wrapper
 * @csspart textarea     - The native `<textarea>` control
 * @csspart helper       - The helper slot wrapper
 * @csspart validation   - The validation alert message span
 * @csspart char-counter - The character counter display span
 */
@customElement('vi-textarea')
export class ViTextarea extends ValidityMixin(FocusableMixin(ViElement)) {
  static override styles = css`
    ${unsafeCSS(textareaStyles)}
  `;

  protected override get _focusableElement(): HTMLTextAreaElement | null {
    return this.shadowRoot?.querySelector('textarea') ?? null;
  }

  protected override _getValidationAnchor(): HTMLElement | undefined {
    return this._focusableElement ?? undefined;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Native textarea placeholder text. */
  @property() accessor placeholder = '';

  /** Form field name. Submitted with form data when set. */
  @property() accessor name = '';

  /** Current text value. */
  @property() accessor value = '';

  /** Initial visible lines of text. */
  @property({ type: Number }) accessor rows = 3;

  /** Maximum character length. */
  @property({ type: Number }) accessor maxlength: number | null = null;

  /** Controls textarea resize handle orientation. */
  @property({ reflect: true }) accessor resize: TextareaResize = 'vertical';

  /** When true, disables the textarea and removes it from the tab order. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** When true, the value cannot be modified by the user. */
  @property({ type: Boolean, reflect: true }) accessor readonly = false;

  /** Enables displaying a character counter (requires maxlength to be set). */
  @property({ type: Boolean, attribute: 'char-count' }) accessor charCount =
    false;

  /** The accessibility label. */
  @property({ attribute: 'aria-label' }) accessor ariaLabel = '';

  /** Reference to an element ID containing the label. */
  @property({ attribute: 'aria-labelledby' }) accessor ariaLabelledby = '';

  // ── ValidityMixin implementation ───────────────────────────────────────────

  protected override _testValidity(): Partial<ValidityStateFlags> {
    if (this._internals.validity.customError) {
      return { customError: true };
    }

    const textarea = this._focusableElement;
    if (textarea) {
      if (textarea.value !== this.value) {
        textarea.value = this.value;
      }
      const validity = textarea.validity;
      if (!validity.valid) {
        this.validityMessage = textarea.validationMessage;
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
      const temp = document.createElement('textarea');
      temp.required = true;
      this.validityMessage = temp.validationMessage;
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

  /** Resets value when the parent form resets. */
  override formResetCallback(): void {
    this.value = this.getAttribute('value') ?? '';
    super.formResetCallback();
  }

  // ── Event Handlers ─────────────────────────────────────────────────────────

  private _onInput(e: Event): void {
    e.stopPropagation();
    const textarea = e.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.dispatchEvent(
      new CustomEvent<{ value: string }>('vialiq-textarea-input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onChange(e: Event): void {
    e.stopPropagation();
    const textarea = e.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.dispatchEvent(
      new CustomEvent<{ value: string }>('vialiq-textarea-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  private get _helperContent(): TemplateResult {
    return html`
      <span id="helper-text" class="input-helper" part="helper">
        <slot name="helper"></slot>
      </span>
    `;
  }

  private get _validationMessage(): TemplateResult {
    if (!this.validityMessage) return html``;
    const cls =
      this.status === 'invalid'
        ? 'input-validation--invalid'
        : this.status === 'valid'
          ? 'input-validation--valid'
          : '';
    return html`
      <span
        id="validation-message"
        class="input-validation ${cls}"
        part="validation"
        role="alert"
        aria-live="polite"
      >
        ${this.validityMessage}
      </span>
    `;
  }

  private get _charCounter(): TemplateResult {
    if (!this.charCount || this.maxlength == null || this.maxlength < 0)
      return html``;
    const length = this.value.length;
    const limit = this.maxlength;
    const ratio = length / limit;

    const stateClass =
      ratio >= 1
        ? 'char-counter--error'
        : ratio >= 0.9
          ? 'char-counter--warning'
          : '';

    return html`
      <span
        id="char-counter"
        class="char-counter ${stateClass}"
        part="char-counter"
      >
        ${length} / ${limit}
      </span>
    `;
  }

  override render(): TemplateResult {
    const {
      placeholder,
      name,
      value,
      disabled,
      required,
      readonly,
      rows,
      maxlength,
    } = this;
    const hasCharCounter =
      this.charCount && maxlength != null && maxlength >= 0;

    const describedBy = [
      'helper-text',
      this.validityMessage ? 'validation-message' : '',
      hasCharCounter ? 'char-counter' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="input-field" part="field">
        <textarea
          class="input-control"
          part="textarea"
          tabindex="0"
          .value=${value}
          ?disabled=${disabled}
          ?readonly=${readonly}
          ?required=${required}
          rows=${rows}
          maxlength=${maxlength !== null && maxlength >= 0
            ? maxlength
            : nothing}
          aria-required=${required ? 'true' : 'false'}
          aria-invalid=${this.status === 'invalid' ? 'true' : 'false'}
          aria-label=${ifNonEmpty(this.ariaLabel)}
          aria-labelledby=${ifNonEmpty(this.ariaLabelledby)}
          aria-describedby=${describedBy}
          aria-errormessage=${ifNonEmpty(
            this.status === 'invalid' && this.validityMessage
              ? 'validation-message'
              : '',
          )}
          placeholder=${ifNonEmpty(placeholder)}
          name=${ifNonEmpty(name)}
          @input=${this._onInput}
          @change=${this._onChange}
        ></textarea>
        ${this._helperContent} ${this._validationMessage} ${this._charCounter}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-textarea': ViTextarea;
  }
}
