/**
 * Shared helper for building consistent SettingsSchema tabs.
 * Used by all built-in descriptors.
 */
import type { SettingsSchema, SettingsTab, SettingsField } from '../types/component-descriptor';

/** Standard "Display" tab — label, description, placeholder, labelPosition */
export function displayTab(extras: SettingsField[] = []): SettingsTab {
  return {
    id: 'display',
    label: 'Display',
    fields: [
      {
        key: 'label',
        label: 'Label',
        type: 'label',
        required: true,
      },
      {
        key: 'description',
        label: 'Description / Help text',
        type: 'text',
        placeholder: 'Optional hint shown below the field',
      },
      {
        key: 'labelPosition',
        label: 'Label position',
        type: 'select',
        options: [
          { label: 'Top', value: 'top' },
          { label: 'Left', value: 'left' },
          { label: 'Right', value: 'right' },
          { label: 'Hidden', value: 'hidden' },
        ],
        defaultValue: 'top',
      },
      ...extras,
    ],
  };
}

/** Standard "Data" tab — key, defaultValue, readOnly, hidden */
export function dataTab(extras: SettingsField[] = []): SettingsTab {
  return {
    id: 'data',
    label: 'Data',
    fields: [
      {
        key: 'key',
        label: 'Field key',
        type: 'key',
        required: true,
        hint: 'Unique camelCase identifier used in form data and conditionals',
      },
      ...extras,
      {
        key: 'defaultValue',
        label: 'Default value',
        type: 'text',
      },
      {
        key: 'readOnly',
        label: 'Read-only',
        type: 'boolean',
        hint: 'Renders as plain text. Not the same as disabled.',
      },
      {
        key: 'hidden',
        label: 'Hidden',
        type: 'boolean',
      },
    ],
  };
}

/** Standard "Validation" tab */
export function validationTab(): SettingsTab | null {
  // TODO(Phase X): ValidationRulesEditorComponent handles this via custom type.
  return null;
}

/** Standard "Logic" tab — conditional visibility */
export function logicTab(): SettingsTab | null {
  // TODO(Phase X): ConditionalLogicEditorComponent handles this via custom type.
  return null;
}

/** Convenience: build a standard 4-tab settings schema */
export function standardSettings(displayExtras: SettingsField[] = [], dataExtras: SettingsField[] = []): SettingsSchema {
  return {
    tabs: [
      displayTab(displayExtras),
      dataTab(dataExtras),
    ].filter(Boolean) as SettingsTab[],
  };
}
