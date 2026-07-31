import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ViElement } from '../base/vi-element.js';
import { FocusTrapMixin } from '../base/focus-trap-mixin.js';
import modalStyles from './vi-modal.scss?inline';
import '../icons/vi-icon.js';
import '../button/vi-button.js';
import { registerIcons } from '../icons/registry.js';
import { checkCircleIcon, triangleWarningIcon, infoIcon, xIcon, lockIcon } from '@vialiq/icons';

registerIcons([checkCircleIcon, triangleWarningIcon, infoIcon, xIcon, lockIcon]);

export type ModalVariant = 'default' | 'drawer' | 'alert';
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
export type DrawerPlacement = 'right' | 'left';
export type AlertDialogVariant = 'info' | 'success' | 'warning' | 'danger';

/**
 * vi-modal
 * A focus-trapping dialog that blocks interaction with the page behind it.
 */
@customElement('vi-modal')
export class ViModal extends FocusTrapMixin(ViElement) {
  static override styles = css`
    ${unsafeCSS(modalStyles)}
  `;

  /** Controls visibility */
  @property({ type: Boolean, reflect: true }) accessor open = false;

  /** Layout variant */
  @property({ type: String, reflect: true }) accessor variant: ModalVariant = 'default';

  /** Dialog dimensions */
  @property({ type: String, reflect: true }) accessor size: ModalSize = 'md';

  /** Show × button in header */
  @property({ type: Boolean }) accessor closable = true;

  /** Prevent close on Escape and backdrop click */
  @property({ type: Boolean }) accessor persistent = false;

  /** Body scrolls; header/footer stay fixed */
  @property({ type: Boolean }) accessor scrollable = true;

  /** Side for drawer variant */
  @property({ type: String, attribute: 'drawer-placement' }) accessor drawerPlacement: DrawerPlacement = 'right';

  /** Icon+colour for alert variant */
  @property({ type: String, attribute: 'alert-variant' }) accessor alertVariant: AlertDialogVariant = 'info';

  /** Element to return focus to on close */
  @property({ attribute: false }) accessor returnFocusSelector: string | HTMLElement | undefined = undefined;

  @query('dialog') private accessor _dialog!: HTMLDialogElement;

  @state() private accessor _hasFooterSlot = false;

