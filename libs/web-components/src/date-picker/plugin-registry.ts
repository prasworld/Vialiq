import type { Plugin } from 'flatpickr/dist/types/options';
import type { DatePickerMode, ViDatePickerPlugin } from './types.js';

type ModePluginLoader = (options?: Record<string, unknown>) => Promise<ViDatePickerPlugin | null>;

// Loaders for built-in flatpickr plugins and our custom plugins.
const REGISTRY: Partial<Record<DatePickerMode, ModePluginLoader>> = {
  month: async (options) => {
    const mod = await import('./plugins/vi-month-year-plugin.js');
    const factory = mod.ViMonthYearPlugin({ hideDays: true, ariaLabels: options?.ariaLabels as Record<string, string> | undefined }) as Plugin;
    return { id: 'vi-month-select', label: 'Month Select', factory };
  },
  'month-year': async (options) => {
    const mod = await import('./plugins/vi-month-year-plugin.js');
    const factory = mod.ViMonthYearPlugin({ hideDays: true, ariaLabels: options?.ariaLabels as Record<string, string> | undefined }) as Plugin;
    return { id: 'vi-month-select', label: 'Month Select', factory };
  },
  week: async () => {
    // weekSelectPlugin is a plain factory function returning Plugin<PlusWeeks>.
    // We widen to Plugin (= Plugin<{}>) here — the extra PlusWeeks fields on the
    // instance are irrelevant to our wrapper; flatpickr accepts Plugin<{}> in its
    // plugins array.
    const mod = await import('flatpickr/dist/plugins/weekSelect/weekSelect.js');
    const factory: Plugin = mod.default() as Plugin;
    return { id: 'vi-week-select', label: 'Week Select', factory };
  }
};

/**
 * Lazily loads the required flatpickr plugin for a given picker mode.
 * Returns null if the mode does not require a plugin (e.g. 'date', 'range').
 */
export async function loadModePlugin(mode: DatePickerMode, options?: Record<string, unknown>): Promise<ViDatePickerPlugin | null> {
  const loader = REGISTRY[mode];
  if (loader) {
    return await loader(options);
  }
  return null;
}
