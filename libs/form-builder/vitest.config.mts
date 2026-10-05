/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';
import { existsSync } from 'fs';
import type { Plugin } from 'vite';

/**
 * Resolves bare SCSS specifiers (e.g. `flux-ui/styles/variables`)
 * against a list of include paths, exactly like Sass --load-path.
 *
 * Angular's internal Sass compiler bypasses Vite's css.preprocessorOptions,
 * so we must intercept SCSS resolution here at the Vite plugin level.
 */
function sassIncludePaths(includePaths: string[]): Plugin {
  return {
    name: 'sass-include-paths',
    enforce: 'pre',
    resolveId(source: string, importer: string | undefined) {
      // Only intercept imports coming from inside an SCSS file
      if (!importer?.endsWith('.scss') && !importer?.endsWith('.sass')) return;
      // Skip relative and absolute paths — they resolve fine already
      if (source.startsWith('.') || source.startsWith('/')) return;

      for (const base of includePaths) {
        // Try Sass partial convention (_filename.scss) and bare filename
        const candidates = [
          resolve(base, source + '.scss'),
          resolve(base, source + '/_index.scss'),
          resolve(base, '_' + source + '.scss'),
        ];
        for (const candidate of candidates) {
          if (existsSync(candidate)) {
            return candidate;
          }
        }
      }
      return undefined;
    },
  };
}

const libsDir = resolve(__dirname, '../../libs');

export default defineConfig({
  root: __dirname,
  plugins: [
    sassIncludePaths([libsDir]),
    angular({ tsconfig: resolve(__dirname, 'tsconfig.spec.json') }),
  ],
  test: {
    name: 'form-builder',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: [
      'src/**/*.{spec,test}.ts',
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/form-builder',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/**/index.ts',
        'src/**/types/**',
      ],
      reporter: ['text', 'lcov', 'html'],
      // Rule engine must reach 100% — overall threshold set high
      thresholds: { lines: 95, functions: 95, branches: 90, statements: 95 },
    },
  },
});
