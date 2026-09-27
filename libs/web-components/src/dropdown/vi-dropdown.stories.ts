import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../menu/index.js';
import '../button/index.js';
import { userIcon, xIcon, homeIcon } from '@vialiq/icons';
import { registerIcons } from '../icons/registry.js';

registerIcons([userIcon, xIcon, homeIcon]);

const meta: Meta = {
  title: 'Components/Dropdown',
  component: 'vi-dropdown',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'right'],
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover', 'focus'],
    },
  },
};

export default meta;

export const Default: StoryObj = {
  args: {
    placement: 'bottom-start',
    trigger: 'click',
  },
  render: (args) => html`
    <vi-dropdown placement=${args.placement} trigger=${args.trigger}>
      <vi-button>Click Me</vi-button>
      
      <vi-menu slot="content" style="width: 200px;">
        <vi-menu-item value="profile">
          <vi-icon name="user" slot=""></vi-icon>
          Profile
        </vi-menu-item>
        <vi-menu-item value="dashboard">
          <vi-icon name="home" slot=""></vi-icon>
          Dashboard
        </vi-menu-item>
        <div class="vi-menu-divider"></div>
        <vi-menu-item value="logout" danger>
          <vi-icon name="x" slot=""></vi-icon>
          Logout
        </vi-menu-item>
      </vi-menu>
    </vi-dropdown>
  `,
};

