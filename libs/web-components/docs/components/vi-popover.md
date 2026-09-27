# `vi-popover` — Popover

**Package:** `@vialiq/web-components/popover`  
**Element:** `<vi-popover>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_popover.scss` (To be created)

---

## Purpose

A floating panel used to display rich, interactive, or complex content (e.g., forms, settings, action menus) attached to a trigger element. 

**Popover vs. Tooltip:**
- **Tooltip:** Transient, triggered by hover/focus, non-interactive supplemental text.
- **Popover:** Persistent until dismissed, usually triggered by click, designed to hold interactive elements like links, buttons, and forms.

**Do not put:**
- Critical full-page workflows inside a popover (use `vi-modal` or `vi-drawer` instead).
- Just a single line of text (use `vi-tooltip` instead).

---

## Public API

### Properties / Attributes

Following the TC39 Decorator pattern (from `COMPONENT-PROPERTIES-GUIDE.md`):

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `placement` | `placement` | `PopoverPlacement` | `'bottom'` | ✅ | Preferred position |
| `trigger` | `trigger` | `PopoverTrigger` | `'click'` | — | Events that show the popover |
| `title` | `title` | `string` | `''` | — | Plain text title header |
| `content` | `content` | `string` | `''` | — | Plain text body content |
| `open` | `open` | `boolean` | `false` | ✅ | Controls visibility programmatically |
| `popperOptions` | `popper-options` | `Object` | `{}` | — | Custom `@floating-ui/dom` config |

```typescript
type PopoverPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'right';

type PopoverTrigger = 'click' | 'hover' | 'focus' | 'contextmenu';
```

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | The trigger element (e.g., a button) |
| `content` | Rich HTML body content (overrides `content` property) |
| `title` | Custom HTML title header (overrides `title` property) |

---

### Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vialiq-show` | `CustomEvent` | ✅ | Popover begins opening |
| `vialiq-hide` | `CustomEvent` | ✅ | Popover begins closing |

---

### CSS Parts

| Part | Element |
|------|---------|
| `popover` | The floating panel container |
| `header` | The header/title area |
| `body` | The body/content area |
| `arrow` | The directional arrow/caret |

---

### CSS Custom Properties

Following the three-level cascade strategy (`CSS-DESIGN-SYSTEM.md`):

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-popover-bg` | `var(--vi-color-background, #fff)` | Panel background |
| `--vi-popover-border` | `1px solid var(--vi-border-02)` | Panel border |
| `--vi-popover-radius` | `8px` | Panel shape |
| `--vi-popover-padding` | `12px 16px` | Inner body padding |
| `--vi-popover-z-index` | `9998` | Stack order |
| `--vi-popover-shadow` | `var(--vi-shadow-lg)` | Box shadow |

---

## Accessibility

Popovers follow standard ARIA widget patterns:

| Requirement | Implementation |
|-------------|----------------|
| Role | Panel uses `role="dialog"` |
| Association | Trigger element gets `aria-haspopup="dialog"` and `aria-expanded="true/false"` |
| Focus Management | Focus is trapped/managed if interactive content exists. |
| Escape | `Escape` key closes the popover |
| Click outside | Clicking outside the popover closes it (when `trigger="click"`) |

---

## Usage Examples

### Basic Click Popover

```html
<vi-popover title="Settings">
  <vi-button>Open Settings</vi-button>
  <div slot="content">
    <vi-switch label="Enable notifications"></vi-switch>
  </div>
</vi-popover>
```

### Hover Menu

```html
<vi-popover trigger="hover" placement="right">
  <vi-button variant="ghost">More Options</vi-button>
  <div slot="content">
    <vi-link href="/edit">Edit</vi-link>
    <vi-link href="/delete" variant="danger">Delete</vi-link>
  </div>
</vi-popover>
```

---

## Implementation Notes

- Uses `@floating-ui/dom` exactly like `vi-tooltip` for robust positioning, auto-flipping, and arrow placement.
- Does **not** teleport to `document.body` by default to preserve Shadow DOM encapsulation for the `<slot>` content. 
- Disables entrance animations if `@media (prefers-reduced-motion: reduce)` is set.

---

## Related Components

- [`vi-tooltip`](./vi-tooltip.md) — for transient, non-interactive hints
- [`vi-modal`](./vi-modal.md) — for full-page, screen-blocking overlays
