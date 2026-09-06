import { describe, it, expect } from 'vitest';
import {
  evaluate,
  evaluateRequired,
  evaluateMinLength,
  evaluateMaxLength,
  evaluateMin,
  evaluateMax,
  evaluatePattern,
  evaluateEmail,
  evaluateUrl,
  evaluateInteger,
  CustomJsDisabledError,
} from './rule-engine';
import type { ValidationRule } from '../types/validation';

const fd = {}; // empty formData — used where cross-field rules are not needed

// ─── required ─────────────────────────────────────────────────────────────────

describe('evaluateRequired', () => {
  it('returns true for non-empty string', () => expect(evaluateRequired('hello')).toBe(true));
  it('returns false for empty string', () => expect(evaluateRequired('')).toBe(false));
  it('returns false for whitespace-only string', () => expect(evaluateRequired('  ')).toBe(false));
  it('returns false for null', () => expect(evaluateRequired(null)).toBe(false));
  it('returns false for undefined', () => expect(evaluateRequired(undefined)).toBe(false));
  it('returns false for empty array', () => expect(evaluateRequired([])).toBe(false));
  it('returns true for non-empty array', () => expect(evaluateRequired(['a'])).toBe(true));
  it('returns true for 0', () => expect(evaluateRequired(0)).toBe(true));
  it('returns true for false', () => expect(evaluateRequired(false)).toBe(true));
});

// ─── minLength / maxLength ────────────────────────────────────────────────────

describe('evaluateMinLength', () => {
  it('passes when string meets min', () => expect(evaluateMinLength('hello', 3)).toBe(true));
  it('fails when string is too short', () => expect(evaluateMinLength('hi', 3)).toBe(false));
  it('passes for empty (required handles that)', () => expect(evaluateMinLength('', 3)).toBe(true));
  it('handles array length', () => expect(evaluateMinLength(['a', 'b'], 2)).toBe(true));
  it('fails for short array', () => expect(evaluateMinLength(['a'], 2)).toBe(false));
});

describe('evaluateMaxLength', () => {
  it('passes when string within max', () => expect(evaluateMaxLength('hi', 3)).toBe(true));
  it('fails when string is too long', () => expect(evaluateMaxLength('hello', 3)).toBe(false));
  it('passes for empty', () => expect(evaluateMaxLength('', 3)).toBe(true));
  it('handles array length', () => expect(evaluateMaxLength(['a', 'b', 'c'], 3)).toBe(true));
  it('fails for long array', () => expect(evaluateMaxLength(['a', 'b', 'c', 'd'], 3)).toBe(false));
});

// ─── min / max ────────────────────────────────────────────────────────────────

describe('evaluateMin', () => {
  it('passes when value >= min', () => expect(evaluateMin(5, 5)).toBe(true));
  it('fails when value < min', () => expect(evaluateMin(4, 5)).toBe(false));
  it('passes for empty', () => expect(evaluateMin(null, 5)).toBe(true));
  it('handles string numbers', () => expect(evaluateMin('10', 5)).toBe(true));
});

describe('evaluateMax', () => {
  it('passes when value <= max', () => expect(evaluateMax(5, 10)).toBe(true));
  it('fails when value > max', () => expect(evaluateMax(11, 10)).toBe(false));
  it('passes for empty', () => expect(evaluateMax(null, 10)).toBe(true));
});

// ─── pattern ──────────────────────────────────────────────────────────────────

describe('evaluatePattern', () => {
  it('passes when pattern matches', () => expect(evaluatePattern('ABC123', '^[A-Z0-9]+$')).toBe(true));
  it('fails when pattern does not match', () => expect(evaluatePattern('abc', '^[A-Z]+$')).toBe(false));
  it('passes for empty', () => expect(evaluatePattern('', '^[A-Z]+$')).toBe(true));
  it('supports flags', () => expect(evaluatePattern('abc', '^[A-Z]+$', 'i')).toBe(true));
  it('handles invalid regex gracefully', () => expect(evaluatePattern('abc', '[')).toBe(true));
});

// ─── email ────────────────────────────────────────────────────────────────────

