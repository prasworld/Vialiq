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

# If you plan to use programmatic services (like Toast or Message):
npm install tsyringe reflect-metadata
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

### Label ([vi-label](./src/label/vi-label.ts))

The [ViLabel](./src/label/vi-label.ts) is a styled `<label>` component for associating visible text with form controls. It supports required/optional indicators and inline help tooltips. Because it uses Shadow DOM, it automatically maps click and focus events to target controls and manages `aria-labelledby` across the Shadow boundary for accessibility.

#### Properties & Attributes

| Attribute  | Property   | Type                               | Default     | Description                                |
| :--------- | :--------- | :--------------------------------- | :---------- | :----------------------------------------- |
| `for`      | `for`      | `string`                           | `''`        | ID of the target control to focus/click.   |
| `required` | `required` | `boolean`                          | `false`     | Shows a `*` indicator.                     |
| `optional` | `optional` | `boolean`                          | `false`     | Shows "(optional)" text.                   |
| `disabled` | `disabled` | `boolean`                          | `false`     | Muted disabled styling.                    |
| `size`     | `size`     | `'sm'\|'md'\|'lg'`                 | `'md'`      | Font size variant.                         |
| `layout`   | `layout`   | `'stacked'\|'inline'`              | `'stacked'` | Controls margin and inline-flex spacing.   |
| `type`     | `type`     | `'default'\|'primary'\|'secondary'`| `'default'` | Semantic text color for emphasis.          |

#### Slots

- **Default Slot**: Label text content.
- **`tooltip` Slot**: Optional icon/element that triggers an inline tooltip (renders to the right of the label text).

#### CSS Shadow Parts

Since `vi-label` uses Shadow DOM, you can override its internal styles using CSS shadow parts (`::part`):

```css
vi-label::part(label) {
  --vi-label-font-size: var(--vi-font-size-sm);
  --vi-label-font-weight: var(--vi-font-weight-medium);
  --vi-label-color: var(--vi-text-primary);
  /* Other styles... */
}

vi-label::part(required-indicator) {
  color: red;
}
```

The available parts are:
- `label`: The internal `<label>` container.
- `required-indicator`: The `*` span.
- `optional-indicator`: The `(optional)` span.
- `tooltip-trigger`: The wrapper around the tooltip slot.

#### Snippets

**Basic Standard Usage:**
```html
<vi-label for="first-name" required>First Name</vi-label>
<vi-input id="first-name" name="firstName"></vi-input>
```

**Optional & Inline:**
```html
<div style="display: flex; align-items: center;">
  <vi-label for="promo-code" layout="inline" optional>Promo Code</vi-label>
  <vi-input id="promo-code" name="promoCode"></vi-input>
</div>
```

**With Semantic Type and Tooltip:**
```html
<vi-label for="cvv-input" type="primary">
  Card Security Code
  <vi-tooltip slot="tooltip" content="3 digits on back of card">
    <vi-icon name="info-circle"></vi-icon>
  </vi-tooltip>
</vi-label>
<vi-input id="cvv-input" type="password"></vi-input>
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
- `vi-modal-close-request`: Fires when user attempts to close via backdrop/escape. Detail: `{ reason: 'escape' \| 'backdrop' }`

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

### Spin ([vi-spin](./src/spin/vi-spin.ts))

The `<vi-spin>` component is a highly versatile loading indicator. It provides a visual spinner for data fetching states and can optionally act as a full overlay (dimming its children) or a fullscreen backdrop. It supports determinate progress, multiple visual variants, and completely custom SVG/Lottie indicators.

#### Properties & Attributes

| Attribute    | Property     | Type                        | Default | Description                                                        |
| :----------- | :----------- | :-------------------------- | :------ | :----------------------------------------------------------------- |
| `spinning`   | `spinning`   | `boolean`                   | `true`  | Controls whether the spinner is active and visible.                |
| `variant`    | `variant`    | `'arc'\|'dots'`             | `'arc'` | The visual design of the built-in spinner.                         |
| `size`       | `size`       | `'sm'\|'md'\|'lg'`          | `'md'`  | The physical dimensions of the spinner graphic.                    |
| `percent`    | `percent`    | `number`                    | `undefined` | Converts the arc variant into a determinate progress ring (0-100). |
| `fullscreen` | `fullscreen` | `boolean`                   | `false` | Renders a fixed backdrop that covers the entire viewport.          |
| `tip`        | `tip`        | `string`                    | `''`    | Custom text label displayed directly underneath the spinner.       |
| `delay`      | `delay`      | `number`                    | `undefined` | Debounce time (ms) to wait before rendering to prevent flashing.   |

#### Slots

- **Default Slot**: Place content here to have the `<vi-spin>` automatically overlay and blur it when `spinning="true"`.
- **`indicator` Slot**: Replace the built-in spinner graphic entirely with your own custom HTML, SVGs, or `lottie-player`.

#### Snippets

**Basic Usage & Variants:**

```html
<vi-spin tip="Loading Default (Arc)..."></vi-spin>
<vi-spin variant="dots" tip="Legacy Dots"></vi-spin>
```

**Determinate Progress:**
When tracking measurable progress (like a file upload), pass a `percent` value to the `arc` variant.

```html
<vi-spin percent="75" tip="Uploading... 75%"></vi-spin>
```

**Debounced Delay (No-Flash):**
If a request completes very quickly, showing a spinner for 10ms causes an ugly visual flash. Use `delay` to ensure the spinner only mounts if the operation takes longer than the specified threshold.

```html
<vi-spin delay="500" tip="Fetching heavy data...">
  <!-- If data loads in 200ms, the user will never see a spinner -->
  <div>Content block here...</div>
</vi-spin>
```

**Nested Content Overlay:**
When you provide children to the `<vi-spin>`, it automatically creates a relative bounding box, dims the children, and centers the spinner over them.

```html
<vi-spin spinning="true" tip="Saving changes...">
  <form>
    <vi-input placeholder="Name"></vi-input>
    <vi-button>Submit</vi-button>
  </form>
</vi-spin>
```

**Fullscreen Mode:**
Trigger a `position: fixed` overlay that blocks the entire screen.

```html
<vi-spin fullscreen tip="Initializing Application..."></vi-spin>
```

**Custom Indicator (Lottie Animation):**
If you want to use a completely custom animation, utilize the `indicator` slot.

```html
<vi-spin tip="Processing payment...">
  <lottie-player 
    slot="indicator"
    src="https://assets2.lottiefiles.com/packages/lf20_usmfx6bp.json"
    background="transparent" 
    speed="1" 
    style="width: 60px; height: 60px;" 
    loop 
    autoplay
  ></lottie-player>
</vi-spin>
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

### Time Picker ([vi-time-picker](./src/time-picker/vi-time-picker.ts))

The **Time Picker** ([ViTimePicker](./src/time-picker/vi-time-picker.ts)) is a form-associated, accessible, discrete time-of-day input component. It is engineered for clinical Electronic Data Capture (EDC), laboratory information management systems (LIMS), and high-throughput enterprise forms.

