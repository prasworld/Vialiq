# `@vialiq/utilities`

This library provides core utilities for the Vialiq Micro-Frontend (MFE) ecosystem. Its primary feature is the **Native i18n Translation Subsystem**, designed from the ground up for modern, zoneless Angular apps and cross-framework MFE architectures.

---

## 🌍 Native i18n Translation Subsystem

The i18n library is designed to solve translation sharing across independently deployed MFEs without bundling all translations into a monolithic chunk.

### Key Features

- **Signal-native & Zoneless Ready:** Uses Angular 21+ Signals (`input()`, `computed()`, `rxResource`) and `pure: true` pipes without race conditions.
- **MFE Namespace Isolation:** Each micro-frontend manages its own translation JSON files. The engine prevents key collisions.
- **Zero Flicker:** Eager loading hooks into Angular's bootstrap sequence, ensuring components only render _after_ translations are loaded.
- **Smart Fallback:** Missing keys degrade gracefully to human-readable text (e.g., `FORM.ADVERSE_EVENT` -> `Adverse event`), never exposing raw screaming snake case keys to the user.
- **Deep Interpolation:** Supports `{{user.profile.name}}` syntax out of the box. _(Note: Complex ICU pluralization is deliberately out of scope)_.
- **Cross-Framework Bridge:** Includes a vanilla TS store (`translationStore`) for React, Lit, or Web Component remotes to react to locale changes synchronously.

---

## 🚀 For MFE Developers: Adding & Loading Translations

### 1. Create your Translation Files

Each MFE owns its translations. Create a dedicated folder in your project's assets:

```text
apps/your-mfe/src/assets/i18n/
  ├── en.json
  └── fr.json
```

**Format Rules:**

- Keys must be `SCREAMING_SNAKE_CASE` (e.g., `ADVERSE_EVENT`, `MAX_LENGTH`).
- You can nest objects arbitrarily (e.g., `{"FORM": {"SUBMIT": "Submit"}}`).
- **You must always provide an `en.json` file**. It acts as the ultimate fallback layer.

### 2. Register with `provideTranslations`

In your MFE's configuration, register your namespace.

#### A. Eager Strategy (For Shell / Non-Lazy Apps)

Use `eager: true` to halt Angular's root bootstrap until translations are fully loaded.

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideTranslations } from '@vialiq/utilities';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTranslations({
      namespace: 'shell',
      baseUrl: '/assets/i18n',
      eager: true,
    }),
  ],
};
```

#### B. Lazy Strategy (For Lazy-Loaded MFEs)

`APP_INITIALIZER` does not run for lazy-loaded modules. To guarantee zero-flicker for a lazy MFE, you must set `eager: false` and attach the `resolveTranslation` route resolver to your root route.

```typescript
// apps/your-mfe/src/app/remote.routes.ts
import { Route } from '@angular/router';
import { provideTranslations, resolveTranslation } from '@vialiq/utilities';

export const remoteRoutes: Route[] = [
  {
    path: '',
    resolve: { i18n: resolveTranslation('your-mfe') }, // Blocks rendering!
    providers: [
      provideTranslations({
        namespace: 'your-mfe', // Must match the resolver!
        baseUrl: 'http://localhost:4201/assets/i18n',
        eager: false, // Disables APP_INITIALIZER
      }),
    ],
    children: [
      // ... MFE routes
    ],
  },
];
```

> [!IMPORTANT]
> **Asset Serving & Base URLs:** In a Micro-Frontend architecture, each remote serves its own assets.
> In development, the shell runs on port `4200` and your remote might run on `4201`.
> Ensure your `baseUrl` is correct for production (often an absolute URL pointing to your MFE's origin, e.g., `environment.i18nBaseUrl`).

### 3. Ensure Assets are Built

Verify your `project.json` (or `angular.json`) copies the assets folder to the build output:

```json
"assets": [
  "apps/your-mfe/src/assets"
]
```

---

## 🛡️ How Zero-Flicker Loading works

A common issue in SPAs is the "translation flicker" — components render immediately, displaying raw keys (like `FORM.SUBMIT`) for a few milliseconds until the JSON network request completes, causing the UI to flash.

**`@vialiq/utilities` solves this completely.**

When you use `provideTranslations({ eager: true })`, it hooks into Angular's `APP_INITIALIZER` injection token.

- The factory function inside `APP_INITIALIZER` triggers `TranslationService.loadInitial()`, which returns a `Promise`.
- The `Promise` is resolved _only after_ both the requested locale (e.g., `fr.json`) and the fallback locale (`en.json`) have been fully downloaded and parsed.
- **Angular's bootstrapper halts.** It will absolutely not bootstrap the application or begin rendering the component tree until all `APP_INITIALIZER` promises resolve.
- By the time your first component runs its constructor, the Translation Engine's registry is fully populated.

---

## 🛠️ Usage in Components

### Translate Pipe (Recommended)

Use the `translate` pipe in templates. It is `pure: true` and reacts seamlessly to locale changes via Signals.

```html
<!-- Simple -->
{{ 'FORM.SUBMIT' | translate }}

