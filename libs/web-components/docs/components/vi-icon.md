# `vi-icon` — SVG Icon

**Package:** `@vialiq/web-components/icons`  
**Element:** `<vi-icon>`  
**Status:** ✅ Implemented  
**Phase:** 1 — Foundational

---

## Purpose

Renders a named SVG icon from a registry. Icons are:

- Registered once at application boot via `registerIcons()`
- Rendered inline SVG (no HTTP requests per icon)
- Sized via CSS custom property (no `width`/`height` attrs)
- Accessible — decorative icons are `aria-hidden`; meaningful icons take `aria-label` + `role="img"`

Icons are sourced from `@vialiq/icons` (the separate `libs/icons` library). The registry pattern means only the icons your application imports are bundled — no icon font dead weight.

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `name` | `name` | `string` | `''` | ✅ | Registered icon name to render |
| `size` | `size` | `number` | `24` | — | Size in px (applied as `--vi-icon-size`) |
| `label` | `label` | `string` | `''` | — | Accessible label (omit for decorative icons) |

---

### Events

None. `vi-icon` is purely presentational.

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-icon-size` | `24px` | Width and height of the icon |
| `color` / `currentColor` | Inherited | Stroke colour (SVG uses `currentColor` by default) |

The SVG inside uses `stroke: currentColor`, so setting `color` on the host or any ancestor changes the icon colour:

```css
vi-icon {
  color: var(--vi-color-primary);   /* blue */
}

/* Or via parent */
.danger-zone vi-icon {
  color: var(--vi-color-error);
}
```

---

## Registering Icons

Icons must be registered before any `<vi-icon>` that uses them is connected to the DOM. The recommended place is `main.ts` (or the application bootstrap):

```typescript
// main.ts
import { registerIcons } from '@vialiq/web-components';
import { saveIcon } from '@vialiq/icons/save';
import { trashIcon } from '@vialiq/icons/trash';
import { arrowRightIcon } from '@vialiq/icons/arrow-right';
import { checkCircleIcon } from '@vialiq/icons/check-circle';
import { alertCircleIcon } from '@vialiq/icons/alert-circle';

registerIcons([
  saveIcon,
  trashIcon,
  arrowRightIcon,
  checkCircleIcon,
  alertCircleIcon,
]);
```

Each icon module exports a `SvgIconDef` object:

```typescript
interface SvgIconDef {
  name: string;      // e.g. 'save'
  svg: string;       // Raw SVG string (viewBox="0 0 24 24", no width/height)
}
```

---

## Icon Catalogue

The `@vialiq/icons` library follows the [Lucide icon set](https://lucide.dev/) naming convention (kebab-case). Clinical EDC icons in use:

| Name | Usage |
|------|-------|
| `save` | Save draft / save form |
| `send` | Submit / lock form |
| `trash` | Delete record |
| `edit` / `pencil` | Edit mode |
| `check` | Completion indicator |
| `check-circle` | Valid / confirmed |
| `alert-circle` | Warning |
| `x-circle` | Error / invalid |
| `info` | Informational |
| `lock` | Encrypted field indicator |
| `unlock` | Decrypted / unlocked |
| `message-circle` | Query / comment |
| `message-square` | Query response |
| `calendar` | Date picker trigger |
| `clock` | Time picker / timestamp |
| `file-text` | Document / form |
| `download` | Export |
| `upload` | Import / file attach |
| `user` | Subject / investigator |
| `users` | Study team / site |
| `shield` | Security / compliance |
| `key` | Encryption key |
| `clipboard` | CRF / data entry |
| `activity` | Vital signs / clinical data |
| `filter` | Listing filter |
| `search` | Search |
| `chevron-down` | Dropdown trigger |
| `chevron-right` | Accordion expand |
| `arrow-left` | Back navigation |
| `arrow-right` | Forward / next |
| `x` | Close / dismiss |
| `plus` | Add / create |
| `minus` | Remove |
| `eye` | View / reveal |
| `eye-off` | Hide / mask |
| `refresh-cw` | Refresh / sync |
| `loader` | Loading state |
| `pen-square` | E-signature |
| `asterisk` | Required indicator |

---

## Accessibility

| Scenario | Implementation |
|---------|----------------|
| **Decorative** (icon inside a button that also has text) | Omit `label` → SVG gets `aria-hidden="true"` |
| **Meaningful** (icon-only button, standalone status) | Set `label="Save form"` → SVG gets `role="img"` + `aria-label` |

```html
<!-- Decorative — button text provides the accessible name -->
<vi-button>
  <vi-icon slot="icon" name="save"></vi-icon>
  Save Form
