/**
 * Flux UI — Styles Entry Point
 * =============================
 *
 * This is a built entry point (@vi/flux-ui/styles) that exports the paths
 * to each SCSS partial shipped in the package. Use the paths below in your
 * application's SCSS to import individual layers, or import all at once:
 *
 * In your global styles.scss:
 *
 *   @use '@vi/flux-ui/styles/_variables.scss' as *;
 *   @use '@vi/flux-ui/styles/_reset.scss';
 *   @use '@vi/flux-ui/styles/_layout.scss';
 *   @use '@vi/flux-ui/styles/_utilities.scss';
 *
 * Import order matters: variables first (provides CSS custom properties
 * via :root and the @layer order declaration), then reset, layout, utilities.
 */
export const fluxUiStyles = {
  variables: '@vi/flux-ui/styles/_variables.scss',
  reset:     '@vi/flux-ui/styles/_reset.scss',
  layout:    '@vi/flux-ui/styles/_layout.scss',
  utilities: '@vi/flux-ui/styles/_utilities.scss',
} as const;

export type FluxUiStyleKey = keyof typeof fluxUiStyles;
