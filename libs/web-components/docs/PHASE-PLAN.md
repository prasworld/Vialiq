# Component Library Phase Plan

> Status key: 🔲 Planned · 🚧 In Progress · ✅ Done · 🔍 Under Review

---

## Architecture Rules

### flux-ui (`libs/flux-ui/components/_*.scss`)
Host-agnostic base styles: layout, spacing, border, typography, interaction states.
No shadow DOM awareness. Uses `@layer components`. Forwarded via `components/_index.scss`.

### web-components (`libs/web-components/src/{name}/vi-{name}.ts`)
Lit custom element that:
- `@use`s the flux-ui component base partial
- Declares all CSS custom props on `:host` (three-level cascade: consumer override → theme token → compile-time fallback)
- Adds variant/state/slotted rules in `vi-{name}.scss`

    
Each component folder: `vi-{name}.ts` · `vi-{name}.scss` · `vi-{name}.stories.ts` · `vi-{name}.test.ts` · `index.ts`

### Accessibility Rules (all components)
- Every interactive element uses a **native HTML control** (`<input>`, `<button>`, `<a>`) — never `div` with `role`
- Native control is always the **tab stop** — host has `tabindex="-1"` or none
- Use `shadowRootOptions: { delegatesFocus: true }` in Lit to seamlessly route clicks to the inner tab stop
- Focus ring uses `outline` (not `box-shadow`) — respects `prefers-reduced-motion`
- All form inputs expose `name`, `value`, `required` via `ElementInternals` (basic in Phase 1; full form association in Phase 2 requires `static formAssociated = true` and implementing `formResetCallback()`)
- Full keyboard navigation on every component

### Focus Management (all components)
- All focusable components MUST implement the `Focusable` interface and use the `FocusableMixin`.
- The mixin sets `delegatesFocus: true` on the shadow root to forward focus to the first focusable internal element.
- The host element MUST have `tabindex="-1"` so it is not in the sequential tab order.
- The component MUST implement the `_focusableElement` getter to return the specific internal element that should receive programmatic focus (e.g., via `element.focus()`).
- **Implementation**: The mixin should be a TypeScript class mixin that extends `LitElement`. It will override the static `shadowRootOptions` to set `delegatesFocus`. It will also provide a public `focus()` method that calls `this._focusableElement.focus()`.

### Focus Trapping (for complex components like modals, dialogs)
- Complex components that need to trap focus (e.g., modals, popovers) should use a `FocusTrapMixin`.
- This mixin listens for `Tab` and `Shift+Tab` keydown events.
- When active, the mixin ensures that focus cycles within the component's focusable elements and does not escape to the rest of the page.
- Focus is returned to the previously focused element when the trap is deactivated (e.g., modal is closed).
- **Implementation**: The mixin will have `activate()` and `deactivate()` methods.
  - `activate()`: Queries the component's shadow root for all focusable elements (`button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])`), stores the currently active element (`document.activeElement`), and adds a `keydown` listener to the host.
  - `deactivate()`: Removes the `keydown` listener and restores focus to the previously active element.
  - The `keydown` handler will check for `Tab` and `Shift+Tab`. It compares against **`this.shadowRoot.activeElement`** (not `document.activeElement` — which inside shadow DOM only returns the host). If focus is on the first or last element in the queried list, it will `preventDefault()` and manually focus the last or first element, respectively, creating a focus cycle.

---

## Phase 1 — Foundational Components

### 1. `vi-button` ✅ Done

### 2. `vi-input` 🔲
**flux-ui**: `_input.scss` — input reset, border, padding, font, focus ring outline, label typography
**web-components**:
- Props: `type` (text|email|password|number|search|tel|url), `value`, `placeholder`, `label`, `helper-text`, `error`, `disabled`, `required`, `readonly`, `name`
- Shadow DOM: `<label>` + `<input>` + `<span>` for helper/error text
- ARIA: `aria-required`, `aria-invalid`, `aria-describedby` (linked to helper/error span), `aria-errormessage`
- Tab stop: inner `<input>` — host gets `tabindex="-1"`
- States: `:host([error])` → red border + error text shown; `:host([disabled])` → opacity + pointer-events none

### 3. `vi-checkbox` 🔲
**flux-ui**: `_checkbox.scss` — custom visual box, checkmark via SVG clip-path, indeterminate dash
**web-components**:
- Props: `checked`, `indeterminate`, `disabled`, `label`, `name`, `value`, `required`
- Shadow DOM: `<input type="checkbox">` (visually hidden, handles keyboard + a11y natively) + custom visual overlay + `<label>`
- ARIA: `aria-checked="mixed"` on native input when `indeterminate`; `aria-required`
- Tab stop: inner `<input>` — Space to toggle

### 4. `vi-switch` 🔲
**flux-ui**: `_switch.scss` — track + thumb layout, slide transition, on/off color states
**web-components**:
- Props: `checked`, `disabled`, `label`, `name`, `value`
- Shadow DOM: `<input type="checkbox" role="switch">` (visually hidden) + visual track + thumb + `<label>`
- ARIA: `role="switch"`, `aria-checked` synced with `checked` property
- Tab stop: inner `<input>` — Space to toggle

### 5. `vi-tag` 🔲
**flux-ui**: `_tag.scss` — pill shape, small typography, icon slot gap, close button sizing
**web-components**:
- Props: `variant` (neutral|success|warning|danger|info), `removable`, `disabled`, `label`
- Shadow DOM: text slot + optional remove `<button>` with × icon
- ARIA: remove button gets `aria-label="Remove {label}"`, `type="button"`
- Events: dispatches `vi-remove` custom event on remove click
- Tab: remove button is tab stop when `removable`; host itself not focusable

