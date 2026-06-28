# Form Builder — JSON Schema Specification

> **Status:** In Design — architecture decisions active  
> **Date:** 2026-05-29  
> Related docs: [overview](./form-builder-overview.md) · [architecture](./form-builder-architecture.md) · [validation](./form-builder-validation.md) · [custom-validators](./form-builder-custom-validators.md) · [use-cases](./form-builder-custom-programming-use-cases.md) · [renderer](./form-builder-renderer.md)

---

## 1. Design Decisions

### 1.1 Why a Custom Schema (not FormIO's)

FormIO's schema carries years of legacy, mutable defaults, and Bootstrap-coupled class names. We design our own with:

- **Full TypeScript discriminated unions** — `type` narrows to the correct interface automatically.
- **Stable `id` (UUID)** on every node — enables undo/redo keying and future collaboration.
- **Typed validation rules** — no stringly-typed `validate.custom` blobs; a typed `RuleDescriptor[]`.
- **Explicit layout config** — panels, columns, tabs declare their layout parameters explicitly.
- **No implicit form associations** — every field declares its `key` (unique within the form).
- **Portable** — serializes cleanly to/from JSON with no class instances required.

### 1.2 Versioning

The schema includes a `schemaVersion` field. The renderer and builder must always state the version they support. A `MigrationRegistry` will be introduced in v2 to upgrade old schemas to newer formats.

---

## 2. Root Schema

```typescript
// libs/form-builder/src/lib/types/schema.ts

/**
 * The root document produced and consumed by the form builder/renderer.
 */
export interface FormSchema {
  /** Monotonically incrementing version string: "1", "2", ... */
  schemaVersion: string;

  /** UUID. Stable across edits. */
  id: string;

  /** Display title for the form (shown in builder header, optional in renderer). */
  title: string;

  /** Optional description, shown as a subtitle. */
  description?: string;

  /**
   * Render mode.
   * - 'form'   — standard single-page form (v1)
   * - 'wizard' — multi-step / multi-panel (v2+)
   * - 'pdf'    — read-only, printable layout (v2+)
   */
  display: 'form' | 'wizard' | 'pdf';

  /** Ordered top-level component nodes. */
  components: ComponentSchema[];

  /**
   * Arbitrary consumer metadata — the builder does not read this;
   * the consumer can store e.g. { formId, ownerId, tags }.
   */
  metadata?: Record<string, unknown>;

  /**
   * ISO-8601 timestamps managed by the builder.
   * The builder sets createdAt when the schema is first created
   * and updatedAt on every mutation.
   */
  createdAt: string;
  updatedAt: string;

  /** Form-level configuration. Controls renderer behaviour and builder display. */
  settings?: FormSettings;
}

/**
 * Form-level settings stored in the schema and consumed by the renderer.
 */
export interface FormSettings {
  /**
   * When to trigger client-side validation for all fields in this form.
   * Applies uniformly — there is no per-field `validateOn` override (TD-07, decided 2026-05-25).
   * Default: 'onBlur'
   */
  validateOn?: 'onBlur' | 'onChange' | 'onSubmit';

  /**
   * Maximum width of the rendered form (CSS value, e.g. '800px', '60ch').
   * Applied as `max-width` on the root `<form>` element.
   */
  maxWidth?: string;

  /**
   * Submit and Cancel buttons are ALWAYS rendered together in the form actions
   * bar at the bottom of the form. They cannot be removed by the form designer.
   * The form designer can add additional action buttons via ButtonComponentSchema,
   * but Submit and Cancel are built-in and always present.
   */

  /**
   * Submit button configuration.
   * Clicking submit triggers client-side validation then calls
   * FormDataService.onSubmit(data, schema).
   */
  submitButton?: {
    label?: string;   // default: 'Submit'
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';  // default: 'primary'
  };

  /**
   * Cancel button configuration.
   * Clicking cancel emits the `formCancel` output on FormRendererComponent.
   * The host application handles navigation (go back, close modal, etc.).
   * No data is submitted; form state is preserved.
   */
  cancelButton?: {
    label?: string;   // default: 'Cancel'
    variant?: 'secondary' | 'ghost' | 'link';  // default: 'secondary'
  };

  /**
   * Message shown in the renderer after a successful submission.
   * If successRedirectUrl is also set, the redirect takes priority.
   */
  successMessage?: string;

  /**
   * URL to navigate to after successful submission.
   * The renderer (or host app) handles the navigation.
   */
  successRedirectUrl?: string;
}
```

### 2.1 Empty / Default Schema

```typescript
export const EMPTY_FORM_SCHEMA: FormSchema = {
  schemaVersion: '1',
  id: crypto.randomUUID(),
  title: 'Untitled Form',
  display: 'form',
  components: [],
  settings: {
    validateOn: 'onBlur',
    maxWidth: '800px',
    submitButton: { label: 'Submit' },
    cancelButton: { label: 'Cancel' },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

---

## 3. Component Schemas (Discriminated Union)

All component schemas extend a common base and are discriminated by the `type` field.

```typescript
export type ComponentSchema =
  | InputComponentSchema
  | TextareaComponentSchema
  | SelectComponentSchema
  | DropdownComponentSchema
  | ComboboxComponentSchema
  | CheckboxComponentSchema
  | CheckboxGroupComponentSchema   // ⚠ full spec pending — see §3.2.5
  | RadioComponentSchema
  | RadioGroupComponentSchema       // ⚠ full spec pending — see §3.2.5
  | DateComponentSchema
  | HiddenComponentSchema
  | ContentComponentSchema
  | DividerComponentSchema
  | ButtonComponentSchema
  | LayoutComponentSchema;
  // Deferred to v2+:
  // | SubFormComponentSchema   — see §3.5.
  // | RatingComponentSchema    — see §3.2.8.
  // | SignatureComponentSchema — see §3.2.9.
```

### 3.1 Base Component Schema

All component schemas share:

```typescript
export interface BaseComponentSchema {
  /** UUID. Stable identifier. Never changes once assigned. */
  id: string;

  /**
   * Component type discriminator.
   * Must match exactly one ComponentDescriptor.type in the registry.
   */
  type: string;

  /**
   * Form field key. Used as the submission object key.
   * Must be unique within the form. camelCase convention.
   * e.g. 'firstName', 'contactEmail'
   *
   * Required for all field components (text-input, select, date, checkbox, etc.)
   * that contribute values to the submission payload.
   *
   * Optional for display-only and layout components (divider, content, panel,
   * columns, tabs, fieldset) — these do not appear in the submission payload.
   * The builder auto-generates a stable internal key from the component's `id`
   * for undo/redo tracking when `key` is omitted.
   */
  key?: string;

  /** Human-readable label displayed above the field. */
  label: string;

  /** Hidden from the UI but still present in the schema. */
  hidden?: boolean;

  /** Field is rendered but interaction is disabled. */
  disabled?: boolean;

  /**
   * Field is rendered and submits its value, but the user cannot interact with it.
   * Different from `disabled`: readOnly fields look like text, not greyed-out inputs.
   */
  readOnly?: boolean;

