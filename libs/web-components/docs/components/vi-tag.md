# `vi-tag` — Removable Tag / Chip

**Package:** `@vialiq/web-components/tag`  
**Element:** `<vi-tag>`  
**Status:** 🔲 Planned — Phase 1  
**Flux UI base:** `libs/flux-ui/components/_tag.scss`

---

## Purpose

An interactive label/chip that can be removed (dismissed) by the user. Used to represent selected values, filters, or categorisations that can be cleared.

**Distinction from `vi-badge`:**
- `vi-badge` — static, non-interactive, purely informational
- `vi-tag` — interactive, can be selected, toggled, or removed

**Clinical EDC use cases:**
- Selected filters in a subject listing (e.g. "Site: 001", "Visit: Baseline")
- Selected medication categories in a multi-select combobox
- Applied protocol flags
- Keyword tags on documents or forms

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `variant` | `variant` | `TagVariant` | `'neutral'` | ✅ | Colour variant |
| `size` | `size` | `TagSize` | `'md'` | ✅ | Size |
| `removable` | `removable` | `boolean` | `false` | — | Show remove (×) button |
| `selected` | `selected` | `boolean` | `false` | ✅ | Selected/active state |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disable interactions |

```typescript
type TagVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
type TagSize = 'sm' | 'md' | 'lg';
```

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | Tag label text |
| `icon` | Leading icon (e.g. category icon) |

---

### Events

| Event | Type | Bubbles | Composed | Fires when |
|-------|------|---------|---------|-----------|
| `vialiq-remove` | `CustomEvent<void>` | ✅ | ✅ | Remove button clicked or `Delete`/`Backspace` pressed |
| `vialiq-select` | `CustomEvent<{selected: boolean}>` | ✅ | ✅ | Tag clicked (toggles selected) |

---

### CSS Parts

| Part | Element |
|------|---------|
| `tag` | The tag container `<span>` |
| `icon` | Leading icon slot wrapper |
| `label` | Label text |
| `remove-btn` | The × remove button |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-tag-height` | `24px` | Tag height (md) |
| `--vi-tag-padding` | `0 10px` | Horizontal padding |
| `--vi-tag-border-radius` | `4px` | Corner radius |
| `--vi-tag-font-size` | `12px` | Label font size |
| `--vi-tag-font-weight` | `var(--vi-font-weight-medium)` | Label weight |
| `--vi-tag-gap` | `4px` | Gap: icon → label → remove |
| `--vi-tag-remove-size` | `16px` | Remove button icon size |
| `--vi-tag-transition` | `120ms ease` | Hover/select animation |
| `--vi-tag-disabled-opacity` | `0.5` | Disabled opacity |

---

## Usage Examples

### Filter tags (removable)

```html
<div class="active-filters" role="list" aria-label="Active filters">
  <vi-tag removable @vialiq-remove="removeFilter('site')">
    Site: 001
  </vi-tag>
  <vi-tag removable @vialiq-remove="removeFilter('visit')">
    Visit: Baseline
  </vi-tag>
  <vi-tag removable variant="warning" @vialiq-remove="removeFilter('status')">
    Status: Query Open
  </vi-tag>
</div>
```

### Selectable filter chips

```html
<div class="filter-chips" role="group" aria-label="Filter by status">
  <vi-tag selected @vialiq-select="toggleFilter('draft')">Draft</vi-tag>
  <vi-tag @vialiq-select="toggleFilter('submitted')">Submitted</vi-tag>
  <vi-tag @vialiq-select="toggleFilter('locked')">Locked</vi-tag>
</div>
```

### With icon

```html
<vi-tag variant="primary" removable>
  <vi-icon slot="icon" name="user" size="12"></vi-icon>
  Dr. Smith
</vi-tag>
```

### Keyboard: remove with Delete/Backspace

When a removable tag is focused, `Delete` or `Backspace` fires `vialiq-remove`. This matches standard chip/tag keyboard conventions (see Material Design and ARIA patterns).

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Role | `role="listitem"` when inside a `role="list"` container |
| Remove action | Remove button has `aria-label="Remove [tag text]"` |
| Keyboard | `Delete` / `Backspace` on focused tag fires remove |
| Selected | `aria-pressed` on clickable tags |
| Disabled | `aria-disabled="true"`, `tabindex="-1"` |

---

## Related Components

- [`vi-badge`](./vi-badge.md) — static, non-interactive status label
- [`vi-combobox`](./vi-combobox.md) — multi-select with tag display for selected items
- [`vi-select`](./vi-select.md) — single select dropdown
