import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
import { AccordionVariant, AccordionSize } from './vi-accordion.js';
/**
 * vi-accordion-item
 * Collapsible item section within vi-accordion.
 *
 * @element vi-accordion-item
 *
 * @attr {string} item-id  - Unique element identifier
 * @attr {boolean} open     - Expanded state of the accordion panel
 * @attr {boolean} disabled - Whether the header is disabled/non-interactive
 * @attr {string} label     - Header text fallback if slot="header" is omitted
 *
 * @slot header         - Header content override
 * @slot header-icon    - Slot for leading header icon
 * @slot header-actions - Slot for trailing action buttons/badges
 * @slot - Default slot for panel body content
 */
export declare class ViAccordionItem extends ViElement {
    static styles: import('lit').CSSResult;
    /** Unique ID for the item. */
    accessor itemId: string;
    /** Expanded state. */
    accessor open: boolean;
    /** Disabled state. */
    accessor disabled: boolean;
    /** Plain text header label. */
    accessor label: string;
    /** Sizing of the item (propagated by parent accordion). */
    accessor size: AccordionSize;
    /** Visual variant (propagated by parent accordion). */
    accessor variant: AccordionVariant;
    private _resizeObserver?;
    firstUpdated(changedProperties: PropertyValues): void;
    disconnectedCallback(): void;
    private _handleHeaderClick;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-accordion-item': ViAccordionItem;
    }
}
//# sourceMappingURL=vi-accordion-item.d.ts.map