# `vi-radio` / `vi-radio-group` — Radio Button

**Package:** `@vialiq/web-components/radio`  
**Elements:** `<vi-radio>`, `<vi-radio-group>`  
**Status:** 🔲 Planned — Phase 1  
**Flux UI base:** `libs/flux-ui/components/_radio.scss`

---

## Purpose

A pair of components implementing the WAI-ARIA radio group pattern:

- `vi-radio-group` — the container that manages selection and keyboard roving tabindex
- `vi-radio` — individual option within the group

Use for **mutually exclusive choices** where all options should be visible simultaneously (< 7 options). For longer lists, use `vi-select` or `vi-combobox`.

**Clinical EDC use cases:**
- Sex at birth (Male / Female / Intersex / Unknown)
- Severity grade (Mild / Moderate / Severe / Life-threatening / Fatal)
- Response outcome (Complete / Partial / Stable / Progressed)
- Yes / No / Unknown — the most common EDC pattern
- Visit type (Screening / Baseline / Follow-up / Unscheduled)

---

## `vi-radio-group` API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `value` | `value` | `string` | `''` | ✅ | Currently selected radio's value |
| `name` | `name` | `string` | `''` | — | Shared name for all child radios |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables all child radios |
| `required` | `required` | `boolean` | `false` | ✅ | One selection required |
| `status` | `status` | `ControlStatus` | `'default'` | ✅ | Validation state (applied to all children) |
| `validityMessage` | `validity-message` | `string` | `''` | — | Error message below the group |
| `orientation` | `orientation` | `RadioGroupOrientation` | `'vertical'` | ✅ | Layout direction |

```typescript
type RadioGroupOrientation = 'vertical' | 'horizontal';
type ControlStatus = 'default' | 'valid' | 'invalid';
```

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | `vi-radio` elements |
| `label` | Group label / legend text |
| `helper` | Helper text below the group |

### Events

| Event | Type | Bubbles | Composed | Fires when |
|-------|------|---------|---------|-----------|
| `vialiq-change` | `CustomEvent<{value: string}>` | ✅ | ✅ | Selection changes |

---

## `vi-radio` API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `value` | `value` | `string` | `''` | — | The value this radio represents |
| `checked` | `checked` | `boolean` | `false` | ✅ | Selected state (managed by group) |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disabled state |
| `name` | `name` | `string` | `''` | — | Set by parent `vi-radio-group` |

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | Label text for this option |

### CSS Parts

| Part | Element |
|------|---------|
| `circle` | Visual outer ring |
| `dot` | Visual inner filled dot |
| `label` | Label text `<span>` |

---

## CSS Custom Properties

### On `vi-radio`

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-radio-size` | `18px` | Outer circle diameter |
| `--vi-radio-dot-size` | `8px` | Inner dot diameter |
| `--vi-radio-border-color` | `var(--vi-color-grey-400)` | Unchecked ring |
| `--vi-radio-border-color-checked` | `var(--vi-color-primary)` | Checked ring |
| `--vi-radio-dot-color` | `var(--vi-color-primary)` | Inner dot fill |
| `--vi-radio-focus-ring-color` | `var(--vi-color-primary)` | Focus outline |
| `--vi-radio-focus-ring-glow` | `var(--vi-color-blue-200)` | Focus glow |
| `--vi-radio-label-gap` | `8px` | Gap: circle → label |
| `--vi-radio-label-font-size` | `var(--vi-font-size-base)` | Label size |
| `--vi-radio-disabled-opacity` | `0.5` | Disabled opacity |

### On `vi-radio-group`

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-radio-group-gap` | `8px` | Gap between radio items (vertical) |
| `--vi-radio-group-gap-horizontal` | `24px` | Gap between items (horizontal) |

---

## Keyboard Interactions

The `vi-radio-group` implements **roving tabindex**:

| Key | Behaviour |
|-----|-----------|
| `Tab` | Enter/leave the group (only the selected radio, or first, is focusable) |
| `↑` / `←` | Move to previous radio (wraps) |
| `↓` / `→` | Move to next radio (wraps) |
| `Space` | Select the focused radio |

