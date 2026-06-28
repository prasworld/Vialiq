# Form Builder — Roadmap

> **Status:** Active — design in progress  
> **Date:** 2026-05-29  
> Related docs: [overview](./form-builder-overview.md) · [architecture](./form-builder-architecture.md) · [renderer](./form-builder-renderer.md) · [validation](./form-builder-validation.md) · [custom-validators](./form-builder-custom-validators.md)

---

## 1. Version Strategy

| Version | Theme | Status |
|---|---|---|
| **v0.1** | Foundation — library scaffold, DnD, schema, registry | Planning |
| **v0.2** | Canvas — all built-in components rendered, undo/redo, settings panel | Planning |
| **v0.3** | Validation & Conditionals — rule engine, conditional editor | Planning |
| **v0.4** | Layout components — Panel, Columns, Tabs, Fieldset, Repeater | Planning |
| **v0.5** | `<vi-drawer>` sidebar + keyboard DnD + accessibility pass | Planning |
| **v1.0** | GA — full test coverage, Storybook, published package | Planning |
| **v2.0** | Renderer (`FormRendererComponent` Angular component — `@vi/form-renderer` library) | Backlog |
| **v3.0** | Cross-framework core extraction (`@vi/form-builder-core`) | Backlog |

---

## 2. v1 Scope (What We Build)

### 2.1 Library Infrastructure

- [ ] Nx library project `libs/form-builder` with project.json, package.json (`@vi/form-builder`), tsconfig, vitest
- [ ] ESLint config inheriting workspace root, enforcing module boundaries
- [ ] Exports barrel (`index.ts`) — public API locked down
- [ ] Peer dependencies: `@angular/core ^21`, `@angular/cdk ^21`, `@vialiq/web-components ^0.1`, `@vi/state-fp`
- [ ] Direct dependency: `@atlaskit/pragmatic-drag-and-drop`, `@atlaskit/pragmatic-drag-and-drop-hitbox`
- [ ] Nx module boundary tags: `scope:form-builder`, `type:lib`, `framework:angular`

### 2.2 Type System & Schema

- [ ] `FormSchema` root interface with `schemaVersion`, `id`, `display`, `components[]`, `settings`
- [ ] `FormSettings` block: `validateOn`, `maxWidth`, `submitButton`, `successMessage`, `successRedirectUrl`
- [ ] Full discriminated union: `InputComponentSchema | TextareaComponentSchema | SelectComponentSchema | CheckboxComponentSchema | CheckboxGroupComponentSchema | RadioComponentSchema | DateComponentSchema | HiddenComponentSchema | ContentComponentSchema | DividerComponentSchema | ButtonComponentSchema | LayoutComponentSchema`
- [ ] `BaseComponentSchema` additions: `validateOn`, `labelPosition` (top/left/right/hidden), `labelWidth`, `description` (help text), `readOnly`, `locked`
- [ ] New field types: `checkbox-group`, `date`, `time`, `datetime-local`, `hidden`, `content`, `divider`
- [ ] All layout subtypes: `PanelConfig`, `ColumnsConfig` (with `columnAssignments` map), `TabsConfig` (with `tabAssignments` map), `FieldsetConfig`, `RepeaterConfig`
- [ ] `ValidationSchema` with `RuleDescriptor[]` and `messages` override map
- [ ] `ConditionalRule`: `SimpleConditional` + `JsonLogicConditional`
- [ ] `SettingsSchema` + all `SettingsField` variants
- [ ] `ComponentDescriptor` interface (pure TS, no Angular)
- [ ] `EMPTY_FORM_SCHEMA` factory with default `settings` block
- [ ] `SchemaValidationError` + `SchemaErrorCode` types

### 2.3 Component Registry

