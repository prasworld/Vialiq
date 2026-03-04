import { describe, it, expect, vi } from 'vitest';
import { createMapper } from '../core';
import { DefaultStrategy } from '../strategy';
import { AsyncStrategy } from '../async';

describe('Core registry targeted coverage', () => {
  it('use warns on apiVersion mismatch and installs plugin', () => {
    const m = createMapper();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const plugin: any = {
      metadata: { id: 'x.plugin', name: 'x', version: '0.0.1', apiVersion: '0.0.0' },
      strategy: new DefaultStrategy(),
    };
    m.use(plugin);
    expect(m.hasPlugin('x.plugin')).toBe(true);
    const installed = m.installedPlugins();
    expect(installed.find((p) => p.id === 'x.plugin')).toBeDefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('use throws when plugin already installed', () => {
    const m = createMapper();
    const plugin: any = {
      metadata: { id: 'dup.plugin', name: 'd', version: '0.0.1', apiVersion: '1.0.0' },
      strategy: new DefaultStrategy(),
    };
    m.use(plugin);
    expect(() => m.use(plugin)).toThrow();
  });

  it('synchronous strategy error notifies plugin onMapError and rethrows', () => {
    const m = createMapper();
    const errorPlugin: any = {
      metadata: { id: 'err.plugin', name: 'err', version: '0.0.1', apiVersion: '1.0.0' },
      strategy: {
        canHandle: () => true,
        map: () => { throw new Error('boom'); },
      },
      onMapError: vi.fn(),
    };
    m.use(errorPlugin);
    expect(() => m.map({ a: 1 } as any, 'Dest')).toThrow('boom');
    expect(errorPlugin.onMapError).toHaveBeenCalled();
  });

  it('mapArray returns Promise when elements map to Promise', async () => {
    const m = createMapper();
    // add an async strategy that handles a profile via mapFromAsync
    class Src { v = 1 }
    m.addStrategy(new AsyncStrategy());
    m.addProfile(Src, 'Dest', (bld: any) => {
      bld.forMember('x', (o: any) => o.mapFromAsync(async (s: any) => s.v));
    });
    // use the registry mapArray which should detect Promise results
    const res = m.mapArray([new Src(), new Src()], 'Dest');
    // result must be a Promise
    expect(res instanceof Promise).toBe(true);
    const arr = await res;
    expect(Array.isArray(arr)).toBe(true);
  });

  it('getMapper returns a callable mapper function', () => {
    const m = createMapper();
    class Src { a = 2 }
    m.addProfile(Src, 'Dest', (bld: any) => {
      bld.forMember('a', (o: any) => o.mapFrom((s: any) => s.a));
    });
    const fn = m.getMapper(Src, 'Dest');
    const out = fn(new Src());
    expect((out as any).a).toBe(2);
  });
});
