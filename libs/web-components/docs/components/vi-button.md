# `vi-button` — Button

**Package:** `@vialiq/web-components/button`  
**Element:** `<vi-button>`  
**Status:** ✅ Implemented  
**Phase:** 1 — Foundational

---

## Purpose

A self-styled interactive button component. Wraps a native `<button>` element inside shadow DOM to provide:

- Six semantic variants (primary, secondary, danger, success, info, ghost)
- Four sizes (xs, sm, md, lg)
- Icon slot with configurable placement
- Full-width and icon-only modes
- Accessible disabled state (no pointer events, no tab stop when disabled)

`vi-button` is **not** form-associated. It does not submit forms by itself. To submit a form, place it inside a `<form>` and handle the `click` event in the host application, or use `type="submit"` on a regular `<button>` inside the form.

**What it is not:**
- Not a link (`<a>`) — use `vi-link` for navigation
- Not a form submit trigger — wire click events in consuming code
- Not a menu trigger — use `vi-dropdown` for that pattern

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `variant` | `variant` | `ButtonVariant` | `'primary'` | ✅ | Visual style |
| `size` | `size` | `ButtonSize` | `'md'` | ✅ | Size scale |
| `iconPlacement` | `icon-placement` | `ButtonIconPlacement` | `'start'` | ✅ | Icon before or after label |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables the button |
| `fullWidth` | `full-width` | `boolean` | `false` | ✅ | Stretches to container width |
| `iconOnly` | `icon-only` | `boolean` | `false` | ✅ | Square icon-only layout |

#### `ButtonVariant`
```typescript
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'ghost';
```

| Variant | Use case |
|---------|---------|
| `primary` | Main call-to-action — Save, Submit, Next |
| `secondary` | Alternative action — Cancel, Back |
| `danger` | Destructive — Delete, Discard |
| `success` | Confirm positive outcome — Approve |
| `info` | Informational actions |
| `ghost` | Minimal — toolbar actions, icon-only controls |

#### `ButtonSize`
```typescript
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
```

| Size | Height | Font | Use case |
|------|--------|------|---------|
| `xs` | 24px | 12px | Dense data tables, inline actions |
| `sm` | 32px | 14px | Compact panels, search bars |
| `md` | 40px | 16px | Default — all standard forms |
| `lg` | 48px | 18px | Primary page-level CTAs |

#### `ButtonIconPlacement`
```typescript
type ButtonIconPlacement = 'start' | 'end';
```

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | Button label text / content |
| `icon` | A single icon element (`vi-icon` or inline SVG) |

When the `icon` slot is empty, the icon wrapper is hidden via `hidden` attribute (no layout impact).

---

### Events

`vi-button` does not dispatch custom events. It relies on the native `click` event, which bubbles and is composed.

When `disabled`, clicks are swallowed (`stopImmediatePropagation`) and the native `click` is suppressed.

---

### CSS Parts

| Part | Element | Purpose |
|------|---------|---------|
| `button` | `<button>` | Inner button element |
| `icon` | `<slot name="icon">` wrapper | Icon slot container |
| `label` | `<span>` | Label text wrapper |

**External styling via `::part()`:**
```css
vi-button::part(button) {
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
```

---

### CSS Custom Properties

See [CSS-DESIGN-SYSTEM.md](../CSS-DESIGN-SYSTEM.md#vi-button-css-api) for the full list.

Quick reference — most commonly overridden:

```css
vi-button {
  --vi-button-shape-border-radius: 8px;           /* rounder corners */
  --vi-button-surface-primary-background-color: #0460a9; /* brand primary */
  --vi-button-typography-font-weight: 700;         /* bolder labels */
}
```

---

## Keyboard Interactions

| Key | Behaviour |
|-----|-----------|
| `Tab` / `Shift+Tab` | Move focus to/from button |
| `Enter` | Activate button (fires `click`) |
| `Space` | Activate button (fires `click`) |

The host element is the tab stop (tabIndex 0 by default). `delegatesFocus: true` routes the focus ring to the inner `<button>`.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Role | Native `<button>` — implicit `role="button"` |
| Name | From slot text content |
| Disabled | `disabled` attr on inner `<button>` + `tabIndex=-1` on host |
| Focus ring | `outline` on inner `<button>:focus-visible` |
| Icon-only | **Always add a text label** in the default slot (visually hidden if needed with `.sr-only`) or provide `aria-label` via the consuming code: `<vi-button aria-label="Delete record" icon-only>…</vi-button>` |

---

## Usage Examples

### Basic

```html
<vi-button>Save Form</vi-button>
<vi-button variant="secondary">Cancel</vi-button>
<vi-button variant="danger">Delete Subject</vi-button>
```

### With Icon

```html
<vi-button variant="primary">
  <vi-icon slot="icon" name="save"></vi-icon>
  Save &amp; Continue
</vi-button>

<!-- Icon after label -->
<vi-button variant="secondary" icon-placement="end">
  Next Step
  <vi-icon slot="icon" name="arrow-right"></vi-icon>
</vi-button>
```

### Icon-Only

```html
<vi-button icon-only variant="ghost" aria-label="Delete">
  <vi-icon slot="icon" name="trash"></vi-icon>
</vi-button>
```

### Sizes

```html
<vi-button size="xs">Compact</vi-button>
<vi-button size="sm">Small</vi-button>
<vi-button>Default (md)</vi-button>
<vi-button size="lg">Large CTA</vi-button>
```

### Full Width

```html
<vi-button full-width>Submit Questionnaire</vi-button>
```

### Disabled

```html
<vi-button disabled>Cannot Submit</vi-button>
```

### EDC-specific patterns

```html
<!-- Save draft -->
<vi-button variant="secondary" size="sm">
  <vi-icon slot="icon" name="save"></vi-icon>
  Save Draft
</vi-button>

<!-- Submit form with confirmation -->
<vi-button variant="primary" id="submit-btn">
  Submit to Database
</vi-button>

<!-- Query action -->
<vi-button variant="info" size="xs" icon-only aria-label="Raise Query">
  <vi-icon slot="icon" name="message-circle"></vi-icon>
</vi-button>
```

---

## Angular Integration

```typescript
// Angular host component
@Component({
  template: `
    <vi-button
      [attr.disabled]="isSubmitting ? '' : null"
      (click)="onSave()"
    >
      {{ isSubmitting ? 'Saving...' : 'Save' }}
    </vi-button>
  `
})
```

---

## Implementation Notes

- The host element is the tab stop; with `delegatesFocus: true` focus is forwarded to the inner `<button tabindex="0">` for reliable `:focus-visible`.
- `disabled` state management is in `FocusableMixin` — toggling `disabled` calls `_setHostFocusable()` which synchronises `tabIndex` on the host element.
- Icon detection (`_hasIcon` state) is driven by the `slotchange` event on the icon slot, not a prop — consumers do not need to declare whether they use an icon.
- `fullWidth` changes `:host` display from `inline-block` → `block`; the inner `.button` then sets `width: 100%`.

---

## Related Components

- [`vi-link`](./vi-link.md) — navigation links (renders `<a>`)
- [`vi-icon`](./vi-icon.md) — icon slot content
- [`vi-spinner`](./vi-spinner.md) — loading state replacement for button label
- [`vi-dropdown`](./vi-dropdown.md) — button + floating menu pattern
