import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const distRoot = join(process.cwd(), 'dist', 'libs');
const dryRun = process.argv.includes('--dry-run');

function isNpmViewNotFoundError(error) {
  const stderr = typeof error?.stderr === 'string' ? error.stderr : error?.stderr?.toString?.('utf8') ?? '';
  const stdout = typeof error?.stdout === 'string' ? error.stdout : error?.stdout?.toString?.('utf8') ?? '';
  const output = `${stdout}\n${stderr}`;

  return error?.status === 1 && /\bE404\b|404\s+Not\s+Found|not found/i.test(output);
}

function npmView(spec) {
  try {
    return execFileSync('npm', ['view', spec, 'version'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    if (isNpmViewNotFoundError(error)) {
      return null;
    }

    throw new Error(`Failed to query npm for ${spec}`, { cause: error });
  }
}

function npmPublish(dir) {
  const args = ['publish', dir, '--access', 'public', '--provenance'];
  if (dryRun) {
    args.push('--dry-run');
  }
  execFileSync('npm', args, { stdio: 'inherit' });
}

if (!existsSync(distRoot)) {
  console.error(`Error: dist root not found: ${distRoot}`);
  process.exit(1);
}

const entries = readdirSync(distRoot, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => join(distRoot, dirent.name));

if (entries.length === 0) {
  console.log('No dist packages found under', distRoot);
  process.exit(0);
}

for (const pkgDir of entries) {
  const pkgJsonPath = join(pkgDir, 'package.json');
  if (!existsSync(pkgJsonPath)) {
    console.log(`Skipping ${pkgDir}: no package.json found`);
    continue;
  }

  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
  const spec = `${pkg.name}@${pkg.version}`;
  const existing = npmView(spec);

  if (existing === pkg.version) {
    console.log(`Skipping ${spec} because it already exists on npm`);
    continue;
  }

  console.log(`Publishing ${spec}`);
  npmPublish(pkgDir);
}
