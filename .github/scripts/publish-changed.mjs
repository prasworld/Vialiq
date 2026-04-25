#!/usr/bin/env node
/**
 * Publishes each library to npm if its local version (from publish-package.json)
 * differs from what is currently on the registry.
 *
 * Run from the workspace root. Uses the current npm authentication configuration
 * (for example, the CI environment's OIDC/Trusted Publishing setup) rather than
 * requiring a NODE_AUTH_TOKEN to be set explicitly.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Single source of truth: read publishable libs from nx.json release.projects
const nxJson = JSON.parse(readFileSync('nx.json', 'utf8'));
if (!Array.isArray(nxJson?.release?.projects) || nxJson.release.projects.length === 0) {
  console.error('✖ nx.json is missing a non-empty release.projects array. Cannot determine which libraries to publish.');
  process.exit(1);
}
const PUBLISHABLE_LIBS = nxJson.release.projects;

let publishedCount = 0;
let skippedCount = 0;

for (const lib of PUBLISHABLE_LIBS) {
  const pkgPath = join('libs', lib, 'publish-package.json');
  const distPath = join('dist', 'libs', lib);

  const localPkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const { name, version: localVersion } = localPkg;

  // Check if this exact version is already published on npm.
  // (Uses npm Trusted Publishing in CI; no explicit auth token required.)
  // execFileSync avoids shell interpolation of the scoped package name.
  // We check <name>@<localVersion> rather than the latest dist-tag so that
  // re-running an old workflow run doesn't attempt to publish over an already-
  // published (but no longer latest) version.
  let alreadyPublished = false;
  try {
    execFileSync('npm', ['view', `${name}@${localVersion}`, 'version'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    alreadyPublished = true;
  } catch (error) {
    const stderr = error.stderr?.toString() ?? '';
    if (stderr.includes('E404') || stderr.includes('code E404')) {
      // This specific version is not published yet — safe to proceed.
    } else {
      // Network/auth/registry error — fail fast so the real problem surfaces.
      console.error(`✖ Registry check failed for ${name}@${localVersion}: ${error.message}`);
      process.exit(1);
    }
  }

  if (alreadyPublished) {
    console.log(`Skipping ${name}@${localVersion} — already published to registry.`);
    skippedCount++;
    continue;
  }

  console.log(`Publishing ${name}@${localVersion}…`);

  execFileSync('npm', ['publish', '--access', 'public', '--provenance'], {
    cwd: distPath,
    stdio: 'inherit',
  });

  console.log(`✓ Published ${name}@${localVersion}`);
  publishedCount++;
}

console.log(`\nDone — ${publishedCount} published, ${skippedCount} skipped.`);
