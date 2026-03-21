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
  const r = rule as Record<string, unknown>;

  // fromValue takes precedence
  if (r['fromValue'] !== undefined) {
    return (r['fromValue'] as { readonly __v: unknown }).__v;
  }
  // mapFromAsync (caller must await)
  if (r['mapFromAsync'] !== undefined) {
    return (r['mapFromAsync'] as (s: S, ctx?: MappingContext) => Promise<unknown>)(src, ctx);
  }
  // mapFrom (sync)
  if (r['mapFrom'] !== undefined) {
    return (r['mapFrom'] as (s: S, ctx?: MappingContext) => unknown)(src, ctx);
  }
  // mapWith converter
  if (r['mapWith'] !== undefined) {
    return (r['mapWith'] as (s: S) => unknown)(src);
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
  const r = rule as Record<string, unknown>;

  if ((value === null || value === undefined) && r['nullSubstitution'] !== undefined) {
    return r['nullSubstitution'];
  }
  if (value === undefined && r['defaultValue'] !== undefined) {
    return r['defaultValue'];
  }
  return value;
}
