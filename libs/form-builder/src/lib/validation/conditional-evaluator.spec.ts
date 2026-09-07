import { describe, it, expect, vi } from 'vitest';
import { evaluateConditional } from './conditional-evaluator';
import type { ConditionalRule } from '../types/conditional';

describe('evaluateConditional', () => {
  describe('simple', () => {
    const fd = { age: 20, name: 'John', emptyStr: '', items: [] };

    it('handles eq', () => {
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'eq', value: 20 }, fd)).toBe(true);
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'eq', value: 21 }, fd)).toBe(false);
    });

    it('handles neq', () => {
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'neq', value: 21 }, fd)).toBe(true);
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'neq', value: 20 }, fd)).toBe(false);
    });

    it('handles gt', () => {
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'gt', value: 10 }, fd)).toBe(true);
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'gt', value: 20 }, fd)).toBe(false);
    });

    it('handles gte', () => {
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'gte', value: 20 }, fd)).toBe(true);
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'gte', value: 21 }, fd)).toBe(false);
    });

    it('handles lt', () => {
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'lt', value: 30 }, fd)).toBe(true);
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'lt', value: 20 }, fd)).toBe(false);
    });

    it('handles lte', () => {
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'lte', value: 20 }, fd)).toBe(true);
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'lte', value: 10 }, fd)).toBe(false);
    });

    it('handles contains', () => {
      expect(evaluateConditional({ kind: 'simple', when: 'name', operator: 'contains', value: 'oh' }, fd)).toBe(true);
      expect(evaluateConditional({ kind: 'simple', when: 'name', operator: 'contains', value: 'x' }, fd)).toBe(false);
    });

    it('handles notContains', () => {
      expect(evaluateConditional({ kind: 'simple', when: 'name', operator: 'notContains', value: 'x' }, fd)).toBe(true);
      expect(evaluateConditional({ kind: 'simple', when: 'name', operator: 'notContains', value: 'oh' }, fd)).toBe(false);
    });

    it('handles isEmpty', () => {
      expect(evaluateConditional({ kind: 'simple', when: 'emptyStr', operator: 'isEmpty' }, fd)).toBe(true);
      expect(evaluateConditional({ kind: 'simple', when: 'items', operator: 'isEmpty' }, fd)).toBe(true);
      expect(evaluateConditional({ kind: 'simple', when: 'missing', operator: 'isEmpty' }, fd)).toBe(true);
      expect(evaluateConditional({ kind: 'simple', when: 'name', operator: 'isEmpty' }, fd)).toBe(false);
    });

    it('handles isNotEmpty', () => {
      expect(evaluateConditional({ kind: 'simple', when: 'name', operator: 'isNotEmpty' }, fd)).toBe(true);
      expect(evaluateConditional({ kind: 'simple', when: 'emptyStr', operator: 'isNotEmpty' }, fd)).toBe(false);
      expect(evaluateConditional({ kind: 'simple', when: 'items', operator: 'isNotEmpty' }, fd)).toBe(false);
    });

    it('respects show: false', () => {
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'eq', value: 20, show: false }, fd)).toBe(false);
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'eq', value: 21, show: false }, fd)).toBe(true);
    });

    it('handles unknown operator', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(evaluateConditional({ kind: 'simple', when: 'age', operator: 'unknown' as any, value: 20 }, fd)).toBe(true);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('json-logic', () => {
    it('evaluates using jsonLogicEvaluator', () => {
      const mockEvaluator = vi.fn().mockReturnValue(true);
      const rule: ConditionalRule = { kind: 'json-logic', rule: {} };
      expect(evaluateConditional(rule, {}, { jsonLogicEvaluator: mockEvaluator })).toBe(true);
      expect(mockEvaluator).toHaveBeenCalledWith({}, {});
    });

    it('respects show: false with jsonLogicEvaluator', () => {
      const mockEvaluator = vi.fn().mockReturnValue(true);
      const rule: ConditionalRule = { kind: 'json-logic', rule: {}, show: false };
      expect(evaluateConditional(rule, {}, { jsonLogicEvaluator: mockEvaluator })).toBe(false);
    });

    it('skips and warns if no jsonLogicEvaluator provided', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const rule: ConditionalRule = { kind: 'json-logic', rule: {} };
      expect(evaluateConditional(rule, {})).toBe(true);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('unknown kind', () => {
    it('handles unknown kind gracefully', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(evaluateConditional({ kind: 'unknown' as any } as ConditionalRule, {})).toBe(true);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
