import type { ComponentDescriptor } from '../types/component-descriptor';
import type { InputComponentSchema, MaskedInputComponentSchema } from '../types/component-schemas';
import { standardSettings, hasRequiredRule, sizeField } from './settings-helpers';
import { AUTOCOMPLETE_VALUES } from '@vialiq/web-components/input';

function inputCanvasProps(schema: InputComponentSchema | MaskedInputComponentSchema): Record<string, unknown> {
  return {
    label: schema.label ?? null,
    placeholder: schema.placeholder ?? null,
    value: schema.defaultValue ?? null,
    required: hasRequiredRule(schema) || null,
    readonly: schema.readOnly ?? null,
    maxlength: schema.maxlength ?? null,
    autocomplete: schema.autocomplete ?? null,
    size: schema.size ?? null,
    disabled: null, // disabled during drag — set by DndService at runtime
  };
}

export const TEXT_INPUT_DESCRIPTOR: ComponentDescriptor = {
  type: 'text-input',
  label: 'Text',
  category: 'basic',
  group: 'Basic Info',
  icon: 'text-cursor',
  traits: { isInput: true },
  weight: 10,
  canvasElement: 'vi-input',
  canvasProps: (s) => ({ ...inputCanvasProps(s as InputComponentSchema), type: 'text' }),
  defaultSchema: {
    type: 'text-input',
    label: 'Text Field',
    placeholder: '',
  },
  settingsSchema: standardSettings([
    { key: 'placeholder', label: 'Placeholder', type: 'text' },
    { key: 'maxlength', label: 'Max length', type: 'number' },
    {
      key: 'autocomplete',
      label: 'Autocomplete',
      type: 'select',
      hint: 'Standard HTML autofill value',
      options: [
        { label: 'None', value: '' },
        ...AUTOCOMPLETE_VALUES.map((val) => ({ label: val, value: val })),
      ],
    },
    sizeField,
  ]),
  supportsRepeating: true,
  rendererRef: 'vi-renderer-input',
};

export const EMAIL_DESCRIPTOR: ComponentDescriptor = {
  type: 'email',
  label: 'Email',
  category: 'basic',
  group: 'Basic Info',
  icon: 'at-sign',
  traits: { isInput: true },
  weight: 20,
  canvasElement: 'vi-input',
  canvasProps: (s) => ({ ...inputCanvasProps(s as InputComponentSchema), type: 'email' }),
  defaultSchema: {
    type: 'email',
    label: 'Email',
    placeholder: 'name@example.com',
    validation: [{ descriptor: { type: 'email' } }],
  },
  settingsSchema: standardSettings([
    { key: 'placeholder', label: 'Placeholder', type: 'text' },
    { key: 'maxlength', label: 'Max length', type: 'number' },
    sizeField,
  ]),
  supportsRepeating: true,
  rendererRef: 'vi-renderer-input',
};

export const PASSWORD_DESCRIPTOR: ComponentDescriptor = {
  type: 'password',
  label: 'Password',
  category: 'basic',
  group: 'Basic Info',
  icon: 'lock',
  traits: { isInput: true },
  weight: 30,
  canvasElement: 'vi-input',
  canvasProps: (s) => ({ ...inputCanvasProps(s as InputComponentSchema), type: 'password' }),
  defaultSchema: {
    type: 'password',
    label: 'Password',
    placeholder: '',
  },
  settingsSchema: standardSettings([
    { key: 'placeholder', label: 'Placeholder', type: 'text' },
    { key: 'maxlength', label: 'Max length', type: 'number' },
    {
      key: 'autocomplete',
      label: 'Autocomplete',
      type: 'select',
      hint: 'Password autofill behavior',
      options: [
        { label: 'None', value: '' },
        { label: 'Off', value: 'off' },
        { label: 'New Password', value: 'new-password' },
        { label: 'Current Password', value: 'current-password' },
      ],
    },
    sizeField,
  ]),
  rendererRef: 'vi-renderer-input',
};

export const TEL_DESCRIPTOR: ComponentDescriptor = {
  type: 'tel',
  label: 'Phone',
  category: 'basic',
  group: 'Basic Info',
  icon: 'phone',
  traits: { isInput: true },
  weight: 40,
  canvasElement: 'vi-input',
  canvasProps: (s) => ({ ...inputCanvasProps(s as InputComponentSchema), type: 'tel' }),
  defaultSchema: {
    type: 'tel',
    label: 'Phone Number',
    placeholder: '',
  },
  settingsSchema: standardSettings([
    { key: 'placeholder', label: 'Placeholder', type: 'text' },
    { key: 'maxlength', label: 'Max length', type: 'number' },
    {
      key: 'autocomplete',
      label: 'Autocomplete',
      type: 'select',
      hint: 'Standard HTML autofill value',
      options: [
        { label: 'None', value: '' },
        ...AUTOCOMPLETE_VALUES.map((val) => ({ label: val, value: val })),
      ],
    },
    sizeField,
  ]),
  supportsRepeating: true,
  rendererRef: 'vi-renderer-input',
};

export const MASKED_INPUT_DESCRIPTOR: ComponentDescriptor = {
  type: 'masked-input',
  label: 'Masked Input',
  category: 'basic',
  group: 'Basic Info',
  icon: 'hash',
  traits: { isInput: true },
  weight: 45,
  canvasElement: 'vi-masked-input',
  canvasProps: (s) => ({
    ...inputCanvasProps(s as MaskedInputComponentSchema),
    mask: (s as MaskedInputComponentSchema).mask ?? null,
    type: (s as MaskedInputComponentSchema).inputType ?? 'text',
    maskOptions: (s as MaskedInputComponentSchema).alwaysShowMask ? { mask: (s as MaskedInputComponentSchema).mask, lazy: false } : null,
  }),
  defaultSchema: {
    type: 'masked-input',
    label: 'Masked Field',
    placeholder: '',
    mask: '(000) 000-0000',
    inputType: 'text',
  },
  settingsSchema: standardSettings([
    { key: 'placeholder', label: 'Placeholder', type: 'text' },
    { key: 'mask', label: 'Mask Pattern', type: 'text', hint: 'e.g. (000) 000-0000 or 00/00/0000' },
    {
      key: 'inputType',
      label: 'Input Type',
      type: 'select',
      hint: 'Controls mobile keyboard layout',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Telephone', value: 'tel' },
        { label: 'Email', value: 'email' },
        { label: 'URL', value: 'url' },
        { label: 'Password', value: 'password' },
      ],
      defaultValue: 'text',
    },
    { key: 'alwaysShowMask', label: 'Always show mask', type: 'boolean', hint: 'Display mask pattern when empty' },
    { key: 'maxlength', label: 'Max length', type: 'number' },
    {
      key: 'autocomplete',
      label: 'Autocomplete',
      type: 'select',
      hint: 'Standard HTML autofill value',
      options: [
        { label: 'None', value: '' },
        ...AUTOCOMPLETE_VALUES.map((val) => ({ label: val, value: val })),
      ],
    },
    sizeField,
  ], [
    {
      key: 'valueMapping',
      label: 'Submit value as',
      type: 'select',
      hint: 'Which representation is sent in the form payload on submit',
      options: [
        { label: 'Formatted value (default)', value: 'value' },
        { label: 'Raw / unmasked value', value: 'rawValue' },
        { label: 'Display value', value: 'displayValue' },
      ],
      defaultValue: 'value',
    },
  ]),
  supportsRepeating: true,
  rendererRef: 'vi-renderer-masked-input',
};
