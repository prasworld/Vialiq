import rangePlugin from 'flatpickr/dist/plugins/rangePlugin.js';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import type { Plugin } from 'flatpickr/dist/types/options';

interface Config {
  input?: string | HTMLInputElement;
  position?: 'left' | 'center' | 'right';
}

/**
 * A wrapper around Flatpickr's rangePlugin that correctly formats dates back to the
 * Shadow DOM input elements and handles Shadow DOM focus events correctly.
 */
export function ViRangePlugin(config: Config): Plugin {
  // We initialize the base rangePlugin
  // Carbon originally forced position: 'left' to always align to the start date.
  // We remove this constraint so it correctly aligns to the end date when clicked.
  const factory = rangePlugin({ ...config, position: config.position as 'left' | undefined });
  
  return (fp: FlatpickrInstance) => {
    const origRangePlugin = factory(fp);
    const origOnReady = origRangePlugin.onReady;
    
    return Object.assign(origRangePlugin, {
      onChange() { /* Disable default onChange to prevent weird range behaviors */ },
      onPreCalendarPosition() { /* intentional */ },
      onValueUpdate(selectedDates: Date[]) {
        // We sync the formatted dates back to the two inputs when the value updates
        const [startDate, endDate] = selectedDates;
        const startDateFormatted = startDate ? fp.formatDate(startDate, fp.config.dateFormat) : '';
        const endDateFormatted = endDate ? fp.formatDate(endDate, fp.config.dateFormat) : '';
        
        // Ensure start date updates the main input
        if (fp._input && 'value' in fp._input) {
          (fp._input as HTMLInputElement).value = startDateFormatted;
          // Dispatch input event so our Lit wrapper knows the value changed
          fp._input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Ensure end date updates the secondary config input
        if (config.input && typeof config.input !== 'string' && 'value' in config.input) {
          (config.input as HTMLInputElement).value = endDateFormatted;
          config.input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      },
      onReady(dates: Date[], currentDateString: string, self: FlatpickrInstance, data?: unknown) {
        if (typeof origOnReady === 'function') {
          origOnReady(dates, currentDateString, self, data);
        } else if (Array.isArray(origOnReady)) {
          origOnReady.forEach(fn => fn(dates, currentDateString, self, data));
        }
        
        // Make sure flatpickr ignores clicks inside the inputs when they are in shadow DOM
        const { ignoredFocusElements } = fp.config;
        
        // Add shadow roots of ignored elements so clicks inside shadow DOM are ignored
        const shadowRoots = ignoredFocusElements
          .map(elem => (elem as HTMLElement).shadowRoot)
          .filter(Boolean) as unknown as HTMLElement[];
          
        ignoredFocusElements.push(...(shadowRoots || []));
      },
    });
  };
}
