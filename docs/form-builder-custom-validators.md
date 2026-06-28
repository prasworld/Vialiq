# Form Builder — Custom Validator SDK

> **Status:** Approved Design — v1 Validation Framework  
> **Date:** 2026-05-29  
> **Audience:** Study-level developer teams writing application-specific validators  
> Related docs: [validation](./form-builder-validation.md) · [schema](./form-builder-schema.md) · [use-cases](./form-builder-custom-programming-use-cases.md) · [technical-debt TD-12](./form-builder-technical-debt.md#td-12--custom-client-validator-loading-infrastructure)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Quick Start](#3-quick-start)
4. [SDK Package Reference](#4-sdk-package-reference)
5. [Pure Function Validators](#5-pure-function-validators)
6. [Class-Based Validators](#6-class-based-validators)
7. [Study Metadata](#7-study-metadata)
8. [Cross-Field Validation](#8-cross-field-validation)
9. [Schema-Configured Parameters](#9-schema-configured-parameters)
10. [Error Messages](#10-error-messages)
11. [Testing Your Validator](#11-testing-your-validator)
12. [Registration and Schema Reference](#12-registration-and-schema-reference)
13. [Security Guidelines](#13-security-guidelines)
14. [Examples Gallery](#14-examples-gallery)
15. [Pre-Submission Checklist](#15-pre-submission-checklist)
16. [Client vs Server Execution Boundary](#16-client-vs-server-execution-boundary)

---

## 1. Overview

The form builder validation framework has three layers:

| Layer | Who writes it | How |
|---|---|---|
| **Layer 1 — Built-in** | Platform team | Shipped in `@vialiq/form-renderer` — 11 built-in validators |
| **Layer 2 — json-logic rules** | Study designers | Configured in the builder UI — no code required |
| **Layer 3 — Custom validators** | Study dev team | TypeScript code — **this document** |

Custom validators are the third layer. They let study-level teams write TypeScript functions that the form renderer executes as first-class validators — indistinguishable from built-ins from the renderer's perspective. They are the right tool when:

- The validation logic is too complex to express as a json-logic rule
- The rule references study-specific data (protocol-defined ranges, site-specific thresholds, MedDRA codelists)
- The rule needs to access injected Angular services (a codelist service, pre-loaded reference data)
- The domain rule is specific enough that it will never be generalised into the platform

### 1.1 The Two-Layer Model

Custom validators in this SDK run **client-side only** — in the browser, executed by `ValidationEngine` at blur/change/submit time. They provide immediate user feedback but are **never the authoritative source of truth**. The server always re-validates on save.

| Layer | Where | Trust level | Gating |
|---|---|---|---|
| 🖥 **Client (this SDK)** | Browser — `ValidationEngine` | UX feedback only | Shows inline errors; does not block server save |
| 🖧 **Server** | Backend edit-check engine | Authoritative — cannot be bypassed | Blocks save, lock, sign |

See [use-cases §1.1](./form-builder-custom-programming-use-cases.md#11-the-two-layer-model) for the full regulatory principle. See §16 of this document for the complete taxonomy of which use cases belong to each layer.

**What custom validators cannot do:**
- Make HTTP requests during validation (validators are synchronous — see §13.1)
- Access the DOM
- Dispatch Angular events or mutate application state
- Run asynchronous operations

If your use case requires any of the above, discuss with the platform team — it may require a framework-level extension.

---

## 2. Architecture

### 2.1 How Validators Flow Through the System

```
Study Application
  └── app.config.ts
        └── provideValidation({ customValidators: { nhsNumber, siteRange, ... } })
              ↓
        CUSTOM_VALIDATOR_REGISTRY (InjectionToken)
              ↓
        ValidationEngine  ← scoped per FormRendererComponent instance
              ↓
        #evaluateOne(rule, value, formData, meta)
              ↓
        factory(params)(value, formData, meta)
              ↓
        RuleResult  →  pass()  or  fail('message')
```

The `ValidationEngine` merges the built-in registry and the custom registry at runtime:

```
BUILT_IN_VALIDATORS  +  CUSTOM_VALIDATOR_REGISTRY  =  merged lookup table
{ required, range, … }   { nhsNumber, siteRange, … }
```

Custom validators are looked up by `ruleId` exactly like built-ins. The renderer has no awareness of which layer a validator comes from.

### 2.2 DI Scoping

```
AppModule / app.config.ts
  provideValidation(config)           ← CUSTOM_VALIDATOR_REGISTRY at root level
  STUDY_METADATA                      ← provided by host app at root level
  ↓
FormRendererComponent  providers: [FieldStateService, ValidationEngine]
  ↓  (one instance per <vi-form-renderer> element)
ValidationEngine
  injects CUSTOM_VALIDATOR_REGISTRY, STUDY_METADATA
  writes errors to FieldStateService
```

Two `<vi-form-renderer>` elements on the same page share the same custom validator registry and study metadata, but have isolated `FieldStateService` and `ValidationEngine` instances.

---

## 3. Quick Start

### Step 1 — Install the SDK

```bash
npm install @vialiq/form-validator-sdk
```

The SDK is a lightweight package containing only types and helper functions. Its only runtime dependency is `@vi/state-fp` (already used by the form renderer).

### Step 2 — Write a Validator

```typescript
// src/validators/positive-integer.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

export const positiveInteger: ValidatorFactory = (_params) => (value) => {
  // 1. Empty values pass — let the `required` validator handle emptiness separately
  if (value === null || value === undefined || value === '') return pass();

  // 2. Type coerce and validate
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    return fail('Must be a positive whole number');
  }

  return pass();
};
```

### Step 3 — Register It

```typescript
// app.config.ts
import { ApplicationConfig }  from '@angular/core';
import { provideValidation }  from '@vialiq/form-renderer';
import { positiveInteger }    from './validators/positive-integer.validator';

export const appConfig: ApplicationConfig = {
  providers: [
    provideValidation({
      customValidators: { positiveInteger }
    }),
  ]
};
```

### Step 4 — Reference It in the Schema

```json
{
  "key": "participantCount",
  "type": "number",
  "label": "Number of Participants",
  "validation": [
    { "type": "built-in", "ruleId": "required" },
    {
      "type": "built-in",
      "ruleId": "positiveInteger",
      "message": "Participant count must be a positive whole number"
    }
  ]
}
```

That's it. The renderer picks up `positiveInteger` from the merged registry and calls it with the same contract as a built-in validator.

---

## 4. SDK Package Reference

### 4.1 `ValidatorFactory`

```typescript
type ValidatorFactory =
  (params: Record<string, unknown>) =>
    (value: unknown, formData: Record<string, unknown>, meta: StudyMeta) => RuleResult;
```

The **outer function** receives schema-configured `params` once, at form load time. Use it to do any setup work (type-narrow params, pre-compute constants) so the inner function stays lightweight.

The **inner function** is called on every validation trigger (every blur in Phase 1, every save in Phase 2) with:

| Parameter | Type | Description |
|---|---|---|
| `value` | `unknown` | Current value of this field. May be `null`, `undefined`, `''`, a string, number, boolean, or array (repeating fields). |
| `formData` | `Record<string, unknown>` | Snapshot of all field values in the current form, keyed by `fieldKey`. Use for cross-field rules. Read-only — do not mutate. |
| `meta` | `StudyMeta` | Study-level metadata provided by the host application at bootstrap (see §7). |

### 4.2 `RuleResult`

```typescript
type RuleResult = Either<ValidationError, void>;
```

Always use the SDK helpers — do not construct `Either` values directly:

```typescript
import { pass, fail } from '@vialiq/form-validator-sdk';

pass()               // ← field is valid
fail('Your message') // ← field is invalid; message shown to user
```

### 4.3 `pass()`, `fail()`, and `warn()`

```typescript
/**
 * Field is valid. No message produced.
 */
export const pass = (): RuleResult => right(undefined);

/**
 * Field is invalid — hard error.
 * @param message  Shown to the user in red. Plain text only — no HTML.
 *                 Be specific: include expected values, ranges, formats.
 * Blocks form submit. The site must correct the value before saving.
 */
export const fail = (message: string): RuleResult => left({ message, severity: 'error' });

/**
 * Soft query — value is unusual but not necessarily wrong.
 * @param message  Shown to the user in amber. Plain text only — no HTML.
 *                 Explain what is unusual and ask the user to confirm.
 * Does NOT block submit. The server creates a formal query record on save.
 * The site must acknowledge the query before the form can be locked.
 *
 * @since SDK v1.1 — not available in v1.0
 */
export const warn = (message: string): RuleResult => left({ message, severity: 'warning' });
```

**When to use `warn()` vs `fail()`:**

| Situation | Use |
|---|---|n| Value is structurally impossible (NHS check digit wrong, date before birth) | `fail()` |
| Value violates a hard protocol rule (eGFR below eligibility threshold) | `fail()` |
| Value is plausible but physiologically unusual (HR = 150 bpm) | `warn()` |
| Value is outside soft range and needs site confirmation | `warn()` |
| Partial date ordering is ambiguous (same month, unknown day) | `warn()` |

### 4.4 `StudyMeta`

```typescript
export interface StudyMeta {
  /** Internal study identifier, e.g. 'XYZ-001' */
  readonly studyId:         string;
  /** Protocol version, e.g. 'v3.2' */
  readonly protocolVersion: string;
  /** Site code for the current user's site, e.g. 'UK-01' */
  readonly siteCode:        string;
  /** Current subject identifier, e.g. '001-001-0042' */
  readonly subjectId:       string;
  /** Current visit name, e.g. 'Screening', 'Week 12' */
  readonly visitName:       string;
  /** ICH phase classification */
  readonly studyPhase:      'I' | 'II' | 'III' | 'IV';
  /**
   * MedDRA version declared in the study protocol and Define.xml.
   * e.g. '27.1' — used by coding validators to ensure version consistency.
   * See use-cases §15.7 for Medical Coding client-side validation rules.
   */
  readonly meddraVersion?:  string;
  /**
   * Protocol-level inclusion/exclusion thresholds and dose parameters.
   * Typed loosely here — extend StudyMeta in your study app for type safety.
   * See §7.3 for the extension pattern.
   */
  readonly [key: string]:   unknown;
}
```

`StudyMeta` is provided by the host application at bootstrap and does not change during a session (see §7). It is passed as the third argument to every pure function validator and is available via `inject(STUDY_METADATA)` in class-based validators.

### 4.4a `formData` — the `_carried.*` namespace

For fields whose values originate from a **different form** (e.g., date of birth from Demographics, carried into a dosing form), the form schema declares `carried-forward` fields. These are server-populated read-only values that appear in `formData` under the `_carried.*` prefix:

```typescript
// Available to cross-field validators as normal formData keys:
formData['_carried.DM.SEX']       // 'M' | 'F' — from Demographics form
formData['_carried.DM.DOB']       // ISO date string — subject date of birth
formData['_carried.SCR.EGFR']     // number — screening eGFR
formData['_carried.SCR.WEIGHT']   // number — most recent weight in kg
```

**Rules for validators reading `_carried.*` keys:**
- Always treat them as potentially `null` — the source form may not yet have data
- Never mutate them — they are read-only
- Access them exactly like any other `formData` key — no special API needed

### 4.5 `CustomValidatorRegistry`

```typescript
export type CustomValidatorRegistry = Record<string, ValidatorFactory | Type<CustomValidator>>;
```

Object keys become the `ruleId` values used in the schema JSON. Both pure function factories and class tokens are accepted.

### 4.6 `CustomValidator` (class-based base class)

```typescript
export abstract class CustomValidator {
  /**
   * Called once per field per form load with the schema-configured params.
   * Returns a ValidatorFn bound to those params.
   * The returned function is called on every validation trigger.
   */
  abstract factory(params: Record<string, unknown>): ValidatorFn;
}
```

Class-based validators are Angular `@Injectable()` classes that extend this base. Use them when you need Angular DI (see §6).

---

## 5. Pure Function Validators

Use a pure function validator when:
- The logic is self-contained (no Angular services needed)
- All needed data comes from `value`, `formData`, `params`, or `meta`
- The rule is deterministic: same inputs always produce the same output

Pure function validators are zero-setup to test — no Angular `TestBed`, no DI, no mocking.

### 5.1 Standard Structure

```typescript
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

export const myValidator: ValidatorFactory = (params) => {
  // ── Setup (runs once at form load) ──────────────────────────────────────
  const configuredLimit = Number(params['limit'] ?? 100);

  // ── Validator function (runs on every trigger) ───────────────────────────
  return (value, formData, meta) => {
    // Step 1: early exit for empty values
    if (value === null || value === undefined || value === '') return pass();

    // Step 2: type coerce
    const num = Number(value);
    if (!isFinite(num)) return fail('Must be a valid number');

    // Step 3: business rule
    if (num > configuredLimit) {
      return fail(`Value must not exceed ${configuredLimit}`);
    }

    return pass();
  };
};
```

### 5.2 Example — NHS Number (Modulus 11 Check)

```typescript
// validators/nhs-number.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

/**
 * Validates a UK NHS number using the standard Modulus 11 check digit algorithm.
 * Spec: https://www.datadictionary.nhs.uk/attributes/nhs_number.html
 *
 * No params required.
 */
export const nhsNumber: ValidatorFactory = (_params) => (value) => {
  if (value === null || value === undefined || value === '') return pass();

  const digits = String(value).replace(/[\s-]/g, '');

  if (!/^\d{10}$/.test(digits)) {
    return fail('NHS number must be exactly 10 digits (spaces are ignored)');
  }

  // Modulus 11 check digit algorithm
  let total = 0;
  for (let i = 0; i < 9; i++) {
    total += Number(digits[i]) * (10 - i);
  }
  const remainder  = total % 11;
  const checkDigit = remainder === 0 ? 0 : 11 - remainder;

  // A checkDigit of 10 is mathematically impossible in a valid NHS number
  if (checkDigit === 10) {
    return fail('Invalid NHS number');
  }

  if (checkDigit !== Number(digits[9])) {
    return fail('Invalid NHS number — check digit mismatch');
  }

  return pass();
};
```

### 5.3 Example — Protocol-Specified Score Range

```typescript
// validators/protocol-score-range.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

/**
 * Validates a clinical rating scale score against protocol-defined bounds.
 *
 * params.min       {number} Required. Lower bound (inclusive).
 * params.max       {number} Required. Upper bound (inclusive).
 * params.scaleName {string} Optional. Display name for error messages. Default: 'Score'.
 *
 * Example schema params: { "min": 0, "max": 56, "scaleName": "HAMD-17" }
 */
export const protocolScoreRange: ValidatorFactory = (params) => {
  // Type-narrow params once in the outer function
  const hasMin = typeof params['min'] === 'number';
  const hasMax = typeof params['max'] === 'number';

  if (!hasMin || !hasMax) {
    console.warn('[protocolScoreRange] Missing required params: min, max. Failing open.');
    return (_value) => pass();
  }

  const min       = params['min'] as number;
  const max       = params['max'] as number;
  const scaleName = typeof params['scaleName'] === 'string' ? params['scaleName'] : 'Score';

  return (value) => {
    if (value === null || value === undefined || value === '') return pass();

    const num = Number(value);
    if (!isFinite(num)) return fail(`${scaleName}: must be a number`);

    if (num < min || num > max) {
      return fail(`${scaleName}: must be between ${min} and ${max} (entered: ${num})`);
    }

    return pass();
  };
};
```

### 5.4 Example — Date Within Study Visit Window (using `meta`)

```typescript
// validators/study-window-date.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

/**
 * Validates that a date field falls within a protocol-defined visit window.
 * Uses meta.visitName to produce a contextual error message.
 *
 * params.windowStart {string} ISO date string — start of the allowed window (inclusive).
 * params.windowEnd   {string} ISO date string — end of the allowed window (inclusive).
 */
export const studyWindowDate: ValidatorFactory = (params) => {
  const windowStart = new Date(String(params['windowStart'] ?? ''));
  const windowEnd   = new Date(String(params['windowEnd']   ?? ''));

  if (isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime())) {
    console.warn('[studyWindowDate] Invalid windowStart or windowEnd params. Failing open.');
    return (_value) => pass();
  }

  const fmt = (d: Date) => d.toLocaleDateString('en-GB');

  return (value, _formData, meta) => {
    if (value === null || value === undefined || value === '') return pass();

    const date = new Date(String(value));
    if (isNaN(date.getTime())) return fail('Please enter a valid date');

    if (date < windowStart || date > windowEnd) {
      return fail(
        `Date is outside the ${meta.visitName} window ` +
        `(${fmt(windowStart)} – ${fmt(windowEnd)})`
      );
    }

    return pass();
  };
};
```

---

## 6. Class-Based Validators

Use a class-based validator when:
- You need to inject an Angular service (e.g., a pre-loaded reference data service, a codelist service)
- The validation data changes during the session and must be injected fresh each time
- You want direct access to `STUDY_METADATA` via `inject()` rather than via the `meta` argument

### 6.1 Basic Structure

```typescript
import { inject, Injectable }                  from '@angular/core';
import { CustomValidator, ValidatorFn, pass, fail } from '@vialiq/form-validator-sdk';
import { STUDY_METADATA }                      from '@vialiq/form-renderer';
import { ReferenceDataService }                from '../services/reference-data.service';

@Injectable()
export class SiteRangeValidator extends CustomValidator {
  // Inject dependencies in the class body — Angular DI resolves them
  readonly #meta    = inject(STUDY_METADATA);
  readonly #refData = inject(ReferenceDataService);

  /**
   * factory() is called once per field per form load.
   * Capture any setup work here so the returned function is lightweight.
   */
  factory(_params: Record<string, unknown>): ValidatorFn {
    // Pre-resolve site-specific range at factory call time — NOT inside the returned function
    const range = this.#refData.getRangeForSite(this.#meta.siteCode);

    return (value) => {
      if (value === null || value === undefined || value === '') return pass();
      if (!range) return pass(); // no range configured for this site — fail-open

      const num = Number(value);
      if (!isFinite(num)) return fail('Must be a number');

      if (num < range.min || num > range.max) {
        return fail(
          `Value must be between ${range.min} and ${range.max} ` +
          `(site ${this.#meta.siteCode} reference range)`
        );
      }

      return pass();
    };
  }
}
```

### 6.2 Registering a Class-Based Validator

```typescript
// app.config.ts
import { provideValidation }   from '@vialiq/form-renderer';
import { SiteRangeValidator }  from './validators/site-range.validator';

export const appConfig: ApplicationConfig = {
  providers: [
    SiteRangeValidator,   // ← Angular must provide the class before it can be injected
    provideValidation({
      customValidators: {
        siteRange: SiteRangeValidator,  // ← pass the class token, not an instance
      }
    }),
  ]
};
```

The `ValidationEngine` resolves `SiteRangeValidator` via `inject(SiteRangeValidator)` and calls `.factory(params)` to obtain the validator function.

### 6.3 Critical: Do Expensive Work in `factory()`, Not in the Inner Function

```typescript
// ✅ Correct — service call happens once at form load
factory(params) {
  const threshold = this.#refData.getThreshold(String(params['type'])); // once
  return (value) => {
    if (Number(value) > threshold) return fail(`Must be ≤ ${threshold}`);
    return pass();
  };
}

// ❌ Wrong — service call happens on every blur/change event
factory(params) {
  return (value) => {
    const threshold = this.#refData.getThreshold(String(params['type'])); // every keystroke
    ...
  };
}
```

---

## 7. Study Metadata

### 7.1 The `STUDY_METADATA` Token

```typescript
// Exported from @vialiq/form-renderer
export const STUDY_METADATA = new InjectionToken<StudyMeta>('STUDY_METADATA');
```

This token is:
- Provided by the **host application** at root level
- Injected by `ValidationEngine` and passed as the `meta` argument to all pure validators
- Available via `inject(STUDY_METADATA)` inside class-based validators
- **Not changed during a session** — it represents session-level context, not form-field data

### 7.2 Providing Study Metadata

```typescript
// app.config.ts — static value (same for all users in this deployment build)
{
  provide: STUDY_METADATA,
  useValue: {
    studyId:         'XYZ-001',
    protocolVersion: 'v3.2',
    siteCode:        'UK-01',
    subjectId:       '001-001-0042',  // resolved from route or auth context
    visitName:       'Week 12',
    studyPhase:      'III',
  } satisfies StudyMeta,
}

// app.config.ts — dynamic (resolved from auth claims + route context)
{
  provide: STUDY_METADATA,
  useFactory: (auth: AuthService, route: RouteContextService): StudyMeta => ({
    studyId:         auth.claims.studyId,
    protocolVersion: auth.claims.protocolVersion,
    siteCode:        auth.claims.siteCode,
    subjectId:       route.subjectId,
    visitName:       route.visitName,
    studyPhase:      auth.claims.studyPhase,
  }),
  deps: [AuthService, RouteContextService],
}
```

### 7.3 Extending `StudyMeta` for Study-Specific Properties

If your study needs metadata not in the base `StudyMeta` interface:

```typescript
// types/my-study-meta.ts
import type { StudyMeta } from '@vialiq/form-validator-sdk';

export interface MyStudyMeta extends StudyMeta {
  /** Treatment arm assigned at randomisation */
  readonly treatmentArm: 'A' | 'B' | 'placebo';
  /** Baseline values captured at screening, loaded at session start */
  readonly baseline: {
    readonly weightKg:  number | null;
    readonly heightCm:  number | null;
  };
}
```

Provide your extended type against the same token:

```typescript
{
  provide: STUDY_METADATA,
  useFactory: (): MyStudyMeta => ({ ... }),
}
```

In your validator, cast `meta` to your extended type:

```typescript
export const treatmentDose: ValidatorFactory = (_params) => (value, _formData, meta) => {
  const myMeta = meta as MyStudyMeta;

  if (myMeta.treatmentArm === 'placebo' && Number(value) > 0) {
    return fail('Placebo arm subjects must have a dose of 0');
  }
  return pass();
};
```

---

## 8. Cross-Field Validation

### 8.1 Using the `formData` Parameter

The `formData` snapshot contains all field values in the current form at the moment validation fires. Keys match the `key` property on each `BaseComponentSchema`.

```typescript
// validators/date-after-field.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

/**
 * Validates that this field's date value is strictly after the date in another field.
 * Attach to the end-date field.
 *
 * params.startFieldKey {string} Required. The fieldKey of the start-date field.
 * params.label         {string} Optional. Human label for the start field in the error message.
 */
export const dateAfterField: ValidatorFactory = (params) => {
  const startKey = String(params['startFieldKey'] ?? '');
  const label    = String(params['label'] ?? 'the start date');

  if (!startKey) {
    console.warn('[dateAfterField] Missing required param: startFieldKey. Failing open.');
    return (_value) => pass();
  }

  return (value, formData) => {
    if (value === null || value === undefined || value === '') return pass();

    const endDate   = new Date(String(value));
    const startRaw  = formData[startKey];

    // Fail-open when the referenced field is not yet filled or has an invalid value
    if (startRaw === null || startRaw === undefined || startRaw === '') return pass();
    const startDate = new Date(String(startRaw));
    if (isNaN(startDate.getTime())) return pass();

    if (isNaN(endDate.getTime())) return fail('Please enter a valid date');

    if (endDate <= startDate) {
      return fail(`End date must be after ${label}`);
    }

    return pass();
  };
};
```

### 8.2 `formData` Key Conventions

| Field type | Key in `formData` | Example |
|---|---|---|
| Standard field | The `key` from schema | `aeStartDate` |
| Repeating field — instance 0 | `{fieldKey}[0]` | `medications[0]` |
| Repeating field — instance 1 | `{fieldKey}[1]` | `medications[1]` |

Keys are camelCase with no dots. See §25.3 of `form-builder-validation.md` for the constraint.

### 8.3 Which Field Gets the Rule?

Per the validation architecture: **attach the rule to the field the user edits last** (the field that makes the comparison meaningful). For an end-date / start-date rule, attach it to the end-date field — validation fires when the user blurs the end-date field.

SYSTEM_VALIDATION records for cross-field rules use `targetFieldKey` to associate the error with the correct field in the review UI.

---

## 9. Schema-Configured Parameters

### 9.1 What `params` Are For

`params` are static values configured by the form builder at schema design time. They allow one validator implementation to cover a family of related rules:

```json
// One validator implementation, three distinct rules:
{ "ruleId": "protocolScoreRange", "params": { "min": 0,  "max": 56,  "scaleName": "HAMD-17" } }
{ "ruleId": "protocolScoreRange", "params": { "min": 0,  "max": 100, "scaleName": "BDI-II"  } }
{ "ruleId": "protocolScoreRange", "params": { "min": -3, "max": 3,   "scaleName": "CGI-C"   } }
```

### 9.2 Always Type-Narrow in the Outer Function

```typescript
export const myValidator: ValidatorFactory = (params) => {
  // ✅ Narrow params once here — inner function gets pre-typed values
  const limit = typeof params['limit'] === 'number' ? params['limit'] : 100;

  return (value) => {
    // limit is already a number — no narrowing needed inside hot path
    if (Number(value) > limit) return fail(`Must not exceed ${limit}`);
    return pass();
  };
};
```

### 9.3 Handling Missing Required Params

If a required param is absent, fail-open and warn — never throw:

```typescript
if (typeof params['min'] !== 'number' || typeof params['max'] !== 'number') {
  console.warn('[protocolScoreRange] Missing required params: min, max. Failing open.');
  return (_value) => pass();
}
```

Throwing inside a validator factory propagates up through the engine and can crash the form. Fail-open keeps the form operational while signalling the configuration error to developers.

---

## 10. Error Messages

### 10.1 Writing Effective Clinical Error Messages

Validation error messages in an EDC system are read by site staff, CDMs, and medical monitors — often in the context of audit trails and query responses. They must be:

| Requirement | Example ✅ | Example ❌ |
|---|---|---|
| **Specific** — state what is wrong | `HAMD-17 score must be between 0 and 56` | `Invalid value` |
| **Quantified** — include expected bounds | `Value must be between 60 and 120 (UK-01 range)` | `Out of range` |
| **Contextual** — name the field or scale | `End date must be after AE Start Date` | `Date is invalid` |
| **Actionable** — tell user what to enter | `NHS number must be 10 digits — spaces are ignored` | `Check format` |
| **Professional** — clinical tone, no jargon | `Please enter a valid date of birth` | `DOB parse failed` |

### 10.2 Include the Entered Value When Helpful

```typescript
return fail(
  `HAMD-17: must be between 0 and 56 (entered: ${num})`
);
```

This spares the user from having to look back at what they typed.

### 10.3 Schema-Level Message Override

The schema's `message` field overrides the validator's message for SYSTEM_VALIDATION records:

```json
{
  "ruleId": "nhsNumber",
  "message": "The NHS number entered does not pass the Modulus 11 check. Please verify with the subject's NHS card."
}
```

The field-level inline error still uses the validator's message (more technical, seen by site staff). The `message` override is used in the SYSTEM_VALIDATION record (seen by CDMs in query management). This lets you tune language for each audience independently.

### 10.4 Multilingual Note

v1 supports single-language messages only. Multilingual support (locale-keyed messages) is planned for Phase 4 (TD-11). Write messages in the study's primary protocol language for now.

---

## 11. Testing Your Validator

### 11.1 Test Philosophy

Custom validators are pure functions — or class methods that return pure functions. They require **zero Angular setup** to test. Use Vitest (or Jest) directly with no `TestBed`, no HTTP mocking, and no DI configuration.

This is a deliberate design constraint. If your validator is hard to test without `TestBed`, too much logic has moved into the class. Extract the core logic into a pure helper function and test that directly.

### 11.2 The `runValidator` Test Helper

```typescript
// Import from the testing subpath
import { runValidator } from '@vialiq/form-validator-sdk/testing';

// Signature:
function runValidator(
  factory: ValidatorFactory,
  params:  Record<string, unknown> = {},
): {
  withValue(
    value:   unknown,
    options?: {
      formData?: Record<string, unknown>;
      meta?:     Partial<StudyMeta>;
    }
  ): {
    expectValid():                    void;
    expectInvalid(msg?: string | RegExp): void;
  }
}
```

### 11.3 Testing a Basic Validator — NHS Number

```typescript
// validators/nhs-number.validator.spec.ts
import { describe, it } from 'vitest';
import { runValidator }  from '@vialiq/form-validator-sdk/testing';
import { nhsNumber }     from './nhs-number.validator';

describe('nhsNumber', () => {
  const validate = runValidator(nhsNumber);

  // ── Empty values ────────────────────────────────────────────────────────
  it('passes for null',         () => validate.withValue(null).expectValid());
  it('passes for undefined',    () => validate.withValue(undefined).expectValid());
  it('passes for empty string', () => validate.withValue('').expectValid());

  // ── Valid numbers ────────────────────────────────────────────────────────
  // 9434765919 — known-valid NHS number
  it('passes for a valid number',            () => validate.withValue('9434765919').expectValid());
  it('passes with spaces (stripped)',        () => validate.withValue('943 476 5919').expectValid());
  it('passes with hyphens (stripped)',       () => validate.withValue('943-476-5919').expectValid());

  // ── Invalid format ───────────────────────────────────────────────────────
  it('fails for 9 digits',  () =>
    validate.withValue('123456789').expectInvalid('NHS number must be exactly 10 digits (spaces are ignored)'));
  it('fails for 11 digits', () =>
    validate.withValue('12345678901').expectInvalid('NHS number must be exactly 10 digits (spaces are ignored)'));
  it('fails for letters',   () =>
    validate.withValue('ABCDEF1234').expectInvalid('NHS number must be exactly 10 digits (spaces are ignored)'));

  // ── Invalid check digit ──────────────────────────────────────────────────
  it('fails for wrong check digit', () =>
    validate.withValue('9434765910').expectInvalid('Invalid NHS number — check digit mismatch'));

  // ── Edge: impossible Modulus 11 number (all zeros) ───────────────────────
  it('fails for an NHS number with impossible check digit', () =>
    validate.withValue('0000000000').expectInvalid());
});
```

### 11.4 Testing a Validator with Params — Score Range

```typescript
// validators/protocol-score-range.validator.spec.ts
import { describe, it } from 'vitest';
import { runValidator }  from '@vialiq/form-validator-sdk/testing';
import { protocolScoreRange } from './protocol-score-range.validator';

describe('protocolScoreRange', () => {
  describe('HAMD-17 (0–56)', () => {
    const hamd17 = runValidator(protocolScoreRange, { min: 0, max: 56, scaleName: 'HAMD-17' });

    it('passes for 0 (minimum boundary)',  () => hamd17.withValue(0).expectValid());
    it('passes for 56 (maximum boundary)', () => hamd17.withValue(56).expectValid());
    it('passes for 28 (midpoint)',         () => hamd17.withValue(28).expectValid());
    it('passes for empty',                 () => hamd17.withValue('').expectValid());

    it('fails for -1 (below min)', () =>
      hamd17.withValue(-1).expectInvalid('HAMD-17: must be between 0 and 56 (entered: -1)'));
    it('fails for 57 (above max)', () =>
      hamd17.withValue(57).expectInvalid('HAMD-17: must be between 0 and 56 (entered: 57)'));
    it('fails for non-numeric',    () =>
      hamd17.withValue('abc').expectInvalid('HAMD-17: must be a number'));
    it('fails for Infinity',       () =>
      hamd17.withValue(Infinity).expectInvalid('HAMD-17: must be a number'));
    it('fails for NaN',            () =>
      hamd17.withValue(NaN).expectInvalid('HAMD-17: must be a number'));
  });

  describe('param validation', () => {
    it('fails-open and warns when min/max are missing', () => {
      const v = runValidator(protocolScoreRange, { scaleName: 'Missing params' });
      // Should pass for all values (fail-open)
      v.withValue(-999).expectValid();
      v.withValue(9999).expectValid();
    });
  });

  describe('CGI-C (-3 to 3)', () => {
    const cgic = runValidator(protocolScoreRange, { min: -3, max: 3, scaleName: 'CGI-C' });
    it('passes for -3', () => cgic.withValue(-3).expectValid());
    it('passes for 3',  () => cgic.withValue(3).expectValid());
    it('fails for -4',  () => cgic.withValue(-4).expectInvalid('CGI-C: must be between -3 and 3 (entered: -4)'));
  });
});
```

### 11.5 Testing Cross-Field Validation — Date After Field

```typescript
// validators/date-after-field.validator.spec.ts
import { describe, it } from 'vitest';
import { runValidator }  from '@vialiq/form-validator-sdk/testing';
import { dateAfterField } from './date-after-field.validator';

describe('dateAfterField', () => {
  const validate = runValidator(dateAfterField, {
    startFieldKey: 'aeStartDate',
    label:         'AE Start Date',
  });

  const withDates = (endDate: string, startDate: string | null = '2026-06-01') =>
    validate.withValue(endDate, { formData: { aeStartDate: startDate } });

  it('passes when end is strictly after start',   () => withDates('2026-06-15').expectValid());
  it('fails when end equals start',               () => withDates('2026-06-01').expectInvalid('End date must be after AE Start Date'));
  it('fails when end is before start',            () => withDates('2026-05-31').expectInvalid('End date must be after AE Start Date'));

  it('fails-open when start field is empty',      () => withDates('2026-06-15', '').expectValid());
  it('fails-open when start field is null',       () => withDates('2026-06-15', null).expectValid());
  it('fails-open when start date is invalid',     () => withDates('2026-06-15', 'not-a-date').expectValid());

  it('passes when end value is empty',            () => validate.withValue('').expectValid());
  it('fails when end date itself is invalid',     () =>
    withDates('not-a-date').expectInvalid('Please enter a valid date'));

  it('fails-open when startFieldKey param is missing', () => {
    const v = runValidator(dateAfterField, { label: 'Missing key param' });
    v.withValue('2026-01-01', { formData: { aeStartDate: '2027-01-01' } }).expectValid();
  });
});
```

### 11.6 Testing with Study Metadata

```typescript
// validators/study-window-date.validator.spec.ts
import { describe, it } from 'vitest';
import { runValidator }  from '@vialiq/form-validator-sdk/testing';
import { studyWindowDate } from './study-window-date.validator';

describe('studyWindowDate', () => {
  const validate = runValidator(studyWindowDate, {
    windowStart: '2026-09-01',
    windowEnd:   '2026-09-14',
  });

  const withMeta = (value: string) =>
    validate.withValue(value, { meta: { visitName: 'Week 12' } });

  it('passes for date inside window',    () => withMeta('2026-09-07').expectValid());
  it('passes for window start boundary', () => withMeta('2026-09-01').expectValid());
  it('passes for window end boundary',   () => withMeta('2026-09-14').expectValid());

  it('fails for date before window', () =>
    withMeta('2026-08-31').expectInvalid(/outside the Week 12 window/));
  it('fails for date after window',  () =>
    withMeta('2026-09-15').expectInvalid(/outside the Week 12 window/));

  it('fails for invalid date string', () =>
    withMeta('not-a-date').expectInvalid('Please enter a valid date'));

  it('passes for empty value', () => validate.withValue('').expectValid());

  it('fails-open when params are invalid', () => {
    const bad = runValidator(studyWindowDate, { windowStart: 'bad', windowEnd: 'also-bad' });
    bad.withValue('2026-01-01').expectValid(); // warns and fails-open
  });
});
```

### 11.7 Testing Class-Based Validators

**Option A — Extract core logic into a pure function and test that directly (recommended):**

```typescript
// site-range.validator.ts — extracting testable logic
export function checkSiteRange(
  value: unknown,
  range: { min: number; max: number } | null,
  siteCode: string,
): RuleResult {
  if (value === null || value === undefined || value === '') return pass();
  if (!range) return pass();

  const num = Number(value);
  if (!isFinite(num)) return fail('Must be a number');
  if (num < range.min || num > range.max) {
    return fail(`Value must be between ${range.min} and ${range.max} (site ${siteCode} reference range)`);
  }
  return pass();
}

@Injectable()
export class SiteRangeValidator extends CustomValidator {
  readonly #meta    = inject(STUDY_METADATA);
  readonly #refData = inject(ReferenceDataService);

  factory(_params: Record<string, unknown>): ValidatorFn {
    const range = this.#refData.getRangeForSite(this.#meta.siteCode);
    const site  = this.#meta.siteCode;
    return (value) => checkSiteRange(value, range, site);
  }
}
```

```typescript
// site-range.validator.spec.ts — tests the pure function directly
import { describe, it }       from 'vitest';
import { isRight, isLeft }    from '@vi/state-fp';
import { checkSiteRange }     from './site-range.validator';

describe('checkSiteRange', () => {
  const range = { min: 60, max: 120 };

  it('passes within range',          () => expect(isRight(checkSiteRange(90, range, 'UK-01'))).toBe(true));
  it('fails below min',              () => expect(isLeft(checkSiteRange(59, range, 'UK-01'))).toBe(true));
  it('fails above max',              () => expect(isLeft(checkSiteRange(121, range, 'UK-01'))).toBe(true));
  it('passes when range is null',    () => expect(isRight(checkSiteRange(999, null, 'UK-01'))).toBe(true));
  it('passes for empty value',       () => expect(isRight(checkSiteRange('', range, 'UK-01'))).toBe(true));
  it('fails for non-number',         () => expect(isLeft(checkSiteRange('abc', range, 'UK-01'))).toBe(true));
  it('includes siteCode in message', () => {
    const result = checkSiteRange(200, range, 'UK-01') as any;
    expect(result.left.message).toContain('UK-01');
  });
});
```

**Option B — Angular `TestBed` (when the class must be tested with real DI):**

```typescript
import { TestBed } from '@angular/core/testing';
import { STUDY_METADATA } from '@vialiq/form-renderer';

describe('SiteRangeValidator (TestBed)', () => {
  let validator: SiteRangeValidator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SiteRangeValidator,
        { provide: STUDY_METADATA, useValue: { siteCode: 'UK-01', studyId: 'XYZ' /* ... */ } },
        { provide: ReferenceDataService, useValue: { getRangeForSite: () => ({ min: 60, max: 120 }) } },
      ]
    });
    validator = TestBed.inject(SiteRangeValidator);
  });

  it('passes within range', () => {
    const fn = validator.factory({});
    expect(isRight(fn(90, {}, {} as StudyMeta))).toBe(true);
  });
});
```

### 11.8 Required Test Coverage

Before submitting, cover every category in this table:

| Category | Notes |
|---|---|
| `null` → `pass()` | Always |
| `undefined` → `pass()` | Always |
| `''` (empty string) → `pass()` | Always |
| Valid boundary values (min/max inclusive) | Both boundaries |
| Value inside valid range | At least one mid-range value |
| Below-min, above-max | Both directions |
| Non-numeric input for number fields | e.g. `'abc'`, `true`, `[]` |
| `Infinity` / `-Infinity` for number fields | `!isFinite()` guard |
| `NaN` for number fields | Comes from `Number('abc')` — handle explicitly |
| Invalid date string for date fields | e.g. `'not-a-date'`, `'2026-13-01'` |
| Cross-field: referenced field empty | Fail-open |
| Cross-field: referenced field contains invalid value | Fail-open |
| Missing required `params` key | Fail-open + console.warn |
| `params` with wrong type (e.g. string instead of number) | Fail-open |

---

## 12. Registration and Schema Reference

### 12.1 Registering Validators

```typescript
// app.config.ts — complete example
import { ApplicationConfig }        from '@angular/core';
import { provideValidation }        from '@vialiq/form-renderer';
import { STUDY_METADATA }           from '@vialiq/form-renderer';
import { nhsNumber }                from './validators/nhs-number.validator';
import { dateAfterField }           from './validators/date-after-field.validator';
import { protocolScoreRange }       from './validators/protocol-score-range.validator';
import { studyWindowDate }          from './validators/study-window-date.validator';
import { SiteRangeValidator }       from './validators/site-range.validator';
import { ApprovedMedDRATermValidator } from './validators/medra-term.validator';
import type { MyStudyMeta }         from './types/my-study-meta';

export const appConfig: ApplicationConfig = {
  providers: [
    // Class-based validators must be provided here so Angular can resolve them
    SiteRangeValidator,
    ApprovedMedDRATermValidator,

    // Provide study metadata
    {
      provide: STUDY_METADATA,
      useFactory: (auth: AuthService): MyStudyMeta => ({ ...auth.sessionMeta }),
      deps: [AuthService],
    },

    // Register all custom validators
    provideValidation({
      customValidators: {
        nhsNumber,            // pure function
        dateAfterField,       // pure function (cross-field)
        protocolScoreRange,   // pure function (params-driven)
        studyWindowDate,      // pure function (uses meta)
        siteRange:    SiteRangeValidator,             // class-based
        meddraApproved: ApprovedMedDRATermValidator,  // class-based
      }
    }),
  ]
};
```

### 12.2 Naming Conventions

| Rule | Good example | Bad example |
|---|---|---|
| camelCase | `nhsNumber`, `dateAfterField` | `nhs-number`, `date_after_field` |
| Descriptive of what it checks | `protocolScoreRange`, `studyWindowDate` | `myValidator`, `checkField1` |
| No abbreviations | `positiveInteger` | `posInt` |
| No study-specific prefix in the key | `nhsNumber` | `xyzStudyNhsNumber` |

**Reserved names** (must not be used as custom validator keys): `required`, `range`, `pattern`, `minLength`, `maxLength`, `dateRange`, `relativeDate`, `allowedValues`, `precision`, `wordCount`, `cascade_invalidated`.

### 12.3 Schema Reference — Simple Validator

```json
{
  "key": "participantNhsNumber",
  "type": "text",
  "label": "NHS Number",
  "validation": [
    { "type": "built-in", "ruleId": "required" },
    {
      "type": "built-in",
      "ruleId": "nhsNumber"
    }
  ]
}
```

The `message` field is optional. When omitted, the message produced by `fail()` inside the validator is shown as-is.

### 12.4 Schema Reference — Validator with Params

```json
{
  "key": "hamd17Total",
  "type": "number",
  "label": "HAMD-17 Total Score",
  "validation": [
    { "type": "built-in", "ruleId": "required" },
    {
      "type": "built-in",
      "ruleId": "protocolScoreRange",
      "params": {
        "min": 0,
        "max": 56,
        "scaleName": "HAMD-17"
      },
      "message": "HAMD-17 total must be between 0 and 56 as per protocol §4.2.1"
    }
  ]
}
```

When `message` is provided, it overrides the validator's message in the SYSTEM_VALIDATION record (seen by CDMs). The inline field error still uses the validator's own message. This lets you tune language per audience.

### 12.5 Schema Reference — Cross-Field Validator

```json
{
  "key": "aeEndDate",
  "type": "date",
  "label": "AE End Date",
  "validation": [
    {
      "type": "built-in",
      "ruleId": "dateAfterField",
      "params": {
        "startFieldKey": "aeStartDate",
        "label": "AE Start Date"
      }
    }
  ]
}
```

---

## 13. Security Guidelines

### 13.1 No HTTP Calls Inside Validators

Validators run synchronously on every blur and every save event. HTTP calls will not work correctly:

- `async/await` inside the validator function is silently ignored — the engine does not `await` the result
- `fetch()` without `await` fires a request on every keystroke and returns nothing to the engine

**Pattern to follow:** Load all reference data once at session start (via `FormLoaderService`, an `APP_INITIALIZER`, or a route resolver). Inject the service into a class-based validator. The inner validator function reads from in-memory data only.

```typescript
// ✅ Correct — data loaded at session start, validator reads from memory
@Injectable()
export class MedDRAValidator extends CustomValidator {
  readonly #terms = inject(MedDRAService).preloadedTerms; // Signal<string[]>

  factory(_params: Record<string, unknown>): ValidatorFn {
    const terms = this.#terms(); // read signal once at form load time
    return (value) => {
      if (!terms.includes(String(value))) return fail('Not an approved MedDRA term');
      return pass();
    };
  }
}

// ❌ Wrong — HTTP call inside validator
factory(_params) {
  return async (value) => {
    const terms = await fetch('/api/meddra-terms').then(r => r.json()); // WRONG
    ...
  };
}
```

### 13.2 No `eval()` or Dynamic Code Execution

Do not use `eval()`, `new Function(string)`, or any form of runtime code construction. These allow arbitrary code execution and violate the platform's Content Security Policy.

### 13.3 Synchronous Only

The inner validator function **must be synchronous**. The `ValidatorFn` return type is `RuleResult`, not `Promise<RuleResult>`. The engine does not await the return value. A returned Promise is silently treated as a truthy object (i.e., the field always passes), which is a silent failure.

If you genuinely need asynchronous validation (e.g., real-time duplicate subject ID check), raise it with the platform team — this requires a framework-level feature with loading states and debouncing.

### 13.4 No Side Effects

A validator function must not:
- Mutate `formData`, `params`, or `meta`
- Write to `localStorage`, `sessionStorage`, cookies, or IndexedDB
- Dispatch DOM events, Angular events, or NgRx actions
- Call services that have state-mutating side effects

Treat `formData` and `meta` as `readonly` objects. The engine makes no guarantee about whether the same snapshot is passed to multiple validators.

### 13.5 Performance Constraint

Validators run on every blur event (Phase 1) and on every field during save (Phase 2). They must complete in under **5ms**. Avoid:

- Iterating large arrays (> 10,000 items) inside the inner function
- Complex regex with potential catastrophic backtracking (see §25.2 of `form-builder-validation.md`)
- Repeated string parsing of the same input

All expensive setup should be in the outer `factory()` function.

### 13.6 Message Content

Error messages are stored in audit logs and may be reviewed by regulatory agencies (FDA, EMA, MHRA) during GCP inspections. Never include:
- User identifiers beyond what was entered (e.g., do not look up and echo patient names)
- System internals (stack traces, internal service names, database IDs)
- HTML markup

### 13.7 Regulatory & GCP Considerations

Custom validators are part of a **GCP-regulated** clinical trial data management system. The following rules apply beyond standard software engineering practice:

- **Validation (software QA):** Every custom validator must be tested with documented evidence before the study goes live. See use-cases §16 (Validator Testing & QMS Evidence) for the full specification including ALCOA-compliant manifests and the `runValidator()` testing API.
- **Client-side is UX, not authoritative:** A passing client-side validator does not mean the data is accepted. The server always re-validates on save. A server rejection after a client pass is an expected and correct system behaviour — not a bug.
- **Audit trail:** The `message` field of `fail()` or `warn()` is written into the SYSTEM_VALIDATION record, which is part of the audit trail. Write messages as if they will be read by a regulatory inspector.
- **No clinical decisions in validators:** Validators flag data issues. They must never take autonomous clinical action (auto-correct values, auto-populate fields, send notifications). Those are workflow actions, not validation actions.
- **Fail-open is the correct behaviour for missing data:** If a validator cannot determine whether a value is valid (because a referenced field is empty, a param is missing, or a lookup table is unavailable), it must return `pass()` — not `fail()`. An incorrect hard block on a valid value is more harmful in a clinical context than a missed check that the server will catch.

---

## 14. Examples Gallery

### 14.1 Subject Eligibility — Age at Screening

```typescript
// validators/age-eligibility.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

/**
 * Validates a date-of-birth field against protocol-defined age eligibility.
 * Age is calculated relative to the screening date (read from formData).
 *
 * params.minAge          {number} Min age in years (inclusive). Default: 18.
 * params.maxAge          {number} Max age in years (inclusive). Default: 65.
 * params.screeningDateKey {string} fieldKey of the screening date field. Default: 'screeningDate'.
 */
export const ageEligibility: ValidatorFactory = (params) => {
  const minAge           = typeof params['minAge']           === 'number' ? params['minAge']           : 18;
  const maxAge           = typeof params['maxAge']           === 'number' ? params['maxAge']           : 65;
  const screeningDateKey = typeof params['screeningDateKey'] === 'string' ? params['screeningDateKey'] : 'screeningDate';

  return (value, formData) => {
    if (value === null || value === undefined || value === '') return pass();

    const dob = new Date(String(value));
    if (isNaN(dob.getTime())) return fail('Please enter a valid date of birth');

    const screeningRaw = formData[screeningDateKey];
    const screening    = screeningRaw ? new Date(String(screeningRaw)) : new Date();
    if (isNaN(screening.getTime())) return pass(); // screening date not yet valid — fail-open

    const ageYears = Math.floor(
      (screening.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    if (ageYears < minAge) {
      return fail(`Subject must be at least ${minAge} years old at screening (calculated age: ${ageYears})`);
    }
    if (ageYears > maxAge) {
      return fail(`Subject must be no older than ${maxAge} years at screening (calculated age: ${ageYears})`);
    }

    return pass();
  };
};
```

### 14.2 Weight-Based Dose Check (Cross-Field, params-driven)

```typescript
// validators/weight-based-dose.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

/**
 * Validates that an entered dose is within the acceptable range for the subject's weight.
 * Attach to the dose field.
 *
 * params.dosePerKg     {number} Required. Protocol dose in mg per kg body weight.
 * params.weightFieldKey {string} Required. fieldKey of the weight field.
 * params.tolerancePct  {number} Allowed deviation as a percentage. Default: 10.
 */
export const weightBasedDose: ValidatorFactory = (params) => {
  const dosePerKg     = Number(params['dosePerKg']);
  const weightKey     = String(params['weightFieldKey'] ?? '');
  const tolerancePct  = Number(params['tolerancePct'] ?? 10);

  if (!isFinite(dosePerKg) || !weightKey) {
    console.warn('[weightBasedDose] Missing required params: dosePerKg, weightFieldKey. Failing open.');
    return (_value) => pass();
  }

  return (value, formData) => {
    if (value === null || value === undefined || value === '') return pass();

    const enteredDose = Number(value);
    const weight      = Number(formData[weightKey]);

    if (!isFinite(enteredDose))         return fail('Dose must be a number');
    if (!isFinite(weight) || weight <= 0) return pass(); // weight missing or invalid — fail-open

    const expected   = weight * dosePerKg;
    const tolerance  = expected * (tolerancePct / 100);
    const lo         = (expected - tolerance).toFixed(1);
    const hi         = (expected + tolerance).toFixed(1);

    if (Math.abs(enteredDose - expected) > tolerance) {
      return fail(
        `Dose ${enteredDose}mg is outside the expected range ${lo}–${hi}mg ` +
        `(${dosePerKg}mg/kg × ${weight}kg ± ${tolerancePct}%)`
      );
    }

    return pass();
  };
};
```

### 14.3 Approved MedDRA Term (Class-Based with Service)

```typescript
// validators/meddra-term.validator.ts
import { inject, Injectable } from '@angular/core';
import { CustomValidator, ValidatorFn, pass, fail } from '@vialiq/form-validator-sdk';
import { CodelistService } from '../services/codelist.service';

/**
 * Validates that an AE term matches an approved MedDRA Preferred Term.
 * The approved term list is loaded at session start by CodelistService.
 * No params required.
 */
@Injectable()
export class ApprovedMedDRATermValidator extends CustomValidator {
  readonly #codelist = inject(CodelistService);

  factory(_params: Record<string, unknown>): ValidatorFn {
    // Load the term list once — at factory call time (form load)
    const approvedTerms = new Set(
      this.#codelist.getMedDRATerms().map(t => t.toLowerCase())
    );

    return (value) => {
      if (value === null || value === undefined || value === '') return pass();

      const term = String(value).toLowerCase().trim();

      if (!approvedTerms.has(term)) {
        return fail(
          `"${value}" is not an approved MedDRA Preferred Term. ` +
          'Use the term search to find and select a valid term.'
        );
      }

      return pass();
    };
  }
}
```

### 14.5 BMI Consistency Check (Derived Field, Cross-Field)

```typescript
// validators/bmi-consistency.validator.ts
import { ValidatorFactory, pass, fail, warn } from '@vialiq/form-validator-sdk';

/**
 * Validates that an entered BMI value is consistent with the subject's
 * weight and height on the same form.
 * Attach to the BMI field.
 *
 * params.weightFieldKey {string} fieldKey of the weight field (in kg). Default: 'weight'
 * params.heightFieldKey {string} fieldKey of the height field (in cm). Default: 'height'
 * params.toleranceUnit  {number} Accepted difference in BMI units. Default: 0.5
 *
 * Use case: D1 (Anthropometric calculations) from use-cases §6
 */
export const bmiConsistency: ValidatorFactory = (params) => {
  const weightKey  = String(params['weightFieldKey'] ?? 'weight');
  const heightKey  = String(params['heightFieldKey'] ?? 'height');
  const tolerance  = Number(params['toleranceUnit']  ?? 0.5);

  return (value, formData) => {
    if (value === null || value === undefined || value === '') return pass();

    const enteredBmi = Number(value);
    if (!isFinite(enteredBmi)) return fail('BMI must be a number');

    // Plausibility check — physiological absolute limits
    if (enteredBmi < 10 || enteredBmi > 70) {
      return fail(`BMI of ${enteredBmi} is outside the physiologically possible range (10–70)`);
    }

    const weightKg = Number(formData[weightKey]);
    const heightCm = Number(formData[heightKey]);

    // Fail-open if weight or height is not yet valid
    if (!isFinite(weightKg) || weightKg <= 0) return pass();
    if (!isFinite(heightCm) || heightCm <= 0) return pass();

    const heightM    = heightCm / 100;
    const computed   = weightKg / (heightM * heightM);
    const difference = Math.abs(enteredBmi - computed);

    if (difference > tolerance) {
      return fail(
        `BMI ${enteredBmi.toFixed(1)} does not match the computed value ` +
        `${computed.toFixed(1)} from weight ${weightKg}kg and height ${heightCm}cm ` +
        `(tolerance ±${tolerance})`
      );
    }

    return pass();
  };
};
```

---

### 14.6 Conditional Required — SAE Triggers Notification Date (C2)

```typescript
// validators/conditional-required.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

/**
 * Validates that this field is required when a trigger field has a specific value.
 * Generic — covers all conditional-required patterns in the use-cases doc §5 (C2).
 *
 * params.triggerFieldKey   {string}          Required. fieldKey of the field that drives the condition.
 * params.triggerValue      {unknown}          Required. The value that makes this field required.
 * params.triggerOperator   {string}           Optional. '===' | 'includes'. Default: '==='
 * params.fieldLabel        {string}           Optional. This field's label, for the error message.
 *
 * Example — SAE → notification date required:
 *   { triggerFieldKey: 'aeSerious', triggerValue: 'Y', fieldLabel: 'SAE Notification Date' }
 *
 * Example — CTCAE grade ≥ 3 → dose modification required:
 *   { triggerFieldKey: 'ctcaeGrade', triggerValue: 3,
 *     triggerOperator: '>=', fieldLabel: 'Dose Modification' }
 */
export const conditionalRequired: ValidatorFactory = (params) => {
  const triggerKey      = String(params['triggerFieldKey'] ?? '');
  const triggerValue    = params['triggerValue'];
  const triggerOperator = String(params['triggerOperator'] ?? '===');
  const fieldLabel      = String(params['fieldLabel'] ?? 'This field');

  if (!triggerKey) {
    console.warn('[conditionalRequired] Missing required param: triggerFieldKey. Failing open.');
    return (_value) => pass();
  }

  const isTriggered = (actual: unknown): boolean => {
    switch (triggerOperator) {
      case '===':
        return actual === triggerValue;
      case '!==':
        return actual !== triggerValue;
      case '>=':
        return Number(actual) >= Number(triggerValue);
      case '>':
        return Number(actual) > Number(triggerValue);
      case 'includes':
        return Array.isArray(actual) && actual.includes(triggerValue);
      default:
        return actual === triggerValue;
    }
  };

  return (value, formData) => {
    const triggerActual = formData[triggerKey];

    if (!isTriggered(triggerActual)) return pass(); // condition not met — field is not required

    // Condition is met — this field is now required
    const isEmpty =
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0);

    if (isEmpty) {
      return fail(`${fieldLabel} is required when ${triggerKey} is ${String(triggerValue)}`);
    }

    return pass();
  };
};
```

**Schema usage — AE serious → notification date required:**

```json
{
  "key": "saeNotificationDate",
  "type": "date",
  "label": "SAE Notification Date",
  "validation": [
    {
      "type": "built-in",
      "ruleId": "conditionalRequired",
      "params": {
        "triggerFieldKey": "aeSerious",
        "triggerValue": "Y",
        "fieldLabel": "SAE Notification Date"
      }
    }
  ]
}
```

---

### 14.7 "Other, Specify" Enforcement (C4)

```typescript
// validators/other-specify.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

/**
 * Validates that a free-text "specify" companion field is populated when
 * the trigger codelist field has the value 'OTHER' (or a custom trigger value).
 * Attach to the free-text companion field.
 *
 * params.codelistFieldKey  {string}  Required. fieldKey of the codelist field (e.g. RACE, MED_REASON).
 * params.triggerValue      {string}  Optional. The value that triggers this field. Default: 'OTHER'
 * params.minLength         {number}  Optional. Minimum characters required. Default: 3
 * params.fieldLabel        {string}  Optional. Label for error message.
 *
 * Use case: C4 from use-cases §5
 */
export const otherSpecify: ValidatorFactory = (params) => {
  const codelistKey  = String(params['codelistFieldKey'] ?? '');
  const triggerValue = String(params['triggerValue'] ?? 'OTHER');
  const minLength    = typeof params['minLength'] === 'number' ? params['minLength'] : 3;
  const fieldLabel   = String(params['fieldLabel'] ?? 'This field');

  if (!codelistKey) {
    console.warn('[otherSpecify] Missing required param: codelistFieldKey. Failing open.');
    return (_value) => pass();
  }

  return (value, formData) => {
    const codelistValue = formData[codelistKey];

    // Trigger not met — this field is not required
    if (codelistValue !== triggerValue) return pass();

    // Trigger met — free-text must be populated
    if (value === null || value === undefined || value === '') {
      return fail(`${fieldLabel} is required when "${triggerValue}" is selected`);
    }

    const text = String(value).trim();
    if (text.length < minLength) {
      return fail(
        `${fieldLabel} must be at least ${minLength} characters when "${triggerValue}" is selected ` +
        `(entered: ${text.length} character${text.length === 1 ? '' : 's'})`
      );
    }

    // Reject placeholder entries that are obviously not clinical text
    const invalid = ['other', 'n/a', 'na', 'none', 'unknown', '-', '.'];
    if (invalid.includes(text.toLowerCase())) {
      return fail(
        `${fieldLabel}: please provide a specific description rather than "${text}"`
      );
    }

    return pass();
  };
};
```

---

### 14.8 Unit–Value Pairing — Glucose (C5)

```typescript
// validators/unit-aware-range.validator.ts
import { ValidatorFactory, pass, fail, warn } from '@vialiq/form-validator-sdk';

/**
 * Validates a numeric field against a range that depends on the selected unit.
 * Attach to the value field; the unit field is referenced via formData.
 *
 * params.unitFieldKey          {string}  Required. fieldKey of the companion unit selector.
 * params.ranges                {object}  Required. Map of unit → { hardMin, hardMax, softMin, softMax }.
 * params.suggestConversionUnit {string}  Optional. If entered value matches another unit's range,
 *                                        suggest that the user may have used the wrong unit.
 *
 * Use case: C5 (Unit–value pairing) from use-cases §5
 *
 * Example — Glucose:
 *   unitFieldKey: 'glucoseUnit',
 *   ranges: {
 *     'mmol/L': { hardMin: 1.0,  hardMax: 55,  softMin: 2.5,  softMax: 30 },
 *     'mg/dL':  { hardMin: 18,   hardMax: 990, softMin: 45,   softMax: 540 }
 *   },
 *   suggestConversionUnit: 'mmol/L'
 */
export const unitAwareRange: ValidatorFactory = (params) => {
  const unitKey     = String(params['unitFieldKey'] ?? '');
  const ranges      = params['ranges'] as Record<string, {
    hardMin: number; hardMax: number;
    softMin?: number; softMax?: number;
  }>;
  const suggestUnit = typeof params['suggestConversionUnit'] === 'string'
    ? params['suggestConversionUnit']
    : null;

  if (!unitKey || !ranges || typeof ranges !== 'object') {
    console.warn('[unitAwareRange] Missing required params: unitFieldKey, ranges. Failing open.');
    return (_value) => pass();
  }

  return (value, formData) => {
    if (value === null || value === undefined || value === '') return pass();

    const num  = Number(value);
    if (!isFinite(num)) return fail('Must be a valid number');

    const unit = String(formData[unitKey] ?? '');
    if (!unit) return pass(); // unit not yet selected — fail-open

    const range = ranges[unit];
    if (!range) return pass(); // unit not in config — fail-open (unknown unit)

    // Hard limits
    if (num < range.hardMin || num > range.hardMax) {
      // Check if the value makes sense in a different unit — helpful UX hint
      let hint = '';
      if (suggestUnit && suggestUnit !== unit) {
        const altRange = ranges[suggestUnit];
        if (altRange && num >= altRange.softMin! && num <= altRange.softMax!) {
          hint = ` (did you mean ${num} ${suggestUnit}?)`;
        }
      }
      return fail(
        `${num} ${unit} is outside the valid range ` +
        `(${range.hardMin}–${range.hardMax} ${unit})${hint}`
      );
    }

    // Soft limits — warn but don't block
    if (
      range.softMin !== undefined && range.softMax !== undefined &&
      (num < range.softMin || num > range.softMax)
    ) {
      return warn(
        `${num} ${unit} is outside the expected range ` +
        `(${range.softMin}–${range.softMax} ${unit}). Please confirm.`
      );
    }

    return pass();
  };
};
```

**Schema usage — Glucose field:**

```json
{
  "key": "glucoseValue",
  "type": "number",
  "label": "Fasting Glucose",
  "validation": [
    {
      "type": "built-in",
      "ruleId": "unitAwareRange",
      "params": {
        "unitFieldKey": "glucoseUnit",
        "ranges": {
          "mmol/L": { "hardMin": 1.0, "hardMax": 55,  "softMin": 2.5, "softMax": 30 },
          "mg/dL":  { "hardMin": 18,  "hardMax": 990, "softMin": 45,  "softMax": 540 }
        },
        "suggestConversionUnit": "mmol/L"
      }
    }
  ]
}
```

---

### 14.9 PHQ-9 Item 9 Suicidality Safety Alert (D3.4)

```typescript
// validators/phq9-item9-safety.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

/**
 * PHQ-9 Item 9 — Suicidal ideation safety alert.
 * Any response ≥ 1 must trigger a mandatory safety notification workflow.
 * This validator hard-blocks saving until the site confirms they have
 * followed the safety protocol.
 *
 * A score ≥ 1 on this item is not an error in the data — the data is valid.
 * However, the EDC must not allow the form to be saved without the site
 * acknowledging the safety escalation requirement.
 *
 * params.acknowledgementFieldKey {string}  fieldKey of the safety acknowledgement checkbox.
 *                                           Default: 'phq9Item9SafetyAcknowledged'
 *
 * Use case: D3.4 from use-cases §6
 */
export const phq9Item9Safety: ValidatorFactory = (params) => {
  const ackKey = String(
    params['acknowledgementFieldKey'] ?? 'phq9Item9SafetyAcknowledged'
  );

  return (value, formData) => {
    if (value === null || value === undefined || value === '') return pass();

    const score = Number(value);
    if (!isFinite(score) || score < 0 || score > 3) return pass(); // bounds handled elsewhere

    if (score === 0) return pass(); // no suicidal ideation reported

    // Score ≥ 1: suicidal ideation present
    // The site must acknowledge the safety escalation before saving
    const acknowledged = formData[ackKey];
    const isAcknowledged =
      acknowledged === true ||
      acknowledged === 'true' ||
      acknowledged === 'Y' ||
      acknowledged === 1;

    if (!isAcknowledged) {
      return fail(
        'PHQ-9 Item 9 score ≥ 1 indicates suicidal ideation. ' +
        'Please follow the study safety protocol and tick the acknowledgement ' +
        'checkbox to confirm this has been actioned before saving.'
      );
    }

    return pass();
  };
};
```

---

### 14.10 CTCAE Grade vs Outcome Consistency (F3)

```typescript
// validators/ctcae-grade-outcome.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

/**
 * Validates that a CTCAE grade value is consistent with the AE outcome field.
 * - Grade 5 = death → outcome must be 'FATAL' and death date must be populated.
 * - Grade 0 is not valid for an AE that is present.
 * Attach to the CTCAE grade field.
 *
 * params.outcomeFieldKey   {string}  fieldKey of the AE outcome field. Default: 'aeOutcome'
 * params.deathDateFieldKey {string}  fieldKey of the subject death date. Default: 'deathDate'
 *
 * Use case: F3 (CTCAE grade logic) from use-cases §8
 */
export const ctcaeGradeOutcome: ValidatorFactory = (params) => {
  const outcomeKey   = String(params['outcomeFieldKey']   ?? 'aeOutcome');
  const deathDateKey = String(params['deathDateFieldKey'] ?? 'deathDate');

  return (value, formData) => {
    if (value === null || value === undefined || value === '') return pass();

    const grade = Number(value);
    if (!Number.isInteger(grade)) return fail('CTCAE grade must be a whole number');

    // Grade 0 — not valid for an adverse event that is present on this form
    if (grade === 0) {
      return fail(
        'CTCAE grade 0 means no adverse event. ' +
        'If the AE is present, grade must be 1–5.'
      );
    }

    // Grade outside 1–5
    if (grade < 1 || grade > 5) {
      return fail(`CTCAE grade must be 1–5 (entered: ${grade})`);
    }

    // Grade 5 = death — outcome and death date must be consistent
    if (grade === 5) {
      const outcome   = formData[outcomeKey];
      const deathDate = formData[deathDateKey];

      if (outcome !== 'FATAL') {
        return fail(
          'CTCAE grade 5 indicates a fatal outcome. ' +
          'AE Outcome must be set to "FATAL".'
        );
      }

      if (!deathDate) {
        return fail(
          'CTCAE grade 5 indicates a fatal outcome. ' +
          'Death Date must be populated.'
        );
      }
    }

    return pass();
  };
};
```

---

### 14.4 Treatment Arm Constraint (using `meta`)

```typescript
// validators/treatment-arm-constraint.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';
import type { MyStudyMeta }            from '../types/my-study-meta';

/**
 * Validates a value differently based on the subject's treatment arm.
 * Only meaningful when the study uses MyStudyMeta with a treatmentArm property.
 *
 * params.placeboMaxValue {number} Maximum allowed value for placebo arm subjects. Default: 0.
 */
export const treatmentArmConstraint: ValidatorFactory = (params) => {
  const placeboMax = typeof params['placeboMaxValue'] === 'number' ? params['placeboMaxValue'] : 0;

  return (value, _formData, meta) => {
    if (value === null || value === undefined || value === '') return pass();

    const myMeta = meta as MyStudyMeta;
    const num    = Number(value);

    if (!isFinite(num)) return fail('Must be a number');

    if (myMeta.treatmentArm === 'placebo' && num > placeboMax) {
      return fail(
        `Placebo arm subjects must have a value of ${placeboMax} or less for this field`
      );
    }

    return pass();
  };
};
```

---

## 15. Pre-Submission Checklist

Complete this checklist before merging a custom validator into the study codebase.

### Code Quality
- [ ] File is in `src/validators/` and named `{rule-id}.validator.ts`
- [ ] Exported from `src/validators/index.ts`
- [ ] JSDoc comment on the exported factory explains: what it validates, all params (required/optional, types, defaults)
- [ ] The `ruleId` (registry key) does not conflict with any built-in name

### Correctness
- [ ] Empty / null / undefined → `pass()` (let `required` handle emptiness)
- [ ] `Infinity` and `-Infinity` handled for number fields (`!isFinite()` guard)
- [ ] `NaN` handled for number fields
- [ ] Invalid date strings handled for date fields
- [ ] Cross-field: referenced field empty or invalid → `pass()` (fail-open)
- [ ] Missing required `params` → `pass()` + `console.warn()` — never throws
- [ ] No side effects inside the inner function

### Security
- [ ] No `fetch()`, `XMLHttpRequest`, or any HTTP call inside the inner function
- [ ] No `eval()` or `new Function()`
- [ ] `formData`, `meta`, and `params` are treated as read-only
- [ ] Error messages contain no sensitive data, system internals, or HTML

### Performance
- [ ] All expensive computation is in the outer `factory()` function
- [ ] Inner function completes in < 5ms for typical inputs

### Tests
- [ ] All categories from §11.8 are covered
- [ ] Empty/null/undefined: 3 tests
- [ ] Boundary values (min, max): both inclusive
- [ ] Below-min and above-max
- [ ] Invalid input types (non-numeric, invalid date)
- [ ] Missing params: fails-open
- [ ] All tests pass: `npx nx run {project}:test`

### Schema
- [ ] A schema JSON example is written and reviewed with the study designer
- [ ] All `params` used in the schema match the param keys the validator reads
- [ ] `ruleId` in schema JSON matches the registry key exactly

---

## 16. Client vs Server Execution Boundary

This section defines which custom programming use cases belong to the SDK (client-side) and which require server-side implementation. This is the most important architectural decision for study programmers: **building a client-side validator for a server-only use case is wasted effort and creates a false sense of coverage.**

The full use case taxonomy with clinical detail is in [form-builder-custom-programming-use-cases.md](./form-builder-custom-programming-use-cases.md).

---

### 16.1 The Rule

> **Client-side validators are user experience. Server-side validators are data integrity.**

A check implemented only in this SDK provides UX feedback — it helps the site user correct mistakes before saving. It **does not** prevent bad data from reaching the database if the server accepts it. Any check that matters for subject safety, regulatory compliance, or data integrity must also exist server-side.

A check implemented server-side but not client-side shows errors only after the user clicks Save. This is acceptable (and sometimes necessary), but provides a worse user experience.

The optimal solution for most checks is **both**: client for immediate feedback, server for integrity enforcement. The server result is the legal record.

---

### 16.2 Use Case Categories by Execution Layer

| Category | Client SDK | Server | Notes |
|---|---|---|---|
| **A. Identifier & format** | ✅ Primary | ✅ Duplicate | Format checks are pure functions \u2014 ideal for SDK. Server duplicates for integrity. |
| **B. Single-field range** | ✅ Primary | ✅ Duplicate | Hard limits: both. Soft/warn ranges: client SDK `warn()`, server creates query. |
| **C. Intra-form cross-field** | ✅ Primary | ✅ Duplicate | All `formData` is available on client. Server is authoritative. |
| **D. Derived / calculated** | ✅ for simple | ✅ for complex | Simple formulas (BMI, score sums): both. Dose intensity, baseline PCHG: server only. |
| **E. Protocol eligibility** | ✅ for individual checks | ✅ for gating | Individual threshold checks: client. Randomisation gating: server only \u2014 cannot allow randomisation without server confirmation. |
| **F. Safety / pharmacovigilance** | ✅ for same-form temporal | ✅ Authoritative | AE start/end on same form: client. SAE reporting timelines, SUSAR workflows: server only. |
| **G. Population-specific** | ✅ Primary | ✅ Duplicate | Paediatric bands, gender ranges, biomarker rules: client (all data in `formData` + `meta`). |
| **H. Cross-form / cross-visit** | ❌ Never | ✅ Only | Cannot be done client-side \u2014 requires DB access. See §16.4. |
| **I. Instrument / PRO** | ✅ Primary | ✅ Duplicate | Item bounds, total sum, imputation rules: client. Administration timing compliance: server. |
| **Medical Coding (MedDRA/WHODrug)** | ✅ Format only | ✅ Hierarchy | Client: 8-digit code format, ATC format, version match. Server: all hierarchy and existence checks. |

---

### 16.3 What Is Always Client-Side

These checks are **exclusively or primarily the client SDK's responsibility**. They need no database access and execute correctly from `value`, `formData`, and `meta` alone:

| Check type | Example |
|---|---|
| Check digit algorithms | NHS Number Modulus 11, CPF, BSN Elfproef, EAN-13 |
| Regex / format validation | Subject number format, ATC code pattern, date format |
| Score range bounds | HAMD-17 total must be 0\u201356, CTCAE grade must be 1\u20135 |
| Cross-field date ordering (same form) | AE end date after AE start date |
| Conditional required (same form) | If AE Serious = Y \u2192 Notification Date required |
| "Other, specify" enforcement | RACE = OTHER \u2192 free-text required |
| Unit\u2013value pairing | Glucose range changes based on selected unit |
| BMI / BSA formula consistency | Computed vs entered value within tolerance |
| Score item sum validation | PHQ-9 total = sum of 9 items |
| PHQ-9 item 9 safety acknowledgement | Grade \u2265 1 requires site acknowledgement on same form |
| Paediatric age-band checks | Subject age within ICH E11A band |
| Gender-adjusted lab plausibility | Haemoglobin range differs by sex (from `_carried.DM.SEX`) |

---

### 16.4 What Is Always Server-Side

These checks **cannot be implemented in this SDK**. Do not attempt them here:

| Check type | Why not client-side |
|---|---|
| Cross-visit data (baseline vs follow-up, delta checks) | Prior visit data is not in `formData` |
| Visit window compliance | Day 1 date is on a different form |
| Prior therapy washout | Prior therapy end date is on the Medical History form |
| Informed consent date before all procedures | ICF date is on the Consents form |
| SAE SUSAR regulatory timeline (7/15-day) | Requires SAE workflow dates across multiple forms |
| RECIST tumour response confirmation | Requires index lesion data from two timepoints |
| MedDRA PT\u2192SOC hierarchy validation | Requires licensed MedDRA database |
| WHODrug DRN existence and ATC hierarchy | Requires licensed WHODrug database |
| Randomisation gating | Cannot allow randomisation without server confirmation |
| Audit trail / query history checks | Not available on the client |
| Overall survival / PFS derivation | Requires all visit data at data lock |

When a server check fails, the server returns `ServerValidationError[]` from the `onSubmit()` handler. The renderer propagates these as `SYSTEM_VALIDATION` records, which display as field-level errors in the UI. The site sees them and can correct or query them. No client-side validator is needed for these \u2014 the server response handles it.

---

### 16.5 The `_carried.*` Pattern for Near-Cross-Form Checks

Some checks appear cross-form but can be done client-side if the required data is **carried forward** from the server when the form loads. The server pre-populates these as read-only `_carried.*` fields:

```typescript
// Available to validators as formData keys:
formData['_carried.DM.SEX']       // \u2192 gender-adjusted ranges
formData['_carried.DM.DOB']       // \u2192 age at consent, paediatric banding
formData['_carried.SCR.EGFR']     // \u2192 renal impairment stratum for dose check
formData['_carried.SCR.WEIGHT']   // \u2192 weight-based dose calculation
formData['_carried.RAND.ARM']     // \u2192 treatment arm constraint
```

**Example \u2014 age-at-consent check using carried DOB:**

```typescript
export const ageAtConsent: ValidatorFactory = (params) => {
  const minAge = typeof params['minAge'] === 'number' ? params['minAge'] : 18;

  return (value, formData) => {
    if (!value) return pass();

    const icfDate = new Date(String(value));
    const dobRaw  = formData['_carried.DM.DOB'];

    if (!dobRaw) return pass(); // DOB not yet available \u2014 fail-open
    const dob = new Date(String(dobRaw));

    const ageYears = (icfDate.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

    if (ageYears < minAge) {
      return fail(
        `Subject was ${Math.floor(ageYears)} years old at consent. ` +
        `Minimum age for this study is ${minAge}.`
      );
    }

    return pass();
  };
};
```

The server is still authoritative \u2014 it re-validates the same rule on save. The client validator provides the immediate UX feedback.

---

### 16.6 Decision Flowchart for New Checks

When a study programmer receives a new edit-check requirement from the data manager, apply this decision tree:

```
Does the check require data from another form or another visit?
  Yes \u2192 SERVER ONLY. Do not write a client-side validator.
         Make sure the server team implements the server-side check.
         The server error will surface via SYSTEM_VALIDATION on submit.

  No  \u2192 Does the check require a licensed dictionary (MedDRA, WHODrug)?
          Yes \u2192 SERVER for hierarchy/existence.
                  CLIENT for format only (8-digit code, ATC pattern).
          No  \u2192 Write a custom validator in this SDK.
                  Also request a server duplicate for data integrity.
                  Tag the check as \ud83d\udda5\ud83d\udda7 BOTH in the Data Management Plan.
```

---

### 16.7 Coordinating with the Server Team

For checks implemented in **both** layers, the client and server must agree on:

1. **The rule definition:** Exactly the same threshold, operator, and comparison semantics
2. **The error message:** Server message may differ (CDM-facing) from client message (site-facing)
3. **The field key:** Server uses SDTM variable names (e.g., `AETERM`); client uses schema keys (e.g., `aeVerbatim`). Ensure the mapping is documented in the DMP.
4. **The trigger:** Client fires on blur; server fires on save. Both must produce an error in the same situation.

Discrepancies between client and server behaviour must be documented as a query and resolved before study go-live.
