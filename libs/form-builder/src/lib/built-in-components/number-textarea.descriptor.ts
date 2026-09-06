import type { ComponentDescriptor } from '../types/component-descriptor';
import type { NumberComponentSchema, TextareaComponentSchema } from '../types/component-schemas';
import { standardSettings } from './settings-helpers';

export const NUMBER_DESCRIPTOR: ComponentDescriptor = {
  type: 'number',
  label: 'Number',
  category: 'basic',
  group: 'Text Inputs',
  icon: 'hash',
  weight: 50,
  canvasElement: 'vi-input',
  canvasProps: (s) => {
    const schema = s as NumberComponentSchema;
    return {
      type: 'number',
      placeholder: schema.placeholder ?? null,
      value: schema.defaultValue ?? null,
      min: schema.min ?? null,
      max: schema.max ?? null,
      step: schema.step ?? null,
      readonly: schema.readOnly ?? null,
    };
  },
  defaultSchema: {
    type: 'number',
    label: 'Number',
    placeholder: '',
  },
  settingsSchema: standardSettings(
    [
      { key: 'placeholder', label: 'Placeholder', type: 'text' },
    ],
    [
      { key: 'min', label: 'Min value', type: 'number' },
      { key: 'max', label: 'Max value', type: 'number' },
      { key: 'step', label: 'Step', type: 'number' },
    ]
  ),
  supportsRepeating: true,
  rendererRef: 'vi-renderer-input',
};

export const TEXTAREA_DESCRIPTOR: ComponentDescriptor = {
  type: 'textarea',
  label: 'Text Area',
  category: 'basic',
  group: 'Text Inputs',
  icon: 'align-left',
  weight: 60,
  canvasElement: 'vi-textarea',
  canvasProps: (s) => {
    const schema = s as TextareaComponentSchema;
    return {
      placeholder: schema.placeholder ?? null,
      value: schema.defaultValue ?? null,
      rows: schema.rows ?? null,
      readonly: schema.readOnly ?? null,
    };
  },
  defaultSchema: {
    type: 'textarea',
    label: 'Text Area',
    placeholder: '',
    rows: 3,
  },
  settingsSchema: standardSettings(
    [
      { key: 'placeholder', label: 'Placeholder', type: 'text' },
      { key: 'rows', label: 'Rows', type: 'number', defaultValue: 3 },
      { key: 'maxlength', label: 'Max length', type: 'number' },
    ]
  ),
  supportsRepeating: true,
  rendererRef: 'vi-renderer-textarea',
};
