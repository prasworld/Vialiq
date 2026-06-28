# Form Builder — Architecture

> **Status:** In Design — architecture decisions active  
> **Date:** 2026-05-29  
> Related docs: [overview](./form-builder-overview.md) · [schema](./form-builder-schema.md) · [renderer](./form-builder-renderer.md) · [dnd](./form-builder-dnd.md) · [registry](./form-builder-registry.md) · [validation](./form-builder-validation.md) · [custom-validators](./form-builder-custom-validators.md) · [roadmap](./form-builder-roadmap.md)

---

## 1. Nx Project Setup

```
libs/
  form-builder/
    project.json           ← Nx project config
    package.json           ← @vi/form-builder
    tsconfig.json
    tsconfig.lib.json
    tsconfig.spec.json
    eslint.config.mjs
    vitest.config.mts
    src/
      index.ts             ← Public API barrel
      lib/
        ...                ← See §3 File Structure
```

### 1.1 Nx Project Config (`project.json`)

```jsonc
{
  "name": "form-builder",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/form-builder/src",
  "projectType": "library",
  "tags": ["scope:form-builder", "type:lib", "framework:angular"],
  "targets": {
    "build": { "executor": "@nx/esbuild:esbuild", ... },
    "test":  { "executor": "@nx/vite:test", ... },
    "lint":  { "executor": "@nx/eslint:lint", ... }
  }
}
```

### 1.2 NPM Package (`package.json`)

```jsonc
{
  "name": "@vi/form-builder",
  "version": "0.1.0",
  "peerDependencies": {
    "@angular/core": ">=21.0.0",
    "@angular/cdk": ">=21.0.0",
    "@vialiq/web-components": ">=0.1.0",
    "@vi/state-fp": ">=1.0.0"
  },
  "dependencies": {
    "@atlaskit/pragmatic-drag-and-drop": "^1.x"
  }
}
```

### 1.3 Public API Surface (`index.ts`)

Only exports explicitly listed symbols are part of the public API:

```typescript
// Components
export { FormBuilderComponent } from './lib/builder/form-builder.component';
export { FormPreviewComponent } from './lib/builder/form-preview.component';

// Tokens
export { BUILDER_COMPONENTS, BUILDER_CONFIG } from './lib/tokens';

// Types (schema, descriptor, validation)
export type {
  FormSchema, ComponentSchema, InputComponentSchema,
  LayoutComponentSchema, ButtonComponentSchema,
  ComponentDescriptor, SettingsSchema, SettingsField,
  RuleDescriptor, ValidationResult, ConditionalRule,
  BuilderConfig
} from './lib/types';

// Services (for advanced host integration)
export { BuilderRegistryService } from './lib/registry/builder-registry.service';
export { FormSchemaService } from './lib/services/form-schema.service';

// Built-in descriptors (composable; host can cherry-pick)
export { TEXT_INPUT_DESCRIPTOR } from './lib/built-in-components/text-input.descriptor';
export { EMAIL_DESCRIPTOR }      from './lib/built-in-components/email.descriptor';
export { BUTTON_DESCRIPTOR }     from './lib/built-in-components/button.descriptor';
export { PANEL_DESCRIPTOR }      from './lib/built-in-components/panel.descriptor';
export { COLUMNS_DESCRIPTOR }    from './lib/built-in-components/columns.descriptor';
export { TABS_DESCRIPTOR }       from './lib/built-in-components/tabs.descriptor';
export { FIELDSET_DESCRIPTOR }   from './lib/built-in-components/fieldset.descriptor';
export { REPEATER_DESCRIPTOR }   from './lib/built-in-components/repeater.descriptor';

// Convenience: all built-in descriptors as a single provider array
export { BUILT_IN_BUILDER_COMPONENTS } from './lib/built-in-components';
```

---

## 2. Three-Column Layout — Visual Model

