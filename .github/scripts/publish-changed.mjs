#!/usr/bin/env node
/**
 * Publishes each library to npm if its local version (from publish-package.json)
 * differs from what is currently on the registry.
 *
 * Run from the workspace root. Uses the current npm authentication configuration
 * (for example, the CI environment's OIDC/Trusted Publishing setup) rather than
 * requiring a NODE_AUTH_TOKEN to be set explicitly.
 */
import { execFileSync, execSync } from 'node:child_process';
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

  // Check what version is currently published on npm.
  // (Uses npm Trusted Publishing in CI; no explicit auth token required.)
  // execFileSync avoids shell interpolation of the scoped package name.
  let registryVersion = null;
  try {
    registryVersion = execFileSync('npm', ['view', name, 'version'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const stderr = error.stderr?.toString() ?? '';
    if (stderr.includes('E404') || stderr.includes('code E404')) {
      // Package has never been published — safe to proceed.
      console.log(`${name} not found in registry — will publish for the first time.`);
    } else {
      // Network/auth/registry error — fail fast so the real problem surfaces.
      console.error(`✖ Registry check failed for ${name}: ${error.message}`);
      process.exit(1);
    }
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
