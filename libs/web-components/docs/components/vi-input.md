# `vi-input` — Text Input

**Package:** `@vialiq/web-components/input`  
**Element:** `<vi-input>`  
**Status:** ✅ Implemented  
**Phase:** 1 — Foundational

---

## Purpose

A form-associated single-line text input that wraps a native `<input>` element. Provides:

- Full constraint validation API (`checkValidity`, `reportValidity`, `setCustomValidity`)
- `ElementInternals` form participation (works inside `<form>` with `name`/`value`)
- Three visual validation states: `default`, `valid`, `invalid`
- Helper text (persistent) and validation message (conditional) slots
- Controlled and uncontrolled value patterns

**Supported input types** (single-line only):
```
text | email | password | search | tel | url | number
```

Multi-line text → use `vi-textarea`.  
Date/time inputs → use `vi-date-picker` / `vi-time-picker`.  
Numeric-only with units → use `vi-number-input`.

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `type` | `type` | `InputType` | `'text'` | ✅ | Input type |
| `value` | `value` | `string` | `''` | ✅ | Current value |
| `placeholder` | `placeholder` | `string` | `''` | — | Placeholder text |
| `name` | `name` | `string` | `''` | — | Form field name |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables the input |
| `required` | `required` | `boolean` | `false` | ✅ | Marks field required |
| `status` | `status` | `ControlStatus` | `'default'` | ✅ | Visual validation state |
| `validityMessage` | `validity-message` | `string` | `''` | — | Error/success message text |

```typescript
type InputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';
type ControlStatus = 'default' | 'valid' | 'invalid';
```

**`status` is always set by the parent** — the component never auto-promotes itself from `default` → `valid`. The parent application or form framework decides when to show success styling.

---

### Slots

| Slot | Description |
|------|-------------|
| `helper` | Persistent helper text shown below the input (always visible) |

Validation messages are rendered internally (not slotted) and are driven by `validityMessage`. This keeps them separate from helper text so both can be visible simultaneously.

---

### Events

| Event | Type | Bubbles | Composed | Fires when |
|-------|------|---------|---------|-----------|
| `vialiq-input` | `CustomEvent<{value: string}>` | ✅ | ✅ | Every keystroke (immediate) |
| `vialiq-change` | `CustomEvent<{value: string}>` | ✅ | ✅ | Value committed (blur or Enter) |
| `invalid` | `Event` (cancelable) | ❌ | — | `checkValidity()` fails |

The native `input` and `change` events are stopped at the shadow boundary (`e.stopPropagation()`) and replaced with prefixed custom events. This prevents double-firing when frameworks attach to native events.

---

### Imperative Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `checkValidity()` | `() => boolean` | Validates, fires `invalid` if invalid, returns bool |
| `reportValidity()` | `() => boolean` | Validates + shows browser tooltip, returns bool |
| `setCustomValidity()` | `(message: string) => void` | Sets or clears custom error. Empty string = clear |
| `focus()` | `(options?: FocusOptions) => void` | Programmatically focus the inner input |

---

### CSS Parts

| Part | Element | Purpose |
|------|---------|---------|
| `field` | Outer `<div>` | The field wrapper (label + input + helper stack) |
| `input` | `<input>` | The native input element |
| `helper` | `<slot>` wrapper | Helper text container |
| `validation` | `<span>` | Validation message (error/success) |

---

### CSS Custom Properties