<!-- With Parameters -->
{{ 'ERRORS.MIN_LENGTH' | translate: { MIN: 5 } }}

<!-- Deep Object Interpolation -->
{{ 'FORM.WELCOME' | translate: { user: { profile: { name: 'Alice' } } } }}
```

_(Given `en.json`: `{ "FORM": { "WELCOME": "Welcome, {{user.profile.name}}!" } }`)_

### Translate Directive

You can also use the signal-based attribute directive:

```html
<span [viTranslate]="'FORM.SUBMIT'" [viTranslateParams]="{ COUNT: 3 }"></span>
```

### TypeScript (Synchronous)

Because we ensure translations are loaded before rendering, it is safe to resolve translations synchronously in your TypeScript controllers:

```typescript
import { Component, inject } from '@angular/core';
import { TranslationService } from '@vialiq/utilities';

@Component({ ... })
export class MyComponent {
  private readonly ts = inject(TranslationService);

  submit() {
    const label = this.ts.instant('FORM.SUBMIT');
    console.log(label);
  }
}
```

---

## 🐛 Dev Console `window.__vi18n`

In development mode, a global `window.__vi18n` object is exposed. This lets you debug and test translations directly from your browser's DevTools console without changing code or hot-reloading.

**This is entirely tree-shaken out of production builds.**

```javascript
// Switch locale immediately (all MFEs will reactively update!)
await window.__vi18n.setLocale('fr');

// Test translation with missing keys to see the smart fallback in action
window.__vi18n.t('ERRORS.SYSTEM_FAILURE');
// -> "System failure"

// Dump all loaded keys for your MFE to inspect the flattened paths
window.__vi18n.keys('your-mfe');
```

---

## 🧩 Advanced Extensibility (MFE Injection Tokens)

To meet the strict, diverse requirements of large-scale MFE ecosystems, the library provides several injection tokens to customize its behavior.

### 1. `MFE_NAMESPACE` (Preventing Cross-MFE Key Bleeding)

If Remote A and Remote B both use the key `FORM.SUBMIT`, the engine needs to know which MFE is asking for the translation. Provide the `MFE_NAMESPACE` at the root of your lazy-loaded remote to enforce strict namespace lookups for all `TranslatePipe` and `TranslateDirective` usages within that remote.

```typescript
import { MFE_NAMESPACE } from '@vialiq/utilities';

export const remoteProviders = [{ provide: MFE_NAMESPACE, useValue: 'form-builder' }];
```

### 2. `TRANSLATION_LOADER` (Swappable HTTP Loaders)

By default, the library uses a framework-agnostic `window.fetch` loader. If you need your translations to be fetched via Angular's `HttpClient` (e.g., to pass through authentication Interceptors), provide the built-in `HttpTranslationLoader` or create your own.

```typescript
import { TRANSLATION_LOADER, HttpTranslationLoader } from '@vialiq/utilities';