```
┌──────────────────────────────────────────────────────────────────────┐
│  FormBuilderComponent  (Angular 21 standalone host)                  │
│  ┌──────────────┐ ┌──────────────────────────┐ ┌──────────────────┐ │
│  │   PALETTE    │ │         CANVAS           │ │    PROPERTIES    │ │
│  │  (240px)     │ │    (flex 1, min 480px)   │ │   (320px)        │ │
│  │  [🔍 Search] │ │  ┌─ Form Title ─────────┐│ │                  │ │
│  │              │ │  │ Untitled Form    ✏️  ││ │ [when no node    │ │
│  │ ● Basic ▾    │ │  └──────────────────────┘│ │  selected: Form  │ │
│  │   [Text]     │ │                          │ │  Settings panel] │ │
│  │   [Email]    │ │  ╔══════════════════╗   │ │                  │ │
│  │   [Number]   │ │  ║  vi-input   * ✏ ║   │ │ [when node       │ │
│  │   [Textarea] │ │  ╚══════════════════╝   │ │  selected: Field │ │
│  │              │ │  ┄┄┄┄ drop here ┄┄┄┄   │ │  settings panel] │ │
│  │ ● Layout ▾   │ │  ╔══════════════════╗   │ │                  │ │
│  │   [Panel]    │ │  ║  vi-button       ║   │ │  [ Label      ]  │ │
│  │   [Columns]  │ │  ╚══════════════════╝   │ │  [ Key        ]  │ │
│  │   [Tabs]     │ │  ┄┄┄┄ drop here ┄┄┄┄   │ │  [ Placeholder]  │ │
│  │              │ │                          │ │                  │ │
│  │ ● Advanced ▾ │ │  ┌─ Breadcrumb ─────────┐│ │  ─ Validation ─  │ │
│  │   [Date]     │ │  │ Panel > Columns > ... ││ │  [x] Required    │ │
│  │   [Hidden]   │ │  └──────────────────────┘│ │                  │ │
│  └──────────────┘ └──────────────────────────┘ └──────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

**Key UX affordances (all v1):**
- **Palette search** box filters components by name across all categories.
- **Form title bar** above canvas: inline editable, clicking empty canvas area shows Form Settings in the right panel.
- **Required indicator** (`*`) shown on canvas nodes that have a `required` rule.
- **Canvas breadcrumb** at the bottom of the canvas: shows the nesting path when editing deep layouts (e.g. `Panel › Columns › Text Field`).
- **Empty canvas state:** An illustrated prompt ("Drag a field here to start building") shown when `schema.components` is empty.
- **Responsive collapse:** On narrower viewports, the properties panel collapses into a `<vi-drawer>` that slides in when a canvas node is selected.

---

## 3. File Structure (detailed)

```
libs/form-builder/src/lib/
│
├── builder/
│   ├── form-builder.component.ts      ← 3-col host; routes DnD, selection, history
│   ├── form-builder.component.html
│   ├── form-builder.component.scss
│   └── form-preview.component.ts      ← Toggle: uses FormRendererComponent (@vi/form-renderer) in preview mode
│
├── palette/
│   ├── palette.component.ts           ← Left panel; groups from registry
│   ├── palette.component.html
│   ├── palette-group.component.ts     ← Collapsible category group
│   └── palette-item.component.ts      ← Draggable tile (icon + label)
│
├── canvas/
│   ├── canvas.component.ts            ← Center panel; root drop container
│   ├── canvas.component.html
│   ├── canvas-node.component.ts       ← Recursive: renders one ComponentSchema node
│   ├── canvas-node.component.html     ← Hosts <vi-*> element + overlay controls
│   ├── canvas-node-overlay.component.ts  ← Select/Delete/Move handle overlay
│   ├── canvas-drop-zone.component.ts  ← Between-node drop target line
│   └── canvas-container.component.ts  ← Layout containers (panel, columns, tabs)
│
├── properties/
│   ├── properties-panel.component.ts  ← Right panel; driven by selected node schema
│   ├── properties-panel.component.html
│   ├── settings-tab.component.ts      ← Renders one SettingsTab
│   ├── settings-field.component.ts    ← Renders one SettingsField (switch on type)
│   └── settings-host.component.ts     ← Dynamic host for custom settingsComponent
│
├── toolbar/
│   ├── builder-toolbar.component.ts   ← Undo/redo, preview toggle, save button
│   └── builder-toolbar.component.html
│
├── services/
│   ├── form-schema.service.ts         ← Schema signal + CRUD mutations
│   ├── builder-state.service.ts       ← Selected node, active drag, panel open
│   ├── dnd.service.ts                 ← Coordinates palette→canvas + canvas↔canvas
│   └── history.service.ts             ← Undo/redo wrapper over state-fp
│
├── registry/
│   └── builder-registry.service.ts    ← Collects BUILDER_COMPONENTS token array
│
├── validation/
│   ├── rule-engine.ts                 ← Pure: evaluate(rules, value, formData)
│   ├── rule-evaluators.ts             ← One evaluator per RuleDescriptor type
│   └── rule-engine.spec.ts
│
├── tokens/
│   ├── builder-components.token.ts    ← BUILDER_COMPONENTS InjectionToken
│   └── builder-config.token.ts        ← BUILDER_CONFIG InjectionToken
│
├── types/
│   ├── schema.ts                      ← FormSchema, ComponentSchema, LayoutSchema…
│   ├── component-descriptor.ts        ← ComponentDescriptor, SettingsSchema…
│   └── validation.ts                  ← RuleDescriptor, ValidationResult…
│
└── built-in-components/
    ├── index.ts                        ← BUILT_IN_BUILDER_COMPONENTS array
    ├── text-input.descriptor.ts
    ├── email.descriptor.ts
    ├── password.descriptor.ts
    ├── tel.descriptor.ts
    ├── number.descriptor.ts
    ├── textarea.descriptor.ts
    ├── button.descriptor.ts
    ├── submit.descriptor.ts
    ├── panel.descriptor.ts
    ├── columns.descriptor.ts
    ├── tabs.descriptor.ts
    ├── fieldset.descriptor.ts
    ├── repeater.descriptor.ts
    ├── hidden.descriptor.ts
    ├── content.descriptor.ts
    ├── divider.descriptor.ts
    ├── date.descriptor.ts
    ├── time.descriptor.ts
    ├── datetime-local.descriptor.ts
    └── checkbox-group.descriptor.ts
