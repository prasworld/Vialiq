/**
 * Flux UI — Styles Entry Point
 * =============================
 *
 * This is a built entry point (@vialiq/flux-ui/styles) that exports the paths
 * to each SCSS partial shipped in the package. Use the paths below in your
 * application's SCSS to import individual layers, or import all at once:
 *
 * In your global styles.scss:
 *
 *   @use '@vialiq/flux-ui/styles/_variables.scss' as *;
 *   @use '@vialiq/flux-ui/styles/_reset.scss';
 *   @use '@vialiq/flux-ui/styles/_layout.scss';
 *   @use '@vialiq/flux-ui/styles/_utilities.scss';
 *
 * Import order matters: variables first (provides CSS custom properties
 * via :root and the @layer order declaration), then reset, layout, utilities.
 */
export const fluxUiStyles = {
  variables: '@vialiq/flux-ui/styles/_variables.scss',
  reset:     '@vialiq/flux-ui/styles/_reset.scss',
  layout:    '@vialiq/flux-ui/styles/_layout.scss',
  utilities: '@vialiq/flux-ui/styles/_utilities.scss',
} as const;

export type FluxUiStyleKey = keyof typeof fluxUiStyles;
