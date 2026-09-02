import { ViElement } from '../base/vi-element.js';
/**
 * @element vi-sidebar-container
 * @slot sidebar - The slot for vi-sidebar components
 * @slot content - The slot for the main page content
 */
export declare class ViSidebarContainer extends ViElement {
    static styles: import('lit').CSSResult;
    accessor showBackdrop: boolean;
    accessor animations: boolean;
    accessor allowSidebarBackdropControl: boolean;
    accessor contentClass: string;
    accessor backdropClass: string;
    private accessor _sidebars;
    firstUpdated(): void;
    render(): import('lit-html').TemplateResult<1>;
    private _handleSidebarSlotChange;
    private _onBackdropClick;
    requestBackdrop(show: boolean): void;
    updateLayout(): void;
    private _getSidebarSize;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-sidebar-container': ViSidebarContainer;
    }
}
//# sourceMappingURL=vi-sidebar-container.d.ts.map