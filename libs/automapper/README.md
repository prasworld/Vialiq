# @vi/automapper

A lightweight, extensible, and type-safe object-to-object mapper for
TypeScript.  The core is intentionally tiny and dependency-free; all extra
behaviour is layered on via plugins/strategies so you can keep the
"smallest thing that could possibly work" in your app and add features only
when you need them.

---

## 📦 Installation

```bash
npm install @vi/automapper
```

> The library is shipped as a single ESM/CJS bundle with types.  No peer
dependencies are required.

---

## 🚀 Getting Started (Quick Tour)

```ts
import { createMapper } from '@vi/automapper';

// 1. Define your source & destination types
class User {
  constructor(public firstName: string, public lastName: string) {}
}

class UserDto {
  public fullName!: string;
}

// 2. Create the mapper (options are described below)
const mapper = createMapper({ strict: true });

// 3. Register a profile to teach the mapper how to convert User→UserDto
mapper.addProfile(User, UserDto, (mb) => {
  mb.forMember('fullName', (opt) =>
    opt.mapFrom((s) => `${s.firstName} ${s.lastName}`)
  );
});

// 4. Use it
const user = new User('Jane', 'Smith');
const dto = mapper.map(user, UserDto);
console.log(dto); // { fullName: 'Jane Smith' }
```

That example already exercises a number of features:
- injecting a constructor into `addProfile`
- using `forMember` with `mapFrom`
- enabling `strict` mode (will throw if a property is left unmapped)

---

## 🌟 Core Concepts & Features

### MapperOptions
```ts
interface MapperOptions {
  strict?: boolean;             // error on unmapped source props
  autoMap?: boolean;            // copy matching props automatically
  namingConvention?: NamingConvention;
  maxDepth?: number;            // halt recursion at N levels
  circularRefBehavior?: CircularRefBehavior;
}
```
The `options` argument passed to `createMapper()` controls runtime
behaviour.  You may pass an empty object or set any subset of properties.

### Naming conventions
Supported values: `CamelCase`, `SnakeCase`, `PascalCase`.

```ts
mapper = createMapper({ namingConvention: NamingConvention.SnakeCase });
mapper.addProfile(Source, Dest, (mb) => {
  mb.forMember('first_name', o => o.mapFrom(s => s.firstName));
});
```
Properties are transformed before being written to the destination object.

### Converters
A built-in registry contains common conversions (string↔number, date↔string).
You can register additional ones:

```ts
mapper.registerConverter(
  String,
  Boolean,
  (v) => v === 'true'
);
```

Converters may also be provided inline in a profile:

```ts
mb.forMember('age', o => o.mapWith<number>((src: string) => parseInt(src)));
```

### Circular references & depth
# @vi/automapper

A lightweight, extensible, and type-safe object-to-object mapper for
TypeScript. The core is intentionally minimal and dependency-free; extra
behaviour (validation, logging, profiling, specialized conversions, etc.)
is implemented as external strategies/plugins so you can compose exactly
what your app needs.

---

## Quick Links
- API Reference: `src/lib` (types & builder)
- Tests & examples: `src/lib/__tests__`
- Build & test commands: see **Build & Test** section below

---

## Installation

```bash
npm install @vi/automapper
```

The package ships as ESM/CJS with TypeScript declarations.

---

## Quick Start — Simple Usage

1. Create a mapper and register a profile that teaches how to map properties.

```ts
import { createMapper } from '@vi/automapper';

class User { constructor(public firstName: string, public lastName: string) {} }
class UserDto { fullName!: string }

const mapper = createMapper();

mapper.addProfile(User, UserDto, (mb) => {
  mb.forMember('fullName', (opt) => opt.mapFrom((s) => `${s.firstName} ${s.lastName}`));
});

const dto = mapper.map(new User('Jane','Smith'), UserDto);
// dto.fullName === 'Jane Smith'
```

Notes:
- `addProfile(SourceCtor, DestCtor, builderFn)` binds a configuration to the
  source constructor and destination constructor (or string token).
- `forMember(destKey, opts => opts.mapFrom(...))` defines explicit members.

---

## MappingContext

The mapper supplies a `MappingContext` object to `beforeMap`, `afterMap`,
and member resolvers. Use it to carry metadata (operation id, tracing info,
or per-mapping items).

```ts
mapper.addProfile(User, UserDto, (mb) => {
  mb.beforeMap((src, ctx) => { console.log('operation', ctx.operationId); });
  mb.forMember('fullName', (o) => o.mapFrom((s, ctx) => `${s.firstName} ${s.lastName} [${ctx.operationId}]`));
});
```

If you call `map()` without supplying `ctx`, the mapper creates one for you.

---

## Asynchronous Mapping

Use `mapFromAsync()` when mapping requires async data: network calls, DB
lookups, etc. Add `AsyncStrategy` to the mapper so async resolvers are
executed and `mapper.map()` returns a `Promise` when needed.

```ts
import { AsyncStrategy } from '@vi/automapper';
mapper.addStrategy(new AsyncStrategy());

mapper.addProfile(Foo, FooDto, (mb) => {
  mb.forMember('data', (o) => o.mapFromAsync(async s => fetchData(s.id)));
});

const result = await mapper.map(foo, FooDto);
```

