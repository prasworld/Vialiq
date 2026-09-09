import { describe, it, expect } from 'vitest';
import { NUMBER_DESCRIPTOR, TEXTAREA_DESCRIPTOR } from './number-textarea.descriptor';
import type { NumberComponentSchema, TextareaComponentSchema } from '../types/component-schemas';

describe('Number and Textarea Descriptors', () => {
  describe('NUMBER_DESCRIPTOR', () => {
    it('should have correct type and element', () => {
      expect(NUMBER_DESCRIPTOR.type).toBe('number');
      expect(NUMBER_DESCRIPTOR.canvasElement).toBe('vi-input');
    });

    it('should generate canvas props correctly', () => {
      const schema: NumberComponentSchema = {
        id: '1',
        type: 'number',
        placeholder: 'Enter number',
        defaultValue: 42,
        min: 0,
        max: 100,
        step: 5,
        readOnly: true
      };

      const props = NUMBER_DESCRIPTOR.canvasProps(schema);
      expect(props).toEqual({
        type: 'number',
        placeholder: 'Enter number',
        value: 42,
        min: 0,
        max: 100,
        step: 5,
        readonly: true
      });
    });

    it('should handle null/missing values', () => {
      const schema: NumberComponentSchema = { id: '1', type: 'number' };
      const props = NUMBER_DESCRIPTOR.canvasProps(schema);
      
      expect(props.placeholder).toBeNull();
      expect(props.value).toBeNull();
      expect(props.min).toBeNull();
      expect(props.max).toBeNull();
      expect(props.step).toBeNull();
      expect(props.readonly).toBeNull();
    });
  });

  describe('TEXTAREA_DESCRIPTOR', () => {
    it('should have correct type and element', () => {
      expect(TEXTAREA_DESCRIPTOR.type).toBe('textarea');
      expect(TEXTAREA_DESCRIPTOR.canvasElement).toBe('vi-textarea');
    });

    it('should generate canvas props correctly', () => {
      const schema: TextareaComponentSchema = {
        id: '1',
        type: 'textarea',
        placeholder: 'Enter text',
        defaultValue: 'test',
        rows: 5,
        readOnly: true
      };

      const props = TEXTAREA_DESCRIPTOR.canvasProps(schema);
      expect(props).toEqual({
        placeholder: 'Enter text',
        value: 'test',
        rows: 5,
        readonly: true
      });
    });

    it('should handle null/missing values', () => {
      const schema: TextareaComponentSchema = { id: '1', type: 'textarea' };
      const props = TEXTAREA_DESCRIPTOR.canvasProps(schema);
      
      expect(props.placeholder).toBeNull();
      expect(props.value).toBeNull();
      expect(props.rows).toBeNull();
      expect(props.readonly).toBeNull();
    });
  });
});