#### Key Capabilities
- **WAI-ARIA Spinbutton Input Segments:** Discrete numeric input segments for hours, minutes, and optional seconds with complete keyboard accessibility (`ArrowUp`/`ArrowDown` stepping, `PageUp`/`PageDown` jumps, `Home`/`End` bounds, and `A`/`P` period toggles).
- **Dual Interaction Architecture:** Direct in-place keyboard segment entry combined with a floating Flatpickr time scroll popup.
- **12-Hour & 24-Hour Clocks:** Full ISO 24-hour (`14:30`) and 12-hour AM/PM (`02:30 PM`) format conversion, normalization, and validation.
- **Clinical EDC Unknown Time (CDISC SDTM):** Built-in support for capturing protocol-compliant unknown or unrecorded times (`??:??` or `??:??:??`) and partial unknowns (`14:??`, `??:30`) via `allow-unknown` without triggering invalid form states.
- **Safe Baseline Stepping:** Stepping on partial unknowns treats wildcards (`??`) as numeric baselines (0 for minutes/seconds, 12/0 for hours), stepping cleanly without producing `NaN` or corrupting strings to `"14:NaN"`.
- **Sequential Popup Keyboard Navigation:** Full <kbd>Tab</kbd> and <kbd>Shift+Tab</kbd> cyclic focus traversal within Flatpickr popup inputs.
- **WHATWG Form Participation:** Native form association via `ElementInternals`, standard `checkValidity()`, `reportValidity()`, and `FormData` participation.
- **Dependency Inversion Locale Registry (`tsyringe`):** Dynamic runtime locale registration and async loader extension powered by `tsyringe` without hardcoded library dependencies.

#### Properties & Attributes

| Attribute | Property | Type | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `value` | `value` | `string` | `''` | Formatted time string (`'14:30'`, `'02:30 PM'`, `'??:??'`, or `'14:??'`). |
| `name` | `name` | `string` | `''` | Form field identifier for native form submission. |
| `format` | `format` | `'12' \| '24'` | `'24'` | 12-hour (with AM/PM button) or 24-hour time clock. |
| `step` | `step` | `number` | `15` | Minute step increment (`1`, `5`, `10`, `15`, `30`). |
| `hour-step` | `hourStep` | `number` | `1` | Hour step increment (`1`, `2`, `4`). |
| `second-step` | `secondStep` | `number` | `1` | Second step increment (`1`, `5`, `10`). |
| `show-seconds` | `showSeconds` | `boolean` | `false` | Enables seconds segment (`HH:mm:ss` or `hh:mm:ss A`). |
| `show-now` | `showNow` | `boolean` | `false` | Renders a "Now" button for single-click system clock capture. |
| `clearable` | `clearable` | `boolean` | `false` | Displays a clear ("×") button when a value is present. |
| `timezone` | `timezone` | `string` | `''` | Timezone context badge and ISO offset indicator (e.g. `'UTC'`, `'EST'`). |
| `min` | `min` | `string` | `''` | Minimum allowable time (`HH:mm` or `HH:mm:ss`). |
| `max` | `max` | `string` | `''` | Maximum allowable time (`HH:mm` or `HH:mm:ss`). |
| `label` | `label` | `string` | `''` | Text label rendered above the control. |
| `helper-text` | `helperText` | `string` | `''` | Subordinate helper text displayed beneath the control. |
| `disabled` | `disabled` | `boolean` | `false` | Disables all user interactions. |
| `disabledHours` | `disabledHours` | `number[] \| DisabledHoursFn` | `null` | Blackout hours list or predicate function `(h: number) => boolean`. |
| `disabledMinutes` | `disabledMinutes` | `number[] \| DisabledMinutesFn` | `null` | Blackout minutes list or predicate function `(m: number, h?: number) => boolean`. |
| `disabledSeconds` | `disabledSeconds` | `number[] \| DisabledSecondsFn` | `null` | Blackout seconds list or predicate function `(s: number, m?: number, h?: number) => boolean`. |
| `required` | `required` | `boolean` | `false` | Marks field validation as mandatory. |
| `readonly` | `readonly` | `boolean` | `false` | Prevents value editing while participating in form submission. |
| `allow-unknown` | `allowUnknown` | `boolean` | `false` | Enables clinical "Time unknown" (`??:??` / `14:??`) CDISC SDTM mode. |
| `hoist` | `hoist` | `boolean` | `false` | Hoists popup via fixed positioning to escape clipping parents. |
| `status` | `status` | `'default' \| 'valid' \| 'invalid'` | `'default'` | Controls validation visual presentation. |
| `validity-message`| `validityMessage`| `string` | `''` | Custom or native validation error message. |
| `locale` | `locale` | `string \| null` | `null` | BCP 47 locale tag (`'sv'`, `'fr'`, `'de'`, etc.). |
| `config` | `config` | `Partial<TimePickerConfig>` | `{}` | Reactive configuration object for placeholders, labels, and messages. |
| `i18n` | `i18n` | `Partial<TimePickerI18n>` | `{}` | Alias for `config`. |

#### Slots

- **`label` Slot**: Location to insert a custom label element above the control.
- **`helper` Slot**: Location to insert custom helper description text below the control.

#### CSS Parts

- `control`: The outer flex container wrapping segment inputs and buttons.
- `hours-input`: The hours numeric input field.
- `minutes-input`: The minutes numeric input field.
- `seconds-input`: The seconds numeric input field (when `show-seconds` is enabled).
- `separator`: The colon (`:`) separator spans.
- `period-btn`: The interactive AM/PM toggle button (12-hour format).
- `now-btn`: The quick "Now" current timestamp button (when `show-now` is enabled).
- `clear-btn`: The clear ("×") button (when `clearable` is enabled).
- `clock-btn`: The clock popup trigger button.
- `timezone-badge`: The timezone indicator badge (when `timezone` is set).
- `unknown-wrapper`: The container wrapping the "Time unknown" checkbox and label.
- `unknown-checkbox`: The "Time unknown" checkbox input.
- `label`: The rendered label text.
- `helper`: The rendered helper text.
- `validation`: The validation error message span.

#### Events

- `vi-time-picker-change`: Fires when a time value is committed. Detail: `TimePickerChangeDetail` (`{ value, isoValue, hours, minutes, seconds, period, isUnknown, isPartialUnknown, timezone, formattedValue }`).
- `vialiq-change`: Legacy event alias for backwards compatibility. Detail: `TimePickerChangeDetail`.
- `vialiq-clear`: Fires when the clear button is clicked.
- `invalid`: Native HTML5 validation failed event.

#### Imperative Methods

