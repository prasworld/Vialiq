import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vi-skeleton.js';

const meta: Meta = {
  title: 'Components / Skeleton',
  component: 'vi-skeleton',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circle', 'rect'],
    },
    animation: {
      control: 'select',
      options: ['shimmer', 'pulse', 'none'],
    },
  },
};

export default meta;

export const Default: StoryObj = {
  args: {
    variant: 'text',
    animation: 'shimmer',
  },
  render: (args) => html`
    <div style="width: 400px; max-width: 100%;">
      <vi-skeleton
        variant=${args.variant}
        animation=${args.animation}
      ></vi-skeleton>
    </div>
  `,
};

export const AtomicVariants: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; width: 400px; max-width: 100%;">
      <div>
        <p style="margin-bottom: 8px;">Text (Default 100% width, 16px height)</p>
        <vi-skeleton variant="text"></vi-skeleton>
      </div>
      <div>
        <p style="margin-bottom: 8px;">Circle (Default 40x40)</p>
        <vi-skeleton variant="circle"></vi-skeleton>
      </div>
      <div>
        <p style="margin-bottom: 8px;">Rect (Default 100% width, 150px height)</p>
        <vi-skeleton variant="rect"></vi-skeleton>
      </div>
    </div>
  `,
};

export const Animations: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; width: 400px; max-width: 100%;">
      <div>
        <p style="margin-bottom: 8px;">Shimmer (Default)</p>
        <vi-skeleton animation="shimmer"></vi-skeleton>
      </div>
      <div>
        <p style="margin-bottom: 8px;">Pulse</p>
        <vi-skeleton animation="pulse"></vi-skeleton>
      </div>
      <div>
        <p style="margin-bottom: 8px;">None</p>
        <vi-skeleton animation="none"></vi-skeleton>
      </div>
    </div>
  `,
};

export const CustomDimensions: StoryObj = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 16px; width: 400px; max-width: 100%;">
      <p style="margin-bottom: 0;">Inline styles can override CSS variables easily.</p>
      <vi-skeleton 
        variant="rect" 
        style="width: 250px; height: 80px; border-radius: 20px;">
      </vi-skeleton>
      <vi-skeleton 
        variant="circle" 
        style="width: 80px; height: 80px;">
      </vi-skeleton>
    </div>
  `,
};

export const CompositionExample: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 16px; width: 400px; max-width: 100%; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <vi-skeleton variant="circle"></vi-skeleton>
      <div style="display: flex; flex-direction: column; gap: 16px; flex: 1;">
        <vi-skeleton variant="text" style="width: 38%;"></vi-skeleton>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <vi-skeleton variant="text"></vi-skeleton>
          <vi-skeleton variant="text"></vi-skeleton>
          <vi-skeleton variant="text" style="width: 61%;"></vi-skeleton>
        </div>
      </div>
    </div>
  `,
};
