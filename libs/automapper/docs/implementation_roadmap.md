# @vi/automapper — Implementation Roadmap

This document analyses the **current implementation**, compares it against
industry-standard TypeScript / .NET automapper libraries
(`@automapper/core` by nartc, `AutoMapper .NET`), identifies gaps, and
proposes a phased delivery plan prioritised by developer impact.

---

## 1. Current Implementation Inventory

| Module | What exists today |
|---|---|
| `core.ts` | `createMapper`, `addProfile`, `map`, `mapArray`, `getMapper`, `addStrategy`, `use(plugin)`, circular-ref guard, plugin lifecycle notifications |
| `builder.ts` | `MappingBuilder` with `forMember` (typed overload), `beforeMap`, `afterMap`, `extend` |
| `strategy.ts` | `DefaultStrategy` — autoMap, member rules, strict mode, naming convention, depth limit |
| `async.ts` | `AsyncStrategy` — mirrors DefaultStrategy with `mapFromAsync` support |
| `converters.ts` | `ConverterRegistry`, built-in String↔Number, String↔Date converters |
| `naming.ts` | `NamingConvention` enum + transformers (camel, snake, pascal) |
| `options.ts` | `MapperOptions` (strict, autoMap, namingConvention, maxDepth, circularRefBehavior, pluginValidation) |
| `plugin.ts` | `MapperPlugin`, `PluginMetadata`, `PluginLifecycle`, `PLUGIN_API_VERSION`, `PluginAwareRegistry` |
| `context.ts` | `MappingContext` (operationId, startedAt, items bag) |
| `utils.ts` | `setPath`, `getPath`, circular sentinels |
| `profiling.ts` | `ProfilingStrategy` — wraps any strategy and logs duration |
| `plugins/logging.ts` | `LoggingStrategy` + `LoggingPlugin` reference implementation |

**Strengths**
- Zero-dependency core
- Fully typed `forMember` generics
- Plugin system with API-version enforcement and rollback on install failure
- Circular reference detection with configurable behavior
- Async-first strategy (opt-in `AsyncStrategy`)
- Per-profile lifecycle hooks (`beforeMap` / `afterMap`)
- MappingContext propagated through the entire pipeline

**Gaps vs. industry standards** (detailed per phase below)

---

## 2. Comparison: @automapper/core (nartc) & AutoMapper .NET

| Feature | @vi/automapper | @automapper/core | AutoMapper .NET |
|---|---|---|---|
| Profile class pattern | Function-based only | Class-based `ProfileBase` | Class `Profile` |
| Decorator / metadata-based mapping | ❌ | ✅ (`@AutoMap()`) | ✅ |
| Constructor injection (DI) | ❌ | ✅ NestJS module | ✅ |
| `condition()` — map only when predicate | ❌ | ✅ | ✅ |
| `nullSubstitution` | ❌ | ✅ | ✅ |
| `defaultValue` on member | ❌ | ✅ | ✅ |
| `preCondition()` (skip whole mapping) | ❌ | ✅ | ✅ |
| `fromValue()` — constant value | ❌ | ✅ | ✅ |
| Flattening (dot-path source) | ❌ | ✅ | ✅ |
| Source → multiple destinations (fan-out) | ❌ | via multiple profiles | ✅ |
| Reverse mapping (`reverseMap`) | ❌ | ✅ | ✅ |
| Value transformers (global post-process) | ❌ | ✅ | ✅ |
| Type converter class (reusable) | Partial (`mapWith` inline) | ✅ full class | ✅ |
| Global type converters (auto-applied) | ✅ `registerConverter` | ✅ | ✅ |
| Typed validation (`assertConfigurationIsValid`) | ❌ | ✅ | ✅ |
| Collection / array mapping | ✅ `mapArray` | ✅ | ✅ |
| Async mapping | ✅ `AsyncStrategy` | Limited (RxJS) | Via `ProjectTo` |
| Naming convention per-profile | Global only | ✅ per-mapper | ✅ |
| Custom naming conventions | ❌ | ✅ | ✅ |
| Nested object mapping (auto-recursive) | Partial | ✅ | ✅ |
| `mapWith` inline converter (typed) | ✅ | ✅ | ✅ |
| `ignore()` member | ✅ | ✅ | ✅ |
| Plugin / strategy system | ✅ | Limited | ✅ via IMappingAction |
| Plugin API versioning | ✅ | ❌ | ❌ |
| `MappingContext` | ✅ | ✅ | ✅ (ResolutionContext) |
| Profiling strategy | ✅ | ❌ | ❌ |
| String-token profiles | ✅ | ❌ | ❌ |
| `mapAsync` shorthand | ❌ | ❌ | ❌ |
| Dependency-injection-aware mapping | ❌ | ✅ | ✅ |

---

## Phase 1 — Foundation (DONE ✅)

All items below have been completed and shipped.

- [x] Core `createMapper` + `addProfile` + `map` / `mapArray`
- [x] `DefaultStrategy` with autoMap, member rules, strict mode
- [x] `AsyncStrategy` (`mapFromAsync`)
- [x] `ConverterRegistry` with built-in converters
- [x] Naming conventions (camel / snake / pascal)
- [x] Circular reference detection
- [x] `MappingContext` propagation
- [x] Plugin API (metadata, versioning, lifecycle, rollback)
- [x] `ProfilingStrategy` and `LoggingPlugin`
- [x] `forMember` typed generics tightened
- [x] Per-file unit test coverage ≥ 90 %

---

## Phase 2 — Type Safety & Developer Experience (Done ✅)

