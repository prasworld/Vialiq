import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../icons/vi-icon.js';
import { registerIcons } from '../icons/registry.js';
import {
  plusIcon,
  checkIcon,
  commentIcon,
  fileTextIcon,
  triangleWarningIcon,
  lockIcon,
  userIcon,
  capsulesIcon,
  documentIcon,
  xIcon,
  chevronUpIcon,
  folderOpenIcon,
  saveIcon,
} from '@vialiq/icons';

// Register all icons used in the stories
registerIcons([
  plusIcon,
  checkIcon,
  commentIcon,
  fileTextIcon,
  triangleWarningIcon,
  lockIcon,
  userIcon,
  capsulesIcon,
  documentIcon,
  xIcon,
  chevronUpIcon,
  folderOpenIcon,
  saveIcon,
]);

const meta: Meta = {
  title: 'Components/FloatButton',
  component: 'vi-float-button',
  tags: ['autodocs'],
  argTypes: {
    shape: {
      control: 'radio',
      options: ['circle', 'square'],
      description: 'Button geometry shape',
    },
    type: {
      control: 'radio',
      options: ['default', 'primary'],
      description: 'Button visual type',
    },
    size: {
      control: 'radio',
      options: ['default', 'sm'],
      description: 'Button size scale',
    },
    description: {
      control: 'text',
      description: 'Text label under icon',
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip text on hover',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables button',
    },
    badgeDot: {
      name: 'badge-dot',
      control: 'boolean',
      description: 'Show status dot badge',
    },
    badge: {
      control: 'text',
      description: 'Badge count or text',
    },
    badgeStatus: {
      name: 'badge-status',
      control: 'select',
      options: ['neutral', 'primary', 'success', 'warning', 'danger', 'info'],
      description: 'Badge status color',
    },
  },
  args: {
    shape: 'circle',
    type: 'default',
    size: 'default',
    disabled: false,
    badgeDot: false,
    badgeStatus: 'danger',
    tooltip: 'Floating action',
  },
};

export default meta;

export const Default: StoryObj = {
  render: (args) => html`
    <div style="height: 120px; position: relative;">
      <vi-float-button
        shape=${args.shape}
        type=${args.type}
        size=${args.size}
        ?disabled=${args.disabled}
        tooltip=${args.tooltip ?? ''}
        description=${args.description ?? ''}
        badge=${args.badge ?? ''}
        ?badge-dot=${args.badgeDot}
        badge-status=${args.badgeStatus}
        in-group
      >
        <vi-icon slot="icon" name="plus"></vi-icon>
      </vi-float-button>
    </div>
  `,
};

export const ShapesAndSizes: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: flex-end; padding: 24px;">
      <!-- Circle default -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button shape="circle" size="default" tooltip="Circle Default (48px)" in-group>
          <vi-icon slot="icon" name="plus"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Circle (48px)</span>
      </div>

      <!-- Circle small -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button shape="circle" size="sm" tooltip="Circle Small (40px)" in-group>
          <vi-icon slot="icon" name="plus"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Circle Sm (40px)</span>
      </div>

      <!-- Square default -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button shape="square" size="default" tooltip="Square Default" in-group>
          <vi-icon slot="icon" name="plus"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Square (48px)</span>
      </div>

      <!-- Square small -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button shape="square" size="sm" tooltip="Square Small" in-group>
          <vi-icon slot="icon" name="plus"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Square Sm (40px)</span>
      </div>
    </div>
  `,
};

export const TypesAndStates: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: center; padding: 24px;">
      <!-- Default -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button type="default" tooltip="Default Type" in-group>
          <vi-icon slot="icon" name="file-text"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Default</span>
      </div>

      <!-- Primary -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button type="primary" tooltip="Primary Type" in-group>
          <vi-icon slot="icon" name="save"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Primary</span>
      </div>

      <!-- Disabled -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <vi-float-button disabled tooltip="Disabled" in-group>
          <vi-icon slot="icon" name="lock"></vi-icon>
        </vi-float-button>
        <span style="font-size: 12px; color: #666;">Disabled</span>
      </div>
    </div>
  `,
};

