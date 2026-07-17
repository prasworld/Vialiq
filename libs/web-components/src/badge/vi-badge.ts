import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
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
 * @slot         - Badge text content (omit when using dot or count)
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

  /** Show coloured dot instead of text */
  @property({ type: Boolean, reflect: true }) accessor dot = false;

  /** Fully rounded (pill shape) vs. square */
  @property({ type: Boolean, reflect: true }) accessor pill = true;

  /** Numeric count to display */
  @property({ type: Number }) accessor count: number | undefined = undefined;

  /** Max count before showing {max}+ */
  @property({ type: Number }) accessor max = 99;

  /** Outlined/ghost style */
  @property({ type: Boolean, reflect: true }) accessor outline = false;

  override connectedCallback(): void {
    super.connectedCallback();
  }

  override render(): TemplateResult {
    let content: TemplateResult | string = html`<slot></slot>`;

    if (this.dot) {
      content = html`<span part="dot" class="dot"></span>`;
    } else if (this.count !== undefined) {
      content = this.count > this.max ? `${this.max}+` : `${this.count}`;
    }

    return html`
      <span class="badge" part="badge">
        <slot name="icon" part="icon" class="icon"></slot>
        ${content}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-badge': ViBadge;
  }
}
