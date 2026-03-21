/**
 * Coverage tests for ProfilingStrategy (async path) and LoggingPlugin.
 */
import { describe, it, expect } from 'vitest';
import { ProfilingStrategy } from '../profiling';
import { LoggingStrategy, LoggingPlugin } from '../plugins/logging';
import { createMapper } from '../core';
import { AsyncStrategy } from '../async';
import { PLUGIN_API_VERSION } from '../plugin';

// ── ProfilingStrategy ─────────────────────────────────────────────────────────

describe('ProfilingStrategy — async path', () => {
  it('logs timing after an async mapping resolves', async () => {
    const logs: string[] = [];
    const inner = new AsyncStrategy();
    const profiler = new ProfilingStrategy(inner, (msg) => logs.push(msg));

    const m = createMapper();
    m.addStrategy(profiler);

    class S { name = 'x' }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('upper', (o: any) =>
        o.mapFromAsync(async (s: any) => s.name.toUpperCase())
      );
    });

    await m.map(new S(), 'D');
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0]).toMatch(/AutoMapper/);
    expect(logs[0]).toMatch(/ms/);
  });

  it('uses constructor name for src and string for destType', async () => {
    const logs: string[] = [];
    const inner = new AsyncStrategy();
    const profiler = new ProfilingStrategy(inner, (msg) => logs.push(msg));

    const m = createMapper();
    m.addStrategy(profiler);

    class MySource { val = 1 }
    m.addProfile(MySource, 'MyDest', (b: any) => {
      b.forMember('upper', (o: any) =>
        o.mapFromAsync(async (s: any) => s.val)
      );
    });

    await m.map(new MySource(), 'MyDest');
    expect(logs[0]).toContain('MySource');
    expect(logs[0]).toContain('MyDest');
  });

  it('reports destType.name when destType is a constructor', async () => {
    const logs: string[] = [];
    const inner = new AsyncStrategy();
    const profiler = new ProfilingStrategy(inner, (msg) => logs.push(msg));

    const m = createMapper();
    m.addStrategy(profiler);

    class MySrc { a = 1 }
    class MyDest { a = 0 }
    m.addProfile(MySrc, MyDest, (b: any) => {
      b.forMember('a', (o: any) => o.mapFromAsync(async (s: any) => s.a));
    });

    await m.map(new MySrc(), MyDest);
    expect(logs[0]).toContain('MyDest');
  });
});

// ── LoggingStrategy ───────────────────────────────────────────────────────────

describe('LoggingStrategy — async path', () => {
  it('logs start and finish for async mappings', async () => {
    const logs: string[] = [];
    // AsyncStrategy added first (lower priority), then LoggingStrategy
    // wraps it (higher priority in the chain)
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    m.addStrategy(new LoggingStrategy((msg) => logs.push(msg)));

    class S { v = 3 }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('vAsync', (o: any) =>
        o.mapFromAsync(async (s: any) => s.v * 2)
      );
    });

    await m.map(new S(), 'D');
    expect(logs.some((l) => l.includes('LoggingStrategy'))).toBe(true);
    expect(logs.some((l) => l.includes('finished'))).toBe(true);
  });
});

// ── LoggingPlugin ─────────────────────────────────────────────────────────────

describe('LoggingPlugin', () => {
  it('has correct metadata', () => {
    const plugin = new LoggingPlugin();
    expect(plugin.metadata.id).toBe('com.vi.logging');
    expect(plugin.metadata.apiVersion).toBe(PLUGIN_API_VERSION);
  });

  it('onInstall logs installation message', () => {
    const logs: string[] = [];
    const plugin = new LoggingPlugin((msg) => logs.push(msg));
    plugin.onInstall?.();
    expect(logs[0]).toContain('LoggingPlugin installed');
  });

  it('onMapError logs the error message', () => {
    const logs: string[] = [];
    const plugin = new LoggingPlugin((msg) => logs.push(msg));
    plugin.onMapError?.({}, {}, new Error('boom'));
    expect(logs[0]).toContain('boom');
    expect(logs[0]).toContain('ERROR');
  });

  it('can be installed in a mapper and performs sync mapping', () => {
    const logs: string[] = [];
    const m = createMapper();
    m.use(new LoggingPlugin((msg) => logs.push(msg)));

    class S { x = 5 }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('x', (o: any) => o.mapFrom((s: any) => s.x));
    });

    const res = m.map(new S(), 'D') as any;
    expect(res.x).toBe(5);
    expect(logs.some((l) => l.includes('LoggingStrategy'))).toBe(true);
  });

  it('can be installed in a mapper and performs async mapping', async () => {
    const logs: string[] = [];
    // Add AsyncStrategy first, then LoggingPlugin — so logging wraps async
    const m = createMapper();
    m.addStrategy(new AsyncStrategy());
    m.use(new LoggingPlugin((msg) => logs.push(msg)));

    class S { x = 5 }
    m.addProfile(S, 'D', (b: any) => {
      b.forMember('x', (o: any) => o.mapFromAsync(async (s: any) => s.x));
    });

    const res = await m.map(new S(), 'D') as any;
    expect(res.x).toBe(5);
    expect(logs.some((l) => l.includes('finished'))).toBe(true);
  });

  it('strategy exposes canHandle=true for any source', () => {
    const plugin = new LoggingPlugin();
    expect(plugin.strategy.canHandle({}, 'Dest', { memberRules: [] })).toBe(true);
  });
});
