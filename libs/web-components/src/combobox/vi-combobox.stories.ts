import type { Meta, StoryObj } from '@storybook/web-components';
import { html, LitElement } from 'lit';
import './vi-combobox.js';
import './vi-combobox-item.js';
import type { ComboboxOption, RenderOptionParams } from './vi-combobox.types';

const sampleOptions: ComboboxOption[] = [
  {
    value: 'US',
    label: 'United States',
    description: 'UTC-5 to UTC-8',
    icon: 'globe',
  },
  { value: 'GB', label: 'United Kingdom', description: 'UTC+0', icon: 'globe' },
  { value: 'DE', label: 'Germany', description: 'UTC+1', icon: 'globe' },
  { value: 'JP', label: 'Japan', description: 'UTC+9', icon: 'globe' },
  { value: 'AU', label: 'Australia', description: 'UTC+10', icon: 'globe' },
];

const meta: Meta = {
  title: 'Components/Combobox',
  component: 'vi-combobox',
  parameters: {
    docs: {
      description: {
        component:
          'Searchable, filterable combobox with support for data-driven options and slotted <vi-combobox-item> custom templates.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'multi', 'tags', 'creatable'],
    },
    searchable: { control: 'boolean' },
    clearable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    loading: { control: 'boolean' },
    status: {
      control: 'select',
      options: ['default', 'valid', 'invalid'],
    },
    validityMessage: { control: 'text' },
  },
};

export default meta;

export const Default: StoryObj = {
  render: (args) => html`
    <div style="max-width: 400px; padding: 20px;">
      <vi-combobox
        mode=${args.mode || 'single'}
        ?searchable=${args.searchable ?? true}
        ?clearable=${args.clearable ?? true}
        ?disabled=${args.disabled ?? false}
        ?required=${args.required ?? false}
        ?loading=${args.loading ?? false}
        status=${args.status || 'default'}
        validity-message=${args.validityMessage || ''}
        .options=${sampleOptions}
        placeholder="Select a country..."
      ></vi-combobox>
    </div>
  `,
};

export const MultiSelectWithTags: StoryObj = {
  render: () => html`
    <div style="max-width: 400px; padding: 20px;">
      <vi-combobox
        mode="multi"
        clearable
        .options=${sampleOptions}
        placeholder="Select countries..."
      ></vi-combobox>
    </div>
  `,
};

export const SlottedCustomItemsWithDataPayload: StoryObj = {
  render: () => html`
    <div style="max-width: 450px; padding: 20px;">
      <vi-combobox
        mode="single"
        placeholder="Select team member..."
        @vi-change=${(e: CustomEvent) => {
          console.log('Selected value:', e.detail.value);
          console.log('Payload data:', e.detail.data);
        }}
      >
        <vi-combobox-item
          value="usr-1"
          label="Alice Johnson"
          .data=${{
            id: 101,
            role: 'Principal Investigator',
            email: 'alice@vialiq.com',
          }}
        >
          <div style="display: flex; flex-direction: column;">
            <strong style="font-size: 14px; color: var(--vi-text-primary);"
              >Alice Johnson</strong
            >
            <span style="font-size: 12px; color: var(--vi-text-secondary);"
              >PI · alice@vialiq.com</span
            >
          </div>
        </vi-combobox-item>

        <vi-combobox-item
          value="usr-2"
          label="Bob Smith"
          .data=${{
            id: 102,
            role: 'Clinical Research Associate',
            email: 'bob@vialiq.com',
          }}
        >
          <div style="display: flex; flex-direction: column;">
            <strong style="font-size: 14px; color: var(--vi-text-primary);"
              >Bob Smith</strong
            >
            <span style="font-size: 12px; color: var(--vi-text-secondary);"
              >CRA · bob@vialiq.com</span
            >
          </div>
        </vi-combobox-item>
      </vi-combobox>
    </div>
  `,
};

export const NonSearchableDropdown: StoryObj = {
  render: () => html`
    <div style="max-width: 400px; padding: 20px;">
      <vi-combobox
        mode="single"
        searchable="false"
        clearable
        .options=${sampleOptions}
        placeholder="Select country (no text search)..."
      ></vi-combobox>
    </div>
  `,
};

export const CreatableMode: StoryObj = {
  render: () => html`
    <div style="max-width: 400px; padding: 20px;">
      <vi-combobox
        mode="creatable"
        .options=${[
          { value: 'mg', label: 'mg (Milligrams)' },
          { value: 'ml', label: 'mL (Milliliters)' },
        ]}
        placeholder="Select or type custom unit..."
        create-text='Use "{query}" as custom unit'
      ></vi-combobox>
    </div>
  `,
};

export const CreatableModeWithCustomTemplate: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates how to use `renderCreateOption` to provide a custom HTML template for the "Create" option.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 400px; padding: 20px;">
      <vi-combobox
        mode="creatable"
        .options=${[
          { value: 'mg', label: 'mg (Milligrams)' },
          { value: 'ml', label: 'mL (Milliliters)' },
        ]}
        placeholder="Type a new unit to see custom template..."
        .renderCreateOption=${(query: string) => html`
          <div
            style="display: flex; align-items: center; gap: 8px; color: #4f46e5; padding: 4px;"
          >
            <div
              style="background: #e0e7ff; border-radius: 4px; padding: 2px 4px; font-weight: bold; font-size: 10px;"
            >
              NEW
            </div>
            <span>Create custom unit: <strong>${query}</strong></span>
          </div>
        `}
      ></vi-combobox>
    </div>
  `,
};

/**
 * Demonstrates slotted mode with `searchText` for full-corpus search.
 *
 * Each `<vi-combobox-item>` has a rich custom template showing role + email.
 * The `searchText` array exposes all searchable terms (name, abbreviation, email).
 *
 * Try typing:
 * - "alice"  → matches Alice (via label)
 * - "PI"     → matches Alice (via abbreviation in searchText)
 * - "cra"    → matches Bob (via role abbreviation)
 * - "bob@"   → matches Bob (via email)
 * - "zzz"    → shows "No results found" empty state
 *
 * The `vi-filter` event is used to drive a data-attr highlight — open the console
 * to see `{ query, results, matchedValues }` logged on every keypress.
 */
export const SlottedItemsWithSearch: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          '`searchText` lets each slotted item declare its full search corpus independently ' +
          'of its display label. The combobox hides non-matching items via `element.hidden`. ' +
          'Listen to `vi-filter` for `matchedValues` to apply app-side highlighting.',
      },
    },
  },
  render: () => {
    const teamMembers = [
      {
        value: 'usr-1',
        label: 'Alice Johnson',
        role: 'Principal Investigator',
        abbr: 'PI',
        email: 'alice@vialiq.com',
        data: { id: 101 },
      },
      {
        value: 'usr-2',
        label: 'Bob Smith',
        role: 'Clinical Research Associate',
        abbr: 'CRA',
        email: 'bob@vialiq.com',
        data: { id: 102 },
      },
      {
        value: 'usr-3',
        label: 'Carol Davies',
        role: 'Data Manager',
        abbr: 'DM',
        email: 'carol@vialiq.com',
        data: { id: 103 },
      },
    ];

    return html`
      <div style="max-width: 480px; padding: 24px; font-family: sans-serif;">
        <p style="font-size: 12px; color: #666; margin: 0 0 12px;">
          Try searching: <code>alice</code>, <code>PI</code>, <code>cra</code>,
          <code>bob@</code>, <code>data manager</code>
        </p>

        <vi-combobox
          mode="single"
          placeholder="Search team members..."
          @vi-change=${(e: CustomEvent) => {
            console.log('[vi-change]', e.detail);
          }}
          @vi-filter=${(e: CustomEvent) => {
            console.log(
              '[vi-filter] query:',
              e.detail.query,
              '| matched:',
              e.detail.matchedValues,
            );
          }}
        >
          ${teamMembers.map(
            (m) => html`
              <vi-combobox-item
                value=${m.value}
                label=${m.label}
                .searchText=${[m.label, m.role, m.abbr, m.email]}
                .data=${m.data}
              >
                <div
                  style="display: flex; align-items: center; gap: 10px; padding: 2px 0;"
                >
                  <div
                    style="
                      width: 32px; height: 32px; border-radius: 50%;
                      background: linear-gradient(135deg, #4f46e5, #7c3aed);
                      display: flex; align-items: center; justify-content: center;
                      color: #fff; font-weight: 600; font-size: 13px; flex-shrink: 0;
                    "
                  >
                    ${m.label
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div
                    style="display: flex; flex-direction: column; min-width: 0;"
                  >
                    <strong
                      style="font-size: 14px; color: var(--vi-text-primary, #111); white-space: nowrap;"
                    >
                      ${m.label}
                    </strong>
                    <span
                      style="font-size: 11px; color: var(--vi-text-secondary, #666); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                    >
                      ${m.abbr} · ${m.email}
                    </span>
                  </div>
                </div>
              </vi-combobox-item>
            `,
          )}
        </vi-combobox>
      </div>
    `;
  },
};

/**
 * Data-driven mode with `ComboboxOption.searchText` — extends the filter corpus beyond the
 * label. Description is also automatically included by default, but `searchText` provides
 * total control (e.g. include codes, abbreviations, translated terms).
 */
export const DataDrivenWithSearchText: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          'In data-driven mode `ComboboxOption.searchText` overrides the filter corpus. ' +
          'Without it, `label + description` is the default corpus. ' +
          'Try: <code>ICD</code>, <code>E11</code>, <code>diabetes</code>, <code>sugar</code>.',
      },
    },
  },
  render: () => html`
    <div style="max-width: 440px; padding: 24px; font-family: sans-serif;">
      <p style="font-size: 12px; color: #666; margin: 0 0 12px;">
        Try: <code>diabetes</code>, <code>E11</code>, <code>sugar</code>,
        <code>ICD</code>
      </p>
      <vi-combobox
        mode="single"
        placeholder="Search diagnoses..."
        .options=${[
          {
            value: 'E10',
            label: 'E10 — Type 1 Diabetes Mellitus',
            description: 'Insulin-dependent diabetes',
            searchText:
              'E10 Type 1 Diabetes Mellitus insulin dependent sugar T1DM',
          },
          {
            value: 'E11',
            label: 'E11 — Type 2 Diabetes Mellitus',
            description: 'Non-insulin-dependent diabetes',
            searchText: 'E11 Type 2 Diabetes Mellitus non-insulin T2DM sugar',
          },
          {
            value: 'I10',
            label: 'I10 — Essential Hypertension',
            description: 'Primary high blood pressure',
            searchText: 'I10 Essential Hypertension high blood pressure HTN BP',
          },
        ] as ComboboxOption[]}
      ></vi-combobox>
    </div>
  `,
};

export const DynamicFlipping: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates dynamic flipping using Floating UI. Scroll the container up and down to see the listbox flip from bottom to top to avoid clipping.',
      },
    },
  },
  render: () => html`
    <div
      style="height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 20px; position: relative;"
      id="scroll-boundary"
    >
      <div style="height: 400px; padding-top: 150px;">
        <vi-combobox
          mode="single"
          placeholder="Scroll to see me flip..."
          flip-boundary="#scroll-boundary"
          .options=${[
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
            { value: '3', label: 'Option 3' },
            { value: '4', label: 'Option 4' },
            { value: '5', label: 'Option 5' },
          ] as ComboboxOption[]}
        ></vi-combobox>
      </div>
    </div>
  `,
};

export const Hoisting: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          'When `hoist="true"`, the listbox uses `position: fixed` via Floating UI. This helps it escape tight `overflow: hidden` containers without needing to move the DOM node.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 40px; font-family: sans-serif;">
      <div
        style="width: 250px; height: 120px; overflow: hidden; border: 2px dashed #f87171; padding: 10px; box-sizing: border-box;"
      >
        <p style="margin-top: 0; font-size: 12px; color: #b91c1c;">
          Clipped (Default)
        </p>
        <vi-combobox
          mode="single"
          placeholder="I will get clipped..."
          .options=${[
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
            { value: '3', label: 'Option 3' },
          ] as ComboboxOption[]}
        ></vi-combobox>
      </div>

      <div
        style="width: 250px; height: 120px; overflow: hidden; border: 2px dashed #10b981; padding: 10px; box-sizing: border-box;"
      >
        <p style="margin-top: 0; font-size: 12px; color: #047857;">
          Escaped (hoist="true")
        </p>
        <vi-combobox
          mode="single"
          hoist
          placeholder="I will escape!"
          .options=${[
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
            { value: '3', label: 'Option 3' },
          ] as ComboboxOption[]}
        ></vi-combobox>
      </div>
    </div>
  `,
};

