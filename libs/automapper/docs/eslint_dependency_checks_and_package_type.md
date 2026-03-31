# ESLint dependency-checks and package.json "type" for libs/automapper

This library previously used the `generatePackageJson` build option. That option is deprecated for library projects in Nx and should only be used for applications. The `generatePackageJson` option has been removed from `project.json` to avoid producing package.json files with incorrect `type` metadata during the build.

## What was changed

- Removed `generatePackageJson` from `libs/automapper/project.json` build options.
- Kept the build output `format` set to `esm`.
- Added a project-level `libs/automapper/eslint.config.mjs` (flat ESLint config) that extends
  the workspace root config (`../../eslint.config.mjs`) and adds a test-file override for
  `@typescript-eslint/no-empty-function`.

## Why

`generatePackageJson` can produce a `package.json` under `dist/` with a `type` value inherited
from workspace defaults. For libraries it is better to maintain an explicit
`publish-package.json` under `libs/automapper/` and copy it into `dist/` at publish time.

## Decided: ESM only

`@vi/automapper` publishes **ESM only** — no CommonJS fallback. This aligns with the
workspace-wide ESM-only policy (`"type": "module"` in `package.json`).

Implications:
- The published `package.json` must include `"type": "module"`.
- The `"exports"` map should use a `"default"` entry (no separate `"import"`/`"require"` pair).
- No `.cjs` output files are generated or needed.
- Consumers must use ESM (`import`) — `require()` is not supported.

## package.json "type" requirement

The published `package.json` must include:

```json
{
  "type": "module"
}
```

This is already set in `libs/automapper/package.json` and `libs/automapper/publish-package.json`.

## ESLint: project-level flat config

`libs/automapper/eslint.config.mjs` extends the workspace root config and adds:

```js
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: { '@typescript-eslint/no-empty-function': 'off' },
  },
];
```

Run lint for this library:

```bash
npx nx lint automapper
```

## ESLint: Nx dependency-checks rule (recommended for future)

To enforce that this library only depends on allowed packages, add the Nx
`dependency-checks` rule (see: https://nx.dev/nx-api/eslint-plugin/documents/dependency-checks):

```js
// In libs/automapper/eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc';
// ... extend with @nx/dependency-checks rule per Nx docs
```

## CI publish pipeline

The publish pipeline copies `publish-package.json` into `dist/` before calling `npm publish`:

```bash
# build
npx nx build automapper
# copy the hand-crafted publish package.json into dist
cp libs/automapper/publish-package.json dist/libs/automapper/package.json
# publish from dist
cd dist/libs/automapper && npm publish --access public
```