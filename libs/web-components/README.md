,# @vialiq/web-components

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

## Integration Guide

Since these components are built using standard Custom Elements APIs, they are compatible with any web framework or vanilla web stack.

### Subpath Exports & Tree-Shaking

To keep your bundle sizes minimal, import only the components you need:

```ts
// Good: Imports only the button component
import '@vialiq/web-components/button';

// Good: Imports only the input component
import '@vialiq/web-components/input';
```

If you prefer to import all components, or if you need helper classes and TypeScript types, you can import from the main package entrypoint:

```ts
import { registerIcons, ViButton } from '@vialiq/web-components';
```

### Framework Guides

#### 1. React

React 19 supports Custom Elements natively. If you are using React <19, you must set properties and custom events manually via `ref` or use custom wrapper packages.

**React 19 Example:**

```tsx
import React from 'react';
import '@vialiq/web-components/button';
import '@vialiq/web-components/input';

export function SearchForm() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log('Submitted');
      }}
    >
      <vi-input name="query" placeholder="Search..." required onvialiq-input={(e: any) => console.log(e.detail.value)} />
      <vi-button type="submit" variant="primary">
        Search
      </vi-button>
    </form>
  );
}
```

#### 2. Vue

Vue supports custom elements seamlessly out-of-the-box. Register the tags so Vue's compiler knows not to treat them as Vue components:

**vite.config.ts:**

```ts
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('vi-'),
        },
      },
    }),
  ],
});
```

**Vue Component Template:**

```html
<template>
  <div>
    <vi-input :value="username" @vialiq-input="onInput" />
    <vi-button variant="success">Register</vi-button>
  </div>
</template>
```

#### 3. Angular

To use Custom Elements in Angular, you must add the `CUSTOM_ELEMENTS_SCHEMA` to the `schemas` array of the `@Component` (for standalone components) or `@NgModule` where they are consumed.

**Standalone Component Setup:**

```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-search-form',
  standalone: true,
  templateUrl: './search-form.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SearchFormComponent {
  searchQuery = '';

  onInput(event: Event) {
    const customEvent = event as CustomEvent<{ value: string }>;
    this.searchQuery = customEvent.detail.value;
  }
}
```

**search-form.component.html Template:**

```html
<div>
  <vi-input [value]="searchQuery" (vialiq-input)="onInput($event)" placeholder="Search catalog..."></vi-input>

  <vi-button variant="primary">Search</vi-button>
</div>
```

#### 4. Next.js (SSR / React Server Components)

Custom Elements must register on the browser's `window` object. Next.js and server-side rendering environments require lazy-loading or dynamic imports to ensure registration occurs client-side.

```tsx
'use client';

import { useEffect } from 'react';

export default function MyClientComponent() {
  useEffect(() => {
    // Import dynamically on the client
    import('@vialiq/web-components/button');
  }, []);

  return <vi-button>Save</vi-button>;
}
```

---

## Component API & Detailed Examples

### Button ([vi-button](./src/button/vi-button.ts))

The [ViButton](./src/button/vi-button.ts) is a versatile button component that wraps a native `<button>` element with keyboard interaction, focus indicators, visual variations, and slot options.

#### Properties & Attributes

| Attribute        | Property        | Type                                                           | Default     | Description                                                     |
| :--------------- | :-------------- | :------------------------------------------------------------- | :---------- | :-------------------------------------------------------------- |
| `variant`        | `variant`       | `'primary'\|'secondary'\|'danger'\|'success'\|'info'\|'ghost'` | `'primary'` | Visual design style.                                            |
| `size`           | `size`          | `'xs'\|'sm'\|'md'\|'lg'`                                       | `'md'`      | Sizing scale.                                                   |
| `icon-placement` | `iconPlacement` | `'start'\|'end'`                                               | `'start'`   | Location of the icon relative to the label.                     |
| `full-width`     | `fullWidth`     | `boolean`                                                      | `false`     | Sets width to 100% of container.                                |
| `icon-only`      | `iconOnly`      | `boolean`                                                      | `false`     | Squares padding and matches dimensions for an icon-only layout. |
| `disabled`       | `disabled`      | `boolean`                                                      | `false`     | Disables button interactions and sets `tabindex="-1"`.          |

#### Slots

- **Default Slot**: Button label (text/content).
- **`icon` Slot**: Container for standard icons.

#### CSS Parts

- `button`: The native internal `<button>` element.
- `icon`: The icon wrapper element.
- `label`: The text label span wrapper.

#### Snippets

**Standard Button Variants:**

```html
<vi-button variant="primary">Primary Action</vi-button>
<vi-button variant="secondary">Secondary Action</vi-button>
<vi-button variant="danger">Delete Item</vi-button>
<vi-button variant="ghost">Cancel</vi-button>
```

**Sizes & Layouts:**

```html
<vi-button size="xs">Extra Small</vi-button>
<vi-button size="sm">Small</vi-button>
<vi-button size="md">Medium (Default)</vi-button>
<vi-button size="lg">Large</vi-button>

<!-- Stretches width to 100% -->
<vi-button full-width variant="primary">Submit Order</vi-button>
```

**Icons Support:**

```html
<!-- Icon at start (default) -->
<vi-button>
  <vi-icon slot="icon" name="plus"></vi-icon>
  Add User
</vi-button>

<!-- Icon at end -->
<vi-button icon-placement="end">
  <vi-icon slot="icon" name="arrow-right"></vi-icon>
  Next Step
</vi-button>

<!-- Icon-only configuration -->
<vi-button icon-only aria-label="Settings">
  <vi-icon slot="icon" name="settings"></vi-icon>
</vi-button>
```

---

### Input ([vi-input](./src/input/vi-input.ts))

