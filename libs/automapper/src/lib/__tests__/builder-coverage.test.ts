import { describe, it, expect } from 'vitest';
import { createMapper } from '../core';
import { AsyncStrategy } from '../async';

describe('MappingBuilder targeted coverage', () => {
  it('forMember.mapFrom and beforeMap/afterMap hooks are invoked', () => {
    const m = createMapper();
    const calls: string[] = [];
    class Src { x = 7 }

    m.addProfile(Src, 'Dest', (bld: any) => {
      bld.beforeMap((s: any) => calls.push('before:' + s.x));
      bld.forMember('out', (o: any) => o.mapFrom((s: any) => s.x + 1));
      bld.afterMap((d: any) => calls.push('after:' + d.out));
    });

    const res = m.map(new Src(), 'Dest') as any;
    expect(res.out).toBe(8);
    expect(calls).toEqual(['before:7', 'after:8']);
  });

  it('mapWith uses provided converter to populate destination', () => {
    const m = createMapper();
    class Src { v = 3 }
    const conv = (s: any) => s.v * 10;
    m.addProfile(Src, 'Dest', (bld: any) => {
      bld.forMember('ten', (o: any) => o.mapWith(conv));
    });
    const res = m.map(new Src(), 'Dest') as any;
    expect(res.ten).toBe(30);
  });

  it('mapFromAsync is honored when AsyncStrategy is present', async () => {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    class Src { name = 'p' }
    m.addProfile(Src, 'Dest', (bld: any) => {
      bld.forMember('asyncName', (o: any) => o.mapFromAsync(async (s: any) => `hi:${s.name}`));
    });
    const res = await m.map(new Src(), 'Dest');
    expect((res as any).asyncName).toBe('hi:p');
  });

  it('forMember.ignore prevents property presence', () => {
    const m = createMapper();
    const src = { keep: 1, drop: 2 };
    m.addProfile(Object, 'Dest', (bld: any) => {
      bld.forMember('drop', (o: any) => o.ignore());
    });
    const res = m.map(src, 'Dest') as any;
    expect(res.keep).toBe(1);
    expect(res.drop).toBeUndefined();
  });

  it('extend() stores custom keys and plugin receives config', () => {
    const m = createMapper();
    const seen: any = {};
    const plugin: any = {
      metadata: { id: 't.plugin', name: 't', version: '0.0.1', apiVersion: '1.0.0' },
      strategy: { canHandle: () => false, map: () => { throw new Error('not used'); } },
      onProfileAdded(key: string, cfg: unknown) {
        seen.key = key;
        (seen as any).cfg = cfg as any;
      },
    };
    m.use(plugin);
    class Src { a = 1 }
    m.addProfile(Src, 'Dest', (bld: any) => {
      bld.extend('extra', { foo: 'bar' });
    });
    expect(seen.key).toBeDefined();
    expect((seen as any).cfg.extra.foo).toBe('bar');
  });
});
