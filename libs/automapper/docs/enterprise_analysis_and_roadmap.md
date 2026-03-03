# @vi/automapper — Enterprise Analysis & Roadmap

> **Date:** March 2026  
> **Scope:** Deep-dive comparison against .NET AutoMapper 12/13 and `@automapper/core` (nartc/mapper v8),  
> followed by a prioritised implementation plan.

---

## Table of Contents

1. [Current Implementation Inventory](#1-current-implementation-inventory)  
2. [Comparison Matrix — .NET AutoMapper vs @automapper/core vs @vi/automapper](#2-comparison-matrix)  
3. [What We Do Better](#3-what-we-do-better)  
4. [Gap Analysis — Missing Features](#4-gap-analysis--missing-features)  
5. [Implementation Plan — Priority 1: Plugin API Formalization](#5-p1-plugin-api-formalization)  
6. [Implementation Plan — Priority 2: Enhanced Type Safety](#6-p2-enhanced-type-safety)  
7. [Implementation Plan — Priority 3: Caching & Memoization](#7-p3-caching--memoization)  
8. [Implementation Plan — Priority 4: API Reference & Docs Generation](#8-p4-api-reference--docs-generation)  
9. [Implementation Plan — Priority 5: Runtime Validation & Structured Telemetry](#9-p5-runtime-validation--structured-telemetry)  
10. [Bonus — High-Value Missing Features (P6+)](#10-bonus--high-value-missing-features)  
11. [Overall Architecture Rating (Post-Roadmap)](#11-overall-architecture-rating)

---

## 1. Current Implementation Inventory

### 1.1 Modules

| Module | Responsibility |
|--------|---------------|
| `core.ts` | `MapperRegistry` interface + `MapperRegistryImpl`. Factory `createMapper()`. |
| `builder.ts` | `MappingBuilder<S,D>`, `MappingConfig`, `MemberRule`, `MemberOpts` |
| `strategy.ts` | `MappingStrategy` interface + `DefaultStrategy` |
| `async.ts` | `AsyncStrategy` — extends DefaultStrategy, auto-activated on `mapFromAsync` |
| `options.ts` | `MapperOptions`, `NamingConvention` enum, `CircularRefBehavior` |
| `naming.ts` | `namingTransformers`, `applyNamingConvention` |
| `converters.ts` | `ConverterRegistry`, `defaultConverterRegistry`, built-in converters |
| `utils.ts` | `checkCircular`, `setPath`, `getPath`, sentinel symbols |
| `types.ts` | `Constructor<T>` helper |
| `profiling.ts` | `ProfilingStrategy` — wraps any strategy with timing |
| `plugins/logging.ts` | `LoggingStrategy` — example plugin |

### 1.2 Public API Surface

```
createMapper(options?)        → MapperRegistry
registry.addProfile(src, dest, fn)
registry.getMapper(src, dest) → Mapper<S,D>
registry.map(src, destType)   → D | Promise<D>
registry.mapArray(src[], dest)→ D[] | Promise<D[]>
registry.addStrategy(strategy)
registry.registerConverter(srcType, destType, fn)

MappingBuilder
  .forMember(dest, opts => opts.mapFrom | mapFromAsync | ignore | mapWith)
  .beforeMap(fn)
  .afterMap(fn)
  .extend(key, value)
  .build()

NamingConvention  { CamelCase, SnakeCase, PascalCase }
CircularRefBehavior  { throw, ignore, null }
MapperOptions  { strict, autoMap, namingConvention, maxDepth, circularRefBehavior }
```

---

## 2. Comparison Matrix

> ✅ Fully implemented &nbsp; 🟡 Partial &nbsp; ❌ Missing &nbsp; N/A Not applicable in JS

| Feature | .NET AutoMapper | @automapper/core | **@vi/automapper** |
|---------|-----------------|-----------------|---------------------|
| Basic CreateMap / addProfile | ✅ | ✅ | ✅ |
| forMember mapFrom / mapFromAsync | ✅ | ✅ | ✅ |
| Auto-mapping (same-name props) | ✅ | ✅ | ✅ |
| Ignore member | ✅ | ✅ | ✅ |
| Naming conventions (camel/snake/pascal) | ✅ | ✅ | ✅ |
| Separate src/dest naming conventions | ✅ | ✅ | ❌ |
| Recognize pre/postfixes | ✅ | ❌ | ❌ |
| Replace member name characters | ✅ | ❌ | ❌ |
| Strict / validation mode | ✅ | 🟡 | ✅ |
| Before/After map hooks | ✅ | ✅ | ✅ |
| Async mapping | N/A | ✅ | ✅ |
| Circular reference detection | 🟡 | 🟡 | ✅ (3 modes) |
| Max depth | ✅ | ❌ | ✅ |
| Dot-notation (flatten/expand) | ✅ | ✅ | ✅ |
| mapArray / collection mapping | ✅ | ✅ | ✅ |
| Custom Type Converters | ✅ | ✅ | ✅ |
| Inline converters (mapWith) | ✅ | ✅ | ✅ |
| Value Resolvers (class-based IValueResolver) | ✅ | 🟡 | ❌ |
| Value Transformers (global post-processors) | ✅ | ❌ | ❌ |
| Null Substitution | ✅ | ✅ | ❌ |
| useValue / useConstant | ✅ | ✅ | ❌ |
| Conditional mapping (condition) | ✅ | ✅ | ❌ |
| PreCondition (evaluate before resolver) | ✅ | ❌ | ❌ |
| forAllMembers | ✅ | 🟡 | ❌ |
| forAllOtherMembers (unmapped default) | ✅ | ❌ | ❌ |
| Reverse mapping / unflattening | ✅ | ✅ | ❌ |
| Inheritance mapping (include/includeBase) | ✅ | ✅ | ❌ |
| Open generics | ✅ | ❌ | ❌ |
| Custom constructor (constructUsing) | ✅ | 🟡 | ❌ |
| Mapping context / ResolutionContext | ✅ | 🟡 | ❌ |
| Passing items to map() call | ✅ | ❌ | ❌ |
| Configuration validation (assertValid) | ✅ | ❌ | ❌ |
| Profile class inheritance | ✅ | ✅ | ❌ |
| Assembly/module scanning | ✅ | 🟡 | ❌ |
| Enum mapping | ✅ | ❌ | ❌ |
| DI integration (NestJS, Angular etc.) | ✅ | ✅ | ❌ |
| Decorator / metadata-driven mapping | ✅ | ✅ (`@AutoMap`) | ❌ |
| Plugin API with versioned contract | ❌ | 🟡 | ❌ |
| Strategy pattern for extensibility | ❌ | ❌ | ✅ |
| Profiling / timing strategy | ❌ | ❌ | ✅ |
| Structured telemetry events | ❌ | ❌ | ❌ |
| Result caching / memoization | ✅ (compiled exprs) | ❌ | ❌ |
| Runtime option validation | ✅ | ❌ | ❌ |
| TypeDoc/auto API reference | N/A | ✅ | ❌ |
| Zero external dependencies | ❌ | ❌ | ✅ |

---

## 3. What We Do Better

| Area | Our Advantage |
|------|--------------|
| **Zero dependencies** | Core ships as a single bundle. No reflect-metadata, class-transformer, or any peer dep required. |
| **Strategy pattern** | More powerful than profile-only. Plugins intercept at any point without monkeypatching. |
| **No decorators required** | Works naturally with plain objects, DTOs, APIs responses — no class annotation needed. |
| **AsyncStrategy auto-detection** | Simply add `mapFromAsync` — no explicit async builder required; mapper detects and delegates automatically. |
| **3-mode circular reference** | `throw | ignore | null` — more granular than most TypeScript mappers. |
| **mapWith inline converter** | Converter supplied directly in forMember without a separate type registry lookup. |
| **ProfilingStrategy** | First-class performance wrapper without any runtime change. |
| **mapArray merged in core** | Not relegated to a utility function; handles async results and circular sentinel filtering. |

---

## 4. Gap Analysis — Missing Features

Ranked by enterprise impact:

| # | Feature | Impact | Effort |
|---|---------|--------|--------|
| 4.1 | **Plugin API versioning & contracts** | High | Medium |
| 4.2 | **Type safety improvements** (remove any casts) | High | Medium |
| 4.3 | **Caching / memoization** | High | Medium |
| 4.4 | **API Reference generation** (TypeDoc) | Medium | Low |
| 4.5 | **Runtime option validation + telemetry** | Medium | Low |
| 4.6 | **Null substitution + useValue** | High | Low |
| 4.7 | **Conditional mapping** (condition / preCondition) | High | Low |
| 4.8 | **Reverse mapping** | High | Medium |
| 4.9 | **Inheritance mapping** | Medium | High |
| 4.10 | **Configuration validation** (`assertValid`) | High | Medium |
| 4.11 | **MappingContext** (typed items passable to map()) | Medium | Medium |
| 4.12 | **Value Resolvers** (class-based) | Medium | Medium |
| 4.13 | **Value Transformers** (global) | Medium | Medium |
| 4.14 | **forAllMembers / forAllOtherMembers** | Medium | Low |
| 4.15 | **Custom constructor** (`constructUsing`) | Medium | Low |
| 4.16 | **Separate src/dest naming conventions** | Low | Low |
| 4.17 | **Enum mapping** | Low | Low |
| 4.18 | **Profile class inheritance** | Low | Medium |

---

## 5. P1: Plugin API Formalization

### 5.1 Problem

Currently plugins are **informal** — they implement `MappingStrategy` but there is no contract for versioning, metadata, initialization lifecycle, or discovery. An incompatible plugin silently misbehaves.

### 5.2 Solution Design

#### New file: `src/lib/plugin.ts`

```typescript
/** Semver string of the plugin API this plugin targets. */
export const PLUGIN_API_VERSION = '1.0.0';

/**
 * Metadata attached to every plugin. Used by the registry for logging,
 * validation, and version compatibility checks.
 */
export interface PluginMetadata {
  /** Unique reverse-domain identifier: e.g. "com.vi.logging" */
  id: string;
  /** Human-readable name */
  name: string;
  /** Semver version of the plugin itself */
  version: string;
  /** Plugin API version it was compiled against */
  apiVersion: string;
  /** Optional description */
  description?: string;
}

/**
 * Lifecycle interface that plugins may implement.  Each method is optional;
 * the registry calls them when the corresponding event occurs.
 */
export interface PluginLifecycle {
  /** Called immediately after the plugin is registered with the mapper. */
  onInstall?(registry: PluginAwareRegistry): void;
  /** Called when a new profile is added to the registry. */
  onProfileAdded?(key: string, config: unknown): void;
  /** Called before every map() execution. */
  onMapStart?(src: unknown, destType: unknown): void;
  /** Called after every successful map() execution. */
  onMapEnd?(src: unknown, dest: unknown, durationMs: number): void;
  /** Called when a mapping throws an error. */
  onMapError?(src: unknown, destType: unknown, error: Error): void;
}

/**
 * Full plugin contract. A plugin must provide metadata and implement
 * MappingStrategy.  PluginLifecycle is optional.
 */
export interface MapperPlugin extends Partial<PluginLifecycle> {
  readonly metadata: PluginMetadata;
  /** The strategy contributed by this plugin. */
  readonly strategy: import('./strategy').MappingStrategy;
}

/**
 * Extended registry interface exposed to plugins.
 */
export interface PluginAwareRegistry extends import('./core').MapperRegistry {
  /** Install a formal plugin (provides metadata + strategy + lifecycle). */
  use(plugin: MapperPlugin): void;
  /** Returns metadata of all installed plugins. */
  installedPlugins(): PluginMetadata[];
  /** Whether a plugin with the given id is installed. */
  hasPlugin(id: string): boolean;
}
```

#### Updates to `core.ts`

```typescript
// MapperRegistryImpl now implements PluginAwareRegistry
class MapperRegistryImpl implements PluginAwareRegistry {
  private pluginRegistry = new Map<string, MapperPlugin>();

  use(plugin: MapperPlugin): void {
    // Version compatibility check
    if (plugin.metadata.apiVersion !== PLUGIN_API_VERSION) {
      console.warn(
        `[automapper] Plugin "${plugin.metadata.id}" targets API ${plugin.metadata.apiVersion} ` +
        `but current API is ${PLUGIN_API_VERSION}. This may cause issues.`
      );
    }
    if (this.pluginRegistry.has(plugin.metadata.id)) {
      throw new Error(`Plugin "${plugin.metadata.id}" is already installed.`);
    }
    this.pluginRegistry.set(plugin.metadata.id, plugin);
    this.strategies.unshift(plugin.strategy);
    plugin.onInstall?.(this);
  }

  installedPlugins(): PluginMetadata[] {
    return [...this.pluginRegistry.values()].map(p => p.metadata);
  }

  hasPlugin(id: string): boolean {
    return this.pluginRegistry.has(id);
  }
}
```

#### Example conformant plugin

```typescript
// plugins/logging.ts  — updated to conform to MapperPlugin
import { MapperPlugin, PluginMetadata, PLUGIN_API_VERSION } from '../plugin';

export class LoggingPlugin implements MapperPlugin {
  readonly metadata: PluginMetadata = {
    id:         'com.vi.logging',
    name:       'Logging Plugin',
    version:    '1.0.0',
    apiVersion: PLUGIN_API_VERSION,
    description: 'Logs all mapping operations.',
  };

  readonly strategy = new LoggingStrategy(this.log);

  constructor(private log: (msg: string) => void = console.log) {}

  onInstall(): void {
    this.log('[automapper] LoggingPlugin installed.');
  }

  onMapError(_src: unknown, _dest: unknown, err: Error): void {
    this.log(`[automapper] ERROR: ${err.message}`);
  }
}
```

### 5.3 Files Changed

| File | Change |
|------|--------|
| `src/lib/plugin.ts` | **New** — `PluginMetadata`, `MapperPlugin`, `PluginAwareRegistry`, `PLUGIN_API_VERSION` |
| `src/lib/core.ts` | `MapperRegistryImpl` implements `PluginAwareRegistry`, add `use()`, `installedPlugins()`, `hasPlugin()` |
| `src/lib/plugins/logging.ts` | Refactor to `MapperPlugin` |
| `src/lib/libs.ts` | Export from `plugin.ts` |

### 5.4 Tests to Add

```typescript
it('use() installs plugin and calls onInstall', ...)
it('use() throws when same plugin installed twice', ...)
it('use() warns on API version mismatch', ...)
it('installedPlugins() returns metadata list', ...)
it('hasPlugin() returns true/false correctly', ...)
it('plugin onMapError called on mapping failure', ...)
```

---

## 6. P2: Enhanced Type Safety

### 6.1 Problem

- `forMember` accepts `string` for dest key, losing compile-time key check.
- `MemberOpts<S>` callbacks return `unknown` — downstream inference is lost.
- Multiple `as any` casts in strategies hide type drift.
- `MappingConfig` uses `[key: string]: unknown` for extensions, which widens the whole type.
- No typed `ResolutionContext` for passing additional data to resolvers.

### 6.2 Solution Design

#### Strengthen `forMember` key inference

```typescript
// builder.ts

export interface TypedMemberOpts<S, TDest> {
  mapFrom(fn: (s: S) => TDest): void;
  mapFromAsync(fn: (s: S) => Promise<TDest>): void;
  ignore(): void;
  mapWith(converter: TypeConverter<S, TDest>): void;
}

export class MappingBuilder<S, D> {
  forMember<K extends keyof D & string>(
    dest: K,
    opts: (rule: TypedMemberOpts<S, D[K]>) => void
  ): this { ... }

  // Overload for string keys (escape hatch for dynamic profiles)
  forMember(
    dest: string,
    opts: (rule: TypedMemberOpts<S, unknown>) => void
  ): this { ... }
}
```

#### Typed MappingContext

```typescript
// context.ts  — new file

/**
 * Carries additional typed state through a single map() invocation.
 * Strategies, resolvers, and hooks can read/write context items.
 */
export interface MappingContext<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Arbitrary key-value store available throughout the mapping chain. */
  readonly items: T;
  /** Unique ID for the current mapping operation (useful for telemetry). */
  readonly operationId: string;
  /** Timestamp when the mapping started (ms since epoch). */
  readonly startedAt: number;
}

export function createContext<T extends Record<string, unknown>>(
  items: T
): MappingContext<T> {
  return {
    items,
    operationId: crypto.randomUUID?.() ?? String(Date.now()),
    startedAt: Date.now(),
  };
}
```

#### Updated `map()` signature

```typescript
// core.ts
export interface MapperRegistry {
  map<S, D>(
    src: S,
    destType: Constructor<D> | string,
    visited?: WeakSet<object>,
    context?: MappingContext
  ): D | Promise<D>;
}
```

#### Remove `any` from MappingConfig extensions

```typescript
// builder.ts
// Replace the [key:string]: unknown index signature with a typed extensions bag
export interface MappingConfigExtensions {
  [key: string]: unknown;
}

export interface MappingConfig<S, D> {
  memberRules: MemberRule<S, D>[];
  beforeMap?: (src: S, ctx?: MappingContext) => void;
  afterMap?: (dst: D, ctx?: MappingContext) => void;
  extensions: MappingConfigExtensions;  // no longer mixed into main type
}
```

### 6.3 Files Changed

| File | Change |
|------|--------|
| `src/lib/context.ts` | **New** — `MappingContext`, `createContext` |
| `src/lib/builder.ts` | Strong-typed `forMember`, `TypedMemberOpts`, separate `extensions` bag |
| `src/lib/core.ts` | `map()` accepts `MappingContext`, propagate context to strategies |
| `src/lib/strategy.ts` | Accept optional `MappingContext` in `map()`, pass to hooks |
| `src/lib/async.ts` | Mirror strategy changes |
| `src/lib/libs.ts` | Export `context.ts` |

### 6.4 Tests to Add

```typescript
it('forMember infers dest key type — compile-time check via ts-expect-error', ...)
it('mappingContext.items accessible in beforeMap hook', ...)
it('mappingContext.operationId is unique per map() call', ...)
```

---

## 7. P3: Caching & Memoization

### 7.1 Problem

Currently, every `map()` call rebuilds the mapping result from scratch. For high-throughput APIs mapping the same types thousands of times per second, this is wasteful. Two caches are useful:

1. **Profile-level**: Cache the compiled mapping function per `src→dest` key pair (avoids re-evaluating the profile config on each call).
2. **Instance-level**: Cache a mapped destination object by source identity (WeakMap, opt-in).

### 7.2 Solution Design

#### New file: `src/lib/cache.ts`

```typescript
export type CacheMode = 'none' | 'profile' | 'instance';

/**
 * Compiled mapper function for a specific profile.
 * Instead of re-iterating config.memberRules every time, we produce a single
 * function once and cache it.
 */
export type CompiledMapper<S, D> = (
  src: S,
  ctx: MappingContext
) => D;

export class ProfileCache {
  private cache = new Map<string, CompiledMapper<unknown, unknown>>();

  has(key: string): boolean { return this.cache.has(key); }

  get<S, D>(key: string): CompiledMapper<S, D> | undefined {
    return this.cache.get(key) as CompiledMapper<S, D> | undefined;
  }

  set<S, D>(key: string, fn: CompiledMapper<S, D>): void {
    this.cache.set(key, fn as CompiledMapper<unknown, unknown>);
  }

  invalidate(key?: string): void {
    if (key) { this.cache.delete(key); } else { this.cache.clear(); }
  }

  size(): number { return this.cache.size; }
}

/**
 * Instance-level cache: source object → mapped destination.
 * Uses WeakMap so source objects can be GC'd when no longer referenced.
 */
export class InstanceCache {
  private cache = new WeakMap<object, unknown>();

  get<D>(src: object): D | undefined {
    return this.cache.get(src) as D | undefined;
  }

  set<D>(src: object, dest: D): void {
    this.cache.set(src, dest);
  }

  has(src: object): boolean {
    return this.cache.has(src);
  }
}
```

#### Updates to `MapperOptions`

```typescript
// options.ts
export interface MapperOptions {
  // ... existing ...
  /**
   * Caching strategy:
   * - 'none': no caching (default, current behaviour)
   * - 'profile': cache compiled mapping functions per src→dest key
   * - 'instance': additionally cache mapped instances by source identity
   */
  cache?: CacheMode;
}
```

#### Updates to `MapperRegistryImpl`

```typescript
// core.ts
class MapperRegistryImpl {
  private profileCache = new ProfileCache();
  private instanceCache = new InstanceCache();

  map<S, D>(src: S, destType: ..., ...): D | Promise<D> {
    // instance cache hit?
    if (this.options.cache === 'instance' && src && typeof src === 'object') {
      const cached = this.instanceCache.get<D>(src as object);
      if (cached !== undefined) return cached;
    }

    // profile-level compiled mapper hit?
    const key = this.getProfileKey(srcType, destType);
    if (this.options.cache !== 'none' && this.profileCache.has(key)) {
      const fn = this.profileCache.get<S,D>(key)!;
      const result = fn(src, ctx);
      if (this.options.cache === 'instance' && src && typeof src === 'object') {
        this.instanceCache.set(src as object, result);
      }
      return result;
    }

    // normal path; after computing result, cache if needed
    const result = strat.map(...);
    if (this.options.cache !== 'none' && !(result instanceof Promise)) {
      // compile and cache for next call
      this.compileAndCache<S,D>(key, config, options);
    }
    return result;
  }

  /** Expose cache invalidation for testing and hot-reload scenarios. */
  invalidateCache(src?: Constructor<unknown> | string, dest?: Constructor<unknown> | string): void {
    const key = src && dest ? this.getProfileKey(src, dest) : undefined;
    this.profileCache.invalidate(key);
  }
}
```

### 7.3 Tests to Add

```typescript
it('profile cache is used on second map() call', ...)
it('instance cache returns same object on identical source reference', ...)
it('invalidateCache() clears specific profile', ...)
it('cache mode "none" never stores results', ...)
it('cache does not apply to async mappings by default', ...)
```

---

## 8. P4: API Reference & Docs Generation

### 8.1 Problem

All public symbols have JSDoc comments, but there is no generated API reference. New consumers must read source files to understand the API.

### 8.2 Solution

#### Install TypeDoc

```bash
npm install -D typedoc typedoc-plugin-markdown
```

#### `typedoc.json` at library root

```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"],
  "readme": "README.md",
  "name": "@vi/automapper",
  "navigationLinks": {
    "GitHub": "https://github.com/<org>/nx"
  },
  "categorizeByGroup": true,
  "categoryOrder": [
    "Core",
    "Builder",
    "Strategy",
    "Converters",
    "Options",
    "Plugins",
    "Utilities"
  ]
}
```

#### `@category` tags to add to sources

Every exported class/function/interface should add:
```typescript
/**
 * ...
 * @category Core
 */
export function createMapper(...) {}
```

Categories:
- **Core**: `createMapper`, `MapperRegistry`, `MapperRegistryImpl`
- **Builder**: `MappingBuilder`, `MappingConfig`, `MemberRule`, `MemberOpts`
- **Strategy**: `MappingStrategy`, `DefaultStrategy`, `AsyncStrategy`
- **Converters**: `ConverterRegistry`, `TypeConverter`, `defaultConverterRegistry`
- **Options**: `MapperOptions`, `NamingConvention`, `CircularRefBehavior`
- **Plugins**: `ProfilingStrategy`, `LoggingStrategy`, `MapperPlugin`, `PluginMetadata`
- **Utilities**: `setPath`, `getPath`, `checkCircular`

#### `project.json` target

```json
{
  "docs": {
    "executor": "nx:run-commands",
    "options": {
      "command": "npx typedoc",
      "cwd": "libs/automapper"
    }
  }
}
```

#### Maintained by CI

Add GitHub Actions / pipeline step:
```yaml
- name: Generate API docs
  run: npx nx run automapper:docs
- name: Upload docs artifact
  uses: actions/upload-artifact@v4
  with:
    name: automapper-api-docs
    path: libs/automapper/docs/api
```

---

## 9. P5: Runtime Validation & Structured Telemetry

### 9.1 Runtime Option Validation

#### New file: `src/lib/validation.ts`

```typescript
import { MapperOptions, CircularRefBehavior, NamingConvention } from './options';

export class MapperConfigError extends Error {
  constructor(message: string) {
    super(`[automapper] Invalid configuration: ${message}`);
    this.name = 'MapperConfigError';
  }
}

/**
 * Validates the options object passed to createMapper().
 * Throws MapperConfigError for any invalid or contradictory values.
 */
export function validateOptions(opts: MapperOptions): void {
  if (opts.maxDepth !== undefined) {
    if (!Number.isInteger(opts.maxDepth) || opts.maxDepth < 0) {
      throw new MapperConfigError('maxDepth must be a non-negative integer.');
    }
  }

  if (opts.circularRefBehavior !== undefined) {
    const valid: CircularRefBehavior[] = ['throw', 'ignore', 'null'];
    if (!valid.includes(opts.circularRefBehavior)) {
      throw new MapperConfigError(
        `circularRefBehavior must be one of: ${valid.join(', ')}.`
      );
    }
  }

  if (opts.namingConvention !== undefined) {
    const valid = Object.values(NamingConvention);
    if (!valid.includes(opts.namingConvention)) {
      throw new MapperConfigError(
        `namingConvention must be one of: ${valid.join(', ')}.`
      );
    }
  }

  if (opts.strict === true && opts.autoMap === false) {
    console.warn(
      '[automapper] strict=true with autoMap=false means ALL members must have explicit forMember rules.'
    );
  }
}

/**
 * Validates that all registered profiles are complete.
 * Checks that every destination property (if discoverable) has a rule or
 * would be auto-mapped.
 * Call this at app startup after all profiles are registered.
 */
export function assertConfigurationIsValid(
  profiles: Map<string, unknown>,
  options: MapperOptions
): void {
  const errors: string[] = [];

  for (const [key] of profiles) {
    if (!key.includes('->')) {
      errors.push(`Profile key "${key}" is malformed (expected "Src->Dest").`);
    }
  }

  if (errors.length > 0) {
    throw new MapperConfigError(
      `Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}
```

#### `MapperRegistry.assertValid()` method

```typescript
export interface MapperRegistry {
  // ... existing ...
  /**
   * Validates all registered profiles.  Throws `MapperConfigError` if
   * any profile is malformed.  Call at application startup.
   */
  assertValid(): void;
}
```

### 9.2 Structured Telemetry

#### New file: `src/lib/telemetry.ts`

```typescript
export enum MapperEvent {
  PROFILE_ADDED    = 'profile:added',
  MAP_START        = 'map:start',
  MAP_END          = 'map:end',
  MAP_ERROR        = 'map:error',
  STRATEGY_SELECTED = 'strategy:selected',
  CONVERTER_APPLIED = 'converter:applied',
  PLUGIN_INSTALLED  = 'plugin:installed',
}

export interface MapperEventPayload {
  event: MapperEvent;
  timestamp: number;
  operationId?: string;
  sourceType?: string;
  destType?: string;
  durationMs?: number;
  error?: Error;
  extra?: Record<string, unknown>;
}

export type TelemetryHandler = (payload: MapperEventPayload) => void;

/**
 * Lightweight event emitter for mapper telemetry.
 * Registered handlers are called synchronously after each event.
 */
export class TelemetryBus {
  private handlers = new Map<MapperEvent, TelemetryHandler[]>();

  on(event: MapperEvent, handler: TelemetryHandler): () => void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler);
    this.handlers.set(event, list);
    // return unsubscribe fn
    return () => {
      const current = this.handlers.get(event) ?? [];
      this.handlers.set(event, current.filter(h => h !== handler));
    };
  }

  emit(payload: MapperEventPayload): void {
    const handlers = this.handlers.get(payload.event) ?? [];
    handlers.forEach(h => {
      try { h(payload); } catch { /* telemetry must never break mapping */ }
    });
  }

  removeAll(): void { this.handlers.clear(); }
}

/** Singleton bus — replace with DI-provided instance if needed. */
export const telemetryBus = new TelemetryBus();
```

#### Integration in `MapperRegistryImpl`

```typescript
// core.ts  — MapperRegistryImpl
map(...) {
  const opId = crypto.randomUUID?.() ?? String(Date.now());
  const start = Date.now();

  this.telemetry.emit({
    event: MapperEvent.MAP_START,
    timestamp: start,
    operationId: opId,
    sourceType: srcType.name,
    destType: typeof destType === 'string' ? destType : (destType as any).name,
  });

  try {
    const result = strat.map(...);
    this.telemetry.emit({
      event: MapperEvent.MAP_END,
      timestamp: Date.now(),
      operationId: opId,
      durationMs: Date.now() - start,
    });
    return result;
  } catch (err) {
    this.telemetry.emit({
      event: MapperEvent.MAP_ERROR,
      timestamp: Date.now(),
      operationId: opId,
      error: err as Error,
    });
    throw err;
  }
}
```

#### Updated `MapperRegistry` interface

```typescript
export interface MapperRegistry {
  // ...existing...
  /** Subscribe to a telemetry event.  Returns an unsubscribe function. */
  onEvent(event: MapperEvent, handler: TelemetryHandler): () => void;
  /** Access the telemetry bus directly for advanced use. */
  readonly telemetry: TelemetryBus;
}
```

### 9.3 Tests to Add

```typescript
it('validateOptions throws on negative maxDepth', ...)
it('validateOptions throws on invalid circularRefBehavior', ...)
it('validateOptions warns when strict + autoMap=false', ...)
it('assertValid() throws on malformed profile key', ...)
it('onEvent MAP_START fires before map()', ...)
it('onEvent MAP_END carries correct durationMs', ...)
it('onEvent MAP_ERROR fires on mapping failure', ...)
it('telemetry handler error does not break mapping', ...)
it('unsubscribe fn removes handler', ...)
```

---

## 10. Bonus — High-Value Missing Features

These are not in the top 5 but deliver significant value and should be next in the queue.

### 10.1 Null Substitution & useValue  

**File:** `builder.ts` — Add to `MemberOpts`:

```typescript
/** If source value is null or undefined, use this value instead. */
nullSubstitute(value: unknown): void;

/** Always map to this constant value regardless of source. */
useValue(constant: unknown): void;
```

**Strategy change:** In `DefaultStrategy.map` for each rule:

```typescript
let value = r.mapFrom ? r.mapFrom(src) : (src as any)[r.destKey];
if ((value === null || value === undefined) && r.nullSubstitute !== undefined) {
  value = r.nullSubstitute;
}
if (r.useValue !== undefined) {
  value = r.useValue;
}
```

### 10.2 Conditional Mapping  

**File:** `builder.ts` — Add to `MemberOpts`:

```typescript
/** Only map this member if predicate returns true. */
condition(fn: (src: S, dest: Partial<D>) => boolean): void;

/** Evaluated before the resolver; if false, resolver is skipped entirely. */
preCondition(fn: (src: S) => boolean): void;
```

**Strategy change:**

```typescript
// For each rule in DefaultStrategy.map:
if (r.preCondition && !r.preCondition(src)) continue;
const value = r.mapFrom?.(src);
if (r.condition && !r.condition(src, dest)) continue;
```

### 10.3 Reverse Mapping

**File:** `builder.ts` — Add to `MappingBuilder`:

```typescript
/** Generates a reversed profile (Dest → Src) from explicit forMember rules. */
reverseMap(): MappingBuilder<D, S>;
```

**Implementation:** The builder inspects each `MemberRule` that has a simple `mapFrom` accessor (detected via `fn.toString()` matching `/\.[a-z]/i`). It inverts the mapping automatically and registers it as a separate profile.

### 10.4 Configuration Validation (`assertValid`)

Expands on `assertConfigurationIsValid` from P5. Adds:

- For each `strict: true` profile, enumerate destination properties (via `new DestConstructor()`) and verify every key is either in `memberRules` or auto-mappable from the source.
- Warn about profiles registered for types that have no properties.

### 10.5 MappingContext / ResolutionContext

```typescript
// Usage
mapper.map(source, DestType, undefined, createContext({ userId: '42' }));

// In forMember
mb.forMember('label', o =>
  o.mapFrom((src, ctx) => `${src.name} [${ctx?.items['userId']}]`)
);
```

### 10.6 Value Transformers (Global Post-Processors)

```typescript
// Apply to all string properties in any mapping
mapper.addValueTransformer(String, (value: string) => value.trim());
// Apply to all Date properties
mapper.addValueTransformer(Date, (value: Date) => value.toISOString());
```

### 10.7 forAllMembers / forAllOtherMembers

```typescript
mb.forAllMembers(o => o.ignore());  // ignore everything by default
mb.forMember('id', o => o.mapFrom(s => s.id)); // then whitelist
```

### 10.8 Custom Constructor (`constructUsing`)

```typescript
mb.constructUsing(src => new DestClass(src.id, src.name));
```

In `DefaultStrategy`, if `config.constructUsing` exists, pre-populate `dest` using the result and skip the default `{} as D` construction.

---

## 11. Overall Architecture Rating (Post-Roadmap)

| Criterion | Current | Post-Roadmap |
|-----------|---------|--------------|
| **Flexibility** | 4.5 | 5.0 |
| **Type Safety** | 4.0 | 4.8 |
| **Extensibility** | 4.0 | 5.0 |
| **Stability / Reliability** | 3.5 | 4.5 |
| **Performance** | 3.5 | 4.5 |
| **Documentation** | 4.0 | 5.0 |
| **Observability** | 2.0 | 4.5 |
| **Enterprise Readiness** | **4.0** | **4.8** |

---

## Appendix A — Recommended File Structure After Roadmap

```
libs/automapper/src/
├── index.ts
└── lib/
    ├── builder.ts          (strengthened types, nullSubstitute, condition, constructUsing)
    ├── cache.ts            [NEW] ProfileCache, InstanceCache, CacheMode
    ├── context.ts          [NEW] MappingContext, createContext
    ├── converters.ts
    ├── core.ts             (PluginAwareRegistry impl, cache, telemetry, assertValid)
    ├── libs.ts             (barrel — re-exports all)
    ├── naming.ts
    ├── options.ts          (add cache?: CacheMode)
    ├── plugin.ts           [NEW] PluginMetadata, MapperPlugin, PluginAwareRegistry contract
    ├── profiling.ts
    ├── strategy.ts         (accept MappingContext, path propagation)
    ├── async.ts
    ├── telemetry.ts        [NEW] MapperEvent, TelemetryBus, TelemetryHandler
    ├── types.ts
    ├── utils.ts
    ├── validation.ts       [NEW] validateOptions, assertConfigurationIsValid
    └── plugins/
        ├── logging.ts      (refactored to MapperPlugin)
        └── reverse.ts      [NEW] ReverseProfilePlugin
```

---

*Generated by deep analysis on 3 March 2026 comparing @vi/automapper against AutoMapper.NET 12/13 (docs.automapper.io) and @automapper/core v8 (github.com/nartc/mapper).*
