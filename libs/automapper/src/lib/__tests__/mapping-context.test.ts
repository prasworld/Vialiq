import { describe, it, expect } from 'vitest';
import { createMapper } from '../core';

describe('MappingContext propagation', () => {
  it('passes ctx to beforeMap and member resolvers', () => {
    const m = createMapper();

    class Src { foo = 'bar' }
    const src = new Src();

    m.addProfile(Src, 'Dest', (b: any) => {
      b.beforeMap((s: any, ctx: any) => {
        s.__beforeSeen = !!ctx?.operationId;
      });

      b.forMember('op', (o: any) => {
        o.mapFrom((s: any, ctx: any) => ctx?.operationId);
      });
    });

    const res: any = m.map(src, 'Dest') as any;

    expect(src.__beforeSeen).toBe(true);
    expect(typeof res.op).toBe('string');
  });
});
