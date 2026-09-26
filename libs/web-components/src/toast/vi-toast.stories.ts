import 'reflect-metadata';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { container } from 'tsyringe';
import { ViToastService } from './vi-toast-service.js';

const toastService = container.resolve(ViToastService);
import '../button/vi-button.js';
import './vi-toast.js';

const meta: Meta = {
  title: 'Components/Toast',
  component: 'vi-toast',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Ephemeral floating notifications that appear in response to user actions or system events. Primarily triggered programmatically via `toastService`.',
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
        variant="primary"
        @click=${() => {
          toastService.show({
            variant: 'info',
            title: 'Tip',
            message: 'You can use keyboard shortcut Ctrl+S to save.',
          });
        }}
      >
        Show Info
      </vi-button>
      
      <vi-button
        variant="primary"
        @click=${() => {
          toastService.show({
            variant: 'success',
            title: 'Draft saved',
            message: 'Your progress has been saved automatically.',
          });
        }}
      >
        Show Success
      </vi-button>

      <vi-button
        variant="primary"
        @click=${() => {
          toastService.show({
            variant: 'warning',
            title: 'Connection lost',
            message: 'Working offline. Changes will sync when online.',
          });
        }}
      >
        Show Warning
      </vi-button>

      <vi-button
        variant="primary"
        @click=${() => {
          toastService.show({
            variant: 'danger',
            title: 'Upload failed',
            message: 'The file was too large to upload.',
          });
        }}
      >
        Show Error
      </vi-button>

      <vi-button
        variant="primary"
        @click=${() => {
          const frag = document.createDocumentFragment();
          const strong = document.createElement('strong');
          strong.textContent = 'Custom HTML: ';
          const span = document.createElement('span');
          span.textContent = 'This uses a DOM Node for the message!';
          span.style.textDecoration = 'underline';
          frag.appendChild(strong);
          frag.appendChild(span);
          
          toastService.show({
            variant: 'info',
            content: frag,
          });
        }}
      >
        Show Custom HTML
      </vi-button>
    </div>
  `,
};

export const WithActions: Story = {
  render: () => html`
    <vi-button
      variant="primary"
      @click=${() => {
        toastService.show({
          variant: 'warning',
          title: 'Session expiring',
          message: 'You will be logged out in 5 minutes.',
          duration: 0, // sticky
          closable: true,
          actions: [{ label: 'Extend session', action: 'extend', variant: 'primary' }],
          onAction: (action) => alert(`Action triggered: ${action}`),
        });
      }}
    >
      Show Sticky with Action
    </vi-button>
  `,
};

export const CustomPositions: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <vi-button
        variant="secondary"
        @click=${() => {
          toastService.show({ variant: 'info', message: 'I am on the top left!', position: 'top-left' });
        }}
      >
        Top Left
      </vi-button>

      <vi-button
        variant="secondary"
        @click=${() => {
          toastService.show({ variant: 'info', message: 'I am on the top center!', position: 'top-center' });
        }}
      >
        Top Center
      </vi-button>

      <vi-button
        variant="secondary"
        @click=${() => {
          toastService.show({ variant: 'info', message: 'I am on the top right!', position: 'top-right' });
        }}
      >
        Top Right
      </vi-button>

      <vi-button
        variant="secondary"
        @click=${() => {
          toastService.show({ variant: 'info', message: 'I am on the bottom left!', position: 'bottom-left' });
        }}
      >
        Bottom Left
      </vi-button>
      
      <vi-button
        variant="secondary"
        @click=${() => {
          toastService.show({ variant: 'info', message: 'I am in the bottom center!', position: 'bottom-center' });
        }}
      >
        Bottom Center
      </vi-button>

      <vi-button
        variant="secondary"
        @click=${() => {
          toastService.show({ variant: 'info', message: 'I am on the bottom right!', position: 'bottom-right' });
        }}
      >
        Bottom Right
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
          toastService.configure({ position: 'top-right' });
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              toastService.show({ variant: 'info', message: `Toast ${i + 1}`, duration: 0 });
            }, i * 200);
          }
        }}
      >
        Spawn Multiple
      </vi-button>

      <vi-button
        variant="danger"
        @click=${() => toastService.dismissAll()}
      >
        Dismiss All
      </vi-button>
    </div>
  `,
};
