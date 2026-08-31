import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { ifDefined } from 'lit/directives/if-defined.js';
import './index.js';
import '../button/vi-button.js';

const meta: Meta = {
  title: 'Components/Sidebar',
  component: 'vi-sidebar',
  argTypes: {
    mode: {
      control: 'select',
      options: ['over', 'push', 'slide'],
      defaultValue: 'over',
    },
    position: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom', 'start', 'end'],
      defaultValue: 'start',
    },
    opened: {
      control: 'boolean',
      defaultValue: true,
    },
    dock: {
      control: 'boolean',
      defaultValue: false,
    },
    dockedSize: {
      control: 'text',
      defaultValue: '50px',
    },
    showBackdrop: {
      control: 'boolean',
      defaultValue: false,
    },
    animations: {
      control: 'boolean',
      defaultValue: true,
    },
    closeOnClickBackdrop: {
      control: 'boolean',
      defaultValue: true,
    },
    closeOnClickOutside: {
      control: 'boolean',
      defaultValue: false,
    },
    keyClose: {
      control: 'boolean',
      description: 'Close sidebar on specific key press (default Escape)',
      defaultValue: true,
    },
    resizable: {
      control: 'boolean',
      description: 'Allows resizing the sidebar width dynamically',
      defaultValue: false,
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const renderSidebarTemplate = (args: Record<string, unknown>) => html`
  <div style="height: 100vh; width: 100vw;">
    <vi-sidebar-container
      ?show-backdrop=${args.showBackdrop}
      ?animations=${args.animations}
    >
      <vi-sidebar
        id="demo-sidebar"
        slot="sidebar"
        ?opened=${args.opened}
        mode=${ifDefined(args.mode as string)}
        position=${ifDefined(args.position as string)}
        ?dock=${args.dock}
        docked-size=${ifDefined(args.dockedSize as string)}
        ?animations=${args.animations}
        ?show-backdrop=${args.showBackdrop}
        ?close-on-click-backdrop=${args.closeOnClickBackdrop}
        ?close-on-click-outside=${args.closeOnClickOutside}
        ?key-close=${args.keyClose}
        ?resizable=${args.resizable}
        style="--vi-sidebar-bg: #ffffff; border-right: 1px solid #e3e3e3; z-index: 9999;"
      >
        <div style="padding: 24px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box;">
          <h3 style="margin-top: 0; margin-bottom: 32px; font-family: Inter, sans-serif; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 8px;">
            <vi-icon name="layout" style="color: #4f46e5;"></vi-icon>
            Menu
          </h3>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; flex: 1;">
            <li><vi-button variant="text" style="width: 100%; justify-content: flex-start; color: #4b5563;"><vi-icon name="home" slot="prefix"></vi-icon> Dashboard</vi-button></li>
            <li><vi-button variant="text" style="width: 100%; justify-content: flex-start; color: #4b5563;"><vi-icon name="users" slot="prefix"></vi-icon> Team</vi-button></li>
            <li><vi-button variant="text" style="width: 100%; justify-content: flex-start; color: #4b5563;"><vi-icon name="folder" slot="prefix"></vi-icon> Projects</vi-button></li>
            <li><vi-button variant="text" style="width: 100%; justify-content: flex-start; color: #4b5563;"><vi-icon name="settings" slot="prefix"></vi-icon> Settings</vi-button></li>
          </ul>
          <div style="margin-top: auto; padding-top: 24px; border-top: 1px solid #f3f4f6;">
            <vi-button 
              variant="outline" 
              style="width: 100%; border-color: #e5e7eb; color: #374151;"
              @click=${() => document.querySelector('#demo-sidebar')?.removeAttribute('opened')}
            >
              Close Sidebar
            </vi-button>
          </div>
        </div>
      </vi-sidebar>

      <div slot="content" style="padding: 48px; height: 100%; box-sizing: border-box; background: #f9fafb; font-family: Inter, sans-serif;">
        <div style="max-width: 800px; margin: 0 auto;">
          <h1 style="color: #111827; font-weight: 700; margin-top: 0; font-size: 2.25rem;">Main Dashboard</h1>
          <p style="color: #4b5563; font-size: 1.125rem; line-height: 1.75; margin-bottom: 32px;">
            This is the main page content. The layout responds fluidly to the sidebar modes: Push, Slide, and Over.
          </p>
          
          <div style="display: flex; gap: 16px; margin-bottom: 48px;">
            <vi-button 
              variant="primary" 
              style="background-color: #4f46e5; border-color: #4f46e5; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);"
              @click=${(e: Event) => {
                e.stopPropagation();
                document.querySelector('#demo-sidebar')?.setAttribute('opened', 'true');
              }}
            >
              <vi-icon name="menu" slot="prefix"></vi-icon>
              Open Menu
            </vi-button>
          </div>

          <div style="background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02); border: 1px solid #f3f4f6;">
            <h3 style="margin-top: 0; color: #111827;">System Status</h3>
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 0;">
              <strong>Current Mode:</strong> ${args.mode} <br/>
              <strong>Current Position:</strong> ${args.position}
            </p>
          </div>
        </div>
      </div>
    </vi-sidebar-container>
  </div>
`;

export const DefaultOver: Story = {
  render: renderSidebarTemplate,
  args: {
    mode: 'over',
    position: 'start',
    opened: false,
    showBackdrop: true,
  },
};

export const PushMode: Story = {
  render: renderSidebarTemplate,
  args: {
    mode: 'push',
    position: 'start',
    opened: false,
    dock: false,
    dockedSize: '60px',
    showBackdrop: true,
    animations: true,
    resizable: true,
  },
};

export const SlideMode: Story = {
  render: renderSidebarTemplate,
  args: {
    mode: 'slide',
    position: 'start',
    opened: true,
    showBackdrop: false,
  },
};

export const DockedMode: Story = {
  render: renderSidebarTemplate,
  args: {
    mode: 'push',
    position: 'start',
    opened: true,
    dock: true,
    dockedSize: '0px',
    showBackdrop: false,
  },
};
