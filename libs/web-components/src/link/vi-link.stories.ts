import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import './vi-link.js';

const meta: Meta = {
  title: 'Components/Link',
  component: 'vi-link',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'muted'],
    },
    size: {
      control: 'select',
      options: ['inherit', 'sm', 'md', 'lg'],
    },
    underline: {
      control: 'select',
      options: ['always', 'hover', 'none'],
    },
    disabled: {
      control: 'boolean',
    },
    external: {
      control: 'boolean',
    },
  },
  args: {
    variant: 'primary',
    size: 'inherit',
    underline: 'hover',
    disabled: false,
    external: false,
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <vi-link
      variant=${args.variant}
      size=${args.size}
      underline=${args.underline}
      ?disabled=${args.disabled}
      ?external=${args.external}
      href="https://example.com"
    >
      Click here to learn more
    </vi-link>
  `,
};

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <vi-link variant="primary" href="#">Primary Link</vi-link>
      <vi-link variant="secondary" href="#">Secondary Link</vi-link>
      <vi-link variant="muted" href="#">Muted Link</vi-link>
    </div>
  `,
};

export const UnderlineModes: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <vi-link underline="always" href="#">Always Underline</vi-link>
      <vi-link underline="hover" href="#">Hover Underline</vi-link>
      <vi-link underline="none" href="#">No Underline</vi-link>
    </div>
  `,
};

export const External: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <vi-link external href="https://example.com">External Link</vi-link>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <vi-link disabled href="#">Disabled Link</vi-link>
    </div>
  `,
};