  /**
   * Locked by an administrator. The form designer cannot edit or move this field.
   * The renderer ignores this flag — it is a builder-only constraint.
   */
  locked?: boolean;

  /**
   * Position of the field label relative to the input.
   * 'top'    — label stacked above the input (default). Uses flexbox column layout.
   * 'left'   — label inline to the left of the input. Uses flexbox row layout.
   * 'hidden' — label visually hidden but still present in the accessibility tree.
   * Default: 'top'
   */
  labelPosition?: 'top' | 'left' | 'hidden';

  /**
   * Width of the label column when `labelPosition` is 'left'.
   * CSS value, e.g. '200px', '30%'. Default: '200px'.
   */
  labelWidth?: string;

  /**
   * Help text displayed below the field. Always visible (not a tooltip).
   * Use for: format hints, field requirements, contextual guidance.
   */
  description?: string;

  /**
   * CSS class names applied to the field wrapper on the rendered form.
   * The builder does not apply these; the renderer does.
   */
  className?: string;

  /** Tooltip text shown on hover (renderer responsibility). */
  tooltip?: string;

  /**
   * Validation rules applied to this field. Order matters — rules are evaluated left to right.
   * See [form-builder-validation.md](./form-builder-validation.md) §3 for the full `ValidationRule` type.
   * See [form-builder-custom-validators.md](./form-builder-custom-validators.md) for study-specific validators.
   * Note: there is no per-field `validateOn` — validation timing is set at form level only (TD-07).
   */
  validation?: ValidationRule[];

  /**
   * Conditional display rule.
   * When resolved to false, the component is hidden at runtime.
   * The builder shows all components regardless.
   */
  conditional?: ConditionalRule;

  /**
   * Arbitrary type-specific properties not covered by the typed fields.
   * Allows forward-compatibility for unrecognised descriptor extensions.
   */
  properties?: Record<string, unknown>;

  // ── Repeating control ──────────────────────────────────────────────────────

  /**
   * When true, the renderer wraps this field in a repeating shell.
   * The user sees one instance of the control plus an "Add" (+) button at the end.
   * Clicking "Add" appends a new instance of the same control beneath it.
   * The "Add" button always sits on the last instance.
   * Every instance except when there is only one shows a delete (×) button.
   * A single remaining instance cannot be deleted.
   *
   * Submission value becomes an array: { phoneNumbers: ['+44 700', '+44 701'] }
   * instead of a scalar: { phoneNumbers: '+44 700' }
   *
   * Not applicable to: layout components, hidden fields, dividers, content blocks.
   * See ComponentDescriptor.supportsRepeating.
   */
  isRepeating?: boolean;

  /**
   * Minimum number of instances when isRepeating = true.
   * The delete button is hidden when the current count equals minRepeat.
   * Default: 1
   */
  minRepeat?: number;

  /**
   * Maximum number of instances when isRepeating = true.
   * The "Add" (+) button is hidden when the current count reaches maxRepeat.
   * Default: unlimited
   */
  maxRepeat?: number;

  /**
   * Label for the add-instance (+) button when isRepeating = true.
   * Default: 'Add'
   */
  addLabel?: string;

  // ── Field-Level Encryption (FLE) ───────────────────────────────────────────

  /**
   * Field-level encryption (FLE) configuration.
   *
   * When set, the field value is encrypted at rest with AES-256-GCM using a
   * per-tenant data-encryption key (DEK) managed by the platform KMS service.
   * Full design: [field-level-encryption-clinical-edc.md](./field-level-encryption-clinical-edc.md)
   *
   * **Edit-check restriction (enforced at two layers):**
   * 1. Design time — the builder field picker greys out encrypted fields;
   *    they cannot be dropped into edit-check rule slots.
   * 2. Runtime — `buildEditCheckContext()` strips all encrypted fields from the
   *    JsonLogic evaluation context before the engine runs.
   *
   * **Versioning lock:** once any submission data exists for this field on the
   * current form version, `encryption.enabled` is immutable. The server sets
   * `encryption.lockedAt` on the first save. To change the setting, increment
   * the form version — old data keeps the old setting.
   *
   * Not applicable to layout / display-only components (they have no `key`
   * and produce no submission value).
   */
  encryption?: FieldEncryptionConfig;
}

/**
 * Configuration for field-level encryption.
 *
 * Stored in `BaseComponentSchema.encryption`.
 * Evaluated by the server on save and read; the client never touches raw keys.
 */
export interface FieldEncryptionConfig {
  /**
   * Whether this field's value is encrypted at rest.
   * Default: false
   *
   * Once any submission exists for this field+formVersion, this flag is locked
   * by the server (see `lockedAt`). Changing it requires a new form version.
   */
  enabled: boolean;

  /**
   * ISO-8601 timestamp set by the server when the first submission for this
   * field+formVersion is persisted. After this point, `enabled` is immutable.
   * Null until the first save.
   *
   * This field is read-only — never set by the form builder.
   */
  lockedAt?: string | null;

  /**
   * Algorithm used for encryption.
   * Only 'AES-256-GCM' is supported in v1.
   * Stored in the schema so future algorithm changes are schema-versioned.
   */
  algorithm?: 'AES-256-GCM';

  /**
   * Which roles are allowed to decrypt and see the plaintext value.
   * Roles not in this list see '[encrypted]' in the renderer.
   *
   * Checked server-side on every read. The renderer never receives plaintext
   * for roles that are not authorised.
   *
   * If omitted, the platform default decryption ACL applies (Study Admin +
   * Data Manager have access; Site Staff and Investigators do not).
   */
  authorisedRoles?: ('STUDY_ADMIN' | 'DATA_MANAGER' | 'SITE_STAFF' | 'INVESTIGATOR' | 'AUDITOR')[];
}
```

---

### 3.2 Input Components

#### 3.2.1 Text Input

```typescript
export interface InputComponentSchema extends BaseComponentSchema {
  type: 'text-input' | 'email' | 'password' | 'tel' | 'url' | 'number';
  placeholder?: string;
  defaultValue?: string | number;
  prefix?: string;        // text/icon before the input
  suffix?: string;        // text/icon after the input
  /**
   * @deprecated Use isRepeating (on BaseComponentSchema) instead.
   * multiple was an early draft concept for a tag-input style multi-value.
   * isRepeating is the canonical approach: full control instances, each with their
   * own label, error state, and delete button.
   */
  // multiple?: boolean;
  autocomplete?: string;  // HTML autocomplete token e.g. 'email', 'given-name'
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'url' | 'search';

  // ── Number constraints (only meaningful when type === 'number') ───────────

  /**
   * Minimum allowed value. Reflected as the native `min` attribute on <input>.
   * The renderer enforces this via the `min` validation rule automatically
   * when this field is present — no need to duplicate in `validation.rules`.
   */
  min?: number;

  /**
   * Maximum allowed value. Reflected as the native `max` attribute on <input>.
   * The renderer enforces this via the `max` validation rule automatically.
   */
  max?: number;

