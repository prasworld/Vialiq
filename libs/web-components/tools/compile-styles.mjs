/**
 * compile-styles.mjs
 *
 * Compiles every *.scss file found under libs/web-components/src/ into a
 * sibling *.styles.ts file that exports a Lit CSSResult.
 *
 * Run via:  node libs/web-components/tools/compile-styles.mjs
 * Or via Nx: nx run web-components:compile-styles
 *
 * The generated *.styles.ts files are checked in so the IDE and build work
 * without needing to run this step first. Regenerate whenever SCSS changes.
 */

import { compile } from 'sass';
import { writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = join(__dirname, '..', '..', '..');
const srcRoot = join(__dirname, '..', 'src');

/** Recursively collect all *.scss files under a directory. */
function findScssFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return findScssFiles(fullPath);
    if (entry.isFile() && entry.name.endsWith('.scss')) return [fullPath];
    return [];
  });
}

const scssFiles = findScssFiles(srcRoot);

if (scssFiles.length === 0) {
  console.log('No SCSS files found under src/');
  process.exit(0);
}

let errors = 0;

for (const scssPath of scssFiles) {
  const rel = relative(workspaceRoot, scssPath);
  const outputPath = scssPath.replace(/\.scss$/, '.styles.ts');
  const outputRel = relative(workspaceRoot, outputPath);

  try {
    const result = compile(scssPath, {
      style: 'expanded',
      // Allow sass to resolve @vi/* imports via the npm workspace symlinks
      // in node_modules (set up by `"workspaces": ["libs/*"]` in the root
      // package.json).
      loadPaths: [join(workspaceRoot, 'node_modules')],
    });

    // Strip @charset rule — Lit's css`` tag rejects it.
    // Escape backticks and template-literal expressions to prevent injection.
    const safeCss = result.css
      .replace(/@charset\s+[^;]+;\s*/g, '')
      .replace(/`/g, '\\`')
      .replace(/\$\{/g, '\\${');

    const content = [
      `// AUTO-GENERATED — do not edit by hand.`,
      `// Source: ${rel}`,
      `// Regenerate with: nx run web-components:compile-styles`,
      `import { css } from 'lit';`,
      ``,
      `export const styles = css\``,
      safeCss,
      `\`;`,
      ``,
    ].join('\n');

    writeFileSync(outputPath, content, 'utf-8');
    console.log(`  ✓  ${rel}  →  ${outputRel}`);
  } catch (err) {
    console.error(`  ✗  ${rel}`);
    console.error(err.toString());
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} file(s) failed to compile.`);
  process.exit(1);
}

console.log(`\nDone — compiled ${scssFiles.length} file(s).`);
