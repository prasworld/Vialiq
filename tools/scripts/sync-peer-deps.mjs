/**
 * sync-peer-deps.mjs
 *
 * Reads the actual version of each @vialiq/* peer dependency from its local
 * package.json and patches the peer dependency range in the built package.json
 * before publishing.
 *
 * This eliminates the need to manually keep publish-package.json peer dep
 * versions in sync with sibling library versions. The script is run as part
 * of postbuild-publish for any lib that has @vialiq/* peer dependencies.
 *
 * Usage:
 *   node tools/scripts/sync-peer-deps.mjs <dist-package-json-path>
 *
 * Example:
 *   node tools/scripts/sync-peer-deps.mjs dist/libs/web-components/package.json
 */

import { readFileSync, writeFileSync } from 'node:fs';

const [, , distPkgPath] = process.argv;
if (!distPkgPath) {
  console.error('Usage: node tools/scripts/sync-peer-deps.mjs <dist-package-json-path>');
  process.exit(1);
}

const distPkg = JSON.parse(readFileSync(distPkgPath, 'utf8'));
let changed = false;

if (distPkg.peerDependencies) {
  for (const dep of Object.keys(distPkg.peerDependencies)) {
    if (!dep.startsWith('@vialiq/')) continue;
    
    const libName = dep.replace('@vialiq/', '');
    const localPath = `libs/${libName}/package.json`;
    
    try {
      const { version } = JSON.parse(readFileSync(localPath, 'utf8'));
      const range = `^${version}`;
      if (distPkg.peerDependencies[dep] !== range) {
        console.log(`  ${dep}: ${distPkg.peerDependencies[dep]} → ${range}`);
        distPkg.peerDependencies[dep] = range;
        changed = true;
      }
    } catch (err) {
      console.error(`  Error: Failed to resolve peer dependency ${dep}.`);
      console.error(`  Could not read or parse ${localPath}: ${err.message}`);
      process.exit(1);
    }
  }
}

if (changed) {
  writeFileSync(distPkgPath, JSON.stringify(distPkg, null, 2) + '\n');
  console.log(`Peer deps synced in ${distPkgPath}`);
} else {
  console.log(`Peer deps already up to date in ${distPkgPath}`);
}
