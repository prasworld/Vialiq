import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsVariant = 'line' | 'pill' | 'card' | 'enclosed' | 'secondary';
export type TabsActivation = 'automatic' | 'manual';
export type TabsOverflow = 'scroll' | 'menu' | 'wrap';
/**
 * `vi-tabs`
 *
 * Container that manages active tab state, keyboard navigation (WAI-ARIA APG),
 * overflow handling, and closable tab focus management.
 *
 * @element vi-tabs
 *
 * @attr {string}          active           - tab-id of the active tab
 * @attr {TabsOrientation} orientation      - 'horizontal' | 'vertical'
 * @attr {TabsVariant}     variant          - Visual style variant
 * @attr {TabsActivation}  activation       - 'manual' (default) | 'automatic'
 * @attr {TabsOverflow}    overflow         - 'scroll' (default) | 'menu' | 'wrap'
 * @attr {boolean}         anchor-closable  - Sort closable tabs to the end of the tablist
 *
 * @slot - Place `vi-tab` and `vi-tab-panel` elements here (slot assignment is automatic)
 *
 * @csspart tablist       - The `role="tablist"` container
 * @csspart tab-indicator - Active tab underline / indicator
 * @csspart tab-cursor    - Sliding selection background element
 * @csspart more-button   - The "More" overflow trigger button
 * @csspart more-menu     - The "More" dropdown menu
 *
 * @fires {CustomEvent<{fromTabId:string;toTabId:string}>} vi-tabs-before-change  - Cancelable. Fires before tab changes.
 * @fires {CustomEvent<{fromTabId:string;toTabId:string}>} vi-tabs-change         - Fires after tab changes.
 * @fires {CustomEvent<{tabId:string}>}                   vi-tabs-tab-close       - Fires after a closable tab is closed. Host must remove the element.
 */
export declare class ViTabs extends ViElement {
    static styles: import('lit').CSSResult;
    /** tab-id of the currently active tab. */
    accessor active: string;
    /** Layout direction. */
    accessor orientation: TabsOrientation;
    /** Visual style. */
    accessor variant: TabsVariant;
    /**
     * Activation mode.
     * - `'manual'` (default): Arrow keys move focus only; Enter/Space activates.
     * - `'automatic'`: Focus immediately activates the tab.
     */
    accessor activation: TabsActivation;
    /**
     * Overflow behavior when tabs exceed tablist width.
     * - `'scroll'` (default): Tablist scrolls horizontally.
     * - `'menu'`:  Extra tabs appear in a "More" dropdown. Selected tab swaps into visible area.
     * - `'wrap'`:  Tabs wrap to additional lines.
     */
    accessor overflow: TabsOverflow;
    /**
     * When true, closable tabs are visually sorted to the end of the tablist
     * (using CSS `order`). DOM order — and therefore ARIA reading order — is unchanged.
     */
    accessor anchorClosable: boolean;
    /**
     * When true, closing a tab automatically removes the vi-tab and its associated
     * vi-tab-panel from the DOM. When false (default), the host application must
     * handle the removal upon receiving the vi-tabs-tab-close event.
     */
    accessor destroyOnClose: boolean;
    /**
     * When true, renders an "Add tab" button at the end of the tablist.
     * Dispatches the `vialiq-add` event when clicked.
     */
    accessor addable: boolean;
    /** tab-ids currently hidden in the "More" overflow menu. */
    private accessor _overflowTabIds;
    /** Whether the "More" dropdown is open. */
    private accessor _moreMenuOpen;
    /** The physical order of tabs, updated on swap to persist positions. */
    private _visualOrder;
    private _tablistEl;
    private _indicatorEl;
    private _cursorEl;
    private _resizeObserver?;
    private accessor _isScrollable;
    private accessor _isScrollStart;
    private accessor _isScrollEnd;
    private static _iconsRegistered;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    updated(changed: PropertyValues): void;
    private _getTabs;
    private _getPanels;
    private _getEnabledTabs;
    /** Sync all state: slot assignment, active/ARIA attrs, tabindex, overflow order, indicator. */
    private _syncState;
    /** Updates the data-scroll-* attributes on the tablist based on current scroll position. */
    private _updateScrollState;
    /**
     * Measure which tabs fit in the tablist width and partition them into
     * visible vs overflow arrays. Uses the persistent _visualOrder to decide.
     */
    private _computeMenuOverflow;
    /**
     * When a tab from the overflow menu is selected, swap its position
     * in the persistent _visualOrder array with the last visible tab.
     */
    private _swapFromOverflow;
    /**
     * Applies the persistent visual order to the physical DOM via CSS order.
     * Flexbox defaults to order: 0, so we must explicitly number every tab.
     */
    private _updateVisualOrder;
    private _updateIndicator;
    private _onTabSelect;
    private _onTabBeforeClose;
    private _activateTab;
    private _onKeydown;
    private _onAddClick;
    private _onDocClick;
    private _onSlotChange;
    private _renderAddButton;
    private _renderMoreMenu;
    private _renderScrollArrow;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-tabs': ViTabs;
    }
}
//# sourceMappingURL=vi-tabs.d.ts.map