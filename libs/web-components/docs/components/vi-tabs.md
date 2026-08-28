# `vi-tabs` / `vi-tab` / `vi-tab-panel` — Tabs

**Package:** `@vialiq/web-components/tabs`  
**Elements:** `<vi-tabs>`, `<vi-tab>`, `<vi-tab-panel>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_tabs.scss`

---

## Purpose

A three-part composite following the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/):

- `vi-tabs` — the container; owns active-tab state and keyboard navigation
- `vi-tab` — a single tab button in the tablist
- `vi-tab-panel` — the content pane associated with a tab

Supports four advanced features:
1. **Closable tabs** — individual tabs can be dismissed with × button
2. **Dynamic tabs** — tabs added/removed at runtime via host app
3. **Responsive overflow** — handles tab lists wider than available space
4. **Vertical orientation** — tabs along left/right side

**Clinical EDC use cases:**
- Visit tabs in a subject record (Screening / V1 / V2 / … / EOS)
- Form category tabs (Demographics / Vitals / Labs / Medications)
- Site-level dashboard tabs (Overview / Subjects / Queries / Documents)
- Multi-site comparison tabs
- Data review: Raw data / SDV notes / Queries tabs

---

## `vi-tabs` API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `active` | `active` | `string` | `''` | ✅ | ID of the active tab |
| `orientation` | `orientation` | `TabsOrientation` | `'horizontal'` | ✅ | Layout direction |
| `variant` | `variant` | `TabsVariant` | `'line'` | ✅ | Visual style |
| `overflow` | `overflow` | `TabsOverflow` | `'scroll'` | — | Overflow handling strategy |
| `addable` | `addable` | `boolean` | `false` | — | Show "+" button to add tab |
| `activation` | `activation` | `TabsActivation` | `'manual'` | — | When tab becomes active |
| `anchorClosable` | `anchor-closable` | `boolean` | `false` | — | When `true`, closable tabs are visually sorted to the end of the tablist |

```typescript
type TabsOrientation = 'horizontal' | 'vertical';

type TabsVariant =
  | 'line'    // underline indicator (default)
  | 'pill'    // filled pill background
  | 'card'    // bordered card tabs (as in browser-style tabs)
  | 'enclosed'; // tabbed within a bordered box

type TabsOverflow =
  | 'scroll'  // horizontal scroll with fade shadows
  | 'menu'    // hidden tabs collapse into "More ▾" dropdown
  | 'wrap';   // tabs wrap to next line (use sparingly)

type TabsActivation =
  | 'automatic'  // focus = activate immediately
  | 'manual';    // focus only; user must press Enter/Space to activate (default)
```

**`activation` note:** Default is `'manual'`. ARIA guidance recommends `manual` for content-heavy tabs (like clinical EDC forms) to avoid triggering expensive renders on every arrow key press. Only use `'automatic'` for lightweight, instantly-renderable content.

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | `vi-tab` elements |
| `add-button` | Custom "add tab" trigger (replaces default + button) |
| `overflow-menu` | Custom overflow menu trigger (replaces default "More ▾") |

### Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vi-tabs-before-change` | `CustomEvent<{fromTabId: string; toTabId: string}>` | ✅ | Before active tab changes (cancelable) |
| `vi-tabs-change` | `CustomEvent<{fromTabId: string; toTabId: string}>` | ✅ | Active tab changes |
| `vi-tabs-tab-close` | `CustomEvent<{tabId: string}>` | ✅ | A closable tab's × button was clicked and action wasn't cancelled |
| `vi-tabs-add` | `CustomEvent<void>` | ✅ | "+" add button clicked |

#### Intercepting Tab Activation

There is no `vi-tab-before-open` event because tabs are a mutually exclusive state where you "switch" between active tabs. To intercept a tab from becoming active (e.g., to check permissions or warn about unsaved changes), listen for `vi-tabs-before-change` on the parent container and call `e.preventDefault()`:

```javascript
tabs.addEventListener('vi-tabs-before-change', (e) => {
  if (e.detail.toTabId === 'restricted-tab' && !userHasAccess) {
    e.preventDefault(); // Stops the tab from "opening"
    alert('You do not have access to this tab!');
  }
});
```

### CSS Parts

