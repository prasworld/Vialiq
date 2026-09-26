import { css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import containerStyles from './vi-message-container.scss?inline';

@customElement('vi-message-container')
export class ViMessageContainer extends ViElement {
  static override styles = css`
    ${unsafeCSS(containerStyles)}
  `;

  @property({ type: Number }) accessor maxVisible = 5;

  private _handleMouseEnter = () => {
    // Pause all messages
    const messages = this.querySelectorAll('vi-message');
    messages.forEach(msg => {
      msg.paused = true;
    });
  };

  private _handleMouseLeave = () => {
    // Resume all messages
    const messages = this.querySelectorAll('vi-message');
    messages.forEach(msg => {
      msg.paused = false;
    });
  };

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('mouseenter', this._handleMouseEnter);
    this.addEventListener('mouseleave', this._handleMouseLeave);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('mouseenter', this._handleMouseEnter);
    this.removeEventListener('mouseleave', this._handleMouseLeave);
  }

  override render() {
    return html`
      <div class="message-stack" part="stack">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-message-container': ViMessageContainer;
  }
}
