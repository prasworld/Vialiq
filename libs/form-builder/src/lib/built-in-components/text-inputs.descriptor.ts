import type { ComponentDescriptor } from '../types/component-descriptor';
import type { InputComponentSchema } from '../types/component-schemas';
import { standardSettings } from './settings-helpers';

function inputCanvasProps(schema: InputComponentSchema): Record<string, unknown> {
  return {
    label: schema.label ?? null,
    placeholder: schema.placeholder ?? null,
    value: schema.defaultValue ?? null,
    readonly: schema.readOnly ?? null,
    disabled: null, // disabled during drag — set by DndService at runtime
  };
}

export const TEXT_INPUT_DESCRIPTOR: ComponentDescriptor = {
  type: 'text-input',
  label: 'Text',
  category: 'basic',
  group: 'Basic Info',
  icon: 'text-cursor',
  weight: 10,
  canvasElement: 'vi-input',
  canvasProps: (s) => inputCanvasProps(s as InputComponentSchema),
  defaultSchema: {
    type: 'text-input',
    label: 'Text Field',
    placeholder: '',
  },
  settingsSchema: standardSettings([
    { key: 'placeholder', label: 'Placeholder', type: 'text' },
    { key: 'maxlength', label: 'Max length', type: 'number' },
    { key: 'autocomplete', label: 'Autocomplete', type: 'text', hint: 'HTML autocomplete attribute value' },
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
  ]),
  rendererRef: 'vi-renderer-input',
};

export const TEL_DESCRIPTOR: ComponentDescriptor = {
  type: 'tel',
  label: 'Phone',
  category: 'basic',
  group: 'Basic Info',
  icon: 'phone',
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
  ]),
  supportsRepeating: true,
  rendererRef: 'vi-renderer-input',
};
