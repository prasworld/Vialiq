# `vi-accordion` / `vi-accordion-item` — Accordion

**Package:** `@vialiq/web-components/accordion`  
**Elements:** `<vi-accordion>`, `<vi-accordion-item>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_accordion.scss`

---

## Purpose

Vertically stacked collapsible sections. A good alternative to tabs when:
- Content sections need to be scanned without switching contexts
- Screen real estate is limited (mobile, sidebar)
- Several optional/secondary sections should start collapsed

**Clinical EDC use cases:**
- Medical history sections (Cardiovascular / Respiratory / Neurological / …)
- AE narrative + comments (collapse unless editing)
- Protocol deviation detail
- Inclusion/exclusion criteria list
- Site configuration sections

---

## `vi-accordion` API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `multi` | `multi` | `boolean` | `false` | ✅ | Allow multiple items open simultaneously |
| `variant` | `variant` | `AccordionVariant` | `'default'` | ✅ | Visual style |
| `size` | `size` | `AccordionSize` | `'md'` | ✅ | Padding/font size |

```typescript
type AccordionVariant =
  | 'default'   // subtle divider lines between items
  | 'bordered'  // full border around each item + between items
  | 'flush'     // no outer border, full-width edge-to-edge (for sidebar)
  | 'card';     // each item is a card with shadow + gap between

type AccordionSize = 'sm' | 'md' | 'lg';
```

### Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vialiq-accordion-change` | `CustomEvent<{itemId: string; open: boolean}>` | ✅ | Any item opens or closes |

### CSS Parts

| Part | Element |
|------|---------|
| `accordion` | Root container |

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-accordion-border-color` | `var(--vi-color-grey-200)` | Divider colour |
| `--vi-accordion-border-radius` | `6px` | Radius (card variant) |
| `--vi-accordion-gap` | `0px` | Gap between items (card variant: 8px) |
| `--vi-accordion-animation-duration` | `200ms` | Expand/collapse animation |

---

## `vi-accordion-item` API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `itemId` | `item-id` | `string` | auto-generated | ✅ | Unique id for this item |
| `open` | `open` | `boolean` | `false` | ✅ | Expanded state |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Item is not interactive |
| `label` | `label` | `string` | `''` | — | Header text (use `header` slot for rich content) |

### Slots

| Slot | Description |
|------|-------------|
| `header` | Full header row override (replaces `label` text) |
| `header-icon` | Leading icon in header |
| `header-actions` | Actions row in header (e.g. badge, chip, button) |
| *(default)* | Collapsible body content |

### Events

| Event | Type | Bubbles | Cancelable | Fires when |
|-------|------|---------|------------|------------|
| `vialiq-accordion-before-open` | `CustomEvent<{itemId: string}>` | ✅ | ✅ | Item is about to expand. `itemId` is the ID of the expanding item. Calling `event.preventDefault()` cancels the action. |
| `vialiq-accordion-before-close` | `CustomEvent<{itemId: string}>` | ✅ | ✅ | Item is about to collapse. `itemId` contains the ID of the clicked/triggered control (the expanding sibling for coordinated checks, or the item itself for direct closures). Calling `event.preventDefault()` cancels the action. |
| `vialiq-accordion-open` | `CustomEvent<{itemId: string}>` | ✅ | — | Item expands. |
| `vialiq-accordion-close` | `CustomEvent<{itemId: string}>` | ✅ | — | Item collapses. |

### CSS Parts

| Part | Element |
|------|---------|
| `item` | Root item wrapper |
| `header` | Clickable header row |
| `header-icon` | Leading icon slot wrapper |
| `label` | Header label text |
| `header-actions` | Trailing actions slot wrapper |
| `chevron` | Rotating chevron icon |
| `panel` | Collapsible body |
| `panel-inner` | Inner padding wrapper (prevents clip during animation) |

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-accordion-item-header-padding` | `14px 16px` | Header padding |
| `--vi-accordion-item-body-padding` | `0 16px 16px` | Body padding |
| `--vi-accordion-item-header-bg` | `transparent` | Header background |
| `--vi-accordion-item-header-bg-hover` | `var(--vi-color-grey-50)` | Header hover |
| `--vi-accordion-item-header-bg-open` | `transparent` | Header when open |
| `--vi-accordion-item-label-color` | `var(--vi-color-grey-900)` | Label text colour |
| `--vi-accordion-item-label-font-weight` | `var(--vi-font-weight-medium)` | Label weight |
| `--vi-accordion-item-chevron-color` | `var(--vi-color-grey-500)` | Chevron colour |

---

## Shadow DOM Structure

```
vi-accordion-item
├── div[part="item"] .accordion-item
│   ├── button[part="header"] .accordion-header
│   │   type="button" aria-expanded=${open} aria-controls="panel-${itemId}"
│   │   id="header-${itemId}"
│   │   ├── slot[name="header-icon"]
│   │   │   → vi-icon (default, optional)
│   │   ├── slot[name="header"] → span[part="label"] (default: label attr text)
│   │   ├── slot[name="header-actions"]
│   │   └── vi-icon[part="chevron"] name="chevron-right"
│   │       (rotates 90° when open via :host([open]) transform)
│   │
│   └── div[part="panel"] .accordion-panel
│       role="region" aria-labelledby="header-${itemId}"
│       id="panel-${itemId}"
│       ├── div[part="panel-inner"]
│       │   └── slot (default body content)
```

---

## Keyboard Interactions

Following the [WAI-ARIA Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/):

