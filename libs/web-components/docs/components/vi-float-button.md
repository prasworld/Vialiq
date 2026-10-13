# `vi-float-button` — Floating Action Button & Speed Dial

**Package:** `@vialiq/web-components/float-button`  
**Elements:** `<vi-float-button>`, `<vi-float-button-group>`  
**Status:** 🔲 Planned — Phase 4 (Tier 4)  
**Flux UI base:** `libs/flux-ui/components/_float-button.scss`  

---

## Purpose

A floating action button positioned fixed over page content (typically bottom-right). Provides persistent access to high-frequency actions, back-to-top navigation, and expandable speed-dial menus.

Wraps a native `<button>` or `<a>` element in Shadow DOM with full keyboard accessibility, badges, and tooltip integration.

### Clinical EDC & Enterprise Use Cases
- **Back-to-Top Navigation:** Smooth scroll to the top of long Case Report Forms (CRFs), medical audit logs, and multi-visit schedules.
- **Quick Action Launcher:** Float a persistent button to "Raise Query", "Report Adverse Event (AE)", or "Add Concomitant Medication" without scrolling back to specific sections.
- **Speed Dial Menu:** Expand a cluster of contextual actions (e.g., Export PDF, Lock CRF, Print Subject Summary).
- **In-App Help / Protocol Navigator:** Launch clinical study protocol documentation or sponsor contact info.

---

## Public API

### `<vi-float-button>` Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `shape` | `shape` | `'circle' \| 'square'` | `'circle'` | ✅ | Button geometry |
| `type` | `type` | `'default' \| 'primary'` | `'default'` | ✅ | Visual importance |
| `size` | `size` | `'default' \| 'sm'` | `'default'` | ✅ | Size: default (48px) or sm (40px) |
| `description` | `description` | `string` | `undefined` | ✅ | Text label under icon (especially in square shape) |
| `tooltip` | `tooltip` | `string` | `undefined` | — | Text tooltip displayed on hover/focus |
| `href` | `href` | `string` | `undefined` | ✅ | URL to navigate to (renders `<a>` when present) |
| `target` | `target` | `string` | `undefined` | ✅ | Anchor link target (`_blank`, `_self`, etc.) |
| `badge` | `badge` | `number \| string` | `undefined` | ✅ | Numeric count or text badge |
| `badgeDot` | `badge-dot` | `boolean` | `false` | ✅ | Show a dot badge indicator |
| `badgeStatus` | `badge-status` | `BadgeStatus` | `'danger'` | ✅ | Badge semantic color |
| `backTop` | `back-top` | `boolean` | `false` | ✅ | Enables smooth back-to-top scrolling mode |
| `visibilityHeight` | `visibility-height` | `number` | `400` | ✅ | Scroll threshold (px) before backTop button appears |
| `scrollTarget` | `scroll-target` | `string` | `undefined` | — | CSS selector or ID of scrollable container (defaults to `window`) |
| `duration` | `duration` | `number` | `450` | — | Scroll animation duration (ms) |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables interactions |

#### Types
```typescript
type FloatButtonShape = 'circle' | 'square';
type FloatButtonType = 'default' | 'primary';
type FloatButtonSize = 'default' | 'sm';
type BadgeStatus = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
```

---

### `<vi-float-button-group>` Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `shape` | `shape` | `'circle' \| 'square'` | `'circle'` | ✅ | Geometry inherited by child buttons |
| `trigger` | `trigger` | `'click' \| 'hover'` | `'hover'` | ✅ | Interaction mode to expand the menu |
| `open` | `open` | `boolean` | `false` | ✅ | Expanded state of the speed dial menu |
| `closeIcon` | `close-icon` | `string` | `'x'` | ✅ | Icon displayed on the trigger when expanded |

---

### Slots

#### `<vi-float-button>` Slots

| Slot | Description |
|------|-------------|
| `icon` | Icon element (e.g. `<vi-icon name="...">`) |
| `description` | Slotted description content underneath icon |
| `tooltip` | Slotted custom tooltip content (e.g. rich `<vi-tooltip>`) |
| *(default)* | Fallback button content |

#### `<vi-float-button-group>` Slots

| Slot | Description |
|------|-------------|
| *(default)* | Slotted child `<vi-float-button>` elements |
| `icon` | Main trigger button icon (when collapsed) |
| `close-icon` | Custom icon element when group is expanded |
| `description` | Slotted trigger button description |

---

### Events

