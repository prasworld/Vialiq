import { ViElement } from '../base/vi-element.js';
export declare class ViMessageContainer extends ViElement {
    static styles: import('lit').CSSResult;
    accessor maxVisible: number;
    private _handleMouseEnter;
    private _handleMouseLeave;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): import('lit-html').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-message-container': ViMessageContainer;
    }
}
//# sourceMappingURL=vi-message-container.d.ts.map