| Key | Behaviour |
|-----|-----------|
| `Enter` / `Space` | Toggle focused item |
| `↓` | Focus next header (wraps to first) |
| `↑` | Focus previous header (wraps to last) |
| `Home` | Focus first header |
| `End` | Focus last header |
| `Tab` | Move to next element (enters open panel content) |
| `Shift+Tab` | Move to previous element |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Header | Native `<button>` (not div) — full keyboard + screen reader support |
| Expanded state | `aria-expanded="true/false"` on header button |
| Panel association | `aria-controls="panel-{id}"` on header; `aria-labelledby="header-{id}"` on panel |
| Region | `role="region"` on panel (when item has a label) |
| Disabled | `aria-disabled="true"` on disabled header; not in tab order |
| Focus | Header `<button>` is the tab stop; panel content accessible via `Tab` when open |

---

## Animation

```scss
.accordion-panel {
  overflow: hidden;
  max-height: 0;
  transition: max-height var(--vi-accordion-animation-duration) ease-out,
              opacity   var(--vi-accordion-animation-duration) ease-out;
  opacity: 0;
}

:host([open]) .accordion-panel {
  max-height: var(--vi-accordion-panel-height);  // set by JS ResizeObserver
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .accordion-panel { transition: none; }
}
```

`max-height` is driven by `ResizeObserver` on `panel-inner` — avoids the CSS `max-height: 9999px` hack that causes jerky animation. The actual measured height is set as a CSS custom property.

---

## Usage Examples

### Medical history sections

```html
<vi-accordion>
  <vi-accordion-item label="Cardiovascular History">
    <app-cv-history-form></app-cv-history-form>
  </vi-accordion-item>

  <vi-accordion-item label="Respiratory History">
    <app-respiratory-form></app-respiratory-form>
  </vi-accordion-item>

  <vi-accordion-item label="Neurological History">
    <app-neuro-form></app-neuro-form>
  </vi-accordion-item>
</vi-accordion>
```

### Multi-open with badges (query counts)

```html
<vi-accordion multi>
  @for (section of formSections; track section.id) {
    <vi-accordion-item
      [itemId]="section.id"
      [label]="section.title"
      [open]="section.hasErrors || section.hasQueries"
    >
      <div slot="header-actions">
        @if (section.queryCount > 0) {
          <vi-badge variant="warning" [count]="section.queryCount"></vi-badge>
        }
        @if (section.hasErrors) {
          <vi-badge variant="danger">Errors</vi-badge>
        }
      </div>
      <app-section-form [section]="section"></app-section-form>
    </vi-accordion-item>
  }
</vi-accordion>
```

### Card variant with icon

```html
<vi-accordion variant="card" size="sm">
  <vi-accordion-item item-id="ae-detail" open>
    <vi-icon slot="header-icon" name="alert-circle" size="16"></vi-icon>
    <span slot="header">Adverse Event Detail</span>
    <p>Nausea, grade 2, possibly related to study drug.</p>
    <p>Started: 2026-05-14. Ongoing.</p>
  </vi-accordion-item>

  <vi-accordion-item item-id="ae-narrative">
    <vi-icon slot="header-icon" name="file-text" size="16"></vi-icon>
    <span slot="header">Narrative</span>
    <vi-textarea name="narrative" rows="5" (vialiq-change)="ae.narrative = $event.detail.value">
    </vi-textarea>
  </vi-accordion-item>
</vi-accordion>
```

### Controlled from Angular

```typescript
@ViewChild('accordion') accordion!: ViAccordion;

expandAll() {
  this.accordion.querySelectorAll('vi-accordion-item').forEach((item: any) => {
    item.open = true;
  });
}

collapseAll() {
  this.accordion.querySelectorAll('vi-accordion-item').forEach((item: any) => {
    item.open = false;
  });
}
```

---

## Implementation Notes

- `vi-accordion` observes slotted `vi-accordion-item` children via the `@slotchange` event to build the keyboard navigation list.
- When `multi = false`, `vi-accordion` listens for `vialiq-accordion-open` on children and closes all other items automatically (single-open invariant).
- Both container and child components support cancelable events (`vialiq-accordion-before-open`, `vialiq-accordion-before-close`) using `event.preventDefault()` to conditionally lock expansion or collapse states. In both single-open and multi-open modes, the container dispatches close checks across active items before allowing a new item to open (which blocks opening if canceled). However, in multi-open mode, items are not closed automatically by the container.
- During coordinated sibling close checks, the `vialiq-accordion-before-close` event is dispatched on the open sibling(s), with the event detail's `itemId` carrying the ID of the expanding item that triggered the check. Inspecting `event.currentTarget` identifies the item requested to close.
- Item IDs are auto-generated (as a random alphanumeric string) if `item-id` is not set — stable within a session but not across page loads. Set `item-id` explicitly if URL-based deep-linking to a section is required.
- `vi-accordion-item` uses `ResizeObserver` on the panel inner content to track natural height changes (e.g. dynamic content inside) and update `max-height`.

---

## i18n — Internal Labels

All internal text uses `translateDirective`. See [I18N.md](../I18N.md) for setup.

| Key | Default (en) |
|-----|-------------|
| `accordion.expand` | `"Expand {title}"` |
| `accordion.collapse` | `"Collapse {title}"` |

---

## Related Components

- [`vi-tabs`](./vi-tabs.md) — horizontal tab switching (alternative for wider viewports)
- [`vi-modal`](./vi-modal.md) — accordion used inside modal body for multi-section forms
- [`vi-badge`](./vi-badge.md) — count badges in accordion headers
