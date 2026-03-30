# @vi/web-components

Buildable and publishable Lit web component library for the Vi design system.

## Goals

- ESM-only output
- Per-component subpath exports (no forced all-in import)
- Self-styled components with CSS embedded in JS
- Themeable via Flux UI token fallbacks

## Install

```bash
npm install @vi/web-components lit
```

## Usage

```ts
import '@vi/web-components/button';
```

```html
<vi-button variant="primary">Save</vi-button>
```

## Token strategy

Component styles use BEM + state CSS variable naming and Flux UI fallbacks.

Example:

```css
background-color: var(--vi-button-surface-primary-background-color, var(--vi-color-primary, #0066cc));
```

## Development

```bash
npx nx build web-components
npx nx run web-components:postbuild-publish
npx nx run web-components:storybook
npx nx run web-components:test-wdio
```
