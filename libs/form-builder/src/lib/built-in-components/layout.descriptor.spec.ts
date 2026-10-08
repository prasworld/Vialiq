import { describe, it, expect } from 'vitest';
import { PANEL_DESCRIPTOR, COLUMNS_DESCRIPTOR, TABS_DESCRIPTOR, FIELDSET_DESCRIPTOR, REPEATER_DESCRIPTOR, CONTENT_SWITCHER_DESCRIPTOR } from './layout.descriptor';
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

    it('should generate empty canvas props when no tabs configured', () => {
      const schema: ComponentSchema = {
        id: '1',
        type: 'tabs',
        label: 'Test'
      };
      expect(TABS_DESCRIPTOR.canvasProps(schema)).toEqual({
        active: '',
        childElements: []
      });
    });

    it('should generate canvas props with childElements when tabs configured', () => {
      const schema: ComponentSchema = {
        id: '1',
        type: 'tabs',
        label: 'Test',
        layoutConfig: {
          tabs: [
            { id: 'tab1', label: 'Tab 1' },
            { id: 'tab2', label: 'Tab 2' }
          ]
        }
      } as any;
      
      expect(TABS_DESCRIPTOR.canvasProps(schema)).toEqual({
        active: 'tab1',
        childElements: [
          {
            tag: 'vi-tab',
            attributes: { 'tab-id': 'tab1' },
            textContent: 'Tab 1'
          },
          {
            tag: 'vi-tab',
            attributes: { 'tab-id': 'tab2' },
            textContent: 'Tab 2'
          }
        ]
      });
    });
  });

  describe('CONTENT_SWITCHER_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(CONTENT_SWITCHER_DESCRIPTOR.type).toBe('content-switcher');
      expect(CONTENT_SWITCHER_DESCRIPTOR.canvasElement).toBe('vi-content-switcher');
    });

    it('should generate empty canvas props when no views configured', () => {
      const schema: ComponentSchema = {
        id: '1',
        type: 'content-switcher',
        label: 'Test'
      };
      expect(CONTENT_SWITCHER_DESCRIPTOR.canvasProps(schema)).toEqual({
        value: '',
        block: true,
        childElements: []
      });
    });

    it('should generate canvas props with childElements when views configured', () => {
      const schema: ComponentSchema = {
        id: '1',
        type: 'content-switcher',
        label: 'Test',
        layoutConfig: {
          views: [
            { id: 'view1', label: 'View 1' },
            { id: 'view2', label: 'View 2' }
          ]
        }
      } as any;
      
      expect(CONTENT_SWITCHER_DESCRIPTOR.canvasProps(schema)).toEqual({
        value: 'view1',
        block: true,
        childElements: [
          {
            tag: 'vi-switcher-item',
            attributes: { value: 'view1' },
            textContent: 'View 1'
          },
          {
            tag: 'vi-switcher-item',
            attributes: { value: 'view2' },
            textContent: 'View 2'
          }
        ]
      });
    });
  });

  describe('FIELDSET_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(FIELDSET_DESCRIPTOR.type).toBe('fieldset');
      expect(FIELDSET_DESCRIPTOR.canvasElement).toBe('div');
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
