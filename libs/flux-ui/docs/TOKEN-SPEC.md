# Design System Token Specification

**Complete reference for all design tokens and their values.**

---

## Table of Contents

1. [Color Tokens](#color-tokens)
2. [Spacing Tokens](#spacing-tokens)
3. [Typography Tokens](#typography-tokens)
4. [Shadow Tokens](#shadow-tokens)
5. [Border Tokens](#border-tokens)
6. [Z-Index Tokens](#z-index-tokens)
7. [Breakpoint Tokens](#breakpoint-tokens)
8. [Token Access Patterns](#token-access-patterns)

---

## Color Tokens

### Brand Colors

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| `primary` | `#0066cc` | Blue | Primary actions, focus states |
| `secondary` | `#f0f4f8` | Light Gray | Secondary backgrounds |

### Semantic Colors

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| `success` | `#10b981` | Green | Success messages, confirmations |
| `warning` | `#f59e0b` | Amber | Warning messages, caution |
| `error` | `#ef4444` | Red | Error messages, destructive actions |
| `info` | `#3b82f6` | Blue | Informational messages |

### Neutral Palette

10-level neutral scale from white to black:

| Level | Token | Hex | Usage |
|-------|-------|-----|-------|
| 50 | `neutral-50` | `#f9fafb` | Lightest background |
| 100 | `neutral-100` | `#f3f4f6` | Light background |
| 200 | `neutral-200` | `#e5e7eb` | Light border |
| 300 | `neutral-300` | `#d1d5db` | Disabled state |
| 400 | `neutral-400` | `#9ca3af` | Placeholder text |
| 500 | `neutral-500` | `#6b7280` | Secondary text |
| 600 | `neutral-600` | `#4b5563` | Body text |
| 700 | `neutral-700` | `#374151` | Heading text |
| 800 | `neutral-800` | `#1f2937` | Dark text |
| 900 | `neutral-900` | `#111827` | Darkest text |

### Functional Colors

| Token | Value | Hex | Usage |
|-------|-------|-----|-------|
| `background` | `#ffffff` | White | Default page background |
| `foreground` | `#111827` | Dark Gray | Default text color |
| `border` | `#e5e7eb` | Light Gray | Default border color |

### CSS Variable Names

All colors available as CSS custom properties in `:root`:

```css
--vi-color-primary: #0066cc;
--vi-color-neutral-100: #f3f4f6;
--vi-color-success: #10b981;
/* ... etc */
```

---

## Spacing Tokens

### Unit System: 8px Base

Spacing follows an 8px base unit system for consistent rhythm:

| Token | Value | Multiplier | Usage |
|-------|-------|-----------|-------|
| `xs` | `8px` | 1× | Tight spacing, icon padding |
| `sm` | `16px` | 2× | Small margins, button padding |
| `md` | `24px` | 3× | Default spacing, component padding |
| `lg` | `32px` | 4× | Large gaps, section padding |
| `xl` | `40px` | 5× | Extra large spacing |
| `2xl` | `48px` | 6× | Large sections spacing |
| `3xl` | `56px` | 7× | Page-level spacing |

### Application Examples

```
xs (8px):    Button icon padding, small gaps
sm (16px):   Small margins, form field padding
md (24px):   Default layout spacing, card padding
lg (32px):   Section separators, component margins
xl (40px):   Page sections, container gaps
```

### CSS Variable Names

```css
--vi-spacing-xs: 8px;
--vi-spacing-sm: 16px;
--vi-spacing-md: 24px;
/* ... etc */
```

### Utility Classes

```html
<!-- Margin -->
<div class="m-xs">8px margin all</div>
<div class="mx-md">24px margin horizontal</div>
<div class="mt-lg">32px margin top</div>

<!-- Padding -->
<div class="p-md">24px padding all</div>
<div class="px-lg">32px padding horizontal</div>
<div class="py-sm">16px padding vertical</div>
```

---

## Typography Tokens

### Font Families

| Token | Value | Usage |
|--------|-------|-------|
| `base` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...` | Default body font |
| `mono` | `'Menlo', 'Monaco', 'Courier New', monospace` | Code, technical text |

### Font Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | `12px` | Small labels, captions, hints |
| `sm` | `14px` | Secondary text, form help text |
| `base` | `16px` | Default body text |
| `lg` | `18px` | Large body text, form labels |
| `xl` | `20px` | Small headings, important text |
| `2xl` | `24px` | Medium headings |
| `3xl` | `30px` | Large headings, page titles |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `light` | 300 | De-emphasized text |
| `normal` | 400 | Default body text |
| `medium` | 500 | Form labels, emphasis |
| `semibold` | 600 | Subheadings, strong emphasis |
| `bold` | 700 | Headings, critical emphasis |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `tight` | 1.2 | Headings, compact layouts |
| `normal` | 1.5 | Default body text |
| `relaxed` | 1.75 | Large blocks, readability |

### CSS Variable Names

```css
--vi-font-family-base: ...;
--vi-font-size-base: 16px;
--vi-font-size-lg: 18px;
/* ... etc */
```

### Utility Classes

```html
<!-- Font sizes -->
<p class="text-sm">Small text</p>
<h1 class="text-3xl">Heading</h1>

<!-- Font weights -->
<p class="font-normal">Regular weight</p>
<p class="font-semibold">Emphasis</p>

<!-- Line heights -->
<p class="leading-tight">Compact text</p>
<p class="leading-relaxed">Readable text</p>
```

---

## Shadow Tokens

### Elevation System

Shadows represent depth levels:

| Token | CSS Value | Usage |
|-------|-----------|-------|
| `sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Subtle elevation, buttons on hover |
| `md` | `0 4px 6px -1px rgba(...), 0 2px 4px -1px rgba(...)` | Cards, popovers |
| `lg` | `0 10px 15px -3px rgba(...), 0 4px 6px -2px rgba(...)` | Modals, dropdowns |
| `xl` | `0 20px 25px -5px rgba(...), 0 10px 10px -5px rgba(...)` | High-level overlays |

### Elevation Examples

```
sm:  Button hover state
md:  Card, popover, tooltip
lg:  Dropdown menu over content
xl:  Modal dialog, main overlay
```

### CSS Variable Names

```css
--vi-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--vi-shadow-md: 0 4px 6px -1px rgba(...), ...;
/* ... etc */
```

### Utility Classes

```html
<div class="shadow-md">Card shadow</div>
<div class="shadow-lg">Modal shadow</div>
```

---

## Border Tokens

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `none` | `0` | No rounding |
| `sm` | `2px` | Slight rounding |
| `md` | `4px` | Default rounding |
| `lg` | `8px` | Large rounding |
| `xl` | `12px` | Extra large rounding |
| `full` | `9999px` | Circular (pills) |

### Border Width

| Token | Value | Usage |
|-------|-------|-------|
| `none` | `0` | No border |
| `thin` | `1px` | Subtle borders |
| `base` | `2px` | Standard borders |
| `thick` | `4px` | Prominent borders |

### CSS Variable Names

```css
--vi-border-radius-sm: 2px;
--vi-border-radius-md: 4px;
/* ... etc */
```

### Utility Classes

```html
<!-- Radius -->
<div class="rounded-sm">Slightly rounded</div>
<div class="rounded-lg">Large radius</div>
<div class="rounded-full">Circular</div>

<!-- Borders -->
<div class="border-thin border-primary">Thin blue border</div>
<div class="border-base border-neutral-300">Standard gray border</div>
```

---

## Z-Index Tokens

### Stacking Context Layers

| Token | Value | Usage |
|-------|-------|-------|
| `hide` | `-1` | Hidden elements |
| `auto` | `auto` | Default stacking |
| `base` | `0` | Normal layer |
| `dropdown` | `1000` | Dropdowns, menus |
| `sticky` | `1020` | Sticky headers |
| `fixed` | `1030` | Fixed headers/footers |
| `backdrop` | `1040` | Modal backdrops |
| `modal` | `1050` | Modal dialogs |
| `popover` | `1060` | Popovers, tooltips above modals |
| `tooltip` | `1070` | Tooltips (highest normal) |

### Safe Increments

The 10-point increments (1000, 1020, 1030, etc.) allow for edge cases without recreating the hierarchy.

### Utility Classes

```html
<div class="z-dropdown">Dropdown menu</div>
<div class="z-modal">Modal dialog</div>
<div class="z-tooltip">Tooltip (topmost)</div>
```

---

## Breakpoint Tokens

### Responsive Break Points (Mobile First)

| Name | Value | Device Type | Usage |
|------|-------|-------------|-------|
| `xs` | `0px` | Mobile (default) | Base styles |
| `sm` | `640px` | Small tablet | Small tablets, large phones |
| `md` | `768px` | Tablet (vertical) | Medium tablets |
| `lg` | `1024px` | Tablet (horizontal) | Large tablets |
| `xl` | `1280px` | Desktop | Desktop displays |
| `2xl` | `1536px` | Large desktop | Ultra-wide displays |

### Mobile-First Approach

- Default: Mobile styles
- `@media (min-width: 640px)`: Tablet adjustments
- `@media (min-width: 1024px)`: Desktop layout

### SCSS Usage

```scss
@import '@vi/flux-ui/styles/variables';

.container {
  width: 100%;  // Mobile: full width

  @media (min-width: $breakpoint-md) {
    width: 90%;
  }

  @media (min-width: $breakpoint-lg) {
    width: 80%;
    max-width: 1200px;
  }
}
```

### Utility Classes (Future)

```html
<!-- Responsive classes (to be implemented) -->
<div class="hidden md:block">Visible on tablets and up</div>
<div class="text-sm md:text-base lg:text-lg">Responsive text size</div>
```

---

## Token Access Patterns

### Pattern 1: TypeScript Import (Type-Safe)

```typescript
import { tokens } from '@vi/flux-ui';

// Direct access
const buttonPadding = tokens.spacing.md;    // 'var(--vi-spacing-md)'
const buttonColor = tokens.colors.primary;  // 'var(--vi-color-primary)'

// In inline styles
const style = {
  padding: tokens.spacing.md,
  backgroundColor: tokens.colors.primary,
  color: 'white'
};
```

**Advantages:**
- ✅ Type-safe (IDE autocomplete, TypeScript validation)
- ✅ Refactoring support (rename token = update everywhere)
- ✅ Values resolve to CSS variables at runtime

### Pattern 2: SCSS Import (Build-Time)

```scss
@import '@vi/flux-ui/styles/variables';

.button {
  padding: $spacing-sm $spacing-md;     // Direct values: 16px 24px
  background-color: $color-primary;     // Direct value: #0066cc
  border-radius: $border-radius-md;     // Direct value: 4px
}

// Or use in calculations
.input {
  padding: $spacing-sm * 0.75;          // 12px (8px × 0.75)
}

// Generate utilities
@each $name, $value in $color-map {
  .bg-#{$name} {
    background-color: $value;
  }
}
```

**Advantages:**
- ✅ Compile-time optimization
- ✅ Can be used in calculations/functions
- ✅ Mixin/loop generation possible
- ✅ No runtime overhead

### Pattern 3: CSS Custom Properties (Runtime)

```css
.button {
  padding: var(--vi-spacing-sm) var(--vi-spacing-md);
  background-color: var(--vi-color-primary);
  border-radius: var(--vi-border-radius-md);
}
```

```javascript
// Access in JavaScript
const root = document.documentElement;
const primaryColor = getComputedStyle(root).getPropertyValue('--vi-color-primary');

// Change theme at runtime
root.style.setProperty('--vi-color-primary', '#FF6B35');
```

**Advantages:**
- ✅ Runtime themeable
- ✅ Inherited by child elements
- ✅ No build step
- ✅ Can override per element

---

## Token Maintenance

### Adding a New Token

1. **Define in SCSS:** `src/styles/_variables.scss`
2. **Export in TS:** `src/tokens/index.ts`
3. **Add CSS var:** `:root` block in `_variables.scss`
4. **Document:** Update this file with token details
5. **Use:** Components import and reference the token

### Deprecating a Token

1. Mark in comment: `// @deprecated Use spacing.md instead`
2. Create alias for backward compatibility
3. Notify all teams
4. Remove in next major version

---

## Best Practices

### DO ✅

- ✅ Use tokens from this specification
- ✅ Combine tokens for semantics (e.g., `spacing.md` + `spacing.sm`)
- ✅ Override tokens in theme files only
- ✅ Use CSS variables for runtime customization
- ✅ Use SCSS variables in component styles
- ✅ Use TS tokens in component code

### DON'T ❌

- ❌ Hardcode colors: `background: #0066cc;` → Use `$color-primary`
- ❌ Hardcode spacing: `margin: 16px;` → Use `$spacing-sm`
- ❌ Create new tokens without discussion
- ❌ Override tokens everywhere (only in theme files)
- ❌ Mix token types inconsistently

---

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Total Tokens:** 95+ (colors, spacing, typography, shadows, borders, z-indexes, breakpoints)
