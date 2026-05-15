import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const dryRun = process.argv.includes('--dry-run');
const nxJsonPath = join(process.cwd(), 'nx.json');
if (!existsSync(nxJsonPath)) {
  throw new Error(
    `Could not find nx.json in the current working directory (${process.cwd()}). ` +
      'Run this script from the repository root.'
  );
}
const nxJson = JSON.parse(readFileSync(nxJsonPath, 'utf8'));
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

let cachedNpmRegistry;

function getNpmRegistry() {
  if (cachedNpmRegistry) {
    return cachedNpmRegistry;
  }

  const configuredRegistry =
    process.env.npm_config_registry ||
    process.env.NPM_CONFIG_REGISTRY ||
    runCommand('npm', ['config', 'get', 'registry']).trim();

  cachedNpmRegistry = configuredRegistry.endsWith('/')
    ? configuredRegistry
    : `${configuredRegistry}/`;

  return cachedNpmRegistry;
}

function parsePackageSpec(spec) {
  const versionSeparatorIndex = spec.lastIndexOf('@');
  if (versionSeparatorIndex <= 0) {
    return { packageName: spec, version: null };
  }

  return {
    packageName: spec.slice(0, versionSeparatorIndex),
    version: spec.slice(versionSeparatorIndex + 1),
  };
}

function getPackageTarballUrl(packageName, version) {
  const registry = getNpmRegistry();
  const encodedPackageName = encodeURIComponent(packageName);
  const tarballBaseName = packageName.includes('/')
    ? packageName.slice(packageName.lastIndexOf('/') + 1)
    : packageName;
  return `${registry}${encodedPackageName}/-/${tarballBaseName}-${version}.tgz`;
}

function getPackageMetadataUrl(packageName) {
  return `${getNpmRegistry()}${encodeURIComponent(packageName)}`;
}

async function npmViewVersion(spec, { maxAttempts = 5, initialDelayMs = 2000 } = {}) {
  const { packageName, version } = parsePackageSpec(spec);
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      if (version) {
        const response = await fetch(getPackageTarballUrl(packageName, version), {
          method: 'HEAD',
        });

        if (response.status === 404) {
          return null;
        }

        if (!response.ok) {
          throw new Error(`Unexpected npm registry response: ${response.status} ${response.statusText}`);
        }

        return version;
      }

      const response = await fetch(getPackageMetadataUrl(packageName), {
        method: 'GET',
        headers: { accept: 'application/json' },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Unexpected npm registry response: ${response.status} ${response.statusText}`);
      }

      const metadata = await response.json();
      return metadata['dist-tags']?.latest ?? metadata.version ?? null;
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`npm registry check ${spec} failed (attempt ${attempt}/${maxAttempts}): ${message}`);

      if (attempt < maxAttempts) {
        const delayMs = initialDelayMs * 2 ** (attempt - 1);
        console.error(`Retrying npm registry check ${spec} in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(
    `npm registry check ${spec} failed after ${maxAttempts} attempts: ${String(
      lastError instanceof Error ? lastError.message : lastError
    )}`
  );
}

function npmPublish(dir) {
  const args = ['publish', dir, '--access', 'public', '--provenance'];
  if (dryRun) {
    args.push('--dry-run');
  }

  try {
    // Use ['inherit', 'inherit', 'pipe'] so stdout/stdin are inherited (CI sees
    // real-time output) but stderr is captured into err.stderr on failure, which
    // lets isAlreadyPublishedError() reliably match EPUBLISHCONFLICT messages.
    execFileSync('npm', args, { stdio: ['inherit', 'inherit', 'pipe'] });
  } catch (err) {
    const stderr = String(err.stderr ?? '').trim();
    // Echo the captured stderr so CI logs still show the full npm error output.
    if (stderr) {
      process.stderr.write(stderr + '\n');
    }
    if (isAlreadyPublishedError(stderr) || isAlreadyPublishedError(err.message ?? '')) {
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
