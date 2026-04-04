import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
// Allow webpack to resolve .js imports to .ts source files (ESM interop for monorepo)
export default (
  withModuleFederation(
    {
      ...config,
      /*
       * Remote overrides for production.
       * Each entry is a pair of a unique name and the URL where it is deployed.
       *
       * e.g.
       * remotes: [
       *   ['app1', 'https://app1.example.com'],
       *   ['app2', 'https://app2.example.com'],
       * ]
       */
    },
    { dts: false },
  ) as unknown as Promise<Record<string, unknown>>
).then((mfConfig) => {
  const existingRules: unknown[] =
    (mfConfig['module'] as { rules?: unknown[] } | undefined)?.rules ?? [];
  return {
    ...mfConfig,
    resolve: {
      ...(mfConfig['resolve'] as Record<string, unknown>),
      extensionAlias: { '.js': ['.ts', '.js'], '.mjs': ['.mts', '.mjs'] },
    },
    module: {
      ...((mfConfig['module'] as Record<string, unknown>) ?? {}),
      rules: [
        ...existingRules,
        // Handle *.scss?inline imports from Lit web-components (Vite-style inline styles)
        {
          test: /\.scss$/,
          resourceQuery: /inline/,
          type: 'asset/source',
        },
      ],
    },
  };
});
