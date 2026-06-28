# Form Builder — Renderer (`FormRendererComponent`) Specification

> **Status:** In Design — architecture decisions active  
> **Date:** 2026-05-29  
> **Implementation:** v2 — Angular 21 standalone component (`@vi/form-renderer`)  
> Related docs: [overview](./form-builder-overview.md) · [schema](./form-builder-schema.md) · [validation](./form-builder-validation.md) · [custom-validators](./form-builder-custom-validators.md) · [architecture](./form-builder-architecture.md)

---

## 1. Purpose & Scope

`FormRendererComponent` is an **Angular 21 standalone component** that takes a `FormSchema` and renders a fully interactive, accessible, submit-ready HTML form. It is **not** the builder — it has no drag-and-drop or properties panel. It is the runtime consumer of what the builder produces.

**Ships in:** `@vi/form-renderer` — a separate Angular library at `libs/form-renderer/`. The renderer imports shared schema types from `@vi/form-builder`; the builder imports `FormRendererComponent` for its Preview mode.

> **Architecture decision (2026-05-21):** The renderer was originally planned as a Lit 3 web component for framework-agnostic distribution. This was revised to Angular for the following reasons:
> - **Runtime DI injection** — custom validators, server calls, and data services need Angular's `InjectionToken` system; there is no equivalent in Lit without a global singleton registry.
> - **Cross-field reactive state** — Signal-based state (`computed()`, `effect()`) for field values, validation errors, conditional visibility, and submission status is native to Angular; replicating this in Lit means building an ad-hoc reactive runtime.
> - **Server-side validation propagation** — after `onSubmit` rejects with `ServerValidationError[]`, errors must propagate to individual field components; Angular's shared Signal + DI makes this trivial; Shadow DOM isolation makes it painful.
> - **Angular CDK** — `LiveAnnouncer`, `FocusTrap`, `ScrollingModule` are available for free; no workarounds needed.
> - **Testability** — `@testing-library/angular` + Vitest; no Shadow DOM piercing in queries.
> - **Shadow DOM** — `ViewEncapsulation.Emulated` (default) means no shadow boundary; global styles, design tokens, and CSS cascade all work without `::part()` or custom property tunnelling.
>
> Cross-framework use (React/Vue) is deferred to v2 via Angular Elements. See §2.3.

**Goals:**
- Accept a `FormSchema` and render a complete, accessible, submit-ready HTML form.
- Accept external data (pre-population, edit flows) via the `FORM_DATA_SERVICE` InjectionToken.
- Evaluate conditional visibility (`conditional` rules) reactively using Angular Signals.
- Run the validation rule engine (`validate(rules, value, formData)`) per `validateOn` setting.
- Support server-side validation: `onSubmit()` rejects with `ServerValidationError[]` → errors propagate to individual field components via a shared Signal.
- Allow runtime-injectable custom validators via `CUSTOM_VALIDATOR_REGISTRY` InjectionToken.
- Emit structured submission data with full nested/repeater object shape.

**Non-goals (v1 renderer scope):**
- No drag-and-drop.
- No schema editing.
- No wizard multi-step mode (v3+, but schema accommodates it via `display: 'wizard'`).
- No server-side rendering (SSR) in v1 — evaluate in v3.
- No Angular Elements wrapper for cross-framework use in v1 — planned for v2.

---

## 2. Architecture: InjectionToken-Based Data Service

Since form data can be large (hundreds of fields, complex nested repeaters), it must **not** be passed as an HTML attribute. The Angular integration uses a `FORM_DATA_SERVICE` InjectionToken that the host application provides.

### 2.1 The `FormDataService` Interface

```typescript
// libs/web-components/src/form/form-data.service.interface.ts
// (Also exported from @vi/form-builder for Angular consumers)

export interface FormDataService {
  /**
   * Returns the initial data to pre-populate the form.
   * Called once when the renderer initialises.
   * Use for: edit flows, saved drafts, prefilled forms.
   */
  getInitialData(): Promise<FormData> | FormData;

  /**
   * Called on every field change with the current form state.
   * Use for: auto-save, conditional option loading, field dependencies.
   */
  onFieldChange?(fieldKey: string, value: unknown, formData: FormData): void;

  /**
   * Called when the form is submitted and validation passes.
   * Returns a promise; the renderer displays a loading state while pending.
   * Resolve: success. Reject with `ServerValidationError[]`: field errors.
   */
  onSubmit(data: FormData, schema: FormSchema): Promise<void>;

  /**
   * Optional: called when the form is reset.
   */
  onReset?(): void;
}

/** A flat keyed map of field values. Nested keys use dot notation for display only. */
export type FormData = Record<string, unknown>;

/** Server-returned field-level errors after submission failure. */
export interface ServerValidationError {
  /** Matches ComponentSchema.key */
  field: string;
  message: string;
}
```

### 2.2 Angular Integration

The Angular host provides `FormDataService` via DI. Since `FormRendererComponent` is itself an Angular component, this is standard Angular DI — no bridge, adapter, or custom element property is needed:

```typescript
// In the Angular host app:
@Injectable({ providedIn: 'root' })
export class ContactFormDataService implements FormDataService {
  private readonly _contactService = inject(ContactService);

  async getInitialData(): Promise<FormData> {
    const contact = await this._contactService.getContact(this.contactId);
    return {
      firstName: contact.firstName,
      email: contact.email,
      // ... flatten the contact record into key-value pairs
    };
  }

  async onSubmit(data: FormData): Promise<void> {
    await this._contactService.updateContact(data);
  }
}

// Provide it via the token:
providers: [
  { provide: FORM_DATA_SERVICE, useClass: ContactFormDataService }
]
```

### 2.3 Cross-Framework Use (v2 Deferred)

`FormRendererComponent` is Angular-only in v1. Non-Angular applications cannot use it directly.

**v2 plan — Angular Elements:** The renderer will be wrapped with `@angular/elements` and published as a second entry point (`@vi/form-renderer/elements`). This produces a `<vi-form>` custom element that ships the Angular runtime and can be used anywhere:

```html
<!-- v2 plan — not in v1 scope -->
<vi-form id="contact-form"></vi-form>
<script>
  const el = document.getElementById('contact-form');
  el.schema = myFormSchema;
  el.dataService = { getInitialData: () => {...}, onSubmit: async (data) => {...} };
</script>
```

For v1: **use `FormRendererComponent` directly inside an Angular application.**

### 2.4 `FORM_DATA_SERVICE` InjectionToken

```typescript
export const FORM_DATA_SERVICE = new InjectionToken<FormDataService>(
  'FORM_DATA_SERVICE',
  { providedIn: null }  // host must provide explicitly
);
```

### 2.5 `FORM_CATALOG_SERVICE` InjectionToken _(v2+ — required for sub-form)_

> **Status:** Deferred to v2+ along with the sub-form component type. Not needed in v1.

```typescript
// libs/form-renderer/src/lib/tokens/form-catalog.service.interface.ts

export interface FormCatalogService {
  /**
   * Fetch a saved FormSchema by its stable ID.
   * Called by vi-renderer-subform and by the builder's preview canvas.
   * Must resolve quickly — consider caching.
   */
  getSchema(subFormId: string): Promise<FormSchema>;

  /**
   * Search the form catalog — used by the builder's sub-form picker dialog.
   * Returns lightweight summaries (not full schemas) for the pick list.
   * Optional: only required if the builder is used (not the renderer alone).
   */
  searchForms?(query: string): Promise<Array<{
    id: string;
    title: string;
    description?: string;
    fieldCount?: number;
  }>>;
}

export const FORM_CATALOG_SERVICE = new InjectionToken<FormCatalogService>(
  'FORM_CATALOG_SERVICE',
  { providedIn: null }  // host provides when sub-forms are used
);
```

Provide it alongside `FORM_DATA_SERVICE` when the form uses sub-forms:

```typescript
providers: [
  { provide: FORM_DATA_SERVICE,    useClass: MyFormDataService    },
  { provide: FORM_CATALOG_SERVICE, useClass: MyFormCatalogService },
]
```

---

### 2.6 `CODELIST_SERVICE` InjectionToken

> **⛔ Before implementing:** Multilingual and platform-wide versioning designs must be finalised first. See architecture.md §10.7.

