export interface ListboxOption<TData = unknown> {
    value: string;
    label: string;
    /**
     * Optional search corpus. Falls back to `label + description` when omitted.
     * Provide this when the display label alone is not the full search surface
     * (e.g. data-driven options with abbreviations, codes, emails).
     */
    searchText?: string;
    group?: string;
    disabled?: boolean;
    icon?: string;
    description?: string;
    data?: TData;
}
export type ListboxFilterFn<TData = unknown> = (option: ListboxOption<TData>, query: string) => boolean;
export type ListboxOptionsLoader<TData = unknown> = (query: string) => Promise<ListboxOption<TData>[]>;
export interface RenderListboxOptionParams<TData = unknown> {
    option: ListboxOption<TData>;
    query: string;
    selected: boolean;
}
export interface SlottedListboxItem extends HTMLElement {
    value: string;
    label: string;
    searchText: string[];
    group: string;
    disabled: boolean;
    icon: string;
    description: string;
    data: unknown;
    selected: boolean;
    active: boolean;
}
//# sourceMappingURL=listbox.types.d.ts.map