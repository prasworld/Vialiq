import type { ComponentDescriptor, SettingsTab } from '../types/component-descriptor';
import type {
  SelectComponentSchema,
  ComboboxComponentSchema,
  CheckboxComponentSchema,
  RadioComponentSchema,
} from '../types/component-schemas';
import { standardSettings, displayTab, validationTab, logicTab, hasRequiredRule, sizeField } from './settings-helpers';

export const SELECT_DESCRIPTOR: ComponentDescriptor = {
  type: 'select',
  label: 'Select',
  category: 'basic',
  group: 'Basic Info',
  icon: 'chevrons-up-down',
  traits: { isInput: true },
  weight: 70,
  canvasElement: 'vi-select',
  canvasProps: (s) => {
    const schema = s as SelectComponentSchema;
    return {
      placeholder: schema.placeholder ?? null,
      clearable: schema.clearable ? '' : null,
      required: hasRequiredRule(schema) || null,
      // NOTE: vi-select has no `readonly` or `multiple` attr.
      // `readOnly` renders as disabled appearance only; true readonly needs a renderer wrapper.
      // `multiple` is intentionally deferred — use combobox with mode='multi' instead.
      disabled: schema.readOnly ? '' : null,
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
        { key: 'clearable', label: 'Clearable', type: 'boolean' },
        // NOTE: 'multiple' is intentionally omitted — vi-select has no multiple attr.
        // Use a combobox with mode='multi' for multi-selection use cases.
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
    ].filter(Boolean) as SettingsTab[],
  },
  supportsRepeating: false,
  rendererRef: 'vi-renderer-select',
};

export const COMBOBOX_DESCRIPTOR: ComponentDescriptor = {
  type: 'combobox',
  label: 'Combobox',
  category: 'basic',
  group: 'Basic Info',
  icon: 'square-check',
  traits: { isInput: true },
  weight: 80,
  canvasElement: 'vi-combobox',
  canvasProps: (s) => {
    const schema = s as ComboboxComponentSchema;
    // freeText maps to creatable mode; otherwise single.
    const mode = schema.freeText ? 'creatable' : 'single';
    return {
      placeholder: schema.placeholder ?? null,
      mode,
      clearable: schema.clearable ? '' : null,
      required: hasRequiredRule(schema) || null,
      // NOTE: vi-combobox has no `readonly` attr — use disabled for canvas preview only.
      disabled: schema.readOnly ? '' : null,
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
        { key: 'clearable', label: 'Clearable', type: 'boolean' },
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
    ].filter(Boolean) as SettingsTab[],
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
  traits: { isInput: true },
  weight: 90,
  canvasElement: 'vi-checkbox',
  canvasProps: (s) => {
    const schema = s as CheckboxComponentSchema;
    return {
      required: hasRequiredRule(schema) || null,
      size: schema.size ?? null,
      checked: schema.defaultValue ?? null,
      htmlContent: schema.checkboxLabel || 'Preview Option',
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
    sizeField,
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
  traits: { isInput: true },
  weight: 100,
  canvasElement: 'vi-radio',
  canvasProps: (s) => {
    const schema = s as RadioComponentSchema;
    return {
      // NOTE: vi-radio has no `readonly` attr — omitted intentionally.
      value: schema.value ?? null,
      htmlContent: schema.label || 'Preview Option',
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
  icon: 'list-checks',
  traits: { isInput: true },
  weight: 10,
  canvasElement: 'vi-checkbox',  // Preview with first option; renderer handles the full group
  canvasProps: (_s) => ({
    readonly: true,
    htmlContent: 'Option 1',
  }),
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
    ].filter(Boolean) as SettingsTab[],
  },
  supportsRepeating: false,
  rendererRef: 'vi-renderer-checkbox-group',
};

export const RADIO_GROUP_DESCRIPTOR: ComponentDescriptor = {
  type: 'radio-group',
  label: 'Radio Group',
  category: 'advanced',
  group: 'Basic Info',
  icon: 'circle-dot',
  traits: { isInput: true },
  weight: 20,
  canvasElement: 'vi-radio',
  canvasProps: (_s) => ({
    readonly: true,
    htmlContent: 'Option 1',
  }),
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
    ].filter(Boolean) as SettingsTab[],
  },
  supportsRepeating: false,
  rendererRef: 'vi-renderer-radio-group',
};
