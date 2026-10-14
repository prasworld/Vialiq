import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../button/vi-button.js';
import '../icons/vi-icon.js';
import { registerIcons } from '../icons/registry.js';
import {
  saveIcon,
  fileTextIcon,
  lockIcon,
  triangleWarningIcon,
} from '@vialiq/icons';

registerIcons([saveIcon, fileTextIcon, lockIcon, triangleWarningIcon]);

const meta: Meta = {
  title: 'Components/Divider',
  component: 'vi-divider',
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: 'Orientation direction of the separator',
    },
    textPlacement: {
      control: 'radio',
      options: ['left', 'center', 'right'],
      description: 'Text placement along the divider rule',
    },
    textMargin: {
      control: 'text',
      description: 'Margin offset for left or right placement',
    },
    dashed: {
      control: 'boolean',
      description: 'Renders the separator stroke as dashed',
    },
    plain: {
      control: 'boolean',
      description: 'Renders embedded text with standard font weight and muted colour',
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="max-width: 640px; font-family: sans-serif;">
      <p style="margin: 0; color: #4b5563;">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
        Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies
        sed, dolor.
      </p>
      <vi-divider></vi-divider>
      <p style="margin: 0; color: #4b5563;">
        Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper
        congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie.
      </p>
    </div>
  `,
};

export const WithText: Story = {
  render: () => html`
    <div style="max-width: 640px; font-family: sans-serif;">
      <p style="color: #4b5563; margin: 0 0 12px 0;">
        Clinical study protocol v3.2. Form sectioning examples below.
      </p>
      <vi-divider text-placement="center">Baseline Demographics</vi-divider>
      <p style="color: #4b5563; margin: 12px 0;">
        Patient age, sex at birth, informed consent verification date.
      </p>
      <vi-divider text-placement="left">Vital Signs</vi-divider>
      <p style="color: #4b5563; margin: 12px 0;">
        Systolic blood pressure, diastolic blood pressure, heart rate.
      </p>
      <vi-divider text-placement="right">Laboratory Panel</vi-divider>
      <p style="color: #4b5563; margin: 12px 0;">
        Serum creatinine, blood urea nitrogen, alanine aminotransferase.
      </p>
    </div>
  `,
};

export const CustomTextMargin: Story = {
  render: () => html`
    <div style="max-width: 640px; font-family: sans-serif;">
      <vi-divider text-placement="left" text-margin="48px">
        Left Aligned (48px Margin)
      </vi-divider>
      <p style="color: #4b5563; margin: 12px 0;">
        Content beneath custom offset header.
      </p>
      <vi-divider text-placement="right" text-margin="64px">
        Right Aligned (64px Margin)
      </vi-divider>
    </div>
  `,
};

export const PlainText: Story = {
  render: () => html`
    <div style="max-width: 640px; font-family: sans-serif;">
      <p style="color: #4b5563; margin: 0 0 12px 0;">
        Plain mode renders secondary, unbolded text for subtle divider notes.
      </p>
      <vi-divider plain text-placement="center">
        Audit trail synchronized 2 minutes ago
      </vi-divider>
      <vi-divider plain text-placement="left">
        Secondary form parameters
      </vi-divider>
    </div>
  `,
};

export const Dashed: Story = {
  render: () => html`
    <div style="max-width: 640px; font-family: sans-serif;">
      <p style="color: #4b5563; margin: 0 0 12px 0;">
        Dashed line styles for optional or collapsible sections.
      </p>
      <vi-divider dashed></vi-divider>
      <vi-divider dashed text-placement="center">
        Optional Concomitant Medications
      </vi-divider>
      <vi-divider dashed text-placement="left">
        Conditional Adverse Event Questions
      </vi-divider>
    </div>
  `,
};

export const VerticalToolbar: Story = {
  render: () => html`
    <div
      style="display: flex; align-items: center; gap: 8px; font-family: sans-serif;"
    >
      <vi-button size="sm">
        <vi-icon name="save" slot="prefix"></vi-icon>
        Save CRF
      </vi-button>
      <vi-divider direction="vertical"></vi-divider>
      <vi-button size="sm" variant="ghost">
        <vi-icon name="file-text" slot="prefix"></vi-icon>
        Audit Log
      </vi-button>
      <vi-divider direction="vertical"></vi-divider>
      <vi-button size="sm" variant="ghost">
        <vi-icon name="lock" slot="prefix"></vi-icon>
        Freeze Form
      </vi-button>
      <vi-divider direction="vertical"></vi-divider>
      <vi-button size="sm" variant="danger">
        <vi-icon name="triangle-warning" slot="prefix"></vi-icon>
        Report SAE
      </vi-button>
    </div>
  `,
};

export const VerticalInlineMetadata: Story = {
  render: () => html`
    <div
      style="display: flex; align-items: center; font-family: sans-serif; font-size: 14px; color: #4b5563;"
    >
      <span>Subject: <strong style="color: #111827;">101-042</strong></span>
      <vi-divider direction="vertical"></vi-divider>
      <span>Site: <strong style="color: #111827;">SITE-BOSTON-01</strong></span>
      <vi-divider direction="vertical"></vi-divider>
      <span>Cohort: <strong style="color: #111827;">Arm A (10mg)</strong></span>
      <vi-divider direction="vertical"></vi-divider>
      <span>Status: <strong style="color: #059669;">Active</strong></span>
    </div>
  `,
};
