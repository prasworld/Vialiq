import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../menu/index.js';

const meta: Meta = {
  title: 'Components/Context Menu',
  component: 'vi-context-menu',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => html`
    <vi-context-menu>
      <div 
        style="width: 300px; height: 150px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; border-radius: 8px; user-select: none;"
      >
        Right click inside here
      </div>
      
      <vi-menu slot="content" style="width: 200px;">
        <vi-menu-item value="copy">
          Copy
        </vi-menu-item>
        <vi-menu-item value="paste">
          Paste
        </vi-menu-item>
        <div class="vi-menu-divider"></div>
        <vi-menu-item value="delete" danger>
          Delete
        </vi-menu-item>
      </vi-menu>
    </vi-context-menu>
  `,
};

export const CustomPanel: StoryObj = {
  render: () => html`
    <vi-popover trigger="contextmenu">
      <div 
        style="width: 300px; height: 150px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; border-radius: 8px; user-select: none;"
      >
        Right click for custom panel
      </div>
      
      <div slot="content" style="width: 260px; display: flex; flex-direction: column; gap: 12px;">
        <h4 style="margin: 0; font-size: 14px; color: var(--vi-color-primary, #3676d0);">Quick Filters</h4>
        <input 
          type="text" 
          placeholder="Search by name..." 
          style="padding: 8px; border: 1px solid var(--vi-border-03, #e0e0e0); border-radius: 4px; outline: none; font-family: inherit; font-size: 13px;"
        />
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--vi-text-secondary, #4b5563); cursor: pointer;">
          <input type="checkbox" checked /> Include archived items
        </label>
        <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px;">
          <button style="padding: 6px 12px; border: 1px solid var(--vi-border-03, #e0e0e0); background: transparent; border-radius: 4px; cursor: pointer; font-size: 13px;">Clear</button>
          <button style="padding: 6px 12px; border: none; background: var(--vi-color-primary, #3676d0); color: white; border-radius: 4px; cursor: pointer; font-size: 13px;">Apply Filters</button>
        </div>
      </div>
    </vi-popover>
  `,
};