  /**
   * Legal number intervals. Reflected as the native `step` attribute on <input>.
   * Use 'any' to allow any decimal. Default: 1.
   * e.g. step: 0.01 for currency, step: 5 for increments of 5.
   */
  step?: number | 'any';

  // ── Input mask ─────────────────────────────────────────────────────────────

  /**
   * Visual input mask applied by the <vi-input> web component.
   * Formats user input as they type — cursor management, auto-insertion,
   * and rejection of invalid characters are all handled by vi-input.
   *
   * Mask syntax (iMask-compatible):
   *   0        — any digit
   *   a        — any letter
   *   *        — any alphanumeric character
   *   { }      — fixed (non-editable) characters inside braces
   *   [ ]      — optional block
   *   Literal characters (spaces, hyphens, parens) are inserted automatically.
   *
   * Examples:
   *   '+{44} (000) 000-0000'     → UK phone: +44 (020) 7946-0000
   *   '00/00/0000'               → date: 31/12/2025
   *   'AA-000000'                → protocol ID: AB-123456
   *   '000[ 000][ 000]'          → optional segments
   *
   * NOTE: Requires <vi-input> web component to implement mask support.
   * A decision is needed on the mask engine:
   *   Option A — Bundle iMask (~15 KB) inside vi-input.
   *   Option B — Lightweight custom mask engine built into vi-input.
   * Until implemented, the mask field is parsed by the builder but ignored
   * by the renderer (input behaves as unmasked).
   *
   * Not applicable to: type === 'number' (use min/max/step instead).
   */
  mask?: string;
}
```

Maps to `<vi-input>` on the canvas and renderer.

#### 3.2.2 Textarea

```typescript
export interface TextareaComponentSchema extends BaseComponentSchema {
  type: 'textarea';
  placeholder?: string;
  defaultValue?: string;
  rows?: number;          // default: 3
  maxRows?: number;       // for auto-resize; renderer enforces
  resizable?: 'none' | 'vertical' | 'both'; // default: 'vertical'
  wysiwyg?: boolean;      // v2+: render a rich text editor
}
```

#### 3.2.3 Select, Dropdown, and Combobox

> ⚠️ **Pending design items — MUST be resolved before implementation begins:**
> - **Multilingual**: The entire study platform will be multilingual. The `CodelistItem.value` (display label) must be locale-aware. Design TBD — likely server returns locale-appropriate label via `Accept-Language` header in v1, with richer client-side switching later. **Do not start implementation until this is designed.**
> - **Versioning**: Codelist versioning is part of a larger, platform-wide versioning strategy (study design + data entry). A `version` pin field is reserved in `CodelistOptionSource` but the full versioning design is pending. **Do not start implementation until the versioning architecture is signed off.**
> - **Extensible codelists**: Some codelists will be sponsor-extensible (add custom items to a standard list). Requires a clever API-side design. Noted for future design.
> - **"Other, specify"**: The pattern `[Select value] + [free-text input when 'Other' selected]` is common in clinical trials. Applicable to select, dropdown, radio-group. Requires careful design in the context of dynamic forms (conditional field visibility). Pending.
> - **MedDRA / WHODrug**: Medical coding dictionaries for adverse events and medications. These are hierarchical (not flat codelists) and require a completely separate architecture. **Out of scope for this codelist design.**
> - **GraphQL transport**: Parallel REST GETs are the v1 approach. GraphQL as a future transport option for fetching multiple codelists in one typed query is worth evaluating for v2+.

Three distinct controls — plus **radio-group** and **checkbox-group** — share a common **`OptionSource`** interface. All are form-associated Lit CEs; the Angular `vi-renderer-*` wrapper resolves options (static or codelist) and passes a resolved `CodelistItem[]` to the Lit element. The Lit CE never handles fetching.

---

##### Option Source (shared across select / dropdown / combobox / radio-group / checkbox-group)

```typescript
// libs/form-builder/src/lib/types/option-source.ts

export type OptionSource = StaticOptionSource | CodelistOptionSource;

export interface StaticOptionSource {
  kind: 'static';
  /** Inline options defined at design time. Good for small, stable lists (Yes/No, severity grades). */
  options: CodelistItem[];
}

export interface CodelistOptionSource {
  kind: 'codelist';

  /**
   * The name of the codelist as registered in the global codelist library.
   * e.g. 'SEX', 'RACE', 'ETHNIC', 'ADVERSE_EVENT_SEVERITY', 'COUNTRIES'
   *
   * The renderer fetches GET {CODELIST_CONFIG.endpoint}/{name} at form load time.
   * All codelists needed by a form are fetched in parallel before rendering begins.
   */
  name: string;

  /**
   * Optional: pin to a specific codelist version for audit-trail replay.
   * If omitted, the latest published version is used.
   *
   * NOTE: Full versioning architecture is pending platform-wide design.
   * This field is reserved; ignore in v1 implementation.
   */
  version?: string;
}
```

##### `CodelistItem` — the universal option type

Used for both static options and items returned by the codelist API.

```typescript
export interface CodelistItem {
  /**
   * Submission code.
   * This is the value stored in the database and included in the submission payload.
   * In CDISC terms: the Coded Value / Submission Value.
   * e.g. 'M', 'F', 'UNDIFFERENTIATED' for the SEX codelist.
   */
  key: string;

  /**
   * Display label shown to the data entry operator.
   * In CDISC terms: the Decoded Value / NCI Preferred Term.
   * e.g. 'Male', 'Female', 'Undifferentiated'.
   *
   * NOTE: This field will be locale-aware in a future multilingual design.
   * In v1, the server returns the appropriate locale label via Accept-Language.
   */
  value: string;

  /**
   * Optional extra metadata. ONLY accessible inside option templates — never stored,
   * never submitted. Use for template display only.
   * e.g. { nciCode: 'C20197', synonyms: ['Male sex'], ordering: 1 }
   */
  data?: unknown;

  /** When true, item is shown but cannot be selected. */
  disabled?: boolean;

  /** Groups items under a section header (optgroup-style). */
  group?: string;
}
```

> **Submission semantics:** Only `key` is persisted and submitted. The display `value` is resolved at render time from the codelist. This means the stored data remains valid even if a label is later corrected — only the key is canonical.

---

##### `SelectComponentSchema` — maps to `<vi-select>`

A standard accessible listbox (single or multi). No search. Clean, compact.

```typescript
export interface SelectComponentSchema extends BaseComponentSchema {
  type: 'select';
  placeholder?: string;
  defaultValue?: string | number | boolean | Array<string | number | boolean>;

  /** When true, multiple options can be selected. Submission value is an array. */
  multiple?: boolean;

  /** When true, a clear (×) button appears to reset the selection. */
  clearable?: boolean;

  /**
   * How options are provided: static array or remote codelist.
   * Use StaticOptionSource for design-time known options.
   * Use CodelistOptionSource for backend-driven, dynamic lists.
   */
  optionSource: OptionSource;

