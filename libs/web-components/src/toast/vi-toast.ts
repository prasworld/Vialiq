import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import toastStyles from './vi-toast.scss?inline';
import '../icons/vi-icon.js';
import '../button/vi-button.js';
import { registerIcons } from '../icons/registry.js';
import { checkCircleIcon, triangleWarningIcon, infoIcon, circleXIcon, xIcon } from '@vialiq/icons';

registerIcons([checkCircleIcon, triangleWarningIcon, infoIcon, circleXIcon, xIcon]);

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastAction {
  label: string;
  action: string;
  variant?: 'primary' | 'ghost';
}

/**
 * vi-toast
 * Ephemeral floating notification.
 *
 * @element vi-toast
 * @attr variant - Colour semantic: info | success | warning | danger
 * @attr title   - Bold headline
 * @attr message - Body message text
 * @attr duration - Auto-dismiss ms; 0 = sticky
 * @attr closable - Show close (×) button
 * @attr show-progress - Progress bar shows remaining time
 * @attr paused - Timer and progress bar paused (e.g. on hover)
 */
@customElement('vi-toast')
export class ViToast extends ViElement {
  static override styles = css`
    ${unsafeCSS(toastStyles)}
  `;

  @property({ type: String, reflect: true }) accessor variant: ToastVariant = 'info';
  @property({ type: String }) accessor title = '';
  @property({ type: String }) accessor message = '';
  @property({ type: Number }) accessor duration = 4000;
  @property({ type: Boolean, reflect: true }) accessor closable = true;
  @property({ type: Boolean, attribute: 'show-progress' }) accessor showProgress = true;
  @property({ type: Boolean, reflect: true }) accessor paused = false;
  @property({ type: String, attribute: 'close-icon' }) accessor closeIcon = 'x';
  
  // To allow setting via JS since passing complex arrays as attributes is messy
  @property({ type: Array, attribute: false }) accessor actions: ToastAction[] = [];

  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _startTime = 0;
  private _remainingTime = 0;

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', this.variant === 'warning' || this.variant === 'danger' ? 'alert' : 'status');
    this.setAttribute('aria-atomic', 'true');
    
    if (this.duration > 0) {
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
  }

  private startTimer() {
    if (this.duration <= 0 || this._remainingTime <= 0) return;
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
  
  private handleAction(action: string) {
    this.dispatchEvent(
      new CustomEvent('vialiq-action', {
        bubbles: true,
        composed: true,
        detail: { action, id: this.id },
      })
    );
  }

  private get defaultIcon(): string {
    switch (this.variant) {
      case 'success': return 'check-circle';
      case 'warning': return 'triangle-warning';
      case 'danger': return 'circle-x';
      case 'info':
      default: return 'info';
    }
  }

  override render(): TemplateResult {
    const hasActions = this.actions && this.actions.length > 0;
    
    return html`
      <div part="toast" class="toast-root" data-variant=${this.variant}>
        <div part="icon" class="toast-icon">
          <slot name="icon">
            <vi-icon name=${this.defaultIcon} aria-hidden="true"></vi-icon>
          </slot>
        </div>

        <div part="content" class="toast-content">
          ${this.title ? html`<span part="title" class="toast-title">${this.title}</span>` : ''}
          <span part="message" class="toast-message">
            <slot>${this.message}</slot>
          </span>
          
          ${hasActions ? html`
            <div part="actions" class="toast-actions">
              ${this.actions.map(action => html`
                <vi-button 
                  variant=${action.variant || 'ghost'} 
                  size="sm" 
                  @click=${() => this.handleAction(action.action)}
                >
                  ${action.label}
                </vi-button>
              `)}
            </div>
          ` : ''}
        </div>

        ${this.closable ? html`
          <vi-button
            part="close-btn"
            variant="ghost"
            size="sm"
            icon-only
            aria-label="Dismiss notification"
            @click=${() => this.handleDismiss('user')}
          >
            <vi-icon name=${this.closeIcon} slot="icon"></vi-icon>
          </vi-button>
        ` : ''}
        
        ${this.duration > 0 && this.showProgress ? html`
          <div part="progress" class="toast-progress" aria-hidden="true">
            <div 
              part="progress-bar" 
              class="toast-progress-bar" 
              style="animation-duration: ${this.duration}ms;"
            ></div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-toast': ViToast;
  }
}