Tests in this repo exercise async behaviour extensively — see
`src/lib/__tests__/exhaustive-async.test.ts`.

---

## Naming Conventions & Dot Paths

The mapper supports naming conventions (camel/snake/pascal) and dotted
destination keys to create nested objects.

```ts
// dotted key creates nested object
mb.forMember('address.city', o => o.mapFrom(s => s.city));

// naming convention (translation applied automatically)
mapper = createMapper({ namingConvention: NamingConvention.SnakeCase });
```

---

## Converters

Register global converters or use `mapWith` inline:

```ts
mapper.registerConverter(String, Number, s => parseInt(s));

mb.forMember('age', o => o.mapWith<number>(s => parseInt(s)));
```

Converters are resolved from a registry keyed by source/destination tokens.

---

## Validation — Simple & Advanced

Two approaches:

- Inline: perform validation inside `beforeMap` and throw to abort mapping.
- Plugin: create a `ValidatorStrategy` and push validation functions via
  `mb.extend('validations', [fn1, fn2])` so validation runs automatically
  before mapping.

Validator strategy example (publish as external plugin):

```ts
// validator-plugin.ts
import { MappingStrategy, MapperRegistry, MappingConfig, MapperOptions } from '@vi/automapper';

export type ValidationRule<S> = (src: S) => void;

export class ValidatorStrategy implements MappingStrategy {
  canHandle(_src: unknown, _dest: unknown, config?: MappingConfig<any, any>) {
    return Array.isArray(config?.validations);
  }

  map(reg: MapperRegistry, src: any, destType: any, config: any, options: MapperOptions, visited: WeakSet<Record<string,unknown>>) {
    (config.validations as ValidationRule<any>[]).forEach(fn => fn(src));
    return reg.map(src, destType, visited);
  }
}
```

Usage in a profile:

```ts
mapper.addProfile(Person, PersonDto, mb => {
  mb.extend('validations', [ (p: Person) => { if (!p.email.includes('@')) throw new Error('invalid email'); } ]);
});

// register plugin once
mapper.addStrategy(new ValidatorStrategy());
```

This isolates validation logic from the core, keeps profiles declarative,
and allows reusing validators across projects.

---

## Runtime Plugins & Strategies

Plugins can be registered at runtime. Two common patterns:

- `mapper.use(plugin)` — registers a `MapperPlugin` (metadata + `strategy`) and
  calls `plugin.onInstall`.
- `mapper.addStrategy(strategy)` — inserts a `MappingStrategy` directly.

Example: runtime logging plugin

```ts
const loggingPlugin = new LoggingPlugin(console.debug);
mapper.use(loggingPlugin);

// or insert a profiling strategy to measure timings
mapper.addStrategy(new ProfilingStrategy(new DefaultStrategy(), console.debug));
```

The `use(plugin)` method ensures plugin metadata are tracked and lifecycle
hooks (`onMapStart`, `onMapEnd`, `onMapError`) are invoked around each
mapping operation.

---

## Advanced Use Case: Composed Pipeline

Suppose you want: validation → sanitize → convert → profile → map.

1. Create/compose strategies: `ValidatorStrategy`, `SanitizerStrategy`,
   converter registrations, `ProfilingStrategy`.
2. Register them in order — the registry tries strategies in insertion order.

```ts
mapper.addStrategy(new ValidatorStrategy());
mapper.addStrategy(new SanitizerStrategy());
mapper.registerConverter(String, Number, s => Number(s.trim()));
mapper.addStrategy(new ProfilingStrategy(new DefaultStrategy(), console.debug));
```

Profiles remain simple and declarative — the pipeline enforces rules.

---

## Testing & Examples

- Unit tests are in `src/lib/__tests__` (Vitest). The repo includes exhaustive
  async tests exercising `AsyncStrategy`, dotted-key resolution, and plugin
  lifecycle hooks.
- Type-level tests (tsd) are under `test-d/` to validate `forMember`
  inference and the `MemberRule` generic propagation.

---

## Build & Test

Run these from the repository root. Replace `npx` with your preferred
package runner when appropriate.

Type-check only
```bash
./node_modules/.bin/tsc --noEmit -p libs/automapper/tsconfig.lib.json
```

Build (development / local)
```bash
npx nx build automapper
```

Run unit tests
```bash
# via Nx (preferred if workspace test runner configured)
npx nx test automapper --skip-nx-cache

npx nx test automapper --skip-nx-cache -- --coverage --reporter verbose

```

Build for production and create npm package tarball
```bash
npx nx build automapper --configuration=production --skip-nx-cache

# copy packaging manifest used for publishing
cp libs/automapper/publish-package.json dist/libs/automapper/package.json

# create npm tarball
(cd dist/libs/automapper && npm pack)
```

---

If you want, I can:

- Add a short CHANGELOG entry summarizing the tests added.
- Prepare a release note / PR description summarizing Phase 1 & 2 changes.

---

References
- Source: `libs/automapper/src/lib`
- Tests: `libs/automapper/src/lib/__tests__`



---

> For more examples refer to the tests in `src/lib/libs.spec.ts` and to the
> plugin source files in `src/lib/plugins`.
