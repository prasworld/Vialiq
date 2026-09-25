# ADR-004: vi18n — Custom Translation Framework Deep Analysis

- **Status:** Accepted
- **Date:** 2026-09-20
- **Authors:** Platform Team
- **Related:** [ADR-003 — i18n Translation Library](./003-i18n-translation-library.md)

---

## Context

This document provides an exhaustive technical reference for `vi18n`, the bespoke translation framework built inside `libs/utilities`. It covers the complete architecture, every source file, all data flows, concurrency protections, error handling contracts, and a full feature comparison matrix against `@ngx-translate`, Transloco, Angular built-in i18n, and i18next.

This ADR supplements ADR-003 (which records the decision to build a custom library) with implementation-level detail intended for:
- New team members onboarding to the codebase
- Evaluating future enhancements or migration options
- Debugging and maintenance reference

---

## 1. Overview

`vi18n` is a **bespoke, zero-external-dependency translation framework** built inside `libs/utilities`. It was designed from the ground up to solve the specific problems of a **Micro-Frontend (MFE) shell + remotes architecture** running Angular + Module Federation, where standard solutions like `@ngx-translate` were too opinionated or caused cross-MFE state pollution.

---

## 2. Architecture — 3-Layer Design

```
┌────────────────────────────────────────────────┐
│                ANGULAR LAYER                   │  ← DI tokens, services, pipe, directive, resolver
│  TranslationService · HttpTranslationLoader    │
│  TranslatePipe · TranslateDirective            │
│  provideTranslations() · resolveTranslation()  │
└───────────────────┬────────────────────────────┘
                    │ uses singletons
┌───────────────────▼────────────────────────────┐
│                 CORE LAYER                     │  ← Framework-agnostic, pure TS
│  TranslationEngine (engine singleton)          │
│  TranslationLoader (loader singleton)          │
└───────────────────┬────────────────────────────┘
                    │ exposed to non-Angular
┌───────────────────▼────────────────────────────┐
│                BRIDGE LAYER                    │  ← React / Lit / Web Components
│  translationStore (vanilla JS façade)          │
│  installDevConsole() (window.__vi18n)          │
└────────────────────────────────────────────────┘
```

The **core** is pure TypeScript — no Angular, no RxJS. The **angular** layer wraps the core in DI-friendly services. The **bridge** layer exposes the same core singletons (`engine`, `loader`) to non-Angular frameworks via Module Federation's shared singleton scope.

---

## 3. File-by-File Breakdown

### 3.1 `core/translation-engine.ts` — The Brain

**Class:** `TranslationEngine` (exported as singleton `engine`)

| Responsibility | Implementation |
|---|---|
| Translation storage | `Map<locale, Map<namespace, Map<key, string>>>` — Isolated per locale |
| Manifest registry | `Map<namespace, TranslationManifest>` |
| JSON flattening | `FORM.ADVERSE_EVENT` ← `{ FORM: { ADVERSE_EVENT: ... } }` |
| Interpolation | `{{FIELD_NAME}}` via regex, supports deep dot paths `{{user.profile.name}}` |
| Missing key fallback | Smart sentence-case humanizer: `FORM.ADVERSE_EVENT` → `Adverse event` |
| Custom missing key handler | Pluggable via `missingKeyHandler?: (key, ns) => string` |
| Reactivity | `EventTarget` (`localeChange` event) — no framework dependency |
| Locale-aware isolation | Keys are isolated per locale; switching locale just swaps the active root map |

**Key design decision — Locale isolation:**
Translations are stored multi-dimensionally (`locale -> namespace -> key`). When switching locales, the active dictionary swaps instantly, and previously loaded locales remain in memory. This prevents stale English keys from bleeding through into French views, and prevents re-fetching when switching back to a cached locale.

**Key design decision — Missing key humanizer:**
Instead of showing raw keys (`FORM.ADVERSE_EVENT`), the fallback produces a human-readable string (`Adverse event`). This is a UX-first decision: the app remains usable without being jarring. The custom `missingKeyHandler` allows sending these to Sentry or similar in production.