### 6. `vi-badge` 🔲
**flux-ui**: `_badge.scss` — pill/dot shapes, semantic colour variants, small typography
**web-components**:
- Props: `variant` (neutral|success|warning|danger|info), `dot` (boolean — dot only, no text)
- ARIA: `role="status"` on host; `aria-label` required when `dot=true`
- No tab stop (decorative/informational only)

### 7. `vi-label` 🔲
**flux-ui**: `_label.scss` — label typography, required asterisk, disabled opacity
**web-components**:
- Props: `for` (external element id), `required`, `disabled`, `size` (sm|md|lg)
- Shadow DOM: `<label>` with `htmlFor` bound; required asterisk via `:host([required])::after`
- Use case: labelling native or custom elements outside shadow DOM

### 8. `vi-link` 🔲
**flux-ui**: `_link.scss` — colour, underline style, hover/focus states, visited
**web-components**:
- Props: `href`, `target`, `rel`, `disabled`, `variant` (default|primary|danger), `download`
- Shadow DOM: `<a>` with all attrs forwarded
- Disabled: inner `<a>` gets `aria-disabled="true"` + `tabindex="-1"`
- Safety: `rel="noopener noreferrer"` auto-added when `target="_blank"`

### Base changes (Phase 1)
- `vi-element.ts`: Add `ViSize = 'sm' | 'md' | 'lg'` and `ViStatus = 'neutral' | 'success' | 'warning' | 'danger' | 'info'` types
- `flux-ui/components/_index.scss`: Forward all new partials
- `web-components/src/index.ts`: Export all new components

---

## Phase 2 — Composite Components

### 1. `vi-select` 🔲
Native `<select>` styled via shadow DOM.
- Props: `options` (array), `value`, `multiple`, `placeholder`, `disabled`, `required`, `label`, `error`, `helper-text`
- Full native keyboard and screen reader semantics; option groups supported

### 2. `vi-dropdown` 🔲
Custom trigger + floating panel (listbox pattern). Uses native `popover` API.
- Props: `open`, `placement` (top|bottom|left|right)
- ARIA: `role="listbox"`, `aria-expanded`, `aria-activedescendant`
- Keyboard: `↑↓` navigate, `Enter`/`Space` select, `Escape` close, `Home`/`End`, type-ahead

### 3. `vi-combobox` 🔲
Searchable dropdown with optional multi-select.
- Props: `value`, `options`, `multi`, `loading`, `placeholder`, `filter-fn`
- ARIA: `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`
- Keyboard: all listbox keys + `Backspace` removes last chip in multi mode

### 4. `vi-accordion` + `vi-accordion-item` 🔲
Container + item pair.
- `vi-accordion` props: `multi` (allow multiple open), `variant` (default|bordered|flush)
- `vi-accordion-item` props: `label`, `open`, `disabled`, `icon`
- Slots: `header-actions`, default content, `icon`
- ARIA: header `<button>` with `aria-expanded`, `aria-controls` → panel `id`; panel `role="region"`, `aria-labelledby`
- Keyboard: `Enter`/`Space` toggle, `↑↓` between items, `Home`/`End`
- Animation: CSS `max-height` + `opacity` transition with `overflow: hidden`

### 5. `vi-chip` 🔲
Interactive chip/pill — selectable and/or removable. Richer than `vi-tag` (supports groups, avatar, leading icon, checkbox semantics).
- Props: `selected`, `removable`, `disabled`, `value`, `variant` (neutral|primary|success|warning|danger)
- Slots: `avatar` (leading image/icon), `icon`, default (label), `trailing-icon`
- ARIA: `role="option"` when inside `vi-chip-group`; standalone uses `role="checkbox"` or `role="button"`
- Events: `vialiq-select`, `vialiq-remove`
- `vi-chip-group`: manages multi-select chip set with `aria-multiselectable`

