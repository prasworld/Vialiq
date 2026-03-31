/**
 * generate-icons.mjs
 *
 * Converts raw SVG files in tools/icons-src/*.svg into TypeScript icon
 * definition modules under src/<name>.ts.
 *
 * Each generated module exports a named `SvgIconDef` constant:
 *   export const checkIcon: SvgIconDef = { name: 'check', data: '<svg>...' };
 *
 * Run via:  node libs/icons/tools/generate-icons.mjs
 * Or via Nx: nx run icons:generate-icons
 *
 * To add new icons:
 *   1. Drop <name>.svg into libs/icons/tools/icons-src/
 *   2. Run this script
 *   3. Add the export to src/index.ts
 *   4. Commit both files
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, 'icons-src');
const outDir = join(__dirname, '..', 'src');

mkdirSync(outDir, { recursive: true });

const svgFiles = readdirSync(srcDir).filter((f) => f.endsWith('.svg'));

if (svgFiles.length === 0) {
  console.log('No SVG files found in tools/icons-src/');
  process.exit(0);
}

/**
 * Convert kebab-case filename to camelCase const name.
 * e.g. "arrow-right" → "arrowRightIcon"
 */
function toIconConstName(kebab) {
  return (
    kebab
      .split('-')
      .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
      .join('') + 'Icon'
  );
}

let generated = 0;

for (const file of svgFiles) {
  const iconName = basename(file, '.svg');
  const constName = toIconConstName(iconName);
  const outPath = join(outDir, `${iconName}.ts`);

  let svg = readFileSync(join(srcDir, file), 'utf-8').trim();

  // Strip XML declaration
  svg = svg.replace(/<\?xml[^?]*\?>\s*/g, '');

  // Remove width/height from root <svg> — sizing is controlled by CSS
  svg = svg.replace(/(<svg[^>]*)\s(?:width|height)="[^"]*"/g, '$1');

  // Collapse whitespace between tags for a compact single-line data string
  svg = svg.replace(/>\s+</g, '><').trim();

  // Escape backticks and template expressions
  const safeSvg = svg.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

  const content = [
    `// AUTO-GENERATED — do not edit by hand.`,
    `// Source: tools/icons-src/${file}`,
    `// Regenerate with: node libs/icons/tools/generate-icons.mjs`,
    `import type { SvgIconDef } from './types.js';`,
    ``,
    `export const ${constName}: SvgIconDef = {`,
    `  name: '${iconName}',`,
    `  data: \`${safeSvg}\`,`,
    `};`,
    ``,
  ].join('\n');

  writeFileSync(outPath, content, 'utf-8');
  console.log(`  ✓  ${file}  →  src/${iconName}.ts  (export: ${constName})`);
  generated++;
}

console.log(`\nDone — generated ${generated} icon module(s).`);
console.log(`Remember to re-export new icons in src/index.ts`);
