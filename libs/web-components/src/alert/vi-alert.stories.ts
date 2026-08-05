import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import type { ViAlert } from './vi-alert.js';
import './vi-alert.js';
import '../button/vi-button.js';
import '../icons/vi-icon.js';

const meta: Meta = {
  title: 'Components/Alert',
  component: 'vi-alert',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger', 'neutral'],
    },
    title: {
      control: 'text',
    },
    open: {
      control: 'boolean',
    },
    floating: {
      control: 'boolean',
    },
    dismissible: {
      control: 'boolean',
    },
    icon: {
      control: 'text',
    },
    noIcon: {
      control: 'boolean',
    },
    autoHide: {
      control: 'boolean',
    },
    autoHideDuration: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj;

// Story mapping to usage examples in vi-alert.md

export const FormValidationSummary: Story = {
  args: {
    variant: 'danger',
    title: 'Please fix the following errors:',
    dismissible: true,
  },
  render: (args) => html`
    <vi-alert
      variant=${ifDefined(args.variant)}
      title=${ifDefined(args.title)}
      ?dismissible=${args.dismissible}
      icon=${ifDefined(args.icon)}
      ?no-icon=${args.noIcon}
    >
      <ul>
        <li>Date of Birth is required</li>
        <li>Weight must be a number between 0 and 700</li>
        <li>Ethnicity selection is required</li>
      </ul>
    </vi-alert>
  `,
};

export const QueryContextBanner: Story = {
  args: {
    variant: 'warning',
    title: 'Open queries',
    noIcon: false,
    icon: '',
    dismissible: true,
  },
  render: (args) => html`
    <vi-alert
      variant=${ifDefined(args.variant)}
      title=${ifDefined(args.title)}
      ?dismissible=${args.dismissible}
      icon=${ifDefined(args.icon)}
      ?no-icon=${args.noIcon}
    >
      This form has 2 open queries. All queries must be resolved before data
      lock.
      <div slot="actions">
        <vi-button variant="ghost" size="sm">View Queries</vi-button>
      </div>
    </vi-alert>
  `,
};

export const DataLockIndicator: Story = {
  args: {
    variant: 'info',
    noIcon: false,
  },
  render: (args) => html`
    <vi-alert
      variant=${ifDefined(args.variant)}
      title=${ifDefined(args.title)}
      ?dismissible=${args.dismissible}
      icon=${ifDefined(args.icon)}
      ?no-icon=${args.noIcon}
    >
      <vi-icon slot="icon" name="lock" size="16"></vi-icon>
      This record is <strong>locked</strong>. Contact your Data Manager to
      request an unlock.
    </vi-alert>
  `,
};

export const OfflineModeBanner: Story = {
  args: {
    variant: 'warning',
  },
  render: (args) => html`
    <vi-alert
      variant=${ifDefined(args.variant)}
      title=${ifDefined(args.title)}
      ?dismissible=${args.dismissible}
      icon=${ifDefined(args.icon)}
      ?no-icon=${args.noIcon}
      style="border-radius: 0; width: 100%;"
    >
      You are currently <strong>offline</strong>. Changes are saved locally and
      will sync automatically when your connection is restored.
    </vi-alert>
  `,
};

export const SuccessAutoHide: Story = {
  args: {
    variant: 'success',
    dismissible: true,
    autoHide: true,
    autoHideDuration: 4000,
  },
  render: (args) => {
    return html`
      <div id="success-container">
        <vi-alert
          id="success-alert"
          variant=${ifDefined(args.variant)}
          title=${ifDefined(args.title)}
          ?dismissible=${args.dismissible}
          ?auto-hide=${args.autoHide}
          auto-hide-duration=${ifDefined(args.autoHideDuration)}
          icon=${ifDefined(args.icon)}
          ?no-icon=${args.noIcon}
          @vi-alert-close=${(e: CustomEvent<{ id: string }>) => {
            const alert = e.target as HTMLElement;
            // The actual removal needs to be handled by the host to mimic angular/react host removing it.
            // Using a simple timeout to remove from DOM since standard alert handles its own opacity collapse.
            setTimeout(() => {
              alert.remove();
            }, 0);
          }}
        >
          Form has been saved and submitted for review (Auto-hiding in 4s).
        </vi-alert>
      </div>
    `;
  },
};

export const ExternalControl: Story = {
  args: {
    variant: 'info',
    title: 'Controlled Alert',
    dismissible: true,
  },
  render: (args) => {
    return html`
      <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
        <div style="display: flex; gap: 0.5rem;">
          <vi-button
            variant="primary"
            size="sm"
            @click=${() => {
              const alert = document.querySelector('#controlled-alert') as ViAlert | null;
              alert?.show();
            }}
          >
            Show Alert (imperative show())
          </vi-button>
          <vi-button
            variant="secondary"
            size="sm"
            @click=${() => {
              const alert = document.querySelector('#controlled-alert') as ViAlert | null;
              alert?.hide();
            }}
          >
            Hide Alert (imperative hide())
          </vi-button>
        </div>

        <vi-alert
          id="controlled-alert"
          variant=${ifDefined(args.variant)}
          title=${ifDefined(args.title)}
          ?dismissible=${args.dismissible}
          icon=${ifDefined(args.icon)}
          ?no-icon=${args.noIcon}
        >
          This alert can be opened and closed externally using methods or the <code>open</code> property.
        </vi-alert>
      </div>
    `;
  },
};

export const FloatingContainerOverlay: Story = {
  args: {
    variant: 'warning',
    title: 'Read-Only Mode',
    floating: true,
    dismissible: true,
  },
  render: (args) => {
    return html`
      <div
        style="position: relative; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; max-width: 500px; background: #fafafa;"
      >
        <vi-alert
          variant=${ifDefined(args.variant)}
          title=${ifDefined(args.title)}
          ?floating=${args.floating}
          ?dismissible=${args.dismissible}
          icon=${ifDefined(args.icon)}
          ?no-icon=${args.noIcon}
          style="border-radius: 8px 8px 0 0;"
        >
          This card is currently locked for editing.
        </vi-alert>

        <h3 style="margin-top: ${args.floating ? '40px' : '0'};">Subject Form Record</h3>
        <p>Subject ID: SUBJ-10492</p>
        <p>Site: St. Jude Medical Center</p>
        <p>Status: Locked</p>
      </div>
    `;
  },
};
