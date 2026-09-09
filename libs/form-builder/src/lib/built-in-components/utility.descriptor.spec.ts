import { describe, it, expect } from 'vitest';
import { 
  HIDDEN_DESCRIPTOR, 
  CONTENT_DESCRIPTOR, 
  DIVIDER_DESCRIPTOR, 
  BUTTON_DESCRIPTOR,
  SUBMIT_DESCRIPTOR
} from './utility.descriptor';
import type { 
  HiddenComponentSchema, 
  ContentComponentSchema, 
  ButtonComponentSchema 
} from '../types/component-schemas';

describe('Utility Descriptors', () => {
  describe('HIDDEN_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(HIDDEN_DESCRIPTOR.type).toBe('hidden');
      expect(HIDDEN_DESCRIPTOR.canvasElement).toBe('div');
    });

    it('should generate canvas props correctly', () => {
      const schema: HiddenComponentSchema = {
        id: '1',
        type: 'hidden',
        key: 'testKey',
        defaultValue: 'testValue'
      };

      const props = HIDDEN_DESCRIPTOR.canvasProps(schema);
      expect(props).toEqual({
        'data-key': 'testKey',
        'data-value': 'testValue'
      });
    });

    it('should handle missing values', () => {
      const schema: HiddenComponentSchema = { id: '1', type: 'hidden' };
      const props = HIDDEN_DESCRIPTOR.canvasProps(schema);
      expect(props).toEqual({
        'data-key': '',
        'data-value': ''
      });
    });
  });

  describe('CONTENT_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(CONTENT_DESCRIPTOR.type).toBe('content');
      expect(CONTENT_DESCRIPTOR.canvasElement).toBe('div');
    });

    it('should generate canvas props correctly', () => {
      const schema: ContentComponentSchema = {
        id: '1',
        type: 'content',
        content: '<h1>Test</h1>'
      };

      const props = CONTENT_DESCRIPTOR.canvasProps(schema);
      expect(props).toEqual({
        htmlContent: '<h1>Test</h1>'
      });
    });

    it('should provide default htmlContent', () => {
      const props = CONTENT_DESCRIPTOR.canvasProps({ type: 'content', id: '1' });
      expect(props.htmlContent).toBe('<p>Content block</p>');
    });
  });

  describe('DIVIDER_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(DIVIDER_DESCRIPTOR.type).toBe('divider');
      expect(DIVIDER_DESCRIPTOR.canvasElement).toBe('hr');
    });

    it('should generate canvas props correctly', () => {
      const props = DIVIDER_DESCRIPTOR.canvasProps({ type: 'divider', id: '1' });
      expect(props).toEqual({ class: 'vi-divider' });
    });
  });

  describe('BUTTON_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(BUTTON_DESCRIPTOR.type).toBe('button');
      expect(BUTTON_DESCRIPTOR.canvasElement).toBe('vi-button');
    });

    it('should generate canvas props correctly', () => {
      const schema: ButtonComponentSchema = {
        id: '1',
        type: 'button',
        variant: 'danger',
        action: 'custom',
        buttonLabel: 'Click'
      };

      const props = BUTTON_DESCRIPTOR.canvasProps(schema);
      expect(props).toEqual({
        variant: 'danger'
      });
    });

    it('should provide default variant', () => {
      const props = BUTTON_DESCRIPTOR.canvasProps({ type: 'button', id: '1' } as any);
      expect(props.variant).toBe('primary');
    });
  });

  describe('SUBMIT_DESCRIPTOR', () => {
    it('should have correct metadata', () => {
      expect(SUBMIT_DESCRIPTOR.type).toBe('submit');
      expect(SUBMIT_DESCRIPTOR.canvasElement).toBe('vi-button');
    });

    it('should generate canvas props correctly', () => {
      const props = SUBMIT_DESCRIPTOR.canvasProps({ type: 'submit', id: '1' } as any);
      expect(props).toEqual({
        variant: 'primary',
        type: 'submit'
      });
    });
  });
});
