import { ViElement } from '../base/vi-element.js';
export type ToastPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
export declare class ViToastContainer extends ViElement {
    static styles: import('lit').CSSResult;
    accessor position: ToastPosition;
    accessor maxVisible: number;
    private _handleMouseEnter;
    private _handleMouseLeave;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): import('lit-html').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-toast-container': ViToastContainer;
    }
}
//# sourceMappingURL=vi-toast-container.d.ts.map