The [ViInput](./src/input/vi-input.ts) component is a form-associated custom text input control. It wraps a native single-line input field and automatically supports accessibility features, validation states, helper text slots, and custom style configuration.

#### Properties & Attributes

| Attribute          | Property          | Type                                                            | Default     | Description                                      |
| :----------------- | :---------------- | :-------------------------------------------------------------- | :---------- | :----------------------------------------------- |
| `type`             | `type`            | `'text'\|'email'\|'password'\|'search'\|'tel'\|'url'\|'number'` | `'text'`    | Renders appropriate input format.                |
| `placeholder`      | `placeholder`     | `string`                                                        | `''`        | Input placeholder text.                          |
| `name`             | `name`            | `string`                                                        | `''`        | Form participation field name.                   |
| `value`            | `value`           | `string`                                                        | `''`        | Controlled input value.                          |
| `disabled`         | `disabled`        | `boolean`                                                       | `false`     | Disables field interactions.                     |
| `readonly`         | `readonly`        | `boolean`                                                       | `false`     | Disables keyboard editing.                       |
| `required`         | `required`        | `boolean`                                                       | `false`     | Marks field validation as mandatory.             |
| `status`           | `status`          | `'default'\|'valid'\|'invalid'`                                 | `'default'` | Controls validation visual presentation.         |
| `validity-message` | `validityMessage` | `string`                                                        | `''`        | Native or custom error message to display in UI. |
| `size`             | `size`            | `'xs'\|'sm'\|'md'\|'lg'`                                        | `'md'`      | Controls font sizes and paddings.                |
| `aria-label`       | `ariaLabel`       | `string`                                                        | `''`        | Accessibility label.                             |
| `aria-labelledby`  | `ariaLabelledby`  | `string`                                                        | `''`        | ID reference of accessible label.                |

#### Slots

- **`helper` Slot**: Location to insert description text below the input field.

#### Events

- `vialiq-input`: Fires on every keypress. Detail: `{ value: string }`.
- `vialiq-change`: Fires when element loses focus (blur). Detail: `{ value: string }`.
- `invalid`: Native HTML5 validation failed event.

#### CSS Custom Properties

Exposes variables for custom theme styling:

```css
vi-input {
  --vi-input-border-color: #d1d5db;
  --vi-input-focus-ring-color: #3b82f6;
  --vi-input-background-color: #ffffff;
  --vi-input-text-color: #1f2937;
  --vi-input-placeholder-color: #9ca3af;
  --vi-input-helper-color: #6b7280;
  --vi-input-error-color: #ef4444;
  --vi-input-success-color: #10b981;
  --vi-input-shape-border-radius: 6px;
}
```

#### Snippets

**Basic Text & Password Inputs:**

```html
<vi-input name="username" placeholder="Enter username"></vi-input>

<!-- Password input -->
<vi-input type="password" name="password" placeholder="••••••••"></vi-input>
```

**Required with Helper Text & Validation:**

```html
<vi-input type="email" name="email" placeholder="you@vialiq.com" required>
  <span slot="helper">We will never share your email address.</span>
</vi-input>
```

---

### Select ([vi-select](./src/select/vi-select.ts))

> [!NOTE]
> **Performance Notice:** The `vi-select` component automatically calculates its width to perfectly fit its content by measuring all rendered options. Because it renders all options directly into the DOM without virtualization, it is **not intended for large lists** (e.g., thousands of items). For massive datasets, use a combobox with virtualization and async filtering instead.

The [ViSelect](./src/select/vi-select.ts) is a custom listbox component that replaces the native `<select>` element. It supports custom templating, dynamic wrapping, form integration, and floating dropdowns using Floating UI.

#### Properties & Attributes

| Attribute          | Property          | Type                            | Default     | Description                                      |
| :----------------- | :---------------- | :------------------------------ | :---------- | :----------------------------------------------- |
| `value`            | `value`           | `string`                        | `''`        | The currently selected option's value.           |
| `placeholder`      | `placeholder`     | `string`                        | `'Select...'` | Text shown when no option is selected.           |
| `name`             | `name`            | `string`                        | `''`        | Form field name.                                 |
| `disabled`         | `disabled`        | `boolean`                       | `false`     | Disables the select component entirely.          |
| `required`         | `required`        | `boolean`                       | `false`     | Makes selecting an option mandatory.             |
| `clearable`        | `clearable`       | `boolean`                       | `false`     | Shows a clear button ("×") when an option is selected. |
| `status`           | `status`          | `'default'\|'valid'\|'invalid'` | `'default'` | Controls validation visual border colors.        |
| `validity-message` | `validityMessage` | `string`                        | `''`        | Custom error message to display in UI.           |
| `wrap-text`        | `wrapText`        | `boolean`                       | `false`     | Allows text within the dropdown options to wrap instead of truncating. |
| `match-width`      | `matchWidth`      | `boolean`                       | `true`      | Forces the listbox dropdown to match the trigger's width. |
| `placement`        | `placement`       | `DropdownPlacement`             | `'bottom-start'` | Preferred positioning of the listbox dropdown. |
| `hoist`            | `hoist`           | `boolean`                       | `true`      | Uses a fixed positioning strategy to escape clipping containers. |
| `flip-boundary`    | `flipBoundary`    | `string`                        | `''`        | CSS selector for a boundary element used in collision detection. |

#### Slots

- **Default Slot**: Used for placing `<vi-select-option>` and `<vi-select-group>` child elements.
- **`helper` Slot**: Location to insert description text below the select component.

#### Child Components (`<vi-select-option>` and `<vi-select-group>`)

Options are created using the `<vi-select-option>` tag inside the select.
- **`value`**: The value to submit when selected.
- **`label`**: The plain text label used for the trigger and type-ahead filtering.
- **Default Slot**: You can place any complex HTML template inside the option (e.g., avatars, icons, badges) and it will render inside the listbox!