---

### 3.2 `core/translation-loader.ts` — The Fetcher

**Class:** `TranslationLoader` (exported as singleton `loader`)

```
load(namespace, locale, url, abortSignal?)
  └─ fetchAndRegister(namespace, locale, url, abortSignal?)
       ├─ Optimistic cache add (`namespace:locale`)
       ├─ fetch(url, { signal: abortSignal })   ← native fetch + AbortSignal
       ├─ if res.ok → engine.register(ns, locale, json)
       └─ on error → cache.delete() + console.warn + THROW ← explicit propagation

loadAll(manifests[], locale, abortSignal?)
  └─ Promise.all(manifests.map(m => load(...)))  ← parallel, fail-fast
```

**Cache key:** `${namespace}:${locale}` — prevents duplicate fetches for the same language.

**Critical design decisions:**
- **Optimistic caching** before fetch completes prevents concurrent duplicate requests (a classic thundering herd problem).
- **`replace: true` on `register`** ensures locale switching clears old keys.
- **`Promise.all` (not `allSettled`)** means any one namespace failure fails the whole batch — callers get a clear rejection.
- **AbortSignal propagated to `fetch()`** — when `rxResource` fires a new locale request, the old in-flight fetch is cancelled at the network level.
- **Error re-thrown** — no silent swallowing; callers (APP_INITIALIZER, route resolvers) get rejected promises.

---

### 3.3 `angular/translation.service.ts` — Angular's Central Hub

**Class:** `TranslationService` (`providedIn: 'root'`)

**Constructor DI:**
```typescript
storage           = inject(LOCALE_STORAGE, { optional: true })    // persisted preference
customLoader      = inject(TRANSLATION_LOADER, { optional: true }) // swappable loader
missingKeyHandler = inject(MISSING_KEY_HANDLER, { optional: true }) // custom fallback
```

**Locale resolution waterfall (first non-null wins):**
1. `LOCALE_STORAGE.get()` — persisted user preference (localStorage/cookie)
2. `INITIAL_LOCALE` token — host-app/SSR override
3. `navigator.language.split('-')[0]` — browser default

**Reactive loading via `rxResource`:**
```typescript
private readonly _resource = rxResource({
  params: () => ({ locale: _requestedLocale(), manifests: _manifests() }),
  stream: ({ params, abortSignal }) =>
    from(activeLoader.loadAll(params.manifests, params.locale, abortSignal))
      .pipe(tap(() => { engine.setLocale(); document.lang = ... }))
});
```

`rxResource` is Angular's experimental reactive resource primitive. When `_requestedLocale()` signal changes, it:
1. Creates a new `AbortController` internally
2. Calls the previous request's abort signal (cancels in-flight HTTP)
3. Triggers a new stream with the new params

**Public signals:**
| Signal | Description |
|---|---|
| `translations` | `computed(() => resource.value())` — only updates when load completes |
| `locale` | Only updates on successful load, never flickers mid-flight |
| `isLoading` | `computed(() => resource.status() === 'loading')` |

**Key methods:**
| Method | Purpose |
|---|---|
| `instant(key, params?, ns?)` | Synchronous, delegates to engine |
| `get(key, params?, ns?)` | Async, waits for in-flight load if needed |
| `setLocale(locale)` | Triggers rxResource refetch + persists |
| `registerNamespace(manifest)` | Adds to manifests signal → triggers rxResource |
| `loadInitial()` | Called by APP_INITIALIZER eagerly |
| `loadNamespace(ns)` | Called by route resolvers lazily |

---

### 3.4 `angular/http-loader.ts` — Angular's HttpClient Adapter

**Class:** `HttpTranslationLoader` implements `ViTranslationLoader` (`providedIn: 'root'`)

