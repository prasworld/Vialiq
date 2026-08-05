import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import type { ViAccordion } from './vi-accordion.js';

const meta: Meta = {
  title: 'Components/Accordion',
  tags: ['autodocs'],
  argTypes: {
    multi: {
      control: 'boolean',
      description: 'Allows multiple items to be expanded at the same time',
    },
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'flush', 'card'],
      description: 'The visual variant of the accordion',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size/padding scaling of the accordion',
    },
  },
};

export default meta;
type Story = StoryObj;

export const Accordion: Story = {
  args: {
    multi: false,
    variant: 'default',
    size: 'md',
  },
  render: (args) => html`
    <div style="width: 100%; padding: 2rem; box-sizing: border-box;">
      <vi-accordion
        ?multi=${args.multi}
        variant=${args.variant}
        size=${args.size}
      >
        <vi-accordion-item label="Personal Information">
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            This section contains personal user details. You can configure your profile details, edit your contact number, and update home addresses inside this accordion region.
          </p>
        </vi-accordion-item>
        <vi-accordion-item label="Security &amp; Privacy">
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            Configure your account authentication methods, review active sessions, manage trusted devices, and edit security preference settings here.
          </p>
        </vi-accordion-item>
        <vi-accordion-item label="Billing Preferences (Disabled)" disabled>
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            This content is non-interactive because the accordion item itself has the disabled property set.
          </p>
        </vi-accordion-item>
        <vi-accordion-item label="Notification Settings">
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            Toggle email notifications, specify mobile SMS alert options, select real-time desktop push preferences, and configure automated weekly digests.
          </p>
        </vi-accordion-item>
      </vi-accordion>
    </div>
  `,
};

export const CardVariant: Story = {
  name: 'Card Variant',
  args: {
    multi: true,
    variant: 'card',
    size: 'md',
  },
  render: (args) => html`
    <div style="width: 100%; padding: 2rem; box-sizing: border-box; background-color: #f9fafb; border-radius: 8px;">
      <vi-accordion
        ?multi=${args.multi}
        variant=${args.variant}
        size=${args.size}
      >
        <vi-accordion-item label="Section 1: Overview">
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            The card variant applies a distinct border, shadow, background, and visual gap layout configuration. It works exceptionally well in settings where each section represents an isolated topic card.
          </p>
        </vi-accordion-item>
        <vi-accordion-item label="Section 2: Benefits">
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            Provides clear spacing and separation between items, visual elevation shadows, clean borders, and modular structure.
          </p>
        </vi-accordion-item>
      </vi-accordion>
    </div>
  `,
};

export const SlottedContent: Story = {
  name: 'Slotted Header & Actions',
  render: () => html`
    <div style="width: 100%; padding: 2rem; box-sizing: border-box;">
      <vi-accordion>
        <vi-accordion-item>
          <span slot="header" style="font-weight: 600; color: #1e3a8a;">
            🔥 Advanced Custom Header
          </span>
          <span slot="header-actions" style="background-color: #ef4444; color: white; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 9999px; font-weight: bold;">
            HOT
          </span>
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            You can slot custom HTML elements directly into the header by targeting the <code>slot="header"</code> and <code>slot="header-actions"</code> parameters on the accordion item.
          </p>
        </vi-accordion-item>
        <vi-accordion-item label="Standard Header">
          <span slot="header-actions" style="background-color: #3b82f6; color: white; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 4px;">
            New Info
          </span>
          <p style="margin: 0; font-family: sans-serif; line-height: 1.5; color: #4b5563;">
            This item uses the standard plain-text label attribute but includes a slotted trailing action badge.
          </p>
        </vi-accordion-item>
      </vi-accordion>
    </div>
  `,
};

