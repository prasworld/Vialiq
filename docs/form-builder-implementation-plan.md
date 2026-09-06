# Form Builder — Infrastructure Implementation Plan

> **Status:** 🟢 In Progress — Phases 1–3 complete, Phase 4 next  
> **Date:** 2026-09-02  
> **Author:** Antigravity × Prashant  
> **Last updated:** 2026-09-04 (Phase 2 + 3 complete; code-quality review applied)

## Progress Tracker

| Phase | Description | Status |
|---|---|---|
| **1.1** | Nx Library Scaffold — `libs/form-builder` | ✅ Complete |
| **1.2** | Type System (schema, component-schemas, layout-schemas, etc.) | ✅ Complete |
| **1.3** | Injection Tokens (`BUILDER_COMPONENTS`, `BUILDER_CONFIG`) | ✅ Complete |
| **1.4** | Component Registry (`BuilderRegistryService`) | ✅ Complete |
| **1.5** | Validation Rule Engine + 53 passing tests | ✅ Complete |
| **1.6** | Public API barrel (`src/index.ts`) | ✅ Complete |
| **1.7** | 23 Built-in Descriptors | ✅ Complete |
| **1b** | `libs/form-renderer` shell scaffold | ✅ Complete |
| **2** | Canvas & DnD | ✅ Complete |
| **3** | Properties Panel & History | ✅ Complete |
| **3-QA** | Code Quality Review — `any` elimination, typed DnD payloads, `schemaChange` output, `defineDescriptor<T>`, `groupOrder` DI, `settingsComponent: Promise<Type<unknown>>`, removed web-component bare imports from library | ✅ Complete |
| **MFE** | Web Component Lazy Registration — async IIFE in `bootstrap.ts`, `customElements.get()` guard | ✅ Complete |
| **4** | Layout Components | ⏳ Next |
| **5** | Validation & Conditionals | 🔜 Upcoming |
| **6** | `<vi-drawer>` & Accessibility | 🔜 Upcoming |
| **7** | Polish & Release v1.0 GA | 🔜 Upcoming |
| **8** | Form Renderer full implementation | 🔜 Post v1 |

---

## Architectural Vision

```
Host MFEs / Applications (multiple possible)
       ↑ each provides its own @vi/form-builder (design-time)
       ↑ each consumes @vi/form-renderer (runtime, one per app area)
┌──────────────────────────────────────────────────────────────────────┐
│  @vi/form-builder  (Angular 21, libs/form-builder)                   │
│  Visual drag-and-drop authoring → emits FormSchema (JSON)            │
│  NOTE: Multiple form-builder instances can exist per application      │
│  depending on requirements (e.g. study-level, site-level builders)   │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ FormSchema (plain JSON — portable)
┌──────────────────────────────▼───────────────────────────────────────┐
│  @vi/form-renderer  (Angular 21, libs/form-renderer)                 │
│  Reusable runtime — dropped into any MFE via Module Federation        │
│  ValidationEngine · FieldStateService · CodelistStore                │
│  NOTE: Created as a proper lib from day 1 — no future extraction debt│
└──────────────────────────────┬───────────────────────────────────────┘
                               │ hosts leaf UI atoms
┌──────────────────────────────▼───────────────────────────────────────┐
│  @vialiq/web-components  (Lit 3, libs/web-components)  ← EXISTS      │
│  <vi-input> <vi-select> <vi-date-picker> <vi-sidebar>                │
│  <vi-combobox> <vi-checkbox> <vi-radio> <vi-textarea> ...            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| **Library scaffold** | Nx `@nx/angular` generator | Handles project.json, tsconfigs, eslint wiring automatically |
| **Angular version** | 21.1.0 | Matches workspace — same version as all existing apps |
| **Change detection** | **Zoneless** (`provideExperimentalZonelessChangeDetection`) | Future-ready; avoid Zone.js debt even if not strictly required today |
| **State management** | Angular Signals only | No RxJS-heavy patterns; fits zoneless model |
| **Start point** | **Option A** — scaffold `libs/form-builder` first, then type system | Incremental; library wired into workspace before writing any code |
| **Renderer** | **Create `libs/form-renderer` from day 1** as a proper library | Avoid extraction debt later; clean separation from the start |
| **DnD** | `@atlaskit/pragmatic-drag-and-drop` | NOT Angular CDK DnD |
| **form-builder instances** | Multiple per application are valid | Each MFE can host its own builder if needed |

---

## Nx Module Boundaries

```
libs/
  form-builder/       scope:form-builder, type:lib, framework:angular
  form-renderer/      scope:form-renderer, type:lib, framework:angular
  web-components/     scope:web-components, type:lib, framework:lit
  state-fp/           scope:state-fp, type:lib, framework:agnostic

