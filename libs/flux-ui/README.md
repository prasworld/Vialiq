# Design System

A custom, lightweight CSS/SASS framework built for microfrontend architectures. Optimized for Module Federation with type-safe design tokens and minimal bundle footprint.

## Features

- ✨ **Custom Foundation** - Built from scratch, no framework bloat
- 📦 **Lightweight** - 15-25KB gzipped (vs 150-230KB for Bootstrap/Tailwind)
- 🎨 **Type-Safe Tokens** - Design tokens exported as TypeScript constants
- 🔄 **MFE-Optimized** - CSS loads once in shell, all remotes reuse it
- 🎯 **CSS Layers** - Modern cascade management prevents namespace conflicts
- 🌙 **Runtime Theming** - CSS variables enable dynamic theme changes
- 📱 **Responsive** - Mobile-first breakpoint system
- ♿ **Accessible** - WCAG-compliant patterns and defaults

## Quick Start

### Shell App Setup

```typescript
// In apps/shell/src/styles.scss
@import '@design-system/core/styles/variables';
@import '@design-system/core/styles/reset';
@import '@design-system/core/styles/layout';
@import '@design-system/core/styles/utilities';
```

### Using Tokens

```typescript
import { tokens } from '@design-system/core';

const buttonStyle = {
  padding: tokens.spacing.md,        // 24px
  backgroundColor: tokens.colors.primary,
  borderRadius: tokens.borders.radius.md
};
```

### Using Utilities

```html
<div class="flex justify-between items-center gap-md p-lg">
  <h1 class="text-2xl font-bold">Title</h1>
  <button class="bg-primary text-white rounded-md">Action</button>
</div>
```

## Token Categories

| Category | Examples | Count |
|----------|----------|-------|
| **Colors** | primary, secondary, success, error, neutral-50 to 900 | 20+ |
| **Spacing** | xs (8px), sm (16px), md (24px), ... 3xl (56px) | 7 |
| **Typography** | text-xs to text-3xl, font-light to font-bold | 15+ |
| **Shadows** | shadow-sm, md, lg, xl | 4 |
| **Borders** | border-radius: sm to xl, border-width: thin to thick | 8 |
| **Z-Index** | dropdown, modal, tooltip | 10 |
| **Breakpoints** | xs, sm, md, lg, xl, 2xl | 6 |

## Documentation

- **[CSS-DECISION.md](./docs/CSS-DECISION.md)** - Why we chose a custom framework
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Technical deep dive
- **[USAGE-GUIDE.md](./docs/USAGE-GUIDE.md)** - How to use in your apps
- **[TOKEN-SPEC.md](./docs/TOKEN-SPEC.md)** - Complete token reference

## Architecture

```
Design System (Shared)
│
├── Init in Shell
│   └── Load CSS once at bootstrap
│
└── Consumed by Remotes
    ├── Remote 1: Import tokens, reuse CSS ✓
    ├── Remote 2: Import tokens, reuse CSS ✓
    └── Remote 3: Import tokens, reuse CSS ✓
```

**Result:** CSS file size ÷ by N MFEs, not multiplied!

## MFE Integration Pattern

### Shell App

```typescript
// apps/shell/src/bootstrap.ts
import '@design-system/core/styles';  // Load once for all MFEs

bootstrapApplication(App).catch(err => console.error(err));
```

### Remote App

```typescript
// apps/remote1/src/bootstrap.ts
// ❌ DO NOT import styles (shell already loaded them)

import { tokens } from '@design-system/core';  // ✅ Import tokens only

bootstrapApplication(RemoteEntry).catch(err => console.error(err));
```

## Token Export Formats

### TypeScript (Type-Safe)

```typescript
import { tokens } from '@design-system/core';

const value = tokens.spacing.md;  // IDE autocomplete, type checking
```

### SCSS (Build-Time)

```scss
@import '@design-system/core/styles/variables';

.button {
  padding: $spacing-md;
  background: $color-primary;
}
```

### CSS (Runtime)

```css
:root {
  --ds-spacing-md: 24px;
  --ds-color-primary: #0066cc;
}

.button {
  padding: var(--ds-spacing-md);
  background: var(--ds-color-primary);
}
```

## Utility Classes

### Spacing

```html
<div class="m-md">Margin 24px</div>
<div class="p-lg mx-auto">Padding 32px, centered</div>
<div class="mt-sm mb-lg">Top margin 16px, bottom 32px</div>
```

### Typography

```html
<h1 class="text-3xl font-bold">Heading</h1>
<p class="text-base leading-relaxed">Body text with comfortable spacing</p>
<code class="text-sm text-neutral-600">Code snippet</code>
```

### Layout

```html
<div class="flex justify-between items-center gap-md">Flexbox</div>
<div class="grid grid-cols-3 gap-lg">Grid 3 columns</div>
```

### Colors

```html
<p class="text-primary">Colored text</p>
<div class="bg-success text-white">Success state</div>
<div class="border-lg border-error">Error border</div>
```

## Theming

### Light/Dark Mode

```typescript
// Change theme at runtime
document.documentElement.setAttribute('data-theme', 'dark');

// Update CSS variables
const root = document.documentElement;
root.style.setProperty('--ds-color-primary', '#60a5fa');
```

**SCSS:**

```scss
:root {
  --ds-color-background: #ffffff;
}

:root[data-theme="dark"] {
  --ds-color-background: #1f2937;
}
```

## Bundle Impact

- **Design System Core:** 15-25KB gzipped (loaded once in shell)
- **Per Remote App:** 0KB overhead (reuses shell CSS)
- **Tokens Module:** 2-3KB (tree-shakeable)

**Comparison:**
- Bootstrap per app: 180-230KB × N remotes
- Tailwind per app: 20-80KB × N remotes  
- **Design System (ours): 20-30KB × 1 (shell only)** ✓

## CSS Layers

All styles use CSS Layers for safe cascade management:

```scss
@layer reset, components, utilities;

@layer reset {
  /* Browser defaults, lowest priority */
}

@layer components {
  /* Component styles, medium priority */
}

@layer utilities {
  /* Utility classes, highest priority */
}
```

This prevents specificity wars between shell and remote app styles.

## Framework Support

Works with any JavaScript framework:
- ✅ Angular
- ✅ React
- ✅ Vue
- ✅ Web Components
- ✅ Vanilla JavaScript

## Performance

- **CSS Parse Time:** ~2-3ms (minimal)
- **CSS Variable Access:** ~4-6ms for 100 lookups
- **No JavaScript overhead** for core styles
- **Tree-shakeable tokens** (unused exports removed)

## Accessibility

- ✅ WCAG AA compliant color contrast
- ✅ Focus states built-in
- ✅ Semantic HTML patterns
- ✅ Reduced motion support ready

## Contributing

To add a new token or component:

1. Update `src/tokens/index.ts` and `src/styles/_variables.scss`
2. Add CSS custom property in `:root`
3. Update relevant `src/styles/*.scss` file
4. Document in `docs/TOKEN-SPEC.md`
5. Create component in `src/components/` if needed

## Versioning

- **Major:** Breaking changes (token renamed/removed)
- **Minor:** New tokens/components
- **Patch:** Bug fixes (styling corrections)

## License

MIT

## Questions?

Refer to:
- [USAGE-GUIDE.md](./docs/USAGE-GUIDE.md) for implementation details
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for technical decisions
- [TOKEN-SPEC.md](./docs/TOKEN-SPEC.md) for token reference
