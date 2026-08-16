import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type AccordionVariant = 'default' | 'bordered' | 'flush' | 'card';
export type AccordionSize = 'sm' | 'md' | 'lg';
/**
 * vi-accordion
 * Container component for vertically stacked collapsible panels.
 *
 * @element vi-accordion
 *
 * @attr {boolean} multi          - Allows opening multiple items simultaneously
 * @attr {AccordionVariant} variant - Visual style variant
 * @attr {AccordionSize} size      - Component scale/sizing
 *
 * @slot - Default slot for vi-accordion-item elements
 *
 * @fires {CustomEvent<{itemId: string; open: boolean}>} vi-accordion-change - Fired when any accordion item toggles
 */
export declare class ViAccordion extends ViElement {
    static styles: import('lit').CSSResult;
    /** Allow multiple items open simultaneously. */
    accessor multi: boolean;
    /** Visual style variant: 'default' | 'bordered' | 'flush' | 'card' */
    accessor variant: AccordionVariant;
    /** Sizing of the headers and panels: 'sm' | 'md' | 'lg' */
    accessor size: AccordionSize;
    constructor();
    updated(changed: PropertyValues): void;
    private _handleSlotChange;
    private _getAccordionItems;
    private _propagateProps;
    private _handleBeforeItemOpen;
    private _handleItemOpen;
    private _handleItemClose;
    private _dispatchChangeEvent;
    private _onKeyDown;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-accordion': ViAccordion;
    }
}
//# sourceMappingURL=vi-accordion.d.ts.map