- `focus(options?: FocusOptions)`: Focuses the hours input segment.
- `clear()`: Clears the value, resets Flatpickr, and dispatches change events.
- `open()`: Programmatically opens the Flatpickr scroll popup.
- `close()`: Programmatically closes the Flatpickr scroll popup.
- `setCurrentTime()` / `now()`: Sets the control to current system clock time and commits changes.
- `stepUp(segment = 'minutes')`: Increments the specified segment by its configured step. Treats partial unknowns as defined numeric baselines without producing `NaN`.
- `stepDown(segment = 'minutes')`: Decrements the specified segment by its configured step. Treats partial unknowns as defined numeric baselines with wrap-around without producing `NaN`.
- `setConfig(updates)`: Merges partial updates into the reactive configuration object.
- `checkValidity()`: Returns boolean validity without updating visual status.
- `reportValidity()`: Validates, reflects visual status (`valid`/`invalid`), and shows error message.
- `setCustomValidity(message)`: Sets a custom validation error message.

#### Keyboard Navigation

- **Segment Inputs:**
  - <kbd>Tab</kbd> / <kbd>:</kbd>: Auto-advances to the next segment (`hours` &rarr; `minutes` &rarr; `seconds` &rarr; `period-btn`).
  - <kbd>Shift + Tab</kbd> / <kbd>Backspace</kbd> (in empty input): Moves focus to previous segment.
  - <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd>: Steps focus left/right across segments.
  - <kbd>ArrowUp</kbd> / <kbd>ArrowDown</kbd>: Increments / decrements the segment (wraps around; safely steps wildcards from baseline 0/12).
  - <kbd>PageUp</kbd> / <kbd>PageDown</kbd>: Major jumps (+5 for hours, +15 for minutes/seconds).
  - <kbd>Home</kbd> / <kbd>End</kbd>: Sets segment to its minimum or maximum bound.
  - <kbd>A</kbd> / <kbd>P</kbd>: Toggles between `AM` and `PM` in 12-hour format.
  - <kbd>Alt + ArrowDown</kbd>: Opens the time scroll popup.
  - <kbd>?</kbd>: Types CDISC wildcard (`??`) into the segment.
- **Popup Navigation:**
  - <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd>: Sequentially navigates through popup inputs (`Hour` &rarr; `Minute` &rarr; `Second` &rarr; `AM/PM` &rarr; wrap).
  - <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd>: Navigates adjacent spinbuttons in popup.
  - <kbd>ArrowUp</kbd> / <kbd>ArrowDown</kbd>: Adjusts time values within popup.
  - <kbd>Enter</kbd>: Commits selected popup time, closes popup, and restores focus to `clock-btn`.
  - <kbd>Escape</kbd>: Closes popup and restores focus to `clock-btn`.

---

#### Clock Variations & Extensions

##### 1. 24-Hour Default Clock (HH:mm)
```html
<vi-time-picker label="Meeting Start" value="14:30" helper-text="Select 24h meeting time"></vi-time-picker>
```

##### 2. 12-Hour Clock with AM/PM Period Toggle
Pressing `A` or `P` on the keyboard or clicking the AM/PM button flips the clock period instantly:
```html
<vi-time-picker format="12" label="Appointment Time" value="09:15 AM"></vi-time-picker>
```

##### 3. High-Precision Seconds (HH:mm:ss)
```html
<vi-time-picker show-seconds label="Audit Log Timestamp" value="16:45:30"></vi-time-picker>
```

##### 4. Stepped Increments & Min / Max Range Constraints
Arrow key steps increment in 15-minute blocks and validate against operational business hours:
```html
<vi-time-picker
  step="15"
  min="08:00"
  max="17:00"
  label="Operating Shift"
  helper-text="Must be between 08:00 and 17:00 (15-min increments)"
></vi-time-picker>
```

##### 5. Clinical EDC Partial/Unknown Time (`allow-unknown` / `??:??`)
In clinical trials, partial or unknown adverse event times are compliant with CDISC SDTM standards (`??:??`):
```html
<vi-time-picker
  allow-unknown
  label="Dose Administration Time"
  value="??:??"
  helper-text="Check 'Time unknown' if exact time cannot be determined"
></vi-time-picker>
```

##### 6. Clearable & Hoisted Popups (Modal Escape)
When rendered inside tight `overflow: hidden` parent containers or tables, enable `hoist` to position the popup with `position: fixed`:
```html
<div style="overflow: hidden; height: 100px;">
  <vi-time-picker hoist clearable label="Departure Time" value="18:30"></vi-time-picker>
</div>
```

##### 7. Instant "Now" Quick Action (`show-now`)
Enterprise clinical CRF and workflow logs require single-click current time capture. Enabling `show-now` renders a high-visibility button, also accessible via `.setCurrentTime()` or `.now()`:
```html
<vi-time-picker
  show-now
  clearable
  label="Medication Administration Time"
  helper-text="Click 'Now' to timestamp with the exact system clock"
></vi-time-picker>
```

##### 8. Multi-Site Clinical Timezone Context (`timezone`)
Displays a site/time zone indicator badge and normalizes ISO serializations (e.g. `14:30Z` or `14:30+05:30`):
```html
<vi-time-picker
  timezone="UTC"
  value="14:30"
  label="Adverse Event Onset"
  helper-text="Emits isoValue: 14:30Z in change event details"
></vi-time-picker>
```

##### 9. CDISC SDTM Segment-Level Partial Unknown Times
In accordance with FDA / CDISC SDTM clinical specifications, subjects who remember only a partial time (e.g. hour 14 but unknown minutes: `14:??`, or minutes only: `??:30`) can record partial unknowns. The "Time unknown" checkbox reflects this state as **indeterminate** (`-`) and validation constraints bypass gracefully without failing forms:
```html
<vi-time-picker
  allow-unknown
  value="14:??"
  label="Symptom Resolution"
  helper-text="Checkbox displays indeterminate state for partial unknowns"
></vi-time-picker>
```

##### 10. Intelligent Clipboard Paste Support
Users can copy and paste time strings in any standard enterprise or military notation directly into the control:
- 24-Hour: `"14:30"`, `"14:30:45"`
- 12-Hour: `"02:30 PM"`, `"2:30pm"`, `"11:15 AM"`
- Military Compact Digits: `"1430"`, `"930"`, `"143045"`
- Clinical Wildcards: `"14:??"`, `"??:??"`

##### 11. Restricted Scheduling & Blackout Times (`disabledHours` / `disabledMinutes` / `disabledSeconds`)
Prevent booking or logging during blackout windows using array lists or function predicates:
```typescript
const picker = document.querySelector('vi-time-picker');
// Blackout lunch hours 12:00 to 13:59
picker.disabledHours = [12, 13];
// Allow appointments only on 15-minute intervals
picker.disabledMinutes = (minute: number) => minute % 15 !== 0;
// Blackout specific seconds: [15, 30, 45] or predicate (s, m, h) => boolean
picker.disabledSeconds = [15, 30, 45];
```

##### 12. Independent Granular Stepping (`hour-step` / `second-step`)
Configure arrow key navigation independently across hours, minutes, and seconds:
```html
<vi-time-picker
  hour-step="2"
  step="30"
  second-step="10"
  show-seconds
  label="Telemetry Sampling Window"
></vi-time-picker>
```

