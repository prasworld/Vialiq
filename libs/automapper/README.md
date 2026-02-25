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
By default the mapper will recurse indefinitely.  Use `maxDepth` to cap
recursion, and `circularRefBehavior` to control how already‑visited objects
are handled (`'throw'`, `'ignore'` or `'null'`).

### Dot‑notation & nested properties
Both source and destination keys may use dot paths:

```ts
mb.forMember('address.city', o => o.mapFrom(s => s.city));
```
Destination objects will be created on the fly.

### Strict mode
When `options.strict` is true the mapper verifies that every source property
is either explicitly mapped or auto‑mapped; otherwise an error is thrown.  It
also uses the target constructor (if available) to know which destination
keys are legal.

### Arrays & mapArray
`mapArray()` is a convenience wrapper; most of the time `mapper.map()` will
handle arrays automatically.  Strict/async/converters apply recursively.

### Asynchronous mappings
Use `mapFromAsync()` inside a profile.  An `AsyncStrategy` is registered to
handle any profile containing asynchronous rules; `mapper.map` will then
return a `Promise`.

```ts
mapper.addStrategy(new AsyncStrategy());
mapper.addProfile(Foo, FooDto, (mb) => {
  mb.forMember('data', o => o.mapFromAsync(async s => fetchData(s.id)));
});
const result = await mapper.map(foo, FooDto);
```

### Profiling and Diagnostics
Wrap an existing strategy with `ProfilingStrategy` to log execution times:

```ts
mapper.addStrategy(new ProfilingStrategy(new DefaultStrategy(), console.debug));
```

## 🧩 Plugin & Customization Guide

The library is designed to be **open for extension, closed for modification**.
All custom features live outside the core, which never needs editing.  Plugins
typically implement one or both of the following:

1. A **`MappingStrategy`**, which may intercept, alter or augment mappings.
2. Extended builder methods that store extra data in the `MappingConfig`.

A strategy is simply an object implementing a tiny interface:

```ts
interface MappingStrategy {
  canHandle(source: unknown, destType: unknown, config?: MappingConfig<any, any>): boolean;
  map<S, D>(
    registry: MapperRegistry,
    src: S,
    destType: unknown,
    config: MappingConfig<S, D> | undefined,
    options: MapperOptions,
    visited: WeakSet<object>
  ): D | Promise<D>;
}
```

The registry maintains an ordered array of strategies.  When a mapping occurs
it calls `canHandle` on each strategy in turn until one returns `true`.  That
strategy’s `map` method is then executed.  A strategy may:

* perform a completely independent mapping (e.g. convert XML to JSON),
* mutate the incoming data or configuration,
* or delegate to the next strategy by calling `registry.map(src,destType,visited)`
  or by traversing `registry['strategies']` manually (as shown in the
  `LoggingStrategy` example earlier).

**Creating new validations, converters, or general-purpose plugins** simply
involves one or more strategies and, optionally, builder extensions.  The
core is never touched.

---

### 💡 Adding custom validation

A validator plugin inspects the source object and throws if it violates some
rule.  This is often desirable before performing expensive conversions.

```ts
// src/lib/plugins/validator.ts
import { MappingStrategy, MapperRegistry, MappingConfig, MapperOptions } from '@vi/automapper';

export interface ValidationRule<S> {
  (src: S): void; // throw if invalid
}

export class ValidatorStrategy implements MappingStrategy {
  canHandle(_s: unknown, _d: unknown, config?: MappingConfig<any, any>) {
    return Array.isArray(config?.validations);
  }

  map(reg: MapperRegistry, src: any, destType: any, config: any, options: MapperOptions, visited: WeakSet<object>) {
    (config.validations as ValidationRule<any>[]).forEach(fn => fn(src));
    return reg.map(src, destType, visited);
  }
}
```

The corresponding profile syntax uses `extend`:

```ts
mapper.addProfile(Person, PersonDto, mb => {
  mb.extend('validations', [
    (p: Person) => { if (!p.email.includes('@')) throw new Error('bad email'); }
  ]);
});
```

