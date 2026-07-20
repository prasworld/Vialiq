import type { Meta, StoryObj } from '@storybook/web-components';
import { html, TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
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
    dismissible: {
      control: 'boolean',
    },
    icon: {
      control: 'text',
    },
    noIcon: {
      control: 'boolean',
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
  },
  render: (args) => html`
    <vi-alert
      variant=${ifDefined(args.variant)}
      title=${ifDefined(args.title)}
      ?dismissible=${args.dismissible}
      icon=${ifDefined(args.icon)}
      ?no-icon=${args.noIcon}
    >
      This form has 2 open queries. All queries must be resolved before data lock.
      <div slot="actions">
        <vi-button variant="ghost" size="sm">View Queries</vi-button>
      </div>
    </vi-alert>
  `,
};

export const DataLockIndicator: Story = {
  args: {
    variant: 'info',
    noIcon: true,
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
      This record is <strong>locked</strong>. Contact your Data Manager to request an unlock.
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
      You are currently <strong>offline</strong>. Changes are saved locally and will sync automatically when your connection is restored.
    </vi-alert>
  `,
};

export const SuccessAutoHide: Story = {
  args: {
    variant: 'success',
    dismissible: true,
  },
  render: (args) => {
    return html`
      <div id="success-container">
        <vi-alert
          id="success-alert"
          variant=${ifDefined(args.variant)}
          title=${ifDefined(args.title)}
          ?dismissible=${args.dismissible}
          icon=${ifDefined(args.icon)}
          ?no-icon=${args.noIcon}
          @vialiq-close=${(e: Event) => {
            const alert = e.target as HTMLElement;
            // The actual removal needs to be handled by the host to mimic angular/react host removing it.
            // Using a simple timeout to remove from DOM since standard alert handles its own opacity collapse.
            setTimeout(() => {
              alert.remove();
            }, 0);
          }}
        >
          Form has been saved and submitted for review.
        </vi-alert>
      </div>
    `;
  },
};