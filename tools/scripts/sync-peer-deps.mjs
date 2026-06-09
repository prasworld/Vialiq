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
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

// Resolve workspace root relative to this script's location
// (tools/scripts/sync-peer-deps.mjs → ../../ = workspace root).
// Note: distPkgPath is used as-provided by the caller. If passed as a
// relative path it must be relative to the caller's cwd, not this script.
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../');

const [, , distPkgPath] = process.argv;
if (!distPkgPath) {
  console.error('Usage: node tools/scripts/sync-peer-deps.mjs <dist-package-json-path>');
  process.exit(1);
}

let distPkg;
try {
  distPkg = JSON.parse(readFileSync(distPkgPath, 'utf8'));
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`  Error: Could not read or parse dist package.json at '${distPkgPath}': ${message}`);
  process.exit(1);
}
let changed = false;

if (distPkg.peerDependencies) {
  for (const dep of Object.keys(distPkg.peerDependencies)) {
    if (!dep.startsWith('@vialiq/')) continue;
    
    const libName = dep.replace('@vialiq/', '');
    const localPath = join(workspaceRoot, 'libs', libName, 'package.json');
    
    try {
      const localPkg = JSON.parse(readFileSync(localPath, 'utf8'));
      const { version: rawVersion } = localPkg;
      if (typeof rawVersion !== 'string') {
        throw new Error(`Invalid or missing version in ${localPath}`);
      }
      const version = rawVersion.trim();
      if (version === '') {
        throw new Error(`Invalid or missing version in ${localPath}`);
      }

      // Parse version robustly, ignoring pre-release/build metadata (e.g. 0.0.2-beta.1)
      const cleanVersion = version.split(/[+-]/)[0];
      const parts = cleanVersion.split('.').map(n => parseInt(n, 10));
      const [major, minor] = parts;

      if (parts.length < 2 || isNaN(major) || isNaN(minor)) {
        throw new Error(`Could not parse major/minor version from "${version}" in ${localPath}`);
      }

      // For 0.0.x packages, ^ locks to an exact patch (^0.0.2 = >=0.0.2 <0.0.3),
      // which breaks as soon as the peer publishes its next patch.
      // To allow all patches in the same family, we explicitly use >=version <0.1.0
      // For 0.y.z (y>0) and x.y.z (x>0), ^ behaves correctly already.
      const range = (major === 0 && minor === 0) ? `>=${version} <0.1.0` : `^${version}`;

      if (distPkg.peerDependencies[dep] !== range) {
        console.log(`  ${dep}: ${distPkg.peerDependencies[dep]} → ${range}`);
        distPkg.peerDependencies[dep] = range;
        changed = true;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  Error: Failed to resolve peer dependency ${dep}.`);
      console.error(`  Could not read or parse ${localPath}: ${message}`);
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
