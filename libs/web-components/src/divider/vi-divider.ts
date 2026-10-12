import {
  css,
  html,
  nothing,
  unsafeCSS,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ViElement } from '../base/vi-element.js';
import dividerStyles from './vi-divider.scss?inline';

export type DividerDirection = 'horizontal' | 'vertical';
export type DividerTextPlacement = 'left' | 'center' | 'right';

/**
 * vi-divider
 * Visual separator rule for segmenting blocks of content, form sections, or inline items.
 *
 * @element vi-divider
 * @attr direction - Separator orientation: 'horizontal' | 'vertical' (default: 'horizontal')
 * @attr text-placement - Text label alignment: 'left' | 'center' | 'right' (default: 'center')
 * @attr text-margin - Custom margin offset from edge for left or right placement
 * @attr dashed - Renders line with a dashed stroke
 * @attr plain - Renders text with regular weight and secondary colour
 *
 * @slot - Default slot for embedded heading/title in a horizontal divider
 *
 * @csspart divider - The root separator container
 * @csspart line-start - Line segment preceding the text label
 * @csspart text - Text label wrapper container
 * @csspart line-end - Line segment following the text label
 */
@customElement('vi-divider')
export class ViDivider extends ViElement {
  static override styles = css`
    ${unsafeCSS(dividerStyles)}
  `;

  @property({ type: String, reflect: true })
  accessor direction: DividerDirection = 'horizontal';

  @property({ type: String, attribute: 'text-placement', reflect: true })
  accessor textPlacement: DividerTextPlacement = 'center';

  @property({ attribute: 'text-margin', reflect: true })
  accessor textMargin: string | number | undefined = undefined;

  @property({ type: Boolean, reflect: true })
  accessor dashed = false;

  @property({ type: Boolean, reflect: true })
  accessor plain = false;

  @state()
  accessor _hasSlottedText = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'separator');
    }
    this.setAttribute('aria-orientation', this.direction);
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('direction')) {
      this.setAttribute('aria-orientation', this.direction);
    }
  }

  private _handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    const hasText = nodes.some((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent ?? '').trim().length > 0;
      }
      return node.nodeType === Node.ELEMENT_NODE;
    });
    this._hasSlottedText = hasText;
  }

  private _getTextMarginStyle(): Record<string, string> {
    if (
      this.textMargin !== undefined &&
      this.textMargin !== null &&
      this.textMargin !== ''
    ) {
      const margin =
        typeof this.textMargin === 'number'
          ? `${this.textMargin}px`
          : /^\d+$/.test(String(this.textMargin))
            ? `${this.textMargin}px`
            : String(this.textMargin);
      return { '--vi-divider-text-margin': margin };
    }
    return {};
  }

  override render(): TemplateResult {
    const isVertical = this.direction === 'vertical';
    const classes = {
      divider: true,
      'divider--vertical': isVertical,
      'divider--horizontal': !isVertical,
      'divider--dashed': this.dashed,
      'divider--plain': this.plain,
      'divider--with-text': !isVertical && this._hasSlottedText,
      [`divider--placement-${this.textPlacement}`]:
        !isVertical && this._hasSlottedText,
    };

    if (isVertical) {
      return html`
        <div
          class=${classMap(classes)}
          part="divider"
          role="separator"
          aria-orientation="vertical"
        ></div>
      `;
    }

    return html`
      <div
        class=${classMap(classes)}
        part="divider"
        role="separator"
        aria-orientation="horizontal"
        style=${styleMap(this._getTextMarginStyle())}
      >
        <span class="divider__line-start" part="line-start"></span>
        <span
          class="divider__text"
          part="text"
          ?hidden=${!this._hasSlottedText}
        >
          <slot @slotchange=${this._handleSlotChange}></slot>
        </span>
        ${this._hasSlottedText
          ? html`<span class="divider__line-end" part="line-end"></span>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-divider': ViDivider;
  }
}
