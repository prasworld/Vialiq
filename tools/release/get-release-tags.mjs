#!/usr/bin/env node
/**
 * Outputs release tags created by nx release version.
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

const tags = [];
let hasErrors = false;

for (const lib of projects) {
  const publishPkgPath = `libs/${lib}/publish-package.json`;
  try {
    const pkg = JSON.parse(readFileSync(publishPkgPath, 'utf8'));
    if (pkg.version && typeof pkg.version === 'string') {
      tags.push(`${lib}@${pkg.version}`);
    } else {
      console.error(`ERROR: ${publishPkgPath} has no valid "version" field`);
      hasErrors = true;
    }
  } catch (err) {
    // Report errors so CI doesn't silently miss release tags
    console.error(`ERROR: Could not read version from ${publishPkgPath}: ${err.message}`);
    hasErrors = true;
  }
}

if (hasErrors) {
  process.exit(1);
}

if (tags.length > 0) {
  console.log(tags.join(' '));
}
