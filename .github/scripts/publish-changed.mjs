#!/usr/bin/env node
/**
 * Publishes each library to npm if its local version (from publish-package.json)
 * differs from what is currently on the registry.
 *
 * Run from the workspace root. Uses the current npm authentication configuration
 * (for example, the CI environment's OIDC/Trusted Publishing setup) rather than
 * requiring a NODE_AUTH_TOKEN to be set explicitly.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Single source of truth: read publishable libs from nx.json release.projects
const nxJson = JSON.parse(readFileSync('nx.json', 'utf8'));
const PUBLISHABLE_LIBS = nxJson.release.projects;

let publishedCount = 0;
let skippedCount = 0;

for (const lib of PUBLISHABLE_LIBS) {
  const pkgPath = join('libs', lib, 'publish-package.json');
  const distPath = join('dist', 'libs', lib);

  const localPkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const { name, version: localVersion } = localPkg;

  // Check what version is currently published on npm
  // (Uses npm Trusted Publishing in CI; no explicit auth token required.)
  let registryVersion = null;
  try {
    registryVersion = execSync(`npm view ${name} version`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    // npm view fails if the package doesn't exist (404) or if there's a network/auth error.
    // Log the error so transient issues are visible; only silently assume "unpublished"
    // if we can verify it's a 404. For now, we conservatively warn the user.
    console.warn(
      `⚠ Could not check ${name} on registry (treating as unpublished). ` +
      `Error: ${error.message}. If this is a network issue, the publish step may also fail.`,
    );
  }

  if (localVersion === registryVersion) {
    console.log(`Skipping ${name}@${localVersion} — registry already at this version.`);
    skippedCount++;
    continue;
  }

  console.log(
    `Publishing ${name}@${localVersion} (registry: ${registryVersion ?? 'unpublished'})…`,
  );

  execSync('npm publish --access public --provenance', {
    cwd: distPath,
    stdio: 'inherit',
  });

  console.log(`✓ Published ${name}@${localVersion}`);
  publishedCount++;
}

console.log(`\nDone — ${publishedCount} published, ${skippedCount} skipped.`);
