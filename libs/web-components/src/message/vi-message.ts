import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import messageStyles from './vi-message.scss?inline';
import '../icons/vi-icon.js';
import { registerIcons } from '../icons/registry.js';
import { checkCircleIcon, triangleWarningIcon, infoIcon, circleXIcon, pendingIcon } from '@vialiq/icons';

registerIcons([checkCircleIcon, triangleWarningIcon, infoIcon, circleXIcon, pendingIcon]);

export type MessageVariant = 'info' | 'success' | 'warning' | 'error' | 'loading';

/**
 * vi-message
 * Ephemeral global feedback message.
 *
 * @element vi-message
 * @attr variant - Colour semantic: info | success | warning | error | loading
 * @attr duration - Auto-dismiss ms; 0 = sticky
 * @attr paused - Timer paused (e.g. on hover)
 */
@customElement('vi-message')
export class ViMessage extends ViElement {
  static override styles = css`
    ${unsafeCSS(messageStyles)}
  `;

  @property({ type: String, reflect: true }) accessor variant: MessageVariant = 'info';
  @property({ type: String }) accessor content = '';
  @property({ type: Number }) accessor duration = 3000;
  @property({ type: Boolean, reflect: true }) accessor paused = false;
  @property({ type: String }) accessor icon = '';

  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _startTime = 0;
  private _remainingTime = 0;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'status');
    this.setAttribute('aria-live', 'polite');
    
    if (this.duration > 0 && this.variant !== 'loading') {
      this._remainingTime = this.duration;
      this.startTimer();
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.clearTimer();
  }
  
  override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('paused')) {
      if (this.paused) {
        this.pauseTimer();
      } else {
        this.resumeTimer();
      }
    }
    if (changedProperties.has('duration') || changedProperties.has('variant')) {
      // If variant changed to non-loading, ensure we have a timer if duration > 0
      if (this.duration > 0 && this.variant !== 'loading') {
        if (!this._timer && this._remainingTime <= 0) {
          this._remainingTime = this.duration;
        }
        this.startTimer();
      } else if (this.variant === 'loading') {
        this.clearTimer(); // Loading messages usually stay until resolved manually
      }
    }
  }

  private startTimer() {
    if (this.duration <= 0 || this._remainingTime <= 0 || this.variant === 'loading') return;
    this.clearTimer();
    this._startTime = Date.now();
    this._timer = setTimeout(() => {
      this.handleDismiss('auto');
    }, this._remainingTime);
  }

  private pauseTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
      this._remainingTime -= Date.now() - this._startTime;
    }
  }
  
  private resumeTimer() {
    if (this._remainingTime > 0) {
      this.startTimer();
    }
  }

  private clearTimer() {
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  private handleDismiss(reason: 'auto' | 'user' = 'user') {
    this.dispatchEvent(
      new CustomEvent('vialiq-close', {
        bubbles: true,
        composed: true,
        detail: { reason, id: this.id },
      })
    );
  }

  private get defaultIcon(): string {
    if (this.icon) return this.icon;
    switch (this.variant) {
      case 'success': return 'check-circle';
      case 'warning': return 'triangle-warning';
      case 'error': return 'circle-x';
      case 'loading': return 'pending';
      case 'info':
      default: return 'info';
    }
  }

  override render(): TemplateResult {
    return html`
      <div part="message" class="message-root" data-variant=${this.variant}>
        <div part="icon" class="message-icon">
          <slot name="icon">
            <vi-icon name=${this.defaultIcon} aria-hidden="true"></vi-icon>
          </slot>
        </div>
        <div part="content" class="message-content">
          <slot>${this.content}</slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-message': ViMessage;
  }
}
