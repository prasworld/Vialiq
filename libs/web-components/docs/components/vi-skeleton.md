# `vi-skeleton` — Skeleton Loader

**Package:** `@vialiq/web-components/skeleton`  
**Element:** `<vi-skeleton>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_skeleton.scss`

---

## Purpose

A visual placeholder that mimics the shape and layout of real content while data is loading. Prevents layout shift and communicates to users that content is coming, reducing perceived wait time.

Use `vi-skeleton` **instead of** `vi-spinner` when:
- The shape of the incoming content is known (form, table rows, cards)
- The load time is expected to be > 300ms
- You want to prevent cumulative layout shift (CLS)

Use `vi-spinner` instead when:
- Shape is unknown (e.g. a chart of variable size)
- The action is a quick in-place operation (< 300ms)

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `variant` | `variant` | `SkeletonVariant` | `'text'` | ✅ | Shape preset |
| `width` | `width` | `string` | `'100%'` | — | Width (CSS value: `200px`, `60%`, etc.) |
| `height` | `height` | `string` | `''` | — | Height override (CSS value) |
| `lines` | `lines` | `number` | `1` | — | For `text` variant: number of lines |
| `lastLineWidth` | `last-line-width` | `string` | `'70%'` | — | Width of the last text line (shorter = natural) |
| `animated` | `animated` | `SkeletonAnimation` | `'shimmer'` | ✅ | Animation style |
| `borderRadius` | `border-radius` | `string` | `''` | — | Override border radius |

```typescript
type SkeletonVariant = 'text' | 'circle' | 'rect' | 'button' | 'card';
type SkeletonAnimation = 'shimmer' | 'pulse' | 'none';
```

---

### Variant Presets

| Variant | Shape | Default size | Use case |
|---------|-------|-------------|---------|
| `text` | Rounded bar(s) | 100% × 14px per line | Body text, labels, field values |
| `circle` | Circle | 40×40px | Avatar, icon placeholder |
| `rect` | Rectangle | 100% × 160px | Image, card image, chart area |
| `button` | Rounded rect | 120×36px | Button placeholder |
| `card` | Card layout | Full card | Composite: avatar + 3 text lines |

---

### Events

None — `vi-skeleton` is purely presentational.

---

### CSS Parts

| Part | Element |
|------|---------|
| `skeleton` | Root skeleton element |
| `line` | Each text line (when `variant="text"` and `lines > 1`) |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-skeleton-color` | `var(--vi-color-grey-200)` | Base skeleton colour |
| `--vi-skeleton-shimmer-color` | `var(--vi-color-grey-100)` | Shimmer highlight colour |
| `--vi-skeleton-shimmer-duration` | `1.5s` | Shimmer animation cycle |
| `--vi-skeleton-pulse-duration` | `2s` | Pulse animation cycle |
| `--vi-skeleton-border-radius` | `4px` | Default shape radius |
| `--vi-skeleton-line-height` | `14px` | Text line height |
| `--vi-skeleton-line-gap` | `8px` | Gap between text lines |

---

## Shimmer Animation

```scss
// libs/flux-ui/components/_skeleton.scss
@keyframes vi-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

@keyframes vi-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--vi-skeleton-color, #{$color-grey-200}) 25%,
    var(--vi-skeleton-shimmer-color, #{$color-grey-100}) 50%,
    var(--vi-skeleton-color, #{$color-grey-200}) 75%
  );
  background-size: 200% 100%;
  animation: vi-shimmer var(--vi-skeleton-shimmer-duration, 1.5s) infinite linear;
}

:host([animated="pulse"]) .skeleton {
  animation: vi-pulse var(--vi-skeleton-pulse-duration, 2s) ease-in-out infinite;
  background: var(--vi-skeleton-color);
}

:host([animated="none"]) .skeleton {
  animation: none;
  background: var(--vi-skeleton-color);
}

// Respect reduced motion
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: var(--vi-skeleton-color);
  }
}
```

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Hidden from AT | `aria-hidden="true"` on the skeleton host |
| Loading state | Set `aria-busy="true"` on the **container** section |
| Screen reader message | Provide an `aria-label` or `<span class="sr-only">Loading...</span>` on the container |

```html
<!-- Parent container marks itself as busy -->
<section aria-busy="true" aria-label="Subject demographics loading">
  <vi-skeleton variant="text" lines="2"></vi-skeleton>
  <vi-skeleton variant="text" width="60%"></vi-skeleton>
