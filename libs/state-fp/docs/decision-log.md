# @vi/state-fp — Architecture Decision Log

> **Format:** Based on [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119) and
> [Michael Nygard's ADR template](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).  
> **How to use this document:** When you make a significant architectural choice, copy the
> [ADR Template](#adr-template) at the bottom, fill it in, and submit it with your PR.  
> **Living document:** Superseded decisions are kept for historical context.

---

## Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| [ADR-001](#adr-001) | CQRS over Flux/Redux | Accepted | 2024-Q1 |
| [ADR-002](#adr-002) | FP primitives (Maybe, Either) over null/throw | Accepted | 2024-Q1 |
| [ADR-003](#adr-003) | Factory adapter pattern over Angular DI classes | Accepted | 2024-Q1 |
| [ADR-004](#adr-004) | ESM-only, no CJS dual output | Accepted | 2024-Q1 |
| [ADR-005](#adr-005) | Sub-path exports per module | Accepted | 2024-Q1 |
| [ADR-006](#adr-006) | BroadcastChannel sync over shared kernel singleton | Accepted | 2024-Q2 |
| [ADR-007](#adr-007) | In-process devtools over Redux DevTools Extension | Accepted | 2024-Q2 |
| [ADR-008](#adr-008) | No EncryptedAdapter; memory-only for sensitive data | Accepted | 2024-Q2 |
| [ADR-009](#adr-009) | One kernel per MFE; ownership model | Accepted | 2024-Q2 |
| [ADR-010](#adr-010) | State-level sync; no event replication (Phase 4) | Accepted | 2024-Q3 |
| [ADR-011](#adr-011) | SharedEventBus as a separate module | Accepted | 2024-Q3 |
| [ADR-012](#adr-012) | EphemeralStream for high-frequency UI state | Accepted | 2024-Q3 |
| [ADR-013](#adr-013) | KernelPlugin OCP extension point | Accepted | 2024-Q3 |
| [ADR-014](#adr-014) | Synchronous appliers; no async appliers | Accepted | 2024-Q3 |

---

## ADR-001

### CQRS over Flux/Redux reducer

**Status:** Accepted  
**Date:** 2024-Q1  
**Author:** Core team

#### Context

The original prototype used a Flux-style `dispatch(action) → reducer(state, action)` model,
matching what most Angular/React teams already know. As the MFE use-case demanded time-travel
debugging and state replication across tabs, the single-reducer model showed limitations:
replay had to re-run validation logic (expensive); there was no named intent; state projection
and business rules were entangled in one function per action type.

#### Decision

Adopt **CQRS**: separate `CommandHandler` (validates intent, emits `DomainEvent[]`) from
`EventApplier` (pure function from `(state, event) → state`). The kernel receives commands
via `execute()` and queries via `query()`.

#### Consequences

**Positive:**
- Event appliers are idempotent pure functions — safe to replay for time-travel without
  re-running business rules.
- Validation is isolated in command handlers — testable without a store.
- Named `DomainEvent` types (e.g., `'cart/itemAdded'`) serve as an audit log.
- Query handlers are pure derived projections — memoizable, testable, composable.

**Negative:**
- Steeper learning curve for developers used to Redux `dispatch()`.
- More files per feature (handler + applier + atom + queries) vs. one reducer file.
- Commands that produce no events (pure queries) are routed through a separate `query()`
  path — developers must understand when to use `execute()` vs `query()`.

---

## ADR-002

### FP primitives (Maybe, Either) over `null`/`undefined`/`throw`

**Status:** Accepted  
**Date:** 2024-Q1

#### Context

TypeScript allows `null` and `undefined` but its strict null checks can be disabled and
they are often worked around with `!` non-null assertions. Errors thrown from deeply nested
calls are invisible to callers (nothing in the function signature indicates the throws).
The library needed a principled approach to optional values and error handling.

#### Decision

Provide `Maybe<T>` (= `Just<T> | Nothing`) and `Either<L, R>` (= `Left<L> | Right<R>`)
as the core primitives for all nullable and failable operations. The kernel's `execute()`
returns `Result<CommandError, S>` (alias for `Either`). Storage operations return
`Either<StorageError, T>`. Query handlers return typed `R`.

#### Consequences

**Positive:**
- Errors appear in function signatures — callers know the failure modes at compile time.
- `foldMaybe` / `match` force handling of both branches — no silent null propagation.
- Time-travel replay is clean: appliers receive `DomainEvent`, never `null`, never `Error`.
- Tests can assert on typed error codes (`e.code === 'INVALID_QTY'`) without try/catch.

**Negative:**
- Developers unfamiliar with FP must learn `left/right/just/nothing/foldMaybe/match` idioms.
- Interop with vanilla third-party code requires wrapping:
  ```ts
  // Wrap a Promise that might reject
  const result = await someExternalPromise()
    .then(v => right(v))
    .catch(e => left({ code: 'EXTERNAL_ERROR', message: e.message }));
  ```
- `Either` is not `Promise` — async command handlers must `await` and then wrap.

---

## ADR-003

### Factory adapter pattern over Angular DI classes

**Status:** Accepted  
**Date:** 2024-Q1

#### Context

Early adapters were `@Injectable()` classes that called `inject()` internally. This tied them
to Angular's injection context — you could not instantiate or test an adapter outside a
test that bootstrapped `TestBed`. It also created a compile-time `@angular/core` dependency
in the state library itself.

#### Decision

All adapters are created via **factory functions** that receive framework APIs as plain
objects. Angular APIs (`signal`, `inject`, `DestroyRef`) are passed at construction time:
```ts
export const ngAdapter = createAngularAdapter({ signal, inject, DestroyRef });
```
No `@angular/core` import anywhere in the adapter factory source.

#### Consequences

**Positive:**
- Adapters are testable with mock objects in plain Jest/Vitest — no `TestBed`, no Angular.
- The state library compiles without Angular installed.
- Multiple Angular versions (14, 15, 17) can pass their own `signal`/`DestroyRef` without
  forking the adapter code.
- The React adapter follows the same pattern — no react peer dep in source, injected at call
  site.

**Negative:**
- Slightly more setup boilerplate at app level (call the factory once in `app.config.ts`).
- Developers must export the adapter instance for use in components — cannot rely on Angular
  DI to inject the adapter automatically.

---

## ADR-004

### ESM-only, no CJS dual output

**Status:** Accepted  
**Date:** 2024-Q1

#### Context

NPM packages historically ship both `"main"` (CJS) and `"module"` (ESM) fields. The dual
format adds build complexity and the `"main"` CJS build cannot be statically tree-shaken.
The target ecosystem (Vite, webpack 5+, esbuild, Rollup, Nx esbuild) fully supports ESM.

#### Decision

`package.json` sets `"type": "module"`. Only `"exports"` with `"import"` conditions are
published. No `"require"` condition; no CJS artefacts in the `dist/` folder.

#### Consequences

**Positive:**
- Full static tree-shaking at entry-point granularity. An app that only imports
  `@vi/state-fp/kernel` gets zero bytes of adapter/devtools/sync code.
- Simpler build pipeline — one output format.
- `"type": "module"` catches accidental `require()` calls at startup (fail-fast).

**Negative:**
- Cannot be `require()`-d in CommonJS scripts. Workaround: dynamic `import()` in CJS.
- Node.js < 12.22 (EOL since 2021) cannot consume the package.
- Some Jest configurations need `extensionsToTreatAsEsm` or `vm.Module` — configured in
  the repo's `vitest.config.mts`.

---

## ADR-005

### Sub-path exports per module (`/core`, `/kernel`, `/sync`, …)

**Status:** Accepted  
**Date:** 2024-Q1

#### Context

A single `@vi/state-fp` export would force everything into one bundle chunk. A remote that
only needs the kernel would pull in Angular/React adapter code it never uses. Sub-paths also
make version negotiation explicit: a remote declares which sub-paths it depends on.

#### Decision

Define one `exports` entry per module in `package.json`:
```jsonc
{
  "exports": {
    "./core":     { "import": "./dist/core/index.js" },
    "./kernel":   { "import": "./dist/kernel/index.js" },
    "./storage":  { "import": "./dist/storage/index.js" },
    "./sync":     { "import": "./dist/sync/index.js" },
    "./devtools": { "import": "./dist/devtools/index.js" },
    "./adapter":  { "import": "./dist/adapter/index.js" },
    "./bus":      { "import": "./dist/bus/index.js" }
  }
}
```

#### Consequences

**Positive:**
- Each remote only bundles what it imports.
- Module boundaries are enforced by the package system — `devtools` cannot accidentally
  `import` from `adapter` without a circular dependency error.
- TypeScript sub-path type resolution is exact; no ambient re-exports needed.

**Negative:**
- Import strings are longer (`@vi/state-fp/kernel` vs `@vi/state-fp`).
- A developer must know which sub-path owns which export (mitigated by this doc and the
  module reference in [developer-guide.md](./developer-guide.md#5-file-by-file-reference)).
- Adding a new sub-path requires updating `package.json` exports AND `tsconfig.json` paths.

---

## ADR-006

### BroadcastChannel sync over shared kernel singleton

**Status:** Accepted  
**Date:** 2024-Q2

#### Context

The most natural way to share state in Module Federation is to put one kernel in the shared
scope and have all remotes import it. This was prototyped and rejected.

**Problems with shared singleton:**
- If shell ships `@vi/state-fp@1.1` and a remote ships `@1.2`, the version resolution is
  ambiguous; Module Federation may load two versions or panic.
- A slow-loading remote stalls waiting for the singleton to initialise (race condition).
- Debugging is harder: all atoms appear to live in "one place" but they may have been
  registered from multiple remotes.

#### Decision

Each MFE creates **its own kernel**. State is replicated across kernels using BroadcastChannel
(via `@vi/state-fp/sync`) with a vector-clock conflict-resolution protocol. The sync boundary
is the **atom key** — there is no shared JS object.

One atom is owned by the MFE that called `kernel.register()`. Other MFEs are **borrowers**:
they call `sync.share(atom, { channel, conflict })` to receive state but never call
`kernel.execute()` on a borrowed atom.

#### Consequences

**Positive:**
- Zero version coupling between shell and remote state libraries.
- A remote that has not yet loaded does not block the shell.
- BroadcastChannel is a browser-native API — no runtime overhead for the sync library itself.
- Clear ownership model: one owner, N borrowers.

**Negative:**
- State sync has non-zero latency (< 1 ms typically, but not synchronous).
- Cross-origin remotes (different origins in iframes) cannot use BroadcastChannel — requires
  a custom `SyncTransport` using PostMessage (planned in Phase 4.6).
- Developers must set up `sync.share()` on each borrower — not zero-config.

---

## ADR-007

### In-process devtools over Redux DevTools Extension

**Status:** Accepted  
**Date:** 2024-Q2

#### Context

Redux DevTools Extension is the de-facto standard for frontend state debugging. Integrating
with it would give users a familiar UI. However, it assumes the Redux action/reducer model and
requires a browser extension.

#### Decision

Implement **in-process devtools** (`@vi/state-fp/devtools`) that:
- Record events in a circular buffer (`EventLog`) up to `maxEventLogSize`
- Capture state snapshots (`SnapshotManager`) for fast time-travel replay
- Expose `window.__VI_STATE_FP__` in development builds
- Support time-travel via `TimeTravelController`

No external dependency on any browser extension or DevTools protocol.

#### Consequences

**Positive:**
- Works in enterprise environments that block browser extensions.
- Fits the CQRS/event-sourcing mental model natively (no action→event translation needed).
- `window.__VI_STATE_FP__` is accessible from the console, Cypress, Playwright, and
  integration test harnesses — not limited to the Redux DevTools UI.
- Zero overhead in production: the plugin is not installed; `createKernel()` short-circuits
  the debug path immediately when `debug: false`.

**Negative:**
- No browser extension UI — developers must use the console API or integrate the devtools
  output into their own debug panels.
- Redux DevTools Extension integration planned as Phase 5+ add-on.

---

## ADR-008

### No `EncryptedAdapter`; memory-only for sensitive data

**Status:** Accepted  
**Date:** 2024-Q2

#### Context

Several teams requested an `EncryptedAdapter` wrapping `localStorage` with AES-GCM
(derived via PBKDF2) to prevent casual reads from DevTools. Three implementation attempts
were made and all were rejected.

#### Decision

No `EncryptedAdapter` is provided. The `StorageAdapter` interface is intentionally left open
for teams that want to implement their own. The recommended patterns are:
1. `memory-only` storage policy for credentials, tokens, and PII.
2. `stateSanitizer` on `KernelOptions` to redact sensitive fields from DevTools recording.
3. Server-side data management for regulated (HIPAA/GDPR) data — never persist client-side.

#### Why client-side encryption provides no meaningful security

1. **Key delivery is plaintext.** The encryption key must enter the JS runtime as a string
   (session cookie, server nonce, PBKDF2 password). A DevTools breakpoint on the key
   derivation function exposes it before the ciphertext is touched.
2. **Post-decryption heap visibility.** After `crypto.subtle.decrypt()`, the plaintext lives
   in a JavaScript `ArrayBuffer`. Chrome Memory Profiler captures live heap snapshots that
   include ArrayBuffers.
3. **IV/ciphertext co-location.** The IV and salt must be stored alongside the ciphertext
   (otherwise decryption is impossible after reload). An attacker who steals the key can call
   `crypto.subtle.decrypt()` directly from the console with the stored IV and ciphertext.

#### Consequences

**Positive:**
- Security posture is honest: teams do not rely on false protection.
- The library is not responsible for incorrect encryption implementations by consumers.
- `memory-only` policy enforces correct security practices through constraint.

**Negative:**
- Teams unfamiliar with the reasoning may re-implement an `EncryptedAdapter` on their own
  (document this decision prominently for that reason).
- Some compliance frameworks require "encryption at rest" — clarify with the security team
  that client-side JS encryption does not satisfy this requirement.

---

## ADR-009

### One kernel per MFE; atom ownership model

**Status:** Accepted  
**Date:** 2024-Q2

#### Context

In early prototypes, the shell passed its kernel instance to remotes via Module Federation
shared scope. This created a tight runtime coupling where all remotes directly mutated the
same in-memory kernel object.

#### Decision

Each MFE creates exactly one kernel via `createKernel()`. The kernel is a private singleton
within that MFE's JS context.

**Ownership rules:**
1. **One owner per atom:** The MFE that calls `kernel.register(atom, handler, applier)` owns
   that atom and is the only MFE that calls `kernel.execute()` against it.
2. **Borrowers are read-only:** A borrower calls `sync.share(atom, { conflict: 'owner-wins' })`
   to receive state updates. It never calls `kernel.execute()` on a borrowed atom.
3. **The sync layer is the only boundary:** Ownership crosses MFE boundaries only via
   serialised state messages on BroadcastChannel (or custom Transport).

#### Consequences

**Positive:**
- No implicit cross-MFE mutations: a remote cannot accidentally `execute()` a shell command.
- Clear provenance: every state change is traceable to exactly one MFE's command handler.
- MFEs can be independently deployed without coordinating kernel versions.

**Negative:**
- Teams must establish a **shared atom definition library** (shared type contracts) so that
  both owner and borrower reference the same atom key and initial state shape.
- `sync.share()` setup on every borrower is mildly repetitive in large deployments.

---

## ADR-010

### State-level sync; no event replication (Phase 4)

**Status:** Accepted (Phase 4)  
**Date:** 2024-Q3  
**Supersedes:** *N/A* (new decision)

#### Context

Event sourcing theoretically enables remotes to rebuild state by replaying domain events.
This would provide a richer audit trail. However, event-level sync requires **atomic delivery
guarantees** — if two events from the same command arrive out of order or one is lost,
the remote's state diverges.

BroadcastChannel delivers messages on a best-effort basis. It does not guarantee ordering
across multiple origins, and it has no acknowledgement mechanism.

#### Decision

Phase 4 syncs **state snapshots** only: after each successful `execute()`, the SyncEngine
broadcasts `{ atomKey, state, version: vectorClock, ts }`. Remotes apply the state directly;
CQRS validation is bypassed on the remote. Events are NOT replicated in Phase 4.

Phase 5 may introduce optional event replication via a dedicated ordered transport (e.g.,
a WebSocket relay).

#### Consequences

**Positive:**
- BroadcastChannel reliability is sufficient for state snapshots (idempotent, last-write-wins
  at the transport level if vector clocks agree).
- Remotes always converge to the correct state regardless of message loss.
- The sync protocol is simpler — one message type, no event sequence tracking.

**Negative:**
- Remotes cannot replay individual domain events. The event log in each DevTools instance
  is local to its MFE.
- Audit trails are per-MFE, not globally correlated.
- A remote that was offline during a burst of events sees only the latest state when it
  reconnects, not the intermediate history.

---

## ADR-011

### `SharedEventBus` as a separate module (`@vi/state-fp/bus`)

**Status:** Accepted  
**Date:** 2024-Q3

#### Context

Some cross-MFE communication (analytics events, toast notifications, navigation instructions)
is **ephemeral** — it does not need to be persisted in any atom. Using `sync.share()` for these
events would require defining atoms and handlers for data that has no persistent value.

An alternative was to extend the `SyncEngine` with event-only messages. This was rejected
because mixing persistent-state messages with ephemeral events in one BroadcastChannel
complicates protocol parsing and increases message volume for borrowers that don't care
about ephemeral events.

#### Decision

Create `@vi/state-fp/bus` as a thin wrapper around BroadcastChannel that:
- Publishes `CrossMFEEvent = { source: string; event: DomainEvent }` messages.
- Subscribes with optional `EventFilter = { type?: string; source?: string }`.
- Falls back to a noop bus in SSR (no BroadcastChannel in Node.js).
- Can be used completely independently of the kernel/sync modules.

#### Consequences

**Positive:**
- Clean separation: state sync and event broadcast use different channels by convention.
- Teams that only need event broadcast don't interact with the kernel.
- Filtering is built-in (by `source`, by `type`, or both) — no roll-your-own pub-sub.

**Negative:**
- Two separate systems to understand (sync vs. bus); developers must choose the right one.
- The same event could travel both via sync (as part of a StateMessage's optional `events`)
  and via bus if a developer mistakenly wires both. Document this clearly.

---

## ADR-012

### `EphemeralStream<T>` for high-frequency UI state

**Status:** Accepted  
**Date:** 2024-Q3

#### Context

Mouse position, scroll offsets, drag deltas, and animation values change far faster than the
atom+kernel mechanism is designed for. Running `kernel.execute()` at 200 Hz would exceed the
DevTools buffer quickly and create CPU pressure from snapshot and synchronisation overhead.

#### Decision

Introduce `EphemeralStream<T>` in `@vi/state-fp/kernel` as a lightweight pub-sub alternative
for high-frequency, non-persisted values:
- `stream.emit(value)` — synchronous; calls all direct listeners immediately.
- `stream.subscribeAnimated(listener)` — RAF-batched; coalescences all emits in one frame.
- `stream.last` — returns the last emitted value; readable at any time.
- Not persisted, not synced, not recorded in DevTools.

#### Consequences

**Positive:**
- UI updates at up to 60 fps with minimal CPU overhead (one RAF per stream per frame).
- Developers have a native high-frequency reactive primitive — no need to reach for
  RxJS `Subject` just to handle mouse events.
- Clean API that mirrors the kernel subscribe/unsubscribe contract.

**Negative:**
- Not persisted or synced — cannot be observed by DevTools or SyncEngine.
- Developers must understand the distinction between atoms (CQRS, persistent, synced) and
  streams (ephemeral, high-frequency, local).
- Loss of intermediate values when using `subscribeAnimated` — only the last value in a
  frame is delivered.

---

## ADR-013

### `KernelPlugin` OCP extension point

**Status:** Accepted  
**Date:** 2024-Q3

#### Context

As the library grew — DevTools, analytics integration, error reporting — it was tempting to
add optional flag params to `createKernel()` (e.g., `{ debug: true, analytics: true }`).
This approach closes the kernel to new capabilities without source modification, violating
the Open-Closed Principle.

#### Decision

Define `KernelPlugin = { name, onRegister?, onExecute?, onError? }` and add `kernel.use(plugin)`.
The kernel calls plugin lifecycle hooks synchronously at the appropriate points. The devtools
are installed as `kernel.use(devtools.plugin)` — they are not a special case in the kernel.

#### Consequences

**Positive:**
- Third-party plugins (observability, analytics, tracing) extend the kernel without
  patching its source.
- DevTools, logging, and error-reporting are purely additive — the core kernel has no
  knowledge of them.
- Multiple plugins can be stacked: `kernel.use(loggingPlugin); kernel.use(analyticsPlugin)`.
- Production builds that never call `kernel.use()` pay zero overhead.

**Negative:**
- Plugin ordering matters when plugins read each other's side effects (e.g., an audit plugin
  that reads devtools event log must be installed after devtools).
- Plugins run synchronously inside `execute()` — a slow `onExecute` hook blocks the
  command response. Plugins must not perform I/O.

---

## ADR-014

### Synchronous event appliers; no async appliers

**Status:** Accepted  
**Date:** 2024-Q3

#### Context

Feature requests have included async appliers — appliers that `await` side effects (e.g.,
writing to storage, making API calls) before returning new state. This would simplify certain
patterns where the new state depends on an async operation.

#### Decision

Event appliers (`EventApplier`) are **synchronous pure functions** of the form
`(state: S, event: DomainEvent) => S`. They must return synchronously and must not produce
side effects.

**Rationale:**
1. **Time-travel replay must be deterministic.** If an applier `await`-s a network call during
   replay, the replayed state depends on current network conditions — defeating the purpose.
2. **Appliers are the history record.** Any async work that the applier needs is a side effect
   that belongs in a `CommandHandler` (pre-commit) or a `KernelPlugin.onExecute` (post-commit).
3. **State consistency.** Atom state is always readable synchronously (`atom.get()`). An async
   applier would mean state is in an indeterminate "updating" phase — breaking the invariant.

Async operations belong in command handlers:
```ts
const handler = createCommandHandler({
  commandType: 'save/profile',
  handle: async (state, cmd) => {
    const res = await profileService.save(cmd.payload);   // async here
    if (res.error) return err({ code: 'SAVE_FAILED', message: res.error });
    return ok([domainEvent('profile/saved', res.data)]);   // event is synchronous fact
  },
});
// The applier just maps the event to state synchronously
```

#### Consequences

**Positive:**
- Replay (time-travel) is always deterministic.
- `atom.get()` is always consistent — never in a partial state.
- Appliers remain trivially testable: no mocks, no async test infrastructure.

**Negative:**
- Developers who want to write to storage inside an applier must learn to do it in
  a plugin's `onExecute` hook instead.
- Error handling for post-command side effects is less obvious — use `KernelPlugin.onError`.

---

## ADR Template

Copy and fill this out when making a new architecture decision:

```markdown
## ADR-NNN

### <Short title>

**Status:** Accepted | Deprecated | Superseded by ADR-NNN  
**Date:** YYYY-QN  
**Author:** <name or team>

#### Context

<What problem or situation led to this decision? What forces are at play?>

#### Decision

<What was decided? Be specific. Include code snippets if helpful.>

#### Consequences

**Positive:**
- <Benefit>

**Negative:**
- <Trade-off or limitation>
```
