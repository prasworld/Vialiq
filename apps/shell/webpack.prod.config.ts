import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
// Allow webpack to resolve .js imports to .ts source files (ESM interop for monorepo).
// withModuleFederation returns Promise<(baseConfig) => mfConfig>. We extend inside that
// factory so the MF plugin and all its settings are preserved before we add our patches.
export default withModuleFederation(
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
).then(
  (mfFactory) =>
    (baseConfig: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mfConfig = mfFactory(baseConfig);
      return {
        ...mfConfig,
        resolve: {
          ...(mfConfig.resolve ?? {}),
          extensionAlias: { '.js': ['.ts', '.js'], '.mjs': ['.mts', '.mjs'] },
        },
        module: {
          ...(mfConfig.module ?? {}),
          rules: [
            ...(mfConfig.module?.rules ?? []),
            // Handle *.scss?inline imports from Lit web-components (Vite-style inline styles).
            // type:'asset/source' bypasses Angular's SCSS loader pipeline and exports a plain
            // string; sass-loader pre-processes SCSS→CSS before the asset is captured.
            {
              test: /\.scss$/,
              resourceQuery: /inline/,
              type: 'asset/source',
              use: [{ loader: 'sass-loader' }],
            },
          ],
        },
      };
    },
);