Powers all five option controls (`vi-select`, `vi-dropdown`, `vi-combobox`, `vi-radio-group`, `vi-checkbox-group`) when their `optionSource.kind === 'codelist'`.

**Authentication:** zero config — `DefaultCodelistService` uses Angular `HttpClient`; the host app's `HttpInterceptor` chain (Bearer token, OIDC, CSRF, session cookie) applies automatically. The form schema never stores tokens.

**Fetch strategy:** all codelists needed by the form are fetched in **parallel individual GETs** when `FormRendererComponent` initialises — one request per codelist name. A single failure does not block others; the affected control renders with an empty options list + inline error state and can be retried independently.

```typescript
// libs/form-renderer/src/lib/tokens/codelist.ts

import type { Observable } from 'rxjs';
import type { CodelistItem, CodelistOptionSource } from '@vi/form-builder';

export interface CodelistConfig {
  /**
   * Base URL for the codelist API.
   * Individual fetch: GET {endpoint}/{name}
   * e.g. endpoint: '/api/codelist'  →  GET /api/codelist/SEX
   */
  endpoint: string;
}
export const CODELIST_CONFIG =
  new InjectionToken<CodelistConfig>('CODELIST_CONFIG');

export interface CodelistService {
  /**
   * Fetch all named codelists in parallel.
   * Called once by FormRendererComponent on init — before any field renders.
   * Returns a map of name → items.
   * Each fetch is independent: failures are isolated and do not reject the whole map.
   */
  prefetchAll(names: string[]): Observable<Map<string, CodelistItem[]>>;

  /**
   * Read from the in-memory store (populated by prefetchAll).
   * Returns undefined if the codelist was not prefetched or failed.
   * Renderer wrappers call this synchronously during rendering.
   */
  getItems(name: string): CodelistItem[] | undefined;
}
export const CODELIST_SERVICE =
  new InjectionToken<CodelistService>('CODELIST_SERVICE', { providedIn: null });
```

**Providing the service** — configure once at app bootstrap:

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])), // auth handled here
    { provide: CODELIST_CONFIG,  useValue: { endpoint: '/api/codelist' } },
    { provide: CODELIST_SERVICE, useClass: DefaultCodelistService },
  ]
};
```

**`DefaultCodelistService`** (shipped by `@vi/form-renderer`):
- Reads `CODELIST_CONFIG.endpoint` to build request URLs: `GET {endpoint}/{name}`
- Uses Angular `HttpClient` — host interceptors add auth headers automatically
- Stores results in an in-memory `Map<string, CodelistItem[]>` for the form session
- Returns the `CodelistItem[]` directly (API response IS the array — no JSONPath extraction needed)
- Failed individual fetches are caught, logged as warnings, and stored as empty arrays

> **GraphQL note:** Parallel REST GETs are the v1 approach. Evaluating a GraphQL transport (single typed query for multiple codelists in one round-trip) is a worthwhile v2+ option.

---

## 3. Form Data Model

### 3.1 Submission Data Shape

Submitted data is a **nested object** matching the form's field keys. Layout containers (Panel, Columns, Tabs, Fieldset) are transparent — they do not add nesting to the data object. Only `Repeater` creates array nesting.

```typescript
// FormSchema with:
//   firstName (text-input)
//   email     (email)
//   contacts  (repeater)
//     └─ name   (text-input)
//     └─ phone  (tel)

// Submission payload:
{
  firstName: 'Jane',
  email: 'jane@example.com',
  contacts: [
    { name: 'Bob', phone: '555-1234' },
    { name: 'Alice', phone: '555-5678' }
  ]
}
```

### 3.2 Repeater Row Keys

- Repeater `key` = the array key in the submission object.
- Each row's child fields use their own `key` within the row object.
- Row objects are plain objects: `{ fieldKey: value, ... }`.
- There is no row index in the submission payload — it's a simple array.

### 3.3 Hidden Fields

`ComponentSchema.hidden = true` hides the component from the rendered UI but its `key` and `defaultValue` **are still included** in the submission payload. This allows server-side data to be passed through without display.

`readOnly = true` fields also submit their value (they are not interactive but the value is preserved).

### 3.4 Layout Containers in Submission

Panels, Columns, Tabs, and Fieldsets are **transparent** — they contribute no keys to the submission object. Only their children contribute keys.

```typescript
// Panel with key: 'personalInfo', containing firstName + lastName
// Submission: { firstName: 'Jane', lastName: 'Doe' }  ← no 'personalInfo' key
```

---

## 4. Form Submission State Machine

The renderer manages a submission lifecycle state machine:

```
        ┌─────────┐
        │  IDLE   │ ←──────────────────────────────────────┐
        └────┬────┘                                        │
             │ user clicks Submit                          │
             ▼                                             │
        ┌─────────────┐   validation fails                 │
        │  VALIDATING  │ ──────────────────────────┐       │
        └──────┬───────┘                           │       │
               │ all fields valid                  ▼       │
               ▼                             ┌──────────┐  │
        ┌─────────────┐    onSubmit rejects  │  ERROR   │  │
        │  SUBMITTING  │ ──────────────────► │ (server) │  │
        └──────┬───────┘                     └──────────┘  │
               │ onSubmit resolves                         │
               ▼                                           │
        ┌─────────────┐                                    │
        │   SUCCESS   │ ──── (timeout/redirect) ───────────┘
        └─────────────┘
```

### 4.1 State Definitions

```typescript
export type FormSubmissionState =
  | { status: 'idle' }
  | { status: 'validating' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; serverErrors: ServerValidationError[] };
```

### 4.2 Renderer Behavior Per State

| State | Submit button | Fields | Display |
|---|---|---|---|
| `idle` | Enabled | Interactive | Normal |
| `validating` | Disabled + spinner | Interactive | Inline errors shown |
| `submitting` | Disabled + spinner | Disabled | Loading overlay |
| `success` | Hidden | Disabled | `successMessage` shown |
| `error` | Re-enabled | Interactive | Server errors shown inline |

### 4.3 Server Error Injection

After `onSubmit` rejects with `ServerValidationError[]`, the renderer:
1. Transitions to `error` state.
2. Maps each `ServerValidationError.field` to a `ComponentSchema.key`.
3. Sets the matching `<vi-input>`/`<vi-select>` element's validity to invalid with the server message.
4. Shows an error summary at the top of the form listing all server errors.
5. Focuses the first errored field.

---

## 5. Validation — Runtime Behaviour

### 5.1 `validateOn` Behaviour

`validateOn` is a **form-level setting** only. There is no per-field override (TD-07, decided 2026-05-25). The value comes from `FormSchema.settings.validateOn`, defaulting to `'onBlur'` when absent.

```
FormSchema.settings.validateOn → 'onBlur' (built-in default)
```

| Mode | When validation runs |
|---|---|
| `onBlur` | When the field loses focus (default) |
| `onChange` | On every keystroke / selection change |
| `onSubmit` | Only when the form submit button is pressed |

> **Migration note:** Previous values `'blur'`, `'change'`, `'submit'` were renamed to `'onBlur'`, `'onChange'`, `'onSubmit'` per TD-07 to align with Angular event naming conventions.

### 5.2 Full-Form Validation on Submit

Regardless of `validateOn`, when the user clicks Submit:
1. All fields are validated synchronously.
2. If any fail: transition to `validating` state — errors display, focus first error, submit is cancelled.
3. If all pass: transition to `submitting` — `onSubmit(data)` is called.

### 5.3 Re-validation After Server Error

In `error` state, fields that have server errors are switched to `onChange` validation — so the user sees the error clear immediately when they fix the value.

---

## 6. Conditional Visibility

### 6.1 Evaluation

The renderer evaluates `ConditionalRule` using the same pure `evaluateConditional(rule, formData)` function exported from `@vi/form-builder`.

```typescript
// Pseudo-code within the renderer:
for (const component of flattenComponents(schema.components)) {
  const visible = component.conditional
    ? evaluateConditional(component.conditional, currentFormData)
    : true;
  setVisible(component.id, visible);
}
```

### 6.2 Hidden ≠ Absent from Submission

When a component is hidden by a conditional rule:
- It is **removed from the DOM** (not just `display: none`) — to avoid accidental form submission.
- Its value is **excluded from the submission payload**.
- It is **not validated** (hidden fields skip validation).

This matches FormIO's behaviour and is the safest default for data integrity.

### 6.3 Cascading Conditionals

If Field B is hidden because Field A's value changed, and Field C depends on Field B's value, Field C should also re-evaluate. The renderer re-evaluates all conditionals on every field change (full sweep — fast enough for forms with < 500 fields).

---

## 7. Renderer Component API

### 7.1 Angular Component Inputs & Public API

```typescript
// libs/form-renderer/src/lib/form-renderer.component.ts
@Component({
  selector: 'vi-form-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ViewEncapsulation.Emulated (Angular default) — NO Shadow DOM.
  // Global styles, @vialiq/flux-ui tokens, and host-app stylesheets apply normally.
  imports: [/* RendererNodeComponent, FormErrorSummaryComponent, ... */],
  templateUrl: './form-renderer.component.html',
  styleUrl:    './form-renderer.component.scss',
})
export class FormRendererComponent {
  private readonly _dataService       = inject(FORM_DATA_SERVICE, { optional: true });
  private readonly _validatorRegistry = inject(CUSTOM_VALIDATOR_REGISTRY, { optional: true });
  private readonly _announcer         = inject(LiveAnnouncer); // @angular/cdk/a11y