export const appProviders = [{ provide: TRANSLATION_LOADER, useClass: HttpTranslationLoader }];
```

### 3. `MISSING_KEY_HANDLER` (Production Telemetry)

By default, missing keys trigger a `console.warn` in dev mode and a smart fallback (e.g., `Missing key` -> `Missing key`). To pipe missing keys to Datadog, Sentry, or another telemetry service in production, implement the `ViMissingKeyHandler` interface.

```typescript
import { MISSING_KEY_HANDLER, ViMissingKeyHandler } from '@vialiq/utilities';

export class SentryMissingKeyHandler implements ViMissingKeyHandler {
  handle(key: string, namespace?: string): string {
    Sentry.captureMessage(`[i18n] Missing key: ${key} in ${namespace}`);
    return `[Missing: ${key}]`;
  }
}

export const appProviders = [{ provide: MISSING_KEY_HANDLER, useClass: SentryMissingKeyHandler }];
```

---

## 🔬 i18n Implementation Review

### 1. Architectural Overview
The translation library (`@vialiq/utilities/i18n`) is architected with a decoupled, framework-agnostic core (`TranslationEngine` and `TranslationLoader`). Angular-specific bindings (`TranslationService`, `TranslatePipe`, `TranslateDirective`) wrap this core.

- **Reactivity**: In Angular, it leverages Signals (`translations()`) to trigger UI updates without relying on RxJS `BehaviorSubject`s. 
- **Micro-Frontend Ready**: The `translationStore` acts as a Vanilla TS bridge, ensuring React, Vue, and Lit web components share the exact same translation registry and locale state as the Angular host.
- **Performance**: Flattened key-value maps (`Map<string, string>`) are used internally, providing `O(1)` access time during `instant()` lookups instead of expensive deep object traversal on every Angular change detection cycle.

### 2. Corner Cases & Limitations

#### 2.1 Nested Arrays in JSON
**Behavior**: If a JSON translation file contains an array (`"ITEMS": ["One", "Two"]`), the `flatten()` method explicitly ignores it (`!Array.isArray(v)`). The array keys are silently dropped.
**Recommendation**: Developers must use objects for lists (e.g., `"ITEMS": { "0": "One", "1": "Two" }`) or rely on a different structure. This is standard in most i18n libraries, but should be documented in developer guidelines.

#### 2.2 Namespace Collisions
**Behavior**: If `instant('FORM.SUBMIT')` is called without providing a namespace parameter, the engine loops through all registered namespaces and returns the first match it finds.
**Risk**: If two MFEs register the same key (e.g., `APP.TITLE`), the resolution order depends on which MFE was loaded first.
**Mitigation**: The `TranslatePipe` and `TranslateDirective` automatically inject the `MFE_NAMESPACE` token. Developers using the `TranslationService` imperatively must be careful to provide the namespace if they are outside a properly tokenized module.

#### 2.3 Partial Locales & Fallbacks
**Behavior**: If a user switches to `fr` (French), the loader fetches `fr.json`. Simultaneously, it fetches `en.json` (if not already cached) and registers it first. 
**Benefit**: This creates a guaranteed "base layer". If the French file is missing a newly added key (e.g., `"NEW_FEATURE"`), the engine will automatically serve the English translation instead of a raw key.
**Edge Case**: If both `fr.json` and `en.json` 404 (e.g., network failure), the engine degrades gracefully to its humanizer fallback (`"FORM.SUBMIT"` -> "Submit"). 

### 3. Real-World Usage Considerations

#### 3.1 Network Throttling & Flicker
When switching locales, `loadAll()` fires parallel HTTP requests for all registered namespaces. The `translations()` signal is **not updated** until `Promise.allSettled` completes. 
- **Pros**: The UI will not "flash" missing keys mid-transition. 
- **Cons**: On a slow 3G connection, the user might see the old language for a few seconds after selecting a new one. Implementing an app-wide loading spinner during `setLocale` is recommended for optimal UX.

#### 3.2 Non-Angular Frameworks
The recent fix to `translationStore.ts` ensures that when a React or Vue MFE calls `loadNamespace()`, the manifest is permanently registered in the engine. When the Angular Shell later calls `setLocale()`, the core engine knows to re-fetch the React/Vue JSON files automatically, keeping the entire distributed app in absolute sync.