---

#### Locale Registry & Dependency Inversion (`tsyringe`)

To satisfy the **Dependency Inversion Principle (DIP)** and prevent hardcoded static dictionaries, `vi-time-picker` decouples localization into a singleton registry service (`ViTimePickerLocaleRegistry`) managed by `tsyringe`.

High-level UI components and applications depend on the abstraction (`ITimePickerLocaleRegistry` or `TIME_PICKER_LOCALE_REGISTRY_TOKEN`), allowing applications to register new locales or custom asynchronous loaders at bootstrap.

##### Architecture & Resolution Flow
```
┌────────────────────────────────────────────────────────┐
│             ITimePickerLocaleRegistry (Token)          │
└───────────────────────────▲────────────────────────────┘
                            │ Implements & Resolves
┌───────────────────────────┴────────────────────────────┐
│          ViTimePickerLocaleRegistry (@singleton)       │
│   • Built-in: 'en', 'ja', 'zh', 'fr', 'de', 'es'       │
│   • Dynamic: registry.register('sv', {...})            │
│   • Async: registry.registerLoader(fetchLoader)        │
│   • Fallback: Unknown locale -> Automatic English ('en')│
└────────────────────────────────────────────────────────┘
```

##### Registering a New Locale Synchronously
In your application bootstrap or utility module:
```typescript
import 'reflect-metadata';
import { container } from 'tsyringe';
import { ViTimePickerLocaleRegistry } from '@vialiq/web-components/time-picker';

const registry = container.resolve(ViTimePickerLocaleRegistry);

// Register Swedish (sv) dynamically
registry.register('sv', {
  hoursPlaceholder: 'TT',
  minutesPlaceholder: 'MM',
  secondsPlaceholder: 'SS',
  unknownLabel: 'Okänd tid',
  clockAriaLabel: 'Välj tid från klocka',
  clearAriaLabel: 'Rensa tid',
  periodAriaLabel: 'Växla FM/EM, nu {period}',
  requiredMessage: 'Tid är obligatorisk.',
  invalidMessage: 'Ange en giltig tid.',
  minMessage: 'Välj en tid efter eller vid {min}.',
  maxMessage: 'Välj en tid före eller vid {max}.',
});
```
Any `<vi-time-picker locale="sv">` across your application now immediately renders `TT` and `MM` placeholders and Swedish clinical labels!

##### Registering an Asynchronous Loader (e.g. from `/assets/i18n`)
Load JSON translation files on demand without bundling them in your main JavaScript chunk:
```typescript
registry.registerLoader(async (locale: string) => {
  const response = await fetch(`/assets/i18n/time-picker/${locale}.json`);
  if (!response.ok) return null;
  return response.json();
});
```

##### Overriding Registry for Unit Testing (Dependency Inversion)
In your unit tests, you can easily substitute the registry with a mock without touching component code:
```typescript
import { container } from 'tsyringe';
import { TIME_PICKER_LOCALE_REGISTRY_TOKEN } from '@vialiq/web-components/time-picker';

container.register(TIME_PICKER_LOCALE_REGISTRY_TOKEN, {
  useValue: mockRegistryInstance,
});
```

---

#### Framework Integrations

##### 1. Angular Integration
Register `CUSTOM_ELEMENTS_SCHEMA` in your standalone component or module, and bind using reactive forms or template signals:

```typescript
// app.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import '@vialiq/web-components/time-picker';
import type { TimePickerChangeDetail } from '@vialiq/web-components/time-picker';

@Component({
  selector: 'app-time-demo',
  standalone: true,
  imports: [ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="form-group">
      <vi-time-picker
        label="Dose Administration Time"
        format="24"
        allow-unknown
        clearable
        [value]="timeControl.value"
        (vi-time-picker-change)="onTimeChange($event)"
      ></vi-time-picker>

      <p>Current Form Value: {{ timeControl.value }}</p>
    </div>
  `,
})
export class TimeDemoComponent {
  timeControl = new FormControl('14:30');

  onTimeChange(event: CustomEvent<TimePickerChangeDetail>) {
    this.timeControl.setValue(event.detail.value);
  }
}
```

##### 2. React Integration
Use a ref to listen to custom events or wrap it in a lightweight React component:

```tsx
// TimePickerField.tsx
import React, { useEffect, useRef } from 'react';
import '@vialiq/web-components/time-picker';
import type { TimePickerChangeDetail } from '@vialiq/web-components/time-picker';

interface TimePickerProps {
  label: string;
  value?: string;
  format?: '12' | '24';
  allowUnknown?: boolean;
  onChange?: (detail: TimePickerChangeDetail) => void;
}

export function TimePickerField({ label, value = '', format = '24', allowUnknown, onChange }: TimePickerProps) {
  const pickerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = pickerRef.current;
    if (!el) return;

    const handleChange = (e: CustomEvent<TimePickerChangeDetail>) => {
      onChange?.(e.detail);
    };

    el.addEventListener('vi-time-picker-change', handleChange as EventListener);
    return () => el.removeEventListener('vi-time-picker-change', handleChange as EventListener);
  }, [onChange]);

  return (
    <vi-time-picker
      ref={pickerRef}
      label={label}
      value={value}
      format={format}
      allow-unknown={allowUnknown ? '' : undefined}
    />
  );
}
```

##### 3. Vue 3 Integration
Configure custom elements in `vite.config.ts` (`compilerOptions.isCustomElement: tag => tag.startsWith('vi-')`) and bind with standard Vue template events:

```vue
<!-- TimePickerDemo.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import '@vialiq/web-components/time-picker';
import type { TimePickerChangeDetail } from '@vialiq/web-components/time-picker';

const eventTime = ref('09:15');
const isUnknown = ref(false);

function handleTimeChange(event: CustomEvent<TimePickerChangeDetail>) {
  eventTime.value = event.detail.value || '';
  isUnknown.value = event.detail.isUnknown;
}
</script>

<template>
  <div class="time-picker-card">
    <vi-time-picker
      label="Observation Time"
      :value="eventTime"
      format="24"
      allow-unknown
      clearable
      @vi-time-picker-change="handleTimeChange"
    ></vi-time-picker>

    <div class="summary">
      <span>Value: {{ eventTime }}</span>
      <span v-if="isUnknown" class="badge">CDISC Unknown</span>
    </div>
  </div>
</template>
```

##### 4. Vanilla JavaScript / TypeScript
Direct programmatic control, native form participation, and event subscription:

```html
<form id="vitals-form">
  <vi-time-picker
    id="pulse-time"
    name="pulseAssessmentTime"
    label="Vitals Assessment"
    format="12"
    show-seconds
    allow-unknown
    required
  ></vi-time-picker>

  <button type="submit">Record Vitals</button>
</form>

