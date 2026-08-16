import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { ControlStatus } from '../base/validity-mixin.js';
import './vi-select.js';

const meta: Meta<SelectArgs> = {
  title: 'Components/Select',
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    value: {
      control: 'text',
      description: 'Current input value',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the input',
    },
    required: {
      control: 'boolean',
      description: 'Marks input as required',
    },
    clearable: {
      control: 'boolean',
      description: 'Shows a clear button when a value is selected',
    },
    status: {
      control: 'select',
      options: ['default', 'valid', 'invalid'],
      description: "Visual state: 'default' (neutral), 'valid' (green), 'invalid' (red)",
    },
    validityMessage: {
      control: 'text',
      description: 'Validation message — colour is derived from status',
    },
    name: {
      control: 'text',
      description: 'Input name attribute',
    },
  },
};

export default meta;
type Story = StoryObj<SelectArgs>;

interface SelectArgs {
  placeholder: string;
  value: string;
  disabled: boolean;
  required: boolean;
  clearable: boolean;
  status: ControlStatus;
  validityMessage: string;
  name: string;
}

const renderSelect = ({ placeholder, value, disabled, required, clearable, status, validityMessage, name }: SelectArgs) => html`
  <vi-select
    placeholder=${placeholder}
    .value=${value}
    ?disabled=${disabled}
    ?required=${required}
    ?clearable=${clearable}
    status=${status}
    .validityMessage=${validityMessage}
    name=${name}
  >
    <vi-select-option value="M" label="Male"></vi-select-option>
    <vi-select-option value="F" label="Female"></vi-select-option>
    <vi-select-option value="I" label="Intersex"></vi-select-option>
    <vi-select-option value="UNK" label="Unknown / Not reported"></vi-select-option>
  </vi-select>
`;

export const Default: Story = {
  name: 'Default Select',
  args: {
    placeholder: 'Select sex...',
    value: '',
    disabled: false,
    required: false,
    clearable: false,
    status: 'default',
    validityMessage: '',
    name: 'sex',
  },
  render: renderSelect,
};

export const Grouped: Story = {
  name: 'Grouped Options',
  args: {
    ...Default.args,
    placeholder: 'Select grade...',
    name: 'aeGrade',
  },
  render: ({ placeholder, disabled, required, clearable, status, validityMessage, name }: SelectArgs) => html`
    <vi-select
      placeholder=${placeholder}
      ?disabled=${disabled}
      ?required=${required}
      ?clearable=${clearable}
      status=${status}
      .validityMessage=${validityMessage}
      name=${name}
    >
      <vi-select-option value="1" label="Grade 1 — Mild" group="Non-serious"></vi-select-option>
      <vi-select-option value="2" label="Grade 2 — Moderate" group="Non-serious"></vi-select-option>
      <vi-select-option value="3" label="Grade 3 — Severe" group="Serious"></vi-select-option>
      <vi-select-option value="4" label="Grade 4 — Life-Threatening" group="Serious"></vi-select-option>
      <vi-select-option value="5" label="Grade 5 — Fatal" group="Serious"></vi-select-option>
    </vi-select>
  `,
};

export const Clearable: Story = {
  name: 'Clearable',
  args: {
    ...Default.args,
    clearable: true,
    value: 'M',
  },
  render: renderSelect,
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    ...Default.args,
    disabled: true,
    value: 'F',
  },
  render: renderSelect,
};

export const Invalid: Story = {
  name: 'Invalid State',
  args: {
    ...Default.args,
    status: 'invalid',
    validityMessage: 'This field is required',
    required: true,
  },
  render: renderSelect,
};

export const Valid: Story = {
  name: 'Valid State',
  args: {
    ...Default.args,
    status: 'valid',
    validityMessage: 'Looks good!',
    value: 'M',
  },
  render: renderSelect,
};

export const WithHelper: Story = {
  name: 'With Helper Text',
  args: {
    ...Default.args,
  },
  render: ({ placeholder, value, disabled, required, clearable, status, validityMessage, name }: SelectArgs) => html`
    <vi-select
      placeholder=${placeholder}
      .value=${value}
      ?disabled=${disabled}
      ?required=${required}
      ?clearable=${clearable}
      status=${status}
      .validityMessage=${validityMessage}
      name=${name}
    >
      <vi-select-option value="1" label="Option 1"></vi-select-option>
      <vi-select-option value="2" label="Option 2"></vi-select-option>
      <span slot="helper">Please select one of the available options.</span>
    </vi-select>
  `,
};

