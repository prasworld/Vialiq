import { TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type ContentSwitcherSize = 'sm' | 'md' | 'lg';
/**
 * vi-content-switcher
 *
 * A pill-shaped segmented control for switching between a small set of mutually
 * exclusive views. Prefer this over `vi-tabs` when there are 2–5 options and the
 * options are compact labels (not tab panels with heavy content).
 *
 * @element vi-content-switcher
 *
 * @attr {string}  value    - Currently active item value. Reflects to HTML attribute.
 * @attr {string}  size     - Visual size: 'sm' | 'md' (default) | 'lg'
 * @attr {boolean} disabled - Disables all interactions
 *
 * @fires {CustomEvent<{ value: string; previousValue: string }>} vi-content-switcher-change
 *   Fired when the active item changes. `detail.value` is the new active value.
 *
 * @csspart track   - The outer pill container
 * @csspart indicator - The animated white sliding pill
 *
 * @slot - Place `<vi-switcher-item>` elements here
 *
 * @example
 * ```html
 * <vi-content-switcher value="design">
 *   <vi-switcher-item value="design">Design</vi-switcher-item>
 *   <vi-switcher-item value="json">JSON</vi-switcher-item>
 *   <vi-switcher-item value="preview">Preview</vi-switcher-item>
 * </vi-content-switcher>
 * ```
 */
export declare class ViContentSwitcher extends ViElement {
    static formAssociated: boolean;
    static styles: import('lit').CSSResult;
    private _internals;
    constructor();
    /**
     * The currently active item value.
     * @attr value
     */
    accessor value: string;
    /**
     * Visual size of the switcher.
     * @attr size
     */
    accessor size: ContentSwitcherSize;
    /**
     * If true, stretches the switcher to 100% of its parent's width.
     * @attr block
     */
    accessor block: boolean;
    /**
     * The name of the input for form submission.
     * @attr name
     */
    accessor name: string;
    /**
     * Disables all item interactions.
     * @attr
     */
    accessor disabled: boolean;
    /** Tracks known items from the slotted children */
    private accessor _items;
    private _defaultValue;
    private _resizeObserver?;
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changedProperties: Map<string, unknown>): void;
    formResetCallback(): void;
    formDisabledCallback(disabled: boolean): void;
    private _onSlotChange;
    private _onItemClick;
    private _selectItem;
    private _onKeyDown;
    private _findNextEnabledItemIndex;
    private _syncItems;
    private _updateIndicator;
    render(): TemplateResult;
}
/**
 * vi-switcher-item
 *
 * A single option within `<vi-content-switcher>`.
 *
 * @element vi-switcher-item
 *
 * @attr {string}  value    - The value this item represents (required)
 * @attr {boolean} active   - Set by the parent switcher; do not set manually
 * @attr {boolean} disabled - Disables only this item
 *
 * @slot - Item label text
 */
export declare class ViSwitcherItem extends ViElement {
    static styles: import('lit').CSSResult;
    /**
     * The value this item represents. Must match the `value` on the parent switcher.
     * @attr value
     */
    accessor value: string;
    /**
     * Whether this item is currently active. Managed by `vi-content-switcher`.
     * @attr
     */
    accessor active: boolean;
    /**
     * Disables this individual item.
     * @attr
     */
    accessor disabled: boolean;
    connectedCallback(): void;
    updated(): void;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-content-switcher': ViContentSwitcher;
        'vi-switcher-item': ViSwitcherItem;
    }
}
//# sourceMappingURL=vi-content-switcher.d.ts.map