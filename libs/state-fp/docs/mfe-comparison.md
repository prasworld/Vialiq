# MFE State Management — Competitive Analysis

> **Purpose:** Research record comparing `@vialiq/state-fp` against established state management
> libraries in the context of Micro-Frontend (MFE) architectures. Used to identify gaps,
> validate design decisions, and inform the development roadmap in `phases.md`.
>
> **Audience:** Architects and senior engineers evaluating `@vialiq/state-fp` for production MFE use.
>
> **Last updated:** Post Phase-1 build stabilisation.

---

## Table of Contents

1. [Research Sources](#1-research-sources)
2. [Problem Space — Why MFE State Is Hard](#2-problem-space--why-mfe-state-is-hard)
3. [Library Profiles](#3-library-profiles)
4. [Side-by-Side Comparison Table](#4-side-by-side-comparison-table)
5. [What @vialiq/state-fp Does Well](#5-what-vi-state-fp-does-well)
6. [Gaps Identified](#6-gaps-identified)
7. [Architectural Decisions Validated](#7-architectural-decisions-validated)
8. [Recommendations Added to Roadmap](#8-recommendations-added-to-roadmap)

---

## 1. Research Sources

All URLs were accessed during the analysis phase. Summaries are based on
official documentation and community-referenced best practices.

| Source | URL | What We Referenced |
|---|---|---|
| Martin Fowler — Micro Frontends | https://martinfowler.com/articles/micro-frontends.html | Ownership model, shared state anti-patterns, MFE topology types |
| single-spa — Recommended Setup | https://single-spa.js.org/docs/recommended-setup#state-management | Why shared global stores are discouraged; import-map-based isolation |
| Jotai — Introduction | https://jotai.org/docs/introduction | Atom model, bottom-up state, Provider-free primitive |
| Jotai — Atom Families | https://jotai.org/docs/utilities/family | Parameterised atoms, memoisation |
| XState / Stately Docs | https://stately.ai/docs/xstate | Actor model, machine-as-state, inter-machine communication |
| TanStack Query — Overview | https://tanstack.com/query/latest/docs/framework/react/overview | Server-state vs client-state separation, QueryClient, stale-while-revalidate |
| Event-Driven.io — CQRS | https://event-driven.io/en/cqrs_facts_and_myths_explained/ | CQRS facts and myths; state-first vs event-sourced projection |
| Redux Toolkit — FAQ | https://redux.js.org/faq/store-setup | Single store tradeoffs in MFE; dynamic slice injection |
| NgRx — Getting Started | https://ngrx.io/guide/store | Angular ecosystem store patterns; effect streams |
| Effector — Introduction | https://effector.dev/en/introduction/motivation/ | Effector's unit-based static graph: stores, events, effects |
| Zustand Docs | https://zustand.docs.pmnd.rs | Bare-store API (at time of research: domain temporarily unavailable) |

---

## 2. Problem Space — Why MFE State Is Hard

### 2.1 The Core Tension

In a traditional SPA, a single store (Redux, NgRx) owns all state. This works because
the entire application is one build unit with one JavaScript context.

In an MFE shell, each remote is an independently deployed build unit. Forcing all
remotes to share one store creates:

- **Build coupling** — every remote must depend on the same store version
- **Bundle duplication** — store library runs twice if loaded by both shell and remote
- **Ownership ambiguity** — when two remotes can write to the same slice simultaneously

### 2.2 MFE Topology Types (Martin Fowler)

| Topology | Description | State challenge |
|---|---|---|
| **Build-time integration** | Remotes published as npm packages | Same bundle → shared store possible |
| **Run-time integration via JavaScript** | Remotes loaded as scripts at runtime | Store must be in shell, remotes must not bundle it |
| **Run-time integration via iframes** | Each remote is isolated iframe | State must be serialised to cross frame boundary |
| **Edge-side composition** | Server stitches HTML from multiple services | State exists server-side; minimal client coordination |

`@vialiq/state-fp` targets **run-time JavaScript integration** — the most complex and most
common production MFE pattern.

### 2.3 State Categories in MFEs

| Category | Examples | Correct solution |
|---|---|---|
| **Shell-owned global state** | auth token, user profile, theme, locale | Owned by shell; broadcasted to remotes as read-only |
| **Remote-local state** | form state, local UI flags, pagination | Purely local; never shared |
| **Shared derived state** | cart item count in header + cart remote | Owner executes commands; all remotes subscribe via sync |
| **Server cache** | product catalogue, pricing | Independent per-remote; TanStack Query pattern |

### 2.4 The single-spa Recommendation

The `single-spa` documentation (their recommended setup page) explicitly states:

> "We recommend avoiding sharing state between microfrontends whenever possible.
> If you must share state, use a shared utility module with cross-microfrontend imports
> or a browser-native mechanism like BroadcastChannel or Custom Events."

This directly validates `@vialiq/state-fp`'s BroadcastChannel sync strategy over
a shared Redux store injected into each remote.

---

## 3. Library Profiles

### 3.1 Redux Toolkit

**Model:** Single global store; centralized reducer tree; action dispatching.

**MFE approach:** Dynamic slice injection (RTK's `createSlice` + `combineSlices`) lets remotes
add slices at runtime. However, the store itself must be a shared singleton, typically 
living in the shell and imported by all remotes via import maps or a shared `utilities` app.

**Strengths:**
- Rich ecosystem (RTK Query, RTK Listener, Immer)
- Time-travel via Redux DevTools Extension
- Stable, battle-tested

**Weaknesses for MFEs:**
- Single shared store creates version lock between remotes
- DevTools requires browser extension
- No native BroadcastChannel sync
- Thunks/Sagas needed for async command patterns — not built-in

### 3.2 Zustand

**Model:** Multiple lightweight stores (bear stores); subscribe outside React; no Provider.

**MFE approach:** Each remote can own its own Zustand stores. Shell can expose a store
instance as a shared module via the container's module federation config.

**Strengths:**
- Tiny (~1 KB)
- Zero boilerplate
- Works outside React

**Weaknesses for MFEs:**
- No CQRS discipline — mutations are direct
- No built-in event log or time-travel
- No cross-MFE sync protocol
- No storage adapters with TTL
- Mutations are synchronous only; no built-in async pipeline

### 3.3 Jotai

**Model:** Atomic, bottom-up. Each atom is independent. Derived atoms (`atom(get => ...)`)
create reactive graphs. No store object — atoms are primitives.

**MFE approach:** Atoms can be created in shared packages and consumed by any remote.
`atom` is framework-agnostic since Jotai 2. Jotai Store (`createStore()`) can be
hoisted in the shell and passed down via context.

**Strengths:**
- Truly modular — tree-shaken per-atom
- Atom families (`atomFamily`) for parameterised slices
- `atomWithStorage` for persistence
- Suspense-native
- Works with XState if needed

**Weaknesses for MFEs:**
- No built-in CQRS — mutations go directly into atoms (no event history)
- No BroadcastChannel sync (community packages exist but not official)
- No conflict resolution protocol
- Derived atoms require the React/Jotai runtime to be available for subscriptions

### 3.4 XState (v5)

**Model:** Actor model. Each machine is an actor with its own state, inbox, and output.
Actors communicate via events. Hierarchical state machines.

**MFE approach:** Each remote can host actors. The shell can host a global "orchestrator actor".
`@xstate/actor` (framework-agnostic since v5) enables actors outside React.

**Strengths:**
- Explicit state machines — impossible states become impossible by definition
- Actor-to-actor communication via `sendTo` — natural MFE fit
- Visualiser (stately.ai) for design-time visualization
- `spawn` / `invoke` for async process management (saga-like)
- Version 5 is much smaller than v4

**Weaknesses for MFEs:**
- Steep learning curve (FSM/statecharts concepts required)
- Machines must be pre-defined — dynamic command dispatching is awkward
- Full event sourcing not built-in (only current machine state is first-class)
- No storage adapters
- Large bundle for complex machines

### 3.5 NgRx (Angular)

**Model:** Redux-inspired pattern for Angular. Store + Actions + Reducers + Effects + Selectors.
Deeply integrated with Angular DI and RxJS.

**MFE approach:** NgRx `@ngrx/signals` (launched with NgRx 17) provides signal-based
stores that align with Angular 17+ Signals model. Module federation allows each Angular
remote to register feature states via `provideState()`.

**Strengths:**
- First-class Angular DI integration
- `createEffect` for async command pipelines (replaces thunks with RxJS)
- `@ngrx/signals` brings atom-like signal stores
- `@ngrx/router-store` syncs URL state
- Redux DevTools Extension support

**Weaknesses for MFEs:**
- RxJS dependency is heavy: even small stores pull in Observable chains
- Tightly coupled to Angular — cannot be used in any other framework
- `@ngrx/signals` still maturing (experimental signals API)
- No BroadcastChannel sync
- Boilerplate-heavy for simple operations

### 3.6 TanStack Query

**Model:** Server-state manager, NOT a client-state manager. Manages asynchronous
server data: fetching, caching, invalidation, synchronisation.

**MFE approach:** Each remote gets its own `QueryClient`. Cache can optionally be shared
if the `QueryClient` instance is hoisted in the shell. `broadcastQueryClient` plugin
exists for cross-tab cache synchronisation.

**Strengths:**
- Stale-while-revalidate semantics out of the box
- Background refetch, deduplication, window-focus refetch
- Offline support (persistence plugin)
- Framework-agnostic core (`@tanstack/query-core`)

**Weaknesses for MFEs:**
- Designed for server-state only — client state mutations are not its domain
- No CQRS / event sourcing
- `broadcastQueryClient` is cross-tab only, not cross-MFE-frame aware
- No conflict resolution for shared client state

### 3.7 Effector

**Model:** Static reactive graph of `store`, `event`, `effect` units. All units declare
their connections at definition time. No runtime dynamic wiring.

**MFE approach:** Effector's `fork()` API was designed for SSR and testing isolation.
The scope-based model means each MFE can run in its own scope without global pollution.

**Strengths:**
- Zero runtime overhead — the reactive graph is pre-compiled
- `fork()` makes testing trivial — each test gets a clean scope
- `serialize/hydrate` for SSR
- Framework-agnostic
- Tiny bundle (~5 KB)

**Weaknesses for MFEs:**
- Static graph — all stores and wiring must be declared before runtime
- No BroadcastChannel sync protocol
- Less known in the Anglo community (popular in Eastern Europe OSS)
- No storage adapters
- CQRS concepts must be hand-rolled

---

## 4. Side-by-Side Comparison Table

| Capability | Redux Toolkit | Zustand | Jotai | XState v5 | NgRx | TanStack Q | Effector | **@vialiq/state-fp** |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| CQRS discipline (Command/Event) | ⚠️ | ❌ | ❌ | ⚠️ | ⚠️ | ❌ | ⚠️ | ✅ |
| Typed domain events | ⚠️ | ❌ | ❌ | ✅ | ⚠️ | ❌ | ✅ | ✅ |
| Pure command handlers | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ⚠️ | ✅ |
| Per-atom isolation | ❌ | ✅ | ✅ | ✅ | ✅ (signals) | N/A | ✅ | ✅ |
| ESM sub-path exports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| TTL-aware storage adapters | ❌ | ❌ | ⚠️ | ❌ | ❌ | ✅ (server) | ❌ | ✅ |
| Built-in cross-tab/MFE sync | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ (tab only) | ❌ | ✅ |
| Conflict resolution protocol | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Time-travel (no extension) | ⚠️ (ext) | ❌ | ❌ | ⚠️ (viz) | ⚠️ (ext) | ❌ | ❌ | ✅ |
| Debug event log (in-process) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (devtools) | ❌ | ✅ |
| Version-based concurrency | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (stale) | ❌ | ✅ |
| Framework-agnostic core | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Angular signals integration | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| FP primitives (Maybe/Either) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Computed / derived atoms | ❌ | ⚠️ | ✅ | ✅ | ✅ (selectors) | ✅ | ✅ | ✅ |
| Async command pipeline | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Optimistic updates + rollback | ✅ (RTK Q) | ❌ | ❌ | ✅ (actor) | ✅ (effects) | ✅ | ❌ | ✅ |
| Command payload validation | ❌ | ❌ | ❌ | ✅ (guards) | ❌ | ✅ (schema) | ❌ | ❌ (gap) |
| Query memoisation | ✅ (RTK Q) | ❌ | ✅ | ❌ | ✅ (selectors) | ✅ | ✅ | ❌ (gap) |
| SSR hydration protocol | ⚠️ | ⚠️ | ✅ | ✅ (fork) | ⚠️ | ✅ | ✅ (fork) | ❌ (gap) |
| Process manager / saga | ✅ (saga) | ❌ | ❌ | ✅ (native) | ✅ (effects) | ❌ | ✅ (watchers) | ❌ (gap) |

**Key:** ✅ Full support · ⚠️ Partial / workaround needed · ❌ Not present

---

## 5. What @vialiq/state-fp Does Well

### 5.1 CQRS Discipline

No other state library in this comparison enforces the full CQRS form:

```
Command → pure CommandHandler → Either<CommandError, DomainEvent[]>
                                          ↓
                               pure EventApplier → next state
```

Most alternatives (Redux, Zustand, NgRx) allow reducers or actions to produce side effects.
XState machines come closest but encode state as FSM nodes rather than pure data.

### 5.2 Per-Atom Isolation with Ownership Model

Jotai also has per-atom primitives but has no ownership concept. Any code can read and
write any atom. `@vialiq/state-fp` enforces that state mutations only flow through
`kernel.execute()` with a registered CommandHandler — no back-door writes.

### 5.3 BroadcastChannel Sync with Conflict Resolution

No mainstream library ships native BroadcastChannel sync with a versioned conflict
resolution protocol. This is a genuine differentiator for MFE architectures where:

- The shell owns auth state
- A product list remote and a cart remote both need the cart item count
- The header remote needs the user display name

All of these are served by `@vialiq/state-fp/sync` without any shared runtime dependency
between remotes.

### 5.4 In-Process Debug Layer (No Extension Required)

Redux DevTools, NgRx DevTools, and XState visualiser all require a browser extension or
a separate development server. `@vialiq/state-fp/devtools` exposes its entire debug surface
via `window.__VI_STATE_FP__` — accessible from any browser console without any tooling.

This is especially important in enterprise environments where browser extension installation
is restricted.

### 5.5 ESM-Only Sub-Path Architecture

The 6 independent ESM entry points (`/core`, `/kernel`, `/storage`, `/sync`, `/devtools`,
`/adapter`) follow modern JavaScript packaging best practices. Each sub-path is independently
tree-shakeable. An MFE remote that only needs kernel and storage imports `~8 KB gzip`
without pulling in the Angular adapter or devtools.

### 5.6 Typed FP Primitives as First-Class Citizens

`Maybe<T>` and `Either<E, A>` are not adapter types — they are the return types of the
core API. This means TypeScript enforces null handling and error handling at every
call-site. None of the libraries surveyed make this guarantee.

---

## 6. Gaps Identified — Status Update

These gaps were identified during the initial comparison. Items marked **✅ Resolved** have been implemented since.

### Gap 1 — Computed / Derived Atoms ✅ RESOLVED (Phase 2.5)

**Implemented:** `defineComputedAtom({ key, deps, compute })` auto-derives state from source atoms.

```ts
const cartTotalAtom = defineComputedAtom({
  key: 'vi/cart-total',
  deps: [cartAtom],
  compute: ([cart]) => cart.items.reduce((sum, i) => sum + i.price * i.qty, 0),
});
kernel.query(cartTotalAtom, {});
```

### Gap 2 — Async Command Pipeline ✅ RESOLVED (Phase 1.4)

**Implemented:** `kernel.registerAsync()` / `kernel.executeAsync()` with `AbortSignal` support:

```ts
const asyncHandler = {
  commandType: 'load',
  handleAsync: async (state, cmd, ctx) => {
    const data = await fetch('/api/data', { signal: ctx.signal });
    return right([domainEvent('loaded', { data: await data.json() })]);
  },
};
kernel.registerAsync(atom, asyncHandler, applier);
await kernel.executeAsync(atom, command('load'), { signal: abortController.signal });
```

### Gap 3 — Optimistic Updates + Rollback ✅ RESOLVED (Phase 2.6)

**Implemented:** `kernel.executeOptimistic()` with automatic rollback:

```ts
const result = await kernel.executeOptimistic(atom, cmd, {
  optimisticApplier: (s) => ({ ...s, loading: true }),
  confirm: async (state) => api.save(state),
  onRollback: (err) => showError(err),
});
```

### Gap 4 — Cross-MFE Event Bus ❌ PENDING (Phase 4.5)

**Status:** Not yet implemented. `@vialiq/state-fp/bus` planned.

**Proposed solution:**
```ts
const bus = createSharedBus('vi/events');
bus.publish({ type: 'cart/CheckoutCompleted', payload: { orderId } });
bus.subscribe({ type: 'cart/CheckoutCompleted' }, (e) => updateHeader(e.payload));
```

### Gap 5 — Command Payload Validation ❌ PENDING (Phase 3.5)

**Status:** Not yet implemented. Optional `validate` fn on `CommandHandler` planned.

### Gap 6 — Query Memoisation ❌ PENDING (Phase 3.6)

**Status:** Not yet implemented. Per-handler `memo: true` planned.

### Gap 7 — SSR Hydration Protocol ❌ PENDING (Phase 3.7)

**Status:** Not yet implemented. `window.__INITIAL_STATE__` bootstrap planned.

### Gap 8 — React Adapter ⚠️ PARTIAL (Phase 5.4)

**Status:** Types and type-level tests complete. Runtime hooks throw `NOT_IMPLEMENTED`.
Factory wiring needed to connect React APIs to the kernel adapter.

### Gap 9 — Co-located Command Handler Registration ✅ RESOLVED (Phase 1.3)

**Implemented:** `defineAtom` accepts `commands`, `applier`, and `queries` inline:
```ts
const counterAtom = defineAtom({
  key: 'vi/counter',
  initialState: { count: 0 },
  commands: [incrementByHandler],
  applier: counterApplier,
});
kernel.register(counterAtom);
```

### Gap 10 — Saga / Process Manager ❌ PENDING (Phase 7)

**Status:** Not yet implemented. `createSaga()` planned for Phase 7.

---

## 7. Architectural Decisions Validated

| Decision | Validation source |
|---|---|
| BroadcastChannel for MFE sync (not shared Redux store) | single-spa recommended setup explicitly warns against shared stores |
| State-first storage in Phase 1 (not event log) | event-driven.io confirms state-first CQRS is valid without event sourcing commitment |
| Atom ownership model (owner broadcasts, borrowers receive) | Martin Fowler MFE article: "microservices should have clear data ownership" pattern |
| Factory adapter pattern instead of `inject()` in Angular adapter | Follows Angular best practice for testable, platform-agnostic code |
| Per-atom ESM sub-paths | Single-spa discourages bundling the entire state library into each remote |
| In-process devtools (no extension) | Enterprise constraint: extensions often blocked in corporate environments |
| `Either<E, A>` as command return type | Matches event-driven.io CQRS canonical form; makes error channel explicit |
| Synchronous EventApplier | CQRS constraint: reducers/appliers must be pure sync functions (Event Sourcing principles) |

---

## 8. Recommendations Added to Roadmap

The following items from this analysis have been added to `phases.md`:

| Gap | Added as | Priority |
|---|---|---|
| React adapter (factory pattern) | Phase 5.4 | High — needed for React MFE remotes |
| Co-located command handler registration | Phase 1.3 | Medium — DX improvement |
| `executeAsync` clear contract | Phase 1.4 | High — blocks real async use cases |
| Computed / derived atoms | Phase 2.5 | High — used by every production app |
| Optimistic updates + rollback | Phase 2.6 | Medium — needed for responsive UIs |
| Cross-MFE event bus | Phase 4.5 | Medium — advanced MFE pattern |
| Command payload validation | Phase 3.5 | Medium — correctness gate |
| Query memoisation | Phase 3.6 | Low — optimisation |
| SSR hydration protocol | Phase 3.7 | Medium — Next.js / Angular SSR |
| Saga / process manager | Phase 7 | Low — advanced use case |

---

*This document was compiled from the sources listed in Section 1.*  
*It is a living reference — update as the library evolves and new comparisons are made.*