  /** The FormSchema to render. Required. */
  @Input({ required: true }) schema!: FormSchema;

  /** Read-only mode: renders field values as text; Submit/Reset buttons hidden. */
  @Input() readonly = false;

  /** Emitted when any field value changes. */
  @Output() formChange   = new EventEmitter<{ field: string; value: unknown; data: FormData }>();
  /** Emitted when client-side validation runs (on submit attempt). */
  @Output() formValidate = new EventEmitter<{ valid: boolean; errors: FieldValidationError[] }>();
  /** Emitted on successful submit (after onSubmit resolves). */
  @Output() formSubmit   = new EventEmitter<{ data: FormData }>();
  /** Emitted on submit error (after onSubmit rejects with ServerValidationError[]). */
  @Output() formError    = new EventEmitter<{ serverErrors: ServerValidationError[] }>();
  /** Emitted when the form is reset. */
  @Output() formReset    = new EventEmitter<void>();
  /**
   * Emitted when the Cancel button is clicked.
   * The renderer does NOT navigate or discard data — the host application decides
   * what to do (navigate back, close a modal, discard a draft, etc.).
   * Form state is preserved; call `reset()` explicitly if a discard is needed.
   */
  @Output() formCancel   = new EventEmitter<void>();

  /** Reactive submission state — drives button/field disabled state. */
  readonly submissionState: Signal<FormSubmissionState> = signal({ status: 'idle' });

  /** Programmatic submit — same as clicking the submit button. */
  async submit(): Promise<void> { ... }
  /** Programmatic reset — clears all values to defaultValue. */
  reset(): void { ... }
  /** Programmatic validate — runs all rules, returns errors without submitting. */
  validate(): FieldValidationError[] { ... }
  /** Returns current form data as a plain object (repeater rows as arrays). */
  getData(): FormData { ... }
}
```

**Host usage:**
```typescript
@Component({
  imports: [FormRendererComponent],
  template: `
    <vi-form-renderer
      [schema]="formSchema"
      (formSubmit)="onSuccess($event)"
      (formError)="onError($event)"
    />
  `,
  providers: [
    { provide: FORM_DATA_SERVICE, useClass: MyContactFormService }
  ]
})
export class ContactPageComponent { ... }
```

### 7.2 Runtime Service Injection

**Data service** — provide `FORM_DATA_SERVICE` at the route, feature, or component level:
```typescript
// Route-level (recommended — tied to the page lifetime):
{
  path: 'contacts/:id/edit',
  component: ContactEditPageComponent,
  providers: [{ provide: FORM_DATA_SERVICE, useClass: ContactFormDataService }]
}
```

**Custom validators** — register study-specific validators via `provideValidation()` from `@vialiq/form-validator-sdk`:
```typescript
import { provideValidation } from '@vialiq/form-validator-sdk';
import { nhsNumberValidator, scoreRangeValidator } from './validators';

providers: [
  provideValidation({
    customValidators: {
      nhsNumber: nhsNumberValidator,
      scoreRange: scoreRangeValidator,
    }
  })
]
```

See [form-builder-custom-validators.md](./form-builder-custom-validators.md) for the full SDK reference, including pure function validators, class-based validators, study metadata injection, and the testing helper `runValidator()`.

**Server errors** — injected when `FormDataService.onSubmit()` rejects with `ServerValidationError[]`:
```typescript
async onSubmit(data: FormData): Promise<void> {
  try {
    await this._api.submitForm(data);
  } catch (apiError) {
    // Map API error shape to ServerValidationError[] and re-throw:
    throw apiError.fieldErrors.map(e => ({ field: e.key, message: e.message }));
  }
}
```
The renderer catches the rejection, transitions to `error` state, and propagates errors to each matching field component via a shared `Signal<Record<string, string[]>>`. No manual event dispatching or Shadow DOM traversal required.

---

### 7.3 `FieldStateService` — Shared Signal Store

`FieldStateService` is an Angular `@Injectable()` **scoped to `FormRendererComponent`** via its `providers` array. Every `vi-renderer-*` wrapper injects it to read and write field state. Angular's DI scoping ensures each renderer instance gets its own isolated store — two `<vi-form-renderer>` elements on the same page do not share state.

```typescript
// libs/form-renderer/src/lib/services/field-state.service.ts

@Injectable()  // NOT providedIn: 'root' — scoped to FormRendererComponent via providers:[]
export class FieldStateService {
  // ── Values ────────────────────────────────────────────────────────────────
  private readonly _values = signal<Record<string, unknown>>({});

  getValue(key: string): unknown { return this._values()[key] ?? null; }
  setValue(key: string, value: unknown): void {
    this._values.update(v => ({ ...v, [key]: value }));
    this._dirty.update(d => ({ ...d, [key]: true }));
  }

  // ── Touch / Dirty ─────────────────────────────────────────────────────────
  private readonly _touched = signal<Record<string, boolean>>({});
  private readonly _dirty   = signal<Record<string, boolean>>({});

  markTouched(key: string): void { this._touched.update(t => ({ ...t, [key]: true })); }
  isTouched(key: string): boolean { return this._touched()[key] ?? false; }
  isDirty(key: string):   boolean { return this._dirty()[key] ?? false; }

  // ── Errors (client + server merged; server takes priority) ────────────────
  private readonly _clientErrors = signal<Record<string, string | null>>({});
  private readonly _serverErrors = signal<Record<string, string | null>>({});

  /** Returns the active error for a field — server errors take priority over client errors. */
  getError(key: string): string | null {
    return this._serverErrors()[key] ?? this._clientErrors()[key] ?? null;
  }
  setClientError(key: string, msg: string | null): void {
    this._clientErrors.update(e => ({ ...e, [key]: msg }));
  }
  /** Called by the renderer after onSubmit() rejects. Clears on next user change. */
  setServerErrors(errors: ServerValidationError[]): void {
    this._serverErrors.set(Object.fromEntries(errors.map(e => [e.field, e.message])));
  }

  // ── Required (derived from schema rules at initialise time) ───────────────
  private _requiredKeys = new Set<string>();
  /** True if the field has a 'required' validation rule AND is currently visible. */
  isRequired(key: string): boolean { return this._requiredKeys.has(key); }

  // ── Conditional visibility ────────────────────────────────────────────────
  private readonly _visibility = signal<Record<string, boolean>>({});
  isVisible(key: string): boolean { return this._visibility()[key] ?? true; }
  setVisibility(key: string, visible: boolean): void {
    this._visibility.update(v => ({ ...v, [key]: visible }));
  }

  // ── ValidationEngine support ──────────────────────────────────────────────
  // These methods are called exclusively by ValidationEngine (see form-builder-validation.md §20).
  private readonly _lastValidated = signal<Record<string, unknown>>({});
  private readonly _systemQueries = signal<Record<string, SystemValidationRecord[]>>({});

