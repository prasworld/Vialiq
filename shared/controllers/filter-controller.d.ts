import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ListboxOption, ListboxOptionsLoader, ListboxFilterFn } from '../types/listbox.types.js';
import { ViComboboxItem } from '../../combobox/vi-combobox-item.js';
export interface FilterControllerHost<TData = unknown> extends ReactiveControllerHost, HTMLElement {
    options: ListboxOption<TData>[] | ListboxOptionsLoader<TData>;
    filterFn: ListboxFilterFn<TData> | null;
    debounce: number;
    minChars: number;
    matchFrom: 'start' | 'any';
    isSearchable: boolean;
    dispatchEvent(event: Event): boolean;
    requestUpdate(): void;
}
export interface FilterControllerOptions<TData = unknown> {
    getSlottedItems: () => ViComboboxItem[];
    getVisibleSlottedItems: () => ViComboboxItem[];
    setSlottedActiveIndex: (index: number) => void;
    setLoading: (loading: boolean) => void;
    resetActiveIndex: () => void;
    setOptionsList: (opts: ListboxOption<TData>[]) => void;
    rebuildOptionDataMap: () => void;
    open: () => void;
    isOpen: () => boolean;
}
export declare class FilterController<TData = unknown> implements ReactiveController {
    private host;
    private config;
    query: string;
    private _debounceTimer;
    private _loadId;
    constructor(host: FilterControllerHost<TData>, config: FilterControllerOptions<TData>);
    hostDisconnected(): void;
    handleInput(e: Event): void;
    applySlottedFilter(query: string, slottedItems: ViComboboxItem[]): void;
    resetSlottedVisibility(slottedItems: ViComboboxItem[]): void;
}
//# sourceMappingURL=filter-controller.d.ts.map