Multiple validators can be pushed into the array.  The strategy simply
rejects the mapping if any rule throws.

### 🔁 Writing converters

Converters are simpler: register one with `mapper.registerConverter` to
use it globally, or call `mapWith` inside a profile to use it inline.

```ts
mapper.registerConverter(String, Boolean, v => v === '1');

mapper.addProfile(Raw, Cleaned, mb => {
  mb.forMember('isActive', o => o.mapWith<boolean>(v => v === '1'));
});
```

Because converters are stored in a registry keyed by source/destination
tokens, you can also replace or override existing converters at runtime.  A
validator/transformer could even register new converters on the fly.

### 🧩 Complete plugin example: Sanitizer + Converter

Here’s a combined plugin that sanitizes a string property and then converts
it to an integer:

```ts
export class CleanAndParseStrategy implements MappingStrategy {
  canHandle(src, dest, config?) {
    return !!config?.cleanAndParse;
  }
  map(reg, src, destType, config, opts, vis) {
    if (config.cleanAndParse) {
      src = {
        ...src,
        age: String(src.age).trim().replace(/[^0-9]/g, ''),
      };
    }
    // delegate and then convert to number via converter registry
    const result = reg.map(src, destType, vis);
    if (typeof result === 'object' && 'age' in result) {
      (result as any).age = Number((result as any).age);
    }
    return result;
  }
}
```

### 📦 Publishing your own plugin package

Plugins don’t need to live inside the automapper repo.  You can create
a separate NPM package that depends on `@vi/automapper` and exports one or
more strategy classes (and perhaps helper builder extensions).  Consumers
install both packages and register the strategies at startup.

---

## 🧪 Full example scenarios

Below are a few comprehensive examples demonstrating various features:

### Nested objects + naming conventions
```ts
class Foo { bar_baz: string = 'x'; }
class FooDto { barBaz!: string; }
mapper.addProfile(Foo, FooDto, mb => {});
const result = mapper.map({ bar_baz: 'x' }, FooDto);
// result.barBaz === 'x'
```

### Deep arrays & converters
```ts
mapper.registerConverter(String, Number, s => parseInt(s));
mapper.addProfile(
  class A { items: string[] = [] },
  class B { items!: number[] },
  mb => {}
);
const b = mapper.map({ items: ['1','2'] }, B);
// b.items => [1,2]
```

### Complex nested object with arrays
```ts
class LineItem { productId!: string; quantity!: string; }
class Order { id!: string; items!: LineItem[]; }
class LineItemDto { productId!: number; qty!: number; }
class OrderDto { orderId!: string; lineItems!: LineItemDto[]; }

mapper.registerConverter(String, Number, v => parseInt(v));
mapper.addProfile(Order, OrderDto, mb => {
  mb.forMember('orderId', o => o.mapFrom(s => s.id));
  mb.forMember('lineItems', o =>
    o.mapFrom(s => s.items.map(i => ({ productId: +i.productId, qty: +i.quantity })))
  );
});

const dto = mapper.map({ id: '42', items: [{ productId: '3', quantity: '5' }] }, OrderDto);
// dto.lineItems[0].productId === 3
```

### circular references
```ts
const obj: any = { }; obj.self = obj;
const mapped = mapper.map(obj, 'Any');
// by default returns same object; use options to change behaviour
```

---

The additions above give comprehensive coverage of nested arrays/objects,
validation/converter/plugin development instructions, and new detail on
publishing plugins.
The registry keeps a stack of strategies.  When a mapping is requested it
finds the first strategy for which `canHandle` returns `true` and delegates to
its `map()` method.  A strategy may choose to:

- perform the mapping directly,
- inspect or mutate `src`/`config`/`options`,
- or delegate to the next strategy by calling `registry.map()` or by
  traversing `registry['strategies']` manually.

**Important:** Plugins must **not** modify the core strategy classes; they
are simply registered at runtime.  This keeps upgrades safe and enables
multiple plugins to coexist.

