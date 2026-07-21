import { css, html, unsafeCSS, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ValidityMixin, type ControlStatus } from '../base/validity-mixin.js';
import { ViElement } from '../base/vi-element.js';
import radioGroupStyles from './vi-radio-group.scss?inline';

// Import ViRadio to support type declarations and element operations
import { ViRadio, type RadioSize } from './vi-radio.js';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

/**
 * vi-radio-group
 * Form-associated radio button group container.
 * Manages WAI-ARIA compliant keyboard roving tabindex and selection state.
 *
 * @element vi-radio-group
 *
 * @attr {string}                 value            - Value of the currently selected radio option.
 * @attr {string}                 name             - Shared name for all child radios.
 * @attr {boolean}                disabled         - Disables the entire radio group (reflected).
 * @attr {boolean}                required         - Marks the group as requiring a selection (reflected).
 * @attr {ControlStatus}          status           - Visual status: default | valid | invalid (reflected).
 * @attr {string}                 validity-message - Error message shown when validation fails.
 * @attr {RadioGroupOrientation}  orientation      - Layout direction: vertical | horizontal (reflected).
 *
 * @slot - Child vi-radio elements.
 * @slot label - Text displayed above the group.
 * @slot helper - Helper text displayed below the group.
 *
 * @fires {CustomEvent<{value: string}>} vialiq-change - Dispatched when selection changes. Bubbles, composed.
 * @fires {Event}                        invalid       - Fired when validation check fails.
 */
@customElement('vi-radio-group')
export class ViRadioGroup extends ValidityMixin(ViElement) {
  static override styles = css`
    ${unsafeCSS(radioGroupStyles)}
  `;

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Currently selected radio's value. */
  @property({ reflect: true }) accessor value = '';

  /** Shared name for all child radios. */
  @property() accessor name = '';

  /** Disables the entire group. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Layout direction of the radio group. */
  @property({ reflect: true }) accessor orientation: RadioGroupOrientation = 'vertical';

  /** Size scale — controls spacing and propagates to child radios. */
  @property({ type: String, reflect: true }) accessor size: RadioSize = 'md';

  /** Allows clearing the selected radio button on double click. */
  @property({ type: Boolean, attribute: 'allow-dblclick-clear', reflect: true })
  accessor allowDblclickClear = false;

  private _observer?: MutationObserver;

  private _initialValue = '';

