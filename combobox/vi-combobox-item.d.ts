import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
/**
 * vi-combobox-item
 * Dropdown item primitive for declarative composition inside <vi-combobox>.
 *
 * @element vi-combobox-item
 *
 * @attr {string}  value       - Value submitted when selected (reflected)
 * @attr {string}  label       - Display text; used for search filtering (reflected)
 * @attr {string}  group       - Optgroup header text (reflected)
 * @attr {boolean} disabled    - Prevents selection (reflected)
 * @attr {string}  icon        - Icon name from icon registry (reflected)
 * @attr {string}  description - Secondary text rendered below label (reflected)
 * @attr {boolean} selected    - Selected state (reflected)
 *
 * @slot - Custom HTML template for option item layout
 *
 * @csspart item        - The <li> wrapper element
 * @csspart icon        - Leading icon wrapper
 * @csspart label       - Primary text span
 * @csspart description - Secondary text span
 * @csspart check       - Checkmark icon when selected
 * @csspart content     - Custom slot wrapper
 */
export declare class ViComboboxItem extends ViElement {
    static styles: import('lit').CSSResult;
    accessor value: string;
    accessor label: string;
    accessor data: unknown;
    accessor group: string;
    accessor disabled: boolean;
    accessor icon: string;
    accessor description: string;
    /**
     * Search corpus override for slotted mode. Accepts an array of search terms; joined with a
     * space internally. Falls back to `label` when empty.
     * HTML attribute: space-separated string — `search-text="Alice PI alice@acme.com"`
     * JS property: string array  — `.searchText=${['Alice', 'PI', 'alice@acme.com']}`
     */
    accessor searchText: string[];
    accessor selected: boolean;
    accessor active: boolean;
    accessor _hasSlotContent: boolean;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected firstUpdated(changedProperties: PropertyValues): void;
    protected updated(changedProperties: PropertyValues): void;
    private _handleClick;
    private _handleSlotChange;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-combobox-item': ViComboboxItem;
    }
}
//# sourceMappingURL=vi-combobox-item.d.ts.map