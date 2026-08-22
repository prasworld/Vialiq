import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './vi-label.js';
import '../input/vi-input.js';

const meta: Meta = {
  title: 'Components/Label',
  component: 'vi-label',
  tags: ['autodocs'],
  argTypes: {
    for: {
      control: 'text',
      description: 'ID of the associated control',
    },
    required: {
      control: 'boolean',
      description: 'Show required `*` indicator',
    },
    optional: {
      control: 'boolean',
      description: 'Show "(optional)" text',
    },
    disabled: {
      control: 'boolean',
      description: 'Muted disabled styling',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Font size variant',
    },
  },
  args: {
    required: false,
    optional: false,
    disabled: false,
    size: 'md',
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <vi-label
      for="default-input"
      ?required=${args.required}
      ?optional=${args.optional}
      ?disabled=${args.disabled}
      size=${ifDefined(args.size)}
    >
      Label Text
    </vi-label>
    <vi-input id="default-input" ?disabled=${args.disabled}></vi-input>
  `,
};

export const Required: Story = {
  args: {
    required: true,
  },
  render: (args) => html`
    <vi-label
      for="required-input"
      ?required=${args.required}
      ?optional=${args.optional}
      ?disabled=${args.disabled}
      size=${ifDefined(args.size)}
    >
      Subject ID
    </vi-label>
    <vi-input id="required-input" ?disabled=${args.disabled}></vi-input>
  `,
};

export const Optional: Story = {
  args: {
    optional: true,
  },
  render: (args) => html`
    <vi-label
      for="optional-input"
      ?required=${args.required}
      ?optional=${args.optional}
      ?disabled=${args.disabled}
      size=${ifDefined(args.size)}
    >
      Middle Name
    </vi-label>
    <vi-input id="optional-input" ?disabled=${args.disabled}></vi-input>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <vi-label size="sm" for="size-sm">Small Label</vi-label>
        <vi-input size="sm" id="size-sm"></vi-input>
      </div>
      <div>
        <vi-label size="md" for="size-md">Medium Label</vi-label>
        <vi-input size="md" id="size-md"></vi-input>
      </div>
      <div>
        <vi-label size="lg" for="size-lg">Large Label</vi-label>
        <vi-input size="lg" id="size-lg"></vi-input>
      </div>
    </div>
  `,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => html`
    <vi-label
      for="disabled-input"
      ?required=${args.required}
      ?optional=${args.optional}
      ?disabled=${args.disabled}
      size=${ifDefined(args.size)}
    >
      Disabled Label
    </vi-label>
    <vi-input id="disabled-input" ?disabled=${args.disabled}></vi-input>
  `,
};
