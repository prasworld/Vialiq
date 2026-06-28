# `vi-textarea` — Textarea

**Package:** `@vialiq/web-components/textarea`  
**Element:** `<vi-textarea>`  
**Status:** 🔲 Planned — Phase 1  
**Flux UI base:** `libs/flux-ui/components/_input.scss` (shared with vi-input)

---

## Purpose

A form-associated multi-line text input. Wraps a native `<textarea>` element with the same API surface as `vi-input`. Use for:

- Free-text narrative fields (comments, adverse event descriptions, reason for deviation)
- Clinical notes / investigator remarks
- Protocol deviations — explanation text

Use `vi-input` for single-line text. Do not use `vi-textarea` where the answer is short or constrained — prefer `vi-input` or `vi-select`.

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `value` | `value` | `string` | `''` | ✅ | Current text value |
| `placeholder` | `placeholder` | `string` | `''` | — | Placeholder text |
| `name` | `name` | `string` | `''` | — | Form field name |
| `rows` | `rows` | `number` | `3` | — | Initial visible rows |
| `maxlength` | `maxlength` | `number` | `undefined` | — | Character limit |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables input |
| `required` | `required` | `boolean` | `false` | ✅ | Required field |
| `readonly` | `readonly` | `boolean` | `false` | ✅ | Read-only, not disabled |
| `resize` | `resize` | `TextareaResize` | `'vertical'` | ✅ | CSS resize axis |
| `status` | `status` | `ControlStatus` | `'default'` | ✅ | Validation state |
| `validityMessage` | `validity-message` | `string` | `''` | — | Error/success message |
| `charCount` | `char-count` | `boolean` | `false` | — | Show character counter |

```typescript
type TextareaResize = 'none' | 'vertical' | 'both';
type ControlStatus = 'default' | 'valid' | 'invalid';
```

---

### Slots

| Slot | Description |
|------|-------------|
| `helper` | Persistent helper text below the textarea |

---

### Events

| Event | Type | Bubbles | Composed | Fires when |
|-------|------|---------|---------|-----------|
| `vialiq-input` | `CustomEvent<{value: string}>` | ✅ | ✅ | Every keystroke |
| `vialiq-change` | `CustomEvent<{value: string}>` | ✅ | ✅ | Blur (committed) |
| `invalid` | `Event` (cancelable) | ❌ | — | `checkValidity()` fails |

---

### Imperative Methods

| Method | Description |
|--------|-------------|
| `checkValidity()` | Returns `true` if valid; fires `invalid` if not |
| `reportValidity()` | Validates + shows browser tooltip |
| `setCustomValidity(msg)` | Custom error string (empty = clear) |
| `focus()` | Programmatically focus the textarea |

---

### CSS Parts

| Part | Element |
|------|---------|
| `field` | Outer `<div>` wrapper |
| `textarea` | Native `<textarea>` |
| `helper` | Helper slot wrapper |
| `validation` | Validation message `<span>` |
| `char-counter` | Character count display `<span>` |

---

### CSS Custom Properties

All `--vi-input-*` tokens apply (shared base layer). Additional properties:

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-textarea-min-height` | `96px` | Minimum textarea height |
| `--vi-textarea-max-height` | `none` | Maximum height (scrolls beyond) |
| `--vi-textarea-resize` | `vertical` | Resize handle direction |
| `--vi-textarea-char-counter-color` | `var(--vi-color-grey-500)` | Character count colour |
| `--vi-textarea-char-counter-warning-color` | `var(--vi-color-warning)` | Counter colour at 90% capacity |
| `--vi-textarea-char-counter-error-color` | `var(--vi-color-error)` | Counter colour at 100% |

---

## Shadow DOM Structure

```html
<div part="field" class="input-field">
  <textarea
    part="textarea"
    class="input-control"
    .value=${this.value}
    ?disabled=${this.disabled}
    ?required=${this.required}
    ?readonly=${this.readonly}
    rows=${this.rows}
    maxlength=${this.maxlength}
    aria-invalid=${this.status === 'invalid'}
    aria-required=${this.required}
    aria-describedby="helper validation"
  ></textarea>

  <slot name="helper" part="helper" class="input-helper"></slot>

  <span part="validation" class="input-validation" id="validation"
    ?hidden=${!this.validityMessage}
  >${this.validityMessage}</span>

  <span part="char-counter" class="char-counter"
    ?hidden=${!this.charCount || !this.maxlength}
  >${this.value.length} / ${this.maxlength}</span>
</div>
```

---

## Keyboard Interactions

| Key | Behaviour |
|-----|-----------|
| `Tab` | Move focus to textarea |
| `Shift+Tab` | Move focus away |
| Any printable key | Type character |
| `Enter` | New line (not form submit — textarea is multi-line) |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Role | Native `<textarea>` — `role="textbox"` + `aria-multiline="true"` |
| Label | Always wrap in `vi-form-field` or provide `aria-label` |
| Required | `aria-required="true"` when `required` |
| Invalid | `aria-invalid="true"` when `status="invalid"` |
| Error | `aria-errormessage` → validation `<span>` id |
| Helper | `aria-describedby` → helper slot id |
| Character limit | `aria-describedby` includes char-counter; announces "150 / 200 characters" |

---

## Usage Examples

### Basic narrative field

```html
<vi-form-field label="Reason for Deviation" required>
  <vi-textarea
    name="deviationReason"
    placeholder="Describe the deviation and its clinical impact..."
    rows="5"
    maxlength="2000"
    char-count
  >
    <span slot="helper">Maximum 2,000 characters. Include dates and actions taken.</span>
  </vi-textarea>
</vi-form-field>
```

### Adverse event description

```html
<vi-textarea
  name="aeDescription"
  rows="4"
  required
  status="invalid"
  validityMessage="Description is required for serious adverse events."
  maxlength="1000"
  char-count
></vi-textarea>
```

### Read-only (review mode)

```html
<vi-textarea
  name="clinicalNotes"
  readonly
  .value=${existingNote}
  resize="none"
></vi-textarea>
```

---

## Form Participation

`vi-textarea` is form-associated (`static formAssociated = true`). Behaviour mirrors `vi-input`:
- Value submitted via `name` attribute
- `formResetCallback()` restores to attribute value
- `formDisabledCallback()` syncs disabled state from fieldset

---

## Flux UI SCSS Layer

`vi-textarea.scss` imports `@vialiq/flux-ui/components/input` (the same base as `vi-input`) and adds:

```scss
@use '@vialiq/flux-ui/styles/variables' as tokens;
@use '@vialiq/flux-ui/components/input';  // shared base

:host {
  display: block;
}

:host([resize="none"])     { --vi-textarea-resize: none; }
:host([resize="both"])     { --vi-textarea-resize: both; }
:host([resize="vertical"]) { --vi-textarea-resize: vertical; }

.input-control {  // overrides the shared input-control class
  resize: var(--vi-textarea-resize, vertical);
  min-height: var(--vi-textarea-min-height, 96px);
  max-height: var(--vi-textarea-max-height, none);
  height: auto;
  overflow-y: auto;
}
```

---

## Related Components

- [`vi-input`](./vi-input.md) — single-line text
- [`vi-form-field`](./vi-form-field.md) — label + control + error wrapper
- [`vi-number-input`](./vi-number-input.md) — numeric variant