  /** Option display template. See OptionTemplateSchema. Default: text-only label. */
  optionTemplate?: OptionTemplateSchema;
}
```

Maps to `<vi-select>` (Lit CE). Rendered by `vi-renderer-select` (Angular wrapper).

---

##### `DropdownComponentSchema` — maps to `<vi-dropdown>`

A trigger-button dropdown panel. Designed for **rich option display** — icons, badges, secondary text. Does not support native keyboard typeahead (use Combobox for that). Good for action menus and curated choice lists.

```typescript
export interface DropdownComponentSchema extends BaseComponentSchema {
  type: 'dropdown';
  placeholder?: string;
  defaultValue?: string | number | boolean;

  /** When true, multiple options can be selected. Trigger shows a count badge. */
  multiple?: boolean;

  /** When true, a clear (×) button appears. */
  clearable?: boolean;

  /** Trigger button appearance. Default: 'outline'. */
  triggerVariant?: 'outline' | 'solid' | 'ghost';

  /** Max height of the open panel in CSS. Default: '300px'. */
  panelMaxHeight?: string;

  /** How options are provided. */
  optionSource: OptionSource;

  /** Rich option template. When set, each option renders using this template. */
  optionTemplate?: OptionTemplateSchema;

  /**
   * Template used for the trigger button label when a value is selected.
   * Defaults to the selected item's display value.
   * e.g. "{{data.flag}} {{value}}" to show a flag emoji + country name in the trigger.
   */
  selectedTemplate?: OptionTemplateSchema;
}
```

Maps to `<vi-dropdown>` (Lit CE). Rendered by `vi-renderer-dropdown` (Angular wrapper).

---

##### `ComboboxComponentSchema` — maps to `<vi-combobox>`

A searchable select with type-ahead filtering. Supports creating new values not in the list. Ideal for large codelists (hundreds of options).

```typescript
export interface ComboboxComponentSchema extends BaseComponentSchema {
  type: 'combobox';
  placeholder?: string;
  defaultValue?: string | number | boolean | Array<string | number | boolean>;

  /** When true, multiple values can be selected (tag/chip UI). */
  multiple?: boolean;

  /** When true, a clear (×) button appears. */
  clearable?: boolean;

  /**
   * When true, the user can type a value not in the list and submit it.
   * The submitted value is the raw typed string.
   * Submission shape: either an existing CodelistItem.key or the raw typed string.
   *
   * NOTE: "Other, specify" pattern (select 'OTHER' key → free-text sibling appears)
   * is a common clinical trial pattern distinct from allowCreate. Pending design.
   */
  allowCreate?: boolean;

  /**
   * Debounce in ms before filtering on user input. Default: 300.
   */
  searchDebounce?: number;

  /** Minimum characters before search fires. Default: 0 (immediate). */
  minSearchLength?: number;

  /** How options are provided. */
  optionSource: OptionSource;

  /** Rich option template. */
  optionTemplate?: OptionTemplateSchema;
}
```

Maps to `<vi-combobox>` (Lit CE). Rendered by `vi-renderer-combobox` (Angular wrapper).

---

##### `OptionTemplateSchema` _(v1: string interpolation; v2: visual JSON tree)_

Controls how each option is rendered inside the list panel and (for Dropdown) the trigger button.

**v1 — string template with safe interpolation:**

```typescript
export type OptionTemplateSchema =
  | StringOptionTemplate
  | NodeOptionTemplate;   // v2+

export interface StringOptionTemplate {
  kind: 'string';
  /**
   * Template string with {{ }} interpolation.
   * Available variables: key, value, data.*
   * Available pipes (whitelist — no eval): number, currency, date, truncate, uppercase,
   *   lowercase, titlecase.
   *
   * Examples:
   *   "{{data.flag}} {{value}}"                    → "🇬🇧 United Kingdom"
   *   "{{value}} ({{data.dialCode}})"              → "United Kingdom (+44)"
   *   "{{value}} · {{data.population | number}}"  → "United Kingdom · 67,000,000"
   */
  template: string;
}
```

**v2+ — visual JSON node tree _(deferred, requires WYSIWYG builder design)_:**

```typescript
export interface NodeOptionTemplate {
  kind: 'node';
  /**
   * Root node of the option template tree.
   * Interpreted at runtime by OptionTemplateRendererComponent — no eval, no innerHTML.
   * The node tree is built visually in the form builder properties panel:
   *   ① Available data fields (label, value, extra.*) shown as draggable tokens
   *   ② Layout canvas with flex/stack containers
   *   ③ Primitive nodes: text, icon, badge, avatar, spacer
   *   ④ Result is serialised to this JSON tree and stored in schema
   *
   * Research required: auto-discovery of extra.* fields by making a probe fetch
   * of the codelist and extracting all top-level keys — presented as draggable tokens.
   */
  root: OptionTemplateNode;
}

export type OptionTemplateNode =
  | { type: 'flex'; direction?: 'row' | 'column'; gap?: 'xs' | 'sm' | 'md'; align?: 'start' | 'center'; children: OptionTemplateNode[] }
  | { type: 'text';   bind: string; pipe?: string; style?: 'body' | 'caption' | 'bold' | 'muted' }
  | { type: 'icon';   bind?: string; name?: string }          // bind=field path | name=literal icon
  | { type: 'badge';  bind: string; colorMap?: Record<string, string>; variant?: 'solid' | 'outline' }
  | { type: 'avatar'; bind: string; fallback?: string }       // bind = image URL field
  | { type: 'spacer' };
```

> **Design constraint:** The `NodeOptionTemplate` WYSIWYG builder is a significant UX research item. The visual editor must discover available data fields from the codelist's response shape (via a probe fetch), present them as draggable tokens, and let the designer compose a template without writing code. This is deferred to v2+ pending that design research.

#### 3.2.4 Checkbox

```typescript
export interface CheckboxComponentSchema extends BaseComponentSchema {
  type: 'checkbox';
  defaultValue?: boolean;
  checkedValue?: unknown;    // value when checked (default: true)
  uncheckedValue?: unknown;  // value when unchecked (default: false)
}
```

#### 3.2.5 Checkbox Group

A set of checkboxes under a single field key. Produces an array of **keys**. Supports both static options and codelists.

```typescript
export interface CheckboxGroupComponentSchema extends BaseComponentSchema {
  type: 'checkbox-group';

  /** Options: static inline array or codelist reference. */
  optionSource: OptionSource;

  /** Pre-selected keys. */
  defaultValue?: string[];

  /** Render checkboxes horizontally. */
  inline?: boolean;

  /** Minimum number of checkboxes that must be selected. */
  minSelected?: number;

  /** Maximum number of checkboxes that can be selected. */
  maxSelected?: number;
}
```

Submission value: `{ race: ['WHITE', 'ASIAN'] }` (array of `CodelistItem.key`).

#### 3.2.6 Radio Group and Radio Group (codelist)

> ⚠️ `RadioGroupComponentSchema` is **pending full spec**. Stub shown below.

A radio-button group under a single field key. Produces a single **key**. Supports both static options and codelists.

This is the primary control for single-select CDISC-coded fields (SEX, YES/NO, ACN, etc.) in clinical CRFs.

```typescript
export interface RadioGroupComponentSchema extends BaseComponentSchema {
  type: 'radio-group';