Boundary rules:
  form-builder   → can import: web-components, state-fp
  form-renderer  → can import: web-components, state-fp, form-builder (shared types only)
  web-components → CANNOT import: form-builder, form-renderer (no circular dep)
  form-builder   → CANNOT import: apps/
```

---

## Phase 0 — Web Components Prerequisite Check
### `libs/web-components` | Concurrent with Phase 1

Before Phase 1 touches the canvas, ensure all leaf components are form-builder-ready:

| Component | `readonly` support | `form-associated` | Status |
|---|---|---|---|
| `vi-input` | Required | ✅ | Check |
| `vi-textarea` | Required | ✅ | Check |
| `vi-select` | Required | ✅ | Check |
| `vi-combobox` | Required | ✅ | Check |
| `vi-checkbox` | Required | ✅ | Check |
| `vi-radio` | Required | ✅ | Check |
| `vi-date-picker` | Required | ✅ | Check |
| `vi-button` | — | — | Check |

**`FormPermission` bitmask** (already decided):
```typescript
export const enum FormPermission {
  READ     = 0b00001,
  WRITE    = 0b00010,
  VALIDATE = 0b00100,
  SIGN     = 0b01000,
  LOCK     = 0b10000,
}
```

---

## Phase 1 — Foundation
### `libs/form-builder` | Weeks 1–2

### 1.1 Nx Library Scaffold

**Command:**
```bash
npx nx g @nx/angular:library form-builder \
  --directory=libs/form-builder \
  --importPath=@vi/form-builder \
  --standalone \
  --skipModule \
  --buildable \
  --tags="scope:form-builder,type:lib,framework:angular"
```

**Generated structure:**
```
libs/form-builder/
├── project.json               ← tags: scope:form-builder, type:lib, framework:angular
├── package.json               ← @vi/form-builder v0.1.0
├── tsconfig.json
├── tsconfig.lib.json
├── tsconfig.spec.json
├── eslint.config.mjs          ← inherits workspace root boundary rules
├── vitest.config.mts
└── src/
    └── index.ts               ← locked public API barrel
