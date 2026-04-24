#!/usr/bin/env node
/**
 * Bootstrap release tags for nx release (git-tag resolver).
 *
 * Must be run from the repository root (the directory that contains nx.json).
 * For each project in nx.release.projects, creates an annotated git tag at
 * HEAD using the version from libs/<project>/publish-package.json if no such
 * tag already exists.
 *
 * IMPORTANT: run this only when the working tree is clean. Tags point to the
 * current HEAD commit; creating bootstrap tags on a dirty tree would associate
 * a version with uncommitted content, causing nx release version to compute
 * incorrect diffs on subsequent runs.
 */

import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// ── 1. CWD guard ──────────────────────────────────────────────────────────────
// All relative paths in this script assume the repo root as CWD.
if (!existsSync('nx.json')) {
  console.error(
    'ERROR: nx.json not found in the current directory.\n' +
    'Run this script from the repository root, e.g.:\n' +
    '  node tools/release/bootstrap-tags.mjs'
  );
  process.exit(1);
}

// ── 2. Working-tree clean check ───────────────────────────────────────────────
// Bootstrap tags are created at HEAD. If there are uncommitted changes, the
// tag would point to a commit that does not represent what's in the files.
let dirty;
try {
  dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
} catch (err) {
  console.error(`ERROR: Failed to run git status: ${err.message}`);
  process.exit(1);
}
if (dirty) {
  console.error(
    'ERROR: Working tree is dirty. Commit or stash your changes before running bootstrap.\n' +
    'Dirty files:\n' + dirty
  );
  process.exit(1);
}

// ── 3. Read nx.json ───────────────────────────────────────────────────────────
let nx;
try {
  nx = JSON.parse(readFileSync('nx.json', 'utf8'));
} catch (err) {
  console.error(`ERROR: Failed to parse nx.json: ${err.message}`);
  process.exit(1);
}

const projects = nx?.release?.projects;
if (!Array.isArray(projects) || projects.length === 0) {
  console.error('ERROR: release.projects is missing or empty in nx.json');
  process.exit(1);
}

// ── 4. Bootstrap tags ─────────────────────────────────────────────────────────
const createdTags = [];

for (const lib of projects) {
  const publishPkgPath = `libs/${lib}/publish-package.json`;

  // Validate presence and parsability of publish-package.json before proceeding.
  if (!existsSync(publishPkgPath)) {
    console.warn(`WARN: ${publishPkgPath} not found — skipping ${lib}`);
    continue;
  }

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(publishPkgPath, 'utf8'));
  } catch (err) {
    console.warn(`WARN: Failed to parse ${publishPkgPath} (${err.message}) — skipping ${lib}`);
    continue;
  }

  if (!pkg.version || typeof pkg.version !== 'string') {
    console.warn(`WARN: ${publishPkgPath} has no valid "version" field — skipping ${lib}`);
    continue;
  }

  const tag = `${lib}@${pkg.version}`;

  // Check whether the tag already exists locally (remote tags were fetched earlier
  // in the workflow with `git fetch --tags --force`).
  // `git rev-parse --verify` exits with code 128 when the ref does not exist —
  // that is the *expected* "not found" path. Any other non-zero exit code means
  // git itself had a problem (not a repo, disk error, permissions, etc.) and we
  // must not silently proceed to tag creation.
  let tagExists = false;
  try {
    execFileSync('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${tag}`], {
      stdio: 'pipe', // capture output; errors surfaced via thrown Error object
      encoding: 'utf8',
    });
    tagExists = true;
  } catch (err) {
    const exitCode = err.status ?? err.code;
    if (exitCode !== 1) {
      // Unexpected git failure — surface it and abort rather than masking it.
      // With --quiet, git rev-parse --verify exits 1 when the ref doesn't exist
      // (the expected case). Any other non-zero code indicates a real problem.
      console.error(
        `ERROR: git rev-parse failed for tag "${tag}" (exit ${exitCode}).\n` +
        (err.stderr?.trim() || err.message)
      );
      process.exit(1);
    }
    // exit code 1 with --quiet → ref not found → safe to create the tag
  }

  if (tagExists) {
    console.log(`Tag already exists: ${tag}`);
  } else {
    const message = `chore: initial release tag for ${tag}`;
    // stdio: 'inherit' so any git error (e.g. tag already exists on remote,
    // permission denied) prints directly to the terminal and is debuggable.
    execFileSync('git', ['tag', '-a', tag, '-m', message], { stdio: 'inherit' });
    createdTags.push(tag);
    console.log(`Created tag: ${tag}`);
  }
}

// ── 5. Summary + GitHub Actions outputs ──────────────────────────────────────
console.log(`\nBootstrap complete. Created ${createdTags.length} tag(s).`);

const githubOutput = process.env.GITHUB_OUTPUT;
if (githubOutput) {
  appendFileSync(githubOutput, `created_count=${createdTags.length}\n`);
  appendFileSync(githubOutput, `created_tags=${createdTags.join(',')}\n`);
}
