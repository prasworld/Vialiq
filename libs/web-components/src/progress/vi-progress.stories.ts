import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import './vi-progress';
import { ifDefined } from 'lit/directives/if-defined.js';

const meta: Meta = {
  title: 'Components / Progress',
  component: 'vi-progress',
  parameters: {
    docs: {
      description: {
        component: 'Displays the completion progress of a task. Can be represented as a linear bar or a circular ring.',
      },
    },
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    max: { control: 'number' },
    type: { control: 'radio', options: ['line', 'circle'] },
    variant: { control: 'radio', options: ['primary', 'success', 'error', 'warning'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    status: { control: 'radio', options: ['normal', 'active', 'exception', 'success'] },
    showInfo: { control: 'boolean' },
    strokeLinecap: { control: 'radio', options: ['round', 'butt', 'square'] }
  },
};

export default meta;
type Story = StoryObj;

const Template = (args: Record<string, unknown>) => html`
  <div style="width: 400px; max-width: 100%; padding: 2rem;">
    <vi-progress
      value=${ifDefined(args.value)}
      max=${ifDefined(args.max)}
      type=${ifDefined(args.type)}
      variant=${ifDefined(args.variant)}
      size=${ifDefined(args.size)}
      status=${ifDefined(args.status)}
      ?show-info=${args.showInfo !== false}
      stroke-linecap=${ifDefined(args.strokeLinecap)}
    ></vi-progress>
  </div>
`;

export const Default: Story = {
  render: Template,
  args: {
    value: 50,
    type: 'line',
  },
};

export const ActiveAnimation: Story = {
  render: Template,
  args: {
    value: 70,
    type: 'line',
    status: 'active',
  },
};

export const Sizes: Story = {
  render: () => html`
    <div style="width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
      <vi-progress value="30" size="sm"></vi-progress>
      <vi-progress value="50" size="md"></vi-progress>
      <vi-progress value="70" size="lg"></vi-progress>
    </div>
  `,
};

export const Statuses: Story = {
  render: () => html`
    <div style="width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
      <vi-progress value="50" status="normal"></vi-progress>
      <vi-progress value="50" status="active"></vi-progress>
      <vi-progress value="50" status="success"></vi-progress>
      <vi-progress value="50" status="exception"></vi-progress>
    </div>
  `,
};

export const Circular: Story = {
  render: () => html`
    <div style="padding: 2rem; display: flex; gap: 2rem; align-items: center;">
      <vi-progress type="circle" value="75"></vi-progress>
      <vi-progress type="circle" value="100" status="success"></vi-progress>
      <vi-progress type="circle" value="60" status="exception"></vi-progress>
    </div>
  `,
};

export const CustomColorsCSS: Story = {
  render: () => html`
    <div style="width: 400px; max-width: 100%; padding: 2rem;">
      <p style="font-family: sans-serif; font-size: 14px; margin-bottom: 1rem; color: #666;">
        Demonstrating the 3-level CSS cascade overriding capabilities (like Ant Design's strokeColor property).
      </p>
      
      <vi-progress 
        value="80" 
        style="
          --vi-progress-indicator-bg: linear-gradient(90deg, #ff8a00, #e52e71);
          --vi-progress-track-bg: #ffe4e1;
          --vi-progress-text-color: #e52e71;
          --vi-progress-line-height: 16px;
        "
      ></vi-progress>
    </div>
  `,
};

export const CustomSlot: Story = {
  render: () => html`
    <div style="width: 400px; max-width: 100%; padding: 2rem;">
      <vi-progress value="30">
        <span slot="info" style="font-size: 12px; color: #666;">3 / 10 Steps</span>
      </vi-progress>
    </div>
  `,
};

export const Dashboard: Story = {
  render: () => html`
    <div style="padding: 2rem; display: flex; gap: 2rem; align-items: center;">
      <vi-progress type="dashboard" value="75"></vi-progress>
      <vi-progress type="dashboard" value="100" status="success"></vi-progress>
      <vi-progress type="dashboard" value="60" status="exception" gap-degree="120" gap-position="left"></vi-progress>
    </div>
  `,
};

export const Steps: Story = {
  render: () => html`
    <div style="width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
      <vi-progress value="30" steps="3"></vi-progress>
      <vi-progress value="50" steps="5" size="sm"></vi-progress>
      <vi-progress value="70" steps="10" stroke-width="4"></vi-progress>
    </div>
  `,
};

export const SuccessSegment: Story = {
  render: () => html`
    <div style="width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 2rem;">
      <vi-progress value="50" success-percent="30"></vi-progress>
      <vi-progress type="circle" value="50" success-percent="30"></vi-progress>
    </div>
  `,
};

export const DirectProps: Story = {
  render: () => html`
    <div style="width: 400px; max-width: 100%; padding: 2rem;">
      <vi-progress 
        value="80" 
        stroke-color="linear-gradient(90deg, #ff8a00, #e52e71)"
        trail-color="#ffe4e1"
        stroke-width="16"
      ></vi-progress>
    </div>
  `,
};

export const AutoSuccess: Story = {
  render: () => html`
    <div style="width: 400px; max-width: 100%; padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
      <vi-progress value="100"></vi-progress>
      <vi-progress type="circle" value="100"></vi-progress>
    </div>
  `,
};

export const CircularSteps: Story = {
  render: () => html`
    <div style="padding: 2rem;">
      <vi-progress type="circle" value="50" steps="10"></vi-progress>
    </div>
  `,
};

export const GradientCircle: Story = {
  render: () => html`
    <div style="padding: 2rem;">
      <vi-progress 
        type="circle" 
        value="80" 
        stroke-color="linear-gradient(90deg, #108ee9, #87d068)"
      ></vi-progress>
    </div>
  `,
};

export const ZorroParity: Story = {
  render: () => html`
    <div style="padding: 2rem; display: flex; flex-direction: column; gap: 2rem;">
      <!-- Format Function -->
      <vi-progress 
        value="50" 
        .format=${(p: number) => `${p} Days`}
      ></vi-progress>

      <!-- Complex Line Gradient -->
      <vi-progress 
        value="100" 
        .strokeColor=${{
          '0%': '#108ee9',
          '100%': '#87d068'
        }}
      ></vi-progress>

      <!-- Width + Complex Circle Gradient -->
      <vi-progress 
        type="circle" 
        value="75" 
        width="132"
        .strokeColor=${{
          '0%': '#108ee9',
          '100%': '#87d068',
        }}
      ></vi-progress>
    </div>
  `,
};
