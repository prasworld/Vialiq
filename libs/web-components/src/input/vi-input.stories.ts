import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { ControlStatus } from '../base/validity-mixin.js';
import './vi-input.js';
import '../button/vi-button.js';

const meta: Meta<InputArgs> = {
  title: 'Components/Input',
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'tel', 'url', 'number'],
      description: 'Input type attribute',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    value: {
      control: 'text',
      description: 'Current input value',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the input',
    },
    required: {
      control: 'boolean',
      description: 'Marks input as required',
    },
    status: {
      control: 'select',
      options: ['default', 'valid', 'invalid'],
      description: "Visual state: 'default' (neutral), 'valid' (green), 'invalid' (red)",
    },
    validityMessage: {
      control: 'text',
      description: 'Validation message — colour is derived from status',
    },
    name: {
      control: 'text',
      description: 'Input name attribute',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Size scale of the input',
    },
  },
};

export default meta;
type Story = StoryObj<InputArgs>;

interface InputArgs {
  type: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  required: boolean;
  status: ControlStatus;
  validityMessage: string;
  name: string;
  size: string;
}

const renderInput = ({ type, placeholder, value, disabled, required, status, validityMessage, name, size }: InputArgs) => html`
  <vi-input
    type=${type}
    placeholder=${placeholder}
    .value=${value}
    ?disabled=${disabled}
    ?required=${required}
    status=${status}
    .validityMessage=${validityMessage}
    name=${name}
    size=${size}
  ></vi-input>
`;

export const Text: Story = {
  name: 'Text Input',
  args: {
    type: 'text',
    placeholder: 'Enter text…',
    value: '',
    disabled: false,
    required: false,
    status: 'default',
    validityMessage: '',
    name: 'text',
    size: 'md',
  },
  render: renderInput,
};

export const TabNavigation: Story = {
  name: 'Tab Navigation (Custom Order)',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates that mixed interactive components respect custom `tabindex` values explicitly applied to their host elements, navigating out of DOM order.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 320px; padding: 1.5rem; border: 1px dashed #ccc; border-radius: 4px;">
      <p style="margin: 0; font-size: 0.875rem; color: #666; font-family: sans-serif;">
        Press <strong>Tab</strong> to cycle focus. Order: First → Second → Third → Fourth.
      </p>
      <vi-input tabindex="3" placeholder="Third (tabindex=3)"></vi-input>
      <vi-button tabindex="1">First (tabindex=1)</vi-button>
      <vi-input tabindex="4" placeholder="Fourth (tabindex=4)"></vi-input>
      <vi-button tabindex="2" variant="secondary">Second (tabindex=2)</vi-button>
      <vi-button disabled tabindex="5">Disabled (skipped)</vi-button>
    </div>
  `,
};
export const Email: Story = {
  name: 'Email Input',
  args: {
    type: 'email',
    placeholder: 'your.email@example.com',
    value: '',
    disabled: false,
    required: true,
    status: 'default',
    validityMessage: '',
    name: 'email',
  },
  render: renderInput,
};

export const Password: Story = {
  name: 'Password Input',
  args: {
    type: 'password',
    placeholder: 'Enter password…',
    value: '',
    disabled: false,
    required: true,
    status: 'default',
    validityMessage: '',
    name: 'password',
  },
  render: renderInput,
};

export const WithHelper: Story = {
  name: 'With Helper Text',
  args: {
    type: 'text',
    placeholder: 'Enter username…',
    value: '',
    disabled: false,
    required: true,
    status: 'default',
    validityMessage: '',
    name: 'username',
  },
  render: ({ type, placeholder, value, disabled, required, status, validityMessage, name }: InputArgs) => html`
    <vi-input
      type=${type}
      placeholder=${placeholder}
      .value=${value}
      ?disabled=${disabled}
      ?required=${required}
      status=${status}
      .validityMessage=${validityMessage}
      name=${name}
    >
      <span slot="helper">Must be 3–20 characters</span>
    </vi-input>
  `,
};

export const Invalid: Story = {
  name: 'Invalid State',
  args: {
    type: 'email',
    placeholder: 'your.email@example.com',
    value: 'not-an-email',
    disabled: false,
    required: true,
    status: 'invalid',
    validityMessage: 'Please enter a valid email address',
    name: 'email',
  },
  render: renderInput,
};

export const Valid: Story = {
  name: 'Valid State',
  args: {
    type: 'email',
    placeholder: 'your.email@example.com',
    value: 'user@example.com',
    disabled: false,
    required: true,
    status: 'valid',
    validityMessage: 'Looks good!',
    name: 'email',
  },
  render: renderInput,
};

export const Disabled: Story = {
  name: 'Disabled Input',
  args: {
    type: 'text',
    placeholder: 'Cannot edit',
    value: 'Preset value',
    disabled: true,
    required: false,
    status: 'default',
    validityMessage: '',
    name: 'disabled',
  },
  render: renderInput,
};

export const Number: Story = {
  name: 'Number Input',
  args: {
    type: 'number',
    placeholder: '0',
    value: '',
    disabled: false,
    required: true,
    status: 'default',
    validityMessage: '',
    name: 'quantity',
  },
  render: renderInput,
};

export const Search: Story = {
  name: 'Search Input',
  args: {
    type: 'search',
    placeholder: 'Search…',
    value: '',
    disabled: false,
    required: false,
    status: 'default',
    validityMessage: '',
    name: 'search',
    size: 'md',
  },
  render: renderInput,
};

export const Sizes: Story = {
  name: 'Input Sizes',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; width: 300px;">
      <vi-input size="xs" placeholder="Extra Small (xs)"></vi-input>
      <vi-input size="sm" placeholder="Small (sm)"></vi-input>
      <vi-input size="md" placeholder="Medium (md - default)"></vi-input>
      <vi-input size="lg" placeholder="Large (lg)"></vi-input>
    </div>
  `,
};

