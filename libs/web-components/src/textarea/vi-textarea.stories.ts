import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { ControlStatus } from '../base/validity-mixin.js';
import type { TextareaResize } from './vi-textarea.js';
import './index.js'; // Registers vi-textarea

const meta: Meta<TextareaArgs> = {
  title: 'Components/Textarea',
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    value: {
      control: 'text',
      description: 'Current text value',
    },
    rows: {
      control: 'number',
      description: 'Initial visible rows',
    },
    maxlength: {
      control: 'number',
      description: 'Maximum characters allowed',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the textarea',
    },
    required: {
      control: 'boolean',
      description: 'Marks field as required',
    },
    readonly: {
      control: 'boolean',
      description: 'Marks input as read-only',
    },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'both'],
      description: 'Resize orientation axis',
    },
    status: {
      control: 'select',
      options: ['default', 'valid', 'invalid'],
      description: 'Validation state',
    },
    validityMessage: {
      control: 'text',
      description: 'Validation message shown below input',
    },
    charCount: {
      control: 'boolean',
      description: 'Show character counter (requires maxlength)',
    },
  },
};

export default meta;
type Story = StoryObj<TextareaArgs>;

interface TextareaArgs {
  placeholder: string;
  value: string;
  rows: number;
  maxlength: number | null;
  disabled: boolean;
  required: boolean;
  readonly: boolean;
  resize: TextareaResize;
  status: ControlStatus;
  validityMessage: string;
  charCount: boolean;
}

const renderTextarea = ({
  placeholder,
  value,
  rows,
  maxlength,
  disabled,
  required,
  readonly,
  resize,
  status,
  validityMessage,
  charCount,
}: TextareaArgs) => html`
  <vi-textarea
    placeholder=${placeholder}
    .value=${value}
    .rows=${rows}
    .maxlength=${maxlength}
    ?disabled=${disabled}
    ?required=${required}
    ?readonly=${readonly}
    resize=${resize}
    status=${status}
    validity-message=${validityMessage}
    ?char-count=${charCount}
  >
    <span slot="helper">Please enter detailed notes</span>
  </vi-textarea>
`;

export const Default: Story = {
  name: 'Default Textarea',
  args: {
    placeholder: 'Enter notes here…',
    value: '',
    rows: 3,
    maxlength: null,
    disabled: false,
    required: false,
    readonly: false,
    resize: 'vertical',
    status: 'default',
    validityMessage: '',
    charCount: false,
  },
  render: renderTextarea,
};

export const CharacterCounter: Story = {
  name: 'With Character Counter',
  args: {
    placeholder: 'Limit to 100 characters…',
    value: 'Some default text',
    rows: 4,
    maxlength: 100,
    disabled: false,
    required: false,
    readonly: false,
    resize: 'vertical',
    status: 'default',
    validityMessage: '',
    charCount: true,
  },
  render: renderTextarea,
};

export const ValidationInvalid: Story = {
  name: 'Invalid Validation State',
  args: {
    placeholder: 'Required field…',
    value: '',
    rows: 3,
    maxlength: null,
    disabled: false,
    required: true,
    readonly: false,
    resize: 'vertical',
    status: 'invalid',
    validityMessage: 'Explanation text is required.',
    charCount: false,
  },
  render: renderTextarea,
};
