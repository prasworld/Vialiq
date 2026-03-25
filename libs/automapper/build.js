#!/usr/bin/env node
/*
  build.js - Automated build + prepare + optional pack/publish for libs/automapper

  Usage:
    node libs/automapper/build.js            # build and copy package.json into dist
    node libs/automapper/build.js --pack     # also run `npm pack` in the dist folder
    node libs/automapper/build.js --publish  # also run `npm publish --access public`

  Implementation notes:
  - Runs `npx nx build automapper` from the repository root (detected by finding package.json upwards).
  - Copies `libs/automapper/publish-package.json` into `dist/libs/automapper/package.json`;
    hard-fails if publish-package.json is absent so a broken package can never be produced silently.
  - If `--pack` is passed, runs `npm pack` inside `dist/libs/automapper`.
  - If `--publish` is passed, runs `npm publish --access public` inside `dist/libs/automapper`.
*/

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findRepoRoot(startDir) {
  let dir = startDir;
  while (true) {
    const maybe = path.join(dir, 'package.json');
    if (fs.existsSync(maybe)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function run(cmd, args, opts = {}) {
  console.log(`> ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, Object.assign({ stdio: 'inherit', shell: false }, opts));
  if (res.error) {
    console.error('Error running command:', res.error);
    process.exit(1);
  }
  if (res.status !== 0) {
    process.exit(res.status);
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const doPack = argv.includes('--pack');
  const doPublish = argv.includes('--publish');

  const startCwd = process.cwd();
  const scriptDir = path.dirname(__filename);
  const repoRoot = findRepoRoot(startCwd) || findRepoRoot(scriptDir);
  if (!repoRoot) {
    console.error('Could not locate repository root (no package.json found in parent dirs).');
    process.exit(1);
  }

  // 1) Run nx build automapper
  run('npx', ['nx', 'build', 'automapper'], { cwd: repoRoot });

  // 2) Copy package.json into dist
  const distDir = path.join(repoRoot, 'dist', 'libs', 'automapper');
  if (!fs.existsSync(distDir)) {
    console.error(`Expected dist folder not found: ${distDir}`);
    process.exit(1);
  }

  const publishPkgPath = path.join(repoRoot, 'libs', 'automapper', 'publish-package.json');
  const targetPkgPath = path.join(distDir, 'package.json');

  if (!fs.existsSync(publishPkgPath)) {
    console.error(`publish-package.json not found at ${publishPkgPath}. Cannot produce a valid dist package.`);
    process.exit(1);
  }

  fs.copyFileSync(publishPkgPath, targetPkgPath);
  console.log(`Copied ${publishPkgPath} -> ${targetPkgPath}`);

  // 3) Optionally pack
  if (doPack) {
    console.log('Running npm pack in dist directory...');
    run('npm', ['pack'], { cwd: distDir });
  }

  // 4) Optionally publish
  if (doPublish) {
    console.log('Running npm publish --access public in dist directory...');
    run('npm', ['publish', '--access', 'public'], { cwd: distDir });
  }

  console.log('Done.');
}

main();
