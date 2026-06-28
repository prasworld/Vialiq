# Form Builder — Overview & Goals

> **Status:** Active — design in progress  
> **Date:** 2026-05-29  
> **Author:** Prashant Gupta  
> Related docs: [architecture](./form-builder-architecture.md) · [schema](./form-builder-schema.md) · [renderer](./form-builder-renderer.md) · [dnd](./form-builder-dnd.md) · [registry](./form-builder-registry.md) · [validation](./form-builder-validation.md) · [custom-validators](./form-builder-custom-validators.md) · [roadmap](./form-builder-roadmap.md)

---

## 1. What We Are Building

A **FormIO-style drag-and-drop form builder** packaged as an Angular 21 library (`@vi/form-builder`) living at `libs/form-builder` in this Nx monorepo.

The builder is a **visual authoring tool** that produces a typed JSON schema representing a form. That schema is consumed by a separate **form renderer** — an Angular 21 standalone component (`FormRendererComponent`, `@vi/form-renderer`) that renders a fully interactive, accessible, submit-ready HTML form.

This separation is intentional:

| Concern | Technology | Portability |
|---|---|---|
| **Builder (authoring)** | Angular 21, standalone | Angular apps only |
| **Renderer (runtime)** | Angular 21, standalone component (`@vi/form-renderer`) | Angular apps (v1); Angular Elements wrapper for cross-framework planned for v2 |
| **Schema (data)** | Plain JSON / TypeScript interfaces | Universal |
| **Component palette** | Existing `@vialiq/web-components` Lit elements | Universal |

---

## 2. Goals

### 2.1 Primary Goals

1. **Visual form authoring** — Users drag components from a palette onto a canvas and produce a valid form schema without writing code.
2. **Rich layout support** — Full recursive nesting: panels, column grids, tab containers, fieldsets, and repeater groups are first-class layout components.
3. **Live preview** — The canvas renders actual `<vi-*>` custom elements so what-you-see-is-what-you-get (WYSIWYG) is true by default.
4. **Config-driven settings panel** — Each component ships a JSON meta-schema for its settings. A generic renderer turns that meta-schema into a reactive form in the right-hand properties panel. No per-component Angular settings component is required in v1 (but is supported as an escape hatch).
5. **Extensible component registry** — Third parties can register new draggable components via Angular `InjectionToken` multi-provider at app bootstrap time. The registry is open-closed: built-ins are provided by the library; consumers add their own.
6. **Undo/redo** — Every schema-mutating action is reversible via an immutable history stack powered by `@vi/state-fp`.
7. **JSON rule engine for validation** — Validation rules stored in the schema are portable JSON descriptors (not Angular-specific validators). The rule engine is a pure function evaluated at render time.
8. **Signal-based state** — The builder exposes its schema as an Angular Signal. The host reads/subscribes to schema changes reactively.
9. **`<vi-drawer>` sidebar integration** — The properties panel can optionally open in a Lit-based `<vi-drawer>` web component (built in `libs/web-components`) rather than the embedded right-hand column, for constrained-viewport layouts.

### 2.2 Secondary Goals (planned, not v1)

- Multi-page / wizard mode (`display: 'wizard'`)
- Form submission / API adapter (`FormioService`-style)
- PDF export mode (`display: 'pdf'`)
- Conditional component visibility builder (visual rule editor)
- Component grouping and reuse (saved templates)
- Real-time collaboration (operational transforms or CRDT on schema)

---

## 3. Non-Goals

