# `vi-combobox` — Searchable Combobox

**Package:** `@vialiq/web-components/combobox`  
**Element:** `<vi-combobox>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_combobox.scss`

---

## Purpose

A searchable, filterable input with a dropdown listbox. The most versatile select-type control, supporting four interaction modes:

| Mode | Description | Example EDC use |
|------|-------------|-----------------|
| `single` | Type to filter, pick one option | Country, ethnicity, CTCAE term |
| `multi` | Multiple selections shown as removable tags | Concomitant meds categories, inclusion criteria |
| `tags` | Free-text tag creation (no fixed option list) | Keywords, protocol flags |
| `creatable` | Single select + ability to create new options | Custom lab units, non-coded AE terms |

**When to choose `vi-combobox` over `vi-select`:**
- Option list > 10 items (filtering becomes critical)
- Options come from a server/API (async search)
- Multi-select is needed
- Free-text creation is required

**When to choose `vi-select` over `vi-combobox`:**
- ≤ 10 options, static, no filtering needed
- You want the native OS dropdown (mobile-optimised)

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `mode` | `mode` | `ComboboxMode` | `'single'` | ✅ | Interaction mode |
| `value` | `value` | `string \| string[]` | `''` | ✅ | Current value(s) |
| `options` | — | `ComboboxOption[] \| ComboboxOptionsLoader` | `[]` | — | Options list or async loader |
| `placeholder` | `placeholder` | `string` | `'Search...'` | — | Input placeholder |
| `name` | `name` | `string` | `''` | — | Form field name |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables the control |
| `required` | `required` | `boolean` | `false` | ✅ | Required selection |
| `loading` | `loading` | `boolean` | `false` | — | Show loading spinner in listbox |
| `maxTags` | `max-tags` | `number` | `undefined` | — | Max selections (multi/tags) |
| `debounce` | `debounce` | `number` | `300` | — | Async search debounce (ms) |
| `minChars` | `min-chars` | `number` | `1` | — | Min chars before search fires |
| `clearable` | `clearable` | `boolean` | `false` | — | Show clear all button |
| `noOptionsText` | `no-options-text` | `string` | `'No results found'` | — | Empty state message |
| `createText` | `create-text` | `string` | `'Create "{query}"'` | — | Create option label (creatable) |
| `status` | `status` | `ControlStatus` | `'default'` | ✅ | Validation state |
| `validityMessage` | `validity-message` | `string` | `''` | — | Error/success message |

```typescript
type ComboboxMode = 'single' | 'multi' | 'tags' | 'creatable';
type ControlStatus = 'default' | 'valid' | 'invalid';

interface ComboboxOption {
  value: string;
  label: string;
  group?: string;       // optgroup label
  disabled?: boolean;
  icon?: string;        // icon name from registry
  description?: string; // secondary text below label
  metadata?: unknown;   // passthrough data
}

// Async loader function signature
type ComboboxOptionsLoader = (query: string) => Promise<ComboboxOption[]>;
```

---

### Slots

| Slot | Description |
|------|-------------|
| `option` | Custom option template (receives option data via event) |
| `empty` | Override the "no results" state |
| `loading` | Override the loading state content |
| `helper` | Persistent helper text |

---

### Events

| Event | Type | Bubbles | Composed | Fires when |
|-------|------|---------|---------|-----------|
| `vialiq-change` | `CustomEvent<{value: string \| string[]; option?: ComboboxOption}>` | ✅ | ✅ | Selection changes |
| `vialiq-search` | `CustomEvent<{query: string}>` | ✅ | ✅ | User types (after debounce) |
| `vialiq-create` | `CustomEvent<{value: string}>` | ✅ | ✅ | New tag/option created |
| `vialiq-remove` | `CustomEvent<{value: string}>` | ✅ | ✅ | Tag/chip removed |
| `vialiq-open` | `CustomEvent<void>` | ✅ | ✅ | Listbox opened |
| `vialiq-close` | `CustomEvent<void>` | ✅ | ✅ | Listbox closed |
| `invalid` | `Event` (cancelable) | ❌ | — | `checkValidity()` fails |

---

### Imperative Methods

| Method | Description |
|--------|-------------|
| `checkValidity()` | Returns false if required and no selection |
| `reportValidity()` | Validates + browser tooltip |
| `setCustomValidity(msg)` | Custom error |
| `open()` | Open the listbox programmatically |
| `close()` | Close the listbox |
| `clearValue()` | Clear all selections |
| `focus()` | Focus the search input |

---

### CSS Parts

