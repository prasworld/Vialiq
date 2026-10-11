import 'reflect-metadata';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vi-time-picker.js';
import type { TimeFormat, ControlStatus, TimePickerConfig } from './types.js';
import { timePickerLocaleRegistry } from './vi-time-picker-locale-registry.js';

// Pre-register custom locales dynamically to demonstrate runtime registry extension
timePickerLocaleRegistry.register('sv', {
  hoursPlaceholder: 'TT',
  minutesPlaceholder: 'MM',
  secondsPlaceholder: 'SS',
  unknownLabel: 'Okänd tid',
  clockAriaLabel: 'Välj tid',
  clearAriaLabel: 'Rensa tid',
  periodAriaLabel: 'Växla FM/EM, nu {period}',
  requiredMessage: 'Tid är obligatorisk.',
  invalidMessage: 'Ange en giltig tid.',
  minMessage: 'Välj en tid efter eller vid {min}.',
  maxMessage: 'Välj en tid före eller vid {max}.',
});

timePickerLocaleRegistry.register('it', {
  hoursPlaceholder: 'OO',
  minutesPlaceholder: 'MM',
  secondsPlaceholder: 'SS',
  unknownLabel: 'Ora sconosciuta',
  clockAriaLabel: 'Scegli ora',
  clearAriaLabel: 'Cancella ora',
  requiredMessage: "L'ora è obbligatoria.",
});

interface TimePickerArgs {
  value?: string;
  name?: string;
  label?: string;
  helperText?: string;
  format?: TimeFormat;
  step?: number;
  hourStep?: number;
  secondStep?: number;
  showSeconds?: boolean;
  showNow?: boolean;
  timezone?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
  allowUnknown?: boolean;
  clearable?: boolean;
  status?: ControlStatus;
  validityMessage?: string;
  locale?: string;
  hoursPlaceholder?: string;
  minutesPlaceholder?: string;
  secondsPlaceholder?: string;
  config?: Partial<TimePickerConfig>;
  disabledHours?: number[] | ((hour: number) => boolean);
  disabledMinutes?: number[] | ((minute: number, hour?: number) => boolean);
  onViTimePickerChange?: (e: Event) => void;
}

const meta: Meta<TimePickerArgs> = {
  title: 'Components/TimePicker',
  tags: ['autodocs'],
  argTypes: {
    onViTimePickerChange: { action: 'vi-time-picker-change' },
    format: {
      control: 'select',
      options: ['24', '12'],
      description: '12-hour or 24-hour clock',
    },
    step: {
      control: 'number',
      description: 'Minute step increment (e.g. 1, 5, 10, 15, 30)',
    },
    hourStep: {
      control: 'number',
      description: 'Hour step increment (e.g. 1, 2, 4)',
    },
    secondStep: {
      control: 'number',
      description: 'Second step increment (e.g. 1, 5, 10)',
    },
    showNow: {
      control: 'boolean',
      description: 'Displays quick "Now" current time action button',
    },
    timezone: {
      control: 'text',
      description: 'Timezone identifier badge and ISO offset context (e.g. "UTC", "EST", "+05:30")',
    },
    showSeconds: {
      control: 'boolean',
      description: 'Include seconds segment',
    },
    min: {
      control: 'text',
      description: 'Minimum selectable time (e.g. "08:00")',
    },
    max: {
      control: 'text',
      description: 'Maximum selectable time (e.g. "17:00")',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables all interactions',
    },
    required: {
      control: 'boolean',
      description: 'Marks the field as required',
    },
    readonly: {
      control: 'boolean',
      description: 'Prevents editing value',
    },
    allowUnknown: {
      control: 'boolean',
      description: 'Enables clinical "Time unknown" (??:??) toggle',
    },
    clearable: {
      control: 'boolean',
      description: 'Shows a clear button when value is set',
    },
    status: {
      control: 'select',
      options: ['default', 'valid', 'invalid'],
      description: 'Visual validation status',
    },
    validityMessage: {
      control: 'text',
      description: 'Validation feedback message',
    },
    locale: {
      control: 'select',
      options: ['en', 'ja', 'zh', 'fr', 'de', 'es'],
      description: 'BCP 47 language/locale tag controlling default placeholders and labels',
    },
    hoursPlaceholder: {
      control: 'text',
      description: 'Custom placeholder for hours segment (e.g. "HH", "時", "hr")',
    },
    minutesPlaceholder: {
      control: 'text',
      description: 'Custom placeholder for minutes segment (e.g. "mm", "分", "min")',
    },
    secondsPlaceholder: {
      control: 'text',
      description: 'Custom placeholder for seconds segment (e.g. "ss", "秒", "sec")',
    },
    config: {
      control: 'object',
      description: 'Unified configuration object for placeholders, labels, and messages',
    },
    name: {
      control: 'text',
      description: 'Form field name',
    },
    value: {
      control: 'text',
      description: 'Current time value string',
    },
    label: {
      control: 'text',
      description: 'Accessible label text',
    },
    helperText: {
      control: 'text',
      description: 'Helper instruction text',
    },
  },
};

