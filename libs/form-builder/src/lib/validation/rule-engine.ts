import type { ValidationRule, ValidationResult, RuleDescriptor } from '../types/validation';

// ─── Error Types ──────────────────────────────────────────────────────────────

export class CustomJsDisabledError extends Error {
  override name = 'CustomJsDisabledError';
  constructor() {
    super(
      'Custom JS validators are disabled. Set allowCustomJs: true in BUILDER_CONFIG to enable. ' +
      'Note: this requires a permissive Content Security Policy.'
    );
  }
}

// ─── Message interpolation ────────────────────────────────────────────────────

function interpolate(template: string, value: unknown): string {
  return template.replace(/\{\{value\}\}/g, String(value ?? ''));
}

// ─── Individual Evaluators ────────────────────────────────────────────────────

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function evaluateRequired(value: unknown): boolean {
  return !isEmpty(value);
}

export function evaluateMinLength(value: unknown, min: number): boolean {
  if (isEmpty(value)) return true; // required handles empty
  if (typeof value === 'string') return value.length >= min;
  if (Array.isArray(value)) return value.length >= min;
  return true;
}

export function evaluateMaxLength(value: unknown, max: number): boolean {
  if (isEmpty(value)) return true;
  if (typeof value === 'string') return value.length <= max;
  if (Array.isArray(value)) return value.length <= max;
  return true;
}

export function evaluateMin(value: unknown, min: number): boolean {
  if (isEmpty(value)) return true;
  return Number(value) >= min;
}

export function evaluateMax(value: unknown, max: number): boolean {
  if (isEmpty(value)) return true;
  return Number(value) <= max;
}

export function evaluatePattern(value: unknown, pattern: string, flags?: string): boolean {
  if (isEmpty(value)) return true;
  try {
    return new RegExp(pattern, flags).test(String(value));
  } catch {
    console.warn(`[rule-engine] Invalid pattern: "${pattern}"`);
    return true;
  }
}

// RFC 5322 simplified — robust enough for form validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export function evaluateEmail(value: unknown): boolean {
  if (isEmpty(value)) return true;
  return EMAIL_REGEX.test(String(value));
}

export function evaluateUrl(value: unknown): boolean {
  if (isEmpty(value)) return true;
  try {
    new URL(String(value));
    return true;
  } catch {
    return false;
  }
}

export function evaluateInteger(value: unknown): boolean {
  if (isEmpty(value)) return true;
  return Number.isInteger(Number(value));
}

// ─── Default messages ─────────────────────────────────────────────────────────

const DEFAULT_MESSAGES: Record<string, string> = {
  required:  'This field is required.',
  minLength: 'Must be at least {{value}} characters.',
  maxLength: 'Must be no more than {{value}} characters.',
  min:       'Must be at least {{value}}.',
  max:       'Must be no more than {{value}}.',
  pattern:   'The value does not match the required format.',
  email:     'Please enter a valid email address.',
  url:       'Please enter a valid URL.',
  integer:   'Must be a whole number.',
  'json-logic': 'This field is invalid.',
  'custom-js':  'This field is invalid.',
};

// ─── Main evaluate function ───────────────────────────────────────────────────

/**
 * Evaluate a set of validation rules against a field value.
 *
 * @param rules       The validation rules attached to the field
 * @param value       The current field value
 * @param formData    The entire form's current values (for json-logic / cross-field rules)
 * @param options     Optional options (allowCustomJs, jsonLogicEvaluator)
 * @returns           ValidationResult — { valid: true } or { valid: false, message: string }
 */
export function evaluate(
  rules: ValidationRule[],
  value: unknown,
  formData: Record<string, unknown>,
  options: {
    allowCustomJs?: boolean;
    jsonLogicEvaluator?: (rule: Record<string, unknown>, data: unknown) => unknown;
  } = {}
): ValidationResult {
  for (const rule of rules) {
    const result = evaluateRule(rule, value, formData, options);
    if (!result.valid) return result;
  }
  return { valid: true };
}

function evaluateRule(
  rule: ValidationRule,
  value: unknown,
  formData: Record<string, unknown>,
  options: {
    allowCustomJs?: boolean;
    jsonLogicEvaluator?: (rule: Record<string, unknown>, data: unknown) => unknown;
  }
): ValidationResult {
  const { descriptor, message } = rule;
  const defaultMsg = (key: string, interpolateValue?: unknown) => {
    const tmpl = message ?? DEFAULT_MESSAGES[key] ?? 'Invalid value.';
    return interpolate(tmpl, interpolateValue ?? value);
  };

  const fail = (key: string, interpolateValue?: unknown): ValidationResult => ({
    valid: false,
    message: defaultMsg(key, interpolateValue),
  });

  switch (descriptor.type) {
    case 'required':
      return evaluateRequired(value) ? { valid: true } : fail('required');

    case 'minLength':
      return evaluateMinLength(value, descriptor.value)
        ? { valid: true }
        : fail('minLength', descriptor.value);

    case 'maxLength':
      return evaluateMaxLength(value, descriptor.value)
        ? { valid: true }
        : fail('maxLength', descriptor.value);

    case 'min':
      return evaluateMin(value, descriptor.value)
        ? { valid: true }
        : fail('min', descriptor.value);

    case 'max':
      return evaluateMax(value, descriptor.value)
        ? { valid: true }
        : fail('max', descriptor.value);

    case 'pattern':
      return evaluatePattern(value, descriptor.value, descriptor.flags)
        ? { valid: true }
        : fail('pattern');

    case 'email':
      return evaluateEmail(value) ? { valid: true } : fail('email');

    case 'url':
      return evaluateUrl(value) ? { valid: true } : fail('url');

    case 'integer':
      return evaluateInteger(value) ? { valid: true } : fail('integer');

    case 'json-logic': {
      if (!options.jsonLogicEvaluator) {
        console.warn('[rule-engine] json-logic rule found but no evaluator provided. Skipping.');
        return { valid: true };
      }
      const result = options.jsonLogicEvaluator(descriptor.rule, { value, ...formData });
      return result ? { valid: true } : fail('json-logic');
    }

    case 'custom-js': {
      if (!options.allowCustomJs) {
        throw new CustomJsDisabledError();
      }
      // eslint-disable-next-line no-new-func
      const fn = new Function('value', 'formData', descriptor.fn) as (v: unknown, d: unknown) => boolean;
      return fn(value, formData) ? { valid: true } : fail('custom-js');
    }

    default: {
      // Exhaustive check — if a new RuleDescriptor type is added without a case, TS will warn
      const _exhaustive: never = descriptor;
      console.warn(`[rule-engine] Unknown rule type: ${(_exhaustive as RuleDescriptor).type}`);
      return { valid: true };
    }
  }
}
