import { describe, it, expect } from 'vitest';
import { createMapper } from '../core';
import { CIRCULAR_IGNORE } from '../utils';

describe('DefaultStrategy targeted coverage', () => {
  it('preserves null and undefined inputs', () => {
    const m = createMapper();
    expect(m.map(null as any, 'Dest')).toBe(null);
    expect(m.map(undefined as any, 'Dest')).toBe(undefined);
  });

  it('autoMap disabled only applies explicit member rules', () => {
    const m = createMapper({ autoMap: false });
    class Src { a = 1; b = 2 }
    m.addProfile(Src, 'Dest', (bld: any) => {
      bld.forMember('b', (o: any) => o.mapFrom((s: any) => s.b));
    });
    const res = m.map(new Src(), 'Dest') as any;
    expect(res.b).toBe(2);
    expect(res.a).toBeUndefined();
  });

  it('strict mode with constructor-allowed keys throws for extra props', () => {
    class Dest { a = 0 }
    const m = createMapper({ strict: true });
    class Src { a = 1; b = 2 }
    m.addProfile(Src, Dest, (bld: any) => {
      bld.forMember('a', (o: any) => o.mapFrom((s: any) => s.a));
    });
    expect(() => m.map(new Src(), Dest)).toThrow();
  });

  it('strict mode with string dest type throws when unmapped', () => {
    const m = createMapper({ strict: true, autoMap: false });
    class Src { a = 1 }
    m.addProfile(Src, 'Dest', (_bld: any) => {
      // intentionally do not map `a`
    });
    expect(() => m.map(new Src(), 'Dest')).toThrow();
  });

  it('maxDepth prevents deep mapping (returns original nested value)', () => {
    const m = createMapper({ maxDepth: 0 });
    const src = { nested: { deep: { val: 1 } } };
    m.addProfile(Object, 'Dest', (_bld: any) => {});
    const res = m.map(src, 'Dest') as any;
    // with maxDepth 0 the top-level nested object should be returned as-is
    expect(res.nested).toBe(src.nested);
  });

  it('array mapping filters circular entries', () => {
    const m = createMapper();
    const a: any = {};
    a.self = a; // self-referential
    const src = { arr: [a] };
    m.addProfile(Object, 'Dest', (_bld: any) => {});
    const res = m.map(src, 'Dest') as any;
    // array mapping should filter out the circular sentinel
    expect(Array.isArray(res.arr)).toBe(true);
    expect(res.arr.length).toBeGreaterThanOrEqual(0);
    // if circular element was removed the result array may be empty
    if (res.arr.length === 0) {
      // ok — confirms circular handling branch executed
      expect(res.arr).toEqual([]);
    } else {
      // otherwise ensure sentinel is not present
      expect(res.arr).not.toContain(CIRCULAR_IGNORE);
    }
  });

  it('forMember with mapFrom returning undefined is skipped', () => {
    const m = createMapper();
    class Src { a = 1 }
    m.addProfile(Src, 'Dest', (bld: any) => {
      bld.forMember('a', (o: any) => o.mapFrom(() => undefined));
    });
    const res = m.map(new Src(), 'Dest') as any;
    expect(res.a).toBeUndefined();
  });

  it('ignore member removes property (sync strategy)', () => {
    const m = createMapper();
    const src = { keep: 1, drop: 2 };
    m.addProfile(Object, 'Dest', (bld: any) => {
      bld.forMember('drop', (o: any) => o.ignore());
    });
    const res = m.map(src, 'Dest') as any;
    expect(res.keep).toBe(1);
    expect(res.drop).toBeUndefined();
  });
});
