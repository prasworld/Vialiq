import { LitElement, html, TemplateResult, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';

import '../icons/vi-icon.js';
import '../button/vi-button.js';

import {
  checkCircleIcon,
  triangleWarningIcon,
  infoIcon,
  xIcon,
  arrowsMaximizeIcon,
  arrowsMinimizeIcon,
} from '@vialiq/icons';
import { registerIcons } from '../icons/registry.js';

import styles from './vi-modal-header.scss?inline';

registerIcons([
  checkCircleIcon,
  triangleWarningIcon,
  infoIcon,
  xIcon,
  arrowsMaximizeIcon,
  arrowsMinimizeIcon,
]);

@customElement('vi-modal-header')
export class ViModalHeader extends LitElement {
  static override styles = unsafeCSS(styles);

  /** Title text (or use default slot for complex HTML) */
  @property() accessor title = '';

  /** Header description text */
  @property() accessor description = '';

  /** Whether to show a close "X" button */
  @property({ type: Boolean }) accessor closable = false;

  /** Whether to show a maximize/restore button */
  @property({ type: Boolean }) accessor maximizable = false;

  /** Current maximized state (bound by parent modal if needed, or visual only) */
  @property({ type: Boolean }) accessor maximized = false;

  /** Custom icon name for alert variants */
  @property() accessor icon: string | undefined = undefined;

  /** Semantic alert variant to color the icon */
  @property({ attribute: 'alert-variant' }) accessor alertVariant:
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | undefined = undefined;

  /** Close button label for screen readers */
  @property({ attribute: 'close-label' }) accessor closeLabel = 'Close modal';

  /** Accessible label for the maximize button */
  @property({ attribute: 'maximize-label' }) accessor maximizeLabel =
    'Maximize modal';

  /** Accessible label for the restore button */
  @property({ attribute: 'restore-label' }) accessor restoreLabel =
    'Restore modal';

  private get _defaultIcon(): string | undefined {
    if (this.icon) return this.icon;
    switch (this.alertVariant) {
      case 'success':
        return 'check-circle';
      case 'warning':
      case 'danger':
        return 'triangle-warning';
      case 'info':
        return 'info';
      default:
        return undefined;
    }
  }

  private _handleClose(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('vi-modal-close-request', { bubbles: true, composed: true }),
    );
  }

  private _handleMaximize(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('vi-modal-maximize-request', { bubbles: true, composed: true }),
    );
  }

  override render(): TemplateResult {
    const isAlert = !!this.alertVariant || !!this.icon;
    
    const headerClasses = {
      'modal-header': true,
      'modal-header--alert': isAlert,
    };

    return html`
      <header part="header" class=${classMap(headerClasses)}>
        ${isAlert
          ? html`
              <div part="icon" class="modal-alert-icon">
                <slot name="icon">
                  <vi-icon name=${ifDefined(this._defaultIcon)} aria-hidden="true"></vi-icon>
                </slot>
              </div>
            `
          : ''}

        <div class="modal-header-content">
          <slot>
            <span part="title" class="modal-title">${this.title}</span>
          </slot>
          ${this.description
            ? html`<p part="description" class="modal-description">${this.description}</p>`
            : ''}
        </div>

        ${this.closable || this.maximizable
          ? html`
              <div part="actions" class="modal-header-actions">
                ${this.maximizable
                  ? html`
                      <vi-button
                        part="maximize-btn"
                        variant="ghost"
                        size="sm"
                        icon-only
                        @click=${this._handleMaximize}
                        aria-label=${this.maximized
                          ? this.restoreLabel
                          : this.maximizeLabel}
                      >
                        <vi-icon
                          name=${this.maximized ? 'arrows-minimize' : 'arrows-maximize'}
                          slot="icon"
                        ></vi-icon>
                      </vi-button>
                    `
                  : ''}
                ${this.closable
                  ? html`
                      <vi-button
                        part="close-btn"
                        variant="ghost"
                        size="sm"
                        icon-only
                        @click=${this._handleClose}
                        aria-label=${this.closeLabel}
                      >
                        <vi-icon name="x" slot="icon"></vi-icon>
                      </vi-button>
                    `
                  : ''}
              </div>
            `
          : ''}
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-modal-header': ViModalHeader;
  }
}
