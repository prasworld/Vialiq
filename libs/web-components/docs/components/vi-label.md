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
| `size` | `size` | `LabelSize` | `'md'` | ✅ | Font size variant |
| `layout` | `layout` | `LabelLayout` | `'stacked'` | ✅ | Layout spacing behavior |
| `type` | `type` | `LabelType` | `'default'` | ✅ | Semantic text color |

```typescript
type LabelSize = 'sm' | 'md' | 'lg';
type LabelLayout = 'stacked' | 'inline';
type LabelType = 'default' | 'primary' | 'secondary';
```

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | Label text |
| `tooltip` | Inline help icon that triggers a tooltip |

*(Note: `vi-label` is rendered in the Light DOM to preserve native label accessibility. Slotted content is rendered as direct child nodes of the `vi-label` host element.)*

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-label-font-size` | `var(--vi-font-size-sm)` | Label text size |
| `--vi-label-font-weight` | `var(--vi-font-weight-medium)` | Label weight (500) |
| `--vi-label-color` | `var(--vi-text-primary)` | Label text colour |
| `--vi-label-color-disabled` | `var(--vi-text-disabled)` | Disabled state colour |
| `--vi-label-required-color` | `var(--vi-color-error)` | `*` indicator colour |
| `--vi-label-optional-color` | `var(--vi-text-helper)` | "(optional)" text colour |
| `--vi-label-gap` | `4px` | Gap between label text and indicators |

---

## Light DOM Structure

Because native `<label for="...">` accessibility does not cross Shadow DOM boundaries, `vi-label` is rendered in the **Light DOM**.

```html
<vi-label class="size-md" for="my-input">
  Label Text
  <label class="vi-label size-md" for="my-input">
    <!-- Indicators and Tooltips are rendered here -->
    <span class="vi-label-required" aria-hidden="true">*</span>
    <span class="vi-label-tooltip-trigger">
      <vi-icon name="info-circle"></vi-icon>
    </span>
  </label>
</vi-label>
```

The `*` is `aria-hidden` — the `required` state is communicated via `aria-required` on the control itself, not via the visual asterisk. Since there is no Shadow DOM, there are no `::part()` pseudo-elements; consumers can style elements using standard CSS classes if necessary, although standard CSS custom properties should be preferred.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Label association | `for` attribute links to control `id` natively in Light DOM |
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

### With semantic type and tooltip

```html
<vi-label for="semantic-input" type="primary">
  Primary Label
  <vi-icon slot="tooltip" name="info-circle"></vi-icon>
</vi-label>
<vi-input id="semantic-input"></vi-input>
```

### Inline Layout

```html
<div style="display: flex; align-items: center;">
  <vi-label for="inline-input" layout="inline">Inline Label</vi-label>
  <vi-input id="inline-input"></vi-input>
</div>
```

---

## Related Components

- [`vi-form-field`](./vi-form-field.md) — label + input + error, all-in-one
- [`vi-tooltip`](./vi-tooltip.md) — inline help tip
