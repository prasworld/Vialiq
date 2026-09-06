import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';
import { Configuration } from 'webpack';
import * as path from 'path';
import * as fs from 'fs';
import { pathToFileURL } from 'url';

const workspaceRoot = path.resolve(__dirname, '../..');

/**
 * Custom Sass importer that resolves @vialiq/<lib>/... imports to the local
 * workspace source — mirrors the Vite findFileUrl plugin used in web-components.
 * This allows SCSS files to `@use '@vialiq/flux-ui/styles/variables' as tokens;`
 * and get full compile-time token validation instead of silent CSS var() failures.
 */
const vialiqSassImporter = {
  findFileUrl(url: string): URL | null {
    const match = url.match(/^@vialiq\/([^/]+)\/(.+)$/);
    if (!match) return null;
    const [, libName, subpath] = match;

    const basePath = path.resolve(workspaceRoot, 'libs', libName, subpath);
    const dir = path.dirname(basePath);
    const base = path.basename(basePath);
    const ext = path.extname(basePath);

    if (ext === '.scss' || ext === '.css') {
      if (fs.existsSync(basePath)) return pathToFileURL(basePath);
      if (!base.startsWith('_')) {
        const partial = path.join(dir, `_${base}`);
        if (fs.existsSync(partial)) return pathToFileURL(partial);
      }
      return null;
    }

    const candidates = [
      path.join(dir, `_${base}.scss`),
      path.join(dir, `${base}.scss`),
      path.join(basePath, `_index.scss`),
      path.join(basePath, `index.scss`),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return pathToFileURL(candidate);
    }
    return null;
  },
};

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
export default withModuleFederation(config, { dts: false }).then(
  (federationConfig: Configuration) => ({
    ...federationConfig,
    module: {
      ...federationConfig.module,
      rules: (federationConfig.module?.rules ?? []).map((rule: any) => {
        // Inject the custom importer into every sass-loader rule
        if (!rule || typeof rule !== 'object' || !rule.use) return rule;
        return {
          ...rule,
          use: rule.use.map((loader: any) => {
            if (
              !loader ||
              typeof loader !== 'object' ||
              !loader.loader ||
              !loader.loader.includes('sass-loader')
            ) {
              return loader;
            }
            return {
              ...loader,
              options: {
                ...loader.options,
                sassOptions: {
                  ...(loader.options?.sassOptions ?? {}),
                  importers: [
                    vialiqSassImporter,
                    ...((loader.options?.sassOptions?.importers as unknown[]) ?? []),
                  ],
                },
              },
            };
          }),
        };
      }),
    },
  })
);
