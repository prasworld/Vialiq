import { describe, it, expect } from 'vitest';
import { createMapper } from '../core';
import { PLUGIN_API_VERSION } from '../plugin';

describe('plugin edge cases', () => {
  it('throws when plugin apiVersion mismatches and pluginValidation=error', () => {
    const plugin = {
      metadata: { id: 'mismatch.plugin', name: 'mismatch', version: '1.0.0', apiVersion: '0.0.0', description: '' },
      strategy: { canHandle: () => false, map: () => { throw new Error('not used'); } },
    } as any;

    const m = createMapper({ pluginValidation: 'error' as const });
    expect(() => m.use(plugin)).toThrow();
    expect(m.hasPlugin('mismatch.plugin')).toBe(false);
  });

  it('rolls back installation if onInstall throws', () => {
    const plugin = {
      metadata: { id: 'bad.install', name: 'bad', version: '1.0.0', apiVersion: PLUGIN_API_VERSION, description: '' },
      strategy: { canHandle: () => false, map: () => { throw new Error('not used'); } },
      onInstall: () => { throw new Error('install failed'); },
    } as any;

    const m = createMapper();
    expect(() => m.use(plugin)).toThrow('install failed');
    expect(m.hasPlugin('bad.install')).toBe(false);
  });

  it('swallows plugin onMapStart/onMapEnd errors during mapping', () => {
    const plugin = {
      metadata: { id: 'shout.plugin', name: 'shout', version: '1.0.0', apiVersion: PLUGIN_API_VERSION, description: '' },
      strategy: { canHandle: () => true, map: (reg: any, s: any) => ({ ok: true }) },
      onMapStart: () => { throw new Error('boom start'); },
      onMapEnd: () => { throw new Error('boom end'); },
    } as any;

    const m = createMapper();
    m.use(plugin);
    // mapping should succeed despite plugin hooks throwing
    const res = m.map({ x: 1 }, 'Dest');
    expect(res).toEqual({ ok: true });
  });
});
