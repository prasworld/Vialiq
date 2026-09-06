# Form Builder — Comprehensive Phase-Wise Development Plan

> **Synthesized from:** [form-builder-overview.md](file:///Users/prashantgupta/code/nx/docs/form-builder-overview.md) · [form-builder-roadmap.md](file:///Users/prashantgupta/code/nx/docs/form-builder-roadmap.md) · [form-builder-architecture.md](file:///Users/prashantgupta/code/nx/docs/form-builder-architecture.md) · [form-builder-schema.md](file:///Users/prashantgupta/code/nx/docs/form-builder-schema.md) · [form-builder-renderer.md](file:///Users/prashantgupta/code/nx/docs/form-builder-renderer.md) · [form-builder-dnd.md](file:///Users/prashantgupta/code/nx/docs/form-builder-dnd.md) · [form-builder-technical-debt.md](file:///Users/prashantgupta/code/nx/docs/form-builder-technical-debt.md) · [form-builder-validation.md](file:///Users/prashantgupta/code/nx/docs/form-builder-validation.md) · [form-builder-custom-validators.md](file:///Users/prashantgupta/code/nx/docs/form-builder-custom-validators.md)
>
> **Author:** Synthesized by Antigravity — 2026-08-30
> **Status:** Living Document — ready for execution

---

## System Architecture Summary

```
┌────────────────────────────────────────────────────────────┐
│           PRODUCT LAYER (Host Application)                  │
│   Study › Site › Subject › Visit › CRF binding             │
└──────────────────────────┬─────────────────────────────────┘
                           │ provides FormDataService / schema
┌──────────────────────────▼─────────────────────────────────┐
│   @vi/form-builder  (Angular 21, libs/form-builder)         │
│   Visual drag-and-drop authoring   →  emits FormSchema      │
└──────────────────────────┬─────────────────────────────────┘
                           │ FormSchema (plain JSON)
┌──────────────────────────▼─────────────────────────────────┐
│   @vi/form-renderer  (Angular 21, libs/form-renderer)       │
│   FormRendererComponent  — renders interactive form         │
│   FieldStateService · ValidationEngine · CodelistStore      │
└──────────────────────────┬─────────────────────────────────┘
                           │ hosts
┌──────────────────────────▼─────────────────────────────────┐
│   @vialiq/web-components  (Lit 3, libs/web-components)      │
│   <vi-input> <vi-select> <vi-drawer> <vi-date-picker> …    │
└────────────────────────────────────────────────────────────┘
```

**Permanent architectural boundaries:**
- **Leaf UI** → Lit 3 web components (form-associated, shadow-root isolation)
- **Orchestration** → Angular 21 (DI, Signals, CDK, testability)
- **Schema** → Plain TypeScript JSON (framework-agnostic, portable)
- **DnD engine** → `@atlaskit/pragmatic-drag-and-drop` (NOT Angular CDK DnD)

---

## Version Roadmap at a Glance

| Version | Theme | Timeline | Status |
|---|---|---|---|
| **v0.1** | Foundation — scaffold, types, registry, rule engine | Weeks 0–2 | ✅ Complete |
| **v0.2** | Canvas & DnD — drag from palette, flat canvas, auto-key | Weeks 3–4 | ✅ Complete |
| **v0.3** | Properties Panel & History — settings, undo/redo, JSON view | Weeks 5–6 | ✅ Complete |
| **v0.4** | Layout Components — panel, columns, tabs, fieldset, repeater | Weeks 7–8 | ⏳ Next |
| **v0.5** | Validation & Conditionals — rule editor, conditional visibility | Weeks 9–10 | 🔜 Upcoming |
| **v0.6** | Drawer & Accessibility — `<vi-drawer>`, keyboard DnD, ARIA | Weeks 11–12 | 🔜 Upcoming |
| **v1.0** | GA — full tests, Storybook, documentation, published package | Weeks 13–14 | 🔜 Upcoming |
| **v2.0** | Form Renderer — `FormRendererComponent` (`@vi/form-renderer`) | Post v1 | 🔜 Upcoming |
| **v3.0** | Cross-framework core (`@vi/form-builder-core`) | Backlog | 🔜 Backlog |

---

## Phase 0 — Web Component Prerequisites
### `libs/web-components` | Weeks 0–1 (Parallel with Phase 1)

> **Blocker for:** date/time field rendering on canvas. Runs in parallel with Phase 1.

### Goals
Build `<vi-date-picker>` and harden all `<vi-*>` leaf components with `readonly` support (TD-06).

### Deliverables

#### 0.1 `<vi-date-picker>` Lit Component

```
libs/web-components/src/date-picker/
├── vi-date-picker.ts          ← Lit 3 element
└── vi-date-picker.spec.ts     ← WDIO tests
```

**Specification:**
- `type` attribute: `date | time | datetime-local`
- Integrates with `ValidityMixin` + `FormAssociated` (same pattern as `vi-input`)
- `value` property outputs ISO-8601 string
- Native `<input>` wrapped in Lit for consistent form-association
- `readonly` boolean property/attribute — renders as `<span class="vi-readonly-value">` (no `disabled`)
- `min`, `max`, `step` attribute forwarding to native input

**Acceptance Criteria:**
- [ ] `<vi-date-picker type="date">` renders, user selects date, value is ISO-8601
- [ ] `<vi-date-picker type="time">` renders, value is `HH:mm`
- [ ] `<vi-date-picker type="datetime-local">` renders, value is `YYYY-MM-DDTHH:mm`
- [ ] WDIO: select a date → submit → correct payload
- [ ] `readonly` attribute renders clean text (not disabled input)

#### 0.2 `readonly` on ALL Existing `<vi-*>` Components (TD-06)

Every Lit CE must implement:
```typescript
@property({ type: Boolean }) readonly = false;
// render() switches between interactive and read-only text presentation
```

Components requiring update: `vi-input`, `vi-textarea`, `vi-select`, `vi-combobox`, `vi-dropdown`, `vi-checkbox`, `vi-radio`, `vi-button`

**Permission Bitmask pattern** (decided 2026-05-29):
```typescript
export const enum FormPermission {
  READ     = 0b00001,
  WRITE    = 0b00010,
  VALIDATE = 0b00100,
  SIGN     = 0b01000,
  LOCK     = 0b10000,
}
```

**Acceptance Criteria:**
- [ ] All `<vi-*>` elements accept `readonly` attribute
- [ ] `readonly` renders as clean text, not greyed-out/disabled
- [ ] `readonly` ≠ `disabled` (visually and semantically distinct)
- [ ] WDIO test: readonly field is visible, not interactive, accessible

---

## Phase 1 — Foundation
### `libs/form-builder` | Weeks 1–2

> **Goal:** Library scaffolded, all types complete, schema parseable, registry injecting built-in descriptors, rule engine fully tested.
> 
> **Status: ✅ Complete** — All 1.1–1.7 deliverables done. 53 tests passing.

### 1.1 Nx Library Scaffold

```
libs/form-builder/
├── project.json               ← tags: scope:form-builder, type:lib, framework:angular
├── package.json               ← @vi/form-builder v0.1.0
├── tsconfig.json / tsconfig.lib.json / tsconfig.spec.json
├── eslint.config.mjs          ← inherits workspace root
├── vitest.config.mts
└── src/
    └── index.ts               ← locked public API barrel
```

**Peer dependencies:** `@angular/core ^21`, `@angular/cdk ^21`, `@vialiq/web-components ^0.1`, `@vi/state-fp ^1.0`
**Direct dependencies:** `@atlaskit/pragmatic-drag-and-drop ^1.x`, `@atlaskit/pragmatic-drag-and-drop-hitbox ^1.x`, `json-logic-js`

**Nx module boundary tags:**
```js
// form-builder ← can import web-components, state-fp
// form-builder ← CANNOT import from apps/
// web-components ← CANNOT import from form-builder (no circular)
```

**Acceptance Criteria:**
- [ ] `npx nx build form-builder` succeeds (zero errors)
- [ ] `npx nx lint form-builder` passes with boundary rules enforced

### 1.2 Complete Type System

```
src/lib/types/
├── schema.ts                  ← FormSchema, FormSettings, BaseComponentSchema
├── component-schemas.ts       ← Full discriminated union (all 15+ types)
├── option-source.ts           ← OptionSource, StaticOptionSource, CodelistOptionSource, CodelistItem
├── layout-schemas.ts          ← PanelConfig, ColumnsConfig, TabsConfig, FieldsetConfig, RepeaterConfig
├── component-descriptor.ts   ← ComponentDescriptor, SettingsSchema, SettingsField
├── validation.ts              ← ValidationRule, ValidationResult, RuleDescriptor
├── conditional.ts             ← ConditionalRule, SimpleConditional, JsonLogicConditional
└── errors.ts                  ← SchemaValidationError, SchemaErrorCode
```

**Key types to define:**

| Interface | Required Fields |
|---|---|
| `FormSchema` | `schemaVersion`, `id`, `title`, `display`, `components`, `createdAt`, `updatedAt`, `settings?`, `metadata?` |
| `BaseComponentSchema` | `id`, `type`, `key?`, `label`, `hidden?`, `disabled?`, `readOnly?`, `locked?`, `labelPosition?`, `description?`, `validation?`, `conditional?`, `isRepeating?`, `minRepeat?`, `maxRepeat?`, `encryption?` |
| `LayoutComponentSchema` | extends Base + `components: ComponentSchema[]`, `layoutConfig: PanelConfig | ColumnsConfig | TabsConfig | FieldsetConfig | RepeaterConfig` |
| `ComponentDescriptor` | `type`, `label`, `category`, `icon`, `weight?`, `defaultSchema`, `settingsSchema?`, `settingsComponent?`, `canvasElement`, `canvasProps`, `supportsRepeating?`, `rendererRef` |
| `FieldEncryptionConfig` | `enabled`, `lockedAt?`, `algorithm?`, `authorisedRoles?` |

**TD-07 Applied:** `validateOn` lives ONLY on `FormSettings` — NOT on `BaseComponentSchema`.

**Acceptance Criteria:**
- [ ] All discriminated unions compile: `type` narrows correctly in switch
- [ ] `EMPTY_FORM_SCHEMA` factory creates valid default schema
- [ ] No `any` types in public API surface

### 1.3 Injection Tokens & Config

```
src/lib/tokens/
├── builder-components.token.ts   ← BUILDER_COMPONENTS InjectionToken (multi)
└── builder-config.token.ts       ← BUILDER_CONFIG InjectionToken
```

```typescript
export interface BuilderConfig {
  historyDebounceMs: number;      // default: 500
  maxHistorySize: number;          // default: 100
  allowCustomJs: boolean;          // default: false — CSP guard
  enabledCategories?: string[];    // restrict palette categories
}
```

### 1.4 Component Registry

```
src/lib/registry/
└── builder-registry.service.ts
```

- Collects `BUILDER_COMPONENTS` multi-token, deduplicates by `type`, groups by `category`, sorts by `weight`
- Warns (not throws) on duplicate types
- `getByType(type)`, `getGrouped()`, `getAllTypes()`

**Built-in descriptors to implement** (in `src/lib/built-in-components/`):

| Category | Descriptors |
|---|---|
| `basic` | `text-input`, `email`, `password`, `tel`, `number`, `textarea`, `select`, `dropdown`, `combobox`, `checkbox`, `radio` |
| `advanced` | `checkbox-group`, `radio-group`, `date`, `time`, `datetime-local`, `hidden`, `content`, `divider`, `button`, `submit` |
| `layout` | `panel`, `columns`, `tabs`, `fieldset`, `repeater` |

**Acceptance Criteria:**
- [ ] `BuilderRegistryService` injects all 23 built-in descriptors
- [ ] `getGrouped()` returns correct 3-category map
- [ ] Test: custom descriptor registered via DI appears in registry

### 1.5 Validation Rule Engine

```
src/lib/validation/
├── rule-engine.ts             ← evaluate(rules, value, formData) → ValidationResult
├── rule-evaluators.ts         ← one evaluator per RuleDescriptor type
├── conditional-evaluator.ts   ← evaluateConditional(rule, formData) → boolean
└── rule-engine.spec.ts        ← 100% function coverage
```

**Built-in evaluators:**

| Evaluator | Notes |
|---|---|
| `required` | Handles empty string, null, undefined, empty array |
| `minLength` / `maxLength` | String length; array length for multi-value |
| `min` / `max` | Numeric comparison |
| `pattern` | RegExp test; must not use `eval` |
| `email` | RFC-compliant regex (not native input validation) |
| `url` | `URL` constructor validation |
| `integer` | `Number.isInteger()` |
| `json-logic` | `json-logic-js` wrapper |
| `custom-js` | Gated by `allowCustomJs: false` — throws if disabled |

**Acceptance Criteria:**
- [ ] `npx nx test form-builder` passes with 100% rule engine coverage
- [ ] `evaluate()` returns `{ valid: true }` or `{ valid: false, message: string }`
- [ ] Default messages support `{{value}}` interpolation
- [ ] `custom-js` evaluator throws `CustomJsDisabledError` when `allowCustomJs` is false

---

## Phase 2 — Canvas & Drag-and-Drop
### `libs/form-builder` | Weeks 3–4

> **Goal:** Palette → canvas drag works end-to-end. Flat schema updates. Key auto-generation.
>
> **Status: ✅ Complete** — DnD fully wired. `PaletteDropData | CanvasDropData` typed union. `DynamicElementDirective` applies `canvasProps()`. All canvas components built.

### 2.1 Core Services

```
src/lib/services/
├── form-schema.service.ts          ← Signal<FormSchema> + CRUD mutations
├── builder-state.service.ts        ← activeNodeId, isDragging, previewMode (Signals)
├── dnd.service.ts                  ← @atlaskit/pragmatic-drag-and-drop coordinator
├── key-generator.service.ts        ← labelToKey() + deduplicateKey()
└── history.service.ts              ← @vi/state-fp undo/redo (Placeholder — full in Phase 3)
```

**`FormSchemaService` mutations (all immutable / snapshot-based):**
- `addComponent(parentId, index, descriptorType)` → new node with auto-generated `id` + `key`
- `removeComponent(nodeId)`
- `moveComponent(nodeId, targetParentId, targetIndex)`
- `patchComponent(nodeId, patch: Partial<ComponentSchema>)`
- `duplicateComponent(nodeId)` → clone with suffixed `key`
- `isDescendant(nodeId, targetId)` → cycle prevention
- `isKeyUnique(key, excludeNodeId)`
- `getNode(nodeId)`

**`KeyGeneratorService`:**
- `labelToKey('First Name')` → `'firstName'` (camelCase)
- `deduplicateKey('firstName', existingKeys)` → `'firstName1'`, `'firstName2'`, ...

**`DndService` — Two-scenario model:**
```
SCENARIO A: palette → canvas (COPY)
  payload: { source: 'palette', descriptorType }
  effect:  FormSchemaService.addComponent(...)

SCENARIO B: canvas ↔ canvas (MOVE)
  payload: { source: 'canvas', nodeId, parentId, index }
  effect:  FormSchemaService.moveComponent(...)
```

Cycle prevention: `canDrop({ source }) → !isDescendant(nodeId, targetParentId)`

### 2.2 Angular Components

```
src/lib/
├── builder/
│   └── form-builder.component.ts        ← 3-column host shell
├── palette/
│   ├── palette.component.ts             ← Left panel, groups from registry
│   ├── palette-search.component.ts      ← Filter input
│   ├── palette-group.component.ts       ← Collapsible category
│   └── palette-item.component.ts        ← Draggable tile (DnD integration)
└── canvas/
    ├── canvas.component.ts              ← Center, root drop container
    ├── canvas-empty-state.component.ts  ← "Drag a field here" illustrated prompt
    ├── canvas-form-title.component.ts   ← Inline editable form title
    ├── canvas-node.component.ts         ← Recursive, renders <vi-*> + overlay
    ├── canvas-node-overlay.component.ts ← Select / Duplicate / Delete / Drag handle
    └── canvas-drop-zone.component.ts    ← Between-node animated drop target
```

**`CanvasNodeComponent` renders Lit CEs:**
```html
<vi-input
  [attr.placeholder]="node.placeholder ?? null"
  [attr.disabled]="isDragging() ? '' : null"
  [attr.value]="node.defaultValue ?? null"
/>
```

**DnD CSS states (host class-based, no Angular CDK):**
```scss
:host(.is-dragging) vi-canvas-drop-zone { opacity: 1; pointer-events: all; }
:host(.is-dragging) .canvas-node__content { pointer-events: none; }
.drop-zone.is-active::after { /* animated 2px line */ }
.canvas-node.is-being-dragged { opacity: 0.4; }
.canvas-node.is-selected { outline: 2px solid var(--color-primary); }
```

**Drag ghost:** Custom native drag preview via `setCustomNativeDragPreview` — icon + label; palette drag shows "copy" ghost.

### Acceptance Criteria (Phase 2)
- [ ] Drag `text-input` from palette → canvas → `FormSchema.components` gains new node
- [ ] Auto-generated `key` = camelCase from label; de-duplicates on collision
- [ ] Canvas renders `<vi-input>` with correct attributes from `ComponentDescriptor.canvasProps()`
- [ ] Reorder two canvas nodes — schema array order updates correctly
- [ ] Palette search filters components by typing (case-insensitive)
- [ ] Empty canvas state shows illustrated prompt until first drop
- [ ] `isDragging` signal disables pointer events on canvas node content
- [ ] Cycle prevention: dropping Panel inside itself is rejected

---

## Phase 3 — Properties Panel & History
### `libs/form-builder` | Weeks 5–6

> **Goal:** Selecting a node opens its settings. Edits update schema live. Undo/redo works. JSON view + duplicate land here.
>
> **Status: ✅ Complete** — `HistoryService` (signal-reactive, debounced). `PropertiesPanelComponent` + `SettingsTabComponent` + `SettingsFieldComponent`. `BuilderToolbarComponent` (undo/redo/save). `schemaChange` output on `FormBuilderComponent`. `duplicateComponent()` self-contained in `FormSchemaService`.

### 3.1 History Service

```
src/lib/services/
└── history.service.ts
```

- Wraps `@vi/state-fp` — `past[]` and `future[]` snapshot stacks
- `undo()` / `redo()` → signals new schema
- `canUndo: Signal<boolean>`, `canRedo: Signal<boolean>`
- **Debounce:** coalescences rapid `patchComponent()` calls within `historyDebounceMs` (default 500ms)
- **Max size:** drops oldest snapshot when stack exceeds `maxHistorySize` (default 100)

### 3.2 Properties Panel

```
src/lib/properties/
├── properties-panel.component.ts            ← Right panel; driven by selected node
├── form-settings-panel.component.ts         ← Form-level settings (when no node selected)
├── settings-tab.component.ts               ← Renders one SettingsTab
├── settings-field.component.ts             ← Switch on SettingsField.type
├── settings-host.component.ts              ← Dynamic host for custom settingsComponent
├── validation-rules-editor.component.ts   ← Add / edit / remove / reorder rules
├── conditional-editor.component.ts         ← Simple + JSON Logic conditional builder
└── rule-row.component.ts                   ← Single rule display row
```

**`SettingsPanelComponent` behavior:**
- Shows `FormSettingsPanelComponent` when no node is selected (clicking empty canvas)
- Shows field settings when a canvas node is selected
- Key field: auto-generated value shown; editing validates uniqueness inline
- Label → canvas update debounced 300ms (separate from history debounce)

**`FormSettingsPanelComponent` editable fields:**
- Form title, description, display mode, `validateOn`, `maxWidth`, submit/cancel button labels, `successMessage`, `successRedirectUrl`

**Lazy-loading custom settings:**
```html
@defer (when settingsComponentType()) {
  <ng-container [ngComponentOutlet]="settingsComponentType()" />
} @placeholder {
  <vi-form-builder-settings-skeleton />
}
```

### 3.3 Schema Validator Service

```
src/lib/services/
└── schema-validator.service.ts    ← validateSchema(schema, registry): SchemaValidationError[]
```

**Error codes:**

| Code | Condition |
|---|---|
| `DUPLICATE_KEY` | Two fields share the same `key` |
| `DUPLICATE_ID` | Two nodes share the same `id` |
| `EMPTY_KEY` | Field component has no `key` |
| `INVALID_KEY_FORMAT` | `key` is not camelCase |
| `UNKNOWN_TYPE` | `type` not in registry |
| `ORPHANED_CONDITIONAL` | `conditional.when` references a non-existent `key` |
| `ORPHANED_TAB_ASSIGNMENT` | Tab assignment references missing tab ID |
| `ORPHANED_COL_ASSIGNMENT` | Column assignment references invalid column index |
| `INVALID_COLUMN_INDEX` | Column index out of range for columns config |

### 3.4 Toolbar & JSON View

```
src/lib/toolbar/
└── builder-toolbar.component.ts   ← [Undo] [Redo] [Preview] [JSON] [Save]

src/lib/json-view/
└── schema-json-view.component.ts  ← Modal/overlay; raw schema JSON + import
```

**JSON View:** CDK Overlay; shows read-only JSON; allows paste-to-import with `validateSchema()` guard.

### Acceptance Criteria (Phase 3)
- [ ] Click `<vi-input>` on canvas → properties panel shows label, placeholder, key fields
- [ ] Key field shows auto-generated value; inline uniqueness validation on change
- [ ] Typing in label → canvas updates (debounced 300ms); history snapshot after 500ms idle
- [ ] Undo → previous label restored; redo → re-applies
- [ ] Clicking empty canvas → right panel switches to Form Settings panel
- [ ] Duplicate on overlay → clone appears below with `key + 1` suffix
- [ ] JSON button → modal shows raw schema; can be imported back
- [ ] `SchemaValidatorService.validateSchema()` detects all 9 error codes

---

## Phase 4 — Layout Components (Recursive Nesting)
### `libs/form-builder` | Weeks 7–8

> **Goal:** Full recursive nesting — panels, columns, tabs, fieldset, repeater. Drop zones inside containers.

### 4.1 Canvas Container Component

```
src/lib/canvas/
└── canvas-container.component.ts   ← Layout node children with per-column/tab zone sets
```

**Renders children + per-zone drop zone sets for:**
- **Panel** — single drop zone list inside the panel border
- **Columns** — per-column independent drop zone list
- **Tabs** — active tab's drop zone list; tab-hover timer (500ms) switches active tab
- **Fieldset** — styled panel with `<fieldset>/<legend>` HTML semantics
- **Repeater** — fixed-structure repeating group (NOT `isRepeating` field flag)

### 4.2 Built-in Layout Descriptors

```
src/lib/built-in-components/
├── panel.descriptor.ts
├── columns.descriptor.ts        ← columnAssignments map on container
├── tabs.descriptor.ts           ← tabAssignments map on container
├── fieldset.descriptor.ts
└── repeater.descriptor.ts
```

**Schema for Columns:**
```typescript
export interface ColumnsConfig {
  columns: number;                          // default: 2
  columnWidths?: string[];                   // CSS: ['30%', '70%']
  columnAssignments: Record<string, number>; // nodeId → columnIndex
}
```

**Schema for Tabs:**
```typescript
export interface TabsConfig {
  tabs: { id: string; label: string }[];
  tabAssignments: Record<string, string>;    // nodeId → tabId
}
```

### 4.3 Canvas Breadcrumb

```
src/lib/canvas/
└── canvas-breadcrumb.component.ts   ← Shows nesting path: Panel › Columns › Text Field
```

### 4.4 Repeating Field (`isRepeating` — field-level)

`isRepeating: true` on `BaseComponentSchema` (separate from `RepeaterConfig`):
- Rendered in builder: shows `[+]` indicator and `[×]` when count > 1
- Canvas shows `minRepeat` instances
- Canvas properties panel: exposes `isRepeating`, `minRepeat`, `maxRepeat`, `addLabel`

**Required indicator:** `*` shown on canvas nodes that have a `required` ValidationRule.

### Acceptance Criteria (Phase 4)
- [ ] Drop Panel onto canvas → drop zones appear inside it
- [ ] Drop `vi-input` into panel → schema nests it under panel's `components[]`
- [ ] Drop Panel into Panel (3 levels deep) → works; no cycle bug
- [ ] Columns: 2-column grid; each column has independent drop zones; `columnAssignments` updated on drop
- [ ] Tabs: `tabAssignments` map updated when dragging between tabs; tab-hover-to-switch works
- [ ] Breadcrumb shows correct path when editing 3 levels deep
- [ ] Required indicator `*` shows on fields with `required` rule
- [ ] `SchemaValidatorService` detects `ORPHANED_COL_ASSIGNMENT` and `ORPHANED_TAB_ASSIGNMENT`
- [ ] Repeating field: `isRepeating: true` shown with `+` affordance on canvas

---

## Phase 5 — Validation & Conditionals
### `libs/form-builder` | Weeks 9–10

> **Goal:** Validation rules editable in properties panel. Conditional visibility works in preview.

> **Architecture (decided 2026-05-29):** Validation uses `ValidationEngine` (Angular `@Injectable()`) with `json-logic-js`. Custom validators via `provideValidation()` from `@vialiq/form-validator-sdk`. See [form-builder-validation.md](file:///Users/prashantgupta/code/nx/docs/form-builder-validation.md) §20 for full implementation spec.

### 5.1 Validation Rules Editor

**`ValidationRulesEditorComponent`:**
- Add / remove / reorder validation rules per field
- Each rule row: rule type dropdown, params fields (depends on rule type), custom message input
- Rule types exposed: `required`, `minLength`, `maxLength`, `min`, `max`, `pattern`, `email`, `url`, `integer`, `json-logic`
- `json-logic` rule: JSON editor with live parse validation (highlight syntax errors)
- `custom-js` rule: only shown if `BUILDER_CONFIG.allowCustomJs = true`

### 5.2 Conditional Visibility Editor

**`ConditionalEditorComponent`:**
- **Simple mode:** "Show this field when [field key] [operator] [value]"
  - Operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `contains`, `notContains`
  - Field key dropdown populated from `FormSchemaService.schema().components` (all keyed fields)
- **Advanced mode:** raw JSON Logic editor (same as validation rule editor)
- Toggle between modes; simple → JSON Logic conversion is automatic; reverse requires confirmation

### 5.3 Preview Mode with Live Validation

`FormBuilderComponent` preview toggle:
- Switches to `FormPreviewComponent`
- v1: simplified Angular preview renderer in `libs/form-builder`
- Runs `ValidationEngine` on field change/blur per `validateOn` setting
- Shows/hides fields based on `conditional` rules in real time
- Submit button triggers full validation pass

**Note:** Preview is replaced by the full `FormRendererComponent` in v2.

### 5.4 Custom Validator SDK (TD-12)

> **Prerequisite for Phase 5:** Must be built and wired in.

```
@vialiq/form-validator-sdk    ← separate npm package (libs/form-validator-sdk)
├── types.ts                  ← ValidatorFn, ValidatorResult, ValidatorContext
├── helpers.ts                ← pass(), fail()
├── tokens.ts                 ← CUSTOM_VALIDATOR_REGISTRY, STUDY_METADATA
└── testing/
    └── runner.ts             ← runValidator() test helper
```

**Registration pattern:**
```typescript
// In host app:
providers: [
  provideValidation({
    customValidators: {
      nhsNumber: nhsNumberValidator,
      scoreRange: scoreRangeValidatorFactory({ min: 0, max: 10 }),
    }
  })
]
```

**Wire in `ValidationEngine`:**
```typescript
inject(CUSTOM_VALIDATOR_REGISTRY, { optional: true })
// Pass meta = inject(STUDY_METADATA, { optional: true })
```

### Acceptance Criteria (Phase 5)
- [ ] Add `required` rule to `text-input` → `validation[]` in schema contains `{ type: 'required' }`
- [ ] Toggle preview → empty required field shows error via `<vi-input>` validity mixin
- [ ] `validateOn: 'onBlur'` — error shows only after field blur (not while typing)
- [ ] Add simple conditional → field hides/shows based on another field's value in preview
- [ ] JSON Logic conditional editor parses and saves complex rule
- [ ] Custom validator `nhsNumber` registered via `provideValidation()` runs correctly in preview
- [ ] `custom-js` evaluator disabled by default; enabling requires explicit `allowCustomJs: true`

---

## Phase 6 — `<vi-drawer>` & Accessibility
### `libs/web-components` + `libs/form-builder` | Weeks 11–12

> **Goal:** Sidebar mode with `<vi-drawer>`. Keyboard DnD. ARIA. WCAG 2.1 AA compliance.

### 6.1 `<vi-drawer>` Lit Component

```
libs/web-components/src/drawer/
├── vi-drawer.ts
└── vi-drawer.spec.ts
```

**API:**

| Feature | Detail |
|---|---|
| `open` | Boolean attribute + property |
| Slots | `header`, `default` (content), `footer` |
| Events | `vialiq-drawer-open`, `vialiq-drawer-close` |
| CSS parts | `backdrop`, `panel`, `header`, `content`, `footer` |
| CSS custom properties | `--vi-drawer-width` (default: `320px`), `--vi-drawer-z-index` |
| Keyboard | `Escape` closes |
| Focus trap | Uses `focus-trap-mixin` on open |
| ARIA | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Animation | slide-in from right, backdrop fade |
| `prefers-reduced-motion` | animation disabled |

### 6.2 Responsive Drawer Integration

`FormBuilderComponent` responsive collapse:
- Desktop (≥1024px): properties panel in right-hand column
- Narrower viewport: CDK `DomPortal` projects `PropertiesPanelComponent` into `<vi-drawer>` slot

```html
<vi-drawer [open]="propertiesPanelOpen()">
  <span slot="header">Properties</span>
  <!-- CDK Portal target -->
</vi-drawer>
```

### 6.3 Keyboard DnD (`KeyboardDndService`)

```
src/lib/services/
└── keyboard-dnd.service.ts
```

**Controls (on focused drag handle):**
- `Space` / `Enter` → **pick up** node (enter keyboard DnD mode)
- `↑` / `↓` → move node up/down within container
- `→` → move into adjacent container
- `←` → move out to parent level
- `Space` / `Enter` → **drop** at current position
- `Escape` → **cancel** (schema not mutated)

Calls same `FormSchemaService.moveComponent()` as mouse DnD. Independent of `@atlaskit/pragmatic-drag-and-drop`.

### 6.4 ARIA Live Region

Visually hidden `aria-live="assertive"` region announces:
- "Picked up Text Field. Current position: 2 of 5."
- "Moved Text Field to position 1 of 5."
- "Dropped Text Field at position 1."
- "Cancelled. Text Field returned to position 2."

### Acceptance Criteria (Phase 6)
- [ ] On narrow viewport, properties panel opens in `<vi-drawer>` slide-in
- [ ] `Escape` closes drawer; focus returns to previously focused element
- [ ] Focus trapped inside open drawer
- [ ] `Space` on drag handle enters keyboard DnD mode; arrow keys move node
- [ ] Screen reader announces drag state via ARIA live region
- [ ] WAVE / axe: zero errors on full builder page
- [ ] `<vi-drawer>` WDIO: open/close, focus trap, keyboard `Escape`
- [ ] `prefers-reduced-motion`: DnD animations and drawer animation suppressed

---

## Phase 7 — Polish & Release (v1.0 GA)
### All libraries | Weeks 13–14

> **Goal:** Full test pass, Storybook, documentation, published.

### 7.1 Testing

| Layer | Tool | Target |
|---|---|---|
| Unit — pure functions | Vitest | 100% rule engine coverage |
| Unit — schema mutations | Vitest | All `FormSchemaService` methods |
| Unit — registry | Vitest | Descriptor resolution, grouping |
| Unit — history | Vitest | Undo/redo stack operations |
| Unit — Angular components | Vitest + `@testing-library/angular` | Palette, Canvas, Properties |
| Unit — web components | WDIO | `<vi-drawer>`, `<vi-date-picker>` |
| Integration — DnD | Playwright component tests | Palette drop, canvas reorder, nested |
| E2E | Playwright | Full builder hosted in test Nx app |

**Key integration scenarios:**
1. Drag `text-input` → canvas → schema contains new node with auto-generated key
2. Reorder canvas nodes → schema array order correct
3. Drop into nested panel → child in correct `components[]`
4. Edit label in properties → schema and canvas update same tick
5. Undo after add → node removed; undo after edit → property reverted
6. Custom descriptor via DI → appears in palette, drops correctly
7. Touch DnD: iOS Safari + Android Chrome tested

### 7.2 Storybook

Shared Storybook instance (existing web-components Storybook + `form-builder/` prefix):
- `form-builder/Basic Form` — all 23 built-in components on canvas
- `form-builder/Custom Component` — custom descriptor via `BUILDER_COMPONENTS` DI
- `form-builder/Load Existing Schema` — pre-populated `[schema]` input
- `form-builder/Preview Mode` — toggle preview; validation in action
- `form-builder/Validation Rules` — required, pattern, JSON Logic rules
- `form-builder/Layout Nesting` — 3-level deep panel/columns/tabs
- `form-builder/Keyboard DnD` — accessibility demo

### 7.3 Documentation

- README with quick-start guide, peer dep table, Angular DI setup
- JSDoc on all public API: types, tokens, service methods, component inputs/outputs
- i18n Action Item: schedule Angular i18n planning session before any non-English market usage

### 7.4 Publishing

```bash
npx nx release form-builder   # tags v1.0.0
```

**Pre-release checklist:**
- [ ] All unit tests pass (`npx nx test form-builder`)
- [ ] All Playwright integration tests pass
- [ ] Storybook deployed and accessible
- [ ] `npx nx build form-builder` zero warnings
- [ ] Bundle analyzed (`--analyze`): core < 50 KB gzipped
- [ ] `prefers-reduced-motion` verified on DnD + drawer animations
- [ ] Touch DnD tested: iOS Safari, Android Chrome
- [ ] WCAG 2.1 AA: WAVE/axe zero errors

---

## Phase 8 — Form Renderer (`@vi/form-renderer`, v2)
### `libs/form-renderer` | Post v1.0

> **Goal:** `FormRendererComponent` — takes `FormSchema`, renders interactive, accessible, submit-ready HTML form.

### 8.1 Library Setup

```
libs/form-renderer/
├── project.json               ← @vi/form-renderer
└── src/lib/
    ├── form-renderer.component.ts         ← Angular 21 standalone, OnPush, Emulated encap
    ├── form-preview.component.ts          ← Replaces Phase 5 simplified preview
    ├── field-state.service.ts             ← Signal<Map<key, FieldState>> — single source of truth
    ├── validation-engine.service.ts       ← Injectable; runs rule engine + custom validators
    ├── codelist-store.service.ts          ← CodelistStore (Signal<Map<name, CodelistItem[]>>)
    └── renderer-wrappers/
        ├── vi-renderer-input.component.ts
        ├── vi-renderer-select.component.ts
        ├── vi-renderer-combobox.component.ts
        ├── vi-renderer-dropdown.component.ts
        ├── vi-renderer-checkbox.component.ts
        ├── vi-renderer-radio.component.ts
        ├── vi-renderer-checkbox-group.component.ts
        ├── vi-renderer-radio-group.component.ts
        ├── vi-renderer-date.component.ts
        ├── vi-renderer-textarea.component.ts
        ├── vi-renderer-columns.component.ts
        ├── vi-renderer-panel.component.ts
        ├── vi-renderer-tabs.component.ts
        ├── vi-renderer-repeating-field.component.ts
        └── vi-renderer-actions.component.ts
```

### 8.2 `FieldStateService`

Central Signal-based state store. One entry per field key:
```typescript
interface FieldState {
  value: unknown;
  touched: boolean;
  dirty: boolean;
  errors: ValidationError[];      // SYSTEM_VALIDATION
  serverErrors: ValidationError[]; // from ServerValidationError[]
  isVisible: boolean;             // conditional result
  isReadonly: boolean;            // permission bitmask result
}
```

### 8.3 `ValidationEngine`

- Runs `evaluate(rules, value, formData)` per `validateOn` setting
- `runForDataEntry()` — skipped when `isReadonly = true`
- `runForSubmit()` — full pass on all visible fields
- Wires `CUSTOM_VALIDATOR_REGISTRY` → custom validators from `@vialiq/form-validator-sdk`
- Wires `STUDY_METADATA` token → passes as `meta` arg to all validators

### 8.4 Codelist Architecture

> ⛔ **BLOCKED until multilingual i18n design is finalized**
> ⛔ **BLOCKED until platform-wide versioning design is finalized**

Pre-fetch strategy at `FormRendererComponent.ngOnInit()`:
1. Scan schema for unique codelist names
2. `GET {CODELIST_CONFIG.endpoint}/{name}` in parallel (one per name)
3. Store in `CodelistStore` (Signal)
4. Each `vi-renderer-*` reads synchronously from store

Auth: Angular `HttpInterceptor` chain (no tokens in schema).
Error handling: individual failures isolated; failed codelist → empty options + inline error state.

### 8.5 FormRendererComponent API

```typescript
@Component({ selector: 'vi-form-renderer', ... })
export class FormRendererComponent {
  @Input({ required: true }) schema!: FormSchema;
  @Input() permissions: number = FormPermission.READ | FormPermission.WRITE;

  @Output() formChange: OutputEmitterRef<FormData>;
  @Output() formValidate: OutputEmitterRef<ValidationResult[]>;
  @Output() formSubmit: OutputEmitterRef<FormData>;
  @Output() formError: OutputEmitterRef<ServerValidationError[]>;
  @Output() formReset: OutputEmitterRef<void>;
  @Output() formCancel: OutputEmitterRef<void>;
}
```

**InjectionTokens (host must provide):**
- `FORM_DATA_SERVICE` — `getInitialData()`, `onFieldChange?()`, `onSubmit()`, `onReset?()`
- `CODELIST_CONFIG` — `{ endpoint: string }`

**InjectionTokens (optional):**
- `CUSTOM_VALIDATOR_REGISTRY` — study-specific validators
- `STUDY_METADATA` — `StudyMeta` (provided by product layer)
- `CODELIST_SERVICE` — override default REST implementation

### 8.6 Read-Only Mode (TD-06 Resolution)

- `FormRendererComponent` receives `@Input() permissions: number`
- Provides `RENDERER_PERMISSIONS: Signal<number>` scoped to component
- Each `vi-renderer-*` reads `isReadonly = computed(() => !(permissions() & FormPermission.WRITE))`
- Binds `[readonly]` to Lit CE (which must implement `readonly` — resolved in Phase 0)
- `vi-renderer-actions` hides Save/Submit/Reset in readonly mode
- SYSTEM_VALIDATION errors still displayed in readonly mode (CDM review)

### Acceptance Criteria (Phase 8)
- [ ] `<vi-form-renderer [schema]="schema">` renders all field types correctly
- [ ] Pre-populated data from `FORM_DATA_SERVICE.getInitialData()` fills fields
- [ ] Submit → `ValidationEngine` runs full pass → `formSubmit` emits data or shows field errors
- [ ] Server `ServerValidationError[]` → propagates to individual field components
- [ ] `permissions` without WRITE bit → entire form renders in readonly text presentation
- [ ] Conditional visibility: hidden field absent from submission payload
- [ ] Codelist fields: options fetched in parallel before form renders (no per-field spinner)
- [ ] Custom validators from `provideValidation()` run as first-class validators

---

## Phase 9 — Platform Compliance (v2.1 / Platform Phase 3)
### Multiple libraries | Post v2 Renderer

> **Decision (2026-05-24):** All Phase 3 items are runtime-injected. Zero rebuild/redeploy required. Architecture via second microfrontend or `InjectionToken` + Module Federation.

### P3.1 Audit Trail

- `AUDIT_TRAIL_SERVICE` `InjectionToken` — host provides; renderer calls on every field change
- Records: who changed, when, old value, new value
- **21 CFR Part 11 §11.10(e)(k)(2)** compliance — time-stamped, computer-generated, user-attributable
- Full architecture session required (event-sourced log, Module Federation remote)

### P3.2 Query Management (EDC Queries)

- `QUERY_SERVICE` `InjectionToken` — host provides; separate microfrontend manages lifecycle
- Renderer displays EC_QUERY records alongside fields (distinct icon/colour from SYSTEM_VALIDATION)
- Query lifecycle: `Open → Answered → Closed / Cancelled`
- Site investigator inline response workflow (text box per query)
- **TD-13 Resolution:** Architecture session required; EC engine is backend concern

### P3.3 Reason for Change

- Triggered by `AUDIT_TRAIL_SERVICE` intercepting `valueChange` on previously-submitted fields
- Dialog: reason input (e.g. "Transcription error", "New information received")
- Deferred to P3 audit trail session

### P3.4 `<vi-signature>` Web Component

- Canvas-based freehand signature capture (stylus, finger, mouse)
- Output format: `SVG` (default) or `PNG`
- `clear()` method + built-in clear button
- `value` property + `internals.setFormValue()` (form-associated)
- `vi-signature-change` event on stroke end
- `isEmpty` property (all pixels transparent = true)
- Device matrix: iPad/Apple Pencil pressure, Wacom pad, Windows tablet — **to be confirmed in P3**
- **Note:** `<vi-signature>` captures ink only — NOT 21 CFR Part 11 §11.50 compliant on its own. Signature workflow (attribution, authentication challenge) is host-app responsibility.

---

## Phase 10 — Persistence, Versioning & Scale (Platform Phase 4)
### Multiple libraries | Long-term backlog

### P4.1 Form / Study Versioning (TD-10)

- Protocol amendments mid-study → `MigrationRegistry`
- `schemaVersion` upgrade path: `{ from: '1', to: '2', migrate: (schema) => newSchema }`
- Per-subject schema-version binding
- **Separate design session required**

### P4.2 Draft Persistence (TD-08)

- `saveState` button action on `ButtonComponentSchema`
- Options: server-side draft API vs client-side IndexedDB vs hybrid
- Session/user binding + expiry policy
- See [form-builder-offline.md](file:///Users/prashantgupta/code/nx/docs/form-builder-offline.md) §12 for open questions

### P4.3 Offline / Disconnected Mode (TD-09)

- Full offline: load form, capture data, submit on reconnect
- Service worker strategy, IndexedDB schema, conflict resolution
- Reference: [form-builder-offline.md](file:///Users/prashantgupta/code/nx/docs/form-builder-offline.md)

### P4.4 Multilingual / i18n (TD-11)

- `CodelistItem.value` locale-aware
- Validation messages multilingual: `Record<ruleId, Record<locale, string>>`
- Builder: locale switcher in validation message editor
- Angular full i18n pipeline (inclination noted in roadmap)
- **⛔ Design session required before any implementation**

---

## Deferred / Backlog Features

| Feature | Target | Notes |
|---|---|---|
| Wizard mode (`display: 'wizard'`) | v2+ | Multi-page; `BuilderToolbarComponent` gains page nav |
| Form Template Library | v2+ | Save subtree as named template; Templates palette category |
| Visual Conditional Builder | v2+ | WYSIWYG rule editor replacing raw JSON Logic |
| Sub-Form (`SubFormComponentSchema`) | v2+ | Embedded saved schemas; `FORM_CATALOG_SERVICE` |
| `<vi-file-upload>` (TD-01) | Post v1 | `FILE_UPLOAD_ADAPTER` `InjectionToken`; storage strategy TBD |
| Cascading Codelists (TD-03) | v2 Renderer | `dependsOn` on `CodelistOptionSource` |
| Option Template WYSIWYG (v2 NodeOptionTemplate) | v2+ | Visual JSON node tree builder for option display |
| Schema Architecture Redesign (TD-02) | Pre v2 (breaking) | Separate DataSchema + LayoutSchema; full design session |
| Angular Elements wrapper (`<vi-form>`) | v2.1 | `@vi/form-renderer/elements` cross-framework CE |
| `@vi/form-builder-core` extraction | v3 | Framework-agnostic core; React/Vue adapter shells |
| MedDRA / WHODrug | Out of scope | Separate architecture + licensed data |
| Real-time collaboration | Future | CRDT/OT on schema — separate feasibility study |
| PDF export (`display: 'pdf'`) | v2+ | |

---

## Technical Debt Tracking

| ID | Title | Priority | Phase | Status |
|---|---|---|---|---|
| TD-01 | File Upload | 🟡 Medium | Post v1 | Open |
| TD-02 | Schema Architecture Redesign | 🔴 High | Pre v2 | Open |
| TD-03 | Cascading Codelists | 🟡 Medium | v2 Renderer | Open |
| TD-04 | Field Runtime Status | 🟡 Medium | Phase 9 | Open (by design) |
| TD-05 | Visit / Subject Context | 🔵 Low | Product layer | Open (by design) |
| **TD-06** | **Read-Only Form Mode** | **🔴 High** | **Phase 0 + Phase 8** | **In Design — Phase 0 starts** |
| TD-07 | validateOn Form-Level Only | 🟡 Medium | Phase 1 | Decision made — apply in Phase 1 types |
| TD-08 | saveState / Draft Persistence | 🟡 Medium | Phase 10 | Open |
| TD-09 | Offline Mode | 🟡 Medium | Phase 10 | Open |
| TD-10 | Form / Study Versioning | 🟡 Medium | Phase 10 | Open |
| TD-11 | Multilingual Validation Messages | 🟡 Medium | Phase 10 | Open (by design) |
| **TD-12** | **Custom Validator SDK** | **🔴 High** | **Phase 5** | **Docs written — SDK to build** |
| **TD-13** | **EC Queries & Custom Programming** | **🔴 High** | **Phase 9** | **Open — design pending** |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Angular CDK version mismatch | Medium | High | Pin CDK to same minor as Angular 21; peer dep range |
| pragmatic-drag-and-drop API change | Low | Medium | Encapsulate behind `DndService`; adapter pattern |
| Recursive drop nesting bugs | **High** | **High** | Dedicated Playwright tests for 3-level nesting; cycle guard from day 1 |
| `<vi-*>` web components not available for canvas | Medium | High | `CanvasNodeComponent` falls back to placeholder tile |
| `new Function()` CSP violation | High | Medium | `custom-js` off by default; document CSP requirement |
| `@vi/state-fp` API compatibility | Low | Medium | Wrap in `HistoryService`; isolate from public API |
| Bundle size growth | Medium | Low | Monitor with `--analyze`; lazy-load settings components |
| Codelist i18n/versioning blocker | High | High | Do NOT start codelist implementation until both designs are signed off |
| Multilingual design deferred too long | Medium | High | Schedule i18n planning session before v1.0 GA |

---

## Dependency Graph

```
@vi/form-renderer
  ├── @vi/form-builder           (shared types, rule engine)
  ├── @angular/core ^21
  ├── @angular/cdk ^21
  ├── @vialiq/web-components     (vi-input, vi-select, vi-drawer, vi-date-picker…)
  └── @vialiq/form-validator-sdk (custom validator SDK)

@vi/form-builder
  ├── @angular/core ^21
  ├── @angular/cdk ^21           (Overlay, Portal, FocusTrap — NOT DnD)
  ├── @atlaskit/pragmatic-drag-and-drop ~1.x
  ├── @atlaskit/pragmatic-drag-and-drop-hitbox ~1.x
  ├── @vialiq/web-components ^0.1
  ├── @vi/state-fp               (HistoryService undo/redo)
  ├── @vi/icons                  (icon names in descriptors)
  └── json-logic-js              (direct dep, ~3KB)

@vialiq/web-components
  └── lit ^3                     (no Angular dep — boundary enforced by Nx tags)

@vialiq/form-validator-sdk       (new — libs/form-validator-sdk)
  └── (zero dependencies by design)
```

---

## Codelist Implementation Gate

> ⛔ **The following features MUST NOT be implemented until two platform designs are finalized:**
>
> 1. **Multilingual / i18n** — `CodelistItem.value` must be locale-aware. Full architecture TBD.
> 2. **Platform-wide versioning** — Codelist versioning is part of study design + audit-trail replay design.
>
> **Unblocked today:** All layout, text input, validation, repeating field, and conditional features.
> **Blocked:** `select`, `dropdown`, `combobox` with `CodelistOptionSource`; `radio-group`, `checkbox-group`.

---

## Execution Timeline

```
Week  0-1:  Phase 0  — <vi-date-picker> + readonly on all Lit CEs
Week  1-2:  Phase 1  — Nx scaffold, type system, registry, rule engine
Week  3-4:  Phase 2  — Canvas, DnD, palette, empty state
Week  5-6:  Phase 3  — Properties panel, history, toolbar, JSON view
Week  7-8:  Phase 4  — Layout components, recursive nesting
Week  9-10: Phase 5  — Validation editor, conditionals, custom validator SDK
Week 11-12: Phase 6  — <vi-drawer>, keyboard DnD, ARIA, accessibility
Week 13-14: Phase 7  — Testing, Storybook, documentation, v1.0 GA

[PARALLEL - Schedule design sessions]:
  Before Phase 5 end: i18n architecture design session
  Before Phase 8 start: FormRenderer detailed planning
  Before Phase 9: Compliance (audit trail, queries) architecture session

Post v1.0: Phase 8  — @vi/form-renderer (FormRendererComponent)
Post v2.0: Phase 9  — Platform compliance (audit trail, queries, e-signature)
Post v3.0: Phase 10 — Persistence, versioning, offline, multilingual
```