export default meta;
type Story = StoryObj<TimePickerArgs>;

const render = (args: TimePickerArgs) => html`
  <div style="padding: 1.5rem; font-family: sans-serif;">
    <vi-time-picker
      .value=${args.value ?? ''}
      name=${args.name ?? ''}
      label=${args.label ?? ''}
      helper-text=${args.helperText ?? ''}
      format=${args.format ?? '24'}
      .step=${args.step ?? 15}
      ?show-seconds=${args.showSeconds}
      min=${args.min ?? ''}
      max=${args.max ?? ''}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?readonly=${args.readonly}
      ?allow-unknown=${args.allowUnknown}
      ?clearable=${args.clearable}
      status=${args.status ?? 'default'}
      .validityMessage=${args.validityMessage ?? ''}
      locale=${args.locale ?? ''}
      hours-placeholder=${args.hoursPlaceholder ?? ''}
      minutes-placeholder=${args.minutesPlaceholder ?? ''}
      seconds-placeholder=${args.secondsPlaceholder ?? ''}
      .config=${args.config ?? {}}
      @vi-time-picker-change=${(e: CustomEvent) =>
        args.onViTimePickerChange?.(e.detail)}
    ></vi-time-picker>
  </div>
`;

const defaultArgs: TimePickerArgs = {
  value: '14:30',
  name: 'time',
  label: 'Event Time',
  helperText: 'Select an event time (HH:mm)',
  format: '24',
  step: 15,
  showSeconds: false,
  min: '',
  max: '',
  disabled: false,
  required: false,
  readonly: false,
  allowUnknown: false,
  clearable: true,
  status: 'default',
  validityMessage: '',
  locale: 'en',
  hoursPlaceholder: '',
  minutesPlaceholder: '',
  secondsPlaceholder: '',
};

export const DefaultEmpty: Story = {
  name: 'Default (Empty)',
  args: {
    ...defaultArgs,
    value: '',
    label: 'Meeting Time',
    helperText: 'Enter meeting start time',
  },
  render,
};

export const Default24Hour: Story = {
  name: '24-Hour (Default)',
  args: { ...defaultArgs },
  render,
};

export const TwelveHourWithPeriod: Story = {
  name: '12-Hour with AM/PM',
  args: {
    ...defaultArgs,
    format: '12',
    value: '02:30 PM',
    label: 'Appointment Time',
    helperText: 'Use A/P keys or button to toggle period',
  },
  render,
};

export const WithSeconds: Story = {
  name: 'With Seconds (HH:mm:ss)',
  args: {
    ...defaultArgs,
    showSeconds: true,
    value: '09:15:30',
    label: 'Precise Timestamp',
  },
  render,
};

export const SteppedIncrement: Story = {
  name: 'Stepped (5-Minute Intervals)',
  args: {
    ...defaultArgs,
    step: 5,
    value: '08:00',
    helperText: 'Arrow keys jump in 5-minute increments',
  },
  render,
};

export const WithLabelAndHelper: Story = {
  name: 'With Label and Slotted Helper',
  render: () => html`
    <div style="padding: 1.5rem; font-family: sans-serif;">
      <vi-time-picker label="Scheduled Departure" value="10:45" clearable>
        <span slot="helper">Select estimated local departure time</span>
      </vi-time-picker>
    </div>
  `,
};

export const ValidationValid: Story = {
  name: 'Validation: Valid',
  args: {
    ...defaultArgs,
    value: '11:00',
    status: 'valid',
    label: 'Inspection Time',
    helperText: 'Time slot confirmed',
  },
  render,
};

export const ValidationInvalid: Story = {
  name: 'Validation: Invalid',
  args: {
    ...defaultArgs,
    min: '09:00',
    max: '17:00',
    value: '06:30',
    status: 'invalid',
    label: 'Operating Hours',
    validityMessage: 'Time must be between 09:00 and 17:00',
  },
  render,
};