describe('evaluateEmail', () => {
  it('passes for valid email', () => expect(evaluateEmail('user@example.com')).toBe(true));
  it('fails for missing @', () => expect(evaluateEmail('userexample.com')).toBe(false));
  it('fails for missing domain', () => expect(evaluateEmail('user@')).toBe(false));
  it('passes for empty', () => expect(evaluateEmail('')).toBe(true));
  it('passes for null', () => expect(evaluateEmail(null)).toBe(true));
});

// ─── url ──────────────────────────────────────────────────────────────────────

describe('evaluateUrl', () => {
  it('passes for valid http URL', () => expect(evaluateUrl('https://example.com')).toBe(true));
  it('fails for relative URL', () => expect(evaluateUrl('/foo/bar')).toBe(false));
  it('passes for empty', () => expect(evaluateUrl('')).toBe(true));
  it('passes for null', () => expect(evaluateUrl(null)).toBe(true));
});

// ─── integer ──────────────────────────────────────────────────────────────────

describe('evaluateInteger', () => {
  it('passes for integer', () => expect(evaluateInteger(5)).toBe(true));
  it('fails for float', () => expect(evaluateInteger(5.5)).toBe(false));
  it('passes for empty', () => expect(evaluateInteger(null)).toBe(true));
  it('passes for string integer', () => expect(evaluateInteger('5')).toBe(true));
  it('fails for string float', () => expect(evaluateInteger('5.5')).toBe(false));
});

// ─── evaluate() — integration ─────────────────────────────────────────────────

describe('evaluate()', () => {
  it('returns valid when no rules', () => {
    expect(evaluate([], 'anything', fd)).toEqual({ valid: true });
  });

  it('returns valid when all rules pass', () => {
    const rules: ValidationRule[] = [
      { descriptor: { type: 'required' } },
      { descriptor: { type: 'minLength', value: 3 } },
    ];
    expect(evaluate(rules, 'hello', fd)).toEqual({ valid: true });
  });

  it('returns first failing rule message', () => {
    const rules: ValidationRule[] = [
      { descriptor: { type: 'required' } },
      { descriptor: { type: 'minLength', value: 10 } },
    ];
    const result = evaluate(rules, 'hi', fd);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.message).toContain('10');
  });

  it('uses custom message with {{value}} interpolation', () => {
    const rules: ValidationRule[] = [
      { descriptor: { type: 'minLength', value: 5 }, message: 'Min {{value}} chars required.' },
    ];
    const result = evaluate(rules, 'hi', fd);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.message).toBe('Min 5 chars required.');
  });

  it('short-circuits on first failure', () => {
    const rules: ValidationRule[] = [
      { descriptor: { type: 'required' } },
      { descriptor: { type: 'email' } },
    ];
    const result = evaluate(rules, '', fd);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.message).toContain('required');
  });

  it('throws CustomJsDisabledError for custom-js when disabled', () => {
    const rules: ValidationRule[] = [
      { descriptor: { type: 'custom-js', fn: 'return value === "ok";' } },
    ];
    expect(() => evaluate(rules, 'hi', fd, { allowCustomJs: false })).toThrow(CustomJsDisabledError);
  });

  it('runs custom-js evaluator when allowCustomJs is true', () => {
    const rules: ValidationRule[] = [
      { descriptor: { type: 'custom-js', fn: 'return value === "ok";' } },
    ];
    expect(evaluate(rules, 'ok', fd, { allowCustomJs: true })).toEqual({ valid: true });
    expect(evaluate(rules, 'nope', fd, { allowCustomJs: true }).valid).toBe(false);
  });

  it('runs json-logic evaluator when provided', () => {
    const mockEvaluator = (rule: Record<string, unknown>, data: unknown): unknown =>
      (data as { value: string }).value === 'pass';

    const rules: ValidationRule[] = [
      { descriptor: { type: 'json-logic', rule: { '===': [{ var: 'value' }, 'pass'] } } },
    ];
    expect(evaluate(rules, 'pass', fd, { jsonLogicEvaluator: mockEvaluator })).toEqual({ valid: true });
    expect(evaluate(rules, 'fail', fd, { jsonLogicEvaluator: mockEvaluator }).valid).toBe(false);
  });
});