```

**Peer dependencies to add:**
```json
{
  "peerDependencies": {
    "@angular/core": ">=21.0.0",
    "@angular/cdk": ">=21.0.0",
    "@vialiq/web-components": ">=0.1.0",
    "@vi/state-fp": ">=1.0.0"
  },
  "dependencies": {
    "@atlaskit/pragmatic-drag-and-drop": "^1.x",
    "@atlaskit/pragmatic-drag-and-drop-hitbox": "^1.x",
    "json-logic-js": "^2.x"
  }
}
```

**Acceptance Criteria:**
- [ ] `npx nx build form-builder` succeeds (zero errors)
- [ ] `npx nx lint form-builder` passes with boundary rules enforced

> ✅ **Completed 2026-09-02** — Library scaffolded via `@nx/angular:library` generator. Directory structure created, `package.json` updated with all peer deps and direct deps, `vitest.config.mts` added. Test target switched from `@nx/angular:unit-test` → `@nx/vitest:test`.

---

### 1.2 Complete Type System (`src/lib/types/`)

All types are **framework-agnostic TypeScript** — zero Angular imports. This is the portable contract shared between builder and renderer.

#### Files

| File | Key Types |
|---|---|
| `schema.ts` | `FormSchema`, `FormSettings`, `BaseComponentSchema`, `EMPTY_FORM_SCHEMA()` factory |
| `component-schemas.ts` | Full discriminated union of all 15+ types (see table below) |
| `option-source.ts` | `OptionSource`, `StaticOptionSource`, `CodelistOptionSource`, `CodelistItem` |
| `layout-schemas.ts` | `PanelConfig`, `ColumnsConfig`, `TabsConfig`, `FieldsetConfig`, `RepeaterConfig` |
| `component-descriptor.ts` | `ComponentDescriptor`, `SettingsSchema`, `SettingsField`, `SettingsTab` |
| `validation.ts` | `ValidationRule`, `ValidationResult`, `RuleDescriptor` discriminated union |
| `conditional.ts` | `ConditionalRule`, `SimpleConditional`, `JsonLogicConditional` |
| `errors.ts` | `SchemaValidationError`, `SchemaErrorCode` (9 codes) |
| `permissions.ts` | `FormPermission` bitmask enum |

#### Component Discriminated Union

```typescript
type ComponentSchema =
  | InputComponentSchema        // type: 'text-input' | 'email' | 'password' | 'tel' | 'number'
  | TextareaComponentSchema     // type: 'textarea'
  | SelectComponentSchema       // type: 'select'
  | ComboboxComponentSchema     // type: 'combobox'
  | CheckboxComponentSchema     // type: 'checkbox'
  | RadioComponentSchema        // type: 'radio'
  | CheckboxGroupComponentSchema// type: 'checkbox-group'
  | RadioGroupComponentSchema   // type: 'radio-group'
  | DateComponentSchema         // type: 'date' | 'time' | 'datetime-local'
  | HiddenComponentSchema       // type: 'hidden'
  | ContentComponentSchema      // type: 'content'
  | DividerComponentSchema      // type: 'divider'
  | ButtonComponentSchema       // type: 'button' | 'submit'
  | LayoutComponentSchema;      // type: 'panel' | 'columns' | 'tabs' | 'fieldset' | 'repeater'
```

**Key invariant (TD-07):** `validateOn` lives **ONLY** on `FormSettings` — NEVER on `BaseComponentSchema`.

#### `FormSchema` shape:
```typescript
interface FormSchema {
  schemaVersion: string;      // e.g. '1'
  id: string;
  title: string;
  display: 'form' | 'wizard'; // wizard is v2+
  components: ComponentSchema[];
  settings?: FormSettings;
  createdAt: string;          // ISO-8601
  updatedAt: string;
  metadata?: Record<string, unknown>;
}
```

#### `BaseComponentSchema` shape:
```typescript
interface BaseComponentSchema {
  id: string;
  type: string;
  key?: string;
  label: string;
  hidden?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  locked?: boolean;
  labelPosition?: 'top' | 'left' | 'right' | 'hidden';
  description?: string;
  validation?: ValidationRule[];
  conditional?: ConditionalRule;
  isRepeating?: boolean;
  minRepeat?: number;
  maxRepeat?: number;
  encryption?: FieldEncryptionConfig;
}
```

**Acceptance Criteria:**
- [x] All discriminated unions compile — `type` narrows correctly in switch statements
- [x] `EMPTY_FORM_SCHEMA()` factory creates a valid default schema
- [x] Zero `any` types in the public API surface

> ✅ **Completed 2026-09-02** — All 9 type files created:
> `schema.ts` · `component-schemas.ts` · `layout-schemas.ts` · `option-source.ts` · `component-descriptor.ts` · `validation.ts` · `conditional.ts` · `errors.ts` · `permissions.ts`
> Full discriminated union with 14 component schema variants. `EMPTY_FORM_SCHEMA()` uses `crypto.randomUUID()`. Tokens (`BUILDER_COMPONENTS`, `BUILDER_CONFIG`) and `BuilderRegistryService` also complete.

---

### 1.3 Injection Tokens (`src/lib/tokens/`)

```typescript
// builder-components.token.ts
export const BUILDER_COMPONENTS =
  new InjectionToken<ComponentDescriptor[]>('BUILDER_COMPONENTS');

