import { describe, it, expect } from 'vitest';
import { 
  SELECT_DESCRIPTOR, 
  COMBOBOX_DESCRIPTOR, 
  CHECKBOX_DESCRIPTOR, 
  RADIO_DESCRIPTOR,
  CHECKBOX_GROUP_DESCRIPTOR,
  RADIO_GROUP_DESCRIPTOR
} from './selection.descriptor';
import type { 
  SelectComponentSchema, 
  ComboboxComponentSchema, 
  CheckboxComponentSchema, 
  RadioComponentSchema 
} from '../types/component-schemas';

describe('Selection Descriptors', () => {
  describe('SELECT_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(SELECT_DESCRIPTOR.type).toBe('select');
      expect(SELECT_DESCRIPTOR.canvasElement).toBe('vi-select');
    });

    it('should generate canvas props correctly', () => {
      const schema: SelectComponentSchema = {
        id: '1',
        type: 'select',
        placeholder: 'Select one',
        readOnly: true,
        multiple: true
      };

      const props = SELECT_DESCRIPTOR.canvasProps(schema);
      expect(props).toEqual({
        placeholder: 'Select one',
        readonly: true,
        multiple: true
      });
    });

    it('should handle null values', () => {
      const props = SELECT_DESCRIPTOR.canvasProps({ type: 'select', id: '1' });
      expect(props.placeholder).toBeNull();
      expect(props.readonly).toBeNull();
      expect(props.multiple).toBeNull();
    });
  });

  describe('COMBOBOX_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(COMBOBOX_DESCRIPTOR.type).toBe('combobox');
      expect(COMBOBOX_DESCRIPTOR.canvasElement).toBe('vi-combobox');
    });

    it('should generate canvas props correctly', () => {
      const schema: ComboboxComponentSchema = {
        id: '1',
        type: 'combobox',
        placeholder: 'Search...',
        readOnly: true
      };

      const props = COMBOBOX_DESCRIPTOR.canvasProps(schema);
      expect(props).toEqual({
        placeholder: 'Search...',
        readonly: true
      });
    });
    
    it('should handle null values', () => {
      const props = COMBOBOX_DESCRIPTOR.canvasProps({ type: 'combobox', id: '1' });
      expect(props.placeholder).toBeNull();
      expect(props.readonly).toBeNull();
    });
  });

  describe('CHECKBOX_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(CHECKBOX_DESCRIPTOR.type).toBe('checkbox');
      expect(CHECKBOX_DESCRIPTOR.canvasElement).toBe('vi-checkbox');
    });

    it('should generate canvas props correctly', () => {
      const schema: CheckboxComponentSchema = {
        id: '1',
        type: 'checkbox',
        defaultValue: true,
        readOnly: true
      };

      const props = CHECKBOX_DESCRIPTOR.canvasProps(schema);
      expect(props).toEqual({
        checked: true,
        readonly: true
      });
    });
    
    it('should handle null values', () => {
      const props = CHECKBOX_DESCRIPTOR.canvasProps({ type: 'checkbox', id: '1' });
      expect(props.checked).toBeNull();
      expect(props.readonly).toBeNull();
    });
  });

  describe('RADIO_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(RADIO_DESCRIPTOR.type).toBe('radio');
      expect(RADIO_DESCRIPTOR.canvasElement).toBe('vi-radio');
    });

    it('should generate canvas props correctly', () => {
      const schema: RadioComponentSchema = {
        id: '1',
        type: 'radio',
        value: 'option1',
        readOnly: true
      };

      const props = RADIO_DESCRIPTOR.canvasProps(schema);
      expect(props).toEqual({
        value: 'option1',
        readonly: true
      });
    });
    
    it('should handle null values', () => {
      const props = RADIO_DESCRIPTOR.canvasProps({ type: 'radio', id: '1' });
      expect(props.value).toBeNull();
      expect(props.readonly).toBeNull();
    });
  });

  describe('CHECKBOX_GROUP_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(CHECKBOX_GROUP_DESCRIPTOR.type).toBe('checkbox-group');
      expect(CHECKBOX_GROUP_DESCRIPTOR.canvasElement).toBe('vi-checkbox');
    });
    it('should generate canvas props correctly', () => {
      const props = CHECKBOX_GROUP_DESCRIPTOR.canvasProps({ type: 'checkbox-group', id: '1' });
      expect(props).toEqual({});
    });
  });

  describe('RADIO_GROUP_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(RADIO_GROUP_DESCRIPTOR.type).toBe('radio-group');
      expect(RADIO_GROUP_DESCRIPTOR.canvasElement).toBe('vi-radio-group');
    });
    it('should generate canvas props correctly', () => {
      const props = RADIO_GROUP_DESCRIPTOR.canvasProps({ type: 'radio-group', id: '1' });
      expect(props).toEqual({});
    });
  });
});
