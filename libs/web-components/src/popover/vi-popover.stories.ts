import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vi-popover.js';
import '../button/vi-button.js';
import '../switch/vi-switch.js';

const meta: Meta = {
  title: 'Feedback/Popover',
  component: 'vi-popover',
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover', 'focus'],
    },
    title: { control: 'text' },
    content: { control: 'text' },
    open: { control: 'boolean' },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Default: StoryObj = {
  args: {
    placement: 'bottom',
    trigger: 'click',
    title: 'Settings',
  },
  render: (args) => html`
    <vi-popover
      placement=${args.placement}
      trigger=${args.trigger}
      title=${args.title}
      ?open=${args.open}
    >
      <vi-button>Click Me</vi-button>
      <div
        slot="content"
        style="display: flex; flex-direction: column; gap: 8px;"
      >
        <vi-switch label="Enable notifications"></vi-switch>
        <vi-switch label="Dark mode"></vi-switch>
      </div>
    </vi-popover>
  `,
};

export const HoverTrigger: StoryObj = {
  args: {
    placement: 'right',
    trigger: 'hover',
    title: 'Hover Info',
    content: 'This popover opens on hover instead of click.',
  },
  render: (args) => html`
    <vi-popover
      placement=${args.placement}
      trigger=${args.trigger}
      title=${args.title}
      content=${args.content}
    >
      <vi-button variant="secondary">Hover Me</vi-button>
    </vi-popover>
  `,
};