```

---

## 4. Component Tree

```
FormBuilderComponent
├── BuilderToolbarComponent
│     └── [Undo] [Redo] [Preview] [JSON] [Save]
├── PaletteComponent
│   ├── PaletteSearchComponent         ← Search/filter input
│   └── PaletteGroupComponent (×N categories)
│       └── PaletteItemComponent (×M components per group, draggable)
├── CanvasComponent
│   ├── CanvasFormTitleComponent       ← Inline editable form title
│   ├── CanvasEmptyStateComponent      ← "Drag a field here" prompt (when empty)
│   ├── CanvasDropZoneComponent (before first node)
│   ├── CanvasNodeComponent (×N nodes, recursive)
│   │   ├── <vi-input> / <vi-button> / … (the real custom element)
│   │   ├── CanvasNodeOverlayComponent (select/duplicate/delete/drag handle)
│   │   ├── CanvasDropZoneComponent (after this node)
│   │   └── [if layout node] CanvasContainerComponent
│   │       ├── CanvasDropZoneComponent (before first child)
│   │       └── CanvasNodeComponent (×M children, same pattern recursively)
│   ├── CanvasDropZoneComponent (at end, always visible)
│   └── CanvasBreadcrumbComponent      ← Shows nesting path for selected node
└── PropertiesPanelComponent  [OR inside <vi-drawer> web component]
    ├── FormSettingsPanelComponent      ← Shown when no node selected
    ├── SettingsTabComponent (×N tabs from settingsSchema)
    │   └── SettingsFieldComponent (×M fields per tab)
    │         ← dispatches patch to FormSchemaService on change
    └── [optional] SettingsHostComponent (lazy-loads custom settingsComponent)
