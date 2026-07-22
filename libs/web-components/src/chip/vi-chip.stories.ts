import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './vi-chip.js';
import './vi-chip-group.js';
import '../button/vi-button.js';
import '../icons/vi-icon.js';

const meta: Meta = {
  title: 'Components/Chip',
  component: 'vi-chip',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    removable: { control: 'boolean' },
  },
};
export default meta;

export const Default: StoryObj = {
  render: (args) => html`
    <vi-chip
      variant=${ifDefined(args.variant)}
      size=${ifDefined(args.size)}
      ?selected=${args.selected}
      ?disabled=${args.disabled}
      ?removable=${args.removable}
    >
      Status Chip
    </vi-chip>
  `,
  args: {
    variant: 'neutral',
    size: 'md',
    selected: false,
    disabled: false,
    removable: false,
  },
};

export const GroupMulti: StoryObj = {
  render: () => html`
    <vi-chip-group multi>
      <vi-chip value="grade-1">Grade 1</vi-chip>
      <vi-chip value="grade-2">Grade 2</vi-chip>
      <vi-chip value="grade-3" variant="warning">Grade 3</vi-chip>
      <vi-chip value="grade-4" variant="danger">Grade 4</vi-chip>
      <vi-chip value="grade-5" variant="danger">Grade 5</vi-chip>
    </vi-chip-group>
  `,
};

export const GroupSingle: StoryObj = {
  render: () => html`
    <vi-chip-group .multi=${false}>
      <vi-chip value="1" variant="primary">
        <vi-icon slot="icon" name="calendar" size="12"></vi-icon>
        Visit 1
      </vi-chip>
      <vi-chip value="2" variant="primary">
        <vi-icon slot="icon" name="calendar" size="12"></vi-icon>
        Visit 2
      </vi-chip>
    </vi-chip-group>
  `,
};

export const WithAvatar: StoryObj = {
  render: () => html`
    <vi-chip removable>
      <img slot="avatar" src="https://i.pravatar.cc/150?u=1" alt="Avatar">
      John Doe
    </vi-chip>
  `,
};