| Part | Element |
|------|---------|
| `tablist` | The `role="tablist"` container |
| `scroll-area` | Scrollable wrapper (overflow=scroll) |
| `scroll-btn-start` | Left/top scroll button |
| `scroll-btn-end` | Right/bottom scroll button |
| `more-btn` | "More ▾" overflow menu trigger |
| `add-btn` | "+" add tab button |
| `tab-indicator` | Active tab underline/indicator (line variant) |

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-tabs-border-color` | `var(--vi-color-grey-200)` | Tab strip bottom border |
| `--vi-tabs-indicator-color` | `var(--vi-color-primary)` | Active tab indicator |
| `--vi-tabs-indicator-thickness` | `2px` | Indicator bar thickness |
| `--vi-tabs-gap` | `0px` | Gap between tabs |
| `--vi-tabs-scroll-fade-width` | `40px` | Scroll fade gradient width |

---

## `vi-tab` API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `tabId` | `tab-id` | `string` | auto-generated | ✅ | Unique ID linking to `vi-tab-panel[for]` |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Tab is not selectable |
| `closable` | `closable` | `boolean` | `false` | ✅ | Show × close button |
| `badgeCount` | `badge-count` | `number` | `undefined` | — | Notification count badge |

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | Tab label text |
| `icon` | Leading icon |

### Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vi-tab-before-close` | `CustomEvent<{tabId: string}>` | ✅ | Before × close button completes action (cancelable) |
| `vi-tab-close` | `CustomEvent<{tabId: string}>` | ✅ | × close button clicked |

### CSS Parts

| Part | Element |
|------|---------|
| `tab` | The tab container `<div>` element |
| `icon` | Icon slot wrapper |
| `label` | Label text span |
| `badge` | Count badge |
| `close-btn` | × close button |

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-tab-padding` | `10px 16px` | Tab button padding |
| `--vi-tab-font-size` | `var(--vi-font-size-sm)` | Tab label size |
| `--vi-tab-font-weight` | `var(--vi-font-weight-medium)` | Tab label weight |
| `--vi-tab-color` | `var(--vi-color-grey-600)` | Inactive tab colour |
| `--vi-tab-color-active` | `var(--vi-color-primary)` | Active tab colour |
| `--vi-tab-color-hover` | `var(--vi-color-grey-900)` | Hover colour |
| `--vi-tab-color-disabled` | `var(--vi-color-grey-300)` | Disabled colour |
| `--vi-tab-close-size` | `16px` | × button icon size |
| `--vi-tab-min-width` | `80px` | Minimum tab width |
| `--vi-tab-max-width` | `200px` | Maximum tab width (clamps label) |

---

## `vi-tab-panel` API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `for` | `for` | `string` | `''` | — | `tab-id` of the corresponding `vi-tab` |
| `lazy` | `lazy` | `boolean` | `false` | — | Only render content when first activated |

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | Panel content |

### CSS Parts

| Part | Element |
|------|---------|
| `panel` | The inner panel container (`<div>`) |

---

## DOM Structure

```html
<vi-tabs active="visit-2">

  <!-- vi-tab elements (light DOM, slotted into vi-tabs) -->
  <vi-tab tab-id="visit-1">Visit 1</vi-tab>
  <vi-tab tab-id="visit-2" badge-count="3">Visit 2</vi-tab>
  <vi-tab tab-id="visit-3" closable>Visit 3</vi-tab>
  <vi-tab tab-id="visit-4" disabled>Visit 4</vi-tab>

  <!-- vi-tab-panel elements (light DOM, associated by for attr) -->
  <vi-tab-panel for="visit-1">...</vi-tab-panel>
  <vi-tab-panel for="visit-2">...</vi-tab-panel>
  <vi-tab-panel for="visit-3">...</vi-tab-panel>
  <vi-tab-panel for="visit-4">...</vi-tab-panel>