export const ClinicalUnknownTime: Story = {
  name: 'Clinical EDC Unknown Time (CDISC SDTM)',
  args: {
    ...defaultArgs,
    label: 'Dose Administration Time',
    allowUnknown: true,
    value: '??:??',
  },
  render,
};

export const Disabled: Story = {
  name: 'Disabled State',
  args: {
    ...defaultArgs,
    disabled: true,
    value: '12:00',
    label: 'Locked System Time',
  },
  render,
};

export const Readonly: Story = {
  name: 'Readonly State',
  args: {
    ...defaultArgs,
    readonly: true,
    value: '16:30',
    label: 'Submitted Record Time',
  },
  render,
};

export const Clearable: Story = {
  name: 'Clearable with Value',
  args: {
    ...defaultArgs,
    clearable: true,
    value: '18:45',
    label: 'Optional Shift End',
  },
  render,
};

/**
 * Visual Test Matrix:
 * A comprehensive side-by-side snapshot covering every visual state and variant
 * for regression testing (Chromatic, Percy, Backstop).
 */
export const VisualTestMatrix: Story = {
  name: 'Visual Test Matrix (All States)',
  render: () => html`
    <div style="padding: 2rem; font-family: sans-serif; display: flex; flex-direction: column; gap: 2rem; max-width: 1000px;">
      <h2 style="margin: 0; font-size: 1.25rem; font-weight: 600;">Time Picker Visual Regression Matrix</h2>

      <!-- Row 1: Formats & Empty/Filled -->
      <div>
        <h3 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;">1. Clock Formats</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;">
          <vi-time-picker label="24-Hour (Empty)" format="24"></vi-time-picker>
          <vi-time-picker label="24-Hour (Filled)" format="24" value="14:30"></vi-time-picker>
          <vi-time-picker label="12-Hour AM" format="12" value="09:15 AM"></vi-time-picker>
          <vi-time-picker label="12-Hour PM" format="12" value="03:45 PM"></vi-time-picker>
        </div>
      </div>

      <!-- Row 2: Precision & Actions -->
      <div>
        <h3 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;">2. Precision & Actions</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;">
          <vi-time-picker label="24h with Seconds" show-seconds value="14:30:45"></vi-time-picker>
          <vi-time-picker label="12h with Seconds" format="12" show-seconds value="02:15:30 PM"></vi-time-picker>
          <vi-time-picker label="Clearable with Value" clearable value="16:20"></vi-time-picker>
        </div>
      </div>

      <!-- Row 3: Validation States -->
      <div>
        <h3 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;">3. Validation States</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;">
          <vi-time-picker label="Default Status" status="default" value="10:00" helper-text="Standard prompt"></vi-time-picker>
          <vi-time-picker label="Valid Status" status="valid" value="10:00" helper-text="Time confirmed"></vi-time-picker>
          <vi-time-picker
            label="Invalid Status"
            status="invalid"
            value="06:30"
            validity-message="Time must be after 09:00"
          ></vi-time-picker>
        </div>
      </div>

      <!-- Row 4: Disabled, Readonly & Clinical Unknown -->
      <div>
        <h3 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;">4. Disabled, Readonly & Unknown Time</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;">
          <vi-time-picker label="Disabled" disabled value="12:00"></vi-time-picker>
          <vi-time-picker label="Readonly" readonly value="12:00"></vi-time-picker>
          <vi-time-picker label="Unknown Unchecked" allow-unknown value=""></vi-time-picker>
          <vi-time-picker label="Unknown Checked" allow-unknown value="??:??"></vi-time-picker>
        </div>
      </div>

      <!-- Row 5: Form Container Context -->
      <div>
        <h3 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;">5. Form Layout Context</h3>
        <form style="display: flex; flex-direction: column; gap: 1rem; max-width: 360px; padding: 1.25rem; border: 1px solid #e2e8f0; border-radius: 8px;">
          <vi-time-picker label="Start Time" value="09:00" format="12" required></vi-time-picker>
          <vi-time-picker label="End Time" value="05:00 PM" format="12" required helper-text="End of workday"></vi-time-picker>
          <button type="submit" style="padding: 0.5rem 1rem; background: #0056b3; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Save Shift Schedule
          </button>
        </form>
      </div>

      <!-- Row 6: Internationalization & Localization -->
      <div>
        <h3 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: #64748b; text-transform: uppercase;">6. Internationalization & Localized Placeholders</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: flex-start;">
          <vi-time-picker label="English Default (HH/mm)" locale="en"></vi-time-picker>
          <vi-time-picker label="日本語 (locale='ja')" locale="ja" show-seconds></vi-time-picker>
          <vi-time-picker label="中文 (locale='zh')" locale="zh" show-seconds></vi-time-picker>
          <vi-time-picker label="Français (locale='fr')" locale="fr" allow-unknown clearable value="14:30"></vi-time-picker>
          <vi-time-picker label="Deutsch (locale='de')" locale="de" allow-unknown clearable value="16:45"></vi-time-picker>
          <vi-time-picker label="Español (locale='es')" locale="es" allow-unknown clearable value="18:15"></vi-time-picker>
          <vi-time-picker
            label="Custom Config Object"
            show-seconds
            allow-unknown
            min="09:00"
            value="08:00"
            .config=${{
              hoursPlaceholder: 'HHH',
              minutesPlaceholder: 'MMM',
              secondsPlaceholder: 'SSS',
              unknownLabel: 'Heure inconnue (custom)',
              minMessage: 'Veuillez choisir après {min}',
            }}
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `,
};

