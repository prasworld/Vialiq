/**
 * Lazy loads and registers all @vialiq/web-components required by the
 * form builder's default built-in component palette.
 * 
 * Call this function during your application's bootstrap phase to ensure
 * that dropped canvas components render correctly.
 */
export async function registerFormBuilderElements(): Promise<void> {
  const components = [
    // Builder UI components
    { tag: 'vi-label', load: () => import('@vialiq/web-components/label/vi-label') },
    { tag: 'vi-sidebar', load: () => import('@vialiq/web-components/sidebar/vi-sidebar') },
    { tag: 'vi-sidebar-container', load: () => import('@vialiq/web-components/sidebar/vi-sidebar-container') },
    { tag: 'vi-icon', load: () => import('@vialiq/web-components/icons/vi-icon') },
    
    // Canvas components
    { tag: 'vi-input', load: () => import('@vialiq/web-components/input/vi-input') },
    { tag: 'vi-textarea', load: () => import('@vialiq/web-components/textarea/vi-textarea') },
    { tag: 'vi-select', load: () => import('@vialiq/web-components/select/vi-select') },
    { tag: 'vi-select-option', load: () => import('@vialiq/web-components/select/vi-select-option') },
    { tag: 'vi-switch', load: () => import('@vialiq/web-components/switch/vi-switch') },
    { tag: 'vi-content-switcher', load: () => import('@vialiq/web-components/content-switcher/vi-content-switcher') },
    { tag: 'vi-switcher-item', load: () => import('@vialiq/web-components/content-switcher/vi-content-switcher') },
    { tag: 'vi-button', load: () => import('@vialiq/web-components/button/vi-button') },
    { tag: 'vi-checkbox', load: () => import('@vialiq/web-components/checkbox/vi-checkbox') },
    { tag: 'vi-radio', load: () => import('@vialiq/web-components/radio/vi-radio') },
    { tag: 'vi-radio-group', load: () => import('@vialiq/web-components/radio/vi-radio-group') },
    { tag: 'vi-combobox', load: () => import('@vialiq/web-components/combobox/vi-combobox') },
    { tag: 'vi-masked-input', load: () => import('@vialiq/web-components/masked-input/vi-masked-input') },
    { tag: 'vi-upload', load: () => import('@vialiq/web-components/upload/vi-upload') },
    { tag: 'vi-date-picker', load: () => import('@vialiq/web-components/date-picker/vi-date-picker') },
    { tag: 'vi-date-picker-input', load: () => import('@vialiq/web-components/date-picker/vi-date-picker-input') },
    { tag: 'vi-tabs', load: () => import('@vialiq/web-components/tabs/vi-tabs') },
    { tag: 'vi-tab', load: () => import('@vialiq/web-components/tabs/vi-tab') }
  ];

  for (const { tag, load } of components) {
    if (!customElements.get(tag)) {
      try {
        await load();
      } catch (err) {
        console.error(`[FormBuilder] Failed to load web component: ${tag}`, err);
      }
    }
  }
}