</vi-tabs>
```

`vi-tabs` shadow DOM renders:
1. A `role="tablist"` that slots the `vi-tab` children (selecting them via `::slotted(vi-tab)`)
2. A panel area that shows the `vi-tab-panel` for the active tab

---

## Keyboard Interactions

The `vi-tabs` implements roving tabindex on `vi-tab` children:

| Key | Behaviour |
|-----|-----------|
| `Tab` | Enter tablist on active tab; next `Tab` jumps to panel |
| `←` / `→` | Move focus to previous/next tab (horizontal) with focus wrapping |
| `↑` / `↓` | Move focus to previous/next tab (vertical) with focus wrapping |
| `Home` | Move to first tab |
| `End` | Move to last tab |
| `Enter` / `Space` | Activate focused tab (manual activation mode) |
| `Delete` | Close tab (if `closable`) |
| `Shift+Tab` | From panel: back to active tab |

In `activation="automatic"` mode, focus movement also activates the tab — no Enter needed.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Tablist | `role="tablist"` on tablist container; `aria-orientation` |
| Tab | `role="tab"` on the `vi-tab` host element |
| Selected | `aria-selected="true/false"` on each tab |
| Position/Size | `aria-setsize` and `aria-posinset` managed dynamically (critical for responsive swapping) |
| Panel link | `aria-controls="{panel-id}"` on tab |
| Tab focus | Only active tab in tab order (`tabindex="0"`); others `tabindex="-1"` (roving on host) |
| Panel | `role="tabpanel"` + `aria-labelledby="{tab-id}"` on the `vi-tab-panel` host element |
| Panel focus | `tabindex="0"` on panel to allow Shift+Tab back (per APG recommendation) |
| Disabled tab | `aria-disabled="true"` + excluded from roving tabindex |
| Closable tab | × button: `aria-label="Close {tab label}"` |
| Add button | `aria-label="Add new tab"` |
| Overflow menu | `aria-label="More tabs"` + `aria-haspopup="menu"` + `aria-expanded="true/false"` |

---

## Overflow Handling

### `overflow="scroll"` (default)

The tablist scrolls horizontally. Fade-out gradients on edges indicate more content. Arrow buttons appear when scrolling is possible:

```
[←] [Visit 1] [Visit 2] [Visit 3] [Visit 4] [Visit...→] [+]
```

Scroll buttons are `vi-button[icon-only][variant="ghost"]` with `aria-label="Scroll tabs left/right"`.

### `overflow="menu"` (Dynamic Placement)

Tabs that exceed the container's width automatically collapse into a "More ▾" dropdown menu. 

**Dynamic Swap Placement**:
To ensure the user always sees the active tab, selecting a tab from the "More" dropdown will **swap** its position with the last visible tab.
- The selected hidden tab is placed at the end of the visible tab strip.
- The tab that was previously at the end of the visible strip is moved into the "More" section.

```
[Visit 1] [Visit 2] [Visit 3] [More ▾]  [+]
                                ↓ (dropdown)
                          [Visit 4]
                          [Visit 5]
```
*(If Visit 4 is selected, it swaps places with Visit 3 in the visual order).*

The "More ▾" button shows the count of hidden tabs: `More (2)`.

**ARIA Role Switching on Overflow**:
- Tabs in the **visible strip**: `role="tab"` with correct `aria-setsize` / `aria-posinset`.
- Tabs in the **overflow dropdown**: `role="menuitem"` (NOT `role="tab"`). Using `role="tab"` here would create a duplicate tablist that screen readers would announce incorrectly.
- After a swap, the moved-in tab receives `role="tab"` and the moved-out tab receives `role="menuitem"`.

**Focus Rule After Swap**: After a tab is selected from the overflow dropdown and swapped into the visible strip, focus MUST move to the newly visible tab — not to the "More ▾" button.

### `overflow="wrap"`

Tabs wrap to a second row. Use only for ≤ 10 tabs in a wide viewport; avoid for dynamic tab counts.

---

## Closable Tabs

When `vi-tab[closable]`, a × button appears inside the tab.

**Sorting & Layout**:
- By default, tabs render in DOM order regardless of `closable` state.
- When `vi-tabs[anchor-closable]` is set, closable tabs are **visually sorted to the end** of the tab list via CSS `order`, keeping non-closable (permanent) tabs anchored on the left. The underlying DOM order is not mutated.

**Focus & Fallback Activation**:
1. User clicks × (or presses `Delete`) → A cancelable `vi-tabs-before-close` event fires on `vi-tabs`.
2. If not cancelled, the `vi-tabs-close` event fires with `{ tabId }`.
3. Host app receives event and removes the tab from its data list.
4. `vi-tabs` automatically moves focus and activation:
   - **Default**: Move to the **tab immediately before** the closed tab (to its left).
   - **Edge case — first tab closed**: If the closed tab was the first in the list, focus falls **forward** to the new first tab.

```typescript
// Host app handles close
onTabClose(tabId: string) {
  // IMPORTANT: capture the index BEFORE filtering
  const idx = this.visitTabs.findIndex(v => v.id === tabId);
  this.visitTabs = this.visitTabs.filter(v => v.id !== tabId);
  if (this.activeTab === tabId) {
    // Fall back to previous tab, or first if it was the first tab
    this.activeTab = this.visitTabs[Math.max(0, idx - 1)]?.id ?? '';
  }
}
```

`vi-tabs` itself **does not remove the DOM** — the host owns tab data.

---

## Dynamic Tabs

When `addable="true"`, `vi-tabs` renders a "+" button that fires `vi-tabs-add`:

```html
<vi-tabs addable (vi-tabs-add)="addNewVisit()">
  @for (visit of visits; track visit.id) {
    <vi-tab [tabId]="visit.id" closable>{{visit.label}}</vi-tab>
  }
  @for (visit of visits; track visit.id) {
    <vi-tab-panel [for]="visit.id">
      <app-visit-form [visitId]="visit.id"></app-visit-form>
    </vi-tab-panel>
  }
