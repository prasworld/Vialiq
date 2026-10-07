# Form Builder — Implementation Gaps & Task List

This document tracks the missing features and gaps identified during the code review against the `form-builder-dev-plan.md`.

## Phase 3 — Properties Panel & History
- [ ] **`SchemaValidatorService`**: Create `schema-validator.service.ts` to provide background integrity checks (`DUPLICATE_KEY`, `ORPHANED_COL_ASSIGNMENT`, `UNKNOWN_TYPE`, etc.).
- [ ] **JSON View Overlay**: Implement `schema-json-view.component.ts` (CDK overlay) to view and paste raw schema JSON, guarded by `SchemaValidatorService`.

## Phase 4 — Layout Components (Canvas Rendering)
- [ ] **Tabs Rendering Logic**: Implement the rendering and drag-and-drop mechanics for Tabs inside `canvas-node.component.html` and `canvas-node.component.ts` (handling active tabs and per-tab drop zones).
- [ ] **Canvas Breadcrumbs**: Implement `canvas-breadcrumb.component.ts` to display the nesting path (e.g., `Panel › Columns › Text Field`) when editing deeply nested layouts.
- [ ] **Canvas Indicators**:
  - [ ] Add a `*` indicator on canvas nodes that have a `required` validation rule.
  - [ ] Add a `[+]` indicator on canvas nodes that have `isRepeating: true`.

## Phase 5 — Validation & Conditionals (Pending)
- [ ] **Validation Rules Editor**: Implement `validation-rules-editor.component.ts` and `rule-row.component.ts` for adding/removing/editing validation rules per field.
- [ ] **Conditional Visibility Editor**: Implement `conditional-editor.component.ts` for simple and advanced JSON Logic visibility rules.
