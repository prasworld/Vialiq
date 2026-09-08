# Form Builder Edge Case & Architecture Audit Plan

This document outlines a structured audit of the `@vialiq/form-builder` codebase. The goal is to aggressively identify and fix corner cases, side-effect bugs, and relational state issues that exist outside the "happy path" before they reach production.

## 1. Drag & Drop (DnD) and Layout Engine
**Target Files:** `dnd.service.ts`, `canvas-drop-zone.component.ts`, `form-schema.service.ts`
- [ ] **Nested Layouts & Depth Limits**: What happens if a user drags a Columns component inside a Columns component inside a Repeater? Do we enforce max-depth? Does the tree break?
- [ ] **Cross-Builder Interference**: We added `builderId` to state. Do the drop zones correctly reject drag events that originated from a different `builderId` on the same page?
- [ ] **Ghost/Orphaned Nodes**: If a layout node is deleted while one of its child nodes is actively being dragged, what happens to the drag state and the drop preview?
- [ ] **Rapid Relocations**: Spam-moving a node back and forth between parents. Does the index calculation ever corrupt the parent array?

## 2. History Service (Undo/Redo) & State Race Conditions
**Target Files:** `history.service.ts`, `builder-state.service.ts`
- [ ] **Async Debounce Stacking**: We fixed the basic debounce, but what happens if an auto-save triggers immediately after an undo?
- [ ] **Selection State Desync**: If the user has Node A selected, deletes it, and undoes the deletion, does Node A automatically regain selection focus? If not, does the property panel break?
- [ ] **Rapid Interaction**: Firing `Ctrl+Z` 20 times per second. Does the `_isTraversing` flag hold up, or do we leak partial states?

## 3. Schema Reactivity & Relational Integrity
**Target Files:** `form-schema.service.ts`, `form-builder.component.ts`
- [ ] **Orphaned Layout Configs**: As discovered in `layout.descriptor.ts`, updating nested configs can break. Are there other nested properties in `ComponentSchema` that get clobbered by shallow merges?
- [ ] **Duplicate Keys**: The `deduplicateKey` logic runs on duplicate. Does it safely handle keys that end in numbers (e.g. duplicating `text1` -> `text2` -> `text3`)?
- [ ] **Schema Versioning**: What happens if the `[schema]` input is passed an empty object or a schema from an older version of the builder?

## 4. Extension Registry & External Integrations
**Target Files:** `extension-registry.service.ts`
- [ ] **Async Provider Failures**: If `getExtensions(contextId)` takes 5 seconds or rejects, does the builder handle the loading state gracefully, or does it freeze/throw?
- [ ] **Context Switching**: We updated `contextId` to use a `computed` binding. If the host rapidly switches `contextId` A -> B -> A, do we fire redundant network requests or leak memory?

## 5. Execution Protocol
For each module above, we will:
1. Discuss the theoretical edge cases.
2. Formulate real-world scenarios (e.g., "User drags a 3-column layout into a tab, then immediately clicks undo").
3. Present the scenarios for user alignment.
4. Write failing unit tests proving the vulnerability.
5. Implement the fix and verify.