</vi-tabs>
```

---

## Lazy Loading Panels

By default all panels render but only the active one is visible (`display: none` on inactive). For expensive panels, use `lazy`:

```html
<vi-tab-panel for="reports" lazy>
  <!-- Only rendered when tab is first activated -->
  <app-reports-dashboard></app-reports-dashboard>
</vi-tab-panel>
```

`lazy` renders the slot content on first activation, then keeps it (does not destroy on tab switch).

---

## Usage Examples

### Basic tabs

```html
<vi-tabs active="demographics">
  <vi-tab tab-id="demographics">Demographics</vi-tab>
  <vi-tab tab-id="vitals">Vital Signs</vi-tab>
  <vi-tab tab-id="labs">Laboratory</vi-tab>
  <vi-tab tab-id="medications">Medications</vi-tab>

  <vi-tab-panel for="demographics">
    <app-demographics-form></app-demographics-form>
  </vi-tab-panel>
  <vi-tab-panel for="vitals">
    <app-vitals-form></app-vitals-form>
  </vi-tab-panel>
  <vi-tab-panel for="labs">
    <app-labs-form></app-labs-form>
  </vi-tab-panel>
  <vi-tab-panel for="medications">
    <app-medications-form></app-medications-form>
  </vi-tab-panel>
</vi-tabs>
```

### Visit tabs with badges (query counts) and close

```html
<vi-tabs [active]="activeVisitId" overflow="scroll" anchor-closable
  (vi-tabs-change)="activeVisitId = $event.detail.toTabId"
  (vi-tabs-close)="removeVisit($event.detail.tabId)"
  addable
  (vi-tabs-add)="openAddVisitDialog()">

  @for (visit of visits; track visit.id) {
    <vi-tab
      [tabId]="visit.id"
      [closable]="!visit.locked"
      [badgeCount]="visit.openQueryCount"
    >
      <vi-icon slot="icon" name="calendar" size="14"></vi-icon>
      {{visit.label}}
    </vi-tab>
  }

  @for (visit of visits; track visit.id) {
    <vi-tab-panel [for]="visit.id" lazy>
      <app-visit-detail [visitId]="visit.id"></app-visit-detail>
    </vi-tab-panel>
  }
</vi-tabs>
```

### Pill variant (dashboard nav)

```html
<vi-tabs variant="pill" active="overview">
  <vi-tab tab-id="overview">Overview</vi-tab>
  <vi-tab tab-id="subjects">Subjects</vi-tab>
  <vi-tab tab-id="queries">Queries</vi-tab>
  <vi-tab tab-id="documents">Documents</vi-tab>
  <!-- panels... -->
</vi-tabs>
```

### Vertical orientation (sidebar tabs)

```html
<div class="layout-sidebar-tabs">
  <vi-tabs orientation="vertical" variant="line" active="settings-general">
    <vi-tab tab-id="settings-general">General</vi-tab>
    <vi-tab tab-id="settings-users">Users</vi-tab>
    <vi-tab tab-id="settings-roles">Roles & Permissions</vi-tab>
    <vi-tab tab-id="settings-audit">Audit Log</vi-tab>
    <!-- panels... -->
  </vi-tabs>
</div>
```

### Manual activation (heavy content tabs)

```html
<vi-tabs activation="manual" active="reports">
  <vi-tab tab-id="reports">Reports</vi-tab>
  <vi-tab tab-id="exports">Data Exports</vi-tab>
  <!-- Arrow keys move focus; Enter activates (no expensive render on every keypress) -->
</vi-tabs>
```

---

## Implementation Notes

- `vi-tabs` maintains an internal list of `vi-tab` children by observing slot changes via `slotchange` event.
- Roving tabindex is implemented by `vi-tabs` iterating over slotted `vi-tab` elements and setting the host's `tabIndex` directly.
- The active indicator (line variant) is a `position: absolute` element animated with CSS `left`/`width` transitions — it slides between tabs smoothly.
- The `vi-tab-panel` uses `delegatesFocus: true` and receives `role="tabpanel"` on its host element, ensuring reliable styling for `:focus-visible` without breaking ARIA hierarchies.
- Panel visibility: inactive panels use `display: contents; visibility: hidden` or `display: none` depending on `lazy` setting.
- `MutationObserver` watches for tab additions/removals to update overflow calculation.

---

## Related Components

- [`vi-modal`](./vi-modal.md) — full-screen overlay (alternative to tabs for complex forms)
- [`vi-accordion`](./vi-accordion.md) — collapsible sections (alternative for mobile)
- [`vi-badge`](./vi-badge.md) — count badge on tabs
- [`vi-dropdown`](./vi-dropdown.md) — used internally for overflow="menu"
