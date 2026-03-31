# @vialiq/icons

Pure-data SVG icon definition library for the `@vi` design system.

This library is intentionally framework-agnostic — it has **zero runtime dependencies**. Each icon is a plain `SvgIconDef` object `{ name, data }`. The `@vialiq/web-components` package consumes these definitions to render `<vi-icon>`.

---

## Packages

| Package | Description |
|---|---|
| `@vialiq/icons` | All icon definitions (barrel) |
| `@vialiq/icons/<name>` | Individual icon (tree-shakeable) |

---

## Usage

### 1. Register icons before use

Import only the icons you need. Unused icons are tree-shaken from the bundle.

```ts
import { registerIcons } from '@vialiq/web-components';
import { checkIcon } from '@vialiq/icons/check';
import { xIcon } from '@vialiq/icons/x';

registerIcons([checkIcon, xIcon]);
```

### 2. Use `<vi-icon>` in your HTML

```html
<!-- Decorative (aria-hidden) -->
<vi-icon name="check"></vi-icon>

<!-- With accessible label -->
<vi-icon name="check" label="Confirmed"></vi-icon>

<!-- Custom size -->
<vi-icon name="x" size="32"></vi-icon>
```

---

## Adding a New Icon

### Step 1 — Drop the SVG into the source folder

```
libs/icons/tools/icons-src/<name>.svg
```

Requirements for the SVG file:
- Use `stroke="currentColor"` or `fill="currentColor"` so the icon inherits CSS color
- Remove explicit `width` and `height` attributes — the generator strips them automatically
- Keep `viewBox` intact (e.g. `viewBox="0 0 24 24"`)

### Step 2 — Run the generator

```bash
nx run icons:generate-icons
```

This scans `tools/icons-src/*.svg` and outputs a `SvgIconDef` module for each file:

```
tools/icons-src/arrow-right.svg  →  src/arrow-right.ts
```

The generated file looks like:

```ts
// AUTO-GENERATED — do not edit by hand.
import type { SvgIconDef } from './types.js';

export const arrowRightIcon: SvgIconDef = {
  name: 'arrow-right',
  data: `<svg ...>...</svg>`,
};
```

> Icon const names are derived from the filename: `arrow-right.svg` → `arrowRightIcon`

### Step 3 — Re-export from the barrel

Open [src/index.ts](src/index.ts) and add the new export:

```ts
export { arrowRightIcon } from './arrow-right.js';
```

### Step 4 — Commit both files

```bash
git add libs/icons/src/arrow-right.ts libs/icons/src/index.ts
git commit -m "feat(icons): add arrow-right icon"
```

---

## Project Structure

```
libs/icons/
├── src/
│   ├── types.ts          SvgIconDef interface
│   ├── index.ts          Barrel — re-exports all icons
│   ├── check.ts          AUTO-GENERATED
│   └── x.ts              AUTO-GENERATED
└── tools/
    ├── generate-icons.mjs   Generator script
    └── icons-src/
        ├── check.svg        Raw SVG source
        └── x.svg            Raw SVG source
```

---

## SvgIconDef Type

```ts
interface SvgIconDef {
  /** Unique identifier — used as the `name` attribute on <vi-icon> */
  name: string;
  /** Raw SVG markup string */
  data: string;
}
```

---

## Current Icons

| Name | Const | Import |
|---|---|---|
| `check` | `checkIcon` | `@vialiq/icons/check` |
| `x` | `xIcon` | `@vialiq/icons/x` |

---

## Do Not Edit Generated Files

Files in `src/` that start with `// AUTO-GENERATED` are produced by `tools/generate-icons.mjs`. Edit the source SVG in `tools/icons-src/` and re-run the generator instead.
