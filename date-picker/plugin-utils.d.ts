import { Plugin } from 'flatpickr/dist/types/options';
import { DatePickerPluginInput, ViDatePickerPlugin } from './types.js';
export declare function isViPlugin(p: DatePickerPluginInput): p is ViDatePickerPlugin;
export declare function resolvePlugin(p: DatePickerPluginInput): Plugin;
/**
 * Merges the built-in mode plugin with any consumer-provided plugins.
 * Ensures the mode plugin is always first, and deduplicates by ViDatePickerPlugin.id.
 */
export declare function mergePlugins(modePlugin: DatePickerPluginInput | null, consumerPlugins?: DatePickerPluginInput[]): Plugin[];
//# sourceMappingURL=plugin-utils.d.ts.map