// builder-config.token.ts
export interface BuilderConfig {
  historyDebounceMs: number;      // default: 500
  maxHistorySize: number;         // default: 100
  allowCustomJs: boolean;         // default: false — CSP guard
  enabledCategories?: string[];   // restrict palette categories
}
export const BUILDER_CONFIG =
  new InjectionToken<BuilderConfig>('BUILDER_CONFIG', {
    providedIn: null,
    factory: () => ({
      historyDebounceMs: 500,
      maxHistorySize: 100,
      allowCustomJs: false,
    })
  });
```

---

### 1.4 Component Registry (`src/lib/registry/`)

`BuilderRegistryService`:
- Injects `BUILDER_COMPONENTS` multi-token array
- Deduplicates by `type` — warns via `console.warn`, never throws
- Groups by `category`, sorts by `weight`
- `getByType(type)` → `ComponentDescriptor | undefined`
- `getGrouped()` → `Map<string, ComponentDescriptor[]>`
- `getAllTypes()` → `string[]`

---

### 1.5 Built-in Descriptors (`src/lib/built-in-components/`)

**All 23 built-in descriptors** mapping to `@vialiq/web-components` leaf elements:

| Category | Type | Canvas Element |
|---|---|---|
| `basic` | `text-input` | `vi-input` |
| `basic` | `email` | `vi-input[type=email]` |
| `basic` | `password` | `vi-input[type=password]` |
| `basic` | `tel` | `vi-input[type=tel]` |
| `basic` | `number` | `vi-input[type=number]` |
| `basic` | `textarea` | `vi-textarea` |
| `basic` | `select` | `vi-select` |
| `basic` | `combobox` | `vi-combobox` |
| `basic` | `checkbox` | `vi-checkbox` |
| `basic` | `radio` | `vi-radio` |
| `advanced` | `checkbox-group` | `vi-checkbox-group` |
| `advanced` | `radio-group` | `vi-radio-group` |
| `advanced` | `date` | `vi-date-picker[type=date]` |
| `advanced` | `time` | `vi-date-picker[type=time]` |
| `advanced` | `datetime-local` | `vi-date-picker[type=datetime-local]` |
| `advanced` | `hidden` | — (no canvas render) |
| `advanced` | `content` | `div.vi-content` |
| `advanced` | `divider` | `hr.vi-divider` |
| `advanced` | `button` | `vi-button` |
| `advanced` | `submit` | `vi-button[type=submit]` |
| `layout` | `panel` | `vi-panel` (Angular wrapper) |
| `layout` | `columns` | `vi-columns` (Angular wrapper) |
| `layout` | `tabs` | `vi-tabs` (Angular wrapper) |
| `layout` | `fieldset` | `fieldset` (native) |
| `layout` | `repeater` | `vi-repeater` (Angular wrapper) |

Each descriptor:
```typescript
interface ComponentDescriptor {
  type: string;
  label: string;
  category: 'basic' | 'advanced' | 'layout';
  icon: string;             // vi-icon name
  weight?: number;          // ordering in palette
  defaultSchema: Partial<ComponentSchema>;
  settingsSchema?: SettingsSchema;
  settingsComponent?: () => Promise<Type<unknown>>;  // lazy load
  canvasElement: string;    // custom element tag
  canvasProps: (schema: ComponentSchema) => Record<string, unknown>;
  supportsRepeating?: boolean;
  rendererRef?: string;     // vi-renderer-* component name
}
```

---

### 1.6 Validation Rule Engine (`src/lib/validation/`)

Pure functions — zero Angular, zero DI. 100% Vitest-testable in isolation.

```
src/lib/validation/
├── rule-engine.ts             ← evaluate(rules, value, formData) → ValidationResult
├── rule-evaluators.ts         ← one evaluator per RuleDescriptor type
├── conditional-evaluator.ts   ← evaluateConditional(rule, formData) → boolean
└── rule-engine.spec.ts        ← target: 100% function coverage
```

**Built-in evaluators:**

| Evaluator | Implementation Notes |
|---|---|
| `required` | Handles `''`, `null`, `undefined`, `[]` |
| `minLength` / `maxLength` | String length + array length for multi-value |
| `min` / `max` | Numeric comparison |
| `pattern` | RegExp test — no `eval` |
| `email` | RFC-compliant regex (not native) |
| `url` | `URL` constructor validation |
| `integer` | `Number.isInteger()` |
| `json-logic` | `json-logic-js` wrapper |
| `custom-js` | Gated by `allowCustomJs: false` — throws `CustomJsDisabledError` |

**API:**
```typescript
evaluate(
  rules: ValidationRule[],
  value: unknown,
  formData: Record<string, unknown>
): ValidationResult   // { valid: true } | { valid: false, message: string }
```

Default messages support `{{value}}` interpolation.

**Acceptance Criteria:**
- [x] `npx nx test form-builder` passes with 100% rule engine coverage
- [x] `evaluate()` returns correct shape
- [x] `custom-js` throws `CustomJsDisabledError` when disabled

> ✅ **Completed 2026-09-02** — **53/53 tests passing**. Rule engine covers: `required`, `minLength`, `maxLength`, `min`, `max`, `pattern` (with flags + invalid regex guard), `email`, `url`, `integer`, `json-logic`, `custom-js`. `CustomJsDisabledError` thrown correctly. `{{value}}` interpolation in custom messages working. `conditional-evaluator.ts` also complete with all 10 operators.

---

### 1.7 Public API Barrel (`src/index.ts`)

```typescript
// Components
export { FormBuilderComponent } from './lib/builder/form-builder.component';
export { FormPreviewComponent } from './lib/builder/form-preview.component';

