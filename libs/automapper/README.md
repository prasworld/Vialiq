# @vi/automapper

A lightweight, extensible, type-safe object-to-object mapper for TypeScript.
Zero dependencies. Pluggable strategies. Full lifecycle hooks.

---

## Table of Contents

1. [Installation](#installation)
2. [Core Concepts](#core-concepts)
3. [Creating a Mapper](#creating-a-mapper)
4. [Defining Mapping Profiles](#defining-mapping-profiles)
5. [forMember — Typed Member Rules](#formember--typed-member-rules)
6. [Naming Conventions](#naming-conventions)
7. [Converters — Global and Inline](#converters--global-and-inline)
8. [Asynchronous Mapping](#asynchronous-mapping)
9. [MappingContext](#mappingcontext)
10. [Nested Objects and Dotted Paths](#nested-objects-and-dotted-paths)
11. [Array / Collection Mapping](#array--collection-mapping)
12. [Circular Reference Handling](#circular-reference-handling)
13. [Validation — Inline and Strategy-based](#validation--inline-and-strategy-based)
14. [Plugins — Using Built-in Plugins](#plugins--using-built-in-plugins)
15. [Plugins — Writing Your Own Plugin](#plugins--writing-your-own-plugin)
16. [Strategies — Writing a Custom Strategy](#strategies--writing-a-custom-strategy)
17. [Profiling and Performance Diagnostics](#profiling-and-performance-diagnostics)
18. [MapperOptions Reference](#mapperoptions-reference)
19. [Build and Test Commands](#build-and-test-commands)

---

## Installation

```bash
npm install @vi/automapper
```

The package ships as ESM + CJS with full TypeScript declarations. No peer
dependencies are required.

---

## Core Concepts

| Concept | Description |
|---|---|
| **Mapper** | The registry created by `createMapper()`. Holds profiles, strategies and plugins. |
| **Profile** | A configuration created by `addProfile` that teaches the mapper how to convert `S → D`. |
| **Strategy** | A class that performs the actual transformation. Strategies are tried in registration order; the first whose `canHandle()` returns `true` is used. |
| **Plugin** | A strategy + metadata + lifecycle hooks bundled together. Installed via `mapper.use(plugin)`. |
| **Converter** | A function `(S) => D` registered globally or used inline with `mapWith`. |
| **MappingContext** | A per-operation context bag (operationId, startedAt, custom items) threaded through the full pipeline. |

---

## Creating a Mapper

```ts
import { createMapper, NamingConvention } from '@vi/automapper';

// Default mapper — permissive, no naming convention
const mapper = createMapper();

// Strict mapper — throws if a source property has no mapping rule
const strictMapper = createMapper({ strict: true });

// Fully configured mapper
const configured = createMapper({
  namingConvention: NamingConvention.SnakeCase,
  maxDepth: 5,
  circularRefBehavior: 'ignore',
  pluginValidation: 'error',
});
```

`createMapper` returns a `MapperRegistry`. You can have **multiple independent
mapper instances** in the same application — useful for isolating domain
contexts (e.g. a read model mapper vs. a write model mapper).

---

## Defining Mapping Profiles

A profile is a builder function `(builder: MappingBuilder<S, D>) => void`
passed to `addProfile`. It defines every member rule and lifecycle hook for
one source-to-destination pair.

```ts
class User {
  constructor(
    public firstName: string,
    public lastName: string,
    public dateOfBirth: string,   // ISO string from API
    public isActive: boolean,
  ) {}
}

class UserDto {
  fullName!: string;
  birthDate!: Date;
  active!: boolean;
}

const mapper = createMapper();

mapper.addProfile(User, UserDto, (mb) => {
  mb.forMember('fullName',  (o) => o.mapFrom((s) => `${s.firstName} ${s.lastName}`));
  mb.forMember('birthDate', (o) => o.mapWith<Date>((s) => new Date(s.dateOfBirth)));
  mb.forMember('active',    (o) => o.mapFrom((s) => s.isActive));
});

const user = new User('Jane', 'Smith', '1990-06-15', true);
const dto  = mapper.map(user, UserDto) as UserDto;

console.log(dto.fullName);   // 'Jane Smith'
console.log(dto.birthDate);  // Date object: 1990-06-15
console.log(dto.active);     // true
```

### String tokens instead of class constructors

For plain objects (POJOs) without constructors, register profiles using string
keys. The source object must have a matching `constructor.name` value at
runtime (or you can cast it).

```ts
mapper.addProfile('ApiUser', 'ApiUserDto', (mb) => {
  mb.forMember('fullName', (o) => o.mapFrom((s: any) => `${s.first} ${s.last}`));
});

const src = Object.assign(Object.create({ constructor: { name: 'ApiUser' } }), {
  first: 'Ada', last: 'Lovelace',
});
const result = mapper.map(src, 'ApiUserDto') as any;
console.log(result.fullName); // 'Ada Lovelace'
```

### Lifecycle hooks — beforeMap and afterMap

```ts
mapper.addProfile(User, UserDto, (mb) => {
  mb.beforeMap((src, ctx) => {
    // runs before any member rule — ctx is always provided by the mapper
    console.log(`[${ctx?.operationId}] starting User → UserDto for`, src.firstName);
  });

  mb.forMember('fullName', (o) => o.mapFrom((s) => `${s.firstName} ${s.lastName}`));

  mb.afterMap((dst, ctx) => {
    console.log(`[${ctx?.operationId}] done — fullName:`, dst.fullName);
  });
});
```

---

## forMember — Typed Member Rules

`forMember` is the primary DSL for configuring individual destination
properties. Its typed overload constrains both the key and the resolved value
to match the destination type at compile time.

```ts
// Typed overload — TypeScript narrows 'fullName' to keyof UserDto
// and enforces that mapFrom returns a value assignable to UserDto['fullName']
mb.forMember('fullName', (o) => o.mapFrom((s) => `${s.firstName} ${s.lastName}`));
```

### All member options

```ts
mapper.addProfile(Source, Dest, (mb) => {

  // mapFrom — synchronous resolver
  mb.forMember('label', (o) => o.mapFrom((src) => src.title.toUpperCase()));

  // mapFromAsync — asynchronous resolver (requires AsyncStrategy to be registered)
  mb.forMember('avatar', (o) =>
    o.mapFromAsync(async (src) => fetchAvatar(src.userId))
  );

  // ignore — the key is removed from the destination object entirely
  mb.forMember('internalToken', (o) => o.ignore());

  // mapWith — typed inline converter; return type is tied to the destination property type
  mb.forMember('score', (o) =>
    o.mapWith<number>((src) => parseInt(src.rawScore, 10))
  );
});
```

### Using MappingContext inside a resolver

```ts
mb.forMember('displayName', (o) =>
  o.mapFrom((src, ctx) => {
    // ctx.items is the bag of caller-supplied metadata
    const locale = (ctx?.items as { locale?: string })?.locale ?? 'en';
    return src.names?.[locale] ?? src.names?.['en'] ?? src.name;
  })
);
```

---

## Naming Conventions

Apply `NamingConvention` globally on `createMapper` to auto-transform
property keys before writing to the destination.

```ts
import { createMapper, NamingConvention } from '@vi/automapper';

class ApiResponse {
  user_first_name = 'Ada';
  user_last_name  = 'Lovelace';
  created_at      = '2024-01-01';
}

class ViewModel {
  userFirstName!: string;
  userLastName!: string;
  createdAt!: string;
}

// CamelCase: 'user_first_name' → 'userFirstName'
const mapper = createMapper({ namingConvention: NamingConvention.CamelCase });

// No explicit forMember rules needed — autoMap + CamelCase convention handles it
mapper.addProfile(ApiResponse, ViewModel, (_mb) => {});

const vm = mapper.map(new ApiResponse(), ViewModel) as ViewModel;
console.log(vm.userFirstName); // 'Ada'
console.log(vm.createdAt);     // '2024-01-01'
```

| Convention | Example input → output |
|---|---|
| `NamingConvention.CamelCase` | `user_first_name` → `userFirstName` |
| `NamingConvention.SnakeCase` | `userFirstName` → `user_first_name` |
| `NamingConvention.PascalCase` | `user_first_name` → `UserFirstName` |

---

## Converters — Global and Inline

### Built-in converters (registered automatically on every mapper)

| From | To | Behavior |
|---|---|---|
| `String` | `Number` | `Number(v)` |
| `Number` | `String` | `String(v)` |
| `String` | `Date` | `new Date(v)` |
| `Date` | `String` | `v.toISOString()` |

### Registering a global converter

Global converters are applied when `mapWith` resolves a type pair from the
registry, or when you invoke them manually in a `mapFrom`.

```ts
const mapper = createMapper();

// Register once — applies globally across all profiles on this mapper
mapper.registerConverter(String, Boolean, (v) => v === 'true' || v === '1');

// Domain type converter
mapper.registerConverter(
  Money,
  MoneyDto,
  (m) => ({ amount: m.cents / 100, currency: m.currency })
);
```

### Inline converter with mapWith

```ts
mapper.addProfile(Order, OrderDto, (mb) => {
  // mapWith<DestPropertyType> — the generic ensures the return type is checked
  mb.forMember('total', (o) =>
    o.mapWith<number>((src) =>
      src.lineItems.reduce((acc, li) => acc + li.price, 0)
    )
  );

  mb.forMember('createdAt', (o) =>
    o.mapWith<Date>((src) => new Date(src.createdAtIso))
  );
});
```

---

## Asynchronous Mapping

Register `AsyncStrategy` once to enable `mapFromAsync` member rules. The
strategy activates automatically when a profile has at least one async rule;
sync-only profiles continue to be handled synchronously.

```ts
import { createMapper, AsyncStrategy } from '@vi/automapper';

const mapper = createMapper();
mapper.addStrategy(new AsyncStrategy()); // register once at startup

class Post { constructor(public id: string, public authorId: string) {} }
class PostDto { id!: string; authorName!: string; commentCount!: number }

mapper.addProfile(Post, PostDto, (mb) => {
  mb.forMember('id', (o) => o.mapFrom((s) => s.id));

  // Both async resolvers run in sequence; mapper.map() returns Promise<PostDto>
  mb.forMember('authorName', (o) =>
    o.mapFromAsync(async (s) => {
      const author = await userRepository.findById(s.authorId);
      return author.name;
    })
  );

  mb.forMember('commentCount', (o) =>
    o.mapFromAsync(async (s) => commentRepository.countByPost(s.id))
  );
});

const dto = await (mapper.map(new Post('1', 'u42'), PostDto) as Promise<PostDto>);
console.log(dto.authorName);    // e.g. 'Alice'
console.log(dto.commentCount);  // e.g. 12
```

### Async array mapping

```ts
const posts = [new Post('1', 'u1'), new Post('2', 'u2')];
const dtos  = await (mapper.mapArray(posts, PostDto) as Promise<PostDto[]>);
```

---

## MappingContext

`MappingContext` is a per-operation immutable object created automatically
by the mapper for every `map()` call.

| Property | Type | Description |
|---|---|---|
| `operationId` | `string` | UUID or timestamp — unique to this invocation |
| `startedAt` | `number` | `Date.now()` when the context was created |
| `items` | `Record<string, unknown>` | Caller-supplied metadata bag |

### Reading context in hooks and resolvers

```ts
mapper.addProfile(User, UserDto, (mb) => {
  mb.beforeMap((src, ctx) => {
    // operationId is always present — useful for tracing
    tracer.start(ctx!.operationId, 'User→UserDto');
  });

  mb.forMember('greeting', (o) =>
    o.mapFrom((src, ctx) => {
      const lang = (ctx?.items as { lang?: string })?.lang ?? 'en';
      return lang === 'fr' ? `Bonjour ${src.firstName}` : `Hello ${src.firstName}`;
    })
  );

  mb.afterMap((_dst, ctx) => {
    tracer.end(ctx!.operationId);
  });
});
```

---

## Nested Objects and Dotted Paths

### Explicit nested mapping via mapFrom

```ts
class Address  { constructor(public city: string, public zip: string) {} }
class AddressDto { city!: string; zip!: string }

class Customer  { constructor(public name: string, public address: Address) {} }
class CustomerDto { name!: string; address!: AddressDto }

mapper.addProfile(Address,  AddressDto,  (_mb) => { /* autoMap handles city + zip */ });

mapper.addProfile(Customer, CustomerDto, (mb) => {
  mb.forMember('name',    (o) => o.mapFrom((s) => s.name));
  mb.forMember('address', (o) =>
    o.mapFrom((s) => mapper.map(s.address, AddressDto) as AddressDto)
  );
});

const dto = mapper.map(new Customer('Bob', new Address('Berlin', '10115')), CustomerDto) as CustomerDto;
console.log(dto.address.city); // 'Berlin'
```

### Dotted destination keys — flatten source into nested output

```ts
class FlatInput { constructor(public city: string, public country: string) {} }
class NestedOutput { location!: { city: string; country: string } }

mapper.addProfile(FlatInput, NestedOutput, (mb) => {
  // Dot notation creates the intermediate 'location' object automatically
  mb.forMember('location.city',    (o) => o.mapFrom((s) => s.city));
  mb.forMember('location.country', (o) => o.mapFrom((s) => s.country));
});

const out = mapper.map(new FlatInput('Paris', 'FR'), NestedOutput) as NestedOutput;
console.log(out.location.city);    // 'Paris'
console.log(out.location.country); // 'FR'
```

---

## Array / Collection Mapping

```ts
const users = [
  new User('Alice', 'A', '1990-01-01', true),
  new User('Bob',   'B', '1985-06-15', false),
];

// Synchronous — returns UserDto[]
const dtos = mapper.mapArray(users, UserDto) as UserDto[];

// Async — returns Promise<UserDto[]> when AsyncStrategy is active for this profile
const asyncDtos = await (mapper.mapArray(users, PostDto) as Promise<PostDto[]>);
```

---

## Circular Reference Handling

```ts
class TreeNode {
  children: TreeNode[] = [];
  parent?: TreeNode;
  constructor(public label: string) {}
}

// 'ignore' — silently skips the circular property (safe default)
const mapperIgnore = createMapper({ circularRefBehavior: 'ignore' });

// 'null'   — replaces circular value with null in the destination
const mapperNull   = createMapper({ circularRefBehavior: 'null' });

// 'throw'  — throws an Error when a cycle is detected
const mapperThrow  = createMapper({ circularRefBehavior: 'throw' });

// default (undefined) — the circular value becomes undefined in the destination
const mapperDef    = createMapper();
```

---

## Validation — Inline and Strategy-based

### 1. Inline validation with beforeMap (quick, per-profile)

Throw inside `beforeMap` to abort the mapping before any member rules run.

```ts
mapper.addProfile(User, UserDto, (mb) => {
  mb.beforeMap((src) => {
    if (!src.firstName?.trim())
      throw new Error('User.firstName is required');
    if (!src.dateOfBirth)
      throw new Error('User.dateOfBirth is required');
    if (typeof src.isActive !== 'boolean')
      throw new Error('User.isActive must be a boolean');
  });

  mb.forMember('fullName',  (o) => o.mapFrom((s) => `${s.firstName} ${s.lastName}`));
  mb.forMember('birthDate', (o) => o.mapWith<Date>((s) => new Date(s.dateOfBirth)));
  mb.forMember('active',    (o) => o.mapFrom((s) => s.isActive));
});
```

### 2. Reusable validation rules via a ValidatorStrategy

Store typed validation functions in the profile's extension bag. A shared
`ValidatorStrategy` runs them before delegating to `DefaultStrategy`. This
keeps rules reusable and composable across many profiles.

**Step A — write the strategy (once per app)**

```ts
// validator-strategy.ts
import { MappingStrategy, MapperRegistry, MappingConfig, MapperOptions } from '@vi/automapper';

export type ValidationRule<S> = (src: S) => void; // throw to reject

export class ValidatorStrategy implements MappingStrategy {
  canHandle(
    _src: unknown,
    _dest: unknown,
    config?: MappingConfig<unknown, unknown>
  ): boolean {
    return Array.isArray((config as any)?.validations);
  }

  map<S, D>(
    registry: MapperRegistry,
    src: S,
    destType: unknown,
    config: MappingConfig<S, D> | undefined,
    options: MapperOptions,
    visited: WeakSet<Record<string, unknown>>
  ): D | Promise<D> {
    const rules = (config as any).validations as ValidationRule<S>[];
    for (const rule of rules) {
      rule(src); // throws on failure — mapping is aborted
    }
    // hand off to the next strategy (typically DefaultStrategy)
    const next = registry
      .getStrategies()
      .find((s) => !(s instanceof ValidatorStrategy));
    if (!next) throw new Error('No downstream strategy found');
    return next.map(registry, src, destType, config, options, visited);
  }
}
```

**Step B — define reusable rules**

```ts
// validations.ts
export const requireEmail = (src: { email?: string }) => {
  if (!src.email?.includes('@'))
    throw new Error(`Invalid email address: "${src.email}"`);
};

export const requirePositiveAge = (src: { age?: number }) => {
  if (!src.age || src.age <= 0)
    throw new Error(`Age must be a positive number, got: ${src.age}`);
};

export const requireNonEmptyName = (src: { firstName?: string; lastName?: string }) => {
  if (!src.firstName?.trim()) throw new Error('firstName is required');
  if (!src.lastName?.trim())  throw new Error('lastName is required');
};
```

**Step C — register and use**

```ts
import { ValidatorStrategy } from './validator-strategy';
import { requireEmail, requirePositiveAge, requireNonEmptyName } from './validations';

mapper.addStrategy(new ValidatorStrategy()); // install once globally

mapper.addProfile(User, UserDto, (mb) => {
  // Attach validation rules to this profile only
  mb.extend('validations', [
    requireNonEmptyName,
    requireEmail,
    requirePositiveAge,
  ] as any);

  mb.forMember('fullName', (o) => o.mapFrom((s) => `${s.firstName} ${s.lastName}`));
  mb.forMember('active',   (o) => o.mapFrom((s) => s.isActive));
});

// Validation failure throws before any mapping occurs
try {
  mapper.map(new User('', 'Jones', '1990-01-01', true), UserDto);
} catch (e: any) {
  console.error(e.message); // 'firstName is required'
}
```

### 3. Async validation inside mapFromAsync

```ts
mapper.addProfile(Order, OrderDto, (mb) => {
  mb.forMember('total', (o) =>
    o.mapFromAsync(async (src) => {
      const check = await pricingService.validate(src.id);
      if (!check.valid) throw new Error(`Order ${src.id} failed pricing validation: ${check.reason}`);
      return check.total;
    })
  );
});
```

---

## Plugins — Using Built-in Plugins

### LoggingPlugin

Logs every mapping invocation using any logger function.

```ts
import { createMapper } from '@vi/automapper';
import { LoggingPlugin } from '@vi/automapper';

const mapper = createMapper();
mapper.use(new LoggingPlugin(console.debug));

// Now every mapper.map() call emits two lines:
// [LoggingStrategy] mapping User -> UserDto
// [LoggingStrategy] finished User -> UserDto
```

### ProfilingStrategy

Wraps any strategy and emits timing information.

```ts
import { createMapper, DefaultStrategy } from '@vi/automapper';
import { ProfilingStrategy } from '@vi/automapper';

const timings: string[] = [];
const mapper = createMapper();
mapper.addStrategy(
  new ProfilingStrategy(new DefaultStrategy(), (msg) => timings.push(msg))
);

mapper.map(user, UserDto);
console.log(timings);
// ['[AutoMapper] User -> UserDto took 2ms']
```

### Combining plugins

```ts
const mapper = createMapper();
mapper.use(new LoggingPlugin(console.debug));          // lifecycle log lines
mapper.addStrategy(
  new ProfilingStrategy(new DefaultStrategy(), console.info)  // timing
);
```

---

## Plugins — Writing Your Own Plugin

A plugin implements the `MapperPlugin` interface:

```ts
interface MapperPlugin {
  readonly metadata: PluginMetadata;    // id, name, version, apiVersion
  readonly strategy: MappingStrategy;   // the strategy this plugin contributes

  // optional lifecycle hooks (all are called safely — errors are swallowed):
  onInstall?(registry: PluginAwareRegistry): void;
  onProfileAdded?(key: string, config: unknown): void;
  onMapStart?(src: unknown, destType: unknown): void;
  onMapEnd?(src: unknown, dest: unknown, durationMs: number): void;
  onMapError?(src: unknown, destType: unknown, error: Error): void;
}
```

### Example: Audit trail plugin

Records every mapping to an in-memory log, exposing `getLog()` and `clearLog()`.

```ts
// audit-plugin.ts
import {
  MapperPlugin, MappingStrategy, MapperRegistry,
  MappingConfig, MapperOptions, PluginAwareRegistry,
  PLUGIN_API_VERSION,
} from '@vi/automapper';

// ── Passthrough strategy ────────────────────────────────────────────────────
// This plugin observes via lifecycle hooks only; it never handles mapping itself.
class NeverHandleStrategy implements MappingStrategy {
  canHandle() { return false; }
  map(): never { throw new Error('should never be called'); }
}

// ── Audit entry type ────────────────────────────────────────────────────────
export interface AuditEntry {
  srcType: string;
  destType: string;
  durationMs: number;
  timestamp: Date;
  error?: string;
}

// ── Plugin ──────────────────────────────────────────────────────────────────
export class AuditPlugin implements MapperPlugin {
  readonly metadata = {
    id: 'com.vi.audit',
    name: 'Audit Plugin',
    version: '1.0.0',
    apiVersion: PLUGIN_API_VERSION,
    description: 'Records all mapping operations to an audit log',
  };

  readonly strategy: MappingStrategy = new NeverHandleStrategy();

  private _log: AuditEntry[] = [];
  private _start = new Map<string, { srcType: string; destType: string; ts: number }>();

  onInstall(_registry: PluginAwareRegistry): void {
    console.log('[AuditPlugin] installed');
  }

  onMapStart(src: unknown, destType: unknown): void {
    const key = `${Date.now()}-${Math.random()}`;
    this._start.set(key, {
      srcType:  this._typeName(src),
      destType: this._typeName(destType),
      ts: Date.now(),
    });
  }

  onMapEnd(_src: unknown, _dest: unknown, durationMs: number): void {
    const last = [...this._start.entries()].pop();
    if (!last) return;
    const [key, { srcType, destType }] = last;
    this._start.delete(key);
    this._log.push({ srcType, destType, durationMs, timestamp: new Date() });
  }

  onMapError(src: unknown, destType: unknown, error: Error): void {
    this._log.push({
      srcType:  this._typeName(src),
      destType: this._typeName(destType),
      durationMs: 0,
      timestamp: new Date(),
      error: error.message,
    });
  }

  getLog():   AuditEntry[] { return [...this._log]; }
  clearLog(): void         { this._log = []; }

  private _typeName(v: unknown): string {
    if (typeof v === 'string') return v;
    if (typeof v === 'function') return (v as any).name ?? 'unknown';
    if (v && typeof v === 'object') return (v as any).constructor?.name ?? 'unknown';
    return String(v);
  }
}
```

```ts
// usage
const mapper = createMapper();
const audit  = new AuditPlugin();
mapper.use(audit);

mapper.addProfile(User, UserDto, (mb) => {
  mb.forMember('fullName', (o) => o.mapFrom((s) => `${s.firstName} ${s.lastName}`));
});

mapper.map(new User('Alice', 'Smith', '1990-01-01', true), UserDto);

console.table(audit.getLog());
// ┌─────────┬──────────┬───────────┬─────────────┬───────────────────────────┬───────┐
// │ srcType │ destType │ durationMs│ timestamp   │ error                     │       │
// ├─────────┼──────────┼───────────┼─────────────┼───────────────────────────┤       │
// │ 'User'  │ 'UserDto'│ 1         │ 2026-03-04  │ undefined                 │       │
// └─────────┴──────────┴───────────┴─────────────┴───────────────────────────┘
```

### Plugin API version enforcement

When a plugin's `apiVersion` does not match the library's `PLUGIN_API_VERSION`,
the mapper reacts according to `pluginValidation`:

```ts
import { PLUGIN_API_VERSION } from '@vi/automapper';

// 'warn' (default) — logs console.warn and continues
const lenient = createMapper({ pluginValidation: 'warn' });

// 'error' — throws and aborts the install
const strict  = createMapper({ pluginValidation: 'error' });

// 'off'   — skips the check entirely
const silent  = createMapper({ pluginValidation: 'off' });

// Install fails cleanly (no partial state) when onInstall throws
mapper.use(buggyPlugin); // rolls back registry to its pre-install state on error
```

---

## Strategies — Writing a Custom Strategy

Strategies are the lowest-level extension point. They control **how** a
mapping is performed. The last strategy added is tried first.

### canHandle() controls dispatch

```ts
// Only activate for source objects tagged with a 'mappingHints' property
canHandle(src: unknown): boolean {
  return typeof src === 'object' && src !== null && 'mappingHints' in src;
}
```

### Example: HTML-sanitisation strategy

Strips HTML tags from all string values before delegating to `DefaultStrategy`.

```ts
// sanitise-strategy.ts
import { MappingStrategy, MapperRegistry, MappingConfig, MapperOptions, DefaultStrategy } from '@vi/automapper';

function stripHtml(v: unknown): unknown {
  return typeof v === 'string' ? v.replace(/<[^>]*>/g, '') : v;
}
function deepSanitise(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return stripHtml(obj);
  if (Array.isArray(obj)) return obj.map(deepSanitise);
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, deepSanitise(v)])
  );
}

export class SanitiseStrategy implements MappingStrategy {
  constructor(private readonly next: MappingStrategy = new DefaultStrategy()) {}

  canHandle(src: unknown, dest: unknown, config?: MappingConfig<unknown, unknown>) {
    return this.next.canHandle(src, dest, config);
  }

  map<S, D>(
    registry: MapperRegistry,
    src: S,
    destType: unknown,
    config: MappingConfig<S, D> | undefined,
    options: MapperOptions,
    visited: WeakSet<Record<string, unknown>>
  ): D | Promise<D> {
    return this.next.map(registry, deepSanitise(src) as S, destType, config, options, visited);
  }
}
```

```ts
import { createMapper } from '@vi/automapper';
import { SanitiseStrategy } from './sanitise-strategy';

const mapper = createMapper();
mapper.addStrategy(new SanitiseStrategy());

class RawInput  { constructor(public bio: string) {} }
class SafeOutput { bio!: string }

mapper.addProfile(RawInput, SafeOutput, (mb) => {
  mb.forMember('bio', (o) => o.mapFrom((s) => s.bio));
});

const out = mapper.map(new RawInput('<b>Hello</b> <script>alert(1)</script>world'), SafeOutput) as SafeOutput;
console.log(out.bio); // 'Hello world'
```

### Composing multiple strategies

Strategies are selected by insertion order — **last added = first tried**.

```ts
mapper.addStrategy(new ValidatorStrategy()); // 3rd priority
mapper.addStrategy(new SanitiseStrategy());  // 2nd priority
mapper.addStrategy(new CacheStrategy());     // 1st priority — tried first
```

---

## Profiling and Performance Diagnostics

`ProfilingStrategy` wraps any inner strategy and emits a timing log per
mapping operation.

```ts
import { createMapper, DefaultStrategy, ProfilingStrategy } from '@vi/automapper';

const logs: string[] = [];
const mapper = createMapper();

// Wrap DefaultStrategy in a profiling layer
mapper.addStrategy(
  new ProfilingStrategy(new DefaultStrategy(), (msg) => logs.push(msg))
);

mapper.addProfile(User, UserDto, (mb) => {
  mb.forMember('fullName', (o) => o.mapFrom((s) => `${s.firstName} ${s.lastName}`));
});

mapper.map(new User('Jane', 'Smith', '1990-01-01', true), UserDto);

console.log(logs);
// ['[AutoMapper] User -> UserDto took 1ms']
```

You can wrap `AsyncStrategy` the same way:

```ts
import { AsyncStrategy } from '@vi/automapper';
mapper.addStrategy(new ProfilingStrategy(new AsyncStrategy(), console.debug));
```

---

## MapperOptions Reference

| Option | Type | Default | Description |
|---|---|---|---|
| `strict` | `boolean` | `false` | Throw if a source property has no mapping rule and is not present on the destination |
| `autoMap` | `boolean` | `true` | Copy same-named properties (after convention) automatically when no explicit rule exists |
| `namingConvention` | `NamingConvention` | `undefined` | Transform all keys with this convention |
| `maxDepth` | `number` | `undefined` | Stop recursing into nested objects beyond this depth |
| `circularRefBehavior` | `'throw' \| 'ignore' \| 'null'` | `undefined` (→ `undefined` in dest) | How to handle circular references |
| `pluginValidation` | `'warn' \| 'error' \| 'off'` | `'warn'` | Validate plugin `apiVersion` on `mapper.use()` |

---

## Build and Test Commands

Run these from the repository root:

```bash
# Type-check (no emit)
./node_modules/.bin/tsc --noEmit -p libs/automapper/tsconfig.lib.json

# Build (development)
npx nx build automapper

# Build for production + create npm tarball
npx nx build automapper --configuration=production --skip-nx-cache
cp libs/automapper/publish-package.json dist/libs/automapper/package.json
(cd dist/libs/automapper && npm pack)

# Run all unit tests
npx nx test automapper --skip-nx-cache

# Tests with coverage (emitted to coverage/automapper/)
npx nx test automapper --skip-nx-cache -- --coverage --reporter verbose
```

---

## Package Entrypoints (npm consumers)

The published package exposes the following import paths:

| Import path | Contents | Peer dependency |
|---|---|---|
| `@vi/automapper` | Core mapper, builder, strategies, plugins, naming, converters | none |
| `@vi/automapper/angular` | `provideAutomapper()`, `AUTOMAPPER_TOKEN` | `@angular/core >=15` |
| `@vi/automapper/zod` | `profileFromZod()`, `validateWithZod()`, `safeValidateWithZod()` | `zod >=3` |
| `@vi/automapper/orm` | `profileFromColumns()`, `profileFromDescriptor()` | none |
| `@vi/automapper/fetch-adapter` | `createMappedFetcher()`, `createMappedArrayFetcher()`, `createMappedQueryFn()`, `createMappedSWRFetcher()` | none |
| `@vi/automapper/deep-clone` | `deepClone()`, `mapWithClone()`, `registerWasmClone()` | none |

Only the subpaths you import are included in your bundle — `@angular/core` and `zod` are never loaded unless you explicitly import from `@vi/automapper/angular` or `@vi/automapper/zod`.

### Examples

```ts
// Core only — zero peer deps
import { createMapper } from '@vi/automapper';

// Angular DI (requires @angular/core)
import { provideAutomapper, AUTOMAPPER_TOKEN } from '@vi/automapper/angular';

// Zod schema integration (requires zod)
import { profileFromZod } from '@vi/automapper/zod';

// ORM column-list profile — works with TypeORM, MikroORM, Prisma, etc.
import { profileFromColumns } from '@vi/automapper/orm';

// Fetch adapter — React Query / SWR compatible, no UI-framework dep
import { createMappedFetcher, createMappedQueryFn } from '@vi/automapper/fetch-adapter';

// Deep clone before mapping (uses structuredClone, WASM-upgradeable)
import { deepClone, mapWithClone } from '@vi/automapper/deep-clone';
```

### Publish strategy

The source `libs/automapper/package.json` is **not** what ships to npm.
The build pipeline copies `libs/automapper/publish-package.json` into `dist/libs/automapper/package.json` via the `postbuild-publish` Nx target, overwriting the source file. Only `publish-package.json` declares the `exports` map, `peerDependencies`, and `files` list.

---

> Source: `libs/automapper/src/lib`
> Tests: `libs/automapper/src/lib/__tests__`
> Roadmap: `libs/automapper/docs/implementation_roadmap.md`
> Plugin API: `libs/automapper/docs/plugin-api.md`

