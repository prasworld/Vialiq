import { nothing } from 'lit';
import { ViElement } from '../base/vi-element.js';
type LinkVariant = 'primary' | 'secondary' | 'muted';
type LinkSize = 'inherit' | 'sm' | 'md' | 'lg';
type LinkUnderline = 'always' | 'hover' | 'none';
declare const ViLink_base: typeof ViElement & (new (...args: any[]) => import('../base/focusable-mixin.js').FocusableInterface);
export declare class ViLink extends ViLink_base {
    static styles: import('lit').CSSResult;
    accessor href: string;
    accessor target: string;
    accessor rel: string;
    accessor download: string;
    accessor variant: LinkVariant;
    accessor size: LinkSize;
    accessor underline: LinkUnderline;
    accessor disabled: boolean;
    accessor external: boolean;
    protected get _focusableElement(): HTMLElement;
    protected get _effectiveTarget(): string;
    protected get _effectiveRel(): string | typeof nothing;
    accessor ariaLabel: string | null;
    render(): import('lit-html').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-link': ViLink;
    }
}
export {};
//# sourceMappingURL=vi-link.d.ts.map