  /** Options: static inline array or codelist reference. */
  optionSource: OptionSource;

  /** Pre-selected key. */
  defaultValue?: string;

  /** Render radio buttons horizontally. */
  inline?: boolean;
}
```

Submission value: `{ sex: 'M' }` (single `CodelistItem.key`).

> `RadioComponentSchema` (the earlier single-radio stub, `type: 'radio'`) is superseded by `RadioGroupComponentSchema`. The two will be reconciled during full spec.

#### 3.2.7 Date / Time

Maps to `<vi-date-picker>` (to be built in `libs/web-components`).

```typescript
export interface DateComponentSchema extends BaseComponentSchema {
  type: 'date' | 'time' | 'datetime-local';
  defaultValue?: string;     // ISO-8601: '2025-01-15', '14:30', '2025-01-15T14:30'
  minDate?: string;          // ISO-8601 date string
  maxDate?: string;          // ISO-8601 date string
  format?: string;           // display format hint e.g. 'DD/MM/YYYY' (renderer)
  disabledDates?: string[];  // specific dates to exclude (ISO-8601)
}
```

> **Dependency:** `DateComponentSchema` requires `<vi-date-picker>` web component to be built first. This is a Phase 0 dependency before date fields can render on canvas.

#### 3.2.8 Rating _(v2+ deferred)_

> ⚠️ **Status:** v2+. Requires `<vi-rating>` web component to be built in `libs/web-components`.

A numeric rating control. Used for pain scales (NRS 0–10), satisfaction scores, or star ratings. The visual variant and range are configurable by the form designer.

```typescript
export interface RatingComponentSchema extends BaseComponentSchema {
  type: 'rating';

  /**
   * Visual presentation.
   * - 'stars'  — clickable star icons (good for 1–5 or 1–10 ranges).
   * - 'slider' — horizontal drag slider (good for continuous NRS scales, e.g. 0–100).
   * Default: 'stars'.
   */
  variant?: 'stars' | 'slider';

  /** Minimum value (inclusive). Default: 0. */
  min?: number;

  /** Maximum value (inclusive). Default: 10. */
  max?: number;

  /**
   * Step between selectable values.
   * Use 0.5 for half-stars; 1 (default) for whole numbers.
   * Only meaningful when variant is 'stars'.
   */
  step?: number;

  /** Pre-selected value. */
  defaultValue?: number;

  /** Label shown at the minimum end of the scale. e.g. 'No pain'. */
  minLabel?: string;

  /** Label shown at the maximum end of the scale. e.g. 'Worst pain imaginable'. */
  maxLabel?: string;
}
```

Submission value: `{ painScore: 7 }` — a single number.

#### 3.2.9 Signature _(v2+ deferred)_

> ⚠️ **Status:** v2+. Requires `<vi-signature>` web component to be built in `libs/web-components`.

A freehand electronic signature capture canvas. Used in consent forms, clinical trials, and legal documents.

```typescript
export interface SignatureComponentSchema extends BaseComponentSchema {
  type: 'signature';

  /**
   * Output format stored in the submission payload.
   * - 'svg'  — SVG string (vector; compact, scalable, ideal for audit trail display). Default.
   * - 'png'  — PNG as base64 data URI (raster; useful for legacy PDF pipelines).
   * The format is configurable per-field so different forms can use different outputs.
   */
  outputFormat?: 'svg' | 'png';

  /** Canvas width in pixels. Default: 400. */
  width?: number;

  /** Canvas height in pixels. Default: 200. */
  height?: number;

  /** Pen stroke color (CSS color string). Default: '#000000'. */
  penColor?: string;

  /** Pen stroke width in pixels. Default: 2. */
  penWidth?: number;
}
```

Submission value:
- `outputFormat: 'svg'` → `{ consentSignature: '<svg>...</svg>' }` — inline SVG string.
- `outputFormat: 'png'` → `{ consentSignature: 'data:image/png;base64,...' }` — base64 data URI.

**`<vi-signature>` Web Component Requirements:**

The Lit 3 web component must:
- Render a `<canvas>` element for freehand drawing.
- Support pointer events: **mouse** (desktop), **touch** (tablet/finger), **stylus/pen** (tablet with active pen).
- Expose a `clear()` method and render a built-in clear button (stylable via `::part(clear-button)`).
- Expose an `isEmpty` boolean property — `true` when the canvas is blank (all pixels transparent).
- Be form-associated (`static formAssociated = true`) — `attachInternals().setFormValue()` on stroke end.
- Fire `vi-signature-change` custom event on stroke completion: `{ value: string, format: 'svg' | 'png', isEmpty: boolean }`.
- CSS custom properties: `--vi-signature-canvas-bg`, `--vi-signature-stroke-color`, `--vi-signature-stroke-width`.
- CSS parts: `container`, `canvas`, `clear-button`.

> **⚠️ 21 CFR Part 11 note:** Freehand canvas capture is an **ink artefact**, not a legally compliant electronic signature under 21 CFR §11.50. Compliance (signer attribution, attestation meaning, timestamp) is an application-layer Phase 3 concern — not a web component responsibility.

> **📱 Device support (Phase 3 discussion pending):** Full device matrix to be confirmed: iPad + Apple Pencil pressure sensitivity, Wacom signature-pad hardware via Pointer Events API, capacitive touchscreen behaviour on Windows tablets, high-DPI canvas rendering (`devicePixelRatio` scaling).

---

### 3.3 Display-Only Components

These components carry no field value and do not appear in the submission payload.

#### 3.3.1 Hidden Field

Invisible data carrier. Value is always included in submission.

```typescript
export interface HiddenComponentSchema extends BaseComponentSchema {
  type: 'hidden';
  defaultValue: string | number | boolean;  // required — hidden fields always have a value
}
```

Use cases: `formId`, `sourceRef`, `csrfToken` (where the renderer handles token injection), `referrerCode`.

#### 3.3.2 Content / HTML Block

Static display content. No user input; not in submission payload.

```typescript
export interface ContentComponentSchema extends BaseComponentSchema {
  type: 'content';
  /**
   * HTML content string. The renderer sanitises this (DOMPurify) before inserting.
   * Supports: <p>, <strong>, <em>, <ul>, <ol>, <li>, <a>, <img>, <br>, <h2>–<h6>.
   * Tags not in the allowlist are stripped.
   */
  content: string;
}
```

> **Security:** Content is sanitised with DOMPurify before `innerHTML` insertion. Never trust raw schema content.

#### 3.3.3 Divider

A visual separator (`<hr>`). No value, not in submission.

```typescript
export interface DividerComponentSchema extends BaseComponentSchema {
  type: 'divider';
  style?: 'solid' | 'dashed' | 'dotted';  // default: 'solid'
}
```

---

### 3.3 Button Components

```typescript
export interface ButtonComponentSchema extends BaseComponentSchema {
  type: 'button' | 'submit' | 'reset';
  /**
   * Action triggered when the button is clicked.
   * - 'submit'    — validates and submits the form (calls FormDataService.onSubmit).
   * - 'reset'     — resets all field values to their defaultValue.
   * - 'custom'    — emits a `formAction` output event with `customAction` as the key;
   *                 the host application handles the event.
   * - 'saveState' — saves a draft of the current form state using @vi/state-fp.
   *                 Reserved — implementation deferred. Storage strategy (session,
   *                 localStorage, or server-side via FORM_DATA_SERVICE) TBD.
   */
  action: 'submit' | 'reset' | 'custom' | 'saveState';
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;            // full-width
  disableOnInvalid?: boolean; // greys out until form is valid
  leftIcon?: string;          // icon name from @vialiq/icons
  rightIcon?: string;
  customAction?: string;      // event key emitted when action = 'custom'
}
```

Maps to `<vi-button>` on the canvas and renderer.

---

### 3.4 Layout Components

Layout components are the key to recursive nesting. They carry a `components: ComponentSchema[]` array and type-specific configuration.

```typescript
export interface LayoutComponentSchema extends BaseComponentSchema {
  type: LayoutType;
  components: ComponentSchema[];   // RECURSIVE — children of this container
  layoutConfig: LayoutConfig;
}