You can group options logically using `<vi-select-group>`:
- **`label`**: The heading text for the option group.

#### CSS Custom Properties

- `--vi-select-width`: Controls the width of the select trigger and the dropdown (default: `100%`).
- `--vi-typeahead-highlight-bg`: Background color of the text match when using keyboard type-ahead (default: `#ebf5ff` / `blue-100`).
- `--vi-typeahead-highlight-color`: Text color of the type-ahead match (default: `#3676d0` / `primary`).

#### Events

- `vialiq-change`: Fires when an option is selected. Detail: `{ value: string, label: string }`.
- `vialiq-clear`: Fires when the clear button is clicked.

#### Snippets

**Basic Usage:**

```html
<vi-select name="country" placeholder="Select a country...">
  <vi-select-option value="us" label="United States"></vi-select-option>
  <vi-select-option value="uk" label="United Kingdom"></vi-select-option>
  <vi-select-option value="ca" label="Canada"></vi-select-option>
</vi-select>
```

**Custom Templates & Width:**

```html
<vi-select style="--vi-select-width: 300px;" placeholder="Select a user...">
  <vi-select-option value="user1" label="Jane Doe">
    <div style="display: flex; gap: 8px;">
      <img src="avatar.png" alt="" />
      <span>Jane Doe</span>
    </div>
  </vi-select-option>
</vi-select>
```

**Option Groups:**

```html
<vi-select name="fruits" placeholder="Select a fruit...">
  <vi-select-group label="Citrus">
    <vi-select-option value="orange" label="Orange"></vi-select-option>
    <vi-select-option value="lemon" label="Lemon"></vi-select-option>
  </vi-select-group>
  <vi-select-group label="Berries">
    <vi-select-option value="strawberry" label="Strawberry"></vi-select-option>
    <vi-select-option value="blueberry" label="Blueberry"></vi-select-option>
  </vi-select-group>
</vi-select>
```

**Placement & Fit Width (`match-width="false"`):**

By default, the dropdown matches the width of the trigger. To allow the dropdown to grow based on its content width, and change the floating direction:

```html
<vi-select placement="top-start" match-width="false" placeholder="Select a user...">
  <vi-select-option value="user1" label="Jane Doe">
    <div style="display: flex; white-space: nowrap;">
      Jane Doe (jane.doe@example.com - Senior Software Engineer)
    </div>
  </vi-select-option>
</vi-select>
```

**Form Integration & Reset:**

The `<vi-select>` responds properly to native form resets and submit interactions.

```html
<form>
  <vi-select name="status" value="pending" required>
    <vi-select-option value="pending" label="Pending"></vi-select-option>
    <vi-select-option value="approved" label="Approved"></vi-select-option>
  </vi-select>

  <!-- This native reset will restore the select back to "pending" -->
  <vi-button type="reset" variant="ghost">Clear Changes</vi-button>
  <vi-button type="submit" variant="primary">Submit</vi-button>
</form>
```

---

### Checkbox ([vi-checkbox](./src/checkbox/vi-checkbox.ts))

The [ViCheckbox](./src/checkbox/vi-checkbox.ts) is a customizable form-associated checkbox control using SVG graphics for checkmarks and supporting the indeterminate (mixed) validation state.

#### Properties & Attributes

| Attribute       | Property        | Type                            | Default     | Description                               |
| :-------------- | :-------------- | :------------------------------ | :---------- | :---------------------------------------- |
| `checked`       | `checked`       | `boolean`                       | `false`     | Checked state.                            |
| `indeterminate` | `indeterminate` | `boolean`                       | `false`     | Indeterminate (mixed) dash state.         |
| `value`         | `value`         | `string`                        | `'on'`      | Submitted form value.                     |
| `name`          | `name`          | `string`                        | `''`        | Form field identifier.                    |
| `disabled`      | `disabled`      | `boolean`                       | `false`     | Disables checkbox toggles.                |
| `required`      | `required`      | `boolean`                       | `false`     | Makes checking field mandatory.           |
| `status`        | `status`        | `'default'\|'valid'\|'invalid'` | `'default'` | Controls validation visual border colors. |
| `size`          | `size`          | `'xs'\|'sm'\|'md'\|'lg'`        | `'md'`      | Controls dimension metrics.               |

#### Events

- `vialiq-change`: Fired on user toggle. Detail: `{ checked: boolean, value: string }`.

#### Snippets

**Simple Configurations:**

```html
<vi-checkbox name="agree" required>I accept the terms and conditions</vi-checkbox>

<vi-checkbox name="newsletter" checked>Subscribe to newsletter</vi-checkbox>
```

**Indeterminate State (Parent/Child controls):**

```html
<vi-checkbox id="select-all" indeterminate>Select All Modules</vi-checkbox>
```

---

### Radio Group & Radio ([vi-radio-group](./src/radio/vi-radio-group.ts) & [vi-radio](./src/radio/vi-radio.ts))

The [ViRadioGroup](./src/radio/vi-radio-group.ts) and [ViRadio](./src/radio/vi-radio.ts) work in tandem. The group container handles form-association, propagation of attributes (`name`, `disabled`, `size`), roving tabindexes, and WAI-ARIA compliant keyboard navigation via arrow keys.

#### `<vi-radio-group>` Properties & Attributes

