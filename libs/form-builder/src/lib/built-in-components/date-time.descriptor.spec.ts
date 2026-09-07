import { describe, it, expect } from 'vitest';
import { DATE_DESCRIPTOR, TIME_DESCRIPTOR, DATETIME_LOCAL_DESCRIPTOR } from './date-time.descriptor';
import type { DateComponentSchema } from '../types/component-schemas';

describe('Date and Time Descriptors', () => {
  const testCanvasProps = (descriptor: any, type: string) => {
    it(`should have correct type and element for ${type}`, () => {
      expect(descriptor.type).toBe(type);
      expect(descriptor.canvasElement).toBe('vi-date-picker');
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
      expect(props).toEqual({
        type: type,
        value: '2023-01-01',
        min: '2020-01-01',
        max: '2025-01-01',
        step: 1,
        readonly: true
      });
    });

    it(`should handle null/missing values for ${type}`, () => {
      const schema: DateComponentSchema = { id: '1', type: type as any };
      const props = descriptor.canvasProps(schema);
      
      expect(props.value).toBeNull();
      expect(props.min).toBeNull();
      expect(props.max).toBeNull();
      expect(props.step).toBeNull();
      expect(props.readonly).toBeNull();
    });
  };

  describe('DATE_DESCRIPTOR', () => testCanvasProps(DATE_DESCRIPTOR, 'date'));
  describe('TIME_DESCRIPTOR', () => testCanvasProps(TIME_DESCRIPTOR, 'time'));
  describe('DATETIME_LOCAL_DESCRIPTOR', () => testCanvasProps(DATETIME_LOCAL_DESCRIPTOR, 'datetime-local'));
});
