import { css, html, unsafeCSS, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FocusableMixin } from '../base/focusable-mixin.js';
import { ViElement } from '../base/vi-element.js';
import radioStyles from './vi-radio.scss?inline';

// We import the group type to support resolving closest parent
import type { ViRadioGroup } from './vi-radio-group.js';

/**
 * vi-radio
 * Individual radio option within a vi-radio-group.
 *
 * NOTE: For correct roving tabindex, form submission, and mutual exclusivity,
 * vi-radio should be used inside a vi-radio-group. Standalone usage is supported (e.g. for
 * custom layout structures), but keyboard navigation and form association must be handled manually.
 *
 * @element vi-radio
 * @slot - Label text/content.
 *
 * @csspart circle - The visual outer circle wrapper.
 * @csspart dot - The visual inner dot indicator.
 * @csspart label - The label text span.
 */
@customElement('vi-radio')
export class ViRadio extends FocusableMixin(ViElement) {
  static override styles = css`
    ${unsafeCSS(radioStyles)}
  `;

  protected override get _focusableElement(): HTMLInputElement | null {
    return this.shadowRoot?.querySelector('input') ?? null;
  }

  /** The value this radio represents. */
  @property({ type: String }) accessor value = '';

  /** Selected state (managed by vi-radio-group). */
  @property({ type: Boolean, reflect: true }) accessor checked = false;

  /** Disabled state. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Shared name for the radio group (synced by parent). */
  @property({ type: String }) accessor name = '';

  private get _group(): ViRadioGroup | null {
    return this.closest('vi-radio-group');
  }

  /** Computes the effective disabled state based on local state and parent group state. */
  private get _isEffectiveDisabled(): boolean {
    return this.disabled || (this._group?.disabled ?? false);
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);

    // If standalone, sync the host focusability with disabled state changes
    if (!this._group && changed.has('disabled')) {
      this._setHostFocusable(!this.disabled);
    }

    // Sync inner input's tabindex with host's tabIndex (which is managed by parent vi-radio-group or FocusableMixin)
    const input = this._focusableElement;
    if (input && input.tabIndex !== this.tabIndex) {
      input.tabIndex = this.tabIndex;
    }
  }

  protected override _setHostFocusable(enabled: boolean): void {
    if (this._group) {
      // No-op: parent vi-radio-group manages host's tabIndex for roving tabindex compliance
      return;
    }
    super._setHostFocusable(enabled);
  }

  private _onChange(e: Event): void {
    e.stopPropagation();
    if (this._isEffectiveDisabled) return;

    this.checked = true;
    this.dispatchEvent(
      new CustomEvent('vi-radio-checked', {
        bubbles: true,
        composed: true,
      })
    );
  }

  override render(): TemplateResult {
    const isValDisabled = this._isEffectiveDisabled;

    return html`
      <label class="radio-wrapper ${isValDisabled ? 'radio-wrapper--disabled' : ''}">
        <input
          type="radio"
          class="radio-input"
          tabindex="0"
          .name=${this.name}
          .value=${this.value}
          .checked=${this.checked}
          ?disabled=${isValDisabled}
          @change=${this._onChange}
        />
        <span part="circle" class="radio-circle" aria-hidden="true">
          <span part="dot" class="radio-dot"></span>
        </span>
        <span part="label" class="radio-label">
          <slot></slot>
        </span>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-radio': ViRadio;
  }
}
