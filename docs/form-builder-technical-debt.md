# Form Builder — Technical Debt Register

> **Status:** Living Document — updated as debts are identified  
> **Date:** 2026-05-25  
> Related docs: [roadmap](./form-builder-roadmap.md) · [schema](./form-builder-schema.md) · [renderer](./form-builder-renderer.md) · [offline](./form-builder-offline.md)

This document is the single source of truth for all identified technical debts across the form builder platform. Each entry records what was deferred, why, the impact, and what needs to happen before it can be resolved.

---

## How to Read This Register

| Field | Meaning |
|---|---|
| **ID** | Unique identifier — never reused, even after resolution |
| **Title** | Short name used across all docs |
| **Area** | Schema / Renderer / Builder / Web Component / Platform / Architecture |
| **Priority** | 🔴 High (blocks production use) · 🟡 Medium (workaround exists) · 🔵 Low (cosmetic / edge case) |
| **Phase** | When this is planned to be resolved |
| **Status** | Open / In Design / Resolved |

---

## TD-01 — File Upload

| Field | Value |
|---|---|
| **Area** | Web Component + Renderer |
| **Priority** | 🟡 Medium |
| **Phase** | Post v1 |
| **Status** | Open |

**What:** Clinical forms frequently need to attach scanned source documents, lab reports, and images (e.g. "Attach ECG trace"). No `FileComponentSchema` or `<vi-file-upload>` web component exists.

**Why deferred:** Out of scope for the core form builder v1. File storage strategy (S3, Azure Blob, on-prem) depends on deployment context and is not owned by the form platform.

**Resolution path:**
- Build a standalone `<vi-file-upload>` Lit web component in `libs/web-components`
- Provide `FILE_UPLOAD_ADAPTER` `InjectionToken` — host application wires the actual upload HTTP call
- Add `FileComponentSchema` to the discriminated union
- Builder descriptor for file fields

**Blockers:** File storage strategy decision at the product/infrastructure level.

---

## TD-02 — Schema Architecture: JSON-Only + JS Extension Model

| Field | Value |
|---|---|
| **Area** | Schema + Architecture |
| **Priority** | 🔴 High |
| **Phase** | Pre v2 (breaking schema change) |
| **Status** | Open |

**What:** The current `ComponentSchema` conflates data model and UI model into a single object. The target is a cleaner separation — pure JSON for structure and validation, with optional JS/formula extension points for calculation and interaction. Similar to how FormIO separates data model from layout.

**Why deferred:** The current schema is functional for v1 use cases. The redesign requires a breaking schema migration and broad impact across builder, renderer, and all consumer applications.

**Resolution path:**
- Research FormIO v5 schema structure thoroughly
- Design a `DataSchema` (field names, types, validation constraints) separate from `LayoutSchema` (presentation, label, column assignment)
- Define JS extension points: formula fields, custom interaction hooks
- Write `MigrationRegistry` to convert v1 schemas to v2
- Full design session required before implementation

**Blockers:** v2 renderer must be stable before schema migration can be planned.

---

## TD-03 — Cascading / Linked Codelists

| Field | Value |
|---|---|
| **Area** | Renderer + Schema |
| **Priority** | 🟡 Medium |
| **Phase** | v2 Renderer |
| **Status** | Open |

**What:** A common pattern where one field's value determines another field's available codelist options (e.g. country → site list, AE term → sub-term). The current design prefetches all codelists at init with no inter-field dependency. No `dependsOn` mechanism exists.

**Why deferred:** Non-trivial to design declaratively without introducing arbitrary JS in the schema. Needs careful design to avoid complexity at the renderer level.

**Resolution path:**
- Design `dependsOn` property on `CodelistOptionSource` (declarative config)
- `CODELIST_SERVICE` handles cascade internally — re-fetch or filter downstream list when upstream field changes
- Angular Signal `effect()` watches upstream field value, triggers codelist refresh
- Offline mode: pre-cache all candidate lists for all codelist cascade chains at init

**Blockers:** Codelist cascade design session required. Offline mode codelist strategy must be aligned.

---

## TD-04 — Field Runtime Status (EDC Lifecycle States)

| Field | Value |
|---|---|
| **Area** | Platform / DB |
| **Priority** | 🟡 Medium |
| **Phase** | Phase 3 |
| **Status** | Open — deferred by design |

