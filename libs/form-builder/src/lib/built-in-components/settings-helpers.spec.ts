import { describe, it, expect } from 'vitest';
import { displayTab, dataTab, validationTab, logicTab, standardSettings } from './settings-helpers';

describe('settings-helpers', () => {
  describe('displayTab', () => {
    it('should create display tab with default fields', () => {
      const tab = displayTab();
      expect(tab.id).toBe('display');
      expect(tab.fields.length).toBe(3);
      expect(tab.fields.map(f => f.key)).toEqual(['label', 'description', 'labelPosition']);
    });

    it('should add extra fields', () => {
      const tab = displayTab([{ key: 'extra', label: 'Extra', type: 'text' }]);
      expect(tab.fields.length).toBe(4);
      expect(tab.fields[3].key).toBe('extra');
    });
  });

  describe('dataTab', () => {
    it('should create data tab with default fields', () => {
      const tab = dataTab();
      expect(tab.id).toBe('data');
      expect(tab.fields.length).toBe(4);
      expect(tab.fields.map(f => f.key)).toEqual(['key', 'defaultValue', 'readOnly', 'hidden']);
    });

    it('should add extra fields after key', () => {
      const tab = dataTab([{ key: 'extra', label: 'Extra', type: 'text' }]);
      expect(tab.fields.length).toBe(5);
      expect(tab.fields[1].key).toBe('extra');
      expect(tab.fields[2].key).toBe('defaultValue');
    });
  });

  describe('validationTab', () => {
    it('should return null since custom editor is unimplemented', () => {
      expect(validationTab()).toBeNull();
    });
  });

  describe('logicTab', () => {
    it('should return null since custom editor is unimplemented', () => {
      expect(logicTab()).toBeNull();
    });
  });

  describe('standardSettings', () => {
    it('should combine all standard tabs (excluding unimplemented)', () => {
      const schema = standardSettings();
      expect(schema.tabs.length).toBe(2);
      expect(schema.tabs.map(t => t.id)).toEqual(['display', 'data']);
    });

    it('should pass extras to tabs', () => {
      const schema = standardSettings(
        [{ key: 'displayExtra', label: 'Display Extra', type: 'text' }],
        [{ key: 'dataExtra', label: 'Data Extra', type: 'text' }]
      );
      
      const dispTab = schema.tabs.find(t => t.id === 'display')!;
      expect(dispTab.fields.find(f => f.key === 'displayExtra')).toBeTruthy();
      
      const datTab = schema.tabs.find(t => t.id === 'data')!;
      expect(datTab.fields.find(f => f.key === 'dataExtra')).toBeTruthy();
    });
  });
});