  private _handleFooterSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this._hasFooterSlot = slot.assignedNodes({ flatten: true }).length > 0;
  }

  override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('open')) {
      if (this.open) {
        if (!this._dialog.open) {
          this._dialog.showModal();
        }

        const initialFocus: HTMLElement | undefined = undefined;
        // Optionally set custom initial focus if needed, otherwise fallback to mixin default

        this._activateFocusTrap(initialFocus);
        this.dispatchEvent(new CustomEvent('vialiq-open', { bubbles: true, composed: true }));
      } else {
        if (this._dialog.open) {
          this._dialog.close();
        }
        this._deactivateFocusTrap();
      }
    }
  }

  /** Open the modal */
  public show(): void {
    this.open = true;
  }

  /** Close the modal with an optional reason */
  public close(reason: 'escape' | 'backdrop' | 'button' | 'programmatic' = 'programmatic'): void {
    const requestCloseEvent = new CustomEvent('vialiq-request-close', {
      bubbles: true,
      composed: true,
      cancelable: true,
    });

    this.dispatchEvent(requestCloseEvent);

    if (!requestCloseEvent.defaultPrevented) {
      this.open = false;
      this.dispatchEvent(new CustomEvent('vialiq-close', {
        bubbles: true,
        composed: true,
        detail: { reason }
      }));
    }
  }

  /** Focus first focusable element in modal body */
  override focus(): void {
    if (this.open) {
      // FocusTrapMixin has _getFocusableElements which we can't easily access from public,
      // but we can query standard focusable elements. Let's just focus the dialog itself or first button.
      const firstFocusable = this.shadowRoot?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        this._dialog?.focus();
      }
    }
  }

  private _handleDialogCancel(e: Event): void {
    e.preventDefault(); // prevent native close so we can handle persistent logic

    if (this.persistent) {
      this.dispatchEvent(new CustomEvent('vialiq-request-close', {
        bubbles: true,
        composed: true,
        cancelable: true,
      }));
      // Does not close if persistent
    } else {
      this.close('escape');
    }
  }

  private _handleDialogClick(e: MouseEvent): void {
    // Check if the click was on the ::backdrop pseudo-element.
    // Native dialogs consider clicks outside the dialog bounds as clicks on the dialog itself.
    if (e.target === this._dialog) {
      const rect = this._dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );

      if (!isInDialog) {
        if (!this.persistent) {
          this.close('backdrop');
        } else {
          this.dispatchEvent(new CustomEvent('vialiq-request-close', {
            bubbles: true,
            composed: true,
            cancelable: true,
          }));
        }
      }
    }
  }

  private get _defaultIcon(): string {
    switch (this.alertVariant) {
      case 'success': return 'check-circle';
      case 'warning':
      case 'danger': return 'triangle-warning';
      case 'info':
      default: return 'info';
    }
  }

  private get _role(): string {
    if (this.variant === 'alert' && (this.alertVariant === 'warning' || this.alertVariant === 'danger')) {
      return 'alertdialog';
    }
    return 'dialog';
  }

  override render(): TemplateResult {
    const dialogClasses = {
      'modal-variant-drawer': this.variant === 'drawer',
      [`placement-${this.drawerPlacement}`]: this.variant === 'drawer',
      'modal-variant-alert': this.variant === 'alert',
      [`modal-size-${this.size}`]: this.variant === 'default',
      'modal-scrollable-false': !this.scrollable,
    };

    return html`
      <dialog
        part="dialog"
        class=${classMap(dialogClasses)}
        role=${this._role}
        aria-modal="true"
        aria-labelledby="modal-title"
        @cancel=${this._handleDialogCancel}
        @click=${this._handleDialogClick}
      >
        ${this.variant === 'alert' ? this._renderAlert() : this._renderDefault()}
      </dialog>
    `;
  }

  private _renderDefault(): TemplateResult {
    return html`
      <header part="header" class="modal-header">
        <slot name="header">
          <span part="title" id="modal-title" aria-live="assertive"></span>
        </slot>

        <div class="modal-header-actions">
          <slot name="header-actions"></slot>
          ${this.closable ? html`
            <vi-button
              part="close-btn"
              variant="ghost"
              size="sm"
              icon-only
              @click=${() => this.close('button')}
            >
              <vi-icon name="x" slot="icon"></vi-icon>
            </vi-button>
          ` : ''}
        </div>
      </header>

      <div part="body" class="modal-body">
        <slot></slot>
      </div>

      <footer part="footer" class="modal-footer" ?hidden=${!this._hasFooterSlot}>
        <slot name="footer" @slotchange=${this._handleFooterSlotChange}></slot>
      </footer>
    `;
  }

  private _renderAlert(): TemplateResult {
    return html`
      <div part="icon" class="modal-alert-icon">
        <slot name="icon">
          <vi-icon name=${this._defaultIcon} aria-hidden="true"></vi-icon>
        </slot>
      </div>

      <div part="alert-content" class="modal-alert-content">
        <!-- Alert variant uses standard body and footer conceptually for layout flexibility -->
        <header part="header" class="modal-header" style="padding: 0; margin-bottom: 8px;">
          <slot name="header">
            <span part="title" id="modal-title" class="modal-title" aria-live="assertive"></span>
          </slot>
        </header>

        <div part="body" class="modal-body" style="padding: 0; margin-bottom: 16px;">
          <slot></slot>
        </div>

        <footer part="footer" class="modal-footer" style="padding: 0; background: transparent; border-top: none; margin-top: auto;" ?hidden=${!this._hasFooterSlot}>
          <slot name="footer" @slotchange=${this._handleFooterSlotChange}></slot>
        </footer>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-modal': ViModal;
  }
}
