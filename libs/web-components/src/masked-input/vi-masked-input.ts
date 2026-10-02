import { customElement, property } from 'lit/decorators.js';
import { ViInput } from '../input/vi-input.js';

/**
 * vi-masked-input
 * Form-associated single-line text input with masking support (via IMask).
 * Extends \`vi-input\` to reuse its entire UI, layout, and validation behavior.
 *
 * @element vi-masked-input
 *
 * @attr {string} mask     - The mask pattern (e.g. '(000) 000-0000')
 * @attr {string} rawValue - The unmasked underlying value (reflected)
 *
 * @fires {CustomEvent<{value: string, rawValue: string}>} vi-masked-input-change - Fired when the value is committed (e.g. blur)
 * @fires {CustomEvent<{value: string, rawValue: string}>} vi-masked-input-input  - Fired on every keystroke
 */
@customElement('vi-masked-input')
export class ViMaskedInput extends ViInput {
  /**
   * The mask pattern.
   * If not provided, it behaves exactly like a standard vi-input.
   * @attr mask
   */
  @property({ type: String }) accessor mask = '';

  /**
   * Advanced IMask configuration object.
   * Useful for dynamic masks (e.g. Credit Cards) or RegExp masks.
   * Takes precedence over the string \`mask\` property.
   * @prop {any} maskOptions
   */
  @property({ attribute: false }) accessor maskOptions: any = null;

  /**
   * The unmasked, raw underlying value.
   * @attr rawValue
   */
  @property({ type: String, attribute: 'raw-value', reflect: true }) accessor rawValue = '';

  private _maskInstance: any = null;

  override async connectedCallback() {
    super.connectedCallback();

    // Defer initialization slightly to ensure the native <input> is rendered in shadow DOM
    await this.updateComplete;

    // Lazy load IMask only if a mask/maskOptions is provided and component is mounted
    if ((this.mask || this.maskOptions) && !this._maskInstance) {
      const { default: IMask } = await import('imask');
      this._initMask(IMask);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this._maskInstance) {
      this._maskInstance.destroy();
      this._maskInstance = null;
    }
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // If mask pattern or options change dynamically, update, init, or destroy IMask
    if (changedProperties.has('mask') || changedProperties.has('maskOptions')) {
      const hasMask = !!(this.mask || this.maskOptions);

      if (hasMask) {
        if (this._maskInstance) {
          this._maskInstance.updateOptions(this.maskOptions || { mask: this.mask });
        } else {
          import('imask').then(({ default: IMask }) => {
            if ((this.mask || this.maskOptions) && !this._maskInstance) {
              this._initMask(IMask);
            }
          });
        }
      } else if (this._maskInstance) {
        this._maskInstance.destroy();
        this._maskInstance = null;
      }
    }

    // If consumer programmatically sets value, sync it to mask instance
    if (
      changedProperties.has('value') &&
      this._maskInstance &&
      this.value !== this._maskInstance.value
    ) {
      this._maskInstance.value = this.value;
      this.rawValue = this._maskInstance.unmaskedValue;
    }
  }

  private _initMask(IMask: any) {
    const inputEl = this.shadowRoot?.querySelector('input');
    if (!inputEl) return;

    const options = this.maskOptions || { mask: this.mask };

    this._maskInstance = IMask(inputEl, options);

    if (this.rawValue) {
      this._maskInstance.unmaskedValue = this.rawValue;
      this.value = this._maskInstance.value;
    } else if (this.value) {
      this._maskInstance.value = this.value;
      this.rawValue = this._maskInstance.unmaskedValue;
    }

    // Handle cut/paste/type
    this._maskInstance.on('accept', () => {
      // Suppress the native events of ViInput when masked so we don't fire twice
      // We do this by keeping internal states in sync before native handlers fire
      this.value = this._maskInstance.value;
      this.rawValue = this._maskInstance.unmaskedValue;

      this.dispatchEvent(
        new CustomEvent('vi-masked-input-input', {
          detail: { value: this.value, rawValue: this.rawValue },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this._maskInstance.on('complete', () => {
      // Optional hook if we want to add valid states automatically on complete
    });
  }

  // Override the ViInput internal handlers to prevent duplicate firing of standard events
  // We emit our own typed masked events instead.

  protected override _onInput(e: Event) {
    // If mask is active, IMask's 'accept' event handles updating state and firing our custom event.
    // We prevent ViInput's default _onInput from firing a generic 'vi-input-input' event.
    if (!this._maskInstance) {
      super._onInput(e);
    }
  }

  protected override _onChange(e: Event) {
    if (this._maskInstance) {
      this.dispatchEvent(
        new CustomEvent('vi-masked-input-change', {
          detail: { value: this.value, rawValue: this.rawValue },
          bubbles: true,
          composed: true,
        }),
      );
    } else {
      super._onChange(e);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-masked-input': ViMaskedInput;
  }
}
