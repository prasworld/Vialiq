# `vi-checkbox` — Checkbox

**Package:** `@vialiq/web-components/checkbox`  
**Element:** `<vi-checkbox>`  
**Status:** 🔲 Planned — Phase 1  
**Flux UI base:** `libs/flux-ui/components/_checkbox.scss`

---

## Purpose

A form-associated checkbox control with:
- Checked, unchecked, and **indeterminate** states
- Custom visual design (native `<input>` is visually hidden for cross-browser consistency)
- Full keyboard and screen reader accessibility
- Group behaviour via `vi-checkbox-group` (for "select all" / indeterminate parent pattern)

**Clinical EDC use cases:**
- "Include subject in modified ITT" flag
- Protocol deviation categories (multi-select)
- "Criteria met" acknowledgements
- SUSAR reporting checklist items
- Concomitant medication categories

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `checked` | `checked` | `boolean` | `false` | ✅ | Checked state |
| `indeterminate` | `indeterminate` | `boolean` | `false` | ✅ | Indeterminate (partial) state |
| `value` | `value` | `string` | `'on'` | — | Form submission value when checked |
| `name` | `name` | `string` | `''` | — | Form field name |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables the checkbox |
| `required` | `required` | `boolean` | `false` | ✅ | Required to be checked |
| `status` | `status` | `ControlStatus` | `'default'` | ✅ | Validation state |

```typescript
type ControlStatus = 'default' | 'valid' | 'invalid';
```

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | Label text displayed next to the checkbox |

---

### Events

| Event | Type | Bubbles | Composed | Fires when |
|-------|------|---------|---------|-----------|
| `vialiq-change` | `CustomEvent<{checked: boolean; value: string}>` | ✅ | ✅ | User toggles the checkbox |

---

### Imperative Methods

| Method | Description |
|--------|-------------|
| `checkValidity()` | Returns `false` if required and unchecked |
| `focus()` | Focuses the inner `<input>` |

---

### CSS Parts

| Part | Element |
|------|---------|
| `box` | Visual checkbox square (the custom-drawn box) |
| `check` | SVG checkmark / indeterminate dash |
| `label` | Label text `<span>` |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-checkbox-size` | `18px` | Box width and height |
| `--vi-checkbox-border-color` | `var(--vi-color-grey-400)` | Unchecked border |
| `--vi-checkbox-border-color-hover` | `var(--vi-color-grey-600)` | Hover border |
| `--vi-checkbox-border-color-checked` | `var(--vi-color-primary)` | Checked border |
| `--vi-checkbox-background-checked` | `var(--vi-color-primary)` | Checked fill |
| `--vi-checkbox-check-color` | `#ffffff` | Check mark / dash stroke |
| `--vi-checkbox-border-radius` | `3px` | Box corner radius |
| `--vi-checkbox-focus-ring-color` | `var(--vi-color-primary)` | Focus outline |
| `--vi-checkbox-focus-ring-glow` | `var(--vi-color-blue-200)` | Focus glow |
| `--vi-checkbox-label-gap` | `8px` | Gap between box and label |
| `--vi-checkbox-label-font-size` | `var(--vi-font-size-base)` | Label font size |
| `--vi-checkbox-label-color` | `var(--vi-color-foreground)` | Label text colour |
| `--vi-checkbox-disabled-opacity` | `0.5` | Disabled opacity |

---

## Shadow DOM Structure

```html
<!-- Actual (simplified) shadow DOM -->
<label class="checkbox-wrapper">
  <!-- Native input — visually hidden, handles keyboard + a11y -->
  <input
    type="checkbox"
    class="checkbox-input sr-only"
    ?checked=${this.checked}
    .indeterminate=${this.indeterminate}
    ?disabled=${this.disabled}
    ?required=${this.required}
    aria-required=${this.required}
    aria-checked=${this.indeterminate ? 'mixed' : this.checked}
    @change=${this._onChange}
  />

  <!-- Custom visual box -->
  <span part="box" class="checkbox-box" aria-hidden="true">
    <svg part="check" class="checkbox-check" viewBox="0 0 12 12">
      <!-- Checkmark path shown when checked -->
      <polyline class="check-mark" points="2,6 5,9 10,3"/>
      <!-- Dash shown when indeterminate -->
      <line class="check-dash" x1="2" y1="6" x2="10" y2="6"/>
    </svg>
  </span>

  <!-- Label slot -->
  <span part="label" class="checkbox-label">
    <slot></slot>
  </span>
</label>
```

