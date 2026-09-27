import { ViElement } from '../base/vi-element.js';
export interface ViMenuItemClickEventDetail {
    value: string;
    item: ViMenuItem;
}
/**
 * vi-menu-item
 *
 * An individual item inside a vi-menu.
 *
 * @element vi-menu-item
 * @attr value - Unique identifier for the item
 * @attr disabled - Disables the item
 * @attr danger - Applies danger/destructive styling
 *
 * @fires vi-menu-item-click - Fired when clicked
 */
export declare class ViMenuItem extends ViElement {
    static styles: import('lit').CSSResult;
    accessor value: string;
    accessor disabled: boolean;
    accessor danger: boolean;
    accessor tabbable: boolean;
    private _handleClick;
    private _handleKeyDown;
    focus(options?: FocusOptions): void;
    render(): import('lit-html').TemplateResult<1>;
}
//# sourceMappingURL=vi-menu-item.d.ts.map