### Example: Validator strategy
```ts
// src/lib/plugins/validator.ts
import { MappingStrategy, MapperRegistry, MappingConfig, MapperOptions } from '@vi/automapper';

export class ValidatorStrategy implements MappingStrategy {
  canHandle(src: unknown, dest: unknown, config?: MappingConfig<any, any>) {
    // only run if profile has `validate` rules
    return !!config?.validate;
  }

  map(registry: MapperRegistry, src: any, destType: any, config: any, options: MapperOptions, visited: WeakSet<object>) {
    config.validate.forEach((fn: (s: any) => void) => fn(src));
    // delegate remaining work
    return registry.map(src, destType, visited);
  }
}
```

Usage in profile:
```ts
mb.extend('validate', [(s: Source) => {
  if (s.age < 0) throw new Error('negative age');
}]);
```

The validator never touches the core code and can be published separately.

### Example: Sanitizer strategy
```ts
// src/lib/plugins/sanitizer.ts
export class SanitizerStrategy implements MappingStrategy {
  canHandle(_s,_d,config?) { return !!config?.sanitize; }
  map(reg,src,destType,config,opts,vis) {
    config.sanitize.forEach((fn:any)=>fn(src));
    return reg.map(src,destType,vis);
  }
}
```

### Example: Custom naming-convention plugin
Suppose you want a `kebab-case` transformer not provided by core:

```ts
// src/lib/plugins/kebab.ts
import { MappingStrategy } from '@vi/automapper';
import { applyNamingConvention, NamingConvention } from '@vi/automapper';

export class KebabReplacementStrategy implements MappingStrategy {
  canHandle(src, dest, config?) { return !!config?.useKebab; }
  map(reg,src,destType,config,opts,vis) {
    opts.namingConvention = NamingConvention.CamelCase; // pre-transform
    const result = reg.map(src,destType,vis);
    // post-process keys travel from camel to kebab based on config
    return result;
  }
}
```

Plugins such as this only depend on the public API and are completely
isolated from the core logic.

### Framework integration (NestJS example)
Create a small helper package that wraps the mapper in a service:

```ts
import { Injectable } from '@nestjs/common';
import { createMapper, MappingStrategy } from '@vi/automapper';

@Injectable()
export class AutomapperService {
  private readonly mapper = createMapper({ strict: true });
  constructor() {
    this.mapper.addStrategy(new MyCustomStrategy());
  }
  map<S,D>(src:S, dest:any) { return this.mapper.map(src,dest); }
}
```

This service is then provided via Nest's DI container.  All mapping
behaviour still comes from the core library and your own plugins.

### Publishing plugins
Each plugin may live in `src/lib/plugins` with its own test file and
authoring.  Update `libs.ts` to expose them if you intend to bundle
together; otherwise maintain separate npm packages.  E.g.:

```ts
export * from './plugins/validator';
export * from './plugins/sanitizer';
```

---

## 🧪 Full example scenarios

Below are a few comprehensive examples demonstrating various features:

### Nested objects + naming conventions
```ts
class Foo { bar_baz: string = 'x'; }
class FooDto { barBaz!: string; }
mapper.addProfile(Foo, FooDto, mb => {});
const result = mapper.map({ bar_baz: 'x' }, FooDto);
// result.barBaz === 'x'
```

### Deep arrays & converters
```ts
mapper.registerConverter(String, Number, s => parseInt(s));
mapper.addProfile(
  class A { items: string[] = [] },
  class B { items!: number[] },
  mb => {}
);
const b = mapper.map({ items: ['1','2'] }, B);
// b.items => [1,2]
```

### circular references
```ts
const obj: any = { }; obj.self = obj;
const mapped = mapper.map(obj, 'Any');
// by default returns same object; use options to change behaviour
```

---

## 🛠 Build & Test

```bash
nx build automapper     # compile
nx test automapper      # run unit tests (Vitest)
```


---

> For more examples refer to the tests in `src/lib/libs.spec.ts` and to the
> plugin source files in `src/lib/plugins`.
