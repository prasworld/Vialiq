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

/** Map of package name → local package.json (source of truth for version). */
const localPackages = {
  '@vialiq/flux-ui': 'libs/flux-ui/package.json',
  '@vialiq/icons': 'libs/icons/package.json',
  '@vialiq/web-components': 'libs/web-components/package.json',
  '@vialiq/automapper': 'libs/automapper/package.json',
  '@vialiq/state-fp': 'libs/state-fp/package.json',
};

const distPkg = JSON.parse(readFileSync(distPkgPath, 'utf8'));
let changed = false;

for (const [dep, localPath] of Object.entries(localPackages)) {
  if (!distPkg.peerDependencies?.[dep]) continue;
  const { version } = JSON.parse(readFileSync(localPath, 'utf8'));
  const range = `^${version}`;
  if (distPkg.peerDependencies[dep] !== range) {
    console.log(`  ${dep}: ${distPkg.peerDependencies[dep]} → ${range}`);
    distPkg.peerDependencies[dep] = range;
    changed = true;
  }
}

if (changed) {
  writeFileSync(distPkgPath, JSON.stringify(distPkg, null, 2) + '\n');
  console.log(`Peer deps synced in ${distPkgPath}`);
} else {
  console.log(`Peer deps already up to date in ${distPkgPath}`);
}
