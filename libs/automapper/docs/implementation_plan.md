# Automapper Implementation Plan

This document defines the architecture and roadmap for expanding `libs/automapper` (soon `vi-automapper`) from a tiny proof‑of‑concept into a full‑featured, extensible mapping library. The guiding principle is Open/Closed: the core remains minimal, and new features are added via plugins or strategies without modifying existing code.

## 1. Core architecture

### 1.1. Minimal runtime

The public API consists of a factory that returns a registry object. The registry maintains mappings and delegates actual work to strategies.

```ts
interface MapperRegistry {
  addProfile<S, D>(profile: MappingProfile<S, D>): void;
  getMapper<S, D>(source: Constructor<S> | string, dest: Constructor<D> | string): Mapper<S, D>;
  map<S, D>(src: S, destType: Constructor<D> | string): D;
  mapArray<S, D>(src: S[], destType: Constructor<D> | string): D[];
}

type MappingProfile<S, D> = (builder: MappingBuilder<S, D>) => void;
```

Only the registry map and a small `DefaultStrategy` are kept in core. Profiles are keyed by name/constructor pair.

### 1.2. Strategy / plugin interface

A strategy encapsulates how mapping is performed. The registry selects an appropriate strategy for each mapping request. Plugins register themselves by calling `addStrategy`.

```ts
interface MappingStrategy {
  canHandle(source: any, destType: any): boolean;
  map<S, D>(src: S, destType: any, config?: MappingConfig<S, D>): D;
}
```

Example registry implementation excerpt:

```ts
class MapperRegistryImpl implements MapperRegistry {
  private strategies: MappingStrategy[] = [new DefaultStrategy()];
  addStrategy(s: MappingStrategy) { this.strategies.unshift(s); }
  map<S, D>(src: S, destType: any) {
    const strat = this.strategies.find(s => s.canHandle(src, destType));
    return strat!.map(src, destType);
  }
}
```

### 1.3. Extensible `MappingBuilder`

The builder produces a config object with a fixed shape plus an open map for extensions.

```ts
interface MappingConfig<S, D> {
  memberRules: MemberRule<S, D>[];
  beforeMap?: (src: any) => void;
  afterMap?: (dst: any) => void;
  [key: string]: any; // extension point
}

class MappingBuilder<S, D> {
  // existing API...
  beforeMap(fn: (src: S) => void) { this.config.beforeMap = fn; return this; }
  afterMap(fn: (dst: D) => void) { this.config.afterMap = fn; return this; }
  extend<T>(key: string, value: T) { (this.config as any)[key] = value; return this; }
}
```

Plugins add their own DSL methods by calling `extend()` to store custom configuration.

## 2. Feature list and implementation notes

Each feature becomes a separate module/plugin that depends only on the registry/strategy API.

1. **MapperOptions & strict behaviour** – core should accept an options object (strict, autoMap, namingConvention, maxDepth, circularRefBehavior) and enforce `strict` by throwing when a source property is not mapped.
2. **Profile registry & named mappers** – keyed lookups by name or constructor pair, accessible via `getMapper`.
3. **Reverse mapping** – a builder method `reverse()` or `forMember(...).reverseMap()`. Strategy can auto‑derive reverse config.
4. **Collections & deep mapping** – default strategy recursively invokes `registry.map`; add `mapArrays` option.
5. **Async mapping** – a strategy that returns `Promise<D>` when any resolver is async; builder rule `mapFromAsync`.
6. **Decorator/metadata support** – plugin reads `Reflect.getMetadata('automapper:rules', Source)`; decorators store rules.
7. **Union/discriminated mapping** – builder API `forType(discriminant, fn)` and strategy dispatch logic.
8. **Naming conventions built in** – an enum with CamelCase/SnakeCase/PascalCase and transformer helpers; these live in a separate module.
9. **Converter registry** – core provides a registry with predefined converters (string↔number, date ↔ string, …) and allows external registration; `forMember` accepts a converter function directly.
10. **Flatten/expand & naming conventions** – plugin adds helpers like `forMember('foo.bar', …)` and `withNamingConvention()`.
11. **Constructor mapping & immutable target support** – plugin records constructor to use and parameters to build object.
12. **DI framework integration** – separate packages for Nest/Angular; not part of core.
13. **Codegen/CLI** – optional code generator for profiles.
14. **Profiling/diagnostics** – strategy wrapper that emits events or logs timing.

## 3. Example usage

```ts
const mapper = createMapper();

mapper.addProfile<User, UserDto>((mb) => {
  mb.forMember('id', o => o.mapFrom(s => s.id.toString()));
  mb.forMember('displayName', o => o.mapFrom(s => s.name));
  mb.beforeMap(s => console.log('mapping', s));
  mb.afterMap(d => console.log('done', d));
});

// install decorator plugin
mapper.addStrategy(new ClassMetadataStrategy());

// async plugin
mapper.addStrategy(new AsyncStrategy());
mapper.addProfile<Post, PostDto>((mb) => {
  mb.forMember('content', o => o.mapFromAsync(async s => fetchContent(s.id)));
});

// union plugin
mapper.addProfile<Shape, ShapeDto>((mb) => {
  mb.forType('circle', c => /* … */);
  mb.forType('square', s => /* … */);
});

const dto = await mapper.map(user, UserDto);
const dtos = mapper.mapArray(users, UserDto);
```

Each feature sits in its own `libs/automapper/src/plugins/*` (or, after a rename, `libs/vi-automapper/src/plugins/*`) folder or published individually.

## 4. Development plan

1. Refactor existing code into registry/strategy/builder core, preserve behavior via `DefaultStrategy`.
2. Write unit tests for registry lookups and builder extension points.
3. Scaffold plugin modules (`plugins/async.ts`, `plugins/metadata.ts`, etc.) with their own tests.
4. Document extension points in README; show how to write and register a custom strategy.
5. Publish versioned packages – core plus optional plugins.
6. Iterate feature-by-feature: implement reverse first, then async, collections, etc.

## 5. Open/Closed rationale

- Core API remains stable once registry/strategy/export interface is defined.
- New capabilities are added by dropping new strategy/plugin files; existing code remains untouched.
- Consumers compose strategies at runtime, enabling unlimited custom behaviour without modifying core.

This plan provides a structured path to make the automapper library competitive while keeping it maintainable and extensible.
