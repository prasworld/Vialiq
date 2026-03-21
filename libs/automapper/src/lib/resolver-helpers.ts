/**
 * Shared helpers for resolver selection and value transformation.
 * Used by both DefaultStrategy and AsyncStrategy to avoid duplication.
 */

import { MemberRule } from './builder';
import type { MappingContext } from './context';

/**
 * Result of resolver selection: the resolved value and whether processing should continue.
 */
export interface ResolverResult {
  value: unknown;
  skip: boolean; // whether the rule should be skipped entirely
}

/**
 * Selects the appropriate resolver function for a member rule and executes it.
 * Returns the raw resolved value (before null/default substitution).
 *
 * Priority: fromValue > mapFromAsync > mapFrom > mapWith > undefined
 * Note: mapFromAsync is passed through — the caller must await it.
 */
export function selectResolver<S, D>(
  rule: MemberRule<S, D> | Record<string, unknown>,
  src: S,
  ctx?: MappingContext
): Promise<unknown> | unknown {
  const r = rule as MemberRule<S, D> & Record<string, unknown>;

  // fromValue takes precedence (check __configured to distinguish set vs not-set)
  if (r.__configured?.fromValue) {
    return r.fromValue;
  }
  // mapFromAsync (caller must await)
  if (r.mapFromAsync !== undefined) {
    return r.mapFromAsync(src, ctx);
  }
  // mapFrom (sync)
  if (r.mapFrom !== undefined) {
    return r.mapFrom(src, ctx);
  }
  // mapWith converter
  if (r.mapWith !== undefined) {
    return r.mapWith(src);
  }
  // No resolver
  return undefined;
}

/**
 * Applies null/default substitution logic after resolving a value.
 * Implements the precedence: nullSubstitution > defaultValue.
 *
 * Precedence:
 * - If value is null or undefined AND nullSubstitution is set → use nullSubstitution
 * - Else if value is undefined AND defaultValue is set → use defaultValue
 * - Otherwise → use value as-is
 */
export function applySubstitution(
  value: unknown,
  rule: MemberRule<unknown, unknown> | Record<string, unknown>
): unknown {
  const r = rule as MemberRule<unknown, unknown> & Record<string, unknown>;

  // Use presence checks (__configured) to allow undefined as a configured value
  if ((value === null || value === undefined) && r.__configured?.nullSubstitution) {
    return r.nullSubstitution;
  }
  if (value === undefined && r.__configured?.defaultValue) {
    return r.defaultValue;
  }
  return value;
}
