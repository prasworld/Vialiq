import type { ComponentDescriptor, SettingsTab } from '../types/component-descriptor';
import { displayTab, logicTab } from './settings-helpers';

export const PANEL_DESCRIPTOR: ComponentDescriptor = {
  type: 'panel',
  label: 'Panel',
  category: 'layout',
  group: 'Layout',
  icon: 'layout-panel-top',
  traits: { isContainer: true, isDisplayOnly: true },
  weight: 10,
  canvasElement: 'div',
  canvasProps: () => ({ class: 'vi-panel' }),
  defaultSchema: {
    type: 'panel',
    label: 'Panel',
    components: [],
    layoutConfig: {},
  },
  settingsSchema: {
    tabs: [
      displayTab([], { labelRequired: false }),
      logicTab(),
    ].filter(Boolean) as SettingsTab[],
  },
  disallowedChildren: ['panel', 'fieldset'],
  rendererRef: 'vi-renderer-panel',
};

export const COLUMNS_DESCRIPTOR: ComponentDescriptor = {
  type: 'columns',
  label: 'Columns',
  category: 'layout',
  group: 'Layout',
  icon: 'columns',
  traits: { isContainer: true, isDisplayOnly: true },
  weight: 20,
  canvasElement: 'div',
  canvasProps: () => ({ class: 'vi-columns' }),
  defaultSchema: {
    type: 'columns',
    label: 'Columns',
    components: [],
    layoutConfig: {
      columns: 2,
      columnAssignments: {},
    },
  },
  settingsSchema: {
    tabs: [
      displayTab([
        { key: 'layoutConfig.columns', label: 'Number of columns', type: 'number', defaultValue: 2 },
      ], { labelRequired: false }),
      logicTab(),
    ].filter(Boolean) as SettingsTab[],
  },
  disallowedChildren: ['columns'],
  rendererRef: 'vi-renderer-columns',
};

export const TABS_DESCRIPTOR: ComponentDescriptor = {
  type: 'tabs',
  label: 'Tabs',
  category: 'layout',
  group: 'Layout',
  icon: 'browser',
  traits: { isContainer: true, isDisplayOnly: true },
  weight: 30,
  canvasElement: 'vi-tabs',
  canvasProps: (s) => {
    const config = (s as Record<string, unknown>)['layoutConfig'] as Record<string, unknown> | undefined;
    const tabs = (config?.['tabs'] as { id: string; label: string }[]) || [];
    const html = tabs.map(t => `<vi-tab slot="tabs" value="${t.id}">${t.label}</vi-tab>`).join('');
    return {
      value: tabs.length > 0 ? tabs[0].id : '',
      unsafeHtmlContent: html
    };
  },
  defaultSchema: {
    type: 'tabs',
    label: 'Tabs',
    components: [],
    layoutConfig: {
      tabs: [{ id: 'tab1', label: 'Tab 1' }],
      tabAssignments: {},
    },
  },
  settingsSchema: {
    tabs: [
      displayTab([
        {
          key: 'layoutConfig.tabs',
          label: 'Tabs',
          type: 'item-list',
        }
      ], { labelRequired: false, hideDescription: true, hideLabelPosition: true }),
    ].filter(Boolean) as SettingsTab[],
  },
  disallowedChildren: ['tabs'],
  rendererRef: 'vi-renderer-tabs',
};

export const FIELDSET_DESCRIPTOR: ComponentDescriptor = {
  type: 'fieldset',
  label: 'Fieldset',
  category: 'layout',
  group: 'Layout',
  icon: 'section',
  traits: { isContainer: true, isDisplayOnly: true },
  weight: 40,
  canvasElement: 'div',
  canvasProps: () => ({ class: 'vi-fieldset' }),
  defaultSchema: {
    type: 'fieldset',
    label: 'Field Group',
    components: [],
    layoutConfig: {},
  },
  settingsSchema: {
    tabs: [
      displayTab([], { labelRequired: false }),
      logicTab(),
    ].filter(Boolean) as SettingsTab[],
  },
  disallowedChildren: ['fieldset', 'panel'],
  rendererRef: 'vi-renderer-fieldset', // note: generic renderer can just wrap in <fieldset>
};

export const REPEATER_DESCRIPTOR: ComponentDescriptor = {
  type: 'repeater',
  label: 'Repeater',
  category: 'layout',
  group: 'Layout',
  icon: 'repeat',
  traits: { isContainer: true, isDisplayOnly: true },
  weight: 50,
  canvasElement: 'div',
  canvasProps: () => ({ class: 'vi-repeater' }),
  defaultSchema: {
    type: 'repeater',
    label: 'Repeating Group',
    components: [],
    layoutConfig: {
      minRows: 1,
    },
  },
  settingsSchema: {
    tabs: [
      displayTab([
        { key: 'layoutConfig.minRows', label: 'Minimum repeats', type: 'number', defaultValue: 1 },
        { key: 'layoutConfig.maxRows', label: 'Maximum repeats', type: 'number' },
        { key: 'layoutConfig.addLabel', label: 'Add button label', type: 'text', defaultValue: 'Add Item' },
      ], { labelRequired: false }),
      logicTab(),
    ].filter(Boolean) as SettingsTab[],
  },
  rendererRef: 'vi-renderer-repeater',
};

export const CONTENT_SWITCHER_DESCRIPTOR: ComponentDescriptor = {
  type: 'content-switcher',
  label: 'Content Switcher',
  category: 'layout',
  group: 'Layout',
  icon: 'switch-horizontal',
  traits: { isContainer: true, isDisplayOnly: true },
  weight: 35,
  canvasElement: 'vi-content-switcher',
  canvasProps: (s) => {
    const config = (s as Record<string, unknown>)['layoutConfig'] as Record<string, unknown> | undefined;
    const views = (config?.['views'] as { id: string; label: string }[]) || [];
    const html = views.map(v => `<vi-switcher-item value="${v.id}">${v.label}</vi-switcher-item>`).join('');
    return {
      block: true,
      value: views.length > 0 ? views[0].id : '',
      unsafeHtmlContent: html
    };
  },
  defaultSchema: {
    type: 'content-switcher',
    label: 'Content Switcher',
    components: [],
    layoutConfig: {
      views: [
        { id: 'view1', label: 'View 1' },
        { id: 'view2', label: 'View 2' }
      ],
      viewAssignments: {},
    },
  },
  settingsSchema: {
    tabs: [
      displayTab([
        {
          key: 'layoutConfig.views',
          label: 'Views',
          type: 'item-list',
        }
      ], { labelRequired: false, hideDescription: true, hideLabelPosition: true }),
    ].filter(Boolean) as SettingsTab[],
  },
  disallowedChildren: ['content-switcher'],
  rendererRef: 'vi-renderer-content-switcher',
};
