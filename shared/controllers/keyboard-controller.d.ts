import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ListboxOption } from '../types/listbox.types.js';
import { ViComboboxItem } from '../../combobox/vi-combobox-item.js';
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
export declare class ListboxKeyboardController<TData = unknown> implements ReactiveController {
    private host;
    private config;
    constructor(host: KeyboardControllerHost, config: KeyboardControllerOptions<TData>);
    hostConnected(): void;
    handleKeyDown(e: KeyboardEvent): void;
    private _navigate;
}
//# sourceMappingURL=keyboard-controller.d.ts.map