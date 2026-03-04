import { describe, it, expect } from 'vitest';
import { applyNamingConvention, namingTransformers } from '../naming';
import { NamingConvention } from '../options';

describe('naming transformers', () => {
  it('camelCase: converts snake and kebab to camel', () => {
    const t = namingTransformers[NamingConvention.CamelCase];
    expect(t('first_name')).toBe('firstName');
    expect(t('first-name')).toBe('firstName');
    expect(t('first_name-extra')).toBe('firstNameExtra');
  });

  it('snakeCase: converts camel and pascal to snake', () => {
    const t = namingTransformers[NamingConvention.SnakeCase];
    expect(t('firstName')).toBe('first_name');
    expect(t('FirstName')).toBe('first_name');
    expect(t('HTTPServer')).toBe('h_t_t_p_server');
  });

  it('pascalCase: converts to PascalCase', () => {
    const t = namingTransformers[NamingConvention.PascalCase];
    expect(t('first_name')).toBe('FirstName');
    expect(t('first-name')).toBe('FirstName');
    expect(t('alreadyCamel')).toBe('AlreadyCamel');
  });

  it('applyNamingConvention returns original when undefined or unknown', () => {
    expect(applyNamingConvention('xYz', undefined)).toBe('xYz');
    // unknown convention (cast) should return original
    expect(applyNamingConvention('a_b', (999 as unknown) as NamingConvention)).toBe('a_b');
  });

  it('edge cases: empty, non-alpha, numeric mixed', () => {
    const camel = namingTransformers[NamingConvention.CamelCase];
    const snake = namingTransformers[NamingConvention.SnakeCase];
    expect(camel('')).toBe('');
    expect(camel('123-abc')).toBe('123Abc');
    expect(snake('value1')).toBe('value1');
    expect(snake('Value1X')).toBe('value1_x');
  });
});
