# `vi-badge` — Status Badge

**Package:** `@vialiq/web-components/badge`  
**Element:** `<vi-badge>`  
**Status:** 🔲 Planned — Phase 1  
**Flux UI base:** `libs/flux-ui/components/_badge.scss`

---

## Purpose

A compact inline indicator used to communicate status, category, or count. Badges are **non-interactive** — they display information but do not respond to clicks (use `vi-tag` for removable/interactive labels).

**Clinical EDC use cases:**
- Record status: Draft / In Review / Locked / Frozen
- Query status: Open / Answered / Closed / Resolved
- Data entry status: Complete / Incomplete / Missing
- AE seriousness: Serious / Non-Serious
- Visit status indicator in subject listing

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `variant` | `variant` | `BadgeVariant` | `'neutral'` | ✅ | Colour semantic |
| `size` | `size` | `BadgeSize` | `'md'` | ✅ | Size |
| `dot` | `dot` | `boolean` | `false` | ✅ | Show coloured dot instead of text |
| `pill` | `pill` | `boolean` | `true` | ✅ | Fully rounded (pill shape) vs. square |
| `count` | `count` | `number` | `undefined` | ✅ | Numeric count (badge is hidden if `count="0"` and `show-zero` is not true) |
| `max` | `max` | `number` | `99` | — | Max count before showing `{max}+` |
| `showZero` | `show-zero` | `boolean` | `false` | ✅ | Show the badge even when count is `0` |
| `outline` | `outline` | `boolean` | `false` | ✅ | Outlined/ghost style |

```typescript
type BadgeVariant =
  | 'neutral'   // grey — default, unknown, not started
  | 'primary'   // blue — informational, active
  | 'success'   // green — complete, locked, verified
  | 'warning'   // amber — needs attention, in review
  | 'danger'    // red — error, overdue, query open
  | 'info';     // cyan — informational (alternative to primary)

type BadgeSize = 'sm' | 'md' | 'lg';
```

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | Badge text content (omit when using `dot` or `count`) |
| `icon` | Optional leading icon (e.g. a status circle) |

---

### Events

None — `vi-badge` is purely presentational.

---

### CSS Parts

| Part | Element |
|------|---------|
| `badge` | The badge `<span>` element |
| `dot` | The dot indicator circle |
| `icon` | Icon slot wrapper |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-badge-font-size` | `11px` | Badge text size |
| `--vi-badge-font-weight` | `var(--vi-font-weight-semibold)` | Badge weight |
| `--vi-badge-padding` | `2px 8px` | Padding (md) |
| `--vi-badge-border-radius` | `9999px` | Fully rounded |
| `--vi-badge-gap` | `4px` | Gap between icon and text |
| `--vi-badge-dot-size` | `8px` | Status dot diameter |

Variant-specific (example for `danger`):

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-badge-danger-bg` | `tokens.$bg-error` | Background |
| `--vi-badge-danger-color` | `tokens.$text-error` | Text / dot colour |
| `--vi-badge-danger-border` | `tokens.$color-error` | Border (outline variant) |

---

## Variant Colour Mapping

| Variant | Background | Text | Use case |
|---------|-----------|------|---------|
| `neutral` | grey-100 | grey-700 | Draft, Unknown, N/A |
| `primary` | blue-100 | blue-700 | Active, In Progress |
| `success` | green-100 | green-700 | Complete, Locked, Clean |
| `warning` | amber-100 | amber-700 | In Review, Query Open |
| `danger` | red-100 | red-700 | Error, Overdue, SAE |
| `info` | cyan-100 | cyan-700 | Informational |

---

## EDC-Specific Status Mapping

Standardised badge patterns across the Vialiq platform:

```html
<!-- Record states -->
<vi-badge variant="neutral">Draft</vi-badge>
<vi-badge variant="warning">In Review</vi-badge>
<vi-badge variant="primary">Submitted</vi-badge>
<vi-badge variant="success">Locked</vi-badge>

<!-- Query states -->
<vi-badge variant="danger">Query Open</vi-badge>
<vi-badge variant="warning">Query Answered</vi-badge>
<vi-badge variant="success">Query Closed</vi-badge>

<!-- Visit completion -->
<vi-badge variant="success">Complete</vi-badge>
<vi-badge variant="neutral">Not Started</vi-badge>
<vi-badge variant="danger" dot>Missing</vi-badge>

<!-- Count badges -->
<vi-badge variant="danger" count="5">Open Queries</vi-badge>
```

---

## Usage Examples

### Inline status label

```html
<span>Visit 2</span>
<vi-badge variant="success">Complete</vi-badge>
```

### Dot indicator

```html
<vi-badge variant="warning" dot></vi-badge>
<span>2 queries need response</span>
```

### Count badge (notification style)

```html
<vi-button icon-only aria-label="Notifications">
  <vi-icon slot="icon" name="bell"></vi-icon>
  <vi-badge count="12" variant="danger" slot="..."></vi-badge>
</vi-button>
```

### Outline (ghost) style

```html
<vi-badge variant="primary" outline>Active Study</vi-badge>
```

### Size variants

```html
<vi-badge size="sm" variant="neutral">sm</vi-badge>
<vi-badge size="md" variant="neutral">md</vi-badge>
<vi-badge size="lg" variant="neutral">lg</vi-badge>
```

---

## Accessibility

- `vi-badge` is `aria-hidden` by default when used as purely decorative inline indicator
- When the badge conveys meaningful status that is not communicated otherwise, add `aria-label` to the containing element or use a screen-reader-only `<span>` alongside it
- For count badges: the count is read as part of the text content — no additional ARIA needed
- Do not use badge colour as the **only** differentiator (always include text or icon)

```html
<!-- Bad: colour only -->
<vi-badge variant="danger" dot></vi-badge>

<!-- Good: text + colour -->
<vi-badge variant="danger" dot>Open Query</vi-badge>

<!-- Or: screen reader text -->
<vi-badge variant="danger" dot aria-label="Open query indicator"></vi-badge>
```

---

## Related Components

- [`vi-tag`](./vi-tag.md) — removable / interactive label
- [`vi-alert`](./vi-alert.md) — full-width status message
- [`vi-spinner`](./vi-spinner.md) — animated loading indicator
