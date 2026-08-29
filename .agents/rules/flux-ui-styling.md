# Flux UI Styling & Implementation Rules

When working on Flux UI and Web Components in this repository, strictly adhere to the following design system rules to ensure consistency, accessibility, and correct viewport behavior.

## 1. CSS Unit Selection

Use the appropriate unit based on the context:

*   **`rem` (Typography, Spacing, Sizing)**: Must be used for `font-size`, `padding`, `margin`, `gap`, `width`, and `height` of interactive form controls. This ensures fluid scaling when users change their root font size. If a raw pixel value is provided in design specs and no token exists, ALWAYS wrap it using `#{func.to-rem(16px)}`. 
*   **`px` (Rigid Geometries)**: Reserved exclusively for values that must never scale or blur. Use only for `border-width` (e.g., `1px solid`), `box-shadow` offsets/blurs, small optical adjustments (e.g., a `2px` focus outline offset or `11px` optical padding), and `1px` clipping hacks. 
*   **`dvh` / `dvw` (Viewport-Relative Layouts)**: Preferred over `vh` / `vw` for full-screen overlays, modals, and sticky banners to correctly account for mobile browser UI (like address bars) expanding and contracting. Always provide a static `vh` / `vw` fallback immediately before the `dvh` / `dvw` declaration.
*   **`%` (Container Fluidity)**: Use for container-relative fluidity, such as grids or `width: 100%`.

## 2. Fonts and Typography

*   **Token Fallbacks**: Never hardcode pixel values like `14px` for font-size. Always use `#{tokens.$font-size-base}` or `#{func.to-rem(14px)}`.
*   **CSS Variable Expositions**: When exposing a font-size variable for a component, it should gracefully fall back to the global typography scale SASS tokens.
    *   ✅ **Correct**: `font-size: var(--vi-tag-font-size, var(--vi-font-size-xs, #{tokens.$font-size-xs}));`
    *   ❌ **Incorrect**: `font-size: var(--vi-tag-font-size, 12px);`

## 3. CSS Variables & Component Overrides

Web components must expose properly scoped CSS variables to allow theme overriding from the Light DOM while respecting Shadow DOM encapsulation.

*   **Internal Selectors for Variables**: CSS variables (like `padding`, `font-size`, `border-radius`) should be mapped onto internal structural elements (e.g., `.button`, `.input-control`) rather than the `:host` selector. This guarantees that parent container overrides successfully cascade into the component.
*   **Fallback Pattern**: Always use `var(--vi-component-prop, #{default})` when mapping tokens to CSS variables inside the components. 
*   **Exception (`calc()` and `:host`)**: If a component's internal geometry relies on `calc()` operations that use exposed CSS variables (e.g., `vi-switch` calculating thumb size relative to track height), those variables *must* remain on `:host`. This ensures the browser CSS engine computes the dependencies correctly across the Shadow boundary.
