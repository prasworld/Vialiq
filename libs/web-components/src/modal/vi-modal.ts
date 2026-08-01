import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ViElement } from '../base/vi-element.js';
import { FocusTrapMixin } from '../base/focus-trap-mixin.js';
import { DraggableMixin } from '../base/draggable-mixin.js';
import modalStyles from './vi-modal.scss?inline';
import '../icons/vi-icon.js';
import '../button/vi-button.js';
import { registerIcons } from '../icons/registry.js';
import { OverlayManager } from '../base/overlay-manager.js';
import { checkCircleIcon, triangleWarningIcon, infoIcon, xIcon, lockIcon, arrowsMaximizeIcon, arrowsMinimizeIcon } from '@vialiq/icons';

registerIcons([checkCircleIcon, triangleWarningIcon, infoIcon, xIcon, lockIcon, arrowsMaximizeIcon, arrowsMinimizeIcon]);

export type ModalVariant = 'default' | 'drawer' | 'alert';
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full-width' | 'fullscreen';
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type DrawerPlacement = 'right' | 'left';
export type AlertDialogVariant = 'info' | 'success' | 'warning' | 'danger';

/**
 * vi-modal
 * 
 * A focus-trapping dialog that blocks interaction with the page behind it.
 * 
 * **Developer Notes & Architecture:**
 * - **Stacking Context**: To guarantee the modal renders above everything else, `vi-modal` dynamically teleports itself to `document.body` when opened (`open = true`). It restores itself to its original DOM position when closed. 
 * - **Z-Index**: Relies on `OverlayManager` to dynamically assign an escalating `z-index`, allowing for infinite nested modals.
 * - **Focus Trap**: Uses `FocusTrapMixin` to ensure keyboard accessibility.
 * - **Dragging**: Uses `DraggableMixin`. Be aware that teleporting the modal triggers `disconnectedCallback`, which requires `DraggableMixin` to smartly re-attach pointer event listeners in `connectedCallback`.
 * - **Floating UI Compatibility**: Because the modal clears its `transform` style when not actively being dragged, child components like dropdowns (`vi-combobox`) that use `position: fixed` will correctly escape the modal's `overflow: hidden` boundaries without needing to be teleported themselves.
 *
 * @element vi-modal
 */
@customElement('vi-modal')
export class ViModal extends DraggableMixin(FocusTrapMixin(ViElement)) {
  static override styles = css`
    ${unsafeCSS(modalStyles)}
  `;

  /** Controls visibility */
  @property({ type: Boolean, reflect: true }) accessor open = false;

  /** Layout variant */
  @property({ type: String, reflect: true }) accessor variant: ModalVariant = 'default';

  /** Dialog dimensions */
  @property({ type: String, reflect: true }) accessor size: ModalSize = 'md';

  /** Position of the modal */
  @property({ type: String, reflect: true }) accessor position: ModalPosition = 'center';

  /** Show × button in header */
  @property({ type: Boolean }) accessor closable = true;

  /** Allow maximizing to fullscreen */
  @property({ type: Boolean }) accessor maximizable = false;

  /** Prevent close on Escape and backdrop click */
  @property({ type: Boolean }) accessor persistent = false;

  /** Focus first element on open */
  @property({ type: Boolean }) accessor autofocus = true;

  /** Body scrolls; header/footer stay fixed */
  @property({ type: Boolean }) accessor scrollable = true;

  /** Side for drawer variant */
  @property({ type: String, attribute: 'drawer-placement' }) accessor drawerPlacement: DrawerPlacement = 'right';

  /** Icon+colour for alert variant */
  @property({ type: String, attribute: 'alert-variant' }) accessor alertVariant: AlertDialogVariant = 'info';

  /** Element to return focus to on close */
  @property({ attribute: false }) accessor returnFocusSelector: string | HTMLElement | undefined = undefined;

  @query('dialog') private accessor _dialog!: HTMLDialogElement;
  @query('.modal-header') private accessor _headerEl!: HTMLElement;

