import { TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
/**
 * vi-card
 * A flexible container for grouping related content and actions, utilizing fluid container queries.
 *
 * @element vi-card
 * @attr bordered - Renders a border around the card
 * @attr hoverable - Adds a shadow and border highlight on hover
 * @attr loading - Shows a skeleton loader in the card body
 * @attr size - 'fluid' (default) | 'sm' | 'md' | 'lg'
 *
 * @slot         - Card body content
 * @slot cover   - Slot for the card's top cover image/video
 * @slot title   - Slot for the main card title
 * @slot extra   - Slot for additional elements in the top right header (e.g. actions, tags)
 * @slot footer  - Card footer content
 * @slot actions - Slot for bottom action buttons. Multiple elements will be distributed evenly.
 * @slot loader  - Slot to override the default loading skeleton when `loading` is true
 *
 * @csspart card   - The main card container
 * @csspart cover  - The cover media wrapper
 * @csspart header - The header container
 * @csspart title  - The title wrapper
 * @csspart extra  - The extra actions wrapper
 * @csspart body   - The body container
 * @csspart footer - The footer container
 * @csspart actions - The bottom actions wrapper
 */
export declare class ViCard extends ViElement {
    static styles: import('lit').CSSResult;
    /** Renders a border around the card */
    accessor bordered: boolean;
    /** Adds a shadow and border highlight on hover */
    accessor hoverable: boolean;
    /** Shows a skeleton loader in the card body */
    accessor loading: boolean;
    /** Controls the padding size scale */
    accessor size: 'fluid' | 'sm' | 'md' | 'lg';
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-card': ViCard;
    }
}
//# sourceMappingURL=vi-card.d.ts.map