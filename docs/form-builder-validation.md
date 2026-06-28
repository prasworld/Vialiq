# Form Builder — Validation Framework

> **Status:** Approved Design — v1 Renderer  
> **Date:** 2026-05-27  
> Related docs: [architecture](./form-builder-architecture.md) · [schema](./form-builder-schema.md) · [renderer](./form-builder-renderer.md) · [technical-debt](./form-builder-technical-debt.md) · [roadmap](./form-builder-roadmap.md)

**References:**
- [json-logic specification](https://jsonlogic.com/) · [json-logic operations](https://jsonlogic.com/operations.html) · [json-logic-js (npm)](https://github.com/jwadhams/json-logic-js)
- [Functor (functional programming)](https://en.wikipedia.org/wiki/Functor_(functional_programming)) · [Monad (functional programming)](https://en.wikipedia.org/wiki/Monad_(functional_programming))
- [Mostly Adequate Guide to FP](https://mostly-adequate.gitbook.io/mostly-adequate-guide/)
- [@vi/state-fp](../libs/state-fp/src/index.ts) — internal FP primitives used throughout
- [SCDM Edit Check Design Principles](https://scdm.org/wp-content/uploads/2024/05/Edit-Check-Design-Principles.pdf)
- [Angular Signals](https://angular.dev/guide/signals)
- [missing_some operator](https://jsonlogic.com/operations.html#missing_some)

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Architecture Overview — Three Layers](#2-architecture-overview--three-layers)
3. [TypeScript Type System](#3-typescript-type-system)
4. [Layer 1 — Built-in Validator Library](#4-layer-1--built-in-validator-library)
5. [Layer 2 — Study-Configured Rules (json-logic)](#5-layer-2--study-configured-rules-json-logic)
6. [The UI Query Builder](#6-the-ui-query-builder)
7. [Validation Execution Engine](#7-validation-execution-engine)
8. [Value-Change Guard — The Core Invariant](#8-value-change-guard--the-core-invariant)
9. [Two-Phase Validation Model](#9-two-phase-validation-model)
10. [SYSTEM_VALIDATION Record Model](#10-system_validation-record-model)
11. [State Management — NgRx / state-fp Integration](#11-state-management--ngrx--state-fp-integration)
12. [Functional Programming Paradigms](#12-functional-programming-paradigms)
13. [Cross-Field Validation](#13-cross-field-validation)
14. [Cascade Codelist Validation](#14-cascade-codelist-validation)
15. [Reload — Surfacing Persisted Queries](#15-reload--surfacing-persisted-queries)
16. [Schema Changes Required](#16-schema-changes-required)
17. [Testing Strategy](#17-testing-strategy)
18. [Implementation Checklist](#18-implementation-checklist)
19. [Pre-Implementation Decision Register](#19-pre-implementation-decision-register)
20. [Renderer Integration — Signal-Based Wiring](#20-renderer-integration--signal-based-wiring)
21. [Hidden Field Validation Skip Rule](#21-hidden-field-validation-skip-rule)
22. [Repeating Field Validation](#22-repeating-field-validation)
23. [Angular Bootstrap Setup](#23-angular-bootstrap-setup)
24. [Accessibility — Error Display Specification](#24-accessibility--error-display-specification)
25. [Security Considerations](#25-security-considerations)
26. [Encrypted Field Exclusion from Edit Checks](#26-encrypted-field-exclusion-from-edit-checks)

---

## 1. Design Philosophy

### 1.1 Guiding Principles

**Validation is an act of reviewing a change, not a periodic recheck of stored data.**

If a field value has not changed since the last save, re-running its validators produces no new information. Re-raising queries the Data Manager has already reviewed and closed is clinically incorrect and erodes trust in the system. The entire framework is designed around this invariant.

**Validation never blocks data entry.**

In an EDC system, a site investigator must always be able to save data — even if that data violates a validation rule. The rule failure is recorded as a `SYSTEM_VALIDATION` query for clinical data management review. This is fundamentally different from web form validation where a form cannot be submitted until all rules pass.

**One failure → one record.**

Each rule that fails for a given field raises exactly one `SYSTEM_VALIDATION` record identified by `(formInstanceId, fieldKey, ruleId)`. No duplicates. No aggregates. This makes partial resolution and audit trails clean and debuggable.

**Client-side and server-side use the same rules.**

`json-logic` rules are pure JSON. The same rule JSON is evaluated by `json-logic-js` in the browser (for instant data-entry feedback) and by the server (for authoritative SYSTEM_VALIDATION creation). There is no rule duplication, no rule drift.

### 1.2 Functional Programming Rationale

Validation is a natural fit for functional programming:

- A validator is a **pure function**: `(value, params, formData) → RuleResult`. Same input always produces the same output. No side effects.
- Composing validators is **functor/monad composition**: running multiple validators over the same input and collecting errors without mutation.
- The `RuleResult` type is an **`Either` monad**: `Either<ValidationError, void>` — a typed disjoint union of failure (Left) and success (Right). Errors are values, not exceptions.
- Collecting errors across multiple rules without short-circuiting is the **`Validation` applicative** pattern (not `Either`, which would stop at first error).
- The `lastValidatedValue` guard exploits the referential transparency of pure functions: if the input hasn't changed, the output hasn't changed.
- The full validation pipeline is a **composed sequence of HOFs**: `guard → evaluate → reconcile → persist`.

The codebase uses `@vi/state-fp` for `Maybe`, `Either`, `pipe`, `compose`, and related primitives. See [`libs/state-fp/src/index.ts`](../libs/state-fp/src/index.ts).

---

## 2. Architecture Overview — Three Layers

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Layer 1 — Built-in Validator Library                                        │
│  ─────────────────────────────────────────────────────────────────────────   │
│  Platform-owned. Immutable logic. Studies configure parameters only.         │
│  required · range · pattern · minLength · maxLength · dateRange ·            │
│  relativeDate · allowedValues · precision · wordCount · cascade_invalidated  │
│                                                                              │
│  libs/form-renderer/src/validation/built-in/                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│  Layer 2 — Study-Configured Rules (json-logic)                               │
│  ─────────────────────────────────────────────────────────────────────────   │
│  Defined in builder UI (Query Builder). Stored as JSON in schema.            │
│  Evaluated client-side and server-side via json-logic-js.                    │
│  Supports: AND · OR · NOT · if · between · in · missing_some · var           │
│                                                                              │
│  libs/form-renderer/src/validation/json-logic/                               │
├──────────────────────────────────────────────────────────────────────────────┤
│  Layer 3 — Validation Execution Engine                                       │
│  ─────────────────────────────────────────────────────────────────────────   │
│  ValidationEngine service: orchestrates the full pipeline                    │
│  · value-change guard (skip unchanged fields)                                │
│  · rule evaluation (Layer 1 + Layer 2) with accumulation                     │
│  · Phase 1 inline feedback (data entry, no persistence)                      │
│  · Phase 2 SYSTEM_VALIDATION reconciliation (on save, persisted)             │
│                                                                              │
│  libs/form-renderer/src/validation/engine/                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

**What is NOT in scope for this document (Phase 3 / TD-12 / TD-13):**
- `EC_QUERIES` — Edit Check queries generated by server-side rules engines (TD-13)
- `USER_QUERIES` — manually raised by CDM staff (functional product layer)
- Custom programming validators loaded from CDN (TD-12)
- Multilingual validation messages (TD-11)

---

## 3. TypeScript Type System

All types live in `libs/form-renderer/src/validation/types.ts`.

```typescript
import type { Either } from '@vi/state-fp';

// ─── Rule Definition ─────────────────────────────────────────────────────────

/**
 * A single validation rule attached to a field.
 * Each rule that fails raises exactly one SYSTEM_VALIDATION record.
 *
 * Discriminated union: narrowed by the 'type' field.
 */
export type ValidationRule =
  | BuiltInRule
  | JsonLogicRule;

/** A rule backed by a platform-owned, immutable validator function. */
export interface BuiltInRule {
  readonly ruleId: string;          // e.g. 'required', 'range', 'pattern'
  readonly type: 'built-in';
  readonly params?: Record<string, unknown>;

  /** Overrides the validator's default message if provided. */
  readonly message?: string;

  /**
   * Conditional activation: rule only evaluates when this json-logic expression
   * returns truthy. If omitted, rule is always active.
   * Allows "required when X = Y" patterns without a separate rule type.
   *
   * Reference: https://jsonlogic.com/operations.html
   */
  readonly activeWhen?: JsonLogicExpression;

  /**
   * Cross-field: raise the SYSTEM_VALIDATION on a different field.
   * If omitted, raised on the field that owns this rule (source field).
   */
  readonly targetFieldKey?: string;

  /**
   * Audit trail template. Tokens: {{sourceField}}, {{sourceValue}}.
   * Example: "Revalidated because {{sourceField}} changed to '{{sourceValue}}'"
   */
  readonly auditReason?: string;
}

/** A rule expressed in json-logic. Evaluated by json-logic-js. */
export interface JsonLogicRule {
  readonly ruleId: string;
  readonly type: 'json-logic';

  /**
   * The json-logic expression.
   * Must return truthy for PASS, falsy for FAIL.
   *
   * Data context available inside the expression:
   *   { "var": "value" }             → the field's current value
   *   { "var": "formData.fieldKey" } → any other field's current value
   *
   * Reference: https://jsonlogic.com/operations.html
   */
  readonly rule: JsonLogicExpression;
  readonly message: string;
  readonly activeWhen?: JsonLogicExpression;
  readonly targetFieldKey?: string;
  readonly auditReason?: string;
}

/** Raw json-logic expression — any JSON-serialisable structure. */
export type JsonLogicExpression = Record<string, unknown>;


// ─── Validation Result ────────────────────────────────────────────────────────

/**
 * The result of evaluating a single rule against a value.
 *
 * Modelled as Either<ValidationError, void>:
 *   - Right(void)           → rule passed
 *   - Left(ValidationError) → rule failed, carrying the error as a value
 *
 * Using Either (not throwing) keeps evaluation pure.
 * Either is a Monad: it supports map, chain, fold — enabling pipeline composition.
 *
 * Left = failure (has error message)
 * Right = success (void — no meaningful success value)
 *
 * Reference: @vi/state-fp Either — libs/state-fp/src/core/either.ts
 */
export type RuleResult = Either<ValidationError, void>;

export interface ValidationError {
  readonly ruleId: string;
  readonly message: string;
  readonly targetFieldKey?: string;
  readonly auditReason?: string;
}

/**
 * Aggregate result across all rules for a single field.
 *
 * Unlike Either (which short-circuits on first Left), this ACCUMULATES
 * all failures. This is the Validation applicative pattern.
 *
 * Pseudocode:
 *   FieldValidationResult ≈ Validation<ValidationError[], void>
 *   where Validation is the non-short-circuiting variant of Either
 *
 * Distinct from Either because error collection uses (<>) = Array.concat,
 * not the first-error-wins semantics of monadic bind.
 */
export type FieldValidationResult =
  | { readonly _tag: 'Valid' }
  | { readonly _tag: 'Invalid'; readonly errors: ReadonlyArray<ValidationError> };

export const valid = (): FieldValidationResult => ({ _tag: 'Valid' });
export const invalid = (errors: ReadonlyArray<ValidationError>): FieldValidationResult =>
  ({ _tag: 'Invalid', errors });


// ─── Field Validation State (in NgRx store) ───────────────────────────────────

/**
 * Per-field state slice managed in the NgRx / state-fp store.
 */
export interface FieldValidationState {
  /** Current live value (may differ from savedValue during editing). */
  readonly value: unknown;

  /** Last value confirmed by a successful backend save. */
  readonly savedValue: unknown;

  /**
   * Value at the time validation last ran for this field.
   * Persisted to backend on save. Loaded from backend on form open.
   *
   * THE CORE INVARIANT:
   *   Phase 2 validation only fires when value !== lastValidatedValue.
   *   If equal, all existing SYSTEM_VALIDATION records are left untouched.
   */
  readonly lastValidatedValue: unknown;

  /**
   * Inline errors from Phase 1 (data entry). Not persisted.
   * Shown as red text immediately beneath the control.
   * These are NOT SYSTEM_VALIDATION records.
   */
  readonly inlineErrors: ReadonlyArray<ValidationError>;

  /**
   * Open SYSTEM_VALIDATION records loaded from backend.
   * Updated on form load and on save response.
   */
  readonly systemQueries: ReadonlyArray<SystemValidationRecord>;
}


// ─── SYSTEM_VALIDATION Record ─────────────────────────────────────────────────

export type SystemValidationStatus =
  | 'open'             // validation failed, not yet reviewed by CDM
  | 'auto_resolved'    // value corrected — rule now passes
  | 'manually_closed'  // CDM reviewed, accepted despite rule failure
  | 'cancelled';       // query raised in error — CDM cancelled it

export interface SystemValidationRecord {
  readonly id: string;              // UUID
  readonly formInstanceId: string;  // which form record
  readonly fieldKey: string;        // field with the validation failure
  readonly ruleId: string;          // which rule failed
  readonly message: string;         // snapshot of message at raise time
  readonly status: SystemValidationStatus;
  readonly createdAt: string;       // ISO-8601
  readonly resolvedAt: string | null;
  readonly saveSessionId: string;   // UUID grouping records from one save action
}
```

---

## 4. Layer 1 — Built-in Validator Library

### 4.1 The ValidatorFactory HOF

```typescript
// libs/form-renderer/src/validation/built-in/types.ts

/**
 * Higher-Order Function pattern: the factory takes configuration params and
 * returns a validator function. This enables partial application — params are
 * bound once at form-init time, then the returned function is called on every
 * value change with minimal overhead.
 *
 *   ValidatorFactory :: (params) → (value, formData) → RuleResult
 *
 * This is a curried function. Currying is a foundational HOF technique:
 * it converts an n-arity function into a chain of 1-arity functions,
 * enabling partial application at each stage.
 *
 * The returned function (ValidatorFn) has a uniform signature, making it
 * composable regardless of which rule type it came from.
 */
export type ValidatorFactory =
  (params: Record<string, unknown>) =>
  (value: unknown, formData: Record<string, unknown>) =>
  RuleResult;
```

### 4.2 Functor Lifting Utility

```typescript
// libs/form-renderer/src/validation/built-in/validators.ts

import { left, right } from '@vi/state-fp';
import type { RuleResult, ValidatorFactory } from './types.js';

/**
 * HOF: lifts a plain boolean predicate into the RuleResult (Either) context.
 *
 * This is a Functor lifting operation:
 *   lift :: (A → Bool) → (A → Either<Err, void>)
 *
 * A Functor is a type that can be mapped over while preserving structure.
 * Here we're lifting a function from (A → Bool) into (A → Either<Err, void>),
 * "mapping" the target category from Bool to Either.
 *
 * Reference: https://en.wikipedia.org/wiki/Functor_(functional_programming)
 */
const liftPredicate =
  (predicate: (value: unknown) => boolean, message: string) =>
  (value: unknown): RuleResult =>
    predicate(value) ? right(undefined) : left({ ruleId: '__lifted__', message });
```

### 4.3 Built-in Validator Implementations

```typescript
// ─── required ─────────────────────────────────────────────────────────────────

/**
 * Passes if value is non-null, non-undefined, non-empty-string.
 * For checkbox groups: passes if array is non-empty.
 */
export const requiredValidator: ValidatorFactory =
  (_params) => (value, _formData): RuleResult => {
    const isEmpty =
      value == null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0);
    return isEmpty
      ? left({ ruleId: 'required', message: 'This field is required' })
      : right(undefined);
  };


// ─── range ────────────────────────────────────────────────────────────────────

/**
 * Validates a numeric value falls within [min, max].
 * Params: { min: number, max: number, inclusive?: boolean }
 *
 * Equivalent to json-logic's three-argument <= (between-inclusive).
 * Reference: https://jsonlogic.com/operations.html#Between
 */
export const rangeValidator: ValidatorFactory =
  (params) => (value, _formData): RuleResult => {
    if (value == null || value === '') return right(undefined);
    const num = Number(value);
    if (!isFinite(num)) return left({ ruleId: 'range', message: 'Must be a number' }); // catches NaN and ±Infinity
    const { min, max, inclusive = true } = params as { min: number; max: number; inclusive?: boolean };
    const passes = inclusive ? num >= min && num <= max : num > min && num < max;
    return passes
      ? right(undefined)
      : left({ ruleId: 'range', message: `Must be between ${min} and ${max}` });
  };


// ─── pattern ──────────────────────────────────────────────────────────────────

/**
 * Validates a string matches a regular expression.
 * Params: { regex: string, flags?: string }
 */
export const patternValidator: ValidatorFactory =
  (params) => (value, _formData): RuleResult => {
    if (value == null || value === '') return right(undefined);
    const { regex, flags = '' } = params as { regex: string; flags?: string };
    const re = new RegExp(regex, flags);
    return re.test(String(value))
      ? right(undefined)
      : left({ ruleId: 'pattern', message: (params['message'] as string | undefined) ?? 'Invalid format' });
  };


// ─── minLength / maxLength ────────────────────────────────────────────────────

export const minLengthValidator: ValidatorFactory =
  (params) => (value, _formData): RuleResult => {
    if (value == null || value === '') return right(undefined);
    const { length } = params as { length: number };
    return String(value).length >= length
      ? right(undefined)
      : left({ ruleId: 'minLength', message: `Must be at least ${length} characters` });
  };

export const maxLengthValidator: ValidatorFactory =
  (params) => (value, _formData): RuleResult => {
    if (value == null || value === '') return right(undefined);
    const { length } = params as { length: number };
    return String(value).length <= length
      ? right(undefined)
      : left({ ruleId: 'maxLength', message: `Must be at most ${length} characters` });
  };


// ─── dateRange ────────────────────────────────────────────────────────────────

/**
 * Validates a date value falls within a range.
 * Params: { min?: string, max?: string }
 *
 * Date expressions:
 *   'today'     → current date
 *   'today-30d' → 30 days before today
 *   'today+1y'  → one year from today
 *   (any ISO-8601 string) → parsed directly
 */
export const dateRangeValidator: ValidatorFactory =
  (params) => (value, _formData): RuleResult => {
    if (value == null || value === '') return right(undefined);
    const date = new Date(value as string);
    if (isNaN(date.getTime())) return left({ ruleId: 'dateRange', message: 'Invalid date' });

    const resolve = (expr: string): Date => {
      if (expr === 'today') return new Date();
      const match = /^today([+-])(\d+)([dmy])$/.exec(expr);
      if (!match) return new Date(expr);
      const [, sign, amount, unit] = match;
      const d = new Date();
      const n = parseInt(amount, 10) * (sign === '-' ? -1 : 1);
      if (unit === 'd') d.setDate(d.getDate() + n);
      if (unit === 'm') d.setMonth(d.getMonth() + n);
      if (unit === 'y') d.setFullYear(d.getFullYear() + n);
      return d;
    };

    const { min, max } = params as { min?: string; max?: string };
    if (min && date < resolve(min))
      return left({ ruleId: 'dateRange', message: `Date must be on or after ${min}` });
    if (max && date > resolve(max))
      return left({ ruleId: 'dateRange', message: `Date must be on or before ${max}` });
    return right(undefined);
  };


// ─── relativeDate ─────────────────────────────────────────────────────────────

/**
 * Cross-field date comparison.
 * Params: { fieldKey: string, operator: 'before' | 'after' | 'sameOrBefore' | 'sameOrAfter' }
 * Example: startDate must be before endDate
 */
export const relativeDateValidator: ValidatorFactory =
  (params) => (value, formData): RuleResult => {
    if (value == null || value === '') return right(undefined);
    const { fieldKey, operator } = params as { fieldKey: string; operator: string };
    const other = formData[fieldKey];
    if (other == null || other === '') return right(undefined);

    const d1 = new Date(value as string).getTime();
    const d2 = new Date(other as string).getTime();

    const passes =
      operator === 'before'       ? d1 < d2  :
      operator === 'after'        ? d1 > d2  :
      operator === 'sameOrBefore' ? d1 <= d2 :
      operator === 'sameOrAfter'  ? d1 >= d2 : true;

    return passes
      ? right(undefined)
      : left({ ruleId: 'relativeDate', message: `Must be ${operator} ${fieldKey}` });
  };


// ─── allowedValues ────────────────────────────────────────────────────────────

/**
 * Validates a select/radio/checkbox value is in an approved subset.
 * Params: { values: unknown[] }
 */
export const allowedValuesValidator: ValidatorFactory =
  (params) => (value, _formData): RuleResult => {
    if (value == null || value === '') return right(undefined);
    const { values } = params as { values: unknown[] };
    return values.includes(value)
      ? right(undefined)
      : left({ ruleId: 'allowedValues', message: 'Value is not in the allowed list' });
  };


// ─── precision ────────────────────────────────────────────────────────────────

/**
 * Validates decimal places on a numeric value.
 * Params: { decimalPlaces: number }
 */
export const precisionValidator: ValidatorFactory =
  (params) => (value, _formData): RuleResult => {
    if (value == null || value === '') return right(undefined);
    const { decimalPlaces } = params as { decimalPlaces: number };
    const str = String(value);
    const dotIndex = str.indexOf('.');
    const actual = dotIndex === -1 ? 0 : str.length - dotIndex - 1;
    return actual <= decimalPlaces
      ? right(undefined)
      : left({ ruleId: 'precision', message: `Max ${decimalPlaces} decimal places allowed` });
  };


// ─── cascade_invalidated ──────────────────────────────────────────────────────

/**
 * Raised programmatically by the engine when a cascade codelist refresh
 * removes the currently selected value from the available options (§14).
 * Never configured in the schema directly.
 */
export const cascadeInvalidatedValidator: ValidatorFactory =
  (_params) => (_value, _formData): RuleResult =>
    left({ ruleId: 'cascade_invalidated', message: 'Selected value is no longer valid after cascade update' });


// ─── wordCount ────────────────────────────────────────────────────────────────

/**
 * Validates the number of words in a textarea value.
 * Params: { min?: number, max?: number }
 *
 * Word definition: any non-empty sequence of non-whitespace characters.
 * Splitting on /\s+/ and filtering empty strings handles leading/trailing
 * whitespace correctly.
 */
export const wordCountValidator: ValidatorFactory =
  (params) => (value, _formData): RuleResult => {
    if (value == null || value === '') return right(undefined);
    const words = String(value).trim().split(/\s+/).filter(Boolean).length;
    const { min, max } = params as { min?: number; max?: number };
    if (min !== undefined && words < min)
      return left({ ruleId: 'wordCount', message: `Must have at least ${min} word${min === 1 ? '' : 's'}` });
    if (max !== undefined && words > max)
      return left({ ruleId: 'wordCount', message: `Must have at most ${max} word${max === 1 ? '' : 's'}` });
    return right(undefined);
  };


// ─── Registry ────────────────────────────────────────────────────────────────

/**
 * Immutable registry of all built-in validators.
 * The engine performs an O(1) lookup by ruleId at evaluation time.
 */
export const BUILT_IN_VALIDATORS: Readonly<Record<string, ValidatorFactory>> = {
  required:            requiredValidator,
  range:               rangeValidator,
  pattern:             patternValidator,
  minLength:           minLengthValidator,
  maxLength:           maxLengthValidator,
  dateRange:           dateRangeValidator,
  relativeDate:        relativeDateValidator,
  allowedValues:       allowedValuesValidator,
  precision:           precisionValidator,
  wordCount:           wordCountValidator,
  cascade_invalidated: cascadeInvalidatedValidator,
} as const;
```

### 4.4 Validator Matrix — Field Type Coverage

This matrix drives the builder's "Add Validation" panel. Only applicable validators are shown per field type.

| Validator          | `text` | `number` | `date` | `select` | `radio` | `checkbox` | `textarea` | `rating` |
|--------------------|:------:|:--------:|:------:|:--------:|:-------:|:----------:|:----------:|:--------:|
| `required`         | ✅     | ✅       | ✅     | ✅       | ✅      | ✅         | ✅         | ✅       |
| `range`            |        | ✅       |        |          |         |            |            | ✅       |
| `pattern`          | ✅     |          |        |          |         |            | ✅         |          |
| `minLength`        | ✅     |          |        |          |         |            | ✅         |          |
| `maxLength`        | ✅     |          |        |          |         |            | ✅         |          |
| `dateRange`        |        |          | ✅     |          |         |            |            |          |
| `relativeDate`     |        |          | ✅     |          |         |            |            |          |
| `allowedValues`    |        |          |        | ✅       | ✅      | ✅         |            |          |
| `precision`        |        | ✅       |        |          |         |            |            |          |
| `wordCount`        |        |          |        |          |         |            | ✅         |          |

---

## 5. Layer 2 — Study-Configured Rules (json-logic)

### 5.1 Why json-logic

[json-logic](https://jsonlogic.com) is chosen because:

1. **No `eval()`** — the engine parses JSON structure directly; no code injection risk
2. **Isomorphic** — `json-logic-js` works identically in Node.js and browser
3. **Serialisable** — stored as plain JSON in the schema; queryable, diffable, versionable
4. **GUI-buildable** — the AST structure is trivially produced by a drag-and-drop rule builder
5. **Deterministic** — no loops, no setters, no side effects; bounded computation time
6. **Security** — rules have read-only access to provided data; cannot access globals or call functions

### 5.2 The json-logic Data Context

```typescript
/** The data object passed to every json-logic.apply() call. */
interface JsonLogicContext {
  value: unknown;                      // the field's current value
  formData: Record<string, unknown>;   // full form snapshot { fieldKey: value }
}

// In a rule expression:
// { "var": "value" }              → current field value
// { "var": "formData.age" }       → field named 'age'
// { "var": "formData.startDate" } → field named 'startDate'
```

### 5.3 Operator Reference (used by Query Builder)

| UI label              | json-logic operator | Example |
|-----------------------|---------------------|---------|
| equals                | `==`                | `{ "==": [{"var":"value"}, 5] }` |
| not equals            | `!=`                | `{ "!=": [{"var":"value"}, "N/A"] }` |
| greater than          | `>`                 | `{ ">": [{"var":"value"}, 0] }` |
| less than             | `<`                 | `{ "<": [{"var":"value"}, 100] }` |
| between (exclusive)   | `<` (3-arg)         | `{ "<": [5, {"var":"value"}, 40] }` |
| between (inclusive)   | `<=` (3-arg)        | `{ "<=": [5, {"var":"value"}, 40] }` |
| is in list            | `in`                | `{ "in": [{"var":"value"}, ["A","B","C"]] }` |
| contains text         | `in` (string)       | `{ "in": ["London", {"var":"value"}] }` |
| starts with           | custom `startsWith` | `{ "startsWith": [{"var":"value"}, "V"] }` |
| matches regex         | custom `regex`      | `{ "regex": [{"var":"value"}, "^\\d{4}$"] }` |
| ALL conditions        | `and`               | `{ "and": [ rule1, rule2 ] }` |
| ANY condition         | `or`                | `{ "or": [ rule1, rule2 ] }` |
| NOT                   | `!`                 | `{ "!": rule1 }` |
| only when             | `if` (conditional)  | `{ "if": [condition, rule, true] }` |
| at least N of M       | `missing_some`      | `{ "!": {"missing_some": [1, ["a","b","c"]]} }` |

Reference: [json-logic operations](https://jsonlogic.com/operations.html) · [missing_some](https://jsonlogic.com/operations.html#missing_some)

### 5.4 Registering Custom Operations

```typescript
// libs/form-renderer/src/validation/json-logic/custom-ops.ts

import jsonLogic from 'json-logic-js';

/**
 * Register custom json-logic operations not in the standard spec.
 * Called once in APP_INITIALIZER.
 *
 * Reference: https://jsonlogic.com/add_operation.html
 */
export function registerCustomJsonLogicOps(): void {

  // regex: [value, pattern, flags?]
  jsonLogic.add_operation('regex', (value: unknown, pattern: string, flags = '') => {
    if (value == null) return false;
    return new RegExp(pattern, flags).test(String(value));
  });

  // startsWith: [value, prefix]
  jsonLogic.add_operation('startsWith', (value: unknown, prefix: string) => {
    if (value == null) return false;
    return String(value).startsWith(prefix);
  });

  // endsWith: [value, suffix]
  jsonLogic.add_operation('endsWith', (value: unknown, suffix: string) => {
    if (value == null) return false;
    return String(value).endsWith(suffix);
  });
}
```

### 5.5 json-logic Rule Examples

```jsonc
// Age between 5 and 40 (exclusive), only when ageUnit is 'years'
{
  "ruleId": "ageRangeWhenYears",
  "type": "json-logic",
  "rule": {
    "if": [
      { "==": [{ "var": "formData.ageUnit" }, "years"] },
      { "<": [5, { "var": "value" }, 40] },
      true
    ]
  },
  "message": "Age must be between 5 and 40 years"
}

// At least one contact method must be provided
// Reference: https://jsonlogic.com/operations.html\#missing_some
{
  "ruleId": "atLeastOneContact",
  "type": "json-logic",
  "rule": {
    "!": { "missing_some": [1, ["formData.phone", "formData.email", "formData.fax"]] }
  },
  "message": "At least one contact method (phone, email, or fax) must be provided"
}

// Conditional cross-field: BMI plausibility check
{
  "ruleId": "bmiRange",
  "type": "json-logic",
  "rule": {
    "<=": [
      15,
      { "/": [
          { "var": "formData.weightKg" },
          { "*": [{ "var": "formData.heightM" }, { "var": "formData.heightM" }] }
        ]
      },
      45
    ]
  },
  "message": "Calculated BMI is outside expected range (15–45)"
}
```

---

## 6. The UI Query Builder

### 6.1 Architecture

The Query Builder is an Angular component in `libs/form-builder/src/lib/validation-builder/`:
- Visual drag-and-drop rule editor (no coding required for study designers)
- Produces a `JsonLogicExpression` AST as output
- Evaluates rules in real-time against test data (same `json-logic-js`, no backend calls)
- Serialises output into `ValidationRule[]` stored in the field schema

### 6.2 Component Interface

```typescript
// libs/form-builder/src/lib/validation-builder/validation-builder.component.ts

@Component({
  selector: 'vi-validation-builder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './validation-builder.component.html',
})
export class ValidationBuilderComponent {
  /** The field schema being edited — drives field-type-aware operator list. */
  readonly field = input.required<ComponentSchema>();

  /** All fields in the form — enables cross-field references. */
  readonly allFields = input.required<ComponentSchema[]>();

  /** Current rule array — displayed on init, updated on change. */
  readonly rules = model<ValidationRule[]>([]);
}
```

### 6.3 Rule Preview Panel

The Preview Panel is the key usability feature. It evaluates the rule synchronously in the browser using the exact same engine (`json-logic-js`) that runs during actual validation. This gives instant, reliable feedback with zero network calls.

```typescript
// libs/form-builder/src/lib/validation-builder/rule-preview.component.ts

@Component({
  selector: 'vi-rule-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="preview-panel">
      <h4>Test this rule</h4>

      <!-- Inputs for every field referenced by { "var": "formData.X" } in the rule -->
      @for (field of referencedFields(); track field.key) {
        <vi-input [label]="field.label" [(value)]="testValues()[field.key]" />
      }

      @let result = evaluationResult();
      @if (result._tag === 'Valid') {
        <span class="pass">✅ Pass</span>
      } @else {
        <span class="fail">❌ {{ result.errors[0].message }}</span>
      }
    </div>
  `,
})
export class RulePreviewComponent {
  readonly rule         = input.required<ValidationRule>();
  readonly fieldSchema  = input.required<ComponentSchema>();
  readonly allFields    = input.required<ComponentSchema[]>();

  readonly testValues = signal<Record<string, unknown>>({});

  /**
   * Derived Signal: re-evaluates on every testValues change.
   * This is the functor map over the Signal reactive stream:
   *   computed :: (() → A) → Signal<A>
   *   analogous to: map :: (A → B) → Signal<A> → Signal<B>
   *
   * Angular Signals reference: https://angular.dev/guide/signals
   */
  readonly evaluationResult = computed((): FieldValidationResult => {
    const value    = this.testValues()[this.fieldSchema().key];
    const formData = this.testValues();
    return evaluateRule(this.rule(), value, formData);
  });

  /** All field keys referenced by { "var": "formData.X" } in the rule expression. */
  readonly referencedFields = computed((): ComponentSchema[] => {
    const refs = extractFormDataRefs(this.rule());
    return this.allFields().filter(f => refs.has(f.key));
  });
}

/** Pure function: walk the rule AST and collect all formData.X references. */
function extractFormDataRefs(rule: ValidationRule): Set<string> {
  const refs = new Set<string>();
  const walk = (node: unknown): void => {
    if (typeof node !== 'object' || node == null) return;
    for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
      if (key === 'var' && typeof val === 'string' && val.startsWith('formData.')) {
        refs.add(val.slice('formData.'.length));
      }
      walk(val);
    }
  };
  if (rule.type === 'json-logic') walk(rule.rule);
  return refs;
}
```

---

## 7. Validation Execution Engine

### 7.1 The Pipeline as Function Composition

```
input: (fieldKey, currentValue, formData, fieldState)
         │
         ▼
    [1] guard(currentValue, lastValidatedValue)
         │
         ├─ EQUAL → identity (no state change, skip rest)
         │
         └─ DIFFERENT → continue
                  │
                  ▼
             [2] evaluateAll(rules, currentValue, formData)
                  │ accumulate ALL failures → ValidationError[]
                  │ (Validation applicative — not short-circuiting Either)
                  │
                  ▼
             [3] reconcile(errors, existingSystemQueries)
                  │ → { toCreate: SV[], toResolve: string[] }
                  │
                  ▼
             [4] updateStore(fieldKey, errors, delta)
                  │
                  ▼
             [5] (on save) persistToBackend(delta)  ← IO boundary
```

Steps 1–4 are pure functions. Step 5 is the IO boundary.

### 7.2 Core Engine Service

```typescript
// libs/form-renderer/src/validation/engine/validation-engine.service.ts

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import jsonLogic from 'json-logic-js';
import { isLeft, left, right } from '@vi/state-fp';
import { BUILT_IN_VALIDATORS } from '../built-in/validators.js';
import type {
  ValidationRule, RuleResult, ValidationError,
  FieldValidationResult, FieldValidationState, SystemValidationRecord,
} from '../types.js';
import { validationActions } from '../../store/validation.actions.js';

@Injectable({ providedIn: 'root' })
export class ValidationEngine {

  readonly #store = inject(Store);

  // ─── Phase 1: Data-entry feedback (no persistence) ─────────────────────────

  /**
   * Run validators for immediate inline feedback.
   * Triggered on blur or change (per FormSettings.validateOn).
   * NEVER creates SYSTEM_VALIDATION records.
   */
  runForDataEntry(
    fieldKey: string,
    value: unknown,
    rules: ReadonlyArray<ValidationRule>,
    formData: Record<string, unknown>,
  ): void {
    const result = this.#evaluateAll(rules, value, formData);
    this.#store.dispatch(validationActions.inlineErrorsUpdated({ fieldKey, result }));
  }


  // ─── Phase 2: Save-time validation (SYSTEM_VALIDATION creation) ────────────

  /**
   * Run validators for all fields at save time.
   * Applies the value-change guard: fields whose value hasn't changed are skipped.
   *
   * @returns delta of SYSTEM_VALIDATION changes to send to the backend
   */
  runForSave(
    fieldStates: Record<string, FieldValidationState>,
    formData: Record<string, unknown>,
    schema: FormSchema,
  ): SaveValidationDelta {
    const toCreate: SystemValidationRecord[] = [];
    const toResolve: string[] = [];
    const saveSessionId = crypto.randomUUID();

    for (const [fieldKey, state] of Object.entries(fieldStates)) {
      // ── Step 1: Value-change guard ─────────────────────────────────────────
      if (strictEquals(state.value, state.lastValidatedValue)) {
        // Value unchanged since last validation.
        // All existing SYSTEM_VALIDATION records are left untouched.
        // manually_closed records, in particular, are not re-raised.
        continue;
      }

      const field = findFieldInSchema(schema, fieldKey);
      if (!field) continue;

      // ── Step 2: Evaluate all rules (accumulating, not short-circuiting) ────
      const result = this.#evaluateAll(field.validation ?? [], state.value, formData);

      // ── Step 3: Reconcile with existing open queries ───────────────────────
      const delta = this.#reconcile(fieldKey, result, state.systemQueries, saveSessionId);
      toCreate.push(...delta.toCreate);
      toResolve.push(...delta.toResolve);

      // ── Step 4: Update store ───────────────────────────────────────────────
      this.#store.dispatch(validationActions.fieldValidatedOnSave({
        fieldKey,
        lastValidatedValue: state.value,
        result,
      }));
    }

    return { toCreate, toResolve };
  }


  // ─── Evaluation — pure, no side effects ────────────────────────────────────

  /**
   * Evaluate all rules for a field, accumulating ALL failures.
   *
   * Validation applicative pattern:
   *   Unlike the Either monad (which short-circuits on first Left),
   *   this accumulates all Left values into an array.
   *
   *   Either monad:   chain  :: M<E,A> → (A → M<E,B>) → M<E,B>       (stop on first E)
   *   Validation app: (<*>)  :: V<[E],A→B> → V<[E],A> → V<[E],B>    (collect all E)
   *
   * Clinical rationale: the user must see ALL validation failures at once,
   * not just the first one. Each failure is a separate clinical query.
   */
  #evaluateAll(
    rules: ReadonlyArray<ValidationRule>,
    value: unknown,
    formData: Record<string, unknown>,
  ): FieldValidationResult {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
      // Short-circuit activeWhen condition
      if (rule.activeWhen && !jsonLogic.apply(rule.activeWhen, { value, formData })) {
        continue;
      }

      const result = this.#evaluateOne(rule, value, formData);

      // isLeft is a type guard narrowing Either<E,A> to Left<E>
      if (isLeft(result)) {
        errors.push({
          ...result.left,
          ruleId: rule.ruleId,
          targetFieldKey: rule.targetFieldKey,
          auditReason: rule.auditReason,
        });
      }
    }

    return errors.length === 0 ? { _tag: 'Valid' } : { _tag: 'Invalid', errors };
  }

  /**
   * Evaluate a single rule. Returns Either<ValidationError, void>.
   *
   * The Either monad here encodes success/failure as a value (not an exception).
   * This is the "railway-oriented programming" pattern:
   *   Right(void)           → green track (success)
   *   Left(ValidationError) → red track (failure with structured error)
   *
   * No exceptions are thrown from within validation.
   */
  #evaluateOne(
    rule: ValidationRule,
    value: unknown,
    formData: Record<string, unknown>,
  ): RuleResult {
    if (rule.type === 'built-in') {
      const factory = BUILT_IN_VALIDATORS[rule.ruleId];
      if (!factory) return right(undefined); // unknown rule → fail-open (don't block user)
      return factory(rule.params ?? {})(value, formData);
    }

    if (rule.type === 'json-logic') {
      try {
        const passes = jsonLogic.apply(rule.rule, { value, formData });
        return passes
          ? right(undefined)
          : left({ ruleId: rule.ruleId, message: rule.message });
      } catch (e) {
        // Malformed rule — log and fail-open
        console.error(`[ValidationEngine] json-logic error in rule "${rule.ruleId}":`, e);
        return right(undefined);
      }
    }

    return right(undefined);
  }


  // ─── Reconciliation ────────────────────────────────────────────────────────

  /**
   * Reconcile current evaluation result against existing SYSTEM_VALIDATION records.
   *
   * Rules:
   *   1. Only one OPEN record per (fieldKey, ruleId) at any time.
   *   2. Rule fails + open record exists    → keep it (no duplicate, idempotent)
   *   3. Rule fails + no open record        → create one
   *   4. Rule passes + open record exists   → auto-resolve it
   *   5. manually_closed records            → NEVER touched by the system
   *   6. cancelled records                  → NEVER touched by the system
   */
  #reconcile(
    fieldKey: string,
    result: FieldValidationResult,
    existing: ReadonlyArray<SystemValidationRecord>,
    saveSessionId: string,
  ): { toCreate: SystemValidationRecord[]; toResolve: string[] } {
    const openByRuleId = new Map(
      existing
        .filter(q => q.status === 'open')
        .map(q => [q.ruleId, q])
    );

    const failingRuleIds = new Set(
      result._tag === 'Invalid' ? result.errors.map(e => e.ruleId) : []
    );

    const toCreate: SystemValidationRecord[] = [];
    const toResolve: string[] = [];

    if (result._tag === 'Invalid') {
      for (const error of result.errors) {
        const targetKey = error.targetFieldKey ?? fieldKey;
        if (!openByRuleId.has(error.ruleId)) {
          toCreate.push({
            id: crypto.randomUUID(),
            formInstanceId: '',    // filled by save service from form context
            fieldKey: targetKey,
            ruleId: error.ruleId,
            message: error.message,
            status: 'open',
            createdAt: new Date().toISOString(),
            resolvedAt: null,
            saveSessionId,
          });
        }
      }
    }

    for (const [ruleId, record] of openByRuleId) {
      if (!failingRuleIds.has(ruleId)) {
        toResolve.push(record.id);
      }
    }

    return { toCreate, toResolve };
  }
}


// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Strict value equality for the value-change guard.
 * Primitives: referential equality (O(1)).
 * Objects/Arrays: JSON serialisation for deep equality.
 *   Safe because form field values are always JSON-serialisable.
 */
function strictEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a === 'object' && a !== null) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

/**
 * Recursively search the schema component tree for a component with the given key.
 * Layout containers (Panel, Columns, Tabs, Fieldset) are traversed but not returned.
 * For repeating fields, pass the base key (strip the [n] suffix before calling).
 */
function findFieldInSchema(schema: FormSchema, fieldKey: string): ComponentSchema | undefined {
  // Strip repeating-instance suffix: 'phone[0]' → 'phone'
  const baseKey = fieldKey.replace(/\[\d+\]$/, '');

  function search(components: ComponentSchema[]): ComponentSchema | undefined {
    for (const comp of components) {
      if ((comp as { key?: string }).key === baseKey) return comp;
      // Recurse into known layout container shapes
      if ('components' in comp && Array.isArray((comp as { components?: ComponentSchema[] }).components)) {
        const found = search((comp as { components: ComponentSchema[] }).components);
        if (found) return found;
      }
      if ('columns' in comp) {
        for (const col of (comp as { columns: Array<{ components: ComponentSchema[] }> }).columns) {
          const found = search(col.components ?? []);
          if (found) return found;
        }
      }
      if ('tabs' in comp) {
        for (const tab of (comp as { tabs: Array<{ components: ComponentSchema[] }> }).tabs) {
          const found = search(tab.components ?? []);
          if (found) return found;
        }
      }
    }
    return undefined;
  }

  return search(schema.components);
}

export interface SaveValidationDelta {
  readonly toCreate: ReadonlyArray<SystemValidationRecord>;
  readonly toResolve: ReadonlyArray<string>;
}
```

---

## 8. Value-Change Guard — The Core Invariant

### 8.1 The Invariant, Stated Formally

> **For any field F, Phase 2 validation runs at save time if and only if `F.value ≠ F.lastValidatedValue`.**

This exploits the referential transparency of pure validator functions: the same input always produces the same output. If the input hasn't changed, re-running is wasteful — and clinically, re-raising queries that have been manually closed is incorrect.

### 8.2 Complete Scenario Walkthrough

```
─────────────────────────────────────────────────────────────────────────────
 Field: Age  |  Validation: range { min: 5, max: 40 }
─────────────────────────────────────────────────────────────────────────────

STEP 1: Form opened. Age = blank.
  store: { value: null, savedValue: null, lastValidatedValue: null }
  → No validation on load.

STEP 2: User types 41.
  store: { value: 41, savedValue: null, lastValidatedValue: null }
  Phase 1 (onBlur): rangeCheck fails → inline error "Must be between 5 and 40"
  No SYSTEM_VALIDATION created.

STEP 3: User clicks Save.
  guard: 41 ≠ null → validation FIRES
  evaluate: rangeCheck FAILS (41 > 40)
  reconcile: no open record for (age, range) → CREATE Q1
  store: lastValidatedValue = 41
  backend: Q1 { fieldKey:'age', ruleId:'range', status:'open' } created

STEP 4: CDM logs in, reviews Q1, marks it manually_closed
  (data is clinically acceptable despite range failure)
  store: systemQueries[age] = [{ ...Q1, status: 'manually_closed' }]

STEP 5: Site changes weight field, saves. Age is still 41.
  guard for age: 41 === 41 (lastValidatedValue) → SKIP ✅
  Q1 (manually_closed) is not touched. Not re-raised.

STEP 6: User changes Age to 45.
  Phase 1 (onBlur): rangeCheck fails → inline error.
  User clicks Save.
  guard: 45 ≠ 41 → validation FIRES
  evaluate: rangeCheck FAILS (45 > 40)
  reconcile: no OPEN record for (age, range) [Q1 is manually_closed]
             → CREATE Q2 { fieldKey:'age', ruleId:'range', status:'open' }
  Q1 remains as historical audit record. lastValidatedValue = 45.

STEP 7: User corrects Age to 20.
  Phase 1 (onBlur): rangeCheck passes → inline error cleared.
  User clicks Save.
  guard: 20 ≠ 45 → validation FIRES
  evaluate: rangeCheck PASSES
  reconcile: Q2 is 'open' → toResolve: [Q2.id]
  backend: Q2.status = 'auto_resolved', Q2.resolvedAt = now
  lastValidatedValue = 20.

─────────────────────────────────────────────────────────────────────────────
 Final state:
   Q1 status: 'manually_closed', createdAt: step 3, value=41 → audit trail
   Q2 status: 'auto_resolved',   createdAt: step 6, value=45 → audit trail
   No open queries.
─────────────────────────────────────────────────────────────────────────────
```

---

## 9. Two-Phase Validation Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1 — Data Entry Feedback                                              │
│  Trigger:   onChange / onBlur (per FormSettings.validateOn)                 │
│  Scope:     The field being interacted with                                 │
│  Creates SYSTEM_VALIDATION:   ❌ NEVER                                      │
│  Output:    FieldValidationState.inlineErrors (in-memory)                   │
│  Visual:    Red text beneath the control, immediate                         │
│  Guard:     None — always runs when triggered                               │
└─────────────────────────────────────────────────────────────────────────────┘

                              ▼  User clicks Save  ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 2 — Save-Time Validation (Authoritative)                             │
│  Trigger:   User clicks Save                                                │
│  Scope:     ALL fields (value-change guard skips unchanged ones)            │
│  Creates SYSTEM_VALIDATION:   ✅ YES (for changed fields that fail)         │
│  Output:    delta { toCreate, toResolve } → backend HTTP call               │
│  Visual:    systemQueries re-loaded from backend on next form open          │
│  Guard:     value === lastValidatedValue → skip                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.1 FormSettings.validateOn

Controls Phase 1 trigger only. Phase 2 always fires on Save regardless.

```typescript
interface FormSettings {
  /**
   * When Phase 1 (inline feedback) is triggered.
   * Phase 2 (SYSTEM_VALIDATION creation) always fires on save.
   *
   * 'onBlur'   — validate when user leaves field (default, recommended for EDC)
   * 'onChange'  — validate on every keystroke (aggressive, rarely appropriate)
   * 'onSubmit'  — validate only when Save clicked (no inline feedback)
   *              Note: rarely appropriate in EDC. Data can always be saved.
   *              Document in release notes for study designers.
   */
  validateOn?: 'onBlur' | 'onChange' | 'onSubmit';
}
```

---

## 10. SYSTEM_VALIDATION Record Model

### 10.1 Backend Table Schema

```sql
CREATE TABLE system_validation (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_instance_id  UUID NOT NULL REFERENCES form_instances(id),
  field_key         VARCHAR(255) NOT NULL,
  rule_id           VARCHAR(255) NOT NULL,
  message           TEXT NOT NULL,
  status            VARCHAR(32) NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'auto_resolved', 'manually_closed', 'cancelled')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at       TIMESTAMPTZ,
  save_session_id   UUID NOT NULL,

  -- Exactly one OPEN record per (form, field, rule) at any time.
  -- Closed/resolved records accumulate as historical audit trail.
  CONSTRAINT uq_open_query
    UNIQUE NULLS NOT DISTINCT (form_instance_id, field_key, rule_id)
    WHERE (status = 'open')
);

CREATE INDEX idx_sv_form_open ON system_validation(form_instance_id)
  WHERE status = 'open';

CREATE INDEX idx_sv_audit ON system_validation(form_instance_id, field_key, created_at DESC);
```

### 10.2 Status State Machine

```
                    ┌─────────────────┐
          save      │                 │  rule passes on
         fails  ┌──▶│     open        │─────next save────▶  auto_resolved
                │   │                 │
                │   └─────────────────┘
                │           │
                │           │ CDM reviews,
                │           │ accepts data
                │           ▼
                │   ┌─────────────────┐
                │   │ manually_closed  │  ← system never re-opens this
                │   └─────────────────┘
                │
                │   ┌─────────────────┐
                │   │   cancelled      │  ← CDM cancels query raised in error
                └───│                 │
                    └─────────────────┘
```

| Status | Raised By | System touches after? |
|---|---|---|
| `open` | System on save | ✅ Can auto-resolve if value corrected |
| `auto_resolved` | System on save | ❌ Never |
| `manually_closed` | CDM | ❌ Never |
| `cancelled` | CDM | ❌ Never |

### 10.3 lastValidatedValue Persistence

```sql
-- On save: for each field where validation RAN (value ≠ lastValidatedValue):
UPDATE form_field_data
  SET value = $value, last_validated_value = $value
WHERE form_instance_id = $formId AND field_key = $fieldKey;

-- For fields where validation was SKIPPED (value = lastValidatedValue):
UPDATE form_field_data
  SET value = $value
  -- last_validated_value is NOT updated
WHERE form_instance_id = $formId AND field_key = $fieldKey;
```

### 10.4 API Endpoints

```
GET  /api/forms/{formInstanceId}/validation-queries?status=open
     → SystemValidationRecord[]   (called on form load)

POST /api/forms/{formInstanceId}/validation-queries/delta
     Body: { toCreate: SystemValidationRecord[], toResolve: string[] }
     → { created: SystemValidationRecord[], resolved: SystemValidationRecord[] }
     (called by save service after Phase 2 runs)
```

---

## 11. State Management — NgRx / state-fp Integration

> **⚠️ Architecture Note (2026-05-27):** The NgRx-based state design below was the initial approach.
> The renderer specification (`form-builder-renderer.md §7.3`) settled on a **Signal-based `FieldStateService`**
> as the primary field state store for v1. The `ValidationEngine` is now designed to interact with
> `FieldStateService` instead of dispatching NgRx actions directly. See **§20** for the resolved
> integration architecture. This section is retained for historical reference and may be re-evaluated
> for cross-form global state requirements in a future phase.

### 11.1 State Shape

```typescript
// libs/form-renderer/src/store/validation.state.ts

export interface ValidationState {
  readonly fields: Readonly<Record<string, FieldValidationState>>;
  readonly isSaving: boolean;
  readonly currentSaveSessionId: string | null;
}
```

### 11.2 Actions

```typescript
// libs/form-renderer/src/store/validation.actions.ts

import { createActionGroup, props } from '@ngrx/store';

export const validationActions = createActionGroup({
  source: 'Validation',
  events: {

    'Form Loaded': props<{
      fields: Record<string, {
        value: unknown;
        lastValidatedValue: unknown;
        systemQueries: SystemValidationRecord[];
      }>;
    }>(),

    'Field Value Changed': props<{
      fieldKey: string;
      value: unknown;
    }>(),

    'Inline Errors Updated': props<{
      fieldKey: string;
      result: FieldValidationResult;
    }>(),

    'Field Validated On Save': props<{
      fieldKey: string;
      lastValidatedValue: unknown;
      result: FieldValidationResult;
    }>(),

    'System Queries Updated': props<{
      fieldKey: string;
      queries: SystemValidationRecord[];
    }>(),
  },
});
```

### 11.3 Reducer

```typescript
// libs/form-renderer/src/store/validation.reducer.ts

import { createReducer, on } from '@ngrx/store';
import { validationActions } from './validation.actions.js';

export const validationReducer = createReducer(
  initialState,

  on(validationActions.formLoaded, (state, { fields }) => ({
    ...state,
    fields: Object.fromEntries(
      Object.entries(fields).map(([key, data]) => [
        key,
        {
          value: data.value,
          savedValue: data.value,
          lastValidatedValue: data.lastValidatedValue,
          inlineErrors: [],
          systemQueries: data.systemQueries,
        } satisfies FieldValidationState,
      ])
    ),
  })),

  on(validationActions.fieldValueChanged, (state, { fieldKey, value }) => ({
    ...state,
    fields: {
      ...state.fields,
      [fieldKey]: { ...state.fields[fieldKey], value },
    },
  })),

  on(validationActions.inlineErrorsUpdated, (state, { fieldKey, result }) => ({
    ...state,
    fields: {
      ...state.fields,
      [fieldKey]: {
        ...state.fields[fieldKey],
        inlineErrors: result._tag === 'Invalid' ? [...result.errors] : [],
      },
    },
  })),

  on(validationActions.fieldValidatedOnSave, (state, { fieldKey, lastValidatedValue }) => ({
    ...state,
    fields: {
      ...state.fields,
      [fieldKey]: {
        ...state.fields[fieldKey],
        lastValidatedValue,
        savedValue: state.fields[fieldKey].value,
      },
    },
  })),

  on(validationActions.systemQueriesUpdated, (state, { fieldKey, queries }) => ({
    ...state,
    fields: {
      ...state.fields,
      [fieldKey]: {
        ...state.fields[fieldKey],
        systemQueries: queries,
      },
    },
  })),
);
```

### 11.4 Selectors

```typescript
// libs/form-renderer/src/store/validation.selectors.ts

import { createSelector, createFeatureSelector } from '@ngrx/store';

const selectValidation = createFeatureSelector<ValidationState>('validation');

export const selectInlineErrors = (fieldKey: string) =>
  createSelector(selectValidation, s => s.fields[fieldKey]?.inlineErrors ?? []);

export const selectSystemQueries = (fieldKey: string) =>
  createSelector(
    selectValidation,
    s => (s.fields[fieldKey]?.systemQueries ?? []).filter(q => q.status === 'open')
  );

export const selectIsFormDirty = createSelector(
  selectValidation,
  s => Object.values(s.fields).some(f => !strictEquals(f.value, f.savedValue))
);

export const selectHasOpenQueries = createSelector(
  selectValidation,
  s => Object.values(s.fields).some(f => f.systemQueries.some(q => q.status === 'open'))
);
```

---

## 12. Functional Programming Paradigms

This section documents the FP patterns used in the validation system and maps them to their theoretical foundations. These are not abstract concepts — they are the actual types and functions in `@vi/state-fp`.

### 12.1 Either as the Validation Result Type

```typescript
import { left, right, isLeft, foldEither, mapEither, chainEither } from '@vi/state-fp';

// RuleResult = Either<ValidationError, void>
// Left  = failure (carries the error as a value)
// Right = success (void — the successful path has no meaningful payload)

// Validator returns Left(error) or Right(undefined):
const rangeCheck: (value: number) => RuleResult =
  value => value >= 5 && value <= 40
    ? right(undefined)
    : left({ ruleId: 'range', message: 'Must be between 5 and 40' });

// ── Functor: map over the success path ───────────────────────────────────────
// mapEither :: (A → B) → Either<E,A> → Either<E,B>
// Transforms the Right value without unwrapping.
// Leaves Left untouched (preserves the error channel).
// This satisfies Functor laws:
//   identity:    map(id)(fa)  ≡ fa
//   composition: map(g∘f)(fa) ≡ map(g)(map(f)(fa))
// Reference: https://en.wikipedia.org/wiki/Functor_\(functional_programming\)
const mappedResult = mapEither((v: void) => 'ok')(rangeCheck(20));

// ── Monad: chain validation steps ────────────────────────────────────────────
// chainEither :: (A → Either<E,B>) → Either<E,A> → Either<E,B>
// Enables sequential dependent validation (step 2 only runs if step 1 passes).
// Short-circuits on first Left — useful when later steps DEPEND on earlier ones.
// Satisfies Monad laws:
//   left identity:  chain(f)(of(a)) ≡ f(a)
//   right identity: chain(of)(ma)   ≡ ma
//   associativity:  chain(g)(chain(f)(ma)) ≡ chain(x => chain(g)(f(x)))(ma)
// Reference: https://en.wikipedia.org/wiki/Monad_\(functional_programming\)
const parseAndValidate = (raw: unknown): RuleResult =>
  chainEither((num: number) => rangeCheck(num))(parseNumber(raw));

// ── Fold: eliminate Either at the boundary ───────────────────────────────────
// foldEither :: (E → B, A → B) → Either<E,A> → B
// Used when we need to leave the Either context (e.g., display an error message).
const message: string | null = foldEither(
  (err: ValidationError) => err.message,
  (_: void) => null,
)(rangeCheck(41));
// message === 'Must be between 5 and 40'
```

### 12.2 Validation Applicative — Accumulating All Errors

The Either monad **short-circuits** on the first failure. But in validation, we need to show **all** failures simultaneously. This is the Validation applicative pattern:

```typescript
// The #evaluateAll method in ValidationEngine implements the Validation applicative.
// It manually accumulates all errors rather than using chainEither:

//   Either (monadic):    [pass, fail1, fail2] → Left(fail1)        ← stops at first
//   Validation (applic): [pass, fail1, fail2] → Invalid([fail1, fail2]) ← collects all

// Pseudocode for the applicative traverse:
//   traverse :: (A → Validation<E[],B>) → A[] → Validation<E[], B[]>

const evaluateAll = (
  rules: ValidationRule[],
  value: unknown,
  formData: Record<string, unknown>
): FieldValidationResult => {
  const errors = rules
    .filter(rule => !rule.activeWhen || jsonLogic.apply(rule.activeWhen, { value, formData }))
    .map(rule => evaluateOne(rule, value, formData))
    .filter(isLeft)
    .map(result => result.left);
  // ↑ This is the applicative "sequence" over the error accumulation monoid ([])

  return errors.length === 0 ? valid() : invalid(errors);
};
```

### 12.3 Maybe for Nullable lastValidatedValue Lookups

```typescript
import { fromNullable, mapMaybe, chainMaybe, foldMaybe, nothing, just } from '@vi/state-fp';

/**
 * Maybe<A> = Just<A> | Nothing
 * Used to safely handle possibly-null lastValidatedValue.
 *
 * fromNullable :: A | null | undefined → Maybe<A>
 * Lifts a nullable value into the Maybe context, eliminating null checks.
 *
 * This is a Functor: mapMaybe :: (A → B) → Maybe<A> → Maybe<B>
 * And a Monad:       chainMaybe :: (A → Maybe<B>) → Maybe<A> → Maybe<B>
 */

// Pattern: "should we run validation for this field?"
const shouldValidate = (currentValue: unknown, lastValidatedValue: unknown | null): boolean =>
  foldMaybe(
    () => true,                              // Nothing → never validated before → run
    (lastVal) => lastVal !== currentValue,   // Just(val) → run only if changed
  )(fromNullable(lastValidatedValue));

// Pattern: "get the last validated value or a default"
const getLastOrDefault = (state: FieldValidationState): unknown =>
  foldMaybe(
    () => null,           // Nothing → no previous value
    (v) => v,             // Just(v) → the stored value
  )(fromNullable(state.lastValidatedValue));
```

### 12.4 HOF — ValidatorFactory as Curried Function

```typescript
// ValidatorFactory is a curried HOF:
//   ValidatorFactory :: params → (value, formData) → RuleResult
//
// Currying transforms: f(a, b, c) → g(a)(b)(c)
// Partial application: bind 'params' once at form-init, reuse the returned fn.

const range = rangeValidator({ min: 5, max: 40 });
// range :: (value, formData) → RuleResult

// Now 'range' is a fully specialised function — no params needed at call site:
const result1 = range(20, {});   // Right(void)
const result2 = range(41, {});   // Left({ ruleId: 'range', message: '...' })
```

### 12.5 pipe for Pipeline Composition

```typescript
import { pipe } from '@vi/state-fp';

/**
 * pipe :: (A → B, B → C, C → D) → A → D
 * Composes functions left-to-right (opposite of compose, which is right-to-left).
 * Each function receives the output of the previous.
 *
 * The validation pipeline is a natural fit for pipe:
 */

// Example: parse a raw string, then validate it as a number in range
const validateRawInput = pipe(
  (raw: unknown) => String(raw).trim(),           // (1) coerce to string
  (s: string) => parseFloat(s),                  // (2) parse to number
  (n: number) => isNaN(n)                         // (3) validate
    ? left<ValidationError, void>({ ruleId: 'range', message: 'Must be a number' })
    : n >= 5 && n <= 40
      ? right<ValidationError, void>(undefined)
      : left({ ruleId: 'range', message: 'Must be between 5 and 40' }),
);

// Each step is a pure function. The pipe composes them into a single pipeline.
// No intermediate variables. No mutation.
```

### 12.6 ValidatorFn as Functor

```typescript
/**
 * The ValidatorFn type (returned by ValidatorFactory) is itself a Functor
 * if we think of it as a function from (value, formData) to RuleResult.
 *
 * We can "map" over the output context using withActiveWhen — a HOF that
 * wraps a validator with a conditional guard:
 *
 *   withActiveWhen :: JsonLogicExpression → ValidatorFn → ValidatorFn
 *
 * This is functor composition: mapping over a function's return type
 * while preserving the function structure.
 */
const withActiveWhen =
  (condition: JsonLogicExpression) =>
  (validator: (value: unknown, formData: Record<string, unknown>) => RuleResult) =>
  (value: unknown, formData: Record<string, unknown>): RuleResult => {
    const isActive = jsonLogic.apply(condition, { value, formData });
    return isActive ? validator(value, formData) : right(undefined);
  };

// Usage: required-when-X-is-Y
const requiredWhenAdult = withActiveWhen(
  { ">": [{ "var": "formData.age" }, 18] }
)(requiredValidator({}));

// requiredWhenAdult is a standard ValidatorFn — composable with any other
```

### 12.7 IO Monad for Side Effects

```typescript
import { io, mapIO, chainIO } from '@vi/state-fp';

/**
 * IO<A> = () → A
 * Defers side effects (HTTP calls, store dispatches) until the program boundary.
 * Makes the validation pipeline pure up until the actual save operation.
 *
 * The #reconcile and #evaluateAll methods are pure.
 * The IO boundary is at runForSave → persistToBackend.
 */

// Pure computation returns a delta
const delta: SaveValidationDelta = engine.runForSave(fieldStates, formData, schema);

// IO wraps the side effect (HTTP call) without executing it yet
const persistIO = io(() => http.post('/api/forms/{id}/validation-queries/delta', delta));

// Only at the "end of the world" (Angular effect, NgRx effect) does the IO run:
// persistIO() — executes the HTTP call
```

---

## 13. Cross-Field Validation

### 13.1 How it Works

Cross-field rules are **attached to the source field** (the field whose change triggers the rule). The evaluation context includes the full `formData` snapshot, so rules can reference any other field via `{ "var": "formData.fieldKey" }`.

When the rule fails:
- If `targetFieldKey` is specified → `SYSTEM_VALIDATION` raised on `targetFieldKey`
- If omitted → `SYSTEM_VALIDATION` raised on the source field

The audit trail records `auditReason` with the source context.

### 13.2 Schema Example

```typescript
// Field: startDate
// Rule: startDate must be before endDate
// SYSTEM_VALIDATION raised on startDate (self — no targetFieldKey)
{
  key: 'startDate',
  type: 'date',
  label: 'Study Start Date',
  validation: [
    {
      ruleId: 'startBeforeEnd',
      type: 'json-logic',
      rule: { "<": [{ "var": "value" }, { "var": "formData.endDate" }] },
      message: 'Start date must be before end date',
    }
  ]
}

// Field: country
// Rule: when country changes, check that site is still valid for that country
// SYSTEM_VALIDATION raised on site (targetFieldKey)
{
  key: 'country',
  type: 'select',
  label: 'Country',
  validation: [
    {
      ruleId: 'siteValidForCountry',
      type: 'json-logic',
      rule: {
        "in": [
          { "var": "formData.site" },
          { "var": "formData.__sitesForCountry" }  // injected into formData by cascade service
        ]
      },
      message: 'Selected site is not valid for this country',
      targetFieldKey: 'site',
      auditReason: "Site revalidated because country changed to '{{sourceValue}}'",
    }
  ]
}
```

---

## 14. Cascade Codelist Validation

### 14.1 Schema

```typescript
interface SelectComponentSchema extends BaseComponentSchema {
  type: 'select';
  options: {
    source: 'static' | 'api';
    items?: Array<{ label: string; value: string }>;   // for source: 'static'
    endpoint?: string;          // internal microservice endpoint (source: 'api')
    dependsOn?: {
      fieldKey: string;         // watch this field
      paramName: string;        // query param: GET /endpoint?{paramName}={value}
    };
  };
}

// Example:
{
  key: 'site',
  type: 'select',
  label: 'Site',
  options: {
    source: 'api',
    endpoint: '/api/codelists/sites',
    dependsOn: {
      fieldKey: 'country',
      paramName: 'countryCode'
    }
  }
}
```

### 14.2 Runtime Flow

```typescript
// Angular effect watches the source field via Signals
// Reference: https://angular.dev/guide/signals

effect(() => {
  const countryValue = fieldSignals['country']();   // reactive — re-runs on change
  if (countryValue == null) return;

  cascadeService.handleCascade(
    'country', countryValue,
    'site',
    '/api/codelists/sites', 'countryCode',
    fieldSignals['site'](),
  ).subscribe(result => {
    // 1. Update <vi-select> options
    fieldOptionsSignals['site'].set(result.options);

    // 2. If current value no longer in options: clear + raise cascade_invalidated
    if (result.cleared) {
      store.dispatch(validationActions.fieldValueChanged({ fieldKey: 'site', value: null }));
      // The engine raises cascade_invalidated SYSTEM_VALIDATION on next save
    }
  });
});
```

### 14.3 Cascade Service

```typescript
@Injectable({ providedIn: 'root' })
export class CascadeCodelistService {
  readonly #http = inject(HttpClient);

  handleCascade(
    sourceFieldKey: string,
    sourceValue: unknown,
    dependentFieldKey: string,
    endpoint: string,
    paramName: string,
    currentDependentValue: unknown,
  ): Observable<{ options: CodelistOption[]; cleared: boolean }> {
    const params = new HttpParams().set(paramName, String(sourceValue));

    return this.#http.get<CodelistOption[]>(endpoint, { params }).pipe(
      map(options => ({
        options,
        cleared: currentDependentValue != null &&
                 !options.some(o => o.value === currentDependentValue),
      })),
    );
  }
}
```

---

## 15. Reload — Surfacing Persisted Queries

On form open, the renderer loads open `SYSTEM_VALIDATION` records from the backend and surfaces them as inline error text against the relevant field. No validation re-runs on load.

```typescript
// libs/form-renderer/src/services/form-loader.service.ts

/** Group an array by a string key derived from each element. */
function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}

@Injectable({ providedIn: 'root' })
export class FormLoaderService {
  readonly #http = inject(HttpClient);
  readonly #store = inject(Store);

  load(formInstanceId: string): Observable<void> {
    return forkJoin({
      formData:    this.#http.get<FormData>(`/api/forms/${formInstanceId}`),
      openQueries: this.#http.get<SystemValidationRecord[]>(
                     `/api/forms/${formInstanceId}/validation-queries?status=open`
                   ),
    }).pipe(
      tap(({ formData, openQueries }) => {
        const queriesByField = groupBy(openQueries, q => q.fieldKey);

        this.#store.dispatch(validationActions.formLoaded({
          fields: Object.fromEntries(
            Object.entries(formData.fields).map(([key, field]) => [
              key,
              {
                value: field.value,
                lastValidatedValue: field.lastValidatedValue,   // from DB
                systemQueries: queriesByField[key] ?? [],
              },
            ])
          ),
        }));
      }),
      map(() => void 0),
    );
  }
}
```

Open `systemQueries` are rendered the same way as inline errors — red text beneath the field. No visual distinction from Phase 1 errors.

---

## 16. Schema Changes Required

These changes are to be applied to `form-builder-schema.md` (pending explicit instruction — TD-07):

### 16.1 Remove validateOn from BaseComponentSchema

Per-field `validateOn` is removed. It applies at form level only.

### 16.2 Add validation to BaseComponentSchema

```typescript
interface BaseComponentSchema {
  key: string;
  type: string;
  label: string;
  // ...existing fields...

  /**
   * Ordered array of validation rules.
   * Each rule is evaluated independently on every Phase 2 validation run.
   * Each failing rule raises exactly one SYSTEM_VALIDATION record.
   * All rules run — errors accumulate (no short-circuit).
   *
   * See: docs/form-builder-validation.md
   */
  validation?: ValidationRule[];
}
```

### 16.3 Update FormSettings

```typescript
interface FormSettings {
  /**
   * Phase 1 trigger mode. Default: 'onBlur'.
   * Phase 2 always fires on save regardless.
   */
  validateOn?: 'onBlur' | 'onChange' | 'onSubmit';
  maxWidth?: string;
  // ...
}
```

---

## 17. Testing Strategy

### 17.1 Built-in Validators — Unit Tests

```typescript
// libs/form-renderer/src/validation/built-in/validators.spec.ts
import { describe, it, expect } from 'vitest';
import { rangeValidator, requiredValidator } from './validators.js';
import { isLeft, isRight } from '@vi/state-fp';

describe('requiredValidator', () => {
  const validate = requiredValidator({});
  it('fails for null',  () => expect(isLeft(validate(null, {}))).toBe(true));
  it('fails for ""',    () => expect(isLeft(validate('', {}))).toBe(true));
  it('fails for []',    () => expect(isLeft(validate([], {}))).toBe(true));
  it('passes for 0',    () => expect(isRight(validate(0, {}))).toBe(true));
  it('passes for "a"',  () => expect(isRight(validate('a', {}))).toBe(true));
});

describe('rangeValidator', () => {
  const validate = rangeValidator({ min: 5, max: 40 });

  it('passes for in-range value',         () => expect(isRight(validate(20, {}))).toBe(true));
  it('passes for boundary min (5)',        () => expect(isRight(validate(5,  {}))).toBe(true));
  it('passes for boundary max (40)',       () => expect(isRight(validate(40, {}))).toBe(true));
  it('fails for below min (4)',            () => expect(isLeft(validate(4,  {}))).toBe(true));
  it('fails for above max (41)',           () => expect(isLeft(validate(41, {}))).toBe(true));
  it('passes for null (required handles)',() => expect(isRight(validate(null, {}))).toBe(true));
  it('message contains min and max',      () => {
    const result = validate(41, {});
    expect(isLeft(result) && result.left.message).toContain('5');
    expect(isLeft(result) && result.left.message).toContain('40');
  });
});
```

### 17.2 Reconciliation Logic — Unit Tests

```typescript
describe('ValidationEngine — reconciliation', () => {
  it('creates a new record when rule fails and no open record exists', () => {
    const delta = engine.runForSave(
      { age: { value: 41, lastValidatedValue: null, systemQueries: [], ... } },
      { age: 41 }, schema
    );
    expect(delta.toCreate).toHaveLength(1);
    expect(delta.toCreate[0].ruleId).toBe('range');
    expect(delta.toCreate[0].status).toBe('open');
  });

  it('does not duplicate when open record already exists', () => {
    const existingOpen = { id: 'q1', ruleId: 'range', status: 'open', ... };
    const delta = engine.runForSave(
      { age: { value: 41, lastValidatedValue: 35, systemQueries: [existingOpen], ... } },
      { age: 41 }, schema
    );
    expect(delta.toCreate).toHaveLength(0);
    expect(delta.toResolve).toHaveLength(0);
  });

  it('auto-resolves when rule now passes and open record exists', () => {
    const existingOpen = { id: 'q1', ruleId: 'range', status: 'open', ... };
    const delta = engine.runForSave(
      { age: { value: 20, lastValidatedValue: 41, systemQueries: [existingOpen], ... } },
      { age: 20 }, schema
    );
    expect(delta.toResolve).toContain('q1');
    expect(delta.toCreate).toHaveLength(0);
  });

  it('does not touch manually_closed records', () => {
    const manuallyClosed = { id: 'q1', ruleId: 'range', status: 'manually_closed', ... };
    const delta = engine.runForSave(
      { age: { value: 41, lastValidatedValue: 35, systemQueries: [manuallyClosed], ... } },
      { age: 41 }, schema
    );
    expect(delta.toResolve).not.toContain('q1');
  });
});
```

### 17.3 Value-Change Guard — Unit Tests

```typescript
describe('value-change guard', () => {
  it('skips validation when value equals lastValidatedValue', () => {
    const delta = engine.runForSave(
      { age: { value: 41, lastValidatedValue: 41, systemQueries: [], ... } },
      { age: 41 }, schema
    );
    expect(delta.toCreate).toHaveLength(0);
    expect(delta.toResolve).toHaveLength(0);
  });

  it('runs validation when value differs from lastValidatedValue', () => {
    const delta = engine.runForSave(
      { age: { value: 41, lastValidatedValue: null, systemQueries: [], ... } },
      { age: 41 }, schema
    );
    expect(delta.toCreate).toHaveLength(1);
  });

  it('skips for null === null (form never saved)', () => {
    const delta = engine.runForSave(
      { age: { value: null, lastValidatedValue: null, systemQueries: [], ... } },
      { age: null }, schema
    );
    // value is null, lastValidatedValue is null → guard skips (no change)
    expect(delta.toCreate).toHaveLength(0);
  });
});
```

### 17.4 json-logic Rule Tests

```typescript
import jsonLogic from 'json-logic-js';
import { registerCustomJsonLogicOps } from '../json-logic/custom-ops.js';

beforeAll(() => registerCustomJsonLogicOps());

describe('json-logic rules', () => {
  it('evaluates age-range conditional rule', () => {
    const rule = { "if": [
      { "==": [{ "var": "formData.ageUnit" }, "years"] },
      { "<": [5, { "var": "value" }, 40] },
      true
    ]};
    expect(jsonLogic.apply(rule, { value: 20, formData: { ageUnit: 'years' } })).toBe(true);
    expect(jsonLogic.apply(rule, { value: 3,  formData: { ageUnit: 'years' } })).toBe(false);
    expect(jsonLogic.apply(rule, { value: 3,  formData: { ageUnit: 'months' } })).toBe(true);
  });

  it('evaluates missing_some for at-least-one-of', () => {
    const rule = { "!": { "missing_some": [1, ["phone", "email", "fax"]] } };
    expect(jsonLogic.apply(rule, { phone: '123', email: null, fax: null })).toBeTruthy();
    expect(jsonLogic.apply(rule, { phone: null, email: null, fax: null })).toBeFalsy();
  });
});
```

---

## 18. Implementation Checklist

### Types & Schema
- [ ] Create `libs/form-renderer/src/validation/types.ts`
- [ ] Update `BaseComponentSchema` — add `validation?: ValidationRule[]`, remove per-field `validateOn`
- [ ] Update `FormSettings.validateOn` — `'onBlur' | 'onChange' | 'onSubmit'`

### Layer 1 — Built-in Validators
- [ ] Create `libs/form-renderer/src/validation/built-in/validators.ts`
- [ ] Implement all 10 validators with full unit test coverage
- [ ] Build `BUILT_IN_VALIDATORS` registry

### Layer 2 — json-logic
- [ ] `npm install json-logic-js`
- [ ] Create `custom-ops.ts` with `regex`, `startsWith`, `endsWith`
- [ ] Register custom ops in `APP_INITIALIZER`

### Engine
- [ ] Create `ValidationEngine` service
- [ ] `runForDataEntry()` — Phase 1
- [ ] `runForSave()` — Phase 2 with value-change guard
- [ ] `#evaluateAll()` — accumulating (not short-circuiting)
- [ ] `#reconcile()` — create/resolve delta, idempotent
- [ ] `strictEquals()` — deep value equality for guard

### State Management
- [ ] `ValidationState` + `FieldValidationState` interfaces
- [ ] `validation.actions.ts` — 5 action groups
- [ ] `validation.reducer.ts`
- [ ] `validation.selectors.ts`

### Services
- [ ] `FormLoaderService.load()` — fetches form data + open queries in parallel
- [ ] `CascadeCodelistService.handleCascade()`

### Backend (coordinate with backend team)
- [ ] `GET /api/forms/{id}/validation-queries?status=open`
- [ ] `POST /api/forms/{id}/validation-queries/delta`
- [ ] `system_validation` table with partial unique index on open records
- [ ] `last_validated_value` column on `form_field_data`

### Renderer Integration
- [ ] Each `vi-renderer-*` wrapper calls `runForDataEntry()` on blur/change
- [ ] `FormRendererComponent.save()` calls `runForSave()` before HTTP save
- [ ] Each wrapper renders `inlineErrors` + open `systemQueries` as red error text

### Builder
- [ ] Validation tab in field properties panel
- [ ] Built-in validator checkboxes (driven by matrix in §4.4)
- [ ] Parameter inputs per validator
- [ ] Message override input
- [ ] Query Builder component (`vi-validation-builder`)
- [ ] Rule Preview Panel (`vi-rule-preview`) with test inputs

### Renderer Integration
- [ ] Each `vi-renderer-*` wrapper calls `runForDataEntry()` on blur/change
- [ ] `FormRendererComponent.save()` calls `runForSave()` → `commitSaveResult()` AFTER HTTP success (§20.4)
- [ ] Each wrapper renders `inlineErrors` + open `systemQueries` as red error text (ARIA spec — §24)
- [ ] `provideValidation()` called in `app.config.ts` (§23)
- [ ] Hidden fields skip validation in both Phase 1 and Phase 2 (§21)
- [ ] Repeating fields use `fieldKey[n]` instance-key convention (§22)

### Builder
- [ ] Validation tab in field properties panel
- [ ] Built-in validator checkboxes (driven by matrix in §4.4)
- [ ] Parameter inputs per validator
- [ ] Message override input
- [ ] Query Builder component (`vi-validation-builder`)
- [ ] Rule Preview Panel (`vi-rule-preview`) with test inputs
- [ ] Enforce `ruleId` uniqueness within a field (§20.7)
- [ ] Validate regex patterns at schema save time (§25.2)
- [ ] Enforce camelCase-only fieldKeys — no dots (§25.3)

### Testing
- [ ] Unit tests for all 11 built-in validators (branch coverage) — including `wordCount`
- [ ] Reconciliation unit tests (create/resolve/no-duplicate/manually-closed)
- [ ] Value-change guard unit tests
- [ ] json-logic rule evaluation tests
- [ ] Integration test for the full age scenario (§8.2)
- [ ] Accessibility: error `<p>` has `role="alert"` and `aria-describedby` is wired (§24)
- [ ] Concurrent save guard unit test (§20.6)
- [ ] Backend delta POST failure → `lastValidatedValue` NOT updated (§20.4)

---

## 19. Pre-Implementation Decision Register

All architectural decisions, cross-document conflicts, and open questions that must be resolved or acknowledged before implementation begins.

**Legend:** ✅ Resolved | ⚠️ Conflict | 🔧 Doc Error Fixed | ❓ Pending Decision

| ID | Topic | Status | Resolution / Action Required |
|---|---|---|---|
| PD-01 | State Management: NgRx (§11) vs. FieldStateService Signals (renderer §7.3) | ✅ Resolved | `FieldStateService` (Signals) is canonical for v1. §11 is superseded. See **§20**. |
| PD-02 | `validateOn` tokens: `'blur'` (schema doc) vs `'onBlur'` (this doc) | ⚠️ Conflict | Apply TD-07 to `form-builder-schema.md`: rename to `'onBlur' \| 'onChange' \| 'onSubmit'`. This doc (§9.1) is correct. |
| PD-03 | `validation?: ValidationSchema` (schema doc) vs `validation?: ValidationRule[]` (this doc) | ⚠️ Conflict | Apply TD-07 to `form-builder-schema.md`: replace `ValidationSchema` with `ValidationRule[]`. This doc is correct. |
| PD-04 | `wordCount` validator in architecture (§2) and matrix (§4.4) but not implemented | 🔧 Fixed | `wordCount` validator and registry entry added to §4.3. |
| PD-05 | `ValidationEngine` DI scope: `providedIn: 'root'` vs per-form | ✅ Resolved | Engine scoped per `FormRendererComponent` via `providers: []`. See §20.2, §23.2. |
| PD-06 | `lastValidatedValue` updated before HTTP success — rollback on failure not handled | 🔧 Fixed | `runForSave()` returns delta only; `commitSaveResult()` called AFTER HTTP. See §20.4. |
| PD-07 | `findFieldInSchema` utility referenced in engine but never defined | 🔧 Fixed | Implementation added to §7.2 Helpers. |
| PD-08 | `groupBy` utility referenced in `FormLoaderService` but never defined | 🔧 Fixed | Implementation added to §15. |
| PD-09 | `rangeValidator` uses `isNaN(num)` — does not catch `Infinity` or `-Infinity` | 🔧 Fixed | Changed to `!isFinite(num)` in §4.3. |
| PD-10 | `left` and `right` imports missing from `ValidationEngine` | 🔧 Fixed | Import corrected in §7.2. |
| PD-11 | Repeating field validation — fieldKey convention, per-instance SYSTEM_VALIDATION | ✅ Documented | See **§22**. |
| PD-12 | Hidden field validation — does it run? what happens to open records? | ✅ Documented | See **§21**. |
| PD-13 | Angular bootstrap setup — `provideValidation()`, `APP_INITIALIZER` | ✅ Documented | See **§23**. |
| PD-14 | Accessibility ARIA spec for error display | ✅ Documented | See **§24**. |
| PD-15 | Security: ReDoS risk from `regex` custom op | ✅ Documented | See **§25.2**. |
| PD-16 | Concurrent save protection | ✅ Documented | See **§20.6**. |
| PD-17 | `ruleId` uniqueness enforcement within a field | ✅ Documented | See **§20.7**. |
| PD-18 | `json-logic-js` has no TypeScript types bundled | ✅ Documented | See **§23.4**: inline declaration or `@types/json-logic-js`. |
| PD-19 | FieldKey dot-notation conflict with json-logic `var` operator | ✅ Documented | See **§25.3**: fieldKeys must be camelCase, no dots. |
| PD-20 | `formData` snapshot timing during concurrent typing + save | ✅ Documented | See **§20.4**: snapshot taken at `runForSave()` call time, before HTTP. |

---

## 20. Renderer Integration — Signal-Based Wiring

**This section supersedes §11 for v1 implementation.**

The renderer (`form-builder-renderer.md §7.3`) uses `FieldStateService` — a Signal-based store scoped to each `FormRendererComponent` instance — as the primary field state container. The `ValidationEngine` writes errors directly to `FieldStateService` rather than dispatching NgRx actions.

### 20.1 Architecture Decision

| Aspect | NgRx (§11 — superseded) | FieldStateService (§20 — current) |
|---|---|---|
| State scope | App-wide singleton | Scoped per `FormRendererComponent` instance |
| State type | Action / Reducer / Selector | Angular Signals (`signal()`, `computed()`) |
| Two forms on same page | Share state ❌ | Fully isolated ✅ |
| DI scope | `providedIn: 'root'` | `providers: []` on `FormRendererComponent` |
| ValidationEngine writes | Dispatches NgRx actions | Calls `setClientError()` / `setLastValidatedValue()` |
| Test setup | NgRx `TestBed` store setup | Simple Angular `TestBed`, no store boilerplate |

### 20.2 Revised ValidationEngine — Signal Integration

```typescript
// libs/form-renderer/src/validation/engine/validation-engine.service.ts

import { Injectable, inject } from '@angular/core';
import { isLeft, left, right } from '@vi/state-fp';
import jsonLogic from 'json-logic-js';
import { BUILT_IN_VALIDATORS } from '../built-in/validators.js';
import { FieldStateService } from '../../services/field-state.service.js';
import type {
  ValidationRule, RuleResult, ValidationError,
  FieldValidationResult, SystemValidationRecord,
  SaveValidationResult,
} from '../types.js';

/**
 * ValidationEngine is scoped to FormRendererComponent via its providers:[].
 * Each renderer instance has its own isolated engine + FieldStateService.
 * Two <vi-form-renderer> elements on the same page never share state.
 */
@Injectable()  // NOT providedIn: 'root'
export class ValidationEngine {
  readonly #fieldState = inject(FieldStateService);

  // ─── Phase 1: Data-entry feedback ──────────────────────────────────────────

  /**
   * Run validators for inline feedback.
   * Writes error directly to FieldStateService (Signal-based).
   * NEVER creates SYSTEM_VALIDATION records.
   * Phase 1 has NO value-change guard — always runs when triggered.
   */
  runForDataEntry(
    fieldKey: string,
    value: unknown,
    rules: ReadonlyArray<ValidationRule>,
    formData: Record<string, unknown>,
  ): void {
    const result = this.#evaluateAll(rules, value, formData);
    const errorMsg = result._tag === 'Invalid'
      ? result.errors.map(e => e.message).join('; ')
      : null;
    this.#fieldState.setClientError(fieldKey, errorMsg);
  }

  // ─── Phase 2: Save-time validation ─────────────────────────────────────────

  /**
   * Run validators for all fields at save time.
   * Applies the value-change guard: fields whose value === lastValidatedValue are skipped.
   * Skips hidden fields (isVisible = false).
   *
   * ⚠️ Does NOT update FieldStateService state.
   * The CALLER must call commitSaveResult() ONLY AFTER the backend HTTP call succeeds.
   * This prevents stale lastValidatedValue if the backend rejects the delta.
   *
   * @returns SaveValidationResult — delta for backend + deferred state updates
   */
  runForSave(
    schema: FormSchema,
    formData: Record<string, unknown>,
  ): SaveValidationResult {
    const fieldStates = this.#fieldState.getAllFieldStates();
    const toCreate: SystemValidationRecord[] = [];
    const toResolve: string[] = [];
    const fieldUpdates: Array<{
      fieldKey: string;
      lastValidatedValue: unknown;
      result: FieldValidationResult;
    }> = [];
    const saveSessionId = crypto.randomUUID();

    for (const [fieldKey, state] of Object.entries(fieldStates)) {
      // Skip hidden fields — validation does not run for conditionally invisible fields
      if (!this.#fieldState.isVisible(fieldKey)) {
        // Auto-resolve any open queries for fields that are now hidden (§21)
        const openIds = state.systemQueries
          .filter(q => q.status === 'open')
          .map(q => q.id);
        toResolve.push(...openIds);
        continue;
      }

      // Value-change guard
      if (strictEquals(state.value, state.lastValidatedValue)) continue;

      const baseKey = fieldKey.replace(/\[\d+\]$/, '');
      const field = findFieldInSchema(schema, baseKey);
      if (!field || !field.validation?.length) continue;

      const result = this.#evaluateAll(field.validation, state.value, formData);
      const delta = this.#reconcile(fieldKey, result, state.systemQueries, saveSessionId);
      toCreate.push(...delta.toCreate);
      toResolve.push(...delta.toResolve);

      // Capture deferred state updates — applied only AFTER backend success
      fieldUpdates.push({ fieldKey, lastValidatedValue: state.value, result });
    }

    return { toCreate, toResolve, fieldUpdates, saveSessionId };
  }

  /**
   * Apply state updates after the backend confirms the delta was persisted.
   * Called by FormRendererComponent.save() only on HTTP 2xx.
   *
   * Separating this from runForSave() is critical:
   *   if the backend POST fails, lastValidatedValue stays at its old value,
   *   so the value-change guard fires correctly on the user's next save attempt.
   */
  commitSaveResult(result: SaveValidationResult): void {
    for (const update of result.fieldUpdates) {
      this.#fieldState.setLastValidatedValue(update.fieldKey, update.lastValidatedValue);
      const errorMsg = update.result._tag === 'Invalid'
        ? update.result.errors.map(e => e.message).join('; ')
        : null;
      this.#fieldState.setClientError(update.fieldKey, errorMsg);
    }
  }

  // ─── Pure evaluation — no side effects ─────────────────────────────────────

  #evaluateAll(
    rules: ReadonlyArray<ValidationRule>,
    value: unknown,
    formData: Record<string, unknown>,
  ): FieldValidationResult {
    const errors: ValidationError[] = [];
    for (const rule of rules) {
      if (rule.activeWhen && !jsonLogic.apply(rule.activeWhen, { value, formData })) continue;
      const result = this.#evaluateOne(rule, value, formData);
      if (isLeft(result)) {
        errors.push({
          ...result.left,
          ruleId: rule.ruleId,
          targetFieldKey: (rule as { targetFieldKey?: string }).targetFieldKey,
        });
      }
    }
    return errors.length === 0 ? { _tag: 'Valid' } : { _tag: 'Invalid', errors };
  }

  #evaluateOne(
    rule: ValidationRule,
    value: unknown,
    formData: Record<string, unknown>,
  ): RuleResult {
    if (rule.type === 'built-in') {
      const factory = BUILT_IN_VALIDATORS[rule.ruleId];
      if (!factory) return right(undefined); // unknown rule → fail-open
      return factory(rule.params ?? {})(value, formData);
    }
    if (rule.type === 'json-logic') {
      try {
        const passes = jsonLogic.apply(rule.rule, { value, formData });
        return passes
          ? right(undefined)
          : left({ ruleId: rule.ruleId, message: rule.message });
      } catch (e) {
        console.error(`[ValidationEngine] json-logic error in rule "${rule.ruleId}":`, e);
        return right(undefined); // malformed rule → fail-open
      }
    }
    return right(undefined);
  }

  #reconcile(
    fieldKey: string,
    result: FieldValidationResult,
    existing: ReadonlyArray<SystemValidationRecord>,
    saveSessionId: string,
  ): { toCreate: SystemValidationRecord[]; toResolve: string[] } {
    const openByRuleId = new Map(
      existing.filter(q => q.status === 'open').map(q => [q.ruleId, q])
    );
    const failingRuleIds = new Set(
      result._tag === 'Invalid' ? result.errors.map(e => e.ruleId) : []
    );
    const toCreate: SystemValidationRecord[] = [];
    const toResolve: string[] = [];

    if (result._tag === 'Invalid') {
      for (const error of result.errors) {
        const targetKey = error.targetFieldKey ?? fieldKey;
        if (!openByRuleId.has(error.ruleId)) {
          toCreate.push({
            id: crypto.randomUUID(),
            formInstanceId: '',  // filled by save service from form context
            fieldKey: targetKey,
            ruleId: error.ruleId,
            message: error.message,
            status: 'open',
            createdAt: new Date().toISOString(),
            resolvedAt: null,
            saveSessionId,
          });
        }
      }
    }

    for (const [ruleId, record] of openByRuleId) {
      if (!failingRuleIds.has(ruleId)) {
        toResolve.push(record.id);
      }
    }
    return { toCreate, toResolve };
  }
}

export interface SaveValidationResult {
  readonly toCreate:      ReadonlyArray<SystemValidationRecord>;
  readonly toResolve:     ReadonlyArray<string>;
  readonly saveSessionId: string;
  /** Deferred field state updates — apply ONLY AFTER backend HTTP success. */
  readonly fieldUpdates:  ReadonlyArray<{
    readonly fieldKey:            string;
    readonly lastValidatedValue:  unknown;
    readonly result:              FieldValidationResult;
  }>;
}
```

### 20.3 FieldStateService Additions Required

The `FieldStateService` defined in `form-builder-renderer.md §7.3` needs the following additions to support validation:

```typescript
// Additions to FieldStateService

// New per-field state shape (internal)
interface FieldStateEntry {
  value:               unknown;
  lastValidatedValue:  unknown;
  systemQueries:       SystemValidationRecord[];
}

// New public methods:
getAllFieldStates(): Record<string, FieldStateEntry>;
setLastValidatedValue(key: string, value: unknown): void;
getSystemQueries(key: string): SystemValidationRecord[];
setSystemQueries(key: string, queries: SystemValidationRecord[]): void;
```

### 20.4 Save Flow — Complete Sequence

```
FormRendererComponent.save()
  │
  ├─ Guard: if (_isSaving()) return   ← concurrent save protection (§20.6)
  │
  ├─ 1. Snapshot formData = fieldState.getSubmissionData()
  │
  ├─ 2. validationResult = engine.runForSave(schema, formData)
  │        → returns { toCreate, toResolve, fieldUpdates, saveSessionId }
  │        → FieldStateService NOT yet updated
  │
  ├─ 3. POST /api/forms/{id}/validation-queries/delta
  │        { toCreate, toResolve }
  │        │
  │        ├─ HTTP 2xx →
  │        │     engine.commitSaveResult(validationResult)
  │        │       → fieldState.setLastValidatedValue() per field   ← NOW updated
  │        │       → fieldState.setClientError() per field
  │        │       → fieldState.setSystemQueries() from backend response
  │        │
  │        └─ HTTP error →
  │              lastValidatedValue NOT updated
  │              inline errors unchanged (Phase 1 errors remain)
  │              announcer: "Save failed. Your data is preserved. Please retry."
  │
  └─ 4. (parallel or sequential) PUT /api/forms/{id}/field-data
           { fieldValues: { key: value, ... }, lastValidatedValues: { key: value, ... } }
           lastValidatedValues only included for fields where commitSaveResult() ran
```

### 20.5 FormRendererComponent Save Handler (Outline)

```typescript
// libs/form-renderer/src/lib/form-renderer.component.ts

async save(): Promise<void> {
  if (this._isSaving()) return;  // §20.6 concurrent-save guard
  this._isSaving.set(true);

  try {
    const formData = this._fieldState.getSubmissionData();
    const validationResult = this._engine.runForSave(this.schema, formData);

    // POST validation delta
    const deltaResponse = await firstValueFrom(
      this._http.post<DeltaResponse>(
        `/api/forms/${this.formInstanceId}/validation-queries/delta`,
        { toCreate: validationResult.toCreate, toResolve: validationResult.toResolve }
      )
    );

    // Commit state ONLY after HTTP success
    this._engine.commitSaveResult(validationResult);
    this._fieldState.setSystemQueriesFromDelta(deltaResponse);

    // Save field values
    await firstValueFrom(this._http.put(`/api/forms/${this.formInstanceId}`, formData));

  } catch {
    this._announcer.announce('Save failed. Your data is preserved. Please retry.', 'assertive');
  } finally {
    this._isSaving.set(false);
  }
}
```

### 20.6 Concurrent Save Protection

```typescript
// FieldStateService addition:
private readonly _isSaving = signal<boolean>(false);

// In FormRendererComponent.save():
//   if (this._isSaving()) return;   ← no-op on second click while first is in flight
//
// Why this is safe:
//   1. Each form instance has exactly one user session
//   2. The UI mutex prevents concurrent runForSave() + commitSaveResult() interleaving
//   3. The backend UNIQUE WHERE status='open' constraint is the final safety net
//      (prevents duplicate SYSTEM_VALIDATION records even if two saves somehow race at DB level)
```

### 20.7 ruleId Uniqueness Enforcement

Within a field's `validation` array, `ruleId` must be unique because SYSTEM_VALIDATION records are keyed by `(formInstanceId, fieldKey, ruleId)`.

| Rule source | ruleId value | Uniqueness guarantee |
|---|---|---|
| Built-in | Validator name: `'required'`, `'range'`, etc. | Builder prevents adding a second built-in of the same type |
| json-logic | UUID auto-generated by builder at creation time | UUID collision is statistically impossible |

Schema-level validation can assert `ruleId` uniqueness as a secondary guard.

---

## 21. Hidden Field Validation Skip Rule

When a field is hidden by a `conditional` rule (evaluated to `false`), **all validation is skipped** for that field in both phases.

**Rationale:** A hidden field has no visible state. Running validation produces errors the user cannot see or fix. In EDC semantics, a hidden field typically means "not applicable for this subject/visit" — its value is not clinically meaningful in this context.

Cross-reference: `form-builder-renderer.md §6.2` documents that hidden fields are removed from the DOM and excluded from the submission payload.

### 21.1 Behaviour Per Phase

| Phase | Trigger | Hidden field behaviour |
|---|---|---|
| Phase 1 (onBlur / onChange) | Field wrapper sees `isVisible = false` | Wrapper skips calling `runForDataEntry()` |
| Phase 2 (on save) | `ValidationEngine.runForSave()` | Checks `fieldState.isVisible(fieldKey)` — skips validation |

### 21.2 Open SYSTEM_VALIDATION Records When a Field Is Hidden

When a field becomes hidden that has `open` SYSTEM_VALIDATION records, those records are **auto-resolved** on the next save:

```
reason: field is hidden → data is not applicable →
        open queries no longer meaningful →
        add all open record IDs to toResolve
        status → 'auto_resolved'  (NOT 'cancelled' — that is a CDM action)
```

This is implemented in `ValidationEngine.runForSave()` (§20.2): for each hidden field, its open query IDs are added to `toResolve`.

> **Pending Validation (PD-12):** Confirm with the clinical team that auto-resolving queries when a field is hidden matches EDC workflow expectations. In some systems, CDMs want to review open queries before they are resolved, even for now-hidden fields.

---

## 22. Repeating Field Validation

### 22.1 The Challenge

When `BaseComponentSchema.isRepeating = true`, the field renders multiple instances. The submission value becomes an array (e.g., `{ phoneNumbers: ['+44 700', '+44 701'] }`). Validation must run independently per instance.

### 22.2 Field Key Convention for Repeating Instances

Each instance is identified by a compound key using bracket notation:

```
{fieldKey}[{index}]

Examples:
  phoneNumbers[0]    → first instance of the phoneNumbers field
  phoneNumbers[1]    → second instance
  contacts[0].name   → name field inside the first contacts repeater row
  contacts[0].phone  → phone field inside the first contacts repeater row
```

| Context | Key |
|---|---|
| Schema (`BaseComponentSchema.key`) | `phoneNumbers` |
| FieldStateService — instance 0 | `phoneNumbers[0]` |
| FieldStateService — instance 1 | `phoneNumbers[1]` |
| SYSTEM_VALIDATION `fieldKey` | `phoneNumbers[0]` |
| `findFieldInSchema` lookup key | `phoneNumbers` (base key, after stripping `[0]`) |

### 22.3 Validation Behaviour Per Instance

Each instance validates independently:

- `lastValidatedValue` is tracked per instance key (`phoneNumbers[0]`, `phoneNumbers[1]`)
- SYSTEM_VALIDATION records are raised per instance key
- Adding a new instance creates a new entry with `lastValidatedValue = null` (will be validated on first save)
- Deleting an instance: any open SYSTEM_VALIDATION records for that instance key are auto-resolved on the next save

### 22.4 `required` Validator Semantics for Repeating Fields

The `required` validator on a repeating field:
- Validates **each individual instance** — each instance value must be non-empty
- Does **not** validate the minimum number of instances — that is enforced by `minRepeat` at the UX level

### 22.5 `findFieldInSchema` with Repeating Fields

`findFieldInSchema` (§7.2) matches on `ComponentSchema.key`, not the instance key. The engine strips the `[n]` suffix before lookup:

```typescript
// In runForSave() — already handled:
const baseKey = fieldKey.replace(/\[\d+\]$/, '');
const field = findFieldInSchema(schema, baseKey);
```

---

## 23. Angular Bootstrap Setup

### 23.1 Provider Function

A single `provideValidation()` function wires all validation infrastructure at app startup:

```typescript
// libs/form-renderer/src/validation/provide-validation.ts

import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { registerCustomJsonLogicOps } from './json-logic/custom-ops.js';
import { CUSTOM_VALIDATOR_REGISTRY, type CustomValidatorRegistry } from './tokens/custom-validator-registry.token.js';

export interface ValidationConfig {
  /** Custom validators to add to the registry. Optional. */
  customValidators?: CustomValidatorRegistry;
}

/**
 * Call in app.config.ts to bootstrap the validation system.
 * Registers custom json-logic operations (regex, startsWith, endsWith)
 * and optionally mounts a custom validator registry.
 *
 * ValidationEngine and FieldStateService are NOT provided here — they are
 * scoped to FormRendererComponent via its providers:[] array.
 *
 * Usage:
 *   export const appConfig: ApplicationConfig = {
 *     providers: [
 *       provideValidation(),
 *       // or:
 *       provideValidation({ customValidators: MY_VALIDATORS }),
 *     ]
 *   };
 */
export function provideValidation(config?: ValidationConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {
        // Register custom json-logic operations synchronously.
        // json-logic-js uses a module-level mutable registry — no async needed.
        registerCustomJsonLogicOps();
      },
      multi: true,
    },
    ...(config?.customValidators
      ? [{ provide: CUSTOM_VALIDATOR_REGISTRY, useValue: config.customValidators }]
      : []),
  ]);
}
```

### 23.2 FormRendererComponent Provider Scope

```typescript
// libs/form-renderer/src/lib/form-renderer.component.ts

@Component({
  selector: 'vi-form-renderer',
  standalone: true,
  providers: [
    FieldStateService,  // Signal-based field state — one instance per renderer
    ValidationEngine,   // Scoped to this renderer, injects FieldStateService above
  ],
})
export class FormRendererComponent { ... }
```

Angular's hierarchical DI ensures that each `<vi-form-renderer>` element creates its own `FieldStateService` and `ValidationEngine` instances. Two renderer elements on the same page are completely isolated.

### 23.3 InjectionToken for Custom Validators

```typescript
// libs/form-renderer/src/validation/tokens/custom-validator-registry.token.ts

import { InjectionToken } from '@angular/core';
import type { RuleResult } from '../types.js';

export type CustomValidatorFn = (
  value: unknown,
  formData: Record<string, unknown>,
  params?: Record<string, unknown>,
) => RuleResult | Promise<RuleResult>;

export type CustomValidatorRegistry = Record<string, CustomValidatorFn>;

export const CUSTOM_VALIDATOR_REGISTRY =
  new InjectionToken<CustomValidatorRegistry>('CUSTOM_VALIDATOR_REGISTRY', {
    providedIn: null,  // host provides via provideValidation()
  });
```

### 23.4 json-logic-js TypeScript Types

`json-logic-js` ships as plain JavaScript with no bundled TypeScript declarations.

**Option A — DefinitelyTyped:**
```bash
npm install --save-dev @types/json-logic-js
```
Check coverage after install — the `@types` package is community-maintained and may not cover `add_operation`.

**Option B — Inline declaration (recommended if Option A is insufficient):**
```typescript
// libs/form-renderer/src/validation/json-logic/json-logic.d.ts

declare module 'json-logic-js' {
  type JsonLogicData = Record<string, unknown> | unknown[];
  type JsonLogicRule = Record<string, unknown> | boolean | null;

  interface JsonLogicLib {
    apply(rule: JsonLogicRule, data?: JsonLogicData): unknown;
    add_operation(name: string, code: (...args: unknown[]) => unknown): void;
    uses_data(rule: JsonLogicRule): string[];
    is_logic(logic: unknown): boolean;
  }

  const jsonLogic: JsonLogicLib;
  export = jsonLogic;
}
```

---

## 24. Accessibility — Error Display Specification

### 24.1 ARIA Pattern for Inline Errors

Every `vi-renderer-*` wrapper that displays validation errors must follow this pattern:

```html
<!-- Angular template inside vi-renderer-input (and all other wrappers) -->
<div class="vi-field-wrapper">
  <vi-input
    [id]="fieldId()"
    [attr.aria-describedby]="hasError() ? errorId() : null"
    [attr.aria-invalid]="hasError() ? 'true' : null"
    ...other bindings...
  ></vi-input>

  @if (hasError()) {
    <p
      [id]="errorId()"
      class="vi-field-error"
      role="alert"
      aria-live="assertive"
    >
      {{ errorMessage() }}
    </p>
  }
</div>
```

```typescript
// In each vi-renderer-* wrapper component:
readonly fieldId     = computed(() => `vi-field-${this.schema().key}`);
readonly errorId     = computed(() => `vi-field-${this.schema().key}-error`);
readonly hasError    = computed(() => this._fieldState.getError(this.schema().key) !== null);
readonly errorMessage = computed(() => this._fieldState.getError(this.schema().key));
```

**Required attributes:**

| Attribute | On element | Purpose |
|---|---|---|
| `id="{errorId}"` | Error `<p>` | Target for `aria-describedby` |
| `aria-describedby="{errorId}"` | `<vi-input>` | Associates error with field for screen readers |
| `aria-invalid="true"` | `<vi-input>` | Signals invalid state; cleared when error is null |
| `role="alert"` | Error `<p>` | Causes immediate announcement when inserted into DOM |
| `aria-live="assertive"` | Error `<p>` | Fallback for `role="alert"` across screen reader implementations |

**Note:** `role="alert"` implies `aria-live="assertive"`. Both are included for maximum compatibility (NVDA, JAWS, VoiceOver, TalkBack).

**Note:** `<vi-input>` is a Lit web component with Shadow DOM. The `aria-describedby` must target the Lit element's host element id (set via `[id]` binding on the host), not a slot inside the shadow root. The Lit component must forward `aria-describedby` and `aria-invalid` to its internal `<input>` element via `this.internals.ariaDescribedby` and `this.internals.ariaInvalid` (ElementInternals API).

### 24.2 LiveAnnouncer Integration

Angular CDK's `LiveAnnouncer` is used for form-level announcements (not field-level):

```typescript
// When Phase 2 save reveals new validation failures:
this._announcer.announce(
  `${newErrorCount} validation ${newErrorCount === 1 ? 'query' : 'queries'} raised after save.`,
  'assertive',
);

// When save completes with no new queries:
this._announcer.announce('Form saved successfully.', 'polite');

// When save fails:
this._announcer.announce('Save failed. Your data is preserved. Please retry.', 'assertive');
```

Field-level errors use `role="alert"` on the error `<p>` directly — no `LiveAnnouncer` needed for those, since DOM insertion triggers the announcement.

### 24.3 Error Summary Component

`vi-renderer-error-summary` (referenced in renderer doc §8.1) lists all field errors at the form top:

```html
@if (hasAnyErrors()) {
  <section
    aria-label="Form validation errors"
    aria-live="assertive"
    class="vi-error-summary"
  >
    <h2>{{ errorCount() }} error{{ errorCount() === 1 ? '' : 's' }} in this form</h2>
    <ul>
      @for (error of allFieldErrors(); track error.fieldKey) {
        <li>
          <!-- Links move focus to the field control -->
          <a [href]="'#vi-field-' + error.fieldKey">
            {{ error.label }}: {{ error.message }}
          </a>
        </li>
      }
    </ul>
  </section>
}
```

### 24.4 WCAG 2.1 AA Compliance Checklist

| Criterion | Requirement | Implementation |
|---|---|---|
| 1.4.1 Use of Color | Error state must not rely on color alone | Error icon + `aria-invalid` + error text |
| 1.4.3 Contrast (Minimum) | Error text ≥ 4.5:1 contrast ratio | `@vialiq/flux-ui` error color tokens |
| 2.4.6 Headings and Labels | Error summary has accessible heading | `<h2>` in error summary |
| 3.3.1 Error Identification | Errors identified in text | Message always contains text |
| 3.3.3 Error Suggestion | Suggest correction where possible | Messages include expected format/range/value |
| 4.1.3 Status Messages | Errors announced without focus change | `role="alert"` on error `<p>` |

---

## 25. Security Considerations

### 25.1 json-logic — Rule Injection Prevention

json-logic rules are stored as JSON and evaluated by `json-logic-js`. The library:
- Has **no `eval()`** — parses JSON structure directly ✅
- Can only access data **explicitly passed** in the evaluation context ✅
- **Cannot** call JavaScript functions or access globals ✅
- Has **no loops** — bounded computation time ✅

**Risk: Schema tampering.** If an attacker can modify the form schema, they could inject a malicious rule. Mitigations:
- Schema is fetched from the backend via authenticated, authorised endpoints
- Only study designers with explicit `WRITE` permissions can modify schemas
- The schema API should validate the `JsonLogicExpression` structure at write time (whitelist allowed operators; reject unknown keys)

**Server-side use:** The same json-logic JSON is evaluated on the backend for authoritative SYSTEM_VALIDATION creation. The backend implementation must maintain the same security posture — no `eval`, no dynamic code execution. Use `json-logic-php`, a validated Node.js runner, or the same `json-logic-js` in a sandboxed context.

### 25.2 ReDoS — Regex Custom Operation

The `regex` custom operation accepts a study-configured pattern:

```typescript
jsonLogic.add_operation('regex', (value: unknown, pattern: string, flags = '') => {
  return new RegExp(pattern, flags).test(String(value));
});
```

A catastrophic backtracking pattern (e.g., `^(a+)+$`, `(a|a)+`) can cause exponential evaluation time — a ReDoS (Regular Expression Denial of Service) vulnerability.

**Mitigations:**
1. **Schema-level validation (recommended):** At schema save time, validate regex patterns using `safe-regex` (npm) or manual analysis. Reject patterns with nested quantifiers.
2. **Builder constraint:** Restrict the builder's regex input to a curated library of validated patterns (most EDC patterns are simple: `^\d+$`, ISO date formats, etc.).
3. **Backend re-validation:** The backend must also validate regex patterns on schema write — client-side validation alone is not sufficient.

**Patterns that must be rejected:**
- Nested quantifiers: `(a+)+`, `(a*)*`, `(a+)*`
- Catastrophic alternation: `(a|a)+`, `(a|a?)+`

### 25.3 FieldKey Dot-Notation Constraint

json-logic's `var` operator uses dots as path separators when accessing nested objects:

```jsonc
{ "var": "formData.age" }          // → formData.age           ✅
{ "var": "formData.addr.city" }    // → formData["addr"]["city"]  ← NESTED traversal!
```

**If a fieldKey contains a dot** (e.g., `"first.name"`), the `var` operator would interpret it as a nested path — it would look for `formData["first"]["name"]` instead of `formData["first.name"]`.

**Constraint (already implied by schema doc convention, made explicit here):**
> `BaseComponentSchema.key` values **must** be camelCase identifiers with **no dots**.
> Enforced by the builder with pattern: `^[a-zA-Z][a-zA-Z0-9]*$`

### 25.4 XSS in Validation Error Messages

Error messages are study-configured strings stored in `JsonLogicRule.message` or `BuiltInRule.message`. If rendered as HTML, they could contain XSS payloads.

**Mitigation:** All error messages must be rendered as **text content** only. Angular's `{{ }}` interpolation uses `textContent` by default — safe. **Never** use `[innerHTML]` to display validation error messages.

### 25.5 Security Checklist

| Risk | Mitigation | Status |
|---|---|---|
| json-logic rule injection via schema | Schema write permissions + operator whitelist | ⏳ Backend to implement |
| ReDoS via regex pattern | Builder-side `safe-regex` validation + backend re-validation | ⏳ Builder + backend to implement |
| XSS in error messages | Angular template interpolation (`textContent`) | ✅ By framework default |
| Dot-notation fieldKey exploit | Builder enforces `^[a-zA-Z][a-zA-Z0-9]*$` | ⏳ Builder to implement |
| Stale `lastValidatedValue` on save failure | `commitSaveResult()` called only after HTTP success | ✅ Documented in §20.4 |
| Concurrent save producing duplicate records | UI-level save mutex + DB UNIQUE constraint | ✅ Documented in §20.6 |

---

## 26. Encrypted Field Exclusion from Edit Checks

> **Related:** [field-level-encryption-clinical-edc.md](./field-level-encryption-clinical-edc.md) §8–9 (full design)  
> **Schema:** `BaseComponentSchema.encryption` — see [form-builder-schema.md](./form-builder-schema.md) §3.1

When `BaseComponentSchema.encryption.enabled = true`, the field's plaintext value is **never available in the edit-check context**. This is a hard constraint — not a configuration option.

### 26.1 Why Encrypted Fields Cannot Participate in Edit Checks

The fundamental tension is:

1. **FLE guarantees** that no process other than the encryption service ever handles plaintext.
2. **Edit checks** need plaintext values to evaluate conditions (e.g., `age > 18`, `dose <= maxDose`).

These two requirements are **incompatible**. Solving the incompatibility would require either:
- Decrypting the value inside the edit-check engine (breaks FLE isolation), or
- Using order-preserving or deterministic encryption (leaks information, rejects AES-256-GCM).

Neither approach is acceptable for clinical trial data. Therefore encrypted fields are permanently excluded.

**Clinical consequence:** This is a deliberate form design constraint. Sponsors and study designers must not mark fields that are needed in edit checks as encrypted. Fields that do not appear in any edit-check rule are the correct candidates for FLE (PII, personal identifiers, sensitive demographics).

### 26.2 Two-Layer Enforcement

#### Layer 1 — Design Time (Form Builder)

The builder field picker enforces the restriction at authoring time:

```typescript
// libs/form-builder/src/lib/edit-check-builder/field-picker.component.ts

/**
 * Returns true when this field must not be offered in the edit-check
 * field picker (encrypted fields cannot be referenced in rules).
 */
readonly isExcluded = computed(() =>
  (this.fieldSchema().encryption?.enabled ?? false)
);

// Template:
// @if (isExcluded()) {
//   <span class="vi-lock-icon" aria-label="Encrypted — cannot be used in edit checks">
//     🔒
//   </span>
// }
```

- Encrypted fields appear **greyed out** with a lock icon in the field picker.
- They **cannot be dragged** into edit-check rule slots (pragmatic-drag-and-drop `canDrop` returns false).
- Hovering the lock icon shows a tooltip: *"This field is encrypted. Encrypted fields cannot be referenced in edit check rules."*

Schema validation at form-publish time also catches any field that is both `encryption.enabled = true` and referenced in a json-logic or Blockly edit-check rule:

```typescript
// libs/form-builder/src/lib/schema/schema-validator.ts

/**
 * Validates that no encrypted field is referenced in any edit check.
 * Runs at form-publish time. Blocks publication if violations are found.
 */
export function validateNoEncryptedFieldsInEditChecks(
  schema: FormSchema,
): ValidationIssue[] {
  const encryptedKeys = new Set(
    collectAllFields(schema)
      .filter(f => f.encryption?.enabled)
      .map(f => f.key)
      .filter(Boolean) as string[]
  );

  if (encryptedKeys.size === 0) return [];

  return collectAllEditCheckRules(schema)
    .flatMap(rule => extractFormDataRefs(rule))
    .filter(ref => encryptedKeys.has(ref))
    .map(ref => ({
      severity: 'error' as const,
      message: `Field '${ref}' is encrypted and cannot be referenced in edit check rules.`,
      fieldKey: ref,
    }));
}
```

#### Layer 2 — Runtime (Edit Check Engine)

Even if a malformed schema somehow reaches the runtime, `buildEditCheckContext()` strips encrypted fields from the JsonLogic evaluation context **before** the engine runs:

```typescript
// libs/form-renderer/src/edit-checks/edit-check-engine.service.ts

/**
 * Build the data context passed to every edit-check rule evaluation.
 *
 * Encrypted fields are ALWAYS excluded — their plaintext is never available
 * here. If a rule references an encrypted field, json-logic's `var` operator
 * returns `undefined` for that reference, causing the rule to be inconclusive
 * rather than throwing or silently passing.
 */
export function buildEditCheckContext(
  fieldStates: Record<string, FieldStateEntry>,
  schema: FormSchema,
): Record<string, unknown> {
  const encryptedKeys = new Set(
    collectAllFields(schema)
      .filter(f => f.encryption?.enabled)
      .map(f => f.key)
      .filter(Boolean) as string[]
  );

  return Object.fromEntries(
    Object.entries(fieldStates)
      .filter(([key]) => !encryptedKeys.has(key))
      .map(([key, state]) => [key, state.value])
  );
}
```

**Effect:** If an encrypted field `patientId` is somehow referenced in a rule:
```jsonc
// Rule: { "!=": [{ "var": "formData.patientId" }, null] }
```
`patientId` is absent from the context → `{ "var": "formData.patientId" }` returns `undefined` → `undefined !== null` evaluates to `true` in JavaScript → the rule passes silently.

This fail-open behaviour is intentional: it prevents a broken edit check from blocking data entry. The Layer 1 design-time enforcement is the primary barrier; Layer 2 is a runtime safety net.

### 26.3 Decision Register

| ID | Decision | Rationale |
|---|---|---|
| FLE-EC-01 | Encrypted fields excluded from edit checks | AES-256-GCM non-deterministic; decrypting inside rule engine breaks FLE isolation |
| FLE-EC-02 | Builder greys out encrypted fields in rule slot picker | Prevents configuration errors at authoring time |
| FLE-EC-03 | `validateNoEncryptedFieldsInEditChecks()` runs at publish | Second design-time barrier; blocks bad schemas before they reach production |
| FLE-EC-04 | Runtime context strips encrypted keys | Defence in depth; runtime never processes plaintext of encrypted fields |
| FLE-EC-05 | Fail-open (undefined → pass) rather than throw | Broken edit checks must not block data entry in an EDC system |

### 26.4 Implementation Checklist

- [ ] Form builder field picker: `isExcluded` computed property for encrypted fields
- [ ] Field picker drag slots: `canDrop` returns false for encrypted source fields
- [ ] Lock icon + tooltip in field picker for excluded fields
- [ ] `validateNoEncryptedFieldsInEditChecks()` in schema validator, run at publish
- [ ] `buildEditCheckContext()` strips encrypted fields before every rule evaluation
- [ ] Unit test: encrypted field reference → context key absent → rule gets `undefined`
- [ ] Unit test: `validateNoEncryptedFieldsInEditChecks()` catches violation in complex nested schema
- [ ] Builder: visual indicator on canvas nodes for encrypted fields (lock badge)

