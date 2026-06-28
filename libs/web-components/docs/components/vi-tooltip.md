# `vi-tooltip` — Tooltip

**Package:** `@vialiq/web-components/tooltip`  
**Element:** `<vi-tooltip>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_tooltip.scss`

---

## Purpose

A floating hint that appears on hover/focus providing supplementary information about a UI element. Used for:

- Field abbreviation expansions ("AE" → "Adverse Event")
- Protocol field definitions ("ICF" → "Informed Consent Form")
- Truncated text expansion in tables
- Icon button labels when text label is not visible

**Tooltip vs. Alert:**
- Tooltip — transient, triggered by interaction, non-critical supplemental info
- Alert — persistent, time-sensitive, user-visible without interaction

**Do not put:**
- Critical information only in a tooltip (screen magnification users may not see it)
- Interactive content inside a tooltip (use `vi-modal` or a popover instead)
- Long blocks of text (keep to one or two short sentences)

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `content` | `content` | `string` | `''` | — | Tooltip text (alternative to `content` slot) |
| `placement` | `placement` | `TooltipPlacement` | `'top'` | ✅ | Preferred position |
| `trigger` | `trigger` | `TooltipTrigger` | `'hover focus'` | — | Events that show the tooltip |
| `delay` | `delay` | `number` | `500` | — | Show delay (ms) |
| `hideDelay` | `hide-delay` | `number` | `100` | — | Hide delay (ms) |
| `maxWidth` | `max-width` | `number` | `240` | — | Max tooltip width (px) |
| `disabled` | `disabled` | `boolean` | `false` | — | Suppress tooltip |

```typescript
type TooltipPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'right';

type TooltipTrigger = 'hover focus' | 'hover' | 'focus' | 'click';
```

Auto-flip: when the preferred placement has no room, the tooltip flips to the opposite side. The component uses CSS `anchor-positioning` (progressive enhancement) with a JS fallback.

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | The trigger element (button, icon, etc.) |
| `content` | Rich tooltip content (use for links or formatted text) |

---

### Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vialiq-show` | `CustomEvent` | ✅ | Tooltip becomes visible |
| `vialiq-hide` | `CustomEvent` | ✅ | Tooltip is hidden |

---

### CSS Parts

| Part | Element |
|------|---------|
| `tooltip` | The floating tooltip panel |
| `arrow` | The directional arrow/caret |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-tooltip-background` | `var(--vi-color-grey-900)` | Tooltip background |
| `--vi-tooltip-color` | `#ffffff` | Tooltip text colour |
| `--vi-tooltip-font-size` | `12px` | Tooltip text size |
| `--vi-tooltip-border-radius` | `4px` | Tooltip shape |
| `--vi-tooltip-padding` | `6px 10px` | Inner padding |
| `--vi-tooltip-max-width` | `240px` | Max width |
| `--vi-tooltip-arrow-size` | `6px` | Arrow triangle size |
| `--vi-tooltip-z-index` | `9999` | Stack order |
| `--vi-tooltip-shadow` | `var(--vi-shadow-md)` | Box shadow |

---

## Accessibility

Tooltips follow the [ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/):

| Requirement | Implementation |
|-------------|----------------|
| Role | Tooltip panel: `role="tooltip"` |
| Association | Trigger element gets `aria-describedby` pointing to tooltip id |
| Keyboard | Tooltip shows on focus (`trigger="hover focus"` default) |
| Escape | `Escape` hides the tooltip |
| No interactive content | If you need a button inside the tooltip, use a popover/modal instead |

```html
<!-- The tooltip automatically adds aria-describedby to the trigger -->
<vi-tooltip content="Informed Consent Form — signed before first visit">
  <vi-icon name="info" label="ICF definition"></vi-icon>
</vi-tooltip>
```

Screen reader reads: "info, ICF definition, Informed Consent Form — signed before first visit"

---

## Usage Examples

### Icon with tooltip

```html
<vi-tooltip content="This value was locked by the sponsor and cannot be edited.">
  <vi-icon name="lock" size="16" label="Locked field"></vi-icon>
</vi-tooltip>
```

### Abbreviation expansion

```html
<vi-tooltip content="Adverse Event — an undesirable experience associated with the study drug.">
  <abbr>AE</abbr>
</vi-tooltip>
```

### Icon-only button

```html
<vi-tooltip content="Download CRF as PDF" placement="bottom">
  <vi-button icon-only variant="ghost" aria-label="Download CRF as PDF">
    <vi-icon slot="icon" name="download"></vi-icon>
  </vi-button>
</vi-tooltip>
```

### Rich content (link inside tooltip)

```html
<vi-tooltip>
  <vi-icon slot name="info"></vi-icon>
  <div slot="content">
    Grade per NCI CTCAE v5.0.
    <vi-link href="https://ctep.cancer.gov/protocoldevelopment/electronic_applications/ctc.htm" external>
      View criteria
    </vi-link>
  </div>
</vi-tooltip>
```

> ⚠️ When the tooltip content contains interactive elements (links, buttons), the tooltip must remain visible when the user moves focus inside it. Implement `trigger="hover focus"` and ensure the tooltip stays open while any element inside it is focused.

### Placement variants

```html
<vi-tooltip content="Opens in a new window" placement="right">
  <vi-button variant="ghost" size="sm">External Link</vi-button>
</vi-tooltip>
```

---

## Implementation Notes

- Tooltip is rendered in the document `<body>` (portal pattern) to avoid `overflow: hidden` clipping.
- Uses CSS `anchor-positioning` API where supported (Chrome 125+, Safari 18+). Falls back to JS `getBoundingClientRect` positioning.
- Show/hide delays prevent tooltip flash when mouse rapidly moves across the screen.
- Only one tooltip is visible at a time globally (singleton pattern).
- `@media (hover: none)` — hover trigger is ignored on touch-only devices; only focus trigger applies.
- Respects `prefers-reduced-motion` — no animation on tooltip appearance.

---

## Related Components

- [`vi-modal`](./vi-modal.md) — for rich interactive overlays
- [`vi-alert`](./vi-alert.md) — persistent status messages
- [`vi-badge`](./vi-badge.md) — inline non-interactive status
- [`vi-label`](./vi-label.md) — form label with inline help
