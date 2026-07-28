import { ReactiveController, ReactiveControllerHost } from 'lit';
import type { ListboxOption, ListboxOptionsLoader, ListboxFilterFn } from '../types/listbox.types.js';
import type { ViComboboxItem } from '../../combobox/vi-combobox-item.js';

export interface FilterControllerHost extends ReactiveControllerHost, HTMLElement {
  options: ListboxOption<any>[] | ListboxOptionsLoader<any>;
  filterFn: ListboxFilterFn<any> | null;
  debounce: number;
  minChars: number;
  matchFrom: 'start' | 'any';
  isSearchable: boolean;
  
  dispatchEvent(event: Event): boolean;
  requestUpdate(): void;
}

export interface FilterControllerOptions {
  getSlottedItems: () => ViComboboxItem[];
  getVisibleSlottedItems: () => ViComboboxItem[];
  setSlottedActiveIndex: (index: number) => void;
  setLoading: (loading: boolean) => void;
  resetActiveIndex: () => void;
  setOptionsList: (opts: ListboxOption<any>[]) => void;
  rebuildOptionDataMap: () => void;
  open: () => void;
  isOpen: () => boolean;
}

export class FilterController implements ReactiveController {
  public query = '';
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private host: FilterControllerHost,
    private config: FilterControllerOptions
  ) {
    this.host.addController(this);
  }

  hostDisconnected() {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
  }

  public handleInput(e: Event) {
    if (!this.host.isSearchable) return;
    const input = e.target as HTMLInputElement;
    this.query = input.value;
    this.config.resetActiveIndex();
    this.host.requestUpdate();

    if (!this.config.isOpen()) {
      this.config.open();
    }

    if (this._debounceTimer) clearTimeout(this._debounceTimer);

    const slottedItems = this.config.getSlottedItems();
    if (slottedItems.length > 0) {
      this.applySlottedFilter(this.query, slottedItems);
    }

    if (this.query.length >= this.host.minChars) {
      this._debounceTimer = setTimeout(() => {
        this.host.dispatchEvent(new CustomEvent('vi-search', { 
          detail: { query: this.query },
          bubbles: true, 
          composed: true 
        }));

        const loader = typeof this.host.options === 'function' ? this.host.options : null;
        if (loader) {
          this.config.setLoading(true);
          loader(this.query)
            .then((opts) => {
              this.config.setOptionsList(opts);
              this.config.rebuildOptionDataMap();
              this.host.requestUpdate();
            })
            .finally(() => {
              this.config.setLoading(false);
            });
        }
      }, this.host.debounce);
    }
  }

  public applySlottedFilter(query: string, slottedItems: ViComboboxItem[]) {
    if (slottedItems.length === 0 || !this.host.isSearchable) return;

    if (!query) {
      this.config.resetActiveIndex();
      this.resetSlottedVisibility(slottedItems);
      return;
    }

    const q = query.toLowerCase().trim();
    let results: ListboxOption[];
    
    // Ensure we are operating on the correct static array if not a loader
    const optionsList = typeof this.host.options === 'function' ? [] : (this.host.options as ListboxOption[]);

    if (this.host.filterFn) {
      results = optionsList.filter((opt) => this.host.filterFn!(opt, query));
    } else {
      results = optionsList.filter((opt) => {
        const corpus = opt.searchText
          ? opt.searchText.toLowerCase()
          : [opt.label, opt.description].filter(Boolean).join(' ').toLowerCase();
        return this.host.matchFrom === 'start' ? corpus.startsWith(q) : corpus.includes(q);
      });
    }

    const matchedValues = new Set(results.map((r) => r.value));

    for (const item of slottedItems) {
      item.hidden = !matchedValues.has(item.value);
    }

    const visibleItems = this.config.getVisibleSlottedItems();
    const firstVisibleIdx = visibleItems.findIndex((i) => !i.disabled);
    
    if (firstVisibleIdx >= 0) {
      this.config.setSlottedActiveIndex(firstVisibleIdx);
    } else {
      this.config.resetActiveIndex();
    }

    this.host.requestUpdate();

    this.host.dispatchEvent(new CustomEvent('vi-filter', {
      detail: {
        query: query,
        results,
        matchedValues: Array.from(matchedValues),
      },
      bubbles: true,
      composed: true
    }));
  }

  public resetSlottedVisibility(slottedItems: ViComboboxItem[]) {
    for (const item of slottedItems) {
      item.hidden = false;
      item.active = false;
    }
    this.host.requestUpdate();
  }
}
