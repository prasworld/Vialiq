import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {},
    languageOptions: {
      parserOptions: {
        project: ['libs/design-system/tsconfig.*?.json'],
      },
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    env: {
      node: true,
    },
    rules: {},
  },
];
