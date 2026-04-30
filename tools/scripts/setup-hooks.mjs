/**
 * setup-hooks.mjs
 *
 * Configures Git to use the repo-committed hooks in `.githooks/`.
 * Invoked automatically by the `prepare` npm lifecycle script so every
 * contributor gets the hooks installed after `npm install`.
 *
 * Behaviour:
 *   • If `core.hooksPath` is already set to `.githooks`  → no-op (already correct).
 *   • If `core.hooksPath` is unset (most common first-clone case) → sets it to .githooks.
 *   • If `core.hooksPath` is set to something else         → warns and does NOT override,
 *     so contributors with custom hook setups (e.g. Husky, lefthook) are not disrupted.
 *   • If the script is not run inside a Git repo (e.g. bare CI clone without .git)
 *     → silently skips; this is harmless because the hooks have no effect outside a repo.
 */

import { execFileSync } from 'node:child_process';

const TARGET = '.githooks';

let current;
try {
  current = execFileSync('git', ['config', 'core.hooksPath'], { encoding: 'utf8' }).trim();
} catch {
  // `git config` exits non-zero when the key is not set — that is the expected
  // first-install path; `current` stays undefined.
  current = undefined;
}

if (current === TARGET) {
  // Already correct — nothing to do.
  process.exit(0);
}

if (current !== undefined) {
  // A different hooksPath is already configured; respect it.
  console.warn(
    `⚠️  Skipping git hooks setup: core.hooksPath is already set to "${current}".\n` +
    `   If you want to use this repo's hooks instead, run:\n` +
    `     git config core.hooksPath ${TARGET}`,
  );
  process.exit(0);
}

// Key was unset — configure it now.
try {
  execFileSync('git', ['config', 'core.hooksPath', TARGET]);
  console.log(`✅ Git hooks configured → ${TARGET}`);
} catch (err) {
  // Not inside a git repo, or git is not installed — safe to skip.
  const msg = String(err.message) + String(err.stderr ?? '');
  if (
    msg.includes('not in a git directory') ||
    msg.includes('not a git') ||
    err.code === 'ENOENT' // git executable not found on PATH
  ) {
    process.exit(0);
  }
  console.error('❌ Failed to set core.hooksPath:', err.message);
  process.exit(1);
}

