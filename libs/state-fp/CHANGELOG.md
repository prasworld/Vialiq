# Changelog

All notable changes to `@vialiq/state-fp` are documented here.

This file follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions.
Versions follow [Semantic Versioning](https://semver.org/).

---

## [0.5.0] — Phase 5: Framework Adapters

### Added
- **React adapter** (`createReactAdapter`) — factory pattern; zero compile-time dependency on React.
  Provides `Provider`, `useAtom`, `useCommand`, `useQuery`, `useEphemeral` hooks.
- **Angular adapter** (`createAngularAdapter`) — Angular 17+ Signals integration.
  Provides `toSignal`, `toQuerySignal`, `commandDispatcher`.
- **Lit adapter** (`createLitController`, `createLitStreamController`) — Lit Reactive Controller pattern.
  Provides `AtomController<S>` (state / dispatch / query) and `StreamController<T>` (value).
- **Vanilla adapter** (`createAdapter`) — framework-agnostic thin wrapper.
  Provides `watch`, `run`, `read`, `query`, `destroy`.
- `useEphemeral` hook on `ReactKernelAdapter` — RAF-batched or synchronous stream subscription.
- Type-level tests (`test-d/`) for core, kernel, and adapter modules using vitest `expectTypeOf`.
- Per-module API reference docs (`docs/modules/`): `core.md`, `kernel.md`, `storage.md`, `sync.md`, `devtools.md`, `adapter.md`.
- `size` Nx target — reports gzipped output file sizes post-build.
- `version` Nx target — wrapper around `nx release version`.

### Changed
- `ReactContextLike<T>` — removed non-public `_currentValue` field; `Provider` typed as `unknown`; `_brand?: T` phantom added for generic propagation.
- `useAtom` effect deps correctly include `[atom, kernel]` (was `[atom.key]`).
- `useQuery` memo deps correctly include `[state, q, kernel]` (was `[state]`).
- Coverage thresholds enforced at `lines: 90 / functions: 90 / branches: 85 / statements: 90`.

### Security
- `ObfuscatedAdapter` and `EncryptedAdapter` intentionally excluded — client-side encryption provides no real security boundary (decrypted value visible in JS heap and DevTools). Decision documented in `src/storage/types.ts` and `docs/SECURITY.md`.

---

## [0.4.0] — Phase 4: Sync + Devtools

### Added
- Cross-tab atom synchronisation (`@vialiq/state-fp/sync`) via BroadcastChannel.
  Conflict strategies: `last-write-wins`, `first-write-wins`, `owner-wins`, `version-wins`, custom resolver.
- Version vector implementation for causal tracking across peers (`createVersionVector`, `increment`, `merge`, `isConcurrent`).
- Transport abstraction (`createAutoTransport`, `createPostMessageTransport`, `createNoopTransport`, `createPostMessageRelay`).
- DevTools module (`@vialiq/state-fp/devtools`): `EventLog` (circular buffer, O(1) indices), `SnapshotManager`, `TimeTravelController`, `DevToolsBridge` (`window.__VI_STATE_FP__`).
- `KernelPlugin` API — lifecycle hooks (`onRegister`, `onExecute`) plugged into the kernel.
- `EphemeralStream` — push-based event bus with RAF-batched delivery (`subscribeAnimated`).
- `debug: true` kernel option to enable `DebugInterface` hooks.

---

## [0.3.0] — Phase 3: Storage + Persistence

### Added
- Storage module (`@vialiq/state-fp/storage`): `MemoryAdapter`, `LocalAdapter`, `SessionAdapter`, `IndexedDbAdapter`.
- `StorageAdapter<T>` interface — `Either<StorageError, ...>` return types; errors never throw.
- Atom-level storage config (`defineAtom.storage`) with optional TTL and custom key.
- `kernel.hydrate(atom)` — loads persisted state at startup.
- `StorageSecurityPolicy` type — documentation annotation for sensitive atoms.

---

## [0.2.0] — Phase 2: CQRS Kernel

### Added
- `createKernel()` with `execute`, `executeAsync`, `subscribe`, `query`, `hydrate`, `register`, `use`.
- `defineComputedAtom` — derived atoms recomputed from source atoms on state change.
- `command()`, `domainEvent()`, `query()` builder functions with auto-stamped metadata.
- `createCommandHandler`, `createEventApplier`, `createQueryHandler` — typed registration helpers.
- `Either<CommandError, DomainEvent[]>` return type for all command execution paths.
- Kernel unit tests — command dispatch, event sourcing, query execution, subscription lifecycle.

---

## [0.1.0] — Phase 1: Functional Primitives + Atom

### Added
- Initial library scaffolding (`@vialiq/state-fp` Nx project).
- `Maybe<A>` — `just`, `nothing`, `fromNullable`, `isJust`, `isNothing`, `mapMaybe`, `chainMaybe`, `foldMaybe`, `getOrElseMaybe`.
- `Either<E, A>` — `right`, `left`, `isRight`, `isLeft`, `mapEither`, `chainEither`, `foldEither`.
- `IO<A>` — `io`, `liftIO`, `mapIO`.
- `Lens<S, A>` — `lens`, `prop`, `composeLens`, `view`, `over`, `set`.
- `pipe` / `compose` utilities (up to 9 functions, full type inference).
- `defineAtom<S>` — reactive state container with `get()`, `subscribe()`, `key`.
- `tsconfig.lib.json` strict ESM configuration; `"type": "module"` package.
- Nx build target with `@nx/esbuild:esbuild`, sub-path exports for each module.
- Initial unit test suite (vitest 4.x).

---

[0.5.0]: https://github.com/your-org/nx/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/your-org/nx/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/your-org/nx/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/your-org/nx/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/your-org/nx/releases/tag/v0.1.0
