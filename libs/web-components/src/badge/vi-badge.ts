import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import badgeStyles from './vi-badge.scss?inline';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * vi-badge
 * A compact inline indicator used to communicate status, category, or count.
 *
 * @element vi-badge
 * @attr variant - Colour semantic: neutral | primary | success | warning | danger | info (default: neutral)
 * @attr size    - Size: sm | md | lg (default: md)
 * @attr dot     - Show coloured dot instead of text
 * @attr pill    - Fully rounded (pill shape) vs. square (default: true)
 * @attr count   - Numeric count to display
 * @attr max     - Max count before showing {max}+
 * @attr outline - Outlined/ghost style
 *
 * @slot         - Badge text content
 * @slot icon    - Optional leading icon
 *
 * @csspart badge - The badge <span> element
 * @csspart dot   - The dot indicator circle
 * @csspart icon  - Icon slot wrapper
 */
@customElement('vi-badge')
export class ViBadge extends ViElement {
  static override styles = css`${unsafeCSS(badgeStyles)}`;

  /** Colour semantic */
  @property({ type: String, reflect: true }) accessor variant: BadgeVariant = 'neutral';

  /** Size */
  @property({ type: String, reflect: true }) accessor size: BadgeSize = 'md';

  /** Show coloured dot */
  @property({ type: Boolean, reflect: true }) accessor dot = false;

  /** Fully rounded (pill shape) vs. square */
  @property({ type: Boolean, reflect: true }) accessor pill = true;

  /** Numeric count to display */
  @property({ type: Number, reflect: true }) accessor count: number | undefined = undefined;

  /** Show the badge even if the count is zero */
  @property({ type: Boolean, reflect: true, attribute: 'show-zero' }) accessor showZero = false;

  /** Max count before showing {max}+ */
  @property({ type: Number }) accessor max = 99;

  /** Outlined/ghost style */
  @property({ type: Boolean, reflect: true }) accessor outline = false;

  @state() private accessor _hasIcon = false;
  @state() private accessor _hasDefaultSlot = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.updateAriaHidden();
  }

  override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('dot') || changedProperties.has('count') || changedProperties.has('showZero') || changedProperties.has('_hasDefaultSlot')) {
      this.updateAriaHidden();
    }
  }

  private updateAriaHidden(): void {
    const isPurelyDecorative = this.dot && !this._hasDefaultSlot && this.count === undefined && !this.hasAttribute('aria-label') && !this.hasAttribute('aria-labelledby');
    if (isPurelyDecorative) {
      this.setAttribute('aria-hidden', 'true');
    } else {
      this.removeAttribute('aria-hidden');
    }
  }

  private onIconSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this._hasIcon = slot.assignedElements({ flatten: true }).length > 0;
  }

  private onDefaultSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this._hasDefaultSlot = slot.assignedNodes({ flatten: true }).some(node => {
      // Check if it's text with actual content or an element
      return (node.nodeType === Node.TEXT_NODE && node.textContent?.trim().length) || node.nodeType === Node.ELEMENT_NODE;
    });
    this.updateAriaHidden();
  }

  override render(): TemplateResult {
    let countContent: TemplateResult | string = '';
    // If count is defined, render it, and we do not render the default slot content
    const hideDefaultSlot = this.count !== undefined;

    if (this.count !== undefined) {
      countContent = html`${this.count > this.max ? `${this.max}+` : `${this.count}`}`;
    }

    const dotContent = this.dot ? html`<span part="dot" class="dot"></span>` : '';

    return html`
      <span class="badge ${this.dot && !this._hasDefaultSlot && this.count === undefined ? 'dot-only' : ''}" part="badge">
        <slot
          name="icon"
          part="icon"
          class="icon"
          ?hidden=${!this._hasIcon}
          @slotchange=${this.onIconSlotChange}
        ></slot>
        ${dotContent}
        ${countContent}
        <slot ?hidden=${hideDefaultSlot} @slotchange=${this.onDefaultSlotChange}></slot>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-badge': ViBadge;
  }
}
