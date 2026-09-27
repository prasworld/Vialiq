import { ViElement } from '../base/vi-element.js';
import { Placement } from '@floating-ui/dom';
/**
 * vi-dropdown
 *
 * A dropdown menu overlay that composes vi-popover and vi-menu.
 *
 * @element vi-dropdown
 * @attr placement - The placement of the dropdown (e.g., bottom-start)
 * @attr trigger - The interaction that triggers the dropdown (click, hover, focus, contextmenu)
 * @attr open - Whether the dropdown is open
 *
 * @slot - The trigger element
 * @slot content - The vi-menu element
 */
export declare class ViDropdown extends ViElement {
    static styles: import('lit').CSSResult;
    accessor placement: Placement;
    accessor trigger: 'click' | 'hover' | 'focus' | 'contextmenu';
    accessor open: boolean;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _handleKeyDown;
    private _handleShow;
    private _handleHide;
    private _handleMenuItemClick;
    render(): import('lit-html').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-dropdown': ViDropdown;
    }
}
//# sourceMappingURL=vi-dropdown.d.ts.map