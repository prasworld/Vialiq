import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js'; // Registers vi-tooltip
import '../button/vi-button.js'; // Registers vi-button
import '../icons/vi-icon.js'; // Registers vi-icon

const meta: Meta = {
  title: 'Components/Tooltip',
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'Tooltip text (alternative to content slot)',
    },
    placement: {
      control: 'select',
      options: [
        'top', 'top-start', 'top-end',
        'bottom', 'bottom-start', 'bottom-end',
        'left', 'right'
      ],
      description: 'Preferred position of the tooltip relative to its trigger',
    },
    trigger: {
      control: 'select',
      options: ['hover focus', 'hover', 'focus', 'click'],
      description: 'Events that show the tooltip',
    },
    delay: {
      control: 'number',
      description: 'Show delay in milliseconds',
    },
    hideDelay: {
      control: 'number',
      name: 'hide-delay',
      description: 'Hide delay in milliseconds',
    },
    maxWidth: {
      control: 'number',
      name: 'max-width',
      description: 'Max width of the tooltip in pixels',
    },
    disabled: {
      control: 'boolean',
      description: 'Suppresses display of the tooltip',
    },
  },
  args: {
    content: 'Informed Consent Form — signed before first visit.',
    placement: 'top',
    trigger: 'hover focus',
    delay: 300,
    hideDelay: 100,
    maxWidth: 240,
    disabled: false,
  },
  render: (args) => {
    return html`
      <div style="padding: 100px; display: flex; justify-content: center; align-items: center;">
        <vi-tooltip
          .content=${args.content}
          .placement=${args.placement}
          .trigger=${args.trigger}
          .delay=${args.delay}
          .hideDelay=${args.hideDelay}
          .maxWidth=${args.maxWidth}
          ?disabled=${args.disabled}
        >
          <vi-button>Hover or Focus Me</vi-button>
        </vi-tooltip>
      </div>
    `;
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const RichContent: Story = {
  render: (args) => html`
    <div style="padding: 100px; display: flex; justify-content: center; align-items: center;">
      <vi-tooltip
        .placement=${args.placement}
        .trigger=${args.trigger}
        .delay=${args.delay}
        .hideDelay=${args.hideDelay}
        .maxWidth=${args.maxWidth}
        ?disabled=${args.disabled}
      >
        <vi-button variant="ghost" size="sm">
          Grade Info
        </vi-button>
        <div slot="content">
          Grade per NCI CTCAE v5.0.
          <a href="https://ctep.cancer.gov/protocoldevelopment/electronic_applications/ctc.htm" target="_blank" style="color: #64b5f6; text-decoration: underline;">
            View criteria
          </a>
        </div>
      </vi-tooltip>
    </div>
  `,
};

export const Placements: Story = {
  render: (args) => html`
    <div style="padding: 120px; display: grid; grid-template-columns: repeat(3, 160px); gap: 40px; justify-content: center; justify-items: center; align-items: center;">
      <div></div>
      <vi-tooltip content="Top placement" placement="top" .delay=${args.delay}>
        <vi-button size="sm">Top</vi-button>
      </vi-tooltip>
      <div></div>

      <vi-tooltip content="Left placement" placement="left" .delay=${args.delay}>
        <vi-button size="sm">Left</vi-button>
      </vi-tooltip>
      <div style="font-size: 11px; color: #888; text-align: center;">Placements Grid</div>
      <vi-tooltip content="Right placement" placement="right" .delay=${args.delay}>
        <vi-button size="sm">Right</vi-button>
      </vi-tooltip>

      <div></div>
      <vi-tooltip content="Bottom placement" placement="bottom" .delay=${args.delay}>
        <vi-button size="sm">Bottom</vi-button>
      </vi-tooltip>
      <div></div>
    </div>
  `,
};

export const ClickTrigger: Story = {
  args: {
    trigger: 'click',
    content: 'This tooltip is shown only when you click the button.',
  },
};
