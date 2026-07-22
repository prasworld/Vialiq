# `vi-chip` / `vi-chip-group` — Chip

**Package:** `@vialiq/web-components/chip`  
**Elements:** `<vi-chip>`, `<vi-chip-group>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_chip.scss`

---

## Purpose

An interactive pill/chip component representing a discrete value. More capable than `vi-tag`:

| | `vi-chip` | `vi-tag` |
|-|-----------|---------|
| Primary purpose | Selectable filter / input value | Display-only label / status |
| Interactive | ✅ Selectable, removable, focusable | ✅ removable only |
| Group management | ✅ `vi-chip-group` (multiselect set) | ❌ standalone |
| Avatar support | ✅ | ❌ |
| Checkbox semantics | ✅ (inside group) | ❌ |
| Form participation | ✅ (inside group) | ❌ |

**Use `vi-chip` when:**
- Building a filter toolbar (active/inactive filter chips)
- Representing multi-select options inline (alternative to combobox tags)
- Showing a subject's assigned attributes with ability to toggle/remove
- Building tag input areas where each chip has richer content (avatar, icon, description)

**Use `vi-tag` when:** displaying static read-only labels (status, category, metadata).

**Clinical EDC use cases:**
- Inclusion/exclusion criteria filter chips on subject listings
- Active site filter chips in dashboards
- Assigned monitor/CRA chips
- Form section status chips (inline, selectable to navigate)
- Multi-select filter panel for AE grade, CTCAE term, visit

---

## `vi-chip` API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `value` | `value` | `string` | `''` | — | Value for group selection tracking |
| `selected` | `selected` | `boolean` | `false` | ✅ | Selected / active state |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Chip is not interactive |
| `removable` | `removable` | `boolean` | `false` | ✅ | Show × remove button |
| `variant` | `variant` | `ChipVariant` | `'neutral'` | ✅ | Base colour |
| `size` | `size` | `ChipSize` | `'md'` | ✅ | Chip size |

```typescript
type ChipVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type ChipSize = 'sm' | 'md' | 'lg';
```

### Slots

| Slot | Description |
|------|-------------|
| `avatar` | Leading avatar image or initials |
| `icon` | Leading icon (used when no avatar) |
| *(default)* | Chip label text |
| `trailing-icon` | Trailing icon (separate from remove button) |

### Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vialiq-select` | `CustomEvent<{value: string; selected: boolean}>` | ✅ | Chip is clicked / activated |
| `vialiq-remove` | `CustomEvent<{value: string}>` | ✅ | × remove button clicked |

### CSS Parts

| Part | Element |
|------|---------|
| `chip` | The `<button>` or `<div>` root |
| `avatar` | Avatar slot wrapper |
| `icon` | Leading icon slot wrapper |
| `label` | Label text span |
| `trailing-icon` | Trailing icon slot wrapper |
| `remove-btn` | × remove button |
| `check-icon` | Checkmark when selected |

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-chip-height-sm` | `24px` | Small chip height |
| `--vi-chip-height-md` | `32px` | Medium chip height |
| `--vi-chip-height-lg` | `40px` | Large chip height |
| `--vi-chip-padding` | `0 10px` | Horizontal padding |
| `--vi-chip-border-radius` | `999px` | Pill radius |
| `--vi-chip-border-width` | `1px` | Border width |
| `--vi-chip-gap` | `6px` | Icon/avatar → label gap |
| `--vi-chip-font-size` | `var(--vi-font-size-sm)` | Label font size |
| `--vi-chip-font-weight` | `var(--vi-font-weight-medium)` | Label weight |
| `--vi-chip-transition` | `100ms ease` | State transitions |

Variant + state token matrix (neutral, example):

| State | Background | Border | Text |
|-------|-----------|--------|------|
| Default | `grey-100` | `grey-300` | `grey-700` |
| Hover | `grey-200` | `grey-400` | `grey-900` |
| Selected | `primary` | `primary` | `white` |
| Selected hover | `primary-dark` | `primary-dark` | `white` |
| Disabled | `grey-50` | `grey-200` | `grey-300` |

---

## `vi-chip-group` API

Manages a set of `vi-chip` children as a multiselect (or single-select) control.

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `value` | `value` | `string[]` | `[]` | — | Currently selected chip values |
| `multi` | `multi` | `boolean` | `true` | — | Allow multiple selections |
| `name` | `name` | `string` | `''` | — | Form field name |
| `required` | `required` | `boolean` | `false` | ✅ | At least one chip must be selected |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disable all chips |
| `wrap` | `wrap` | `boolean` | `true` | — | Chips wrap to next line |
| `gap` | `gap` | `string` | `'8px'` | — | Gap between chips |

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | `vi-chip` elements |

### Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vialiq-change` | `CustomEvent<{value: string[]}>` | ✅ | Selection changes |
| `invalid` | `Event` (cancelable) | ❌ | `checkValidity()` fails |

### Imperative Methods

| Method | Description |
|--------|-------------|
| `checkValidity()` | Returns false if required and nothing selected |
| `reportValidity()` | Validates and shows message |
| `selectAll()` | Select all chips |
| `clearAll()` | Deselect all chips |

---

## Shadow DOM Structure

