import { DatePickerMode, ViDatePickerPlugin } from './types.js';
/**
 * Lazily loads the required flatpickr plugin for a given picker mode.
 * Returns null if the mode does not require a plugin (e.g. 'date', 'range').
 */
export declare function loadModePlugin(mode: DatePickerMode, options?: Record<string, unknown>): Promise<ViDatePickerPlugin | null>;
//# sourceMappingURL=plugin-registry.d.ts.map