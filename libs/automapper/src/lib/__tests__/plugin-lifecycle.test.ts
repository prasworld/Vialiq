import { describe, it, expect, vi } from 'vitest';
import { createMapper } from '../core';
import { PLUGIN_API_VERSION } from '../plugin';

describe('plugin lifecycle', () => {
  it('calls onMapStart and onMapEnd for sync mapping', () => {
    const plugin = {
      metadata: { id: 'test.plugin', name: 'test', version: '1.0.0', apiVersion: PLUGIN_API_VERSION, description: '' },
      strategy: { canHandle: () => false, map: () => { throw new Error('should not be used'); } },
      onMapStart: vi.fn(),
      onMapEnd: vi.fn(),
      onMapError: vi.fn(),
    };

    const m = createMapper();
    m.use(plugin as any);

    const src = { a: 1 };
    const _res = m.map(src, 'Dest');

    expect(plugin.onMapStart).toHaveBeenCalledWith(src, 'Dest');
    expect(plugin.onMapEnd).toHaveBeenCalled();
    expect(plugin.onMapError).not.toHaveBeenCalled();
  });

  it('calls onMapError when mapping throws', () => {
    const badStrategy = {
      canHandle: () => true,
      map: () => { throw new Error('boom'); },
    };
    const plugin = {
      metadata: { id: 'err.plugin', name: 'err', version: '1.0.0', apiVersion: PLUGIN_API_VERSION, description: '' },
      strategy: badStrategy,
      onMapStart: vi.fn(),
      onMapEnd: vi.fn(),
      onMapError: vi.fn(),
    };

    const m = createMapper();
    m.use(plugin as any);

    expect(() => m.map({ x: 1 }, 'Dest')).toThrow();
    expect(plugin.onMapStart).toHaveBeenCalled();
    expect(plugin.onMapError).toHaveBeenCalled();
  });
});