| Attribute              | Property             | Type                            | Default      | Description                                    |
| :--------------------- | :------------------- | :------------------------------ | :----------- | :--------------------------------------------- |
| `value`                | `value`              | `string`                        | `''`         | Selection value.                               |
| `name`                 | `name`               | `string`                        | `''`         | Shared name propagated to children.            |
| `disabled`             | `disabled`           | `boolean`                       | `false`      | Disables entire selection array.               |
| `required`             | `required`           | `boolean`                       | `false`      | Marks group validation as mandatory.           |
| `status`               | `status`             | `'default'\|'valid'\|'invalid'` | `'default'`  | Group visual status.                           |
| `validity-message`     | `validity-message`   | `string`                        | `''`         | Helper error label when validation triggers.   |
| `orientation`          | `orientation`        | `'vertical'\|'horizontal'`      | `'vertical'` | Direction grid layout.                         |
| `size`                 | `size`               | `'xs'\|'sm'\|'md'\|'lg'`        | `'md'`       | Shared size propagated to children.            |
| `allow-dblclick-clear` | `allowDblclickClear` | `boolean`                       | `false`      | Double clicking a selected radio deselects it. |

#### `<vi-radio>` Properties & Attributes

| Attribute  | Property   | Type      | Default | Description                  |
| :--------- | :--------- | :-------- | :------ | :--------------------------- |
| `value`    | `value`    | `string`  | `''`    | Value this radio represents. |
| `checked`  | `checked`  | `boolean` | `false` | Checked selection status.    |
| `disabled` | `disabled` | `boolean` | `false` | Local disable flag override. |

#### Slots (`<vi-radio-group>`)

- **Default Slot**: Holds the list of `<vi-radio>` child tags.
- **`label` Slot**: Legend label displayed above the list.
- **`helper` Slot**: Support text shown below the components.

#### Snippets

**Vertical Layout (Default):**

```html
<vi-radio-group name="shipping" value="standard">
  <span slot="label">Choose Shipping Method</span>
  <vi-radio value="standard">Standard Shipping (3-5 days)</vi-radio>
  <vi-radio value="express">Express Shipping (1-2 days)</vi-radio>
  <vi-radio value="overnight" disabled>Overnight Shipping (Unavailable)</vi-radio>
  <span slot="helper">Shipping options vary by location.</span>
</vi-radio-group>
```

**Horizontal Layout with Double-Click Clear:**

```html
<vi-radio-group name="rating" orientation="horizontal" size="lg" allow-dblclick-clear>
  <span slot="label">Score rating (Double-click to clear)</span>
  <vi-radio value="1">1 Star</vi-radio>
  <vi-radio value="2">2 Stars</vi-radio>
  <vi-radio value="3">3 Stars</vi-radio>
  <vi-radio value="4">4 Stars</vi-radio>
  <vi-radio value="5">5 Stars</vi-radio>
</vi-radio-group>
```

---

### Tooltip ([vi-tooltip](./src/tooltip/vi-tooltip.ts))

The [ViTooltip](./src/tooltip/vi-tooltip.ts) manages floating help text. It leverages `@floating-ui/dom` under the hood for collision-detection, auto-flipping, dynamic viewport alignments, and manual trigger controls.

#### Properties & Attributes

| Attribute        | Property        | Type               | Default         | Description                                                                                        |
| :--------------- | :-------------- | :----------------- | :-------------- | :------------------------------------------------------------------------------------------------- |
| `content`        | `content`       | `string`           | `''`            | Plain text tooltip label. Overridden if the `content` slot is populated.                           |
| `placement`      | `placement`     | `TooltipPlacement` | `'top'`         | Direction: `top`\|`top-start`\|`top-end`\|`bottom`\|`bottom-start`\|`bottom-end`\|`left`\|`right`. |
| `trigger`        | `trigger`       | `TooltipTrigger`   | `'hover focus'` | Trigger events: `hover focus`\|`hover`\|`focus`\|`click`.                                          |
| `delay`          | `delay`         | `number`           | `500`           | Wait delay before displaying in ms.                                                                |
| `hide-delay`     | `hide-delay`    | `number`           | `100`           | Hide delay after trigger lost in ms.                                                               |
| `max-width`      | `max-width`     | `number`           | `240`           | Max width bounds size in pixels.                                                                   |
| `disabled`       | `disabled`      | `boolean`          | `false`         | Prevents rendering/open operations.                                                                |
| `popper-options` | `popperOptions` | `object`           | `{}`            | Custom options passed directly to Floating UI's `computePosition`.                                 |

#### Slots

- **Default Slot**: The target anchor element (e.g. `<vi-button>`).
- **`content` Slot**: Holds rich interactive HTML content. (When used, automatically updates ARIA parameters from `aria-describedby` to `aria-details` for screen readers).

#### Methods

- `show()`: Force displays the tooltip pane.
- `hide(immediate = false)`: Force hides the tooltip pane.

#### Snippets

**Basic Text Tooltip:**

```html
<vi-tooltip content="Press to permanently remove configuration" placement="right">
  <vi-button variant="danger">Delete Account</vi-button>
</vi-tooltip>
```

**Rich Interactive Content (Aria-Details compliant):**

```html
<vi-tooltip placement="bottom-start" trigger="click">
  <vi-button>View Pricing Plan</vi-button>
  <div slot="content" style="padding: 8px;">
    <strong>Enterprise Subscription</strong>
    <p style="margin: 4px 0 8px;">Includes 24/7 dedicated support team access.</p>
    <a href="/pricing" style="color: #60a5fa; text-decoration: underline;">Read More</a>
  </div>
</vi-tooltip>
```

**Auto-Placement (Collision Detection & Opposite Side Flipping):**
By default, the tooltip uses the Floating UI `flip()` and `shift()` middlewares. If the preferred placement (e.g. `top`) does not have sufficient space within the viewport, it automatically flips to the opposite side (`bottom`) and shifts along the axis to remain completely visible.

```html
<!-- Automatically flips to bottom if top space is restricted at runtime -->
<vi-tooltip content="Flipped placement when near top boundary" placement="top">
  <vi-button>Hover Me near Window Edge</vi-button>
</vi-tooltip>
```

