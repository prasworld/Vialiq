import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vi-tag.js';
import '../icons/vi-icon.js';

const meta: Meta = {
  title: 'Components/Tag',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info', 'contrast'],
      description: 'Colour variant theme',
    },
    appearance: {
      control: 'select',
      options: ['subtle', 'outline', 'solid'],
      description: 'Visual appearance mode',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Tag size',
    },
    pill: {
      control: 'boolean',
      description: 'Fully rounded pill shape',
    },
    dot: {
      control: 'boolean',
      description: 'Status dot indicator prefix',
    },
    count: {
      control: 'number',
      description: 'Numeric counter badge suffix',
    },
    removable: {
      control: 'boolean',
      description: 'Show remove button',
    },
    selectable: {
      control: 'boolean',
      description: 'Interactive filter selection mode',
    },
    selected: {
      control: 'boolean',
      description: 'Selected/active state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable tag interactions',
    },
  },
  args: {
    variant: 'primary',
    appearance: 'subtle',
    size: 'md',
    pill: false,
    dot: false,
    removable: false,
    selectable: false,
    selected: false,
    disabled: false,
  },
  render: (args) => html`
    <vi-tag
      variant=${args.variant}
      appearance=${args.appearance}
      size=${args.size}
      ?pill=${args.pill}
      ?dot=${args.dot}
      .count=${args.count}
      ?removable=${args.removable}
      ?selectable=${args.selectable}
      ?selected=${args.selected}
      ?disabled=${args.disabled}
    >
      Site 001
    </vi-tag>
  `,
};

export default meta;
type Story = StoryObj;

export const Standard: Story = {};

export const Appearances: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <h4 style="margin-bottom: 0.5rem; font-family: sans-serif;">Subtle (Default)</h4>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <vi-tag variant="neutral" appearance="subtle">Neutral</vi-tag>
          <vi-tag variant="primary" appearance="subtle">Primary</vi-tag>
          <vi-tag variant="success" appearance="subtle">Success</vi-tag>
          <vi-tag variant="warning" appearance="subtle">Warning</vi-tag>
          <vi-tag variant="danger" appearance="subtle">Danger</vi-tag>
          <vi-tag variant="info" appearance="subtle">Info</vi-tag>
          <vi-tag variant="contrast" appearance="subtle">Contrast</vi-tag>
        </div>
      </div>

      <div>
        <h4 style="margin-bottom: 0.5rem; font-family: sans-serif;">Outline</h4>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <vi-tag variant="neutral" appearance="outline">Neutral</vi-tag>
          <vi-tag variant="primary" appearance="outline">Primary</vi-tag>
          <vi-tag variant="success" appearance="outline">Success</vi-tag>
          <vi-tag variant="warning" appearance="outline">Warning</vi-tag>
          <vi-tag variant="danger" appearance="outline">Danger</vi-tag>
          <vi-tag variant="info" appearance="outline">Info</vi-tag>
          <vi-tag variant="contrast" appearance="outline">Contrast</vi-tag>
        </div>
      </div>

      <div>
        <h4 style="margin-bottom: 0.5rem; font-family: sans-serif;">Solid (High Contrast)</h4>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <vi-tag variant="neutral" appearance="solid">Neutral</vi-tag>
          <vi-tag variant="primary" appearance="solid">Primary</vi-tag>
          <vi-tag variant="success" appearance="solid">Success</vi-tag>
          <vi-tag variant="warning" appearance="solid">Warning</vi-tag>
          <vi-tag variant="danger" appearance="solid">Danger</vi-tag>
          <vi-tag variant="info" appearance="solid">Info</vi-tag>
          <vi-tag variant="contrast" appearance="solid">Contrast</vi-tag>
        </div>
      </div>
    </div>
  `,
};

export const Shapes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <h4 style="margin-bottom: 0.5rem; font-family: sans-serif;">Standard Rounded (4px)</h4>
        <div style="display: flex; gap: 0.5rem;">
          <vi-tag variant="primary">Filter: Baseline</vi-tag>
          <vi-tag variant="success" removable>Site 101</vi-tag>
          <vi-tag variant="warning" dot>Query Pending</vi-tag>
        </div>
      </div>
      <div>
        <h4 style="margin-bottom: 0.5rem; font-family: sans-serif;">Pill Shape (9999px)</h4>
        <div style="display: flex; gap: 0.5rem;">
          <vi-tag pill variant="primary">Filter: Baseline</vi-tag>
          <vi-tag pill variant="success" removable>Site 101</vi-tag>
          <vi-tag pill variant="warning" dot>Query Pending</vi-tag>
        </div>
      </div>
    </div>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <vi-tag size="xs" variant="primary" dot removable>XS (16px)</vi-tag>
      <vi-tag size="sm" variant="primary" dot removable>Small (20px)</vi-tag>
      <vi-tag size="md" variant="primary" dot removable>Medium (24px)</vi-tag>
      <vi-tag size="lg" variant="primary" dot removable>Large (28px)</vi-tag>
    </div>
  `,
};

