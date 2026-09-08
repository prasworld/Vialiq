---
description: Enforces rigorous edge-case analysis, side-effect mapping, and mandatory unit testing for complex implementations.
---

# Rigorous Technical Review & Edge-Case Analysis Protocol

This rule enforces a strict protocol for analyzing side-effects, edge cases, and relational state before proceeding with implementation. It explicitly prevents "happy-path only" development.

## 1. Mandatory Scenario Alignment & User Buy-In
- **Directive**: Do not blindly proceed with complex implementations.
- **Action**: Before writing implementation code for complex features, explicitly list out all identified edge cases, corner cases, and possible real-world scenarios in your plan. Present these to the user for discussion and require explicit "weigh-in" and approval before proceeding.
- **Why**: Ensures that all non-obvious permutations (e.g., rapid interactions, uninitialized data, contradictory state) are agreed upon before code is written.

## 2. Side-Effect & Dependency Mapping
- **Directive**: Never assume a state change is isolated.
- **Action**: Before modifying a service or shared state, identify all subscribers, computed signals, and dependent components. Assess how the modification impacts their lifecycle.
- **Example**: Modifying `BuilderStateService` affects the layout engine, property panels, and history service.

## 3. Relational State Integrity
- **Directive**: Complex nested states must remain synchronized.
- **Action**: When mutating hierarchical data (like a node tree or `FormSchema`), verify the integrity of child nodes, layout assignments, and check for orphaned data properties.
- **Example**: Ensure that changing a column count in a layout grid doesn't leave orphaned component assignments in hidden columns.

## 4. Async & Closure Safety
- **Directive**: Asynchronous operations are prime candidates for stale state and race conditions.
- **Action**: Audit `setTimeout`, `debounceTime`, and signals used within `effect` or `RxJS` streams to ensure they correctly cancel previous executions and do not capture stale closures.
- **Example**: Rapidly undoing/redoing while an auto-save debounce is pending.

## 5. Edge Case & Corner Case Matrix
- **Directive**: Actively brainstorm ways to break the feature.
- **Action**: Define extreme inputs, uninitialized states, and rapid interaction flows (e.g. fast-clicking, rapid drag-and-drop). 
- **Action**: Combine edge cases to find corner cases (e.g., triggering a drop event exactly as a component is deleted).

## 6. Rigorous Unit Test Verification
- **Directive**: Prove the logic handles the edge cases.
- **Action**: For every identified scenario, edge case, and corner case, ensure there is a corresponding unit test. Verify that the tests actually assert the edge-case behavior and not just the happy path. Run the tests to confirm.
