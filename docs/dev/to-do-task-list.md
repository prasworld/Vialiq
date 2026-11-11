# Form Builder & Renderer — Exhaustive To-Do Task List

This document serves as the master backlog for all pending implementation work across `@vialiq/form-builder`, `@vialiq/form-renderer`, and the platform integration layers based on the established architecture decisions.

---

## 1. Renderer Base (`@vialiq/form-renderer`)
*Area: `libs/form-renderer`*

- [ ] **Library Scaffolding**
  - [ ] Set up `@vialiq/form-renderer` Nx library project (`package.json`, `project.json`).
  - [ ] Define the public API barrel (`index.ts`).
- [ ] **Renderer Component Injection**
  - [ ] Implement `RENDERER_COMPONENTS` InjectionToken to allow custom component registration.
  - [ ] Build the `FormRendererComponent` base wrapper that recursively loops through the `FormSchema`.
- [ ] **State Management (`FieldStateService`)**
  - [ ] Implement Signal-based `FieldStateService` to manage form values, touched/dirty states, and cross-field reactivity without relying on Angular's `ReactiveFormsModule`.
- [ ] **Component Wrappers**
  - [ ] Build Angular wrappers (`vi-renderer-input`, `vi-renderer-select`, etc.) to interface between the JSON schema and the Lit Web Components (`vi-input`, `vi-select`, etc.).

---

## 2. Codelist & Enterprise Terminology
*Area: `libs/form-renderer` / Codelist Layer*

> **Critical Miss from initial phase — Mandatory for release**

- [ ] **Codelist Service Foundation**
  - [ ] Implement `CODELIST_CONFIG` InjectionToken.
  - [ ] Build `CodelistService` with `prefetchAll(names: string[])` and synchronous `getItems(name)`.
- [ ] **Parallel Pre-fetching Strategy**
  - [ ] Implement scanner in `FormRendererComponent.ngOnInit()` to extract all unique `optionSource.name` references.
  - [ ] Execute parallel HTTP GET requests to fetch codelists *before* form rendering starts.
- [ ] **Renderer Integration**
  - [ ] Update `vi-renderer-select`, `vi-renderer-combobox`, `vi-renderer-radio-group`, and `vi-renderer-checkbox-group` to pull items from the `CodelistService` cache.
- [ ] **Advanced Features (Design Required)**
  - [ ] Design and implement **Multilingual / i18n** support for `CodelistItem.value` display labels.
  - [ ] Design and implement **Platform-wide versioning** for codelist dictionaries.
  - [ ] Design declarative config for **Cascading / Linked Codelists** (e.g., Country selects State).

---

## 3. Payload Serialization & Hydration
*Area: `libs/form-renderer` / Data Integration*

- [ ] **Data Flattening for API (`serializePayload`)**
  - [ ] Implement a serializer that traverses the hierarchical component tree (including Tabs, Columns, nested Panels) and extracts field values into a flat key-value payload map.
  - [ ] Ensure `serializePayload` strips out layout-only components and respects conditional visibility (e.g., omit values of hidden fields).
- [ ] **Data Rehydration (`deserializePayload`)**
  - [ ] Implement a hydrator to take a flat key-value map from the API and correctly map it back into the `FieldStateService` for form editing.

---

## 4. Validation Engine Integration
*Area: `libs/form-renderer` & `@vialiq/form-validator-sdk`*

- [ ] **Validation Evaluators**
  - [ ] Wire up the `ValidationEngine` to execute upon `(valueChange)` and `(blur)` events based on field-level `validateOn` settings.
  - [ ] Support conditional visibility rule evaluation (`ConditionalRule`) to show/hide fields dynamically.
- [ ] **Custom Validators**
  - [ ] Create `CUSTOM_VALIDATOR_REGISTRY` InjectionToken.
  - [ ] Enable dependency-injected custom Javascript/Typescript validators to be evaluated alongside standard built-in rules.

---

## 5. Advanced Property Editors (`@vialiq/form-builder`)
*Area: `libs/form-builder/src/lib/properties`*

- [ ] **Missing Settings Field Types**
  - [ ] Implement property editors for `vi-masked-input`, `vi-date-picker`, and `vi-combobox` inside `settings-field.component.html`.
  - [ ] Build the Codelist Source Selector dropdown for the properties panel so designers can easily bind fields to specific Enterprise Terminology lists.

---

## 6. Compliance & Extensible Runtime (Platform Phase 3)
*Area: Host Application / Microfrontend Integration*

> **Mandatory architecture design required before implementation**

- [ ] **P3.1 Audit Trail**
  - [ ] Design event-sourced change logging.
  - [ ] Expose `AUDIT_TRAIL_SERVICE` token to capture who, when, old value, and new value on every field change.
- [ ] **P3.2 Query Management**
  - [ ] Design discrepancy/query lifecycle UI overlays.
  - [ ] Expose `QUERY_SERVICE` token to allow data monitors to raise and close discrepancies on specific fields.
- [ ] **P3.3 Reason for Change**
  - [ ] Wire up prompt dialogues requiring the user to justify a value change post-submission.
- [ ] **P3.4 Electronic Signature (`<vi-signature>`)**
  - [ ] Build the canvas-based freehand signature Lit web component (`SVG`/`PNG` support).
  - [ ] Implement Part 11 compliant signature workflow logic in the host application layer.

