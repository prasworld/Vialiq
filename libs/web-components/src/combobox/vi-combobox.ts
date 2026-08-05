import { css, html, nothing, unsafeCSS, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { FocusableMixin } from '../base/focusable-mixin.js';
import { ValidityMixin } from '../base/validity-mixin.js';
import { ViElement } from '../base/vi-element.js';
import '../icons/vi-icon.js';
import '../chip/vi-chip.js';
import '../button/vi-button.js';
import './vi-combobox-item.js';
import type { ViComboboxItem } from './vi-combobox-item.js';
import { registerIcons } from '../icons/registry.js';
import { FloatingController } from '../base/controllers/floating-controller.js';
import { InfiniteScrollController } from '../shared/controllers/infinite-scroll-controller.js';
import { FilterController } from '../shared/controllers/filter-controller.js';
import { ListboxKeyboardController } from '../shared/controllers/keyboard-controller.js';
import '@lit-labs/virtualizer';
import comboboxStyles from './vi-combobox.scss?inline';

import { checkIcon, chevronDownIcon, minusIcon, xIcon as closeIcon } from '@vialiq/icons';

registerIcons([chevronDownIcon, checkIcon, closeIcon, minusIcon]);

import type {
  ComboboxMode,
  DropdownPlacement,
  ComboboxOption,
  ComboboxOptionData,
  ComboboxFilterFn,
  ComboboxOptionsLoader,
  RenderOptionParams,
} from './vi-combobox.types.js';

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
@customElement('vi-combobox')
export class ViCombobox extends ValidityMixin(FocusableMixin(ViElement)) {
  static override styles = css`${unsafeCSS(comboboxStyles)}`;

  @property({ reflect: true }) accessor value: string | string[] = '';
  @property({ type: String, reflect: true }) accessor mode: ComboboxMode = 'single';
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  protected override _testValidity(): Partial<ValidityStateFlags> {
    const selected = this._getSelectedValues();
    return {
      valueMissing: this.required && selected.length === 0,
    };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeyDown);
    this.addEventListener('vi-combobox-item-select', this._handleSlottedItemSelect as EventListener);
    document.addEventListener('click', this._handleOutsideClick);
  }

  private _handleSlottedItemSelect = (e: CustomEvent<{ item: ViComboboxItem }>): void => {
    e.stopPropagation();
    const item = e.detail.item;
    this._selectOption({
      value: item.value,
      label: item.label || item.value,
      group: item.group || undefined,
      disabled: item.disabled,
      icon: item.icon || undefined,
      description: item.description || undefined,
      data: item.data as ComboboxOptionData,
    });
  };
  @property({ type: String, reflect: true }) accessor placeholder = 'Search...';
  @property({ type: String, reflect: true }) accessor name = '';
  @property({ type: Boolean, reflect: true }) accessor loading = false;
  @property({ type: Number, attribute: 'max-tags' }) accessor maxTags: number | undefined = undefined;
  @property({ type: Number }) accessor debounce = 300;
  @property({ type: Number, attribute: 'min-chars' }) accessor minChars = 1;
  @property({ type: Boolean }) accessor clearable = false;
  @property({
    type: Boolean,
    reflect: true,
    converter: {
      fromAttribute: (val: string | null) => val !== 'false' && val !== null,
    },
  })
  accessor searchable = true;
  @property({ type: String, attribute: 'no-options-text' }) accessor noOptionsText = 'No results found';
  @property({ type: String, attribute: 'create-text' }) accessor createText = 'Create "{query}"';
  @property({ type: String, attribute: 'remove-custom-item-text' }) accessor removeCustomItemText = 'Remove custom item';
  @property({ type: Boolean }) accessor virtualize = false;
  @property({ type: String, attribute: 'group-sort' }) accessor groupSort: 'asc' | 'desc' | 'none' = 'none';
  @property({ type: String, attribute: 'match-from' }) accessor matchFrom: 'start' | 'any' = 'any';
  @property({ type: Boolean, attribute: 'highlight-match' }) accessor highlightMatch = true;
  @property({ type: String }) accessor placement: DropdownPlacement = 'bottom-start';
  @property({ type: Boolean, attribute: 'open-on-focus' }) accessor openOnFocus = false;
  @property({ type: Boolean, reflect: true }) accessor open = false;
  @property({ type: Boolean }) accessor hoist = false;
  @property({ type: String, attribute: 'flip-boundary' }) accessor flipBoundary = '';
  @property({ attribute: false }) accessor flipBoundaryElement: HTMLElement | null = null;

  @property({ attribute: false }) accessor filterFn: ComboboxFilterFn | null = null;
  @property({ attribute: false }) accessor renderOption: ((params: RenderOptionParams) => TemplateResult) | null = null;
  @property({ attribute: false }) accessor renderCreateOption: ((query: string) => TemplateResult) | null = null;

  private _optionsList: ComboboxOption[] = [];
  
  @query('.combobox-sentinel-top') private accessor _sentinelTopEl!: HTMLElement | null;
  @query('.combobox-sentinel-bottom') private accessor _sentinelBottomEl!: HTMLElement | null;

  /**
   * Manages intersection observers for infinite scrolling.
   * Registers itself via Lit's ReactiveController lifecycle.
   */
  private _infiniteScrollController = new InfiniteScrollController(this, {
    enabled: () => this.open,
    listbox: () => this._listboxEl,
    sentinelTop: () => this._sentinelTopEl,
    sentinelBottom: () => this._sentinelBottomEl,
  });

  private _filterController = new FilterController<ComboboxOptionData>(this, {
    getSlottedItems: () => this._slottedItems,
    getVisibleSlottedItems: () => this._visibleSlottedItems,
    setSlottedActiveIndex: (index: number) => this._updateSlottedActiveState(index),
    setLoading: (loading: boolean) => { this.loading = loading; },
    resetActiveIndex: () => { this._activeIndex = -1; },
    setOptionsList: (opts: ComboboxOption[]) => { this._optionsList = opts; },
    rebuildOptionDataMap: () => this._rebuildOptionDataMap(),
    open: () => { this.open = true; },
    isOpen: () => this.open,
  });

  private _keyboardController = new ListboxKeyboardController<ComboboxOptionData>(this, {
    getActiveIndex: () => this._activeIndex,
    setActiveIndex: (index: number) => { this._activeIndex = index; },
    getFilteredOptions: () => this.filteredOptions,
    getSlottedItems: () => this._slottedItems,
    getVisibleSlottedItems: () => this._visibleSlottedItems,
    getSelectedValues: () => this._getSelectedValues(),
    updateSlottedActiveState: (index: number) => this._updateSlottedActiveState(index),
    scrollToActiveIndex: () => this._scrollToActiveIndex(),
    selectOption: (opt: ComboboxOption) => this._selectOption(opt),
    handleCreate: () => this._handleCreate(),
    removeTag: (val: string) => this._removeTag(val),
    close: () => this.close(),
    openDropdown: () => { this.open = true; },
    getQuery: () => this._query,
  });

  get _query() { return this._filterController.query; }
  set _query(val: string) { 
    if (this._filterController.query !== val) {
      this._filterController.query = val; 
      if (this._slottedItems?.length > 0) {
        this._filterController.applySlottedFilter(val, this._slottedItems);
      }
      this.requestUpdate(); 
    }
  }

  private _floatingController = new FloatingController(this, {
    reference: () => this._controlEl,
    floating: () => this._listboxEl,
    placement: () => this.placement as unknown as import('@floating-ui/dom').Placement,
    offset: 4,
    hoist: () => this.hoist,
    boundary: () => this.flipBoundaryElement || this.flipBoundary || null,
    matchWidth: true,
  });

  @property({ attribute: false })
  set options(val: ComboboxOption[] | ComboboxOptionsLoader) {
    if (typeof val === 'function') {
      this._optionsLoader = val;
    } else {
      this._optionsLoader = null;
      this._optionsList = Array.isArray(val) ? [...val] : [];
      this._rebuildOptionDataMap();
    }
    this.requestUpdate('options');
  }

  get options(): ComboboxOption[] | ComboboxOptionsLoader {
    return this._optionsLoader || this._optionsList;
  }

  private _optionsLoader: ComboboxOptionsLoader | null = null;

  // Custom data payload mapping: value -> data
  private _optionDataMap = new Map<string, unknown>();
  
  // Maps option value to a unique ID for aria-activedescendant
  private _optionIdMap = new Map<string, string>();
  
  private _getOptionId(value: string): string {
    if (!this._optionIdMap.has(value)) {
      this._optionIdMap.set(value, `opt-${Math.random().toString(36).substring(2, 11)}`);
    }
    return this._optionIdMap.get(value) ?? '';
  }

  @state() private accessor _activeIndex = -1;
  @state() private accessor _slottedItems: ViComboboxItem[] = [];

  @query('.combobox-input') private accessor _inputEl!: HTMLInputElement | null;
  @query('.combobox-trigger') private accessor _triggerEl!: HTMLButtonElement | null;
  @query('.combobox-listbox') private accessor _listboxEl!: HTMLDivElement | null;
  @query('.combobox-control') private accessor _controlEl!: HTMLDivElement | null;

  private _slotMutationObserver: MutationObserver | null = null;

  protected override get _focusableElement(): HTMLElement | null {
    return (this.isSearchable ? this._inputEl : this._triggerEl) ?? null;
  }

  get isSearchable(): boolean {
    if (this.mode === 'tags' || this.mode === 'creatable') return true;
    return this.searchable;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeyDown);
    this.removeEventListener('vi-combobox-item-select', this._handleSlottedItemSelect as EventListener);
    document.removeEventListener('click', this._handleOutsideClick);
    if (this._slotMutationObserver) {
      this._slotMutationObserver.disconnect();
    }
    this._floatingController.stop();
  }


  protected override firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this._observeSlottedItems();
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('value')) {
      this._updateFormValue();
      this._syncSlottedSelectedState();
    }
    if (changedProperties.has('open')) {
      if (this.open) {
        if (this.disabled) {
          this.open = false;
          return;
        }
        this._floatingController.start();
        this._dispatch('vi-combobox-open');

        // Set active index to first selected item if it exists
        const selected = this._getSelectedValues();
        if (selected.length > 0) {
          if (this._slottedItems.length > 0) {
            const idx = this._visibleSlottedItems.findIndex((i) => i.value === selected[0]);
            this._activeIndex = idx;
            if (idx >= 0) this._updateSlottedActiveState(idx);
          } else {
            this._activeIndex = this.filteredOptions.findIndex((opt) => opt.value === selected[0]);
          }
          this._scrollToActiveIndex();
        } else {
          this._activeIndex = -1;
        }
      } else {
        this._activeIndex = -1;
        this._query = '';
        if (this._slottedItems.length > 0) {
          this._filterController.resetSlottedVisibility(this._slottedItems);
        }
        this._floatingController.stop();
        this._dispatch('vi-combobox-close');
      }
    }
  }

  private _observeSlottedItems(): void {
    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null;
    if (!slot) return;

    const updateItems = () => {
      if (this._slotMutationObserver) {
        this._slotMutationObserver.disconnect();
      }

      const assigned = slot.assignedElements({ flatten: true });
      const items = assigned.filter((el): el is ViComboboxItem => el.tagName.toLowerCase() === 'vi-combobox-item');
      this._slottedItems = items;

      if (items.length > 0) {
        // Assign stable IDs for aria-activedescendant cross-shadow reference
        items.forEach((item) => {
          if (item.value) {
            if (item.id) {
              this._optionIdMap.set(item.value, item.id);
            } else {
              item.id = this._getOptionId(item.value);
            }
          }
        });

        this._optionsList = items.map((item) => ({
          value: item.value,
          label: item.label || item.value,
          // Join searchText[] to a single corpus string; undefined = fall back to label+description
          searchText: item.searchText.length > 0 ? item.searchText.join(' ') : undefined,
          group: item.group || undefined,
          disabled: item.disabled,
          icon: item.icon || undefined,
          description: item.description || undefined,
          data: item.data as ComboboxOptionData,
        }));
        this._rebuildOptionDataMap();
        this._syncSlottedSelectedState();
        // Re-apply filter if the dropdown is open with an active query
        if (this._query && this.open) {
          this._filterController.applySlottedFilter(this._query, this._slottedItems);
        }
      }

      if (this._slotMutationObserver) {
        this._slotMutationObserver.observe(this, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['value', 'label', 'search-text', 'group', 'disabled', 'icon', 'description'],
        });
      }
    };

    updateItems();

    if (!this._slotMutationObserver) {
      this._slotMutationObserver = new MutationObserver(() => updateItems());
      this._slotMutationObserver.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['value', 'label', 'search-text', 'group', 'disabled', 'icon', 'description'],
      });
    }
  }

  private _rebuildOptionDataMap(): void {
    this._optionDataMap.clear();
    for (const opt of this._optionsList) {
      if (opt.data !== undefined) {
        this._optionDataMap.set(opt.value, opt.data);
      }
    }
  }

  private _syncSlottedSelectedState(): void {
    const selectedValues = this._getSelectedValues();
    for (const item of this._slottedItems) {
      item.selected = selectedValues.includes(item.value);
    }
  }

  private _getSelectedValues(): string[] {
    if (Array.isArray(this.value)) return this.value;
    if (typeof this.value === 'string' && this.value) {
      return this.mode === 'multi' || this.mode === 'tags' ? this.value.split(',').map((v) => v.trim()).filter(Boolean) : [this.value];
    }
    return [];
  }

  private _updateFormValue(): void {
    const selected = this._getSelectedValues();
    if (this.mode === 'multi' || this.mode === 'tags') {
      const formData = new FormData();
      for (const val of selected) {
        formData.append(this.name || 'value', val);
      }
      this._internals.setFormValue(formData);
    } else {
      this._internals.setFormValue(selected[0] || '');
    }
  }

  // --- Filter & Search Logic ---

  get filteredOptions(): ComboboxOption[] {
    // Return the full list when:
    //   – not searchable
    //   – query is empty
    //   – query is shorter than minChars (avoids premature filtering)
    //   – an async loader is driving results (loader handles its own filtering)
    let results: ComboboxOption[];

    if (!this.isSearchable || !this._query || this._query.length < this.minChars || this._optionsLoader) {
      results = this._optionsList;
    } else if (this._slottedItems.length > 0) {
      results = this._optionsList;
    } else {
      const q = this._query.toLowerCase();
      const filterFn = this.filterFn;
      if (filterFn) {
        results = this._optionsList.filter((opt) => filterFn(opt, this._query));
      } else {
        results = this._optionsList.filter((opt) => {
          const corpus = opt.searchText
            ? opt.searchText.toLowerCase()
            : [opt.label, opt.description].filter(Boolean).join(' ').toLowerCase();
          return this.matchFrom === 'start' ? corpus.startsWith(q) : corpus.includes(q);
        });
      }
    }

    if (this.groupSort !== 'none') {
      const groupsMap = new Map<string, ComboboxOption[]>();
      for (const opt of results) {
        const g = opt.group || '';
        let groupArr = groupsMap.get(g);
        if (!groupArr) {
          groupArr = [];
          groupsMap.set(g, groupArr);
        }
        groupArr.push(opt);
      }

      const groupEntries = Array.from(groupsMap.entries());
      if (this.groupSort === 'asc') {
        groupEntries.sort(([a], [b]) => a.localeCompare(b));
      } else if (this.groupSort === 'desc') {
        groupEntries.sort(([a], [b]) => b.localeCompare(a));
      }
      results = groupEntries.flatMap(([, opts]) => opts);
    }

    return results;
  }

  private _handleInput(e: Event): void {
    this._filterController.handleInput(e);
  }

  // --- Selection Logic ---

  private _selectOption(opt: ComboboxOption): void {
    if (opt.disabled) return;

    const current = this._getSelectedValues();
    let nextValue: string | string[];

    if (this.mode === 'multi' || this.mode === 'tags') {
      if (this.maxTags && current.length >= this.maxTags && !current.includes(opt.value)) {
        return;
      }
      const updated = current.includes(opt.value)
        ? current.filter((v) => v !== opt.value)
        : [...current, opt.value];
      nextValue = updated;
    } else {
      nextValue = opt.value;
      this.close();
    }

    this.value = nextValue;
    this._query = '';

    const payloadData = opt.data !== undefined ? opt.data : this._optionDataMap.get(opt.value);

    this._dispatch('vi-combobox-change', {
      value: nextValue,
      label: opt.label,
      option: opt,
      data: payloadData,
    });
  }

  private _removeTag(val: string, e?: Event): void {
    e?.stopPropagation();
    const current = this._getSelectedValues();
    const updated = current.filter((v) => v !== val);
    this.value = updated;

    const tagData = this._optionDataMap.get(val);
    this._dispatch('vi-combobox-remove', { value: val, data: tagData });
    this._dispatch('vi-combobox-change', { value: updated });
  }

  private _handleCreate(): void {
    if (!this._query.trim()) return;

    const val = this._query.trim();

    // Persist the created item in the main list locally
    if (!this._optionsList.some((o) => o.value === val)) {
      this._optionsList = [
        ...this._optionsList,
        { value: val, label: val, data: { isTemporary: true } },
      ];
      this._rebuildOptionDataMap();
    }

    if (this.mode === 'tags') {
      const current = this._getSelectedValues();
      if (!current.includes(val)) {
        const next = [...current, val];
        this.value = next;
        this._dispatch('vi-combobox-create', { value: val });
        this._dispatch('vi-combobox-change', { value: next });
      }
      this._query = '';
    } else if (this.mode === 'creatable') {
      this.value = val;
      this._dispatch('vi-combobox-create', { value: val });
      this._dispatch('vi-combobox-change', { value: val, label: val });
      this.close();
      this._query = '';
    }
  }

  private _handleDeleteTempItem(opt: ComboboxOption, e: Event): void {
    e.stopPropagation();
    
    // 1. Remove from options list
    this.removeItem(opt.value);
    
    // 2. Unselect if currently selected
    const currentValues = this._getSelectedValues();
    if (currentValues.includes(opt.value)) {
      if (this.mode === 'multi' || this.mode === 'tags') {
        const next = currentValues.filter((v) => v !== opt.value);
        this.value = next;
        this._dispatch('vi-combobox-change', { value: next });
      } else {
        this.value = '';
        this._dispatch('vi-combobox-change', { value: '' });
      }
    }
  }

  private async _scrollToActiveIndex(): Promise<void> {
    await this.updateComplete;
    if (this._activeIndex < 0) return;

    if (this.virtualize && this._slottedItems.length === 0) {
      const virtualizer = this.shadowRoot?.querySelector('lit-virtualizer') as (Element & { scrollToIndex?: (index: number, position?: string) => void }) | null;
      if (virtualizer && typeof virtualizer.scrollToIndex === 'function') {
        virtualizer.scrollToIndex(this._activeIndex, 'nearest');
      }
    } else {
      const activeEl = this.shadowRoot?.querySelector('.combobox-option.is-active') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  // --- Keyboard & Focus ---

  private _handleKeyDown(e: KeyboardEvent): void {
    this._keyboardController.handleKeyDown(e);
  }

  private _handleOutsideClick = (e: MouseEvent): void => {
    if (this.open && !e.composedPath().includes(this)) {
      this.close();
    }
  };

  private _focusTime = 0;

  private _handleInputFocus(): void {
    if (this.openOnFocus && !this.open) {
      this.open = true;
      this._focusTime = Date.now();
    }
  }

  private _handleControlClick(e: MouseEvent): void {
    const path = e.composedPath();
    const isClearBtn = path.some((el) => (el as HTMLElement).part?.contains('clear-btn'));
    const isTag = path.some((el) => (el as HTMLElement).tagName?.toLowerCase() === 'vi-chip');
    if (isClearBtn || isTag) return;

    if (!this.isSearchable) {
      if (this.openOnFocus && Date.now() - this._focusTime < 100) {
        return; // Prevents closing immediately after focus opens it
      }
      this.toggle();
    } else if (!this.open) {
      this.open = true;
    }
  }

  // --- Public Imperative Methods ---
  private get _visibleSlottedItems(): ViComboboxItem[] {
    return this._slottedItems.filter((i) => !i.hidden);
  }

  /**
   * Sets `active` property on visible slotted items by index.
   * Drives `.is-active` CSS class inside vi-combobox-item render.
   */
  private _updateSlottedActiveState(activeIndex: number): void {
    const visible = this._visibleSlottedItems;
    visible.forEach((item, i) => {
      item.active = i === activeIndex;
    });
  }

  // --- Public Imperative Methods ---

  toggle(): void {
    if (this.disabled) return;
    this.open = !this.open;
  }

  show(): void {
    if (this.disabled || this.open) return;
    this.open = true;
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
  }

  clearValue(): void {
    const prev = this.value;
    this.value = this.mode === 'multi' || this.mode === 'tags' ? [] : '';
    this._query = '';
    this._dispatch('vi-combobox-clear', { previousValue: prev });
    this._dispatch('vi-combobox-change', { value: this.value });
  }

  override focus(options?: FocusOptions): void {
    if (this.isSearchable) {
      this._inputEl?.focus(options);
    } else {
      this._triggerEl?.focus(options);
    }
  }

  getSelectedOptions(): ComboboxOption[] {
    const selectedValues = this._getSelectedValues();
    return this._optionsList.filter((opt) => selectedValues.includes(opt.value));
  }

  setOptions(opts: ComboboxOption[]): void {
    this.options = opts;
  }

  addItem(opt: ComboboxOption): void {
    this._optionsList = [...this._optionsList, opt];
    this._rebuildOptionDataMap();
    this.requestUpdate();
  }

  removeItem(value: string): void {
    this._optionsList = this._optionsList.filter((o) => o.value !== value);
    this._rebuildOptionDataMap();
    this.requestUpdate();
  }

  private _dispatch(eventName: string, detail?: unknown): void {
    this.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true, composed: true }));
  }

  // --- Render Helpers ---

  private _renderHighlightedText(text: string): TemplateResult | string {
    if (!this.isSearchable || !this.highlightMatch || !this._query) return text;
    const q = this._query;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);

    return html`${before}<mark class="combobox-mark">${match}</mark>${after}`;
  }

  private _renderSingleOption(opt: ComboboxOption, idx: number, selectedValues: string[]): TemplateResult {
    const isSelected = selectedValues.includes(opt.value);
    const isActive = idx === this._activeIndex;
    return html`
      <li
        id="${this._getOptionId(opt.value)}"
        part="option"
        role="option"
        aria-selected="${isSelected ? 'true' : 'false'}"
        aria-disabled="${opt.disabled ? 'true' : 'false'}"
        class="combobox-option ${isSelected ? 'is-selected' : ''} ${isActive ? 'is-active' : ''} ${opt.disabled ? 'is-disabled' : ''}"
        @click=${(e: Event) => {
          e.stopPropagation();
          this._selectOption(opt);
        }}
      >
        ${this.renderOption
          ? this.renderOption({ option: opt, query: this._query, selected: isSelected })
          : html`
              ${opt.icon ? html`<vi-icon part="icon" name="${opt.icon}"></vi-icon>` : ''}
              <div part="option-content" class="combobox-option-content">
                <span part="option-label" class="combobox-option-label">
                  ${this._renderHighlightedText(opt.label)}
                </span>
                ${opt.description
                  ? html`<span part="option-description" class="combobox-option-description">${opt.description}</span>`
                  : ''}
              </div>
              
              ${opt.data?.isTemporary
                ? html`
                    <button type="button" class="combobox-option-action" aria-label="${this.removeCustomItemText}" title="${this.removeCustomItemText}" @click=${(e: Event) => this._handleDeleteTempItem(opt, e)}>
                      <vi-icon name="minus" style="color: var(--vi-color-error, #ef4444);"></vi-icon>
                    </button>
                  `
                : ''}

              ${isSelected ? html`<vi-icon part="check" name="check"></vi-icon>` : ''}
            `}
      </li>
    `;
  }

  private _renderOptionsList(filtered: ComboboxOption[], selectedValues: string[]): TemplateResult {
    const hasGroups = filtered.some((opt) => opt.group);

    if (this.virtualize && !hasGroups) {
      if (this._slottedItems.length === 0) {
        return html`
          <lit-virtualizer
            part="list"
            class="combobox-list"
            .items=${filtered}
            .keyFunction=${(opt: ComboboxOption) => opt.value}
            .renderItem=${(opt: ComboboxOption, idx: number) => this._renderSingleOption(opt, idx, selectedValues)}
          ></lit-virtualizer>
        `;
      }
    }

    if (!hasGroups) {
      return html`
        <ul part="list" class="combobox-list">
          ${filtered.map((opt, idx) => this._renderSingleOption(opt, idx, selectedValues))}
        </ul>
      `;
    }

    const groupsMap = new Map<string, ComboboxOption[]>();
    for (const opt of filtered) {
      const g = opt.group || '';
      let groupArr = groupsMap.get(g);
      if (!groupArr) {
        groupArr = [];
        groupsMap.set(g, groupArr);
      }
      groupArr.push(opt);
    }

    const groupEntries = Array.from(groupsMap.entries());

    let globalIndex = 0;

    return html`
      <div part="list" class="combobox-list">
        ${groupEntries.map(([groupName, opts]) => {
          const groupId = `group-${groupName.replace(/\s+/g, '-').toLowerCase()}`;
          return html`
            <div role="group" aria-labelledby=${groupName ? groupId : undefined}>
              ${groupName
                ? html`<div id=${groupId} part="group-header" class="combobox-group-header" role="presentation">${groupName}</div>`
                : ''}
              <ul class="combobox-list">
                ${opts.map((opt) => {
                  const idx = globalIndex++;
                  return this._renderSingleOption(opt, idx, selectedValues);
                })}
              </ul>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _getDisplayLabel(): string {
    const selected = this._getSelectedValues();
    if (selected.length === 0) return this.placeholder;
    const opt = this._optionsList.find((o) => o.value === selected[0]);
    return opt ? opt.label : selected[0];
  }

  override render(): TemplateResult {
    const selectedValues = this._getSelectedValues();
    const filtered = this.filteredOptions;
    const showClear = this.clearable && selectedValues.length > 0 && !this.disabled;
    // True when a query is active in slotted mode but all items are hidden (empty state)
    const allSlottedHidden =
      this._slottedItems.length > 0 &&
      this._query.length > 0 &&
      this._slottedItems.every((i) => i.hidden);

    const showCreateOption =
      this._slottedItems.length === 0 &&
      (this.mode === 'creatable' || this.mode === 'tags') &&
      this._query.trim() &&
      !this._optionsList.some(
        (o) =>
          o.label.toLowerCase() === this._query.trim().toLowerCase() ||
          o.value.toLowerCase() === this._query.trim().toLowerCase(),
      );

    return html`
      <div part="field" class="combobox-field">
        <div
          part="control"
          class="combobox-control ${this.open ? 'is-open is-focused' : ''} ${this.disabled ? 'is-disabled' : ''} ${this.status !== 'default' ? `is-${this.status}` : ''}"
          @click=${(e: MouseEvent) => this._handleControlClick(e)}
        >
          <slot name="prefix" part="prefix"></slot>

          ${(this.mode === 'multi' || this.mode === 'tags') && selectedValues.length > 0
            ? html`
                <div part="tags" class="combobox-tags">
                  ${selectedValues.map((val) => {
                    const opt = this._optionsList.find((o) => o.value === val);
                    const label = opt ? opt.label : val;
                    return html`
                      <vi-chip
                        size="sm"
                        removable
                        ?disabled=${this.disabled}
                        @vialiq-remove=${(e: Event) => this._removeTag(val, e)}
                      >
                        ${label}
                      </vi-chip>
                    `;
                  })}
                </div>
              `
            : ''}

          ${this.isSearchable
            ? html`
                <input
                  id="input"
                  part="input"
                  class="combobox-input"
                  type="text"
                  autocomplete="off"
                  .value=${this._query}
                  placeholder=${selectedValues.length === 0 || this.mode === 'multi' || this.mode === 'tags' ? this.placeholder : this._getDisplayLabel()}
                  ?disabled=${this.disabled}
                  role="combobox"
                  aria-expanded="${this.open ? 'true' : 'false'}"
                  aria-autocomplete="list"
                  aria-haspopup="listbox"
                  aria-controls="listbox"
                  aria-activedescendant="${this._slottedItems.length > 0
                    ? (this._activeIndex >= 0 && this._visibleSlottedItems[this._activeIndex]
                        ? this._getOptionId(this._visibleSlottedItems[this._activeIndex].value)
                        : '')
                    : (this._activeIndex >= 0 && filtered[this._activeIndex]
                        ? this._getOptionId(filtered[this._activeIndex].value)
                        : (showCreateOption && this._activeIndex === -1 ? 'create-option' : ''))}"
                  @input=${this._handleInput}
                  @focus=${this._handleInputFocus}
                />
              `
            : html`
                <button
                  id="trigger"
                  part="trigger"
                  type="button"
                  class="combobox-trigger ${selectedValues.length === 0 ? 'is-placeholder' : ''}"
                  ?disabled=${this.disabled}
                  role="combobox"
                  aria-expanded="${this.open ? 'true' : 'false'}"
                  aria-haspopup="listbox"
                  aria-controls="listbox"
                  @focus=${this._handleInputFocus}
                >
                  ${this._getDisplayLabel()}
                </button>
              `}

          ${this.loading
            ? html`<span part="loading-indicator" class="combobox-loading">...</span>`
            : ''}

          ${showClear
            ? html`
                <button
                  type="button"
                  part="clear-btn"
                  class="combobox-clear-btn"
                  aria-label="Clear selection"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this.clearValue();
                  }}
                >
                  <vi-icon name="x"></vi-icon>
                </button>
              `
            : ''}

          <vi-icon
            part="chevron"
            name="chevron-down"
            class="combobox-chevron"
            @click=${(e: Event) => {
              e.stopPropagation();
              this.toggle();
            }}
          ></vi-icon>
        </div>

        <!-- Listbox Dropdown -->
        <div
          id="listbox"
          part="listbox"
          class="combobox-listbox ${this.open ? 'is-open' : ''}"
          ?open=${this.open}
          role="listbox"
          aria-multiselectable="${this.mode === 'multi' || this.mode === 'tags' ? 'true' : 'false'}"
          aria-busy="${this.loading ? 'true' : 'false'}"
          aria-label="${this.placeholder}"
          aria-owns=${this._slottedItems.length > 0
            ? this._visibleSlottedItems.map(i => this._getOptionId(i.value)).join(' ')
            : nothing}
        >
          <div class="combobox-sentinel-top" style="height: 1px; width: 100%;"></div>
          <slot></slot>
          ${this._slottedItems.length === 0 && filtered.length > 0
            ? this._renderOptionsList(filtered, selectedValues)
            : ''}
          ${this._slottedItems.length === 0 && this.loading
            ? html`<div part="loading-indicator" class="combobox-loading"><slot name="loading">Loading...</slot></div>`
            : ''}
          ${showCreateOption
            ? html`
                <div
                  id="create-option"
                  role="option"
                  aria-selected="false"
                  aria-disabled="false"
                  part="option"
                  class="combobox-option ${this._activeIndex === -1 ? 'is-active' : ''}"
                  @click=${this._handleCreate}
                >
                  ${this.renderCreateOption
                    ? this.renderCreateOption(this._query)
                    : html`<span>${this.createText.replace('{query}', this._query)}</span>`}
                </div>
              `
            : ''}
          ${this._slottedItems.length === 0 && filtered.length === 0 && !this.loading && !((this.mode === 'creatable' || this.mode === 'tags') && this._query.trim())
            ? html`<div part="empty" class="combobox-empty"><slot name="empty">${this.noOptionsText}</slot></div>`
            : ''}
          ${this._slottedItems.length > 0 && allSlottedHidden
            ? html`<div part="empty" class="combobox-empty"><slot name="empty">${this.noOptionsText}</slot></div>`
            : ''}
          <div class="combobox-sentinel-bottom" style="height: 1px; width: 100%;"></div>
        </div>

        <slot name="helper" part="helper"></slot>
        ${this.validityMessage
          ? html`<span part="validation" class="combobox-validation ${this.status !== 'default' ? `is-${this.status}` : ''}">${this.validityMessage}</span>`
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-combobox': ViCombobox;
  }
}
