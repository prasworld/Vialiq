import type { ComponentDescriptor } from '../types/component-descriptor';
import type {
  SelectComponentSchema,
  ComboboxComponentSchema,
  CheckboxComponentSchema,
  RadioComponentSchema,
} from '../types/component-schemas';
import { standardSettings, displayTab, validationTab, logicTab } from './settings-helpers';

export const SELECT_DESCRIPTOR: ComponentDescriptor = {
  type: 'select',
  label: 'Select',
  category: 'basic',
  group: 'Basic Info',
  icon: 'chevron-down',
  weight: 70,
  canvasElement: 'vi-select',
  canvasProps: (s) => {
    const schema = s as SelectComponentSchema;
    return {
      placeholder: schema.placeholder ?? null,
      readonly: schema.readOnly ?? null,
      multiple: schema.multiple ?? null,
    };
  },
  defaultSchema: {
    type: 'select',
    label: 'Select',
    placeholder: 'Choose an option',
  },
  settingsSchema: {
    tabs: [
      displayTab([
        { key: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Choose an option' },
        {
          key: 'multiple',
          label: 'Multiple selection',
          type: 'boolean',
        },
      ]),
      {
        id: 'data',
        label: 'Data',
        fields: [
          { key: 'key', label: 'Field key', type: 'key', required: true },
          // TODO(Phase X): optionSource editor is currently unimplemented
        ],
      },
      validationTab(),
      logicTab(),
    ].filter(Boolean) as any[],
  },
  supportsRepeating: false,
  rendererRef: 'vi-renderer-select',
};

export const COMBOBOX_DESCRIPTOR: ComponentDescriptor = {
  type: 'combobox',
  label: 'Combobox',
  category: 'basic',
  group: 'Basic Info',
  icon: 'search',
  weight: 80,
  canvasElement: 'vi-combobox',
  canvasProps: (s) => {
    const schema = s as ComboboxComponentSchema;
    return {
      placeholder: schema.placeholder ?? null,
      readonly: schema.readOnly ?? null,
    };
  },
  defaultSchema: {
    type: 'combobox',
    label: 'Combobox',
    placeholder: 'Search or select',
    freeText: false,
  },
  settingsSchema: {
    tabs: [
      displayTab([
        { key: 'placeholder', label: 'Placeholder', type: 'text' },
        { key: 'freeText', label: 'Allow free-text entry', type: 'boolean' },
      ]),
      {
        id: 'data',
        label: 'Data',
        fields: [
          { key: 'key', label: 'Field key', type: 'key', required: true },
          // TODO(Phase X): optionSource editor is currently unimplemented
        ],
      },
      validationTab(),
      logicTab(),
    ].filter(Boolean) as any[],
  },
  supportsRepeating: false,
  rendererRef: 'vi-renderer-combobox',
};

export const CHECKBOX_DESCRIPTOR: ComponentDescriptor = {
  type: 'checkbox',
  label: 'Checkbox',
  category: 'basic',
  group: 'Basic Info',
  icon: 'check-circle',
  weight: 90,
  canvasElement: 'vi-checkbox',
  canvasProps: (s) => {
    const schema = s as CheckboxComponentSchema;
    return {
      readonly: schema.readOnly ?? null,
      checked: schema.defaultValue ?? null,
    };
  },
  defaultSchema: {
    type: 'checkbox',
    label: 'Checkbox',
    checkboxLabel: 'I agree',
    defaultValue: false,
  },
  settingsSchema: standardSettings([
    { key: 'checkboxLabel', label: 'Checkbox label', type: 'text', hint: 'Label shown next to the checkbox itself' },
  ]),
  supportsRepeating: false,
  rendererRef: 'vi-renderer-checkbox',
};

export const RADIO_DESCRIPTOR: ComponentDescriptor = {
  type: 'radio',
  label: 'Radio',
  category: 'basic',
  group: 'Basic Info',
  icon: 'check-circle',
  weight: 100,
  canvasElement: 'vi-radio',
  canvasProps: (s) => {
    const schema = s as RadioComponentSchema;
    return {
      readonly: schema.readOnly ?? null,
      value: schema.value ?? null,
    };
  },
  defaultSchema: {
    type: 'radio',
    label: 'Radio Option',
    value: '',
  },
  settingsSchema: standardSettings([
    { key: 'value', label: 'Value', type: 'text', required: true, hint: 'The value submitted when selected' },
  ]),
  supportsRepeating: false,
  rendererRef: 'vi-renderer-radio',
};

export const CHECKBOX_GROUP_DESCRIPTOR: ComponentDescriptor = {
  type: 'checkbox-group',
  label: 'Checkbox Group',
  category: 'advanced',
  group: 'Basic Info',
  icon: 'task-checklist',
  weight: 10,
  canvasElement: 'vi-checkbox',  // Preview with first option; renderer handles the full group
  canvasProps: () => ({}),
  defaultSchema: {
    type: 'checkbox-group',
    label: 'Checkbox Group',
  },
  settingsSchema: {
    tabs: [
      displayTab(),
      {
        id: 'data',
        label: 'Data',
        fields: [
          { key: 'key', label: 'Field key', type: 'key', required: true },
          // TODO(Phase X): optionSource editor is currently unimplemented
        ],
      },
      validationTab(),
      logicTab(),
    ].filter(Boolean) as any[],
  },
  supportsRepeating: false,
  rendererRef: 'vi-renderer-checkbox-group',
};

export const RADIO_GROUP_DESCRIPTOR: ComponentDescriptor = {
  type: 'radio-group',
  label: 'Radio Group',
  category: 'advanced',
  group: 'Basic Info',
  icon: 'check-circle',
  weight: 20,
  canvasElement: 'vi-radio-group',
  canvasProps: () => ({}),
  defaultSchema: {
    type: 'radio-group',
    label: 'Radio Group',
  },
  settingsSchema: {
    tabs: [
      displayTab(),
      {
        id: 'data',
        label: 'Data',
        fields: [
          { key: 'key', label: 'Field key', type: 'key', required: true },
          // TODO(Phase X): optionSource editor is currently unimplemented
        ],
      },
      validationTab(),
      logicTab(),
    ].filter(Boolean) as any[],
  },
  supportsRepeating: false,
  rendererRef: 'vi-renderer-radio-group',
};
