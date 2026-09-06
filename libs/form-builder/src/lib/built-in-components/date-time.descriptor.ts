import type { ComponentDescriptor } from '../types/component-descriptor';
import type { DateComponentSchema } from '../types/component-schemas';
import { standardSettings } from './settings-helpers';

function dateCanvasProps(schema: DateComponentSchema): Record<string, unknown> {
  return {
    type: schema.type,
    value: schema.defaultValue ?? null,
    min: schema.min ?? null,
    max: schema.max ?? null,
    step: schema.step ?? null,
    readonly: schema.readOnly ?? null,
  };
}

const dateDataExtras = [
  { key: 'min', label: 'Min date/time', type: 'text' as const, hint: 'ISO-8601 format' },
  { key: 'max', label: 'Max date/time', type: 'text' as const, hint: 'ISO-8601 format' },
  { key: 'step', label: 'Step', type: 'number' as const },
];

export const DATE_DESCRIPTOR: ComponentDescriptor = {
  type: 'date',
  label: 'Date',
  category: 'advanced',
  group: 'Text Inputs',
  icon: 'calendar',
  weight: 30,
  canvasElement: 'vi-date-picker',
  canvasProps: (s) => dateCanvasProps(s as DateComponentSchema),
  defaultSchema: {
    type: 'date',
    label: 'Date',
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
  weight: 40,
  canvasElement: 'vi-date-picker',
  canvasProps: (s) => dateCanvasProps(s as DateComponentSchema),
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
  weight: 50,
  canvasElement: 'vi-date-picker',
  canvasProps: (s) => dateCanvasProps(s as DateComponentSchema),
  defaultSchema: {
    type: 'datetime-local',
    label: 'Date & Time',
  },
  settingsSchema: standardSettings([], dateDataExtras),
  supportsRepeating: true,
  rendererRef: 'vi-renderer-date',
};
