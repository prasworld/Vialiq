# @vialiq/icons: Icon Management Guide

The `@vialiq/icons` library generates fully customizable, theme-compliant TypeScript modules from raw SVG files. It supports two primary icon libraries, handling their fundamentally different underlying SVG architectures seamlessly.

## Supported Icon Libraries

We use two distinct libraries to cover all our needs for the EDC and Web Interface:

1. **Tabler Icons** (`tabler.io/icons`): Used for general UI icons (chevrons, calendars, close buttons).
   * **Architecture:** Natively stroked. They use `<path>` tags without fill or stroke, relying on the root `<svg>` tag to define the `stroke` and `stroke-width`.
2. **Healthicons (Outline)** (`healthicons.org`): Used for specialized clinical and medical icons (body parts, diagnostics, conditions).
   * **Architecture:** Filled outlines. Even though they look like lines, they are actually drawn as filled shapes where the `<path>` traces the perimeter of the line and uses `fill="currentColor"`.

> [!WARNING]
> Because Healthicons are built with `fill` and Tabler with `stroke`, applying a CSS `stroke` to a Healthicon will cause a "double-line" distortion effect. Our generator script handles this automatically, provided you name the files correctly.

### Design System & Grid Differences

When downloading icons, it's important to understand how both libraries are built so they appear unified when rendered next to each other at the same `size`:

* **Grid / viewBox:** 
  * Tabler is drawn on a **24x24** grid (`viewBox="0 0 24 24"`).
  * Healthicons are drawn on a **48x48** grid (`viewBox="0 0 48 48"`).
  * *Note: `<vi-icon>` scales both perfectly using CSS `width/height: 100%`, so a 48x48 icon will visually shrink to fit the exact same size as a 24x24 icon.*
* **Optical Thickness:** 
  * Tabler uses a native `stroke-width="2"`. On a 24px canvas, the stroke is `1/12th` of the container width.
  * Healthicons outline strokes are drawn using filled paths that are `4px` thick. On a 48px canvas, the stroke is also exactly `4/48` = `1/12th` of the container width.
  * *Result: Because the optical ratios match perfectly, you can mix and match them without any visual thickness discrepancy.*

---

## How to Add New Icons

### Adding Tabler Icons (UI)
1. Go to [Tabler Icons](https://tabler.io/icons).
2. Download the SVG you want.
3. Place the SVG directly into `libs/icons/tools/icons-src/`.
4. Name the file whatever you want the export to be (e.g., `chevron-down.svg`).

### Adding Healthicons (Medical)
1. Go to [Healthicons](https://healthicons.org) and make sure you select the **Outline** variant.
2. Download the SVG you want.
3. Place the SVG into `libs/icons/tools/icons-src/`.
4. **CRITICAL:** You must prefix the filename with `hi-` (e.g., `hi-brain.svg`). 
   * *Why?* The `hi-` prefix signals to the `generate-icons.mjs` compiler that this is a filled-outline SVG, instructing it to inject `fill="var(--vi-icon-color)"` instead of `stroke`.

---

## Generating the TypeScript Modules

Once you have placed your new SVGs into `libs/icons/tools/icons-src/`, you must compile them into TypeScript so they can be consumed by the web components.

From the root of the Nx workspace, run:
```bash
npm run generate:icons
```
*(Or run `node libs/icons/tools/generate-icons.mjs`)*

### What the Generator Does:
1. **Reads all SVGs** in `tools/icons-src/`.
2. **Strips dimensions** (`width` and `height`) so the icon inherits its size purely from CSS (`<vi-icon>`).
3. **Strips hardcoded colors** and XML comments.
4. **Injects CSS Variables**:
   * If the file starts with `hi-`, it injects `fill="var(--vi-icon-color, currentColor)" stroke="none"`.
   * Otherwise, it injects `stroke="var(--vi-icon-color, currentColor)" fill="none"`.
5. **Minifies** the SVG into a single line string.
6. **Outputs a `.ts` module** in `libs/icons/src/` (e.g., `src/chevron-down.ts` exports `chevronDownIcon`).

---

## Final Step: Re-exporting

After generating the new files, you must expose them so other libraries can import them.

Open `libs/icons/src/index.ts` and add your new export:
```typescript
export * from './chevron-down.js';
export * from './hi-brain.js';
```

You can now use your icon anywhere in the application!
```typescript
import { chevronDownIcon } from '@vialiq/icons';
```
