import type { ComponentDescriptor } from '../types/component-descriptor';
import { displayTab, logicTab } from './settings-helpers';

export const PANEL_DESCRIPTOR: ComponentDescriptor = {
  type: 'panel',
  label: 'Panel',
  category: 'layout',
  group: 'Layout',
  icon: 'building',
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
      displayTab(),
      logicTab(),
    ].filter(Boolean) as any[],
  },
  rendererRef: 'vi-renderer-panel',
};

export const COLUMNS_DESCRIPTOR: ComponentDescriptor = {
  type: 'columns',
  label: 'Columns',
  category: 'layout',
  group: 'Layout',
  icon: 'folder-download',
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
      ]),
      logicTab(),
    ].filter(Boolean) as any[],
  },
  rendererRef: 'vi-renderer-columns',
};

export const TABS_DESCRIPTOR: ComponentDescriptor = {
  type: 'tabs',
  label: 'Tabs',
  category: 'layout',
  group: 'Layout',
  icon: 'folder-download',
  weight: 30,
  canvasElement: 'vi-tabs',
  canvasProps: () => ({}),
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
      displayTab(),
    ].filter(Boolean) as any[],
  },
  rendererRef: 'vi-renderer-tabs',
};

export const FIELDSET_DESCRIPTOR: ComponentDescriptor = {
  type: 'fieldset',
  label: 'Fieldset',
  category: 'layout',
  group: 'Layout',
  icon: 'save',
  weight: 40,
  canvasElement: 'fieldset',
  canvasProps: () => ({ class: 'vi-fieldset' }),
  defaultSchema: {
    type: 'fieldset',
    label: 'Field Group',
    components: [],
    layoutConfig: {},
  },
  settingsSchema: {
    tabs: [
      displayTab(),
      logicTab(),
    ].filter(Boolean) as any[],
  },
  rendererRef: 'vi-renderer-fieldset', // note: generic renderer can just wrap in <fieldset>
};

export const REPEATER_DESCRIPTOR: ComponentDescriptor = {
  type: 'repeater',
  label: 'Repeater',
  category: 'layout',
  group: 'Layout',
  icon: 'document',
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
      ]),
      logicTab(),
    ].filter(Boolean) as any[],
  },
  rendererRef: 'vi-renderer-repeater',
};
