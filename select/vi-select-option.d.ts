import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
import { SlottedListboxItem } from '../shared/types/listbox.types.js';
/**
 * vi-select-option
 * Dropdown item primitive for declarative composition inside <vi-select>.
 *
 * @element vi-select-option
 */
export declare class ViSelectOption extends ViElement implements SlottedListboxItem {
    static styles: import('lit').CSSResult;
    accessor value: string;
    accessor label: string;
    accessor data: unknown;
    accessor group: string;
    accessor disabled: boolean;
    accessor icon: string;
    accessor description: string;
    accessor searchText: string[];
    accessor selected: boolean;
    accessor active: boolean;
    accessor wrapText: boolean;
    accessor highlightText: string;
    private accessor _hasSlotContent;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected firstUpdated(changedProperties: PropertyValues): void;
    protected updated(changedProperties: PropertyValues): void;
    private _handleClick;
    private _handleSlotChange;
    private _renderHighlightedLabel;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-select-option': ViSelectOption;
    }
}
//# sourceMappingURL=vi-select-option.d.ts.map