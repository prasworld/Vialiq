import baseConfig from '../../eslint.config.mjs';
import globals from 'globals';
import lit from 'eslint-plugin-lit';
import wc from 'eslint-plugin-wc';

export default [
  ...baseConfig,
  {
    ignores: ['**/vite.config.ts'],
  },
  {
    files: ['**/*.ts'],
    plugins: {
      lit,
      wc,
    },
    rules: {
      ...lit.configs.recommended.rules,
      ...wc.configs.recommended.rules,
      'lit/no-native-attributes': 'off',
    },
    languageOptions: {
      parserOptions: {
        project: [
          'libs/web-components/tsconfig.json',
          'libs/web-components/tsconfig.lib.json',
          'libs/web-components/tsconfig.spec.json',
          'libs/web-components/tsconfig.storybook.json',
        ],
      },
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts', 'test/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];