**What:** In EDC, fields have runtime statuses beyond `dirty / touched`: `blank → incomplete → complete → queried → answered → reviewed → clean → frozen → locked`. These are required for clinical data lifecycle management.

**Decision:** These statuses are maintained at the **database / application layer**, not in the form renderer. No renderer code change required.

**Resolution path:**
- DB schema to store field-level status per form record
- API to return field statuses alongside form data
- Renderer displays status indicators (read-only; no state management in renderer)
- Phase 3 architecture session to define the API contract

---

## TD-05 — Visit / Subject Context Binding

| Field | Value |
|---|---|
| **Area** | Schema / Renderer |
| **Priority** | 🔵 Low |
| **Phase** | Product feature layer |
| **Status** | Open — deferred by design |

**What:** Clinical forms belong to a `Study → Site → Subject → Visit → Form` hierarchy. The schema and renderer are intentionally generic — no `subjectId`, `visitId`, `siteId` fields on `FormSchema`.

**Decision:** Visit/subject context is a **product/functional concern** handled at the host application layer. Context is passed via `FormDataService` metadata, not schema. The renderer remains generic.

**Resolution path:** No renderer change needed. Host application wraps the renderer and provides context via `FORM_DATA_SERVICE`. The product layer (CRF module) owns the visit/subject binding.

---

## TD-06 — Read-Only Form Mode

| Field | Value |
|---|---|
| **Area** | Renderer + Web Components |
| **Priority** | 🔴 High |
| **Phase** | v1 Renderer (before GA) |
| **Status** | In Design — implementation approach decided (2026-05-29) |

**What:** The renderer has no first-class read-only mode. Read-only is needed for:
- **Data review** — monitor / CDM reviewing submitted data without editing
- **Locked forms** — after a form section is locked (post sign-off), the data must be visible but immutable
- **Audit trail display** — showing a historical snapshot of form data at a point in time
- **Print / PDF export** — rendering form content for a clean printable view
- **Preview in builder** — viewing the form as a non-editable preview

**Why deferred:** Non-trivial — every layer of the renderer must propagate and respect the readonly state. Approach now decided (see below).

**Permission System (decided 2026-05-29):**

Read-only is driven by a **bitmask permission system**. Users with read-only permission receive a permissions value that lacks the `WRITE` bit. The form renderer derives `isReadonly` from this bitmask.

```typescript
export const enum FormPermission {
  READ     = 0b00001,  // view data and SYSTEM_VALIDATION errors
  WRITE    = 0b00010,  // edit field values
  VALIDATE = 0b00100,  // raise / respond to queries
  SIGN     = 0b01000,  // e-signature
  LOCK     = 0b10000,  // lock form post review
}

// Read-only user:  READ only       (0b00001)
// Data entry user: READ | WRITE    (0b00011)
// CDM:             READ | WRITE | VALIDATE  (0b00111)
```

**Implementation Architecture (decided 2026-05-29):**

1. **Backend enforces permissions independently.** Even if a client forges a write request, the API validates the user's permission bitmask server-side before persisting any data. The frontend read-only mode is a UX concern; the backend is the security gate.

2. **Each Lit web component supports a `readonly` attribute.** When `readonly` is set on the host element, the component renders in read-only format — not a disabled/greyed-out control, but a clean text presentation suitable for clinical data review.
   ```typescript
   // In every <vi-*> Lit CE:
   @property({ type: Boolean }) readonly = false;

   // render() switches between interactive and read-only presentation:
   // - <vi-input readonly>   → <span class="vi-readonly-value">{value}</span>
   // - <vi-select readonly>  → codelist label text, no dropdown
   // - <vi-checkbox readonly> → non-interactive icon only
   ```

3. **Angular wrappers bind `readonly` from a DI Signal.** `FormRendererComponent` accepts `@Input() permissions: number` and provides a `RENDERER_PERMISSIONS` signal scoped via its `providers: []`. Every wrapper component reads `isReadonly = computed(() => !(permissions() & FormPermission.WRITE))` and binds it to the Lit CE.

4. **No Angular directive is used.** A directive cannot pierce Lit Shadow DOM. The DI signal approach (matching how `FieldStateService` works) is the correct pattern for this architecture.