export type LayoutType = 'panel' | 'columns' | 'tabs' | 'fieldset' | 'repeater';

export type LayoutConfig =
  | PanelConfig
  | ColumnsConfig
  | TabsConfig
  | FieldsetConfig
  | RepeaterConfig;
```

#### 3.4.1 Panel

A collapsible/expandable section with a title bar.

```typescript
export interface PanelConfig {
  kind: 'panel';
  collapsible?: boolean;   // can the user collapse it?
  collapsed?: boolean;     // initial state
  theme?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger';
}
```

#### 3.4.2 Columns

A CSS grid-based multi-column layout. The container tracks which column each child belongs to via an explicit assignment map.

```typescript
export interface ColumnsConfig {
  kind: 'columns';
  /** Number of columns. Default: 2. Max: 12. */
  columnCount: number;
  /** Column widths as fractions. Must sum to columnCount. Default: equal widths. */
  columnWidths?: number[];   // e.g. [2, 1] for a 2/3 + 1/3 split in a 3-col layout
  gap?: 'xs' | 'sm' | 'md' | 'lg';

  /**
   * Maps child component node IDs to their column index (0-based).
   * Authoritative source for column assignment — stored on the CONTAINER, not the child.
   * Example: { 'uuid-of-firstName': 0, 'uuid-of-lastName': 1 }
   */
  columnAssignments: Record<string, number>;
}
```

> **Design note:** `columnAssignments` lives on the container, not on each child's `properties`. This is typed, queryable, and avoids silent corruption when children are moved in/out of columns. The `DndService.onCanvasMove` updates `columnAssignments` when a child is dropped.

#### 3.4.3 Tabs

```typescript
export interface TabsConfig {
  kind: 'tabs';
  tabs: TabDefinition[];

  /**
   * Maps child component node IDs to their tab ID.
   * Authoritative source for tab assignment — stored on the CONTAINER, not the child.
   * Example: { 'uuid-of-firstName': 'tab-personal', 'uuid-of-email': 'tab-contact' }
   */
  tabAssignments: Record<string, string>;
}

export interface TabDefinition {
  id: string;
  label: string;
  icon?: string;  // optional icon from @vialiq/icons
}
```

> **Design note:** `tabAssignments` lives on the container (same pattern as `columnAssignments`). When a child is dragged to a different tab, `tabAssignments` is updated on the Tabs container — the child schema itself is unchanged.

#### 3.4.4 Fieldset

Semantic HTML `<fieldset>` with optional `<legend>`.

```typescript
export interface FieldsetConfig {
  kind: 'fieldset';
  legend?: string;
  bordered?: boolean;
}
```

#### 3.4.5 Repeater

A dynamic list: renders its `components[]` template N times and the user can add/remove rows.

```typescript
export interface RepeaterConfig {
  kind: 'repeater';
  addLabel?: string;        // label for the "Add row" button; default: 'Add'
  removeLabel?: string;     // label for the "Remove" button; default: 'Remove'
  minRows?: number;         // minimum number of rows; default: 1
  maxRows?: number;         // maximum number of rows; no max by default
  /** Template components — the repeater replicates these for each row. */
  // stored in LayoutComponentSchema.components[]
}
```

---

### 3.5 Sub-Form / Composite Group _(deferred — v2+)_

> **Status:** Planned for v2+. Not in the v1 `ComponentSchema` union. The spec below describes the intended design for when it is implemented.
>

```typescript
export interface SubFormComponentSchema extends BaseComponentSchema {
  type: 'sub-form';

  /**
   * Key acts as the namespace prefix for all child field keys at submission time.
   * E.g. key='shippingAddress', sub-form fields 'street'/'city'/'postcode' →
   *   submission: { shippingAddress: { street: '...', city: '...', postcode: '...' } }
   */
  key: string;

  /**
   * Reference to a saved FormSchema by its stable ID.
   * Resolved at runtime in both builder preview and renderer via FORM_CATALOG_SERVICE.
   * Mutually exclusive with `subFormSchema`.
   */
  subFormId?: string;

  /**
   * Inline embedded FormSchema.
   * Use for self-contained sections not separately catalogued, or for export/import.
   * Mutually exclusive with `subFormId`.
   * NOTE: inline schemas bypass FORM_CATALOG_SERVICE — the schema is embedded verbatim.
   */
  subFormSchema?: FormSchema;

  /** Denormalised display title of the referenced sub-form (for builder display; not rendered). */
  subFormTitle?: string;

  /** Whether to render the sub-form's title as a visible section heading. Default: true. */
  showTitle?: boolean;

  /** Whether to draw a border/card around the sub-form group. Default: false. */
  bordered?: boolean;
}
```

**Key design decisions:**
- `key` is the namespace — all child submission values are nested under it. There is no key-flattening option; namespacing is always enforced.
- The renderer renders `vi-renderer-subform`, an Angular component that creates a scoped child `FieldStateService` with the key prefix. The sub-form fields render but there is no `<form>` tag, no submit button, and no top-level error summary — those belong to the parent.
- Conditional rules inside a sub-form may only reference fields within the same sub-form scope. Cross-sub-form conditionals are not supported in v1.
- A sub-form may not contain another `sub-form` in v1 (no recursive nesting). This restriction can be lifted in v2.

**Builder UX:** the sub-form component in the palette opens a search/pick dialog (powered by `FORM_CATALOG_SERVICE.searchForms()`) to choose a saved form. Once selected, the canvas shows a collapsed placeholder with the sub-form title and field count. The actual fields are not editable in the parent builder — they are governed by the source sub-form's own builder session.

---

## 4. Validation Rules

> **Update (TD-07, 2026-05-29):** The previous `ValidationSchema` wrapper interface (with `rules: RuleDescriptor[]` and `messages`) has been superseded. `BaseComponentSchema.validation` is now typed directly as `ValidationRule[]`. Per-rule message overrides are specified inline on each rule object. The `ValidationSchema` interface is removed.

The authoritative `ValidationRule` type definition and the rule engine specification live in [form-builder-validation.md](./form-builder-validation.md).

For study-specific custom validators, see [form-builder-custom-validators.md](./form-builder-custom-validators.md).

**Example — inline rule array:**

```json
{
  "validation": [
    { "type": "required", "message": "First name is required" },
    { "type": "minLength", "value": 2 }
  ]
}
```

---

## 5. Conditional Rules

Conditional rules control component visibility at runtime. The builder shows all components regardless; the renderer evaluates conditionals.

```typescript
export type ConditionalRule = SimpleConditional | JsonLogicConditional;

