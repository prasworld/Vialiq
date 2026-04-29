import type { Meta, StoryObj } from '@storybook/web-components';
import { html, nothing } from 'lit';
import { checkIcon } from '@vialiq/icons';
import { registerIcons } from '../icons/registry.js';
import '../icons/vi-icon.js';
import './vi-button.js';

// Register icons once at module load time.
registerIcons([checkIcon]);

const meta: Meta = {
  title: 'Components/Button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'success', 'info', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    iconPlacement: {
      name: 'icon-placement',
      control: 'select',
      options: ['none', 'start', 'end'],
      description: 'Slot an icon at the start or end of the label',
    },
    disabled: {
      control: 'boolean',
    },
    iconOnly: {
      name: 'icon-only',
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj;

export const Button: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    iconPlacement: 'none',
    disabled: false,
    iconOnly: false,
    fullWidth: false,
    label: 'Action',
  },
  render: (args) => {
    const placement = args['icon-placement'] ?? args.iconPlacement;
    const showIcon = placement !== 'none' || args.iconOnly;
    
    return html`
      <vi-button
        variant=${args.variant}
        size=${args.size}
        icon-placement=${placement === 'none' ? 'start' : placement}
        ?disabled=${args.disabled}
        ?icon-only=${args.iconOnly}
        ?full-width=${args.fullWidth}
      >
        ${showIcon ? html`<vi-icon slot="icon" name="check"></vi-icon>` : nothing}
        ${args.label}
      </vi-button>
    `;
  },
};

export const IconOnly: Story = {
  name: 'Icon Only',
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    label: 'Confirm', // used as aria-label on the host
  },
  argTypes: {
    // Hide irrelevant knobs for this story
    iconPlacement: { table: { disable: true } },
    fullWidth: { table: { disable: true } },
    iconOnly: { table: { disable: true } },
    label: {
      description: 'Provides the accessible label (aria-label) for screen readers',
    },
  },
  render: (args) => html`
    <vi-button
      variant=${args.variant}
      size=${args.size}
      icon-only
      aria-label=${args.label}
      ?disabled=${args.disabled}
    >
      <vi-icon slot="icon" name="check"></vi-icon>
    </vi-button>
  `,
};
