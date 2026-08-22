import { html, css, unsafeCSS, nothing, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ViElement } from '../base/vi-element.js';
import labelStyles from './vi-label.scss?inline';

export type LabelSize = 'sm' | 'md' | 'lg';

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

  override render(): TemplateResult {
    const classes = {
      'vi-label': true,
      [`size-${this.size}`]: true,
      'is-disabled': this.disabled,
    };

    return html`
      <label part="label" class=${classMap(classes)} for=${this.for || nothing}>
        <slot></slot>

        ${this.required
          ? html`
              <span part="required-indicator" class="vi-label-required" aria-hidden="true">*</span>
            `
          : nothing}

        ${this.optional
          ? html`
              <span part="optional-indicator" class="vi-label-optional">(optional)</span>
            `
          : nothing}

        <slot name="tooltip"></slot>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-label': ViLabel;
  }
}
