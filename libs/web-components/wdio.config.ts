import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Options } from '@wdio/types';
import swc from 'unplugin-swc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config: Options.Testrunner = {
  runner: [
    'browser',
    {
      preset: 'lit',
      rootDir: __dirname,
      headless: true,
      viteConfig: {
        esbuild: false,
        server: {
          fs: {
            allow: [
              __dirname,
              path.resolve(__dirname, '../../'),
              path.resolve(__dirname, '../../node_modules/@wdio/browser-runner/node_modules'),
            ],
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
      },
    },
  ],
  framework: 'mocha',
  specs: ['./src/**/*.test.ts'],
  maxInstances: 1,
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 30000,
  },
  capabilities: [
    {
      browserName: 'chrome',
    },
  ],
  services: [],
  filesToWatch: ['src/**/*.ts'],
};

export default config;