**Custom Advanced Auto-Placement Middleware:**
If you want the tooltip to dynamically choose the absolute best side (e.g., auto-detecting the side with the most space, rather than just flipping to the opposite side), you can provide custom middleware via the `popper-options` property.

```html
<!-- Passing custom autoPlacement middleware via popper-options property -->
<vi-tooltip id="auto-placement-tooltip" content="Dynamic placement based on available viewport space">
  <vi-button>Auto placement</vi-button>
</vi-tooltip>

<script>
  import { autoPlacement, offset, shift } from '@floating-ui/dom';

  const tooltip = document.getElementById('auto-placement-tooltip');
  // Configure custom options directly to override default middleware list
  tooltip.popperOptions = {
    middleware: [offset(12), autoPlacement({ padding: 8 }), shift({ padding: 8 })],
  };
</script>
```

---

### Icon ([vi-icon](./src/icons/vi-icon.ts))

The [ViIcon](./src/icons/vi-icon.ts) component renders named inline SVG elements. It depends on a dynamic map store, registering only the icons utilized in your project to allow bundlers to prune unused assets (tree-shaking).

#### Properties & Attributes

| Attribute | Property | Type     | Default | Description                                                                                                                          |
| :-------- | :------- | :------- | :------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `name`   | `string` | `''`    | Name identifier inside the registry.                                                                                                 |
| `size`    | `size`   | `number` | `24`    | Width/height footprint dimension in pixels.                                                                                          |
| `label`   | `label`  | `string` | `''`    | Accessibility label. When set, renders as an interactive image with `role="img"`. When empty, marks element as `aria-hidden="true"`. |

#### Icon Registration API

Before rendering `<vi-icon>`, you must register the required icon definitions using the [registerIcons](./src/icons/registry.ts) function:

```ts
import { registerIcons } from '@vialiq/web-components';
import { checkIcon } from '@vialiq/icons/check';
import { settingsIcon } from '@vialiq/icons/settings';

// Register single or batch lists
registerIcons([checkIcon, settingsIcon]);
```

_Note: For security, `registerIcons` includes internal sanity checks that filter out inline `<script>` tags or event handlers (e.g. `onload=`) to prevent XSS exploits._

#### Snippets

**Usage Example:**

```html
<!-- Decorative usage (aria-hidden is true) -->
<vi-icon name="check" size="20"></vi-icon>

<!-- Accessible interactive usage -->
<vi-icon name="settings" size="32" label="Open workspace settings"></vi-icon>
```

### Modal ([vi-modal](./src/modal/vi-modal.ts))

The [ViModal](./src/modal/vi-modal.ts) is a focus-trapping dialog that dynamically teleports itself to `document.body` to guarantee stacking context above all other elements. It supports multiple layout variants (default, drawer, alert), draggable boundaries, resize handles, and stacking multiple modals automatically using an internal OverlayManager.

#### Properties & Attributes

| Attribute          | Property          | Type                                                       | Default     | Description                                                               |
| :----------------- | :---------------- | :--------------------------------------------------------- | :---------- | :------------------------------------------------------------------------ |
| `open`             | `open`            | `boolean`                                                  | `false`     | Controls the visibility of the modal.                                     |
| `variant`          | `variant`         | `'default'\|'drawer'\|'alert'`                             | `'default'` | Core layout mode.                                                         |
| `size`             | `size`            | `'xs'\|'sm'\|'md'\|'lg'\|'xl'\|'full-width'\|'fullscreen'` | `'md'`      | Dialog dimensions.                                                        |
| `position`         | `position`        | `'center'\|'top'\|'bottom'\|'left'\|'right'\|...`          | `'center'`  | Screen positioning for default variant.                                   |
| `persistent`       | `persistent`      | `boolean`                                                  | `false`     | Prevent closing on backdrop click or Escape key (triggers shake instead). |
| `no-backdrop`      | `no-backdrop`     | `boolean`                                                  | `false`     | Hides the backdrop overlay and allows background interaction (modeless).  |
| `draggable`        | `draggable`       | `boolean`                                                  | `false`     | Allows dragging the modal by its header.                                  |
| `resizable`        | `resizable`       | `boolean`                                                  | `false`     | Adds 8-point resize handles to the modal edges.                           |
| `scrollable`       | `scrollable`      | `boolean`                                                  | `true`      | Body content scrolls while header/footer stay fixed.                      |
| `drawer-placement` | `drawerPlacement` | `'left'\|'right'`                                          | `'right'`   | Edge attachment for the drawer variant.                                   |
| `append-to`        | `appendTo`        | `string\|HTMLElement`                                      | `'body'`    | Selector or Element to teleport the modal into.                           |

#### Slots

- **Default Slot**: The main body content.
- **`header` Slot**: Overrides the title text.
- **`header-actions` Slot**: Insert custom buttons next to close/maximize.
- **`footer` Slot**: Bottom action bar content.
- **`icon` Slot**: (Alert variant only) Override the default status icon.

#### Events

- `vi-modal-before-open`: Fires immediately on `open=true` (cancelable).
- `vi-modal-open`: Fires as the modal begins opening.
- `vi-modal-after-open`: Fires after enter animations complete.
- `vi-modal-before-close`: Fires immediately on `open=false` (cancelable). Detail: `{ reason: string }`
- `vi-modal-close`: Fires as the modal begins closing. Detail: `{ reason: string }`
- `vi-modal-after-close`: Fires after exit animations complete and modal is removed.
- `vi-modal-request-close`: Fires when user attempts to close via backdrop/escape. Detail: `{ reason: 'escape' \| 'backdrop' }`

#### Snippets

**Standard Modal:**

```html
<vi-modal>
  <vi-modal-header slot="header" closable>Title</vi-modal-header>
  <p>Content</p>
  <vi-modal-footer slot="footer">
    <vi-button>Save</vi-button>
  </vi-modal-footer>
</vi-modal>
```

