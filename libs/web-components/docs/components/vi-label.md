# `vi-label` — Form Label

**Package:** `@vialiq/web-components/label`  
**Element:** `<vi-label>`  
**Status:** 🔲 Planned — Phase 1  
**Flux UI base:** `libs/flux-ui/components/_label.scss`

---

## Purpose

A styled `<label>` element for associating visible text with form controls. Provides:

- Required indicator asterisk (`*`) when `required`
- Optional indicator text when `optional`
- Consistent Flux UI typography
- Correct `for` attribute forwarding to the control's input

**Note:** In most cases you should use `vi-form-field` instead, which wraps `vi-label` together with the control and error message. Use `vi-label` directly only when you need a label without the full form-field layout.

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `for` | `for` | `string` | `''` | — | ID of the associated control |
| `required` | `required` | `boolean` | `false` | — | Show required `*` indicator |
| `optional` | `optional` | `boolean` | `false` | — | Show "(optional)" text |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Muted disabled styling |
| `size` | `size` | `LabelSize` | `'md'` | — | Font size variant |

```typescript
type LabelSize = 'sm' | 'md' | 'lg';
```

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | Label text |
| `tooltip` | Inline help icon that triggers a tooltip |

---

### CSS Parts

| Part | Element |
|------|---------|
| `label` | The `<label>` element |
| `required-indicator` | The `*` asterisk `<span>` |
| `optional-indicator` | The "(optional)" `<span>` |
| `tooltip-trigger` | Tooltip icon wrapper |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-label-font-size` | `var(--vi-font-size-sm)` | Label text size |
| `--vi-label-font-weight` | `var(--vi-font-weight-medium)` | Label weight (500) |
| `--vi-label-color` | `var(--vi-color-grey-700)` | Label text colour |
| `--vi-label-color-disabled` | `var(--vi-color-grey-400)` | Disabled state colour |
| `--vi-label-required-color` | `var(--vi-color-error)` | `*` indicator colour |
| `--vi-label-optional-color` | `var(--vi-color-grey-400)` | "(optional)" text colour |
| `--vi-label-gap` | `4px` | Gap between label text and indicators |

---

## Shadow DOM Structure

```html
<label part="label" class="label" for=${this.for}>
  <slot></slot>

  ${this.required ? html`
    <span part="required-indicator" class="label-required" aria-hidden="true">*</span>
  ` : nothing}

  ${this.optional ? html`
    <span part="optional-indicator" class="label-optional">(optional)</span>
  ` : nothing}

  <slot name="tooltip"></slot>
</label>
```

The `*` is `aria-hidden` — the `required` state is communicated via `aria-required` on the control itself, not via the visual asterisk.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Label association | `for` attribute links to control `id` |
| Required indicator | `*` is `aria-hidden="true"` — the control carries `aria-required` |
| Disabled | Visual only — `cursor: default`, muted colour |

---

## Usage Examples

### Standalone label

```html
<vi-label for="subject-id" required>Subject ID</vi-label>
<vi-input id="subject-id" name="subjectId" required></vi-input>
```

### With optional indicator

```html
<vi-label for="middle-name" optional>Middle Name</vi-label>
<vi-input id="middle-name" name="middleName"></vi-input>
```

### Small size (for compact forms)

```html
<vi-label for="initials" size="sm" required>Initials</vi-label>
<vi-input id="initials" name="initials" size="sm"></vi-input>
```

---

## Related Components

- [`vi-form-field`](./vi-form-field.md) — label + input + error, all-in-one
- [`vi-tooltip`](./vi-tooltip.md) — inline help tip
