export type OverlayType = 'modal' | 'dropdown' | 'tooltip' | 'toast';
export type ScrollStrategy = 'block' | 'noop';
/**
 * OverlayManagerService
 *
 * A singleton service responsible for managing the z-index stacking context
 * of all floating elements (Modals, Dropdowns, Tooltips, Toasts) across the application.
 *
 * It ensures that newly opened overlays always appear on top of existing ones by
 * maintaining a registry and dynamically calculating the next highest z-index.
 * It also manages global state side-effects, such as locking `document.body` scroll
 * when a modal is active.
 */
declare class OverlayManagerService {
    private getBaseZIndex;
    private overlays;
    private _previousOverflow;
    private _previousPaddingRight;
    private _inertedElements;
    /**
     * Registers an element as an active overlay.
     * Calculates and returns the appropriate z-index for this overlay.
     *
     * @param element The DOM element being registered (e.g., the modal dialog or dropdown listbox)
     * @param type The type of overlay, used to determine behaviors like scroll-locking.
     * @param scrollStrategy How this overlay interacts with background scrolling.
     * @returns The calculated z-index to be applied to the element.
     */
    register(element: HTMLElement, type?: OverlayType, scrollStrategy?: ScrollStrategy, options?: {
        noBackdrop?: boolean;
    }): number;
    /**
     * Unregisters an element, removing it from the overlay stack.
     * Should be called when the overlay is closed or disconnected from the DOM.
     *
     * @param element The DOM element to unregister.
     */
    unregister(element: HTMLElement): void;
    /**
     * Gets the assigned z-index for an element if it is currently registered.
     *
     * @param element The DOM element to query.
     * @returns The z-index number, or null if the element is not registered.
     */
    getZIndex(element: HTMLElement): number | null;
    /**
     * Evaluates whether the provided element is currently the top-most active overlay.
     * Useful for trapping focus or handling global Escape key presses.
     *
     * @param element The DOM element to check.
     * @returns True if the element has the highest z-index in the registry.
     */
    isTopOverlay(element: HTMLElement): boolean;
    /**
     * Syncs the `inert` attribute on `document.body` children based on the active overlay stack.
     * Modals with a backdrop trap focus globally, so everything beneath them must be `inert`.
     */
    private _syncInertState;
    /**
     * Locks or unlocks the document.body scroll based on the active overlays.
     * Modals (and other overlays with scrollStrategy='block') require the body
     * to be unscrollable. It applies a utility class `vi-scroll-locked` to the body.
     */
    private _updateBodyScroll;
}
export declare const OverlayManager: OverlayManagerService;
export {};
//# sourceMappingURL=overlay-manager.d.ts.map