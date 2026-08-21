import { ReactiveController, ReactiveControllerHost } from 'lit';
import { Placement } from '@floating-ui/dom';
/**
 * FloatingControllerOptions
 *
 * Configuration options for the FloatingController.
 */
export interface FloatingControllerOptions {
    /** Function returning the reference element (e.g. trigger/input). */
    reference: () => HTMLElement | null;
    /** Function returning the floating element (e.g. popover/listbox). */
    floating: () => HTMLElement | null;
    /** Function returning the desired placement. */
    placement?: () => Placement;
    /** Space in px between reference and floating. */
    offset?: number;
    /**
     * When true, uses `position: fixed` instead of `absolute`.
     * This allows the floating element to escape tight `overflow: hidden` containers
     * (like modals) without needing to be physically moved (teleported) in the DOM,
     * preserving Shadow DOM encapsulation and slotting.
     */
    hoist?: () => boolean;
    /** Element or selector string to constrain flipping. */
    boundary?: () => HTMLElement | string | null;
    /** Whether the floating element should be forced to match the reference element's width. */
    matchWidth?: boolean | (() => boolean);
}
/**
 * FloatingController
 *
 * A Lit Reactive Controller that manages `@floating-ui/dom` positioning logic.
 * It abstracts away the complex math and event listeners (autoUpdate) required to
 * keep a popup/dropdown anchored to a reference element during scrolling/resizing.
 *
 * It also automatically registers the floating element with the `OverlayManager`
 * to ensure correct z-index stacking when `hoist` is true.
 */
export declare class FloatingController implements ReactiveController {
    private host;
    private options;
    private _cleanup?;
    private _overlayZIndex;
    constructor(host: ReactiveControllerHost, options: FloatingControllerOptions);
    hostDisconnected(): void;
    /**
     * Starts the floating UI `autoUpdate` listener cycle.
     * This should be called when the popover physically opens (e.g., in `updated()`).
     *
     * If `hoist` is true, it also acquires a high z-index from the `OverlayManager`.
     */
    start(): void;
    /**
     * Stops the floating UI `autoUpdate` listener cycle.
     * This should be called when the popover closes, or when the host component disconnects.
     *
     * It also releases its z-index back to the `OverlayManager`.
     */
    stop(): void;
    /**
     * Imperatively calculates and applies the new coordinates (`x`, `y`) using Floating UI.
     *
     * This method applies various CSS property resets (`margin`, `bottom`, `right`, `minWidth`)
     * to ensure that the base CSS of the floating element does not distort the absolute coordinates
     * provided by Floating UI.
     */
    updatePosition(): Promise<void>;
}
//# sourceMappingURL=floating-controller.d.ts.map