Uses Angular's `HttpClient` instead of raw `fetch`. Converts `AbortSignal` into RxJS:
```typescript
request$ = this.http.get<Record<string, unknown>>(url)
if (abortSignal) {
  request$ = request$.pipe(takeUntil(fromEvent(abortSignal, 'abort')))
}
const json = await firstValueFrom(request$);
```

`fromEvent(abortSignal, 'abort')` emits when the signal fires, which causes `takeUntil` to complete the HTTP observable — cleanly cancelling the Angular HTTP request mid-flight.

> **Note:** The current `TranslationService` uses `loader` (the core `TranslationLoader`) by default, not `HttpTranslationLoader`. The HTTP loader is available via the `TRANSLATION_LOADER` token for teams that need Angular's HTTP interceptor pipeline (auth headers, retry logic, etc.).

---

### 3.5 `angular/provide-translations.ts` — DI Entry Point

```typescript
provideTranslations({ namespace, baseUrl, eager? })
```

Two providers registered:
1. **`ENVIRONMENT_INITIALIZER`** — Calls `registerNamespace()` when the Angular environment initializes (fires before `APP_INITIALIZER`).
2. **`APP_INITIALIZER`** (optional, default `eager: true`) — Calls `loadInitial()` which blocks Angular bootstrap until translations are loaded. Set `eager: false` for lazy-loaded remotes that don't need translations at boot.

---

### 3.6 `angular/locale-storage.ts` — Persistence Strategies

Three built-in `LOCALE_STORAGE` providers:

| Provider | Storage | Notes |
|---|---|---|
| `LOCAL_STORAGE_LOCALE_PROVIDER` | `localStorage` | Default, client-only |
| `NOOP_LOCALE_PROVIDER` | Nothing | Test environments or SSR stubs |
| `COOKIE_LOCALE_PROVIDER` | `document.cookie` | SSR-compatible, survives page reload |

---

### 3.7 `angular/tokens.ts` — Extension Points

| Token | Type | Purpose |
|---|---|---|
| `MFE_NAMESPACE` | `string` | Scopes pipe/directive key lookups to one MFE's namespace, preventing cross-MFE bleed |
| `TRANSLATION_LOADER` | `ViTranslationLoader` | Swap the HTTP loader for custom (e.g., bundled translations, CDN with auth) |
| `MISSING_KEY_HANDLER` | `ViMissingKeyHandler` | Production error logging (e.g., Sentry events for missing keys) |

---

### 3.8 `angular/translate.pipe.ts` — Signal-Reactive Pipe

```typescript
@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  transform(key, params?, namespace?) {
    this.ts.translations(); // ← establishes signal dependency
    return this.ts.instant(key, params, namespace ?? mfeNamespace ?? undefined);
  }
}
```

`pure: false` + signal dependency is the key pattern: Because the pipe is impure, Angular executes its `transform` method on every change detection cycle. This allows the `this.ts.translations()` signal read to register as a dependency for the component, ensuring the view re-renders when the `_version` signal bumps (e.g. after a locale switch). No `async` pipe or Observable subscriptions needed.

---

### 3.9 `angular/translate.directive.ts` — DOM-Level Translation

```typescript
@Directive({ selector: '[viTranslate]' })
export class TranslateDirective {
  constructor() {
    effect(() => {
      this.ts.translations(); // signal dependency
      el.nativeElement.textContent = ts.instant(key(), params());
    });
  }
}
```

`effect()` re-runs whenever `translations()` or `key()` changes. Writes directly to `textContent`, bypassing Angular's change detection loop for performance.

---

### 3.10 `angular/translation.resolver.ts` — Zero-Flicker Lazy Loading

```typescript
export const resolveTranslation = (namespace: string): ResolveFn<boolean> => () => {
  return inject(TranslationService).loadNamespace(namespace).then(() => true);
};
```

Usage in routing:
```typescript
{ path: 'patient', loadComponent: ..., resolve: { t: resolveTranslation('patient') } }
```

