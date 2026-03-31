import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['test-d/**'],
  },
  {
    files: ['**/*.ts'],
    rules: {},
    languageOptions: {
      parserOptions: {
        project: [
          'libs/state-fp/tsconfig.json',
          'libs/state-fp/tsconfig.lib.json',
          'libs/state-fp/tsconfig.spec.json',
        ],
      },
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
];