| Part | Element |
|------|---------|
| `control` | Outer control wrapper (tags + input row) |
| `tags` | Selected tags container |
| `input` | Search text `<input>` |
| `clear-btn` | Clear all button |
| `chevron` | Dropdown arrow |
| `listbox` | The dropdown panel |
| `option` | Each option item |
| `option-label` | Option primary text |
| `option-description` | Option secondary text |
| `group-label` | Optgroup header |
| `empty` | Empty state container |
| `loading-indicator` | Loading spinner wrapper |
| `helper` | Helper text wrapper |
| `validation` | Validation message |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-combobox-height` | `40px` | Control height (single/creatable) |
| `--vi-combobox-min-height` | `40px` | Min height (multi: grows with tags) |
| `--vi-combobox-border-color` | `var(--vi-color-grey-300)` | Default border |
| `--vi-combobox-border-color-focus` | `var(--vi-color-primary)` | Focus border |
| `--vi-combobox-border-radius` | `4px` | Control radius |
| `--vi-combobox-listbox-max-height` | `280px` | Max dropdown height |
| `--vi-combobox-listbox-shadow` | `var(--vi-shadow-lg)` | Dropdown shadow |
| `--vi-combobox-option-height` | `40px` | Option item height |
| `--vi-combobox-option-hover-bg` | `var(--vi-color-blue-50)` | Option hover |
| `--vi-combobox-option-selected-bg` | `var(--vi-color-blue-100)` | Selected option bg |
| `--vi-combobox-option-selected-color` | `var(--vi-color-primary)` | Selected option text |
| `--vi-combobox-tag-gap` | `4px` | Gap between tags |

---

## Shadow DOM Structure

```
vi-combobox
├── [control] div.combobox-control
│   ├── [tags] div.combobox-tags (multi/tags mode only)
│   │   ├── vi-tag[removable] × N  (selected items)
│   │   └── input.combobox-input   (search; grows to fill remaining space)
│   ├── input.combobox-input       (single/creatable mode)
│   ├── vi-spinner (when loading)
│   ├── vi-button.clear-btn (when clearable & has value)
│   └── vi-icon.chevron name="chevron-down"
│
├── [listbox] div[popover].combobox-listbox  role="listbox"
│   ├── div.combobox-group-label (optgroup)
│   ├── div[role="option"].combobox-option × N
│   │   ├── vi-icon (option.icon, optional)
│   │   ├── span.option-label
│   │   ├── span.option-description (optional)
│   │   └── vi-icon name="check" (when selected)
│   ├── div.combobox-empty (when no results)
│   └── div.combobox-create-option (creatable mode)
│
├── slot[name="helper"]
└── span.combobox-validation
```

---

## Keyboard Interactions

| Key | Context | Behaviour |
|-----|---------|-----------|
| `↓` | Input focused | Open listbox; move to first option |
| `↓` / `↑` | Listbox open | Navigate options |
| `Enter` | Option focused | Select option; close (single) / stay open (multi) |
| `Escape` | Listbox open | Close listbox; restore previous value text |
| `Backspace` | Input empty (multi/tags) | Remove last selected tag |
| `Home` / `End` | Listbox open | First / last option |
| `Tab` | Listbox open | Close listbox; move focus out |
| `,` or `Enter` | Tags mode | Create new tag from typed text |
| Any char | Input | Filter options; fire `vialiq-search` (debounced) |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Combobox role | `role="combobox"` on input |
| Expanded state | `aria-expanded="true/false"` on input |
| Autocomplete | `aria-autocomplete="list"` |
| Active option | `aria-activedescendant` → focused option id |
| Listbox | `role="listbox"` on dropdown panel |
| Options | `role="option"` + `aria-selected` on each item |
| Groups | `role="group"` + `aria-label` for optgroups |
| Loading | `aria-busy="true"` on listbox while loading |
| Tags | Each selected tag: `aria-label="Remove {label}"` on × button |
| Required | `aria-required` on input |
| Invalid | `aria-invalid` + `aria-errormessage` |

---

## Mode Examples

### Single select — coded term search

```html
<vi-form-field label="Primary Diagnosis (ICD-10)" required>
  <vi-combobox
    mode="single"
    name="diagnosis"
    placeholder="Type to search ICD-10 codes..."
    required
    .options=${this.loadDiagnoses}
    debounce="400"
    min-chars="2"
  ></vi-combobox>
