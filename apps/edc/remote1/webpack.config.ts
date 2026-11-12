import { withModuleFederation } from '@nx/module-federation/angular';
import config from './module-federation.config';
import type { Configuration, RuleSetRule } from 'webpack';
import * as path from 'path';
import * as fs from 'fs';
import { pathToFileURL } from 'url';

const workspaceRoot = path.resolve(__dirname, '../../..');

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

function mergeSassOptions(raw: unknown): Record<string, unknown> {
  const base =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const existingImporters = Array.isArray(base['importers'])
    ? base['importers']
    : [];
  return {
    ...base,
    importers: [vialiqSassImporter, ...existingImporters],
  };
}

function patchSassLoader<T>(loader: T): T {
  if (!loader || typeof loader !== 'object') return loader;
  const entry = loader as {
    loader?: unknown;
    options?: unknown;
  };
  if (typeof entry.loader !== 'string' || !entry.loader.includes('sass-loader')) {
    return loader;
  }

  const options =
    entry.options && typeof entry.options === 'object'
      ? (entry.options as Record<string, unknown>)
      : {};
  const rawSassOptions = options['sassOptions'];
  // Angular CLI defines sassOptions as a function (loaderContext) => ({ loadPaths, importers, ... });
  // preserve and wrap it rather than overwriting with a plain object.
  const sassOptions =
    typeof rawSassOptions === 'function'
      ? (...args: unknown[]) =>
          mergeSassOptions(
            (rawSassOptions as (...loaderArgs: unknown[]) => unknown)(...args),
          )
      : mergeSassOptions(rawSassOptions);

  return {
    ...loader,
    options: {
      ...options,
      sassOptions,
    },
  };
}

type WebpackRule = RuleSetRule | false | 0 | '' | '...' | null | undefined;

function injectSassImporter<T extends WebpackRule>(rule: T): T {
  if (!rule || typeof rule !== 'object') return rule;

  const updatedRule: RuleSetRule = { ...rule };
  if (Array.isArray(rule.use)) {
    updatedRule.use = rule.use.map(patchSassLoader) as RuleSetRule['use'];
  } else if (rule.use && typeof rule.use === 'object') {
    updatedRule.use = patchSassLoader(rule.use);
  }
  if (Array.isArray(rule.rules)) {
    updatedRule.rules = rule.rules.map(injectSassImporter);
  }
  if (Array.isArray(rule.oneOf)) {
    updatedRule.oneOf = rule.oneOf.map(injectSassImporter);
  }
  return updatedRule as T;
}

/**
 * DTS Plugin is disabled in Nx Workspaces as Nx already provides Typing support for Module Federation
 * The DTS Plugin can be enabled by setting dts: true
 * Learn more about the DTS Plugin here: https://module-federation.io/configure/dts.html
 */
// withModuleFederation resolves to a factory `(baseConfig) => mfConfig`, so wrap it
// to preserve Module Federation's config and patch the resulting webpack rules.
export default withModuleFederation(config, { dts: false }).then(
  (mfFactory) =>
    (baseConfig: Configuration): Configuration => {
      const mfConfig: Configuration = mfFactory(baseConfig);
      return {
        ...mfConfig,
        module: {
          ...mfConfig.module,
          rules: (mfConfig.module?.rules ?? []).map(injectSassImporter),
        },
      };
    },
);
