import { TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type ModalEnterAnimation = 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'zoom-in' | 'scale-up' | 'pop-in' | 'slide-in-top' | 'slide-in-bottom' | 'slide-in-left' | 'slide-in-right' | 'none';
export type ModalVariant = 'default' | 'drawer' | 'alert';
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full-width' | 'fullscreen';
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type DrawerPlacement = 'right' | 'left';
export type AlertDialogVariant = 'info' | 'success' | 'warning' | 'danger';
declare const ViModal_base: typeof ViElement & (new (...args: any[]) => import('../base/focus-trap-mixin.js').FocusTrapInterface) & (new (...args: any[]) => import('../base/draggable-mixin.js').DraggableInterface) & (new (...args: any[]) => import('../base/resizable-mixin.js').ResizableInterface);
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
export declare class ViModal extends ViModal_base {
    static styles: import('lit').CSSResult;
    static properties: {
        open: {
            type: BooleanConstructor;
            reflect: boolean;
        };
    };
    private _open;
    private _bodyId;
    /** Whether the modal is currently open. */
    get open(): boolean;
    set open(val: boolean);
    /** Layout variant */
    accessor variant: ModalVariant;
    /** Dialog dimensions */
    accessor size: ModalSize;
    /** Position of the modal */
    accessor position: ModalPosition;
    /** Show × button in header */
    accessor closable: boolean;
    /** Allow maximizing to fullscreen */
    accessor maximizable: boolean;
    /** Prevent close on Escape and backdrop click */
    accessor persistent: boolean;
    /** Hide/disable the backdrop overlay and allow background interaction */
    accessor noBackdrop: boolean;
    /** Focus first element on open */
    accessor autofocus: boolean;
    /** Body scrolls; header/footer stay fixed */
    accessor scrollable: boolean;
    /** Side for drawer variant */
    accessor drawerPlacement: DrawerPlacement;
    /** Icon+colour for alert variant */
    accessor alertVariant: AlertDialogVariant;
    /** Element or CSS selector to return focus to on close */
    accessor returnFocusSelector: string | HTMLElement | undefined;
    /** Initial element or CSS selector to focus when opened */
    accessor initialFocusSelector: string | undefined;
    /** Header description text */
    /**
     * Enter animation preset. Defaults to 'zoom-in' for default/alert, 'slide-in-right' for right drawer,
     * 'slide-in-left' for left drawer. Set to 'none' to disable.
     */
    accessor enterAnimation: ModalEnterAnimation | '';
    /** Exit animation preset. Auto-derived from enterAnimation if not set. Set to 'none' to disable. */
    accessor exitAnimation: ModalEnterAnimation | '';
    /** Duration of enter/exit animations in milliseconds. */
    accessor animationDuration: number;
    /**
     * Where the modal is teleported when opened. Accepts a CSS selector string
     * or an `HTMLElement`. Defaults to `'body'`. No change from current behavior
     * when left at default.
     */
    accessor appendTo: string | HTMLElement;
    /**
     * Scroll strategy when the modal is open. Defaults to 'block' which prevents
     * scrolling the document body. Set to 'noop' to allow background scrolling.
     */
    accessor scrollStrategy: 'block' | 'noop';
    private accessor _dialog;
    private accessor _backdropEl;
    private accessor _maximized;
    private accessor _overlayZIndex;
    private _originalParent;
    private _originalNextSibling;
    private _activeAnimation;
    protected get _dragTarget(): HTMLElement | null;
    protected get _dragHandle(): HTMLElement | null;
    protected get _resizeTarget(): HTMLElement | null;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _handleHeaderCloseRequest;
    private _handleHeaderMaximizeRequest;
    private _syncHeaderState;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    private _closeReason;
    /** Returns the effective enter animation preset based on variant/placement if not overridden. */
    private get _resolvedEnterAnimation();
    private get _resolvedExitAnimation();
    private _runEnterAnimation;
    private _runExitAnimation;
    /** Play a shake animation on the dialog to signal a blocked close attempt. */
    private _shakeDialog;
    /** Open the modal */
    show(): void;
    /** Close the modal with an optional reason */
    close(reason?: 'escape' | 'backdrop' | 'button' | 'programmatic'): void;
    private _requestClose;
    private _handleCancel;
    private _handleBackdropClick;
    private _handleNativeClose;
    private _handleDialogMouseDown;
    private _handleDialogClick;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-modal': ViModal;
    }
}
export {};
//# sourceMappingURL=vi-modal.d.ts.map