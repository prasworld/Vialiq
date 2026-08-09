# `vi-tag` — Removable & Selectable Tag / Chip

**Package:** `@vialiq/web-components/tag`  
**Element:** `<vi-tag>`  
**Status:** ✅ Implemented — Phase 1  
**Flux UI base:** `libs/flux-ui/components/_tag.scss`

---

## Purpose

An interactive, multi-purpose Tag / Chip component used to represent selected values, active filters, status indicators, user tokens, or counts.

**Key Distinctions:**
- `vi-badge` — static, non-interactive, purely informational status badge
- `vi-tag` — interactive tag supporting visual appearances (`subtle`, `outline`, `solid`), shapes (`pill` vs standard), status dots, numeric count badges, user avatars, removable buttons, and selectable filter modes.

**Clinical EDC Use Cases:**
- Filter bar in subject & query listings (e.g., `Site: 001`, `Status: Open Query (14)`)
- Selected medication categories in multi-select comboboxes
- User role profile tags (e.g. `Dr. Smith (Investigator)`)
- System status tags (`Online`, `Offline Error`, `Sync Pending`)

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `variant` | `variant` | `TagVariant` | `'neutral'` | ✅ | Theme colour variant (`'neutral'` \| `'primary'` \| `'success'` \| `'warning'` \| `'danger'` \| `'info'` \| `'contrast'`) |
| `appearance` | `appearance` | `TagAppearance` | `'subtle'` | ✅ | Visual style (`'subtle'` \| `'outline'` \| `'solid'`) |
| `size` | `size` | `TagSize` | `'md'` | ✅ | Size scale (`'xs'` \| `'sm'` \| `'md'` \| `'lg'`) |
| `pill` | `pill` | `boolean` | `false` | ✅ | Renders fully rounded pill shape (9999px radius) |
| `dot` | `dot` | `boolean` | `false` | ✅ | Displays a status dot indicator prefix |
| `count` | `count` | `number` | `undefined` | — | Displays a numeric counter badge suffix |
| `removable` | `removable` | `boolean` | `false` | — | Shows a removable (×) button |
| `selectable` | `selectable` | `boolean` | `false` | ✅ | Enables interactive selection toggle mode |
| `selected` | `selected` | `boolean` | `false` | ✅ | Selected/active state |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables tag interactions |

```typescript
type TagVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'contrast';
type TagAppearance = 'subtle' | 'outline' | 'solid';
type TagSize = 'xs' | 'sm' | 'md' | 'lg';
```

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | Tag label text content |
| `icon` | Leading icon element |
| `avatar` | User profile avatar or thumbnail image |
| `suffix` | Custom suffix element after label/count |

---

### Events

| Event | Type | Bubbles | Composed | Fires when |
|-------|------|---------|---------|-----------|
| `vialiq-remove` | `CustomEvent<void>` | ✅ | ✅ | Remove button clicked or `Delete`/`Backspace` key pressed |
| `vialiq-select` | `CustomEvent<{selected: boolean}>` | ✅ | ✅ | Tag clicked in selectable mode (toggles `selected`) |

---

### CSS Parts

