import type { StorybookConfig } from '@storybook/web-components-vite';
import swc from 'unplugin-swc';
import { mergeConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  // addons: no separate addon packages needed — Storybook v10 bundles
  // addon-essentials (controls, actions, docs) into core.
  stories: ['../src/**/*.stories.ts'],
  async viteFinal(config) {
    return mergeConfig(config, {
      // Replace esbuild (which doesn't support TC39 standard decorators) with
      // SWC so the same decorator transform used by the build target works here.
      esbuild: false,
      resolve: {
        alias: {
          '@vialiq/flux-ui/styles/_index.scss': path.resolve(
            __dirname,
            '../../flux-ui/styles/_index.scss'
          ),
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