<script type="module">
  import '@vialiq/web-components/time-picker';

  const form = document.getElementById('vitals-form');
  const picker = document.getElementById('pulse-time');

  // Programmatic value updates
  picker.value = '10:15:30 AM';

  // Event listener for commit events
  picker.addEventListener('vi-time-picker-change', (e) => {
    console.log('Time changed:', e.detail.value);
    console.log('ISO normalized:', e.detail.isoValue); // "10:15:30"
    console.log('Is unknown:', e.detail.isUnknown);
  });

  // Native HTML5 Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    console.log('Submitted Time:', data.get('pulseAssessmentTime'));
  });
</script>
```

---

#### Passing Values Programmatically & Externally

Developers can set or update the time picker's value at runtime through multiple mechanisms:

##### 1. Direct Property Assignment (`.value`)
Setting the `.value` property is the standard and most direct approach in JavaScript/TypeScript:

```typescript
const picker = document.querySelector('vi-time-picker') as ViTimePicker;

// 24-hour time (HH:mm)
picker.value = '14:30';

// High-precision with seconds (HH:mm:ss)
picker.value = '14:30:45';

// 12-hour time with AM/PM period
picker.value = '02:30 PM';

// Clinical EDC complete unknown (CDISC SDTM)
picker.value = '??:??';

// Clinical EDC partial unknown (e.g. hour known, minute unknown)
picker.value = '14:??';
```

> **Lifecycle & State Syncing:** When `.value` is assigned programmatically:
> 1. In-place segmented inputs (`#hours-input`, `#minutes-input`, `#seconds-input`) are automatically synchronized.
> 2. The underlying Flatpickr scroll wheel popup is updated in real time.
> 3. Native WHATWG form value is updated via `_internals.setFormValue(this.value)`.
> 4. Form constraint validations (`min`, `max`, `required`, blackout hours) are re-evaluated.
> 5. If a partial unknown (`14:??`) is passed, the "Time unknown" checkbox automatically flips to `indeterminate`.

##### 2. Cross-Format Auto-Normalization
`vi-time-picker` intelligently parses and normalizes formats:
- Assigning `"14:30"` to a picker with `format="12"` automatically converts and displays `"02:30 PM"`.
- Assigning `"02:30 PM"` to a picker with `format="24"` automatically converts and displays `"14:30"`.
- Emits normalized 24-hour ISO string (`isoValue: "14:30"`) in change details regardless of visual format.

##### 3. Imperative Action Methods
Convenience methods are exposed directly on the custom element:

```typescript
// 1. Set current system clock time (also alias: picker.now())
picker.setCurrentTime();

// 2. Clear the time and reset validation state
picker.clear();

// 3. Step segments programmatically by their configured step intervals
picker.stepUp('minutes');    // Steps up by `step` (default: 15)
picker.stepDown('minutes');  // Steps down by `step`
picker.stepUp('hours');      // Steps up by `hour-step` (default: 1)
picker.stepDown('seconds');  // Steps down by `second-step` (default: 1)
```

##### 4. Declarative Template Bindings Across Frameworks
Because `value` is a reflected Lit property, frameworks bind to it seamlessly:

```html
<!-- HTML / Attribute -->
<vi-time-picker value="14:30"></vi-time-picker>

<!-- Lit Property Binding -->
<vi-time-picker .value=${selectedTime}></vi-time-picker>

<!-- React -->
<vi-time-picker value={selectedTime} onvi-time-picker-change={handleTimeChange} />

<!-- Angular -->
<vi-time-picker [value]="selectedTime" (vi-time-picker-change)="handleTimeChange($event)"></vi-time-picker>

<!-- Vue -->
<vi-time-picker :value="selectedTime" @vi-time-picker-change="handleTimeChange" />
```

##### 5. Native `<form>` Reset
When wrapped inside a standard HTML `<form>`, calling `form.reset()` automatically restores the picker to its initial value via `formResetCallback()`:

```typescript
const form = document.querySelector('form')!;
form.reset(); // Restores vi-time-picker back to its initial value
```

> **Event Dispatch Note:** In alignment with standard HTML5 `<input>` behavior, assigning `.value` directly does **not** dispatch the user-driven `vi-time-picker-change` event. However, imperative actions like `.setCurrentTime()`, `.clear()`, and `.stepUp()` **do** dispatch `vi-time-picker-change`.

---

### Toast & Message Services (\`vi-toast\`, \`vi-message\`)

The **Toast** and **Message** components are ephemeral, floating notifications triggered programmatically. Rather than manually mounting web components to the DOM, developers should use the provided Singleton services (\`ViToastService\` and \`ViMessageService\`) powered by \`tsyringe\`. 

These services handle DOM injection, automatic teardown, animation syncing, container limits (\`maxVisible\`), and queueing automatically.

#### Setting up the Services

Regardless of your framework, you should resolve the singleton service instances from \`tsyringe\` once at the application boundary, or directly within your utility files.

**Vanilla JS / TypeScript Setup:**
```typescript
import 'reflect-metadata';
import { container } from 'tsyringe';
import { ViToastService } from '@vialiq/web-components/toast';
import { ViMessageService } from '@vialiq/web-components/message';

export const toastService = container.resolve(ViToastService);
export const messageService = container.resolve(ViMessageService);

// Optional: Configure global defaults (e.g. at app bootstrap)
toastService.configure({ position: 'top-right', maxVisible: 3 });
messageService.configure({ maxVisible: 1 });
```

**React Setup:**
You can expose the resolved services through a context provider or a custom hook, or simply export them from a dedicated utility file.
```tsx
import { toastService, messageService } from './notification-services';
import { useEffect } from 'react';

export function NetworkStatusWatcher() {
  useEffect(() => {
    const handleOffline = () => {
      // 0 duration creates a sticky/persistent message
      messageService.error('Network disconnected. Attempting to reconnect...', 0);
    };
    
    window.addEventListener('offline', handleOffline);
    return () => window.removeEventListener('offline', handleOffline);
  }, []);
  
  return null;
}
```

**Vue Setup:**
You can provide the services globally or use them directly in the \`<script setup>\` tag.
```vue
<script setup>
import { toastService } from './notification-services';

const onSave = async () => {
  try {
    await saveDraft();
    toastService.show({ variant: 'success', title: 'Saved!', message: 'Draft saved successfully.' });
  } catch (e) {
    toastService.show({ variant: 'danger', title: 'Error', message: 'Failed to save.' });
  }
};
</script>
```

**Angular Setup:**
In Angular, you can wrap the service inside an \`Injectable\` so it integrates nicely with Angular's dependency injection system.
```typescript
import { Injectable } from '@angular/core';
import { container } from 'tsyringe';
import { ViToastService, ToastOptions } from '@vialiq/web-components/toast';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toast = container.resolve(ViToastService);

  showToast(options: ToastOptions) {
    return this.toast.show(options);
  }
}
```

#### Passing Custom DOM Elements (Custom Implementation)

Both \`Toast\` and \`Message\` services support passing raw HTML \`Node\` elements via the \`content\` property instead of basic strings. This allows you to construct highly complex, interactive layouts directly inside your notifications!

This is extremely powerful for building rich notifications (like retry dialogs, interactive prompts, or notifications with rich links).

**Vanilla JS Example:**
```typescript
const frag = document.createDocumentFragment();
const wrapper = document.createElement('div');
wrapper.innerHTML = \`
  <strong>Network Offline!</strong>
  <span style="display: block; margin-top: 4px;">
    Please check your cables. <a href="#" style="color: inherit;">Retry connection</a>
  </span>
\`;
frag.appendChild(wrapper);

// Pass the fragment as 'content'
messageService.error(frag, 0); // 0 = persistent/sticky
```

