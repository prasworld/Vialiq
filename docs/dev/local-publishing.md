# Local Package Publishing Guide

This guide details how to build and publish workspace libraries (like `@vialiq/web-components`) to the local Verdaccio registry for development and testing, and explains how versioning works when transitioning to a public npm release via GitHub Actions.

## 1. How a Published Version is Derived

When a library is built using Nx, the version that gets published is derived directly from the library's source `package.json`.

1. **Source of Truth**: The `version` field in `libs/<project-name>/package.json` (e.g., `0.33.0`).
2. **Build Process**: When you run `npx nx build <project-name>`, the build executor (like `@nx/vite:build` or `@nx/js:tsc`) copies and compiles this `package.json` into the output directory (e.g., `dist/libs/<project-name>`).
3. **Publishing**: The `npm publish` command must be run from inside the `dist/` directory, and it will use the copied `package.json` version as the canonical version for the registry.

## 2. Publishing to Local Verdaccio Registry

When developing locally, you can use Verdaccio to test the fully packaged version of your libraries across different apps without relying on TypeScript path mapping.

### Step 1: Start Verdaccio
Ensure the local registry is running:
```bash
npx nx run @./source:local-registry
```
*(This usually runs on `http://localhost:4873`)*

### Step 2: Build the Library
Build the library you want to publish:
```bash
npx nx build web-components
```

### Step 3: Unpublish Existing Version (If Iterating)
Unlike the public npm registry, you can overwrite versions on local Verdaccio to quickly test changes without bumping the version number every time. However, you must first forcefully unpublish the existing tag. 

> [!IMPORTANT]
> Even if you just restarted Verdaccio and its local storage is completely empty, **you must still run `npm unpublish` if the version you are trying to publish already exists on the public NPM registry (`npmjs.com`)**. 
> Verdaccio acts as a proxy. If it doesn't have the package locally, it checks upstream. If it finds the version upstream, it will block your publish with a `409 Conflict` to prevent you from overwriting a public version. 
> Running `npm unpublish --force` against your local registry forces Verdaccio to create a local override (tombstone), allowing you to safely bypass the upstream proxy check without affecting the real public package.

```bash
npm unpublish @vialiq/web-components@<CURRENT_VERSION> --registry http://localhost:4873 --force
```

### Step 4: Publish to Verdaccio
Navigate to the built output directory and publish pointing to the local registry (or use this convenient one-liner that builds and publishes in one go):
```bash
npx nx build web-components && cd dist/libs/web-components && npm publish --registry http://localhost:4873
```

### Step 5: Consume the Local Package
In the application consuming the package (or in the root workspace), force an install from the local registry to fetch your updated code:
```bash
npm uninstall @vialiq/web-components
npm install @vialiq/web-components@<CURRENT_VERSION> --registry http://localhost:4873 --force
```
*Note: If you run into Webpack/Nx cache issues during dev (where the old code still loads), you may need to clear the cache using `npx nx reset` (or delete `node_modules/.cache`) and completely restart your dev server (`npx nx run <app>:serve`).*

---

## 3. Transitioning to Public NPM (GitHub Actions)

When you are ready to merge your changes and publish the official package to the public NPM registry via GitHub Actions, ensure you adhere to the following rules:

### What to "Undo" or Verify Before Pushing
1. **Do not commit Verdaccio registry URLs**: Ensure no scripts in `package.json`, CI YAML files, or `.npmrc` files hardcode `--registry http://localhost:4873`. The CI pipeline must naturally default to `https://registry.npmjs.org/`.
2. **Remove `npm unpublish` logic**: The public NPM registry is strictly immutable. You **cannot** unpublish and republish the same version string. Never leave forced unpublish steps in your CI pipeline.
3. **Bump the Version Number**: Because you cannot overwrite versions on public NPM, you **MUST bump the `version` field** in `libs/<project-name>/package.json` (e.g., from `0.33.0` to `0.33.1` or `0.34.0`) before pushing to GitHub. If the version is not incremented, the NPM publish step in GitHub Actions will fail with an `E409 Conflict`.
4. **Clean up forced local installs**: If you added temporary scripts to force install from Verdaccio during dev, remove them. Your CI should rely on standard `npm ci` or `npm install`.
