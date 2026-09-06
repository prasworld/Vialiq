/**
 * Validation rule types and results.
 * These are framework-agnostic — no Angular imports.
 */

// ─── Rule Descriptors (discriminated union) ───────────────────────────────────

export type RuleDescriptor =
  | { type: 'required' }
  | { type: 'minLength'; value: number }
  | { type: 'maxLength'; value: number }
  | { type: 'min'; value: number }
  | { type: 'max'; value: number }
  | { type: 'pattern'; value: string; flags?: string }
  | { type: 'email' }
  | { type: 'url' }
  | { type: 'integer' }
  | { type: 'json-logic'; rule: Record<string, unknown> }
  | { type: 'custom-js'; fn: string };  // gated by allowCustomJs

/**
 * A single validation rule attached to a field.
 * `descriptor` defines what to validate; `message` overrides the default error text.
 * Supports {{value}} interpolation in messages.
 */
export interface ValidationRule {
  descriptor: RuleDescriptor;
  /** Optional custom error message. Supports {{value}} interpolation. */
  message?: string;
}

// ─── Validation Result ────────────────────────────────────────────────────────

export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };

// ─── Server Validation Error ──────────────────────────────────────────────────

/** Error returned from server-side validation — keyed by field key. */
export interface ServerValidationError {
  /** The field key this error belongs to */
  key: string;
  message: string;
}

// ─── Custom Validator SDK types ───────────────────────────────────────────────

/** Context passed to every custom validator function */
export interface ValidatorContext {
  /** The field key being validated */
  key: string;
  /** The entire current form data */
  formData: Record<string, unknown>;
  /** Optional study/visit metadata injected by the product layer */
  meta?: Record<string, unknown>;
}

export type ValidatorFn = (
  value: unknown,
  context: ValidatorContext
) => ValidationResult | Promise<ValidationResult>;

/** Helper: return a passing result */
export function pass(): ValidationResult { return { valid: true }; }

/** Helper: return a failing result */
export function fail(message: string): ValidationResult { return { valid: false, message }; }

/** Registry of named custom validators provided by the host application */
export type CustomValidatorRegistry = Record<string, ValidatorFn>;