---

## 7. Form Versioning & Scale (Platform Phase 4)
*Area: System Architecture*

- [ ] **P4.1 Form / Study Versioning**
  - [ ] Build migration tools (`MigrationRegistry`) to upgrade forms mid-study.
- [ ] **P4.2 Partial Save / Draft Persistence**
  - [ ] Design browser/server hybrid storage strategy for long multi-session clinical forms.
- [ ] **P4.3 Offline / Disconnected Mode**
  - [ ] Implement service workers and offline state syncing for remote clinical sites.

---

## 8. Multilingual / Internationalization (i18n)
*Area: `libs/form-builder` & Platform*

- [ ] **Form Builder i18n Support**
  - [ ] Implement translation key generation and binding for form labels and descriptions in the builder.
  - [ ] Support localization of the core builder UI (palette, properties panel, error messages).

---

## 9. Web Components & Clinical Field Controls (`@vialiq/web-components`)
*Area: `libs/web-components/src/date-picker`, `libs/form-renderer`, `libs/form-builder`*

- [ ] **`vi-date-picker`: Clinical EDC Partial & Unknown Date Support (`allow-unknown`)**
  - [ ] **Component Architecture & Properties (`vi-date-picker.ts`)**
    - [ ] Add `@property({ type: Boolean, attribute: 'allow-unknown' }) accessor allowUnknown = false;`.
    - [ ] Add `@property({ type: String, attribute: 'unknown-label' }) accessor unknownLabel = '';`.
    - [ ] Render `.datepicker-unknown-wrapper` checkbox container aligned with `vi-time-picker` styling and accessible semantics (`role="checkbox"`, `aria-checked`).
    - [ ] Implement toggle handler: checking sets value to `????-??-??` (or mode-specific wildcard format), clears/disables the date input segments and calendar trigger, and dispatches change events.
  - [ ] **Value Representation & Safe `Date` Object Parsing**
    - [ ] Update date utilities and `formatDisplay` in `i18n.ts` / `date-utils.ts` to recognize `????-??-??` (full unknown) and partial formats (e.g. `YYYY-??-??`, `YYYY-MM-??`) without throwing `Invalid Date` (`NaN`).
    - [ ] Guard Flatpickr lifecycle (`_initFlatpickr` / `_syncFlatpickrValue`) to prevent parsing wildcard strings as numeric timestamps.
    - [ ] Synchronize slotted `<vi-date-picker-input>` to display the wildcard value or localized placeholder text when marked unknown.
  - [ ] **Event Contract & WHATWG Form Participation (`ValidityMixin`)**
    - [ ] Update `vi-date-picker-change` event detail interface to include `isUnknown: boolean`, `value: string | null`, and `date: Date | null` (`null` when unknown).
    - [ ] Integrate with `ElementInternals`: `_internals.setFormValue('????-??-??')` when marked unknown so standard `FormData` submissions succeed.
    - [ ] Implement validation bypass in `_syncValidity()`: bypass `required`, `min`, and `max` date constraint failures when the field is marked as unknown per CDISC SDTM protocol allowances.
    - [ ] Wire into `formResetCallback()` to uncheck the unknown toggle and restore the default empty/initial state.
  - [ ] **Internationalization & Locale Dictionaries**
    - [ ] Wire `datePicker.unknown` key into `i18nController` / `translateDirective` and component fallback dictionaries:
      - `en`: `"Date unknown"`
      - `fr`: `"Date inconnue"`
      - `de`: `"Datum unbekannt"`
      - `es`: `"Fecha desconocida"`
      - `ja`: `"日付不明"`
      - `zh`: `"日期未知"`
  - [ ] **Form Builder & Form Renderer Integration**
    - [ ] `libs/form-builder`: Add `allowUnknown` toggle setting to Date Picker property editor in `settings-field.component.html`.
    - [ ] `libs/form-renderer`: Update `vi-renderer-date-picker` wrapper to bind `[allowUnknown]="field.allowUnknown"` and preserve wildcard values in `serializePayload()` and `deserializePayload()`.
  - [ ] **Automated Testing & Storybook**
    - [ ] Add WDIO browser test cases in `vi-date-picker.test.ts` for:
      - Checkbox rendering and toggle interaction.
      - Event detail `isUnknown: true` payload emission.
      - Form submission containing `????-??-??` in `FormData`.
      - Form reset restoration.
      - Validation bypass for required and min/max constraints.
    - [ ] Add Storybook stories in `vi-date-picker.stories.ts` (Empty with `allow-unknown`, Pre-filled `????-??-??`, Localized unknown labels).
  - [ ] **Documentation Updates**
    - [ ] Document `allow-unknown` in `libs/web-components/README.md` under the Date Picker section.
    - [ ] Update `libs/web-components/docs/components/vi-date-picker.md` with clinical EDC CDISC SDTM partial date specification.

