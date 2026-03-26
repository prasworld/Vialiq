import baseConfig from '../../eslint.config.mjs';
import globals from 'globals';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {},
    languageOptions: {
      parserOptions: {
        project: [
          'libs/flux-ui/tsconfig.json',
          'libs/flux-ui/tsconfig.lib.json',
          'libs/flux-ui/tsconfig.spec.json',
        ],
      },
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {},
    languageOptions: {
      globals: globals.node,
    },
  },
];
