/**
 * Barrel — re-exports the SvgIconDef type and all registered icon definitions.
 *
 * Import from individual icon modules for tree-shaking:
 *   import { checkIcon } from '@vialiq/icons/check';
 *
 * Or import everything (use sparingly — includes all icons):
 *   import { checkIcon, xIcon } from '@vialiq/icons';
 */
export type { SvgIconDef } from './types.js';
export { checkIcon } from './check.js';
export { xIcon } from './x.js';
