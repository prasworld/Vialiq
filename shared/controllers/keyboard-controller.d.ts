import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ListboxOption, SlottedListboxItem } from '../types/listbox.types.js';
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
export declare class ListboxKeyboardController<TData = unknown> implements ReactiveController {
    private host;
    private config;
    private _searchString;
    private _searchTimeout?;
    constructor(host: KeyboardControllerHost, config: KeyboardControllerOptions<TData>);
    hostConnected(): void;
    handleKeyDown(e: KeyboardEvent): void;
    private _handleTypeAhead;
    private _navigate;
}
//# sourceMappingURL=keyboard-controller.d.ts.map