/**
 * Simple conditional: show/hide based on another field's value.
 * Equivalent to FormIO's "Simple Conditional".
 */
export interface SimpleConditional {
  kind: 'simple';
  /** Show the component when this condition is true. Hide otherwise. Default: true. */
  show: boolean;
  /** The `key` of another field in the form whose value drives the condition. */
  when: string;
  /** The value that `when` field must equal for `show` to apply. */
  eq: string | number | boolean | null;
}

/**
 * JSON Logic conditional: arbitrary boolean logic using JSON Logic spec.
 * See https://jsonlogic.com/
 * Variables reference other field keys: { "var": "fieldKey" }
 */
export interface JsonLogicConditional {
  kind: 'json-logic';
  /** JSON Logic expression. Must resolve to boolean. */
  logic: Record<string, unknown>;
}
```

### Example: Show a field only when `contactMethod === 'email'`

```json
{
  "conditional": {
    "kind": "simple",
    "show": true,
    "when": "contactMethod",
    "eq": "email"
  }
}
```

---

## 6. Settings Schema (Meta-Schema for Properties Panel)

The properties panel is config-driven. Each `ComponentDescriptor` ships a `SettingsSchema` that declares what tabs and fields to render in the properties panel.

```typescript
// libs/form-builder/src/lib/types/component-descriptor.ts

export interface SettingsSchema {
  tabs: SettingsTab[];
}

export interface SettingsTab {
  id: string;
  label: string;
  /** Order of fields within the tab. */
  fields: SettingsField[];
}

export type SettingsField =
  | TextSettingsField
  | NumberSettingsField
  | TextareaSettingsField
  | CheckboxSettingsField
  | SelectSettingsField
  | ColorSettingsField
  | RulesSettingsField       // special: renders the validation rule editor
  | ConditionalSettingsField // special: renders the conditional rule editor
  | SeparatorSettingsField   // visual: a horizontal rule with an optional label
  | GroupSettingsField;      // collapsible group of fields

export interface BaseSettingsField {
  /** Maps to the path within ComponentSchema, using dot notation for nested. */
  key: string;

  /** Label shown in the properties panel. */
  label: string;

  /** Secondary explanatory text shown below the field. */
  description?: string;

  /** Default value applied to the schema when the component is first dropped. */
  defaultValue?: unknown;

  /**
   * Whether this field is required in the settings panel.
   * (Does NOT affect form validation — that's a different concern.)
   */
  required?: boolean;
}

export interface TextSettingsField extends BaseSettingsField {
  type: 'text';
  placeholder?: string;
}

export interface NumberSettingsField extends BaseSettingsField {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

export interface TextareaSettingsField extends BaseSettingsField {
  type: 'textarea';
  rows?: number;
}

export interface CheckboxSettingsField extends BaseSettingsField {
  type: 'checkbox';
}

export interface SelectSettingsField extends BaseSettingsField {
  type: 'select';
  options: Array<{ label: string; value: string | number | boolean }>;
  multiple?: boolean;
}

export interface ColorSettingsField extends BaseSettingsField {
  type: 'color';
}

export interface RulesSettingsField extends BaseSettingsField {
  type: 'validation-rules';
  // No extra config; the settings renderer mounts the full ValidationRulesEditorComponent
}

export interface ConditionalSettingsField extends BaseSettingsField {
  type: 'conditional';
  // No extra config; the settings renderer mounts the ConditionalEditorComponent
}

export interface SeparatorSettingsField {
  type: 'separator';
  label?: string;
}

export interface GroupSettingsField {
  type: 'group';
  label: string;
  collapsible?: boolean;
  collapsed?: boolean;
  fields: SettingsField[];
}
```

### Example: Settings Schema for `text-input`

```typescript
export const TEXT_INPUT_SETTINGS_SCHEMA: SettingsSchema = {
  tabs: [
    {
      id: 'display',
      label: 'Display',
      fields: [
        { type: 'text',     key: 'label',       label: 'Label',       required: true, defaultValue: 'Text Field' },
        { type: 'text',     key: 'key',         label: 'Property Name', required: true },
        { type: 'text',     key: 'placeholder', label: 'Placeholder' },
        { type: 'text',     key: 'tooltip',     label: 'Tooltip' },
        { type: 'checkbox', key: 'hidden',      label: 'Hidden'     },
        { type: 'checkbox', key: 'disabled',    label: 'Disabled'   },
        { type: 'text',     key: 'prefix',      label: 'Prefix'     },
        { type: 'text',     key: 'suffix',      label: 'Suffix'     },
      ]
    },
    {
      id: 'validation',
      label: 'Validation',
      fields: [
        { type: 'validation-rules', key: 'validation', label: 'Validation Rules' }
      ]
    },
    {
      id: 'conditional',
      label: 'Conditional',
      fields: [
        { type: 'conditional', key: 'conditional', label: 'Conditional Logic' }
      ]
    },
    {
      id: 'data',
      label: 'Data',
      fields: [
        { type: 'text',     key: 'defaultValue',  label: 'Default Value' },
        { type: 'checkbox', key: 'multiple',      label: 'Multiple Values' },
        { type: 'text',     key: 'autocomplete',  label: 'Autocomplete Token' },
      ]
    }
  ]
};
```

---

## 7. Complete Example Schema

```json
{
  "schemaVersion": "1",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Contact Us",
  "description": "Send us a message and we'll get back to you.",
  "display": "form",
  "createdAt": "2026-05-21T10:00:00.000Z",
  "updatedAt": "2026-05-21T11:30:00.000Z",
  "components": [
    {
      "id": "a1b2c3d4-0001",
      "type": "columns",
      "key": "nameRow",
      "label": "Name Row",
      "hidden": false,
      "layoutConfig": {
        "kind": "columns",
        "columnCount": 2,
        "gap": "md",
        "columnAssignments": {
          "a1b2c3d4-0002": 0,
          "a1b2c3d4-0003": 1
        }
      },
      "components": [
        {
          "id": "a1b2c3d4-0002",
          "type": "text-input",
          "key": "firstName",
          "label": "First Name",
          "placeholder": "e.g. Jane",
          "validation": [
            { "type": "required", "message": "First name is required" },
            { "type": "minLength", "value": 2 }
          ]
        },
        {
          "id": "a1b2c3d4-0003",
          "type": "text-input",
          "key": "lastName",
          "label": "Last Name",
          "placeholder": "e.g. Smith",
          "validation": [
            { "type": "required" }
          ]
        }
      ]
    },
    {
      "id": "a1b2c3d4-0004",
      "type": "email",
      "key": "email",
      "label": "Email Address",
      "placeholder": "you@example.com",
      "validation": [
        { "type": "required" },
        { "type": "email", "message": "Please enter a valid email address" }
      ]
    },
    {
      "id": "a1b2c3d4-0005",
      "type": "select",
      "key": "contactMethod",
      "label": "Preferred Contact Method",
      "options": [
        { "label": "Email", "value": "email" },
        { "label": "Phone", "value": "phone" },
        { "label": "Post", "value": "post" }
      ],
      "validation": [
        { "type": "required" }
      ]
    },
    {
      "id": "a1b2c3d4-0006",
      "type": "tel",
      "key": "phoneNumber",
      "label": "Phone Number",
      "placeholder": "+44 7700 900000",
      "conditional": {
        "kind": "simple",
        "show": true,
        "when": "contactMethod",
        "eq": "phone"
      }
    },
    {
      "id": "a1b2c3d4-0007",
      "type": "textarea",
      "key": "message",
      "label": "Message",
      "placeholder": "Tell us how we can help...",
      "rows": 4,
      "validation": [
        { "type": "required" },
        { "type": "maxLength", "value": 1000 }
      ]
    },
    {
      "id": "a1b2c3d4-0008",
      "type": "submit",
      "key": "submit",
      "label": "Send Message",
      "action": "submit",
      "variant": "primary",
      "disableOnInvalid": true
    }
  ]
}
```

---

## 8. Schema Mutation API

Mutations are pure functions in `FormSchemaService` that return a new `FormSchema` without mutating the input:

```typescript
// All return a new FormSchema snapshot:

addComponent(
  schema: FormSchema,
  parentId: string | null,     // null = top level
  index: number,               // insert position
  descriptor: ComponentDescriptor
): FormSchema

removeComponent(
  schema: FormSchema,
  nodeId: string
): FormSchema

moveComponent(
  schema: FormSchema,
  nodeId: string,
  targetParentId: string | null,
  targetIndex: number
): FormSchema

patchComponent(
  schema: FormSchema,
  nodeId: string,
  patch: DeepPartial<ComponentSchema>
): FormSchema
```

These functions traverse the component tree (DFS) to locate nodes by `id`, apply the mutation, and return the new root schema. Because `FormSchema.components` is deeply immutable (spread at each level), change detection is pure reference equality.

---

## 9. Key Auto-Generation

When a component is dropped from the palette onto the canvas, the builder auto-generates a `key` from the component label so the form designer doesn't need to manually set it.

### 9.1 Algorithm

```typescript
// libs/form-builder/src/lib/services/key-generator.service.ts

/**
 * Converts a human label to a valid camelCase form field key.
 * Examples:
 *   'First Name'   → 'firstName'
 *   'Email Address' → 'emailAddress'
 *   'Phone #'       → 'phone'
 *   'VAT Number'    → 'vatNumber'
 */
export function labelToKey(label: string): string {
  return label
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')   // strip non-alphanumeric (except spaces)
    .split(/\s+/)                       // split on whitespace
    .filter(Boolean)
    .map((word, i) =>
      i === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)  // first word: lowercase start
        : word.charAt(0).toUpperCase() + word.slice(1)  // subsequent: uppercase start
    )
    .join('');
}

