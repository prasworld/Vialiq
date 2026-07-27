import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { ViIcon } from './vi-icon.js';
import { registerIcons } from './registry.js';
import * as allIcons from '@vialiq/icons';

// Ensure the component is registered
customElements.get('vi-icon') || customElements.define('vi-icon', ViIcon);

// Register all icons so they can be rendered by name
const iconsList = Object.values(allIcons);
registerIcons(iconsList);

const meta: Meta = {
  title: 'Components/Icon',
  component: 'vi-icon',
  argTypes: {
    size: {
      control: { type: 'range', min: 12, max: 64, step: 4 },
      description: 'Size of the icon in pixels',
    },
    color: {
      control: 'color',
      description: 'CSS color override (--vi-icon-color)',
    },
  },
  args: {
    size: 24,
    color: '#333333',
  },
};

export default meta;

type Story = StoryObj;

export const AllIcons: Story = {
  render: (args) => {
    return html`
      <style>
        .icon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 24px;
          padding: 24px;
          font-family: sans-serif;
        }
        .icon-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
          padding: 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f9f9f9;
        }
        .icon-name {
          font-size: 12px;
          color: #555;
          word-break: break-all;
        }
      </style>
      <div class="icon-grid" style="--vi-icon-color: ${args.color}">
        ${iconsList.map(
          (iconDef) => html`
            <div class="icon-item">
              <vi-icon name="${iconDef.name}" size="${args.size}"></vi-icon>
              <span class="icon-name">${iconDef.name}</span>
            </div>
          `
        )}
      </div>
    `;
  },
};
