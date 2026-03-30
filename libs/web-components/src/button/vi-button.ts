import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ViElement, type ViVariant } from '../base/vi-element.js';
import buttonStyles from './vi-button.scss?inline';

/**
 * vi-button
 * Self-styled button component using Flux UI token fallbacks.
 *
 * @element vi-button
 * @attr variant - Button variant: primary, secondary, danger
 * @attr disabled - Disabled state: prevents click events
 */
@customElement('vi-button')
export class ViButton extends ViElement {
  static override styles = css`${unsafeCSS(buttonStyles)}`;

  /**
   * Button variant: primary, secondary, danger.
   * PUBLIC — users set this as <vi-button variant="primary">
   * @attr
   */
  @property({ type: String, reflect: true }) accessor variant: ViVariant = 'primary';

  /**
   * Disabled state: prevents click events/opacity.
   * PUBLIC — users set this as <vi-button disabled>
   * @attr
   */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  private onClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  override render(): TemplateResult {
    return html`
      <button class="button" type="button" ?disabled=${this.disabled} @click=${this.onClick}>
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-button': ViButton;
  }
}