All custom events follow the repository standard `vi-[component-type]-[event-name]` convention (see [.agents/rules/web-component-events.md](file:///Users/prashantgupta/code/nx/.agents/rules/web-component-events.md)):

| Event | Target | Detail | Description |
|-------|--------|--------|-------------|
| `vi-float-button-click` | `<vi-float-button>` | `{ originalEvent: MouseEvent \| KeyboardEvent }` | Dispatched when a floating button is clicked/activated |
| `vi-float-button-back-top` | `<vi-float-button>` | `{ scrollTarget: HTMLElement \| Window }` | Dispatched when back-top triggers scrolling |
| `vi-float-button-open-change` | `<vi-float-button-group>` | `{ open: boolean }` | Dispatched when group menu expands or collapses |

---

### CSS Parts

#### `<vi-float-button>` Parts

| Part | Element | Purpose |
|------|---------|---------|
| `control` | Host wrapper | Outer container (handles fixed/absolute positioning) |
| `button` | `<button>` or `<a>` | Interactive button core |
| `icon` | `<span>` | Icon slot wrapper |
| `description` | `<span>` | Description label wrapper |
| `badge` | `<span>` / `<vi-badge>` | Badge indicator |

#### `<vi-float-button-group>` Parts

| Part | Element | Purpose |
|------|---------|---------|
| `group` | Host wrapper | Group container |
| `trigger` | `<vi-float-button>` | The main toggle trigger button |
| `menu` | `<div>` | Floating container for speed dial child buttons |

---

### CSS Custom Properties

Following the 3-level cascade token pattern (see [.agents/rules/semantic-colors.md](file:///Users/prashantgupta/code/nx/.agents/rules/semantic-colors.md)):

```scss
// Level 1: Consumer override
// Level 2 & 3: Semantic token
background-color: var(--vi-float-button-bg, #{tokens.$layer-01});
```

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-float-button-size` | `48px` | Diameter / box dimension (default size) |
| `--vi-float-button-size-sm` | `40px` | Diameter / box dimension (sm size) |
| `--vi-float-button-bg` | `tokens.$layer-01` | Default button surface background |
| `--vi-float-button-bg-primary` | `tokens.$color-primary` | Primary button surface background |
| `--vi-float-button-color` | `tokens.$text-primary` | Default button text & icon colour |
| `--vi-float-button-color-primary` | `tokens.$text-primary-inverse` | Primary button text & icon colour |
| `--vi-float-button-border-color` | `tokens.$border-02` | Outer border colour |
| `--vi-float-button-border-radius` | `tokens.$border-radius-full` | Radius for circle shape (`9999px`) |
| `--vi-float-button-border-radius-square` | `tokens.$border-radius-lg` | Radius for square shape (`8px`) |
| `--vi-float-button-shadow` | `tokens.$shadow-lg` | Default resting elevation shadow |
| `--vi-float-button-shadow-hover` | `tokens.$shadow-xl` | Hover / active elevation shadow |
| `--vi-float-button-hover-bg` | `tokens.$layer-hover-01` | Hover state background (default) |
| `--vi-float-button-hover-bg-primary` | `tokens.$color-blue-800` | Hover state background (primary) |
| `--vi-float-button-focus-ring-color` | `tokens.$focus` | Focus-visible ring colour |
| `--vi-float-button-font-size` | `tokens.$font-size-xs` | Description text size |
| `--vi-float-button-inset-inline-end` | `24px` | Distance from right edge (LTR) |
| `--vi-float-button-inset-block-end` | `48px` | Distance from bottom edge |
| `--vi-float-button-z-index` | `1030` | Viewport fixed layer z-index |
| `--vi-float-button-group-gap` | `tokens.$spacing-xs` | Gap between buttons in speed dial |
| `--vi-float-button-transition-duration` | `200ms` | Smooth hover/pop transition time |

---

## Keyboard Interactions

| Key | Context | Behaviour |
|-----|---------|-----------|
| `Tab` / `Shift+Tab` | Pinned or Speed Dial | Move focus to/from the float button or group trigger |
| `Enter` / `Space` | `<vi-float-button>` | Activate button click or back-to-top action |
| `Enter` / `Space` | `<vi-float-button-group>` | Toggle expanded menu state (when `trigger="click"`) |
| `Escape` | `<vi-float-button-group>` | Collapse expanded speed dial menu and return focus to trigger |
| `ArrowUp` / `ArrowDown` | `<vi-float-button-group>` | Move focus between speed dial menu items |

---

## Accessibility (a11y)

| Requirement | Implementation |
|-------------|----------------|
| Role | Native `<button>` (`role="button"`) or native `<a>` (`role="link"`) |
| Accessible Name | Inherited from `aria-label`, slotted description, or `tooltip` |
| Group Menu State | Trigger button exposes `aria-haspopup="menu"` and `aria-expanded="true|false"` |
| Back-to-Top State | Smooth scrolling with `prefers-reduced-motion` fallback (`behavior: 'auto'`) |
| Focus Ring | Standard `@mixin vi-focus-ring` on inner button `:focus-visible` |

---

## Usage Examples

### 1. Basic Floating Action Button

```html
<vi-float-button aria-label="Help">
  <vi-icon slot="icon" name="help-circle"></vi-icon>
</vi-float-button>
```

### 2. Primary Button with Badge

```html
<vi-float-button
  type="primary"
  badge="3"
  badge-status="danger"
  tooltip="3 Open Queries"
  aria-label="3 Open Queries"
>
  <vi-icon slot="icon" name="message-square"></vi-icon>
</vi-float-button>
```

### 3. Square Button with Description

```html
<vi-float-button
  shape="square"
  description="Audit"
  tooltip="Audit Trail"
>
  <vi-icon slot="icon" name="file-text"></vi-icon>
</vi-float-button>
```

### 4. Back-to-Top Scroller

```html
<!-- Default window scrolling -->
<vi-float-button
  back-top
  visibility-height="300"
  tooltip="Scroll to Top"
  aria-label="Scroll to Top"
>
  <vi-icon slot="icon" name="arrow-up"></vi-icon>
</vi-float-button>

<!-- Custom scroll container targeting by bare ID or CSS selector -->
<div id="scrollable-panel" style="overflow-y: auto; max-height: 400px;">
  <!-- Long content... -->
</div>
<vi-float-button
  back-top
  scroll-target="scrollable-panel"
  visibility-height="200"
  duration="450"
  tooltip="Scroll panel to Top"
  aria-label="Scroll panel to Top"
>
</vi-float-button>
```

### 5. Expandable Speed Dial Group

```html
<vi-float-button-group trigger="click" aria-label="CRF Quick Actions">
  <vi-icon slot="icon" name="plus"></vi-icon>

  <!-- Speed dial actions -->
  <vi-float-button tooltip="Add Adverse Event">
    <vi-icon slot="icon" name="alert-triangle"></vi-icon>
  </vi-float-button>
  <vi-float-button tooltip="Add Concomitant Med">
    <vi-icon slot="icon" name="activity"></vi-icon>
  </vi-float-button>
  <vi-float-button tooltip="Print Summary">
    <vi-icon slot="icon" name="printer"></vi-icon>
  </vi-float-button>
</vi-float-button-group>
```

---

## Angular Integration

```typescript
@Component({
  selector: 'app-crf-page',
  template: `
    <!-- Pinned back-to-top button -->
    <vi-float-button
      back-top
      [visibilityHeight]="400"
      [duration]="450"
      (vi-float-button-back-top)="onScrolledToTop()"
    >
      <vi-icon slot="icon" name="chevron-up"></vi-icon>
    </vi-float-button>

    <!-- Speed dial for query actions -->
    <vi-float-button-group
      trigger="click"
      [attr.open]="isMenuOpen ? '' : null"
      (vi-float-button-open-change)="onMenuChange($event)"
    >
      <vi-icon slot="icon" name="more-vertical"></vi-icon>
      <vi-float-button
        type="primary"
        [badge]="pendingQueriesCount"
        (vi-float-button-click)="openQueryModal()"
      >
        <vi-icon slot="icon" name="help-circle"></vi-icon>
      </vi-float-button>
    </vi-float-button-group>
  `
})
export class CrfPageComponent {
  pendingQueriesCount = 4;
  isMenuOpen = false;

  onScrolledToTop(): void {
    console.log('User scrolled back to top');
  }

  onMenuChange(event: CustomEvent<{ open: boolean }>): void {
    this.isMenuOpen = event.detail.open;
  }

  openQueryModal(): void {
    // Open clinical query creation dialog
  }
}
```

---

## Implementation Plan

1. **SCSS Module (`libs/flux-ui/components/_float-button.scss`)**:
   - Fixed viewport positioning defaults (`position: fixed; inset-inline-end: 24px; inset-block-end: 48px; z-index: 1030`).
   - Circle and square shapes, size scales (`default` 48px, `sm` 40px).
   - High elevation shadows and hover transitions.
   - Expandable group styling: staggered slide-up animation for child buttons when `open`.
   - Reduced motion fallback (instant show/hide).
2. **Lit Component (`libs/web-components/src/float-button/`)**:
   - `vi-float-button.ts`: implements `<vi-float-button>`, inherits `FocusableMixin`, listens to scroll events when `backTop` is set.
   - `vi-float-button-group.ts`: implements `<vi-float-button-group>`, coordinates speed dial menu items and focus management.
   - Export from `libs/web-components/src/index.ts`.
3. **Tests & Stories**:
   - Unit/WDIO tests for scroll threshold visibility, smooth scrolling invocation, group expansion, and escape key listener.
   - Storybook stories showcasing Circle, Square, Description, Badge, BackTop, and Speed Dial group.

---

## Related Components

- [`vi-button`](./vi-button.md) — Standard inline action buttons
- [`vi-badge`](./vi-badge.md) — Status and numeric count indicators
- [`vi-tooltip`](./vi-tooltip.md) — Informational hover popups
- [`vi-affix`](./vi-affix.md) — Viewport scroll pinning container