- **No backend.** The builder has no opinion about where schemas are stored. That is a consumer responsibility.
- **No FormIO cloud dependency.** We produce our own schema format (not FormIO's). There is no plan to be wire-compatible with `form.io` hosted services.
- **No React/Vue builder.** The builder itself is Angular. The renderer (`FormRendererComponent`) is also Angular in v1; Angular Elements cross-framework wrapper is planned for v2.
- **No Bootstrap.** The builder uses Flux UI design tokens and the `@vialiq/web-components` component system exclusively.
- **No jQuery or other legacy dependencies.** Modern ES2022+, Signals, Zone.js-free where possible.

---

## 4. Glossary

| Term | Definition |
|---|---|
| **Builder** | The Angular library / component that provides the drag-and-drop form authoring UI. |
| **Renderer** | The Angular component (`FormRendererComponent`, `@vi/form-renderer`) that takes a `FormSchema` and renders an interactive HTML form. |
| **Schema** | The typed JSON document (`FormSchema`) produced by the builder and consumed by the renderer. |
| **Component Descriptor** | A plain TypeScript object implementing `ComponentDescriptor` that describes a draggable palette item: its type, icon, category, default schema, settings meta-schema, and canvas element. |
| **Registry** | The `BuilderRegistryService` that aggregates all `ComponentDescriptor` instances injected via the `BUILDER_COMPONENTS` multi-provider token. |
| **Palette** | The left-hand panel listing all registered component types, grouped by category, ready to be dragged. |
| **Canvas** | The central drop zone where components are arranged. Supports recursive nesting. |
| **Canvas Node** | One rendered component on the canvas. May contain child nodes if it is a layout component. |
| **Properties Panel** | The right-hand (or sidebar) panel showing settings for the selected canvas node. Driven by the node's `settingsSchema`. |
| **Settings Schema** | A JSON meta-schema object (`SettingsSchema`) describing the tabs and fields of a component's properties panel. Interpreted by `SettingsPanelComponent`. |
| **Drop Zone** | A visual target area that accepts a dragged item. Between-node and container drop zones are distinct. |
| **Drop Indicator** | A visual line or highlight shown during a drag to indicate where the item will land. |
| **Command** | An immutable action object (add, remove, move, update) that mutates the schema. Commands are the unit of undo/redo history. |
| **History Stack** | The state-fp-powered list of past schema snapshots enabling undo/redo. |
| **JSON Rule Engine** | A pure-function evaluator that takes `RuleDescriptor[]` + current value + form data and returns `ValidationResult`. Stored rules are portable JSON. |
| **InjectionToken Multi-Provider** | Angular DI pattern where `{ provide: TOKEN, useValue: X, multi: true }` collects multiple values for the same token into an array. Used for the component registry. |
| **`<vi-drawer>`** | A Lit 3 web component providing the structural chrome (backdrop, slide-in panel, header/footer slots) for the sidebar properties panel. |
| **Sub-Form** | A saved `FormSchema` embedded as a reusable composite field group inside another form. Planned for v2+. |
| **Form Catalog Service** | `FORM_CATALOG_SERVICE` InjectionToken. Resolves sub-form schemas by ID. Planned for v2+. |
| **Repeating Control** | A field-level mechanic (`isRepeating: true`) where the end-user can add multiple instances of the same control. Instances appear stacked; a shared label sits above them; a `[+]` button on the last instance adds a new one; a `[×]` button on each (when count > 1) removes it. Submission value is an array. |
| **CDK** | Angular Component Dev Kit — used for Overlay, Portal, FocusTrap, and accessibility utilities (NOT for drag-and-drop). |
| **pragmatic-drag-and-drop** | `@atlaskit/pragmatic-drag-and-drop` — the chosen DnD engine (~4.7 KB core, framework-agnostic). |
| **Option Source** | Discriminated union (`StaticOptionSource | CodelistOptionSource`) used by all five option controls (select, dropdown, combobox, radio-group, checkbox-group). `StaticOptionSource` holds a hardcoded `CodelistItem[]`. `CodelistOptionSource` holds just a `name` (e.g. `'SEX'`) and an optional `version?` (reserved for v1). |
| **CodelistItem** | Universal option record: `{ key: string; value: string; data?: unknown }`. `key` = submission code (stored in DB, sent in payload). `value` = display label (locale-aware; multilingual design pending). `data` = extra metadata for option templates only — never stored or submitted. |
| **Codelist** | A named set of `CodelistItem` records served from the global codelist library via `GET {endpoint}/{name}`. Includes CDISC standard codelists (SEX, RACE, ETHNIC, NY, ACN, …) and sponsor/study-specific codelists. Codelists are not hardcoded in the schema — they are resolved at runtime from the backend. |
| **Codelist Service** | `CODELIST_SERVICE` InjectionToken (`optional`). Pre-fetches all codelists needed by a form in parallel before rendering begins. Each codelist is a separate `GET {endpoint}/{name}` request; failures are isolated. After prefetch, wrappers call `getItems(name)` synchronously. Auth is handled by the host app's `HttpInterceptor` chain — no tokens or credentials in the schema. |
| **Option Template** | Controls how each option is rendered in the dropdown panel. v1: a `StringOptionTemplate` with `{{ }}` expressions over `{{value}}`, `{{key}}`, `{{data.*}}` and a safe pipe whitelist (no eval). v2+: a visual JSON node tree authored in the properties panel WYSIWYG builder (deferred). |

---

## 5. Key User Stories

> **⛔ Implementation prerequisite — codelist features only**
>
> The codelist-related user stories below (Radio Group, Checkbox Group, Select/Dropdown/Combobox with dynamic codelist, and Option Template) **must not be implemented** until two platform-wide designs are finalised:
>
> 1. **Multilingual / i18n** — `CodelistItem.value` (the display label) must be locale-aware. The codelist API and CODELIST_SERVICE must serve locale-correct labels. The full multilingual architecture is not yet designed.
> 2. **Platform-wide versioning** — study design, data-entry form, and codelist versioning must be handled consistently across the platform. The `version?` field in `CodelistOptionSource` is reserved but unused until this design is complete.
>
> All other user stories (layout, text inputs, validation, repeating fields, etc.) are unaffected.

### Builder Author (person configuring the form builder in an Angular app)

- As a builder author, I can **register new draggable components** via Angular DI so that domain-specific fields appear in the palette without modifying the library.
- As a builder author, I can **configure the initial form schema** by passing a `[schema]` input so I can load a saved form for editing.
- As a builder author, I can **subscribe to schema changes** via `builder.schema` signal or `(schemaChange)` output so I can auto-save.
- As a builder author, I can **restrict which component categories appear** in the palette via configuration.

### Form Designer (end-user of the builder UI)

- As a form designer, I can **drag a component from the palette onto the canvas** to add it to the form.
- As a form designer, I can **reorder components** by dragging them within the canvas.
- As a form designer, I can **drop a component inside a layout container** (panel, columns, tabs) to nest it.
- As a form designer, I can **select a canvas component** to open its properties in the right panel.
- As a form designer, I can **edit label, placeholder, validation rules** and see the canvas update in real time.
- As a form designer, I can **undo and redo** any change.
- As a form designer, I can **delete a component** from the canvas.
- As a form designer, I can **preview the form** in a rendered state (renderer mode toggle).
- As a form designer, I can **enable "Allow multiple values" on any field** so that a "+" button appears in the rendered form, letting end-users add as many instances of that control as they need — with a delete button on each except the last remaining one.
- As a form designer, I can **add a Select, Dropdown, or Combobox field** and choose between static options (entered in the properties panel) or a dynamic codelist (identified by name, pre-fetched from the backend before the form renders).
- As a form designer, I can **add a Radio Group field** and bind it to a codelist (e.g. `SEX`) so that all options are displayed as radio buttons — submission stores the selected `CodelistItem.key`.
- As a form designer, I can **add a Checkbox Group field** and bind it to a codelist (e.g. `RACE`) so that multiple options can be selected — submission stores an array of selected `CodelistItem.key` values.
- As a form designer, I can **configure a codelist name** (e.g. `'SEX'`) so that the rendered field fetches options from the app's global codelist API — authentication is handled by the app's existing interceptors, not the schema.
- As a form designer, I can **write an option template** (e.g. `"{{data.flag}} {{value}}"`) to customise how each option is displayed in the dropdown list.
- As a form designer, I can **search for and embed a previously saved sub-form** as a composite field group _(planned for v2+)_.

### Form End-User (person filling in the rendered form)

- As a form end-user, I interact with `<vi-form-renderer [schema]="...">` — an Angular component rendered by the host application. The builder is invisible to me.

---

## 6. Architectural Philosophy

### 6.1 Separation of Concerns

```
┌─────────────────────────────────────────────────────┐
│         @vi/form-builder (Angular 21 library)        │
│                                                       │
│   Palette ──drag──> Canvas ──select──> Properties    │
│       │                 │                    │        │
│       └─── Registry ────┘──── Schema Signal ┘        │
│                         │                            │
│                  History (state-fp)                  │
└─────────────────────────────────────────────────────┘
           ↓ emits FormSchema (plain JSON)
┌─────────────────────────────────────────────────────┐
│   FormRendererComponent (@vi/form-renderer)          │
│   Angular 21 standalone, ViewEncapsulation.Emulated  │
│   No Shadow DOM — global styles and DI tokens apply  │
│   Hosts <vi-input>, <vi-button> Lit leaf elements    │
│   FORM_DATA_SERVICE + CUSTOM_VALIDATOR_REGISTRY DI   │
│   v2: Angular Elements wrapper → <vi-form> CE        │
└─────────────────────────────────────────────────────┘
```

### 6.2 Immutable Schema Operations

Every canvas mutation produces a **new immutable schema snapshot**. Mutations never happen in-place. This enables:
- Clean undo/redo (diffing snapshots)
- Predictable Angular change detection (signals referentially update)
- Safe time-travel debugging

### 6.3 Leaf Components Are Always Lit Web Components

The visual, interactive UI elements (`vi-input`, `vi-select`, `vi-checkbox`, `vi-date-picker`, `vi-button`, `vi-drawer`) are, and will remain, **Lit 3 web components** from `@vialiq/web-components`. They use `static formAssociated = true` + `attachInternals()` and are spec-compliant custom elements usable in any HTML context.

This is a **permanent architectural boundary**, not a migration step:

| Role | Technology | Why |
|---|---|---|
| **Leaf UI elements** | Lit 3 web components | Design-token-driven, shadow-root style isolation at leaf level, usable standalone anywhere |
| **Renderer orchestration** | Angular 21 `vi-renderer-*` wrappers | DI, Signals, cross-field state, CDK accessibility |
| **Builder UI** | Angular 21 | DI, NgRx/signals, CDK drag-and-drop |

Third parties can register **additional leaf components** — either Lit CEs or Angular components — via `ComponentDescriptor.rendererRef`. The builder and renderer both support open extension:
- `rendererRef: { kind: 'custom-element', tagName: 'my-ce' }` — any Lit or CE-spec element is wrapped automatically by `vi-renderer-generic`.
- `rendererRef: { kind: 'angular', component: () => import(...) }` — a full Angular standalone component used directly when the renderer encounters that `type`.

### 6.4 DI as the Extension Mechanism

Angular's `InjectionToken` multi-provider pattern is the only extension point for adding components to the palette. This is intentional — it ties the extension lifecycle to the Angular module system, making registration predictable and tree-shakeable.

---

## 7. Framework Portability Strategy

| Layer | Framework | Note |
|---|---|---|
| Builder UI | Angular 21 | Angular-only; not designed to run in React/Vue |
| Schema (JSON) | Framework-agnostic | Plain TS interfaces; serializes to/from JSON |
| Rule engine | Framework-agnostic | Pure functions, zero deps |
| Component registry core | Framework-agnostic | `ComponentDescriptor[]` is a plain TS array |
| Angular DI wrapper | Angular | `BuilderRegistryService` + `BUILDER_COMPONENTS` token |
| Canvas components | Lit 3 web components | Runs everywhere (leaf elements: vi-input, vi-button, etc.) |
| Form renderer | Angular 21 standalone | `FormRendererComponent` — Angular apps in v1; Angular Elements wrapper planned for v2 |
| Drawer sidebar | Lit 3 web component | `<vi-drawer>` — structural chrome, framework-agnostic |

**Future:** If the builder must run in React, the core services (registry lookup, schema mutations, rule engine) can be extracted into a `@vi/form-builder-core` package. The Angular and React builder UIs would each wrap this core. This extraction is designed-in but not implemented in v1.