---

## Keyboard Interactions

| Key | Behaviour |
|-----|-----------|
| `Tab` / `Shift+Tab` | Move focus to/from checkbox |
| `Space` | Toggle checked state |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Role | Native `<input type="checkbox">` — `role="checkbox"` implicit |
| Checked | `aria-checked="true | false | mixed"` on native input |
| Indeterminate | `aria-checked="mixed"` + `.indeterminate = true` on native input |
| Label | Slot text is inside `<label>` — association is automatic |
| Required | `aria-required="true"` on native input |
| Disabled | `disabled` attr on native input; host `aria-disabled` not needed |
| Focus ring | On native input `:focus-visible` via `clip-path: unset` temporarily |

---

## Indeterminate State

The indeterminate state is not a third "maybe" value — it means "some but not all children are checked." It is always set programmatically, never by user interaction:

```javascript
// Example: "Select All" parent checkbox
const allChecked = children.every(c => c.checked);
const someChecked = children.some(c => c.checked);
parentCheckbox.indeterminate = someChecked && !allChecked;
parentCheckbox.checked = allChecked;
```

---

## Usage Examples

### Simple boolean field

```html
<vi-checkbox name="consentGiven" required>
  I confirm the subject has provided written informed consent.
</vi-checkbox>
```

### Multi-select category list

```html
<fieldset>
  <legend>Concomitant Medication Categories</legend>
  <vi-checkbox name="medCats" value="anticoagulant">Anticoagulant</vi-checkbox>
  <vi-checkbox name="medCats" value="antihypertensive">Antihypertensive</vi-checkbox>
  <vi-checkbox name="medCats" value="analgesic">Analgesic</vi-checkbox>
  <vi-checkbox name="medCats" value="antibiotic">Antibiotic</vi-checkbox>
</fieldset>
```

### Select all / indeterminate parent

```html
<vi-checkbox id="select-all" indeterminate>Select All</vi-checkbox>
<vi-checkbox name="items" value="a">Item A</vi-checkbox>
<vi-checkbox name="items" value="b" checked>Item B</vi-checkbox>
<vi-checkbox name="items" value="c">Item C</vi-checkbox>
```

### Validation state

```html
<vi-checkbox
  name="safetyReviewed"
  required
  status="invalid"
>
  Safety review completed
</vi-checkbox>
<span style="color: var(--vi-color-error); font-size: 12px;">
  This field is required before submission.
</span>
```

---

## Flux UI SCSS

```scss
// libs/flux-ui/components/_checkbox.scss
@layer components {
  .checkbox-wrapper {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--vi-checkbox-label-gap, 8px);
    cursor: pointer;
  }

  .checkbox-input.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border: 0;
  }

  .checkbox-box {
    flex-shrink: 0;
    width: var(--vi-checkbox-size, 18px);
    height: var(--vi-checkbox-size, 18px);
    border: var(--vi-border-width-thin) solid var(--vi-checkbox-border-color, #{$color-grey-400});
    border-radius: var(--vi-checkbox-border-radius, 3px);
    background-color: var(--vi-color-background);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 150ms ease, background-color 150ms ease;
  }

  // checked state
  .checkbox-input:checked ~ .checkbox-box {
    border-color: var(--vi-checkbox-border-color-checked, #{$color-primary});
    background-color: var(--vi-checkbox-background-checked, #{$color-primary});
  }

  // focus ring
  .checkbox-input:focus-visible ~ .checkbox-box {
    outline: var(--vi-border-width-base) solid var(--vi-checkbox-focus-ring-color);
    outline-offset: 2px;
    box-shadow: 0 0 0 3px var(--vi-checkbox-focus-ring-glow);
  }
}
```

---

## Related Components

- [`vi-radio`](./vi-radio.md) — single-choice from group
- [`vi-switch`](./vi-switch.md) — boolean toggle with on/off meaning
- [`vi-form-field`](./vi-form-field.md) — label + validation wrapper