export const VirtualizationAndInfiniteScroll: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          'Virtualization renders massive lists efficiently. It requires `virtualize="true"` and an array of `options`. You can optionally supply `renderOption` for custom templates instead of using slotted items. The `vi-load-more` event fires when scrolling near the bottom to support infinite loading.',
      },
    },
  },
  render: () => {
    const massiveData = Array.from({ length: 5000 }).map((_, i) => ({
      value: `item-${i}`,
      label: `Virtual Item ${i}`,
      description: `Description for item ${i}`,
      data: { id: i },
    }));

    return html`
      <div style="max-width: 400px; padding: 20px; font-family: sans-serif;">
        <vi-combobox
          mode="single"
          placeholder="Scroll through 5000 items..."
          virtualize
          .options=${massiveData as ComboboxOption[]}
          .renderOption=${(params: RenderOptionParams) => html`
            <div
              style="display: flex; gap: 12px; align-items: center; padding: 4px; width: 100%; box-sizing: border-box;"
            >
              <div
                style="background: #eef2ff; color: #4f46e5; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 11px; font-weight: bold; flex-shrink: 0;"
              >
                #${params.option.data.id}
              </div>
              <div style="display: flex; flex-direction: column; min-width: 0;">
                <strong
                  style="font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${params.selected
                    ? '#4f46e5'
                    : 'inherit'};"
                >
                  ${params.option.label}
                </strong>
                <span
                  style="font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                >
                  ${params.option.description}
                </span>
              </div>
            </div>
          `}
          @vi-load-more=${(e: CustomEvent) => {
            console.log(
              '[vi-load-more] Reached the bottom! Event payload:',
              e.detail,
            );
          }}
        ></vi-combobox>
      </div>
    `;
  },
};