**React Example (Using Refs/Portals or React-DOM rendering):**
Since \`content\` expects a raw DOM Node, you can use \`ReactDOM.createRoot\` or raw DOM APIs to mount React trees into the notification body.
```tsx
import { createRoot } from 'react-dom/client';

const showCustomToast = () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  
  // Render your React component into the DOM node
  root.render(<MyCustomNotificationComponent onRetry={() => doRetry()} />);
  
  toastService.show({
    variant: 'warning',
    content: container,
    duration: 0, // sticky
    closable: false,
    onClose: () => {
      // Clean up React tree when notification is dismissed!
      root.unmount();
    }
  });
};
```

**Angular Example:**
```typescript
import { ComponentFactoryResolver, ApplicationRef, Injector, Injectable } from '@angular/core';

@Injectable()
export class CustomToastService {
  constructor(
    private resolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  showComponentToast() {
    const factory = this.resolver.resolveComponentFactory(MyAngularComponent);
    const componentRef = factory.create(this.injector);
    this.appRef.attachView(componentRef.hostView);
    
    toastService.show({
      variant: 'info',
      content: componentRef.location.nativeElement,
      onClose: () => {
        // Clean up Angular view when notification is dismissed!
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      }
    });
  }
}
```

#### Advanced Use Cases & Edge Cases

- **Sticky Overlays:** Pass \`duration: 0\` (or \`0\` as the second parameter to helper functions like \`messageService.error(..., 0)\`) to make the overlay persistent. It will only disappear if the user clicks the close icon, or if you programmatically invoke \`.dismiss(id)\`.
- **Handling Action Callbacks:** \`vi-toast\` allows rendering primary/secondary buttons inside the toast dynamically using the \`actions\` array property in options, which triggers the \`onAction\` callback.
- **Handling Cleanup:** You can attach an \`onClose\` callback listener in the options. This is essential if you rendered an entire framework component tree inside the Toast/Message (like React or Angular components) so you know exactly when to run garbage collection (like \`.destroy()\` in Angular or \`.unmount()\` in React).
- **CSS-safe IDs:** Unique DOM IDs are auto-generated via \`crypto.randomUUID()\` internally and are safely escapable across browser query selectors.

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

### Tabs ([vi-tabs](./src/tabs/vi-tabs.ts))

The Tabs component is a composite of `<vi-tabs>`, `<vi-tab>`, and `<vi-tab-panel>` used to organize content into separate views where only one view is visible at a time. It follows the WAI-ARIA tabs pattern and includes robust support for responsive overflow, dynamic closable tabs, and advanced layout variants.

#### Properties & Attributes

| Attribute    | Property   | Type                                 | Default        | Description                                            |
| :----------- | :--------- | :----------------------------------- | :------------- | :----------------------------------------------------- |
| `active`     | `active`   | `string`                             | `''`           | The `tab-id` of the currently active tab.              |
| `orientation`| `orientation` | `'horizontal'\|'vertical'`          | `'horizontal'` | The layout direction of the tablist.                   |
| `variant`    | `variant`  | `'line'\|'pill'\|'card'\|'enclosed'` | `'line'`       | Visual design variant of the tabs.                     |
| `overflow`   | `overflow` | `'scroll'\|'menu'\|'wrap'`           | `'scroll'`     | Defines behavior when tabs exceed container width.     |

#### Events & Architecture Note

Tabs use a mutually exclusive state (only one can be active at a time). Because of this, tabs are **"activated"** rather than "opened". There is no `vi-tab-before-open` event; instead, you intercept the activation of a tab at the container level using `vi-tabs-before-change`.

If you need to prevent a user from switching to a specific tab (e.g., due to unsaved changes or missing permissions), simply call `e.preventDefault()` on the `vi-tabs-before-change` event:

```javascript
tabs.addEventListener('vi-tabs-before-change', (e) => {
  if (e.detail.toTabId === 'restricted-tab' && !userHasAccess) {
    e.preventDefault(); // Stops the tab from "opening"
    alert('You do not have access to this tab!');
  }
});
```

For more detailed documentation, including slots, CSS parts, and custom properties, see the [Full Tabs Documentation](./docs/components/vi-tabs.md).

#### Snippets

**Standard Line Tabs:**

```html
<vi-tabs active="tab-1">
  <vi-tab tab-id="tab-1">Account</vi-tab>
  <vi-tab tab-id="tab-2">Security</vi-tab>
  
  <vi-tab-panel for="tab-1">Account settings content...</vi-tab-panel>
  <vi-tab-panel for="tab-2">Security settings content...</vi-tab-panel>
</vi-tabs>
```

**Variants & Overflow:**

```html
<vi-tabs variant="pill" overflow="menu" active="t1">
  <vi-tab tab-id="t1">Overview</vi-tab>
  <vi-tab tab-id="t2">Analytics</vi-tab>
  <vi-tab tab-id="t3" closable>Reports</vi-tab>
  