</vi-form-field>
```

```typescript
// Async loader
async loadDiagnoses(query: string): Promise<ComboboxOption[]> {
  const res = await fetch(`/api/icd10?q=${encodeURIComponent(query)}&limit=20`);
  const data = await res.json();
  return data.map(d => ({ value: d.code, label: `${d.code} — ${d.description}` }));
}
```

### Multi select — concomitant medication categories

```html
<vi-combobox
  mode="multi"
  name="medCategories"
  .options=${medCategoryOptions}
  placeholder="Select categories..."
  max-tags="5"
  (vialiq-change)="onMedCatsChange($event.detail.value)"
></vi-combobox>
```

### Tags mode — free-text keyword entry

```html
<vi-combobox
  mode="tags"
  name="protocolFlags"
  placeholder="Add flags (Enter to confirm)..."
  (vialiq-create)="onFlagCreated($event.detail.value)"
>
  <span slot="helper">Press Enter or comma to add each flag.</span>
</vi-combobox>
```

### Creatable — new lab unit

```html
<vi-combobox
  mode="creatable"
  name="labUnit"
  .options=${standardUnits}
  placeholder="Select or type unit..."
  create-text='Use "{query}" as custom unit'
  (vialiq-create)="registerCustomUnit($event.detail.value)"
></vi-combobox>
```

### Grouped options

```typescript
const aeGradeOptions: ComboboxOption[] = [
  { value: '1', label: 'Grade 1 — Mild', group: 'Non-Serious' },
  { value: '2', label: 'Grade 2 — Moderate', group: 'Non-Serious' },
  { value: '3', label: 'Grade 3 — Severe', group: 'Serious' },
  { value: '4', label: 'Grade 4 — Life-Threatening', group: 'Serious' },
  { value: '5', label: 'Grade 5 — Fatal', group: 'Serious' },
];
```

```html
<vi-combobox mode="single" name="aeGrade" .options=${aeGradeOptions}></vi-combobox>
```

### With option description and icon

```typescript
const countryOptions: ComboboxOption[] = [
  { value: 'US', label: 'United States', description: 'UTC-5 to UTC-8', icon: 'globe' },
  { value: 'GB', label: 'United Kingdom', description: 'UTC+0', icon: 'globe' },
  // ...
];
```

### Controlled value (Angular)

```html
<vi-combobox
  mode="multi"
  name="sites"
  [value]="selectedSites"
  [options]="siteOptions"
  (vialiq-change)="selectedSites = $event.detail.value"
  clearable
></vi-combobox>
```

---

## Async Search Pattern

When `options` is a function, it is called with the current query string (debounced):

```typescript
// Component sets up the loader once
this.comboboxEl.options = async (query) => {
  this.comboboxEl.loading = true;
  try {
    return await this.subjectService.search(query);
  } finally {
    this.comboboxEl.loading = false;
  }
};
```

The component itself does **not** set `loading` — it is the caller's responsibility to toggle it around the async call. This keeps the loading state under full application control.

---

## Form Participation

`vi-combobox` is form-associated (`static formAssociated = true`):
- **Single mode**: value is a string — submitted as `name=value`
- **Multi/tags mode**: value is a string array — submitted as multiple form entries `name=v1&name=v2` (via `FormData.append()` loop in `setFormValue`)
- `formResetCallback()` clears selection and restores to initial `value` attribute
- `formDisabledCallback()` syncs `disabled` from fieldset

---

## Implementation Notes

- Listbox is rendered in a native `popover` (auto mode) appended to the component's shadow DOM root. This ensures it escapes `overflow: hidden` on ancestors.
- Filter algorithm: default is case-insensitive substring match on `label`. Override with `filterFn` prop for custom matching (e.g. fuzzy search, phonetic).
- Highlight: matched substring is wrapped in `<mark>` inside option label for visual feedback.
- Virtual scrolling: for option lists > 100 items, the listbox uses an intersection-observer-based windowed rendering to keep DOM nodes bounded.
- `aria-activedescendant` is managed by keeping a `_activeOptionId` state that is synced whenever keyboard navigation moves.

---

## i18n — Internal Labels

All internal text uses `translateDirective`. See [I18N.md](../I18N.md) for setup.

| Key | Default (en) |
|-----|-------------|
| `combobox.noResults` | `"No results"` |
| `combobox.loading` | `"Loading\u2026"` |
| `combobox.create` | `"Create \"{query}\""` |
| `combobox.clearAll` | `"Clear all"` |
| `combobox.removeTag` | `"Remove {label}"` |

---

## Related Components

- [`vi-select`](./vi-select.md) — simple dropdown (≤ 10 static options)
- [`vi-tag`](./vi-tag.md) — chip component used for multi selections
- [`vi-form-field`](./vi-form-field.md) — label + validation wrapper
- [`vi-radio-group`](./vi-radio.md) — ≤ 6 exclusive options, always visible
