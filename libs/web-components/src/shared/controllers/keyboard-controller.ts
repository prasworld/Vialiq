import { ReactiveController, ReactiveControllerHost } from 'lit';
import type { ListboxOption, SlottedListboxItem } from '../types/listbox.types.js';

export interface KeyboardControllerHost extends ReactiveControllerHost, HTMLElement {
  disabled: boolean;
  open: boolean;
  isSearchable: boolean;
  mode: 'single' | 'multi' | 'tags' | 'creatable';
}

export interface KeyboardControllerOptions<TData = unknown> {
  getActiveIndex: () => number;
  setActiveIndex: (index: number) => void;
  getFilteredOptions: () => ListboxOption<TData>[];
  getSlottedItems: () => SlottedListboxItem[];
  getVisibleSlottedItems: () => SlottedListboxItem[];
  getSelectedValues: () => string[];
  
  updateSlottedActiveState: (index: number) => void;
  scrollToActiveIndex: () => void;
  selectOption: (opt: ListboxOption<TData>) => void;
  handleCreate: () => void;
  removeTag: (val: string) => void;
  close: () => void;
  openDropdown: () => void;
  getQuery: () => string;
  onTypeAheadChange?: (str: string) => void;
}

export class ListboxKeyboardController<TData = unknown> implements ReactiveController {
  private _searchString = '';
  private _searchTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private host: KeyboardControllerHost,
    private config: KeyboardControllerOptions<TData>
  ) {
    this.host.addController(this);
  }

  hostConnected() { /* No‑op – required for ReactiveController lifecycle */ }

  public handleKeyDown(e: KeyboardEvent): void {
    if (this.host.disabled) return;

    const options = this.config.getFilteredOptions();
    const isSlotted = this.config.getSlottedItems().length > 0;
    const activeIndex = this.config.getActiveIndex();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!this.host.open) this.config.openDropdown();
        this._navigate(1);
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!this.host.open) this.config.openDropdown();
        this._navigate(-1);
        break;

      case 'Enter':
        e.preventDefault();
        if (this.host.open) {
          if (isSlotted) {
            const visible = this.config.getVisibleSlottedItems();
            if (activeIndex >= 0 && activeIndex < visible.length) {
              const item = visible[activeIndex];
              this.config.selectOption({
                value: item.value,
                label: item.label || item.value,
                searchText: item.searchText.length > 0 ? item.searchText.join(' ') : undefined,
                group: item.group || undefined,
                disabled: item.disabled,
                icon: item.icon || undefined,
                description: item.description || undefined,
                data: item.data as TData,
              });
            } else if (this.host.mode === 'tags' || this.host.mode === 'creatable') {
              this.config.handleCreate();
            }
          } else if (activeIndex >= 0 && activeIndex < options.length) {
            this.config.selectOption(options[activeIndex]);
          } else if (this.host.mode === 'tags' || this.host.mode === 'creatable') {
            this.config.handleCreate();
          }
        } else if (this.host.mode === 'tags' || this.host.mode === 'creatable') {
          this.config.handleCreate();
        } else {
          this.config.openDropdown();
        }
        break;

      case ',':
        if (this.host.mode === 'tags') {
          e.preventDefault();
          this.config.handleCreate();
        }
        break;

      case 'Escape':
        if (this.host.open) {
          e.preventDefault();
          this.config.close();
        }
        break;

      case 'Backspace':
        if (this.host.isSearchable && !this.config.getQuery() && (this.host.mode === 'multi' || this.host.mode === 'tags')) {
          const selected = this.config.getSelectedValues();
          if (selected.length > 0) {
            this.config.removeTag(selected[selected.length - 1]);
          }
        }
        break;

      case 'Home':
        if (this.host.open) {
          e.preventDefault();
          const len = isSlotted ? this.config.getVisibleSlottedItems().length : options.length;
          if (len > 0) this._navigate(1, 0);
        }
        break;

      case 'End':
        if (this.host.open) {
          e.preventDefault();
          const len = isSlotted ? this.config.getVisibleSlottedItems().length : options.length;
          if (len > 0) this._navigate(-1, len - 1);
        }
        break;

      case ' ':
        if (!this.host.isSearchable && !this.host.open) {
          e.preventDefault();
          this.config.openDropdown();
        } else if (!this.host.isSearchable && this.host.open && this._searchString.length > 0) {
          e.preventDefault();
          this._handleTypeAhead(' ');
        }
        break;

      default:
        if (!this.host.isSearchable && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          this._handleTypeAhead(e.key);
        }
        break;
    }
  }

  private _handleTypeAhead(char: string): void {
    if (this._searchTimeout) {
      clearTimeout(this._searchTimeout);
    }

    this._searchTimeout = setTimeout(() => {
      this._searchString = '';
      this.config.onTypeAheadChange?.(this._searchString);
    }, 1000);

    this._searchString += char.toLowerCase();
    this.config.onTypeAheadChange?.(this._searchString);

    const options = this.config.getFilteredOptions();
    const isSlotted = this.config.getSlottedItems().length > 0;
    const visible = isSlotted ? this.config.getVisibleSlottedItems() : [];
    const len = isSlotted ? visible.length : options.length;

    if (len === 0) return;

    const getLabel = (i: number) => {
      if (isSlotted) {
        return (visible[i]?.label || visible[i]?.textContent || '').toLowerCase();
      }
      return (options[i]?.label || options[i]?.value || '').toLowerCase();
    };

    const isDisabled = (i: number) => (isSlotted ? visible[i]?.disabled : options[i]?.disabled) ?? false;

    // Start searching from current active index + 1
    const startIdx = Math.max(0, this.config.getActiveIndex());
    let matchIdx = -1;

    // Search after current index
    for (let i = startIdx + 1; i < len; i++) {
      if (!isDisabled(i) && getLabel(i).startsWith(this._searchString)) {
        matchIdx = i;
        break;
      }
    }

    // Wrap around to start
    if (matchIdx === -1) {
      for (let i = 0; i <= startIdx; i++) {
        if (!isDisabled(i) && getLabel(i).startsWith(this._searchString)) {
          matchIdx = i;
          break;
        }
      }
    }

    if (matchIdx !== -1) {
      this.config.setActiveIndex(matchIdx);
      if (isSlotted) this.config.updateSlottedActiveState(matchIdx);
      this.config.scrollToActiveIndex();
    }
  }

  private _navigate(direction: 1 | -1, startFrom?: number): void {
    const options = this.config.getFilteredOptions();
    const isSlotted = this.config.getSlottedItems().length > 0;
    const visible = isSlotted ? this.config.getVisibleSlottedItems() : [];
    const len = isSlotted ? visible.length : options.length;
    const isDisabled = (i: number) => (isSlotted ? visible[i]?.disabled : options[i]?.disabled) ?? false;

    if (len === 0) {
      this.config.setActiveIndex(-1);
      if (isSlotted) this.config.updateSlottedActiveState(-1);
      return;
    }

    let next = startFrom !== undefined ? startFrom : this.config.getActiveIndex();

    if (startFrom === undefined && next === -1) {
      next = direction === 1 ? -1 : 0;
    } else if (startFrom !== undefined) {
      if (!isDisabled(next)) {
        this.config.setActiveIndex(next);
        if (isSlotted) this.config.updateSlottedActiveState(next);
        this.config.scrollToActiveIndex();
        return;
      }
    }

    for (let step = 0; step < len; step++) {
      next = (next + direction + len) % len;
      if (!isDisabled(next)) break;
    }

    if (isDisabled(next)) next = -1;

    this.config.setActiveIndex(next);
    if (isSlotted) this.config.updateSlottedActiveState(next);
    this.config.scrollToActiveIndex();
  }
}
