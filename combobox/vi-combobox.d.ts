import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
import { ComboboxMode, DropdownPlacement, ComboboxOption, ComboboxFilterFn, ComboboxOptionsLoader, RenderOptionParams } from './vi-combobox.types.js';
declare const ViCombobox_base: typeof ViElement & (new (...args: any[]) => import('../base/focusable-mixin.js').FocusableInterface) & (new (...args: any[]) => import('../base/validity-mixin.js').ValidityInterface<unknown>);
/**
 * vi-combobox
 * Searchable, filterable input with dropdown listbox.
 *
 * @element vi-combobox
 *
 * @attr {ComboboxMode} mode           - Mode: 'single' | 'multi' | 'tags' | 'creatable' (default: 'single')
 * @attr {string|string[]} value        - Selected value(s)
 * @attr {string} placeholder          - Input placeholder text
 * @attr {string} name                 - Form field name
 * @attr {boolean} disabled            - Disables the control
 * @attr {boolean} required            - Required selection
 * @attr {boolean} loading             - Show spinner in listbox
 * @attr {number} max-tags             - Max tag count for multi/tags mode
 * @attr {number} debounce             - Search debounce delay in ms (default: 300)
 * @attr {number} min-chars            - Min characters before search (default: 1)
 * @attr {boolean} clearable           - Show clear button when value exists
 * @attr {boolean} searchable          - Enable text search input (default: true)
 * @attr {string} no-options-text      - Message when no results match
 * @attr {string} create-text          - Template for creatable mode option
 * @attr {boolean} virtualize          - Enable windowed virtual scroll for large lists
 * @attr {string} match-from           - Filter position: 'start' | 'any' (default: 'any')
 * @attr {boolean} highlight-match     - Wrap matched substring in <mark> (default: true)
 * @attr {boolean} open-on-focus       - Open listbox on input focus
 *
 * @fires vi-combobox-change - Selection changes ({ value, label, option, data })
 * @fires vi-combobox-search - Search query typed ({ query })
 * @fires vi-combobox-create - New option created ({ value })
 * @fires vi-combobox-remove - Tag removed ({ value, data })
 * @fires vi-combobox-clear  - Selection cleared ({ previousValue })
 * @fires vi-combobox-open   - Listbox opened
 * @fires vi-combobox-close  - Listbox closed
 * @fires vi-combobox-filter - Filter completed ({ query, results, matchedValues })
 */
export declare class ViCombobox extends ViCombobox_base {
    static styles: import('lit').CSSResult;
    accessor value: string | string[];
    accessor mode: ComboboxMode;
    accessor disabled: boolean;
    protected _testValidity(): Partial<ValidityStateFlags>;
    connectedCallback(): void;
    private _handleSlottedItemSelect;
    accessor placeholder: string;
    accessor name: string;
    accessor loading: boolean;
    accessor maxTags: number | undefined;
    accessor debounce: number;
    accessor minChars: number;
    accessor clearable: boolean;
    accessor searchable: boolean;
    accessor noOptionsText: string;
    accessor createText: string;
    accessor removeCustomItemText: string;
    accessor virtualize: boolean;
    accessor groupSort: 'asc' | 'desc' | 'none';
    accessor matchFrom: 'start' | 'any';
    accessor highlightMatch: boolean;
    accessor placement: DropdownPlacement;
    accessor openOnFocus: boolean;
    accessor open: boolean;
    accessor hoist: boolean;
    accessor flipBoundary: string;
    accessor flipBoundaryElement: HTMLElement | null;
    accessor filterFn: ComboboxFilterFn | null;
    accessor renderOption: ((params: RenderOptionParams) => TemplateResult) | null;
    accessor renderCreateOption: ((query: string) => TemplateResult) | null;
    private _optionsList;
    private accessor _sentinelTopEl;
    private accessor _sentinelBottomEl;
    /**
     * Manages intersection observers for infinite scrolling.
     * Registers itself via Lit's ReactiveController lifecycle.
     */
    private _infiniteScrollController;
    private _filterController;
    private _keyboardController;
    get _query(): string;
    set _query(val: string);
    private _floatingController;
    set options(val: ComboboxOption[] | ComboboxOptionsLoader);
    get options(): ComboboxOption[] | ComboboxOptionsLoader;
    private _optionsLoader;
    private _optionDataMap;
    private _optionIdMap;
    private _getOptionId;
    private accessor _activeIndex;
    private accessor _slottedItems;
    private accessor _inputEl;
    private accessor _triggerEl;
    private accessor _listboxEl;
    private accessor _controlEl;
    private _slotMutationObserver;
    protected get _focusableElement(): HTMLElement | null;
    get isSearchable(): boolean;
    disconnectedCallback(): void;
    protected firstUpdated(_changedProperties: PropertyValues): void;
    protected updated(changedProperties: PropertyValues): void;
    private _observeSlottedItems;
    private _rebuildOptionDataMap;
    private _syncSlottedSelectedState;
    private _getSelectedValues;
    private _updateFormValue;
    get filteredOptions(): ComboboxOption[];
    private _handleInput;
    private _selectOption;
    private _removeTag;
    private _handleCreate;
    private _handleDeleteTempItem;
    private _scrollToActiveIndex;
    private _handleKeyDown;
    private _handleOutsideClick;
    private _focusTime;
    private _handleInputFocus;
    private _handleControlClick;
    private get _visibleSlottedItems();
    /**
     * Sets `active` property on visible slotted items by index.
     * Drives `.is-active` CSS class inside vi-combobox-item render.
     */
    private _updateSlottedActiveState;
    toggle(): void;
    show(): void;
    close(): void;
    clearValue(): void;
    focus(options?: FocusOptions): void;
    getSelectedOptions(): ComboboxOption[];
    setOptions(opts: ComboboxOption[]): void;
    addItem(opt: ComboboxOption): void;
    removeItem(value: string): void;
    private _dispatch;
    private _renderHighlightedText;
    private _renderSingleOption;
    private _renderOptionsList;
    private _getDisplayLabel;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-combobox': ViCombobox;
    }
}
export {};
//# sourceMappingURL=vi-combobox.d.ts.map