  /** Snapshot of all field states — used by ValidationEngine to build formData for cross-field rules. */
  getAllFieldStates(): Record<string, FieldStateEntry> {
    const values  = this._values();
    const cErr    = this._clientErrors();
    const sErr    = this._serverErrors();
    const touched = this._touched();
    const dirty   = this._dirty();
    const visible = this._visibility();
    return Object.fromEntries(
      Object.keys(values).map(key => [key, {
        value:   values[key],
        error:   sErr[key] ?? cErr[key] ?? null,
        touched: touched[key] ?? false,
        dirty:   dirty[key]   ?? false,
        visible: visible[key] ?? true,
      }])
    );
  }
  /** Records the last validated value — used to skip re-validation when unchanged. */
  setLastValidatedValue(key: string, value: unknown): void {
    this._lastValidated.update(m => ({ ...m, [key]: value }));
  }
  getLastValidatedValue(key: string): unknown { return this._lastValidated()[key]; }
  /** EDC system query records associated with a field (SYSTEM_VALIDATION error type). */
  getSystemQueries(key: string): SystemValidationRecord[] {
    return this._systemQueries()[key] ?? [];
  }
  setSystemQueries(key: string, queries: SystemValidationRecord[]): void {
    this._systemQueries.update(m => ({ ...m, [key]: queries }));
  }

  // ── Form-wide signals ─────────────────────────────────────────────────────
  readonly submissionState = signal<FormSubmissionState>({ status: 'idle' });
  readonly readonly        = signal<boolean>(false);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  /** Called once on FormRendererComponent.ngOnInit — seeds values from defaults + initialData. */
  initialise(schema: FormSchema, initialData: FormData): void { /* ... */ }
  /** Builds the nested submission payload. Hidden fields excluded; repeaters produce arrays. */
  getSubmissionData(): FormData { /* ... */ }
  /** Resets all values to defaultValue and clears errors and dirty/touched state. */
  reset(): void { /* ... */ }
}
```

**How wrappers use it:** Each `vi-renderer-*` wrapper uses `computed()` to derive its display state (value, error, disabled). When a CE emits a user event, the wrapper calls `setValue()` and `markTouched()`. The validation engine — run by `FormRendererComponent`, not the wrappers — reads field values and calls `setClientError()` per field.

---

## 8. Rendering Strategy

### 8.1 Schema → DOM

The renderer delegates each component schema node to a dedicated `RendererNodeComponent` using Angular's `@switch` control flow. Each type maps to a typed wrapper component that hosts the corresponding `<vi-*>` Lit element.

**`FormRendererComponent` template (top level):**
```html
<form
  [attr.aria-label]="schema.title"
  novalidate
  (submit)="onFormSubmit($event)"
>
  @if (submissionState().status === 'error' || submissionState().status === 'validating') {
    <vi-renderer-error-summary [errors]="allErrors()" />
  }

  @for (component of visibleTopLevelComponents(); track component.id) {
    <vi-renderer-node [schema]="component" />
  }

  @if (!readonly) {
    <div class="vi-form__actions">
      <vi-button
        type="submit"
        [label]="schema.settings?.submitButton?.label ?? 'Submit'"
        [variant]="schema.settings?.submitButton?.variant ?? 'primary'"
        [disabled]="isSubmitting()"
      ></vi-button>
      <vi-button
        type="button"
        [label]="schema.settings?.cancelButton?.label ?? 'Cancel'"
        [variant]="schema.settings?.cancelButton?.variant ?? 'secondary'"
        (vialiqClick)="onCancel()"
      ></vi-button>
    </div>
  }
</form>
```

**`RendererNodeComponent` — dispatches by field type:**
```html
<!-- renderer-node.component.html -->
<!--
  Repeating gate: when isRepeating = true, vi-renderer-repeating-field takes over
  entirely and handles all instance management + submission array assembly.
  The inner @switch is skipped — vi-renderer-repeating-field does its own dispatch.
