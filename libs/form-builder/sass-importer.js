/**
 * Custom ng-packagr transform that injects a Sass importer to resolve
 * @vialiq/<lib>/... imports to the local workspace source files.
 *
 * This mirrors the Vite findFileUrl plugin used in web-components/vite.config.ts,
 * enabling `@use '@vialiq/flux-ui/styles/variables' as tokens;` with full
 * compile-time SASS token validation in Angular libraries built by ng-packagr.
 *
 * Usage: referenced from project.json as transformProviders.
 */
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const workspaceRoot = path.resolve(__dirname, '../..');

const vialiqSassImporter = {
  findFileUrl(url) {
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
      path.join(basePath, '_index.scss'),
      path.join(basePath, 'index.scss'),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return pathToFileURL(candidate);
    }
    return null;
  },
};

module.exports = { vialiqSassImporter };