**Goal:** eliminate boilerplate, make incorrect configurations impossible at
compile time, improve editor discoverability.

| # | Task | Priority | Effort | Status |
|---|---|---|---|---|
| 2-1 | `condition(predicate)` member option — only map when truthy | High | S | ✅ Done |
| 2-2 | `nullSubstitution(value)` member option — use fallback when source is null/undefined | High | S | ✅ Done |
| 2-3 | `defaultValue(value)` member option — always emit fallback when mapped value is absent | High | S | ✅ Done |
| 2-4 | `fromValue(constant)` member shorthand — maps a literal onto destination | Medium | XS | ✅ Done |
| 2-5 | Source dot-path flattening: `mapFrom(s => s.address.city)` auto-typed | Medium | M | ✅ Works via existing `mapFrom` |
| 2-6 | `assertConfigurationIsValid()` — validate all dest props have a mapping rule | Medium | M | ✅ Done |
| 2-7 | `tsd` compile-time tests for public API surface | Medium | S | ✅ Exists in `test-d/` |
| 2-8 | README typed examples (`forMember`, `mapWith`, context usage) | Medium | S | — |
| 2-9 | Class-based `MappingProfile` base for better OOP style | Low | M | — |

**Definition of Done (Phase 2)**
- All `condition`, `nullSubstitution`, `defaultValue`, `fromValue` options exercised
  by typed unit tests. ✅
- `assertConfigurationIsValid()` throws descriptively for unmapped required members. ✅
- `tsd` passes on CI. ✅

---

## Phase 3 — Advanced Mapping Capabilities (Planned 📋)

**Goal:** reach feature parity with established libraries for complex
enterprise scenarios.

| # | Task | Priority | Effort |
|---|---|---|---|
| 3-1 | `reverseMap()` — auto-create inverse profile from existing profile | High | L |
| 3-2 | Nested profile resolution — `map()` inside a `mapFrom` uses registry profiles | High | M |
| 3-3 | `preCondition(predicate)` — skip full mapping when condition fails | Medium | S |
| 3-4 | Value transformers — global post-processing functions per destination type | Medium | M |
| 3-5 | Custom naming convention factory — `createNamingConvention(fn)` | Medium | S |
| 3-6 | Per-profile naming convention (override global) | Medium | S |
| 3-7 | `mapWith` accepting a class implementing `TypeConverter` (not just a function) | Medium | S |
| 3-8 | Decorator metadata support (`@AutoMap()`) for class-based auto-registration | Low | XL |
| 3-9 | `mapAsync` shorthand (first-class async API without needing `addStrategy`) | Low | M |
| 3-10 | Dictionary / Map collection mapping | Low | M |

---

## Phase 4 — Ecosystem & Integrations (Future 🌱)

**Goal:** make @vi/automapper usable in any environment and discoverable via
a plugin registry.

| # | Task | Priority | Effort | Status |
|---|---|---|---|---|
| 4-1 | NestJS module (`AutomapperModule.forRoot`) with DI-aware profile loading | High | L | ⏳ Deferred — workspace has no NestJS app; implement as peer-dep integration when a NestJS app is added |
| 4-2 | Angular provider helper (`provideAutomapper`) | High | M | ✅ Done |
| 4-3 | Zod schema integration — derive mapper profile from Zod shape | Medium | L | ✅ Done |
| 4-4 | Plugin discovery registry / npm tag convention | Medium | M | ✅ Done |
| 4-5 | MikroORM / TypeORM entity → DTO plugin | Low | XL | ✅ Done — ORM-agnostic `profileFromColumns` + `profileFromDescriptor` in `integrations/orm.ts`; works with TypeORM, MikroORM, Prisma and any column-list schema |
| 4-6 | React Query / SWR adapter (maps API responses on the fly) | Low | L | ✅ Done — `createMappedFetcher`, `createMappedArrayFetcher`, `createMappedQueryFn`, `createMappedSWRFetcher` in `integrations/fetch-adapter.ts`; pure-TS, no React dep required |
| 4-7 | WASM-accelerated deep-clone path for large object graphs | Low | XL | ✅ Done — `deepClone`, `mapWithClone`, `registerWasmClone`, `resetCloneBackend` in `utils/deep-clone.ts`; JS implementation ships today with a pluggable WASM-backend slot |

---

## Phase 5 — Release Engineering & Quality (Continuous 🔁)

| # | Task | Status |
|---|---|---|
| 5-1 | Semver policy document + `CHANGELOG.md` | Not started |
| 5-2 | Automated GitHub release pipeline (controlled, gated by tests) | Wishlist |
| 5-3 | Per-file coverage enforcement in CI (≥ 90 %) | In progress |
| 5-4 | API stability doc — what is public, what is internal | Not started |
| 5-5 | Migration guide for breaking changes | Not started |
| 5-6 | Micro-benchmarks (`bench/`) tracking perf over releases | Not started |

---

## Effort Key

| Symbol | Range |
|---|---|
| XS | < 1 hour |
| S | 1–4 hours |
| M | 4–8 hours (1 day) |
| L | 1–3 days |
| XL | > 3 days |

---

## Next Recommended Sprint

From Phase 2, deliver in this order:

1. **2-1 → 2-4** (`condition`, `nullSubstitution`, `defaultValue`, `fromValue`) — these are pure builder additions with zero breaking changes and immediately visible in profiles.
2. **2-6** `assertConfigurationIsValid()` — high trust builder for production teams.
3. **2-8** README typed examples (companion to above).
4. **2-7** `tsd` tests to lock in compile-time safety.

Then begin Phase 3 with **3-1** (`reverseMap`) as it has the most user demand.
