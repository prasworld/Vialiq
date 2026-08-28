---
name: Design System Token Architecture
description: Strict guidelines for using colors, spacing, and CSS custom properties within Web Components to ensure themeability and consumer overrides.
---

# Design System Token Architecture

When writing or modifying SCSS files for components in this project, you **MUST** follow this exact 3-level cascade pattern.

## 1. NEVER Use Raw Values or Palette Tokens
- **NO hex codes**: (e.g., `#fff`, `#111827`).
- **NO raw palette tokens**: (e.g., `tokens.$color-grey-50`, `tokens.$color-blue-100`).
- **NO manual base CSS variables**: (e.g., `var(--vi-layer-01)`).

## 2. ALWAYS Use Semantic SASS Tokens
You must use semantic SASS tokens (e.g., `tokens.$layer-01`, `tokens.$text-primary`, `tokens.$spacing-sm`). These tokens natively compile into the global CSS cascade.

**CRITICAL**: If a semantic SASS token does not exist for your specific use-case, **DO NOT** fallback to using a raw palette color. You **MUST** define a new semantic SASS token in `libs/flux-ui/styles/_variables.scss` and map it to a palette color in `libs/flux-ui/styles/_theme.scss`.

## 3. ALWAYS Wrap with Component-Level CSS Variables
Every usage of a semantic token (including colors, padding, gap, font-size) **MUST** be wrapped in a local, component-specific CSS variable to expose it as a public API for consumers to override.

### ✅ Correct Usage Example
```scss
// Level 1: Consumer override (--vi-button-background-color)
// Level 2 & 3: Semantic token (tokens.$color-primary)
background-color: var(--vi-button-background-color, #{tokens.$color-primary});

// Spacing example
padding: var(--vi-tabs-padding-inline, #{tokens.$spacing-sm});
```

### ❌ Incorrect Usage (Do NOT do this)
```scss
// Wrong: Missing component-level CSS variable wrapper
background-color: #{tokens.$color-primary}; 

// Wrong: Using raw palette token
background-color: var(--vi-tabs-bg, #{tokens.$color-grey-50}); 

// Wrong: Using hardcoded hex
background-color: var(--vi-tabs-bg, #ffffff);
```
