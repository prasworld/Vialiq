/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'state-fp',
    globals: true,
    environment: 'node',
    // Executed from project root, so use project-relative globs.
    include: [
      'src/**/*.{spec,test}.ts',
      'src/**/__tests__/**/*.ts',
      'test-d/**/*.spec-d.ts',
    ],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/state-fp',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/**/index.ts',
        'src/**/types.ts',
      ],
      reporter: ['text', 'lcov', 'html'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
