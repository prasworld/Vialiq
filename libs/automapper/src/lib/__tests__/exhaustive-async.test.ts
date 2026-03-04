import { describe, it, expect, vi } from 'vitest';
import { createMapper } from '../core';
import { AsyncStrategy } from '../async';
import { PLUGIN_API_VERSION } from '../plugin';

const delay = (ms = 0) => new Promise((r) => setTimeout(r, ms));

describe('Exhaustive async & mock tests', () => {
  function makeMapper() {
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    return m;
  }

  it('forMember mapFromAsync receives ctx and resolves value', async () => {
    const m = makeMapper();

    class Src { value = 'x' }
    const src = new Src();

    m.addProfile(Src, 'Dest', (b: any) => {
      b.beforeMap((s: any, ctx: any) => { s._seen = !!ctx?.operationId; });
      b.forMember('op', (o: any) => {
        o.mapFromAsync(async (s: any, ctx: any) => {
          await delay(1);
          return ctx.operationId;
        });
      });
    });

    const res = await m.map(src, 'Dest') as any;
    expect(src._seen).toBe(true);
    expect(typeof res.op).toBe('string');
  });

  it('plugin lifecycle called for async mapping (start/end)', async () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();
    const onError = vi.fn();

    // plugin that delegates to next strategy
    const plugin = {
      metadata: { id: 'async.plugin', name: 'async', version: '1.0.0', apiVersion: PLUGIN_API_VERSION, description: '' },
      strategy: {
        canHandle: () => true,
        map(registry: any, src: any, destType: any, config: any, options: any, visited: any) {
          const next = registry.getStrategies().find((s: any) => s !== this);
          if (!next) throw new Error('no next');
          const res = next.map(registry, src, destType, config, options, visited);
          if (res instanceof Promise) {
            return res.then((r: any) => r);
          }
          return res;
        }
      },
      onMapStart: onStart,
      onMapEnd: onEnd,
      onMapError: onError,
    } as any;

    const m = makeMapper();
    m.use(plugin);

    class Src { val = 'async' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('v', (o: any) => o.mapFromAsync(async (s: any) => { await delay(1); return s.val; }));
    });

    const res = await m.map(new Src(), 'Dest');
    expect(res.v).toBe('async');
    expect(onStart).toHaveBeenCalled();
    expect(onEnd).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('plugin onMapError called for async rejection', async () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();
    const onError = vi.fn();

    const plugin = {
      metadata: { id: 'err.async', name: 'err', version: '1.0.0', apiVersion: PLUGIN_API_VERSION, description: '' },
      strategy: {
        canHandle: () => true,
        map(registry: any, src: any, destType: any, config: any, options: any, visited: any) {
          const next = registry.getStrategies().find((s: any) => s !== this);
          if (!next) throw new Error('no next');
          return next.map(registry, src, destType, config, options, visited);
        }
      },
      onMapStart: onStart,
      onMapEnd: onEnd,
      onMapError: onError,
    } as any;

    const m = makeMapper();
    m.use(plugin);

    class Src { val = 'bad' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('v', (o: any) => o.mapFromAsync(async () => {
        await delay(1);
        throw new Error('async boom');
      }));
    });

    await expect(m.map(new Src(), 'Dest')).rejects.toBeDefined();
    expect(onStart).toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
    expect(onEnd).not.toHaveBeenCalled();
  });

  it('dotted dest keys create nested objects with async resolver', async () => {
    const m = makeMapper();
    class Src { a = 'x' }
    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('nested.inner', (o: any) => o.mapFromAsync(async (s: any) => { await delay(1); return s.a; }));
    });

    const res: any = await m.map(new Src(), 'Dest') as any;
    expect(res.nested).toBeDefined();
    expect(res.nested.inner).toBe('x');
  });

  it('autoMap skips explicit async memberRules', async () => {
    const m = makeMapper();
    class Src { keep = 'k'; skip = 's' }

    m.addProfile(Src, 'Dest', (b: any) => {
      b.forMember('skip', (o: any) => o.mapFromAsync(async () => { await delay(1); return 'explicit'; }));
    });

    const res: any = await m.map(new Src(), 'Dest') as any;
    // 'keep' should be auto-mapped, 'skip' should be from explicit rule
    expect(res.keep).toBe('k');
    expect(res.skip).toBe('explicit');
  });
});