| Part | Element |
|------|---------|
| `tag` | The main tag wrapper container |
| `dot` | Status dot indicator circle |
| `checkmark` | Selection checkmark icon wrapper |
| `avatar` | Avatar slot wrapper |
| `icon` | Leading icon slot wrapper |
| `label` | Label text wrapper |
| `count` | Numeric count badge wrapper |
| `remove-btn` | The × remove button |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-tag-height` | `24px` | Tag container height |
| `--vi-tag-padding-x` | `10px` | Horizontal inline padding |
| `--vi-tag-border-radius` | `4px` | Corner radius |
| `--vi-tag-font-size` | `12px` | Label font size |
| `--vi-tag-font-weight` | `500` | Label font weight |
| `--vi-tag-gap` | `6px` | Gap between internal elements |
| `--vi-tag-remove-size` | `16px` | Remove button container size |
| `--vi-tag-dot-size` | `6px` | Status dot indicator diameter |
| `--vi-tag-avatar-size` | `14px` | Avatar image diameter |
| `--vi-tag-icon-size` | `14px` | Leading icon size |
| `--vi-tag-max-width` | `100%` | Maximum width before ellipsis truncation |
| `--vi-tag-transition` | `150ms ease` | Animation transition timing |
| `--vi-tag-disabled-opacity` | `0.5` | Disabled opacity |

---

## Overriding Sizing & Creating Custom Tags

There are **two clean approaches** to override size or create custom tags:

### Approach 1: Scoped CSS Custom Properties (Recommended for Custom Sizes)

You can override CSS custom properties on a specific `<vi-tag>` instance, wrapper class, or global theme rule. All internal elements (avatar, count badge, icon, remove button, line-height) scale proportionally:

```css
/* Creating an Extra Large (XL) Custom Hero Tag */
.custom-tag-xl {
  --vi-tag-height: 36px;
  --vi-tag-padding-x: 16px;
  --vi-tag-border-radius: 8px;
  --vi-tag-font-size: 15px;
  --vi-tag-gap: 10px;
  --vi-tag-avatar-size: 22px;
  --vi-tag-icon-size: 20px;
  --vi-tag-remove-size: 24px;
}

/* Creating an Ultra-Compact EDC Grid Tag */
.custom-tag-compact {
  --vi-tag-height: 16px;
  --vi-tag-padding-x: 4px;
  --vi-tag-font-size: 9px;
  --vi-tag-border-radius: 2px;
  --vi-tag-gap: 3px;
  --vi-tag-remove-size: 10px;
}
```

```html
<vi-tag class="custom-tag-xl" variant="primary" removable>
  Custom XL Tag
</vi-tag>
```

### Approach 2: Custom Variant & Theme Token Overrides

To create custom color themes or branded study tags, override the Level 1 CSS custom properties:

```css
/* Custom EDC Study Phase Tag */
.tag-study-phase {
  --vi-tag-primary-bg: #e0f2fe;
  --vi-tag-primary-color: #0369a1;
  --vi-tag-primary-border: #7dd3fc;
}

/* Customizing the Remove Button via CSS Parts */
vi-tag::part(remove-btn-button) {
  border-radius: 4px;
}
```

---

## Usage Examples

### Filter bar tags (removable)

```html
<div class="active-filters" role="list" aria-label="Active filters">
  <vi-tag removable @vialiq-remove="removeFilter('site')">
    Site: 001
  </vi-tag>
  <vi-tag removable variant="info" .count=${14} @vialiq-remove="removeFilter('queries')">
    Open Queries
  </vi-tag>
  <vi-tag removable variant="warning" dot @vialiq-remove="removeFilter('status')">
    Sync Pending
  </vi-tag>
</div>
```

### Selectable filter chips (Pill shape)

```html
<div class="filter-chips" role="group" aria-label="Filter by status">
  <vi-tag selectable selected pill variant="primary">All Sites</vi-tag>
  <vi-tag selectable pill variant="neutral">Screening</vi-tag>
  <vi-tag selectable pill variant="neutral">Enrolled</vi-tag>
  <vi-tag selectable pill variant="neutral">Completed</vi-tag>
</div>
```

### Status indicator tags

```html
<vi-tag dot variant="success" appearance="subtle">Online</vi-tag>
<vi-tag dot variant="warning" appearance="subtle">Sync Pending</vi-tag>
<vi-tag dot variant="danger" appearance="solid">System Offline</vi-tag>
```

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Role | `role="listitem"` when inside a `role="list"` container; `role="button"` when selectable |
| Remove action | Button has `aria-label="Remove [tag text]"` |
| Keyboard | `Delete` / `Backspace` on focused tag triggers remove; `Enter` / `Space` toggles selection |
| Selected State | `aria-pressed="true | false"` on selectable tags |
| Disabled State | `aria-disabled="true"`, `tabindex="-1"` |