**Draggable & Resizable Modeless Dialog:**

```html
<vi-modal no-backdrop draggable resizable position="bottom-right">
  <vi-modal-header slot="header" closable>Floating Tool</vi-modal-header>
  <p>This modal doesn't block interaction with the page behind it!</p>
</vi-modal>
```

**Right-Side Drawer:**

```html
<vi-modal variant="drawer" drawer-placement="right" size="sm">
  <vi-modal-header slot="header" closable>Settings</vi-modal-header>
  <p>Drawer contents here...</p>
</vi-modal>
```

**Destructive Alert:**

```html
<vi-modal variant="alert" persistent>
  <vi-modal-header slot="header" alert-variant="danger" closable>Delete Workspace?</vi-modal-header>
  <p>This action cannot be undone. All data will be permanently lost.</p>
  <vi-modal-footer slot="footer">
    <vi-button variant="ghost">Cancel</vi-button>
    <vi-button variant="danger">Confirm Deletion</vi-button>
  </vi-modal-footer>
</vi-modal>
```

---

### Date Picker ([vi-date-picker](./src/date-picker/vi-date-picker.ts))

The [ViDatePicker](./src/date-picker/vi-date-picker.ts) is a powerful form-associated calendar control built on top of Flatpickr. It fully handles Shadow DOM retargeting, multiple calendar modes, custom locales, and complex date-range selections.

#### Properties & Attributes

| Attribute          | Property          | Type                            | Default     | Description                                      |
| :----------------- | :---------------- | :------------------------------ | :---------- | :----------------------------------------------- |
| `mode`             | `mode`            | `'date'\|'range'\|'month'\|'month-year'\|'year'\|'week'` | `'date'` | Determines the calendar view and selection behavior. |
| `value`            | `value`           | `string`                        | `''`        | Controlled input value (must be an ISO 8601 string). |
| `flat`             | `flat`            | `boolean`                       | `false`     | Renders the calendar inline instead of within a popup. |
| `hoist`            | `hoist`           | `boolean`                       | `false`     | Uses a fixed positioning strategy to escape clipping containers. |
| `min`              | `min`             | `string`                        | `''`        | Minimum selectable date (ISO string).            |
| `max`              | `max`             | `string`                        | `''`        | Maximum selectable date (ISO string).            |
| `locale`           | `locale`          | `string`                        | `'en'`      | BCP 47 locale tag (e.g., `'de-DE'`, `'fr-FR'`).  |
| `week-numbers`     | `weekNumbers`     | `boolean`                       | `false`     | Shows ISO week numbers on the left of the calendar. |
| `disabled`         | `disabled`        | `boolean`                       | `false`     | Disables interactions.                           |
| `required`         | `required`        | `boolean`                       | `false`     | Marks field validation as mandatory.             |
| `status`           | `status`          | `'default'\|'valid'\|'invalid'` | `'default'` | Controls validation visual presentation.         |
| `validity-message` | `validityMessage` | `string`                        | `''`        | Validation error message to display in UI.       |

#### Child Components (\`<vi-date-picker-input>\`)

The `<vi-date-picker>` acts as a wrapper container. The actual interactive input fields must be provided as children using `<vi-date-picker-input>`:
- **`kind`**: `'single' | 'from' | 'to'`. Use `'from'` and `'to'` when `mode="range"`.
- **`label`**: Optional label string displayed above the input.
- **`placeholder`**: The placeholder text when no date is selected.

#### Events

- `vialiq-change`: Fires when a date is selected or changed. Detail: `{ value: string, isoValue: string, formattedValue: string, rawValue: DateComponents, type: string, ... }`.

#### CSS Custom Properties

Exposes variables for custom theme styling (these cascade down to the hoisted calendar container as well):

```css
vi-date-picker {
  /* Controls the size of the individual day cell grid */
  --vi-date-picker-day-size: 32px;
  
  /* Popup calendar base styling */
  --vi-date-picker-calendar-bg: var(--vi-color-layer-01);
  --vi-date-picker-calendar-shadow: var(--vi-shadow-lg);

  /* Day states (hover, selected, today) */
  --vi-date-picker-day-hover-bg: var(--vi-color-layer-hover-01);
  --vi-date-picker-day-selected-bg: var(--vi-color-primary);
  --vi-date-picker-day-selected-color: var(--vi-color-text-primary-inverse);
  --vi-date-picker-day-today-border: var(--vi-color-primary);
}
```

#### Snippets

**Basic Date Selection:**
```html
<vi-date-picker name="birthday">
  <vi-date-picker-input label="Birthday" placeholder="YYYY-MM-DD"></vi-date-picker-input>
</vi-date-picker>
```

**Range Selection (Start & End Inputs):**
When using `mode="range"`, provide two input children marked with `kind="from"` and `kind="to"`.

```html
<vi-date-picker mode="range" name="vacation">
  <vi-date-picker-input kind="from" label="Start Date" placeholder="Select Start"></vi-date-picker-input>
  <vi-date-picker-input kind="to" label="End Date" placeholder="Select End"></vi-date-picker-input>
</vi-date-picker>
```

**Month, Year, and Week Selection:**
```html
<!-- Month and Year -->
<vi-date-picker mode="month-year" name="expiry">
  <vi-date-picker-input label="Card Expiry" placeholder="YYYY-MM"></vi-date-picker-input>
</vi-date-picker>

<!-- ISO Week -->
<vi-date-picker mode="week" name="sprint">
  <vi-date-picker-input label="Sprint Week" placeholder="YYYY-Www"></vi-date-picker-input>
</vi-date-picker>
```

**Flat Inline Calendar:**
```html
<vi-date-picker flat mode="date" value="2025-01-01">
  <!-- No inputs needed when flat=true, the calendar renders inline -->
</vi-date-picker>
```

