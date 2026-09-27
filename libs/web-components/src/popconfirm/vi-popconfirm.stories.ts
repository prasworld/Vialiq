import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vi-popconfirm.js';
import '../button/vi-button.js';
import { registerIcons } from '../icons/registry.js';

registerIcons([{
  name: 'warning',
  data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>'
}]);

const meta: Meta = {
  title: 'Feedback/Popconfirm',
  component: 'vi-popconfirm',
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    title: { control: 'text' },
    description: { control: 'text' },
    icon: { control: 'text' },
    okText: { control: 'text' },
    cancelText: { control: 'text' },
    okVariant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Default: StoryObj = {
  args: {
    title: 'Delete this task?',
    description: 'This action cannot be undone.',
    okText: 'Yes',
    cancelText: 'No',
    okVariant: 'danger',
    placement: 'top',
  },
  render: (args) => html`
    <vi-popconfirm
      title=${args.title}
      description=${args.description}
      ok-text=${args.okText}
      cancel-text=${args.cancelText}
      ok-variant=${args.okVariant}
      placement=${args.placement}
      @vi-popconfirm-confirm=${() => alert('Confirmed!')}
      @vi-popconfirm-cancel=${() => console.log('Cancelled')}
    >
      <vi-button variant="danger">Delete Task</vi-button>
    </vi-popconfirm>
  `,
};