export const Internationalization: StoryObj<TimePickerArgs> = {
  name: 'Internationalization & Locales',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #1e293b;">1. Locale-Driven Placeholders (Empty State)</h3>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          Notice how input segment placeholders automatically adapt per language:
          Western languages use <strong>HH/mm</strong>, Japanese uses <strong>時/分/秒</strong>, and Chinese uses <strong>时/分/秒</strong>.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem;">
          <vi-time-picker
            label="English (en)"
            locale="en"
            helper-text="Default placeholders: HH / mm"
          ></vi-time-picker>
          <vi-time-picker
            label="日本語 (ja)"
            locale="ja"
            show-seconds
            helper-text="自動プレースホルダー: 時 / 分 / 秒"
          ></vi-time-picker>
          <vi-time-picker
            label="中文 (zh)"
            locale="zh"
            show-seconds
            helper-text="自动占位符: 时 / 分 / 秒"
          ></vi-time-picker>
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #1e293b;">2. Localized Labels, Tooltips & Error Messages</h3>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          ARIA spinbutton labels, unknown time checkbox text, and validation constraints follow each locale's dictionary.
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem;">
          <vi-time-picker
            label="Français (locale='fr')"
            locale="fr"
            allow-unknown
            clearable
            value="15:30"
            helper-text="Heure inconnue checkbox et boutons en français"
          ></vi-time-picker>

          <vi-time-picker
            label="Deutsch (locale='de')"
            locale="de"
            allow-unknown
            min="09:00"
            value="07:30"
            helper-text="Validierungsfehler: Bitte wählen Sie eine Uhrzeit ab 09:00"
          ></vi-time-picker>
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #1e293b;">3. Unified Configuration Object (.config)</h3>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          Overrides any text token without needing separate individual props. Supports reactive in-place mutation.
        </p>
        <vi-time-picker
          label="Custom .config Override"
          show-seconds
          allow-unknown
          required
          .config=${{
            hoursPlaceholder: 'hrs',
            minutesPlaceholder: 'min',
            secondsPlaceholder: 'sec',
            unknownLabel: 'Hora no especificada',
            requiredMessage: '¡Este campo es obligatorio!',
          }}
          helper-text="Custom placeholders (hrs:min:sec) and Spanish unknown label via .config"
        ></vi-time-picker>
      </div>
    </div>
  `,
};

export const LocalePlaceholders: StoryObj<TimePickerArgs> = {
  name: 'Locale & Custom Placeholders',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h2 style="margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">Placeholder Localization & Customization</h2>
        <p style="margin: 0 0 1.5rem 0; font-size: 0.875rem; color: #64748b;">
          Placeholders dynamically reflect the active locale, or can be customized per project via direct attributes or the <code>.config</code> object.
        </p>
      </div>

      <!-- Comparison Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
        <!-- English 24h -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;">English Default (24h)</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;">HH : mm</span>
          <vi-time-picker label="24-Hour" locale="en"></vi-time-picker>
        </div>

        <!-- English 12h -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;">English 12-Hour</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;">hh : mm [AM/PM]</span>
          <vi-time-picker label="12-Hour" format="12" locale="en"></vi-time-picker>
        </div>

        <!-- Japanese -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;">日本語 (ja)</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;">時 : 分 : 秒</span>
          <vi-time-picker label="日本語 (時・分・秒)" locale="ja" show-seconds></vi-time-picker>
        </div>

        <!-- Chinese -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;">中文 (zh)</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;">时 : 分 : 秒</span>
          <vi-time-picker label="中文 (时・分・秒)" locale="zh" show-seconds></vi-time-picker>
        </div>

        <!-- Custom HTML Attributes -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;">Custom HTML Attributes</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;">hours-placeholder="時"</span>
          <vi-time-picker
            label="Direct Attributes"
            hours-placeholder="時"
            minutes-placeholder="分"
            seconds-placeholder="秒"
            show-seconds
          ></vi-time-picker>
        </div>

        <!-- Custom via .config Object -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1e293b;">Custom via .config</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #f1f5f9; border-radius: 4px; font-size: 0.75rem; color: #475569; margin-bottom: 0.75rem; font-family: monospace;">{ hoursPlaceholder: 'hr' }</span>
          <vi-time-picker
            label="Custom Labels"
            show-seconds
            .config=${{
              hoursPlaceholder: 'hr',
              minutesPlaceholder: 'min',
              secondsPlaceholder: 'sec',
            }}
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `,
};

