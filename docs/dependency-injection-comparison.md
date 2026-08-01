# Dependency Injection Architecture: Evaluation & Comparison

This document provides a comprehensive evaluation of three leading Dependency Injection (DI) strategies for modern TypeScript/Web Component architectures: **`@lit/context`**, **InversifyJS**, and **TSyringe**. 

The goal of this document is to provide the architecture team with concrete, easily comparable examples ranging from simple to complex use cases to guide future technical decisions regarding the creation of "Smart Widgets" and complex component libraries.

---

## 1. Executive Summary & Tabular Comparison

| Feature / Metric | `@lit/context` | `InversifyJS` | `TSyringe` |
|------------------|----------------|---------------|------------|
| **Paradigm** | DOM Event Bubbling (React-style Context) | Classic IoC Container (Constructor Injection) | Modern IoC Container (Constructor Injection) |
| **Primary Use Case** | UI State, Theming, Smart Widget API Adapters | Enterprise backend/frontend logic, complex OOP trees | Lightweight alternative to InversifyJS |
| **Framework Coupling**| Zero (Relies purely on standard DOM) | High (Requires central container management) | Medium/High (Requires container management) |
| **Bundle Size Impact**| **~1kb** (Extremely lightweight) | **~10-20kb** + `reflect-metadata` | **~5kb** + `reflect-metadata` |
| **TS Requirements** | Standard TS / experimental decorators | `emitDecoratorMetadata: true` | `emitDecoratorMetadata: true` |
| **Hierarchical DI** | Native (Based on DOM Tree layout) | Complex (Requires child containers) | Supported (Child containers) |
| **Learning Curve** | Low / Medium (Familiar to React devs) | High (Requires understanding of bindings/symbols) | Medium (Auto-injects by default) |

---

## 2. Deep Dive: `@lit/context`

`@lit/context` is not a traditional IoC container. Instead, it uses a community-standard DOM protocol. A **Provider** element listens for custom events fired by **Consumer** elements below it in the DOM tree. When it catches an event, it synchronously passes the requested dependency back to the consumer.

### Easy Use Case: UI Configuration & Theming

The most common use case is passing global configuration (like language or theming) down the component tree without "prop drilling".

```typescript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createContext, provide, consume } from '@lit/context';

// 1. Define the Context Key
export const configContext = createContext<{ lang: string }>('app-config');

// 2. The Provider (Placed high in the DOM)
@customElement('app-provider')
class AppProvider extends LitElement {
  @provide({ context: configContext })
  config = { lang: 'fr' };

  render() { return html`<slot></slot>`; }
}

// 3. The Consumer (Nested anywhere inside app-provider)
@customElement('localized-button')
class LocalizedButton extends LitElement {
  @consume({ context: configContext })
  config!: { lang: string };

  render() {
    return html`<button>${this.config.lang === 'fr' ? 'Bonjour' : 'Hello'}</button>`;
  }
}
```

### Complex Use Case: Framework-Agnostic Smart Business Widgets

Imagine we are building a complex `<clinical-ae-form>` widget. It needs to fetch data from an API. If we hardcode Angular's `HttpClient` into it, it becomes useless in React. Instead, we use context to request an `IApiAdapter` from the unknown host framework.

```typescript
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { createContext, consume } from '@lit/context';

// 1. Define the interface the Widget expects
export interface IApiAdapter {
  submitAdverseEvent(data: any): Promise<void>;
}

// 2. Define the Context Key
export const apiContext = createContext<IApiAdapter>('api-adapter');

// 3. The Smart Widget (100% Framework Agnostic)
@customElement('clinical-ae-form')
export class ClinicalAeForm extends LitElement {
  // Magically requests the API adapter from the DOM tree!
  @consume({ context: apiContext })
  private api!: IApiAdapter;

  @state() private saving = false;

  async handleSave() {
    this.saving = true;
    await this.api.submitAdverseEvent({ subject: '001', type: 'Headache' });
    this.saving = false;
  }

  render() {
    return html`<button @click=${this.handleSave}>Save AE</button>`;
  }
}
```
**In the Host App (e.g., Angular):**
The Angular app wraps the component in a provider and supplies its own services.
```html
<!-- Angular provides the adapter bridging its HttpClient to the widget -->
<context-provider [value]="angularApiAdapter">
   <clinical-ae-form></clinical-ae-form>
</context-provider>
```

