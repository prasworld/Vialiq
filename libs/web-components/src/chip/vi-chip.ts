import { css, html, unsafeCSS, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { FocusableMixin } from '../base/focusable-mixin.js';
import { ViElement } from '../base/vi-element.js';
import '../icons/vi-icon.js';
import '../button/vi-button.js';
import chipStyles from './vi-chip.scss?inline';

export type ChipVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type ChipSize = 'sm' | 'md' | 'lg';

/**
 * vi-chip
 * An interactive pill/chip component representing a discrete value.
 *
 * @element vi-chip
 * @attr value     - Value for group selection tracking
 * @attr selected  - Selected / active state
 * @attr disabled  - Chip is not interactive
 * @attr removable - Show × remove button
 * @attr variant   - Base colour: neutral | primary | success | warning | danger | info (default: neutral)
 * @attr size      - Chip size: sm | md | lg (default: md)
 *
 * @slot               - Chip label text
 * @slot avatar        - Leading avatar image or initials
 * @slot icon          - Leading icon (used when no avatar)
 * @slot trailing-icon - Trailing icon (separate from remove button)
 *
 * @csspart chip          - The <button> or <div> root
 * @csspart avatar        - Avatar slot wrapper
 * @csspart icon          - Leading icon slot wrapper
 * @csspart label         - Label text span
 * @csspart trailing-icon - Trailing icon slot wrapper
 * @csspart remove-btn    - × remove button
 * @csspart check-icon    - Checkmark when selected
 *
 * @fires vi-chip-select - Fired when the chip is clicked / activated
 * @fires vi-chip-remove - Fired when the × remove button is clicked
 */
@customElement('vi-chip')
export class ViChip extends FocusableMixin(ViElement) {
  static override styles = css`${unsafeCSS(chipStyles)}`;

  protected override get _focusableElement(): HTMLElement | null {
    return this.shadowRoot?.querySelector('button') ?? null;
  }

  /** Value for group selection tracking. */
  @property({ type: String, reflect: true }) accessor value = '';

  /** Selected / active state. */
  @property({ type: Boolean, reflect: true }) accessor selected = false;

  /** Disables the chip. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Show × remove button. */
  @property({ type: Boolean, reflect: true }) accessor removable = false;

  /** Screen reader text for the remove button (default: 'Remove') */
  @property({ type: String, attribute: 'remove-aria-label' }) accessor removeAriaLabel = 'Remove';

  /** Base colour. */
  @property({ type: String, reflect: true }) accessor variant: ChipVariant = 'neutral';

  /** Chip size. */
  @property({ type: String, reflect: true }) accessor size: ChipSize = 'md';

  @state() private accessor _inGroup = false;
  @state() private accessor _hasAvatar = false;
  @state() private accessor _hasIcon = false;
  @state() private accessor _hasTrailingIcon = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this._inGroup = this.closest('vi-chip-group') !== null;
    this._syncSlotsFromLightDom();
  }

  override firstUpdated(changed: PropertyValues): void {
    super.firstUpdated(changed);
    this._syncSlots();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('disabled')) {
      if (this.disabled) {
        this._setHostFocusable(false);
      } else if (changed.get('disabled') !== undefined) {
        this._setHostFocusable(true);
      }
    }
  }

  private _syncSlotsFromLightDom(): void {
    if (this.querySelector('[slot="avatar"]')) this._hasAvatar = true;
    if (this.querySelector('[slot="icon"]')) this._hasIcon = true;
    if (this.querySelector('[slot="trailing-icon"]')) this._hasTrailingIcon = true;
  }

  private _syncSlots(): void {
    const avatarSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="avatar"]');
    const iconSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="icon"]');
    const trailingSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trailing-icon"]');

    if (avatarSlot) {
      this._hasAvatar = avatarSlot.assignedElements({ flatten: true }).length > 0;
    }
    if (iconSlot) {
      this._hasIcon = iconSlot.assignedElements({ flatten: true }).length > 0;
    }
    if (trailingSlot) {
      this._hasTrailingIcon = trailingSlot.assignedElements({ flatten: true }).length > 0;
    }
  }

  private onAvatarSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this._hasAvatar = slot.assignedElements({ flatten: true }).length > 0;
  }

  private onIconSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this._hasIcon = slot.assignedElements({ flatten: true }).length > 0;
  }

  private onTrailingIconSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this._hasTrailingIcon = slot.assignedElements({ flatten: true }).length > 0;
  }

  private _handleSelect(e: Event): void {
    if (this.disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    this.dispatchEvent(
      new CustomEvent('vi-chip-select', {
        detail: { value: this.value, selected: !this.selected },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleRemove(e: Event): void {
    if (this.disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('vi-chip-remove', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (this.disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleSelect(e);
    } else if (this.removable && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault();
      this._handleRemove(e);
    }
  }

  override render(): TemplateResult {
    const role = this._inGroup ? 'option' : 'button';
    const ariaSelected = this._inGroup ? (this.selected ? 'true' : 'false') : null;
    const ariaPressed = !this._inGroup ? (this.selected ? 'true' : 'false') : null;

    return html`
      <button
        part="chip"
        type="button"
        role=${role}
        aria-selected=${ariaSelected ?? undefined}
        aria-pressed=${ariaPressed ?? undefined}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${this.disabled ? -1 : 0}
        @click=${this._handleSelect}
        @keydown=${this._handleKeyDown}
      >
        <slot name="avatar" class="chip-avatar" @slotchange=${this.onAvatarSlotChange} ?hidden=${!this._hasAvatar}></slot>
        <slot name="icon" class="chip-icon" @slotchange=${this.onIconSlotChange} ?hidden=${this._hasAvatar || !this._hasIcon}></slot>

        ${this.selected ? html`<vi-icon part="check-icon" name="check" size="12"></vi-icon>` : ''}

        <span part="label" class="chip-label">
          <slot></slot>
        </span>

        <slot name="trailing-icon" @slotchange=${this.onTrailingIconSlotChange} ?hidden=${!this._hasTrailingIcon}></slot>

        ${this.removable ? html`
          <vi-button
            part="remove-btn"
            variant="ghost"
            size="xs"
            icon-only
            aria-label=${this.removeAriaLabel || 'Remove'}
            @click=${this._handleRemove}
            tabindex=${this.disabled ? -1 : 0}
          >
            <vi-icon name="x" size="12" slot="icon"></vi-icon>
          </vi-button>
        ` : ''}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-chip': ViChip;
  }
}