// Tokens
export { BUILDER_COMPONENTS, BUILDER_CONFIG } from './lib/tokens';
export type { BuilderConfig } from './lib/tokens';

// Types — full public surface
export type {
  FormSchema, FormSettings, ComponentSchema,
  InputComponentSchema, TextareaComponentSchema, SelectComponentSchema,
  LayoutComponentSchema, ButtonComponentSchema,
  BaseComponentSchema, FieldEncryptionConfig,
  ComponentDescriptor, SettingsSchema, SettingsField, SettingsTab,
  ValidationRule, ValidationResult, RuleDescriptor,
  ConditionalRule, SimpleConditional, JsonLogicConditional,
  OptionSource, StaticOptionSource, CodelistOptionSource, CodelistItem,
  SchemaValidationError,
} from './lib/types';

export { SchemaErrorCode, FormPermission } from './lib/types';
export { EMPTY_FORM_SCHEMA } from './lib/types/schema';

// Services
export { BuilderRegistryService } from './lib/registry/builder-registry.service';
export { FormSchemaService } from './lib/services/form-schema.service';

// Built-in descriptors (cherry-pickable)
export { BUILT_IN_BUILDER_COMPONENTS } from './lib/built-in-components';
export { TEXT_INPUT_DESCRIPTOR } from './lib/built-in-components/text-input.descriptor';
export { EMAIL_DESCRIPTOR } from './lib/built-in-components/email.descriptor';
export { PANEL_DESCRIPTOR } from './lib/built-in-components/panel.descriptor';
// ... all 23
```

---

## Phase 1b — `libs/form-renderer` Scaffold (Parallel)
### `libs/form-renderer` | Week 1–2 (created alongside form-builder)

> **Decision:** Create as a proper library from day 1 — avoid extraction debt.

**Command:**
```bash
npx nx g @nx/angular:library form-renderer \
  --directory=libs/form-renderer \
  --importPath=@vi/form-renderer \
  --standalone \
  --skipModule \
  --buildable \
  --tags="scope:form-renderer,type:lib,framework:angular"