### 6. `vi-modal` 🔲
- Wraps native `<dialog>` element (not polyfilled div)
- Props: `open`, `size` (xs|sm|md|lg|xl|fullscreen), `closable`, `persistent`, `scrollable`
- Variants: `default` (centred), `drawer` (right/left side-panel), `alert` (compact confirmation with icon)
- Slots: `header`, default body, `footer`, `icon` (for alert variant)
- ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`; `alert` variant uses `role="alertdialog"`
- Focus trap via `FocusTrapMixin`; `Escape` closes unless `persistent`; focus returns to trigger on close
- Animation: scale + fade (default), slide (drawer), zoom-out (alert)
- Backdrop: click closes unless `persistent`; backdrop customisable via CSS part

### 6. `vi-alert` 🔲
Inline persistent status banner (not time-limited). Embedded in page layout.
- Props: `variant` (info|success|warning|danger), `title`, `dismissible`
- Slots: default message, `actions` (buttons)
- ARIA: `role="alert"` (warning/danger) | `role="status"` (info/success), `aria-atomic="true"`
- Events: `vialiq-dismiss` when close button clicked
- Usage: form-level validation summary, page-level info banners, query context messages

### 7. `vi-toast` + `vi-toast-service` 🔲
Ephemeral floating notifications. Rendered in a portal at document root.
- Props: `variant` (info|success|warning|danger), `title`, `message`, `duration` (ms; 0 = sticky), `closable`
- Position: top-right by default; configurable via `vi-toast-service` global config
- Slots: `actions` (optional action link/button)
- ARIA: `role="status"` (info/success, polite live region) | `role="alert"` (warning/danger, assertive)
- Auto-dismiss timer with pause-on-hover; progress bar indicator
- Events: `vialiq-close` on dismiss
- `vi-toast-service`: singleton service class for programmatic dispatch:
  ```typescript
  ViToastService.show({ variant: 'success', title: 'Form saved', duration: 3000 });
  ```
- Stack: multiple toasts stack vertically, newest on top; max visible = 5 (older collapse)
- Keyboard: `Escape` dismisses focused toast; focus moves to next

### 8. `vi-notification` + `vi-notification-center` 🔲
Persistent notification bell with drawer/panel.
- `vi-notification` — a single notification card:
  - Props: `variant`, `title`, `message`, `timestamp`, `read` (boolean), `actions`
  - Events: `vialiq-read`, `vialiq-dismiss`, `vialiq-action`
- `vi-notification-center` — bell trigger + sliding panel:
  - Props: `count` (unread count badge), `open`, `placement` (right|left)
  - Slots: `trigger` (custom trigger button), default (notification items)
  - ARIA: `aria-label="Notifications"` on trigger; panel `role="region"` `aria-label="Notification centre"`
  - `count` drives unread badge on bell icon
  - Events: `vialiq-open`, `vialiq-close`, `vialiq-clear-all`
- Usage: EDC query alerts, data entry reminders, system announcements

### 9. `vi-tooltip` 🔲
- Props: `content`, `placement`, `trigger` (hover|focus|both), `delay-ms`
- ARIA: `role="tooltip"`; trigger element gets `aria-describedby`
- Keyword: focus shows; `Escape` dismisses — never hover-only
- Uses CSS anchor-positioning with JS fallback for placement

### 10. `vi-tabs` + `vi-tab` + `vi-tab-panel` 🔲
Full tabs implementation with closable, dynamic, and responsive modes.
- **`vi-tabs`** (container): Props: `active` (active tab id), `orientation` (horizontal|vertical), `variant` (line|pill|card), `overflow` (scroll|menu|wrap), `addable` (boolean — show "+" tab)
- **`vi-tab`** (individual tab): Props: `id`, `label`, `closable`, `disabled`, `badge-count`
- **`vi-tab-panel`** (content area): Props: `for` (tab id it corresponds to)
- ARIA: `role="tablist"`, `role="tab"` (`aria-selected`, `aria-controls`, `aria-disabled`), `role="tabpanel"` (`aria-labelledby`), `aria-orientation`
- Keyboard: `←→` navigate (roving tabindex), `Home`/`End`, `Delete` close (if `closable`), `Ctrl+T` / `+` button adds tab (if `addable`)
- **Closable tabs**: Each `vi-tab[closable]` renders an × button; fires `vialiq-close`; tab is removed from DOM after animation; focus moves to adjacent tab
- **Dynamic tabs**: Host app manages tab list reactively; `addable` shows "+" button that fires `vialiq-add-tab`
- **Responsive overflow**: When tab list overflows, `overflow="scroll"` adds horizontal scroll with fade shadows; `overflow="menu"` collapses hidden tabs into a "More ▾" dropdown; `overflow="wrap"` allows wrap (use only for small sets)
- Events: `vialiq-change` (new active tab), `vialiq-close` (tab removed), `vialiq-add` (+ clicked)

### 11. `vi-skeleton` 🔲
Loading placeholder that mimics the shape of real content. Shown while data is fetching.
- Props: `variant` (text|circle|rect|button|card), `width`, `height`, `lines` (for multi-line text), `animated` (shimmer | pulse | none)
- Slots: none (self-contained shape)
- ARIA: `aria-hidden="true"` — screen readers skip skeletons; announce loading state at parent level via `aria-busy="true"`
- Variants:
  - `text` — one or more lines of text-height bars
  - `circle` — circular avatar/icon placeholder
  - `rect` — arbitrary rectangle (image, card image)
  - `button` — button-shaped block
  - `card` — full card layout (header + body lines)
- CSS: shimmer animation uses `linear-gradient` sweep, `background-size: 200%`, `animation: shimmer 1.5s infinite`; respects `prefers-reduced-motion` (static when reduced)
- Composable: nest multiple `vi-skeleton` inside a layout div to build realistic page skeletons

### 12. `vi-combobox` 🔲
Searchable select. Supports single-select, multi-select with tags, and free-text entry.
- **Modes** (set via `mode` prop):
  - `single` — user types to filter, picks one option; typed text reverts to selected label on blur
  - `multi` — multiple selections shown as `vi-tag` chips in the input; `Backspace` removes last chip
  - `tags` — free-text tag entry (no predefined options list required); `Enter` or comma creates a tag
  - `creatable` — like `single` but allows creating new options not in the list
- **Props**: `mode` (single|multi|tags|creatable), `value` (string for single, string[] for multi/tags), `options` (array or async function), `placeholder`, `loading`, `disabled`, `required`, `maxTags`, `name`, `status`, `validityMessage`, `filterFn`, `renderOption`
- **Options source**: static array **or** async function `(query: string) => Promise<Option[]>` for server-side search (debounced at 300ms)
- **Option type**: `{ value: string; label: string; group?: string; disabled?: boolean; icon?: string }`
- ARIA: `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-activedescendant`; listbox: `role="listbox"`, each option `role="option"` with `aria-selected`
- Keyboard:
  - `↓` / `↑` — navigate options
  - `Enter` — select focused option
  - `Escape` — close listbox, revert input text
  - `Backspace` on empty input (multi/tags) — remove last tag
  - `Home`/`End` — first/last option
  - Type-ahead filter as user types
- Selected tags rendered as `vi-tag[removable]` inline before the search input
- Loading state: shows `vi-spinner` inside listbox while async options load
- Empty state: configurable "No results" message + optional "Create: {query}" item (creatable mode)
- Events: `vialiq-change` (value changed), `vialiq-search` (query changed), `vialiq-create` (new tag/option created)
- Form-associated: `static formAssociated = true`; `ElementInternals.setFormValue()` with serialised value

---

## Phase 2 (continued) — Date & Time Components

### Date picker architecture — flatpickr integration
All date/time pickers wrap **flatpickr** (MIT, TypeScript, zero dependencies, highly pluggable).
- `flatpickr` handles calendar UI, keyboard navigation, locale, range selection — Lit component wraps it as a web component
- The Lit component owns the shadow DOM outer shell (label, helper, validation, tokens); flatpickr calendar is portalled into a `<div>` appended to `document.body` (flatpickr's own appendTo option)
- Custom flatpickr plugins used: `confirmDatePlugin` (for partial date / unconfirmed entry), `weekSelectPlugin`
- Shared base: `_flatpickr-base.ts` mixin handles lifecycle (init on `firstUpdated`, destroy on `disconnectedCallback`), value sync, locale loading
- Theming: flatpickr default CSS is completely **replaced** by Flux UI `_flatpickr.scss` tokens

### `vi-date-picker` update 🔲
_(spec unchanged; implementation note: wraps flatpickr with `allowInput: true`, `dateFormat: 'd/m/Y'`, partial-date overlay on three separate text inputs when `allowPartial` is set — flatpickr calendar is still shown for full-date selection)_

### `vi-month-year-picker` 🔲
Month + year selection only. Used for: reporting period selection, drug expiry, birth month (when day unknown).
- Props: `value` (YYYY-MM format), `min`, `max`, `disabled`, `required`, `name`, `clearable`
- Flatpickr config: `plugins: [monthSelectPlugin]` — shows month grid calendar, year stepper
- Output format: `YYYY-MM`; partial `YYYY-??` when month unknown
- Events: `vialiq-change`, `vialiq-clear`

### `vi-time-picker` 🔲
Time-of-day input. Used for: AE start/end time, dose time, assessment time.
- Props: `value` (HH:mm or HH:mm:ss), `format` (12|24), `step` (minutes; default 15), `showSeconds`, `min`, `max`, `disabled`, `required`, `name`
- Flatpickr config: `enableTime: true`, `noCalendar: true`, `time_24hr: format === '24'`
- Input mask: two-segment (HH:mm) or three-segment (HH:mm:ss) inputs for direct keyboard entry
- Unknown time: `value='??:??'` when time not recorded (EDC convention)
- Events: `vialiq-change`, `vialiq-clear`
- Keyboard: `↑`/`↓` increments hour/min by step; `Tab` moves between segments

---

## Phase 3 — EDC-Specific Components

### 1. `vi-file-upload` 🔲
Feature-rich file attachment component. Supports clinical documents (ICF scans, source data, lab reports, protocol amendments).
- Props: `accept` (MIME/extension list), `multiple`, `max-size` (bytes), `max-files`, `disabled`, `required`, `name`, `capture` (camera|environment), `auto-upload` (boolean)
- Zones: drag-and-drop area + "Browse" button + optional paste-from-clipboard
- File list: shows each file with name, size, type icon, upload progress bar, status (pending|uploading|success|error), remove button
- Upload: exposes `upload(file, options)` method — caller provides `uploadFn: (file, onProgress) => Promise<UploadResult>` prop
- Preview: image thumbnails inline; PDF/doc icons for non-image files
- Validation: client-side type + size check before upload; error state per file
- Slots: `empty` (custom drop zone content), `file-item` (custom file row)
- ARIA: drag zone `role="button"` + `aria-label="Upload files"`; status live region for upload results
- Events: `vialiq-files-selected`, `vialiq-upload-progress`, `vialiq-upload-success`, `vialiq-upload-error`, `vialiq-remove`
- Form participation: `ElementInternals.setFormValue()` with file list serialised as JSON (for non-auto-upload mode)

### 2. `vi-signature` 🔲
Canvas-based electronic signature per 21 CFR Part 11.
- Props: `value` (base64 PNG), `disabled`, `locked`, `pen-color`, `pen-width`
- Methods: `clear()`, `toDataURL(format)`, `toBlob()`
- Events: `vialiq-signature-change`, `vialiq-signature-clear`
- Mouse + touch/stylus support; pressure sensitivity when available

### 3. `vi-query-badge` 🔲
Field-level query indicator (open/answered/closed) that attaches to any form field.
- Props: `status` (open|answered|closed|resolved), `count`
- Triggers a query drawer/modal when clicked

---

## Phase 4 — Charts & Data Visualisation

### Architecture decision — base framework
Build on **D3.js v7** (MIT) as the rendering primitive, wrapped in Lit web components.

**Why D3:**
- Full SVG control — critical for custom clinical chart types (RECIST waterfall, swimmer plots, KM curves)
- TypeScript-native (v7+)
- Composable modules — import only the D3 subpackages needed (`d3-scale`, `d3-axis`, `d3-shape`, etc.)
- No opinion on component model — integrates cleanly with Lit reactive properties

**Alternative considered: Chart.js** — rejected because canvas-based (no SVG parts for styling), limited axis customisation, no built-in support for clinical chart types.

**Alternative considered: Vega-Lite** — rejected because declarative grammar is opaque to debug and customise; JSON schema not TypeScript-friendly.

### Base chart infrastructure

**`vi-chart-base` (abstract mixin/base class):**
- `_svg`: D3 selection of the root `<svg>` element in shadow DOM
- `_margin`: `{ top, right, bottom, left }` — computed from slot availability
- `_width` / `_height`: from `ResizeObserver` on host; chart redraws on size change
- `_renderChart()`: abstract — subclasses implement full D3 draw logic
- Theming: all colours via CSS custom props, read at render time via `getComputedStyle`
- Tooltip: shared `vi-chart-tooltip` overlay (absolute positioned `<div>` in shadow DOM)
- Legend: `vi-chart-legend` component (external, slottable)
- Export: `toSVGString()`, `toPNG()` → `HTMLCanvasElement` → blob

**`vi-chart-axis` (internal helper):**
- Wraps D3 `axisBottom/Left/Right/Top`
- Tick formatting, grid lines, axis labels
- Respects `orientation`, `tickCount`, `tickFormat`, `showGrid`

### Planned chart components

| Component | Type | Clinical use | D3 modules |
|-----------|------|-------------|------------|
| `vi-bar-chart` | Grouped/stacked bars | AE frequency by term/grade | `d3-scale`, `d3-axis`, `d3-shape` |
| `vi-line-chart` | Single/multi-series line | Lab values over time, vitals trend | `d3-scale`, `d3-line`, `d3-axis` |
| `vi-scatter-chart` | Scatter plot | PK/PD correlation, outlier detection | `d3-scale`, `d3-axis` |
| `vi-waterfall-chart` | Waterfall | RECIST tumour response | `d3-scale`, `d3-axis`, `d3-shape` |
| `vi-km-chart` | Kaplan-Meier survival | Time-to-event (OS, PFS) | `d3-scale`, `d3-axis`, `d3-line` + custom step |
| `vi-heatmap-chart` | Matrix heatmap | AE incidence grid (term × grade) | `d3-scale-chromatic`, `d3-axis` |
| `vi-swimmer-chart` | Horizontal timeline | Subject treatment duration + events | `d3-scale-band`, `d3-axis-top` |
| `vi-sparkline` | Inline mini chart | Lab trend in table cells | `d3-line` only |

### Shared chart API contract (all chart components)

```typescript
// All charts accept a typed data prop
interface ViChartBase<TDatum> {
  data: TDatum[];              // the dataset
  width?: number;              // if not set, uses container width
  height?: number;             // default: 320px
  margin?: Partial<ChartMargin>;
  colors?: string[];           // array of series colours
  animate?: boolean;           // default: true; off for reduced motion
  loading?: boolean;           // show skeleton overlay
  empty?: boolean;             // show empty state message
  emptyMessage?: string;
  accessible?: boolean;        // render SVG title + desc + data table
}

