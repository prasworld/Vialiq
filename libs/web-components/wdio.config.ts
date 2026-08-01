import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Options, Capabilities } from '@wdio/types';
import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../..');

export const config: Options.Testrunner &
  Capabilities.WithRequestedTestrunnerCapabilities = {
  runner: [
    'browser',
    {
      preset: 'lit',
      rootDir: __dirname,
      headless: true,
      coverage: {
        enabled: true,
        reportsDirectory: path.join(workspaceRoot, 'coverage/web-components'),
        reporter: ['text', 'html', 'json'],
        include: ['src/**/*.ts'],
        exclude: ['**/*.test.ts', '**/*.stories.ts'],
      },
      viteConfig: {
        optimizeDeps: {
          exclude: ['@vialiq/icons'],
        },
        esbuild: false,
        server: {
          fs: {
            allow: [
              __dirname,
              path.resolve(__dirname, '../../'),
              path.resolve(
                __dirname,
                '../../node_modules/@wdio/browser-runner/node_modules',
              ),
            ],
          },
        },
        plugins: [
          tsconfigPaths({ root: workspaceRoot }),
          // Rewrite @vialiq/<lib>/<path> in SCSS @use/@forward statements to
          // the workspace source path. This runs before Sass processes the file,
          // so wdio's Vite server can find partials (like components/input) that
          // exist in the workspace source but haven't been published yet.
          {
            name: 'vialiq-scss-workspace-resolver',
            enforce: 'pre' as const,
            transform(code: string, id: string) {
              if (!id.includes('.scss')) return null;
              if (!code.includes('@vialiq/')) return null;
              const result = code.replace(
                /@(use|forward)\s+['"]@vialiq\/([^/'"]+)\/([^'"]+)['"]/g,
                (
                  _match,
                  directive: string,
                  libName: string,
                  subpath: string,
                ) => {
                  const absPath = path
                    .resolve(workspaceRoot, 'libs', libName, subpath)
                    .replace(/\\/g, '/');
                  return `@${directive} '${absPath}'`;
                },
              );
              if (result === code) return null;
              return { code: result };
            },
          },
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
    timeout: 240000,
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