**Hoisted Calendar (For escaping `overflow: hidden` containers):**
By setting the `hoist` attribute, the date picker popup will use `position: fixed` to ensure it breaks out of any restrictive parent containers.

```html
<div style="overflow: hidden; height: 100px; padding: 20px;">
  <vi-date-picker hoist name="appointment">
    <vi-date-picker-input label="Book Appointment" placeholder="Select a date..."></vi-date-picker-input>
  </vi-date-picker>
</div>
```

**Programmatic Value Updates:**
The `value` property can be set directly via JavaScript. The value should always be an **ISO 8601 string**, regardless of the configured locale or display mode.

```html
<vi-date-picker id="start-date" mode="date"></vi-date-picker>

<script>
  const picker = document.getElementById('start-date');
  
  // Update value programmatically
  picker.value = '2026-10-12';
  
  // Format guide by mode:
  // - date: 'YYYY-MM-DD'
  // - month / month-year: 'YYYY-MM'
  // - year: 'YYYY'
  // - week: 'YYYY-Www'
  // - range: 'YYYY-MM-DD to YYYY-MM-DD'
</script>
```

---

## Form Validation & ElementInternals

Custom controls inside this library utilize the native browser [ValidityMixin](./src/base/validity-mixin.ts) to integrate with standard `<form>` features like `.elements`, `.checkValidity()`, and `.reportValidity()`.

### Handling Submit Validation

```html
<form id="profile-form">
  <vi-input type="text" name="fullname" placeholder="John Doe" required>
    <span slot="helper">Enter your full name.</span>
  </vi-input>

  <vi-checkbox name="newsletter" required> Confirm subscription policy </vi-checkbox>

  <vi-button type="submit" variant="primary">Submit</vi-button>
</form>

<script>
  const form = document.getElementById('profile-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Checks validity for all elements in the form
    if (form.checkValidity()) {
      const formData = new FormData(form);
      console.log('Valid data submitted: ', Object.fromEntries(formData));
    } else {
      console.warn('Form validation failed.');
    }
  });
</script>
```

### Custom Error Reporting

Use `setCustomValidity` to configure custom error messages or run manual server-side validation responses:

```javascript
const emailField = document.querySelector('vi-input[name="email"]');

emailField.addEventListener('vialiq-change', (e) => {
  const email = e.detail.value;

  if (email.endsWith('@forbidden-domain.com')) {
    emailField.setCustomValidity('Registrations from this domain are forbidden.');
    emailField.reportValidity(); // Displays the custom validation message tooltip
  } else {
    emailField.setCustomValidity(''); // Clear errors
  }
});
```

---

## CSS Styling & Shadow Parts

Web Components utilize CSS Shadow Roots to encapsulate logic and layout styles. To override designs safely without bleeding global configurations, use **CSS Shadow Parts** or **CSS Variables**.

### CSS Shadow Parts (`::part`)

Elements expose internal sub-nodes through the `part="..."` syntax. Customize these nodes using the CSS `::part()` selector:

```css
/* Change focus border styles on the vi-input inner input tag */
vi-input::part(input) {
  border-radius: 8px;
  background: #f9fafb;
}

/* Customise helper text color */
vi-input::part(helper) {
  color: #4b5563;
}

/* Style the checkbox custom drawn frame box */
vi-checkbox::part(box) {
  border: 2px solid #6b7280;
}
```

### CSS Variables Custom Properties

For variables used repeatedly, custom elements offer direct CSS property bindings. Customize them globally or on single layouts:

```css
/* Custom variables declared on theme layers */
:root {
  --vi-input-border-color: #6366f1;
  --vi-input-focus-ring-color: #818cf8;
}

/* Specific class styling override */
.danger-zone {
  --vi-input-border-color: #ef4444;
  --vi-input-focus-ring-color: #fca5a5;
}
```

---

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

---

### Badge ([vi-badge](./src/badge/vi-badge.ts))

The `<vi-badge>` is a compact inline indicator used to communicate status, category, or count. It supports various color semantics, sizes, pill vs. square shapes, dot-only mode, and numeric count capping.

#### Properties & Attributes

| Attribute   | Property   | Type                                                           | Default     | Description                                                             |
| :---------- | :--------- | :------------------------------------------------------------- | :---------- | :---------------------------------------------------------------------- |
| `variant`   | `variant`  | `'neutral'\|'primary'\|'success'\|'warning'\|'danger'\|'info'` | `'neutral'` | Color semantic.                                                         |
| `size`      | `size`     | `'sm'\|'md'\|'lg'`                                             | `'md'`      | Size of the badge.                                                      |
| `dot`       | `dot`      | `boolean`                                                      | `false`     | Renders a small colored dot instead of text.                            |
| `pill`      | `pill`     | `boolean`                                                      | `true`      | Renders fully rounded ends (pill) vs slightly rounded corners (square). |
| `count`     | `count`    | `number`                                                       | `undefined` | Numeric count to display. Overrides default slot content.               |
| `show-zero` | `showZero` | `boolean`                                                      | `false`     | Displays the badge even if the count is zero.                           |
| `max`       | `max`      | `number`                                                       | `99`        | Max count before showing `{max}+`.                                      |
| `outline`   | `outline`  | `boolean`                                                      | `false`     | Renders the badge with an outline/ghost style.                          |

#### Slots

- **Default Slot**: Badge text content (ignored if `count` is set).
- **`icon` Slot**: Optional leading icon.

#### Snippets

**Standard Variants:**

```html
<vi-badge variant="neutral">Draft</vi-badge>
<vi-badge variant="primary">Submitted</vi-badge>
<vi-badge variant="success">Locked</vi-badge>
<vi-badge variant="warning">In Review</vi-badge>
<vi-badge variant="danger">Query Open</vi-badge>
```