  <vi-tab-panel for="t1">...</vi-tab-panel>
  <vi-tab-panel for="t2">...</vi-tab-panel>
  <vi-tab-panel for="t3">...</vi-tab-panel>
</vi-tabs>
```

---

---

### Content Switcher ([vi-content-switcher](./src/content-switcher/vi-content-switcher.ts))

The [ViContentSwitcher](./src/content-switcher/vi-content-switcher.ts) provides a styled sliding-pill toggle control. It is functionally similar to a radio group but is designed for high-visibility UI switches (e.g., toggling between Code/Preview modes). It manages state via its `active` property and uses GPU-accelerated CSS custom properties for smooth indicator sliding.

#### Properties & Attributes

| Attribute  | Property   | Type                     | Default | Description                                 |
| :--------- | :--------- | :----------------------- | :------ | :------------------------------------------ |
| `value`    | `value`    | `string`                 | `''`    | The currently active item value.            |
| `size`     | `size`     | `'sm'\|'md'\|'lg'`       | `'md'`  | Visual size of the switcher.                |
| `disabled` | `disabled` | `boolean`                | `false` | Disables all interactions in the switcher.  |

#### Child Components (`<vi-switcher-item>`)

Each option within the switcher is a `<vi-switcher-item>`:
- **`value`**: The value to emit when selected. Must match the switcher's `value` to become active.
- **`disabled`**: Disables only this specific item.
- **Default Slot**: The text label for the item.

#### Events

- `vi-content-switcher-change`: Fires when the active item changes. Detail: `{ value: string, previousValue: string }`.

#### CSS Parts

- `track`: The outer pill container housing the items and indicator.
- `indicator`: The absolutely positioned sliding background highlight.

#### Snippets

**Basic Usage:**

```html
<vi-content-switcher value="design">
  <vi-switcher-item value="design">Design</vi-switcher-item>
  <vi-switcher-item value="json">JSON</vi-switcher-item>
  <vi-switcher-item value="preview">Preview</vi-switcher-item>
</vi-content-switcher>
```

**Sizes & Disabled:**

```html
<vi-content-switcher value="monthly" size="sm">
  <vi-switcher-item value="monthly">Monthly</vi-switcher-item>
  <vi-switcher-item value="annually" disabled>Annually</vi-switcher-item>
</vi-content-switcher>
```

---

### Masked Input ([vi-masked-input](./src/masked-input/vi-masked-input.ts))

The [ViMaskedInput](./src/masked-input/vi-masked-input.ts) is an advanced text input component extending `ViInput` that automatically formats user entry based on a predefined string pattern. It dynamically imports `imask` under the hood to ensure precise cursor management during pastes and rapid typing while keeping the initial bundle size small.

#### Properties & Attributes

*Inherits all properties from [ViInput](#input-vi-inputsrcinputvi-inputts) (e.g., `label`, `disabled`, `status`), plus:*

| Attribute  | Property   | Type     | Default | Description                                                     |
| :--------- | :--------- | :------- | :------ | :-------------------------------------------------------------- |
| `mask`        | `mask`        | `string` | `''`    | The fixed pattern format string (e.g. `(000) 000-0000`).        |
| `maskOptions` | `maskOptions` | `any`    | `null`  | Advanced IMask object for dynamic/regex masks (takes precedence). |
| `rawValue`    | `rawValue`    | `string` | `''`    | The unformatted value consisting of only valid mask characters. |

#### Events

*Note: Native generic input events are suppressed while masking is active to prevent duplication.*

- `vi-masked-input-change`: Fires when the value is committed on blur. Detail: `{ value: string, rawValue: string }`.
- `vi-masked-input-input`: Fires on every keystroke after formatting. Detail: `{ value: string, rawValue: string }`.

#### Snippets

**Phone Number Masking:**

```html
<vi-masked-input 
  name="phone" 
  label="Phone Number" 
  mask="(000) 000-0000" 
  placeholder="(555) 555-5555">
</vi-masked-input>
```

**Social Security Number (SSN):**

```html
<vi-masked-input 
  name="ssn" 
  label="SSN" 
  mask="000-00-0000" 
  placeholder="___-__-____">
</vi-masked-input>
```

**Pre-filling with Raw Data:**

```html
<!-- Component will automatically format the input to "(123) 456-7890" -->
<vi-masked-input 
  mask="(000) 000-0000" 
  raw-value="1234567890">
</vi-masked-input>
```

**Alphanumeric Formatting (Letters & Numbers):**

In the mask syntax: `0` restricts to numbers, `a` restricts to letters, and `*` allows any alphanumeric character.

```html
<!-- License Key (Allows both letters and numbers) -->
<vi-masked-input 
  name="license" 
  label="License Key" 
  mask="****-****-****" 
  placeholder="ABCD-1234-EFGH">
</vi-masked-input>

<!-- Canadian Postal Code (Strict Letter-Number-Letter format) -->
<vi-masked-input 
  name="postal" 
  label="Postal Code" 
  mask="a0a 0a0" 
  placeholder="K1A 0B1">
</vi-masked-input>
```

**Advanced Masks (Regex & Dynamic Arrays):**

For highly complex rules (like matching a specific Regex or handling Credit Card numbers of variable lengths), you can pass a configuration object directly via the `maskOptions` property (e.g. using Lit's `.maskOptions=${...}` or React's `maskOptions={...}`). This object is passed directly to IMask.

```html
<!-- Lit / JavaScript example -->

<!-- 1. Strict RegExp (e.g., numbers starting with '5') -->
<vi-masked-input 
  label="Custom RegExp" 
  .maskOptions=${{ mask: /^5\d+$/ }}>
</vi-masked-input>

<!-- 2. Dynamic Credit Card (Auto-detects AMEX vs Visa format) -->
<vi-masked-input 
  label="Credit Card"
  .maskOptions=${{
    mask: [
      {
        // American Express (15 digits)
        mask: '0000 000000 00000',
        regex: '^3[47]\\d{0,13}'
      },
      {
        // Visa/Mastercard (16 digits)
        mask: '0000 0000 0000 0000',
        regex: '^(?:4\\d{0,15}|5[1-5]\\d{0,14})'
      }
    ]
  }}>
</vi-masked-input>

<!-- 3. Fixed Length Mixed Mask (e.g., 3 digits + 1 alphabetical character) -->
<!-- '0' denotes any digit, 'a' denotes any letter -->
<vi-masked-input 
  label="Custom Fixed Mixed Format"
  mask="000a">
</vi-masked-input>

<!-- 4. Restricting character types and auto-capitalizing (Custom Blocks) -->
<vi-masked-input 
  label="Uppercase Custom Block"
  .maskOptions=${{
    mask: '000C',
    blocks: {
      C: {
        mask: /^[A-Z]$/,
        prepareChar: (char) => char.toUpperCase()
      }
    }
  }}>
</vi-masked-input>
```

---

### Divider ([vi-divider](./src/divider/vi-divider.ts))

The [ViDivider](./src/divider/vi-divider.ts) component provides a visual separator rule used to segment blocks of content, form sections, or inline items. It supports horizontal separation with optional embedded titles/labels, as well as vertical separation between inline controls (such as toolbars, headers, and breadcrumb segments).

#### Properties & Attributes

| Attribute        | Property        | Type                            | Default        | Description                                              |
| :--------------- | :-------------- | :------------------------------ | :------------- | :------------------------------------------------------- |
| `direction`      | `direction`     | `'horizontal' \| 'vertical'`    | `'horizontal'` | Separator orientation.                                   |
| `text-placement` | `textPlacement` | `'left' \| 'center' \| 'right'` | `'center'`     | Text label alignment (horizontal only).                  |
| `text-margin`    | `textMargin`    | `string \| number`              | `undefined`    | Margin offset from edge for `left` or `right` placement. |
| `dashed`         | `dashed`        | `boolean`                       | `false`        | Renders line with a dashed stroke.                       |
| `plain`          | `plain`         | `boolean`                       | `false`        | Renders text with regular weight and secondary colour.   |

#### Slots

- **Default Slot**: Text title or content embedded within a horizontal divider (ignored when `direction="vertical"`).

#### CSS Parts

- `divider`: The root separator container.
- `line-start`: Line segment preceding the text label.
- `text`: Text label wrapper container.
- `line-end`: Line segment following the text label.

#### Snippets

**Basic Horizontal & Vertical Separators:**

```html
<!-- Horizontal section break -->
<p>Top section content...</p>
<vi-divider></vi-divider>
<p>Bottom section content...</p>

<!-- Vertical inline separator between toolbar actions -->
<div style="display: flex; align-items: center; gap: 8px;">
  <span>Item 1</span>
  <vi-divider direction="vertical"></vi-divider>
  <span>Item 2</span>
  <vi-divider direction="vertical"></vi-divider>
  <span>Item 3</span>
</div>
```

**Divider with Titles & Custom Placements:**

```html
<!-- Centered title (default) -->
<vi-divider>Section Title</vi-divider>

<!-- Left-aligned title with margin offset -->
<vi-divider text-placement="left" text-margin="24px">Demographic Details</vi-divider>

<!-- Right-aligned plain text with dashed rule -->
<vi-divider text-placement="right" dashed plain>Last updated: Today</vi-divider>
```

---

### Float Button & Float Button Group ([vi-float-button](./src/float-button/vi-float-button.ts), [vi-float-button-group](./src/float-button/vi-float-button-group.ts))

The [ViFloatButton](./src/float-button/vi-float-button.ts) component provides a floating action button positioned fixed over page content (typically bottom-right). It provides persistent access to high-frequency actions, back-to-top navigation, and expandable speed-dial menus via [ViFloatButtonGroup](./src/float-button/vi-float-button-group.ts).

#### `<vi-float-button>` Properties & Attributes

| Attribute           | Property           | Type                                                                       | Default     | Description                                                     |
| :------------------ | :----------------- | :------------------------------------------------------------------------- | :---------- | :-------------------------------------------------------------- |
| `shape`             | `shape`            | `'circle' \| 'square'`                                                     | `'circle'`  | Button geometry.                                                |
| `type`              | `type`             | `'default' \| 'primary'`                                                   | `'default'` | Visual prominence type.                                         |
| `size`              | `size`             | `'default' \| 'sm'`                                                        | `'default'` | Size scale: `default` (48px) or `sm` (40px).                    |
| `description`       | `description`      | `string`                                                                   | `undefined` | Text description label under the icon.                          |
| `tooltip`           | `tooltip`          | `string`                                                                   | `undefined` | Text tooltip displayed on hover/focus.                          |
| `href`              | `href`             | `string`                                                                   | `undefined` | URL to navigate to (renders native `<a>` anchor when provided). |
| `target`            | `target`           | `string`                                                                   | `undefined` | Anchor link target (`_blank`, `_self`, etc.).                  |
| `badge`             | `badge`            | `number \| string`                                                         | `undefined` | Numeric count or text badge.                                    |
| `badge-dot`         | `badgeDot`         | `boolean`                                                                  | `false`     | Displays a dot badge indicator.                                 |
| `badge-status`      | `badgeStatus`      | `'neutral'\|'primary'\|'success'\|'warning'\|'danger'\|'info'`             | `'danger'`  | Badge semantic colour.                                          |
| `back-top`          | `backTop`          | `boolean`                                                                  | `false`     | Enables smooth back-to-top scrolling mode.                      |
| `visibility-height` | `visibilityHeight` | `number`                                                                   | `400`       | Scroll threshold (px) before backTop button appears.            |
| `scroll-target`     | `scrollTarget`     | `string`                                                                   | `undefined` | CSS selector or element ID for custom scroll container.         |
| `duration`          | `duration`         | `number`                                                                   | `450`       | Scroll animation duration in milliseconds.                      |
| `disabled`          | `disabled`         | `boolean`                                                                  | `false`     | Disables button interactions.                                   |

#### `<vi-float-button-group>` Properties & Attributes

| Attribute    | Property    | Type                   | Default    | Description                                          |
| :----------- | :---------- | :--------------------- | :--------- | :--------------------------------------------------- |
| `shape`      | `shape`     | `'circle' \| 'square'` | `'circle'` | Geometry inherited by child buttons.                 |
| `trigger`    | `trigger`   | `'click' \| 'hover'`   | `'hover'`  | Interaction mode to expand the speed dial menu.      |
| `open`       | `open`      | `boolean`              | `false`    | Expanded menu state.                                 |
| `close-icon` | `closeIcon` | `string`               | `'x'`      | Icon displayed on the trigger button when expanded. |

#### Slots

- **`<vi-float-button>`**:
  - `icon`: Custom icon element (e.g. `<vi-icon name="...">`).
  - `description`: Custom slotted description content underneath the icon.
  - `tooltip`: Custom slotted rich tooltip content.
  - Default slot: Fallback content.
- **`<vi-float-button-group>`**:
  - Default slot: Slotted child `<vi-float-button>` action items.
  - `icon`: Main trigger button icon (when collapsed).
  - `close-icon`: Custom close icon when expanded.
  - `description`: Main trigger button description label.

#### Events

- `vi-float-button-click`: Dispatched by `<vi-float-button>` when activated. Detail: `{ originalEvent: MouseEvent }`.
- `vi-float-button-back-top`: Dispatched by `<vi-float-button>` when back-top triggers scrolling. Detail: `{ scrollTarget: HTMLElement \| Window }`.
- `vi-float-button-open-change`: Dispatched by `<vi-float-button-group>` when open state changes. Detail: `{ open: boolean }`.

#### CSS Parts

- **`<vi-float-button>`**: `control`, `button`, `icon`, `description`, `badge`
- **`<vi-float-button-group>`**: `group`, `trigger`, `menu`

#### Snippets

**Basic Floating Action Button with Tooltip:**

```html
<vi-float-button tooltip="Help & Support" aria-label="Help">
  <vi-icon slot="icon" name="help-circle"></vi-icon>
</vi-float-button>
```

**Back-to-Top Button:**

```html
<!-- Window scroll back-to-top with threshold -->
<vi-float-button
  back-top
  visibility-height="300"
  tooltip="Back to Top"
  aria-label="Back to Top"
>
</vi-float-button>

<!-- Custom scroll container back-to-top -->
<vi-float-button
  back-top
  scroll-target="#main-scroll-container"
  visibility-height="200"
  duration="450"
  tooltip="Scroll to Top"
>
</vi-float-button>
```

**Speed Dial Action Group:**

```html
<vi-float-button-group trigger="click" aria-label="Quick Actions">
  <vi-icon slot="icon" name="plus"></vi-icon>

  <vi-float-button tooltip="Add Adverse Event">
    <vi-icon slot="icon" name="alert-triangle"></vi-icon>
  </vi-float-button>
  <vi-float-button tooltip="Add Medication">
    <vi-icon slot="icon" name="activity"></vi-icon>
  </vi-float-button>
  <vi-float-button tooltip="Print Report">
    <vi-icon slot="icon" name="printer"></vi-icon>
  </vi-float-button>
</vi-float-button-group>
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
