import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const dryRun = process.argv.includes('--dry-run');
const nxJson = JSON.parse(readFileSync('nx.json', 'utf8'));
const workspaceLayout = nxJson.workspaceLayout ?? { appsDir: 'apps', libsDir: 'libs' };
const packageRootTemplate =
  process.env.PUBLISH_ROOT ||
  nxJson.targetDefaults?.['nx-release-publish']?.options?.packageRoot ||
  'dist/{projectRoot}';

function getPublishableProjects() {
  const envList = process.env.PUBLISHABLE_LIBS;
  if (typeof envList === 'string' && envList.trim().length > 0) {
    return envList.split(',').map((item) => item.trim()).filter(Boolean);
  }
  const releaseProjects = nxJson.release?.projects;
  if (Array.isArray(releaseProjects) && releaseProjects.length > 0) {
    return releaseProjects;
  }
  throw new Error(
    'Missing publishable project list: set PUBLISHABLE_LIBS or configure nx.json.release.projects'
  );
}

function resolveProjectRoot(projectName) {
  const candidates = [
    join(workspaceLayout.libsDir, projectName),
    join(workspaceLayout.appsDir, projectName),
  ];

  for (const candidate of candidates) {
    if (existsSync(join(candidate, 'project.json'))) {
      return candidate;
    }
  }

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Unable to resolve project root for ${projectName}. ` +
      `Expected project.json in ${candidates.join(' or ')}.`
  );
}

function renderPackageDir(projectName) {
  const projectRoot = resolveProjectRoot(projectName);

  if (packageRootTemplate.includes('{projectRoot}')) {
    const packageRoot = packageRootTemplate.replace('{projectRoot}', projectRoot);
    return join(process.cwd(), packageRoot);
  }

  const packageRoot = join(process.cwd(), packageRootTemplate);
  const candidate = join(packageRoot, projectName);
  if (existsSync(candidate)) {
    return candidate;
  }
  if (existsSync(packageRoot)) {
    return packageRoot;
  }

  throw new Error(
    `Unable to resolve published package directory for ${projectName}. ` +
      `Tried ${candidate} and ${packageRoot}.`
  );
}

function isNotFoundError(stderr) {
  const normalized = stderr.toLowerCase();
  return (
    normalized.includes('e404') ||
    normalized.includes('not found') ||
    normalized.includes('is not in this registry')
  );
}

function isAlreadyPublishedError(stderr) {
  const normalized = stderr.toLowerCase();
  return (
    normalized.includes('cannot publish over') ||
    normalized.includes('previously published version') ||
    normalized.includes('epublishconflict') ||
    normalized.includes('already published')
  );
}

function runCommand(command, args) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function npmViewVersion(spec, { maxAttempts = 5, initialDelayMs = 2000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return runCommand('npm', ['view', spec, 'version']).trim();
    } catch (err) {
      const stderr = String(err.stderr ?? '').trim();
      if (isNotFoundError(stderr)) {
        return null;
      }

      lastError = err;
      const message = stderr || String(err.stdout ?? '').trim() || err.message;
      console.error(`npm view ${spec} failed (attempt ${attempt}/${maxAttempts}): ${message}`);

      if (attempt < maxAttempts) {
        const delayMs = initialDelayMs * 2 ** (attempt - 1);
        console.error(`Retrying npm view ${spec} in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(
    `npm view ${spec} failed after ${maxAttempts} attempts: ${String(
      lastError.stderr ?? lastError.stdout ?? lastError.message
    )}`
  );
}

function npmPublish(dir) {
  const args = ['publish', dir, '--access', 'public', '--provenance'];
  if (dryRun) {
    args.push('--dry-run');
  }

  try {
    execFileSync('npm', args, { stdio: 'inherit' });
  } catch (err) {
    const stderr = String(err.stderr ?? '').trim();
    if (isAlreadyPublishedError(stderr)) {
      console.log(
        `Skipping publish for ${dir}: package appears to already exist in npm.`
      );
      return;
    }
    throw err;
  }
}

async function main() {
  const publishableProjects = getPublishableProjects();
  const packageDirs = publishableProjects.map((projectName) => {
    const packageDir = renderPackageDir(projectName);
    if (!existsSync(packageDir)) {
      throw new Error(
        `Expected dist package directory missing: ${packageDir}. ` +
          'Ensure the project was built and postbuild-publish ran successfully.'
      );
    }
    return packageDir;
  });

  if (packageDirs.length === 0) {
    console.log('No publishable packages were resolved.');
    return;
  }

  for (const pkgDir of packageDirs) {
    const pkgJsonPath = join(pkgDir, 'package.json');
    if (!existsSync(pkgJsonPath)) {
      throw new Error(`Missing package.json in ${pkgDir}.`);
    }

    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
    const spec = `${pkg.name}@${pkg.version}`;
    const existingVersion = await npmViewVersion(spec);

    if (existingVersion === pkg.version) {
      console.log(`Skipping ${spec} because it already exists on npm`);
      continue;
    }

    console.log(`Publishing ${spec}`);
    npmPublish(pkgDir);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
