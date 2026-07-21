# `vi-alert` — Inline Alert Banner

**Package:** `@vialiq/web-components/alert`  
**Element:** `<vi-alert>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_alert.scss`

---

## Purpose

A persistent inline status message displayed within the page layout. Not floating, not ephemeral.

**Alert vs. Toast vs. Notification:**

| | `vi-alert` | `vi-toast` | `vi-notification` |
|-|-----------|-----------|------------------|
| Position | Inline (in flow) | Floating (portal) | Notification panel |
| Persistence | Until dismissed/resolved | Auto-dismiss (configurable) | Notification centre |
| Initiated by | Application state | User action feedback | Background event |
| Interrupts layout | Yes (takes space) | No | No |
| Use for | Page/form status | Action confirmation | Async system events |

**Clinical EDC use cases:**
- Form-level validation summary: "3 fields have errors. Please review before submitting."
- Query context banner: "This record has 2 open queries. Resolve before sign-off."
- Offline mode: "You are working offline. Changes will sync when reconnected."
- Data lock warning: "This form is locked. Contact your DM to unlock."
- Protocol deviation: "A protocol deviation has been recorded for this visit."
- Read-only mode: "You are viewing an archived version of this record."

---

## Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `variant` | `variant` | `AlertVariant` | `'info'` | ✅ | Colour, icon, ARIA role |
| `title` | `title` | `string` | `''` | — | Bold headline (optional) |
| `open` | `open` | `boolean` | `true` | ✅ | Controls whether the alert is displayed |
| `floating` | `floating` | `boolean` | `false` | ✅ | Positions alert absolutely over parent container (100% width) |
| `dismissible` | `dismissible` | `boolean` | `false` | ✅ | Show × dismiss button |
| `icon` | `icon` | `string` | auto | — | Override the default status icon name |
| `noIcon` | `no-icon` | `boolean` | `false` | — | Hide the icon |

```typescript
type AlertVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral';
```

**ARIA role mapping (automatic):**

| Variant | `role` | Live region |
|---------|--------|-------------|
| `info` | `status` | Polite |
| `success` | `status` | Polite |
| `warning` | `alert` | Assertive |
| `danger` | `alert` | Assertive |
| `neutral` | none | — |

---

## Methods

| Method | Return Type | Description |
|--------|-------------|-------------|
| `show()` | `Promise<void>` | Programmatically opens/shows the alert |
| `hide()` | `Promise<void>` | Programmatically closes/dismisses the alert (with collapse animation) |

---

## Slots

| Slot | Description |
|------|-------------|
| *(default)* | Alert body content (text or rich HTML) |
| `title` | Override title (when richer markup is needed vs. `title` attribute) |
| `icon` | Custom icon |
| `actions` | Action buttons or links ("Retry", "View details", "Undo") |

---

## Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vialiq-alert-show` | `CustomEvent<{ id: string }>` | ✅ | Alert is opened/shown |
| `vialiq-alert-close` | `CustomEvent<{ id: string }>` | ✅ | Alert is dismissed (× clicked or hide() called) |

---

## CSS Parts

| Part | Element |
|------|---------|
| `alert` | Root element |
| `icon` | Status icon wrapper |
| `content` | Title + body column |
| `title` | Title span |
| `body` | Default slot wrapper |
| `actions` | Actions slot wrapper |
| `close-btn` | × dismiss button |

---

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-alert-border-radius` | `6px` | Corner radius |
| `--vi-alert-padding` | `12px 16px` | Inner padding |
| `--vi-alert-gap` | `12px` | Icon → content gap |
| `--vi-alert-border-width` | `1px` | Border width |
| `--vi-alert-floating-z-index` | `10` | Z-index when `floating` is enabled |
| `--vi-alert-floating-shadow` | `0 4px 12px rgba(0,0,0,0.12)` | Box shadow when `floating` is enabled |

Variant-specific tokens (example for `danger`):

| Token | Value |
|-------|-------|
| `--vi-alert-danger-bg` | `var(--vi-color-red-50)` |
| `--vi-alert-danger-border-color` | `var(--vi-color-red-300)` |
| `--vi-alert-danger-icon-color` | `var(--vi-color-error)` |
| `--vi-alert-danger-title-color` | `var(--vi-color-red-900)` |
| `--vi-alert-danger-text-color` | `var(--vi-color-red-800)` |

---

## Shadow DOM Structure

```
vi-alert[role="alert|status"]
├── div[part="alert"] .alert-root[data-variant]
│   ├── div[part="icon"] .alert-icon    (unless no-icon)
│   │   └── slot[name="icon"] → vi-icon (default)
│   ├── div[part="content"] .alert-content
│   │   ├── div[part="title"] .alert-title  (if title set)
│   │   │   └── slot[name="title"] / title attribute
│   │   ├── div[part="body"] .alert-body
│   │   │   └── slot (default)
│   │   └── div[part="actions"] .alert-actions
│   │       └── slot[name="actions"]
│   └── vi-button[part="close-btn"] (if dismissible)
```

---

## Usage Examples

### Form validation summary

```html
<vi-alert variant="danger" title="Please fix the following errors:" dismissible>
  <ul>
    <li>Date of Birth is required</li>
    <li>Weight must be a number between 0 and 700</li>
    <li>Ethnicity selection is required</li>
  </ul>
