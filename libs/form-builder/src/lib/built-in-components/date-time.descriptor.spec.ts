import { describe, it, expect } from 'vitest';
import { DATE_DESCRIPTOR, TIME_DESCRIPTOR, DATETIME_LOCAL_DESCRIPTOR } from './date-time.descriptor';
import type { DateComponentSchema } from '../types/component-schemas';

describe('Date and Time Descriptors', () => {
  const testCanvasProps = (descriptor: any, type: string, expectedElement: string) => {
    it(`should have correct type and element for ${type}`, () => {
      expect(descriptor.type).toBe(type);
      expect(descriptor.canvasElement).toBe(expectedElement);
    });

    it(`should generate canvas props correctly for ${type}`, () => {
      const schema: DateComponentSchema = {
        id: '1',
        type: type as any,
        defaultValue: '2023-01-01',
        min: '2020-01-01',
        max: '2025-01-01',
        step: 1,
        readOnly: true
      };

      const props = descriptor.canvasProps(schema);
      if (type === 'date') {
        expect(props).toEqual({
          value: '2023-01-01',
          min: '2020-01-01',
          max: '2025-01-01',
          step: 1,
          readonly: true,
          placeholder: '',
          required: null
        });
      } else {
        expect(props).toEqual({
          type: type,
          value: '2023-01-01',
          min: '2020-01-01',
          max: '2025-01-01',
          step: 1,
          readonly: true,
          placeholder: '',
          required: null
        });
      }
    });

    it(`should handle null/missing values for ${type}`, () => {
      const schema: DateComponentSchema = { id: '1', type: type as any };
      const props = descriptor.canvasProps(schema);
      
      expect(props.value).toBeNull();
      expect(props.min).toBeNull();
      expect(props.max).toBeNull();
      expect(props.step).toBeNull();
      expect(props.readonly).toBeNull();
      expect(props.required).toBeNull();
    });
    it(`should expose valueMapping in settings schema for ${type}`, () => {
      const dataTab = descriptor.settingsSchema.tabs.find((t: any) => t.id === 'data');
      expect(dataTab).toBeDefined();
      
      const valueMappingField = dataTab.fields.find((f: any) => f.key === 'valueMapping');
      expect(valueMappingField).toBeDefined();
      expect(valueMappingField.type).toBe('select');
      expect(valueMappingField.options.length).toBeGreaterThan(0);
    });
  };

  describe('DATE_DESCRIPTOR', () => testCanvasProps(DATE_DESCRIPTOR, 'date', 'vi-date-picker-input'));
  describe('TIME_DESCRIPTOR', () => testCanvasProps(TIME_DESCRIPTOR, 'time', 'input'));
  describe('DATETIME_LOCAL_DESCRIPTOR', () => testCanvasProps(DATETIME_LOCAL_DESCRIPTOR, 'datetime-local', 'input'));
});