export const StatusDots: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <vi-tag dot variant="success" appearance="subtle">Online</vi-tag>
      <vi-tag dot variant="warning" appearance="subtle">Sync Pending</vi-tag>
      <vi-tag dot variant="danger" appearance="subtle">Offline Error</vi-tag>
      <vi-tag dot variant="info" appearance="subtle">Processing</vi-tag>
    </div>
  `,
};

export const SelectableFilterChips: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <vi-tag selectable selected pill variant="primary">All Sites</vi-tag>
      <vi-tag selectable pill variant="neutral">Screening</vi-tag>
      <vi-tag selectable pill variant="neutral">Enrolled</vi-tag>
      <vi-tag selectable pill variant="neutral">Completed</vi-tag>
      <vi-tag selectable pill variant="neutral">Discontinued</vi-tag>
    </div>
  `,
};

export const WithIconsAndAvatars: Story = {
  render: () => html`
    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <vi-tag variant="primary" removable>
        <vi-icon slot="icon" name="user" size="12"></vi-icon>
        Dr. Smith (Investigator)
      </vi-tag>
      <vi-tag variant="neutral" .count=${14} pill>
        Open Queries
      </vi-tag>
      <vi-tag variant="info" removable .count=${3}>
        Protocol Amendments
      </vi-tag>
    </div>
  `,
};

export const CustomSizingAndStyles: Story = {
  render: () => html`
    <style>
      .tag-hero-xl {
        --vi-tag-height: 36px;
        --vi-tag-padding-x: 16px;
        --vi-tag-border-radius: 8px;
        --vi-tag-font-size: 15px;
        --vi-tag-gap: 10px;
        --vi-tag-avatar-size: 22px;
        --vi-tag-icon-size: 20px;
        --vi-tag-remove-size: 24px;
      }
      .tag-edc-compact {
        --vi-tag-height: 16px;
        --vi-tag-padding-x: 5px;
        --vi-tag-font-size: 9px;
        --vi-tag-border-radius: 3px;
        --vi-tag-gap: 3px;
        --vi-tag-remove-size: 10px;
      }
      .tag-custom-brand {
        --vi-tag-primary-bg: #f0f9ff;
        --vi-tag-primary-color: #0284c7;
        --vi-tag-primary-border: #7dd3fc;
      }
    </style>
    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      <div>
        <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">
          1. Extra Large Hero Tag (--vi-tag-height: 36px)
        </div>
        <vi-tag class="tag-hero-xl" variant="primary" dot removable .count=${42}>
          <vi-icon slot="icon" name="user" size="18"></vi-icon>
          Hero XL Tag
        </vi-tag>
      </div>

      <div>
        <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">
          2. Ultra-Compact Grid Tag (--vi-tag-height: 16px)
        </div>
        <vi-tag class="tag-edc-compact" variant="info" dot>
          Compact EDC Tag
        </vi-tag>
      </div>

      <div>
        <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">
          3. Custom Branded Color Theme Tag (CSS Variable Overrides)
        </div>
        <vi-tag class="tag-custom-brand" variant="primary" removable pill .count=${7}>
          Custom Sky Blue Tag
        </vi-tag>
      </div>
    </div>
  `,
};
