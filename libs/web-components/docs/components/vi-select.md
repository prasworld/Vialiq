# `vi-select` — Select / Dropdown

**Package:** `@vialiq/web-components/select`  
**Element:** `<vi-select>`  
**Status:** 🔲 Planned — Phase 1  
**Flux UI base:** `libs/flux-ui/components/_select.scss`

---

## Purpose

A form-associated single-choice select control with:
- Custom styled trigger button (replaces native `<select>` appearance)
- Native `<select>` underneath for form participation and accessibility
- Optgroup support for grouped option lists
- Clearable selection (optional)

For large codelist-driven datasets (1000+ items, type-ahead required), use `vi-combobox`.  
For Yes/No/Unknown or ≤ 6 choices, prefer `vi-radio-group`.

**Clinical EDC use cases:**
- Country of birth / nationality
- Ethnicity / race
- Diagnosis (ICD-10 coded list)
- Concomitant medication route of administration
- Lab test units

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `value` | `value` | `string` | `''` | ✅ | Selected option's value |
| `name` | `name` | `string` | `''` | — | Form field name |
| `placeholder` | `placeholder` | `string` | `'Select...'` | — | Prompt text when no selection |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disable the control |
| `required` | `required` | `boolean` | `false` | ✅ | Required selection |
| `clearable` | `clearable` | `boolean` | `false` | — | Show clear (×) button |
| `status` | `status` | `ControlStatus` | `'default'` | ✅ | Validation state |
| `validityMessage` | `validity-message` | `string` | `''` | — | Error/success message |

```typescript
type ControlStatus = 'default' | 'valid' | 'invalid';
```

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | `<option>` and `<optgroup>` elements (native HTML) |
| `helper` | Persistent helper text |

**Using native `<option>` elements in the slot** means the native `<select>` inside shadow DOM mirrors them. This gives free keyboard navigation and screen reader compatibility with zero extra code.

---

### Events

| Event | Type | Bubbles | Composed | Fires when |
|-------|------|---------|---------|-----------|
| `vialiq-change` | `CustomEvent<{value: string; label: string}>` | ✅ | ✅ | Selection changes |
| `vialiq-clear` | `CustomEvent<void>` | ✅ | ✅ | Clear button clicked |
| `invalid` | `Event` (cancelable) | ❌ | — | `checkValidity()` fails |

---

### Imperative Methods

| Method | Description |
|--------|-------------|
| `checkValidity()` | Validates, fires `invalid` if required and empty |
| `reportValidity()` | Validates + shows browser tooltip |
| `focus()` | Focuses the select |
| `clear()` | Clears current selection (same as clicking × button) |

---

### CSS Parts

| Part | Element |
|------|---------|
| `trigger` | Visible select trigger button |
| `label` | Selected option label text |
| `chevron` | Dropdown arrow icon |
| `clear-btn` | Clear button (when `clearable`) |
| `helper` | Helper text slot wrapper |
| `validation` | Validation message `<span>` |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-select-height` | `40px` | Trigger button height |
| `--vi-select-border-color` | `var(--vi-color-grey-300)` | Default border |
| `--vi-select-border-color-focus` | `var(--vi-color-primary)` | Focus border |
| `--vi-select-border-color-invalid` | `var(--vi-color-error)` | Invalid border |
| `--vi-select-border-radius` | `4px` | Trigger border radius |
| `--vi-select-background` | `var(--vi-color-background)` | Trigger background |
| `--vi-select-placeholder-color` | `var(--vi-color-grey-400)` | Placeholder text |
| `--vi-select-text-color` | `var(--vi-color-foreground)` | Selected text |
| `--vi-select-focus-ring-color` | `var(--vi-color-primary)` | Focus outline |
| `--vi-select-disabled-opacity` | `0.5` | Disabled opacity |

---

## Architectural Approach: Hybrid Native Select

The native `<select>` is the single source of truth for value and keyboard interaction. The custom styled trigger reflects the selected label visually. This avoids reimplementing all browser native select keyboard behaviour (search by first letter, page up/down, etc.):

```html
<!-- Shadow DOM structure -->
<div class="select-wrapper" part="wrapper">

  <!-- Custom trigger — visual only -->
  <button part="trigger" class="select-trigger" type="button" tabindex="-1" aria-hidden="true">
    <span part="label" class="select-label">
      ${selectedLabel || this.placeholder}
    </span>
    <vi-icon name="chevron-down" part="chevron" size="16"></vi-icon>
    <vi-icon name="x" part="clear-btn" size="14"
      ?hidden=${!this.clearable || !this.value}
      @click=${this._onClear}></vi-icon>
  </button>

  <!-- Native select — positioned over trigger, opacity:0 -->
  <select
    class="select-native"
    .name=${this.name}
    ?disabled=${this.disabled}
    ?required=${this.required}
    aria-label=${this.placeholder}
    @change=${this._onChange}
  >
    <slot></slot>  <!-- Native <option> / <optgroup> from light DOM -->
  </select>

