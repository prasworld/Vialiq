import type { ConditionalRule, SimpleConditional } from '../types/conditional';

/**
 * Evaluates a conditional visibility rule against the current form data.
 *
 * @param rule      The ConditionalRule from the ComponentSchema
 * @param formData  The current form data (key → value)
 * @param options   Optional json-logic evaluator
 * @returns         true if the field should be shown, false if hidden
 */
export function evaluateConditional(
  rule: ConditionalRule,
  formData: Record<string, unknown>,
  options: {
    jsonLogicEvaluator?: (rule: Record<string, unknown>, data: unknown) => unknown;
  } = {}
): boolean {
  if (rule.kind === 'simple') {
    const matches = evaluateSimpleConditional(rule, formData);
    return (rule.show ?? true) ? matches : !matches;
  }

  if (rule.kind === 'json-logic') {
    if (!options.jsonLogicEvaluator) {
      console.warn('[conditional-evaluator] json-logic conditional found but no evaluator provided. Defaulting to visible.');
      return true;
    }
    const result = Boolean(options.jsonLogicEvaluator(rule.rule, formData));
    return (rule.show ?? true) ? result : !result;
  }

  const _exhaustive: never = rule;
  console.warn(`[conditional-evaluator] Unknown conditional kind: ${(_exhaustive as ConditionalRule)['kind']}`);
  return true;
}

function evaluateSimpleConditional(
  rule: SimpleConditional,
  formData: Record<string, unknown>
): boolean {
  const fieldValue = formData[rule.when];
  const compareValue = rule.value;

  switch (rule.operator) {
    case 'eq':
      return fieldValue === compareValue;
    case 'neq':
      return fieldValue !== compareValue;
    case 'gt':
      return Number(fieldValue) > Number(compareValue);
    case 'gte':
      return Number(fieldValue) >= Number(compareValue);
    case 'lt':
      return Number(fieldValue) < Number(compareValue);
    case 'lte':
      return Number(fieldValue) <= Number(compareValue);
    case 'contains':
      return String(fieldValue ?? '').includes(String(compareValue));
    case 'notContains':
      return !String(fieldValue ?? '').includes(String(compareValue));
    case 'isEmpty':
      return fieldValue === null || fieldValue === undefined || fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0);
    case 'isNotEmpty':
      return !(fieldValue === null || fieldValue === undefined || fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0));
    default: {
      const _exhaustive: never = rule.operator;
      console.warn(`[conditional-evaluator] Unknown operator: ${_exhaustive}`);
      return true;
    }
  }
}
