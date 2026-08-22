import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vi-date-picker.js';
import type { DatePickerMode, ControlStatus } from './types.js';

interface DatePickerArgs {
  mode: DatePickerMode;
  flat: boolean;
  value?: string;
  min: string;
  max: string;
  locale: string;
  disabled: boolean;
  required: boolean;
  weekNumbers: boolean;
  status: ControlStatus;
  validityMessage: string;
  name: string;
  onVialiqChange?: (e: Event) => void;
}

const meta: Meta<DatePickerArgs> = {
  title: 'Components/DatePicker',
  tags: ['autodocs'],
  argTypes: {
    onVialiqChange: { action: 'vialiq-change' },
    mode: {
      control: 'select',
      options: ['date', 'range', 'month', 'month-year', 'week'],
      description: 'Picker mode',
    },
    flat: {
      control: 'boolean',
      description: 'Render inline (no popup trigger button)',
    },
    min: {
      control: 'text',
      description: 'Minimum selectable date (ISO string)',
    },
    max: {
      control: 'text',
      description: 'Maximum selectable date (ISO string)',
    },
    locale: {
      control: 'select',
      options: [
        'en',
        'de-DE',
        'fr-FR',
        'zh-CN',
        'ja',
        'ar',
        'ko',
        'nl',
        'es-ES',
        'pt-BR',
      ],
      description:
        'BCP 47 locale tag — affects calendar labels and segment order',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the picker',
    },
    required: {
      control: 'boolean',
      description: 'Marks the field as required',
    },
    weekNumbers: {
      control: 'boolean',
      description: 'Show ISO week numbers in the calendar',
    },
    status: {
      control: 'select',
      options: ['default', 'valid', 'invalid'],
      description: 'Visual validation state',
    },
    validityMessage: {
      control: 'text',
      description: 'Validation error message shown below the trigger',
    },
    name: {
      control: 'text',
      description: 'Form field name',
    },
  },
};

export default meta;
type Story = StoryObj<DatePickerArgs>;

// ── Shared render helper ───────────────────────────────────────────────────

import './vi-date-picker-input.js';

const render = ({
  mode,
  flat,
  min,
  max,
  locale,
  disabled,
  required,
  weekNumbers,
  status,
  validityMessage,
  name,
  value,
  onVialiqChange,
}: DatePickerArgs) => html`
  <div style="padding: 1.5rem; font-family: sans-serif;">
    <vi-date-picker
      mode=${mode}
      ?flat=${flat}
      ?disabled=${disabled}
      ?required=${required}
      ?week-numbers=${weekNumbers}
      status=${status}
      .validityMessage=${validityMessage}
      name=${name}
      value=${value || ''}
      locale=${locale || ''}
      min=${min || ''}
      max=${max || ''}
      @vialiq-change=${(e: CustomEvent) => onVialiqChange?.(e.detail)}
    >
      ${mode === 'range'
        ? html`
            <vi-date-picker-input
              kind="from"
              label="Start Date"
              placeholder="yyyy-mm-dd"
            ></vi-date-picker-input>
            <vi-date-picker-input
              kind="to"
              label="End Date"
              placeholder="yyyy-mm-dd"
            ></vi-date-picker-input>
          `
        : html`
            <vi-date-picker-input
              label="Select a Date"
              placeholder="yyyy-mm-dd"
            ></vi-date-picker-input>
          `}
    </vi-date-picker>
  </div>
`;

const defaultArgs: DatePickerArgs = {
  mode: 'date',
  flat: false,
  min: '',
  max: '',
  locale: 'en',
  disabled: false,
  required: false,
  weekNumbers: false,
  status: 'default',
  validityMessage: '',
  name: 'date',
};

// ── Stories ────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: 'Date Picker (default)',
  args: { ...defaultArgs },
  render,
};

export const RangeMode: Story = {
  name: 'Range Mode',
  parameters: {
    docs: {
      description: {
        story:
          'Allows the user to select a start and end date. `vialiq-change` detail includes both `rawValue` and `rawEndValue`.',
      },
    },
  },
  args: {
    ...defaultArgs,
    mode: 'range',
    name: 'daterange',
  },
  render,
};