```

**Week 1–2 scope:** Empty shell with correct structure, `project.json`, `package.json`, and placeholder `FormRendererComponent`. Full implementation is Phase 8 (Post v1), but the lib exists so imports don't need refactoring later.

```
libs/form-renderer/src/lib/
├── form-renderer.component.ts         ← Placeholder — selector: vi-form-renderer
├── field-state.service.ts             ← Placeholder
├── validation-engine.service.ts       ← Placeholder
└── codelist-store.service.ts          ← Placeholder
```

---

## Phase 2 — Canvas & Drag-and-Drop
### `libs/form-builder` | Weeks 3–4

### Services

```
src/lib/services/
├── form-schema.service.ts          ← Signal<FormSchema> + all CRUD mutations
├── builder-state.service.ts        ← activeNodeId, isDragging, previewMode (Signals)
├── dnd.service.ts                  ← @atlaskit/pragmatic-drag-and-drop coordinator
├── key-generator.service.ts        ← labelToKey() + deduplicateKey()
└── history.service.ts              ← @vi/state-fp undo/redo wrapper
```

**`FormSchemaService` mutations (immutable / snapshot-based):**
- `addComponent(parentId, index, descriptorType)`
- `removeComponent(nodeId)`
- `moveComponent(nodeId, targetParentId, targetIndex)`
- `patchComponent(nodeId, patch: Partial<ComponentSchema>)`
- `duplicateComponent(nodeId)`
- `isDescendant(nodeId, targetId)` → cycle prevention
- `isKeyUnique(key, excludeNodeId)`
- `getNode(nodeId)`

**DnD — Two-scenario model:**
```
SCENARIO A: palette → canvas (COPY)
  payload: { source: 'palette', descriptorType }
  effect:  FormSchemaService.addComponent(...)

SCENARIO B: canvas ↔ canvas (MOVE)
  payload: { source: 'canvas', nodeId, parentId, index }
  effect:  FormSchemaService.moveComponent(...)
```

### Angular Components

```
src/lib/
├── builder/
│   └── form-builder.component.ts        ← 3-column host shell
├── palette/
│   ├── palette.component.ts
│   ├── palette-search.component.ts
│   ├── palette-group.component.ts
│   └── palette-item.component.ts        ← Draggable tile
└── canvas/
    ├── canvas.component.ts              ← Root drop container
    ├── canvas-empty-state.component.ts
    ├── canvas-form-title.component.ts
    ├── canvas-node.component.ts         ← Recursive
    ├── canvas-node-overlay.component.ts ← Select / Duplicate / Delete / Drag handle
    └── canvas-drop-zone.component.ts
```

**`FormBuilderComponent` Signal API:**
```typescript
@Component({ selector: 'vi-form-builder', ... })
export class FormBuilderComponent {
  @Input() set schema(s: FormSchema) { this._schemaSvc.load(s); }
  @Output() schemaChange = outputFromObservable(
    toObservable(this._schemaSvc.schema).pipe(debounceTime(300))
  );
  readonly schema: Signal<FormSchema> = this._schemaSvc.schema;
  undo() { this._history.undo(); }
  redo() { this._history.redo(); }
  canUndo: Signal<boolean> = this._history.canUndo;
  canRedo: Signal<boolean> = this._history.canRedo;
  validateSchema(): SchemaValidationError[] { ... }
}
```

---

## Phase 3 — Properties Panel & History
### `libs/form-builder` | Weeks 5–6

```
src/lib/properties/
├── properties-panel.component.ts
├── form-settings-panel.component.ts
├── settings-tab.component.ts
├── settings-field.component.ts
├── settings-host.component.ts           ← Lazy-loads custom settingsComponent
├── validation-rules-editor.component.ts
├── conditional-editor.component.ts
└── rule-row.component.ts

src/lib/toolbar/
└── builder-toolbar.component.ts         ← [Undo] [Redo] [Preview] [JSON] [Save]