**Outlined & Square Styles:**

```html
<vi-badge variant="info" outline>Outline Mode</vi-badge> <vi-badge variant="primary" :pill="false">Square Badge</vi-badge>
```

**Numeric Counts:**

```html
<vi-badge count="5" variant="danger"></vi-badge> <vi-badge count="120" max="99" variant="danger"></vi-badge>
```

**Dot Indicators:**

```html
<vi-badge dot variant="success"></vi-badge>
```

---

### Chip & Chip Group ([vi-chip](./src/chip/vi-chip.ts), [vi-chip-group](./src/chip/vi-chip-group.ts))

The `<vi-chip>` is an interactive pill-shaped element used for selection, filtering, or categorisation. Chips are usually managed inside a `<vi-chip-group>`, which provides multi-select or single-select logic and arrow-key navigation.

#### `<vi-chip>` Properties & Attributes

| Attribute           | Property          | Type                                                           | Default     | Description                                          |
| :------------------ | :---------------- | :------------------------------------------------------------- | :---------- | :--------------------------------------------------- |
| `value`             | `value`           | `string`                                                       | `''`        | Value used for selection tracking within a group.    |
| `selected`          | `selected`        | `boolean`                                                      | `false`     | Sets the active/selected visual state and checkmark. |
| `disabled`          | `disabled`        | `boolean`                                                      | `false`     | Makes the chip non-interactive.                      |
| `removable`         | `removable`       | `boolean`                                                      | `false`     | Shows a trailing "×" remove button.                  |
| `variant`           | `variant`         | `'neutral'\|'primary'\|'success'\|'warning'\|'danger'\|'info'` | `'neutral'` | Color semantic.                                      |
| `size`              | `size`            | `'sm'\|'md'\|'lg'`                                             | `'md'`      | Size of the chip.                                    |
| `remove-aria-label` | `removeAriaLabel` | `string`                                                       | `'Remove'`  | Accessible label for the remove button.              |

**`<vi-chip>` Slots:**

- **Default Slot**: Label text content.
- **`avatar` Slot**: Leading avatar image or initials.
- **`icon` Slot**: Leading icon (used when no avatar).
- **`trailing-icon` Slot**: Trailing icon (separate from the remove button).

#### `<vi-chip-group>` Properties & Attributes

| Attribute  | Property   | Type       | Default | Description                                                  |
| :--------- | :--------- | :--------- | :------ | :----------------------------------------------------------- |
| `value`    | `value`    | `string[]` | `[]`    | Array of currently selected chip values.                     |
| `multi`    | `multi`    | `boolean`  | `true`  | Allows multiple selections vs. single selection.             |
| `name`     | `name`     | `string`   | `''`    | Form field name for native form participation.               |
| `required` | `required` | `boolean`  | `false` | Requires at least one chip to be selected for form validity. |
| `disabled` | `disabled` | `boolean`  | `false` | Disables all child chips.                                    |
| `wrap`     | `wrap`     | `boolean`  | `true`  | Controls whether chips wrap to the next line.                |
| `gap`      | `gap`      | `string`   | `'8px'` | Gap spacing between chips.                                   |

**`<vi-chip-group>` Events:**

- `vi-chip-group-change`: Fired when the selection changes (event detail contains `value: string[]`).

#### Snippets

**Multi-Select Group:**

```html
<vi-chip-group multi name="grades" value='["grade-1"]'>
  <vi-chip value="grade-1">Grade 1</vi-chip>
  <vi-chip value="grade-2">Grade 2</vi-chip>
  <vi-chip value="grade-3" variant="warning">Grade 3</vi-chip>
  <vi-chip value="grade-4" variant="danger">Grade 4</vi-chip>
</vi-chip-group>
```

**Single-Select Group:**

```html
<vi-chip-group :multi="false" name="visit">
  <vi-chip value="1" variant="primary">Visit 1</vi-chip>
  <vi-chip value="2" variant="primary">Visit 2</vi-chip>
</vi-chip-group>
```

---

---

---

### Switch ([vi-switch](./src/switch/vi-switch.ts))

The `<vi-switch>` component is a form-associated toggle switch used for boolean settings. It supports size variants, custom label placements, and native HTML form participation.

#### Properties & Attributes

| Attribute         | Property         | Type               | Default | Description                                           |
| :---------------- | :--------------- | :----------------- | :------ | :---------------------------------------------------- |
| `checked`         | `checked`        | `boolean`          | `false` | Checked state of the switch.                          |
| `disabled`        | `disabled`       | `boolean`          | `false` | Disables the switch.                                  |
| `size`            | `size`           | `'sm'\|'md'\|'lg'` | `'md'`  | Visual size scale.                                    |
| `label-placement` | `labelPlacement` | `'start'\|'end'`   | `'end'` | Placement of the label relative to the switch toggle. |
| `name`            | `name`           | `string`           | `''`    | Form field name.                                      |
| `value`           | `value`          | `string`           | `'on'`  | Form submission value when checked.                   |

**Slots:**

- **Default Slot**: Label text/content.
- **`on-label` Slot**: Optional text displayed inside the track when checked.
- **`off-label` Slot**: Optional text displayed inside the track when unchecked.

**Events:**

- `vi-switch-change`: Fires when the user toggles the checked state. (Detail: `{ checked: boolean }`).

#### Snippets

**Basic Usage:**

```html
<vi-switch>Enable Notifications</vi-switch>
<vi-switch checked>Marketing Emails</vi-switch>
<vi-switch disabled>Disabled Toggle</vi-switch>
```

**Custom Label Placement & Sizes:**

```html
<!-- Label to the left of the switch -->
<vi-switch label-placement="start" size="lg">Auto-save</vi-switch>
<vi-switch size="sm">Compact Mode</vi-switch>
```

---

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