export const MonthMode: Story = {
  name: 'Month Mode',
  parameters: {
    docs: {
      description: {
        story: 'Select only a month and year.',
      },
    },
  },
  args: {
    ...defaultArgs,
    mode: 'month',
    name: 'datemonth',
  },
  render: (args) => html`
    <div style="padding: 1.5rem; font-family: sans-serif;">
      <vi-date-picker
        mode=${args.mode}
        ?flat=${args.flat}
        ?disabled=${args.disabled}
        ?required=${args.required}
        ?week-numbers=${args.weekNumbers}
        status=${args.status}
        .validityMessage=${args.validityMessage}
        name=${args.name}
        locale=${args.locale || ''}
        min=${args.min || ''}
        max=${args.max || ''}
        @vialiq-change=${(e: CustomEvent) => args.onVialiqChange?.(e.detail)}
      >
        <vi-date-picker-input
          label="Select a Month"
          placeholder="YM"
        ></vi-date-picker-input>
      </vi-date-picker>
    </div>
  `,
};

export const WeekMode: Story = {
  name: 'Week Mode',
  parameters: {
    docs: {
      description: {
        story: 'Select an entire week.',
      },
    },
  },
  args: {
    ...defaultArgs,
    mode: 'week',
    name: 'dateweek',
  },
  render,
};

export const WithMinMax: Story = {
  name: 'Min / Max Constraints',
  parameters: {
    docs: {
      description: {
        story:
          'Dates outside the min/max range are greyed out and unselectable.',
      },
    },
  },
  args: {
    ...defaultArgs,
    min: new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10), // 7 days ago
    max: new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10), // 14 days from now
    name: 'constrained-date',
  },
  render,
};

export const WithWeekNumbers: Story = {
  name: 'With ISO Week Numbers',
  args: {
    ...defaultArgs,
    weekNumbers: true,
    name: 'week-date',
  },
  render,
};

export const ProgrammaticRange: Story = {
  name: 'Programmatic Range',
  parameters: {
    docs: {
      description: {
        story:
          'The range can be set programmatically by setting the `value` property to a string in the format `YYYY-MM-DD to YYYY-MM-DD`.',
      },
    },
  },
  args: {
    ...defaultArgs,
    mode: 'range',
    name: 'programmatic-range',
  },
  render: (args) => {
    const setLast7Days = (e: Event) => {
      const picker = (
        e.target as HTMLElement
      ).parentElement?.parentElement?.querySelector('vi-date-picker');
      if (picker) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        const fmt = (d: Date) => d.toISOString().slice(0, 10);
        picker.value = `${fmt(start)} to ${fmt(end)}`;
      }
    };

    return html`
      <div style="padding: 1.5rem; font-family: sans-serif;">
        <div style="margin-bottom: 1.5rem; display: flex; gap: 0.5rem;">
          <button
            @click=${setLast7Days}
            style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 4px; border: 1px solid #d1d5db; background: #fff;"
          >
            Set Last 7 Days
          </button>
          <button
            @click=${(e: Event) => {
              const picker = (
                e.target as HTMLElement
              ).parentElement?.parentElement?.querySelector('vi-date-picker');
              if (picker) picker.value = '';
            }}
            style="padding: 0.5rem 1rem; cursor: pointer; border-radius: 4px; border: 1px solid #d1d5db; background: #fff;"
          >
            Clear Range
          </button>
        </div>
        <vi-date-picker
          mode=${args.mode}
          ?flat=${args.flat}
          ?disabled=${args.disabled}
          ?required=${args.required}
          name=${args.name}
          @vialiq-change=${(e: CustomEvent) => args.onVialiqChange?.(e.detail)}
        >
          <vi-date-picker-input
            kind="from"
            label="Start Date"
            placeholder="yyyy-mm-dd"
          ></vi-date-picker-input>
          <vi-date-picker-input
            kind="to"
            label="End Date"
            placeholder="yyyy-mm-dd"
          ></vi-date-picker-input>
        </vi-date-picker>
      </div>
    `;
  },
};

