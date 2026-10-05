/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [angular({ tsconfig: resolve(__dirname, 'tsconfig.spec.json') })],
  css: {
    preprocessorOptions: {
      scss: {
        // Vite 7 uses the modern Dart Sass API (compileStringAsync),
        // which requires `loadPaths` — not the legacy `includePaths`.
        // This allows `@use 'flux-ui/styles/variables'` to resolve to
        // libs/flux-ui/styles/_variables.scss in any environment.
        loadPaths: [resolve(__dirname, '../../libs')],
      },
    },
  },
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