- [ ] `BUILDER_COMPONENTS` `InjectionToken<ComponentDescriptor[]>` (multi)
- [ ] `BUILDER_CONFIG` `InjectionToken<BuilderConfig>` with defaults (`historyDebounceMs: 500`, `maxHistorySize: 100`, `allowCustomJs: false`)
- [ ] `BuilderRegistryService` — collects descriptors, groups by category, sorted
- [ ] Built-in descriptors: `text-input`, `email`, `password`, `tel`, `number`, `textarea`, `select`, `checkbox`, `checkbox-group`, `radio`, `date`, `time`, `datetime-local`, `hidden`, `content`, `divider`, `button`, `submit`, `panel`, `columns`, `tabs`, `fieldset`, `repeater`
- [ ] `BUILT_IN_BUILDER_COMPONENTS` convenience array
- [ ] Cherry-pick exports for tree-shaking

> **Dependency note:** `date`, `time`, `datetime-local` descriptors require `<vi-date-picker>` web component. This is a Phase 0 prerequisite.

### 2.4 State Management & History

- [ ] `FormSchemaService` — `schema: Signal<FormSchema>`, pure mutation functions
- [ ] `BuilderStateService` — `activeNodeId`, `isDragging`, `propertiesPanelOpen`, `previewMode`
- [ ] `HistoryService` — wraps `@vi/state-fp`, undo/redo stack, `canUndo/canRedo` signals
- [ ] History debounce: coalesces rapid `patchComponent` calls within `historyDebounceMs` window
- [ ] History max size: drops oldest snapshot when stack exceeds `maxHistorySize`
- [ ] Schema mutation primitives: `addComponent`, `removeComponent`, `moveComponent`, `patchComponent`, `duplicateComponent`
- [ ] `isDescendant(nodeId, targetId)` for DnD cycle prevention
- [ ] `isKeyUnique(key, excludeNodeId)` for settings validation
- [ ] `getNode(nodeId): ComponentSchema | undefined` for DnD and settings panel

### 2.5 Drag & Drop