</div>

<slot name="helper" class="select-helper"></slot>
<span class="select-validation" ?hidden=${!this.validityMessage}>
  ${this.validityMessage}
</span>
```

The native `<select>` covers the trigger exactly (opacity: 0, position: absolute, inset: 0) so all clicks and keyboard events reach it naturally.

---

## Keyboard Interactions

All keyboard behaviour is handled by the native `<select>`:

| Key | Behaviour |
|-----|-----------|
| `Tab` / `Shift+Tab` | Focus in/out |
| `Space` / `Enter` | Open dropdown |
| `↑` / `↓` | Navigate options |
| First letter | Jump to first matching option |
| `Escape` | Close without change |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Role | Native `<select>` — `role="combobox"` (browser-managed) |
| Label | `<label for>` or `vi-form-field` (links to native select) |
| Required | `required` attr on native select |
| Invalid | `aria-invalid` on native select when `status="invalid"` |
| Error | `aria-errormessage` linking native select to validation span |

---

## Usage Examples

### Simple codelist

```html
<vi-form-field label="Sex at Birth" required>
  <vi-select name="sex" required placeholder="Select sex...">
    <option value="M">Male</option>
    <option value="F">Female</option>
    <option value="I">Intersex</option>
    <option value="UNK">Unknown / Not reported</option>
  </vi-select>
</vi-form-field>
```

### Grouped options (optgroup)

```html
<vi-select name="aeGrade" placeholder="Select grade...">
  <optgroup label="Non-serious">
    <option value="1">Grade 1 — Mild</option>
    <option value="2">Grade 2 — Moderate</option>
  </optgroup>
  <optgroup label="Serious">
    <option value="3">Grade 3 — Severe</option>
    <option value="4">Grade 4 — Life-Threatening</option>
    <option value="5">Grade 5 — Fatal</option>
  </optgroup>
</vi-select>
```

### Clearable (optional field)

```html
<vi-select name="visitType" clearable placeholder="All visit types">
  <option value="screening">Screening</option>
  <option value="baseline">Baseline</option>
  <option value="fu1">Follow-up 1</option>
</vi-select>
```

### Angular controlled

```html
<vi-select
  name="country"
  [value]="form.country"
  (vialiq-change)="form.country = $event.detail.value"
  required
  [status]="ctrl.invalid && ctrl.touched ? 'invalid' : 'default'"
  [validityMessage]="getError(ctrl)"
>
  <option *ngFor="let c of countries" [value]="c.code">{{c.name}}</option>
</vi-select>
```

---

## Related Components

- [`vi-radio-group`](./vi-radio.md) — ≤ 6 exclusive choices, always visible
- [`vi-combobox`](./vi-combobox.md) — type-ahead search, large code lists
- [`vi-form-field`](./vi-form-field.md) — label + validation wrapper