// Events all charts fire
// vialiq-datum-hover: { datum: TDatum; x: number; y: number }
// vialiq-datum-click: { datum: TDatum }
// vialiq-datum-leave
// vialiq-chart-ready  (after first render)
```

### CSS Custom Properties (shared)

```css
--vi-chart-bg: transparent;
--vi-chart-axis-color: var(--vi-color-grey-400);
--vi-chart-grid-color: var(--vi-color-grey-100);
--vi-chart-tick-font: var(--vi-font-size-xs);
--vi-chart-label-font: var(--vi-font-size-sm);
--vi-chart-series-1: var(--vi-color-primary);
--vi-chart-series-2: var(--vi-color-success);
--vi-chart-series-3: var(--vi-color-warning);
--vi-chart-series-4: var(--vi-color-error);
--vi-chart-series-5: #7c3aed;  /* purple */
--vi-chart-series-6: #db2777;  /* pink */
--vi-chart-tooltip-bg: var(--vi-color-grey-900);
--vi-chart-tooltip-color: white;
```

### Accessibility for charts
- All SVG charts include `<title>` and `<desc>` elements (screen reader)
- When `accessible=true`: render a companion `<table aria-label="Chart data">` (visually hidden by default, toggled by "View data" button)
- Colour palette tested for WCAG 2.1 contrast and colour-blind safe (deuteranopia / protanopia)
- `prefers-reduced-motion`: animations disabled, transitions set to `0ms`
- Pattern fills available as an alternative to colour-only differentiation

### Storybook integration
- Each chart has a story with `controls` for all props (data, colours, labels)
- Shared `mockClinicalData.ts` fixtures for realistic EDC datasets (AE listings, lab panels, survival data)
- Snapshot tests via `vi-chart.test.ts` using `jsdom` + D3 headless render

---

## Review Log

> Append review notes here as components are completed.

> Append review notes here as components are completed.

---

## Global Patterns — Implementation Guidelines

> Reference: analysed from Carbon Web Components `src/globals/` (archived 2023).
> Only the patterns that remain applicable to Lit 3 + Stage 3 decorators + ElementInternals are listed here.
> Patterns marked ❌ in the analysis (spread directive, formdata mixin, collection-helpers) are NOT documented — native platform supersedes them.

---

### 1. `Handle` — cleanup contract interface

**Problem**: Storing an event listener for later removal requires keeping both the target and the listener reference, leading to pairs of fields cluttering every class.

**Pattern**: Any cleanup operation returns a `Handle`. The caller stores one thing and calls `.release()` on disconnect. No target+listener tuple, no boolean flags.

**File**: `libs/web-components/src/base/handle.ts`

```typescript
/**
 * A typed cleanup contract.
 * Anything that registers an external side-effect (event listener,
 * MutationObserver, ResizeObserver, timer) returns a Handle.
 * The owner stores it and calls release() in disconnectedCallback.
 */
