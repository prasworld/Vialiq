---
applyTo: "libs/web-components/**"
---

# Vialiq Web Components Coding Guidelines (Lit 3, FP-first)

These instructions apply to `libs/web-components/**`.

## 0) Core principles (non‑negotiables)

### Composition-first design
- Prefer small composable primitives over large configurable components.
- Prefer “assemble behavior” via helpers/controllers over subclassing.

### Functional core, imperative shell
- Put logic in pure functions (deterministic, testable).
- Keep DOM effects, focus management, and measurement in thin wrappers.

### Correctness + usability over cleverness
- FP abstractions (functor/monad-style) are welcome **only** when they reduce complexity and remain legible.

### Every behavior change requires tests
- If you add/modify a public prop/method/event/slot/keyboard interaction: **add/modify unit tests**.

### No GitHub writes unless explicitly asked
- Do not commit/push/open PRs unless directed.

---

## 1) Architecture & API design

### 1.1 Component contract checklist (design before code)
Define and document:

- **Purpose**: what the component *is* and *is not*.
- **Public API**:
  - reactive properties (inputs)
  - events (outputs)
  - slots (composition points)
  - CSS API (custom properties, `::part`, states)
  - imperative methods (only when essential)
- **State model**:
  - internal state vs derived state vs external controlled state
- **Accessibility contract**:
  - role, name, value, required keyboard interactions
- **Failure modes**:
  - what happens on invalid input, missing slotted content, async failures

### 1.2 Prefer controlled/uncontrolled duality (when relevant)
For form-like components:

- Support **controlled** usage (value set by prop, emits intent events).
- Support **uncontrolled** usage (internal state, still emits events).
- Never create “two sources of truth”:
  - Choose a precedence rule and enforce it.

### 1.3 Progressive disclosure
- Keep the “easy path” minimal.
- Expose extension points via:
  - slots for structure
  - CSS vars/parts for styling
  - events for integration
  - adapters for async/data

### 1.4 Avoid deep prop surfaces
Prefer:
- small set of orthogonal props
- configuration objects only when they model a real domain concept
- typed string unions rather than ad-hoc strings

### 1.5 Semantic versioning awareness
Public contract changes include:
- prop rename/type change/default change
- event payload change
- slot rename
- CSS var/part rename

Treat as breaking unless proven otherwise.

---

## 2) Lit 3 implementation guidelines

### 2.1 Reactive properties
- Use `@property({ type: ... })` for public props; `@state()` for internal.
- Prefer immutable updates for complex objects/arrays:
  - Replace references to trigger updates and ease testing.
- Avoid mutating objects in place unless you manually call `requestUpdate()` and have a strong reason.

### 2.2 Rendering
- Render must be pure (given current state/props → template).
- Avoid side effects in `render()`.
- Keep templates small:
  - extract template fragments into pure functions returning `TemplateResult`
  - use `when`, `repeat`, `classMap`, `styleMap` appropriately

### 2.3 Lifecycle usage
- `connectedCallback` / `disconnectedCallback`:
  - attach/detach global listeners (window/document), observers, timers
- `firstUpdated`:
  - initial measurement, focus setup, initial slot resolution
- `updated(changed)`:
  - react to specific prop changes; do not blanket-run logic
- Prefer `ReactiveController` for reusable lifecycle-bound behaviors.

### 2.4 ReactiveController pattern (composition)
Use controllers for:
- focus management
- keyboard navigation roving tabindex
- positioning (popovers/tooltips)
- async state machines (loading/error/success)
- intersection/resize/mutation observers

Controllers should:
- have a minimal surface (host passed in)
- expose pure-ish methods and observables/state
- be unit testable independently (mock host)

### 2.5 Eventing
- Emit semantic events (intent) not “implementation events”.
  - Examples: `vialiq-change`, `vialiq-select`, `vialiq-dismiss`
- Always include typed `detail` payload for non-trivial events.
- Use:
  - `bubbles: true`
  - `composed: true` (so events cross shadow DOM boundary)
- Do not over-emit; debounce/throttle where appropriate.

### 2.6 Keyboard and focus
- Implement expected keyboard interactions for the ARIA pattern you follow.
- Never trap focus unless the pattern requires it (dialog).
- Prefer roving tabindex for composite widgets (listbox, tabs, menus).

### 2.7 Styling API (theming)
Use:
- CSS custom properties for tokens
- `::part()` for styling internals
- `:host([state])` or `:host(.state)` patterns (prefer attributes for external control)

Document the CSS API:
- list supported vars and parts

Avoid leaking internal DOM structure as a styling requirement.

### 2.8 Slots and composition
- Prefer slots over “render prop” style APIs.
- Treat slotted content as external:
  - don’t assume structure
  - observe slot changes if behavior depends on it (`slotchange`)