**Implementation requirements per component layer:**
- `FormRendererComponent`: `@Input() permissions: number` → provides `RENDERER_PERMISSIONS: Signal<number>`
- Each `vi-renderer-*` wrapper: reads signal, binds `[readonly]` to Lit CE
- Each `<vi-*>` Lit CE: implements `@property({ type: Boolean }) readonly` with two render paths
- Layout components (`vi-renderer-columns`, `vi-renderer-panel`, `vi-renderer-repeating-field`): propagate `readonly` to children
- `vi-renderer-actions`: hides Save/Submit/Reset in readonly mode
- Validation: `runForDataEntry()` is never called when `isReadonly = true`; SYSTEM_VALIDATION errors are still displayed (read-only CDM view)
- `readonly` ≠ `disabled`: readonly fields are clean text — copyable, no error borders; disabled fields are grayed out

**Remaining open questions:**
1. How does `readonly` interact with the `locked` flag on `BaseComponentSchema` (currently builder-only)?
2. Should the print view be a separate route/component or a CSS `@media print` layer on the renderer?

**Blockers:** All `<vi-*>` Lit CEs must implement the `readonly` attribute. This is a `libs/web-components` prerequisite before renderer integration can begin.

---

## TD-07 — validateOn: Form-Level Only (Schema Simplification)

| Field | Value |
|---|---|
| **Area** | Schema + Renderer |
| **Priority** | 🟡 Medium |
| **Phase** | v1 Renderer |
| **Status** | Open — decision made, not yet applied |

**What:** The current schema supports `validateOn` at both `FormSettings` level (global default) and `BaseComponentSchema` level (per-field override). Decision made on 2026-05-25: per-field `validateOn` is **removed**. Only one `validateOn` setting applies to the entire form, configured in `FormSettings`.

**Decision (2026-05-25):** 
- `FormSettings.validateOn: 'onChange' | 'onBlur'` (default: `'onBlur'`)
- `BaseComponentSchema.validateOn` is **removed** from the schema
- Renderer applies the single form-level setting uniformly to all fields
- Field-level granularity was deemed too complex for the validation framework v1

**Impact:**
- `form-builder-schema.md` §2 `FormSettings` — update `validateOn` definition
- `form-builder-schema.md` §3.1 `BaseComponentSchema` — remove `validateOn` field
- `form-builder-renderer.md` §5 Validation Runtime — remove per-field `validateOn` inheritance logic
- Builder properties panel — remove `validateOn` from per-field settings; keep only in Form Settings panel

**Status:** Decision documented. Schema and renderer docs not yet updated. To be applied when validation framework document is finalized.

---

## TD-08 — `saveState` / Draft Persistence Strategy

| Field | Value |
|---|---|
| **Area** | Renderer + Infrastructure |
| **Priority** | 🟡 Medium |
| **Phase** | Phase 4 |
| **Status** | Open |

**What:** The `action: 'saveState'` button action on `ButtonComponentSchema` uses `@vi/state-fp` for undo/redo history in the builder. The draft persistence strategy for the renderer (saving in-progress form data without submitting) is entirely TBD.

**Why deferred:** Requires decisions on storage backend (server-side draft API vs client-side IndexedDB), session/user binding, and expiry policy. A complete technical plan is needed before committing.

**Resolution path:** See [form-builder-offline.md](./form-builder-offline.md) §12 open questions. Offline document is the technical reference. Phase 4 architecture session required.

---

## TD-09 — Partial Save / Offline Mode

| Field | Value |
|---|---|
| **Area** | Platform / Infrastructure |
| **Priority** | 🟡 Medium |
| **Phase** | Phase 4 |
| **Status** | Open |

**What:** Full offline capability — load the form, capture data, submit when connectivity is restored.

**Resolution path:** Full technical approach documented in [form-builder-offline.md](./form-builder-offline.md). 15-section reference document covers: IndexedDB schema, service worker strategy, conflict resolution, Angular integration, browser support, security considerations, and 13 open questions.

**Blockers:** Phase 4 architecture session. Draft persistence strategy (TD-08) must be decided first.

---

## TD-10 — Form / Study Versioning

| Field | Value |
|---|---|
| **Area** | Schema + Platform |
| **Priority** | 🟡 Medium |
| **Phase** | Phase 4 |
| **Status** | Open |