export interface Handle {
  release(): null;
}

/**
 * Wraps addEventListener/removeEventListener in a Handle.
 *
 * Usage:
 *   this._clickHandle = on(document, 'click', this._handleOutsideClick);
 *   // in disconnectedCallback:
 *   this._clickHandle = this._clickHandle?.release() ?? null;
 */
export function on<K extends keyof HTMLElementEventMap>(
  target: EventTarget,
  type: K | string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): Handle {
  target.addEventListener(type, listener, options);
  return {
    release() {
      target.removeEventListener(type, listener, options);
      return null;
    },
  };
}
```

**When to use**:
- Attaching to `document` or `window` from a component (outside-click, Escape key globally)
- `MutationObserver` / `ResizeObserver` (return a Handle wrapping `.disconnect()`)
- Any listener that must be cleaned up in `disconnectedCallback`

**Usage pattern inside a component**:
```typescript
import { on, type Handle } from '../base/handle.js';

export class ViDropdown extends FocusableMixin(ViElement) {
  private _outsideClickHandle: Handle | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this._outsideClickHandle = on(document, 'click', this._handleOutsideClick.bind(this));
  }

  override disconnectedCallback(): void {
    this._outsideClickHandle = this._outsideClickHandle?.release() ?? null;
    super.disconnectedCallback();
  }

  private _handleOutsideClick(e: Event): void { /* ... */ }
}
```

---

### 2. `FOCUSABLE_SELECTOR` — tabbable element selector

**Problem**: CSS `:focus` and `[tabindex]` find native focusables but cannot see inside another component's shadow root. When `vi-dropdown` needs to cycle focus within its panel, it must know that a `<vi-button>` inside the panel is itself a tab stop — even though the actual `<button>` lives in vi-button's shadow root. The host `vi-button` element must be listed explicitly.

**Pattern**: Maintain a single-source selector string that covers native focusables + every `vi-` component that is itself focusable. Reference it in `FocusTrapMixin` and anywhere else that needs to walk focusable elements.

**File**: `libs/web-components/src/base/focusable-selector.ts`

```typescript
/**
 * A CSS selector that matches all tabbable elements within a container.
 *
 * Custom elements (vi-*) must be listed explicitly because CSS cannot
 * see through a shadow root to find their inner tab stops. Each vi-*
 * component listed here uses FocusableMixin and is therefore itself
 * a coherent tab stop (focus is delegated inward automatically).
 *
 * Update this list whenever a new focusable vi-* component ships.
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  // vi-* components that implement FocusableMixin
  'vi-button:not([disabled])',
  'vi-input:not([disabled])',
  'vi-checkbox:not([disabled])',
  'vi-switch:not([disabled])',
  'vi-link:not([disabled])',
  // Phase 2 — add as components ship:
  // 'vi-select:not([disabled])',
  // 'vi-combobox:not([disabled])',
].join(', ');
```

**Usage in FocusTrapMixin**:
```typescript
import { FOCUSABLE_SELECTOR } from './focusable-selector.js';

// Inside the keydown handler:
const focusable = [
  ...this.shadowRoot!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
];
// For slotted content — walk assigned elements of each slot:
this.shadowRoot!.querySelectorAll('slot').forEach((slot) => {
  (slot as HTMLSlotElement).assignedElements({ flatten: true }).forEach((el) => {
    if (el.matches(FOCUSABLE_SELECTOR)) focusable.push(el as HTMLElement);
  });
});
```

**Maintenance rule**: When `vi-select`, `vi-combobox`, etc. ship in Phase 2, uncomment the corresponding lines. This is the single place to update — FocusTrapMixin, any roving-tabindex manager, and accessibility tests all derive from this one source.

---

### 3. `if-non-empty` — conditional attribute directive

**Problem**: Lit 3's built-in `ifDefined` removes an attribute only when the value is `undefined`. If a component has an optional `string` property (e.g. `placeholder`, `aria-label`) that defaults to `''`, binding `${ifDefined(this.placeholder)}` still sets `placeholder=""` on the DOM element — a real but empty attribute.

**Pattern**: A tiny wrapper that also treats `''` as absent.

**File**: `libs/web-components/src/base/if-non-empty.ts`

```typescript
import { ifDefined } from 'lit/directives/if-defined.js';

/**
 * Like `ifDefined`, but also removes the attribute when value is an empty string.
 *
 * Use for every optional string attribute on inner native elements where
 * an empty string is semantically different from "attribute absent":
 *   - placeholder=""   → screen readers still read it as empty placeholder
 *   - aria-label=""    → NVDA announces "blank" instead of ignoring it
 *   - title=""         → browsers show an empty tooltip on hover
 *
 * Usage in a template:
 *   <input placeholder=${ifNonEmpty(this.placeholder)} />
 *   <button aria-label=${ifNonEmpty(this.label)} />
 */
