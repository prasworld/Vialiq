import type { Plugin } from 'flatpickr/dist/types/options';
import type { DatePickerMode, ViDatePickerPlugin } from './types.js';

type ModePluginLoader = () => Promise<ViDatePickerPlugin | null>;

// Loaders for built-in flatpickr plugins and our custom plugins.
const REGISTRY: Partial<Record<DatePickerMode, ModePluginLoader>> = {
  month: async () => null,
  'month-year': async () => null,
  week: async () => {
    // weekSelectPlugin is a plain factory function returning Plugin<PlusWeeks>.
    // We widen to Plugin (= Plugin<{}>) here — the extra PlusWeeks fields on the
    // instance are irrelevant to our wrapper; flatpickr accepts Plugin<{}> in its
    // plugins array.
    const mod = await import('flatpickr/dist/plugins/weekSelect/weekSelect.js');
    const factory: Plugin = mod.default() as Plugin;
    return { id: 'vi-week-select', label: 'Week Select', factory };
  },
  year: async () => {
    // Stub for Phase 2: custom yearSelectPlugin wrapper
    // We will implement this fully in Phase 2.
    const factory: Plugin = () => ({});
    return { id: 'vi-year-select', label: 'Year Select', factory };
  }
};

/**
 * Lazily loads the required flatpickr plugin for a given picker mode.
 * Returns null if the mode does not require a plugin (e.g. 'date', 'range').
 */
export async function loadModePlugin(mode: DatePickerMode): Promise<ViDatePickerPlugin | null> {
  const loader = REGISTRY[mode];
  if (loader) {
    return await loader();
  }
  return null;
}
