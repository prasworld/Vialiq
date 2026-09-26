import 'reflect-metadata';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { container } from 'tsyringe';
import { ViMessageService } from './vi-message-service.js';

const messageService = container.resolve(ViMessageService);
import '../button/vi-button.js';
import './vi-message.js';

const meta: Meta = {
  title: 'Components/Message',
  component: 'vi-message',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A lightweight, ephemeral global feedback message used to indicate the result of a user action without interrupting their workflow. Triggered programmatically via `messageService`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const ProgrammaticUsage: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <vi-button
        variant="secondary"
        @click=${() => {
          messageService.info('This is a normal message');
        }}
      >
        Info Message
      </vi-button>
      
      <vi-button
        variant="primary"
        @click=${() => {
          messageService.success('Profile updated successfully');
        }}
      >
        Success Message
      </vi-button>

      <vi-button
        variant="secondary"
        @click=${() => {
          messageService.warning('Your session will expire soon');
        }}
      >
        Warning Message
      </vi-button>

      <vi-button
        variant="danger"
        @click=${() => {
          messageService.error('Failed to load data');
        }}
      >
        Error Message
      </vi-button>

      <vi-button
        variant="secondary"
        @click=${() => {
          const id = messageService.loading('Action in progress...', 0);
          setTimeout(() => {
            messageService.dismiss(id);
            messageService.success('Action completed');
          }, 3000);
        }}
      >
        Loading Message (3s)
      </vi-button>
    </div>
  `,
};

export const CustomDuration: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <vi-button
        variant="primary"
        @click=${() => {
          messageService.info('This will stay for 10 seconds', 10000);
        }}
      >
        10s Duration
      </vi-button>
    </div>
  `,
};

export const DismissAll: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <vi-button
        variant="primary"
        @click=${() => {
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              messageService.info(`Message ${i + 1}`, 0);
            }, i * 200);
          }
        }}
      >
        Spawn Multiple
      </vi-button>

      <vi-button
        variant="danger"
        @click=${() => messageService.dismissAll()}
      >
        Dismiss All
      </vi-button>
    </div>
  `,
};
