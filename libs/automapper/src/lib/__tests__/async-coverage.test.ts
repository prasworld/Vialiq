import { describe, it, expect } from 'vitest';
import { createMapper } from '../core';
import { AsyncStrategy } from '../async';

describe('AsyncStrategy targeted coverage', () => {
  it('mapFromAsync resolves and autoMap still maps other keys', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    class Src { val = 'x'; arr = [1, 2, 3] }
    m.addProfile(Src, 'Dest', (bld: any) => {
      bld.forMember('dummy', (o: any) => o.mapFromAsync(async (s: any) => `async:${s.val}`));
    });
    const res = await m.map(new Src(), 'Dest');
    expect((res as any).dummy).toBe('async:x');
    expect((res as any).arr).toEqual([1, 2, 3]);
  });

  it('mapValueAsync filters circular entries inside arrays', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    const a: any = {};
    a.self = a;
    const src = { arr: [a] };
    m.addProfile(Object, 'Dest', (bld: any) => {
      bld.forMember('dummy', (o: any) => o.mapFromAsync(async () => 'x'));
    });
    const res = await m.map(src, 'Dest') as any;
    expect(Array.isArray(res.arr)).toBe(true);
    // circular inner properties should be present but inner circular refs become undefined
    expect(res.arr.length).toBeGreaterThanOrEqual(1);
    expect(res.arr[0].self).toBeUndefined();
  });

  it('strict mode in async strategy rejects when unmapped', async () => {
    const m = createMapper({ strict: true, autoMap: false });
    m.addStrategy(new AsyncStrategy());
    class Src { a = 1; b = 2 }
    m.addProfile(Src, 'Dest', (bld: any) => {
      bld.forMember('a', (o: any) => o.mapFromAsync(async (s: any) => s.a));
    });
    await expect(m.map(new Src(), 'Dest')).rejects.toThrow();
  });

  it('preserves primitives and nulls via async mapping', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    const src = { n: 5, s: 'hello', nil: null };
    m.addProfile(Object, 'Dest', (bld: any) => {
      bld.forMember('dummy', (o: any) => o.mapFromAsync(async () => 'x'));
    });
    const res = await m.map(src, 'Dest') as any;
    expect(res.n).toBe(5);
    expect(res.s).toBe('hello');
    expect(res.nil).toBe(null);
  });

  it('explicit memberRules skip autoMap and sync mapFrom runs inside AsyncStrategy', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    const src = { a: 1, b: 2, c: 3 };
    m.addProfile(Object, 'Dest', (bld: any) => {
      // provide an async rule to ensure AsyncStrategy is chosen
      bld.forMember('marker', (o: any) => o.mapFromAsync(async () => 'ok'));
      // provide an explicit rule for `b` so autoMap skips it
      bld.forMember('b', (o: any) => o.mapFrom((s: any) => s.b * 10));
    });
    const res = await m.map(src, 'Dest') as any;
    expect(res.marker).toBe('ok');
    // b should be mapped using explicit sync mapFrom (and transformed accordingly)
    expect(res.b).toBe(20);
    // a and c should still be auto-mapped
    expect(res.a).toBe(1);
    expect(res.c).toBe(3);
  });

  it('maxDepth prevents deep mapping in async strategy', async () => {
    const m = createMapper({ maxDepth: 0 });
    m.addStrategy(new AsyncStrategy());
    const src = { nested: { deep: { val: 1 } } };
    m.addProfile(Object, 'Dest', (bld: any) => {
      bld.forMember('dummy', (o: any) => o.mapFromAsync(async () => 'x'));
    });
    const res = await m.map(src, 'Dest') as any;
    expect(res.nested).toBe(src.nested);
  });

  it('ignore rule removes property even when async strategy used', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    const src = { keep: 1, drop: 2 };
    m.addProfile(Object, 'Dest', (bld: any) => {
      bld.forMember('marker', (o: any) => o.mapFromAsync(async () => 'x'));
      bld.forMember('drop', (o: any) => o.ignore());
    });
    const res = await m.map(src, 'Dest') as any;
    expect(res.keep).toBe(1);
    expect(res.drop).toBeUndefined();
  });

  it('async typedRules skip when resolver returns undefined', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    const src = { keep: 1, skip: 2 };
    m.addProfile(Object, 'Dest', (bld: any) => {
      bld.forMember('marker', (o: any) => o.mapFromAsync(async () => 'x'));
      bld.forMember('skip', (o: any) => o.mapFromAsync(async () => undefined));
    });
    const res = await m.map(src, 'Dest') as any;
    expect(res.keep).toBe(1);
    expect(res.skip).toBeUndefined();
  });

  it('strict mode with constructor-allowed keys (async) throws for extra props', async () => {
    class Dest { a = 0 }
    const m = createMapper({ strict: true });
    m.addStrategy(new AsyncStrategy());
    class Src { a = 1; b = 2 }
    m.addProfile(Src, Dest, (bld: any) => {
      bld.forMember('a', (o: any) => o.mapFromAsync(async (s: any) => s.a));
    });
    await expect(m.map(new Src(), Dest)).rejects.toThrow();
  });
});