```
vi-chip
└── button[part="chip"] type="button"
    role="option" (inside group) | role="button" (standalone)
    aria-selected=${selected} (inside group)
    aria-pressed=${selected}  (standalone toggle)
    aria-disabled=${disabled}
    tabindex=${disabled ? -1 : 0}
    ├── slot[name="avatar"] .chip-avatar
    ├── slot[name="icon"] .chip-icon       (when no avatar)
    ├── vi-icon[part="check-icon"] name="check" size="12"  (when selected)
    ├── span[part="label"] .chip-label
    │   └── slot (default)
    ├── slot[name="trailing-icon"]
    └── vi-button[part="remove-btn"] (when removable)
        aria-label="Remove {label}"
        → vi-icon name="x" size="12"
```

```
vi-chip-group
└── div[part="group"] role="listbox" aria-multiselectable=${multi}
    aria-label (from host label association)
    aria-required=${required}
    └── slot → vi-chip × N
```

---

## Keyboard Interactions

| Key | Context | Behaviour |
|-----|---------|-----------|
| `Tab` | Group | Enter first chip; `Tab` again exits group |
| `←` / `→` | Inside group | Move focus between chips (roving tabindex) |
| `Space` | Chip focused | Toggle selected state |
| `Enter` | Chip focused | Toggle selected state |
| `Delete` / `Backspace` | Chip focused, removable | Fire `vialiq-remove` |
| `Home` | Inside group | Focus first chip |
| `End` | Inside group | Focus last chip |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Group | `role="listbox"` + `aria-multiselectable` |
| Chip | `role="option"` + `aria-selected` inside group |
| Standalone chip | `role="button"` + `aria-pressed` for toggle behaviour |
| Disabled | `aria-disabled="true"` — chip stays in DOM (not `disabled` attr on button, which removes from AT) |
| Remove button | `aria-label="Remove {chip label}"` |
| Label | Group labelled via `vi-form-field` `aria-labelledby` |
| Required | `aria-required="true"` on group root |

---

## Usage Examples

### Filter bar (EDC subject listing)

```html
<div class="filter-bar">
  <vi-chip-group [value]="activeFilters" (vialiq-change)="onFiltersChange($event.detail.value)">
    <vi-chip value="grade-1">Grade 1</vi-chip>
    <vi-chip value="grade-2">Grade 2</vi-chip>
    <vi-chip value="grade-3" variant="warning">Grade 3</vi-chip>
    <vi-chip value="grade-4" variant="danger">Grade 4</vi-chip>
    <vi-chip value="grade-5" variant="danger">Grade 5</vi-chip>
  </vi-chip-group>

  @if (activeFilters.length > 0) {
    <vi-button variant="ghost" size="sm" (click)="clearFilters()">Clear all</vi-button>
  }
</div>
```

### With avatar (assigned personnel)

```html
<vi-chip-group [value]="selectedMonitors" multi>
  @for (monitor of monitors; track monitor.id) {
    <vi-chip [value]="monitor.id" removable (vialiq-remove)="unassignMonitor($event.detail.value)">
      <img slot="avatar" [src]="monitor.avatarUrl" [alt]="monitor.name">
      {{monitor.name}}
    </vi-chip>
  }
</vi-chip-group>
```

### Single-select (visit selector)

```html
<vi-chip-group
  [value]="[selectedVisit]"
  [multi]="false"
  (vialiq-change)="selectedVisit = $event.detail.value[0]"
>
  @for (visit of visits; track visit.id) {
    <vi-chip [value]="visit.id" variant="primary">
      <vi-icon slot="icon" name="calendar" size="12"></vi-icon>
      {{visit.label}}
    </vi-chip>
  }
</vi-chip-group>
```

### Inline combobox tag alternative

```html
<!-- When vi-combobox[mode="multi"] uses chips via vi-chip instead of vi-tag -->
<vi-chip
  *ngFor="let item of selectedItems"
  [value]="item.value"
  removable
  size="sm"
  (vialiq-remove)="removeItem(item.value)"
>{{item.label}}</vi-chip>
```

---

## Form Participation

`vi-chip-group` is form-associated (`static formAssociated = true`):
- `setFormValue()` with `FormData` containing one entry per selected value: `name=val1&name=val2`
- `formResetCallback()` clears selection and restores to initial `value` attribute
- `formDisabledCallback()` propagates `disabled` to all child chips

---

## Implementation Notes

- `vi-chip-group` observes slotted `vi-chip` children via `slotchange` + `MutationObserver` to maintain the internal selection list and roving tabindex.
- Roving tabindex: only the first selected (or first) chip has `tabindex="0"`; all others `tabindex="-1"`. Arrow keys update the active chip and call `.focus()`.
- The remove button inside `vi-chip` is a **separate focusable element** from the chip itself — `Tab` reaches it after the chip's main button. This avoids the pattern of having a keyboard-inaccessible remove action.

---

## Related Components

- [`vi-tag`](./vi-tag.md) — display-only label; no group management
- [`vi-combobox`](./vi-combobox.md) — multi-mode uses chips internally
- [`vi-badge`](./vi-badge.md) — count indicator (non-interactive)
- [`vi-select`](./vi-select.md) — dropdown alternative for single selection
