import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js'; // Registers vi-checkbox

const meta: Meta = {
  title: 'Components/Checkbox',
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Checked state of the checkbox',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Indeterminate (partial) state of the checkbox',
    },
    value: {
      control: 'text',
      description: 'Form submission value when checked',
    },
    name: {
      control: 'text',
      description: 'Form field name',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the checkbox',
    },
    required: {
      control: 'boolean',
      description: 'Marks the field as required',
    },
    status: {
      control: 'select',
      options: ['default', 'valid', 'invalid'],
      description: 'Validation state',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Size scale of the checkbox',
    },
    label: {
      control: 'text',
      description: 'Label text content',
    },
  },
  args: {
    checked: false,
    indeterminate: false,
    value: 'on',
    name: 'checkbox-field',
    disabled: false,
    required: false,
    status: 'default',
    size: 'md',
    label: 'I confirm the subject has provided written informed consent.',
  },
  render: (args) => {
    return html`
      <vi-checkbox
        ?checked=${args.checked}
        ?indeterminate=${args.indeterminate}
        .value=${args.value}
        .name=${args.name}
        ?disabled=${args.disabled}
        ?required=${args.required}
        status=${args.status}
        size=${args.size}
      >
        ${args.label}
      </vi-checkbox>
    `;
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Standard Checkbox',
};

export const Checked: Story = {
  name: 'Checked State',
  args: {
    checked: true,
  },
};

export const Indeterminate: Story = {
  name: 'Indeterminate State',
  args: {
    indeterminate: true,
  },
};

export const Disabled: Story = {
  name: 'Disabled State',
  args: {
    disabled: true,
  },
};

export const RequiredAndInvalid: Story = {
  name: 'Required (Invalid State)',
  args: {
    required: true,
    status: 'invalid',
  },
};

export const Sizes: Story = {
  name: 'Checkbox Sizes',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <vi-checkbox size="xs">Extra Small (xs)</vi-checkbox>
      <vi-checkbox size="sm">Small (sm)</vi-checkbox>
      <vi-checkbox size="md">Medium (md - default)</vi-checkbox>
      <vi-checkbox size="lg">Large (lg)</vi-checkbox>
    </div>
  `,
};

/**
 * The checkbox box stays top-aligned with the first line of text when the
 * label wraps to multiple lines. These are representative clinical EDC labels.
 */
export const LongLabel: Story = {
  name: 'Long / Wrapping Label',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; max-width: 380px;">
      <vi-checkbox>
        I confirm that the subject has provided written informed consent prior to any study-related procedures.
      </vi-checkbox>
      <vi-checkbox checked>
        I acknowledge that this deviation from the protocol has been reviewed and documented in the site's deviation log.
      </vi-checkbox>
      <vi-checkbox size="sm">
        Concomitant medication reported and confirmed within the 30-day retrospective window.
      </vi-checkbox>
      <vi-checkbox size="lg">
        All data fields have been verified against source documents and are accurate to the best of my knowledge.
      </vi-checkbox>
    </div>
  `,
};