This matches the [WAI-ARIA radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/).

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Group role | `vi-radio-group` renders `<fieldset>` with `<legend>` (or `role="radiogroup"` + `aria-labelledby` if fieldset is not semantically appropriate) |
| Radio role | Native `<input type="radio">` — `role="radio"` implicit |
| Selection | `aria-checked` on native input |
| Roving tabindex | Only selected radio (or first if none) has `tabindex="0"`; others `tabindex="-1"` |
| Required | `aria-required="true"` on the group's `<fieldset>` |
| Invalid | `aria-invalid="true"` + `aria-errormessage` on group |
| Disabled | `disabled` attr on each native input |

---

## Shadow DOM Structure

### `vi-radio-group`

```html
<fieldset class="radio-group" role="radiogroup" aria-required=${required} aria-invalid=${status === 'invalid'}>
  <legend class="radio-group-legend">
    <slot name="label"></slot>
  </legend>
  <div class="radio-group-items">
    <slot></slot>  <!-- vi-radio elements -->
  </div>
  <slot name="helper" class="radio-group-helper"></slot>
  <span class="radio-group-validation" ?hidden=${!validityMessage}>
    ${validityMessage}
  </span>
</fieldset>
```

### `vi-radio`

```html
<label class="radio-wrapper">
  <input
    type="radio"
    class="radio-input sr-only"
    .name=${this.name}
    .value=${this.value}
    ?checked=${this.checked}
    ?disabled=${this.disabled}
    tabindex=${this.checked || this._isFirstInGroup ? 0 : -1}
    @change=${this._onChange}
    @keydown=${this._onKeydown}
  />
  <span part="circle" class="radio-circle" aria-hidden="true">
    <span part="dot" class="radio-dot"></span>
  </span>
  <span part="label" class="radio-label">
    <slot></slot>
  </span>
</label>
```

---

## Usage Examples

### Yes / No / Unknown (most common EDC pattern)

```html
<vi-radio-group
  name="adverseEvent"
  label="Was there an adverse event?"
  orientation="horizontal"
  required
>
  <span slot="label">Was there an adverse event?</span>
  <vi-radio value="yes">Yes</vi-radio>
  <vi-radio value="no">No</vi-radio>
  <vi-radio value="unknown">Unknown</vi-radio>
</vi-radio-group>
```

### Severity grade

```html
<vi-radio-group name="severity" label="AE Severity Grade" required
  status="invalid" validityMessage="Grade is required.">
  <span slot="label">AE Severity Grade</span>
  <vi-radio value="1">Grade 1 — Mild</vi-radio>
  <vi-radio value="2">Grade 2 — Moderate</vi-radio>
  <vi-radio value="3">Grade 3 — Severe</vi-radio>
  <vi-radio value="4">Grade 4 — Life-Threatening</vi-radio>
  <vi-radio value="5">Grade 5 — Fatal</vi-radio>
</vi-radio-group>
```

### Controlled value (Angular)

```html
<vi-radio-group
  name="sex"
  [value]="form.sex"
  (vialiq-change)="form.sex = $event.detail.value"
  required
>
  <span slot="label">Sex at Birth</span>
  <vi-radio value="M">Male</vi-radio>
  <vi-radio value="F">Female</vi-radio>
  <vi-radio value="I">Intersex</vi-radio>
  <vi-radio value="UNK">Unknown</vi-radio>
</vi-radio-group>
```

### Disabled (locked data)

```html
<vi-radio-group name="visitType" disabled .value=${lockedVisitType}>
  <span slot="label">Visit Type</span>
  <vi-radio value="screening">Screening</vi-radio>
  <vi-radio value="baseline">Baseline</vi-radio>
  <vi-radio value="followup">Follow-up</vi-radio>
</vi-radio-group>
```

---

## Implementation Notes

- `vi-radio-group` uses a `MutationObserver` to react to `vi-radio` children being added/removed and rebuild the roving tabindex.
- Name propagation: `vi-radio-group` sets `name` on all `vi-radio` children via a context/controller pattern (not by passing props down in the template — children are slotted light DOM).
- Selection propagation: When `value` on the group changes, the group finds the matching child and sets `checked = true`, clears all others.
- The roving tabindex is managed by the group, not individual radios.

---

## Related Components

- [`vi-checkbox`](./vi-checkbox.md) — multi-select (non-exclusive)
- [`vi-select`](./vi-select.md) — long exclusive-choice list
- [`vi-form-field`](./vi-form-field.md) — label + validation wrapper
