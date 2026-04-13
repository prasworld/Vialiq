import { describe, it, expect } from 'vitest';
import { createMapper } from '../core';
import { CIRCULAR_IGNORE } from '../utils';

describe('DefaultStrategy (sync) behaviours', () => {
  it('autoMap copies matching properties', () => {
    const m = createMapper();
    const src = { a: 1, b: 2 };
    const res = m.map(src, 'Dest') as any;
    expect(res.a).toBe(1);
    expect(res.b).toBe(2);
  });

  it('forMember dotted dest creates nested object', () => {
    const m = createMapper();
    class Src { val = 'x' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('nested.inner', (o: any) => o.mapFrom((s: any) => s.val));
    });

    const res = m.map(new Src(), 'Dest') as any;
    expect(res.nested).toBeDefined();
    expect(res.nested.inner).toBe('x');
  });

  it('mapValue handles arrays of primitives', () => {
    const m = createMapper();
    class Src { items = [1, 2, 3] }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('items', (o: any) => o.mapFrom((s: any) => s.items));
    });
    const res = m.map(new Src(), 'Dest') as any;
    expect(Array.isArray(res.items)).toBe(true);
    expect(res.items).toEqual([1, 2, 3]);
  });

  it('nested circular objects respect circularRefBehavior ignore', () => {
    const m = createMapper({ circularRefBehavior: 'ignore' });
    const a: any = { name: 'a' };
    const b: any = { name: 'b', next: a };
    a.next = b; // circular reference

    m.addProfile(Object, 'Dest', (bld: any) => {
      bld.forMember('name', (o: any) => o.mapFrom((s: any) => s.name));
      // do NOT explicitly map `next` so autoMap/mapValue will recurse and
      // observe circular references according to the mapper options
    });

    const res = m.map(a, 'Dest') as any;
    // next should be present; nested circular handling may produce the
    // sentinel or a partially mapped object depending on mapping ordering.
    expect(res.name).toBe('a');
    expect(res.next).toBeDefined();
    if (res.next === CIRCULAR_IGNORE) {
      // ok
    } else {
      expect(res.next.name).toBe('b');
    }
  });

  it('throws when mapFromAsync is used without AsyncStrategy', () => {
    const m = createMapper();
    class Src { value = 'test' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('async_result', (o: any) => {
        o.mapFromAsync(async (s: any) => s.value);
      });
    });

    expect(() => {
      m.map(new Src(), 'Dest');
    }).toThrow(
      /mapFromAsync.*DefaultStrategy.*AsyncStrategy/
    );
  });
});
