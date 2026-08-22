import { html, css, unsafeCSS, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ViElement } from '../base/vi-element.js';
import labelStyles from './vi-label.scss?inline';

export type LabelSize = 'sm' | 'md' | 'lg';
export type LabelLayout = 'stacked' | 'inline';
export type LabelType = 'default' | 'primary' | 'secondary';

/**
 * `vi-label`
 *
 * A styled `<label>` element for associating visible text with form controls.
 *
 * @element vi-label
 *
 * @attr {string} for - ID of the associated control
 * @attr {boolean} required - Show required `*` indicator
 * @attr {boolean} optional - Show "(optional)" text
 * @attr {boolean} disabled - Muted disabled styling
 * @attr {string} size - Font size variant ('sm', 'md', 'lg')
 *
 * @slot - Default slot for label text
 * @slot tooltip - Inline help icon that triggers a tooltip
 *
 * @csspart label - The `<label>` element
 * @csspart required-indicator - The `*` asterisk `<span>`
 * @csspart optional-indicator - The "(optional)" `<span>`
 * @csspart tooltip-trigger - Tooltip icon wrapper
 */
@customElement('vi-label')
export class ViLabel extends ViElement {
  static override styles = css`
    ${unsafeCSS(labelStyles)}
  `;

  /** ID of the associated control */
  @property({ type: String }) accessor for = '';

  /** Show required `*` indicator */
  @property({ type: Boolean }) accessor required = false;

  /** Show "(optional)" text */
  @property({ type: Boolean }) accessor optional = false;

  /** Muted disabled styling */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Font size variant */
  @property({ type: String }) accessor size: LabelSize = 'md';

  /** Layout spacing behavior */
  @property({ type: String, reflect: true }) accessor layout: LabelLayout = 'stacked';

  /** Semantic text color */
  @property({ type: String, reflect: true }) accessor type: LabelType = 'default';

  private _hasTooltip = false;

  private _handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    this._hasTooltip = nodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE ||
        (node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim())),
    );
    this.requestUpdate();
  }

  private _handleClick(e: MouseEvent): void {
    if (this.disabled || !this.for) return;
    e.preventDefault();

    // Cross shadow boundary workaround
    const rootNode = this.getRootNode() as Document | ShadowRoot;
    const target = rootNode.getElementById(this.for);
    if (target) {
      target.focus();
      if ('click' in target && typeof (target as HTMLElement).click === 'function') {
        (target as HTMLElement).click();
      }
    }
  }

  override render(): TemplateResult {
    const classes = {
      'vi-label': true,
      [`size-${this.size}`]: true,
      'is-disabled': this.disabled,
    };

    return html`
      <label part="label" class=${classMap(classes)} for=${this.for || nothing} @click=${this._handleClick}>
        <slot></slot>

        ${this.required
          ? html`
              <span part="required-indicator" class="vi-label-required" aria-hidden="true">*</span>
            `
          : nothing}

        ${this.optional && !this.required
          ? html`
              <span part="optional-indicator" class="vi-label-optional">(optional)</span>
            `
          : nothing}

        <slot name="tooltip" @slotchange=${this._handleSlotChange} style=${!this._hasTooltip ? 'display: none;' : nothing}></slot>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-label': ViLabel;
  }
}
