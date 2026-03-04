import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Detect the target NX project (library or app) from process arguments or
 * environment variables so coverage reports can be emitted under
 * `coverage/{project}` instead of the repository root `coverage`.
 *
 * Detection strategy (in order):
 * - Scan `process.argv` for path-like arguments that include `libs/{name}` or
 *   `apps/{name}` (useful when running `vitest` directly with a path).
 * - Fall back to `NX_TASK_TARGET_PROJECT` (set by Nx executors when running
 *   tasks) or `npm_package_name` when available.
 *
 * Returns the project short name (e.g. `automapper`) or `null` when none can
 * be determined.
 */
function detectProjectFromArgv(): string | null {
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (!arg || arg.startsWith('-')) continue;
    const normalized = arg.replace(/\\/g, '/');
    const m = normalized.match(/(?:libs|apps)\/([^/\\]+)/);
    if (m) return m[1];
    // also support patterns like "libs/automapper"
    const parts = normalized.split('/');
    const libsIdx = parts.indexOf('libs');
    if (libsIdx !== -1 && parts.length > libsIdx + 1) return parts[libsIdx + 1];
    const appsIdx = parts.indexOf('apps');
    if (appsIdx !== -1 && parts.length > appsIdx + 1) return parts[appsIdx + 1];
  }

  if (process.env.NX_TASK_TARGET_PROJECT) return process.env.NX_TASK_TARGET_PROJECT;
  if (process.env.npm_package_name) return process.env.npm_package_name;
  return null;
}

const project = detectProjectFromArgv();
const reportsDirectory = project ? `coverage/${project}` : 'coverage';

/**
 * Root Vitest configuration shared for local workflows. The important
 * configuration here is `coverage.reportsDirectory`, which we compute from
 * the current project so running `vitest` for a library will emit coverage to
 * `coverage/{library}` instead of the repo root. This makes per-library CI
 * and browsing simpler in monorepos.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      // Use V8 coverage for speed and consistency with Nx presets.
      provider: 'v8',
      // Emit reports under coverage/<project> when we can determine the
      // project name, otherwise default to `coverage`.
      reportsDirectory,
    },
  },
});
