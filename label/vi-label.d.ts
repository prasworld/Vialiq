import { TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type LabelSize = 'sm' | 'md' | 'lg';
export type LabelLayout = 'stacked' | 'inline';
export type LabelType = 'default' | 'primary' | 'secondary';
/**
 * `vi-label`
 *
 * A styled `<label>` element for associating visible text with form controls.
 *
 * @element vi-label
 *
 * @attr {string} for - ID of the associated control
 * @attr {boolean} required - Show required `*` indicator
 * @attr {boolean} optional - Show "(optional)" text
 * @attr {boolean} disabled - Muted disabled styling
 * @attr {string} size - Font size variant ('sm', 'md', 'lg')
 *
 * @slot - Default slot for label text
 * @slot tooltip - Inline help icon that triggers a tooltip
 *
 * @csspart label - The `<label>` element
 * @csspart required-indicator - The `*` asterisk `<span>`
 * @csspart optional-indicator - The "(optional)" `<span>`
 * @csspart tooltip-trigger - Tooltip icon wrapper
 */
export declare class ViLabel extends ViElement {
    static styles: import('lit').CSSResult;
    /** ID of the associated control */
    accessor for: string;
    /** Show required `*` indicator */
    accessor required: boolean;
    /** Show "(optional)" text */
    accessor optional: boolean;
    /** Muted disabled styling */
    accessor disabled: boolean;
    /** Font size variant */
    accessor size: LabelSize;
    /** Layout spacing behavior */
    accessor layout: LabelLayout;
    /** Semantic text color */
    accessor type: LabelType;
    private _hasTooltip;
    private _handleSlotChange;
    private _handleClick;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-label': ViLabel;
    }
}
//# sourceMappingURL=vi-label.d.ts.map