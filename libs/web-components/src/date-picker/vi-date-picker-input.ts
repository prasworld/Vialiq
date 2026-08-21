import { html, css, unsafeCSS, LitElement, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import datePickerInputStyles from './vi-date-picker-input.scss?inline';

@customElement('vi-date-picker-input')
export class ViDatePickerInput extends ViElement {
  @property({ type: String, reflect: true }) accessor kind: 'from' | 'to' | 'single' = 'single';
  @property({ type: String }) accessor label = '';
  @property({ type: String }) accessor placeholder!: string;
  @property({ type: Boolean, reflect: true }) accessor disabled = false;
  @property({ type: Boolean, reflect: true }) accessor required = false;
  @property({ type: Boolean, reflect: true }) accessor invalid = false;
  @property({ type: String }) accessor validityMessage = '';
  @property({ type: Boolean }) accessor expanded = false;
  
  // The actual value string (formatted or ISO, depending on how date-picker manages it)
  @property({ type: String }) accessor value = '';

  @query('.trigger') private accessor _triggerBtn!: HTMLButtonElement;

  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /**
   * Returns the interactable element for Flatpickr to bind to.
   */
  get inputElement(): HTMLElement {
    return this._triggerBtn;
  }

  override focus(options?: FocusOptions) {
    if (this._triggerBtn) {
      this._triggerBtn.focus(options);
    } else {
      super.focus(options);
    }
  }

  override render() {
    const accessibleName = [this.label, this.value || this.placeholder]
      .filter(Boolean)
      .join(', ');

    return html`
      <div class="input-wrapper">
        ${this.label ? html`<label class="label" aria-hidden="true">${this.label}</label>` : ''}
        <button
          type="button"
          part="trigger"
          class="trigger"
          ?disabled="${this.disabled}"
          aria-haspopup="dialog"
          aria-expanded="${this.expanded}"
          aria-label="${accessibleName}"
          aria-required="${this.required ? 'true' : 'false'}"
          aria-invalid="${this.invalid ? 'true' : 'false'}"
          aria-errormessage="${this.invalid && this.validityMessage ? 'vi-err-msg' : nothing}"
        >
          <span class="display-value">
            ${this.value 
              ? html`<span class="value-text">${this.value}</span>`
              : html`<span class="placeholder">${this.placeholder}</span>`}
          </span>
          <span class="icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </span>
        </button>
        ${this.invalid && this.validityMessage ? html`<span id="vi-err-msg" class="sr-only">${this.validityMessage}</span>` : ''}
      </div>
    `;
  }

  static override styles = css`
    ${unsafeCSS(datePickerInputStyles)}
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-date-picker-input': ViDatePickerInput;
  }
}
