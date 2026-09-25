# ADR-003: Native i18n Translation Library (`@vialiq/utilities`)

| Field | Value |
|---|---|
| **Status** | Proposed |
| **Date** | 2026-09-12 |
| **Author** | Prashant Gupta |
| **Scope** | New `libs/utilities` library; all apps and libs in the Vialiq MFE monorepo |

---

## Context

The Vialiq platform is a Micro-Frontend (MFE) monorepo with Angular as the primary framework. As the product expands into multi-language markets, native translation (i18n) support is required. The existing ecosystem (`ngx-translate`, Angular's built-in i18n) does not satisfy the following constraints:

- **Per-library translation bundles**: Each lib carries its own `assets/i18n/*.json` files. A central monolithic bundle creates coupling between independently deployable MFEs.
- **Modern Angular-first API**: All reactive primitives must use Angular's signal system (`signal`, `computed`, `rxResource`) — no RxJS `BehaviorSubject`-based services, no `async` pipe workarounds.
- **Cross-framework compatibility**: The shell or external teams may mount React or other framework MFEs. Translation state must be shareable without importing Angular-specific APIs.
- **MFE Module Federation**: Each remote loads independently. Translation namespaces must not conflict. The shell may not know which remotes are loaded at build time.
- **Interpolation**: Support parameterized strings (e.g., `"Welcome, {{name}}!"`).
- **Pluralization**: Deliberately **not supported** in the current scope. We are optimizing for simplicity; complex ICU formatting and pluralization are out of scope.

---

## Decision

Create a new library: **`libs/utilities`** (published as `@vialiq/utilities`).

Within it, create a translation sub-system at `libs/utilities/src/lib/i18n/`.

The design is split into three independently-usable layers:

```
@vialiq/utilities
└── i18n/
    ├── core/          ← Framework-agnostic translation engine (vanilla TS)
    ├── angular/       ← Angular-specific service, pipe, directive (signals-based)
    └── bridge/        ← Framework bridge for React / Web Components / other MFEs
```

---

## Architecture

### Layer 1: Core Engine (Framework-Agnostic)

**File:** `libs/utilities/src/lib/i18n/core/translation-engine.ts`

A plain TypeScript class — no Angular, no React, no framework dependencies.

**Responsibilities:**
- Holds a registry of namespaced translation maps: `Map<namespace, Map<key, string>>`
- Performs key lookup with namespace fallback chain
- Performs interpolation: replaces `{{param}}` tokens with provided values
- Emits change events via a native `EventTarget` / custom event (not RxJS, not signals)

```
TranslationEngine
  ├── register(namespace: string, translations: Record<string, string>): void
  ├── translate(key: string, params?: Record<string, unknown>, namespace?: string): string
  ├── has(key: string, namespace?: string): boolean
  ├── onChange(listener: () => void): () => void   ← returns cleanup fn
  └── currentLocale: string
```

**Key design decisions:**
- Call-site key format: plain dot-path `FORM.ADVERSE_EVENT` — no namespace prefix at the call site
- All JSON key segments are **SCREAMING_SNAKE_CASE** — uppercase letters and underscores only
- Nested key segments are separated by `.` (dot-path traversal into the JSON tree)
- **Every locale including English has its own JSON file** (`en.json`, `fr.json`, `de.json`)
- Namespace is an internal loader concept — consumers never write `form-builder:FORM.ADVERSE_EVENT`
- **Missing key fallback**: take the last segment, split by `_`, sentence-case the first word, lowercase the rest, join with space
  - `FORM.ADVERSE_EVENT` (missing) → `Adverse event`
  - `ERRORS.MAX_LENGTH_EXCEEDED` (missing) → `Max length exceeded`
  - This ensures the UI **never shows a raw key string** — it always degrades to a human-readable label
- Interpolation regex: `\{\{(\w+)\}\}` — params object spread fills placeholders
- The engine is a singleton per-process but fully replaceable in tests

---

### Layer 2: Translation Loader

**File:** `libs/utilities/src/lib/i18n/core/translation-loader.ts`

Responsible for fetching `*.json` files from each lib/app's assets. Decoupled from the engine.

```
TranslationLoader
  ├── load(namespace: string, locale: string, url: string): Promise<void>
  ├── loadAll(manifests: TranslationManifest[], locale: string): Promise<void>
  └── status: 'idle' | 'loading' | 'loaded' | 'error'
```

**`TranslationManifest`** is a plain object each lib/app declares at bootstrap:

```ts
export interface TranslationManifest {
  namespace: string;   // e.g. 'form-builder'
  baseUrl: string;     // e.g. '/assets/i18n/form-builder'
  // Resolved to: /assets/i18n/form-builder/{locale}.json
}
```

**Loading strategy:**
- `loadAll()` fires all HTTP fetches in parallel (`Promise.allSettled`)
- Failed namespaces log a warning in devMode — they do NOT block the application
- Loaded translations are registered into the `TranslationEngine`
- Subsequent `load()` calls for the same namespace+locale are no-ops (cached)

**MFE consideration:** Each remote registers its own `TranslationManifest` when it boots.
The shell does not need to know about remotes' namespaces in advance.
Remotes call `loadAll()` in their `APP_INITIALIZER` (Angular) or during mount (React).

---

### Layer 3a: Angular Service (Signal-based)

**File:** `libs/utilities/src/lib/i18n/angular/translation.service.ts`

```ts
@Injectable({ providedIn: 'root' })
export class TranslationService {
  // Internal: locale being requested (not yet loaded)
  private readonly _requestedLocale = signal<string>(
    localStorage.getItem('vi18n:locale')    // 1. persisted preference
    ?? navigator.language.split('-')[0]     // 2. browser default ('en-US' → 'en')
  );

  // Tracks the last successfully loaded locale so locale() never regresses mid-flight
  private _previousLocale = this._requestedLocale();

  // rxResource: re-fetches all namespace JSON files when locale changes.
  // .value() only updates AFTER all fetches resolve — no race condition.
  private readonly _resource = rxResource({
    request: () => ({ locale: this._requestedLocale(), manifests: this._manifests() }),
    loader: ({ request }) => from(this._loader.loadAll(request.manifests, request.locale)).pipe(
      tap(() => { this._previousLocale = request.locale; })
    ),
  });

  // PUBLIC: signal that updates only when translations are fully loaded.
  // Pipe and computed() read this — not locale() — to avoid race conditions.
  readonly translations = computed(() => this._resource.value());

  // Effective locale — only updates when load completes, never flickers mid-flight
  readonly locale = computed(() =>
    this._resource.status() === 'loaded' ? this._requestedLocale() : this._previousLocale
  );

  readonly isLoading = computed(() => this._resource.status() === 'loading');

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Synchronous translation. Returns the translated string immediately.
   * Safe to call any time after bootstrap. Falls back gracefully if key missing.
   * @example translateService.instant('FORM.ADVERSE_EVENT', { FIELD: 'Email' })
   */
  instant(key: string, params?: Record<string, unknown>): string

  /**
   * Async translation. Waits for the current in-flight load to settle, then resolves.
   * Use in guards, resolvers, or immediately after setLocale() before templates re-render.
   * @example await translateService.get('FORM.ADVERSE_EVENT')
   */
  get(key: string, params?: Record<string, unknown>): Promise<string>

  /**
   * Called by provideTranslations() APP_INITIALIZER. Loads the initial locale.
   * Returns a Promise — Angular blocks bootstrap until it resolves.
   */
  loadInitial(): Promise<void>

  registerNamespace(manifest: TranslationManifest): void

  /**
   * Switches locale. Triggers rxResource to fetch new JSON files.
   * Also persists to LOCALE_STORAGE so the choice survives a page refresh.
   */
  setLocale(locale: string): void
}
```

**Why `translations` computed and not `locale` signal:**

| | `locale()` alone | `translations()` ← correct |
|---|---|---|
| Updates when | Locale is SET (before fetch) | Fetch COMPLETES |
| Race condition | ✅ Yes — renders before data is ready | ❌ None |
| Re-renders pipe | Too early | At exactly the right time |
| Reactive to load completion | ❌ No | ✅ Yes |

`rxResource.value()` is Angular's signal-native async result. It only emits a new value when
the loader resolves — never during pending state. This is the correct reactive event to drive
template re-renders.

**`APP_INITIALIZER` pattern for each lib/app:**

```ts
export function provideTranslations(manifest: TranslationManifest): EnvironmentProviders {
  return makeEnvironmentProviders([{
    provide: APP_INITIALIZER,
    useFactory: (ts: TranslationService) => () => {
      ts.registerNamespace(manifest);
      return ts.loadInitial(); // Promise — Angular blocks bootstrap until resolved
    },
    deps: [TranslationService],
    multi: true,
  }]);
}
```

Usage in any lib/app:
```ts
provideTranslations({ namespace: 'form-builder', baseUrl: '/assets/i18n/form-builder' })
```

---

### Layer 3b: Angular Pipe + Directive

**`TranslatePipe`** (`libs/utilities/src/lib/i18n/angular/translate.pipe.ts`):

```ts
@Pipe({ name: 'translate', standalone: true, pure: true })
export class TranslatePipe implements PipeTransform {
  private readonly ts = inject(TranslationService);

  transform(key: string, params?: Record<string, unknown>): string {
    // Read translations() — only updates when load fully completes. No race condition.
    this.ts.translations();
    return this.ts.instant(key, params);
  }
}
```

**Template usage:**
```html
<!-- Simple -->
{{ 'FORM.ADVERSE_EVENT' | translate }}

<!-- With interpolation params -->
{{ 'ERRORS.MAX_LENGTH' | translate: { FIELD_NAME: 'Email', MAX: 100 } }}

<!-- With a model object (all properties used as params) -->
{{ 'FORM.WELCOME' | translate: model }}
```

**TypeScript imperative usage:**
```ts
// Sync — use when translations are guaranteed loaded (after bootstrap)
const label = this.translateService.instant('FORM.ADVERSE_EVENT');
const msg   = this.translateService.instant('ERRORS.MAX_LENGTH', { FIELD_NAME: 'Email', MAX: 100 });
const text  = this.translateService.instant('FORM.WELCOME', model); // spread model object

// Async — use in guards/resolvers or when locale switch may be in flight
const label = await this.translateService.get('FORM.ADVERSE_EVENT');
```

> **Why NOT `locale()` and why NOT `pure: false`:**
>
> Reading `locale()` causes a race condition — it updates when the locale is *requested*, before
> the JSON files have been fetched. Templates would re-render showing keys or English fallbacks
> during the load, then re-render again when loading completes.
>
> `pure: false` in a **zoneless** Angular app provides zero benefit — there is no periodic CD cycle
> to trigger re-evaluation. `pure: false` only matters in Zone-based apps. In a zoneless app,
> reactivity comes exclusively from reading signals inside `transform()`.
>
> `translations()` is the correct reactive primitive: it is a `computed()` over
> `rxResource.value()` which only changes when the loader resolves. One re-render, at the right time,
> with all data guaranteed to be present.

**`TranslateDirective`** — attribute shorthand:
```html
<span [viTranslate]="'FORM.SUBMIT'" [viTranslateParams]="{ COUNT: 3 }"></span>
```


---

### Layer 3c: Extensibility Hooks (Injection Tokens)

To make the library truly robust in a Module Federation environment, we expose Angular Injection Tokens for critical integration points.

**1. `MFE_NAMESPACE`**
When `TranslatePipe` and `TranslateDirective` are used inside a remote MFE, they automatically inject `MFE_NAMESPACE` if provided. This rigidly scopes all key lookups to that specific MFE, preventing race conditions or namespace bleeds if two MFEs use the same key (e.g. `FORM.SUBMIT`).

**2. `TRANSLATION_LOADER` & `HttpTranslationLoader`**
The core engine defaults to `window.fetch` (framework-agnostic). However, Angular apps often require translation requests to pass through `HttpInterceptor`s for authentication, CSRF tokens, or logging.
By providing `TRANSLATION_LOADER` (using our built-in `HttpTranslationLoader`), all fetching delegates to Angular's native `HttpClient`.

**3. `MISSING_KEY_HANDLER`**
By default, missing keys trigger a `console.warn` in dev mode and a smart fallback (`Missing key`). For production telemetry (e.g., Sentry, Datadog), apps can implement `ViMissingKeyHandler` and provide it via the `MISSING_KEY_HANDLER` token to intercept all missing key events centrally.
---

### Layer 4: Framework Bridge (Cross-Framework MFE)

**File:** `libs/utilities/src/lib/i18n/bridge/translation-store.ts`

The `TranslationEngine` (Layer 1) is exposed as a **plain JavaScript object** — no Angular, no React imports. Shared as a Module Federation singleton.

```ts
// libs/utilities/src/lib/i18n/bridge/translation-store.ts
// Vanilla TS — no Angular, no React. Importable by any framework.
export const translationStore = {
  // Translate a key synchronously using the shared engine
  instant: (key: string, params?: Record<string, unknown>) => engine.instant(key, params),

  // Switch locale — fetches new JSON for all registered namespaces, then notifies listeners
  setLocale: async (locale: string): Promise<void> => {
    await loader.loadAll(engine.getManifests(), locale);
    engine.setLocale(locale); // fires onChange → all framework listeners re-render
  },

  // Subscribe to locale changes. Returns a cleanup function.
  onLocaleChange: (cb: () => void): (() => void) => engine.onChange(cb),

  getLocale: (): string => engine.currentLocale,

  // Register a new namespace and immediately load it for the current locale
  loadNamespace: (manifest: TranslationManifest): Promise<void> =>
    loader.load(manifest.namespace, engine.currentLocale, `${manifest.baseUrl}/${engine.currentLocale}.json`),
};
```

**Module Federation `shared` config (all remotes must declare this):**

```ts
// webpack.config.js
shared: {
  '@vialiq/utilities': { singleton: true, requiredVersion: 'auto' },
}
```

`singleton: true` ensures one `TranslationEngine` instance across all remotes.
When Angular calls `setLocale('fr')`, the React remote's `onLocaleChange` fires — single source of truth.

**React usage:**
```tsx
// useTranslation.ts — ships with a react-companion or in-repo hook
function useTranslation(ns?: string) {
  const [, rerender] = useReducer(x => x + 1, 0);

  useEffect(() => {
    // Re-render React component on locale change
    return translationStore.onLocaleChange(rerender);
  }, []);

  return {
    t: (key: string, params?) => translationStore.get(key, params, ns),
    locale: translationStore.getLocale(),
    setLocale: translationStore.setLocale,
  };
}
```

**Lit / Web Component usage:**
```ts
connectedCallback() {
  super.connectedCallback();
  this._i18nCleanup = translationStore.onLocaleChange(() => this.requestUpdate());
}
disconnectedCallback() {
  super.disconnectedCallback();
  this._i18nCleanup?.();
}
```

---

### Layer 5: Dev Console Testing Mechanism (Dev Mode Only)

**File:** `libs/utilities/src/lib/i18n/bridge/dev-console.ts`

In development mode, a global helper is attached to `window.__vi18n`. This lets developers
switch locale, inspect loaded keys, and test translations directly from DevTools console —
**no code changes, no hot reload needed**.

The entire block is **tree-shaken in production** via `isDevMode()` / `NODE_ENV !== 'production'`.

**API exposed at `window.__vi18n` in devMode:**

```ts
window.__vi18n = {
  // Switch locale and re-fetch translation files — re-renders all components immediately
  setLocale(locale: string): Promise<void>

  // Read current locale
  getLocale(): string                                      // → 'en', 'fr', 'de'

  // List all registered namespaces across all remotes
  namespaces(): string[]                                   // → ['form-builder', 'shell']

  // Dump all loaded translation keys for a namespace
  keys(namespace: string): Record<string, string>

  // Translate a key right now with optional params
  t(key: string, params?: Record<string, unknown>): string

  // Force reload all namespaces for the current locale (clears cache)
  reload(): Promise<void>
};
```

**Browser console usage:**

```js
// Switch to French — all Angular/React/Lit components re-render immediately
await window.__vi18n.setLocale('fr')

// Inspect loaded keys for a namespace (flat dot-path map)
window.__vi18n.keys('form-builder')
// → { 'FORM.TITLE': 'Générateur de formulaire', 'FORM.SUBMIT': 'Soumettre', ... }

// Translate a key with params without touching any component
window.__vi18n.t('ERRORS.MAX_LENGTH', { FIELD_NAME: 'Email', MAX: 100 })
// → 'Email must not exceed 100 characters'

// Test missing-key smart fallback
window.__vi18n.t('FORM.ADVERSE_EVENT_UNKNOWN')
// → 'Adverse event unknown'  ← never a raw key string

// See all registered namespaces (useful when debugging MFE remotes)
window.__vi18n.namespaces()
// → ['shell', 'form-builder', 'form-renderer']

// Force a fresh fetch of all translation files (clears cache)
await window.__vi18n.reload()
```

**`installDevConsole()` implementation:**

```ts
export function installDevConsole(engine: TranslationEngine, loader: TranslationLoader): void {
  if (typeof window === 'undefined') return; // SSR guard
  if (!isDevMode()) return;                  // Tree-shaken in production

  (window as Window & { __vi18n?: unknown }).__vi18n = {
    setLocale: async (locale: string) => {
      await loader.loadAll(engine.getManifests(), locale);
      engine.setLocale(locale); // fires onLocaleChange → re-renders all consumers
      console.info(`[vi18n] Locale switched to "${locale}"`);
    },
    getLocale:  () => engine.currentLocale,
    namespaces: () => Array.from(engine.getNamespaces()),
    keys:       (ns: string) => engine.dump(ns),
    t:          (key: string, params?) => engine.translate(key, params),
    reload: async () => {
      loader.clearCache();
      await loader.loadAll(engine.getManifests(), engine.currentLocale);
      console.info('[vi18n] Translations reloaded');
    },
  };

  console.info(
    '%c[vi18n] Dev console ready → window.__vi18n',
    'color: #7c3aed; font-weight: bold; font-size: 12px;'
  );
}
```

**Integration:** `installDevConsole()` is called once during `TranslationService` bootstrap.
Since it is gated by `isDevMode()`, Angular's production compiler removes it entirely —
zero bytes shipped to production users.

**Why `window.__vi18n` works across all MFE remotes:** The `TranslationEngine` singleton is
shared via Module Federation `singleton: true`. Calling `window.__vi18n.setLocale('fr')` from the
shell console fires `engine.setLocale()` on the shared instance → all remotes' `onLocaleChange`
callbacks fire → React, Angular, and Lit components all re-render. One command, full app coverage.

---

## Translation File Structure

Each library owns its translation files:

```
libs/form-builder/src/assets/i18n/
  ├── en.json
  ├── fr.json
  └── de.json
```

**JSON format (SCREAMING_SNAKE_CASE keys — nested structure supported):**

```json
{
  "FORM": {
    "TITLE": "Form Builder",
    "SUBMIT": "Submit",
    "CANCEL": "Cancel",
    "FIELD": {
      "LABEL": "Field Label",
      "PLACEHOLDER": "Enter {{FIELD_TYPE}} value"
    },
    "ADVERSE_EVENT": "Adverse Event"
  },
  "ERRORS": {
    "REQUIRED": "{{FIELD_NAME}} is required",
    "MAX_LENGTH": "{{FIELD_NAME}} must not exceed {{MAX}} characters"
  }
}
```

Key access: `'FORM.FIELD.PLACEHOLDER' | translate: { FIELD_TYPE: 'text' }` → `"Enter text value"`

**Missing key fallback algorithm (never breaks the UI):**

```ts
// Engine pseudocode
function fallback(fullKey: string): string {
  const lastSegment = fullKey.split('.').at(-1) ?? fullKey; // 'ADVERSE_EVENT'
  const words = lastSegment.split('_');                     // ['ADVERSE', 'EVENT']
  const first = words[0].charAt(0).toUpperCase()           // 'A'
             + words[0].slice(1).toLowerCase();             // 'dverse'  → 'Adverse'
  const rest  = words.slice(1).map(w => w.toLowerCase());  // ['event']
  return [first, ...rest].join(' ');                        // 'Adverse event'
}
```

| Missing key | Fallback output |
|---|---|
| `FORM.ADVERSE_EVENT` | `Adverse event` |
| `ERRORS.MAX_LENGTH_EXCEEDED` | `Max length exceeded` |
| `ACTIONS.SAVE_AND_CONTINUE` | `Save and continue` |
| `LABELS.FIRST_NAME` | `First name` |

---

## Interpolation Specification

| Pattern | Key value | Params | Output |
|---|---|---|---|
| Simple | `"Hello, {{NAME}}!"` | `{ NAME: 'Alice' }` | `"Hello, Alice!"` |
| Missing param | `"Count: {{COUNT}}"` | `{}` | `"Count: {{COUNT}}"` (preserved as-is) |
| Numeric | `"{{COUNT}} items"` | `{ COUNT: 5 }` | `"5 items"` |
| Nested key | `FORM.FIELD.LABEL` | — | Dot-path traversal into JSON tree |
| Missing key | `FORM.ADVERSE_EVENT` (not in JSON) | — | `"Adverse event"` (smart fallback) |

---

## Open Questions

---

## Feature Decisions Log

The following features were evaluated and explicitly decided upon:

| # | Feature | Decision | Phase / Notes |
|---|---|---|---|
| 1 | Static / compile-time translations | Out of scope — runtime JSON loading only | Document pattern for reference |
| 2 | RTL layout support | **Out of scope** — requires dedicated product roadmap effort; enormous testing surface | Separate effort |
| 3 | `<html lang>` sync | ✅ **IN SCOPE** — trivial single line, high a11y value | Phase 1 |
| 4 | Number / Currency / Date formatting | **Separate `Intl` pipe library** — not part of translation. Uses browser locale signal. | Companion utilities |
| 5 | Tenant / white-label overrides | **Separate spike** — different MFs own their own JSON, no single override mechanism | Future spike |
| 6 | HTML content in translations | **Separate spike** — security-sensitive (XSS). Requires sanitization strategy. | Future spike |
| 7 | Locale persistence | ✅ **IN SCOPE** — via `LOCALE_STORAGE` `InjectionToken` + provider pattern. Default: `localStorage`. Pluggable. | Phase 1 |
| 8 | Lazy / Eager loading per MF | ✅ **IN SCOPE** — MF owns its load strategy. **Must not render until translations are loaded** — `APP_INITIALIZER` enforces this. Lazy routes use route resolver. | Phase 1 |
| 9 | Type-safe key constants | ⏸ **Deferred** — plain string keys used for now (`'FORM.ADVERSE_EVENT'`). Type-safe constant pattern revisited in Phase 2. | Phase 2 (future) |
| 10 | Missing key extraction CLI | ⏸ **Deferred** — in-house team workflow is sufficient. `window.__vi18n.keys()` covers inspection needs. | Future spike |
| 11 | Testing utilities | ✅ **IN SCOPE** — mock provider + passthrough pipe | Phase 2 |
| 12 | Gender-aware / context translations | ⏸ **Parked** — note for future | Phase 3+ |
| 13 | Ordinal formatting (`1st`, `2nd`) | ⏸ **Parked** — note for future | Phase 3+ |

---

### Feature Detail: Locale Persistence (Decision 7)

Locale selection must survive page refresh. Implemented via a pluggable storage token:

```ts
// Built-in providers shipped with the library
export const LOCAL_STORAGE_LOCALE_PROVIDER: Provider = {
  provide: LOCALE_STORAGE,
  useValue: {
    get: () => localStorage.getItem('vi18n:locale'),
    set: (locale: string) => localStorage.setItem('vi18n:locale', locale),
  } satisfies LocaleStorage,
};

export const COOKIE_LOCALE_PROVIDER: Provider = { provide: LOCALE_STORAGE, useClass: CookieLocaleStorage };
export const NOOP_LOCALE_PROVIDER: Provider = { provide: LOCALE_STORAGE, useValue: { get: () => null, set: () => {} } };
```

Locale resolution order (first non-null wins):
1. Storage value (`localStorage.getItem('vi18n:locale')`)
2. `INITIAL_LOCALE` injection token (host-app override)
3. `navigator.language` (browser default)

---

### Feature Detail: Lazy vs Eager Loading per MF (Decision 8)

Each MF owns its translation loading strategy. The invariant is absolute:
**a component MUST NOT render before its translation namespace is loaded.**
Violating this causes a visible flicker (raw keys appear briefly before translations arrive).

#### Eager Strategy — MF bootstraps with translations (recommended default)

Translations are fetched as part of `APP_INITIALIZER`. Angular holds the entire bootstrap
sequence until all `APP_INITIALIZER` promises resolve. Zero flicker guaranteed.

```ts
// In the MF's app.config.ts or feature providers:
export const appConfig: ApplicationConfig = {
  providers: [
    // eager: true = loaded via APP_INITIALIZER before any component renders
    provideTranslations({
      namespace: 'form-builder',
      baseUrl:   '/assets/i18n/form-builder',  // resolved to /assets/i18n/form-builder/en.json
      eager:     true,
    }),
  ],
};

// Inside provideTranslations() — what happens under the hood:
export function provideTranslations(manifest: TranslationManifest & { eager?: boolean }): EnvironmentProviders {
  return makeEnvironmentProviders([
    manifest.eager
      ? {
          provide:    APP_INITIALIZER,
          useFactory: (ts: TranslationService) => () => {
            ts.registerNamespace(manifest);
            return ts.loadInitial();  // ← Promise. Angular blocks until this resolves.
          },
          deps:  [TranslationService],
          multi: true,
        }
      : [],  // lazy: registration only; loading deferred to route resolver
  ]);
}
```

#### Lazy Strategy — translations loaded when a route activates

For large MFEs with many feature areas, load only the translations needed for the
current route. The route will **not activate** until the resolver resolves.

```ts
// Step 1: Register namespace WITHOUT eager loading
export const adverseEventsConfig: ApplicationConfig = {
  providers: [
    provideTranslations({
      namespace: 'adverse-events',
      baseUrl:   '/assets/i18n/adverse-events',
      eager:     false,  // only registers; does NOT fetch
    }),
  ],
};

// Step 2: Create a resolver that fetches before the route renders
export const translationResolver: ResolveFn<void> = (route, state) => {
  const ts = inject(TranslationService);
  // get() waits for current load to settle, then resolves.
  // If already loaded (cached), resolves immediately.
  return from(ts.loadNamespace('adverse-events'));
};

// Step 3: Attach resolver to the route — Angular calls it before rendering any component
export const routes: Routes = [{
  path: 'adverse-events',
  resolve: { i18n: translationResolver },  // ← route blocked until resolver completes
  loadComponent: () => import('./adverse-events.component'),
}];
```

#### MF asset URL strategy

Each MF serves its own `assets/i18n/` from its own origin. In development:
```
Shell:   http://localhost:4200/assets/i18n/shell/en.json
Remote1: http://localhost:4201/assets/i18n/form-builder/en.json
```

In production the `baseUrl` must be absolute (see Q2 — still open):
```ts
// Remote1 environment.ts
export const environment = {
  production: true,
  i18nBaseUrl: 'https://remote1.vialiq.com/assets/i18n',
};

// Usage:
provideTranslations({
  namespace: 'form-builder',
  baseUrl:   `${environment.i18nBaseUrl}/form-builder`,
  eager:     true,
})
```

---

### Feature Detail: Key Model (Decision 9)

For now, plain string keys are used at the call site. Type-safe constants are deferred.

```ts
// TypeScript
const label = this.translateService.instant('FORM.ADVERSE_EVENT');
const msg   = this.translateService.instant('FORM.WELCOME', model);
```

```html
<!-- Template -->
{{ 'FORM.ADVERSE_EVENT' | translate }}
{{ 'ERRORS.MAX_LENGTH' | translate: { FIELD_NAME: 'Email', MAX: 100 } }}
{{ 'FORM.WELCOME' | translate: model }}
```

**Every locale file including English is required:**

```json
// en.json
{
  "FORM": {
    "ADVERSE_EVENT": "Adverse Event",
    "WELCOME": "Welcome, {{USER_NAME}}!"
  },
  "ERRORS": {
    "MAX_LENGTH": "{{FIELD_NAME}} must not exceed {{MAX}} characters"
  }
}

// fr.json
{
  "FORM": {
    "ADVERSE_EVENT": "Événement indésirable",
    "WELCOME": "Bienvenue, {{USER_NAME}} !"
  },
  "ERRORS": {
    "MAX_LENGTH": "{{FIELD_NAME}} ne doit pas dépasser {{MAX}} caractères"
  }
}
```

**Phase 2 (future):** Evaluate introducing a typed constant pattern to catch key typos at compile time.
No decision on approach yet — plain strings are sufficient for Phase 1.

---

## Deferred / Out of Scope

> [!NOTE]
> These features are explicitly parked. They are **not** forgotten — they are recorded here
> to prevent re-discussion and to provide context for future prioritization.

- **RTL layout support** — requires product roadmap allocation. Impacts every component, layout, icon direction, and requires extensive regression testing. Separate dedicated effort.
- **HTML content in translations** — security-sensitive. Requires a sanitization strategy (`DomSanitizer`, CSP). Separate spike.
- **Tenant / white-label translation overrides** — each MF owns its own JSON. No centralized override mechanism in this phase. Separate spike when white-labeling becomes a requirement.
- **Missing key extraction CLI** — in-house team workflow. `window.__vi18n.keys()` covers inspection. Revisit if an external TMS (Phrase, Lokalise) is adopted.
- **Gender-aware translations** — parked. Requires grammatical gender modeling in the engine.
- **Ordinal formatting** (`1st`, `2nd`, `3rd`) — parked. `Intl.PluralRules` ordinal mode, low priority.
- **Number / Currency / Date formatting** — addressed as a **separate companion `Intl` pipe utility**, not part of the translation library. Uses the active locale signal from `TranslationService.locale`.

---

## Open Questions

> [!NOTE]
> **Q1 — Locale source of truth**: ✅ **DECIDED**
> - `navigator.language` → normalized (e.g., `'en-US'` → `'en'`)
> - Persistence: `LOCALE_STORAGE` token, default `localStorage`
> - Resolution order: storage → `INITIAL_LOCALE` token → `navigator.language`

> [!IMPORTANT]
> **Q2 — Asset serving in MFE**: Each remote serves its own assets at its own origin
> (e.g., `http://localhost:4201/assets/i18n/form-builder/en.json`).
> The `baseUrl` in `TranslationManifest` must be an absolute URL in production.
>
> **Decision required**: Should remotes inject their origin at build time (environment variable)?
> Or should the shell act as a translation gateway/proxy?
>
> **Recommendation**: Absolute URLs per remote. Each remote knows its own deploy origin via `environment.remoteBaseUrl`.

> [!NOTE]
> **Q3 — Pluralization**: ICU message format?
> **Deferred** — Phase 3. Parked.

> [!NOTE]
> **Q4 — Fallback locale**: ✅ **DECIDED** — Fallback locale chain `[currentLocale, 'en']`.
> If a key is missing in `fr.json`, the engine looks it up in `en.json` before using the smart fallback.

> [!NOTE]
> **Q5 — Library boundary**: ✅ **DECIDED** — Start as `@vialiq/utilities/i18n` secondary entry point.

> [!NOTE]
> **Q6 — Type-safe key model**: ✅ **DECIDED** — Plain string keys for now (`'FORM.ADVERSE_EVENT'`).
> Type-safe constant pattern deferred to Phase 2 spike. `en.json` is required alongside all other locale files.

---

## Alternatives Considered

### ngx-translate
**Rejected.** RxJS-centric (`get()` returns `Observable`). Not signal-native. `TranslatePipe` with `pure: false` causes excess re-renders in zoneless apps. No cross-framework bridge story.

### Angular built-in `@angular/localize`
**Rejected.** Compile-time only. Cannot switch locale at runtime without a full page reload. No MFE/cross-framework path.

### i18next (as a dependency)
**Partially adopted in spirit.** Our JSON format is i18next-compatible. However, i18next itself is ~50KB, has its own plugin/backend system that does not integrate with Angular signals, and adds version-management burden in MFE shared config. We take the format, not the runtime.

---

## Implementation Phases

### Phase 1 — Core & Angular (MVP)
- `TranslationEngine` (pure TS, no deps) — key/value JSON, dot-path resolution
- `TranslationLoader` (fetch + `Promise.allSettled` + cache)
- `TranslationService` (Angular, signals + `rxResource`)
- `TranslatePipe` (signal-reactive, `pure: true`, reads `translations()` computed)
- `provideTranslations()` helper with `eager: boolean` option
- **`APP_INITIALIZER` blocks MF render until translations loaded** (eager strategy)
- **Route `ResolveFn` for lazy namespace loading** — route won't activate until resolved
- Locale initialization: `navigator.language` → normalized (`'en-US'` → `'en'`)
- `LOCALE_STORAGE` `InjectionToken` — pluggable persistence (default: `localStorage`)
- Built-in providers: `LOCAL_STORAGE_LOCALE_PROVIDER`, `COOKIE_LOCALE_PROVIDER`, `NOOP_LOCALE_PROVIDER`
- Locale resolution order: storage → `INITIAL_LOCALE` token → `navigator.language`
- `<html lang>` attribute sync on every locale change
- Nested key resolution (dot-path traversal into JSON tree)
- Interpolation (`{{PARAM}}`)
- Fallback locale chain (`[currentLocale, 'en']`)
- Smart missing-key fallback: `ADVERSE_EVENT` → `'Adverse event'`
- Dev-mode missing key reporter (`console.warn`)
- **`installDevConsole()` → `window.__vi18n`** (dev-only, tree-shaken in prod)

### Phase 2 — DX & Cross-Framework
- **Type-safe key constants** *(Phase 2 spike — approach TBD, plain strings used for now)*
- `translationStore` bridge (vanilla TS, no framework deps)
- Module Federation `shared` config documentation + examples
- `useTranslation` React hook pattern (documented)
- Lit / Web Component `onLocaleChange` pattern (documented)
- **Testing utilities**: `provideMockTranslations()` + passthrough pipe for unit tests
- `TranslateDirective` (attribute binding shorthand `[viTranslate]`)

### Phase 3 — Advanced (Future)
- ICU pluralization support
- `Intl` companion pipe library (number, currency, date — **separate** from translation)
- Gender-aware / context translations *(parked)*
- Ordinal formatting *(parked)*
- TMS integration / missing key extraction CLI *(if external translators are adopted)*

---

## Consequences

### Positive
- Zero `ngx-translate` dependency — no migration risk
- Signal-native Angular API — compatible with current zoneless architecture
- Single `TranslationEngine` instance shared via MF `singleton: true` — React/Lit/Angular all react to the same locale change
- Per-lib namespacing via `TranslationManifest` prevents key collisions across independently deployed MFEs
- `provideTranslations()` is a one-liner per lib — zero ceremony

### Negative / Risks
- **New maintenance surface**: Custom library. The team owns bugs and evolution.
- **MF singleton version pinning**: All remotes must ship the same version of `@vialiq/utilities`. A version mismatch with `singleton: true` causes a runtime console error. Strict version governance required.
- **Asset URL coordination**: Each MFE remote must expose its `assets/i18n/` publicly and know its own deploy origin — requires discipline in environment config.