export const EventCancellation: Story = {
  name: 'Event Cancellation (Conditional Toggle)',
  render: () => {
    const handleBeforeOpen = (e: Event) => {
      const checkbox = document.getElementById('lock-open-checkbox') as HTMLInputElement;
      if (checkbox && checkbox.checked) {
        e.preventDefault();
        alert('Opening prevented because "Lock Open" is checked!');
      }
    };

    const handleBeforeClose = (e: Event) => {
      const checkbox = document.getElementById('lock-close-checkbox') as HTMLInputElement;
      if (checkbox && checkbox.checked) {
        e.preventDefault();
        alert('Closing prevented because "Lock Close" is checked!');
      }
    };

    return html`
      <div style="width: 100%; padding: 2rem; box-sizing: border-box; font-family: sans-serif;">
        <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem; padding: 1rem; background-color: #f3f4f6; border-radius: 6px; font-size: 0.875rem; max-width: 600px; box-sizing: border-box;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="lock-open-checkbox" checked />
            <strong>Lock Open</strong> (Prevents expansion)
          </label>
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="lock-close-checkbox" />
            <strong>Lock Close</strong> (Prevents collapse)
          </label>
        </div>
        <vi-accordion style="max-width: 600px;">
          <vi-accordion-item
            label="Conditional Accordion Section"
            @vi-accordion-before-open=${handleBeforeOpen}
            @vi-accordion-before-close=${handleBeforeClose}
          >
            <p style="margin: 0; line-height: 1.5; color: #4b5563; font-size: 0.875rem;">
              Try toggling this section with the checkboxes enabled. This demonstrates how parent applications can dynamically inspect conditions (such as unsaved forms or missing validation states) and intercept the <code>vi-accordion-before-open</code> and <code>vi-accordion-before-close</code> events.
            </p>
          </vi-accordion-item>
        </vi-accordion>
      </div>
    `;
  },
};

export const CoordinatedCancellation: Story = {
  name: 'Multi-Item Coordinated Cancellation',
  args: {
    multi: false,
  },
  render: (args) => {
    const handleBeforeCloseSection1 = (e: CustomEvent) => {
      const checkbox = document.getElementById('lock-sec1-close') as HTMLInputElement;
      if (checkbox && checkbox.checked) {
        const isDirectClose = document.activeElement && (document.activeElement.closest('vi-accordion-item') === e.currentTarget);
        
        // Find if accordion is currently in multi-open mode
        const accordion = document.querySelector('vi-accordion') as ViAccordion | null;
        const isMulti = accordion ? accordion.multi : false;

        console.log(e.detail);
        if (isDirectClose) {
          e.preventDefault();
          alert('Section 1 close prevented!');
        } else if (!isMulti) {
          e.preventDefault();
          alert('Section 1 close prevented! Opening other sections is blocked in single-open mode.');
        }
      }
    };

    return html`
      <div style="width: 100%; padding: 2rem; box-sizing: border-box; font-family: sans-serif;">
        <div style="margin-bottom: 1.5rem; padding: 1rem; background-color: #f3f4f6; border-radius: 6px; font-size: 0.875rem; max-width: 600px; box-sizing: border-box;">
          <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; user-select: none;">
            <input type="checkbox" id="lock-sec1-close" checked />
            <strong>Lock Section 1 Close</strong> (When checked, Section 1 cannot close, blocking other sections from opening in single-open mode)
          </label>
        </div>
        <vi-accordion style="max-width: 600px;" ?multi=${args.multi}>
          <vi-accordion-item
            item-id="sec-1"
            label="Section 1: Required Form Inputs (Open by default)"
            open
            @vi-accordion-before-close=${handleBeforeCloseSection1}
          >
            <p style="margin: 0; line-height: 1.5; color: #4b5563; font-size: 0.875rem;">
              This section is configured to prevent closure when the checkbox above is checked. In single-open mode (multi=false), attempting to open any other section will trigger a close check on Section 1. Since Section 1 prevents closing, the other sections will remain closed. In multi-open mode (multi=true), you can open other sections freely alongside Section 1.
            </p>
          </vi-accordion-item>
          <vi-accordion-item
            item-id="sec-2"
            label="Section 2: Next Step"
          >
            <p style="margin: 0; line-height: 1.5; color: #4b5563; font-size: 0.875rem;">
              You can only view this section once Section 1 is allowed to close (uncheck the checkbox above) or when multi-open is enabled.
            </p>
          </vi-accordion-item>
          <vi-accordion-item
            item-id="sec-3"
            label="Section 3: Final Step"
          >
            <p style="margin: 0; line-height: 1.5; color: #4b5563; font-size: 0.875rem;">
              This is the final accordion section.
            </p>
          </vi-accordion-item>
        </vi-accordion>
      </div>
    `;
  },
};
