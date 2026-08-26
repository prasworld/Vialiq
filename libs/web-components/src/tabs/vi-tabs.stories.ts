import type { Meta, StoryObj } from '@storybook/web-components';
import { html, nothing } from 'lit';
import './vi-tabs.js';
import './vi-tab.js';
import './vi-tab-panel.js';

// ── Common styles ─────────────────────────────────────────────────────────────

const label = (text: string) => html`
  <p
    style="font-size: 11px; font-weight: 600; letter-spacing: 0.06em; color: #9ca3af;
             margin: 0 0 6px; text-transform: uppercase;"
  >
    ${text}
  </p>
`;

const note = (text: string) => html`
  <p
    style="font-size: 13px; color: #6b7280; margin: 0 0 16px; line-height: 1.5;"
  >
    ${text}
  </p>
`;

const panelContent = (title: string, description = '') => html`
  <div style="padding: 20px 4px 8px;">
    <h3
      style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #111827;"
    >
      ${title}
    </h3>
    ${description
      ? html`<p
          style="margin: 0; font-size: 13.5px; color: #6b7280; line-height: 1.6;"
        >
          ${description}
        </p>`
      : nothing}
  </div>
`;

// ─────────────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Components/Tabs',
  component: 'vi-tabs',
  tags: ['autodocs'],
  argTypes: {
    active: {
      control: 'text',
      description: 'tab-id of the active tab',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction',
    },
    variant: {
      control: 'select',
      options: ['line', 'pill', 'card', 'enclosed', 'secondary'],
      description: 'Visual style variant',
    },
    activation: {
      control: 'select',
      options: ['manual', 'automatic'],
      description:
        'manual: Enter/Space to activate | automatic: focus activates',
    },
    overflow: {
      control: 'select',
      options: ['scroll', 'menu', 'wrap'],
      description: 'Overflow strategy when tabs exceed available width',
    },
    anchorClosable: {
      control: 'boolean',
      description: 'Sort closable tabs to the end of the tablist',
    },
  },
  args: {
    active: 'tab-1',
    orientation: 'horizontal',
    variant: 'line',
    activation: 'manual',
    overflow: 'scroll',
    anchorClosable: false,
  },
};

export default meta;
type Story = StoryObj;

// ── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: 'Default',
  render: (args) => html`
    <vi-tabs
      active=${args.active}
      orientation=${args.orientation}
      variant=${args.variant}
      activation=${args.activation}
      overflow=${args.overflow}
      ?anchor-closable=${args.anchorClosable}
    >
      <vi-tab tab-id="tab-1">Demographics</vi-tab>
      <vi-tab tab-id="tab-2">Vital Signs</vi-tab>
      <vi-tab tab-id="tab-3">Laboratory</vi-tab>
      <vi-tab tab-id="tab-4">Medications</vi-tab>

      <vi-tab-panel for="tab-1"
        >${panelContent(
          'Demographics',
          'Patient demographics and baseline information.',
        )}</vi-tab-panel
      >
      <vi-tab-panel for="tab-2"
        >${panelContent(
          'Vital Signs',
          'Blood pressure, heart rate, temperature, and weight records.',
        )}</vi-tab-panel
      >
      <vi-tab-panel for="tab-3"
        >${panelContent(
          'Laboratory',
          'Lab results, haematology, biochemistry, and urinalysis.',
        )}</vi-tab-panel
      >
      <vi-tab-panel for="tab-4"
        >${panelContent(
          'Medications',
          'Concomitant medications and dosing history.',
        )}</vi-tab-panel
      >
    </vi-tabs>
  `,
};

