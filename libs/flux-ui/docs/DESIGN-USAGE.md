# Flux UI - Developer Usage Guide
**Complete Guide to Design Tokens, Theming, and Extensibility**

---

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Design Tokens](#design-tokens)
3. [Utility Classes](#utility-classes)
4. [Theming System](#theming-system)
5. [Theme Extensibility](#theme-extensibility)
6. [Integration Patterns](#integration-patterns)
7. [Advanced Usage](#advanced-usage)
8. [Troubleshooting](#troubleshooting)

---

## Installation & Setup

### NPM Installation

```bash
npm install @vi/flux-ui
# or
yarn add @vi/flux-ui
# or
pnpm add @vi/flux-ui
```

### Monorepo Usage (Local)

The library is configured in `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@vi/flux-ui": ["libs/flux-ui/src/index.ts"],
      "@vi/flux-ui/tokens": ["libs/flux-ui/src/tokens/index.ts"],
      "@vi/flux-ui/styles": ["libs/flux-ui/src/styles/index.ts"]
    }
  }
}
```

**No additional setup needed!** All imports work immediately.

---

## Design Tokens

Design tokens are centralized values (colors, spacing, typography) exported in three formats: **TypeScript, SCSS, and CSS**.

### 1. TypeScript Usage (Type-Safe)

```typescript
import { tokens } from '@vi/flux-ui';

// Color tokens
const primaryColor = tokens.colors.primary;           // "var(--vi-color-primary)"
const successColor = tokens.colors.success;           // "var(--vi-color-success)"
const neutralGrey = tokens.colors.neutral[600];       // "var(--vi-color-grey-600)"

// Palette colors
const blue500 = tokens.colors.palettes.blue[500];     // "var(--vi-color-blue-500)"
const red700 = tokens.colors.palettes.red[700];       // "var(--vi-color-red-700)"

// Spacing
const spacingMedium = tokens.spacing.md;              // "var(--vi-spacing-md)"
const spacingLarge = tokens.spacing.lg;               // "var(--vi-spacing-lg)"

// Typography
const fontSize = tokens.typography.fontSize.lg;       // "var(--vi-font-size-lg)"
const fontWeight = tokens.typography.fontWeight.bold; // 700 (raw number)
const lineHeight = tokens.typography.lineHeight.normal; // 1.5 (raw number)

// Shadows
const shadowMedium = tokens.shadows.md;               // "var(--vi-shadow-md)"

// Borders
const borderRadius = tokens.borders.radius.md;        // "var(--vi-border-radius-md)"
const borderWidth = tokens.borders.width.base;        // "var(--vi-border-width-base)"

// Breakpoints & Z-Index (raw values for @media, z-index)
const breakpoint = tokens.breakpoints.md;              // "768px"
const zIndex = tokens.zIndex.modal;                    // 1050
```

**Key Insight:** Token values are **CSS variable references** (strings like `"var(--vi-color-primary)"`) except for raw values (font-weight, line-height, z-index, breakpoints).

### 2. SCSS Usage (Build-Time)

```scss
@use '@vi/flux-ui/styles/_variables.scss' as *;

// SCSS variables (already include var() fallback)
$primary: $color-primary;                    // var(--vi-color-primary, #0066cc)
$spacing: $spacing-md;                       // var(--vi-spacing-md, 24px)
$fontBase: $font-size-base;                  // var(--vi-font-size-base, 16px)

// Maps for looping
@each $name, $value in $color-map {
  .text-#{$name} { color: $value; }
}

@each $size, $value in $spacing-map {
  .p-#{$size} { padding: $value; }
}

// Full power: variables + maps + calculations
.button {
  padding: $spacing-sm $spacing-md;
  background-color: $color-primary;
  border-radius: $border-radius-md;
  font-weight: $font-weight-semibold;
  box-shadow: $shadow-md;
  
  // Hover state
  &:hover {
    opacity: 0.9;
  }
}
```

### 3. CSS Usage (Runtime)

```css
:root {
  /* All CSS custom properties defined automatically */
  --vi-color-primary: #0066cc;
  --vi-spacing-md: 24px;
  --vi-font-size-lg: 18px;
  /* ... ~98 total properties */
}

.my-element {
  color: var(--vi-color-primary);
  padding: var(--vi-spacing-md);
  font-size: var(--vi-font-size-lg);
}
```

### Usage by Framework

#### **Angular**

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { tokens } from '@vi/flux-ui';

@Component({
  selector: 'app-root',
  template: `<div [style.color]="primaryColor">Hello</div>`
})
export class AppComponent {
  primaryColor = tokens.colors.primary; // "var(--vi-color-primary)"
}
```

```scss
// app.component.scss
@use '@vi/flux-ui/styles/variables' as *;

:host {
  padding: $spacing-lg;
  background: $color-background;
}

.title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-foreground;
}
```

#### **React**

```typescript
// App.tsx
import { tokens } from '@vi/flux-ui';
import '@vi/flux-ui/flux-ui.css';

function App() {
  return (
    <div style={{ color: tokens.colors.primary }}>
      <h1 className="text-3xl font-bold">Welcome</h1>
      <button className="bg-primary text-grey-100 p-md rounded-md">
        Click Me
      </button>
    </div>
  );
}
```

#### **Web Components (Lit)**

```typescript
// my-component.ts
import { LitElement, css, html } from 'lit';
import '@vi/flux-ui/flux-ui.css';
import { tokens } from '@vi/flux-ui';

export class MyComponent extends LitElement {
  static styles = css`
    :host {
      color: var(--vi-color-foreground);
      padding: var(--vi-spacing-md);
    }
  `;

  render() {
    return html`
      <div class="flex gap-md">
        <h1 class="text-2xl font-bold">Title</h1>
      </div>
    `;
  }
}
```

---

## Utility Classes

Pre-built CSS classes for common styling patterns.

### Layout Utilities

```html
<!-- Flexbox -->
<div class="flex justify-center items-center gap-md">
  <span>Centered content with gap</span>
</div>

<!-- Flex direction -->
<div class="flex flex-col gap-lg">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<!-- Flex alignment -->
<div class="flex justify-between items-start">
  <div>Left</div>
  <div>Right</div>
</div>

<!-- Gap spacing -->
<div class="flex gap-sm">Small gap</div>
<div class="flex gap-lg">Large gap</div>
```

### Spacing Utilities

```html
<!-- Margin -->
<div class="m-lg">All sides: 32px</div>
<div class="mx-md">Left & right: 24px</div>
<div class="mt-sm">Top only: 16px</div>
<div class="mb-xl">Bottom only: 40px</div>

<!-- Padding -->
<div class="p-md">All sides: 24px</div>
<div class="px-lg py-sm">X: 32px, Y: 16px</div>
<div class="pt-lg pr-md pb-sm pl-xs">Specific sides</div>
```

### Typography Utilities

```html
<!-- Font size -->
<h1 class="text-3xl">Large heading</h1>
<p class="text-base">Body text</p>
<small class="text-xs">Small text</small>

<!-- Font weight -->
<p class="font-light">Light (300)</p>
<p class="font-normal">Normal (400)</p>
<p class="font-bold">Bold (700)</p>

<!-- Line height -->
<p class="leading-tight">Tight spacing</p>
<p class="leading-relaxed">Relaxed spacing</p>

<!-- Text alignment -->
<p class="text-left">Left aligned</p>
<p class="text-center">Centered</p>
<p class="text-right">Right aligned</p>
```

### Color Utilities

```html
<!-- Semantic colors -->
<div class="text-primary">Primary text</div>
<div class="bg-success text-grey-100">Success background</div>
<div class="border-error">Error border</div>

<!-- Palette colors -->
<div class="text-blue-600">Blue text</div>
<div class="bg-red-100">Light red background</div>
<div class="border-green-500">Green border</div>

<!-- Neutral (grey) -->
<div class="text-neutral-500">Neutral text</div>
<div class="bg-neutral-100">Light neutral background</div>
```

### Visual Utilities

```html
<!-- Shadows -->
<div class="shadow-sm">Subtle shadow</div>
<div class="shadow-lg">Strong shadow</div>

<!-- Border radius -->
<div class="rounded-sm">Slight curve</div>
<div class="rounded-md">Medium curve</div>
<div class="rounded-full">Circle</div>

<!-- Border width -->
<div class="border-thin border-primary">1px border</div>
<div class="border-base border-error">2px border</div>

<!-- Opacity -->
<div class="opacity-50">50% visible</div>
<div class="opacity-0">Hidden</div>

<!-- Display -->
<div class="block">Block display</div>
<span class="inline">Inline text</span>
<span class="inline-block">Inline block</span>
<div class="hidden">Hidden from view</div>

<!-- Z-index -->
<div class="z-modal">Modal window</div>
<div class="z-dropdown">Dropdown menu</div>
<div class="z-tooltip">Tooltip</div>
```

### Complete Component Examples

```html
<!-- Button -->
<button class="px-md py-sm bg-primary text-grey-100 font-semibold rounded-md shadow-md">
  Click Me
</button>

<!-- Card -->
<div class="bg-grey-100 border-thin border-neutral-300 rounded-lg p-lg shadow-md">
  <h2 class="text-2xl font-bold text-primary mb-md">Card Title</h2>
  <p class="text-neutral-600 leading-relaxed">Card content goes here...</p>
</div>

<!-- Form Input -->
<div class="flex flex-col gap-sm">
  <label class="text-sm font-medium text-foreground">Email</label>
  <input class="border-thin border-neutral-300 rounded-md px-md py-sm text-base" />
</div>

<!-- Grid Layout -->
<div class="grid grid-cols-3 gap-lg p-lg">
  <div class="bg-neutral-100 p-md rounded-md">Item 1</div>
  <div class="bg-neutral-100 p-md rounded-md">Item 2</div>
  <div class="bg-neutral-100 p-md rounded-md">Item 3</div>
</div>
```

---

## Theming System

Flux UI includes a complete light/dark theming system with semantic tokens for component-level customization.

### Understanding Themes

**What are Themes?**

Themes are token maps that override default design values for different visual contexts (light mode, dark mode, brand variants, etc.).

```scss
// Light Theme: optimized for light backgrounds
$vi-theme--light: (
  'text-primary': $color-grey-900,    // Dark text on light (good contrast)
  'bg-primary': $color-grey-100,      // Light background
  'button-primary-bg': $color-blue-600,
  'input-bg': #ffffff,
  'card-bg': #ffffff,
  // ... 40+ semantic tokens
)

// Dark Theme: optimized for dark backgrounds
$vi-theme--dark: (
  'text-primary': $color-grey-100,    // Light text on dark
  'bg-primary': $color-grey-900,      // Dark background
  'button-primary-bg': $color-blue-500, // Slightly lighter for dark
  'input-bg': $color-grey-800,
  'card-bg': $color-grey-900,
  // ... overrides for dark adaptation
)
```

### 1. SCSS-Based Theming (Build-Time)

```scss
// In your component or global styles
@use '@vi/flux-ui/styles/variables' as *;
@use '@vi/flux-ui/styles/theme' as theme;

// Apply light theme globally
:root {
  @include theme.vi-theme($theme.$vi-theme--light);
}

// Apply dark theme when user prefers it
@media (prefers-color-scheme: dark) {
  :root {
    @include theme.vi-theme($theme.$vi-theme--dark);
  }
}
```

**Advantages:**
- ✅ Works at compile time
- ✅ Smallest bundle impact
- ✅ No JavaScript required

### 2. CSS Custom Property Theming (Runtime)

All theme tokens are available as CSS custom properties:

```css
:root {
  /* Light theme (default) */
  --vi-color-primary: #0066cc;
  --vi-color-background: #ffffff;
}

/* Override for dark theme */
@media (prefers-color-scheme: dark) {
  :root {
    --vi-color-primary: #60a5fa;
    --vi-color-background: #111827;
  }
}
```

### 3. HTML data-attribute Theming (Easy JavaScript Toggle)

```html
<!-- In your HTML -->
<html data-theme="light">
  <!-- Your app -->
</html>
```

```scss
// In SCSS
:root[data-theme="light"] {
  @include theme.vi-theme($vi-theme--light);
}

:root[data-theme="dark"] {
  @include theme.vi-theme($vi-theme--dark);
}
```

```typescript
// In JavaScript
// Toggle theme
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  
  // Optional: persist to localStorage
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// Load saved theme on page load
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }
}
```

### 4. Programmatic CSS Variable Updates (Advanced)

```typescript
// Update a single token at runtime
function setPrimaryColor(color: string) {
  document.documentElement.style.setProperty('--vi-color-primary', color);
}

// Update multiple tokens
function applyCustomBranding() {
  const root = document.documentElement;
  root.style.setProperty('--vi-color-primary', '#ff6b35');
  root.style.setProperty('--vi-color-secondary', '#004e89');
  root.style.setProperty('--vi-font-family-base', 'Georgia, serif');
}

// Reset to defaults
function resetTheme() {
  document.documentElement.removeAttribute('style');
}
```

---

## Theme Extensibility

Extend and customize the theme system to support brand-specific values and additional themes.

### 1. Creating Custom Themes

**Define your own theme map:**

```scss
// In your project: src/styles/_custom-themes.scss

@use '@vi/flux-ui/styles/variables' as *;

// Brand theme (for your company colors)
$theme-brand: (
  'text-primary': #2c3e50,      // Your brand dark color
  'bg-primary': #ecf0f1,        // Your brand light color
  'button-primary-bg': #e74c3c, // Your brand red
  'button-primary-text': #ffffff,
  'input-border': #bdc3c7,
  'card-bg': #ffffff,
  'focus-ring': #3498db,
  // ... add more as needed
);

// High contrast theme (accessibility)
$theme-high-contrast: (
  'text-primary': #000000,      // Pure black for max contrast
  'bg-primary': #ffffff,        // Pure white
  'button-primary-bg': #000000,
  'button-primary-text': #ffff00, // High contrast yellow
  'input-border': #000000,      // Bold borders
  'card-bg': #ffffff,
  // ...
);
```

**Apply in your app:**

```scss
// In your global styles
:root {
  @include theme.vi-theme($theme-brand);
}

:root[data-theme="high-contrast"] {
  @include theme.vi-theme($theme-high-contrast);
}
```

### 2. Extending Default Themes

**Build on light/dark but customize specific tokens:**

```scss
@use 'sass:map';
@use '@vi/flux-ui/styles/variables' as *;
@use '@vi/flux-ui/styles/theme' as theme;

// Start with light theme, override button colors
$custom-light: map.merge($theme.$vi-theme--light, (
  'button-primary-bg': #e74c3c,  // Use brand red instead of blue
  'button-primary-text': #ffffff,
  'button-secondary-bg': #95a5a6, // Use gray instead of default
));

:root {
  @include theme.vi-theme($custom-light);
}
```

### 3. Component-Level Theme Overrides

**Apply theme to specific component selector:**

```scss
// In button.component.scss (Angular example)
@use '@vi/flux-ui/styles/variables' as *;
@use '@vi/flux-ui/styles/theme' as theme;

// Define theme for this specific button component
$button-dark-theme: (
  'button-bg': $color-grey-900,
  'button-text': $color-grey-100,
  'button-border': $color-grey-700,
);

:host {
  @include theme.vi-theme($button-dark-theme);
}

:host([variant="dark"]) {
  @include theme.vi-theme($button-dark-theme);
}

:host([variant="light"]) {
  @include theme.vi-theme($theme.$vi-theme--light);
}
```

### 4. Runtime Theme API (Future)

**Planned for Phase 2 (not yet implemented):**

```typescript
// Not yet available, but future API design:

import { ThemeController } from '@vi/flux-ui/theme';

const controller = new ThemeController();

// Get current theme
const currentTheme = controller.getTheme(); // "light"

// Set theme
controller.setTheme('dark');
controller.setTheme('brand');

// Get available themes
const themes = controller.getAvailableThemes(); // ["light", "dark", "brand", "high-contrast"]

// Add custom theme at runtime
controller.registerTheme('my-custom', {
  'text-primary': '#123456',
  'button-primary-bg': '#abcdef',
  // ...
});

// Apply theme with animation
controller.setTheme('dark', { animate: true, duration: 300 });

// Listen to theme changes
controller.onThemeChange((newTheme) => {
  console.log(`Theme changed to: ${newTheme}`);
});

// Save to localStorage
controller.persistToLocalStorage('my-app-theme');
```

**Status:** Under design. Community feedback welcome!

### 5. Semantic Token Reference

**Available theme tokens for customization:**

```scss
// Color tokens (text, backgrounds, borders)
'text-primary'
'text-secondary'
'text-tertiary'
'text-inverse'
'text-success'
'text-warning'
'text-error'
'text-info'

'bg-primary'
'bg-secondary'
'bg-tertiary'
'bg-inverse'
'bg-success'
'bg-warning'
'bg-error'
'bg-info'

// Layer/depth tokens
'layer-01'        // Surface
'layer-02'        // Raised
'layer-03'        // Elevated
'layer-hover'     // Hover state background
'layer-active'    // Active state background

// Border tokens
'border-default'
'border-strong'
'border-subtle'

// Focus/interaction
'focus-ring'
'hover-overlay'
'active-overlay'

// Component-specific
'button-primary-bg'
'button-primary-text'
'button-secondary-bg'
'button-secondary-text'
'button-danger-bg'
'button-danger-text'

'input-bg'
'input-text'
'input-border'
'input-placeholder'
'input-focus-ring'

'card-bg'
'card-border'
```

---

## Integration Patterns

Choose the pattern that best fits your use case.

### Pattern 1: SCSS Consumer (Recommended for Angular/Nx)

**Best for:** Angular apps, Server-Side Rendering, build-time optimization

**Setup:**

```scss
// In your app/src/styles.scss (or global styles)

// 1. Import Flux UI styles
@use '@vi/flux-ui/styles/_variables.scss' as *;
@use '@vi/flux-ui/styles/_reset.scss';
@use '@vi/flux-ui/styles/_layout.scss';
@use '@vi/flux-ui/styles/_utilities.scss';

// 2. Define your themes
@use './custom-themes.scss' as custom;

:root {
  @include vi-theme(custom.$theme-brand);
}

@media (prefers-color-scheme: dark) {
  :root {
    @include vi-theme(custom.$theme-dark);
  }
}

// 3. In your components, use tokens
// In button.component.scss:
@use '@vi/flux-ui/styles/variables' as *;

.button {
  padding: $spacing-sm $spacing-md;
  background-color: $color-primary;
  border-radius: $border-radius-md;
  // ...
}
```

**Advantages:**
- ✅ Tree-shaking: Only include styles you use
- ✅ Variables: Full SCSS variable access
- ✅ Theming: @include mixins for custom scopes
- ✅ Smallest bundle: Only compiled styles needed

**Bundle Size:** Typically 5-15 KB (utilities only)

---

### Pattern 2: CSS-Only Consumer (Plain HTML)

**Best for:** Static sites, CDN delivery, Shadow DOM, Storybook

**Setup:**

```html
<!-- In your HTML <head> -->
<link rel="stylesheet" href="./node_modules/@vi/flux-ui/flux-ui.css" />

<!-- Or import in JS -->
<script>
  import '@vi/flux-ui/flux-ui.css';
</script>

<!-- Now all utilities available via classes -->
<div class="flex justify-center items-center gap-md p-lg">
  <h1 class="text-3xl font-bold text-primary">Hello</h1>
  <button class="px-md py-sm bg-success text-grey-100 rounded-md">
    Action
  </button>
</div>
```

**Advantages:**
- ✅ Zero build step
- ✅ Works anywhere (iframes, Shadow DOM, etc.)
- ✅ CDN-friendly: Single CSS file
- ✅ Pre-compiled: Fast delivery

**Bundle Size:** 29 KB (uncompressed), ~8 KB (gzipped)

---

### Pattern 3: Hybrid (TypeScript + CSS)

**Best for:** Web Components, modern frameworks

**Setup:**

```typescript
// my-component.ts
import '@vi/flux-ui/flux-ui.css';              // Import pre-compiled CSS
import { tokens } from '@vi/flux-ui';          // Import tokens for JS

export class MyComponent extends LitElement {
  static styles = css`
    :host {
      padding: var(--vi-spacing-md);
      color: var(--vi-color-foreground);
    }
  `;

  render() {
    return html`
      <div class="flex gap-md p-lg">
        <button style="background-color: ${tokens.colors.primary}">
          Click
        </button>
      </div>
    `;
  }
}
```

**Advantages:**
- ✅ Pre-compiled utilities
- ✅ Type-safe tokens
- ✅ Works with Web Components
- ✅ Best of both worlds

---

## Advanced Usage

### 1. Responsive Utilities (Future Feature)

**Coming in Phase 2:**

```html
<!-- Not yet available -->
<div class="sm:flex md:grid lg:grid-cols-3 gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### 2. Custom Token Calculation

**In SCSS:**

```scss
@use '@vi/flux-ui/styles/variables' as *;

// Create utilities from tokens
@each $name, $value in $spacing-map {
  .gap-double-#{$name} {
    gap: calc(#{$value} * 2);
  }
}

// Generates: .gap-double-md { gap: calc(24px * 2); } etc.
```

### 3. Conditional Styling

**Using CSS variables:**

```css
:root {
  --is-dark: 0; /* 0 = light, 1 = dark */
}

:root[data-theme="dark"] {
  --is-dark: 1;
}

/* Use calc() for conditional styles */
.element {
  background-color: hsl(
    0,
    0%,
    calc(100% * (1 - var(--is-dark, 0)) + 10% * var(--is-dark, 0))
  );
}
```

### 4. Scoped Theming

**Apply different themes to different DOM regions:**

```html
<div class="region-light" data-theme="light">
  <!-- Uses light theme -->
  <div class="text-primary">Light theme text</div>
</div>

<div class="region-dark" data-theme="dark">
  <!-- Uses dark theme -->
  <div class="text-primary">Dark theme text (inverted)</div>
</div>
```

```scss
:root[data-theme="light"] {
  @include vi-theme($vi-theme--light);
}

:root[data-theme="dark"] {
  @include vi-theme($vi-theme--dark);
}
```

---

## Troubleshooting

### Issue: Tokens show as "var(...)" in output

**Problem:** You imported TypeScript tokens but expected a string value.

```typescript
// ❌ Wrong: prints "var(--vi-color-primary)"
console.log(tokens.colors.primary);

// ✅ Correct: use in CSS context
element.style.color = tokens.colors.primary;
```

**Solution:** Token values are CSS variable references. Use them in CSS/HTML, not as JavaScript strings.

---

### Issue: SCSS variables not available in component

**Problem:** Forgot to import variables in component SCSS.

```scss
// ❌ Wrong: $spacing-md is undefined
.component { padding: $spacing-md; }

// ✅ Correct: import first
@use '@vi/flux-ui/styles/variables' as *;
.component { padding: $spacing-md; }
```

---

### Issue: Theme not switching

**Problem:** CSS not compiled with theme support, or data-theme attribute not set.

```html
<!-- ❌ Wrong: forgot data-theme -->
<html>
  <!-- theme won't switch -->
</html>

<!-- ✅ Correct: set data-theme -->
<html data-theme="light">
  <!-- theme will respect CSS rules -->
</html>

<!-- ✅ Or use @media -->
<html>
  <!-- respects prefers-color-scheme: dark -->
</html>
```

---

### Issue: Utilities not applying

**Problem:** CSS not loaded or wrong import method.

```typescript
// ❌ Wrong: forgot to import CSS
// No .flex, .p-md classes available

// ✅ Correct: import CSS first
import '@vi/flux-ui/flux-ui.css';
```

---

### Issue: Build failing with SCSS

**Problem:** Missing SCSS import path.

```scss
// ❌ Wrong: relative path
@use '../../../node_modules/@vi/flux-ui/styles/variables.scss' as *;

// ✅ Correct: use module path
@use '@vi/flux-ui/styles/_variables.scss' as *;
```

---

## FAQ

### Q: Can I use both SCSS and CSS imports?

**A:** Yes! You can mix patterns:

```typescript
// Import TypeScript tokens
import { tokens } from '@vi/flux-ui';

// Import pre-compiled CSS for utilities
import '@vi/flux-ui/flux-ui.css';

// Use SCSS in component
// @use '@vi/flux-ui/styles/_variables.scss' as *;
```

### Q: How do I customize colors for my brand?

**A:** Create a custom theme map:

```scss
$my-brand-theme: (
  'button-primary-bg': #ff6b35,
  'text-primary': #004e89,
  // ... other overrides
);

:root {
  @include vi-theme($my-brand-theme);
}
```

### Q: Does it work with Tailwind CSS?

**A:** Flux UI is designed as a **replacement** for utility frameworks like Tailwind. Using both is not recommended (conflicting utilities).

### Q: Can I extend tokens at runtime?

**A:** CSS variables support runtime updates:

```typescript
document.documentElement.style.setProperty(
  '--vi-color-primary',
  '#newcolor'
);
```

Full **ThemeController API** coming in Phase 2.

### Q: What about CSS-in-JS frameworks?

**A:** Works with emotion, styled-components, etc.:

```typescript
import { tokens } from '@vi/flux-ui';
import styled from 'styled-components';

const Button = styled.button`
  color: ${tokens.colors.primary};
  padding: ${tokens.spacing.md};
`;
```

---

## Resources

- **[Current State Analysis](./CURRENT-STATE-ANALYSIS.md)** - Project status and roadmap
- **[ADR-001: Component Library Strategy](./ADR-001-component-library-strategy.md)** - Architecture decisions
- **[README.md](../README.md)** - Quick start and feature overview

---

**Generated:** March 26, 2026  
**Version:** 1.0.0  
**Last Updated:** March 26, 2026