src/lib/json-view/
└── schema-json-view.component.ts        ← CDK Overlay modal
```

**`HistoryService`:**
- Wraps `@vi/state-fp` — `past[]` / `future[]` snapshot stacks
- Debounces rapid mutations via `historyDebounceMs` (default 500ms)
- Caps at `maxHistorySize` (default 100)

---

## Phase 4 — Layout Components (Recursive Nesting)
### `libs/form-builder` | Weeks 7–8

```
src/lib/canvas/
├── canvas-container.component.ts   ← Panel, Columns, Tabs, Fieldset, Repeater
└── canvas-breadcrumb.component.ts
```

**Tabs schema:**
```typescript
interface TabsConfig {
  tabs: { id: string; label: string }[];
  tabAssignments: Record<string, string>; // nodeId → tabId
}
```

**Columns schema:**
```typescript
interface ColumnsConfig {
  columns: number;
  columnWidths?: string[];                        // CSS widths
  columnAssignments: Record<string, number>;      // nodeId → columnIndex
}
```

---

## Phase 5 — Validation & Conditionals
### `libs/form-builder` | Weeks 9–10

- `ValidationRulesEditorComponent` — add/remove/reorder rules
- `ConditionalEditorComponent` — Simple mode + JSON Logic mode
- Preview toggle (uses `libs/form-renderer` `FormRendererComponent`)
- `@vialiq/form-validator-sdk` — new lib (`libs/form-validator-sdk`)

```typescript
// Host app registration pattern:
providers: [
  provideValidation({
    customValidators: {
      nhsNumber: nhsNumberValidator,
    }
  })
]
```

---

## Phase 6 — `<vi-drawer>` & Accessibility
### `libs/web-components` + `libs/form-builder` | Weeks 11–12

- `<vi-drawer>` Lit web component in `libs/web-components/src/drawer/`
- Responsive: on ≥1024px — properties panel in right column; narrower — CDK Portal into `<vi-drawer>`
- `KeyboardDndService` — Space/Enter pick up, arrows to move, Escape to cancel
- ARIA live region for screen reader drag announcements
- WCAG 2.1 AA target

---

## Phase 7 — Polish & Release (v1.0 GA)
### All libraries | Weeks 13–14

| Layer | Tool | Target |
|---|---|---|
| Unit — pure functions | Vitest | 100% rule engine |
| Unit — schema mutations | Vitest | All `FormSchemaService` methods |
| Unit — Angular components | Vitest + `@testing-library/angular` | Palette, Canvas, Properties |
| Unit — web components | WDIO | `<vi-drawer>`, `<vi-date-picker>` |
| Integration — DnD | Playwright | Palette drop, canvas reorder, nested |
| E2E | Playwright | Full builder in test Nx app |

**Storybook stories (form-builder/ prefix):**
- `form-builder/Basic Form`
- `form-builder/Custom Component` (via `BUILDER_COMPONENTS` DI)
- `form-builder/Load Existing Schema`
- `form-builder/Preview Mode`
- `form-builder/Validation Rules`
- `form-builder/Layout Nesting` (3-level deep)
- `form-builder/Keyboard DnD`

---

## Phase 8 — Form Renderer (v2)
### `libs/form-renderer` | Post v1.0

Full implementation of `FormRendererComponent`:

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

**Required tokens (host must provide):**
- `FORM_DATA_SERVICE` — `getInitialData()`, `onSubmit()`, `onReset?()`
- `CODELIST_CONFIG` — `{ endpoint: string }`

**Optional tokens:**
- `CUSTOM_VALIDATOR_REGISTRY` — study-specific validators
- `STUDY_METADATA` — `StudyMeta` from product layer
- `CODELIST_SERVICE` — override default REST implementation

**Renderer wrapper components (one per field type):**
```
renderer-wrappers/
├── vi-renderer-input.component.ts
├── vi-renderer-select.component.ts
├── vi-renderer-combobox.component.ts
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

**Read-only mode:** `permissions` bitmask without `WRITE` bit → all fields render as readonly text (no disabled inputs). Uses `FormPermission` enum resolved by each `vi-renderer-*`.

---

## Codelist Implementation Gate

> [!CAUTION]
> The following MUST NOT be implemented until two platform designs are finalized:
> 1. **Multilingual / i18n** — `CodelistItem.value` must be locale-aware
> 2. **Platform-wide versioning** — codelist versions are part of audit-trail replay design

