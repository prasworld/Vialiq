import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type DividerDirection = 'horizontal' | 'vertical';
export type DividerTextPlacement = 'left' | 'center' | 'right';
/**
 * vi-divider
 * Visual separator rule for segmenting blocks of content, form sections, or inline items.
 *
 * @element vi-divider
 * @attr direction - Separator orientation: 'horizontal' | 'vertical' (default: 'horizontal')
 * @attr text-placement - Text label alignment: 'left' | 'center' | 'right' (default: 'center')
 * @attr text-margin - Custom margin offset from edge for left or right placement
 * @attr dashed - Renders line with a dashed stroke
 * @attr plain - Renders text with regular weight and secondary colour
 *
 * @slot - Default slot for embedded heading/title in a horizontal divider
 *
 * @csspart divider - The root separator container
 * @csspart line-start - Line segment preceding the text label
 * @csspart text - Text label wrapper container
 * @csspart line-end - Line segment following the text label
 */
export declare class ViDivider extends ViElement {
    static styles: import('lit').CSSResult;
    accessor direction: DividerDirection;
    accessor textPlacement: DividerTextPlacement;
    accessor textMargin: string | number | undefined;
    accessor dashed: boolean;
    accessor plain: boolean;
    accessor _hasSlottedText: boolean;
    connectedCallback(): void;
    updated(changedProperties: PropertyValues): void;
    private _handleSlotChange;
    private _getTextMarginStyle;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-divider': ViDivider;
    }
}
//# sourceMappingURL=vi-divider.d.ts.map