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
    layout: {
      control: 'select',
      options: ['stacked', 'inline'],
      description: 'Layout spacing behavior',
    },
    type: {
      control: 'select',
      options: ['default', 'primary', 'secondary'],
      description: 'Semantic text color',
    },
  },
  args: {
    required: false,
    optional: false,
    disabled: false,
    size: 'md',
    layout: 'stacked',
    type: 'default',
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
      layout=${ifDefined(args.layout)}
      type=${ifDefined(args.type)}
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
      layout=${ifDefined(args.layout)}
      type=${ifDefined(args.type)}
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
      layout=${ifDefined(args.layout)}
      type=${ifDefined(args.type)}
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
      layout=${ifDefined(args.layout)}
      type=${ifDefined(args.type)}
    >
      Disabled Label
    </vi-label>
  `,
};

export const LayoutInline: Story = {
  args: {
    layout: 'inline',
  },
  render: (args) => html`
    <div style="display: flex; align-items: center;">
      <vi-label
        for="inline-input"
        ?required=${args.required}
        ?optional=${args.optional}
        ?disabled=${args.disabled}
        size=${ifDefined(args.size)}
        layout=${ifDefined(args.layout)}
        type=${ifDefined(args.type)}
      >
        Inline Label
      </vi-label>
      <vi-input id="inline-input" ?disabled=${args.disabled}></vi-input>
    </div>
  `,
};

export const SemanticTypes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div>
        <vi-label type="default" for="type-default">Default Label</vi-label>
        <vi-input id="type-default"></vi-input>
      </div>
      <div>
        <vi-label type="primary" for="type-primary">Primary Label</vi-label>
        <vi-input id="type-primary"></vi-input>
      </div>
      <div>
        <vi-label type="secondary" for="type-secondary">Secondary Label</vi-label>
        <vi-input id="type-secondary"></vi-input>
      </div>
    </div>
  `,
};
