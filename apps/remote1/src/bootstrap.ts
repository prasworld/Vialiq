import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { RemoteEntry } from './app/remote-entry/entry';



// ─── Web Components Lazy Registration ─────────────────────────────────────────
// Conditionally load only the required components to keep the initial bundle small.
// Checks the customElements registry to avoid DOMExceptions when running inside MFEs.
(async () => {
  const components = [
    { tag: 'vi-input', load: () => import('@vialiq/web-components/input/vi-input') },
    { tag: 'vi-textarea', load: () => import('@vialiq/web-components/textarea/vi-textarea') },
    { tag: 'vi-select', load: () => import('@vialiq/web-components/select/vi-select') },
    { tag: 'vi-select-option', load: () => import('@vialiq/web-components/select/vi-select-option') },
    { tag: 'vi-switch', load: () => import('@vialiq/web-components/switch/vi-switch') },
    { tag: 'vi-button', load: () => import('@vialiq/web-components/button/vi-button') },
    { tag: 'vi-label', load: () => import('@vialiq/web-components/label/vi-label') },
    { tag: 'vi-sidebar', load: () => import('@vialiq/web-components/sidebar/vi-sidebar') },
    { tag: 'vi-sidebar-container', load: () => import('@vialiq/web-components/sidebar/vi-sidebar-container') }
  ];

  for (const { tag, load } of components) {
    if (!customElements.get(tag)) {
      try {
        await load();
      } catch (err) {
        console.error(`[remote1] Failed to load web component: ${tag}`, err);
      }
    }
  }
})();

bootstrapApplication(RemoteEntry, appConfig).catch((err) => console.error(err));
