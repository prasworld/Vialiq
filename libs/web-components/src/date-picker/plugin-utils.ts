import { Plugin } from 'flatpickr/dist/types/options';
import type { DatePickerPluginInput, ViDatePickerPlugin } from './types.js';

export function isViPlugin(p: DatePickerPluginInput): p is ViDatePickerPlugin {
  return typeof p === 'object' && p !== null && 'id' in p && 'factory' in p;
}

export function resolvePlugin(p: DatePickerPluginInput): Plugin {
  return isViPlugin(p) ? p.factory : (p as Plugin);
}

/**
 * Merges the built-in mode plugin with any consumer-provided plugins.
 * Ensures the mode plugin is always first, and deduplicates by ViDatePickerPlugin.id.
 */
export function mergePlugins(
  modePlugin: DatePickerPluginInput | null,
  consumerPlugins: DatePickerPluginInput[] = []
): Plugin[] {
  const finalPlugins: Plugin[] = [];
  const seenIds = new Set<string>();

  // Helper to add a plugin if not duplicated by ID
  const addPlugin = (pInput: DatePickerPluginInput) => {
    if (isViPlugin(pInput)) {
      if (!seenIds.has(pInput.id)) {
        seenIds.add(pInput.id);
        finalPlugins.push(pInput.factory);
      }
    } else {
      // Raw flatpickr plugin — no ID, just push
      finalPlugins.push(pInput);
    }
  };

  if (modePlugin) {
    addPlugin(modePlugin);
  }

  consumerPlugins.forEach(addPlugin);

  return finalPlugins;
}