  override connectedCallback(): void {
    super.connectedCallback();
    this._initialValue = this.getAttribute('value') ?? '';
    
    // Set up MutationObserver to react to child vi-radio nodes added/removed dynamically
    this._observer = new MutationObserver(() => {
      this._updateRadios();
    });
    this._observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled'],
    });

    // Sync initial state of child radios
    this._updateRadios();

    // Listen for double-clicks on the host to support clearing
    this.addEventListener('dblclick', this._onDblclick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._observer) {
      this._observer.disconnect();
    }
    this.removeEventListener('dblclick', this._onDblclick);
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);
    
    if (changed.has('value')) {
      this._internals.setFormValue(this.value);
    }
    
    if (
      changed.has('value') ||
      changed.has('name') ||
      changed.has('disabled') ||
      changed.has('required') ||
      changed.has('size')
    ) {
      this._updateRadios();
    }
  }

  /** Resets the value when the parent form resets. */
  override formResetCallback(): void {
    this.value = this._initialValue;
    super.formResetCallback();
    this._updateRadios();
  }

  protected override _testValidity(): Partial<ValidityStateFlags> {
    if (this.required && !this.value) {
      const radios = this._getRadios();
      if (radios.length > 0) {
        const firstInput = radios[0].shadowRoot?.querySelector('input');
        if (firstInput) {
          const wasRequired = firstInput.required;
          firstInput.required = true;
          this.validityMessage = firstInput.validationMessage;
          firstInput.required = wasRequired;
          return { valueMissing: true };
        }
      }

      const temp = document.createElement('input');
      temp.type = 'radio';
      temp.name = 'temp-radio-group';
      temp.required = true;
      this.appendChild(temp);
      this.validityMessage = temp.validationMessage;
      this.removeChild(temp);
      return { valueMissing: true };
    }
    return {};
  }

  // ── Helper methods ─────────────────────────────────────────────────────────

  private _getRadios(): ViRadio[] {
    return Array.from(this.querySelectorAll('vi-radio'));
  }

  private _updateRadios(): void {
    const radios = this._getRadios();

    // 1. Propagate name, checked, and size attributes to children
    radios.forEach(radio => {
      if (this.name && radio.name !== this.name) {
        radio.name = this.name;
      }
      
      if (this.size && radio.size !== this.size) {
        radio.size = this.size;
      }
      
      const shouldBeChecked = this.value !== '' && radio.value === this.value;
      if (radio.checked !== shouldBeChecked) {
        radio.checked = shouldBeChecked;
      }
      
      // Let children recalculate their disabled states
      radio.requestUpdate();
    });

    // 2. Roving tabindex active node determination:
    // - The checked radio (if enabled)
    // - The first enabled radio
    // - Fallback to the first radio
    let activeRadio = radios.find(r => r.checked && !r.disabled && !this.disabled);
    if (!activeRadio) {
      activeRadio = radios.find(r => !r.disabled && !this.disabled);
    }
    if (!activeRadio && radios.length > 0) {
      activeRadio = radios[0];
    }

    radios.forEach(radio => {
      const isRadioActive = radio === activeRadio;
      radio.tabIndex = isRadioActive && !this.disabled && !radio.disabled ? 0 : -1;
    });
  }

  // ── Event Handlers ─────────────────────────────────────────────────────────

  private _handleRadioChecked(e: Event): void {
    const targetRadio = e.target as ViRadio;
    if (this.disabled) return;

    const oldValue = this.value;
    this.value = targetRadio.value;
    this._updateRadios();

    if (this.value !== oldValue) {
      this.dispatchEvent(
        new CustomEvent<{ value: string }>('vialiq-change', {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private _onKeydown(e: KeyboardEvent): void {
    if (this.disabled) return;

    const radios = this._getRadios().filter(r => !r.disabled);
    if (radios.length === 0) return;

    const eventTarget = e.target as HTMLElement;
    // Find index of the child radio that received the keydown event
    const currentIndex = radios.findIndex(
      r => r === eventTarget || r.contains(eventTarget)
    );
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    let shouldPreventDefault = false;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % radios.length;
        shouldPreventDefault = true;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + radios.length) % radios.length;
        shouldPreventDefault = true;
        break;
      case ' ':
        nextIndex = currentIndex;
        shouldPreventDefault = true;
        break;
      default:
        return;
    }

    if (shouldPreventDefault) {
      e.preventDefault();
    }

    const targetRadio = radios[nextIndex];
    if (targetRadio) {
      const oldValue = this.value;
      this.value = targetRadio.value;
      this._updateRadios();
      targetRadio.focus();

      if (this.value !== oldValue) {
        this.dispatchEvent(
          new CustomEvent<{ value: string }>('vialiq-change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true,
          })
        );
      }
    }
  }

  private _onDblclick = (e: MouseEvent): void => {
    if (this.disabled || !this.allowDblclickClear) return;

    const targetRadio = (e.target as HTMLElement).closest('vi-radio');
    if (!targetRadio || targetRadio.disabled) return;

    if (targetRadio.checked && this.value === targetRadio.value) {
      const oldValue = this.value;
      this.value = '';
      this._updateRadios();

      if (this.value !== oldValue) {
        this.dispatchEvent(
          new CustomEvent<{ value: string }>('vialiq-change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true,
          })
        );
      }
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  private get _validationMessage(): TemplateResult {
    if (!this.validityMessage) return html``;
    const cls =
      this.status === 'invalid'
        ? 'radio-group-validation--invalid'
        : this.status === 'valid'
          ? 'radio-group-validation--valid'
          : '';
    return html`
      <span
        id="validation-message"
        class="radio-group-validation ${cls}"
        part="validation"
        role="alert"
        aria-live="polite"
      >
        ${this.validityMessage}
      </span>
    `;
  }

  override render(): TemplateResult {
    const { required, status, orientation } = this;

    return html`
      <fieldset
        class="radio-group"
        role="radiogroup"
        aria-required=${required ? 'true' : 'false'}
        aria-invalid=${status === 'invalid' ? 'true' : 'false'}
        aria-describedby=${this.validityMessage ? 'validation-message' : undefined}
        aria-errormessage=${status === 'invalid' && this.validityMessage ? 'validation-message' : undefined}
        @vi-radio-checked=${this._handleRadioChecked}
        @keydown=${this._onKeydown}
      >
        <legend class="radio-group-legend" part="legend">
          <slot name="label"></slot>
        </legend>
        <div
          class="radio-group-items"
          part="items"
          orientation=${orientation}
        >
          <slot></slot>
        </div>
        <div class="radio-group-helper" part="helper">
          <slot name="helper"></slot>
        </div>
        ${this._validationMessage}
      </fieldset>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-radio-group': ViRadioGroup;
  }
}