export const ifNonEmpty = (value: string | undefined | null) =>
  ifDefined(value === '' ? undefined : (value ?? undefined));
```

**When to use**:
- `placeholder`, `title`, `aria-label`, `aria-describedby` on inner native elements
- Any optional string forwarded as an attribute where `""` and "absent" have different meaning
- Do NOT use for boolean attributes (`?disabled`) or property bindings (`.value`) — those have their own Lit mechanisms

---

### 4. `ValidityMixin` — form validation API

**Problem**: Form-associated components (`vi-input`, `vi-checkbox`, etc.) need to expose the same validation API as native form elements (`checkValidity()`, `setCustomValidity()`). This must work with `ElementInternals` which is the modern platform API (supersedes Carbon's `formdata` event approach).

**Pattern**: A mixin that defines the validation API shape, coordinates with `ElementInternals.setValidity()`, and fires the native `invalid` event.

**File**: `libs/web-components/src/base/validity-mixin.ts`

```typescript
import { LitElement } from 'lit';

type Constructor<T = object> = new (...args: any[]) => T;

export declare class ValidityInterface {
  invalid: boolean;
  required: boolean;
  validityMessage: string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  setCustomValidity(message: string): void;
  /** Override in subclass to return the validity state. */
  protected _testValidity(): ValidityState | Partial<ValidityStateFlags>;
}