export const WrappedText: Story = {
  name: 'Wrapped Text',
  args: {
    ...Default.args,
    placeholder: 'Select a lengthy option...',
    // @ts-ignore
    wrapText: true,
  },
  argTypes: {
    // @ts-ignore
    wrapText: {
      control: 'boolean',
      description: 'Allows long text to wrap instead of truncating with an ellipsis',
    },
  },
  render: ({ placeholder, value, disabled, required, clearable, status, validityMessage, name, wrapText }: SelectArgs & { wrapText?: boolean }) => html`
    <div style="width: 250px;">
      <vi-select
        placeholder=${placeholder}
        .value=${value}
        ?disabled=${disabled}
        ?required=${required}
        ?clearable=${clearable}
        status=${status}
        .validityMessage=${validityMessage}
        name=${name}
        ?wrap-text=${wrapText}
      >
        <vi-select-option value="1" label="A very short option"></vi-select-option>
        <vi-select-option value="2" label="This is an extremely long option that will definitely overflow the container and should wrap gracefully onto the next line if the wrap-text property is working properly."></vi-select-option>
        <vi-select-option value="3" label="Another normal option"></vi-select-option>
      </vi-select>
    </div>
  `,
};

export const CustomTemplates: Story = {
  name: 'Custom Templates',
  args: {
    ...Default.args,
    placeholder: 'Select a user...',
  },
  render: ({ placeholder, value, disabled, required, clearable, status, validityMessage, name }: SelectArgs) => html`
    <style>
      .custom-option {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .custom-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--vi-layer-03, #e5e7eb);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: var(--vi-text-secondary, #4b5563);
        flex-shrink: 0;
      }
      .custom-details {
        display: flex;
        flex-direction: column;
      }
      .custom-name {
        font-weight: 500;
      }
      .custom-role {
        font-size: 12px;
        color: var(--vi-text-secondary, #6b7280);
      }
    </style>
    <vi-select
      placeholder=${placeholder}
      .value=${value}
      ?disabled=${disabled}
      ?required=${required}
      ?clearable=${clearable}
      status=${status}
      .validityMessage=${validityMessage}
      name=${name}
    >
      <vi-select-option value="user1" label="Jane Doe">
        <div class="custom-option">
          <div class="custom-avatar">JD</div>
          <div class="custom-details">
            <span class="custom-name">Jane Doe</span>
            <span class="custom-role">Administrator</span>
          </div>
        </div>
      </vi-select-option>
      
      <vi-select-option value="user2" label="John Smith">
        <div class="custom-option">
          <div class="custom-avatar">JS</div>
          <div class="custom-details">
            <span class="custom-name">John Smith</span>
            <span class="custom-role">Developer</span>
          </div>
        </div>
      </vi-select-option>

      <vi-select-option value="user3" label="Alice Johnson" disabled>
        <div class="custom-option">
          <div class="custom-avatar">AJ</div>
          <div class="custom-details">
            <span class="custom-name">Alice Johnson</span>
            <span class="custom-role">Viewer (Deactivated)</span>
          </div>
        </div>
      </vi-select-option>
    </vi-select>
  `,
};

export const TypeAhead: Story = {
  name: 'Keyboard Type-ahead',
  args: {
    ...Default.args,
    placeholder: 'Type to search states...',
  },
  render: ({ placeholder, value, disabled, required, clearable, status, validityMessage, name }: SelectArgs) => html`
    <div style="width: 250px;">
      <vi-select
        placeholder=${placeholder}
        .value=${value}
        ?disabled=${disabled}
        ?required=${required}
        ?clearable=${clearable}
        status=${status}
        .validityMessage=${validityMessage}
        name=${name}
      >
        <vi-select-option value="al" label="Alabama"></vi-select-option>
        <vi-select-option value="ak" label="Alaska"></vi-select-option>
        <vi-select-option value="az" label="Arizona"></vi-select-option>
        <vi-select-option value="ar" label="Arkansas"></vi-select-option>
        <vi-select-option value="ca" label="California"></vi-select-option>
        <vi-select-option value="co" label="Colorado"></vi-select-option>
        <vi-select-option value="ct" label="Connecticut"></vi-select-option>
        <vi-select-option value="de" label="Delaware"></vi-select-option>
        <vi-select-option value="fl" label="Florida"></vi-select-option>
        <vi-select-option value="ga" label="Georgia"></vi-select-option>
        <vi-select-option value="hi" label="Hawaii"></vi-select-option>
        <vi-select-option value="id" label="Idaho"></vi-select-option>
        <vi-select-option value="il" label="Illinois"></vi-select-option>
        <vi-select-option value="in" label="Indiana"></vi-select-option>
        <vi-select-option value="ia" label="Iowa"></vi-select-option>
        <vi-select-option value="ks" label="Kansas"></vi-select-option>
        <vi-select-option value="ky" label="Kentucky"></vi-select-option>
        <vi-select-option value="la" label="Louisiana"></vi-select-option>
        <vi-select-option value="me" label="Maine"></vi-select-option>
        <vi-select-option value="md" label="Maryland"></vi-select-option>
        <vi-select-option value="ma" label="Massachusetts"></vi-select-option>
        <vi-select-option value="mi" label="Michigan"></vi-select-option>
        <vi-select-option value="mn" label="Minnesota"></vi-select-option>
        <vi-select-option value="ms" label="Mississippi"></vi-select-option>
        <vi-select-option value="mo" label="Missouri"></vi-select-option>
      </vi-select>
    </div>
  `,
};

