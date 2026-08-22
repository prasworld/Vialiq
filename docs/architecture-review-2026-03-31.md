# Architectural Review — NX Monorepo (31 March 2026)

> **Scope:** Comprehensive review of all libraries, applications, build configuration,
> tooling, and production readiness.  
> **Status:** Findings documented; see [Priority Recommendations](#6-priority-recommendations) for actionable next steps.

---

## Table of Contents

1. [Solution Overview](#1-solution-overview)
2. [What Is Architecturally Sound](#2-what-is-architecturally-sound)
3. [Structural Issues](#3-structural-issues)
4. [Real-World Production Fitness](#4-real-world-production-fitness)
5. [Summary Table](#5-summary-table)
6. [Priority Recommendations](#6-priority-recommendations)

---

## 1. Solution Overview

The workspace is a 5-library + 2-app NX monorepo with Angular 21 micro-frontends, a Lit
web-component library, and two independently publishable state/utility packages. The scope
is ambitious and many design decisions are excellent. The review below identifies what works
well, what is structurally risky, and what will cause friction at production scale.

### Topology at a Glance

```
/apps/
  shell/      Angular 21, webpack MFE host  → remotes: ['remote1']
  remote1/    Angular 21, webpack MFE remote → exposes './Routes'

/libs/
  state-fp/       @vialiq/state-fp v0.5.0, ESM-only, zero external deps
                  modules: core · kernel · storage · sync · devtools · adapter · bus
                  527 tests · vitest v4 · coverage via v8
  web-components/ @vialiq/web-components, Lit 3, modern decorators
                  vite multi-entry build, WDIO browser-runner tests, Storybook 8
  flux-ui/        Design token / UI library
  icons/          SVG icon registry
  automapper/     @vialiq/automapper — object mapping library
                  sub-paths: /angular, /zod, /orm, /fetch-adapter, /deep-clone

/tools/
  generators/     Custom NX workspace generators
```

### Key Versions

| Package                       | Version |
| ----------------------------- | ------- |
| NX                            | 22.5.1  |
| Angular                       | 21.1.x  |
| TypeScript                    | 5.9.x   |
| Vite                          | 7.x     |
| Vitest                        | 4.x     |
| Lit                           | 3.3.x   |
| WDIO                          | 9.27.x  |
| Storybook                     | 10.3.x  |
| `@module-federation/enhanced` | 0.21.x  |

---

## 2. What Is Architecturally Sound

### `@vialiq/state-fp` — design quality is high

**CQRS separation is clean and enforced.** Commands → pure handlers → `DomainEvent[]` →
pure `EventApplier` → new state. No mutation paths exist outside `atom._setState()`. The
kernel pipeline (validate → emit events → apply state → fire-and-forget storage → broadcast
events → notify plugins → debug layer) handles every phase in the correct order.

**Layering is strict and trustworthy.**

```
          ┌──────────────────────────────────────────────────────────┐
          │                    @vialiq/state-fp/adapter              │
          │        Angular · React · Lit · Vanilla shells             │
          └────────────────┬─────────────────────────────────────────┘
                           │ depends on
          ┌────────────────▼─────────────────────────────────────────┐
          │                 @vialiq/state-fp/kernel                  │
          │   CommandBus · QueryBus · DomainEventBus · Atom · Kernel │
          │   KernelPlugin (OCP extension point)                     │
          └──────┬───────────────────────┬────────────────────────────┘
                 │                       │ peer-extends
    ┌────────────▼────────┐  ┌──────────▼──────────┐  ┌───────────────────┐
    │ @vialiq/state-fp/   │  │@vialiq/state-fp/     │  │@vialiq/state-fp/  │
    │ storage             │  │devtools               │  │sync               │
    │ MemoryAdapter only  │  │EventLog · Snapshots  │  │Broadcast·Conflict │
    │ (security-enforced) │  │TimeTravel · Bridge   │  │Versioning         │
    └────────────┬────────┘  └──────────┬───────────┘  └─────────┬─────────┘
                 └──────────────────────┼─────────────────────────┘
                                        │
          ┌─────────────────────────────▼────────────────────────────┐
          │                    @vialiq/state-fp/core                 │
          │    Maybe · Either · IO · Task · Reader · Lens · pipe     │
          └──────────────────────────────────────────────────────────┘
```

Strict layering rules:

- `core` → nothing (zero external deps)
- `kernel` → `core` only
- `storage` / `devtools` / `sync` → `core` only (kernel types via peer, not runtime)
- `adapter` → `kernel` (+ optional `devtools`)
- `bus` → thin BroadcastChannel wrapper for cross-MFE domain event routing

**Factory adapter pattern eliminates compile-time framework coupling.** All four adapters
(Angular, React, Lit, Vanilla) are injected with their framework primitives rather than
importing them directly. A non-Angular test can test `angular.ts` by passing mock
dependencies. This is the correct pattern for a multi-framework library.

**Type-level tests (`test-d/`)** validate TypeScript generics programmatically.
`expectTypeOf` assertions catch regressions in type signatures that no runtime test catches.

**Security posture on storage is strong.** `MemoryAdapter` as the only permitted adapter,
enforced at the architecture level (not just docs), is a principled security decision.

**Vitest coverage gates at 90% lines / 85% branches** are above industry average and are
enforced in `vitest.config.mts` thresholds.

### `@vialiq/web-components`

**TC39 decorator path is the right choice.** Using `accessor` + `decoratorVersion: '2022-03'`
with SWC aligns with the platform direction. As browsers ship native decorator support, the
SWC transform drops away with no code changes required.

**Multi-entry Vite build enables genuine tree-shaking.** Consumers who import
`@vialiq/web-components/button` get only the button bundle. Production-critical for bundle
size.

**WDIO browser runner tests are high-value.** Running tests in real Chrome (headless)
catches decorator runtime failures, shadow DOM behaviour, and browser-specific CSS bugs
that jsdom cannot simulate.

### Module Federation

**Classic Shell+Remote pattern with NX tooling** is well understood and maintainable.
`@nx/module-federation` manages the webpack plumbing.

---

## 3. Structural Issues

### Issue 1 — npm scope split (`@vi/*` vs `@vialiq/*`) ✅ RESOLVED

> **Resolution date:** 31 March 2026  
> **Action:** All published `package.json` names changed from `@vi/*` → `@vialiq/*` to
> match the `tsconfig.base.json` workspace path aliases.

Previously: `libs/state-fp/package.json` used `@vi/state-fp` while the monorepo alias
was `@vialiq/state-fp`. This caused import errors for npm consumers and ambiguous
documentation. Now unified under `@vialiq/*` everywhere.

---

### Issue 2 — `automapper/tsconfig.json` sets `"module": "commonjs"` **[open]**

`libs/automapper/tsconfig.json` sets `"module": "commonjs"` (base tsconfig for
type-checking), while `tsconfig.lib.json` overrides to `"module": "esnext"` for the Vite
build. This means:

- `tsc --noEmit` (type-checking) resolves modules using CJS semantics.
- Vite build uses ESM.

If any source file uses ESM-incompatible patterns, the Vite build masks it and tsc won't
catch it. The base `tsconfig.json` should use `"module": "esnext"` to match the lib and the
workspace ESM-only policy.

**Fix:** Change `libs/automapper/tsconfig.json` → `"module": "esnext"`, `"moduleResolution": "bundler"`.

---

### Issue 3 — `tsconfig.base.json` uses `"moduleResolution": "node"` **[open]**

The root base config uses `"moduleResolution": "node"`. `state-fp` and `web-components`
override this to `"bundler"` (correct for Vite). Angular shell/remote apps inherit `"node"`.
With `"moduleResolution": "node"`, TypeScript requires `.js` extensions on relative ESM
imports — which is not how the files are written. Angular's webpack build tolerates this,
but it exposes the base config as an unreliable baseline.

**Fix:** Change `tsconfig.base.json` → `"moduleResolution": "bundler"` (safe for both Vite
and webpack-based Angular projects).

---

### Issue 4 — `experimentalDecorators: true` leaks into all projects **[open]**

`tsconfig.base.json` enables `experimentalDecorators: true` and `emitDecoratorMetadata: true`
globally. `web-components/tsconfig.json` correctly overrides these off (TC39 mode). But
`state-fp` and other libraries inherit them unnecessarily. Any contributor adding Lit
components inside `state-fp` will accidentally inherit `experimentalDecorators` and get the
runtime decorator error documented in ADR-001.

**Fix:** Remove decorator flags from `tsconfig.base.json`. Move to Angular project-level
configs only (shell, remote1).

---

### Issue 5 — `nx release` covers only `@vialiq/state-fp` **[open]**

`nx.json` configures release automation (versioning, changelog, pre-version build) for
`state-fp` only. `web-components` and `automapper` have `publish-package.json` files but no
release target. Their versioning is manual, which leads to drift, forgotten changelogs, and
accidental breaking changes without semver bumps.

**Fix:** Extend `nx release` to cover all three publishable libraries.

---

### Issue 6 — No CI pipeline files **[open]**

`nx.json` registers `ciTargetName: "test-ci"` for vitest, implying CI is expected. There
are no `.github/workflows/`, `.circleci/`, or equivalent pipeline files. The `nx release`
`preVersionCommand` only runs at release time, not continuously. Without a real pipeline,
lint rules and coverage thresholds only enforce locally.

**Fix:** Add a CI workflow (GitHub Actions recommended) covering:
`lint → test (--watch=false) → build → coverage thresholds` on every PR.

---

### Issue 7 — `@nx/vitest` plugin default `"testMode": "watch"` **[open]**

```json
{ "plugin": "@nx/vitest", "options": { "testMode": "watch" } }
```

This makes `npx nx test state-fp` launch in watch mode (blocking process). CI must always
pass `--watch=false` explicitly. Individual `vitest.config.mts` files set `watch: false` but
the NX plugin-level setting takes precedence for plugin-generated targets.

**Fix:** Change plugin config to `"testMode": "run"`.

---

## 4. Real-World Production Fitness

### `@vialiq/state-fp`

#### Storage: MemoryAdapter-only will be bypassed

Every real application needs to persist at least some state across page reloads (language
preference, last-visited route, non-sensitive settings). With MemoryAdapter-only, developers
will write directly to `localStorage` outside the library, defeating the audit trail and
event log. A `SessionStorageAdapter` with explicit opt-in and a security acknowledgement
tag would serve real apps better while preserving the security default for sensitive atoms.

#### Sync bypasses CQRS — DevTools blind spot

When `SyncEngine` receives a cross-tab state update, it calls `atom._setState()` directly,
bypassing `execute()`. This means the event log and time-travel cannot see sync-originated
state changes. In a production MFE with two tabs open, half the state history is invisible
to DevTools during incident response.

#### Cross-origin MFE limitation

`BroadcastChannel` is same-origin only. Production MFEs commonly serve shell and remotes
from different subdomains or CDN origins. `createPostMessageTransport()` exists for this,
but `createAutoTransport()` (the path developers reach for first) falls back to no-op
without a warning. The transport selection needs a runtime warning when cross-origin context
is detected.

#### `executeAsync` vs Invariant I1 tension

The design states `CommandHandler.handle` is always pure and synchronous (Invariant I1).
`executeAsync` implies async handlers exist. Either the invariant needs updating, or
`executeAsync` must only accept sync handlers with async infrastructure around them. These
two things are currently in tension and will confuse contributors.

#### DevTools bridge in production

`installBridge()` exposes `window.__VI_STATE_FP__` with `getLog()`, `timeTravelTo()`, and
`exportLog()`. In production this exposes the complete state history to anyone with DevTools
access. There is no automatic environment guard — developers must remember to call
`createDevTools()` only in development mode.

**Fix:** Add inside `installBridge()`:

```ts
if (typeof process !== 'undefined' && process.env['NODE_ENV'] === 'production') return;
```

#### Computed atom recomputation is synchronous

`recomputeDependents()` runs inline in the `execute()` pipeline for every command. An
expensive computed atom (e.g., a large list filter) blocks the main thread on every write.
In high-frequency command scenarios (keyboard input, drag), this causes jank. Lazy
recomputation on first read or microtask deferral are standard solutions.

#### `structuredClone` in MemoryAdapter is O(n) per read

Deep-cloning state on every read for isolation is correct for safety but is expensive for
atoms with large collections. Modern state libraries use structural sharing (persistent data
structures or Immer) for this reason.

---

### `@vialiq/web-components`

#### Accessibility is incomplete

`vi-button.ts` correctly manages `aria-disabled` and `tabindex`. Missing:

- Explicit `role="button"` on the host element
- `Enter` / `Space` keyboard event handlers on the host (a native `<button>` handles
  these, but shadow DOM wrapping can interfere when external code listens on the host)
- `aria-label` and `aria-describedby` attribute pass-through for consumers who need them

#### `unsafeCSS` needs a safety comment

`unsafeCSS(buttonStyles)` is safe (static SCSS import, not user input) but will be flagged
by every security reviewer and automated SAST scanner without an inline comment explaining
why it is safe.

#### No dark-mode / `prefers-color-scheme` strategy

The BEM + Flux UI token fallback strategy is correct for theming. Dark-mode support (via
CSS `prefers-color-scheme` media query on token values) is a table-stakes requirement in
2026 and is not yet documented or implemented.

#### WDIO `maxInstances: 1` will be a bottleneck

Tests are currently serial. As the component library grows, this becomes the slowest step
in CI. Plan for parallelisation (2–4 instances) before the test count grows significantly.

---

### Module Federation (Shell + Remote1)

#### Shared dependency versioning is a runtime risk

The `module-federation.config.ts` files use NX's default shared config. When Angular is
upgraded in one remote before the shell, shared singletons can fail silently or throw
`Error: No root module available!`. The shared dependency version matrix must be explicit
and documented.

#### Only one remote — risks not yet visible

The critical operational problems with Module Federation at scale (build ordering, version
drift, remote unavailability, fallback UX) will only surface when more remotes are added.
The architecture should be stress-tested with 3–4 remotes before being declared
production-ready.

#### No remote health-check or error boundary

If `remote1` is unavailable, the shell's lazy route throws unhandled. Angular's
`loadChildren` can return a fallback component on failure. This pattern is not yet in place.

---

### `@vialiq/automapper`

#### Sub-path imports will fail for npm consumers

`tsconfig.base.json` registers `/angular`, `/zod`, `/orm`, `/fetch-adapter`, `/deep-clone`
sub-paths. These work inside the monorepo via path aliases. But `publish-package.json` has
no `"exports"` field. npm consumers calling `import from '@vialiq/automapper/angular'` will
receive `ERR_PACKAGE_PATH_NOT_EXPORTED`. An `"exports"` map matching all sub-paths is
required in the published package.

---

## 5. Summary Table

| Area                                 | Rating        | Key Concern                                         |
| ------------------------------------ | ------------- | --------------------------------------------------- |
| `state-fp` module design             | ✅ Strong     | Layer enforcement, testability, type-level tests    |
| `state-fp` real-world storage        | ⚠️ Limited    | MemoryAdapter-only blocks persistence use cases     |
| `state-fp` DevTools in production    | ❌ Risk       | `window.__VI_STATE_FP__` needs auto-guard in prod   |
| Sync + CQRS coherence                | ⚠️ Gap        | Sync `_setState` bypasses event log                 |
| Cross-origin MFE transport           | ⚠️ Silent     | `createAutoTransport()` fails silently cross-origin |
| Web components build                 | ✅ Strong     | Multi-entry ESM, real-browser testing               |
| Web components a11y                  | ⚠️ Incomplete | `role`, keyboard, aria pass-through missing         |
| Module Federation                    | ⚠️ Early      | Shared dep strategy untested at scale               |
| npm scope consistency                | ✅ Resolved   | Unified under `@vialiq/*` (31 March 2026)           |
| `tsconfig.base.json` decorator bleed | ⚠️ Risk       | `experimentalDecorators: true` leaks globally       |
| `automapper` exports map             | ❌ Missing    | Sub-path imports will fail for npm consumers        |
| CI/CD pipeline                       | ❌ Missing    | No pipeline files; gates only enforced locally      |
| Release automation                   | ⚠️ Partial    | Only `state-fp` has `nx release`; others manual     |
| `vitest` watch mode default          | ⚠️ Gotcha     | `testMode: "watch"` will deadlock CI                |

---

## 6. Priority Recommendations

Items are ordered by risk severity.

### P0 — Security / Runtime Failures

1. **Guard `installBridge()` against production.** Add an environment check so
   `window.__VI_STATE_FP__` is never exposed in production builds.

2. **Add `"exports"` map to `automapper/publish-package.json`** covering all sub-paths
   (`/angular`, `/zod`, `/orm`, `/fetch-adapter`, `/deep-clone`). Without it, npm consumers
   cannot use sub-path imports.

### P1 — Structural / Build Correctness

3. **Fix `automapper/tsconfig.json`:** change `"module": "commonjs"` →
   `"module": "esnext"`, add `"moduleResolution": "bundler"`.

4. **Fix `tsconfig.base.json`:**
   - Change `"moduleResolution": "node"` → `"moduleResolution": "bundler"`.
   - Remove `experimentalDecorators` and `emitDecoratorMetadata` (move to per-project
     Angular configs).

5. **Change `nx.json` `testMode: "watch"` → `"testMode": "run"`** to prevent CI
   process deadlocks.

### P2 — CI / Release

6. **Add a CI workflow file** (GitHub Actions) enforcing:
   `lint → test → build → coverage` on every PR, using `--watch=false`.

7. **Extend `nx release` to `web-components` and `automapper`** to prevent manual
   version drift and missed changelogs.

### P3 — Feature Completeness

8. **Add a runtime warning in `createAutoTransport()`** when a cross-origin
   context is detected and BroadcastChannel will not work.

9. **Clarify `executeAsync` vs Invariant I1** — either update the invariant in
   `docs/architecture.md` or constrain `executeAsync` to sync-only handlers.

10. **Accessibility hardening for `vi-button`:**
    - Add `role="button"` to the host element.
    - Add `keydown` handler for `Enter` / `Space`.
    - Add `aria-label` / `aria-describedby` reflected properties.

11. **Add dark-mode token strategy** to `flux-ui` and document `prefers-color-scheme`
    usage in the web-components theming guide.

12. **Plan WDIO parallelisation** (`maxInstances: 2–4`) before component count grows.

13. **Plan a `SessionStorageAdapter`** (opt-in, with explicit security acknowledgement)
    to support the common persistence use cases that currently push developers around the
    library.

---

_Review conducted by: GitHub Copilot / Claude Sonnet 4.6_  
_Date: 31 March 2026_
