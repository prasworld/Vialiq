import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './index.js';

const meta: Meta = {
  title: 'Components/Content Switcher',
  component: 'vi-content-switcher',
  argTypes: {
    value: {
      control: 'text',
      description: 'The currently active item value',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Visual size of the switcher',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all interactions',
    },
  },
  parameters: {
    actions: {
      handles: ['vi-content-switcher-change'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    value: 'design',
    size: 'md',
    disabled: false,
  },
  render: (args) => html`
    <vi-content-switcher
      value=${ifDefined(args.value)}
      size=${ifDefined(args.size)}
      ?disabled=${args.disabled}
    >
      <vi-switcher-item value="design">Design</vi-switcher-item>
      <vi-switcher-item value="json">JSON</vi-switcher-item>
      <vi-switcher-item value="preview">Preview</vi-switcher-item>
    </vi-content-switcher>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <style>
      .layout-gap {
        display: flex;
        flex-direction: column;
        gap: 24px;
        align-items: flex-start;
      }
    </style>
    <div class="layout-gap">
      <vi-content-switcher value="code" size="sm">
        <vi-switcher-item value="code">Code</vi-switcher-item>
        <vi-switcher-item value="issues">Issues</vi-switcher-item>
        <vi-switcher-item value="pulls">Pull Requests</vi-switcher-item>
      </vi-content-switcher>

      <vi-content-switcher value="code" size="md">
        <vi-switcher-item value="code">Code</vi-switcher-item>
        <vi-switcher-item value="issues">Issues</vi-switcher-item>
        <vi-switcher-item value="pulls">Pull Requests</vi-switcher-item>
      </vi-content-switcher>

      <vi-content-switcher value="code" size="lg">
        <vi-switcher-item value="code">Code</vi-switcher-item>
        <vi-switcher-item value="issues">Issues</vi-switcher-item>
        <vi-switcher-item value="pulls">Pull Requests</vi-switcher-item>
      </vi-content-switcher>
    </div>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <style>
      .layout-gap {
        display: flex;
        flex-direction: column;
        gap: 24px;
        align-items: flex-start;
      }
    </style>
    <div class="layout-gap">
      <div>
        <p
          style="margin-top: 0; margin-bottom: 8px; font-family: sans-serif; font-size: 14px; color: #666;"
        >
          Fully disabled:
        </p>
        <vi-content-switcher value="monthly" disabled>
          <vi-switcher-item value="monthly">Monthly</vi-switcher-item>
          <vi-switcher-item value="annually">Annually</vi-switcher-item>
        </vi-content-switcher>
      </div>

      <div>
        <p
          style="margin-top: 0; margin-bottom: 8px; font-family: sans-serif; font-size: 14px; color: #666;"
        >
          Individual item disabled:
        </p>
        <vi-content-switcher value="monthly">
          <vi-switcher-item value="monthly">Monthly</vi-switcher-item>
          <vi-switcher-item value="annually" disabled
            >Annually (Unavailable)</vi-switcher-item
          >
        </vi-content-switcher>
      </div>
    </div>
  `,
};

export const PreventSwitching: Story = {
  render: () => html`
    <div
      style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; align-items: flex-start;"
    >
      <p style="margin: 0; font-size: 14px; color: #666; max-width: 400px;">
        This switcher intercepts the
        <code>vi-content-switcher-before-change</code> event and prevents
        switching to the <b>Pro</b> plan using
        <code>event.preventDefault()</code>. Try clicking it!
      </p>
      <vi-content-switcher
        value="basic"
        @vi-content-switcher-before-change=${(e: CustomEvent) => {
          if (e.detail.value === 'pro') {
            e.preventDefault();
            alert('Switching to Pro plan is not allowed in this demo!');
          }
        }}
      >
        <vi-switcher-item value="basic">Basic</vi-switcher-item>
        <vi-switcher-item value="pro">Pro</vi-switcher-item>
        <vi-switcher-item value="enterprise">Enterprise</vi-switcher-item>
      </vi-content-switcher>
    </div>
  `,
};

export const BlockLayout: Story = {
  render: () => html`
    <div
      style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px;"
    >
      <p style="margin: 0; font-size: 14px; color: #666;">
        With the <code>block</code> attribute, the switcher stretches to 100% of
        its container's width, distributing the items evenly.
      </p>
      <div
        style="width: 500px; max-width: 100%; border: 1px dashed #ccc; padding: 16px; border-radius: 8px;"
      >
        <vi-content-switcher value="apple" block>
          <vi-switcher-item value="apple">Apple</vi-switcher-item>
          <vi-switcher-item value="orange">Orange</vi-switcher-item>
          <vi-switcher-item value="banana">Banana</vi-switcher-item>
        </vi-content-switcher>
      </div>
    </div>
  `,
};

export const FormIntegration: Story = {
  render: () => html`
    <div
      style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; align-items: flex-start;"
    >
      <p style="margin: 0; font-size: 14px; color: #666; max-width: 400px;">
        The switcher uses <code>ElementInternals</code> to seamlessly integrate
        with native HTML forms. It supports serialization via
        <code>FormData</code> and proper form resets.
      </p>
      <form
        style="padding: 16px; border: 1px solid #eee; border-radius: 8px; display: flex; flex-direction: column; gap: 16px; background: #f9fafb;"
        @submit=${(e: Event) => {
          e.preventDefault();
          const fd = new FormData(e.target as HTMLFormElement);
          alert('Form Submitted!\\n\\nSelected Fruit: ' + fd.get('fruit'));
        }}
      >
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="font-size: 14px; font-weight: 500;"
            >Select your favorite fruit:</label
          >
          <vi-content-switcher name="fruit" value="apple">
            <vi-switcher-item value="apple">Apple</vi-switcher-item>
            <vi-switcher-item value="orange">Orange</vi-switcher-item>
            <vi-switcher-item value="banana">Banana</vi-switcher-item>
          </vi-content-switcher>
        </div>

        <div style="display: flex; gap: 8px;">
          <button
            type="submit"
            style="padding: 6px 12px; cursor: pointer; border: none; background: #0f62fe; color: white; border-radius: 4px;"
          >
            Submit
          </button>
          <button
            type="reset"
            style="padding: 6px 12px; cursor: pointer; border: 1px solid #ccc; background: white; border-radius: 4px;"
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  `,
};

export const FormSections: Story = {
  render: () => {
    // A quick local state manager for the story since we aren't using a framework
    let activeSection = 'personal';

    return html`
      <div
        style="font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; align-items: flex-start;"
      >
        <p style="margin: 0; font-size: 14px; color: #666; max-width: 500px;">
          This form uses a switcher <i>without</i> a
          <code>name</code> attribute. It acts purely as a UI controller to
          toggle between form sections (Personal vs Billing) and does not
          pollute the form's submitted data.
        </p>

        <form
          id="multi-step-form"
          style="padding: 24px; border: 1px solid #eee; border-radius: 8px; display: flex; flex-direction: column; gap: 24px; background: #fff; width: 400px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"
          @submit=${(e: Event) => {
            e.preventDefault();
            const fd = new FormData(e.target as HTMLFormElement);
            const data = Object.fromEntries(fd.entries());
            alert(
              'Form Submitted!\\n\\nData: ' + JSON.stringify(data, null, 2),
            );
          }}
        >
          <vi-content-switcher
            value="${activeSection}"
            block
            @vi-content-switcher-change=${(e: CustomEvent) => {
              activeSection = e.detail.value;
              const form = document.getElementById('multi-step-form');
              form?.querySelectorAll('.form-section').forEach((el) => {
                (el as HTMLElement).style.display =
                  el.id === 'section-' + activeSection ? 'flex' : 'none';
              });
            }}
          >
            <vi-switcher-item value="personal">Personal Info</vi-switcher-item>
            <vi-switcher-item value="billing">Billing Details</vi-switcher-item>
          </vi-content-switcher>

          <!-- Personal Info Section -->
          <div
            id="section-personal"
            class="form-section"
            style="display: flex; flex-direction: column; gap: 12px;"
          >
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 14px;">Full Name</label>
              <input
                name="fullName"
                type="text"
                style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                required
              />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 14px;">Email</label>
              <input
                name="email"
                type="email"
                style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                required
              />
            </div>
          </div>

          <!-- Billing Section -->
          <div
            id="section-billing"
            class="form-section"
            style="display: none; flex-direction: column; gap: 12px;"
          >
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 14px;">Credit Card Number</label>
              <input
                name="card"
                type="text"
                placeholder="**** **** **** ****"
                style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
              />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button
              type="submit"
              style="padding: 8px 16px; cursor: pointer; border: none; background: #0f62fe; color: white; border-radius: 4px; font-weight: bold;"
            >
              Complete Checkout
            </button>
          </div>
        </form>
      </div>
    `;
  },
};

export const WithIcons: Story = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 24px; font-family: sans-serif;"
    >
      <div>
        <p style="margin: 0 0 8px; font-size: 14px; color: #666;">
          Icon and Text:
        </p>
        <vi-content-switcher value="grid">
          <vi-switcher-item value="list">
            <svg slot="icon" viewBox="0 0 24 24">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
            List View
          </vi-switcher-item>
          <vi-switcher-item value="grid">
            <svg slot="icon" viewBox="0 0 24 24">
              <path d="M4 4h6v6H4zm8 0h6v6h-6zm-8 8h6v6H4zm8 0h6v6h-6z" />
            </svg>
            Grid View
          </vi-switcher-item>
        </vi-content-switcher>
      </div>
      <div>
        <p style="margin: 0 0 8px; font-size: 14px; color: #666;">Icon Only:</p>
        <vi-content-switcher value="light">
          <vi-switcher-item value="light" aria-label="Light mode">
            <svg slot="icon" viewBox="0 0 24 24">
              <path
                d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <circle
                cx="12"
                cy="12"
                r="4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </vi-switcher-item>
          <vi-switcher-item value="dark" aria-label="Dark mode">
            <svg slot="icon" viewBox="0 0 24 24">
              <path
                d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </vi-switcher-item>
          <vi-switcher-item value="system" aria-label="System mode">
            <svg slot="icon" viewBox="0 0 24 24">
              <rect
                x="2"
                y="3"
                width="20"
                height="14"
                rx="2"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M8 21h8m-4-4v4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </vi-switcher-item>
        </vi-content-switcher>
      </div>
    </div>
  `,
};