export const BadgesAndIndicators: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: center; padding: 24px;">
      <!-- Numeric Count Badge -->
      <vi-float-button
        type="primary"
        badge="8"
        badge-status="danger"
        tooltip="8 Unresolved Queries"
        in-group
      >
        <vi-icon slot="icon" name="comment"></vi-icon>
      </vi-float-button>

      <!-- Dot Badge (Success) -->
      <vi-float-button
        badge-dot
        badge-status="success"
        tooltip="System Connected"
        in-group
      >
        <vi-icon slot="icon" name="check"></vi-icon>
      </vi-float-button>

      <!-- Dot Badge (Warning) -->
      <vi-float-button
        badge-dot
        badge-status="warning"
        tooltip="Protocol Alert"
        in-group
      >
        <vi-icon slot="icon" name="triangle-warning"></vi-icon>
      </vi-float-button>

      <!-- Text Count Badge (99+) -->
      <vi-float-button
        badge="99+"
        badge-status="primary"
        tooltip="99+ Notifications"
        in-group
      >
        <vi-icon slot="icon" name="user"></vi-icon>
      </vi-float-button>
    </div>
  `,
};

export const SquareWithDescription: StoryObj = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: center; padding: 24px;">
      <vi-float-button
        shape="square"
        description="Audit"
        tooltip="View Subject Audit Trail"
        in-group
      >
        <vi-icon slot="icon" name="file-text"></vi-icon>
      </vi-float-button>

      <vi-float-button
        shape="square"
        type="primary"
        description="Meds"
        tooltip="Concomitant Medication"
        in-group
      >
        <vi-icon slot="icon" name="capsules"></vi-icon>
      </vi-float-button>

      <vi-float-button
        shape="square"
        description="Forms"
        badge="3"
        badge-status="danger"
        tooltip="Pending CRF Forms"
        in-group
      >
        <vi-icon slot="icon" name="document"></vi-icon>
      </vi-float-button>
    </div>
  `,
};

export const BackToTop: StoryObj = {
  render: () => html`
    <div style="padding: 24px;">
      <p style="margin-bottom: 16px; color: #555;">
        Scroll the container below to see the back-to-top button appear when scrolled past 100px:
      </p>
      <div
        id="scrollable-container"
        style="height: 250px; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px; padding: 16px; position: relative;"
      >
        <div style="height: 800px; background: linear-gradient(to bottom, #f0f4f8, #d9e2ec, #bcccdc); padding: 16px; border-radius: 4px;">
          <p><strong>Top of Container</strong></p>
          <p style="margin-top: 150px;">Scroll down further...</p>
          <p style="margin-top: 300px;">Keep scrolling to see the floating button appear in the bottom-right corner.</p>
        </div>

        <vi-float-button
          back-top
          visibility-height="100"
          scroll-target="#scrollable-container"
          tooltip="Back to Top"
          style="position: sticky; float: right; bottom: 16px; right: 16px;"
          in-group
        ></vi-float-button>
      </div>
    </div>
  `,
};

export const SpeedDialGroupClick: StoryObj = {
  render: () => html`
    <div style="height: 280px; position: relative; display: flex; align-items: flex-end; padding: 24px;">
      <vi-float-button-group trigger="click" aria-label="Clinical quick actions" style="position: relative; inset: auto;">
        <vi-float-button tooltip="Add Adverse Event">
          <vi-icon slot="icon" name="triangle-warning"></vi-icon>
        </vi-float-button>

        <vi-float-button tooltip="Add Concomitant Medication">
          <vi-icon slot="icon" name="capsules"></vi-icon>
        </vi-float-button>

        <vi-float-button type="primary" tooltip="Save CRF Data">
          <vi-icon slot="icon" name="save"></vi-icon>
        </vi-float-button>
      </vi-float-button-group>
    </div>
  `,
};

export const SpeedDialGroupHover: StoryObj = {
  render: () => html`
    <div style="height: 280px; position: relative; display: flex; align-items: flex-end; padding: 24px;">
      <vi-float-button-group trigger="hover" aria-label="Quick navigation speed dial" style="position: relative; inset: auto;">
        <vi-float-button tooltip="Subject Demographics">
          <vi-icon slot="icon" name="user"></vi-icon>
        </vi-float-button>

        <vi-float-button tooltip="Audit Trail Documents">
          <vi-icon slot="icon" name="folder-open"></vi-icon>
        </vi-float-button>

        <vi-float-button type="primary" tooltip="Lock CRF Sheet">
          <vi-icon slot="icon" name="lock"></vi-icon>
        </vi-float-button>
      </vi-float-button-group>
    </div>
  `,
};
