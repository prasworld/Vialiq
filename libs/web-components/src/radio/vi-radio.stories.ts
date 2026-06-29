import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js'; // Registers both vi-radio and vi-radio-group

const meta: Meta = {
  title: 'Components/Radio',
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'Shared name attribute for form submission',
    },
    value: {
      control: 'text',
      description: 'The selected radio button value',
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Layout direction of the group items',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the entire group',
    },
    required: {
      control: 'boolean',
      description: 'Whether a selection is required',
    },
    status: {
      control: 'select',
      options: ['default', 'valid', 'invalid'],
      description: 'Visual validation status of the group',
    },
    validityMessage: {
      name: 'validity-message',
      control: 'text',
      description: 'Error or success message shown below the group',
    },
    allowDblclickClear: {
      name: 'allow-dblclick-clear',
      control: 'boolean',
      description: 'Allows clearing the selected radio button on double click',
    },
  },
  args: {
    name: 'adverseEvent',
    value: 'no',
    orientation: 'vertical',
    disabled: false,
    required: false,
    status: 'default',
    validityMessage: '',
    allowDblclickClear: true,
  },
  render: (args) => {
    // Storybook sets arguments using the custom name key if provided (kebab-case)
    const validityMessage = args['validity-message'] ?? args.validityMessage;
    const allowDblclickClear = args['allow-dblclick-clear'] ?? args.allowDblclickClear;

    return html`
      <vi-radio-group
        name=${args.name}
        .value=${args.value}
        orientation=${args.orientation}
        ?disabled=${args.disabled}
        ?required=${args.required}
        status=${args.status}
        validity-message=${validityMessage}
        ?allow-dblclick-clear=${allowDblclickClear}
      >
        <span slot="label">${args.label ?? 'Was there an adverse event?'}</span>
        ${args.content ?? html`
          <vi-radio value="yes">Yes</vi-radio>
          <vi-radio value="no">No</vi-radio>
          <vi-radio value="unknown">Unknown</vi-radio>
        `}
      </vi-radio-group>
    `;
  },
};

export default meta;
type Story = StoryObj;

export const RadioGroup: Story = {
  name: 'Standard Radio Group',
};

export const Horizontal: Story = {
  name: 'Horizontal Layout',
  args: {
    name: 'severity',
    value: '2',
    orientation: 'horizontal',
    disabled: false,
    label: 'Select Severity Grade:',
    content: html`
      <vi-radio value="1">Mild</vi-radio>
      <vi-radio value="2">Moderate</vi-radio>
      <vi-radio value="3">Severe</vi-radio>
    `,
  },
  argTypes: {
    orientation: { table: { disable: true } },
  },
};

export const Disabled: Story = {
  name: 'Disabled Group',
  args: {
    name: 'gender',
    value: 'female',
    disabled: true,
    label: 'Sex at Birth (Locked):',
    content: html`
      <vi-radio value="male">Male</vi-radio>
      <vi-radio value="female">Female</vi-radio>
      <vi-radio value="unknown">Unknown</vi-radio>
    `,
  },
  argTypes: {
    disabled: { table: { disable: true } },
  },
};

export const InvalidState: Story = {
  name: 'Invalid with Validity Message',
  args: {
    name: 'visitType',
    value: '',
    status: 'invalid',
    validityMessage: 'Selection is required.',
    label: 'Visit Type:',
    content: html`
      <vi-radio value="screening">Screening</vi-radio>
      <vi-radio value="baseline">Baseline</vi-radio>
      <vi-radio value="followup">Follow-up</vi-radio>
    `,
  },
  argTypes: {
    status: { table: { disable: true } },
    validityMessage: { table: { disable: true } },
  },
};

export const DisabledOptions: Story = {
  name: 'Individual Disabled Options',
  args: {
    name: 'paymentMethod',
    value: 'credit-card',
    label: 'Select Payment Method:',
    content: html`
      <vi-radio value="credit-card">Credit Card</vi-radio>
      <vi-radio value="paypal" disabled>PayPal (Under Maintenance)</vi-radio>
      <vi-radio value="apple-pay">Apple Pay</vi-radio>
    `,
  },
};

