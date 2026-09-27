import { css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import containerStyles from './vi-toast-container.scss?inline';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

@customElement('vi-toast-container')
export class ViToastContainer extends ViElement {
  static override styles = css`
    ${unsafeCSS(containerStyles)}
  `;

  @property({ type: String, reflect: true }) accessor position: ToastPosition = 'top-right';
  @property({ type: Number }) accessor maxVisible = 5;

  private _handleMouseEnter = () => {
    // Pause all toasts
    const toasts = this.querySelectorAll('vi-toast');
    toasts.forEach(toast => {
      toast.paused = true;
    });
  };

  private _handleMouseLeave = () => {
    // Resume all toasts
    const toasts = this.querySelectorAll('vi-toast');
    toasts.forEach(toast => {
      toast.paused = false;
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
      <div class="toast-stack" part="stack">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-toast-container': ViToastContainer;
  }
}
