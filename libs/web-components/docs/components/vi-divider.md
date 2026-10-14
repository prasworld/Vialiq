# `vi-divider` — Visual Separator Rule

**Package:** `@vialiq/web-components/divider`  
**Element:** `<vi-divider>`  
**Status:** 🔲 Planned — Phase 3 (Tier 3)  
**Flux UI base:** `libs/flux-ui/components/_divider.scss`  

---

## Purpose

A visual separator used to segment blocks of content, form sections, or inline items.

Supports horizontal separation with optional embedded titles/labels, as well as vertical separation between inline controls (such as toolbars, header metadata, and breadcrumb segments).

### Clinical EDC & Enterprise Use Cases
- **CRF Section Breaks:** Delineate distinct form sections (e.g., "Demographic Details", "Vital Signs", "Adverse Event Report") with clear, accessible headings.
- **Inline Toolbar Separators:** Provide vertical divider strokes between action clusters (e.g., `Save | Lock | Export PDF`).
- **Audit & Metadata Dividers:** Cleanly segment subject metadata tags (`Subject 001 | Site 12 | Arm: Cohort A`).
- **Subtle Content Division:** Use dashed or plain dividers for secondary notes or collapsible group sub-sections.

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `direction` | `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | ✅ | Separator orientation |
| `textPlacement` | `text-placement` | `'left' \| 'center' \| 'right'` | `'center'` | ✅ | Text label alignment (horizontal only) |
| `textMargin` | `text-margin` | `string \| number` | `undefined` | ✅ | Margin offset from edge for `left` or `right` placement |
| `dashed` | `dashed` | `boolean` | `false` | ✅ | Renders line with a dashed stroke |
| `plain` | `plain` | `boolean` | `false` | ✅ | Renders text with regular weight and secondary colour |

#### Types
```typescript
type DividerDirection = 'horizontal' | 'vertical';
type DividerTextPlacement = 'left' | 'center' | 'right';
```

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | Text title or content embedded within a horizontal divider |

*Note: Embedded slot text is ignored when `direction="vertical"`.*

---

### Events

`vi-divider` is purely presentational and does not emit custom events.

---

### CSS Parts

| Part | Element | Purpose |
|------|---------|---------|
| `divider` | Host root container | Base container element |
| `line-start` | `<span>` | Line segment preceding the text label |
| `line-end` | `<span>` | Line segment following the text label |
| `text` | `<span>` | Text label container |

---

### CSS Custom Properties

Following the 3-level cascade token pattern (see [.agents/rules/semantic-colors.md](file:///Users/prashantgupta/code/nx/.agents/rules/semantic-colors.md)):

```scss
// Level 1: Consumer override
// Level 2 & 3: Semantic token
border-color: var(--vi-divider-color, #{tokens.$border-03});
```

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-divider-color` | `tokens.$border-03` | Separator line colour |
| `--vi-divider-width` | `tokens.$border-width-thin` | Thickness of the rule (`1px`) |
| `--vi-divider-style` | `solid` | Stroke style (`solid` or `dashed`) |
| `--vi-divider-margin-block` | `tokens.$spacing-md` | Vertical block margin for horizontal dividers |
| `--vi-divider-margin-inline` | `tokens.$spacing-xs` | Horizontal inline margin for vertical dividers |
| `--vi-divider-height` | `0.9em` | Height of vertical separator rule |
| `--vi-divider-text-padding` | `tokens.$spacing-sm` | Horizontal padding between line segments and text |
| `--vi-divider-text-color` | `tokens.$text-primary` | Text label colour (standard title mode) |
| `--vi-divider-text-plain-color` | `tokens.$text-secondary` | Text label colour when `plain` is true |
| `--vi-divider-font-size` | `tokens.$font-size-base` | Text label font size |
| `--vi-divider-font-weight` | `tokens.$font-weight-medium` | Text label font weight (bold/medium) |
| `--vi-divider-plain-font-weight` | `tokens.$font-weight-normal` | Text label font weight when `plain` is true |

---

## Accessibility (a11y)

| Requirement | Implementation |
|-------------|----------------|
| Role | `role="separator"` on host / inner element |
| Orientation | `aria-orientation="horizontal"` (default) or `aria-orientation="vertical"` |
| Screen Readers | Pure visual separators without text have `aria-hidden="true"` or standard separator semantics. Dividers with slotted text announce their heading content cleanly. |

---

## Usage Examples

### 1. Basic Horizontal Divider

```html
<p>Top section content...</p>
<vi-divider></vi-divider>
<p>Bottom section content...</p>
```

### 2. Divider with Centered Title

```html
<vi-divider>Section 1: Baseline Demographics</vi-divider>
```

### 3. Left-Aligned Title with Custom Offset

```html
<vi-divider text-placement="left" text-margin="24px">
  Adverse Event Details
</vi-divider>
```

### 4. Right-Aligned Plain Text

```html
<vi-divider text-placement="right" plain>
  Last synchronized: Today at 09:45 AM
</vi-divider>
```

### 5. Dashed Separator

```html
<vi-divider dashed>Optional Concomitant Medications</vi-divider>
```

### 6. Vertical Inline Divider

```html
<div class="toolbar">
  <vi-button size="sm">Save Draft</vi-button>
  <vi-divider direction="vertical"></vi-divider>
  <vi-button size="sm" variant="ghost">Audit Trail</vi-button>
  <vi-divider direction="vertical"></vi-divider>
  <vi-button size="sm" variant="danger">Freeze Form</vi-button>
</div>
```

---

## Angular Integration

```typescript
@Component({
  selector: 'app-crf-section',
  template: `
    <!-- Section divider with title -->
    <vi-divider [textPlacement]="'left'" [dashed]="isOptionalSection">
      {{ sectionTitle }}
    </vi-divider>

    <!-- Inline toolbar with vertical separators -->
    <div class="action-bar">
      <span>Subject: <strong>{{ subjectId }}</strong></span>
      <vi-divider direction="vertical"></vi-divider>
      <span>Site: <strong>{{ siteCode }}</strong></span>
      <vi-divider direction="vertical"></vi-divider>
      <span>Status: <strong>{{ status }}</strong></span>
    </div>
  `
})
export class CrfSectionComponent {
  sectionTitle = 'Physical Exam & Vital Signs';
  isOptionalSection = false;
  subjectId = '101-004';
  siteCode = 'SITE-NY-01';
  status = 'Enrolled';
}
```

---

## Implementation Plan

1. **SCSS Module (`libs/flux-ui/components/_divider.scss`)**:
   - Horizontal mode: Flexbox layout with `::before` and `::after` lines flanking the text container.
   - Text placement: Flex sizing (`line-start` / `line-end` flex grow ratios) for `left`, `center`, and `right` placement.
   - Vertical mode: `display: inline-block`, `vertical-align: middle`, `height: var(--vi-divider-height)`, `border-inline-start: var(--vi-divider-width)`.
   - Dashed mode: `border-top-style: dashed` / `border-inline-start-style: dashed`.
2. **Lit Component (`libs/web-components/src/divider/vi-divider.ts`)**:
   - Manage `direction`, `textPlacement`, `textMargin`, `dashed`, and `plain`.
   - Slot listener (`_handleSlotChange`) to toggle the presence of text lines and adjust layout.
   - Proper WAI-ARIA `role="separator"` and `aria-orientation` attribute management.
   - Export from `libs/web-components/src/index.ts`.
3. **Tests & Stories**:
   - Unit tests for vertical vs. horizontal orientation, slot detection, and dashed mode classes.
   - Storybook stories demonstrating horizontal lines, left/center/right text labels, dashed rules, and vertical toolbar grouping.

---

## Related Components

- [`vi-typography`](./vi-typography.md) — Text titles, headings, and paragraphs
- [`vi-layout`](./vi-layout.md) — Application page layout framing
- [`vi-splitter`](./vi-splitter.md) — Interactive resizable pane separator