export const CustomLocaleRegistry: StoryObj<TimePickerArgs> = {
  name: 'Custom Locale Registry (DIP / tsyringe)',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h2 style="margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">
          Dynamic Locale Registration via Singleton Registry
        </h2>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          New languages can be registered at runtime via <code>timePickerLocaleRegistry.register('sv', {...})</code>
          without modifying component source code. The component resolves it automatically via Dependency Inversion.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
        <!-- Swedish (sv) registered dynamically -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 1rem; color: #1e293b;">Svenska (locale="sv")</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 0.75rem; margin-bottom: 0.75rem; font-family: monospace;">
            Placeholder: TT / MM / SS
          </span>
          <vi-time-picker
            label="Svenska (Sverige)"
            locale="sv"
            allow-unknown
            show-seconds
            clearable
            helper-text="Dynamiskt registrerad: TT/MM/SS, Okänd tid"
          ></vi-time-picker>
        </div>

        <!-- Italian (it) registered dynamically -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 1rem; color: #1e293b;">Italiano (locale="it")</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 0.75rem; margin-bottom: 0.75rem; font-family: monospace;">
            Placeholder: OO / MM / SS
          </span>
          <vi-time-picker
            label="Italiano (Italia)"
            locale="it"
            allow-unknown
            show-seconds
            clearable
            helper-text="Registrato dinamicamente: OO/MM/SS, Ora sconosciuta"
          ></vi-time-picker>
        </div>

        <!-- Unknown locale with fallback -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 1rem; color: #1e293b;">Unknown Locale (Fallback)</h4>
          <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #fef3c7; color: #92400e; border-radius: 4px; font-size: 0.75rem; margin-bottom: 0.75rem; font-family: monospace;">
            locale="xx-YY" → English Fallback
          </span>
          <vi-time-picker
            label="Unregistered Tag"
            locale="xx-YY"
            allow-unknown
            show-seconds
            helper-text="Automatically falls back to English defaults"
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `,
};

export const NowQuickAction: StoryObj<TimePickerArgs> = {
  name: 'Quick Action "Now" Button',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h2 style="margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">
          One-Click "Now" Current Time Capture
        </h2>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          Enterprise forms frequently require stamping immediate action times (e.g. medication administration, sample collection, check-in).
          Enabling <code>show-now</code> renders a high-visibility "Now" button that instantly stamps the system clock.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">24-Hour Military "Now"</h4>
          <vi-time-picker
            label="Sample Collection Timestamp"
            show-now
            clearable
            helper-text="Click 'Now' to populate current hours and minutes"
          ></vi-time-picker>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">12-Hour with Seconds "Now"</h4>
          <vi-time-picker
            label="Medication Dose Administered"
            format="12"
            show-seconds
            show-now
            clearable
            helper-text="Captures exact second and AM/PM period"
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `,
};