```

---

## 5. Service Graph & Data Flow

```
  ┌────────────────────────────────────────────────────────────┐
  │                   FormSchemaService                         │
  │                                                             │
  │  schema: Signal<FormSchema>   (immutable snapshots)         │
  │  selectedNodeId: Signal<string | null>                      │
  │                                                             │
  │  addComponent(parentId, index, descriptor)                  │
  │  moveComponent(nodeId, targetParentId, targetIndex)         │
  │  removeComponent(nodeId)                                    │
  │  patchComponent(nodeId, patch: Partial<ComponentSchema>)    │
  │  duplicateComponent(nodeId)                                 │
  │  isKeyUnique(key, excludeNodeId): boolean                   │
  │  getNode(nodeId): ComponentSchema | undefined               │
  │                                                             │
  │  ── All mutations go through HistoryService ──────────────  │
  └───────────────────────┬────────────────────────────────────┘
                          │ reads / mutates via Commands
  ┌────────────────────────▼───────────────────────────────────┐
  │                   HistoryService                            │
  │                                                             │
  │  Uses @vi/state-fp to maintain past[] / future[] stacks     │
  │  Debounces rapid mutations (BuilderConfig.historyDebounceMs)│
  │  Caps stack size at BuilderConfig.maxHistorySize            │
  │  undo() / redo() signal the schema back/forward            │
  └───────────────────────┬────────────────────────────────────┘
                          │
  ┌───────────────────────┼────────────────────────────────────┐
  │   BuilderStateService │                                     │
  │                       │                                     │
  │  (separate from schema; ephemeral UI state)                 │
  │  activeNodeId: Signal<string | null>                        │
  │  isDragging: Signal<boolean>                                │
  │  propertiesPanelOpen: Signal<boolean>                       │
  │  previewMode: Signal<boolean>                               │
  └───────────────────────┬────────────────────────────────────┘
                          │
  ┌───────────────────────▼────────────────────────────────────┐
  │                   DndService                                │
  │                                                             │
  │  Wraps @atlaskit/pragmatic-drag-and-drop                    │
  │  onPaletteDrop(descriptorType, targetParentId, targetIndex) │
  │   → auto-generates key via KeyGeneratorService             │
  │   → calls FormSchemaService.addComponent(...)               │
  │  onCanvasMove(nodeId, targetParentId, targetIndex)          │
  │   → calls FormSchemaService.moveComponent(...)              │
  └───────────────────────┬────────────────────────────────────┘
                          │
  ┌───────────────────────▼────────────────────────────────────┐
  │               KeyGeneratorService                           │
  │                                                             │
  │  labelToKey(label): string                                  │
  │  deduplicateKey(candidate, existingKeys): string            │
  └───────────────────────┬────────────────────────────────────┘
                          │
  ┌───────────────────────▼────────────────────────────────────┐
  │               SchemaValidatorService                        │
  │                                                             │
  │  validateSchema(schema, registry): SchemaValidationError[]  │
  │  Runs on: schema load, save/publish click, partial checks   │
  └───────────────────────┬────────────────────────────────────┘
                          │
  ┌───────────────────────▼────────────────────────────────────┐
  │               BuilderRegistryService                        │
  │                                                             │
  │  inject(BUILDER_COMPONENTS) → ComponentDescriptor[]         │
  │  getByType(type: string): ComponentDescriptor | undefined   │
  │  getByCategory(): Map<string, ComponentDescriptor[]>        │
  └────────────────────────────────────────────────────────────┘
```

---

## 6. Angular 21 Specifics

### 6.1 Standalone Components Only

No `NgModule`. Every component is `standalone: true`. The library exports `FormBuilderComponent` as the entry point. Consumers import it directly:

```typescript
// In host app's routes or component:
import { FormBuilderComponent } from '@vi/form-builder';

@Component({
  imports: [FormBuilderComponent],
  template: `<vi-form-builder [schema]="initialSchema" (schemaChange)="onSave($event)" />`
})
export class MyPageComponent { ... }
```

### 6.2 Signal-Based API

The `FormBuilderComponent` exposes:

```typescript
@Component({ selector: 'vi-form-builder', ... })
export class FormBuilderComponent {
  // Input: initial schema (optional, defaults to empty form)
  @Input() set schema(s: FormSchema) { this._schemaService.load(s); }

  // Output: emits on every schema change (debounced 300ms for keystrokes)
  @Output() schemaChange = outputFromObservable(
    toObservable(this._schemaService.schema).pipe(debounceTime(300))
  );

  // Programmatic access for host (e.g. save on button click)
  readonly schema: Signal<FormSchema> = this._schemaService.schema;

  // Undo/redo
  undo() { this._history.undo(); }
  redo() { this._history.redo(); }
  canUndo: Signal<boolean> = this._history.canUndo;
  canRedo: Signal<boolean> = this._history.canRedo;

  // Programmatic schema validation (structural checks)
  validateSchema(): SchemaValidationError[] {
    return this._schemaValidator.validateSchema(
      this._schemaService.schema(),
      this._registry
    );
  }
}
```

### 6.3 Lazy Loading Settings Components

Custom `settingsComponent` in a `ComponentDescriptor` is a dynamic import:

```typescript
settingsComponent: () => import('./my-settings/my-settings.component')
  .then(m => m.MySettingsComponent)