- [x] **`vi-time-picker`: Real-World Enterprise & Clinical EDC Capabilities**
  - [x] **Instant "Now" Quick Action**
    - [x] Implemented `show-now` prop, `part="now-btn"`, and public methods `setCurrentTime()` / `now()`.
    - [x] Accessible localized labels (`nowLabel`, `nowAriaLabel`) across all 6 locales (en, fr, de, es, ja, zh).
  - [x] **Intelligent Multi-Format Clipboard Paste**
    - [x] Cross-segment `@paste` handler with clipboard distribution.
    - [x] Support for standard `HH:mm`, `hh:mm A`, military compact digits (`1430`, `930`, `143045`), and wildcard partial times (`14:??`).
  - [x] **Multi-Site Clinical Timezone Context**
    - [x] Added `timezone` prop, `.timepicker-timezone` badge styling, and `part="timezone"`.
    - [x] Output normalization supporting explicit offsets and UTC (`toIsoTime()`, e.g. `14:30+05:30`, `14:30Z`).
  - [x] **CDISC SDTM Segment-Level Partial Unknown Time Capture**
    - [x] Segment-level wildcard detection (`14:??`, `??:30`) via continuous typing and `?` key handling.
    - [x] W3C/CDISC compliant indeterminate (`-`) state on `#unknown-checkbox`.
    - [x] Validation bypass on partial and full unknown states for EDC protocols.
  - [x] **Blackout / Restricted Scheduling Times**
    - [x] Added `disabledHours`, `disabledMinutes`, and `disabledSeconds` properties supporting number arrays and callback predicates `(val) => boolean`.
    - [x] Dynamic custom validity synchronization (`disabledTimeMessage`) with auto-clearing when valid times are selected.
  - [x] **Independent Step Increments**
    - [x] Added `hour-step`, `second-step`, and minute `step` properties with wrapping arithmetic.
  - [x] **Testing & Documentation**
    - [x] Complete WDIO test suite (58/58 passing browser tests) covering all capabilities.
    - [x] Storybook stories: `NowQuickAction`, `TimezoneContext`, `PartialUnknownCDISC`, `DisabledTimesValidation`, `CustomStepIncrements`.
    - [x] Comprehensive documentation in `libs/web-components/README.md` and `libs/web-components/docs/components/vi-time-picker.md`.

- [ ] **[DEFERRED] `vi-time-range-picker`: Coordinated Time Range Picker**
  - *Status*: Deferred per design decision in favor of core clinical time picker capabilities.
  - *Future Scope*: Coordinated start/end time dual input with duration calculation, overnight crossover validation, and synchronized disabled time bounds.

---

## 10. Ant Design Component Parity & Expansion Roadmap (`@vialiq/web-components`)
*Area: `libs/web-components`, `libs/flux-ui`, Storybook*

