/**
 * Design System Styles Entry Point
 * =================================
 * 
 * This module serves as a marker/export for the design system styles.
 * Users import CSS/SCSS files directly in their application's style files.
 * 
 * Usage in your app (example with SCSS):
 * 
 * // In your global styles.scss
 * @import '@vi/flux-ui/styles/_variables.scss';
 * @import '@vi/flux-ui/styles/_reset.scss';
 * @import '@vi/flux-ui/styles/_layout.scss';
 * @import '@vi/flux-ui/styles/_utilities.scss';
 * 
 * Or in your TypeScript (HTML):
 * 
 * // In your component bootstrap
 * import '@vi/flux-ui/styles/_variables.scss';
 * import '@vi/flux-ui/styles/_reset.scss';
 * import '@vi/flux-ui/styles/_layout.scss';
 * import '@vi/flux-ui/styles/_utilities.scss';
 */

// Export a marker object to indicate styles module
export const styles = {
  variables: '@vi/flux-ui/styles/_variables.scss',
  reset: '@vi/flux-ui/styles/_reset.scss',
  layout: '@vi/flux-ui/styles/_layout.scss',
  utilities: '@vi/flux-ui/styles/_utilities.scss',
};
