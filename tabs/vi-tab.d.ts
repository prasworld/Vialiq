import { TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type TabSize = 'sm' | 'md' | 'lg';
/**
 * `vi-tab`
 *
 * A single tab button within a `vi-tabs` container.
 * Renders a native `<button role="tab">` with ARIA attributes managed
 * by the parent `vi-tabs` via direct property setting.
 *
 * @element vi-tab
 *
 * @attr {string}  tab-id      - Unique ID linking to the associated `vi-tab-panel[for]`
 * @attr {boolean} disabled    - Tab is not selectable
 * @attr {boolean} closable    - Tab shows a close button; fires vi-tab-before-close / vi-tab-close
 * @attr {number}  badge-count - Notification badge count (renders a pill badge)
 *
 * @slot         - Tab label text
 * @slot icon    - Leading icon (optional)
 *
 * @csspart tab          - The inner `<button>` element
 * @csspart icon         - Icon slot wrapper
 * @csspart label        - Label text span
 * @csspart badge        - Count badge
 * @csspart close-button - The close `<button>` (when closable)
 *
 * @fires {CustomEvent<{tabId: string}>} vi-tab-select       - Internal event bubbled to vi-tabs on click
 * @fires {CustomEvent<{tabId: string}>} vi-tab-before-close - Cancelable. Fired before close button removes tab.
 * @fires {CustomEvent<{tabId: string}>} vi-tab-close        - Fired after close (not cancelled). Host app should remove element.
 */
export declare class ViTab extends ViElement {
    static styles: import('lit').CSSResult;
    /** Unique ID linking to vi-tab-panel[for]. Auto-generated if not set. */
    accessor tabId: string;
    /** Tab is not selectable. */
    accessor disabled: boolean;
    /**
     * Tab shows a close (×) button. Fires `vi-tab-before-close` (cancelable)
     * and `vi-tab-close` (host app should remove the element on this event).
     */
    accessor closable: boolean;
    /** Notification badge count. Rendered when > 0. */
    accessor badgeCount: number | undefined;
    /**
     * Whether this tab is currently active.
     * Managed by vi-tabs — do not set manually.
     */
    accessor active: boolean;
    /**
     * Tab's position in the tablist (1-indexed). Used for aria-posinset.
     * Managed by vi-tabs.
     */
    accessor posinset: number;
    /**
     * Total tab count in the tablist. Used for aria-setsize.
     * Managed by vi-tabs.
     */
    accessor setsize: number;
    /** Whether the tab's inner button participates in tab order. Managed by vi-tabs. */
    set tabIndex(val: number);
    get tabIndex(): number;
    private _tabIndex;
    private _hasIcon;
    connectedCallback(): void;
    private _onIconSlotChange;
    updated(changedProperties: Map<string, unknown>): void;
    private _onClick;
    private _onCloseClick;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-tab': ViTab;
    }
}
//# sourceMappingURL=vi-tab.d.ts.map