</section>
```

When content loads, replace skeletons with real content and remove `aria-busy`.

---

## Usage Examples

### Single text line

```html
<vi-skeleton variant="text" width="80%"></vi-skeleton>
```

### Multi-line text block (paragraph)

```html
<vi-skeleton variant="text" lines="4" last-line-width="55%"></vi-skeleton>
```

### Avatar + text row

```html
<div style="display: flex; gap: 12px; align-items: center;">
  <vi-skeleton variant="circle" width="40px" height="40px"></vi-skeleton>
  <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
    <vi-skeleton variant="text" width="120px"></vi-skeleton>
    <vi-skeleton variant="text" width="80px"></vi-skeleton>
  </div>
</div>
```

### CRF form skeleton (loading state)

```html
<section aria-busy="true" aria-label="Form loading">
  <!-- Field 1 -->
  <div class="form-field-skeleton">
    <vi-skeleton variant="text" width="120px" height="12px"></vi-skeleton>
    <vi-skeleton variant="rect" height="40px"></vi-skeleton>
  </div>
  <!-- Field 2 -->
  <div class="form-field-skeleton">
    <vi-skeleton variant="text" width="90px" height="12px"></vi-skeleton>
    <vi-skeleton variant="rect" height="40px"></vi-skeleton>
  </div>
  <!-- Actions -->
  <div style="display: flex; gap: 8px; justify-content: flex-end;">
    <vi-skeleton variant="button" width="80px"></vi-skeleton>
    <vi-skeleton variant="button" width="100px"></vi-skeleton>
  </div>
</section>
```

### Subject card skeleton

```html
<vi-skeleton variant="card"></vi-skeleton>
```

Renders as a pre-built composite matching the `vi-card` layout (avatar row + 3 text lines + action strip).

### Table rows skeleton

```html
<!-- Skeleton rows while table data loads -->
<table>
  <tbody>
    ${Array.from({length: 5}).map(() => html`
      <tr>
        <td><vi-skeleton variant="text" width="60px"></vi-skeleton></td>
        <td><vi-skeleton variant="text" width="120px"></vi-skeleton></td>
        <td><vi-skeleton variant="text" width="80px"></vi-skeleton></td>
        <td><vi-skeleton variant="button" width="64px" height="28px"></vi-skeleton></td>
      </tr>
    `)}
  </tbody>
</table>
```

### Pulse animation variant

```html
<vi-skeleton variant="rect" animated="pulse" height="200px"></vi-skeleton>
```

### Dark theme override

```html
<div data-theme="dark">
  <!-- Skeleton automatically uses dark tokens via CSS cascade -->
  <vi-skeleton variant="text" lines="3"></vi-skeleton>
</div>
```

---

## Angular Integration

```typescript
@Component({
  template: `
    <section [attr.aria-busy]="isLoading || null">
      @if (isLoading) {
        <div class="form-skeleton">
          <vi-skeleton variant="text" width="140px" height="13px"></vi-skeleton>
          <vi-skeleton variant="rect" height="40px"></vi-skeleton>
        </div>
      } @else {
        <vi-form-field label="Subject ID">
          <vi-input name="subjectId" [value]="subject.id"></vi-input>
        </vi-form-field>
      }
    </section>
  `
})
```

---

## Implementation Notes

- Each `vi-skeleton` is a single host element with no slots — it renders its own shape via CSS.
- The `card` variant renders an internal shadow DOM template (avatar circle + 3 text bars + action bar) — no external slots.
- `width` / `height` are applied as inline styles on `:host`: `this.style.width = this.width`.
- The shimmer sweep uses `background-position` animation on a gradient. No JS animation loop.
- Multiple skeletons on the same page share the same animation timing — they pulse together because CSS `animation-delay: 0` is the default. For a staggered effect, apply `--vi-skeleton-shimmer-delay: 0.2s` per item.

---

## Related Components

- [`vi-spinner`](./vi-spinner.md) — animated loading indicator for unknown shapes
- [`vi-card`](./vi-card.md) — the real card that the skeleton mimics