export const FlatInline: Story = {
  name: 'Flat / Inline Calendar',
  parameters: {
    docs: {
      description: {
        story:
          'When `flat` is set, the calendar renders inline without a trigger button.',
      },
    },
  },
  args: {
    ...defaultArgs,
    flat: true,
    name: 'inline-date',
  },
  render,
};

export const LocaleDeDE: Story = {
  name: 'Locale: de-DE (German)',
  parameters: {
    docs: {
      description: {
        story: 'Calendar labels are rendered in German.',
      },
    },
  },
  args: {
    ...defaultArgs,
    locale: 'de-DE',
    name: 'date-de',
  },
  render,
};

export const LocaleFrFR: Story = {
  name: 'Locale: fr-FR (French)',
  args: {
    ...defaultArgs,
    locale: 'fr-FR',
    name: 'date-fr',
  },
  render,
};

export const LocaleZhCN: Story = {
  name: 'Locale: zh-CN (Chinese Simplified)',
  args: {
    ...defaultArgs,
    locale: 'zh-CN',
    name: 'date-zh',
  },
  render,
};

export const Disabled: Story = {
  name: 'Disabled State',
  args: {
    ...defaultArgs,
    disabled: true,
    name: 'disabled-date',
  },
  render,
};

export const InvalidState: Story = {
  name: 'Invalid State',
  parameters: {
    docs: {
      description: {
        story: 'Shows a red border and an error message below the trigger.',
      },
    },
  },
  args: {
    ...defaultArgs,
    status: 'invalid',
    validityMessage: 'Please select a valid date.',
    name: 'invalid-date',
  },
  render,
};

export const Playground: Story = {
  name: '🎛️ Playground',
  parameters: {
    docs: {
      description: {
        story:
          'All controls are editable. Use the Controls panel to explore all prop combinations.',
      },
    },
  },
  args: {
    ...defaultArgs,
    mode: 'date',
    locale: 'en',
  },
  render,
};

export const ProgrammaticValueUpdate: Story = {
  name: 'Programmatic Value Update',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates updating the `value` property programmatically. The `value` property should always be passed as an ISO 8601 string, regardless of the active locale or display format. Accepted formats based on `mode`:\n\n- `date`: `YYYY-MM-DD`\n- `month` / `month-year`: `YYYY-MM`\n- `week`: `YYYY-Www`\n- `range`: `YYYY-MM-DD to YYYY-MM-DD`',
      },
    },
  },
  args: {
    ...defaultArgs,
    value: '2026-10-12',
    name: 'programmatic-date',
  },
  render: (args) => html`
    <div style="padding: 1.5rem; font-family: sans-serif;">
      <vi-date-picker
        id="prog-picker"
        mode=${args.mode}
        value=${args.value || ''}
        locale=${args.locale || 'en'}
        @vialiq-change=${(e: CustomEvent) => args.onVialiqChange?.(e.detail)}
      >
        <vi-date-picker-input
          label="Select a Date"
          placeholder="yyyy-mm-dd"
        ></vi-date-picker-input>
      </vi-date-picker>

      <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
        <button
          @click=${() =>
            ((
              document.querySelector('#prog-picker') as HTMLInputElement
            ).value = '2025-01-01')}
        >
          Set to 2025-01-01
        </button>
        <button
          @click=${() =>
            ((
              document.querySelector('#prog-picker') as HTMLInputElement
            ).value = '2027-12-31')}
        >
          Set to 2027-12-31
        </button>
        <button
          @click=${() =>
            ((
              document.querySelector('#prog-picker') as HTMLInputElement
            ).value = '')}
        >
          Clear Value
        </button>
      </div>
    </div>
  `,
};

export const Hoisting: Story = {
  render: (args) => html`
    <div
      style="height: 150px; overflow: hidden; border: 2px dashed red; padding: 20px;"
    >
      <p style="margin-bottom: 20px;">
        This container has <code>overflow: hidden</code>. The calendar should
        escape it when hoisted.
      </p>
      <vi-date-picker .hoist=${true}>
        <vi-date-picker-input></vi-date-picker-input>
      </vi-date-picker>
    </div>
  `,
};
