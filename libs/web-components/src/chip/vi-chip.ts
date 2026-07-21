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
 * @fires vialiq-select - Fired when the chip is clicked / activated
 * @fires vialiq-remove - Fired when the × remove button is clicked
 */
@customElement('vi-chip')
export class ViChip extends FocusableMixin(ViElement) {
  static override styles = css`${unsafeCSS(chipStyles)}`;

  protected override get _focusableElement(): HTMLElement | null {
    return this.shadowRoot?.querySelector('[part="chip"]') ?? null;
  }

  /** Value for group selection tracking. */
  @property({ type: String }) accessor value = '';

  /** Selected / active state. */
  @property({ type: Boolean, reflect: true }) accessor selected = false;

  /** Disables the chip. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Show × remove button. */
  @property({ type: Boolean, reflect: true }) accessor removable = false;

  /** Screen reader text for the remove button */
  @property({ type: String, attribute: 'remove-label' }) accessor removeLabel =
    'Remove';
  /** Alias for remove-label */
  @property({ type: String, attribute: 'remove-aria-label' })
  accessor removeAriaLabel: string | undefined;

  /** Base colour. */
  @property({ type: String, reflect: true }) accessor variant: ChipVariant = 'neutral';

  /** Chip size. */
  @property({ type: String, reflect: true }) accessor size: ChipSize = 'md';

  /** Host tabIndex reflecting host focusability for roving tabindex */
  @property({ type: Number, attribute: 'tabindex', reflect: true })
  override accessor tabIndex = 0;

  @state() private accessor _inGroup = false;
  @state() private accessor _hasAvatar = false;
  @state() private accessor _hasIcon = false;
  @state() private accessor _hasTrailingIcon = false;

  private _userDisabled = false;

  /** Gets whether the chip itself was set as disabled (independent of group) */
  get isSelfDisabled(): boolean {
    return this._userDisabled;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._inGroup = this.closest('vi-chip-group') !== null;
    this._userDisabled = this.hasAttribute('disabled');
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('disabled')) {
      if (!this._inGroup) {
        this._userDisabled = this.disabled;
      }
      if (this.disabled) {
        this._setHostFocusable(false);
      } else if (changed.get('disabled') !== undefined) {
        this._setHostFocusable(true);
      }
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
    const path = e.composedPath();
    if (path.some(el => el instanceof HTMLElement && el.getAttribute('part') === 'remove-btn')) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent('vialiq-select', {
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
      new CustomEvent('vialiq-remove', {
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
    const buttonTabIndex = this.disabled ? -2 : (this.tabIndex >= 0 ? 0 : -1);
    const removeBtnTabIndex = this.disabled ? -2 : -1;

    return html`
      <div
        part="chip"
        role=${role}
        aria-selected=${ariaSelected ?? undefined}
        aria-pressed=${ariaPressed ?? undefined}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${buttonTabIndex}
        @click=${this._handleSelect}
        @keydown=${this._handleKeyDown}
      >
        <slot
          name="avatar"
          class="chip-avatar"
          @slotchange=${this.onAvatarSlotChange}
          ?hidden=${!this._hasAvatar}
        ></slot>
        <slot
          name="icon"
          class="chip-icon"
          @slotchange=${this.onIconSlotChange}
          ?hidden=${this._hasAvatar || !this._hasIcon}
        ></slot>

        ${this.selected
          ? html`<vi-icon part="check-icon" name="check" size="12"></vi-icon>`
          : ''}

        <span part="label" class="chip-label">
          <slot></slot>
        </span>

        <slot
          name="trailing-icon"
          @slotchange=${this.onTrailingIconSlotChange}
          ?hidden=${!this._hasTrailingIcon}
        ></slot>

        ${this.removable
          ? html`
              <vi-button
                part="remove-btn"
                variant="ghost"
                size="xs"
                icon-only
                ?disabled=${this.disabled}
                aria-label=${this.removeAriaLabel ?? this.removeLabel}
                @click=${this._handleRemove}
                tabindex=${removeBtnTabIndex}
              >
                <vi-icon name="x" size="12" slot="icon"></vi-icon>
              </vi-button>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-chip': ViChip;
  }
}
