import type { SettingsSchema, SettingsTab, SettingsField } from '../types/component-descriptor';
import type { BaseComponentSchema } from '../types/component-schemas';

/**
 * Returns true if the schema has a `required` validation rule configured.
 * Used by canvasProps() across all input descriptors to reflect the `required`
 * attribute on the web component — providing an accurate canvas preview.
 */
export function hasRequiredRule(schema: BaseComponentSchema): boolean {
  return schema.validation?.some((r) => r.descriptor.type === 'required') ?? false;
}

/** Reusable size settings field for controls that support the size scale (xs/sm/md/lg). */
export const sizeField: SettingsField = {
  key: 'size',
  label: 'Size',
  type: 'select',
  options: [
    { label: 'Extra small', value: 'xs' },
    { label: 'Small', value: 'sm' },
    { label: 'Medium (default)', value: 'md' },
    { label: 'Large', value: 'lg' },
  ],
  defaultValue: 'md',
};

/** Reusable full-width toggle for button-like controls. */
export const fullWidthField: SettingsField = {
  key: 'fullWidth',
  label: 'Full width',
  type: 'boolean',
  hint: 'Stretch to fill the container',
};

export interface DisplayTabOptions {
  hideLabel?: boolean;
  labelRequired?: boolean;
  hideDescription?: boolean;
  hideLabelPosition?: boolean;
}

/** Standard "Display" tab — label, description, placeholder, labelPosition */
export function displayTab(extras: SettingsField[] = [], options: DisplayTabOptions = {}): SettingsTab {
  const fields: SettingsField[] = [];

  if (!options.hideLabel) {
    fields.push({
      key: 'label',
      label: 'Label',
      type: 'label',
      required: options.labelRequired ?? true,
    });
  }

  if (!options.hideDescription) {
    fields.push({
      key: 'description',
      label: 'Description / Help text',
      type: 'text',
      placeholder: 'Optional hint shown below the field',
    });
  }

  if (!options.hideLabelPosition) {
    fields.push({
      key: 'labelPosition',
      label: 'Label position',
      type: 'select',
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Left', value: 'left' },
        { label: 'Hidden', value: 'hidden' },
      ],
      defaultValue: 'top',
    });
  }

  fields.push(...extras);

  return {
    id: 'display',
    label: 'Display',
    fields,
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
export function standardSettings(displayExtras: SettingsField[] = [], dataExtras: SettingsField[] = [], displayOptions: DisplayTabOptions = {}): SettingsSchema {
  return {
    tabs: [
      displayTab(displayExtras, displayOptions),
      dataTab(dataExtras),
    ].filter(Boolean) as SettingsTab[],
  };
}
