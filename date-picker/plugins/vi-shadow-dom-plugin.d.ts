import { Instance } from 'flatpickr/dist/types/instance';
/**
 * A Carbon Web Components inspired plugin that fixes Flatpickr's native
 * event targeting issues when used within a Web Component (Shadow DOM).
 *
 * Flatpickr relies on native `Node.contains()` for its `documentClick` listener
 * to determine if a click occurred outside the calendar. Because Shadow DOM
 * boundaries are not pierced by `Node.contains()`, clicks on custom elements
 * (like `<vi-select>`) inside the calendar are falsely identified as outside
 * clicks, causing the calendar to close unexpectedly.
 *
 * This plugin overrides `fp.calendarContainer.contains` to properly traverse
 * up through Shadow Roots.
 */
export declare function ViShadowDomPlugin(): (fp: Instance) => {
    onReady: () => void;
};
//# sourceMappingURL=vi-shadow-dom-plugin.d.ts.map