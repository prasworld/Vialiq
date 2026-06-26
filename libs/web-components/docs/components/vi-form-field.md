# `vi-form-field` — Form Field Wrapper

**Package:** `@vialiq/web-components/form-field`  
**Element:** `<vi-form-field>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_form-field.scss`

---

## Purpose

A layout composite that wraps a form control with:

- A `<label>` (via `vi-label`) with required/optional indicator
- The slotted control
- A helper text slot (always visible)
- A validation message area (shown when `status="invalid"` or `"valid"`)
- Correct ARIA label association across the shadow boundary

`vi-form-field` is the **primary way** to compose form controls in the Vialiq EDC UI. It handles the accessibility plumbing so individual form controls don't need to manage label association.

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `label` | `label` | `string` | `''` | — | Label text |
| `required` | `required` | `boolean` | `false` | — | Passes required indicator to label; sets `aria-required` on slotted control |
| `optional` | `optional` | `boolean` | `false` | — | Shows "(optional)" suffix on label |
| `status` | `status` | `ControlStatus` | `'default'` | ✅ | Validation state — forwarded to slotted control |
| `validityMessage` | `validity-message` | `string` | `''` | — | Error or success message |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables slotted control and dims label |
| `hint` | `hint` | `string` | `''` | — | Helper text (alternative to `helper` slot) |

```typescript
type ControlStatus = 'default' | 'valid' | 'invalid';
```

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | The form control (`vi-input`, `vi-select`, `vi-textarea`, etc.) |
| `label` | Override label content (rich HTML label) |
| `helper` | Persistent helper text below the control |
| `validity` | Override validation message content |

---

### Events

None. Validation events bubble from the slotted control through the shadow boundary.

---

### CSS Parts

| Part | Element |
|------|---------|
| `field` | Root `<div>` container |
| `label` | The `<vi-label>` element |
| `control` | Slot wrapper for the control |
| `helper` | Helper text slot wrapper |
| `validation` | Validation message wrapper |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-form-field-gap` | `4px` | Gap between label, control, helper |
| `--vi-form-field-helper-font-size` | `12px` | Helper text size |
| `--vi-form-field-helper-color` | `var(--vi-color-grey-500)` | Helper text colour |
| `--vi-form-field-validation-font-size` | `12px` | Validation message size |
| `--vi-form-field-validation-error-color` | `var(--vi-color-error)` | Error message colour |
| `--vi-form-field-validation-success-color` | `var(--vi-color-success)` | Success message colour |

---

## Label Association Across Shadow Boundary

The slotted control is in the light DOM; the label is in the shadow DOM. `vi-form-field` bridges this by:

1. Generating a unique `id` for the slotted control if one is not already set
2. Setting the label's `for` to that id
3. Forwarding `aria-required` and `aria-describedby` to the slotted control's inner input via `ElementInternals` (or direct attribute)

---

## Shadow DOM Structure

```html
<div part="field" class="form-field">

  <!-- Label row -->
  <vi-label
    part="label"
    .for=${this._controlId}
    ?required=${this.required}
    ?optional=${this.optional}
    ?disabled=${this.disabled}
  >
    <slot name="label">${this.label}</slot>
  </vi-label>

  <!-- Control slot -->
  <div part="control" class="form-field-control">
    <slot @slotchange=${this._onSlotChange}></slot>
  </div>

  <!-- Helper text (always visible) -->
  <div part="helper" class="form-field-helper">
    <slot name="helper">${this.hint}</slot>
  </div>

  <!-- Validation message (shown when status ≠ default) -->
  <div part="validation" class="form-field-validation"
    ?hidden=${!this.validityMessage}
    class="form-field-validation--${this.status}"
  >
    <slot name="validity">
      <vi-icon
        name=${this.status === 'invalid' ? 'alert-circle' : 'check-circle'}
        size="12"
        aria-hidden="true"
      ></vi-icon>
      ${this.validityMessage}
    </slot>
  </div>

</div>
```

---

## Usage Examples

### Standard field

```html
<vi-form-field label="Subject ID" required hint="As per randomisation list.">
  <vi-input name="subjectId" required></vi-input>
</vi-form-field>
```

### With validation

```html
<vi-form-field
  label="Date of Birth"
  required
  status="invalid"
  validityMessage="Date is required and must be in the past."
>
  <vi-date-picker name="dob" required max="today"></vi-date-picker>
</vi-form-field>
```

### Optional field

```html
<vi-form-field label="Middle Name" optional>
  <vi-input name="middleName"></vi-input>
</vi-form-field>
```

### Success state

```html
<vi-form-field
  label="Email"
  status="valid"
  validityMessage="Email address verified."
>
  <vi-input type="email" name="email" value="pi@site001.com"></vi-input>
</vi-form-field>
```

### Rich label slot

```html
<vi-form-field required>
  <span slot="label">
    Primary Endpoint Result
    <vi-icon name="info" size="14" aria-label="See protocol §8.2"></vi-icon>
  </span>
  <vi-input name="primaryEndpoint"></vi-input>
</vi-form-field>
```

### Disabled section

```html
<vi-form-field label="Investigator Name" disabled>
  <vi-input name="piName" value="Dr. Jane Smith" disabled></vi-input>
  <span slot="helper">Auto-populated from site profile. Contact sponsor to update.</span>
</vi-form-field>
```

---

## Angular Pattern

```typescript
@Component({
  template: `
    <vi-form-field
      label="Subject Initials"
      [required]="ctrl.hasValidator(Validators.required)"
      [status]="ctrl.invalid && ctrl.touched ? 'invalid' : 'default'"
      [validityMessage]="getErrorMessage(ctrl)"
    >
      <vi-input
        name="initials"
        [value]="ctrl.value ?? ''"
        (vialiq-change)="ctrl.setValue($event.detail.value); ctrl.markAsTouched()"
      ></vi-input>
      <span slot="helper">2–3 characters as per CRF instructions.</span>
    </vi-form-field>
  `
})
```

---

## Related Components

- [`vi-label`](./vi-label.md) — label element
- [`vi-input`](./vi-input.md) — text input
- [`vi-textarea`](./vi-textarea.md) — multi-line
- [`vi-select`](./vi-select.md) — dropdown
- [`vi-date-picker`](./vi-date-picker.md) — date entry