export const OptionGroups: Story = {
  name: 'Option Groups',
  args: {
    ...Default.args,
    placeholder: 'Select a fruit...',
  },
  render: ({ placeholder, value, disabled, required, clearable, status, validityMessage, name }: SelectArgs) => html`
    <div style="width: 250px;">
      <vi-select
        placeholder=${placeholder}
        .value=${value}
        ?disabled=${disabled}
        ?required=${required}
        ?clearable=${clearable}
        status=${status}
        .validityMessage=${validityMessage}
        name=${name}
      >
        <vi-select-group label="Citrus">
          <vi-select-option value="orange" label="Orange"></vi-select-option>
          <vi-select-option value="lemon" label="Lemon"></vi-select-option>
          <vi-select-option value="lime" label="Lime"></vi-select-option>
        </vi-select-group>
        <vi-select-group label="Berries">
          <vi-select-option value="strawberry" label="Strawberry"></vi-select-option>
          <vi-select-option value="blueberry" label="Blueberry"></vi-select-option>
          <vi-select-option value="raspberry" label="Raspberry"></vi-select-option>
        </vi-select-group>
        <vi-select-group label="Other">
          <vi-select-option value="apple" label="Apple"></vi-select-option>
          <vi-select-option value="banana" label="Banana"></vi-select-option>
          <vi-select-option value="grape" label="Grape"></vi-select-option>
        </vi-select-group>
      </vi-select>
    </div>
  `,
};

export const PlacementAndWidth: Story = {
  name: 'Placement & Fit Width',
  args: {
    ...Default.args,
    placeholder: 'Select a user...',
    matchWidth: false,
    placement: 'top-start'
  },
  render: ({ placeholder, value, disabled, required, clearable, status, validityMessage, name, matchWidth, placement }: SelectArgs & { matchWidth?: boolean, placement?: string }) => html`
    <div style="width: 150px; margin-top: 150px;">
      <vi-select
        placeholder=${placeholder}
        .value=${value}
        ?disabled=${disabled}
        ?required=${required}
        ?clearable=${clearable}
        status=${status}
        .validityMessage=${validityMessage}
        name=${name}
        ?match-width=${matchWidth}
        placement=${placement}
      >
        <vi-select-option value="user1" label="Jane Doe">
          <div style="display: flex; gap: 8px; align-items: center; white-space: nowrap;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">JD</div>
            <div>
              <div style="font-weight: 500;">Jane Doe</div>
              <div style="font-size: 12px; color: #6b7280;">jane.doe@example.com - Senior Software Engineer</div>
            </div>
          </div>
        </vi-select-option>
        <vi-select-option value="user2" label="John Smith">
          <div style="display: flex; gap: 8px; align-items: center; white-space: nowrap;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">JS</div>
            <div>
              <div style="font-weight: 500;">John Smith</div>
              <div style="font-size: 12px; color: #6b7280;">john.smith@example.com - Product Manager</div>
            </div>
          </div>
        </vi-select-option>
      </vi-select>
    </div>
  `,
};

export const FormReset: Story = {
  name: 'Form Reset',
  args: {
    ...Default.args,
    placeholder: 'Select an option...',
    value: 'option1',
  },
  render: ({ placeholder, disabled, required, clearable, status, validityMessage, name }: SelectArgs) => html`
    <form @reset=${(e: Event) => console.log('Form reset fired!')} @submit=${(e: Event) => e.preventDefault()}>
      <div style="width: 250px; display: flex; flex-direction: column; gap: 16px;">
        <vi-select
          placeholder=${placeholder}
          value="option1"
          ?disabled=${disabled}
          ?required=${required}
          ?clearable=${clearable}
          status=${status}
          .validityMessage=${validityMessage}
          name=${name}
        >
          <vi-select-option value="option1" label="Option 1"></vi-select-option>
          <vi-select-option value="option2" label="Option 2"></vi-select-option>
          <vi-select-option value="option3" label="Option 3"></vi-select-option>
        </vi-select>
        <div style="display: flex; gap: 8px;">
          <vi-button type="reset" variant="neutral">Reset Form</vi-button>
          <vi-button type="submit" variant="primary">Submit</vi-button>
        </div>
        <p style="font-size: 14px; color: #6b7280;">Change the select value and click Reset Form. It will revert to "Option 1".</p>
      </div>
    </form>
  `,
};