### Advanced Architectural Use Case: Micro-Frontend Context Bridging & Shadow DOM

In a true Micro-Frontend (MFE) architecture, an Angular or React host application might render a complex Web Component widget that itself contains deep Shadow DOM trees. The challenge is passing host services (like an HTTP Client) through the Shadow boundaries without coupling.

`@lit/context` excels here because it uses native DOM event bubbling. However, you must manage how those events cross Shadow DOM boundaries using the `composed: true` event property (handled natively by `@lit/context`).

```typescript
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { createContext, consume } from '@lit/context';

// 1. Define an Interface (The Contract)
export interface IClinicalApi {
  submitAdverseEvent(data: any): Promise<void>;
}

// 2. Define Context Key
export const apiContext = createContext<IClinicalApi>('clinical-api');

// 3. The Deeply Nested Web Component (100% Framework Agnostic)
@customElement('clinical-ae-form')
export class ClinicalAeForm extends LitElement {
  // Bubbles a 'context-request' event up the DOM tree until it hits a provider!
  @consume({ context: apiContext })
  private api!: IClinicalApi;

  @state() private saving = false;

  async handleSave() {
    this.saving = true;
    await this.api.submitAdverseEvent({ subject: '001', type: 'Headache' });
    this.saving = false;
  }

  render() {
    return html`<button @click=${this.handleSave}>Save AE</button>`;
  }
}
```

**The Host Application Bridge (e.g., Angular or React):**
The host app wraps the widget in a context provider, bridging its internal DI system to the DOM context.

```html
<!-- Angular provides the adapter bridging its HttpClient to the widget -->
<context-provider [value]="angularApiAdapter">
   <!-- The MFE can be infinitely deep in the Shadow DOM; the context event will bubble up -->
   <clinical-mfe-container>
       <clinical-ae-form></clinical-ae-form>
   </clinical-mfe-container>
</context-provider>
```

### Pros & Cons
**Pros:** 
- **True UI framework decoupling:** The widget knows nothing of Angular/React.
- **Hierarchical Overriding:** A nested provider overrides a parent provider automatically based on DOM position (e.g., a specific modal overriding the global API context).
- **Bundle Size:** Zero impact. Extremely lightweight.

**Cons:** 
- Only works for classes that are part of the DOM (LitElements). Cannot be used easily in pure TypeScript logic classes (like background services or pure data models) that live outside the DOM tree.

---

## 3. Deep Dive: InversifyJS