**What:** Running studies can have protocol amendments that change form schemas mid-study. How does the system handle data collected under schema v1 when the active schema is v2? Migration runtime, rollback, and per-subject schema-version binding.

**Resolution path:** Dedicated technical design session required. Touches schema migration, data contracts at the DB layer, and potential UI impact (showing old-version data in new-version form). The `MigrationRegistry` concept is noted in the roadmap but not designed.

---

## TD-11 — Multilingual / i18n for Validation Messages

| Field | Value |
|---|---|
| **Area** | Schema + Renderer + Builder |
| **Priority** | 🟡 Medium |
| **Phase** | Phase 4 |
| **Status** | Open — deferred by design |

**What:** Validation messages are currently single-language strings authored by the form designer. Multilingual support (different messages per locale) is required for multi-site clinical trials running in multiple countries.

**Decision (2026-05-25):** Deferred to Phase 4. v1 validation framework supports a single language only. Multilingual design session to be scheduled before Phase 4 begins.

**Impact when resolved:**
- `ValidationSchema.messages` map changes from `Record<ruleId, string>` to `Record<ruleId, Record<locale, string>>`
- Builder: locale switcher in validation message editor
- Renderer: resolves message for current locale at runtime

---

## TD-12 — Custom Client Validator Loading Infrastructure

| Field | Value |
|---|---|
| **Area** | Platform / Architecture |
| **Priority** | 🔴 High |
| **Phase** | v1 Validation Framework (Phase 2) |
| **Status** | Documentation written — pending SDK implementation |

**What:** Study-level developer teams need to write and inject TypeScript validators that the form renderer executes as first-class validators — identical in behaviour to built-ins.

**Approach decided (2026-05-29):** Angular Dependency Injection. No dynamic bundle loading, no CDN-hosted code bundles, no SRI. Validators are compiled into the host application. This is simpler, fully typesafe, testable with Vitest/Jest, and eliminates the CDN hosting and security review gate concerns from the original design.

**Full documentation written:** [form-builder-custom-validators.md](./form-builder-custom-validators.md)

The documentation covers:
- SDK package `@vialiq/form-validator-sdk` — types, `pass()`/`fail()` helpers
- Pure function validators (zero DI, zero setup to test)
- Class-based validators (for Angular service injection)
- `STUDY_METADATA` injection token — how product team provides study context
- `StudyMeta` interface and how to extend it per study
- Cross-field validation via the `formData` snapshot parameter
- Schema-configured `params` — typing, defaults, fail-open on missing params
- `provideValidation({ customValidators: {...} })` registration
- Test infrastructure: `runValidator()` helper in `@vialiq/form-validator-sdk/testing`
- Full test examples for all validator types (pure, params-driven, cross-field, meta, class-based)
- Required test coverage table (12 categories)
- Security guidelines (no HTTP, no eval, synchronous only, no side effects, < 5ms)
- Pre-submission checklist (18 items)
- Examples gallery: NHS number, score range, date window, age eligibility, weight-based dose, MedDRA term, treatment arm constraint

**Remaining to implement:**
- Build and publish `@vialiq/form-validator-sdk` npm package
- Build and publish `@vialiq/form-validator-sdk/testing` subpath
- Wire `CUSTOM_VALIDATOR_REGISTRY` into `ValidationEngine` (§20 of `form-builder-validation.md`)
- Wire `STUDY_METADATA` token into `ValidationEngine` — pass as `meta` arg to all validators

**Blockers:** `ValidationEngine` implementation (§20) must be complete first.

---

## TD-13 — EC Queries and Custom Programming Integration

| Field | Value |
|---|---|
| **Area** | Platform / Query Management |
| **Priority** | 🔴 High |
| **Phase** | Phase 3 |
| **Status** | Open — deferred, knowledge research done, design pending |

**What:** Beyond SYSTEM_VALIDATION (client-side field validators) and USER_QUERIES (manually raised by CDM staff), EDC platforms have two additional query-generating mechanisms that need to be designed and integrated:

**Edit Check (EC) Queries:**
Edit checks are rule-based or programmatic checks executed server-side after data save, often as a batch process or triggered cross-form. Industry taxonomy (SCDM, Medidata, Oracle Clinical):

