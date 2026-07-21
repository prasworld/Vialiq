import type { StorybookConfig } from '@storybook/web-components-vite';
import swc from 'unplugin-swc';
import { mergeConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const workspaceRoot = path.resolve(__dirname, '../../..');

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
          'lit': path.dirname(require.resolve('lit/package.json', { paths: [workspaceRoot] })),
          'lit-html': path.dirname(require.resolve('lit-html/package.json', { paths: [workspaceRoot] })),
          'lit-element': path.dirname(require.resolve('lit-element/package.json', { paths: [workspaceRoot] })),
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
