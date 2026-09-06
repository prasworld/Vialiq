/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'form-builder',
    globals: true,
    environment: 'node',
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
