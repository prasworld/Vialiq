# `vi-link` — Hyperlink

**Package:** `@vialiq/web-components/link`  
**Element:** `<vi-link>`  
**Status:** 🔲 Planned — Phase 1  
**Flux UI base:** `libs/flux-ui/components/_link.scss`

---

## Purpose

A styled anchor (`<a>`) element that follows Flux UI typography and colour tokens. Use for:

- Navigation links within the application
- External document links (protocol PDFs, regulatory references)
- "View audit trail", "Download CSV" actions

Prefer **`vi-button`** for actions that trigger operations (save, submit, delete). Use **`vi-link`** for navigation and "go to" actions.

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `href` | `href` | `string` | `''` | — | Destination URL |
| `target` | `target` | `string` | `'_self'` | — | `_blank`, `_self`, `_parent`, `_top` |
| `rel` | `rel` | `string` | `''` | — | Link rel attribute |
| `download` | `download` | `string` | `''` | — | Triggers download with optional filename |
| `variant` | `variant` | `LinkVariant` | `'primary'` | ✅ | Colour variant |
| `size` | `size` | `LinkSize` | `'inherit'` | — | Font size |
| `underline` | `underline` | `LinkUnderline` | `'hover'` | — | When to show underline |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disabled state (no navigation) |
| `external` | `external` | `boolean` | `false` | — | Auto-sets `target="_blank"`, `rel="noopener noreferrer"`, and external icon |

```typescript
type LinkVariant = 'primary' | 'secondary' | 'muted';
type LinkSize = 'inherit' | 'sm' | 'md' | 'lg';
type LinkUnderline = 'always' | 'hover' | 'none';
```

When `external` is `true`, `rel` is automatically set to `"noopener noreferrer"` for security — this prevents the opened page from accessing `window.opener`.

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | Link text |
| `icon` | Leading icon |

---

### Events

None beyond the native `click`. The native `click` is not stopped.

---

### CSS Parts

| Part | Element |
|------|---------|
| `link` | The native `<a>` element |
| `icon` | Leading icon slot wrapper |
| `external-icon` | Auto-appended external link icon |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-link-color` | `var(--vi-color-primary)` | Default link colour |
| `--vi-link-color-hover` | `var(--vi-color-blue-700)` | Hover colour |
| `--vi-link-color-visited` | `var(--vi-color-purple-600)` | Visited colour |
| `--vi-link-color-disabled` | `var(--vi-color-grey-400)` | Disabled colour |
| `--vi-link-color-secondary` | `var(--vi-color-grey-700)` | Secondary variant |
| `--vi-link-color-muted` | `var(--vi-color-grey-500)` | Muted variant |
| `--vi-link-underline-offset` | `2px` | Underline offset |
| `--vi-link-focus-ring-color` | `var(--vi-color-primary)` | Focus outline |

---

## Keyboard Interactions

| Key | Behaviour |
|-----|-----------|
| `Tab` / `Shift+Tab` | Focus in/out |
| `Enter` | Follow the link |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Role | Native `<a href>` — `role="link"` implicit |
| Disabled | `aria-disabled="true"`, `tabindex="-1"`, `href` removed |
| External | `aria-label` appended with "(opens in new tab)" for screen readers |
| Download | Native `download` attribute behaviour |

---

## Security

External links automatically get `rel="noopener noreferrer"` when `external` or `target="_blank"` is set. This prevents:
- The opened page from accessing `window.opener` (prevents redirect attacks)
- Leaking referrer information to the external domain

---

## Usage Examples

### Navigation link

```html
<vi-link href="/subjects/SUB-001">View Subject Record</vi-link>
```

### External document link

```html
<vi-link href="https://www.ich.org/products/guidelines/efficacy/e6.html" external>
  ICH E6(R3) GCP Guidelines
</vi-link>
```

### Download link

```html
<vi-link href="/api/reports/site-001/export.csv" download="site-001-data.csv">
  <vi-icon slot="icon" name="download" size="14"></vi-icon>
  Download Site Data (CSV)
</vi-link>
```

### Muted link (breadcrumb)

```html
<nav aria-label="Breadcrumb">
  <vi-link href="/studies" variant="muted">Studies</vi-link>
  /
  <vi-link href="/studies/TRIAL-001" variant="muted">TRIAL-001</vi-link>
  /
  <span aria-current="page">Subject Listing</span>
</nav>
```

### Disabled (no permission)

```html
<vi-link href="/admin" disabled>Admin Panel</vi-link>
```

---

## Related Components

- [`vi-button`](./vi-button.md) — action triggers (save, submit, delete)
- [`vi-icon`](./vi-icon.md) — leading icon
