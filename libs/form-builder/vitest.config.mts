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
        // Absolute path so CI can always find flux-ui/styles/variables
        includePaths: [resolve(__dirname, '../../libs')],
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
