export interface ListboxOption<TData = unknown> {
  value: string;
  label: string;
  /**
   * Optional search corpus. Falls back to `label + description` when omitted.
   * Provide this when the display label alone is not the full search surface
   * (e.g. data-driven options with abbreviations, codes, emails).
   */
  searchText?: string;
  group?: string;          // optgroup label
  disabled?: boolean;
  icon?: string;           // icon name from design system registry
  description?: string;    // secondary text below label; auto-included in corpus
  data?: TData;            // arbitrary payload; emitted on vi-change
}

export type ListboxFilterFn<TData = unknown> = (option: ListboxOption<TData>, query: string) => boolean;
export type ListboxOptionsLoader<TData = unknown> = (query: string) => Promise<ListboxOption<TData>[]>;

export interface RenderListboxOptionParams<TData = unknown> {
  option: ListboxOption<TData>;
  query: string;
  selected: boolean;
}
