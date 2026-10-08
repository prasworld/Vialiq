import type { ComponentDescriptor } from '../types/component-descriptor';
import type { DateComponentSchema } from '../types/component-schemas';
import { standardSettings, hasRequiredRule } from './settings-helpers';

function dateCanvasProps(schema: DateComponentSchema): Record<string, unknown> {
  return {
    value: schema.defaultValue ?? null,
    min: schema.min ?? null,
    max: schema.max ?? null,
    step: schema.step ?? null,
    required: hasRequiredRule(schema) || null,
    readonly: schema.readOnly ?? null,
    placeholder: schema.placeholder || '',
  };
}

const dateDataExtras = [
  { key: 'placeholder', label: 'Placeholder / Format', type: 'text' as const, hint: 'e.g. YYYY-MM-DD' },
  { key: 'min', label: 'Min date/time', type: 'text' as const, hint: 'ISO-8601 format' },
  { key: 'max', label: 'Max date/time', type: 'text' as const, hint: 'ISO-8601 format' },
  { key: 'step', label: 'Step', type: 'number' as const },
  {
    key: 'valueMapping',
    label: 'Submit value as',
    type: 'select' as const,
    hint: 'Which representation is sent in the form payload on submit',
    options: [
      { label: 'Formatted value (ISO default)', value: 'value' },
      { label: 'Raw / structured object', value: 'rawValue' },
      { label: 'Display value (locale)', value: 'displayValue' },
    ],
    defaultValue: 'value',
  },
];

export const DATE_DESCRIPTOR: ComponentDescriptor = {
  type: 'date',
  label: 'Date',
  category: 'advanced',
  group: 'Text Inputs',
  icon: 'calendar',
  traits: { isInput: true },
  weight: 30,
  canvasElement: 'vi-date-picker-input',
  canvasProps: (s) => dateCanvasProps(s as DateComponentSchema),
  defaultSchema: {
    type: 'date',
    label: 'Date',
    placeholder: 'YYYY-MM-DD',
  },
  settingsSchema: standardSettings([], dateDataExtras),
  supportsRepeating: true,
  rendererRef: 'vi-renderer-date',
};

export const TIME_DESCRIPTOR: ComponentDescriptor = {
  type: 'time',
  label: 'Time',
  category: 'advanced',
  group: 'Text Inputs',
  icon: 'clock',
  traits: { isInput: true },
  weight: 40,
  canvasElement: 'input',
  canvasProps: (s) => {
    const props = dateCanvasProps(s as DateComponentSchema);
    return { ...props, type: 'time' };
  },
  defaultSchema: {
    type: 'time',
    label: 'Time',
  },
  settingsSchema: standardSettings([], dateDataExtras),
  supportsRepeating: true,
  rendererRef: 'vi-renderer-date',
};

export const DATETIME_LOCAL_DESCRIPTOR: ComponentDescriptor = {
  type: 'datetime-local',
  label: 'Date & Time',
  category: 'advanced',
  group: 'Text Inputs',
  icon: 'calendar-clock',
  traits: { isInput: true },
  weight: 50,
  canvasElement: 'input',
  canvasProps: (s) => {
    const props = dateCanvasProps(s as DateComponentSchema);
    return { ...props, type: 'datetime-local' };
  },
  defaultSchema: {
    type: 'datetime-local',
    label: 'Date & Time',
  },
  settingsSchema: standardSettings([], dateDataExtras),
  supportsRepeating: true,
  rendererRef: 'vi-renderer-date',
};
