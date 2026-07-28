import { ReactiveController, ReactiveControllerHost } from 'lit';
import type { ListboxOption } from '../types/listbox.types.js';
import type { ViComboboxItem } from '../../combobox/vi-combobox-item.js';

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
  getSlottedItems: () => ViComboboxItem[];
  getVisibleSlottedItems: () => ViComboboxItem[];
  getSelectedValues: () => string[];
  
  updateSlottedActiveState: (index: number) => void;
  scrollToActiveIndex: () => void;
  selectOption: (opt: ListboxOption<TData>) => void;
  handleCreate: () => void;
  removeTag: (val: string) => void;
  close: () => void;
  openDropdown: () => void;
  getQuery: () => string;
}

export class ListboxKeyboardController<TData = unknown> implements ReactiveController {
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
      case 'ArrowDown': {
        e.preventDefault();
        if (!this.host.open) this.config.openDropdown();

        const visible = isSlotted ? this.config.getVisibleSlottedItems() : [];
        const len = isSlotted ? visible.length : options.length;
        const isDisabled = (i: number) => (isSlotted ? visible[i]?.disabled : options[i]?.disabled) ?? true;

        if (len === 0) {
          this.config.setActiveIndex(-1);
          if (isSlotted) this.config.updateSlottedActiveState(-1);
          break;
        }

        let next = activeIndex;
        for (let step = 0; step < len; step++) {
          next = (next + 1 + len) % len;
          if (!isDisabled(next)) break;
        }

        if (isDisabled(next)) next = -1;
        this.config.setActiveIndex(next);
        if (isSlotted) this.config.updateSlottedActiveState(next);
        this.config.scrollToActiveIndex();
        break;
      }

      case 'ArrowUp':
        e.preventDefault();
        if (this.host.open) {
          if (isSlotted) {
            const visible = this.config.getVisibleSlottedItems();
            const prev = activeIndex > 0 ? activeIndex - 1 : visible.length - 1;
            this.config.setActiveIndex(prev);
            this.config.updateSlottedActiveState(prev);
          } else {
            const prev = activeIndex > 0 ? activeIndex - 1 : options.length - 1;
            this.config.setActiveIndex(prev);
          }
          this.config.scrollToActiveIndex();
        }
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
          this.config.setActiveIndex(0);
          if (isSlotted) this.config.updateSlottedActiveState(0);
          this.config.scrollToActiveIndex();
        }
        break;

      case 'End':
        if (this.host.open) {
          e.preventDefault();
          if (isSlotted) {
            const last = this.config.getVisibleSlottedItems().length - 1;
            this.config.setActiveIndex(last);
            this.config.updateSlottedActiveState(last);
          } else {
            const last = options.length - 1;
            this.config.setActiveIndex(last);
          }
          this.config.scrollToActiveIndex();
        }
        break;

      case ' ':
        if (!this.host.isSearchable && !this.host.open) {
          e.preventDefault();
          this.config.openDropdown();
        }
        break;
    }
  }
}
