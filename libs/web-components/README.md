# @vialiq/web-components

Buildable and publishable Lit web component library for the Vi design system.

## Goals

- ESM-only output
- Per-component subpath exports (no forced all-in import)
- Self-styled components with CSS embedded in JS
- Themeable via Flux UI token fallbacks

## Install

```bash
npm install @vialiq/web-components lit
```

## Usage

```ts
import '@vialiq/web-components/button';
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

## Storybook

The project uses **Storybook 10** with the `@storybook/web-components-vite` framework.

- `esbuild` is replaced by `unplugin-swc` in `viteFinal` so TC39 standard decorators
  (required by Lit v3) work inside Storybook. See `.storybook/main.ts`.
- **`autodocs`** in Storybook 10 is tag-driven, not configured globally. Add
  `tags: ['autodocs']` to the `meta` export inside each story file to enable the
  auto-generated docs page for that component:

  ```ts
  const meta: Meta = {
    title: 'Components/Button',
    tags: ['autodocs'],
    // ...
  };
  ```

- The `docs: { autodocs: ... }` key was removed from `StorybookConfig` in Storybook 10.
  Do **not** add it back to `.storybook/main.ts`.
