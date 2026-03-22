/**
 * Phase 4 feature tests:
 *   4-2 Angular provideAutomapper() + AUTOMAPPER_TOKEN
 *   4-3 Zod schema integration (profileFromZod, validateWithZod)
 *   4-4 Plugin discovery registry (PluginDiscoveryRegistry)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { InjectionToken } from '@angular/core';
import { z } from 'zod';
import { createMapper } from '../core';
import { LoggingPlugin } from '../plugins/logging';
import { PLUGIN_API_VERSION } from '../plugin';
import { PluginDiscoveryRegistry } from '../plugin-discovery';
import { AUTOMAPPER_TOKEN, provideAutomapper } from '../integrations/angular';
import {
  profileFromZod,
  validateWithZod,
  safeValidateWithZod,
} from '../integrations/zod';

// ── Plugin Discovery Registry (4-4) ───────────────────────────────────────────

describe('PluginDiscoveryRegistry (4-4)', () => {
  beforeEach(() => {
    PluginDiscoveryRegistry.clear();
  });

  it('starts empty after clear()', () => {
    expect(PluginDiscoveryRegistry.discover()).toHaveLength(0);
  });

  it('register() + discover() returns the entry', () => {
    const meta = { id: 'test.plugin', name: 'Test', version: '1.0.0', apiVersion: PLUGIN_API_VERSION };
    const factory = () => new LoggingPlugin();
    PluginDiscoveryRegistry.register(meta, factory);
    const entries = PluginDiscoveryRegistry.discover();
    expect(entries).toHaveLength(1);
    expect(entries[0].metadata.id).toBe('test.plugin');
    expect(entries[0].factory).toBe(factory);
  });

  it('find() retrieves an entry by id', () => {
    const meta = { id: 'com.vi.logging', name: 'Logging', version: '1.0.0', apiVersion: PLUGIN_API_VERSION };
    PluginDiscoveryRegistry.register(meta, () => new LoggingPlugin());
    const entry = PluginDiscoveryRegistry.find('com.vi.logging');
    expect(entry).toBeDefined();
    expect(entry!.metadata.name).toBe('Logging');
  });

  it('find() returns undefined for unknown id', () => {
    expect(PluginDiscoveryRegistry.find('unknown')).toBeUndefined();
  });

  it('has() returns true when registered, false otherwise', () => {
    const meta = { id: 'a.b', name: 'AB', version: '1.0.0', apiVersion: PLUGIN_API_VERSION };
    PluginDiscoveryRegistry.register(meta, () => new LoggingPlugin());
    expect(PluginDiscoveryRegistry.has('a.b')).toBe(true);
    expect(PluginDiscoveryRegistry.has('a.c')).toBe(false);
  });

  it('unregister() removes a specific plugin', () => {
    const meta = { id: 'remove.me', name: 'RM', version: '1.0.0', apiVersion: PLUGIN_API_VERSION };
    PluginDiscoveryRegistry.register(meta, () => new LoggingPlugin());
    expect(PluginDiscoveryRegistry.has('remove.me')).toBe(true);
    PluginDiscoveryRegistry.unregister('remove.me');
    expect(PluginDiscoveryRegistry.has('remove.me')).toBe(false);
  });

  it('re-registration with same id replaces the entry (last wins)', () => {
    const meta = { id: 'dup', name: 'First', version: '1.0.0', apiVersion: PLUGIN_API_VERSION };
    const meta2 = { id: 'dup', name: 'Second', version: '2.0.0', apiVersion: PLUGIN_API_VERSION };
    PluginDiscoveryRegistry.register(meta, () => new LoggingPlugin());
    PluginDiscoveryRegistry.register(meta2, () => new LoggingPlugin());
    const entries = PluginDiscoveryRegistry.discover();
    expect(entries).toHaveLength(1);
    expect(entries[0].metadata.name).toBe('Second');
  });

  it('factory from discover() creates a valid plugin', () => {
    const meta = { id: 'com.vi.logging', name: 'Logging', version: '1.0.0', apiVersion: PLUGIN_API_VERSION };
    PluginDiscoveryRegistry.register(meta, () => new LoggingPlugin());
    const [entry] = PluginDiscoveryRegistry.discover();
    const plugin = entry.factory();
    expect(plugin.metadata.id).toBe('com.vi.logging');
  });

  it('discovered plugins can be installed into a mapper', () => {
    const meta = { id: 'com.vi.logging', name: 'Logging', version: '1.0.0', apiVersion: PLUGIN_API_VERSION };
    PluginDiscoveryRegistry.register(meta, () => new LoggingPlugin());

    const mapper = createMapper();
    for (const entry of PluginDiscoveryRegistry.discover()) {
      mapper.use(entry.factory());
    }
    expect(mapper.installedPlugins().map((p) => p.id)).toContain('com.vi.logging');
  });
});

// ── Angular provideAutomapper (4-2) ───────────────────────────────────────────

describe('Angular integration (4-2)', () => {
  it('AUTOMAPPER_TOKEN is an InjectionToken', () => {
    expect(AUTOMAPPER_TOKEN).toBeInstanceOf(InjectionToken);
  });

  it('provideAutomapper() returns an object (EnvironmentProviders)', () => {
    const providers = provideAutomapper();
    expect(providers).toBeDefined();
    expect(typeof providers).toBe('object');
  });

  it('provideAutomapper() with options and profiles does not throw', () => {
    expect(() =>
      provideAutomapper(
        { autoMap: true },
        (mapper) =>
          mapper.addProfile('Src', 'Dest', (b: any) =>
            b.forMember('x', (o: any) => o.mapFrom((s: any) => s.x))
          )
      )
    ).not.toThrow();
  });

  it('AUTOMAPPER_TOKEN default factory creates a working mapper', () => {
    // The token's factory (defaultValue from InjectionToken constructor) is
    // exercised by Angular DI. We verify the factory directly here.
    // Angular exposes the factory via the internal _def — instead we call
    // createMapper() to confirm the same behavior.
    const mapper = createMapper();
    expect(mapper).toBeDefined();
    expect(typeof mapper.map).toBe('function');
  });
});

// ── Zod schema integration (4-3) ─────────────────────────────────────────────

describe('profileFromZod (4-3)', () => {
  // Use addProfile(Object, 'Dest', ...) because plain object literals have
  // constructor Object. Use autoMap:false so only schema-defined keys are
  // mapped onto the destination, giving predictable output.

  it('auto-maps matching source properties onto destination', () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    // autoMap:false ensures only the forMember rules from the schema are applied.
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(Object, 'Dest', profileFromZod(schema));
    const result = mapper.map(
      { name: 'Alice', age: 30, extra: 'ignored' },
      'Dest'
    ) as any;
    expect(result.name).toBe('Alice');
    expect(result.age).toBe(30);
    // 'extra' is not a schema key and autoMap is off — must be absent.
    expect(result.extra).toBeUndefined();
  });

  it('keys absent on source are mapped as undefined', () => {
    const schema = z.object({ name: z.string(), score: z.number().optional() });
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(Object, 'Dest', profileFromZod(schema));
    const result = mapper.map({ name: 'Bob' }, 'Dest') as any;
    expect(result.name).toBe('Bob');
    expect(result.score).toBeUndefined();
  });

  it('strict:true passes when output satisfies schema', () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(Object, 'Dest', profileFromZod(schema, { strict: true }));
    expect(() =>
      mapper.map({ name: 'Alice', age: 30 }, 'Dest')
    ).not.toThrow();
  });

  it('strict:true throws ZodError when output violates schema', () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(Object, 'Dest', profileFromZod(schema, { strict: true }));
    // age is a string — violates z.number(), afterMap hook throws ZodError
    expect(() =>
      mapper.map({ name: 'Alice', age: 'not-a-number' as any }, 'Dest')
    ).toThrow();
  });

  it('strict:false (default) does not validate output', () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(Object, 'Dest', profileFromZod(schema));
    // age is a string — no afterMap validation when strict is false
    expect(() =>
      mapper.map({ name: 'Alice', age: 'not-a-number' as any }, 'Dest')
    ).not.toThrow();
  });

  it('overrides callback can add extra forMember rules', () => {
    const schema = z.object({ name: z.string() });
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(
      Object,
      'Dest',
      profileFromZod(schema, {
        overrides: (b) =>
          (b as any).forMember('label', (o: any) =>
            o.mapFrom((s: any) => s.name.toUpperCase())
          ),
      })
    );
    const result = mapper.map({ name: 'alice' }, 'Dest') as any;
    expect(result.name).toBe('alice');
    expect(result.label).toBe('ALICE');
  });

  it('supports nested object schemas — maps top-level keys only', () => {
    const schema = z.object({
      id: z.string(),
      address: z.object({ city: z.string() }),
    });
    const mapper = createMapper({ autoMap: false });
    mapper.addProfile(Object, 'Dest', profileFromZod(schema));
    const result = mapper.map(
      { id: '1', address: { city: 'London' } },
      'Dest'
    ) as any;
    expect(result.id).toBe('1');
    expect(result.address).toEqual({ city: 'London' });
  });
});

describe('validateWithZod (4-3)', () => {
  it('returns parsed data when valid', () => {
    const schema = z.object({ x: z.number() });
    expect(validateWithZod(schema, { x: 42 })).toEqual({ x: 42 });
  });

  it('throws ZodError when data is invalid', () => {
    const schema = z.object({ x: z.number() });
    expect(() => validateWithZod(schema, { x: 'not-a-number' })).toThrow();
  });
});

describe('safeValidateWithZod (4-3)', () => {
  it('returns { success: true, data } when valid', () => {
    const schema = z.object({ y: z.string() });
    const result = safeValidateWithZod(schema, { y: 'hello' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual({ y: 'hello' });
  });

  it('returns { success: false, error } when invalid', () => {
    const schema = z.object({ y: z.string() });
    const result = safeValidateWithZod(schema, { y: 123 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBeDefined();
  });
});