  @state() private accessor _hasFooterSlot = false;
  @state() private accessor _maximized = false;
  @state() private accessor _overlayZIndex = -1;

  private _originalParent: ParentNode | null = null;
  private _originalNextSibling: Node | null = null;

  protected override get _dragTarget(): HTMLElement | null {
    return this._dialog;
  }

  protected override get _dragHandle(): HTMLElement | null {
    return this._headerEl;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._hasFooterSlot = this.querySelectorAll('[slot="footer"]').length > 0;
  }

  private _handleFooterSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this._hasFooterSlot = slot.assignedNodes({ flatten: true }).length > 0;
  }

  override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('open')) {
      if (this.open) {
        // Teleport to body to ensure correct stacking context
        if (this.parentElement !== document.body) {
          this._originalParent = this.parentNode;
          this._originalNextSibling = this.nextSibling;
          document.body.appendChild(this);
        }

        // Register with OverlayManager to get a proper z-index
        this._overlayZIndex = OverlayManager.register(this, 'modal');

        // Reset drag/maximize state on open
        this._maximized = false;
        this._resetDrag();

        const initialFocus: HTMLElement | undefined = undefined;
        this._activateFocusTrap(initialFocus, this.autofocus);
        
        this.dispatchEvent(new CustomEvent('vialiq-open', { bubbles: true, composed: true }));
      } else {
        OverlayManager.unregister(this);
        this._deactivateFocusTrap();

        // Restore original DOM position
        if (this._originalParent && this.parentElement === document.body) {
          this._originalParent.insertBefore(this, this._originalNextSibling);
        }
        this._originalParent = null;
        this._originalNextSibling = null;
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
    e.preventDefault(); // prevent native close so we can handle logic

    if (this.persistent) {
      this.dispatchEvent(new CustomEvent('vialiq-request-close', {
        bubbles: true,
        composed: true,
        cancelable: true,
      }));
      // Does not close
    } else {
      this.close('escape');
    }
  }

  private _handleBackdropClick(e: MouseEvent): void {
    // If the click is on the custom backdrop div itself
    if (e.target === e.currentTarget) {
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
    const activeSize = this._maximized ? 'fullscreen' : this.size;
    
    const dialogClasses = {
      'modal-variant-drawer': this.variant === 'drawer',
      [`placement-${this.drawerPlacement}`]: this.variant === 'drawer',
      'modal-variant-alert': this.variant === 'alert',
      [`modal-size-${activeSize}`]: this.variant === 'default',
      [`modal-position-${this.position}`]: this.position !== 'center' && this.variant === 'default',
      'modal-scrollable-false': !this.scrollable,
      'is-maximized': this._maximized,
      'is-draggable': this.draggable
    };

    return html`
      ${this.open ? html`
        <div 
          class="modal-backdrop" 
          @click=${this._handleBackdropClick} 
          style="z-index: ${this._overlayZIndex - 1}"
        ></div>
      ` : ''}
      <dialog
        part="dialog"
        class=${classMap(dialogClasses)}
        role=${this._role}
        ?open=${this.open}
        aria-modal="true"
        aria-labelledby="modal-title"
        style="z-index: ${this._overlayZIndex}"
        @cancel=${this._handleDialogCancel}
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
          ${this.maximizable ? html`
            <vi-button
              part="maximize-btn"
              variant="ghost"
              size="sm"
              icon-only
              title=${this._maximized ? 'Restore' : 'Maximize'}
              @click=${() => {
                this._maximized = !this._maximized;
                if (this._maximized) this._resetDrag(); // Clear drag state when maximized
              }}
            >
              <vi-icon name=${this._maximized ? 'arrows-minimize' : 'arrows-maximize'} slot="icon"></vi-icon>
            </vi-button>
          ` : ''}
          ${this.closable ? html`
            <vi-button
              part="close-btn"
              variant="ghost"
              size="sm"
              icon-only
              title="Close"
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
  override disconnectedCallback(): void {
    OverlayManager.unregister(this);
    super.disconnectedCallback();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-modal': ViModal;
  }
}
