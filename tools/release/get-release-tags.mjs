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

const nx = JSON.parse(readFileSync('nx.json', 'utf8'));
const projects = nx?.release?.projects;

if (!Array.isArray(projects) || projects.length === 0) {
  console.error('ERROR: release.projects is missing or empty in nx.json');
  process.exit(1);
}

/**
 * Verify a specific package version exists on the public npm registry.
 * Uses the unscoped registry endpoint — no auth required for public packages.
 * Returns true if the registry responds with 200 for that exact version.
 */
async function isPublishedOnNpm(packageName, version) {
  const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}/${encodeURIComponent(version)}`;
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.status === 200;
  } catch (err) {
    console.error(`ERROR: Could not reach npm registry for ${packageName}@${version}: ${err.message}`);
    return false;
  }
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
  const published = await isPublishedOnNpm(pkg.name, pkg.version);
  if (published) {
    tags.push(`${lib}@${pkg.version}`);
  } else {
    console.error(
      `WARNING: ${pkg.name}@${pkg.version} not found on npm registry — ` +
      `skipping tag push. The publish step may have failed or is still propagating.`
    );
  }
}

if (hasErrors) {
  process.exit(1);
}

if (tags.length > 0) {
  console.log(tags.join(' '));
}