Navigation is blocked until `loadNamespace` resolves. Because `loadAll` has an in-memory cache, switching back to an already-loaded locale is instant.

---

### 3.11 `bridge/translation-store.ts` — Cross-Framework Façade

A plain-object facade over the singleton `engine` + `loader`. Designed to be shared across Module Federation boundaries:

```typescript
const translationStore = {
  instant(key, params?, ns?)         // synchronous
  setLocale(locale): Promise<void>   // fetch + notify
  onLocaleChange(cb): () => void     // subscribe (returns cleanup)
  getLocale(): string
  loadNamespace(manifest): Promise<void>
}
```

This is how React/Lit/Web Components running in remotes access translations without pulling in Angular. The singleton `engine` is shared via webpack's `shared` scope in Module Federation config.

---

### 3.12 `bridge/dev-console.ts` — Developer Experience

In development, installs `window.__vi18n` with:
```javascript
window.__vi18n.setLocale('fr')      // hot-switch locale
window.__vi18n.getLocale()           // current locale
window.__vi18n.namespaces()          // registered namespaces
window.__vi18n.keys('form')          // dump all translations for a namespace
window.__vi18n.t('FORM.SUBMIT')     // test a key
window.__vi18n.reload()              // clear cache + refetch
```

Tree-shaken in production (`!isDevMode()` guard + `typeof window === 'undefined'` SSR guard).

---

### 3.13 `testing.ts` — Test Utilities

Two exports:
- **`MockTranslatePipe`** — echoes the key, no service needed
- **`provideMockTranslations()`** — replaces `TranslationService` with a stub that echoes keys and resolves promises immediately

---

## 4. Data Flow — End to End

### 4.1 Bootstrap (eager)

```
App Bootstrap
  → ENVIRONMENT_INITIALIZER fires
      → service.registerNamespace({ namespace: 'app', baseUrl: '/assets' })
          → engine.registerManifest(manifest)
          → _manifests signal updates
  → APP_INITIALIZER fires
      → service.loadInitial()
          → activeLoader.loadAll([{app, /assets}], 'en')
              → fetch('/assets/en.json', { signal })
              → engine.register('app', json, replace: true)
          → engine.setLocale('en')
          → document.documentElement.lang = 'en'
  → Angular renders
      → TranslatePipe.transform('FORM.SUBMIT')
          → translations() signal read (dependency)
          → engine.instant('FORM.SUBMIT', ..., 'app')
          → returns 'Submit'
```

### 4.2 Locale Switch

```
user clicks "Français"
  → service.setLocale('fr')
      → storage.set('fr')              // persisted to localStorage
      → _requestedLocale.set('fr')     // signal update
          → rxResource reacts
              → AbortController for previous request fires (cancels EN fetch if in-flight)
              → new stream: activeLoader.loadAll(manifests, 'fr', newAbortSignal)
                  → fetch('/assets/fr.json', { signal: newAbortSignal })
                  → engine.register('app', frJson, replace: true)  ← EN keys cleared
              → tap: engine.setLocale('fr'), document.lang = 'fr'
              → _resource.value() updates
          → translations() computed updates
      → TranslatePipe sees dependency change → re-renders
      → TranslateDirective effect fires → re-renders
```

### 4.3 Lazy Route Navigation

```
Router navigates to /patient
  → resolveTranslation('patient') resolver fires
      → service.loadNamespace('patient')
          → manifest lookup in _manifests
          → activeLoader.loadAll([patient manifest], 'fr')
              → fetch('/patient-assets/fr.json')
              → engine.register('patient', json, replace: true)
  → resolver resolves true → navigation completes
  → patient component renders with translations already in engine
```

---

## 5. Concurrency & Race Condition Protection