-->
@if (schema().isRepeating) {
  <vi-renderer-repeating-field [schema]="schema()" />
} @else {
  @switch (schema().type) {
    @case ('text-input')      { <vi-renderer-input    [schema]="schema()" /> }
    @case ('email')            { <vi-renderer-input    [schema]="schema()" /> }
    @case ('password')         { <vi-renderer-input    [schema]="schema()" /> }
    @case ('tel')              { <vi-renderer-input    [schema]="schema()" /> }
    @case ('url')              { <vi-renderer-input    [schema]="schema()" /> }
    @case ('number')           { <vi-renderer-input    [schema]="schema()" /> }
    @case ('textarea')         { <vi-renderer-textarea [schema]="schema()" /> }
    @case ('select')           { <vi-renderer-select         [schema]="schema()" /> }
    @case ('dropdown')         { <vi-renderer-dropdown       [schema]="schema()" /> }
    @case ('combobox')         { <vi-renderer-combobox       [schema]="schema()" /> }
    @case ('checkbox')         { <vi-renderer-checkbox       [schema]="schema()" /> }
    @case ('radio-group')      { <vi-renderer-radio-group    [schema]="schema()" /> }
    @case ('checkbox-group')   { <vi-renderer-checkbox-group [schema]="schema()" /> }
    @case ('date')             { <vi-renderer-date     [schema]="schema()" /> }
    @case ('time')             { <vi-renderer-date     [schema]="schema()" /> }
    @case ('datetime-local')   { <vi-renderer-date     [schema]="schema()" /> }
    @case ('hidden')           { <vi-renderer-hidden   [schema]="schema()" /> }
    @case ('button')           { <vi-renderer-button   [schema]="schema()" /> }
    @case ('submit')           { <vi-renderer-button   [schema]="schema()" /> }
    @case ('reset')            { <vi-renderer-button   [schema]="schema()" /> }
    // @case ('fieldset') — pending design review; revisit after base layout components are stable
    @case ('panel')            { <vi-renderer-panel    [schema]="schema()" /> }
    @case ('columns')          { <vi-renderer-columns  [schema]="schema()" /> }
    @case ('tabs')             { <vi-renderer-tabs     [schema]="schema()" /> }
    @case ('repeater')         { <vi-renderer-repeater [schema]="schema()" /> }
    // @case ('sub-form') — deferred to v2+
    @case ('content')          { <vi-renderer-content  [schema]="schema()" /> }
    @case ('divider')          { <hr class="vi-form__divider" /> }
    @default {
      <!--
        Unknown type — vi-renderer-generic handles lookup via BuilderRegistryService.
        Phase 3: full custom-element and lazy-loaded Angular component support.
        Until Phase 3 ships, vi-renderer-generic is a stub that logs a warning.
      -->
      <vi-renderer-generic [schema]="schema()" />
    }
  }
}
```

Each `vi-renderer-*` wrapper is a lightweight Angular component that:
1. Reads field value and error state from the shared `FieldStateService` (Signal-based, injected via DI).
2. Hosts the `<vi-*>` Lit leaf element (form-associated custom element).
3. Wires Angular event bindings to `(vialiqInput)`, `(blur)`, `(change)` on the Lit element.

**Example — `RendererInputComponent`:**
```typescript
@Component({
  selector: 'vi-renderer-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vi-input
      [label]="schema().label"
      [type]="inputType()"
      [value]="value()"
      [placeholder]="schema().placeholder ?? ''"
      [disabled]="isDisabled()"
      [readonly]="schema().readOnly || formReadonly()"
      [description]="schema().description ?? ''"
      [errorMessage]="errorMessage()"
      [min]="schema().min"
      [max]="schema().max"
      [step]="schema().step"
      [mask]="schema().mask"
      (vialiqInput)="onChange($event)"
      (blur)="onBlur()"
    ></vi-input>
  `,
  // min/max/step are only meaningful for type='number'; vi-input ignores them otherwise.
  // mask is only meaningful for text types; vi-input ignores it for type='number'.
})
export class RendererInputComponent {
  private readonly _fieldState = inject(FieldStateService);
  readonly schema        = input.required<InputComponentSchema>();
  readonly value         = computed(() => this._fieldState.getValue(this.schema().key));
  readonly errorMessage  = computed(() => this._fieldState.getError(this.schema().key));
  readonly isDisabled    = computed(() => this._fieldState.submissionState() === 'submitting');
  readonly formReadonly  = computed(() => this._fieldState.readonly());
  readonly inputType     = computed(() => this.schema().type === 'text-input' ? 'text' : this.schema().type);
}
```

### 8.4 Leaf Component Contract

All built-in `vi-renderer-*` Angular wrappers host a **Lit web component** (`<vi-input>`, `<vi-select>`, `<vi-checkbox>`, `<vi-date-picker>`, `<vi-button>`) from `@vialiq/web-components`. These Lit elements use `static formAssociated = true` + `attachInternals()` — they are **form-associated custom elements** that participate natively in HTML form validation and submission.

This two-layer architecture (Angular wrapper + Lit leaf) is a permanent design decision, not a migration step:
- **Lit leaf elements** — visual, accessible, design-token-driven UI. Usable standalone in any context. Shadow DOM provides style isolation at the leaf level.
- **Angular wrappers** — state, DI, signals, conditional logic. No Shadow DOM (`ViewEncapsulation.Emulated`). Invisible to end users.

Third-party Lit components (or any spec-compliant custom element) can be used as leaf elements via `ComponentDescriptor.rendererRef.kind = 'custom-element'` — no Angular wrapper needed; `vi-renderer-generic` handles the bridge automatically.

### 8.5 Repeating Field Rendering (`vi-renderer-repeating-field`)

When `schema().isRepeating === true`, `RendererNodeComponent` renders `vi-renderer-repeating-field` instead of the standard `vi-renderer-*` wrapper. This component manages the **array of control instances** and handles the add/remove UX.

**Visual anatomy (single instance — no delete button):**
```
┌────────────────────────────────────────┐
│ Phone Number *                         │
│ ┌──────────────────────────────┐ [+]  │
│ │ +44 7700 900 000             │      │
│ └──────────────────────────────┘      │
└────────────────────────────────────────┘
```

**Visual anatomy (multiple instances):**
```
┌────────────────────────────────────────┐
│ Phone Number *                         │
│ ┌──────────────────────────────┐ [×]  │
│ │ +44 7700 900 000             │      │
│ └──────────────────────────────┘      │
│ ┌──────────────────────────────┐ [×] [+]  │
│ │ +44 7700 900 001             │          │
│ └──────────────────────────────┘          │
└────────────────────────────────────────────┘
```

Rules:
- The label is rendered **once** above the first instance (not per-instance).
- The `[+]` (add) button always sits to the right of the **last** instance.
- The `[×]` (delete) button appears on **every** instance when there are 2 or more.
- A single remaining instance has no delete button — it cannot be removed.
- If `minRepeat` is set and the current count equals `minRepeat`, delete buttons are hidden.
- If `maxRepeat` is set and the current count equals `maxRepeat`, the `[+]` button is hidden.
- The `addLabel` from the schema drives the `[+]` button's accessible label (`aria-label`).

**`RendererRepeatingFieldComponent`:**
```typescript
@Component({
  selector: 'vi-renderer-repeating-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="vi-form__repeating-field">
      <!-- Single shared label above all instances -->
      <legend class="vi-form__label">
        {{ schema().label }}
        @if (isRequired()) { <span aria-hidden="true">*</span> }
      </legend>

      @for (item of items(); track item.id) {
        <div class="vi-form__repeating-item">
          <!-- Render the leaf CE directly — bypasses RendererNodeComponent
               to avoid re-triggering the isRepeating gate -->
          <vi-renderer-scalar
            [schema]="scalarSchema()"
            [value]="item.value"
            (valueChange)="updateItem(item.id, $event)"
            (blur)="onItemBlur(item.id)"
          />

          @if (canDelete()) {
            <button
              type="button"
              class="vi-form__repeating-delete"
              [attr.aria-label]="'Remove ' + schema().label + ' ' + ($index + 1)"
              (click)="removeItem(item.id)"
            >×</button>
          }

          <!-- [+] only on the last item -->
          @if ($last && canAdd()) {
            <button
              type="button"
              class="vi-form__repeating-add"
              [attr.aria-label]="addLabel()"
              (click)="addItem()"
            >+</button>
          }
        </div>
      }

      <!-- Per-field error (shown for any item with an error, or the array-level error) -->
      @if (errorMessage()) {
        <span class="vi-form__error" role="alert">{{ errorMessage() }}</span>
      }
    </fieldset>
  `,
})
export class RendererRepeatingFieldComponent {
  private readonly _fieldState = inject(FieldStateService);

  readonly schema   = input.required<BaseComponentSchema>();

  /** Internal: each item has a stable id + current value */
  readonly items    = signal<Array<{ id: string; value: unknown }>>([
    { id: crypto.randomUUID(), value: this.schema().defaultValue ?? null }
  ]);

  readonly canDelete  = computed(() => this.items().length > (this.schema().minRepeat ?? 1));
  readonly canAdd     = computed(() =>
    this.schema().maxRepeat == null || this.items().length < this.schema().maxRepeat!
  );
  readonly addLabel   = computed(() => this.schema().addLabel ?? 'Add ' + this.schema().label);
  readonly isRequired = computed(() => this._fieldState.isRequired(this.schema().key));
  readonly errorMessage = computed(() => this._fieldState.getError(this.schema().key));

  /**
   * A stripped-down, non-repeating version of the schema passed to vi-renderer-scalar.
   * Same type + display props; isRepeating = false; key is virtual (not in FieldStateService).
   */
  readonly scalarSchema = computed(() => ({ ...this.schema(), isRepeating: false }));

  addItem(): void {
    this.items.update(arr => [
      ...arr,
      { id: crypto.randomUUID(), value: this.schema().defaultValue ?? null },
    ]);
    this._pushToFieldState();
  }

  removeItem(id: string): void {
    if (!this.canDelete()) return;
    this.items.update(arr => arr.filter(item => item.id !== id));
    this._pushToFieldState();
  }

  updateItem(id: string, value: unknown): void {
    this.items.update(arr => arr.map(item => item.id === id ? { ...item, value } : item));
    this._pushToFieldState();
  }

  onItemBlur(id: string): void {
    this._fieldState.markTouched(this.schema().key);
  }

