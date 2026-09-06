# ADR-002: Local Library Resolution Strategy in MFE Workspace

| Field | Value |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Author** | Prashant Gupta |
| **Scope** | `@vialiq/icons`, `@vialiq/web-components` in `apps/remote1`, `apps/shell` |

---

## Context

The Vialiq Nx monorepo contains 7 publishable libraries and 2 Angular MFE applications (shell + remote1). Most libraries are resolved directly from source via `tsconfig.base.json` path aliases. However, two libraries — `@vialiq/icons` and `@vialiq/web-components` — have a dual-resolution model:
- **TypeScript** → `dist/libs/*` (via `tsconfig.base.json` paths)
- **Webpack runtime** → `node_modules/@vialiq/*` (via Module Federation resolution)

A decision was needed on how to keep these two resolution paths consistent during local development, given that the MFE Webpack config pulls from `node_modules` while local Vite builds output to `dist`.

---

## Decision

**Use Option A — Publish-then-Install**, with **Verdaccio** as the local npm registry for development.

The root `package.json` keeps explicit version strings for these two packages:

```json
"dependencies": {
  "@vialiq/icons": "0.5.0",
  "@vialiq/web-components": "0.26.0"
}
```

When changes are made to `@vialiq/icons` or `@vialiq/web-components` locally, the developer must:
1. **Build** the updated libraries.
2. **Publish** the new versions to the local Verdaccio registry (`http://localhost:4873`).
3. **Install** (`npm install`) to update `node_modules/` to the new versions.

In CI, packages are published to the real npm registry using standard `nx release publish`.

---

## Alternatives Considered

### Option B — `file:` References
Replace version strings with file references in `package.json` (e.g., `"@vialiq/icons": "file:dist/libs/icons"`).
**Rejected because:** 
- `npm install` fails on a fresh clone if `dist` doesn't exist yet.
- Cannot publish a package that has `file:` peer/dependencies to npm.
- Module Federation singleton version deduplication relies on semver version strings; `file:` references remove that guarantee.

---

## Consequences

### Positive
- Development environment mirrors production exactly (same installed artifacts).
- Verdaccio handles the inner loop without touching the real npm registry.
- Module Federation singleton deduplication works correctly (version-based).

### Negative / Risks
- **Version Drift Risk:** `node_modules/` (what webpack loads) and `dist/libs/` (what TypeScript checks) can diverge if the developer forgets to publish + install after a local lib change.

### Mitigation & Future Spike
- We will track a future spike to potentially create a `dev:sync-libs` script that automates the build → publish-to-verdaccio → npm install sequence to optimize the developer experience.