</vi-button>

<!-- Meaningful — icon IS the content -->
<vi-button icon-only aria-label="Save form">
  <vi-icon slot="icon" name="save" label="Save form"></vi-icon>
</vi-button>
```

**Note:** When `vi-icon` is used inside `vi-button`'s icon slot, the accessible name comes from the button's text content or `aria-label`. Setting `label` on the icon would double-announce. Only set `label` when the icon stands alone with no adjacent text.

---

## Usage Examples

### Standard sizes

```html
<vi-icon name="save" size="16"></vi-icon>   <!-- small (xs/sm buttons) -->
<vi-icon name="save" size="20"></vi-icon>   <!-- medium -->
<vi-icon name="save"></vi-icon>             <!-- default 24px -->
<vi-icon name="save" size="32"></vi-icon>   <!-- large -->
```

### Colour from context

```html
<!-- Inherits from button's text colour -->
<vi-button variant="primary">
  <vi-icon slot="icon" name="send"></vi-icon>
  Submit
</vi-button>

<!-- Explicit colour via CSS -->
<vi-icon name="check-circle" style="color: var(--vi-color-success)"></vi-icon>
<vi-icon name="alert-circle" style="color: var(--vi-color-warning)"></vi-icon>
<vi-icon name="x-circle"     style="color: var(--vi-color-error)"></vi-icon>
```

### Standalone with label (for screen readers)

```html
<vi-icon
  name="lock"
  label="Field is encrypted"
  size="16"
></vi-icon>
```

### EDC-specific patterns

```html
<!-- Query indicator -->
<vi-icon name="message-circle" size="14" style="color: var(--vi-color-warning)"></vi-icon>

<!-- Encryption lock badge -->
<vi-icon name="lock" size="12" style="color: var(--vi-color-purple-500)"></vi-icon>

<!-- 21 CFR Part 11 signature icon -->
<vi-icon name="pen-square" label="Electronic signature required" size="20"></vi-icon>

<!-- Status indicators in audit trail -->
<vi-icon name="check-circle" label="Saved" style="color: var(--vi-color-success)"></vi-icon>
```

---

## Custom Icons

Register custom SVG shapes that are not in the Lucide catalogue:

```typescript
import { registerIcons } from '@vialiq/web-components';

registerIcons([{
  name: 'sponsor-logo',
  svg: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/>
  </svg>`
}]);
```

```html
<vi-icon name="sponsor-logo" size="32"></vi-icon>
```

---

## Implementation Notes

- Icons are stored in a `Map<string, SvgIconDef>` in `registry.ts`. Registration is idempotent — re-registering the same name is a no-op.
- The SVG is rendered via `unsafeHTML()` directive. Icons should only come from `@vialiq/icons` or trusted custom code — never from user-provided content.
- No HTTP requests — icons are bundled as string literals.
- `size` prop sets `--vi-icon-size` on the host; the shadow CSS uses `width: var(--vi-icon-size)` and `height: var(--vi-icon-size)`.
- When `name` is empty or not registered, nothing is rendered (no error thrown). Log a warning in development mode.

---

## Related Components

- [`vi-button`](./vi-button.md) — `icon` slot consumer
- [`vi-badge`](./vi-badge.md) — status icon pairing
- [`vi-alert`](./vi-alert.md) — status icon in alert banner
- [`vi-spinner`](./vi-spinner.md) — animated loading icon alternative