/**
 * Mixin that adds form validation API to a form-associated Lit element.
 *
 * Requirements on the host class:
 *   static formAssociated = true;
 *   private _internals = this.attachInternals();
 *
 * The mixin provides:
 *   checkValidity()     → runs _testValidity(), sets _internals, fires 'invalid'
 *   reportValidity()    → checkValidity() + shows browser UI
 *   setCustomValidity() → custom error string (empty string clears)
 *
 * Subclass MUST override:
 *   _testValidity()  → return { valueMissing: true } or {} for valid
 *   get value()      → current component value
 *
 * Subclass SHOULD set:
 *   @property({ reflect: true }) accessor invalid = false;
 *   @property({ reflect: true }) accessor required = false;
 *   @property() accessor validityMessage = '';
 */
export function ValidityMixin<T extends Constructor<LitElement>>(
  Base: T
): T & Constructor<ValidityInterface> {
  class ValidityMixinClass extends Base {
    // These are abstract contracts — subclass must define them as @property
    declare invalid: boolean;
    declare required: boolean;
    declare validityMessage: string;

    /** Override to return partial ValidityStateFlags for this component. */
    protected _testValidity(): Partial<ValidityStateFlags> {
      return {};
    }

    /**
     * Checks validity without showing browser UI.
     * Fires 'invalid' event (cancelable) if invalid.
     * Returns true if valid.
     */
    checkValidity(): boolean {
      // Access _internals from the host (must call attachInternals() there)
      const internals = (this as any)._internals as ElementInternals | undefined;
      const flags = this._testValidity();
      const isValid = !Object.values(flags).some(Boolean);

      if (internals) {
        if (isValid) {
          internals.setValidity({}, '');
        } else {
          internals.setValidity(flags, this.validityMessage || 'Invalid value');
        }
      }

      if (!isValid) {
        // cancelable — consumer can suppress with e.preventDefault()
        this.dispatchEvent(new Event('invalid', { bubbles: false, cancelable: true }));
        (this as any).invalid = true;
      } else {
        (this as any).invalid = false;
        (this as any).validityMessage = '';
      }

      return isValid;
    }

    /**
     * Checks validity AND shows browser validation UI (native tooltip).
     */
    reportValidity(): boolean {
      const internals = (this as any)._internals as ElementInternals | undefined;
      return internals ? internals.reportValidity() : this.checkValidity();
    }

    /**
     * Sets a custom validation message.
     * Pass empty string to clear custom error.
     */
    setCustomValidity(message: string): void {
      const internals = (this as any)._internals as ElementInternals | undefined;
      (this as any).invalid = Boolean(message);
      (this as any).validityMessage = message;
      if (internals) {
        if (message) {
          internals.setValidity({ customError: true }, message);
        } else {
          internals.setValidity({}, '');
        }
      }
    }
  }

  return ValidityMixinClass as unknown as T & Constructor<ValidityInterface>;
}
```

**Usage in vi-input**:
```typescript
static formAssociated = true;
private _internals = this.attachInternals();

@property({ type: Boolean, reflect: true }) accessor invalid = false;
@property({ type: Boolean, reflect: true }) accessor required = false;
@property() accessor validityMessage = '';

protected override _testValidity(): Partial<ValidityStateFlags> {
  if (this.required && !this.value) return { valueMissing: true };
  return {};
}
```

**Integration with native form submission**:
- `static formAssociated = true` makes the browser include the component in `HTMLFormElement.elements`
- `this._internals.setFormValue(this.value)` must be called whenever `value` changes
- `formResetCallback()` must reset `value` to `defaultValue`
- `formDisabledCallback(disabled)` must sync the `disabled` prop

---

### 5. `RadioGroupManager` — cross-shadow radio coordination (Phase 2)

**Problem**: Native `<input type="radio" name="x">` groups do not work across shadow DOM boundaries. Two `<vi-radio>` elements inside separate shadow roots with the same `name` will never form a native roving-tabindex group — the browser cannot see through the shadow.

**Pattern**: A per-document singleton that manages radio groups as plain JavaScript sets, independent of the DOM. Implements the roving-tabindex pattern (only one tab stop in a group at a time) and wrapping arrow-key navigation.

**File**: `libs/web-components/src/base/radio-group-manager.ts`

```typescript
export type NavigationDirection = -1 | 1;

export interface RadioDelegate {
  checked: boolean;
  tabIndex: number;
  name: string;
  disabled: boolean;
  compareDocumentPosition(other: Node): number;
  focus(): void;
}

/**
 * Per-document singleton managing vi-radio groups across shadow roots.
 *
 * Each vi-radio registers itself on connectedCallback and unregisters
 * on disconnectedCallback. The manager handles:
 *   - Roving tabindex: only the selected (or first) radio is tab-reachable
 *   - Arrow key navigation: wraps at ends
 *   - Cross-shadow boundary: works regardless of where vi-radio elements live
 *
 * Usage in vi-radio:
 *   private _manager = RadioGroupManager.for(this.ownerDocument);
 *
 *   override connectedCallback() {
 *     super.connectedCallback();
 *     this._manager.add(this);
 *     this._manager.syncTabIndex(this.name);
 *   }
 *
 *   override disconnectedCallback() {
 *     this._manager.delete(this);
 *     super.disconnectedCallback();
 *   }
 *
 *   // In keydown handler:
 *   if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
 *     this._manager.navigate(this, 1);
 *   }
 */
class RadioGroupManager {
  private _groups = new Map<string, Set<RadioDelegate>>();

  private constructor(document: Document) {
    RadioGroupManager._instances.set(document, this);
  }

  add(radio: RadioDelegate): void {
    const { name } = radio;
    if (!name) return;
    if (!this._groups.has(name)) this._groups.set(name, new Set());
    this._groups.get(name)!.add(radio);
  }

