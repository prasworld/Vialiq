import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
// Allow webpack to resolve .js imports to .ts source files (ESM interop for monorepo)
export default (withModuleFederation(config, { dts: false }) as Promise<Record<string, unknown>>).then(
  (mfConfig) => ({
    ...mfConfig,
    resolve: {
      ...(mfConfig['resolve'] as Record<string, unknown>),
      extensionAlias: { '.js': ['.ts', '.js'], '.mjs': ['.mts', '.mjs'] },
    },
    module: {
      ...((mfConfig['module'] as Record<string, unknown>) ?? {}),
      rules: [
        ...((mfConfig['module'] as Record<string, { rules?: unknown[] }>)?.rules ?? []),
        // Handle *.scss?inline imports from Lit web-components (Vite-style inline styles)
        // Angular's sass-loader chain compiles SCSS→CSS; asset/source exports it as a string.
        {
          test: /\.scss$/,
          resourceQuery: /inline/,
          type: 'asset/source',
        },
      ],
    },
  }),
);