/**
 * Returns a de-duplicated key by appending a numeric suffix if the key already exists.
 * Examples: 'firstName' → 'firstName' (if unique) or 'firstName1', 'firstName2' …
 */
export function deduplicateKey(
  candidate: string,
  existingKeys: Set<string>,
  maxAttempts = 99
): string {
  if (!existingKeys.has(candidate)) return candidate;
  for (let i = 1; i <= maxAttempts; i++) {
    const suffixed = `${candidate}${i}`;
    if (!existingKeys.has(suffixed)) return suffixed;
  }
  return `${candidate}_${crypto.randomUUID().slice(0, 8)}`; // last resort
}
```

### 9.2 UX Behaviour

- The auto-generated key is shown in the properties panel "Property Name" field, pre-filled and editable.
- The key field is always editable — the designer can override it.
- When the designer manually changes the label after setting a key, the key is **not** auto-updated (only the first drop triggers auto-gen).
- If the designer changes the key in the properties panel, the builder validates uniqueness instantly and shows an inline error if the key conflicts.
- When pasting components (v2), new UUIDs are assigned and keys get a `_copy` suffix.

---

## 10. Schema Validation Utility

The builder exposes a `validateSchema(schema, registry)` utility that checks a `FormSchema` for consistency before saving or publishing.

### 10.1 Error Types

```typescript
// libs/form-builder/src/lib/validation/schema-validator.ts

export type SchemaErrorCode =
  | 'DUPLICATE_KEY'            // two components share the same key
  | 'DUPLICATE_ID'             // two components share the same UUID
  | 'EMPTY_KEY'                // a component has key: ''
  | 'INVALID_KEY_FORMAT'       // key is not valid camelCase (contains spaces, special chars)
  | 'UNKNOWN_TYPE'             // component.type not found in registry
  | 'ORPHANED_CONDITIONAL'     // conditional.when references a key that does not exist
  | 'ORPHANED_TAB_ASSIGNMENT'  // tabAssignments references a nodeId not in components[]
  | 'ORPHANED_COL_ASSIGNMENT'  // columnAssignments references a nodeId not in components[]
  | 'INVALID_COLUMN_INDEX'     // columnAssignments value >= ColumnsConfig.columnCount
  | 'REQUIRED_FIELD_MISSING';  // a required schema-level field is absent

export interface SchemaValidationError {
  code: SchemaErrorCode;
  message: string;
  /** The component node ID that triggered the error. Null for root-level errors. */
  nodeId: string | null;
  /** The component key, if applicable. */
  key?: string;
}
```

### 10.2 Usage

```typescript
import { validateSchema } from '@vi/form-builder';

const errors = validateSchema(schema, registry);
if (errors.length > 0) {
  console.error('Schema is invalid:', errors);
  // builder surfaces these as a warning banner above the canvas
}
```

### 10.3 When It Runs

| Trigger | Behaviour |
|---|---|
| On schema load (import or `[schema]` input) | Runs silently; logs warnings; builder continues |
| On "Publish" / "Save" click | Runs and blocks save if there are errors |
| On key field change in properties panel | Runs duplicate-key check only (fast, partial) |
| On conditional rule save | Runs orphaned-ref check only (fast, partial) |

---

| Feature | Schema Impact |
|---|---|
| Wizard mode | `FormSchema.display = 'wizard'` + `pages: PageSchema[]` wrapping components |
| Form templates / saved components | New `TemplateRef` node type pointing to a reusable component block |
| i18n | `label` becomes `Record<string, string>` with locale key; current string shorthand preserved |
| Logic builder | `ConditionalRule.kind = 'logic-builder'` with a visual rule tree AST |
| Data sources | `SelectComponentSchema.optionDataSource` (already scaffolded above) |
| E-signature | New `SignatureComponentSchema` with `type: 'signature'` |
| File upload | New `FileComponentSchema` with `type: 'file'` + upload config |