</vi-alert>
```

### Query context banner (EDC)

```html
<vi-alert variant="warning" title="Open queries">
  This form has 2 open queries. All queries must be resolved before data lock.
  <div slot="actions">
    <vi-button variant="ghost" size="sm">View Queries</vi-button>
  </div>
</vi-alert>
```

### Floating Container Overlay (No Layout Shift)

```html
<div style="position: relative;">
  <vi-alert floating variant="warning" title="Read-Only Mode" dismissible>
    This card is currently locked for editing.
  </vi-alert>

  <h3>Subject Form Record</h3>
  <p>Form contents remain in place without layout shifts.</p>
</div>
```

### Data lock indicator

```html
<vi-alert variant="info" no-icon>
  <vi-icon slot="icon" name="lock" size="16"></vi-icon>
  This record is <strong>locked</strong>. Contact your Data Manager to request
  an unlock.
</vi-alert>
```

### Offline mode banner (full-width)

```html
<vi-alert variant="warning" style="border-radius: 0; width: 100%;">
  You are currently <strong>offline</strong>. Changes are saved locally and
  will sync automatically when your connection is restored.
</vi-alert>
```

### Success (auto-hide after 5s using host logic)

```html
@if (showSaveConfirmation) {
  <vi-alert variant="success" dismissible
    (vialiq-alert-close)="showSaveConfirmation = false">
    Form has been saved and submitted for review.
  </vi-alert>
}
```

### Angular reactive display

```typescript
// component.ts
get formAlertVariant(): AlertVariant {
  if (this.form.invalid && this.submitted) return 'danger';
  if (this.hasOpenQueries) return 'warning';
  return 'info';
}
```

```html
<vi-alert [variant]="formAlertVariant" [title]="formAlertTitle" dismissible
  (vialiq-alert-close)="clearAlert()">
  {{formAlertMessage}}
</vi-alert>
```

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Live region | `role="alert"` (assertive) for `warning`/`danger`; `role="status"` (polite) for `info`/`success` |
| Screen reader announcement | Content read when inserted into DOM (live region) |
| `neutral` variant | No role; purely presentational |
| Dismiss button | `aria-label="Dismiss alert"` |
| Icon | `aria-hidden="true"` (decorative; variant communicated via text) |

**Critical:** Always include meaningful text in the alert body — do not rely on colour or icon alone to convey meaning.

---

## Implementation Notes

- `role` attribute is set automatically based on `variant` — host should not override it.
- For `warning` and `danger`, content is read assertively on insert. Avoid dynamically updating the text of an existing alert — remove and re-add the element to force a fresh live region announcement.
- `dismissible` fires `vialiq-alert-close` (emitting `{ id: string }` in `detail`) and sets `hidden` on the element.
- Transition: `height` + `opacity` collapse animation on dismiss (using `Element.animate()` Web Animations API).

---

## i18n — Internal Labels

All internal text uses `translateDirective`. See [I18N.md](../I18N.md) for setup.

| Key | Default (en) |
|-----|-------------|
| `alert.dismiss` | `"Dismiss"` |

---

## Related Components

- [`vi-toast`](./vi-toast.md) — floating ephemeral notifications
- [`vi-notification`](./vi-notification.md) — persistent notification centre
- [`vi-badge`](./vi-badge.md) — count indicator
- [`vi-form-field`](./vi-form-field.md) — field-level validation messages