```

`SettingsHostComponent` uses Angular's `createComponent` + `ViewContainerRef` to mount it, or Angular's `@defer` block:

```html
@defer (when settingsComponentType()) {
  <ng-container [ngComponentOutlet]="settingsComponentType()" />
} @placeholder {
  <vi-form-builder-settings-skeleton />
}
```

### 6.4 Angular CDK Usage (non-DnD)

CDK is used for:

| CDK Feature | Used For |
|---|---|
| `OverlayModule` | Drop-down menus, tooltips, component palette overflow |
| `PortalModule` | Mounting the properties panel into `<vi-drawer>` web component slot |
| `A11yModule` (FocusTrap) | Trapping focus within open drawer/overlay |
| `ScrollingModule` | Virtual scroll if palette list grows very large |

CDK is **NOT** used for drag-and-drop (see [form-builder-dnd.md](./form-builder-dnd.md)).

### 6.5 Zone.js / Zoneless

Target: **Zone.js-free** (`provideExperimentalZonelessChangeDetection()`). All state changes go through Signals. Any third-party integrations that trigger imperative callbacks (like pragmatic-drag-and-drop event handlers) must call `effect()` or `input.set()` patterns. No `NgZone.run()` hacks.

---

## 7. Integration with `@vialiq/web-components`

### 7.1 Canvas Rendering

`CanvasNodeComponent` reads the `ComponentDescriptor.canvasElement` string (e.g. `'vi-input'`) and renders:

```html
<vi-input
  [attr.placeholder]="node.placeholder ?? null"
  [attr.disabled]="isDragging() ? '' : null"
  [attr.value]="node.defaultValue ?? null"
/>
```

Properties are mapped from `ComponentSchema` to DOM attributes/properties via `ComponentDescriptor.canvasProps(schema)` — a pure function that returns a `Record<string, unknown>` applied as element attributes.

During drag, pointer-events on canvas nodes are disabled (CSS `pointer-events: none`) so the drag-and-drop engine controls hit-testing.

### 7.2 `<vi-drawer>` for Sidebar Properties

The `<vi-drawer>` Lit web component (to be built in `libs/web-components`) has this API:

```html
<vi-drawer open slot="aside">
  <span slot="header">Properties</span>
  <!-- Angular content projected here via CDK Portal -->
