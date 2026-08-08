import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ViElement } from '../base/vi-element.js';
import tagStyles from './vi-tag.scss?inline';
import '../icons/vi-icon.js';
import { registerIcons } from '../icons/registry.js';
import { xIcon } from '@vialiq/icons';

export type TagVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
export type TagSize = 'sm' | 'md' | 'lg';

/**
 * vi-tag
 *
 * An interactive label/chip that can be removed (dismissed) by the user.
 *
 * @element vi-tag
 *
 * @slot - Default slot for tag label text
 * @slot icon - Leading icon
 *
 * @fires vialiq-remove - Fired when the remove button is clicked or Delete/Backspace is pressed.
 * @fires vialiq-select - Fired when the tag is clicked (toggles selected state).
 *
 * @csspart tag - The tag container \`<span>\`
 * @csspart icon - Leading icon slot wrapper
 * @csspart label - Label text wrapper
 * @csspart remove-btn - The × remove button
 */
@customElement('vi-tag')
export class ViTag extends ViElement {
  static override styles = css`
    ${unsafeCSS(tagStyles)}
  `;

  /** Colour variant */
  @property({ type: String, reflect: true }) accessor variant: TagVariant = 'neutral';

  /** Size */
  @property({ type: String, reflect: true }) accessor size: TagSize = 'md';

  /** Show remove (×) button */
  @property({ type: Boolean }) accessor removable = false;

  /** Selected/active state */
  @property({ type: Boolean, reflect: true }) accessor selected = false;

  /** Disable interactions */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  override connectedCallback(): void {
    super.connectedCallback();
    registerIcons([xIcon]);
  }

  private _handleTagClick(_e?: Event): void {
    if (this.disabled) return;

    // As per requirement: vi-tag interactive, can be selected, toggled, or removed
    // A click on the tag toggles the selection and fires vialiq-select
    this.selected = !this.selected;

    this.dispatchEvent(
      new CustomEvent('vialiq-select', {
        bubbles: true,
        composed: true,
        detail: { selected: this.selected },
      })
    );
  }

  private _handleRemoveClick(e: Event): void {
    e.stopPropagation();
    if (this.disabled) return;
    this._fireRemoveEvent();
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (this.disabled) return;

    if (this.removable && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      this._fireRemoveEvent();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleTagClick();
    }
  }

  private _fireRemoveEvent(): void {
    this.dispatchEvent(
      new CustomEvent('vialiq-remove', {
        bubbles: true,
        composed: true,
      })
    );
  }

  override render(): TemplateResult {
    const isInteractive = this.hasAttribute('selected') || this.selected || this.hasAttribute('@vialiq-select');
    const isListitem = this.closest('[role="list"]') !== null;

    const classes = {
      'tag': true,
      [`variant-${this.variant}`]: true,
      [`size-${this.size}`]: true,
      'tag-clickable': !this.disabled && isInteractive,
      'tag-selected': this.selected,
      'is-disabled': this.disabled,
    };

    return html`
      <span
        part="tag"
        class=${classMap(classes)}
        role=${isListitem ? 'listitem' : undefined}
        aria-disabled=${this.disabled ? 'true' : 'false'}
      >
        <span
          class="tag-content-wrapper"
          role=${isInteractive ? 'button' : undefined}
          tabindex=${this.disabled ? '-1' : (isInteractive ? '0' : undefined)}
          aria-pressed=${isInteractive ? (this.selected ? 'true' : 'false') : undefined}
          @click=${this._handleTagClick}
          @keydown=${this._handleKeyDown}
          style=${isInteractive ? 'display: inline-flex; align-items: center; outline: none; border-radius: inherit;' : 'display: inline-flex; align-items: center;'}
        >
          <span part="icon" class="tag-icon">
            <slot name="icon"></slot>
          </span>
          <span part="label" class="tag-label">
            <slot></slot>
          </span>
        </span>
        ${this.removable
          ? html`
              <button
                part="remove-btn"
                class="tag-remove-btn"
                aria-label="Remove ${this.textContent?.trim() || 'tag'}"
                tabindex=${this.disabled ? '-1' : '0'}
                ?disabled=${this.disabled}
                @click=${this._handleRemoveClick}
              >
                <vi-icon name="x"></vi-icon>
              </button>
            `
          : ''}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-tag': ViTag;
  }
}
