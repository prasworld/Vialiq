import { Plugin } from 'flatpickr/dist/types/options';
interface Config {
    input?: string | HTMLInputElement;
    position?: 'left' | 'center' | 'right';
}
/**
 * A wrapper around Flatpickr's rangePlugin that correctly formats dates back to the
 * Shadow DOM input elements and handles Shadow DOM focus events correctly.
 */
export declare function ViRangePlugin(config: Config): Plugin;
export {};
//# sourceMappingURL=vi-range-plugin.d.ts.map