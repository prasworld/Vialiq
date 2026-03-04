import { describe, it, expect } from 'vitest';
import { ConverterRegistry, defaultConverterRegistry } from '../converters';

describe('ConverterRegistry targeted coverage', () => {
  it('register and get return the registered converter', () => {
    const r = new ConverterRegistry();
    const src = '1';
    r.register(String, Number, (v: string) => Number(v) + 1);
    const conv = r.get(String, Number);
    expect(conv).toBeDefined();
    expect(conv!(src as any)).toBe(2);
  });

  it('copyFrom copies converters between registries', () => {
    const a = new ConverterRegistry();
    a.register('S', 'D', (v: any) => `x:${v}`);
    const b = new ConverterRegistry();
    b.copyFrom(a);
    const c = b.get('S', 'D');
    expect(c).toBeDefined();
    expect(c!('ok')).toBe('x:ok');
  });

  it('defaultConverterRegistry has basic converters', () => {
    const n = defaultConverterRegistry.get(String, Number);
    expect(n).toBeDefined();
    expect(n!('42')).toBe(42);

    const s = defaultConverterRegistry.get(Number, String);
    expect(s).toBeDefined();
    expect(s!(7)).toBe('7');

    const ds = defaultConverterRegistry.get(Date, String);
    expect(ds).toBeDefined();
    const iso = ds!(new Date('2020-01-01'));
    expect(typeof iso).toBe('string');
  });
});
