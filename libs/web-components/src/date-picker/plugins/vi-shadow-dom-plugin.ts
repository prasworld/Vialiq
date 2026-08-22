import type { Instance } from 'flatpickr/dist/types/instance';

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
export function ViShadowDomPlugin() {
  return function (fp: Instance) {
    return {
      onReady: () => {
        if (!fp.calendarContainer) return;

        const originalContains = fp.calendarContainer.contains.bind(fp.calendarContainer);
        
        fp.calendarContainer.contains = (node: Node | null) => {
          if (!node) return false;
          if (originalContains(node)) return true;
          
          let curr: Node | null = node;
          while (curr) {
            if (curr === fp.calendarContainer) return true;
            if (curr.getRootNode() instanceof ShadowRoot) {
              curr = (curr.getRootNode() as ShadowRoot).host;
            } else {
              curr = curr.parentNode;
            }
          }
          return false;
        };
      }
    };
  };
}
