import { css, html, nothing, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ViElement } from '../base/vi-element.js';
import { FocusTrapMixin } from '../base/focus-trap-mixin.js';
import { DraggableMixin } from '../base/draggable-mixin.js';
import { ResizableMixin } from '../base/resizable-mixin.js';
import modalStyles from './vi-modal.scss?inline';
import '../icons/vi-icon.js';
import '../button/vi-button.js';
import { OverlayManager } from '../base/overlay-manager.js';
import {
  checkCircleIcon,
  triangleWarningIcon,
  infoIcon,
  xIcon,
  lockIcon,
  arrowsMaximizeIcon,
  arrowsMinimizeIcon,
} from '@vialiq/icons';
import {
  PRESET_KEYFRAMES,
  EXIT_COUNTERPART,
} from '../animation/animation-constants.js';
import { registerIcons } from '../icons/registry.js';

export type ModalEnterAnimation =
  | 'fade-in'
  | 'fade-in-up'
  | 'fade-in-down'
  | 'zoom-in'
  | 'scale-up'
  | 'pop-in'
  | 'slide-in-top'
  | 'slide-in-bottom'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'none';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export type ModalVariant = 'default' | 'drawer' | 'alert';
export type ModalSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'full-width'
  | 'fullscreen';
export type ModalPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
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
export class ViModal extends ResizableMixin(
  DraggableMixin(FocusTrapMixin(ViElement)),
) {
  static override styles = css`
    ${unsafeCSS(modalStyles)}
  `;

  static override properties = {
    open: { type: Boolean, reflect: true }
  };

  private _open = false;
  private _bodyId = 'vi-modal-body-' + Math.random().toString(36).substring(2, 9);

  /** Whether the modal is currently open. */
  get open(): boolean {
    return this._open;
  }

  set open(val: boolean) {
    const oldVal = this._open;
    if (val === oldVal) return;

    if (this.isConnected) {
      const eventName = val ? 'vi-modal-before-open' : 'vi-modal-before-close';
      const ev = new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      this.dispatchEvent(ev);

      if (ev.defaultPrevented) {
        if (oldVal) {
          this.setAttribute('open', '');
        } else {
          this.removeAttribute('open');
        }
        return;
      }
    }

    this._open = val;
    this.requestUpdate('open', oldVal);
  }

  /** Layout variant */
  @property({ type: String, reflect: true }) accessor variant: ModalVariant =
    'default';

  /** Dialog dimensions */
  @property({ type: String, reflect: true }) accessor size: ModalSize = 'md';

  /** Position of the modal */
  @property({ type: String, reflect: true }) accessor position: ModalPosition =
    'center';

  /** Show × button in header */
  @property({ type: Boolean }) accessor closable = true;

  /** Allow maximizing to fullscreen */
  @property({ type: Boolean }) accessor maximizable = false;

  /** Prevent close on Escape and backdrop click */
  @property({ type: Boolean }) accessor persistent = false;

  /** Hide/disable the backdrop overlay and allow background interaction */
  @property({ type: Boolean, attribute: 'no-backdrop' }) accessor noBackdrop =
    false;

  /** Focus first element on open */
  @property({ type: Boolean }) accessor autofocus = true;

  /** Body scrolls; header/footer stay fixed */
  @property({ type: Boolean }) accessor scrollable = true;

  /** Side for drawer variant */
  @property({ type: String, attribute: 'drawer-placement' })
  accessor drawerPlacement: DrawerPlacement = 'right';

  /** Icon+colour for alert variant */
  @property({ type: String, attribute: 'alert-variant' })
  accessor alertVariant: AlertDialogVariant = 'info';

  /** Element or CSS selector to return focus to on close */
  @property({ attribute: 'return-focus' }) accessor returnFocusSelector:
    | string
    | HTMLElement
    | undefined = undefined;

  /** Initial element or CSS selector to focus when opened */
  @property({ attribute: 'initial-focus' }) accessor initialFocusSelector:
    | string
    | undefined = undefined;

  /** Accessible label for the close button */
  @property({ attribute: 'close-label' }) accessor closeLabel = 'Close';

  /** Accessible label for the maximize button */
  @property({ attribute: 'maximize-label' }) accessor maximizeLabel =
    'Maximize';

  /** Accessible label for the restore (un-maximize) button */
  @property({ attribute: 'restore-label' }) accessor restoreLabel = 'Restore';

  /**
   * Enter animation preset. Defaults to 'zoom-in' for default/alert, 'slide-in-right' for right drawer,
   * 'slide-in-left' for left drawer. Set to 'none' to disable.
   */
  @property({ attribute: 'enter-animation' }) accessor enterAnimation:
    | ModalEnterAnimation
    | '' = '';

  /** Exit animation preset. Auto-derived from enterAnimation if not set. Set to 'none' to disable. */
  @property({ attribute: 'exit-animation' }) accessor exitAnimation:
    | ModalEnterAnimation
    | '' = '';

  /** Duration of enter/exit animations in milliseconds. */
  @property({ type: Number, attribute: 'animation-duration' })
  accessor animationDuration = 250;

  /**
   * Where the modal is teleported when opened. Accepts a CSS selector string
   * or an `HTMLElement`. Defaults to `'body'`. No change from current behavior
   * when left at default.
   */
  @property({ attribute: 'append-to' }) accessor appendTo:
    | string
    | HTMLElement = 'body';

  /**
   * Scroll strategy when the modal is open. Defaults to 'block' which prevents
   * scrolling the document body. Set to 'noop' to allow background scrolling.
   */
  @property({ attribute: 'scroll-strategy' }) accessor scrollStrategy:
    | 'block'
    | 'noop' = 'block';

  @query('dialog') private accessor _dialog!: HTMLDialogElement;
  @query('.modal-backdrop') private accessor _backdropEl!: HTMLDivElement;
  @query('.modal-header') private accessor _headerEl!: HTMLElement;

  @state() private accessor _hasFooterSlot = false;
  @state() private accessor _maximized = false;
  @state() private accessor _overlayZIndex: number | null = null;

  private _originalParent: ParentNode | null = null;
  private _originalNextSibling: Node | null = null;
  private _inertedElements: Element[] = [];
  private _activeAnimation: Animation | null = null;

  protected override get _dragTarget(): HTMLElement | null {
    return this._dialog;
  }

  protected override get _resizeTarget(): HTMLElement | null {
    return this._dialog;
  }

  protected override get _dragHandle(): HTMLElement | null {
    return this._headerEl;
  }

  private static _iconsRegistered = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!ViModal._iconsRegistered) {
      registerIcons([
        checkCircleIcon,
        triangleWarningIcon,
        infoIcon,
        xIcon,
        lockIcon,
        arrowsMaximizeIcon,
        arrowsMinimizeIcon,
      ]);
      ViModal._iconsRegistered = true;
    }
    this._hasFooterSlot = this.querySelectorAll('[slot="footer"]').length > 0;
  }

  private _handleFooterSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this._hasFooterSlot = slot.assignedNodes({ flatten: true }).length > 0;
  }

  override updated(
    changedProperties: Map<string | number | symbol, unknown>,
  ): void {
    super.updated(changedProperties);

    if (changedProperties.has('open')) {
      if (this.open) {
        // Resolve append-to target
        let teleportTarget: HTMLElement = document.body;
        if (this.appendTo instanceof HTMLElement) {
          teleportTarget = this.appendTo;
        } else if (typeof this.appendTo === 'string' && this.appendTo) {
          try {
            teleportTarget =
              document.querySelector<HTMLElement>(this.appendTo) ?? document.body;
          } catch {
            teleportTarget = document.body;
          }
        }

        // Teleport to target container to ensure correct stacking context
        if (this.parentElement !== teleportTarget) {
          this._originalParent = this.parentNode;
          this._originalNextSibling = this.nextSibling;
          teleportTarget.appendChild(this);
        }

        // Register with OverlayManager to get a proper z-index
        this._overlayZIndex = OverlayManager.register(this, 'modal', this.scrollStrategy);

        // Apply inert to background content (must happen after teleport)
        this._applyInert();

        // Reset drag/maximize/resize state on open
        this._maximized = false;
        this._resetDrag();
        this._resetResize();

        // Activate focus trap immediately (concurrent with animation)
        let initialFocus: HTMLElement | undefined;
        if (
          typeof this.initialFocusSelector === 'string' &&
          this.initialFocusSelector
        ) {
          initialFocus =
            document.querySelector<HTMLElement>(this.initialFocusSelector) ??
            undefined;
        }
        if (!this.noBackdrop) {
          this._activateFocusTrap(initialFocus, this.autofocus);
        }

        this.dispatchEvent(
          new CustomEvent('vi-modal-open', { bubbles: true, composed: true }),
        );

        // Play enter animation after first render
        this.updateComplete.then(() => {
          if (!this.open) return;
          this._runEnterAnimation().then(() => {
            if (!this.open) return;
            this.dispatchEvent(
              new CustomEvent('vi-modal-after-open', { bubbles: true, composed: true })
            );
          });
        });
      } else {
        const finalReason = this._closeReason;
        this._closeReason = 'programmatic';

        this.dispatchEvent(
          new CustomEvent('vi-modal-close', {
            bubbles: true,
            composed: true,
            detail: { reason: finalReason },
          }),
        );

        // Run exit animation, then tear down
        this._runExitAnimation().then(() => {
          if (this.open) return;

          OverlayManager.unregister(this);
          this._stopDrag();
          this._removeInert();

          let returnTarget: HTMLElement | null = null;
          if (
            typeof this.returnFocusSelector === 'string' &&
            this.returnFocusSelector
          ) {
            returnTarget = document.querySelector<HTMLElement>(
              this.returnFocusSelector,
            );
          } else if (this.returnFocusSelector instanceof HTMLElement) {
            returnTarget = this.returnFocusSelector;
          }

          this._deactivateFocusTrap(returnTarget);

          // Restore original DOM position
          if (
            this._originalParent &&
            this.parentElement !== this._originalParent
          ) {
            this._originalParent.insertBefore(this, this._originalNextSibling);
          }
          this._originalParent = null;
          this._originalNextSibling = null;

          this.dispatchEvent(
            new CustomEvent('vi-modal-after-close', {
              bubbles: true,
              composed: true,
              detail: { reason: finalReason },
            }),
          );
        });
      }
    }
  }

  private _closeReason: 'escape' | 'backdrop' | 'button' | 'programmatic' =
    'programmatic';

  // ─── Inert Management ────────────────────────────────────────────────────

  /** Mark all `document.body` direct children as `inert`, except this modal host. */
  private _applyInert(): void {
    this._inertedElements = [];
    if (this.noBackdrop) return; // Allow background interaction when no-backdrop is set
    Array.from(document.body.children).forEach((child) => {
      if (child === this) return; // Skip the modal itself
      if ((child as HTMLElement).inert) return; // Already inert — don't touch
      (child as HTMLElement).inert = true;
      this._inertedElements.push(child);
    });
  }

  /** Remove `inert` only from elements we added it to. */
  private _removeInert(): void {
    this._inertedElements.forEach((el) => {
      (el as HTMLElement).inert = false;
    });
    this._inertedElements = [];
  }

  // ─── Animation Helpers ───────────────────────────────────────────────────

  /** Returns the effective enter animation preset based on variant/placement if not overridden. */
  private get _resolvedEnterAnimation(): string {
    if (this.enterAnimation) return this.enterAnimation;
    if (this.variant === 'drawer') {
      return this.drawerPlacement === 'left'
        ? 'slide-in-left'
        : 'slide-in-right';
    }
    return 'zoom-in'; // default and alert variants
  }

  private get _resolvedExitAnimation(): string {
    if (this.exitAnimation) return this.exitAnimation;
    return EXIT_COUNTERPART[this._resolvedEnterAnimation] ?? 'fade-out';
  }

  private async _runEnterAnimation(): Promise<void> {
    const animName = this._resolvedEnterAnimation;
    if (animName === 'none' || !this._dialog || !this._dialog.animate) return;

    const reduced = prefersReducedMotion();
    const kf = reduced
      ? PRESET_KEYFRAMES['fade-in']
      : PRESET_KEYFRAMES[animName];
    const dur = reduced
      ? Math.min(this.animationDuration, 100)
      : this.animationDuration;
    if (!kf) return;

    // Cancel any leftover animation
    this._activeAnimation?.cancel();
    const anim = this._dialog.animate(kf, {
      duration: dur,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      fill: 'forwards',
    });
    this._activeAnimation = anim;

    // Animate backdrop concurrently (simple fade)
    const backdropAnim = this._backdropEl?.animate?.(PRESET_KEYFRAMES['fade-in'], {
      duration: dur,
      easing: 'ease',
      fill: 'forwards',
    });

    await Promise.allSettled([
      anim.finished,
      backdropAnim?.finished ?? Promise.resolve(),
    ]);

    if (this._activeAnimation === anim) {
      anim.cancel();
    }
  }

  private async _runExitAnimation(): Promise<void> {
    const animName = this._resolvedExitAnimation;
    if (animName === 'none' || !this._dialog || !this._dialog.animate) return;

    const reduced = prefersReducedMotion();
    const kf = reduced
      ? PRESET_KEYFRAMES['fade-out']
      : PRESET_KEYFRAMES[animName];
    const dur = reduced
      ? Math.min(this.animationDuration, 100)
      : this.animationDuration;
    if (!kf) return;

    // Animate dialog and backdrop concurrently, await both
    const dialogAnim = this._dialog.animate(kf, {
      duration: dur,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      fill: 'forwards',
    });
    const backdropAnim = this._backdropEl?.animate?.(
      PRESET_KEYFRAMES['fade-out'],
      {
        duration: dur,
        easing: 'ease',
        fill: 'forwards',
      },
    );

    await Promise.allSettled([
      dialogAnim.finished,
      backdropAnim?.finished ?? Promise.resolve(),
    ]);

    // Clear fill so CSS can take over
    try {
      dialogAnim.cancel();
    } catch {
      /* already finished */
    }
    try {
      backdropAnim?.cancel();
    } catch {
      /* already finished */
    }
  }

  /** Play a shake animation on the dialog to signal a blocked close attempt. */
  private _shakeDialog(): void {
    if (!this._dialog || !this._dialog.animate) return;
    const reduced = prefersReducedMotion();
    const dur = reduced ? 0 : 380;
    this._dialog.animate(PRESET_KEYFRAMES['shake'], {
      duration: dur,
      easing: 'ease-in-out',
    });
  }

  /** Open the modal */
  public show(): void {
    this.open = true;
  }

  /** Close the modal with an optional reason */
  public close(
    reason: 'escape' | 'backdrop' | 'button' | 'programmatic' = 'programmatic',
  ): void {
    const requestCloseEvent = new CustomEvent('vi-modal-request-close', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { reason },
    });

    this.dispatchEvent(requestCloseEvent);

    if (!requestCloseEvent.defaultPrevented) {
      this._closeReason = reason;
      this.open = false;
    }
  }

  /** Focus first focusable element in modal body */
  override focus(): void {
    if (this.open) {
      // FocusTrapMixin has _getFocusableElements which we can't easily access from public,
      // but we can query standard focusable elements. Let's just focus the dialog itself or first button.
      const firstFocusable = this.shadowRoot?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        this._dialog?.focus();
      }
    }
  }

  private _handleDialogCancel(e: Event): void {
    e.preventDefault(); // prevent native close so we can handle logic
    this._handleKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
  }

  private _handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.open) {
      e.preventDefault();
      if (this.persistent) {
        this._shakeDialog();
        this.dispatchEvent(
          new CustomEvent('vi-modal-request-close', {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: { reason: 'escape' },
          }),
        );
      } else {
        this.close('escape');
      }
    }
  }

  private _handleBackdropClick(_e: MouseEvent): void {
    // Bound directly to the custom backdrop div, so we don't need target check
    if (!this.persistent) {
      this.close('backdrop');
    } else {
      this._shakeDialog();
      this.dispatchEvent(
        new CustomEvent('vi-modal-request-close', {
          bubbles: true,
          composed: true,
          cancelable: true,
          detail: { reason: 'backdrop' },
        }),
      );
    }
  }

  private get _defaultIcon(): string {
    switch (this.alertVariant) {
      case 'success':
        return 'check-circle';
      case 'warning':
      case 'danger':
        return 'triangle-warning';
      case 'info':
      default:
        return 'info';
    }
  }

  private get _role(): string {
    if (
      this.variant === 'alert' &&
      (this.alertVariant === 'warning' || this.alertVariant === 'danger')
    ) {
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
      [`modal-position-${this.position}`]:
        this.position !== 'center' && this.variant === 'default',
      'modal-scrollable-false': !this.scrollable,
      'is-maximized': this._maximized,
      'is-draggable': this.draggable,
      'is-resizable': this.resizable,
    };

    return html`
      ${this.open && !this.noBackdrop
        ? html`
            <div
              class="modal-backdrop"
              @click=${this._handleBackdropClick}
              style=${ifDefined(
                this._overlayZIndex !== null
                  ? `z-index: ${this._overlayZIndex - 1}`
                  : undefined,
              )}
            ></div>
          `
        : ''}
      <dialog
        part="dialog"
        class=${classMap(dialogClasses)}
        role=${this._role}
        ?open=${this.open}
        aria-modal=${this.noBackdrop ? nothing : 'true'}
        aria-label=${ifDefined(this.getAttribute('aria-label') || undefined)}
        aria-labelledby=${ifDefined(
          this.hasAttribute('aria-label')
            ? undefined
            : this.getAttribute('aria-labelledby') || 'modal-header',
        )}
        aria-describedby=${ifDefined(
          this.getAttribute('aria-describedby') || this._bodyId
        )}
        style=${ifDefined(
          this._overlayZIndex !== null
            ? `z-index: ${this._overlayZIndex}`
            : undefined,
        )}
        @cancel=${this._handleDialogCancel}
        @keydown=${this._handleKeydown}
      >
        ${this._renderResizeHandles()}
        ${this.variant === 'alert'
          ? this._renderAlert()
          : this._renderDefault()}
      </dialog>
    `;
  }

  private _renderDefault(): TemplateResult {
    return html`
      <header part="header" id="modal-header" class="modal-header">
        <slot name="header">
          <span part="title" id="modal-title"></span>
        </slot>

        <div class="modal-header-actions">
          <slot name="header-actions"></slot>
          ${this.maximizable
            ? html`
                <vi-button
                  part="maximize-btn"
                  variant="ghost"
                  size="sm"
                  icon-only
                  title=${this._maximized
                    ? this.restoreLabel
                    : this.maximizeLabel}
                  aria-label=${this._maximized
                    ? this.restoreLabel
                    : this.maximizeLabel}
                  @click=${() => {
                    this._maximized = !this._maximized;
                    if (this._maximized) {
                      this._resetDrag(); // Clear drag state when maximized
                      this._resetResize(); // Clear resize state when maximized
                    }
                  }}
                >
                  <vi-icon
                    name=${this._maximized
                      ? 'arrows-minimize'
                      : 'arrows-maximize'}
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
                  title=${this.closeLabel}
                  aria-label=${this.closeLabel}
                  @click=${() => this.close('button')}
                >
                  <vi-icon name="x" slot="icon"></vi-icon>
                </vi-button>
              `
            : ''}
        </div>
      </header>

      <div part="body" id=${this._bodyId} class="modal-body">
        <slot></slot>
      </div>

      <footer
        part="footer"
        class="modal-footer"
        ?hidden=${!this._hasFooterSlot}
      >
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
        <header part="header" id="modal-header" class="modal-header">
          <slot name="header">
            <span part="title" id="modal-title" class="modal-title"></span>
          </slot>
        </header>

        <div part="body" id=${this._bodyId} class="modal-body">
          <slot></slot>
        </div>

        <footer
          part="footer"
          class="modal-footer"
          ?hidden=${!this._hasFooterSlot}
        >
          <slot
            name="footer"
            @slotchange=${this._handleFooterSlotChange}
          ></slot>
        </footer>
      </div>
    `;
  }
  override disconnectedCallback(): void {
    OverlayManager.unregister(this);
    this._removeInert();
    this._activeAnimation?.cancel();
    this._activeAnimation = null;
    super.disconnectedCallback();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-modal': ViModal;
  }
}
