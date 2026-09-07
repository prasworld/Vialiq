import { describe, it, expect } from 'vitest';
import { PANEL_DESCRIPTOR, COLUMNS_DESCRIPTOR, TABS_DESCRIPTOR, FIELDSET_DESCRIPTOR, REPEATER_DESCRIPTOR } from './layout.descriptor';
import type { ComponentSchema } from '../types/component-schemas';

describe('Layout Descriptors', () => {
  const testCanvasProps = (descriptor: any, expectedProps: Record<string, any>) => {
    it(`should generate canvas props correctly for ${descriptor.type}`, () => {
      const schema: ComponentSchema = {
        id: '1',
        type: descriptor.type,
        label: 'Test'
      };

      const props = descriptor.canvasProps(schema);
      expect(props).toEqual(expectedProps);
    });
  };

  describe('PANEL_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(PANEL_DESCRIPTOR.type).toBe('panel');
      expect(PANEL_DESCRIPTOR.canvasElement).toBe('div');
    });
    testCanvasProps(PANEL_DESCRIPTOR, { class: 'vi-panel' });
  });

  describe('COLUMNS_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(COLUMNS_DESCRIPTOR.type).toBe('columns');
      expect(COLUMNS_DESCRIPTOR.canvasElement).toBe('div');
    });
    testCanvasProps(COLUMNS_DESCRIPTOR, { class: 'vi-columns' });
  });

  describe('TABS_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(TABS_DESCRIPTOR.type).toBe('tabs');
      expect(TABS_DESCRIPTOR.canvasElement).toBe('vi-tabs');
    });
    testCanvasProps(TABS_DESCRIPTOR, {});
  });

  describe('FIELDSET_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(FIELDSET_DESCRIPTOR.type).toBe('fieldset');
      expect(FIELDSET_DESCRIPTOR.canvasElement).toBe('fieldset');
    });
    testCanvasProps(FIELDSET_DESCRIPTOR, { class: 'vi-fieldset' });
  });

  describe('REPEATER_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(REPEATER_DESCRIPTOR.type).toBe('repeater');
      expect(REPEATER_DESCRIPTOR.canvasElement).toBe('div');
    });
    testCanvasProps(REPEATER_DESCRIPTOR, { class: 'vi-repeater' });
  });
});
