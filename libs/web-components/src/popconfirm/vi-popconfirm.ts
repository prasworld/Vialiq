import { css, html, unsafeCSS, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import '../popover/vi-popover.js';
import '../button/vi-button.js';
import '../icons/vi-icon.js';
import type { ViPopover } from '../popover/vi-popover.js';
import popconfirmStyles from './vi-popconfirm.scss?inline';
import type { ButtonVariant } from '../button/vi-button.js';

/**
 * vi-popconfirm
 *
 * A lightweight confirmation dialog built on top of vi-popover.
 *
 * @element vi-popconfirm
 * @attr title - Main confirmation text
 * @attr description - Optional secondary text
 * @attr icon - Icon name (default: warning)
 * @attr ok-text - OK button text (default: OK)
 * @attr cancel-text - Cancel button text (default: Cancel)
 * @attr ok-variant - Variant for OK button (default: primary)
 * @attr cancel-variant - Variant for Cancel button (default: secondary)
 * @attr placement - Preferred position: top | bottom | left | right (default: top)
 * @attr disabled - Suppress the popconfirm
 *
 * @slot - Trigger element
 * @slot title - Rich HTML title
 * @slot description - Rich HTML description
 * @slot icon - Custom icon
 */
@customElement('vi-popconfirm')
export class ViPopconfirm extends ViElement {
  static override styles = css`${unsafeCSS(popconfirmStyles)}`;

  @property({ type: String }) accessor title = '';
  @property({ type: String }) accessor description = '';
  @property({ type: String }) accessor icon = 'warning';
  @property({ type: String, attribute: 'ok-text' }) accessor okText = 'OK';
  @property({ type: String, attribute: 'cancel-text' }) accessor cancelText = 'Cancel';
  @property({ type: String, attribute: 'ok-variant' }) accessor okVariant: ButtonVariant = 'primary';
  @property({ type: String, attribute: 'cancel-variant' }) accessor cancelVariant: ButtonVariant = 'secondary';
  @property({ type: String, reflect: true }) accessor placement = 'top';
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  @state() private accessor _open = false;
  @query('vi-popover') private accessor _popover!: ViPopover;

  private _isActionHandled = false;

  private _onPopoverShow(e: Event) {
    if (this.disabled) {
      e.preventDefault();
      this._isActionHandled = true;
      if (this._popover) {
        this._popover.open = false;
      }
      this._open = false;
    } else {
      this._isActionHandled = false;
      this._open = true;
    }
  }

  private _onPopoverHide() {
    this._open = false;
    if (!this._isActionHandled) {
      this.dispatchEvent(new CustomEvent('vi-popconfirm-cancel', { bubbles: true, composed: true }));
    }
  }

  private _handleCancel(e: Event) {
    e.stopPropagation();
    this._isActionHandled = true;
    this._open = false;
    this.dispatchEvent(new CustomEvent('vi-popconfirm-cancel', { bubbles: true, composed: true }));
  }

  private _handleConfirm(e: Event) {
    e.stopPropagation();
    this._isActionHandled = true;
    this._open = false;
    this.dispatchEvent(new CustomEvent('vi-popconfirm-confirm', { bubbles: true, composed: true }));
  }

  private get _hasDescription() {
    return this.description !== '' || this.querySelector('[slot="description"]') !== null;
  }

  private get _hasTitle() {
    return this.title !== '' || this.querySelector('[slot="title"]') !== null;
  }

  override render() {
    return html`
      <vi-popover 
        .placement=${this.placement}
        .open=${this._open}
        trigger="click"
        accessible-name=${this.title || 'Confirmation dialog'}
        @vi-popover-show=${this._onPopoverShow}
        @vi-popover-hide=${this._onPopoverHide}
      >
        <slot></slot>
        
        <div slot="content" class="popconfirm-content">
          <div class="popconfirm-body">
            <div class="popconfirm-icon">
              <slot name="icon">
                <vi-icon name=${this.icon} size="20" color=${this.icon === 'warning' ? 'var(--vi-color-warning)' : 'currentColor'}></vi-icon>
              </slot>
            </div>
            
            <div class="popconfirm-text">
              ${this._hasTitle ? html`
                <div class="popconfirm-title">
                  <slot name="title">${this.title}</slot>
                </div>
              ` : nothing}
              
              ${this._hasDescription ? html`
                <div class="popconfirm-desc">
                  <slot name="description">${this.description}</slot>
                </div>
              ` : nothing}
            </div>
          </div>
          
          <div class="popconfirm-buttons">
            <vi-button size="sm" variant=${this.cancelVariant} @click=${this._handleCancel}>
              ${this.cancelText}
            </vi-button>
            <vi-button size="sm" variant=${this.okVariant} @click=${this._handleConfirm}>
              ${this.okText}
            </vi-button>
          </div>
        </div>
      </vi-popover>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-popconfirm': ViPopconfirm;
  }
}