  private _pushToFieldState(): void {
    // Store the full array as the field's value — submitted as an array
    this._fieldState.setValue(this.schema().key, this.items().map(i => i.value));
  }
}
```

**`vi-renderer-scalar`** is a private internal component (not exported from `@vi/form-renderer`) used exclusively by `RendererRepeatingFieldComponent`. It renders a **single scalar instance** of a field type, bypassing the `isRepeating` gate and direct `FieldStateService` reads. The repeating wrapper owns the array of values and manages all `FieldStateService` writes.

```typescript
// Internal — NOT exported from @vi/form-renderer public API
@Component({
  selector: 'vi-renderer-scalar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Template @switch mirrors RendererNodeComponent but:
  //   • value/disabled/readOnly come from inputs — no FieldStateService reads.
  //   • errorMessage is NOT shown — RendererRepeatingFieldComponent manages error display.
  //   • isRepeating gate is absent — this component is only called for scalar rendering.
})
export class RendererScalarComponent {
  readonly schema      = input.required<BaseComponentSchema>();
  readonly value       = input<unknown>(null);
  readonly disabled    = input<boolean>(false);
  readonly readOnly    = input<boolean>(false);
  readonly valueChange = output<unknown>();
  readonly blurred     = output<void>();
}
```

**Why a separate component?** `RendererNodeComponent` reads values from `FieldStateService` using `schema().key` — one entry per field. A repeating field has one logical key (e.g. `phoneNumbers`) but N instances. The full array is stored as a single signal under `phoneNumbers`. `RendererScalarComponent` is purely presentational: it renders the correct CE, forwards user input via `output()`, and the parent `RendererRepeatingFieldComponent` manages the array and all `FieldStateService` writes.

**Submission shape:** a `tel` field with `key: 'phoneNumbers'` and `isRepeating: true` containing two instances submits as:
```json
{ "phoneNumbers": ["+44 7700 900 000", "+44 7700 900 001"] }
```

If the field has `minRepeat: 1` (default) and only one value is present, the submission shape is still an array with one element:
```json
{ "phoneNumbers": ["+44 7700 900 000"] }
```

**Validation:** validation rules (`required`, `minLength`, `maxLength`, etc.) are applied independently to each instance value. An error on any instance triggers the shared error message below all instances. Array-level rules (`minRepeat` / `maxRepeat`) produce schema-level errors ("At least 2 entries required.").

---

### 8.6 Sub-Form Rendering (`vi-renderer-subform`) _(v2+ deferred)_

> **Status:** The sub-form component type is deferred to v2+. This section describes the intended v2 rendering approach.
>

1. Reads `schema().subFormSchema` (inline) or calls `inject(FORM_CATALOG_SERVICE).getSchema(schema().subFormId)` to fetch the referenced sub-form.
2. Creates a **child `FieldStateService`** with a key prefix equal to `schema().key`. All child field reads/writes go through `parentState.getValue('${key}.${childKey}')` and `parentState.setValue('${key}.${childKey}', value)`.
3. Renders the sub-form's `components[]` by looping `<vi-renderer-node>` — **no `<form>` tag**, no submit button, no error summary. Those belong to the parent form.
4. Conditional rules within the sub-form are evaluated against the sub-form's own scoped data (keyed values under the `key` prefix). Cross-boundary conditionals are not supported in v1.

**Submission shape:** a sub-form with `key: 'billingAddress'` and fields `street`, `city`, `postcode` produces:
```json
{
  "billingAddress": {
    "street": "123 Main St",
    "city": "London",
    "postcode": "EC1A 1BB"
  }
}
```

### 8.7 Custom / Third-Party Component Rendering (`vi-renderer-generic`) _(Phase 3 — deferred)_

> **Status:** Phase 3. The `@default` branch in `RendererNodeComponent` exists from v1 and routes unknown types here — `vi-renderer-generic` is a no-op stub (logs a warning, renders nothing) until Phase 3.
>
> **Base architecture requirement:** `ComponentDescriptor.rendererRef` (`kind: 'custom-element' | 'angular'`) must be defined in the schema type system and builder registry from v1, so descriptors registered early work without schema migration when Phase 3 ships.

When fully implemented, `vi-renderer-generic` will:

1. Look up the `ComponentDescriptor` by `schema().type` from `BuilderRegistryService`.
2. Read `descriptor.rendererRef`:
   - `kind: 'custom-element'` — render the specified CE tag, apply `elementProps` mapping, bridge `FieldStateService` → element attributes, listen for `vialiqInput`/`change`/`blur` CE events → `FieldStateService`.
   - `kind: 'angular'` — call `descriptor.rendererRef.component()`, lazy-load the Angular component, render it via `NgComponentOutlet` with the current injector.
   - No `rendererRef` — fall back to `descriptor.canvasElement` as the CE tag (same as `custom-element` with default props).
3. If no descriptor is found for `schema().type`, log a warning and render nothing (no runtime error).

---

### 8.8 Codelist Option Resolution (`vi-renderer-select`, `vi-renderer-dropdown`, `vi-renderer-combobox`, `vi-renderer-radio-group`, `vi-renderer-checkbox-group`)

> **⛔ Before implementing:** Multilingual and platform-wide versioning designs must be finalised first. See architecture.md §10.7.

All five option controls follow the same pattern. `FormRendererComponent` collects every `CodelistOptionSource.name` referenced in the form schema, calls `CODELIST_SERVICE.prefetchAll(names)` once on init, and stores the results in a `CodelistStore` (a `Map<string, CodelistItem[]>` held in a Signal). Each wrapper then reads from this store synchronously — no per-wrapper subscriptions, no Observable chaining.

```typescript
// FormRendererComponent — init hook
ngOnInit(): void {
  const codelistNames = this._collectCodelistNames(this.schema());
  if (codelistNames.length && this._codelistSvc) {
    // Parallel GETs; individual failures are isolated (logged, stored as [])
    this._codelistSvc
      .prefetchAll(codelistNames)
      .subscribe(map => this._codelistStore.set(map));
  }
}

// Shared Signal store — injected into all wrapper components via DI
const CODELIST_STORE =
  new InjectionToken<WritableSignal<Map<string, CodelistItem[]>>>('CODELIST_STORE');
