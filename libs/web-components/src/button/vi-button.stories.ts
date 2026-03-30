import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vi-button.js';

const meta: Meta = {
  title: 'Components/Button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    disabled: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj;

export const Playground: Story = {
  args: {
    variant: 'primary',
    disabled: false,
    label: 'Action',
  },
  render: (args) => html`
    <vi-button variant=${args.variant} ?disabled=${args.disabled}>${args.label}</vi-button>
  `,
};
