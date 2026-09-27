import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../icons/registry.js';
import { userIcon, homeIcon, hospitalIcon, trashIcon, xIcon } from '@vialiq/icons';
import { registerIcons } from '../icons/registry.js';

registerIcons([userIcon, homeIcon, hospitalIcon, trashIcon, xIcon]);

const meta: Meta = {
  title: 'Components/Menu',
  component: 'vi-menu',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => html`
    <vi-menu style="width: 256px;">
      <div class="vi-menu-group-title">Account</div>
      <vi-menu-item value="profile">
        <vi-icon name="user" slot=""></vi-icon>
        Profile
      </vi-menu-item>
      <vi-menu-item value="home">
        <vi-icon name="home" slot=""></vi-icon>
        Dashboard
      </vi-menu-item>
      <vi-menu-item value="hospital">
        <vi-icon name="hospital" slot=""></vi-icon>
        Medical Records
      </vi-menu-item>
      
      <div class="vi-menu-divider"></div>
      
      <div class="vi-menu-group-title">Danger Zone</div>
      <vi-menu-item value="delete" disabled>
        <vi-icon name="trash" slot=""></vi-icon>
        Delete Account
      </vi-menu-item>
      <vi-menu-item value="logout" danger>
        <vi-icon name="x" slot=""></vi-icon>
        Logout
      </vi-menu-item>
    </vi-menu>
  `,
};
