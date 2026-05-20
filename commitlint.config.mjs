/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Only these types are recognised by nx release version
    'type-enum': [2, 'always', ['feat', 'fix', 'refactor', 'perf', 'chore', 'docs', 'ci', 'test', 'revert']],

    // Scope is required — prevents unscoped commits from accidentally bumping all libs
    'scope-empty': [2, 'never'],

    // Valid scopes: publishable libs + administrative scopes
    'scope-enum': [
      2,
      'always',
      [
        // publishable libraries (must match nx project names exactly)
        'flux-ui',
        'state-fp',
        'automapper',
        'icons',
        'web-components',
        // cross-cutting / repo-level scopes
        'root',
        'release',
        'ci',
        'apps',
        'shell',
        'remote1',
        'deps',
      ],
    ],
  },
};
