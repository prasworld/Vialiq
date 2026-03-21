/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'state-fp',
    globals: true,
    environment: 'node',
    // Nx executes from workspace root, so use workspace-relative globs.
    include: [
      'libs/state-fp/src/**/*.{spec,test}.ts',
      'libs/state-fp/src/**/__tests__/**/*.ts',
      'libs/state-fp/test-d/**/*.spec-d.ts',
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