InversifyJS is a heavily-featured, classic Inversion of Control (IoC) container. It brings enterprise-level DI (similar to Spring Boot or Angular's internal DI) to plain TypeScript.

### Easy Use Case: Simple Logger Injection

```typescript
import 'reflect-metadata';
import { Container, injectable, inject } from 'inversify';

// 1. Define Symbols (Identifiers)
const TYPES = { Logger: Symbol.for('Logger') };

// 2. Define Service
@injectable()
class ConsoleLogger {
  log(msg: string) { console.log(msg); }
}

// 3. Inject into Consumer
@injectable()
class Application {
  constructor(@inject(TYPES.Logger) private logger: ConsoleLogger) {}
  run() { this.logger.log('App Started'); }
}

// 4. Setup Container
const container = new Container();
container.bind<ConsoleLogger>(TYPES.Logger).to(ConsoleLogger);
container.bind<Application>('App').to(Application);

const app = container.get<Application>('App');
app.run();
```

### Complex Use Case: N-Tier Architecture with Scope Management

Inversify shines when managing complex OOP architectures (Controllers -> Services -> Repositories) where you need strict control over Singletons vs Transient (new instance per request) scopes.

```typescript
import { Container, injectable, inject } from 'inversify';

const TYPES = {
  Database: Symbol.for('Database'),
  UserService: Symbol.for('UserService'),
  UserController: Symbol.for('UserController')
};

// 1. Database (Singleton - one connection for the whole app)
@injectable()
class PostgresDatabase {
  connect() { return "Connected to DB"; }
}

// 2. Service (Transient - new instance created for every injection)
@injectable()
class UserService {
  constructor(@inject(TYPES.Database) private db: PostgresDatabase) {}
  getUser() { return `${this.db.connect()} -> User John`; }
}

// 3. Controller
@injectable()
class UserController {
  constructor(@inject(TYPES.UserService) private userService: UserService) {}
  handle() { return this.userService.getUser(); }
}

// 4. Container Configuration
const container = new Container();
// Force Singleton
container.bind<PostgresDatabase>(TYPES.Database).to(PostgresDatabase).inSingletonScope();
// Force Transient (Default)
container.bind<UserService>(TYPES.UserService).to(UserService).inTransientScope();
container.bind<UserController>(TYPES.UserController).to(UserController);

const controller = container.get<UserController>(TYPES.UserController);
```

### Advanced Architectural Use Case: CQRS Command Bus & Factory Providers

InversifyJS shines in enterprise patterns like Command Query Responsibility Segregation (CQRS). In this pattern, a generic `CommandBus` must dynamically resolve the correct handler for a given command at runtime without keeping every handler alive in memory.

```typescript
import { Container, injectable, inject, interfaces } from 'inversify';

// 1. Interfaces
interface ICommand { type: string; }
interface ICommandHandler<T extends ICommand> {
  execute(command: T): Promise<void>;
}

// 2. A specific Command and its Handler
class CreateUserCommand implements ICommand {
  readonly type = 'CreateUser';
  constructor(public email: string) {}
}

@injectable()
class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  async execute(command: CreateUserCommand) {
    console.log(`Creating user: ${command.email}`);
  }
}

// 3. Dynamic Handler Factory (Avoids Service Locator Anti-Pattern in Domain Logic)
// We bind a factory that returns a function capable of resolving handlers by name.
const container = new Container();
container.bind<ICommandHandler<any>>("CreateUserHandler").to(CreateUserHandler);

container.bind<interfaces.Factory<ICommandHandler<any>>>("HandlerFactory")
  .toFactory<ICommandHandler<any>>((context) => {
    return (handlerName: string) => {
      // Dynamic runtime resolution
      return context.container.get<ICommandHandler<any>>(handlerName);
    };
  });

// 4. The Command Bus (Uses the Factory)
@injectable()
class CommandBus {
  constructor(
    @inject("HandlerFactory") private handlerFactory: (name: string) => ICommandHandler<any>
  ) {}

  async dispatch(command: ICommand) {
    // Dynamically resolve the correct handler (e.g., "CreateUserHandler")
    const handler = this.handlerFactory(`${command.type}Handler`);
    await handler.execute(command);
  }
}

container.bind<CommandBus>("CommandBus").to(CommandBus);

// 5. Execution
const bus = container.get<CommandBus>("CommandBus");
bus.dispatch(new CreateUserCommand("test@vialiq.com"));
```

### Pros & Cons
**Pros:** 
- **Enterprise Capabilities:** Supports highly advanced patterns: Factory injection (as shown above), Provider injection (for async initialization like DB connections), circular dependency resolution, and custom middleware.
- **Strict Scope Control:** Fine-grained control over Singleton, Transient, and Request scopes (perfect for Express.js APIs).

**Cons:** 
- **Heavy:** Requires `reflect-metadata` which bloats web bundles significantly.
- **Boilerplate:** Requires manual binding of Strings/Symbols to concrete classes. 
- **DOM Disconnect:** Does not integrate naturally with the DOM hierarchy, making it useless for UI-based scope overrides (e.g., "this modal gets a different service instance than that modal").

---

## 4. Deep Dive: TSyringe (Microsoft)

TSyringe is Microsoft's modern take on InversifyJS. It is much lighter and relies on "auto-injection". Instead of manually binding Symbols in a container, TSyringe uses the TypeScript types themselves as injection tokens.

### Easy Use Case: Auto-Injection

```typescript
import 'reflect-metadata';
import { container, injectable, autoInjectable } from 'tsyringe';

@injectable()
class ConfigService {
  get apiUrl() { return 'https://api.vialiq.com'; }
}

// autoInjectable allows the class to be instantiated normally (new ApiClient())
// while still resolving missing constructor arguments from the container.
@autoInjectable()
class ApiClient {
  // TSyringe reads the 'ConfigService' type and resolves it automatically!
  constructor(private config?: ConfigService) {}

  fetch() { console.log(`Fetching from ${this.config?.apiUrl}`); }
}

// Notice we didn't have to manually bind anything in the container!
const client = new ApiClient();
client.fetch();
```

### Complex Use Case: Hierarchical Child Containers

If you build a complex web app, you might want a "Global" container for Auth, but a "Local" container for a specific Wizard or Plugin that overrides certain services. TSyringe supports child containers natively.

```typescript
import { container, injectable, inject } from 'tsyringe';

@injectable()
class Logger {
  log() { return "Global Logger"; }
}

@injectable()
class SilentLogger {
  log() { return "Silent..."; }
}

@injectable()
class TaskRunner {
  constructor(private logger: Logger) {}
  run() { console.log(this.logger.log()); }
}

// 1. Global Resolution
const runner1 = container.resolve(TaskRunner);
runner1.run(); // Outputs: "Global Logger"

// 2. Child Container Override
const childContainer = container.createChildContainer();
// Override Logger with SilentLogger only for this child tree
childContainer.register(Logger, { useClass: SilentLogger });

const runner2 = childContainer.resolve(TaskRunner);
runner2.run(); // Outputs: "Silent..."
```

### Advanced Architectural Use Case: Extensible Plugin Architecture

A major strength of TSyringe is its ability to effortlessly resolve multiple implementations of a single interface using `@injectAll()`. This is incredibly useful for building extensible plugin architectures (e.g., resolving a list of validation rules, formatters, or data exporters).

```typescript
import { container, injectable, injectAll, singleton } from 'tsyringe';

// 1. The Token and Interface
const VALIDATOR_TOKEN = Symbol('IValidator');
interface IValidator {
  validate(data: any): boolean;
}

// 2. Concrete Plugin Implementations
@injectable()
class EmailValidator implements IValidator {
  validate(data: any) { return data.email?.includes('@'); }
}

@injectable()
class AgeValidator implements IValidator {
  validate(data: any) { return data.age >= 18; }
}

// 3. Registering Plugins
// Notice we register multiple classes to the SAME token
container.register(VALIDATOR_TOKEN, { useClass: EmailValidator });
container.register(VALIDATOR_TOKEN, { useClass: AgeValidator });

// 4. The Consumer (Engine) resolving all plugins automatically
@singleton()
class FormValidationEngine {
  // @injectAll injects an array of all registered implementations!
  constructor(@injectAll(VALIDATOR_TOKEN) private validators: IValidator[]) {}

  runValidation(data: any) {
    const isValid = this.validators.every(v => v.validate(data));
    console.log(`Form is valid: ${isValid}`);
  }
}

// Execution
const engine = container.resolve(FormValidationEngine);
engine.runValidation({ email: 'test@domain.com', age: 20 }); // true
```

### Pros & Cons
**Pros:** 
- **Developer Experience:** Much less boilerplate than InversifyJS. It heavily relies on auto-injection based on TypeScript types.
- **Hierarchical Scopes:** Native support for Child Containers, which conceptually maps better to UI trees or isolated modules.
- **Plugin Capabilities:** `@injectAll()` makes extensible engine architectures trivial.

**Cons:** 
- **Metadata Overhead:** Still requires `reflect-metadata` and the `emitDecoratorMetadata` TypeScript compiler flag, which complicates modern build toolchains (like Vite or esbuild) that strip types without compiling them.

---

## 5. Architectural Recommendations

The choice of DI framework depends entirely on **what layer** of the application you are building.

### Recommendation 1: For the Web Component Library (`@vialiq/web-components`)
**Decision:** Use `@lit/context` and ES Module Singletons exclusively.
**Why?** 
UI libraries must be extremely lightweight and perfectly portable. Introducing `reflect-metadata` into a UI library creates massive friction for consumers (Angular/React developers). UI components naturally live in a DOM hierarchy, making the DOM-event-based `@lit/context` the absolute perfect fit for passing state/adapters down the tree without prop-drilling.

### Recommendation 2: For Standalone Functional Widgets (Micro-Frontends)
**Decision:** Use `@lit/context` as an Adapter Interface.
**Why?**
If you are building a smart `<clinical-ae-form>`, it should declare what it needs via `@lit/context` interfaces. The host application (whether Angular or React) is then responsible for rendering a Context Provider that wraps its own native services and passes them in. This ensures the widget remains 100% framework agnostic.

### Recommendation 3: For a Pure TypeScript Client SDK or Core Logic Layer
**Decision:** Use `TSyringe`.
**Why?**
If you are extracting your core business logic, validation rules, and API orchestrations into a pure TypeScript SDK (a layer that has no HTML/DOM knowledge), `@lit/context` will not work. 
In this case, `TSyringe` is highly recommended over `InversifyJS` because it provides 90% of the functionality with significantly less boilerplate and a more modern auto-injection developer experience.
