import type { ComponentDescriptor, SettingsTab } from '../types/component-descriptor';
import type {
  HiddenComponentSchema,
  ContentComponentSchema,
  ButtonComponentSchema,
} from '../types/component-schemas';
import { displayTab, logicTab, sizeField, fullWidthField } from './settings-helpers';

export const HIDDEN_DESCRIPTOR: ComponentDescriptor = {
  type: 'hidden',
  label: 'Hidden',
  category: 'advanced',
  group: 'Utilities',
  icon: 'eye-off',
  traits: { isInput: true },
  weight: 60,
  canvasElement: 'div',  // rendered as a placeholder badge on canvas
  canvasProps: (s) => {
    const schema = s as HiddenComponentSchema;
    return { 'data-key': schema.key ?? '', 'data-value': schema.defaultValue ?? '' };
  },
  defaultSchema: {
    type: 'hidden',
    label: 'Hidden Field',
    hidden: true,
  },
  settingsSchema: {
    tabs: [
      {
        id: 'data',
        label: 'Data',
        fields: [
          { key: 'key', label: 'Field key', type: 'key', required: true },
          { key: 'defaultValue', label: 'Value', type: 'text' },
        ],
      },
    ],
  },
  rendererRef: 'vi-renderer-input',
};

export const CONTENT_DESCRIPTOR: ComponentDescriptor = {
  type: 'content',
  label: 'Content',
  category: 'advanced',
  group: 'Utilities',
  icon: 'file-text',
  traits: { isDisplayOnly: true },
  weight: 70,
  canvasElement: 'div',
  canvasProps: (s) => {
    const schema = s as ContentComponentSchema;
    return { htmlContent: schema.content ?? '<p>Content block</p>' };
  },
  defaultSchema: {
    type: 'content',
    label: 'Content',
    content: '<p>Add your HTML content here.</p>',
  },
  settingsSchema: {
    tabs: [
      displayTab([], { labelRequired: false }),
      {
        id: 'data',
        label: 'Content',
        fields: [
          { key: 'content', label: 'HTML content', type: 'code', hint: 'Sanitized HTML rendered inside the form' },
        ],
      },
      logicTab(),
    ].filter(Boolean) as SettingsTab[],
  },
};

export const DIVIDER_DESCRIPTOR: ComponentDescriptor = {
  type: 'divider',
  label: 'Divider',
  category: 'advanced',
  group: 'Utilities',
  icon: 'separator',
  traits: { isDisplayOnly: true },
  weight: 80,
  canvasElement: 'hr',
  canvasProps: () => ({ class: 'vi-divider' }),
  defaultSchema: {
    type: 'divider',
    label: 'Divider',
  },
  settingsSchema: {
    tabs: [
      logicTab(),
    ].filter(Boolean) as SettingsTab[],
  },
};

export const BUTTON_DESCRIPTOR: ComponentDescriptor = {
  type: 'button',
  label: 'Button',
  category: 'advanced',
  group: 'Utilities',
  icon: 'square',
  traits: { isDisplayOnly: true }, // Buttons do not have CDISC SDTM metadata
  weight: 90,
  canvasElement: 'vi-button',
  canvasProps: (s) => {
    const schema = s as ButtonComponentSchema;
    return {
      variant: schema.variant ?? 'secondary',
      size: schema.size ?? null,
      'full-width': schema.fullWidth ? '' : null,
      // htmlContent renders the button label text inside the vi-button slot
      htmlContent: schema.buttonLabel || 'Click me',
    };
  },
  defaultSchema: {
    type: 'button',
    label: 'Button',
    buttonLabel: 'Click me',
    variant: 'secondary',
    action: 'custom',
  },
  settingsSchema: {
    tabs: [
      {
        id: 'display',
        label: 'Display',
        fields: [
          { key: 'label', label: 'Label', type: 'label' },
          { key: 'buttonLabel', label: 'Button text', type: 'text' },
          {
            key: 'variant',
            label: 'Variant',
            type: 'select',
            options: [
              { label: 'Primary', value: 'primary' },
              { label: 'Secondary', value: 'secondary' },
              { label: 'Danger', value: 'danger' },
              { label: 'Ghost', value: 'ghost' },
            ],
          },
          sizeField,
          fullWidthField,
        ],
      },
      {
        id: 'action',
        label: 'Action',
        fields: [
          {
            key: 'action',
            label: 'On click',
            type: 'select',
            options: [
              { label: 'Custom', value: 'custom' },
              { label: 'Reset form', value: 'reset' },
              { label: 'Save draft', value: 'saveState' },
            ],
          },
        ],
      },
      logicTab(),
    ].filter(Boolean) as SettingsTab[],
  },
};

export const SUBMIT_DESCRIPTOR: ComponentDescriptor = {
  type: 'submit',
  label: 'Submit',
  category: 'advanced',
  group: 'Utilities',
  icon: 'send',
  traits: { isDisplayOnly: true },
  weight: 100,
  canvasElement: 'vi-button',
  canvasProps: (s) => {
    const schema = s as ButtonComponentSchema;
    return {
      variant: schema.variant ?? 'primary',
      type: 'submit',
      size: schema.size ?? null,
      'full-width': schema.fullWidth ? '' : null,
      // htmlContent renders the button label text inside the vi-button slot
      htmlContent: schema.buttonLabel || 'Submit',
    };
  },
  defaultSchema: {
    type: 'submit',
    label: 'Submit',
    buttonLabel: 'Submit',
    variant: 'primary',
    action: 'submit',
  },
  settingsSchema: {
    tabs: [
      {
        id: 'display',
        label: 'Display',
        fields: [
          { key: 'label', label: 'Label', type: 'label' },
          { key: 'buttonLabel', label: 'Button text', type: 'text' },
          {
            key: 'variant',
            label: 'Variant',
            type: 'select',
            options: [
              { label: 'Primary', value: 'primary' },
              { label: 'Secondary', value: 'secondary' },
            ],
          },
          sizeField,
          fullWidthField,
        ],
      },
      logicTab(),
    ].filter(Boolean) as SettingsTab[],
  },
};
