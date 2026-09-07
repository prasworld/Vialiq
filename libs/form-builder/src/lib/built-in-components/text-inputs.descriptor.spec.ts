import { describe, it, expect } from 'vitest';
import { TEXT_INPUT_DESCRIPTOR, EMAIL_DESCRIPTOR, PASSWORD_DESCRIPTOR, TEL_DESCRIPTOR } from './text-inputs.descriptor';
import type { InputComponentSchema } from '../types/component-schemas';

describe('Text Input Descriptors', () => {
  describe('TEXT_INPUT_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(TEXT_INPUT_DESCRIPTOR.type).toBe('text-input');
      expect(TEXT_INPUT_DESCRIPTOR.canvasElement).toBe('vi-input');
    });

    it('should generate canvas props correctly', () => {
      const schema: InputComponentSchema = {
        id: '1',
        type: 'text-input',
        label: 'Test Label',
        placeholder: 'Test Placeholder',
        defaultValue: 'test value',
        readOnly: true
      };

      const props = TEXT_INPUT_DESCRIPTOR.canvasProps(schema);
      expect(props).toEqual({
        label: 'Test Label',
        placeholder: 'Test Placeholder',
        value: 'test value',
        readonly: true,
        disabled: null
      });
    });

    it('should handle null/missing schema values', () => {
      const schema: InputComponentSchema = { id: '1', type: 'text-input' };
      const props = TEXT_INPUT_DESCRIPTOR.canvasProps(schema);
      expect(props).toEqual({
        label: null,
        placeholder: null,
        value: null,
        readonly: null,
        disabled: null
      });
    });
  });

  describe('EMAIL_DESCRIPTOR', () => {
    it('should have correct type and canvas props override', () => {
      expect(EMAIL_DESCRIPTOR.type).toBe('email');
      const schema: InputComponentSchema = { id: '1', type: 'email', label: 'Email' };
      const props = EMAIL_DESCRIPTOR.canvasProps(schema);
      
      expect(props['type']).toBe('email');
      expect(props['label']).toBe('Email');
    });
  });

  describe('PASSWORD_DESCRIPTOR', () => {
    it('should have correct type and canvas props override', () => {
      expect(PASSWORD_DESCRIPTOR.type).toBe('password');
      const schema: InputComponentSchema = { id: '1', type: 'password', label: 'Pass' };
      const props = PASSWORD_DESCRIPTOR.canvasProps(schema);
      
      expect(props['type']).toBe('password');
    });
  });

  describe('TEL_DESCRIPTOR', () => {
    it('should have correct type and canvas props override', () => {
      expect(TEL_DESCRIPTOR.type).toBe('tel');
      const schema: InputComponentSchema = { id: '1', type: 'tel', label: 'Phone' };
      const props = TEL_DESCRIPTOR.canvasProps(schema);
      
      expect(props['type']).toBe('tel');
    });
  });
});
