import type {
  ListboxOption,
  ListboxFilterFn,
  ListboxOptionsLoader,
  RenderListboxOptionParams,
} from '../shared/types/listbox.types.js';

export type ComboboxMode = 'single' | 'multi' | 'tags' | 'creatable';
export type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

export type ComboboxOptionData = {
  isTemporary?: boolean;
} & Record<string, unknown>;

export type ComboboxOption = ListboxOption<ComboboxOptionData>;
export type ComboboxFilterFn = ListboxFilterFn<ComboboxOptionData>;
export type ComboboxOptionsLoader = ListboxOptionsLoader<ComboboxOptionData>;
export type RenderOptionParams = RenderListboxOptionParams<ComboboxOptionData>;
