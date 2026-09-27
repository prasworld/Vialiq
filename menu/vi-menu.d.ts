import { ViElement } from '../base/vi-element.js';
/**
 * vi-menu
 *
 * A versatile menu component for navigation and dropdowns.
 * Handles arrow key navigation natively across slotted items.
 *
 * @element vi-menu
 * @slot - Menu items (vi-menu-item, vi-menu-divider)
 */
export declare class ViMenu extends ViElement {
    static styles: import('lit').CSSResult;
    private _handleSlotChange;
    private _resetTabIndexes;
    private _getItems;
    private _handleKeyDown;
    private _handleFocusIn;
    render(): import('lit-html').TemplateResult<1>;
}
//# sourceMappingURL=vi-menu.d.ts.map