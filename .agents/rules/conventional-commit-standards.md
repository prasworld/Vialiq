---
description: Mandatory Conventional Commits formatting rules required for Nx Release and automated npm publishing across all @vialiq libraries.
---

# Conventional Commit Standards & Publishing Rules

All git commit messages in this repository MUST strictly follow the Conventional Commits specification. The automated release pipeline (`npx nx release version` in `.github/workflows/publish.yml`) parses commit messages using the standard conventional commits regex to calculate semantic version bumps and trigger npm publishing.

Failure to follow these rules will cause Nx to mark commits as `__INVALID__`, skip version bumps, and silently omit packages from npm publishing.

---

## 1. The Golden Rule: Mandatory Space After Colon (`: `)

The single most critical syntax requirement is the colon followed immediately by a space:
`<type>(<optional-scope>): <description>`

- ✅ **CORRECT (Space after colon):**
  - `feat(flux-ui): add float-button and divider styles`
  - `feat: add float-button component`
  - `fix(web-components): resolve outside click dismissal`
  - `fix: lint issues across libs`
  - `refactor(flux-ui): standardize design tokens`

- ❌ **INCORRECT (Breaks release pipeline):**
  - `feat:float button and divider` *(No space after colon &rarr; evaluated as invalid type `feat:float` &rarr; version bump is skipped!)*
  - `fix:review comments` *(No space after colon &rarr; skipped!)*
  - `Fix: float button` *(Uppercase type &rarr; skipped! Types must be lowercase)*
  - `fix : description` *(Space before colon &rarr; skipped!)*

---

## 2. Nx Release Engine Regex

Nx release versioning internally enforces this exact regular expression ([`node_modules/nx/src/command-line/release/utils/git.js`](file:///Users/prashantgupta/code/nx/node_modules/nx/src/command-line/release/utils/git.js#L468)):

```js
const ConventionalCommitRegex = /(?<type>[a-z]+)(\((?<scope>.+)\))?(?<breaking>!)?: (?<description>.+)/i;
```

If a commit does not match this regex:
1. Nx assigns `type: '__INVALID__'`.
2. `config.types['__INVALID__']?.semverBump` evaluates to `undefined`.
3. Nx outputs `🚫 No changes were detected using git history and the conventional commits standard`.
4. The library is not bumped and is excluded from `BUMPED_LIBS`.
5. The library is NOT built and NOT published to npm.

---

## 3. Supported Commit Types & Semver Bumps

Configured in [`nx.json`](file:///Users/prashantgupta/code/nx/nx.json#L140-L159):

| Type | Semver Bump | Triggers Publish? | Usage |
| :--- | :--- | :--- | :--- |
| `feat` | **Minor** (`0.28.0` &rarr; `0.29.0`) | **YES** | New features, components, capabilities |
| `fix` | **Patch** (`0.28.0` &rarr; `0.28.1`) | **YES** | Bug fixes, review remediations, lint fixes |
| `refactor` | **Patch** (`0.28.0` &rarr; `0.28.1`) | **YES** | Code restructuring without feature addition |
| `perf` | **Patch** (`0.28.0` &rarr; `0.28.1`) | **YES** | Performance enhancements |
| `chore` | **None** | **NO** | Tooling, dependencies, maintenance |
| `docs` | **None** | **NO** | Documentation updates only |
| `*!` / `BREAKING CHANGE:` | **Major** (`0.28.0` &rarr; `1.0.0`) | **YES** | Breaking API changes |

---

## 4. Scoping Multi-Project Commits

Per `nx.json`, the repository uses `"projectsRelationship": "independent"` and `"useCommitScope": true`.

- When a commit is specific to a library, specify the project name in parentheses:
  - `feat(flux-ui): ...` &rarr; Bump & publish `@vialiq/flux-ui`
  - `feat(web-components): ...` &rarr; Bump & publish `@vialiq/web-components`
  - `feat(state-fp): ...` &rarr; Bump & publish `@vialiq/state-fp`
  - `feat(automapper): ...` &rarr; Bump & publish `@vialiq/automapper`
  - `feat(icons): ...` &rarr; Bump & publish `@vialiq/icons`
- If a commit touches multiple libraries, you can either:
  1. Omit the scope (e.g. `feat: add float button component and styles`) — Nx will detect all touched libraries and bump them.
  2. Use comma-separated scopes: `feat(flux-ui,web-components): add float button`
- **Never use an invalid scope that excludes the modified library** (e.g., modifying `libs/flux-ui` with `feat(web-components): ...` will cause Nx to treat `flux-ui` as non-project-scoped).

---

## 5. Pre-Merge Verification Checklist

Before pushing commits to a PR or merging to `master`:
1. [ ] Check `git log -n <count> --oneline` to ensure every commit has `: ` (colon + space).
2. [ ] Ensure type is lowercase (`feat:`, `fix:`, `refactor:`, `perf:`).
3. [ ] If changes were made to `libs/flux-ui`, ensure at least one commit touching `libs/flux-ui` uses `feat:` or `fix:`.
4. [ ] Run `npx nx release version --dry-run` to verify that all intended libraries show a pending semver bump.