  delete(radio: RadioDelegate, name = radio.name): void {
    this._groups.get(name)?.delete(radio);
  }

  /**
   * Sync tabIndex across the group. Only the checked radio (or first if none
   * are checked) should have tabIndex=0. All others get tabIndex=-1.
   */
  syncTabIndex(name: string): void {
    const group = this._sortedGroup(name);
    if (!group.length) return;
    const activeRadio = group.find((r) => r.checked) ?? group[0];
    for (const radio of group) {
      radio.tabIndex = radio === activeRadio ? 0 : -1;
    }
  }

  /**
   * Select a radio: sets checked, updates tabIndex, moves focus.
   */
  select(radio: RadioDelegate): void {
    const group = this._sortedGroup(radio.name);
    for (const r of group) {
      r.checked = r === radio;
      r.tabIndex = r === radio ? 0 : -1;
    }
    radio.focus();
  }

  /**
   * Move focus to the next/previous radio (wrapping).
   * direction: 1 = forward (ArrowDown/Right), -1 = backward (ArrowUp/Left)
   */
  navigate(current: RadioDelegate, direction: NavigationDirection): void {
    const group = this._sortedGroup(current.name).filter((r) => !r.disabled);
    if (group.length < 2) return;
    let idx = group.indexOf(current) + direction;
    if (idx < 0) idx = group.length - 1;
    else if (idx >= group.length) idx = 0;
    this.select(group[idx]);
  }

  private _sortedGroup(name: string): RadioDelegate[] {
    const group = this._groups.get(name);
    if (!group) return [];
    return [...group].sort((a, b) => {
      const pos = a.compareDocumentPosition(b as unknown as Node);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
  }

  private static _instances = new WeakMap<Document, RadioGroupManager>();

  /** Returns the singleton for the given document (creates if needed). */
  static for(document: Document): RadioGroupManager {
    return this._instances.get(document) ?? new RadioGroupManager(document);
  }
}

export default RadioGroupManager;
```

**Phase 2 integration**: `vi-radio` registers in `connectedCallback`, unregisters in `disconnectedCallback`. Arrow keys call `manager.navigate(this, 1)`. `Space`/`click` calls `manager.select(this)`. `vi-radio-group` owns no logic — it is a layout/labelling container only.

---

### 6. Document/Window event listeners — safe lifecycle pattern

**Problem**: Components like `vi-dropdown` and `vi-tooltip` need to listen to `document:click` (outside-click dismissal) or `window:keydown` (global Escape). Carbon solved this with `@HostListener` + `HostListenerMixin`. That decorator is not compatible with Stage 3 decorators.

**Pattern**: Use the `Handle` interface (pattern 1 above) directly in `connectedCallback` / `disconnectedCallback`. No decorator needed — it is four lines.

```typescript
// Inside any component that needs document/window listeners:

private _outsideClickHandle: Handle | null = null;
private _escapeHandle: Handle | null = null;

override connectedCallback(): void {
  super.connectedCallback();
  // Attach ONLY when open — avoids always-on global listener
}

private _attachGlobalListeners(): void {
  this._outsideClickHandle = on(
    this.ownerDocument,
    'click',
    this._handleOutsideClick.bind(this),
    { capture: true }  // capture to see the click before any other handler
  );
  this._escapeHandle = on(
    this.ownerDocument,
    'keydown',
    this._handleKeydown.bind(this)
  );
}

private _detachGlobalListeners(): void {
  this._outsideClickHandle = this._outsideClickHandle?.release() ?? null;
  this._escapeHandle = this._escapeHandle?.release() ?? null;
}

override disconnectedCallback(): void {
  this._detachGlobalListeners();  // safety — always clean up on removal
  super.disconnectedCallback();
}
```

**Critical rules**:
1. **Attach on open, detach on close** — never leave a document listener active when the component is closed. A permanently attached `document:click` on every dropdown is a performance anti-pattern.
2. **Use `capture: true` for outside-click** — ensures the click is seen before `stopPropagation` in nested components prevents it from bubbling.
3. **Always detach in `disconnectedCallback`** — even if `open` is managed elsewhere, element removal must guarantee cleanup.
4. **Bind once, store the bound reference** — `this._handleOutsideClick.bind(this)` inside `_attachGlobalListeners` means a new function is created on each call. Store it as a class field if attach/detach cycles frequently:
   ```typescript
   // Better for frequently toggled components:
   private readonly _boundOutsideClick = (e: Event) => this._handleOutsideClick(e);
   ```

---

### Cross-cutting rules derived from the analysis

| Concern | Rule |
|---|---|
| Optional string attributes | Always use `ifNonEmpty()` for `aria-label`, `placeholder`, `title`, `aria-describedby` on inner native elements |
| Event cleanup | Always use `Handle` + `on()` — never raw `addEventListener` without a matching `removeEventListener` in disconnectedCallback |
| Form association | `static formAssociated = true` + `attachInternals()` + `setFormValue()` on every value change + `formResetCallback()` + `formDisabledCallback()` |
| Validation | `ValidityMixin` for all form-associated components; `_testValidity()` returns partial `ValidityStateFlags` |
| Focus within trap | Always query `shadowRoot.activeElement`, not `document.activeElement` (inside shadow DOM, document.activeElement returns the host, not the inner element) |
| Roving tabindex | Use `RadioGroupManager` pattern for any mutually exclusive selection group (radio, tab panels, menu items) |
| Global listeners | Attach on open only, detach on close + always detach in disconnectedCallback; use `{ capture: true }` for outside-click |
| FOCUSABLE_SELECTOR | Update `libs/web-components/src/base/focusable-selector.ts` whenever a new focusable `vi-*` component ships |
