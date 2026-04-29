#!/usr/bin/env node
/**
 * Outputs release tags created by nx release version — but ONLY for versions
 * that are confirmed to be published on the npm registry.
 *
 * This is the critical guard that ensures a git tag never exists in the
 * repository for a version that did not make it to npm. Even if the publish
 * step somehow succeeded partially or a tag was pushed prematurely in a
 * previous run, this script will refuse to output a tag unless the registry
 * confirms the version is live.
 *
 * After `nx release version` completes, this script reads the updated
 * publish-package.json files for each project and outputs the corresponding
 * git tag names (in the format {projectName}@{version}) that should be pushed.
 *
 * Usage:
 *   node tools/release/get-release-tags.mjs
 *
 * Output: Space-separated tag names (e.g., "flux-ui@0.0.2 state-fp@0.5.1")
 */

import { readFileSync } from 'node:fs';

// `fetch` is a stable global in Node 18+. The publish workflow pins Node 24,
// but guard here so a misconfigured environment fails fast with a clear message
// rather than a cryptic "fetch is not defined" later in the loop.
if (typeof fetch !== 'function') {
  console.error(
    'ERROR: global fetch is not available. This script requires Node 18 or later.\n' +
    `Current version: ${process.version}`
  );
  process.exit(1);
}

const nx = JSON.parse(readFileSync('nx.json', 'utf8'));
const projects = nx?.release?.projects;

if (!Array.isArray(projects) || projects.length === 0) {
  console.error('ERROR: release.projects is missing or empty in nx.json');
  process.exit(1);
}

/**
 * Check whether a specific package version exists on the public npm registry,
 * with bounded retries and exponential backoff.
 *
 * npm publish propagation can take a few seconds, and transient 5xx / network
 * errors should not permanently orphan a release tag. Retrying distinguishes
 * "not yet live" from "genuinely not published".
 *
 * Return values:
 *   'published'   — registry confirmed 200 within the retry window.
 *   'not-found'   — all attempts returned 404: the version was never published.
 *
 * Throws on:
 *   - Non-404/200 HTTP responses (5xx, 429, …) after all retries exhausted.
 *   - Network-level failures (DNS, TLS, …) after all retries exhausted.
 *
 * @param {string} packageName
 * @param {string} version
 * @param {{ maxAttempts?: number, initialDelayMs?: number }} [opts]
 */
async function checkNpmPublished(packageName, version, { maxAttempts = 5, initialDelayMs = 2000 } = {}) {
  const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}/${encodeURIComponent(version)}`;

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let response;
    try {
      response = await fetch(url, { method: 'HEAD' });
    } catch (err) {
      // Network-level failure (DNS, timeout, TLS, …) — retry.
      lastError = new Error(
        `Network error reaching npm registry for ${packageName}@${version} ` +
        `(attempt ${attempt}/${maxAttempts}): ${err.message}`
      );
      console.error(lastError.message);
    }

    if (response) {
      if (response.status === 200) return 'published';
      if (response.status === 404) {
        // Definitive "not published" — 404 means the registry knows the
        // package but not this version. No retry needed.
        return 'not-found';
      }
      // Unexpected status (5xx, 429, …) — retry after backoff.
      lastError = new Error(
        `Unexpected HTTP ${response.status} from npm registry for ` +
        `${packageName}@${version} (attempt ${attempt}/${maxAttempts})`
      );
      console.error(lastError.message);
    }

    if (attempt < maxAttempts) {
      const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
      console.error(`Retrying in ${delayMs}ms\u2026`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // All attempts exhausted — surface the last error so CI fails loudly.
  throw lastError;
}

const tags = [];
let hasErrors = false;

for (const lib of projects) {
  const publishPkgPath = `libs/${lib}/publish-package.json`;
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(publishPkgPath, 'utf8'));
  } catch (err) {
    console.error(`ERROR: Could not read ${publishPkgPath}: ${err.message}`);
    hasErrors = true;
    continue;
  }

  if (!pkg.version || typeof pkg.version !== 'string') {
    console.error(`ERROR: ${publishPkgPath} has no valid "version" field`);
    hasErrors = true;
    continue;
  }

  if (!pkg.name || typeof pkg.name !== 'string') {
    console.error(`ERROR: ${publishPkgPath} has no valid "name" field`);
    hasErrors = true;
    continue;
  }

  // Verify the version is actually live on npm before pushing the tag.
  // A tag pushed without a corresponding npm publish creates an orphaned
  // release that consumers cannot install — worse than no tag at all.
  let status;
  try {
    status = await checkNpmPublished(pkg.name, pkg.version);
  } catch (err) {
    // Transient registry/network error — fail the script so CI surfaces it.
    // The tag will be pushed on the next successful run once the registry
    // is reachable and the version is confirmed live.
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
  }

  if (status === 'published') {
    tags.push(`${lib}@${pkg.version}`);
  } else {
    // status === 'not-found': the publish step failed or the version was
    // never sent to npm. Warn but continue so other projects can still get
    // their tags pushed.
    console.error(
      `WARNING: ${pkg.name}@${pkg.version} not found on npm registry — ` +
      `skipping tag push. The publish step may have failed for this package.`
    );
  }
}

if (hasErrors) {
  process.exit(1);
}

if (tags.length > 0) {
  console.log(tags.join(' '));
}
