import { PropertyValues } from 'lit';
import { ViElement } from '../base/vi-element.js';
import { ViSidebarContainer } from './vi-sidebar-container.js';
export type SidebarMode = 'over' | 'push' | 'slide';
export type SidebarPosition = 'left' | 'right' | 'top' | 'bottom' | 'start' | 'end';
declare const ViSidebar_base: typeof ViElement & (new (...args: any[]) => import('../base/focus-trap-mixin.js').FocusTrapInterface);
/**
 * A sidebar panel that supports multiple display modes (over, push, slide)
 * and optional resizing. Must be placed inside a `vi-sidebar-container`.
 *
 * @element vi-sidebar
 * @slot - The content of the sidebar
 *
 * @fires vi-sidebar-open-start - Fired before the sidebar begins opening
 * @fires vi-sidebar-opened - Fired when the sidebar becomes open
 * @fires vi-sidebar-after-opened - Fired when the open transition finishes
 * @fires vi-sidebar-close-start - Fired before the sidebar begins closing
 * @fires vi-sidebar-closed - Fired when the sidebar becomes closed
 * @fires vi-sidebar-after-closed - Fired when the close transition finishes
 * @fires vi-sidebar-opened-change - Fired whenever `opened` changes. Detail: `{ opened: boolean }`
 * @fires vi-sidebar-transition-end - Fired whenever any open/close transition ends
 */
export declare class ViSidebar extends ViSidebar_base {
    static styles: import('lit').CSSResult;
    /** Whether the sidebar is currently open. */
    accessor opened: boolean;
    /** Display mode: `over` (floats above content), `push` (shifts content), `slide` (translates content). */
    accessor mode: SidebarMode;
    /** Position of the sidebar relative to the container. */
    accessor position: SidebarPosition;
    /**
     * When true, the sidebar uses a width-collapse animation instead of
     * sliding off-screen. Set `docked-size` to a non-zero value (e.g. `"60px"`)
     * to keep a persistent strip visible when closed.
     */
    accessor dock: boolean;
    /**
     * How wide (or tall) the sidebar remains when docked and closed.
     * Defaults to `"0px"` (completely hidden).
     * Set to e.g. `"60px"` for an icon-rail style dock.
     */
    accessor dockedSize: string;
    /** Collapse the sidebar when the viewport width drops to or below this value (px). */
    accessor autoCollapseWidth: number | undefined;
    /** Collapse the sidebar when the viewport height drops to or below this value (px). */
    accessor autoCollapseHeight: number | undefined;
    /** Whether to check auto-collapse on initial connection. */
    accessor autoCollapseOnInit: boolean;
    /** Enable/disable CSS transitions. */
    accessor animations: boolean;
    /** Trap focus inside the sidebar while it is open. */
    accessor trapFocus: boolean;
    /** Automatically move focus to the first focusable element when opened. */
    accessor autoFocus: boolean;
    /** Request the container to show a backdrop when the sidebar is open. */
    accessor showBackdrop: boolean;
    /** Close when the backdrop is clicked. */
    accessor closeOnClickBackdrop: boolean;
    /** Close when a click occurs outside the sidebar. */
    accessor closeOnClickOutside: boolean;
    /** Close when a key is pressed (default: Escape). */
    accessor keyClose: boolean;
    /** The keyboard key that closes the sidebar when `key-close` is enabled. */
    accessor closeKey: string;
    /**
     * Allow the user to drag the sidebar edge to resize it.
     * Only effective on left/right (and top/bottom) positioned sidebars.
     */
    accessor resizable: boolean;
    /** Minimum width (or height) when resizing. In px. */
    accessor resizeMin: number;
    /** Maximum width (or height) when resizing. In px. */
    accessor resizeMax: number;
    private accessor _isResizing;
    private _wasCollapsed;
    container?: ViSidebarContainer;
    private _resizeObserver?;
    private _clickOutsideHandler;
    private _keydownHandler;
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changedProperties: PropertyValues): void;
    render(): import('lit-html').TemplateResult<1>;
    /** Opens the sidebar. */
    open(): void;
    /** Closes the sidebar. */
    close(): void;
    /** Toggles the sidebar open/closed. */
    toggle(): void;
    /** Syncs `--vi-sidebar-docked-size` CSS variable to drive the dock animation. */
    private _syncDockedSizeVar;
    private _updateContainer;
    private _checkAutoCollapse;
    private _onClickOutside;
    private _startResize;
    private _onResizeMove;
    private _stopResize;
    private _onKeydown;
    private _onTransitionEnd;
    private _focusFirstElement;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-sidebar': ViSidebar;
    }
}
export {};
//# sourceMappingURL=vi-sidebar.d.ts.map