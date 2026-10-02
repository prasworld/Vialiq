import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './index.js';

const meta: Meta = {
  title: 'Components/Masked Input',
  component: 'vi-masked-input',
  argTypes: {
    mask: {
      control: 'text',
      description: 'The mask pattern (e.g. "(000) 000-0000")',
    },
    value: {
      control: 'text',
      description: 'The formatted value',
    },
    rawValue: {
      control: 'text',
      description: 'The unmasked raw value',
    },
    label: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
  },
  parameters: {
    actions: {
      handles: ['vi-masked-input-input', 'vi-masked-input-change'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    label: 'Phone Number',
    mask: '(000) 000-0000',
    placeholder: '(555) 555-5555',
  },
  render: (args) => html`
    <vi-masked-input
      label=${ifDefined(args.label)}
      mask=${ifDefined(args.mask)}
      placeholder=${ifDefined(args.placeholder)}
      value=${ifDefined(args.value)}
      ?disabled=${args.disabled}
      ?required=${args.required}
    ></vi-masked-input>
  `,
};

export const SocialSecurity: Story = {
  args: {
    label: 'SSN',
    mask: '000-00-0000',
    placeholder: '___-__-____',
  },
  render: (args) => html`
    <vi-masked-input
      label=${ifDefined(args.label)}
      mask=${ifDefined(args.mask)}
      placeholder=${ifDefined(args.placeholder)}
    ></vi-masked-input>
  `,
};

export const PreFilled: Story = {
  args: {
    label: 'Pre-filled from Raw',
    mask: '(000) 000-0000',
    rawValue: '1234567890',
  },
  render: (args) => html`
    <vi-masked-input
      label=${ifDefined(args.label)}
      mask=${ifDefined(args.mask)}
      raw-value=${ifDefined(args.rawValue)}
    ></vi-masked-input>
  `,
};

export const Alphanumeric: Story = {
  args: {
    label: 'License Key (Alphanumeric)',
    mask: '****-****-****',
    placeholder: 'ABCD-1234-EFGH',
  },
  render: (args) => html`
    <vi-masked-input
      label=${ifDefined(args.label)}
      mask=${ifDefined(args.mask)}
      placeholder=${ifDefined(args.placeholder)}
    ></vi-masked-input>
    <div style="margin-top: 8px; font-size: 14px; color: #666;">
      <strong>Note:</strong> In the mask property, <code>0</code> restricts to
      numbers, <code>a</code> restricts to letters, and <code>*</code> allows
      any alphanumeric character.
    </div>
  `,
};
