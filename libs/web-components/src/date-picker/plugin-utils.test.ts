import { describe, it, expect } from 'vitest';
import { isViPlugin, resolvePlugin, mergePlugins } from './plugin-utils.js';
import type { ViDatePickerPlugin } from './types.js';
import type { Plugin } from 'flatpickr/dist/types/options';

describe('plugin-utils', () => {
  const mockFactory = () => () => ({});
  const mockViPlugin: ViDatePickerPlugin = {
    id: 'test-plugin',
    label: 'Test',
    factory: mockFactory as unknown as Plugin
  };

  describe('isViPlugin', () => {
    it('returns true for ViDatePickerPlugin', () => {
      expect(isViPlugin(mockViPlugin)).toBe(true);
    });

    it('returns false for raw plugin', () => {
      expect(isViPlugin(mockFactory as unknown as Plugin)).toBe(false);
    });
  });

  describe('resolvePlugin', () => {
    it('returns factory for ViDatePickerPlugin', () => {
      expect(resolvePlugin(mockViPlugin)).toBe(mockViPlugin.factory);
    });

    it('returns plugin for raw plugin', () => {
      expect(resolvePlugin(mockFactory as unknown as Plugin)).toBe(mockFactory as unknown as Plugin);
    });
  });

  describe('mergePlugins', () => {
    it('puts mode plugin first', () => {
      const modePlugin = mockFactory as unknown as Plugin;
      const result = mergePlugins(modePlugin, []);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(modePlugin);
    });

    it('deduplicates by id', () => {
      const modePlugin = mockFactory as unknown as Plugin;
      const dupPlugin: ViDatePickerPlugin = { ...mockViPlugin };
      
      const result = mergePlugins(modePlugin, [mockViPlugin, dupPlugin]);
      expect(result).toHaveLength(2); // 1 mode + 1 deduped vi plugin
      expect(result[1]).toBe(mockViPlugin.factory);
    });

    it('allows duplicate raw plugins', () => {
      const p1 = () => ({});
      const p2 = () => ({});
      
      const result = mergePlugins(null, [p1 as unknown as Plugin, p2 as unknown as Plugin]);
      expect(result).toHaveLength(2);
    });
  });
});