**Unblocked today:** All layout, text inputs, validation, repeating fields, conditionals.  
**Blocked:** `select`, `dropdown`, `combobox` with `CodelistOptionSource`; `radio-group`, `checkbox-group`.

---

## Technical Debt Tracker

| ID | Title | Priority | Phase | Status |
|---|---|---|---|---|
| TD-01 | File Upload | 🟡 Medium | Post v1 | Open |
| TD-02 | Schema Architecture Redesign | 🔴 High | Pre v2 | Open |
| TD-03 | Cascading Codelists | 🟡 Medium | v2 Renderer | Open |
| TD-04 | Field Runtime Status | 🟡 Medium | Phase 9 | Open (by design) |
| TD-05 | Visit / Subject Context | 🔵 Low | Product layer | Open (by design) |
| **TD-06** | **Read-Only Form Mode** | **🔴 High** | **Phase 0 + Phase 8** | **In Design** |
| TD-07 | validateOn Form-Level Only | 🟡 Medium | Phase 1 | **Decision made — applied in types** |
| TD-08 | saveState / Draft Persistence | 🟡 Medium | Phase 10 | Open |
| TD-09 | Offline Mode | 🟡 Medium | Phase 10 | Open |
| TD-10 | Form / Study Versioning | 🟡 Medium | Phase 10 | Open |
| TD-11 | Multilingual Validation Messages | 🟡 Medium | Phase 10 | Open (by design) |
| **TD-12** | **Custom Validator SDK** | **🔴 High** | **Phase 5** | Docs written — SDK to build |
| **TD-13** | **EC Queries & Custom Programming** | **🔴 High** | **Phase 9** | Open — design pending |

---

## Execution Timeline

```
Week  1:    Phase 1.1 — Scaffold libs/form-builder + libs/form-renderer (shell)
Week  1–2:  Phase 1.2 — Type system (schema.ts, component-schemas.ts, all types)
Week  1–2:  Phase 1.3 — Injection tokens
Week  1–2:  Phase 1.4 — Component Registry + BuilderRegistryService
Week  1–2:  Phase 1.5 — 23 built-in descriptors
Week  1–2:  Phase 1.6 — Validation rule engine (100% coverage)
Week  3–4:  Phase 2   — Canvas, DnD, palette, empty state
Week  5–6:  Phase 3   — Properties panel, history, toolbar, JSON view
Week  7–8:  Phase 4   — Layout components, recursive nesting
Week  9–10: Phase 5   — Validation editor, conditionals, custom validator SDK
Week 11–12: Phase 6   — <vi-drawer>, keyboard DnD, ARIA, accessibility
Week 13–14: Phase 7   — Testing, Storybook, documentation, v1.0 GA

[PARALLEL — Schedule design sessions]:
  Before Phase 5 end: i18n architecture design session
  Before Phase 8 start: FormRenderer detailed planning
  Before Phase 9: Compliance (audit trail, queries) architecture session

Post v1.0: Phase 8  — @vi/form-renderer full implementation
Post v2.0: Phase 9  — Platform compliance (audit trail, queries, e-signature)
Post v3.0: Phase 10 — Persistence, versioning, offline, multilingual
```

---

## Next Immediate Action

**Start Phase 1.1:** Scaffold `libs/form-builder` and `libs/form-renderer` using `@nx/angular:library` generator.

```bash
# Step 1: form-builder
npx nx g @nx/angular:library form-builder \
  --directory=libs/form-builder \
  --importPath=@vi/form-builder \
  --standalone --skipModule --buildable \
  --tags="scope:form-builder,type:lib,framework:angular"

# Step 2: form-renderer
npx nx g @nx/angular:library form-renderer \
  --directory=libs/form-renderer \
  --importPath=@vi/form-renderer \
  --standalone --skipModule --buildable \
  --tags="scope:form-renderer,type:lib,framework:angular"
```

Then move into the type system — starting with `FormSchema` and the discriminated union.
