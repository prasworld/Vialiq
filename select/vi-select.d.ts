import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
import { DropdownPlacement } from '../combobox/vi-combobox.types.js';
declare const ViSelect_base: typeof ViElement & (new (...args: any[]) => import('../base/focusable-mixin.js').FocusableInterface) & (new (...args: any[]) => import('../base/validity-mixin.js').ValidityInterface<unknown>);
/**
 * vi-select
 * Form-associated single-choice select control.
 *
 * @element vi-select
 *
 * @fires {CustomEvent<{value:string; label:string}>} vi-select-change - Fires when selection changes
 * @fires {CustomEvent<void>} vi-select-clear - Fires when selection is cleared
 */
export declare class ViSelect extends ViSelect_base {
    static styles: import('lit').CSSResult;
    accessor matchWidth: boolean;
    accessor value: string;
    accessor name: string;
    accessor placeholder: string;
    accessor disabled: boolean;
    accessor clearable: boolean;
    accessor ariaLabel: string;
    accessor wrapText: boolean;
    accessor open: boolean;
    accessor placement: DropdownPlacement;
    accessor hoist: boolean;
    accessor flipBoundary: string;
    accessor flipBoundaryElement: HTMLElement | null;
    private _listboxId;
    private _optionIdMap;
    private _getOptionId;
    private accessor _selectedLabel;
    private accessor _activeIndex;
    private accessor _slottedItems;
    private accessor _triggerEl;
    private accessor _listboxEl;
    private _slotMutationObserver;
    private accessor _typeAheadString;
    protected get _focusableElement(): HTMLElement | null;
    private _floatingController;
    private _keyboardController;
    private _syncHighlightToOptions;
    get isSearchable(): boolean;
    get mode(): "single";
    protected _testValidity(): Partial<ValidityStateFlags>;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _defaultValue;
    protected firstUpdated(changedProperties: PropertyValues): void;
    formResetCallback(): void;
    willUpdate(changedProperties: PropertyValues): void;
    updated(changedProperties: PropertyValues): void;
    formDisabledCallback(disabled: boolean): void;
    private _observeSlottedItems;
    private _syncSlottedSelectedState;
    private _syncSelectedLabel;
    private _updateSlottedActiveState;
    private _scrollToActiveIndex;
    private _handleSlottedItemSelect;
    private _selectOption;
    private _typeaheadBuffer;
    private _typeaheadTimeout;
    private _handleKeyDown;
    private _handleOutsideClick;
    private _onClear;
    private _toggleOpen;
    toggle(): void;
    show(): void;
    close(): void;
    clear(): void;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-select': ViSelect;
    }
}
export {};
//# sourceMappingURL=vi-select.d.ts.map