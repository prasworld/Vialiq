import { css, html, nothing, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ViElement } from '../base/vi-element.js';
import tagStyles from './vi-tag.scss?inline';
import '../icons/vi-icon.js';
import '../button/vi-button.js';
import { registerIcons } from '../icons/registry.js';
import { checkIcon, xIcon } from '@vialiq/icons';

export type TagVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'contrast';

export type TagAppearance = 'subtle' | 'outline' | 'solid';
export type TagSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * vi-tag
 *
 * An interactive, highly customizable label/chip supporting status dots,
 * avatars, selectable filter states, counts, and dismissible remove buttons.
 * Reuses `<vi-button>` and `<vi-icon>` for design system consistency.
 *
 * @element vi-tag
 *
 * @attr {string} variant - Colour variant ('neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'contrast')
 * @attr {string} appearance - Visual style ('subtle' | 'outline' | 'solid')
 * @attr {string} size - Tag size ('xs' | 'sm' | 'md' | 'lg')
 * @attr {boolean} pill - Renders fully rounded pill shape (9999px radius)
 * @attr {boolean} dot - Renders a status dot indicator prefix
 * @attr {number} count - Numeric counter badge suffix
 * @attr {boolean} removable - Shows a removable button
 * @attr {boolean} selectable - Enables interactive selection toggle mode
 * @attr {boolean} selected - Active selected state
 * @attr {boolean} disabled - Disables interactions
 *
 * @slot - Default slot for tag label text
 * @slot icon - Leading icon slot
 * @slot avatar - Avatar image/thumbnail slot
 * @slot suffix - Suffix element slot (after label/count)
 *
 * @fires vi-tag-remove - Fired when remove button is clicked or Delete/Backspace key is pressed.
 * @fires vi-tag-select - Fired when tag is clicked in selectable mode.
 *
 * @csspart tag - The tag container `<span>`
 * @csspart icon - Leading icon slot wrapper
 * @csspart avatar - Avatar slot wrapper
 * @csspart label - Label text wrapper
 * @csspart count - Counter badge wrapper
 * @csspart remove-btn - The remove button wrapper
 */
@customElement('vi-tag')
export class ViTag extends ViElement {
  static override styles = css`
    ${unsafeCSS(tagStyles)}
  `;

  /** Colour variant */
  @property({ type: String, reflect: true }) accessor variant: TagVariant = 'neutral';

  /** Visual appearance mode */
  @property({ type: String, reflect: true }) accessor appearance: TagAppearance = 'subtle';

  /** Size scale */
  @property({ type: String, reflect: true }) accessor size: TagSize = 'md';

  /** Fully rounded pill shape (9999px radius) */
  @property({ type: Boolean, reflect: true }) accessor pill = false;

  /** Status dot indicator prefix */
  @property({ type: Boolean, reflect: true }) accessor dot = false;

  /** Suffix count badge value */
  @property({ type: Number }) accessor count: number | undefined = undefined;

  /** Show remove button */
  @property({ type: Boolean }) accessor removable = false;

  /** Interactive selectable filter mode */
  @property({ type: Boolean, reflect: true }) accessor selectable = false;

  /** Selected/active state */
  @property({ type: Boolean, reflect: true }) accessor selected = false;

  /** Disable interactions */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  private static _iconsRegistered = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!ViTag._iconsRegistered) {
      registerIcons([xIcon, checkIcon]);
      ViTag._iconsRegistered = true;
    }
    if (this.closest('[role="list"]') !== null && !this.hasAttribute('role')) {
      this.setAttribute('role', 'listitem');
    }
  }

  private _handleTagClick(_e?: Event): void {
    if (this.disabled || !this.selectable) return;

    this.selected = !this.selected;
    this.dispatchEvent(
      new CustomEvent('vi-tag-select', {
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
    } else if ((e.key === 'Enter' || e.key === ' ') && this.selectable) {
      e.preventDefault();
      this._handleTagClick();
    }
  }

  private _handleSlotChange(): void {
    this.requestUpdate();
  }

  private _fireRemoveEvent(): void {
    this.dispatchEvent(
      new CustomEvent('vi-tag-remove', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private get _removeLabel(): string {
    return `Remove ${this.textContent?.trim() || 'tag'}`;
  }

  override render(): TemplateResult {
    const isTabbable = (this.selectable || this.removable) && !this.disabled;

    const classes = {
      'tag': true,
      [`variant-${this.variant}`]: true,
      [`appearance-${this.appearance}`]: true,
      [`size-${this.size}`]: true,
      'tag--pill': this.pill,
      'tag--removable': this.removable,
      'tag-clickable': !this.disabled && this.selectable,
      'tag-selected': this.selected,
      'is-disabled': this.disabled,
    };

    return html`
      <span
        part="tag"
        class=${classMap(classes)}
        aria-disabled=${this.disabled ? 'true' : 'false'}
      >
        <span
          class="tag-content-wrapper"
          role=${this.selectable ? 'button' : nothing}
          tabindex=${this.disabled ? '-1' : (isTabbable ? 0 : nothing)}
          aria-disabled=${this.disabled ? 'true' : 'false'}
          aria-pressed=${this.selectable ? (this.selected ? 'true' : 'false') : nothing}
          @click=${this.selectable ? this._handleTagClick : nothing}
          @keydown=${this._handleKeyDown}
        >
          ${this.dot ? html`<span part="dot" class="tag-dot" aria-hidden="true"></span>` : ''}
          ${this.selectable && this.selected
            ? html`
                <span part="checkmark" class="tag-checkmark" aria-hidden="true">
                  <vi-icon name="check" size="12"></vi-icon>
                </span>
              `
            : ''}
          <span part="avatar" class="tag-avatar">
            <slot name="avatar"></slot>
          </span>
          <span part="icon" class="tag-icon">
            <slot name="icon"></slot>
          </span>
          <span part="label" class="tag-label">
            <slot @slotchange=${this._handleSlotChange}></slot>
          </span>
          ${this.count !== undefined
            ? html`<span part="count" class="tag-count">${this.count}</span>`
            : ''}
          <slot name="suffix"></slot>
        </span>
        ${this.removable
          ? html`
              <vi-button
                part="remove-btn"
                exportparts="button: remove-btn-button, icon: remove-btn-icon"
                class="tag-remove-btn"
                variant="ghost"
                size="xs"
                icon-only
                ?disabled=${this.disabled}
                @click=${this._handleRemoveClick}
              >
                <vi-icon slot="icon" name="x" size="12" aria-hidden="true"></vi-icon>
                <span class="sr-only">${this._removeLabel}</span>
              </vi-button>
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