| Scenario | Protection |
|---|---|
| Rapid locale switching | `rxResource` AbortController cancels previous in-flight fetch |
| Angular HttpClient abort | `takeUntil(fromEvent(abortSignal, 'abort'))` |
| Concurrent namespace fetches | `Promise.all` — parallel but fail-fast |
| Duplicate fetches for same locale | In-memory cache `Set<'namespace:locale'>` |
| Optimistic cache + failure | `cache.delete(key)` on error so retries work |
| EN fallback registration | Loads `en` concurrently for non-English locales and keeps it in the locale-isolated registry |

---

## 6. Error Handling Contract

| Failure Point | Behavior |
|---|---|
| HTTP 4xx/5xx | Cache cleared, `Error` thrown, `console.warn` in dev |
| JSON parse error | Cache cleared, `SyntaxError` thrown |
| `loadInitial()` failure | Rejected promise propagates to `APP_INITIALIZER` → Angular halts bootstrap |
| Lazy `loadNamespace()` failure | Rejected promise propagates to route resolver → navigation cancels |
| Missing translation key | Humanized fallback (or custom `MISSING_KEY_HANDLER`) |

---

## 7. Comparison Matrix: vi18n vs. Alternatives

| Feature | **vi18n (custom)** | **@ngx-translate** | **Transloco** | **Angular i18n (built-in)** | **i18next** |
|---|---|---|---|---|---|
| **Angular Signals support** | ✅ Native (`rxResource`, `computed`, `signal`) | ❌ Observable-only, no signals | ⚠️ RxJS, signals adapter planned | ❌ Compile-time only | ❌ No Angular signals |
| **MFE / Module Federation** | ✅ First-class (singleton engine, bridge layer) | ❌ Not designed for MFE (service duplication) | ⚠️ Manual scoping needed | ❌ Cannot share state across remotes | ⚠️ Works but no Angular integration |
| **Lazy namespace loading** | ✅ Per-namespace, route-resolver aware | ⚠️ Manual loader per module | ✅ Built-in scope-per-lazy-module | ❌ Build-time only | ✅ Dynamic import |
| **Zero-flicker translations** | ✅ Route resolver blocks navigation | ⚠️ Manual async guard needed | ✅ `translationLoaded$` guard | ✅ Compile-time (no async needed) | ⚠️ Manual implementation |
| **Race condition safety** | ✅ AbortSignal + rxResource | ❌ No built-in cancellation | ⚠️ Partial (RxJS switchMap) | N/A | ⚠️ Partial |
| **SSR support** | ✅ Cookie storage provider, SSR guards | ⚠️ Works with workarounds | ✅ Built-in SSR support | ✅ First-class | ✅ Server-side ready |
| **Non-Angular frameworks** | ✅ Bridge layer (`translationStore`) | ❌ Angular-only | ❌ Angular-only | ❌ Angular-only | ✅ Framework agnostic |
| **Swappable loader** | ✅ `TRANSLATION_LOADER` token | ✅ `TranslateLoader` token | ✅ `TRANSLOCO_LOADER` | ❌ Not applicable | ✅ Backend plugins |
| **Swappable missing key handler** | ✅ `MISSING_KEY_HANDLER` token | ✅ `MissingTranslationHandler` | ✅ Custom handler | ❌ Not applicable | ✅ `missingKeyHandler` |
| **Smart missing key fallback** | ✅ Humanizer (`FORM.SUBMIT` → `Submit`) | ❌ Returns key as-is | ❌ Returns key as-is | N/A | ❌ Returns key as-is |
| **Locale persistence** | ✅ localStorage / cookie / noop (swappable) | ❌ Manual | ⚠️ Manual | ❌ Manual | ⚠️ Plugin-based |
| **Dev console** | ✅ `window.__vi18n` (tree-shaken) | ❌ None | ❌ None | ❌ None | ⚠️ External devtools |
| **Interpolation** | ✅ `{{key}}`, deep dot paths | ✅ `{{key}}` | ✅ `{{key}}`, ICU | ✅ ICU full | ✅ `{{key}}`, ICU |
| **Pluralization** | ❌ Not supported (out of scope) | ✅ Built-in | ✅ ICU format | ✅ ICU format | ✅ ICU format |
| **Pipe** | ✅ `translate` (pure, signal-aware) | ✅ `translate` (impure) | ✅ `transloco` (pure + async) | ✅ `i18nPlural`, `i18nSelect` | ❌ No pipe |
| **Directive** | ✅ `[viTranslate]` | ✅ `[translate]` | ✅ `[transloco]` | ❌ Not available | ❌ Not available |
| **Namespace isolation (MFE)** | ✅ `MFE_NAMESPACE` token scopes lookups | ❌ Global key space | ⚠️ Scope per component, not token-based | ❌ Not applicable | ✅ Namespaces (manual) |
| **Tree-shaking** | ✅ `isDevMode()` guards dev code | ⚠️ Partial | ✅ Good | ✅ Compile-time (no runtime lib) | ⚠️ Modular but heavy |
| **Bundle size (approx)** | ~8KB (raw, no external deps) | ~35KB | ~25KB | 0KB (compile-time) | ~50KB |
| **Testing utilities** | ✅ `MockTranslatePipe`, `provideMockTranslations()` | ✅ Stubs available | ✅ Built-in testing module | ✅ Compile-time (no setup) | ⚠️ Manual mocks |
| **External dependency count** | **0** | 1 (rxjs) | 1 (rxjs) | 0 | ~5 |
| **APP_INITIALIZER integration** | ✅ Automatic via `provideTranslations()` | ⚠️ Manual | ✅ Automatic | N/A | ❌ Manual |
| **AbortSignal / cancellation** | ✅ Built-in via rxResource | ❌ None | ⚠️ RxJS only | N/A | ⚠️ Manual |
| **Locale waterfall resolution** | ✅ storage → token → navigator | ⚠️ Manual | ⚠️ Manual | ✅ Angular platform locale | ⚠️ Detection plugins |

