# Vialiq Web Components — CSS Design System

> **Last Updated:** June 1, 2026  
> **Token source:** `libs/flux-ui/styles/_variables.scss`  
> **Theme source:** `libs/flux-ui/styles/_theme.scss`

This document is the authoritative reference for every CSS custom property exposed by `@vialiq/web-components`. It covers the three-level cascade strategy, all design tokens, per-component CSS APIs, and theming.

---

## Table of Contents

1. [Three-Level Cascade Strategy](#1-three-level-cascade-strategy)
2. [Design Tokens — Color](#2-design-tokens--color)
3. [Design Tokens — Spacing](#3-design-tokens--spacing)
4. [Design Tokens — Typography](#4-design-tokens--typography)
5. [Design Tokens — Shape & Elevation](#5-design-tokens--shape--elevation)
6. [Theme System](#6-theme-system)
7. [CSS Layers (`@layer`)](#7-css-layers-layer)
8. [Per-Component CSS API](#8-per-component-css-api)
   - [vi-button](#vi-button-css-api)
   - [vi-input](#vi-input-css-api)
   - [vi-textarea](#vi-textarea-css-api)
   - [vi-checkbox](#vi-checkbox-css-api)
   - [vi-radio / vi-radio-group](#vi-radio--vi-radio-group-css-api)
   - [vi-select](#vi-select-css-api)
   - [vi-switch](#vi-switch-css-api)
   - [vi-badge](#vi-badge-css-api)
   - [vi-tag](#vi-tag-css-api)
   - [vi-label](#vi-label-css-api)
   - [vi-spinner](#vi-spinner-css-api)
   - [vi-alert](#vi-alert-css-api)
   - [vi-tooltip](#vi-tooltip-css-api)
   - [vi-modal](#vi-modal-css-api)
   - [vi-date-picker](#vi-date-picker-css-api)
   - [vi-signature](#vi-signature-css-api)
9. [CSS Parts (`::part()`)](#9-css-parts-part)
10. [Focus Ring System](#10-focus-ring-system)
11. [Reduced Motion](#11-reduced-motion)
12. [Dark Theme](#12-dark-theme)
13. [Consuming Components — Override Examples](#13-consuming-components--override-examples)

---

## 1. Three-Level Cascade Strategy

Every CSS custom property in a Vialiq component follows the same three-level fallback chain:

```
var(--vi-{component}-{token}, #{tokens.$sass-token})
```

Which resolves at build-time to:
```
var(--vi-{component}-{token}, var(--vi-{semantic-token}, {compile-time-fallback}))
```

| Level | Who sets it | Example |
|-------|------------|---------|
| **Level 1 — Consumer override** | Application / study theme | `--vi-button-surface-primary-background-color: #005eb8` |
| **Level 2 — Theme token** | Flux UI theme (`:root`, `[data-theme]`) | `--vi-color-primary: #3676d0` |
| **Level 3 — Compile-time fallback** | Hard-coded SASS variable fallback | `tokens.$color-primary` (resolving to `#3676d0`) |

**Why three levels?**
- Level 1 lets a study-specific Angular shell override a single component's surface without affecting all components.
- Level 2 lets a global theme (light/dark/high-contrast) change all components at once.
- Level 3 ensures the component renders correctly even in environments without a CSS custom property runtime (server-side rendering, email, print).

**Example — Button primary background:**
```scss
// In vi-button.scss (inside flux-ui _button.scss):
background-color: var(
  --vi-button-surface-primary-background-color,   // Level 1
  #{tokens.$color-primary}                         // Level 2 & 3 (SASS token)
);
```

---

## 2. Design Tokens — Color

All colors in the design system are defined as semantic CSS custom properties. Do not use raw palette hex codes directly.

### 2.1 Brand & Status Colors

| Token | Default | Meaning |
|-------|---------|---------|
| `--vi-color-primary` | `#3676d0` | Brand primary interactive colour |
| `--vi-color-secondary` | `#f0f4f8` | Secondary surface / subtle bg |
| `--vi-color-success` | `#489167` | Success, valid, confirmed |
| `--vi-color-warning` | `#ffba00` | Warning, attention |
| `--vi-color-error` | `#ef4444` | Error, invalid, danger |
| `--vi-color-info` | `#3676d0` | Informational |

### 2.2 Functional Colors

| Token | Default | Meaning |
|-------|---------|---------|
| `--vi-color-background` | `#ffffff` | Page / panel background |
| `--vi-color-foreground` | `#111827` | Default body text color |
| `--vi-color-border` | `#e5e7eb` | Default border outline |

### 2.3 Semantic Text Colors

| Token | Default | Meaning |
|-------|---------|---------|
| `--vi-text-primary` | `#111827` | Primary text |
| `--vi-text-secondary` | `#4b5563` | Secondary text |
| `--vi-text-primary-inverse` | `#ffffff` | Primary text on dark backgrounds |
| `--vi-text-secondary-inverse` | `#d1d5db` | Secondary text on dark backgrounds |
| `--vi-text-inverse` | `#ffffff` | Inverse text |
| `--vi-text-disabled` | `#9e9e9e` | Disabled text |
| `--vi-text-helper` | `#9e9e9e` | Helper caption / fine print |

### 2.4 Layer Tokens (Surfaces)

Used for depth / elevation hierarchy of background surfaces.

| Token | Default | Meaning |
|-------|---------|---------|
| `--vi-layer-01` | `#ffffff` | Base page layer |
| `--vi-layer-02` | `#f3f4f6` | Card / panel background |
| `--vi-layer-03` | `#e5e7eb` | Nested section background |
| `--vi-layer-04` | `#d1d5db` | Deeply nested background |
| `--vi-layer-hover-01` | `#f3f4f6` | Hover state on layer-01 |
| `--vi-layer-hover-02` | `#e5e7eb` | Hover state on layer-02 |
| `--vi-layer-disabled` | `#f3f4f6` | Disabled surface background |
| `--vi-layer-inverse` | `#111827` | Dark inverse surface background |

### 2.5 Border Tokens

| Token | Default | Meaning |
|-------|---------|---------|
| `--vi-border-01` | `#f5f5f5` | Lightest division lines |
| `--vi-border-02` | `#eeeeee` | Secondary dividers |
| `--vi-border-03` | `#e0e0e0` | Stronger component borders |
| `--vi-border-04` | `#bdbdbd` | Focus / active indicators |

### 2.6 Focus & Outline Tokens

| Token | Default | Meaning |
|-------|---------|---------|
| `--vi-focus` | `#3676d0` | Focus ring outline color |
| `--vi-outline` | `#e5e7eb` | Resting component outlines |

---

## 3. Design Tokens — Spacing

All spacing tokens are multiples of an 8px base unit.

| Token | Default | Usage |
|-------|---------|-------|
| `--vi-spacing-xs` | `8px` | Icon gap, tight padding |
| `--vi-spacing-sm` | `16px` | Component internal padding |
| `--vi-spacing-md` | `24px` | Section gap |
| `--vi-spacing-lg` | `32px` | Layout gap |
| `--vi-spacing-xl` | `40px` | Section spacing |
| `--vi-spacing-2xl` | `48px` | Large layout gap |
| `--vi-spacing-3xl` | `56px` | Page-level spacing |

---

## 4. Design Tokens — Typography

### 4.1 Font Families

| Token | Default |
|-------|---------|
| `--vi-font-family-base` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| `--vi-font-family-mono` | `'Menlo', 'Monaco', 'Courier New', monospace` |

### 4.2 Font Sizes

| Token | Default | Role |
|-------|---------|------|
| `--vi-font-size-xs` | `12px` | Caption, fine print, validation |
| `--vi-font-size-sm` | `14px` | Small labels, helper text |
| `--vi-font-size-base` | `16px` | Body, form controls |
| `--vi-font-size-lg` | `18px` | Large controls, subheading |
| `--vi-font-size-xl` | `20px` | Section heading |
| `--vi-font-size-2xl` | `24px` | Page heading |
| `--vi-font-size-3xl` | `30px` | Display / hero |

### 4.3 Font Weights

| Token | Default | Usage |
|-------|---------|-------|
| `--vi-font-weight-light` | `300` | Display text only |
| `--vi-font-weight-normal` | `400` | Body, helper |
| `--vi-font-weight-medium` | `500` | Labels, secondary emphasis |
| `--vi-font-weight-semibold` | `600` | Buttons, headings |
| `--vi-font-weight-bold` | `700` | Strong emphasis |

### 4.4 Line Height & Letter Spacing

| Token | Default | Usage |
|-------|---------|-------|
| `--vi-line-height-tight` | `1.2` | Headings, buttons |
| `--vi-line-height-normal` | `1.5` | Body text |
| `--vi-line-height-relaxed` | `1.75` | Long-form content |
| `--vi-letter-spacing-tight` | `-0.01em` | Display headings |
| `--vi-letter-spacing-normal` | `0em` | Body |
| `--vi-letter-spacing-wide` | `0.025em` | Labels |
| `--vi-letter-spacing-wider` | `0.05em` | Validation messages |
| `--vi-letter-spacing-widest` | `0.1em` | Overline / all-caps |

---

## 5. Design Tokens — Shape & Elevation

### 5.1 Border Radius

| Token | Default | Usage |
|-------|---------|-------|
| `--vi-border-radius-sm` | `2px` | Tight corners (chips, tags) |
| `--vi-border-radius-md` | `4px` | Buttons, cards |
| `--vi-border-radius-lg` | `8px` | Inputs, panels |
| `--vi-border-radius-xl` | `12px` | Large cards, modals |
| `--vi-border-radius-full` | `9999px` | Pill badges, switches |

### 5.2 Border Width

| Token | Default | Usage |
|-------|---------|-------|
| `--vi-border-width-thin` | `1px` | Default borders |
| `--vi-border-width-base` | `2px` | Focus rings, emphasis |
| `--vi-border-width-thick` | `3px` | Active indicators |

### 5.3 Shadows (Elevation)

| Token | Default | Usage |
|-------|---------|-------|
| `--vi-shadow-sm` | `0 1px 2px 0 rgba(0,0,0,.05)` | Card resting |
| `--vi-shadow-md` | `0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)` | Dropdown, popover |
| `--vi-shadow-lg` | `0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)` | Modal, tooltip |
| `--vi-shadow-xl` | `0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)` | Floating panels |

### 5.4 Transitions

| Token | Default | Usage |
|-------|---------|-------|
| `--vi-transition-fast` | `100ms ease` | State changes (hover) |
| `--vi-transition-base` | `160ms ease` | Button press, toggle |
| `--vi-transition-slow` | `250ms ease` | Panel open/close |

---

## 6. Theme System

The Flux UI theme system is map-based. Themes are applied via the `vi-theme()` SCSS mixin which emits CSS custom properties.

### 6.1 Applying Themes

```scss
@use '@vialiq/flux-ui/styles/theme' as *;

// Light theme (default):
:root {
  @include vi-theme($vi-theme--light, $emit-custom-properties: true);
}

// Dark theme:
[data-theme="dark"] {
  @include vi-theme($vi-theme--dark, $emit-custom-properties: true, $emit-difference: true);
}
```

```html
<!-- Switch at runtime -->
<html data-theme="dark">
```

### 6.2 Study-Specific Theme Overrides

For clinical study branding (e.g. sponsor colour palette), override semantic tokens on a scoped wrapper:

```css
/* Sponsor: Novartis blue */
.novartis-theme {
  --vi-color-primary: #0460a9;
  --vi-color-primary-hover: #03498a;
}
```

Apply it by wrapping the study shell:
```html
<div class="novartis-theme">
  <vi-button variant="primary">Save</vi-button>
</div>
```

### 6.3 High-Contrast Mode

When `prefers-contrast: more` is active, components increase border widths and remove opacity-only disabled styling:

```css
@media (prefers-contrast: more) {
  :root {
    --vi-border-width-thin: 2px;
    --vi-border-width-base: 3px;
    --vi-outline: #000000;
    --vi-color-border: #000000;
  }
}
```

---

## 7. CSS Layers (`@layer`)

The library declares three explicit layers in order:

```scss
@layer reset, components, utilities;
```

| Layer | Priority | Contents |
|-------|----------|---------|
| `reset` | Lowest | Normalize / reset (margins, box-sizing, body defaults) |
| `components` | Middle | Component base styles from `flux-ui/components/` |
| `utilities` | Highest | Typography utility classes (`.vi-heading-xl`, etc.) |

Shadow DOM styles are outside the document's layer cascade — each component's `static styles` only affects its own shadow root and always wins over light-DOM rules.

---

## 8. Per-Component CSS API

Each component section lists:
- **Host CSS custom properties** — override at any ancestor level
- **CSS parts** — targeted via `vi-button::part(button)` from outside
- **Host states** — style the host itself (`:host([disabled])`, etc.)

---

### `vi-button` CSS API

#### Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-button-shape-border-radius` | `tokens.$border-radius-md` | Corner radius |
| `--vi-button-spacing-padding-block` | `tokens.$spacing-xs` / `tokens.$spacing-sm` / `tokens.$spacing-lg` | Vertical padding |
| `--vi-button-spacing-padding-inline` | `tokens.$spacing-xs` / `tokens.$spacing-md` / `tokens.$spacing-lg` | Horizontal padding |
| `--vi-button-typography-font-size` | `tokens.$font-size-base` | Label font size |
| `--vi-button-typography-font-weight` | `tokens.$font-weight-semibold` | Label font weight |
| `--vi-button-effect-transition-duration` | `160ms` | Hover/press transition |
| `--vi-button-surface-primary-background-color` | `tokens.$color-primary` | Primary bg |
| `--vi-button-surface-primary-text-color` | `tokens.$color-grey-100` | Primary label colour |
| `--vi-button-surface-secondary-background-color` | `tokens.$color-secondary` | Secondary bg |
| `--vi-button-surface-secondary-text-color` | `tokens.$color-foreground` | Secondary label |
| `--vi-button-surface-danger-background-color` | `tokens.$color-error` | Danger bg |
| `--vi-button-surface-ghost-background-color` | `transparent` | Ghost bg |
| `--vi-button-surface-ghost-text-color` | `tokens.$color-primary` | Ghost label |
| `--vi-button-icon-size` | `1em` | Icon slot size |
| `--vi-button-icon-gap` | `tokens.$spacing-xs` | Gap between icon and label |
| `--vi-button-disabled-opacity` | `0.6` | Opacity when disabled |

#### Host State Selectors

```css
vi-button[disabled]      { opacity: 0.5; pointer-events: none; }
vi-button[full-width]    { display: block; }
vi-button[size="xs"]     { /* xs padding/font overrides */ }
vi-button[size="sm"]     { /* sm padding/font overrides */ }
vi-button[size="lg"]     { /* lg padding/font overrides */ }
vi-button[icon-only]     { /* square aspect ratio */ }
vi-button[variant="ghost"] { /* transparent background */ }
```

#### Size Defaults

| Size | Padding block | Padding inline | Font size |
|------|--------------|---------------|-----------|
| `xs` | `2px` | `8px` | `12px` |
| `sm` | `4px` | `12px` | `14px` |
| `md` (default) | `8px` | `16px` | `16px` |
| `lg` | `12px` | `24px` | `18px` |

---

### `vi-input` CSS API

#### Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-input-border-color` | `tokens.$outline` | Border at rest |
| `--vi-input-border-color-hover` | `tokens.$text-secondary` | Border on hover |
| `--vi-input-focus-ring-color` | `tokens.$focus` | Focus outline |
| `--vi-input-focus-ring-glow` | `tokens.$color-blue-200` | Focus glow shadow |
| `--vi-input-background-color` | `tokens.$color-background` | Field background |
| `--vi-input-text-color` | `tokens.$text-primary` | Typed text |
| `--vi-input-placeholder-color` | `tokens.$text-secondary` | Placeholder text |
| `--vi-input-helper-color` | `tokens.$text-helper` | Helper text |
| `--vi-input-error-color` | `tokens.$color-error` | Error text |
| `--vi-input-success-color` | `tokens.$color-success` | Success text |
| `--vi-input-shape-border-radius` | `tokens.$border-radius-lg` | Corner radius |
| `--vi-input-sizing-min-height` | `40px` | Min field height |
| `--vi-input-spacing-padding-block` | `tokens.$spacing-xs` | Vertical padding |
| `--vi-input-spacing-padding-inline` | `tokens.$spacing-sm` | Horizontal padding |
| `--vi-input-typography-font-size` | `tokens.$font-size-base` | Input text size |
| `--vi-input-spacing-field-gap` | `tokens.$spacing-xs` | Gap: label→field→helper |

#### Host State Selectors (via reflected attributes)

```css
vi-input[status="invalid"]  { --vi-input-border-color: var(--vi-color-error); }
vi-input[status="valid"]    { --vi-input-border-color: var(--vi-color-success); }
vi-input[disabled]          { opacity: 0.6; pointer-events: none; }
vi-input[required]          { /* label asterisk via ::after in label */ }
```

---

### `vi-textarea` CSS API

Mirrors `vi-input` with additional properties for height, resizing, and character counter states:

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-textarea-min-height` | `96px` | Minimum rows height |
| `--vi-textarea-max-height` | `none` | Maximum height (scroll beyond) |
| `--vi-textarea-resize` | `vertical` | CSS resize axis: `none | vertical | both` |
| `--vi-textarea-char-counter-color` | `var(--vi-text-helper)` | Character count colour |
| `--vi-textarea-char-counter-warning-color` | `var(--vi-color-warning)` | Counter colour at 90% capacity |
| `--vi-textarea-char-counter-error-color` | `var(--vi-color-error)` | Counter colour at 100% |

All `--vi-input-*` tokens apply identically.

---

### `vi-checkbox` CSS API

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-checkbox-size` | `18px` | Box width/height |
| `--vi-checkbox-border-color` | `tokens.$outline` | Unchecked border |
| `--vi-checkbox-border-color-checked` | `tokens.$color-primary` | Checked border |
| `--vi-checkbox-background-checked` | `tokens.$color-primary` | Checked fill |
| `--vi-checkbox-check-color` | `tokens.$text-primary-inverse` | Check mark stroke |
| `--vi-checkbox-border-radius` | `3px` | Corner radius |
| `--vi-checkbox-focus-ring-color` | `tokens.$focus` | Focus ring |
| `--vi-checkbox-focus-ring-glow` | `tokens.$color-blue-200` | Focus glow |
| `--vi-checkbox-label-gap` | `8px` | Gap: box→label |
| `--vi-checkbox-label-font-size` | `tokens.$font-size-base` | Label size |
| `--vi-checkbox-disabled-opacity` | `0.5` | Disabled opacity |

Host state selectors:
```css
vi-checkbox[checked]       { /* checked visual */ }
vi-checkbox[indeterminate] { /* dash visual */ }
vi-checkbox[disabled]      { opacity: 0.5; cursor: not-allowed; }
vi-checkbox[status="invalid"] { --vi-checkbox-border-color: var(--vi-color-error); }
```

---

### `vi-radio` / `vi-radio-group` CSS API

#### `vi-radio`

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-radio-size` | `18px` | Outer circle diameter |
| `--vi-radio-dot-size` | `8px` | Inner dot diameter |
| `--vi-radio-border-color` | `tokens.$outline` | Unchecked ring |
| `--vi-radio-border-color-checked` | `tokens.$color-primary` | Checked ring |
| `--vi-radio-dot-color` | `tokens.$color-primary` | Inner dot fill |
| `--vi-radio-focus-ring-color` | `tokens.$focus` | Focus outline |
| `--vi-radio-focus-ring-glow` | `tokens.$color-blue-200` | Focus glow |
| `--vi-radio-label-gap` | `8px` | Gap: circle→label |
| `--vi-radio-disabled-opacity` | `0.5` | Disabled opacity |
| `--vi-radio-background-color` | `tokens.$color-background` | Base circle background |

#### `vi-radio-group`

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-radio-group-gap` | `tokens.$spacing-xs` | Gap between radio items |
| `--vi-radio-group-direction` | `column` | `column | row` layout |

---

### `vi-select` CSS API

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-select-border-color` | `tokens.$border-03` | Border at rest |
| `--vi-select-border-color-hover` | `tokens.$border-04` | Hover border |
| `--vi-select-focus-ring-color` | `tokens.$focus` | Focus ring |
| `--vi-select-background-color` | `tokens.$color-background` | Select background |
| `--vi-select-text-color` | `tokens.$color-foreground` | Selected text |
| `--vi-select-placeholder-color` | `tokens.$text-secondary` | Placeholder colour |
| `--vi-select-arrow-color` | `tokens.$text-secondary` | Chevron icon colour |
| `--vi-select-shape-border-radius` | `tokens.$border-radius-lg` | Corner radius |
| `--vi-select-sizing-min-height` | `40px` | Min height |
| `--vi-select-spacing-padding-block` | `tokens.$spacing-xs` | Vertical padding |
| `--vi-select-spacing-padding-inline` | `tokens.$spacing-sm` | Horizontal padding |

---

### `vi-switch` CSS API

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-switch-track-width` | `44px` | Track width |
| `--vi-switch-track-height` | `24px` | Track height |
| `--vi-switch-thumb-size` | `18px` | Thumb diameter |
| `--vi-switch-track-color-off` | `tokens.$border-03` | Off state track |
| `--vi-switch-track-color-on` | `tokens.$color-primary` | On state track |
| `--vi-switch-thumb-color` | `tokens.$text-primary-inverse` | Thumb fill |
| `--vi-switch-focus-ring-color` | `tokens.$focus` | Focus outline |
| `--vi-switch-label-gap` | `8px` | Gap: track→label |
| `--vi-switch-disabled-opacity` | `0.5` | Disabled opacity |
| `--vi-switch-transition-duration` | `200ms` | Thumb slide duration |

---

### `vi-badge` CSS API

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-badge-padding-block` | `2px` | Vertical padding |
| `--vi-badge-padding-inline` | `8px` | Horizontal padding |
| `--vi-badge-font-size` | `tokens.$font-size-xs` | Text size |
| `--vi-badge-font-weight` | `tokens.$font-weight-semibold` | Text weight |
| `--vi-badge-border-radius` | `tokens.$border-radius-full` | Pill radius |
| `--vi-badge-dot-size` | `8px` | Dot mode diameter |
| `--vi-badge-neutral-bg` | `tokens.$border-02` | Neutral bg |
| `--vi-badge-neutral-color` | `tokens.$text-secondary` | Neutral text |
| `--vi-badge-success-bg` | `tokens.$bg-success` | Success bg |
| `--vi-badge-success-color` | `tokens.$text-success` | Success text |
| `--vi-badge-warning-bg` | `tokens.$bg-warning` | Warning bg |
| `--vi-badge-warning-color` | `tokens.$text-warning` | Warning text |
| `--vi-badge-danger-bg` | `tokens.$bg-error` | Danger bg |
| `--vi-badge-danger-color` | `tokens.$text-error` | Danger text |
| `--vi-badge-info-bg` | `tokens.$bg-info` | Info bg |
| `--vi-badge-info-color` | `tokens.$text-info` | Info text |

---

### `vi-tag` CSS API

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-tag-height` | `28px` | Tag height |
| `--vi-tag-padding-inline` | `10px` | Horizontal padding |
| `--vi-tag-font-size` | `tokens.$font-size-xs` | Label font size |
| `--vi-tag-border-radius` | `tokens.$border-radius-sm` | Corner radius |
| `--vi-tag-gap` | `tokens.$spacing-xs` | Gap: label→remove button |
| `--vi-tag-background-color` | `tokens.$layer-02` | Background |
| `--vi-tag-text-color` | `tokens.$color-foreground` | Label colour |
| `--vi-tag-border-color` | `tokens.$border-03` | Border |
| `--vi-tag-remove-size` | `16px` | Remove button icon size |

---

### `vi-label` CSS API

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-label-font-size` | `14px` | Label font size |
| `--vi-label-font-weight` | `500` | Label weight |
| `--vi-label-color` | `var(--vi-color-foreground)` | Label text |
| `--vi-label-required-color` | `var(--vi-color-error)` | Asterisk colour |
| `--vi-label-disabled-opacity` | `0.5` | Disabled opacity |
| `--vi-label-gap` | `4px` | Gap between text and asterisk |

---

### `vi-spinner` CSS API

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-spinner-size` | `24px` | Diameter |
| `--vi-spinner-color` | `tokens.$color-primary` | Track colour |
| `--vi-spinner-track-color` | `tokens.$border-02` | Background track |
| `--vi-spinner-stroke-width` | `3px` | Ring stroke width |
| `--vi-spinner-duration` | `800ms` | Rotation duration |

---

### `vi-alert` CSS API

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-alert-padding` | `tokens.$spacing-sm` | Internal padding |
| `--vi-alert-border-radius` | `tokens.$border-radius-lg` | Corner radius |
| `--vi-alert-border-width` | `tokens.$border-width-thin` | Left accent border width |
| `--vi-alert-icon-size` | `20px` | Status icon size |
| `--vi-alert-gap` | `12px` | Gap: icon→content |
| `--vi-alert-floating-z-index` | `10000` | Stacking context when floating |
| `--vi-alert-neutral-bg` | `tokens.$layer-02` | Neutral background |
| `--vi-alert-neutral-color` | `tokens.$color-foreground` | Neutral text |
| `--vi-alert-neutral-border` | `tokens.$border-04` | Neutral accent border |
| `--vi-alert-success-bg` | `tokens.$bg-success` | Success background |
| `--vi-alert-success-color` | `tokens.$text-success` | Success text |
| `--vi-alert-success-border` | `tokens.$color-success` | Success accent |
| `--vi-alert-warning-bg` | `tokens.$bg-warning` | Warning background |
| `--vi-alert-warning-color` | `tokens.$text-warning` | Warning text |
| `--vi-alert-warning-border` | `tokens.$color-warning` | Warning accent |
| `--vi-alert-danger-bg` | `tokens.$bg-error` | Danger background |
| `--vi-alert-danger-color` | `tokens.$text-error` | Danger text |
| `--vi-alert-danger-border` | `tokens.$color-error` | Danger accent |
| `--vi-alert-info-bg` | `tokens.$bg-info` | Info background |
| `--vi-alert-info-color` | `tokens.$text-info` | Info text |
| `--vi-alert-info-border` | `tokens.$color-info` | Info accent |

---

### `vi-tooltip` CSS API

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-tooltip-background` | `tokens.$layer-inverse` | Tooltip background |
| `--vi-tooltip-color` | `tokens.$text-primary-inverse` | Tooltip text |
| `--vi-tooltip-font-size` | `tokens.$font-size-xs` | Tooltip font size |
| `--vi-tooltip-padding` | `6px 10px` | Internal padding |
| `--vi-tooltip-border-radius` | `tokens.$border-radius-sm` | Corner radius |
| `--vi-tooltip-max-width` | `280px` | Maximum width |
| `--vi-tooltip-shadow` | `tokens.$shadow-md` | Drop shadow |
| `--vi-tooltip-arrow-size` | `6px` | Arrow triangle size |
| `--vi-tooltip-delay` | `500ms` | Hover show delay |
| `--vi-tooltip-z-index` | `9000` | z-index layer |

---

### `vi-modal` CSS API

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-modal-backdrop-color` | `rgba(0,0,0,0.5)` | Backdrop overlay |
| `--vi-modal-background` | `var(--vi-layer-01)` | Dialog background |
| `--vi-modal-border-radius` | `12px` | Dialog corner radius |
| `--vi-modal-shadow` | `var(--vi-shadow-xl)` | Dialog shadow |
| `--vi-modal-padding` | `24px` | Header/body/footer padding |
| `--vi-modal-max-width-sm` | `400px` | Small size max-width |
| `--vi-modal-max-width-md` | `600px` | Medium (default) max-width |
| `--vi-modal-max-width-lg` | `800px` | Large max-width |
| `--vi-modal-header-border` | `var(--vi-color-border)` | Header divider |
| `--vi-modal-footer-border` | `var(--vi-color-border)` | Footer divider |
| `--vi-modal-z-index` | `8000` | Stacking context |
| `--vi-modal-animate-duration` | `200ms` | Open/close transition |

---

### `vi-date-picker` CSS API

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-date-picker-border-color` | `tokens.$border-03` | Input border |
| `--vi-date-picker-focus-ring-color` | `tokens.$focus` | Focus ring |
| `--vi-date-picker-calendar-bg` | `tokens.$layer-01` | Calendar popup bg |
| `--vi-date-picker-calendar-shadow` | `tokens.$shadow-lg` | Popup shadow |
| `--vi-date-picker-day-size` | `36px` | Day cell size |
| `--vi-date-picker-day-selected-bg` | `tokens.$color-primary` | Selected day bg |
| `--vi-date-picker-day-selected-color` | `tokens.$text-primary-inverse` | Selected day text |
| `--vi-date-picker-day-today-border` | `tokens.$color-primary` | Today indicator |
| `--vi-date-picker-day-hover-bg` | `tokens.$layer-hover-01` | Hover day bg |
| `--vi-date-picker-partial-color` | `tokens.$text-disabled` | Unknown/partial date |

---

### `vi-signature` CSS API

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-signature-border-color` | `tokens.$border-03` | Canvas border |
| `--vi-signature-border-radius` | `tokens.$border-radius-lg` | Corner radius |
| `--vi-signature-background` | `tokens.$color-background` | Canvas background |
| `--vi-signature-pen-color` | `tokens.$text-primary` | Stroke colour |
| `--vi-signature-pen-width` | `2px` | Default stroke width |
| `--vi-signature-height` | `120px` | Canvas height |
| `--vi-signature-placeholder-color` | `tokens.$text-disabled` | Placeholder text |
| `--vi-signature-focus-ring-color` | `tokens.$focus` | Focus outline |
| `--vi-signature-locked-overlay-bg` | `rgba(0,0,0,0.04)` | Locked state overlay |

---

## 9. CSS Parts (`::part()`)

Every interactive web component exposes named `part` attributes for external styling. This is the **recommended way to style internals** from outside a shadow DOM, and is preferred over `:host` overrides for structural changes.

| Component | Part | Element |
|-----------|------|---------|
| `vi-button` | `button` | Inner `<button>` |
| `vi-button` | `icon` | Icon slot wrapper |
| `vi-button` | `label` | Label `<span>` |
| `vi-input` | `field` | Outer wrapper `<div>` |
| `vi-input` | `input` | Native `<input>` |
| `vi-input` | `helper` | Helper slot wrapper |
| `vi-input` | `validation` | Validation message `<span>` |
| `vi-textarea` | `field` | Outer wrapper |
| `vi-textarea` | `textarea` | Native `<textarea>` |
| `vi-textarea` | `helper` | Helper slot |
| `vi-checkbox` | `box` | Visual checkbox square |
| `vi-checkbox` | `check` | SVG checkmark |
| `vi-checkbox` | `label` | Label text |
| `vi-radio` | `circle` | Visual radio outer ring |
| `vi-radio` | `dot` | Visual inner dot |
| `vi-radio` | `label` | Label text |
| `vi-select` | `select` | Native `<select>` |
| `vi-select` | `arrow` | Chevron icon |
| `vi-switch` | `track` | Toggle track |
| `vi-switch` | `thumb` | Toggle thumb |
| `vi-switch` | `label` | Label text |
| `vi-badge` | `badge` | Badge root element |
| `vi-tag` | `tag` | Tag root element |
| `vi-tag` | `label` | Label text |
| `vi-tag` | `remove` | Remove button |
| `vi-modal` | `dialog` | Dialog `<dialog>` element |
| `vi-modal` | `header` | Header section |
| `vi-modal` | `body` | Body content area |
| `vi-modal` | `footer` | Footer section |
| `vi-modal` | `close` | Close button |
| `vi-alert` | `alert` | Alert root |
| `vi-alert` | `icon` | Status icon |
| `vi-alert` | `content` | Text content area |
| `vi-tooltip` | `tooltip` | Tooltip popup |
| `vi-date-picker` | `input` | Text input field |
| `vi-date-picker` | `calendar` | Calendar popup |
| `vi-signature` | `canvas` | Drawing canvas |
| `vi-signature` | `actions` | Clear/confirm buttons area |

**Usage example:**
```css
/* Style only the inner button element of a submit button */
#submit-btn::part(button) {
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
```

---

## 10. Focus Ring System

All interactive components share a consistent focus ring implementation:

```scss
// In flux-ui/components/_focus.scss (shared mixin)
@mixin vi-focus-ring($color-token, $glow-token) {
  outline: var(--vi-border-width-base, 2px) solid var(--vi-focus-ring-color, #{$color-token});
  outline-offset: 0;
  box-shadow: 0 0 0 3px var(--vi-focus-ring-glow, #{$glow-token});
}
```

**Global override** — change the focus ring colour platform-wide:
```css
:root {
  --vi-focus-ring-color: #005eb8;   /* NHS blue example */
  --vi-focus-ring-glow: rgba(0, 94, 184, 0.2);
}
```

**Per-component override:**
```css
vi-input {
  --vi-input-focus-ring-color: #005eb8;
}
```

---

## 11. Reduced Motion

All animations and transitions respect `prefers-reduced-motion: reduce`. When active:
- All CSS `transition` values are set to `none`
- Modal open/close animations are disabled
- Spinner uses `opacity` pulse instead of `rotate`
- Date picker calendar opens instantly

```scss
// Applied globally in flux-ui/_reset.scss
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Individual components also declare their own `@media (prefers-reduced-motion: reduce)` block for any animation not covered by the `transition` shorthand.

---

## 12. Dark Theme

Dark theme is activated by adding `data-theme="dark"` to any ancestor element (typically `<html>` or the application shell container).

```html
<html data-theme="dark">
```

The dark theme map (`$vi-theme--dark`) in `_theme.scss` remaps semantic tokens:

| Token (light → dark) | Light | Dark |
|---|---|---|
| `--vi-color-background` | `#ffffff` | `#111827` |
| `--vi-color-foreground` | `#111827` | `#f9fafb` |
| `--vi-color-border` | `#e5e7eb` | `#374151` |
| `--vi-layer-01` | `#ffffff` | `#1f2937` |
| `--vi-layer-02` | `#f3f4f6` | `#111827` |
| `--vi-border-03` | `#e0e0e0` | `#374151` |
| `--vi-text-disabled` | `#9e9e9e` | `#6b7280` |

All component CSS custom property fallbacks reference these semantic tokens, so dark mode works **automatically** for all components without any per-component dark mode code.

---

## 13. Consuming Components — Override Examples

### Study-branded submit button

```css
/* Sponsor colour without touching component internals */
.sponsor-novartis vi-button[variant="primary"] {
  --vi-button-surface-primary-background-color: #0460a9;
  --vi-button-surface-primary-background-color-hover: #03498a;
}
```

### Compact form for a narrow panel

```css
.compact-form vi-input,
.compact-form vi-select,
.compact-form vi-textarea {
  --vi-input-sizing-min-height: 32px;
  --vi-input-spacing-padding-block: 4px;
  --vi-input-typography-font-size: 14px;
}
```

### Encrypted field visual indicator (FLE)

When `encryption.lockedAt` is set, the EDC shell applies a lock indicator:

```css
vi-input[data-encrypted="true"] {
  --vi-input-border-color: var(--vi-color-purple-500);
  --vi-input-focus-ring-color: var(--vi-color-purple-500);
  --vi-input-focus-ring-glow: rgba(118, 9, 208, 0.15);
}
```

### Override modal width for a confirmation dialog

```css
#confirm-dialog {
  --vi-modal-max-width-sm: 340px;
}
```

### High-contrast focus ring (WCAG 2.2 §2.4.11)

```css
:root {
  --vi-border-width-base: 3px;            /* thicker ring */
  --vi-focus-ring-color: #000000;          /* solid black */
  --vi-focus-ring-glow: transparent;       /* no glow */
}
```