// ── All Variants ──────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 2.5rem;">
      ${(['line', 'pill', 'card', 'enclosed', 'secondary'] as const).map(
        (variant) => html`
          <div>
            ${label(`variant="${variant}"`)}
            <vi-tabs active="a" variant=${variant}>
              <vi-tab tab-id="a">Overview</vi-tab>
              <vi-tab tab-id="b">Subjects</vi-tab>
              <vi-tab tab-id="c" badge-count="4">Queries</vi-tab>
              <vi-tab-panel for="a">${panelContent('Overview')}</vi-tab-panel>
              <vi-tab-panel for="b">${panelContent('Subjects')}</vi-tab-panel>
              <vi-tab-panel for="c">${panelContent('Queries')}</vi-tab-panel>
            </vi-tabs>
          </div>
        `,
      )}
    </div>
  `,
};

// ── Disabled Tab ──────────────────────────────────────────────────────────────

export const WithDisabledTab: Story = {
  name: 'Disabled Tab',
  render: () => html`
    <vi-tabs active="visit-1">
      <vi-tab tab-id="visit-1">Screening</vi-tab>
      <vi-tab tab-id="visit-2">Visit 1</vi-tab>
      <vi-tab tab-id="visit-3" disabled>Visit 2 (Locked)</vi-tab>
      <vi-tab tab-id="visit-4">EOS</vi-tab>

      <vi-tab-panel for="visit-1"
        >${panelContent(
          'Screening',
          'Initial screening forms and consent documentation.',
        )}</vi-tab-panel
      >
      <vi-tab-panel for="visit-2"
        >${panelContent(
          'Visit 1',
          'Day 1 assessments and lab samples.',
        )}</vi-tab-panel
      >
      <vi-tab-panel for="visit-3"
        >${panelContent(
          'Visit 2',
          'Locked by data manager — no edit access.',
        )}</vi-tab-panel
      >
      <vi-tab-panel for="visit-4"
        >${panelContent(
          'EOS',
          'End of study evaluations and follow-up.',
        )}</vi-tab-panel
      >
    </vi-tabs>
  `,
};

// ── Badge Counts ──────────────────────────────────────────────────────────────

export const WithBadgeCounts: Story = {
  name: 'Badge Counts',
  render: () => html`
    <vi-tabs active="overview">
      <vi-tab tab-id="overview">Overview</vi-tab>
      <vi-tab tab-id="queries" badge-count="7">Open Queries</vi-tab>
      <vi-tab tab-id="sdv" badge-count="3">SDV</vi-tab>
      <vi-tab tab-id="documents">Documents</vi-tab>

      <vi-tab-panel for="overview"
        >${panelContent(
          'Overview',
          'Subject-level summary and study status.',
        )}</vi-tab-panel
      >
      <vi-tab-panel for="queries"
        >${panelContent(
          'Open Queries',
          '7 queries require investigator response.',
        )}</vi-tab-panel
      >
      <vi-tab-panel for="sdv"
        >${panelContent(
          'SDV',
          '3 pages pending source data verification.',
        )}</vi-tab-panel
      >
      <vi-tab-panel for="documents"
        >${panelContent(
          'Documents',
          'Subject-level document repository.',
        )}</vi-tab-panel
      >
    </vi-tabs>
  `,
};

// ── Vertical ──────────────────────────────────────────────────────────────────

export const VerticalOrientation: Story = {
  name: 'Vertical (Sidebar)',
  render: () => html`
    <div style="display: flex; height: 280px;">
      <vi-tabs
        orientation="vertical"
        variant="line"
        active="general"
        style="width: 100%;"
      >
        <vi-tab tab-id="general">General</vi-tab>
        <vi-tab tab-id="users">Users</vi-tab>
        <vi-tab tab-id="roles">Roles & Permissions</vi-tab>
        <vi-tab tab-id="audit">Audit Log</vi-tab>

        <vi-tab-panel for="general"
          >${panelContent(
            'General Settings',
            'Study name, protocol version, and basic configuration.',
          )}</vi-tab-panel
        >
        <vi-tab-panel for="users"
          >${panelContent(
            'Users',
            'Manage investigator and coordinator access.',
          )}</vi-tab-panel
        >
        <vi-tab-panel for="roles"
          >${panelContent(
            'Roles & Permissions',
            'Define what each role can view, edit, and approve.',
          )}</vi-tab-panel
        >
        <vi-tab-panel for="audit"
          >${panelContent(
            'Audit Log',
            'Full system audit trail for 21 CFR Part 11 compliance.',
          )}</vi-tab-panel
        >
      </vi-tabs>
    </div>
  `,
};

// ── Manual Activation ─────────────────────────────────────────────────────────

export const ManualActivation: Story = {
  name: 'Manual Activation (Keyboard)',
  render: () => html`
    ${note(
      "Arrow keys move focus only. Press Enter or Space to activate. Useful for heavy panels that shouldn't reload on every keypress.",
    )}
    <vi-tabs activation="manual" active="reports">
      <vi-tab tab-id="reports">Reports</vi-tab>
      <vi-tab tab-id="exports">Data Exports</vi-tab>
      <vi-tab tab-id="analytics">Analytics</vi-tab>

      <vi-tab-panel for="reports"
        >${panelContent(
          'Reports',
          'Report panel — only loaded when explicitly activated.',
        )}</vi-tab-panel
      >
      <vi-tab-panel for="exports"
        >${panelContent(
          'Data Exports',
          'Export configuration and history.',
        )}</vi-tab-panel
      >
      <vi-tab-panel for="analytics"
        >${panelContent(
          'Analytics',
          'Usage analytics dashboard.',
        )}</vi-tab-panel
      >
    </vi-tabs>
  `,
};

// ── Before-change Guard ───────────────────────────────────────────────────────

export const BeforeChangeGuard: Story = {
  name: 'Before-change Guard',
  render: () => {
    const onBeforeChange = (
      e: CustomEvent<{ fromTabId: string; toTabId: string }>,
    ) => {
      const proceed = confirm(
        `You have unsaved changes on "${e.detail.fromTabId}".\nDiscard and navigate to "${e.detail.toTabId}"?`,
      );
      if (!proceed) e.preventDefault();
    };

    return html`
      ${note(
        'Clicking a tab fires a confirmation dialog. Dismiss it to cancel the tab switch (e.preventDefault on vi-tabs-before-change).',
      )}
      <vi-tabs active="form-a" @vi-tabs-before-change=${onBeforeChange}>
        <vi-tab tab-id="form-a">Demographics</vi-tab>
        <vi-tab tab-id="form-b">Vital Signs</vi-tab>
        <vi-tab tab-id="form-c">Laboratory</vi-tab>

        <vi-tab-panel for="form-a"
          >${panelContent(
            'Demographics',
            'Unsaved changes present — switching tabs will prompt.',
          )}</vi-tab-panel
        >
        <vi-tab-panel for="form-b">${panelContent('Vital Signs')}</vi-tab-panel>
        <vi-tab-panel for="form-c">${panelContent('Laboratory')}</vi-tab-panel>
      </vi-tabs>
    `;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — Overflow Stories
// ─────────────────────────────────────────────────────────────────────────────

// ── Overflow: Scroll ──────────────────────────────────────────────────────────

export const OverflowScroll: Story = {
  name: 'Overflow → Scroll',
  render: () => html`
    ${note(
      'When tabs exceed the available width, the tablist scrolls horizontally. Fade gradients at the edges hint at hidden content. Drag or use a trackpad to scroll.',
    )}
    <div
      style="width: 100%; border: 1px dashed #e5e7eb; border-radius: 8px; padding: 16px;"
    >
      <vi-tabs active="tab-1" overflow="scroll">
        <vi-tab tab-id="tab-1">Demographics</vi-tab>
        <vi-tab tab-id="tab-2">Vital Signs</vi-tab>
        <vi-tab tab-id="tab-3">Laboratory</vi-tab>
        <vi-tab tab-id="tab-4">Medications</vi-tab>
        <vi-tab tab-id="tab-5">Adverse Events</vi-tab>
        <vi-tab tab-id="tab-6">Concomitant Meds</vi-tab>
        <vi-tab tab-id="tab-7">Medical History</vi-tab>

        <vi-tab-panel for="tab-1">${panelContent('Demographics')}</vi-tab-panel>
        <vi-tab-panel for="tab-2">${panelContent('Vital Signs')}</vi-tab-panel>
        <vi-tab-panel for="tab-3">${panelContent('Laboratory')}</vi-tab-panel>
        <vi-tab-panel for="tab-4">${panelContent('Medications')}</vi-tab-panel>
        <vi-tab-panel for="tab-5"
          >${panelContent('Adverse Events')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-6"
          >${panelContent('Concomitant Meds')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-7"
          >${panelContent('Medical History')}</vi-tab-panel
        >
      </vi-tabs>
    </div>
  `,
};

// ── Overflow: Menu (Swap) ─────────────────────────────────────────────────────

export const OverflowMenu: Story = {
  name: 'Overflow → More Menu (Swap)',
  render: () => html`
    ${note(
      'Tabs that don\'t fit appear in a "More" dropdown. Selecting one swaps it into the visible area — the last visible tab moves into the menu.',
    )}
    <div
      style="width: 100%; border: 1px dashed #e5e7eb; border-radius: 8px; padding: 16px;"
    >
      <vi-tabs active="tab-1" overflow="menu">
        <vi-tab tab-id="tab-1">Demographics</vi-tab>
        <vi-tab tab-id="tab-2">Vital Signs</vi-tab>
        <vi-tab tab-id="tab-3">Laboratory</vi-tab>
        <vi-tab tab-id="tab-4">Medications</vi-tab>
        <vi-tab tab-id="tab-5">Adverse Events</vi-tab>
        <vi-tab tab-id="tab-6">Concomitant Meds</vi-tab>
        <vi-tab tab-id="tab-7">Medical History</vi-tab>
        <vi-tab tab-id="tab-8" badge-count="2">Queries</vi-tab>

        <vi-tab-panel for="tab-1"
          >${panelContent(
            'Demographics',
            'Selected from visible area.',
          )}</vi-tab-panel
        >
        <vi-tab-panel for="tab-2">${panelContent('Vital Signs')}</vi-tab-panel>
        <vi-tab-panel for="tab-3">${panelContent('Laboratory')}</vi-tab-panel>
        <vi-tab-panel for="tab-4">${panelContent('Medications')}</vi-tab-panel>
        <vi-tab-panel for="tab-5"
          >${panelContent(
            'Adverse Events',
            'Selected from "More" menu — swapped into visible area.',
          )}</vi-tab-panel
        >
        <vi-tab-panel for="tab-6"
          >${panelContent('Concomitant Meds')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-7"
          >${panelContent('Medical History')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-8"
          >${panelContent('Queries', '2 open queries.')}</vi-tab-panel
        >
      </vi-tabs>
    </div>
  `,
};

// ── Overflow: Wrap ────────────────────────────────────────────────────────────

export const OverflowWrap: Story = {
  name: 'Overflow → Wrap',
  render: () => html`
    ${note(
      "Tabs that don't fit wrap to additional lines. Best for constrained widths with a small number of tabs.",
    )}
    <div
      style="width: 100%; border: 1px dashed #e5e7eb; border-radius: 8px; padding: 16px;"
    >
      <vi-tabs active="tab-1" overflow="wrap" variant="pill">
        <vi-tab tab-id="tab-1">Demographics</vi-tab>
        <vi-tab tab-id="tab-2">Vital Signs</vi-tab>
        <vi-tab tab-id="tab-3">Laboratory</vi-tab>
        <vi-tab tab-id="tab-4">Medications</vi-tab>
        <vi-tab tab-id="tab-5">Adverse Events</vi-tab>

        <vi-tab-panel for="tab-1">${panelContent('Demographics')}</vi-tab-panel>
        <vi-tab-panel for="tab-2">${panelContent('Vital Signs')}</vi-tab-panel>
        <vi-tab-panel for="tab-3">${panelContent('Laboratory')}</vi-tab-panel>
        <vi-tab-panel for="tab-4">${panelContent('Medications')}</vi-tab-panel>
        <vi-tab-panel for="tab-5"
          >${panelContent('Adverse Events')}</vi-tab-panel
        >
      </vi-tabs>
    </div>
  `,
};

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — Closable Tabs Stories
// ─────────────────────────────────────────────────────────────────────────────

// ── Closable Tabs ─────────────────────────────────────────────────────────────

export const ClosableTabs: Story = {
  name: 'Closable Tabs',
  render: () => {
    // Track open tabs in a reactive way using a simple array
    const tabs = [
      {
        id: 'demographics',
        label: 'Demographics',
        content: 'Patient demographics and baseline information.',
      },
      {
        id: 'vitals',
        label: 'Vital Signs',
        content: 'Blood pressure, heart rate, temperature.',
      },
      {
        id: 'lab',
        label: 'Laboratory',
        content: 'Lab results, haematology, biochemistry.',
      },
      {
        id: 'meds',
        label: 'Medications',
        content: 'Concomitant medications and dosing.',
      },
      {
        id: 'adverse',
        label: 'Adverse Events',
        content: 'AE recording and severity assessment.',
      },
    ];

    let openTabIds = tabs.map((t) => t.id);
    let activeTabId = tabs[0].id;

    const rerender = () => {
      container.innerHTML = '';
      container.appendChild(buildUI());
    };

    const buildUI = () => {
      const el = document.createElement('div');

      const tabsEl = document.createElement('vi-tabs') as HTMLElement;
      tabsEl.setAttribute('active', activeTabId);
      tabsEl.setAttribute('variant', 'card');

      tabsEl.addEventListener(
        'vi-tabs-tab-close',
        (e: CustomEvent<{ tabId: string }>) => {
          openTabIds = openTabIds.filter((id) => id !== e.detail.tabId);
          if (openTabIds.length === 0) activeTabId = '';
          rerender();
        },
      );

      tabsEl.addEventListener(
        'vi-tabs-change',
        (e: CustomEvent<{ toTabId: string }>) => {
          activeTabId = e.detail.toTabId;
        },
      );

      for (const tab of tabs.filter((t) => openTabIds.includes(t.id))) {
        const tabEl = document.createElement('vi-tab') as HTMLElement;
        tabEl.setAttribute('tab-id', tab.id);
        tabEl.setAttribute('closable', '');
        tabEl.textContent = tab.label;
        tabsEl.appendChild(tabEl);

        const panelEl = document.createElement('vi-tab-panel') as HTMLElement;
        panelEl.setAttribute('for', tab.id);
        panelEl.innerHTML = `<div style="padding: 20px 4px 8px;">
          <h3 style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #111827;">${tab.label}</h3>
          <p style="margin: 0; font-size: 13.5px; color: #6b7280;">${tab.content}</p>
          ${openTabIds.length === 0 ? '<p style="color:#9ca3af;font-style:italic">All tabs closed.</p>' : ''}
        </div>`;
        tabsEl.appendChild(panelEl);
      }

      if (openTabIds.length === 0) {
        el.innerHTML =
          '<p style="font-size:13px;color:#9ca3af;font-style:italic;margin:16px 4px;">All tabs have been closed.</p>';
      } else {
        el.appendChild(tabsEl);
      }
      return el;
    };

    const container = document.createElement('div');
    container.appendChild(buildUI());

    return html`
      ${note(
        'Hover a tab to reveal the × button. Close button fires vi-tab-before-close (cancelable) then vi-tab-close. Focus moves to the previous tab automatically.',
      )}
      ${container}
    `;
  },
};

// ── Closable + anchor-closable ────────────────────────────────────────────────

export const ClosableAnchoredToEnd: Story = {
  name: 'Closable + anchor-closable',
  render: () => html`
    ${note(
      'anchor-closable sorts closable tabs to the end using CSS order. Non-closable "pinned" tabs stay at the front. DOM order and ARIA reading order are unchanged.',
    )}
    <vi-tabs active="overview" anchor-closable>
      <vi-tab tab-id="overview">Overview</vi-tab>
      <vi-tab tab-id="summary">Summary</vi-tab>
      <vi-tab tab-id="demographics" closable>Demographics</vi-tab>
      <vi-tab tab-id="vitals" closable>Vital Signs</vi-tab>
      <vi-tab tab-id="lab" closable badge-count="3">Laboratory</vi-tab>

      <vi-tab-panel for="overview">
        ${panelContent('Overview', 'Pinned — cannot be closed. Always first.')}
      </vi-tab-panel>
      <vi-tab-panel for="summary">
        ${panelContent('Summary', 'Pinned — cannot be closed. Always second.')}
      </vi-tab-panel>
      <vi-tab-panel for="demographics">
        ${panelContent(
          'Demographics',
          'Closable — anchored to end by anchor-closable.',
        )}
      </vi-tab-panel>
      <vi-tab-panel for="vitals">
        ${panelContent('Vital Signs', 'Closable — hover to see the × button.')}
      </vi-tab-panel>
      <vi-tab-panel for="lab">
        ${panelContent(
          'Laboratory',
          '3 pending results. Closable tab with badge.',
        )}
      </vi-tab-panel>
    </vi-tabs>
  `,
};

// ── Before-close Guard ────────────────────────────────────────────────────────

export const BeforeCloseGuard: Story = {
  name: 'Before-close Guard',
  render: () => {
    const onBeforeClose = (e: CustomEvent<{ tabId: string }>) => {
      const confirm_ = confirm(
        `Close tab "${e.detail.tabId}"? Unsaved changes will be lost.`,
      );
      if (!confirm_) e.preventDefault();
    };

    return html`
      ${note(
        'vi-tab-before-close is cancelable. The host app calls e.preventDefault() to block the close — e.g. when a form has unsaved changes.',
      )}
      <vi-tabs active="form-a" @vi-tab-before-close=${onBeforeClose}>
        <vi-tab tab-id="form-a" closable>Demographics (dirty)</vi-tab>
        <vi-tab tab-id="form-b" closable>Vital Signs</vi-tab>
        <vi-tab tab-id="form-c">Laboratory (non-closable)</vi-tab>

        <vi-tab-panel for="form-a"
          >${panelContent(
            'Demographics',
            'Has unsaved changes — closing will prompt.',
          )}</vi-tab-panel
        >
        <vi-tab-panel for="form-b"
          >${panelContent(
            'Vital Signs',
            'Clean — closes immediately.',
          )}</vi-tab-panel
        >
        <vi-tab-panel for="form-c"
          >${panelContent(
            'Laboratory',
            'No close button — always visible.',
          )}</vi-tab-panel
        >
      </vi-tabs>
    `;
  },
};

// ── Full Feature Demo ─────────────────────────────────────────────────────────

export const LazyPanels: Story = {
  name: 'Lazy Panels',
  render: () => html`
    ${note(
      'Panels with lazy only render content on first activation. Check the DOM to confirm inactive panels are empty until visited.',
    )}
    <vi-tabs active="eager">
      <vi-tab tab-id="eager">Eager Panel</vi-tab>
      <vi-tab tab-id="lazy-1">Lazy Panel 1</vi-tab>
      <vi-tab tab-id="lazy-2">Lazy Panel 2</vi-tab>

      <vi-tab-panel for="eager">
        ${panelContent(
          'Eager Panel',
          'This panel is always rendered in the DOM.',
        )}
      </vi-tab-panel>
      <vi-tab-panel for="lazy-1" lazy>
        ${panelContent(
          'Lazy Panel 1',
          'Rendered on first activation only — inspect DOM before visiting.',
        )}
      </vi-tab-panel>
      <vi-tab-panel for="lazy-2" lazy>
        ${panelContent('Lazy Panel 2', 'Rendered on first activation only.')}
      </vi-tab-panel>
    </vi-tabs>
  `,
};

export const KitchenSink: Story = {
  name: '🧪 Kitchen Sink',
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 3rem;">
      <div>
        ${label('Line + overflow scroll + badge + disabled')}
        <div style="width: 100%;">
          <vi-tabs active="demo" variant="line" overflow="scroll">
            <vi-tab tab-id="demo">Demographics</vi-tab>
            <vi-tab tab-id="vitals">Vital Signs</vi-tab>
            <vi-tab tab-id="lab" badge-count="5">Laboratory</vi-tab>
            <vi-tab tab-id="meds" disabled>Medications (Locked)</vi-tab>
            <vi-tab tab-id="ae">Adverse Events</vi-tab>
            <vi-tab tab-id="cm">Concomitant Meds</vi-tab>
            <vi-tab tab-id="mh">Medical History</vi-tab>
            <vi-tab-panel for="demo"
              >${panelContent('Demographics')}</vi-tab-panel
            >
            <vi-tab-panel for="vitals"
              >${panelContent('Vital Signs')}</vi-tab-panel
            >
            <vi-tab-panel for="lab"
              >${panelContent('Laboratory', '5 pending results.')}</vi-tab-panel
            >
            <vi-tab-panel for="meds"
              >${panelContent('Medications (Locked)')}</vi-tab-panel
            >
            <vi-tab-panel for="ae"
              >${panelContent('Adverse Events')}</vi-tab-panel
            >
            <vi-tab-panel for="cm"
              >${panelContent('Concomitant Meds')}</vi-tab-panel
            >
            <vi-tab-panel for="mh"
              >${panelContent('Medical History')}</vi-tab-panel
            >
          </vi-tabs>
        </div>
      </div>

      <div>
        ${label('Pill + closable + anchor-closable')}
        <vi-tabs active="overview" variant="pill" anchor-closable>
          <vi-tab tab-id="overview">Overview</vi-tab>
          <vi-tab tab-id="visits" closable>Visits</vi-tab>
          <vi-tab tab-id="lab2" closable badge-count="3">Lab</vi-tab>
          <vi-tab tab-id="ae2" closable>Adverse Events</vi-tab>
          <vi-tab-panel for="overview"
            >${panelContent(
              'Overview',
              'Pinned tab — always first.',
            )}</vi-tab-panel
          >
          <vi-tab-panel for="visits"
            >${panelContent(
              'Visits',
              'Closable — anchored to end.',
            )}</vi-tab-panel
          >
          <vi-tab-panel for="lab2"
            >${panelContent('Lab', '3 pending results.')}</vi-tab-panel
          >
          <vi-tab-panel for="ae2"
            >${panelContent('Adverse Events')}</vi-tab-panel
          >
        </vi-tabs>
      </div>

      <div>
        ${label('Card + overflow menu (swap)')}
        <div style="width: 100%;">
          <vi-tabs active="tab-1" variant="card" overflow="menu">
            <vi-tab tab-id="tab-1">Demographics</vi-tab>
            <vi-tab tab-id="tab-2">Vital Signs</vi-tab>
            <vi-tab tab-id="tab-3">Laboratory</vi-tab>
            <vi-tab tab-id="tab-4">Medications</vi-tab>
            <vi-tab tab-id="tab-5">Adverse Events</vi-tab>
            <vi-tab tab-id="tab-6">Concomitant Meds</vi-tab>
            <vi-tab-panel for="tab-1"
              >${panelContent('Demographics')}</vi-tab-panel
            >
            <vi-tab-panel for="tab-2"
              >${panelContent('Vital Signs')}</vi-tab-panel
            >
            <vi-tab-panel for="tab-3"
              >${panelContent('Laboratory')}</vi-tab-panel
            >
            <vi-tab-panel for="tab-4"
              >${panelContent('Medications')}</vi-tab-panel
            >
            <vi-tab-panel for="tab-5"
              >${panelContent(
                'Adverse Events',
                'Swap into view from More menu.',
              )}</vi-tab-panel
            >
            <vi-tab-panel for="tab-6"
              >${panelContent('Concomitant Meds')}</vi-tab-panel
            >
          </vi-tabs>
        </div>
      </div>

      <div>
        ${label('Vertical sidebar — settings pattern')}
        <div style="display: flex; height: 240px;">
          <vi-tabs
            orientation="vertical"
            variant="line"
            active="general"
            style="width: 100%;"
          >
            <vi-tab tab-id="general">General</vi-tab>
            <vi-tab tab-id="users">Users</vi-tab>
            <vi-tab tab-id="roles">Roles</vi-tab>
            <vi-tab tab-id="audit" badge-count="12">Audit Log</vi-tab>
            <vi-tab-panel for="general"
              >${panelContent('General Settings')}</vi-tab-panel
            >
            <vi-tab-panel for="users">${panelContent('Users')}</vi-tab-panel>
            <vi-tab-panel for="roles">${panelContent('Roles')}</vi-tab-panel>
            <vi-tab-panel for="audit"
              >${panelContent(
                'Audit Log',
                '12 entries since last review.',
              )}</vi-tab-panel
            >
          </vi-tabs>
        </div>
      </div>
    </div>
  `,
};

export const ResponsiveOverflowMenu: StoryObj = {
  name: 'Responsive Overflow Menu',
  render: () => html`
    <div style="padding: 24px; width: 100%; max-width: 100%;">
      ${note(
        'Resize the browser window itself to see the overflow menu dynamically push tabs in and out.',
      )}

      <vi-tabs active="tab-1" variant="line" overflow="menu">
        <vi-tab tab-id="tab-1">Demographics</vi-tab>
        <vi-tab tab-id="tab-2">Vital Signs</vi-tab>
        <vi-tab tab-id="tab-3">Laboratory</vi-tab>
        <vi-tab tab-id="tab-4">Medications</vi-tab>
        <vi-tab tab-id="tab-5">Adverse Events</vi-tab>
        <vi-tab tab-id="tab-6">Medical History</vi-tab>
        <vi-tab tab-id="tab-7">Concomitant Meds</vi-tab>

        <vi-tab-panel for="tab-1"
          >${panelContent(
            'Demographics',
            'Resize the browser window to see the overflow menu update in real-time.',
          )}</vi-tab-panel
        >
        <vi-tab-panel for="tab-2">${panelContent('Vital Signs')}</vi-tab-panel>
        <vi-tab-panel for="tab-3">${panelContent('Laboratory')}</vi-tab-panel>
        <vi-tab-panel for="tab-4">${panelContent('Medications')}</vi-tab-panel>
        <vi-tab-panel for="tab-5"
          >${panelContent('Adverse Events')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-6"
          >${panelContent('Medical History')}</vi-tab-panel
        >
        <vi-tab-panel for="tab-7"
          >${panelContent('Concomitant Meds')}</vi-tab-panel
        >
      </vi-tabs>
    </div>
  `,
};

// ── Addable / Dynamic Tabs ────────────────────────────────────────────────────

export const AddableTabs: Story = {
  name: 'Dynamic Tabs (Addable)',
  render: () => {
    let count = 4;
    let activeTabId = 'tab-1';

    const buildUI = () => {
      const el = document.createElement('div');

      const tabsEl = document.createElement('vi-tabs') as HTMLElement;
      tabsEl.setAttribute('active', activeTabId);
      tabsEl.setAttribute('overflow', 'scroll');
      tabsEl.setAttribute('addable', '');
      tabsEl.setAttribute('anchor-closable', '');

      const rerender = () => {
        el.innerHTML = '';
        el.appendChild(buildUI());
      };

      tabsEl.addEventListener(
        'vi-tabs-change',
        (e: CustomEvent<{ toTabId: string }>) => {
          activeTabId = e.detail.toTabId;
        },
      );

      tabsEl.addEventListener('vialiq-add', () => {
        count++;
        activeTabId = `tab-${count}`;
        rerender();
      });

      // Render the tabs dynamically
      for (let i = 1; i <= count; i++) {
        const id = `tab-${i}`;
        const tabEl = document.createElement('vi-tab') as HTMLElement;
        tabEl.setAttribute('tab-id', id);
        tabEl.setAttribute('closable', '');
        tabEl.textContent = `Document ${i}`;
        tabsEl.appendChild(tabEl);

        const panelEl = document.createElement('vi-tab-panel') as HTMLElement;
        panelEl.setAttribute('for', id);
        panelEl.innerHTML = `<div style="padding: 20px 4px 8px;">
          <h3 style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #111827;">Document ${i}</h3>
          <p style="margin: 0; font-size: 13.5px; color: #6b7280;">Content for dynamically added document ${i}.</p>
        </div>`;
        tabsEl.appendChild(panelEl);
      }

      return tabsEl;
    };

    const container = document.createElement('div');
    container.style.width = '100%';
    container.appendChild(buildUI());

    return html`
      ${note(
        'Click the + button to dynamically add new tabs to the DOM. The vi-tabs component automatically registers them.',
      )}
      ${container}
    `;
  },
};

export const FocusDelegation: Story = {
  render: () => {
    return html`
      ${label('Focus Delegation Test')}
      ${note(
        'Click the active tab (or Tab into it) and press Tab. Focus should immediately land on the first input field inside the panel.',
      )}

      <div
        style="max-width: 600px; padding: 24px; background: #f9fafb; border-radius: 8px;"
      >
        <vi-tabs active="profile">
          <vi-tab slot="tab" tab-id="profile">User Profile</vi-tab>
          <vi-tab slot="tab" tab-id="settings">Settings</vi-tab>

          <vi-tab-panel slot="panel" for="profile">
            <div
              style="padding: 24px; background: white; border-radius: 8px; margin-top: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
            >
              <h3 style="margin-top: 0;">Edit Profile</h3>
              <form style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label for="fname" style="font-size: 14px; font-weight: 500;"
                    >First Name</label
                  >
                  <input
                    id="fname"
                    type="text"
                    placeholder="Jane"
                    style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;"
                  />
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <label for="lname" style="font-size: 14px; font-weight: 500;"
                    >Last Name</label
                  >
                  <input
                    id="lname"
                    type="text"
                    placeholder="Doe"
                    style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;"
                  />
                </div>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                  <button
                    type="submit"
                    style="padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    style="padding: 8px 16px; background: white; color: #374151; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer;"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </vi-tab-panel>

          <vi-tab-panel slot="panel" for="settings">
            <div
              style="padding: 24px; background: white; border-radius: 8px; margin-top: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
            >
              <h3 style="margin-top: 0;">Account Settings</h3>
              <form style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input id="notif" type="checkbox" />
                  <label for="notif" style="font-size: 14px;"
                    >Enable Email Notifications</label
                  >
                </div>
              </form>
            </div>
          </vi-tab-panel>
        </vi-tabs>
      </div>
    `;
  },
};