- [ ] `DndService` wrapping `@atlaskit/pragmatic-drag-and-drop`
- [ ] `registerPaletteItem(el, descriptorType)` → cleanup fn
- [ ] `registerCanvasNode(dragHandle, el, nodeId, parentId, index)` → cleanup fn
- [ ] `registerDropZone(el, parentId, index)` → cleanup fn
- [ ] Cycle prevention guard (can't drop container into itself)
- [ ] `KeyboardDndService` for keyboard-accessible reordering
- [ ] ARIA live region for DnD announcements
- [ ] `KeyGeneratorService` — `labelToKey(label)` + `deduplicateKey(candidate, existingKeys)` (called on every palette drop)

### 2.6 Angular Components

**Builder Host:**
- [ ] `FormBuilderComponent` — 3-column layout, `[schema]` input, `(schemaChange)` output, `schema` signal, `undo()`/`redo()` methods

**Toolbar:**
- [ ] `BuilderToolbarComponent` — undo/redo buttons, preview toggle, JSON schema view button, save button

**Palette:**
- [ ] `PaletteComponent` — reads `BuilderRegistryService.getGrouped()`
- [ ] `PaletteSearchComponent` — filters components by name/label across all categories
- [ ] `PaletteGroupComponent` — collapsible group with header
- [ ] `PaletteItemComponent` — draggable tile, DnD integration

**Canvas:**
- [ ] `CanvasComponent` — root drop container, renders top-level nodes
- [ ] `CanvasFormTitleComponent` — inline editable form title above canvas; clicking empty canvas shows Form Settings in right panel
- [ ] `CanvasEmptyStateComponent` — illustrated prompt when canvas has no components
- [ ] `CanvasBreadcrumbComponent` — shows nesting path for the currently selected node
- [ ] `CanvasNodeComponent` — recursive; renders `<vi-*>` element + overlay; shows required `*` indicator
- [ ] `CanvasNodeOverlayComponent` — select, duplicate, delete, drag handle actions
- [ ] `CanvasDropZoneComponent` — between-node drop target with animated indicator
- [ ] `CanvasContainerComponent` — layout node children with per-column/tab zone sets

**Properties Panel:**
- [ ] `PropertiesPanelComponent` — tabs, dispatches patches to `FormSchemaService`; shows `FormSettingsPanelComponent` when no node selected
- [ ] `FormSettingsPanelComponent` — edits `FormSchema.title`, `description`, `display`, `settings` block
- [ ] `SettingsTabComponent` — renders one `SettingsTab` from `SettingsSchema`
- [ ] `SettingsFieldComponent` — switches on `SettingsField.type` to render correct input
- [ ] `SettingsHostComponent` — lazy-loads custom `settingsComponent` via `createComponent`
- [ ] `ValidationRulesEditorComponent` — add/edit/remove/reorder validation rules
- [ ] `ConditionalEditorComponent` — simple + JSON Logic conditional builder
- [ ] `RuleRowComponent` — single rule display row

**JSON View:**
- [ ] `SchemaJsonViewComponent` — modal/overlay showing raw schema JSON; allows importing/editing JSON directly

### 2.7 Validation

- [ ] Rule engine: `evaluate(rules, value, formData) → ValidationResult`
- [ ] All built-in evaluators: required, minLength, maxLength, min, max, pattern, email, url, integer
- [ ] `json-logic` evaluator (using `json-logic-js`)
- [ ] `custom-js` evaluator (disabled by default, gated by `allowCustomJs` config)
- [ ] `evaluateConditional(rule, formData) → boolean`
- [ ] Default messages for all rule types with `{{value}}` interpolation
- [ ] Full unit test coverage
- [ ] `SchemaValidatorService` — `validateSchema(schema, registry): SchemaValidationError[]`
- [ ] Checks: `DUPLICATE_KEY`, `DUPLICATE_ID`, `EMPTY_KEY`, `INVALID_KEY_FORMAT`, `UNKNOWN_TYPE`, `ORPHANED_CONDITIONAL`, `ORPHANED_TAB_ASSIGNMENT`, `ORPHANED_COL_ASSIGNMENT`, `INVALID_COLUMN_INDEX`

### 2.8 `<vi-drawer>` Web Component (in `libs/web-components`)

- [ ] `<vi-drawer>` Lit 3 element — open/close, slide-in animation, backdrop
- [ ] `open` boolean attribute + property
- [ ] Slots: `header`, `default` (content), `footer`
- [ ] `vialiq-drawer-open` / `vialiq-drawer-close` events
- [ ] CSS parts: `backdrop`, `panel`, `header`, `content`, `footer`
- [ ] CSS custom properties: `--vi-drawer-width`, `--vi-drawer-z-index`
- [ ] Keyboard: `Escape` closes
- [ ] Focus trap on open (uses `focus-trap-mixin`)
- [ ] ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

### 2.9 Testing

- [ ] Unit tests: rule engine (100% function coverage)
- [ ] Unit tests: schema mutation functions
- [ ] Unit tests: `BuilderRegistryService`
- [ ] Unit tests: `HistoryService`
- [ ] Component tests: `PaletteComponent`, `CanvasNodeComponent`, `PropertiesPanelComponent`
- [ ] Integration test: drag palette item → canvas → schema updated
- [ ] Integration test: undo/redo after add/move/patch
- [ ] Web component tests: `<vi-drawer>` open/close, focus trap, keyboard

### 2.10 Documentation & DX

- [ ] Storybook stories for `FormBuilderComponent` with all built-in components
- [ ] Story: custom component descriptor registration
- [ ] Story: initial schema loading (edit existing form)
- [ ] README with quick-start guide
- [ ] JSDoc on all public API surface (types, tokens, service methods)

---

## 3. Implementation Phases

### Phase 0 — Web Component Prerequisites (Week 0–1, parallel)

> **Blocker for date/time fields.** This phase can run in parallel with Phase 1.

Goal: Build `<vi-date-picker>` in `libs/web-components` so date/time descriptors can render on canvas.

```
libs/web-components/src/date-picker/
├── vi-date-picker.ts          ← Lit 3 element: type=date|time|datetime-local
└── vi-date-picker.spec.ts
```

**Done when:**
- `<vi-date-picker type="date">` renders a native or custom date picker
- Integrates with `ValidityMixin` and `FormAssociated` (same as `vi-input`)
- WDIO test: selects a date, submits — value is ISO string

### Phase 1 — Foundation (Week 1–2)

Goal: Library scaffolded, types complete, schema parseable, registry working.

```
libs/form-builder/
├── project.json + package.json       ← Nx setup
├── src/lib/types/                    ← All TypeScript interfaces
├── src/lib/tokens/                   ← InjectionTokens
├── src/lib/registry/                 ← BuilderRegistryService
├── src/lib/built-in-components/      ← All descriptors (no UI yet)
└── src/lib/validation/               ← Rule engine + evaluators
```

**Done when:**
- `npx nx build form-builder` succeeds
- `npx nx test form-builder` passes rule engine tests
- `BuilderRegistryService` resolves all built-in descriptors from DI

### Phase 2 — Canvas & DnD (Week 3–4)

Goal: Drag from palette to canvas works end-to-end. Basic flat layout. Key auto-generation fires on drop.

```
src/lib/
├── services/dnd.service.ts
├── services/form-schema.service.ts
├── services/builder-state.service.ts
├── services/key-generator.service.ts    ← NEW: labelToKey + deduplicateKey
├── palette/                           ← All palette components incl. search
├── canvas/canvas.component.ts
├── canvas/canvas-empty-state.component.ts  ← NEW
├── canvas/canvas-form-title.component.ts   ← NEW: inline editable title
├── canvas/canvas-node.component.ts    ← Renders vi-* elements
├── canvas/canvas-drop-zone.component.ts
└── builder/form-builder.component.ts  ← 3-column layout shell
```

**Done when:**
- Drag `text-input` from palette → canvas → `FormSchema` gains a new node with auto-generated key
- Key auto-generates as camelCase from component label; de-duplicates if collision
- Palette search filters components by typing
- Canvas renders `<vi-input>` with correct attributes
- Reorder two canvas nodes — schema updates correctly
- Empty canvas state shown until first drop

### Phase 3 — Properties Panel & History (Week 5–6)

Goal: Selecting a node opens its settings; edits update schema; undo/redo works. Duplicate and JSON view also land here.

```
src/lib/
├── properties/                        ← All settings components
├── properties/form-settings-panel.component.ts  ← NEW: form-level settings
├── services/history.service.ts
├── services/schema-validator.service.ts         ← NEW: validateSchema()
├── toolbar/builder-toolbar.component.ts
├── json-view/schema-json-view.component.ts      ← NEW: JSON editor modal
└── canvas/canvas-node-overlay.component.ts
```

**Done when:**
- Click `<vi-input>` on canvas → properties panel shows label, placeholder, key fields
- Key field shows auto-generated value; editing it validates uniqueness inline
- Typing in label → canvas updates live (debounced 500ms before history snapshot)
- Undo → previous label restored; redo → re-applies
- Clicking empty canvas area → right panel switches to Form Settings
- "Duplicate" on overlay → clone appears below with suffixed key
- "JSON" button in toolbar → modal shows raw schema JSON, importable

### Phase 4 — Layout Components (Week 7–8)

Goal: Full recursive nesting — panels, columns, tabs, fieldset, repeater.

```
src/lib/
├── canvas/canvas-container.component.ts
└── built-in-components/
    ├── panel.descriptor.ts
    ├── columns.descriptor.ts
    ├── tabs.descriptor.ts
    ├── fieldset.descriptor.ts
    └── repeater.descriptor.ts
```

**Done when:**
- Drop a Panel onto canvas → drop zones appear inside it
- Drop `vi-input` into panel → schema nests it under panel's `components[]`
- Drop Panel into Panel (3 levels deep) → works correctly
- Columns layout shows 2-column grid; `columnAssignments` map on container updated on each drop
- Tabs layout: `tabAssignments` map on container updated when dragging between tabs
- Breadcrumb shows correct nesting path when editing 3 levels deep
- Required indicator (`*`) shown on required fields on canvas

### Phase 5 — Validation & Conditionals (Week 9–10)

Goal: Validation rules editable in properties panel; conditional visibility works in preview.

> **Architecture decided (2026-05-29):** Validation uses `ValidationEngine` (Angular `@Injectable()`) with `json-logic-js` rule evaluation and `FieldStateService` Signal-based state. Custom validators are registered via `provideValidation()` from `@vialiq/form-validator-sdk`. See [form-builder-validation.md](./form-builder-validation.md) §20 for the full implementation spec and [form-builder-custom-validators.md](./form-builder-custom-validators.md) for the custom validator SDK.

```
src/lib/
├── properties/validation-rules-editor.component.ts
├── properties/conditional-editor.component.ts
└── validation/conditional-evaluator.ts
```

**Done when:**
- Add `required` rule to `text-input` → schema reflects rule as `ValidationRule[]` (not `ValidationSchema` wrapper)
- Toggle preview mode → empty required field shows error via `<vi-input>` validity mixin
- `validateOn` (form-level) correctly triggers on `onBlur` / `onChange` / `onSubmit`
- Add simple conditional → in preview, field hides/shows based on another field's value

### Phase 6 — `<vi-drawer>` & Accessibility (Week 11–12)

Goal: Sidebar mode works; keyboard DnD complete; ARIA implemented.

```
libs/web-components/src/drawer/        ← New Lit component
libs/form-builder/src/lib/services/keyboard-dnd.service.ts
```

**Done when:**
- On narrow viewport, properties panel opens in `<vi-drawer>` slide-in
- `Space` on drag handle enters keyboard DnD mode; arrow keys move node
- Screen reader announces drag state via ARIA live region
- WAVE/axe reports no errors on builder

### Phase 7 — Polish & Release (Week 13–14)

Goal: Full test pass, Storybook, documentation, published.

- All unit tests passing
- Playwright integration tests passing
- Storybook deployed
- README finalized
- `npx nx release form-builder` tags `v1.0.0`
- `prefers-reduced-motion` verified on DnD animations and drawer
- Touch DnD tested on iOS + Android

> **i18n Action Item:** Before v1.0 GA, schedule a separate planning session for Angular i18n strategy (inclination: Angular full i18n pipeline). This is deferred but must be resolved before any non-English market usage.

---

## 4. v2+ Backlog

### `FormRendererComponent` — Angular Form Renderer

> **Update (2026-05-29):** `FormRendererComponent` has been promoted from backlog to **active design**. Architecture decisions are complete. See [form-builder-renderer.md](./form-builder-renderer.md) for the full spec.

An Angular 21 standalone component that takes a `FormSchema` and renders an interactive HTML form.

```typescript
// In an Angular host page:
@Component({
  imports: [FormRendererComponent],
  template: `<vi-form-renderer [schema]="formSchema" (formSubmit)="onSubmit($event)" />`,
  providers: [{ provide: FORM_DATA_SERVICE, useClass: MyFormDataService }]
})
export class MyPageComponent { ... }
```

Design points:
- Ships in `@vi/form-renderer` (separate library at `libs/form-renderer/`).
- Angular 21 standalone, `ChangeDetectionStrategy.OnPush`, `ViewEncapsulation.Emulated` (no Shadow DOM).
- Signal-based `FieldStateService` drives all field value, validation error, and submission state.
- `FORM_DATA_SERVICE` + `CUSTOM_VALIDATOR_REGISTRY` InjectionTokens for runtime injection.
- Hosts `<vi-*>` Lit leaf elements (form-associated custom elements) inside Angular wrapper components.
- `@Output()` emitters: `formChange`, `formValidate`, `formSubmit`, `formError`, `formReset`.
- Is **not** a builder — no drag and drop. Purely a renderer.
- v2.1: Angular Elements entry point (`@vi/form-renderer/elements`) for cross-framework use.

### Wizard Mode

- `FormSchema.display = 'wizard'`
- `pages: PageSchema[]` wrapping `components[]`
- `BuilderToolbarComponent` gains page navigation
- Progress bar component

### Form Template Library

- Save a canvas component subtree as a named template
- Templates appear in a new "Templates" palette category
- Templates stored as `ComponentSchema[]` JSON blobs

### Data Source Integration

- `SelectComponentSchema.optionDataSource` populated from a registered `DataSourceAdapter`
- Adapters registered via `DATA_SOURCES` `InjectionToken`
- Options previewed in canvas using mock data

### Visual Conditional Builder

- Replace the raw JSON Logic editor with a visual rule builder
- "When [field] [operator] [value] → [show/hide]"
- Supports AND/OR groups

### Form Versioning & Migration

- `schemaVersion` upgrade path: `MigrationRegistry`
- Register migrations: `{ from: '1', to: '2', migrate: (schema) => newSchema }`

### `@vi/form-builder-core` (v3)

- Extract framework-agnostic core:
  - `ComponentDescriptor`, `FormSchema`, `RuleDescriptor`
  - `ComponentRegistry` (plain TS class, no Angular DI)
  - `evaluate()`, `evaluateConditional()`
  - Schema mutation functions
  - `HistoryManager`
- Publish as `@vi/form-builder-core`
- `@vi/form-builder` becomes an Angular adapter thin shell

---

## 5. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Angular CDK version mismatch | Medium | High | Pin CDK to same minor as Angular 21; use peer dep range |
| pragmatic-drag-and-drop API change | Low | Medium | Encapsulate behind `DndService`; adapter pattern |
| Recursive drop nesting bugs | High | High | Dedicated Playwright tests for 3-level nesting; cycle guard |
| `<vi-*>` web components not available | Medium | High | `CanvasNodeComponent` falls back to a placeholder tile |
| `new Function()` CSP violation | High | Medium | `custom-js` off by default; document CSP requirement |
| State-fp API compatibility | Low | Medium | Wrap in `HistoryService`; isolate state-fp from public API |
| Bundle size growth | Medium | Low | Monitor with `npx nx run form-builder:build -- --analyze`; lazy load settings components |
| Key collision in registry | Low | Low | `BuilderRegistryService` logs warn on duplicate types |

---

## 6. Dependency Graph

```
@vi/form-builder
├── @angular/core ^21
├── @angular/cdk ^21         (Overlay, Portal, FocusTrap, A11y — NOT DnD)
├── @atlaskit/pragmatic-drag-and-drop ~1.x
├── @atlaskit/pragmatic-drag-and-drop-hitbox ~1.x
├── @vialiq/web-components ^0.1   (vi-input, vi-button, vi-drawer)
├── @vi/state-fp             (HistoryService undo/redo)
└── @vi/icons                (icon names in descriptors)

DEV ONLY:
├── @testing-library/angular
├── @playwright/test
└── @storybook/angular
```

---

## 7. Open Questions (To Resolve Before Phase 1)

1. **`<vi-panel>` and `<vi-columns>` web components** — Do we build these as part of `web-components` v1, or does the canvas render layout containers using pure Angular components (not web components)? The `canvasElement` in layout descriptors currently assumes a `<vi-panel>` web component.

   _Suggested answer: Layout containers in the canvas are Angular components (no web component). The `canvasElement` for layout descriptors is a canvas-specific Angular component tag, not a web component. The renderer (`FormRendererComponent`, v2) handles layout natively via `vi-renderer-columns`, `vi-renderer-panel`, etc._

2. **`json-logic-js` dependency** — Add as a direct dep or load via CDN? It's ~3KB, so direct dep is preferable for offline use and CSP compliance.

   _Suggested answer: Direct dependency._

3. **Storybook version** — Current web-components uses Storybook. Should `form-builder` share the same Storybook instance or have its own?

   _Suggested answer: Shared. Add stories to the existing Storybook configuration with a `form-builder/` prefix._

4. **Renderer preview mode** — Should the preview mode in the builder use the real `FormRendererComponent` (v2+) or a simplified preview renderer?

   _Decision (2026-05-21): v1 ships a simplified Angular preview renderer (`FormPreviewComponent`) in the builder package. v2 replaces it with the full `FormRendererComponent` from `@vi/form-renderer`. The renderer is Angular — not a Lit web component. See `docs/form-builder-renderer.md` for the full decision rationale._

5. **Schema persistence** — Should the library include any persistence adapter (localStorage, sessionStorage) or is that 100% the consumer's responsibility?

   _Suggested answer: Consumer responsibility. Library emits schema via Signal/Output only. A `LocalStorageAdapter` can be provided as a separate optional module._

---

## 8. Platform Phase Roadmap

> These are **cross-cutting platform capabilities** — distinct from the v1 builder implementation phases (§3) and the v2+ feature backlog (§4). They concern infrastructure, compliance, and application architecture concerns that span the form builder, renderer, and the host application.

---

### Phase 3 — Compliance & Extensible Runtime

> **Decision (2026-05-24):** Phase 3 items are renderer-mode-only features. They must **not** require rebuilding or redeploying the form platform. The target mechanism is runtime injection — a second microfrontend or host application registers capabilities with the renderer via `InjectionToken`s (Angular) or a module-federation-exposed hook. Full application architecture design is deferred to a separate session.

#### P3.1 Audit Trail

- **What:** Every field value change in the renderer must be capturable: who changed it, when, what the old value was, what the new value is.
- **Decision:** Implemented as a separate Phase 3 module — not baked into the renderer core. The renderer will expose an `AUDIT_TRAIL_SERVICE` `InjectionToken` that a host/microfrontend can optionally provide. If not provided, the renderer functions identically to Phase 2.
- **Implementation approach (deferred):** Full architecture session required. Likely candidates: event-sourced change log, injectable `AuditTrailService`, Module Federation remote loading.
- **Note:** 21 CFR Part 11 §11.10(e)(k)(2) compliance — time-stamped, computer-generated, user-attributable records.
- **Status:** ⏳ Architecture design session pending.

#### P3.2 Query Management

- **What:** Data monitors / reviewers raise "queries" (discrepancies) against specific field values. The site data entry person must see the query, provide a response, and optionally correct the value. Queries have their own lifecycle (`open → answered → closed / cancelled`).
- **Decision:** Implemented as a separate Phase 3 module. The renderer exposes a `QUERY_SERVICE` `InjectionToken`. A separate microfrontend provides the UI overlay and query lifecycle management. Zero coupling to the renderer core.
- **Implementation approach (deferred):** Same architecture session as P3.1. Token injection / Module Federation remote. Field-level query indicators are rendered by the host overlay, not the renderer.
- **Status:** ⏳ Architecture design session pending.

#### P3.3 Reason for Change

- **What:** When a previously-submitted value is edited, the system must prompt for a reason before accepting the new value (e.g. "Transcription error", "New information received").
- **Decision:** Tied to Audit Trail (P3.1). Reason-for-change dialog is triggered by the `AUDIT_TRAIL_SERVICE` intercepting the field's `(valueChange)` — not by the renderer itself.
- **Status:** ⏳ Deferred to P3 audit trail architecture session.

#### P3.4 Electronic Signature Web Component (`<vi-signature>`)

- **What:** A canvas-based freehand signature capture custom element.
- **Requirements:**
  - Canvas capture surface — stylus, finger (touch), mouse input.
  - Configurable output format: `SVG` (vector, default) or `PNG` (raster, lossy).
  - `clear()` method and clear button UI (built-in, stylable).
  - `value` property / `internals.setFormValue()` for form-association.
  - `strokeColor` and `strokeWidth` CSS custom properties.
  - Empty-state detection: `isEmpty` property (all pixels transparent = true).
  - `vi-signature-change` custom event on stroke end with `{ value: string, format: 'svg' | 'png' }`.
- **Device support (Phase 3 discussion):** iPad/Apple Pencil pressure sensitivity, Wacom signature pad hardware, capacitive touchscreen behaviour on Windows tablets — full device matrix to be confirmed in Phase 3.
- **Note:** Freehand SVG capture alone does **not** meet 21 CFR Part 11 §11.50 (electronic signature meaning and attribution). The `<vi-signature>` component captures the ink artefact only. Signature workflow (who is signing, what they are attesting to, authentication challenge) is a Phase 3 application-layer concern, not a web component concern.
- **Status:** ⏳ Web component implementation pending; device matrix discussion deferred to Phase 3.

---

### Phase 4 — Persistence, Versioning & Scale

> Phase 4 items are deferred until Phase 3 architecture is finalized and a fuller technical plan is in place.

#### P4.1 Form / Study Versioning

- **What:** Running studies can have protocol amendments that change form schemas mid-study. How does the system handle data captured under schema v1 when the active schema is v2? Migration runtime, rollback, and per-subject schema-version binding.
- **Decision:** Broader topic requiring dedicated technical design session. Touches schema migration, data contracts, and DB versioning.
- **Status:** ⏳ Phase 4. Separate design session required.

#### P4.2 Partial Save / Draft Persistence

- **What:** Long clinical forms may span multiple sessions. Users need to save progress without submitting. The current `saveState` button action uses `@vi/state-fp` with storage strategy TBD.
- **Decision:** Deferred. A more complete technical plan is needed before committing to an approach (localStorage, IndexedDB, server-side draft, or hybrid).
- **Status:** ⏳ Phase 4. See [form-builder-offline.md](./form-builder-offline.md) for the offline/storage technical reference.

#### P4.3 Offline / Disconnected Mode

- **What:** Full offline capability — load the form, capture data, submit when connectivity is restored. Targeted at clinical sites with poor or intermittent network access.
- **Decision:** Deferred. Full technical approach is documented in [form-builder-offline.md](./form-builder-offline.md) for reference when this phase begins.
- **Status:** ⏳ Phase 4. Technical reference doc created.

---

### Technical Debt Register

| ID | Item | Context |
|---|---|---|
| TD-01 | File Upload | Out of scope for core renderer. A separate `<vi-file-upload>` web component will be built. FormIO-pattern implementation (drag-drop + server upload) in a standalone component with `InjectionToken`-based upload adapter. |
| TD-02 | Schema Architecture — JSON-only + JS extension model | Current schema mixes data model and UI model in a single `ComponentSchema`. Target: revisit FormIO's approach — pure JSON schema for structure and validation, optional JS/formula extension points for calculation and interaction. Full redesign session required before any breaking schema changes. |
| TD-03 | Cascading / Linked Codelists (C10) | When one field's value determines another field's codelist options (e.g. country → site list), a reactive cascade mechanism is needed. Target: a declarative `dependsOn` config on `CodelistOptionSource` with minimal code at the renderer level. Design session required before implementation. |
| TD-04 | C3 Field Runtime Status | Field statuses (`blank`, `incomplete`, `complete`, `queried`, `clean`, `frozen`, `locked`) are maintained at the **database / application layer** — not in the renderer. No implementation required in renderer code. |
| TD-05 | C6 Visit / Subject Context | CRF visit and subject binding is a **product/functional concern** handled at the host application layer. The renderer is intentionally generic; visit context is passed via `FormDataService` metadata, not schema. No schema changes required. |