### 2.9 Forms and validation (if applicable)
- If building form-associated custom elements, consider `ElementInternals`.
- Emit validity/invalid events appropriately.
- Provide `value`, `name`, `disabled`, `required` semantics consistent with native controls.

---

## 3) Functional programming guidelines (persona-aligned)

### 3.1 Functional core
Define domain operations as pure functions:
- parsing/coercion
- selection logic
- keyboard intent mapping
- state transitions

Keep side effects in adapters:
- DOM reads/writes
- timers
- network calls

### 3.2 Model behavior as state machines (when complex)
For components with multiple modes (idle/open/loading/error):

- Prefer explicit state machines, e.g.
  - `type State = { tag: 'idle' } | { tag: 'open'; ... } | ...`
- Transitions should be total and test-covered.
- Side effects triggered by transitions should be centralized.

### 3.3 Functor/Monad-style abstractions (use with discipline)
Allowed when they help:
- Maybe/Option for absent values instead of `null` cascades
- Result/Either for fallible ops (parse, validation)
- Task/Effect (or equivalent) for async flows

Rules:
- Keep naming conventional (`map`, `chain`/`flatMap`, `fold`, `tap`).
- Provide escape hatches to plain JS values.
- Avoid introducing new abstractions if a small pure function suffices.

### 3.4 No hidden mutation
- Treat state as immutable snapshots.
- Prefer reducers: `(state, event) => nextState`.
- When performance requires mutation, isolate it and justify with measurement.

---

## 4) Accessibility (A11y) guidelines (mandatory)

### 4.1 Baseline expectations
Every interactive component must have:
- a programmatic name (label)
- correct role
- keyboard support
- visible focus indicator

Ensure shadow DOM does not break labeling:
- support `aria-label`, `aria-labelledby`
- support slotted labels when appropriate

### 4.2 ARIA pattern fidelity
- Follow established ARIA Authoring Practices.
- Don’t invent roles/states.
- For composite widgets (tabs/menu/listbox/combobox), implement required keys.

### 4.3 Screen reader robustness
- Don’t rely on visual-only cues.
- Use live regions sparingly; prefer structural semantics.
- Ensure disabled/read-only states are conveyed.

### 4.4 Color/contrast and motion
- Respect reduced motion:
  - `@media (prefers-reduced-motion: reduce)`
- Ensure tokens meet contrast requirements (where design tokens exist).

---

## 5) Performance guidelines

### 5.1 Rendering efficiency
- Avoid layout thrash:
  - batch reads then writes
- Use `requestAnimationFrame` for animation loops, not timers.
- Use `repeat` with stable keys for large lists.

### 5.2 Memory & teardown
- Remove global listeners and observers in `disconnectedCallback`.
- Avoid retaining references to slotted nodes after disconnect.

### 5.3 Bundle boundaries
- Keep `libs/web-components` exports tree-shakeable.
- Avoid importing large dependencies into small primitives.

---

## 6) Security & robustness
- Treat all text content as untrusted:
  - don’t inject HTML unless sanitized and explicitly allowed
- Avoid `unsafeHTML` unless the API requires it and you can guarantee sanitization.

---

## 7) Testing guidelines (required)

### 7.1 What must be tested
For every component:
- rendering for key states
- events emitted with correct payload, bubbling/composed behavior
- keyboard interactions
- focus management
- slot behavior (presence/absence changes)
- a11y snapshots/role/name checks where possible

### 7.2 Test style
Prefer tests that assert user-observable behavior:
- DOM output
- events
- focus position
- ARIA attributes

Avoid testing implementation details (internal private fields, exact DOM structure) unless part of public contract (`::part`/slots).

### 7.3 Property-based tests (when suitable)
For pure functional helpers:
- consider property-based testing for parsers/formatters/state transitions

### 7.4 Test pyramid for web components
- Unit tests: component + helpers (most)
- Integration tests: shell usage patterns (some)
- E2E: only for critical flows

---

## 8) Documentation guidelines
Each component should have:
- usage examples
- API tables: props/events/slots/CSS vars/parts
- accessibility notes (role, keyboard)
- “Gotchas” section for edge cases

Prefer docs colocated with code + a consolidated index.

---

## 9) Repo-specific conventions (Vialiq / Nx)
- Place reusable components in `libs/web-components/src/`.
- Export from a single stable `index.ts` (barrel) with deliberate public surface.
- Don’t couple components to `apps/*`.
- Use Nx targets for lint/test/build; prefer affected flows when iterating.

---

## 10) Collaboration / workflow rules for the agent

If the request is ambiguous or high impact:
1. ask clarifying questions
2. propose 2–3 options with tradeoffs
3. recommend one

When asked to implement:
- identify existing reusable code first
- extend/refactor rather than duplicate
- include tests alongside the change

Never commit/push unless explicitly instructed.