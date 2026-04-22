#!/usr/bin/env node
/**
 * Publishes each library to npm if its local version (from publish-package.json)
 * differs from what is currently on the registry.
 *
 * Run from the workspace root. Requires NODE_AUTH_TOKEN to be set in the environment.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLISHABLE_LIBS = ['flux-ui', 'state-fp', 'automapper', 'icons'];

let publishedCount = 0;
let skippedCount = 0;

for (const lib of PUBLISHABLE_LIBS) {
  const pkgPath = join('libs', lib, 'publish-package.json');
  const distPath = join('dist', 'libs', lib);

  const localPkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const { name, version: localVersion } = localPkg;

  // Resolve version currently published on npm
  let registryVersion = null;
  try {
    registryVersion = execSync(`npm view ${name} version`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    // Package has never been published
    console.log(`${name} not found in registry — publishing for the first time.`);
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
