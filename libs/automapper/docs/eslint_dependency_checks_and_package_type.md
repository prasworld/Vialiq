# ESLint dependency-checks and package.json "type" for libs/automapper

This library previously used the `generatePackageJson` build option. That option is deprecated for library projects in Nx and should only be used for applications. The `generatePackageJson` option has been removed from `project.json` to avoid producing package.json files with incorrect `type` metadata during the build.

What I changed

- Removed `generatePackageJson` from `libs/automapper/project.json` build options.
- Kept the build output `format` set to `esm`.

Why

- `generatePackageJson` can produce a `package.json` under `dist/` with a `type` value inherited from workspace or default behaviour. For libraries it's better to manage the published `package.json` explicitly to ensure `type` matches the publish format (CJS vs ESM).

Recommendations

1) ESLint: use Nx `dependency-checks` rule

- Use the Nx-provided dependency-checks ESLint rules (see: https://nx.dev/nx-api/eslint-plugin/documents/dependency-checks) to enforce that this library only depends on allowed workspace packages and external deps.
- Add the rule to the library's ESLint config (or the workspace root config) per the Nx docs. Example (adapt to exact rule names shown in the Nx docs):

```json
{
  "plugins": ["@nx/dependency-checks"],
  "rules": {
    "@nx/dependency-checks/<rule-name>": "error"
  }
}
```

- If your workspace already uses a shared `.eslintrc.json`, add the dependency-checks rule there so it applies to other libs as needed.

2) package.json `type` and ESM vs CJS

- Your build is producing ESM output (`format: ["esm"]`). If you publish an npm package that is ESM-only, the package `package.json` must include:

```json
{
  "type": "module"
}
```

- If you intend the package to be consumable as CommonJS (`require()`), either:
  - Build and publish CJS artifacts (set `format` to `cjs` in `project.json` and publish with `type: "commonjs"`), or
  - Publish dual packages with both ESM and CJS builds and set the appropriate `exports` map and `type` field.

- Because `generatePackageJson` is removed, you must provide a correct `package.json` for publishing (either in your `dist` via a publishing pipeline step, or maintain a `package.json` template under `libs/automapper/publish-package.json` that CI copies into `dist` before publish). That package.json should explicitly set or omit `type` as appropriate.

Quick examples

- To publish ESM-only package: include `"type": "module"` in the published `package.json`.
- To publish CJS-only package: include `"type": "commonjs"` or omit `type` (Node defaults to CommonJS for files ending with `.cjs`/`.js` when no `type` is present).

CI suggestion

- Add a build step that copies a pre-crafted `package.json` into `dist/libs/automapper` before publishing. This avoids relying on auto-generated package.json contents.

Example pipeline snippet (pseudo):

```bash
# build
npx nx build automapper
# copy pre-made package.json for publish
cp libs/automapper/publish-package.json dist/libs/automapper/package.json
# publish from dist/libs/automapper
cd dist/libs/automapper && npm publish --access public
```

If you'd like, I can:

- Add a `publish-package.json` template under `libs/automapper` and a small `postbuild` target in `project.json` to copy it into `dist`.
- Update the workspace `.eslintrc.json` with the `@nx/dependency-checks` rule (I will follow the exact rule ids from the Nx docs).

Tell me which you'd like me to do next.