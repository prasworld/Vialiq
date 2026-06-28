# `vi-spinner` — Loading Spinner

**Package:** `@vialiq/web-components/spinner`  
**Element:** `<vi-spinner>`  
**Status:** 🔲 Planned — Phase 1  
**Flux UI base:** `libs/flux-ui/components/_spinner.scss`

---

## Purpose

An animated circular indicator conveying that an operation is in progress. Used for:

- Page / section loading
- Form submission in progress
- Data fetch operations
- Background sync operations

**Not suitable for:** determinate progress (use a progress bar). Not suitable for long operations where % completion is known.

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `size` | `size` | `SpinnerSize` | `'md'` | ✅ | Visual size |
| `variant` | `variant` | `SpinnerVariant` | `'primary'` | ✅ | Colour |
| `label` | `label` | `string` | `'Loading...'` | — | Screen reader announcement |

```typescript
type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'primary' | 'neutral' | 'inverted';
```

Size pixel mapping:

| Size | Diameter |
|------|---------|
| `xs` | 12px |
| `sm` | 16px |
| `md` | 24px (default) |
| `lg` | 32px |
| `xl` | 48px |

---

### Events

None — `vi-spinner` is purely presentational.

---

### CSS Parts

| Part | Element |
|------|---------|
| `track` | The full-circle background arc |
| `arc` | The animated rotating arc |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-spinner-size` | `24px` | Diameter |
| `--vi-spinner-thickness` | `2px` | Arc stroke width |
| `--vi-spinner-track-color` | `var(--vi-color-grey-200)` | Background circle |
| `--vi-spinner-arc-color` | `var(--vi-color-primary)` | Active arc colour |
| `--vi-spinner-speed` | `0.75s` | Full rotation duration |

Variant tokens:

| Variant | Arc colour |
|---------|-----------|
| `primary` | `var(--vi-color-primary)` |
| `neutral` | `var(--vi-color-grey-500)` |
| `inverted` | `#ffffff` (for dark/coloured backgrounds) |

---

## Shadow DOM Structure

```html
<!-- SVG spinner — no external assets, no animation library -->
<span class="spinner-wrapper" role="status" aria-label=${this.label}>
  <svg
    class="spinner"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- Background track -->
    <circle
      part="track"
      class="spinner-track"
      cx="12" cy="12" r="10"
      fill="none"
      stroke-width="var(--vi-spinner-thickness, 2)"
    />
    <!-- Animated arc -->
    <circle
      part="arc"
      class="spinner-arc"
      cx="12" cy="12" r="10"
      fill="none"
      stroke-width="var(--vi-spinner-thickness, 2)"
      stroke-dasharray="62.83"    <!-- 2πr ≈ 62.83 for r=10 -->
      stroke-dashoffset="47"      <!-- ~75% visible, 25% gap -->
      stroke-linecap="round"
    />
  </svg>
</span>
```

CSS animation:
```css
@keyframes vi-spinner-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.spinner {
  animation: vi-spinner-rotate var(--vi-spinner-speed, 0.75s) linear infinite;
  transform-origin: center;
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation-duration: 3s;  /* Slow down, don't stop — still indicates loading */
  }
}
```

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Role | `role="status"` on wrapper |
| Label | `aria-label="${this.label}"` (default "Loading...") |
| SVG hidden | SVG is `aria-hidden="true"` (the wrapper carries semantics) |
| Polite announce | `role="status"` is an ARIA live region with `aria-live="polite"` |

For page-level loading, also use `aria-busy="true"` on the section being loaded:

```html
<section aria-busy="true" aria-label="Loading subject data">
  <vi-spinner label="Loading subject data..."></vi-spinner>
</section>
```

---

## Usage Examples

### Inline with button (submitting state)

```html
<vi-button disabled>
  <vi-spinner slot="icon" size="sm" variant="inverted" label="Saving..."></vi-spinner>
  Saving...
</vi-button>
```

### Page loading overlay

```html
<div class="loading-overlay" role="status" aria-label="Loading form">
  <vi-spinner size="xl"></vi-spinner>
  <p>Loading CRF data...</p>
</div>
```

### Inline section loading

```html
<div class="data-section" aria-busy="true">
  <vi-spinner size="sm" label="Loading lab results..."></vi-spinner>
  <span class="sr-only">Lab results are loading</span>
</div>
```

### Neutral variant (on dark header)

```html
<header style="background: var(--vi-color-primary);">
  <vi-spinner size="sm" variant="inverted" label="Syncing..."></vi-spinner>
  Syncing data...
</header>
```

### Colour via CSS override

```html
<vi-spinner style="--vi-spinner-arc-color: var(--vi-color-success)"></vi-spinner>
```

---

## Related Components

- [`vi-button`](./vi-button.md) — loading state via spinner in icon slot
- [`vi-badge`](./vi-badge.md) — static status indicator
- [`vi-alert`](./vi-alert.md) — result status after operation
