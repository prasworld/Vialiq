# `vi-progress` — Progress Indicator

**Package:** `@vialiq/web-components/progress`  
**Element:** `<vi-progress>`  
**Status:** 🔲 Planned — Phase 1  
**Flux UI base:** `libs/flux-ui/components/_progress.scss`

---

## Purpose

Displays the completion progress of a task. Can be represented as a linear bar or a circular ring. 
Inspired by Ant Design's Progress component but built using native Web Components and Flux UI tokens.

Used for:
- Upload/Download progress
- Multi-step form completion
- System resource usage (CPU/Memory)
- Long-running deterministic operations

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `value` | `value` | `number` | `0` | ✅ | Current progress value |
| `max` | `max` | `number` | `100` | ✅ | Maximum progress value |
| `type` | `type` | `ProgressType` | `'line'` | ✅ | Visual representation |
| `variant` | `variant` | `ProgressVariant`| `'primary'`| ✅ | Semantic color variant |
| `size` | `size` | `ProgressSize` | `'md'` | ✅ | Visual size |
| `status` | `status` | `ProgressStatus` | `'normal'` | ✅ | State of progress |
| `showInfo` | `show-info` | `boolean` | `true` | ✅ | Show the value label/icon |
| `strokeLinecap`| `stroke-linecap`| `StrokeLinecap` | `'round'` | ✅ | Shape of the stroke ends |

```typescript
type ProgressType = 'line' | 'circle';
type ProgressVariant = 'primary' | 'success' | 'error' | 'warning';
type ProgressSize = 'sm' | 'md' | 'lg';
type ProgressStatus = 'normal' | 'active' | 'exception' | 'success';
type StrokeLinecap = 'round' | 'butt' | 'square';
```

**Note on Status:**
- `normal`: Standard progress.
- `active`: Adds a sweeping shiny animation across the track (for `line` type).
- `exception`: Maps to `error` variant, shows a cross icon if `showInfo` is true.
- `success`: Maps to `success` variant, shows a tick icon if `showInfo` is true.

---

### Slots

| Name | Description |
|------|-------------|
| `info` | Custom content to replace the default percentage text or status icons. |

---

### CSS Parts

| Part | Element | Description |
|------|---------|-------------|
| `base` | `div` | The outer wrapper container |
| `track` | `div` / `circle` | The background track of the progress |
| `indicator` | `div` / `circle` | The filled portion of the progress |
| `info` | `span` | The text or icon container for `showInfo` |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-progress-track-bg` | `var(--vi-layer-03, #{tokens.$layer-03})` | Track background color |
| `--vi-progress-indicator-bg` | `var(--vi-color-primary, #{tokens.$color-primary})` | Indicator fill color |
| `--vi-progress-height` | `var(--vi-spacing-sm, #{tokens.$spacing-sm})` | Thickness of the linear bar |
| `--vi-progress-circle-size` | `120px` | Diameter for circle type |
| `--vi-progress-circle-thickness`| `6px` | Stroke width for circle type |
| `--vi-progress-border-radius` | `var(--vi-border-radius-full, #{tokens.$border-radius-full})` | Border radius of track/indicator |
| `--vi-progress-text-color` | `var(--vi-text-primary, #{tokens.$text-primary})` | Info text color |

#### Variant Mappings
When `variant` or `status` is used, the `--vi-progress-indicator-bg` changes:
- `primary` / `normal`: `var(--vi-color-primary)`
- `success`: `var(--vi-color-green-500)`
- `error` / `exception`: `var(--vi-color-red-500)`
- `warning`: `var(--vi-color-amber-500)`

---

## Shadow DOM Structure

### Line Type
```html
<div part="base" class="vi-progress vi-progress--line">
  <div class="vi-progress-outer">
    <div part="track" class="vi-progress-track">
      <div 
        part="indicator" 
        class="vi-progress-indicator" 
        style="width: 75%;"
      ></div>
    </div>
  </div>
  <span part="info" class="vi-progress-info" aria-hidden="true">
    <slot name="info">75%</slot>
  </span>
</div>
```

### Circle Type
```html
<div part="base" class="vi-progress vi-progress--circle">
  <svg viewBox="0 0 100 100" class="vi-progress-circle-svg">
    <circle part="track" class="vi-progress-circle-track" cx="50" cy="50" r="47" />
    <circle 
      part="indicator" 
      class="vi-progress-circle-indicator" 
      cx="50" cy="50" r="47" 
      style="stroke-dasharray: 295.3; stroke-dashoffset: 73.8;" 
    />
  </svg>
  <span part="info" class="vi-progress-info" aria-hidden="true">
    <slot name="info">75%</slot>
  </span>
</div>
```

---

## Accessibility (A11y)

| Requirement | Implementation |
|-------------|----------------|
| Role | The outer wrapper gets `role="progressbar"` |
| Attributes | `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"` are mapped from properties |
| Status text | If `showInfo` is false, provide a screen-reader only fallback for the value |
| Animation | `active` status animations respect `@media (prefers-reduced-motion)` |

```html
<div 
  role="progressbar" 
  aria-valuenow="75" 
  aria-valuemin="0" 
  aria-valuemax="100" 
  aria-label="Upload progress"
>
 ...
</div>
```

---

## Usage Examples

### Basic Linear
```html
<vi-progress value="50"></vi-progress>
```

### With Status (Error/Exception)
```html
<vi-progress value="70" status="exception"></vi-progress>
<!-- Will render with red indicator and a cross icon instead of "70%" -->
```

### Active (Animated)
```html
<vi-progress value="80" status="active"></vi-progress>
<!-- Adds a gleaming sweep animation across the filled area -->
```

### Circular Progress
```html
<vi-progress type="circle" value="75"></vi-progress>
```

### Custom Info (Using Slot)
```html
<vi-progress value="30">
  <span slot="info">3 / 10 Steps</span>
</vi-progress>
```

---

## Adherence to CSS Variables Architecture

All styles will explicitly follow the 3-level CSS cascade rule outlined in `.agents/rules/semantic-colors.md`:
1. Consumer Override (e.g., `--vi-progress-indicator-bg`)
2. Semantic Token (e.g., `#{tokens.$color-primary}`)

```scss
.vi-progress-indicator {
  background-color: var(--vi-progress-indicator-bg, var(--vi-color-primary, #{tokens.$color-primary}));
  border-radius: var(--vi-progress-border-radius, var(--vi-border-radius-full, #{tokens.$border-radius-full}));
}
```
