/**
 * Conditional visibility rules.
 * Framework-agnostic — no Angular imports.
 */

// ─── Simple Conditional ───────────────────────────────────────────────────────

export type SimpleConditionalOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'notContains'
  | 'isEmpty'
  | 'isNotEmpty';

export interface SimpleConditional {
  kind: 'simple';
  /** The key of the field whose value is evaluated */
  when: string;
  operator: SimpleConditionalOperator;
  /** The value to compare against (not required for isEmpty/isNotEmpty) */
  value?: unknown;
  /** If true, show this field when the condition is met. Default: true */
  show?: boolean;
}

// ─── JSON Logic Conditional ───────────────────────────────────────────────────

export interface JsonLogicConditional {
  kind: 'json-logic';
  /** json-logic-js rule object */
  rule: Record<string, unknown>;
  /** If true, show this field when the rule evaluates to truthy. Default: true */
  show?: boolean;
}

// ─── Union ────────────────────────────────────────────────────────────────────

export type ConditionalRule = SimpleConditional | JsonLogicConditional;
