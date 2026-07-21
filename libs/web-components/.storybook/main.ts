import type { StorybookConfig } from '@storybook/web-components-vite';
import swc from 'unplugin-swc';
import { mergeConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const workspaceRoot = path.resolve(__dirname, '../../..');

function resolvePackageDir(pkgName: string): string {
  try {
    const mainPath = require.resolve(pkgName, { paths: [workspaceRoot] });
    const marker = path.join('node_modules', pkgName);
    const idx = mainPath.lastIndexOf(marker);
    if (idx !== -1) {
      const base = mainPath.slice(0, idx);
      return path.join(base, 'node_modules', pkgName);
    }
    return path.dirname(mainPath);
  } catch (error) {
    const fallbackDir = path.join(workspaceRoot, 'node_modules', pkgName);
    if (fs.existsSync(fallbackDir)) {
      return fallbackDir;
    }

    throw new Error(
      `Failed to resolve package "${pkgName}" from workspace root "${workspaceRoot}". ` +
      `require.resolve error: ${(error as Error).message}. ` +
      `Fallback directory "${fallbackDir}" does not exist.`
    );
  }
}

const config: StorybookConfig = {
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  addons: ['@storybook/addon-a11y'],
  // addon-essentials (controls, actions, docs) into core.
  stories: ['../src/**/*.stories.ts'],
  async viteFinal(config) {
    return mergeConfig(config, {
      // Replace esbuild (which doesn't support TC39 standard decorators) with
      // SWC so the same decorator transform used by the build target works here.
      esbuild: false,
      resolve: {
        dedupe: ['lit', 'lit-html', 'lit-element', '@lit/reactive-element'],
        alias: {
          '@vialiq/flux-ui/styles/_index.scss': path.resolve(
            __dirname,
            '../../flux-ui/styles/_index.scss'
          ),
          'lit': resolvePackageDir('lit'),
          'lit-html': resolvePackageDir('lit-html'),
          'lit-element': resolvePackageDir('lit-element'),
        },
      },
      plugins: [
        swc.vite({
          jsc: {
            target: 'es2022',
            parser: { syntax: 'typescript', decorators: true },
            transform: { decoratorVersion: '2022-03' },
          },
          module: { type: 'es6' },
        }),
      ],
    });
  },
};

export default config;