</vi-drawer>
```

`FormBuilderComponent` uses a `DomPortal` to project `PropertiesPanelComponent`'s DOM into the `<vi-drawer>` slot when `propertiesPanelOpen()` is true. On desktop viewports, the right-hand column is used instead.

### 7.3 `FormRendererComponent` Preview

When the form designer clicks "Preview", `FormBuilderComponent` toggles to `FormPreviewComponent` which renders:

```html
<vi-form-renderer [schema]="schema()"></vi-form-renderer>
```

`FormRendererComponent` is an **Angular 21 standalone component** from `@vi/form-renderer` (not a Lit web component). It renders the full interactive form using `<vi-input>`, `<vi-select>`, `<vi-button>` etc., with the complete validation engine, conditional visibility, and submission state machine.

> **Decision (2026-05-21):** The renderer was originally planned as a Lit web component for framework-agnostic distribution. This was revised to Angular because:
> - Custom validators and data services need Angular `InjectionToken` DI
> - Signal-based cross-field state (`computed()`, `effect()`) is native to Angular
> - Server-side validation propagation is trivial with shared Signals
>
> See [form-builder-renderer.md](./form-builder-renderer.md) for the full architecture, `FieldStateService` spec, and ValidationEngine integration.

---

## 8. Module Boundary Tags (Nx)

| Tag | Meaning |
|---|---|
| `scope:form-builder` | Code that belongs to the form-builder domain |
| `type:lib` | Publishable library (no application code) |
| `framework:angular` | Angular dependency allowed |
| `framework:lit` | Lit dependency allowed (for web-components lib) |
| `framework:agnostic` | No framework dep (types, rule engine, descriptors) |

Nx constraints (`eslint.config.mjs` at root):

```js
// form-builder can import web-components and state-fp
// form-builder CANNOT import from apps/
// web-components CANNOT import from form-builder (no circular dep)
```

---

## 9. Testing Strategy

| Layer | Tool | Notes |
|---|---|---|
| Unit — pure functions | Vitest | Rule engine, schema mutations, descriptor defaults |
| Unit — Angular components | Vitest + `@testing-library/angular` | FormBuilderComponent, PaletteComponent, CanvasNodeComponent |
| Unit — web components | WDIO (existing wdio.config.ts) | `<vi-drawer>` web component |
| Integration — DnD | Playwright component tests | Drag from palette to canvas, reorder, nested drop |
| E2E | Playwright | Full builder hosted in test app |

### Key test scenarios

1. Dragging a palette item adds a new node to canvas schema.
2. Reordering canvas nodes updates schema array order.
3. Dropping into a nested panel creates a child in the correct `components[]`.
4. Editing label in properties panel updates schema and canvas in the same tick.
5. Undo after add removes the node; undo after edit reverts the property.
6. Custom component descriptor registered via DI appears in palette and drops correctly.

---

## 10. Codelist & Dynamic Options Architecture

> **⛔ BEFORE IMPLEMENTATION — MANDATORY PREREQUISITES:**
> The following cross-cutting concerns MUST have signed-off designs before implementation of any codelist or option-control feature begins:
> 1. **Multilingual / i18n** — The entire study platform is multilingual. `CodelistItem.value` (the display label) must be locale-aware. Architecture TBD. No implementation until designed.
> 2. **Platform-wide versioning** — Codelist versioning is one part of a larger versioning story (study design snapshots, data entry audit trail, schema version pinning for regulatory replay). No implementation until the central versioning architecture is approved.

### 10.1 Why a Two-Layer Design

`vi-select`, `vi-dropdown`, `vi-combobox`, `vi-radio-group`, and `vi-checkbox-group` are Lit CEs inside Shadow DOM — no Angular DI, no `HttpClient`. Dynamic option loading happens entirely in the Angular `vi-renderer-*` wrapper layer. The wrapper resolves options to a `CodelistItem[]` array and passes it to the Lit CE via property binding. The CE never fetches.

```
  Form Schema                Angular Wrapper             Lit CE
  ──────────────────────     ──────────────────────     ──────────────────────
  optionSource:              vi-renderer-select          vi-select
    kind: 'codelist'   ───►  pre-fetched by              [items]=[CodelistItem[]]
    name: 'SEX'              CodelistStore               ──► renders list
                             (app interceptors
                              handle auth)
```

### 10.2 Applicable Controls

Codelist (`kind: 'codelist'`) and static (`kind: 'static'`) options are supported on:

| Control | `optionSource` | Notes |
|---|---|---|
| `vi-select` | ✅ | Listbox, single or multi |
| `vi-dropdown` | ✅ | Trigger-button panel, rich display |
| `vi-combobox` | ✅ | Type-ahead, filter, optional free-text |
| `vi-radio-group` | ✅ | Single select — primary CDISC coded field control |
| `vi-checkbox-group` | ✅ | Multi-select — e.g. RACE codelist |
| `vi-input`, `vi-email`, `vi-number`, `vi-date`, `vi-textarea` | ❌ | Not applicable |

### 10.3 Global Codelist Library

Codelists are **not hardcoded** in any form schema or application. Instead, a **global codelist library** is maintained centrally and made available across all clients and studies:

```
  Global Codelist Library
  ├── Standard codelists  (CDISC SDTM/CDASH controlled terminology)
  │     SEX: M/F/UNDIFFERENTIATED, RACE, ETHNIC, NY (Yes/No), ACN, …
  ├── MedDRA / WHODrug   ─── SEPARATE architecture, out of scope here
  └── Sponsor/study-specific codelists
        ADVERSE_EVENT_SEVERITY, PROTOCOL_VISIT, TREATMENT_ARM, …
```

The library is maintained in a backend service. Form designers reference codelists by **name** only — the schema never contains the items themselves.

### 10.4 Simplified Codelist API

One endpoint, configured once at app level via `CODELIST_CONFIG`:

```
CODELIST_CONFIG = { endpoint: '/api/codelist' }

// Fetch one codelist:
GET /api/codelist/SEX
→ [
    { key: 'M',              value: 'Male',              data: { nciCode: 'C20197' } },
    { key: 'F',              value: 'Female',            data: { nciCode: 'C16576' } },
    { key: 'UNDIFFERENTIATED', value: 'Undifferentiated', data: { nciCode: 'C45908' } }
  ]