---

## 8. What vi18n Intentionally Omits (Out of Scope)

| Feature | Decision |
|---|---|
| **Pluralization** | Out of scope. Use humanizer or a custom `MISSING_KEY_HANDLER` |
| **ICU message format** | Out of scope. Use Angular built-in i18n for ICU-heavy cases |
| **RTL / Bidi** | Not handled (layout concern, not translation concern) |
| **Date/Number formatting** | Not handled (use Angular's `DatePipe`, `DecimalPipe`) |
| **Translation management UI** | Not in scope — use Phrase, Locize, or Crowdin externally |
| **Fallback locale chain** | Removed (was causing race conditions). Smart humanizer replaces it |

---

## 9. Public API Surface (`src/index.ts`)

```typescript
// Core (framework-agnostic)
TranslationEngine, engine
TranslationLoader, loader, TranslationManifest

// Angular DI
provideTranslations()
TranslationService
TranslatePipe
TranslateDirective
resolveTranslation()
HttpTranslationLoader
TRANSLATION_LOADER, MISSING_KEY_HANDLER, MFE_NAMESPACE
LOCALE_STORAGE, INITIAL_LOCALE
LOCAL_STORAGE_LOCALE_PROVIDER, COOKIE_LOCALE_PROVIDER, NOOP_LOCALE_PROVIDER

// Bridge (non-Angular / MFE)
translationStore
installDevConsole()

// Testing
MockTranslatePipe
provideMockTranslations()
```

---

## 10. Known Gaps / Future Considerations

| Gap | Impact | Possible Fix |
|---|---|---|
| `HttpTranslationLoader` is not the default | Misses Angular HTTP interceptors (auth, retry) | Make it the default when `HttpClient` is in scope |
| No retry mechanism | Transient network errors are permanent | Add exponential backoff in loader |
| No built-in pluralization | EN-centric content limitations | Integrate `Intl.PluralRules` for common cases |
| Singleton engine shared globally | Hard to reset in tests | Add `engine.reset()` public method |