| EC Type | Description | Fires When |
|---|---|---|
| **Soft check** | Generates a query; site can override with explanation. Does NOT block save. | Post-save, server-side |
| **Hard check** | Cannot be bypassed. Blocks field completion (typically handled by field-level validators in renderer). | At entry or post-save |
| **Range check** | Value outside defined min/max bounds (e.g. SBP > 200). | Post-save, server-side |
| **Consistency / cross-field** | Logical relationship between 2+ fields on same form (e.g. end date before start date). | Post-save, server-side |
| **Cross-form / cross-visit** | Consistency across different CRF pages or visit timepoints (e.g. death date after AE onset). | Post-save, batch |
| **Derivation** | Auto-computed value from other fields (BMI, age from DOB). | Post-save, server-side |
| **Coding check** | Value must match approved codelist or MedDRA/WHOART term. | Post-save, server-side |
| **Programmatic** | Arbitrary rule engine or scripted logic (SAS, SQL, proprietary DSL). | Post-save, batch |

Key distinction: **SYSTEM_VALIDATION** fires client-side during data entry (renderer responsibility). **EC_QUERIES** fire server-side after save and are returned to the renderer as persisted query records to display alongside the field.

**Query Lifecycle (industry standard):**
```
Open → Answered (by site investigator) → Closed (by CDM) → Resolved
         ↑                                      ↓
         └───── Requires further clarification ─┘
                              ↓
                         Cancelled (if query was invalid)
```

**Custom Programming:**
Some studies require checks that go beyond declarative rule engines — custom SAS macros, SQL derivations, or proprietary scripting that clients write to enforce study-specific business logic. These generate EC_QUERIES in the same way as standard edit checks, but the rule authoring environment is a programming interface rather than a builder UI.

**Why deferred:** EC_QUERIES and custom programming are primarily backend concerns. The form renderer's responsibility is only to:
1. Display returned EC_QUERY records against the relevant field (same visual as SYSTEM_VALIDATION errors, but distinct status colour / icon)
2. Allow the site investigator to answer/respond to queries in-line
3. NOT generate EC checks itself

The query management workflow (raising, answering, reviewing, closing queries) is a separate product feature that needs a dedicated architecture session.

**Resolution path:**
- Phase 3 architecture session: EC query data model and API contract
- Design: how EC queries are displayed vs SYSTEM_VALIDATION (same inline red? different icon/colour for soft vs hard EC?)
- Design: query response workflow in the renderer (text box to enter site response)
- Design: custom programming runtime environment (separate service, not in renderer scope)
- Reference: SCDM Edit Check Design Principles PDF (https://scdm.org/wp-content/uploads/2024/05/Edit-Check-Design-Principles.pdf)

**Blockers:** Query management product spec. EC engine backend architecture (out of renderer scope).

---

## Summary Table

| ID | Title | Area | Priority | Phase | Status |
|---|---|---|---|---|---|
| TD-01 | File Upload | Web Component + Renderer | 🟡 | Post v1 | Open |
| TD-02 | Schema Architecture Redesign | Schema + Architecture | 🔴 | Pre v2 | Open |
| TD-03 | Cascading / Linked Codelists | Renderer + Schema | 🟡 | v2 | Open |
| TD-04 | Field Runtime Status | Platform / DB | 🟡 | Phase 3 | Open (by design) |
| TD-05 | Visit / Subject Context | Schema / Renderer | 🔵 | Product layer | Open (by design) |
| TD-06 | Read-Only Form Mode | Renderer + Web Components | 🔴 | v1 before GA | In Design |
| TD-07 | validateOn Form-Level Only | Schema + Renderer | 🟡 | v1 Renderer | Decision made, not applied |
| TD-08 | saveState / Draft Persistence | Renderer + Infrastructure | 🟡 | Phase 4 | Open |
| TD-09 | Offline Mode | Platform / Infrastructure | 🟡 | Phase 4 | Open |
| TD-10 | Form / Study Versioning | Schema + Platform | 🟡 | Phase 4 | Open |
| TD-11 | Multilingual Validation Messages | Schema + Renderer | 🟡 | Phase 4 | Open (by design) |
| TD-12 | Custom Client Validator Loading | Platform / Architecture | 🔴 | v1 Validation | Docs written, SDK pending |
| TD-13 | EC Queries & Custom Programming | Platform / Query Management | 🔴 | Phase 3 | Open |