export const TimezoneContext: StoryObj<TimePickerArgs> = {
  name: 'Timezone Indicator & Offset Serialization',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h2 style="margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">
          Clinical Multi-Site Timezone Badging
        </h2>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          Prevents time ambiguity across international multi-center trials. The <code>timezone</code> prop displays a pill badge
          inside the input box and automatically formats ISO serialization (e.g. <code>14:30Z</code> or <code>14:30+05:30</code>).
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">UTC Reference Clock</h4>
          <vi-time-picker
            label="Adverse Event Onset (UTC)"
            timezone="UTC"
            value="14:30"
            helper-text="Emits isoValue: 14:30Z"
          ></vi-time-picker>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Site Local Timezone (EST)</h4>
          <vi-time-picker
            label="Boston Trial Site (EST)"
            timezone="EST"
            format="12"
            value="09:15 AM"
            helper-text="Site-specific local time indicator"
          ></vi-time-picker>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Numerical ISO Offset (+05:30)</h4>
          <vi-time-picker
            label="Mumbai Lab Site (+05:30)"
            timezone="+05:30"
            value="19:45"
            helper-text="Emits isoValue: 19:45+05:30"
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `,
};

export const PartialUnknownCDISC: StoryObj<TimePickerArgs> = {
  name: 'CDISC SDTM Segment-Level Unknown Time',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h2 style="margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">
          CDISC SDTM Partial Unknown Time Capture
        </h2>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          Clinical EDC guidelines (FDA/CDISC) require recording partially known historical times (e.g., patient remembers the hour 14:00 but not minutes: <code>14:??</code>).
          The component marks the "Time unknown" checkbox as indeterminate (<code>-</code>) and validates cleanly without blocking submission.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Hour Known Only (14:??)</h4>
          <vi-time-picker
            label="Concomitant Meds Onset"
            allow-unknown
            value="14:??"
            helper-text="Known hour 14, unknown minutes"
          ></vi-time-picker>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Minute Known Only (??:30)</h4>
          <vi-time-picker
            label="Symptom Resolution"
            allow-unknown
            value="??:30"
            helper-text="Known at half-hour, hour unknown"
          ></vi-time-picker>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Completely Unknown (??:??)</h4>
          <vi-time-picker
            label="Historical Medical History"
            allow-unknown
            value="??:??"
            helper-text="Checkbox is fully checked"
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `,
};

export const DisabledTimesValidation: StoryObj<TimePickerArgs> = {
  name: 'Custom Blackout / Disabled Hours & Minutes',
  render: () => {
    // 12:00 to 13:59 lunch break disabled
    const lunchHours = [12, 13];
    // Minutes blackout: 00, 15, 30, 45 only allowed (others disabled)
    const disabledMinutesFn = (m: number) => m % 15 !== 0;

    return html`
      <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
        <div>
          <h2 style="margin: 0 0 0.25rem 0; font-size: 125rem; font-weight: 600; color: #0f172a;">
            Restricted Time Windows & Blackout Validation
          </h2>
          <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
            Enforce custom scheduling blackout periods using <code>disabledHours</code> arrays or <code>disabledMinutes</code> callback predicates.
            Invalid times trigger automated browser and accessibility error states.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Lunch Break Hours Disabled [12, 13]</h4>
            <vi-time-picker
              label="Appointment Booking"
              value="12:30"
              .disabledHours=${lunchHours}
              helper-text="Hours 12 and 13 are blackout times"
            ></vi-time-picker>
          </div>

          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">Quarter-Hour Slots Only (Function Predicate)</h4>
            <vi-time-picker
              label="Infusion Slot"
              value="10:12"
              .disabledMinutes=${disabledMinutesFn}
              helper-text="Only :00, :15, :30, :45 minutes are permitted"
            ></vi-time-picker>
          </div>
        </div>
      </div>
    `;
  },
};

export const CustomStepIncrements: StoryObj<TimePickerArgs> = {
  name: 'Custom Hour, Minute & Second Steps',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 860px; padding: 1.5rem; font-family: sans-serif;">
      <div>
        <h2 style="margin: 0 0 0.25rem 0; font-size: 1.25rem; font-weight: 600; color: #0f172a;">
          Configurable Stepping Granularity
        </h2>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; color: #64748b;">
          Fine-tune keyboard Arrow Up/Down and step buttons independently across hours (<code>hour-step</code>),
          minutes (<code>step</code>), and seconds (<code>second-step</code>).
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">2-Hour & 30-Minute Increments</h4>
          <vi-time-picker
            label="Shift Schedule"
            value="08:00"
            hour-step="2"
            step="30"
            helper-text="ArrowUp on hour jumps by 2; on minute jumps by 30"
          ></vi-time-picker>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem;">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b;">10-Second Precision Increments</h4>
          <vi-time-picker
            label="Telemetry Heart Rate Sync"
            value="14:00:00"
            show-seconds
            second-step="10"
            helper-text="ArrowUp on second jumps in 10-second increments"
          ></vi-time-picker>
        </div>
      </div>
    </div>
  `,
};


