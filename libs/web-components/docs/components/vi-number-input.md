# `vi-number-input` — Numeric Input

**Package:** `@vialiq/web-components/number-input`  
**Element:** `<vi-number-input>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_input.scss` (shared base)

---

## Purpose

A form-associated numeric input control with:
- Increment / decrement step buttons
- Min / max constraint validation
- Unit label display (e.g. "kg", "mg/dL", "mmHg")
- Precision control (decimal places)
- Optional prefix/suffix slots

Use `vi-number-input` instead of `vi-input type="number"` for all numeric clinical data because it:
- Prevents non-numeric input at the component level
- Displays units inline
- Validates range constraints with clinical-grade messages
- Blocks browser-native spinner (inconsistent across browsers)

**Clinical EDC use cases:**
- Weight (kg / lbs), Height (cm / in)
- Vital signs: BP (mmHg), HR (bpm), Temperature (°C / °F)
- Lab values: Haemoglobin (g/dL), Creatinine (µmol/L)
- Drug dosage (mg, mcg)
- Protocol-defined scores (0–100, 0–10)

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `value` | `value` | `number \| null` | `null` | ✅ | Current numeric value |
| `name` | `name` | `string` | `''` | — | Form field name |
| `min` | `min` | `number` | `undefined` | — | Minimum allowed value |
| `max` | `max` | `number` | `undefined` | — | Maximum allowed value |
| `step` | `step` | `number` | `1` | — | Increment/decrement step |
| `precision` | `precision` | `number` | `0` | — | Decimal places displayed |
| `unit` | `unit` | `string` | `''` | — | Unit label (e.g. "kg") |
| `placeholder` | `placeholder` | `string` | `''` | — | Placeholder text |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables control |
| `required` | `required` | `boolean` | `false` | ✅ | Required field |
| `readonly` | `readonly` | `boolean` | `false` | ✅ | Read-only |
| `showSteppers` | `show-steppers` | `boolean` | `true` | — | Show +/− buttons |
| `status` | `status` | `ControlStatus` | `'default'` | ✅ | Validation state |
| `validityMessage` | `validity-message` | `string` | `''` | — | Error/success message |

---

### Slots

| Slot | Description |
|------|-------------|
| `prefix` | Content before the input (e.g. currency symbol "$") |
| `suffix` | Content after the input but before the unit |
| `helper` | Persistent helper text |

---

### Events

| Event | Type | Bubbles | Composed | Fires when |
|-------|------|---------|---------|-----------|
| `vialiq-input` | `CustomEvent<{value: number \| null}>` | ✅ | ✅ | Every keystroke |
| `vialiq-change` | `CustomEvent<{value: number \| null}>` | ✅ | ✅ | Committed value |
| `vialiq-step` | `CustomEvent<{direction: 'up' \| 'down'; value: number \| null}>` | ✅ | ✅ | Stepper button pressed |
| `invalid` | `Event` (cancelable) | ❌ | — | `checkValidity()` fails |

---

### Imperative Methods

| Method | Description |
|--------|-------------|
| `checkValidity()` | Returns validity; fires `invalid` if not |
| `reportValidity()` | Validates + browser tooltip |
| `setCustomValidity(msg)` | Custom error message |
| `stepUp(n?)` | Increment by `n × step` (default 1) |
| `stepDown(n?)` | Decrement by `n × step` (default 1) |
| `focus()` | Focus the inner input |

---

### CSS Parts

| Part | Element |
|------|---------|
| `field` | Outer wrapper |
| `prefix` | Prefix slot wrapper |
| `input` | Native `<input type="number">` |
| `unit` | Unit label span |
| `suffix` | Suffix slot wrapper |
| `stepper-up` | Increment button |
| `stepper-down` | Decrement button |
| `helper` | Helper text wrapper |
| `validation` | Validation message span |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-number-input-unit-color` | `var(--vi-color-grey-500)` | Unit label colour |
| `--vi-number-input-unit-font-size` | `13px` | Unit font size |
| `--vi-number-input-stepper-size` | `28px` | Stepper button width |
| `--vi-number-input-stepper-color` | `var(--vi-color-grey-600)` | Stepper icon colour |
| `--vi-number-input-stepper-hover-bg` | `var(--vi-color-grey-100)` | Stepper hover background |

Plus all `--vi-input-*` tokens for the base input styling.

---

## Validation

`_testValidity()` override in implementation:

```typescript
protected _testValidity(): Partial<ValidityStateFlags> {
  const v = this.value;
  if (this.required && v === null) return { valueMissing: true };
  if (v !== null && this.min !== undefined && v < this.min) return { rangeUnderflow: true };
  if (v !== null && this.max !== undefined && v > this.max) return { rangeOverflow: true };
  if (v !== null && !isFinite(v)) return { badInput: true };
  return {};
}
```

Default error messages (override via `validityMessage`):

| Validity flag | Default message |
|---------------|-----------------|
| `valueMissing` | "This field is required." |
| `rangeUnderflow` | "Value must be at least {min}." |
| `rangeOverflow` | "Value must be no more than {max}." |
| `badInput` | "Please enter a valid number." |

---

## Keyboard Interactions

| Key | Behaviour |
|-----|-----------|
| `↑` | `stepUp()` — increment by step |
| `↓` | `stepDown()` — decrement by step |
| `Page Up` | `stepUp(10)` — jump 10 steps |
| `Page Down` | `stepDown(10)` — jump 10 steps |
| `Home` | Set to `min` (if defined) |
| `End` | Set to `max` (if defined) |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Role | Native `<input type="number">` |
| Range | `aria-valuemin`, `aria-valuemax`, `aria-valuenow` |
| Unit | Unit span is `aria-hidden`; `aria-label` on input includes unit |
| Steppers | `aria-label="Increase value"` / `"Decrease value"` |

---

## Usage Examples

### Weight entry

```html
<vi-form-field label="Body Weight" required>
  <vi-number-input
    name="bodyWeight"
    min="0" max="500"
    step="0.1"
    precision="1"
    unit="kg"
    required
  ></vi-number-input>
</vi-form-field>
```

### Blood pressure (systolic)

```html
<vi-form-field label="Systolic BP">
  <vi-number-input
    name="systolicBP"
    min="60" max="260"
    step="2"
    unit="mmHg"
    placeholder="120"
  ></vi-number-input>
</vi-form-field>
```

### Lab value with precision

```html
<vi-form-field label="Haemoglobin">
  <vi-number-input
    name="haemoglobin"
    min="0" max="25"
    step="0.1"
    precision="1"
    unit="g/dL"
  ></vi-number-input>
</vi-form-field>
```

### Score slider (no steppers)

```html
<vi-number-input
  name="score"
  min="0" max="10"
  step="1"
  show-steppers="false"
  placeholder="0–10"
></vi-number-input>
```

---

## Related Components

- [`vi-input`](./vi-input.md) — plain text input
- [`vi-form-field`](./vi-form-field.md) — label + validation wrapper
- [`vi-date-picker`](./vi-date-picker.md) — date/time numeric entry