Based on the comprehensive component audit against the [Ant Design Component System](https://ant.design/components/overview):
- **Current Coverage:** 34 mapped components (+ 4 unique Vialiq specialized components: `vi-masked-input`, `vi-animation`, `vi-chip`, `vi-context-menu`).
- **Parity Gap:** 38 components missing across General, Layout, Navigation, Data Entry, Data Display, and Feedback.

### Phase 1: Tier 1 — Mission-Critical Enterprise & Clinical Core (Highest Priority)
These components form the essential backbone for data-dense clinical, laboratory, and enterprise management applications.

- [ ] **10.1 `vi-table`: Enterprise Data Grid & Table**
  - [ ] **Architecture & Schema:** Design column schema (`key`, `title`, `dataIndex`, `width`, `align`, `sortable`, `filterable`, `render`), sort directions (`ascend`, `descend`, `null`), and selection modes (`checkbox`, `radio`).
  - [ ] **Virtualization & Performance:** Integrate virtual scrolling for large clinical datasets (10,000+ rows) without DOM bloat.
  - [ ] **Sticky Headers & Fixed Columns:** Implement sticky `thead` and left/right fixed column pins (`fixed: 'left' | 'right'`) with horizontal scrolling shadows.
  - [ ] **Row Expansion & Nested Tables:** Support expandable row sub-templates (`expandedRowRender`) for hierarchical records.
  - [ ] **Flux UI & Lit Component:** Implement `libs/flux-ui/components/_table.scss` and `libs/web-components/src/table/vi-table.ts`.
  - [ ] **Integration & Testing:** Wire with `<vi-pagination>`, write WDIO tests, and author Storybook examples.

- [ ] **10.2 `vi-pagination`: Data Pagination & Paging Bar**
  - [ ] **Properties & Attributes:** `current`, `pageSize`, `total`, `pageSizeOptions` (`[10, 20, 50, 100]`), `showQuickJumper`, `showSizeChanger`, `showTotal`.
  - [ ] **Keyboard & a11y:** Full WAI-ARIA navigation landmarks, page jump input, previous/next buttons.
  - [ ] **Flux UI & Lit Component:** Implement `_pagination.scss` and `src/pagination/vi-pagination.ts`.
  - [ ] **Integration & Testing:** WDIO tests for page boundary clamping, change events, and Storybook documentation.

- [ ] **10.3 `vi-number-input`: Formatted Numeric Stepper Input**
  - [ ] **Specification Execution:** Implement based on `libs/web-components/docs/components/vi-number-input.md`.
  - [ ] **Features:** `min`, `max`, `step`, `precision`, `decimalSeparator`, `formatter` / `parser` (for dosages, percentages, currencies).
  - [ ] **Form Participation:** `ValidityMixin` integration, `stepUp()` / `stepDown()`, and keyboard spinbutton accessibility.
  - [ ] **Flux UI & Lit Component:** Implement `_number-input.scss` and `src/number-input/vi-number-input.ts`.

- [ ] **10.4 `vi-empty`: Zero-Data Empty State**
  - [ ] **Features:** Customizable SVG illustrations (`default`, `simple`, or slotted image), description text, and optional action slot (e.g. "Create New Record").
  - [ ] **Use Cases:** Fallback for empty tables, search lists, dropdowns, and dashboard widgets.
  - [ ] **Flux UI & Lit Component:** Implement `_empty.scss` and `src/empty/vi-empty.ts`.

- [ ] **10.5 `vi-breadcrumb`: Hierarchical Navigation Trail**
  - [ ] **Components:** `<vi-breadcrumb>` and `<vi-breadcrumb-item>`.
  - [ ] **Features:** Customizable separator (`/`, `>`), icon support, dropdown sub-routes, and accessible `aria-label="Breadcrumb"`.
  - [ ] **Flux UI & Lit Component:** Implement `_breadcrumb.scss` and `src/breadcrumb/`.

- [ ] **10.6 `vi-steps`: Multi-Step Flow & Wizard Stepper**
  - [ ] **Components:** `<vi-steps>` and `<vi-step>`.
  - [ ] **Features:** `current`, `status` (`wait`, `process`, `finish`, `error`), orientation (`horizontal`, `vertical`), label placement, dot mode, and clickable steps.
  - [ ] **Use Cases:** Patient intake wizard, CRF clinical visit milestones, multi-page form navigation.
  - [ ] **Flux UI & Lit Component:** Implement `_steps.scss` and `src/steps/`.

---

### Phase 2: Tier 2 — Complex Hierarchies, Lists & Entity Displays
High-value components for browsing hierarchies, managing entity cards, and inspecting data records.

- [ ] **10.7 `vi-tree` & `vi-tree-select`: Hierarchical Tree & Tree Dropdown**
  - [ ] **Features:** Expand/collapse nodes, checkable mode with cascading checkboxes, search filtering, async lazy loading, and drag-and-drop ordering.
  - [ ] **TreeSelect:** Dropdown integrating tree navigation with input field and tags for multiple selections.
  - [ ] **Clinical Use Case:** Coding medical dictionaries (MedDRA system organ classes, WHODrug hierarchies) and study site trees.
  - [ ] **Flux UI & Lit Component:** Implement `_tree.scss`, `src/tree/`, and `src/tree-select/`.

- [ ] **10.8 `vi-list`: Structured Entity List & Meta Container**
  - [ ] **Components:** `<vi-list>`, `<vi-list-item>`, and `<vi-list-item-meta>`.
  - [ ] **Features:** Grid and vertical layout, header/footer slots, item actions (edit/delete buttons), avatar integration, and load-more pagination support.
  - [ ] **Flux UI & Lit Component:** Implement `_list.scss` and `src/list/`.

- [ ] **10.9 `vi-avatar`: User & Entity Avatar Identity**
  - [ ] **Components:** `<vi-avatar>` and `<vi-avatar-group>`.
  - [ ] **Features:** Image with automatic fallback to text initials, sizes (`xs` through `xl`), shape (`circle`, `square`), and overlapping stacked group with `+N` excess count.
  - [ ] **Flux UI & Lit Component:** Implement `_avatar.scss` and `src/avatar/`.

- [ ] **10.10 `vi-descriptions`: Definition & Property Sheet Display**
  - [ ] **Components:** `<vi-descriptions>` and `<vi-descriptions-item>`.
  - [ ] **Features:** Grid layout with customizable column count, bordered / borderless styles, responsive column spans, and label-value styling.
  - [ ] **Use Cases:** Subject demographic summaries, audit record headers, CRF visit overview sheets.
  - [ ] **Flux UI & Lit Component:** Implement `_descriptions.scss` and `src/descriptions/`.

- [ ] **10.11 `vi-timeline`: Chronological Milestone & Event Log**
  - [ ] **Components:** `<vi-timeline>` and `<vi-timeline-item>`.
  - [ ] **Features:** Custom node colors, icon nodes, pending state indicator, alternating/left/right alignments.
  - [ ] **Use Cases:** Clinical adverse event onset-to-resolution timelines, audit trail histories, study protocol visit schedules.
  - [ ] **Flux UI & Lit Component:** Implement `_timeline.scss` and `src/timeline/`.

- [ ] **10.12 `vi-transfer`: Two-Column Shuttle Selection**
  - [ ] **Features:** Dual search-enabled lists for shuttling items between source and target buckets, select-all checkboxes, item counts, and disabled state.
  - [ ] **Use Cases:** User role assignment, laboratory assay panel selection, CRF form module inclusion.
  - [ ] **Flux UI & Lit Component:** Implement `_transfer.scss` and `src/transfer/`.

- [ ] **10.13 `vi-slider`: Single & Dual-Handle Range Slider**
  - [ ] **Features:** Single value and range array (`[min, max]`), step increments, track tick marks, floating tooltip values, and form participation.
  - [ ] **Flux UI & Lit Component:** Implement `_slider.scss` and `src/slider/`.

---

### Phase 3: Tier 3 — Structural Layout & Typography Foundation
Components that establish page shells, typography consistency, and standard navigation dividers.

- [x] **10.14 `vi-divider`: Visual Separator Rule**
  - [x] **Specification:** Authored in [`libs/web-components/docs/components/vi-divider.md`](../../libs/web-components/docs/components/vi-divider.md) and documented in [`CSS-DESIGN-SYSTEM.md`](../../libs/web-components/docs/CSS-DESIGN-SYSTEM.md).
  - [x] **Features:** `direction` (`horizontal`, `vertical`), text alignment (`left`, `center`, `right`), dashed border style, plain typography mode.
  - [x] **Flux UI & Lit Component:** Implemented in `_divider.scss`, `src/divider/vi-divider.ts`, 8/8 passing WDIO tests, and Storybook stories.

- [ ] **10.15 `vi-typography`: Structured Text & Heading System**
  - [ ] **Components:** `<vi-title>`, `<vi-text>`, `<vi-paragraph>`.
  - [ ] **Features:** Semantic levels (H1-H5), inline copy button with confirmation tooltip, inline edit with save/cancel, and configurable line clamp ellipsis with "expand" toggle.
  - [ ] **Flux UI & Lit Component:** Implement `_typography.scss` and `src/typography/`.

- [ ] **10.16 `vi-result`: Full-Page Operational Result & Outcome Screen**
  - [ ] **Features:** Status presets (`success`, `error`, `info`, `warning`, `403`, `404`, `500`), icon slot, title, subtitle, and extra action buttons slot.
  - [ ] **Use Cases:** Submission confirmation pages, route error screens, access denied gates.
  - [ ] **Flux UI & Lit Component:** Implement `_result.scss` and `src/result/`.

- [ ] **10.17 `vi-layout`: Application Shell & Page Framing**
  - [ ] **Components:** `<vi-layout>`, `<vi-header>`, `<vi-footer>`, `<vi-content>`.
  - [ ] **Features:** Flexbox-based shell layout coordinating with `<vi-sidebar>`, sticky headers, and responsive collapsing.
  - [ ] **Flux UI & Lit Component:** Implement `_layout.scss` and `src/layout/`.

- [ ] **10.18 `vi-cascader`: Multi-Stage Hierarchical Dropdown**
  - [ ] **Features:** Multi-level column cascading select (e.g. Region &rarr; Country &rarr; Site), hover or click expansion, search filtering, and form participation.
  - [ ] **Flux UI & Lit Component:** Implement `_cascader.scss` and `src/cascader/`.

- [ ] **10.19 `vi-splitter`: Resizable Split Panes**
  - [ ] **Features:** Horizontal and vertical orientation, draggable divider sash with min/max panel bounds, collapse toggles, and keyboard resizing.
  - [ ] **Flux UI & Lit Component:** Implement `_splitter.scss` and `src/splitter/`.

---

### Phase 4: Tier 4 — Specialized, Interactive & Polish Enhancements
Niche enterprise utilities, interactive guides, and visual accents.

- [ ] **10.20 `vi-tour`: Interactive Product Onboarding Walkthrough**
  - [ ] **Features:** Step-by-step target element spotlight, floating tooltip popover, backdrop mask, step indicators, and previous/next/finish actions.
  - [ ] **Flux UI & Lit Component:** Implement `_tour.scss` and `src/tour/`.

- [ ] **10.21 `vi-rate`: Star Rating Component**
  - [ ] **Features:** Star/custom character icons, half-star selection, readonly display mode, clear on second click, form participation.
  - [ ] **Flux UI & Lit Component:** Implement `_rate.scss` and `src/rate/`.

- [ ] **10.22 `vi-color-picker`: Color Palette & Alpha Channel Picker**
  - [ ] **Features:** Preset color swatches, HSV/RGB/Hex color canvas, alpha transparency slider, form participation.
  - [ ] **Flux UI & Lit Component:** Implement `_color-picker.scss` and `src/color-picker/`.

- [ ] **10.23 `vi-qr-code`: Dynamic QR Code Generator**
  - [ ] **Features:** Canvas / SVG rendering, error correction levels (L, M, Q, H), center logo icon embedding, status overlays (expired, loading).
  - [ ] **Flux UI & Lit Component:** Implement `_qr-code.scss` and `src/qr-code/`.

- [ ] **10.24 `vi-watermark`: Security & Confidential Watermarking**
  - [ ] **Features:** Canvas-generated repetitive text/image watermark overlay with configurable rotation angle, opacity, font, and spacing.
  - [ ] **Use Cases:** Unblinded clinical trial data sheets, draft document review, confidential export watermarks.
  - [ ] **Flux UI & Lit Component:** Implement `_watermark.scss` and `src/watermark/`.

- [ ] **10.25 `vi-image`: Image Display with Zoom & Preview Modal**
  - [ ] **Features:** Fallback placeholder on load error, click-to-preview lightbox dialog, zoom in/out, rotate, flip, and preview group gallery.
  - [ ] **Flux UI & Lit Component:** Implement `_image.scss` and `src/image/`.

- [ ] **10.26 `vi-carousel`: Slide Gallery & Content Carousel**
  - [ ] **Features:** Horizontal/vertical sliding, autoplay, pause on hover, navigation arrows, dot indicators.
  - [ ] **Flux UI & Lit Component:** Implement `_carousel.scss` and `src/carousel/`.

- [ ] **10.27 `vi-statistic`: Highlighted Metric Card & Countdown**
  - [ ] **Features:** Numeric value formatting with thousand separators, prefix/suffix icons or units, and live countdown timer.
  - [ ] **Flux UI & Lit Component:** Implement `_statistic.scss` and `src/statistic/`.

- [ ] **10.28 `vi-mentions`: Tagging Mentions Input**
  - [ ] **Features:** Trigger characters (`@`, `#`), suggestion popup matching, multi-line support.
  - [ ] **Flux UI & Lit Component:** Implement `_mentions.scss` and `src/mentions/`.

- [x] **10.29 `vi-float-button`: Floating Action Button & Speed Dial**
  - [x] **Specification:** Authored in [`libs/web-components/docs/components/vi-float-button.md`](../../libs/web-components/docs/components/vi-float-button.md) and documented in [`CSS-DESIGN-SYSTEM.md`](../../libs/web-components/docs/CSS-DESIGN-SYSTEM.md).
  - [x] **Features:** Floating circular buttons with tooltips, badge counts, rAF cubic back-to-top trigger, and expandable speed-dial menu groups (`<vi-float-button-group>`) with outside-click dismissal, slotted descriptions, and `close-on-select`.
  - [x] **Flux UI & Lit Component:** Implemented in `_float-button.scss`, `src/float-button/`, tests, and Storybook stories.
  - [x] **Accessibility (a11y) & Testing:** Full WAI-ARIA Menu/Speed Dial pattern, roving focus (`ArrowUp`/`ArrowDown`, `Home`/`End`, `Escape`), BackTop reduced motion & tab-stop isolation, 47/47 passing WDIO tests in Chrome, and audit report in [`libs/web-components/docs/components/accessibility/vi-float-button.md`](../../libs/web-components/docs/components/accessibility/vi-float-button.md).
  - [x] **Storybook Stories:** 8 interactive stories in [`vi-float-button.stories.ts`](../../libs/web-components/src/float-button/vi-float-button.stories.ts) using `@vialiq/icons`.

- [ ] **10.30 `vi-affix`: Sticky Viewport Pinning**
  - [ ] **Features:** Pins child content to viewport top or bottom when scrolling past threshold, with offset support and change events.
  - [ ] **Flux UI & Lit Component:** Implement `_affix.scss` and `src/affix/`.

---

## 11. Database Architecture, Storage Scaling & Data Pipeline
*Area: `backend/api`, `Vialiq.Infrastructure`, `Vialiq.Core`, MongoDB & SQL Server*

### 11.1 Codelists & Enterprise Medical Reference Dictionaries
*Area: `Vialiq.Core`, `Vialiq.Infrastructure`, `vialiq_reference_data`*

- [ ] **Hierarchical & Cascading Codelists Engine**
  - [ ] Implement declarative parent-child codelist dependencies (e.g. Country &rarr; State &rarr; Hospital Site, or Organ System &rarr; Symptom &rarr; Severity).
  - [ ] Support conditional codelist filtering based on subject demographic context (e.g. Sex-specific or Age-bracketed options).
  - [ ] Version-bind study codelists across protocol amendments with non-destructive historical preservation.
- [ ] **MedDRA (Medical Dictionary for Regulatory Activities) Integration**
  - [ ] Design 5-level MedDRA relational/document schema: System Organ Class (SOC) &rarr; High-Level Group Term (HLGT) &rarr; High-Level Term (HLT) &rarr; Preferred Term (PT) &rarr; Lowest Level Term (LLT).
  - [ ] Store in shared read-only reference database (`vialiq_reference_data.meddra_terms`) accessible across all study clusters.
  - [ ] Build high-speed autocomplete text indexing (MongoDB Text Index / Atlas Lucene Search) delivering p99 < 50ms typeahead across 80,000+ terms.
  - [ ] Implement annual dictionary up-versioning mechanism (e.g. MedDRA 26.0 &rarr; 27.0) with automated impact reports for open adverse events.
- [ ] **WHODrug Global Dictionary Integration**
  - [ ] Implement Anatomical Therapeutic Chemical (ATC) classification code mapping (Levels 1 through 5) for concomitant medications.
  - [ ] Design search pipeline matching brand names, generic formulations, and active ingredients to standard Drug Record Numbers (DrugRecNo).

### 11.2 Core Domain BSON Schemas, Serialization Maps & .NET 9 Entities
*Area: `backend/api/src/Vialiq.Core/Entities`, `backend/api/src/Vialiq.Infrastructure/Data`*

- [ ] **Clinical Data Document (`crf_entries`)**
  - [ ] Implement C# `CrfEntryEntity` supporting hierarchical layouts, nested repeating groups, and dynamic field dictionaries (`Dictionary<string, object?>`).
  - [ ] Register BSON class mapping conventions (`IgnoreExtraElements`, camelCase element conventions, polymorphic BSON serializers).
  - [ ] Enforce lifecycle status machine: `Draft` &rarr; `Submitted` &rarr; `SDV_Verified` &rarr; `Locked` &rarr; `Signed`.
  - [ ] Implement optimistic concurrency control (OCC) using monotonic document version counters (`long Version`).
- [ ] **Subject Journey Aggregate (`subjects`)**
  - [ ] Implement `SubjectEntity` with multi-state enrollment lifecycle (`Screened`, `ScreenFailed`, `Enrolled`, `Active`, `Completed`, `Withdrawn`).
  - [ ] Design cohort assignment tracking, site affiliation, and inter-site relocation pointer linking (`OriginalSubjectId`, `TransferStatus`).
- [ ] **Discrepancy Query Thread Model (`clinical_queries`)**
  - [ ] Implement `ClinicalQueryEntity` supporting threaded collaboration (Monitor Query &harr; Site Response &harr; Monitor Resolution).
  - [ ] Query classification types: Manual CRA, Automated Edit Check, System Consistency Rule.
  - [ ] Implement Part 11 audit attribution capturing query author, timestamps, candidate field key, and resolution rationale.
- [ ] **Electronic Signature Manifest (`electronic_signatures`)**
  - [ ] Implement `ElectronicSignatureEntity` complying with 21 CFR Part 11 § 11.50 (printed name, UTC timestamp, signature meaning).
  - [ ] Bind cryptographic SHA-256 document hash (`TargetDocumentHash`) to prevent signature repudiation or retroactive tampering.

### 11.3 Liquibase Database Migration & Automated Study Provisioning Pipeline
*Area: `backend/api`, `tools/liquibase`, DevOps*

- [ ] **Liquibase MongoDB Engine Integration**
  - [ ] Configure `liquibase-mongodb` extension and master changelog runner (`db.changelog-master.xml` / JSON).
  - [ ] Automate migration execution in ASP.NET Core startup / deployment init containers.
- [ ] **Automated Study Provisioning Changeset (`POST /api/v1/admin/studies/provision`)**
  - [ ] Build automated Liquibase script to initialize new study database (`study_{id}_prod`).
  - [ ] Pre-provision the 4 high-selectivity compound audit indexes (`idx_audit_subject_field`, `idx_audit_site_timeline`, `idx_audit_country_timeline`, `idx_audit_culture_timeline`) in < 50ms.
  - [ ] Configure MongoDB JSON Schema Collection Validators to enforce strict type safety at the database boundary.
- [ ] **Forward-Only Live Schema Evolution**
  - [ ] Establish zero-downtime forward migration patterns for live studies without exclusive database locks.

### 11.4 CDC Pipeline & Normalized SQL Server Reporting Warehouse (SDTM/SAS)
*Area: `backend/cdc` (`Vialiq.CdcWorker`), SQL Server 2022+*

- [ ] **`.NET 9 Vialiq.CdcWorker` Native Change-Stream Pipeline (ADR 004)**
  - [ ] Configure MongoDB Change Streams (`readConcern: "majority"`) to tail replica set Oplogs for all active study clusters with zero intermediate Kafka/Debezium brokers.
  - [ ] Implement the In-Memory Regional CSFLE Boundary Filter (`Vialiq.CdcWorker`):
    - [ ] Hard-drop all `SiteIdentifier` fields (Name, MRN, National ID, Address) inside the regional VPC before cross-border egress.
    - [ ] Mask `BlindedRTSM` fields (Treatment Arm, Randomization Code) as `"BLINDED"`.
    - [ ] Stream sanitized research data (`ClinicalResearch`) directly over TLS 1.3 to the Central SQL Server reporting warehouse.
- [ ] **SQL Server 2022+ Normalized SDTM Schema**
  - [ ] Implement CDISC SDTM target tables with Clustered Columnstore Indexes:
    - [ ] `DM` (Demographics: Age, Sex, Race, Ethnic, Country)
    - [ ] `VS` (Vital Signs: Systolic, Diastolic, Heart Rate, Temp, Units)
    - [ ] `AE` (Adverse Events: MedDRA Preferred Term, Severity, Serious Flag, Causality)
    - [ ] `LB` (Laboratory Tests: Test Name, Category, Numeric Result, Reference Ranges)
    - [ ] `CM` (Concomitant Medications: WHODrug ATC codes, Dose, Frequency, Route)
  - [ ] Upsert (`MERGE` / `SqlBulkCopy`) sanitized CDC batches directly into SQL Server columnstore tables for real-time SAS / R statistical analysis.

### 11.5 Operational Resilience, Backup SLAs & 25-Year FDA Archival Engine
*Area: SRE, Cloud Infrastructure, Disaster Recovery*

- [ ] **Continuous Point-In-Time Recovery (PITR)**
  - [ ] Configure automated MongoDB continuous Oplog streaming to immutable cloud storage (AWS S3 / Azure Blob).
  - [ ] Verify disaster recovery compliance targets: RPO < 1 minute (data loss), RTO < 15 minutes (restoration).
- [ ] **Automated High-Water Mark Storage Lifecycle**
  - [ ] Configure 80% disk threshold auto-expansion alerts via Kubernetes CSI driver.
  - [ ] Validate WiredTiger `snappy` compression on active data and `zlib` on historical audit collections.
- [ ] **25-Year FDA Cold Archival Engine**
  - [ ] Build automated study archival worker triggered upon final study lock:
    - [ ] Export collections to cryptographically sealed, immutable Apache Parquet files.
    - [ ] Calculate and store SHA-256 package checksum manifests.
    - [ ] Upload to WORM compliance storage (AWS S3 Glacier Vault Lock / Azure Immutable Blob).
    - [ ] Execute verified `db.dropDatabase()` to reclaim high-cost NVMe disk space.

### 11.6 Multi-Cluster Farm & Dynamic Site-Group Storage Engine (Scale 005 / 005-A)
*Area: `Vialiq.Infrastructure.Data`, `Vialiq.Core.Interfaces`*

- [ ] **Polymorphic Storage Topology Contracts**
  - [ ] Implement `StorageTopologyManifest`, `StorageZoneConfig`, and `SiteRoutingRule` models in `Vialiq.Core`.
  - [ ] Implement `DynamicClinicalDatabaseResolver` in `Vialiq.Infrastructure` supporting both `SingleZone` (O(1) fast-path) and `MultiRegionGeoPartitioned` studies.
- [ ] **Federated Push-Down Aggregate Engine**
  - [ ] Implement `IClinicalAggregateExecutor` and `ClinicalAggregateExecutor` dispatching parallel queries across all N study zones via `Task.WhenAll`.
  - [ ] Support automated numerical count and metric rollup for global executive dashboards with zero cross-border PII movement.

---

## 12. Web & API Enterprise Deployment Framework (Linux/K8s & Windows Server/IIS)
*Area: `apps/shell`, `backend/api`, `tools/docker`, DevOps & SRE*
*Specification:* [`docs/deployment/001-web-and-api-enterprise-deployment-framework.md`](../deployment/001-web-and-api-enterprise-deployment-framework.md) (`VIALIQ-DEPLOY-001`)

### 12.1 Frontend Web Deployment (Angular Shell & Module Federation)
- [ ] **GAMP 5 "Build Once, Deploy Everywhere" Manifest**
  - [ ] Implement dynamic runtime environment schema (`assets/env.json`) and loader in `apps/shell/src/main.ts` using `loadManifest()`.
  - [ ] Configure cache-control policies: immutable 1-year cache for hashed assets, `no-cache` for entrypoints (`index.html`, `remoteEntry.js`, `env.json`).
- [ ] **Dual Web Server Configurations**
  - [ ] Create production Nginx Alpine multi-stage Dockerfile (`apps/shell/Dockerfile`) and configuration (`tools/docker/nginx/nginx.conf`).
  - [ ] Create enterprise Windows Server IIS configuration (`dist/apps/shell/web.config`) with URL Rewrite rules, modern MIME mappings (`.woff2`, `.mjs`, `.json`), and Part 11 security headers.

### 12.2 Backend API Deployment (ASP.NET Core .NET 9 LTS)
- [ ] **Linux Chiseled Non-Root Container Image**
  - [ ] Implement multi-stage Dockerfile (`backend/api/Dockerfile`) using `mcr.microsoft.com/dotnet/aspnet:9.0-noble-chiseled` (non-root UID 1654, zero shell, ~110 MB).
  - [ ] Configure Kubernetes liveness (`/healthz/live`), readiness (`/healthz/ready`), and startup (`/healthz/startup`) probes.
  - [ ] Wire 30-second graceful connection draining (`HostOptions.ShutdownTimeout`) and 5-second `preStop` hook.
- [ ] **Windows Server / IIS In-Process Hosting Pipeline**
  - [ ] Configure published `web.config` for IIS In-Process hosting (`hostingModel="inprocess"` via `AspNetCoreModuleV2`).
  - [ ] Add optional `Microsoft.Extensions.Hosting.WindowsServices` support for air-gapped standalone Windows Service deployments.

### 12.3 Full-Stack Local Development Orchestrator
- [ ] **Unified Developer Compose Stack (`tools/docker/docker-compose.fullstack.yml`)**
  - [ ] Orchestrate Mongo 3-layer replica sets, Redis 7.2 Sentinel HA, .NET 9 Web API, and Nginx Web Shell with a single command.
  - [ ] Support developer host-native mode (`dotnet watch` and `nx serve`) alongside containerized services.

### 12.4 Enterprise Load Balancer, Ingress & Traffic Routing
*Specification:* [`docs/deployment/002-load-balancer-ingress-and-traffic-routing-guide.md`](../deployment/002-load-balancer-ingress-and-traffic-routing-guide.md) (`VIALIQ-DEPLOY-002`)
- [ ] **Kubernetes Ingress Manifest (`k8s/vialiq-ingress.yaml`)**
  - [ ] Configure single ingress hostname with path-based routing (`/*`, `/api/*`, `/hubs/*`).
  - [ ] Implement EWMA (Exponentially Weighted Moving Average) least-connections balancing to prevent CDISC export calculation herd effects.
  - [ ] Enforce 30MB payload bounds and 21 CFR Part 11 security headers (`X-Request-ID`, `HSTS`, `X-Frame-Options: DENY`).
  - [ ] Configure 2-second automatic health eviction (`/healthz/ready`) and 30-second graceful connection draining.
- [ ] **Enterprise Windows Server ARR 3.0 & Hardware Balancing**
  - [ ] Document and test IIS Application Request Routing (ARR 3.0) server farm setup (`VialiqApiFarm`) with WebSocket support.
- [ ] **Zero-CORS Local Developer Gateway**
  - [ ] Implement lightweight Dockerized Nginx reverse proxy on port 80 (`tools/docker/nginx/nginx.dev.conf`) proxying to host ports 4200 and 5000.