See [CSS-DESIGN-SYSTEM.md](../CSS-DESIGN-SYSTEM.md#vi-input-css-api) for the full reference.

Most commonly overridden:

```css
vi-input {
  /* Status-independent overrides */
  --vi-input-shape-border-radius: 4px;
  --vi-input-typography-font-size: 14px;

  /* Override error colour */
  --vi-input-error-color: #c00000;
}

/* Custom encryption indicator */
vi-input[data-encrypted="true"] {
  --vi-input-border-color: var(--vi-color-purple-500);
  --vi-input-focus-ring-color: var(--vi-color-purple-500);
}
```

---

## Keyboard Interactions

| Key | Behaviour |
|-----|-----------|
| `Tab` / `Shift+Tab` | Move focus to/from input |
| Any character | Type into input |
| `Enter` | Fires `vialiq-change` |
| `Escape` | Native browser behaviour (clears search type) |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Role | Native `<input>` — `role="textbox"` by default |
| Label | Always provide via `<label for>` or `aria-label`. `vi-form-field` handles this automatically |
| Required | `aria-required="true"` on inner `<input>` when `required` |
| Invalid | `aria-invalid="true"` when `status="invalid"` |
| Error message | `aria-errormessage` links input to validation message `<span>` |
| Helper | `aria-describedby` links input to helper slot when populated |
| Focus ring | `outline` on inner `<input>:focus-visible` |

**Always pair with a label:**

```html
<!-- Option 1: vi-form-field handles label association automatically -->
<vi-form-field label="Subject ID" required>
  <vi-input name="subjectId"></vi-input>
</vi-form-field>

<!-- Option 2: native label with `for` -->
<label for="subject-id">Subject ID</label>
<vi-input id="subject-id" name="subjectId"></vi-input>
```

---

## Form Participation

`vi-input` is a form-associated custom element (`static formAssociated = true`). It uses `ElementInternals` to:

- Submit its value with the enclosing `<form>` (via `name` attribute)
- Respond to `form.reset()` via `formResetCallback()` — value reverts to initial attribute value
- Respond to fieldset/form `disabled` via `formDisabledCallback()`

```html
<form id="demographics">
  <vi-input name="firstName" required></vi-input>
  <vi-input name="lastName" required></vi-input>
  <vi-button type="button" @click="form.requestSubmit()">Submit</vi-button>
</form>
```

---

## Validation Pattern (Angular)

```typescript
@Component({
  template: `
    <vi-input
      [value]="ctrl.value ?? ''"
      [attr.required]="ctrl.hasError('required') ? '' : null"
      [status]="ctrl.invalid && ctrl.touched ? 'invalid' : 'default'"
      [validityMessage]="getError(ctrl)"
      (vialiq-change)="ctrl.setValue($event.detail.value); ctrl.markAsTouched()"
    >
      <span slot="helper">Enter the subject's first name as per protocol.</span>
    </vi-input>
  `
})
```

---

## Usage Examples

### Basic text input

```html
<vi-input
  name="patientInitials"
  placeholder="e.g. JD"
  type="text"
></vi-input>
```

### Email with validation

```html
<vi-input
  type="email"
  name="investigatorEmail"
  required
  status="invalid"
  validityMessage="Please enter a valid email address."
>
  <span slot="helper">Used for query notifications.</span>
</vi-input>
```

### Password

```html
<vi-input
  type="password"
  name="eSignaturePin"
  placeholder="Enter PIN"
  required
></vi-input>
```

### Controlled value (Angular two-way)

```html
<vi-input
  [value]="formData.dob"
  (vialiq-change)="formData.dob = $event.detail.value"
  name="dob"
></vi-input>
```

### Encrypted field (FLE)

```html
<vi-input
  name="ssn"
  type="text"
  data-encrypted="true"
  [attr.disabled]="!canDecrypt ? '' : null"
  placeholder="***-**-****"
>
  <span slot="helper">
    <vi-icon name="lock" size="12"></vi-icon>
    Encrypted — visible only to authorised roles
  </span>
</vi-input>
```

---

## Implementation Notes

- `value` is synced to `ElementInternals.setFormValue()` every time it changes, keeping the native form API in sync.
- `_testValidity()` is the override point for subclasses. Return a partial `ValidityStateFlags` object — e.g. `{ valueMissing: true }` for empty required fields.
- The component does **not** auto-validate on blur — that decision is left to the consuming code / framework to control when `status` and `validityMessage` are set.
- `formResetCallback` resets `value` to the HTML attribute's original value (not `''`), so `<vi-input value="default">` restores correctly.

---

## Related Components

- [`vi-textarea`](./vi-textarea.md) — multi-line text
- [`vi-number-input`](./vi-number-input.md) — numeric-only with min/max/step/units
- [`vi-date-picker`](./vi-date-picker.md) — date entry with partial date support
- [`vi-form-field`](./vi-form-field.md) — label + input + error wrapper
- [`vi-combobox`](./vi-combobox.md) — searchable select with free text
