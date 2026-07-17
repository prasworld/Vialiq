import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vi-badge.js';

const meta: Meta = {
  title: 'Components/Badge',
  component: 'vi-badge',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Colour semantic',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the badge',
    },
    dot: {
      control: 'boolean',
      description: 'Show coloured dot instead of text',
    },
    pill: {
      control: 'boolean',
      description: 'Fully rounded (pill shape) vs. square',
    },
    count: {
      control: 'number',
      description: 'Numeric count to display',
    },
    max: {
      control: 'number',
      description: 'Max count before showing {max}+',
    },
    outline: {
      control: 'boolean',
      description: 'Outlined/ghost style',
    },
  },
  args: {
    variant: 'neutral',
    size: 'md',
    pill: true,
    dot: false,
    outline: false,
    max: 99,
  },
};

export default meta;

export const Default: StoryObj = {
  render: (args) => html`
    <vi-badge
      variant=${args.variant}
      size=${args.size}
      ?dot=${args.dot}
      ?pill=${args.pill}
      ?outline=${args.outline}
      count=${args.count}
      max=${args.max}
    >
      ${!args.dot && args.count === undefined ? 'Badge' : ''}
    </vi-badge>
  `,
};

export const Variants: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <vi-badge variant="neutral">Draft</vi-badge>
      <vi-badge variant="primary">Submitted</vi-badge>
      <vi-badge variant="success">Locked</vi-badge>
      <vi-badge variant="warning">In Review</vi-badge>
      <vi-badge variant="danger">Query Open</vi-badge>
      <vi-badge variant="info">Info</vi-badge>
    </div>
  `,
};

export const Outline: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <vi-badge variant="neutral" outline>Draft</vi-badge>
      <vi-badge variant="primary" outline>Submitted</vi-badge>
      <vi-badge variant="success" outline>Locked</vi-badge>
      <vi-badge variant="warning" outline>In Review</vi-badge>
      <vi-badge variant="danger" outline>Query Open</vi-badge>
      <vi-badge variant="info" outline>Info</vi-badge>
    </div>
  `,
};

export const Sizes: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <vi-badge size="sm" variant="neutral">Small</vi-badge>
      <vi-badge size="md" variant="neutral">Medium</vi-badge>
      <vi-badge size="lg" variant="neutral">Large</vi-badge>
    </div>
  `,
};

export const PillVsSquare: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <vi-badge pill variant="primary">Pill (Default)</vi-badge>
      <vi-badge ?pill=${false} variant="primary">Square</vi-badge>
    </div>
  `,
};

export const Dots: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <vi-badge dot variant="neutral"></vi-badge>
      <vi-badge dot variant="primary"></vi-badge>
      <vi-badge dot variant="success"></vi-badge>
      <vi-badge dot variant="warning"></vi-badge>
      <vi-badge dot variant="danger"></vi-badge>
      <vi-badge dot variant="info"></vi-badge>
    </div>
  `,
};

export const Counts: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <vi-badge count="5" variant="danger"></vi-badge>
      <vi-badge count="120" max="99" variant="danger"></vi-badge>
      <vi-badge count="0" variant="neutral"></vi-badge>
    </div>
  `,
};

export const WithIcon: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <vi-badge variant="success">
        <span slot="icon" style="font-size: 14px;">✓</span>
        Complete
      </vi-badge>
    </div>
  `,
};