```

```typescript
// vi-renderer-select — simplified synchronous read
@Component({
  selector: 'vi-renderer-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <vi-select
      [label]="schema().label"
      [placeholder]="schema().placeholder ?? ''"
      [options]="resolvedOptions()"   <!-- always CodelistItem[], never a descriptor -->
      [value]="value()"
      [multiple]="schema().multiple ?? false"
      [clearable]="schema().clearable ?? false"
      [disabled]="isDisabled()"
      [errorMessage]="errorMessage()"
      (vialiqChange)="onChange($event)"
      (blur)="onBlur()"
    ></vi-select>
  `,
})
export class RendererSelectComponent {
  private readonly _fieldState  = inject(FieldStateService);
  private readonly _store       = inject(CODELIST_STORE);

  readonly schema       = input.required<SelectComponentSchema>();
  readonly value        = computed(() => this._fieldState.getValue(this.schema().key));
  readonly errorMessage = computed(() => this._fieldState.getError(this.schema().key));
  readonly isDisabled   = computed(() => this._fieldState.submissionState() === 'submitting');

  /**
   * Synchronous resolution — the CODELIST_STORE Signal is already populated
   * by FormRendererComponent.prefetchAll() before any field renders.
   * Static sources are returned immediately without touching the store.
   */
  readonly resolvedOptions = computed<CodelistItem[]>(() => {
    const src = this.schema().optionSource;
    if (src.kind === 'static') return src.options;
    return this._store().get(src.name) ?? [];
  });
}
```

**Key design points:**
- All five option controls (`vi-renderer-select`, `vi-renderer-dropdown`, `vi-renderer-combobox`, `vi-renderer-radio-group`, `vi-renderer-checkbox-group`) use the same `CODELIST_STORE` Signal — a single source of truth populated before any field renders.
- The Lit CEs (`<vi-select>`, `<vi-dropdown>`, `<vi-combobox>`, `<vi-radio-group>`, `<vi-checkbox-group>`) receive `options: CodelistItem[]`. They have no knowledge of HTTP, Angular DI, or codelist semantics.
- Each `CodelistItem`: `{ key: string; value: string; data?: unknown }`. The CE uses `key` as the stored/submitted value and `value` as the display label.
- `CODELIST_SERVICE` is optional. If not provided and a codelist source is encountered, the wrapper logs a warning and renders with empty options.
- `data` on `CodelistItem` is available to `optionTemplate` expressions (`{{data.*}}`) only — never stored or submitted.
- Option template rendering: when `schema().optionTemplate` is a `StringOptionTemplate`, the Angular wrapper evaluates `{{value}}`, `{{key}}`, `{{data.*}}` with the safe pipe whitelist and passes rendered strings to the Lit CE.

> **⏳ Pending — Cascading / Linked Codelists (TD-03):** A common clinical pattern is where one field's value determines another field's available options (e.g., country → site list, AE term → sub-term). The current design prefetches all codelists once at init with no inter-field dependency. A declarative `dependsOn` config on `CodelistOptionSource` is planned — allowing the renderer to re-fetch or filter a downstream codelist whenever the upstream field changes, with minimal code at the renderer level. Target: intuitive config, cascading effect handled by the `OfflineCodelistService` / `CODELIST_SERVICE` internally. Design session required before implementation. See [roadmap TD-03](./form-builder-roadmap.md).



### 8.2 Label Position

`BaseComponentSchema.labelPosition` controls the label/input layout using **flexbox**. Only two visible layouts are supported — stacked and inline. A third option hides the label visually while keeping it in the accessibility tree.

| Value | CSS class | Flexbox | Visual |
|---|---|---|---|
| `top` (default) | `vi-form__field--label-top` | `flex-direction: column` | Label stacked above input |
| `left` | `vi-form__field--label-left` | `flex-direction: row` | Label inline to left of input |
| `hidden` | `vi-form__field--label-hidden` | `flex-direction: column` | Label hidden visually; present in a11y tree |

```css
/* Stacked (default) */
.vi-form__field--label-top {
  display: flex;
  flex-direction: column;
  gap: var(--vi-space-1);
}

/* Inline */
.vi-form__field--label-left {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: var(--vi-space-3);
}
.vi-form__field--label-left .vi-form__label {
  width: var(--vi-form-label-width, 200px);
  flex-shrink: 0;
  padding-top: var(--vi-space-2); /* align with input top edge */
}

/* Visually hidden — still in a11y tree */
.vi-form__field--label-hidden .vi-form__label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
```

> **Note:** Right-aligned labels are not supported. Clinical data-entry forms use stacked or inline layouts; right-aligned labels add visual complexity with minimal benefit.

### 8.3 Error Display

- **Inline errors**: Below each field, shown when validation fails. Uses `vi-input`'s built-in error slot.
- **Error summary**: A `<vi-alert variant="error">` at the top of the form, listing all errors by field label (shown on submit or server error only).
- **Server errors**: Treated the same as inline validation errors visually — injected into the field's error state.

---

## 9. Read-Only / View Mode

When `readonly = true` (or `schema.settings.readOnly = true`):
- All `<vi-*>` elements receive `readonly` attribute.
- Submit and Reset buttons are hidden.
- The form still renders the full layout, labels, and values.
- Validation is not triggered.
- `dataService.onFieldChange` is not called.

This is distinct from `BaseComponentSchema.readOnly` which is per-field.

---

## 10. Theming

The renderer uses CSS custom properties from the `@vialiq/flux-ui` design token system plus its own renderer-specific tokens. Since `FormRendererComponent` uses Angular's default `ViewEncapsulation.Emulated` (no Shadow DOM), the host application's global stylesheet can override all tokens directly — no `::part()`, `::slotted()`, or CSS custom property tunnelling required.

**Consumer theming:**
```css
/* In the host app's global stylesheet or a component's encapsulation-piercing styles: */
vi-form-renderer {
  --vi-form-max-width: 800px;         /* set from FormSchema.settings.maxWidth */
  --vi-form-gap: var(--vi-space-4);   /* vertical gap between fields */
  --vi-form-label-width: 200px;       /* used when labelPosition = 'left' */
  --vi-form-error-color: var(--vi-color-danger-600);
  --vi-form-success-color: var(--vi-color-success-600);
}
```

**No Shadow DOM = no style piercing.** All `@vialiq/flux-ui` design tokens, brand themes, and host-app stylesheets cascade naturally into the renderer and into the `<vi-input>` / `<vi-select>` Lit leaf elements (which still use their own shadow roots for style isolation at the leaf level only).

---

## 11. Accessibility

> **Target:** WCAG 2.1 Level AA.
> Automated coverage via `@axe-core/playwright` in E2E tests.
> Manual verification via the screen reader test matrix in §11.11.

### 11.1 Form Structure

| Requirement | Implementation |
|---|---|
| WCAG 2.1 AA target | All renderer output must pass WCAG 2.1 Level AA criteria |
| Form landmark | `FormRendererComponent` renders a native `<form>` with `novalidate` + `aria-label` from `FormSchema.title` |
| Hidden fields | `hidden` schema fields render with `aria-hidden="true"` on the wrapper element; never receive focus |
| Busy state | `<form [attr.aria-busy]="isSubmitting()">` — screen readers announce processing during `submitting` state |

### 11.2 Field Labels and Descriptions

| Requirement | Implementation |
|---|---|
| Visible label | Each field renders a `<label>` associated via `for` / `id` to the internal input inside the Lit CE |
| Shadow DOM association | Each `<vi-*>` CE exposes its internal input `id` as a reflected attribute; the Angular wrapper sets `for` to match |
| Error association | Inline error messages have a stable `id` (e.g. `vi-error-{key}`); the CE receives `aria-describedby="{id}"` as a reflected property so the internal input inherits it across the Shadow DOM boundary |
| `aria-invalid` | Fields with one or more errors receive `aria-invalid="true"` as a reflected attribute on the CE; removed when errors clear |

### 11.3 Error Handling

| Requirement | Implementation |
|---|---|
| Error summary | A summary block with `role="alert"` renders above the form fields when submission fails; announced immediately by screen readers |
| Error summary focus | On submit failure, focus moves **to the error summary** first (so screen reader users hear the full list), not directly to the first field |
| Inline errors | Each field's inline error is rendered outside the CE shadow root with a stable `id`; linked via `aria-describedby` (see §11.2) |
| `aria-invalid` cleared | `aria-invalid` and `aria-describedby` are removed when the field value becomes valid |

### 11.4 Required Fields

| Requirement | Implementation |
|---|---|
| Machine-readable | `aria-required="true"` on the CE (reflected to internal input) |
| Visual indicator | Visible `*` rendered after the `<label>` text |
| Legend | A `<p class="vi-form__required-legend">Fields marked <span aria-hidden="true">*</span> are required.</p>` renders at the top of the form when any required field is present. The `aria-hidden` suppresses the duplicate `*` for screen readers — they hear the full sentence instead. |

### 11.5 Group Controls (Radio Group, Checkbox Group)

Radio and checkbox groups require group-level context that individual `<label>` elements cannot provide.

| Requirement | Implementation |
|---|---|
| `<fieldset>` + `<legend>` | `RendererRadioGroupComponent` and `RendererCheckboxGroupComponent` wrap their CE in a native `<fieldset>` with `<legend>` containing the field label text |
| `<vi-radio-group>` CE | The Lit CE internally uses `role="radiogroup"` + `aria-labelledby` pointing to a slot for the question text; the Angular wrapper uses the `<fieldset>`/`<legend>` pattern |
| `<vi-checkbox-group>` CE | Same pattern as radio group |
| Error association | The `<fieldset>` receives `aria-describedby` pointing to the inline error `id`, not individual checkboxes/radios |
| Required state | `aria-required="true"` on the `<fieldset>` element |

### 11.6 Repeating Fields

Each repeating field instance must be distinguishable from others in the group.

| Requirement | Implementation |
|---|---|
| Instance labels | The label for each instance is `"{field.label} ({n} of {total})"` — e.g. **Phone Number (1 of 3)** |
| `aria-label` override | `RendererScalarComponent` receives `instanceLabel` input; it sets `aria-label` on the CE to override the visible label |
| Add button | `<vi-button aria-label="Add another {field.label}">` |
| Remove button | `<vi-button aria-label="Remove {field.label} ({n} of {total})">` — mirrors the instance label |
| Count announcement | After add/remove, `LiveAnnouncer.announce("{field.label} count updated: {n} item(s)")` |

### 11.7 Keyboard Navigation

| Control | Keyboard contract |
|---|---|
| Form fields | Tab / Shift+Tab moves between fields in DOM order |
| `<vi-radio-group>` | Tab enters the group; **arrow keys** move between options; Tab exits the group |
| `<vi-checkbox-group>` | Each checkbox is a separate Tab stop; **Space** toggles; Tab / Shift+Tab moves between options |
| `<vi-select>` / `<vi-combobox>` | Enter / Space opens the listbox; arrow keys navigate options; Escape closes |
| `<vi-date-picker>` | Enter / Space opens the calendar; arrow keys navigate dates; Escape closes |
| Submit button | Enter or Space activates |
| Cancel button | Enter or Space activates; does **not** submit the form (`type="button"`) |
| Error summary | When focused (on submit failure), Tab moves to the first linked field anchor |

All keyboard contracts are implemented inside the respective Lit CEs. The Angular renderer layer does not intercept keyboard events.

### 11.8 State Announcements

| State | Mechanism |
|---|---|
| Field appears (conditional show) | `LiveAnnouncer.announce("{field.label} is now visible")` |
| Field disappears (conditional hide) | `LiveAnnouncer.announce("{field.label} is no longer required")` |
| Form submitting | `aria-busy="true"` on `<form>` + `aria-disabled="true"` on submit button |
| Form submit success | Host application responsibility (e.g. navigate to confirmation page) |
| Form submit failure | Focus → error summary (`role="alert"`) |
| Repeating field count change | `LiveAnnouncer.announce(...)` (see §11.6) |

### 11.9 Motion and Animation

Any transition or animation in the renderer or in Lit CEs **must** respect the user's motion preference:

```css
@media (prefers-reduced-motion: reduce) {
  /* Applied in both renderer global CSS and Lit CE shadow styles */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Affected elements: submit spinner, error message fade-in, conditional field show/hide transitions, drawer slide animation.

### 11.10 Touch Targets

All interactive elements must meet **WCAG 2.5.5 Target Size (Enhanced)** minimum of **44 × 44 px**:

| Element | Minimum size |
|---|---|
| Text inputs, selects | Full-width by default; height ≥ 44 px |
| Checkboxes, radio buttons | Click/tap target ≥ 44 × 44 px (padding applied inside CE) |
| Buttons (`<vi-button>`) | Height ≥ 44 px, min-width ≥ 44 px |
| Icon-only buttons (add/remove in repeating fields) | Explicit `width: 44px; height: 44px` |
| Date picker calendar cells | ≥ 44 × 44 px |

Implemented inside the respective Lit CEs using padding rather than explicit width/height where possible, so text scales with font size.

### 11.11 Screen Reader Test Matrix

Manual verification required before each v1 release and after any CE changes:

| Screen Reader | Browser | Platform | Priority |
|---|---|---|---|
| VoiceOver | Safari | macOS | P0 — primary |
| VoiceOver | Safari | iOS (mobile) | P0 — primary |
| NVDA | Chrome | Windows | P0 — primary |
| JAWS | Chrome | Windows | P1 — secondary |
| TalkBack | Chrome | Android | P1 — secondary |

**Minimum test scenarios per release:**
1. Complete a form with required fields, text input, select, checkbox, radio group
2. Submit with errors — verify error summary announced and focus lands on it
3. Correct errors — verify `aria-invalid` cleared, error association removed
4. Tab through entire form without mouse — verify logical order and no focus traps
5. Repeating field — add / remove instances, verify count announcements
6. Conditional field — trigger show/hide, verify `LiveAnnouncer` fires
7. Submit with `aria-busy` — verify screen reader announces processing

---

## 12. Renderer Checklist (v2 Implementation)

### Infrastructure
- [ ] `libs/form-renderer/` Nx library scaffolded (`@vi/form-renderer`, Angular, `framework:angular`)
- [ ] `FormRendererComponent` Angular standalone component (`ChangeDetectionStrategy.OnPush`, `ViewEncapsulation.Emulated`)
- [ ] `FieldStateService` — shared Signal store: field values, touched/dirty, errors, submission state
- [ ] `FORM_DATA_SERVICE` InjectionToken defined in `@vi/form-renderer`, re-exported from `@vi/form-builder`
- [ ] `FormDataService` interface defined
- [ ] `CUSTOM_VALIDATOR_REGISTRY` InjectionToken + `CustomValidatorRegistry` type defined
- [ ] `ServerValidationError` interface defined

### Core Rendering
- [ ] `renderComponent(schema)` recursive renderer
- [ ] All primitive field types rendered (text, email, password, tel, url, number, textarea, select, checkbox, radio, hidden, date, time, datetime-local)
- [ ] Layout containers (panel, columns, tabs, fieldset) rendered as transparent wrappers
- [ ] Repeater rendered with add/remove row controls
- [ ] Label position (top/left/right/hidden) CSS strategy
- [ ] `description`/helpText rendered below fields
- [ ] `readOnly` per-field support
- [ ] Global `readonly` attribute support
- [ ] `locked` fields rendered normally (lock is a builder concern, not renderer concern)

### Data
- [ ] `getInitialData()` called on init, values pre-populated
- [ ] `getData()` builds nested submission object (repeater = array of objects)
- [ ] Field change tracking (dirty/touched state per field)

### Validation
- [ ] `validateOn` evaluated per field (field override → form default → 'blur')
- [ ] Full-form validation on submit
- [ ] Conditional hidden fields skip validation
- [ ] Inline error display via `vi-input` validity mixin
- [ ] Error summary rendered on failed submit

### Submission
- [ ] State machine: idle → validating → submitting → success / error
- [ ] `onSubmit(data, schema)` called
- [ ] Submit button disabled + loading during `submitting`
- [ ] Server errors injected on rejection
- [ ] `successMessage` shown (or `successRedirectUrl` navigated)

### Conditionals
- [ ] `evaluateConditional` runs on every field change
- [ ] Hidden components removed from DOM
- [ ] Hidden components excluded from submission

### Accessibility
- [ ] Native `<form>` element with `aria-label`
- [ ] Error summary `role="alert"`
- [ ] Required asterisk + `aria-required`
- [ ] Focus management on submit error
- [ ] Live region for conditional field changes

### Outputs & Events
- [ ] `formChange` `@Output()` emitted on field value change
- [ ] `formValidate` `@Output()` emitted when client-side validation runs
- [ ] `formSubmit` `@Output()` emitted on successful submit
- [ ] `formError` `@Output()` emitted on submit failure with server errors
- [ ] `formReset` `@Output()` emitted on form reset
- [ ] `formCancel` `@Output()` emitted when Cancel button clicked; host handles navigation

### Testing

> **Note:** Full testing strategy (coverage targets, CI gates, test data fixtures, mock service patterns) will be defined incrementally as implementation progresses.
> The items below are baseline stubs; UT and E2E frameworks will be added as we go.

**Unit Testing** — `@testing-library/angular` + Vitest (mirrors the existing workspace setup)

- [ ] `FieldStateService`: `initialise()`, `getSubmissionData()`, `reset()`, `getError()` for flat / nested / repeater shapes
- [ ] `FieldStateService`: `validateOn` behaviour — blur / change / submit triggers
- [ ] `FieldStateService`: conditional visibility signal — field excluded from `getSubmissionData()` when hidden
- [ ] `FormRendererComponent`: renders schema-driven field list from a test fixture
- [ ] `FormRendererComponent`: `formSubmit` emits with correct payload; `formCancel` emits on Cancel click
- [ ] `FormRendererComponent`: server error injection updates `_serverErrors` signal; `getError()` returns server error over client error
- [ ] Submission state machine: `idle → submitting → success / error` transitions

**Component / Integration Testing** — `@testing-library/angular` + Vitest

- [ ] Full form render with a representative test schema (text, select, checkbox, radio group, repeating field)
- [ ] Submit flow: valid form → `formSubmit` output; invalid form → error summary + `aria-invalid` on fields
- [ ] Read-only mode: all CEs receive `readonly` attribute; no inputs editable

**E2E Testing** — Playwright (framework, config, and CI integration added as we go)

- [ ] Full form submit with real `<vi-input>`, `<vi-select>`, `<vi-checkbox>` interactions
- [ ] Error display and keyboard-only completion
- [ ] `@axe-core/playwright` WCAG 2.1 AA automated scan on a rendered form page

---

## 13. Copy/Paste — Deferred Implementation Plan (v2)

Copy/paste of form components across builder sessions is deferred to v2. The planned approach:

### Clipboard Model

```typescript
export interface ClipboardPayload {
  /** Prevents pasting non-form-builder clipboard content. */
  type: 'vi-form-builder-clipboard';
  /** Schema version the payload was created in. */
  schemaVersion: string;
  /** Deep copy of the copied ComponentSchema subtree. */
  components: ComponentSchema[];
}
```

### Implementation Plan

1. **Copy (`Ctrl+C` / toolbar button):**
   - Serialize selected node(s) + their entire subtree to `ClipboardPayload`.
   - Deep-clone: assign new UUIDs to all `id` fields.
   - Write to `navigator.clipboard` as JSON string.
   - Show transient toast: "Component copied".

2. **Paste (`Ctrl+V` / toolbar button):**
   - Read `navigator.clipboard` text.
   - Parse JSON, validate `type === 'vi-form-builder-clipboard'`.
   - Auto-generate new keys from existing keys (suffix: `_copy`, `_copy2`, …) to avoid key collisions.
   - Insert pasted components after the currently selected node (or at end of canvas if none selected).
   - Select the pasted node(s).
   - Show transient toast: "Component pasted".

3. **Schema version mismatch:**
   - If `ClipboardPayload.schemaVersion !== currentSchemaVersion`, run the migration pipeline before inserting.

4. **Security:**
   - Validate clipboard JSON structure before inserting — do not trust clipboard content blindly.
   - Use a strict JSON schema validator (`ajv`) for the `ClipboardPayload` structure.
