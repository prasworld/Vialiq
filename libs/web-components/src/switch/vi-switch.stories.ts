import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vi-switch.js';

const meta: Meta = {
  title: 'Components/Switch',
  component: 'vi-switch',
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    labelPlacement: {
      control: 'select',
      options: ['start', 'end'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    checked: false,
    disabled: false,
    size: 'md',
    labelPlacement: 'end',
  },
  render: (args) => html`
    <vi-switch
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      size=${args.size}
      label-placement=${args.labelPlacement}
    >
      Enable email notifications
    </vi-switch>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <vi-switch size="sm">Small (sm)</vi-switch>
      <vi-switch size="md">Medium (md)</vi-switch>
      <vi-switch size="lg">Large (lg)</vi-switch>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <vi-switch disabled>Disabled unchecked</vi-switch>
      <vi-switch disabled checked>Disabled checked</vi-switch>
    </div>
  `,
};

export const Placement: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <vi-switch label-placement="end">Label at end (default)</vi-switch>
      <vi-switch label-placement="start">Label at start</vi-switch>
    </div>
  `,
};

export const WithLabels: Story = {
  render: () => html`
    <vi-switch size="lg">
      <span slot="on-label">ON</span>
      <span slot="off-label">OFF</span>
      Dual Data Entry Required
    </vi-switch>
  `,
};