class InfiniteScrollDemo extends LitElement {
  static get properties() {
    return {
      _items: { state: true },
      _loading: { state: true },
    };
  }

  declare private _items: ComboboxOption[];
  declare private _loading: boolean;
  private _page = 0;

  constructor() {
    super();
    this._items = [];
    this._loading = false;
  }

  override connectedCallback() {
    super.connectedCallback();
    this._loadMore();
  }

  private async _loadMore() {
    if (this._loading || this._page >= 5) return; // limit to 5 pages for demo
    this._loading = true;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newItems = Array.from({ length: 30 }).map((_, i) => {
      const id = this._page * 30 + i;
      return {
        value: `api-item-${id}`,
        label: `API Item ${id}`,
        description: `Loaded from page ${this._page + 1}`,
        data: { id },
      };
    });

    this._items = [...this._items, ...newItems];
    this._page++;
    this._loading = false;
  }

  override render() {
    return html`
      <div style="font-family: sans-serif;">
        <p style="font-size: 14px; margin-bottom: 8px;">
          Scroll to the bottom to load more items. Loaded ${this._items.length}
          items so far.
          ${this._page >= 5
            ? html`<span style="color: #ea580c; font-weight: bold;"
                >(All data loaded)</span
              >`
            : ''}
        </p>
        <vi-combobox
          mode="single"
          placeholder="Search items..."
          virtualize
          ?loading=${this._loading}
          .options=${this._items}
          .renderOption=${(params: RenderOptionParams) => html`
            <div
              style="display: flex; gap: 12px; align-items: center; padding: 4px; width: 100%; box-sizing: border-box;"
            >
              <div
                style="background: #f0fdf4; color: #16a34a; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 11px; font-weight: bold; flex-shrink: 0;"
              >
                #${(params.option.data as { id?: string | number })?.id}
              </div>
              <div style="display: flex; flex-direction: column; min-width: 0;">
                <strong
                  style="font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${params.selected
                    ? '#16a34a'
                    : 'inherit'};"
                >
                  ${params.option.label}
                </strong>
                <span
                  style="font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                >
                  ${params.option.description}
                </span>
              </div>
            </div>
          `}
          @vi-load-more=${(e: CustomEvent) => { if (e.detail.direction === 'down') this._loadMore(); }}
        ></vi-combobox>
      </div>
    `;
  }
}
customElements.define('vi-infinite-scroll-demo', InfiniteScrollDemo);

export const InfiniteScrollWithMockApi: StoryObj = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates infinite scrolling with a mocked API. When the user scrolls to the bottom of the list, the `vi-load-more` event triggers a network request. The combobox displays a loading indicator while data is fetched, and seamlessly appends new items to the virtualized list.',
      },
    },
  },
  render: () => {
    return html`
      <div style="max-width: 400px; padding: 20px;">
        <vi-infinite-scroll-demo></vi-infinite-scroll-demo>
      </div>
    `;
  },
};


