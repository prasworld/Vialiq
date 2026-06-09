# Versioning Strategy

Our workspace uses **Semantic Versioning (SemVer)** powered by **Conventional Commits** via Nx Release. 
Version numbers follow the format `MAJOR.MINOR.PATCH` (e.g., `1.2.3`).

Because we use `"useCommitScope": true` in our `nx.json`, you **must** include the project scope in your commit message (e.g., `(flux-ui)`) for the package to be bumped.

Here is a breakdown of how specific commit types trigger version bumps, assuming a package is currently at version `0.0.4`.

## 1. PATCH Version Bump (`0.0.4` ➔ `0.0.5`)
A patch version is triggered when you make backwards-compatible bug fixes, internal code restructurings, or performance optimizations that do not add new features or break existing APIs.

**Triggered by:** `fix`, `refactor`, `perf`

**Examples:**
* `fix(flux-ui): correct dropdown closing unexpectedly on mobile`
* `refactor(flux-ui): simplify the internal CSS for the button`
* `perf(flux-ui): reduce rendering time of the table`

## 2. MINOR Version Bump (`0.0.4` ➔ `0.1.0`)
A minor version is triggered when you add a brand new capability or feature, but **everything old still works** (backwards compatible). 
*(Note: When a Minor version bumps, the Patch number resets to 0).*

**Triggered by:** `feat`

**Examples:**
* `feat(flux-ui): add new Datepicker component`
* `feat(flux-ui): add 'isLoading' prop to Button component`

## 3. MAJOR Version Bump (`0.0.4` ➔ `1.0.0`)
A major version bump happens when you make a **Breaking Change**. Consumers will need to update their code to keep using the library.
*(Note: When a Major version bumps, both the Minor and Patch numbers reset to 0).*

**Triggered by:** Adding an exclamation mark `!` after the scope, or writing `BREAKING CHANGE:` in the commit footer.

**Examples:**
* `feat(flux-ui)!: rename 'variant' prop to 'color' in Button`
* `refactor(flux-ui)!: completely remove the deprecated Card component`

## 4. No Version Bump (Skipped)
Certain commit types are configured to skip the release process entirely because they don't affect the published artifact.

**Triggered by:** `chore`

**Examples:**
* `chore(flux-ui): update testing dependencies`
* `chore(flux-ui): fix typo in README`
* `chore(workspace): configure github actions pipeline`