```

**`key`** = stored in DB, included in submission payload (CDISC Submission Value).  
**`value`** = displayed to the data-entry operator (locale-aware — pending multilingual design).  
**`data`** = extra metadata, only accessible inside option templates. Never stored.

### 10.5 Fetch Strategy — Parallel Prefetch at Render Time

When `FormRendererComponent` initialises, it scans the schema for all unique codelist names and fetches them **in parallel** — one `GET` per codelist — before rendering begins. This avoids per-control loading spinners and ensures a clean initial render.

```
FormRendererComponent.ngOnInit()
  ↓
scan schema → unique codelist names: ['SEX', 'RACE', 'ETHNIC', 'NY']
  ↓
parallel:  GET /api/codelist/SEX
           GET /api/codelist/RACE
           GET /api/codelist/ETHNIC
           GET /api/codelist/NY
  ↓
all resolve → inject into CodelistStore (Signal<Map<name, CodelistItem[]>>)
  ↓
form renders — each vi-renderer-* reads from CodelistStore synchronously
```

**Error handling:** each fetch is independent — one failure does not block others. Failed codelists render with an empty options list + an inline error state on the affected control. Individual retries are possible.

**Auth:** Angular `HttpClient` is used; the host app's `HttpInterceptor` chain adds auth headers automatically. No token configuration in the form schema.

**GraphQL note:** REST parallel GETs are the v1 approach. Evaluating a GraphQL transport (single typed query for multiple codelists) is a worthwhile v2+ option — particularly useful for reducing round-trips in forms with many codelists.

### 10.6 `CODELIST_CONFIG` and `CODELIST_SERVICE`

```typescript
// Configured once at app bootstrap — not per field
export interface CodelistConfig {
  /** Base URL. GET {endpoint}/{name} fetches one codelist. */
  endpoint: string;
}
export const CODELIST_CONFIG =
  new InjectionToken<CodelistConfig>('CODELIST_CONFIG');

// Provided by @vi/form-renderer — can be replaced with a custom impl
export interface CodelistService {
  /** Fetch all named codelists in parallel. Returns a map of name → items. */
  prefetchAll(names: string[]): Observable<Map<string, CodelistItem[]>>;

  /** Synchronously read from the in-memory store (populated by prefetchAll). */
  getItems(name: string): CodelistItem[] | undefined;
}
export const CODELIST_SERVICE =
  new InjectionToken<CodelistService>('CODELIST_SERVICE', { providedIn: null });
```

### 10.7 Deferred & Pending Design Items

| Item | Status | Notes |
|---|---|---|
| **Multilingual labels** | ⛔ Must design before implementation | `CodelistItem.value` must be locale-aware. v1 stub: `Accept-Language` header. Full i18n architecture needed. |
| **Platform versioning** | ⛔ Must design before implementation | Covers codelist versions, schema snapshots, audit-trail replay. Central design; `CodelistOptionSource.version?` is reserved but unused in v1. |
| **Extensible codelists** | 📋 Noted — pending API design | Sponsors need to add custom items to standard codelists. Requires backend support for extension lists + merge strategy. |
| **"Other, specify"** | 📋 Noted — pending design | Select 'OTHER' key → free-text sibling field appears. Applicable to select/dropdown/radio-group. Must account for dynamic form conditional visibility. |
| **MedDRA / WHODrug** | 🚫 Out of scope here | Hierarchical medical coding dictionaries. Requires entirely separate architecture and licensed data. |
| **GraphQL transport** | 💡 v2+ option | Single query for multiple codelists. Evaluate after v1 REST implementation is stable. |
| **radio-group / checkbox-group** | 🚧 Full spec pending | Type stubs added to discriminated union. Descriptors and renderer components not yet specced. |

```
  Form Schema                Angular Wrapper             Lit CE
  ──────────────────────     ──────────────────────     ──────────────
  optionSource:              vi-renderer-select          vi-select
    kind: 'codelist'   ───►  resolves via               [options]=[...] ───► renders list
    codelistKey: 'foo'       CODELIST_SERVICE
                             ↳ HttpClient
                               (interceptors
                                add auth headers)
```
