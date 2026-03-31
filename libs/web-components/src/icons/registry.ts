/**
 * Icon Registry
 *
 * A Map-based store for SvgIconDef objects sourced from @vialiq/icons.
 * Icons must be explicitly registered before <vi-icon> can render them.
 * Only the icons you register end up in your bundle — full tree-shaking.
 *
 * Usage:
 *   import { registerIcons } from '@vialiq/web-components';
 *   import { checkIcon } from '@vialiq/icons/check';
 *
 *   registerIcons([checkIcon]);
 *   // <vi-icon name="check"></vi-icon>
 */

import type { SvgIconDef } from '@vialiq/icons';

export type { SvgIconDef };

const registry = new Map<string, SvgIconDef>();

/**
 * Register one or more icons. Call this before using <vi-icon>.
 */
export function registerIcons(icons: SvgIconDef | SvgIconDef[]): void {
  const list = Array.isArray(icons) ? icons : [icons];
  for (const icon of list) {
    registry.set(icon.name, icon);
  }
}

/**
 * Look up a registered icon by name.
 */
export function getIcon(name: string): SvgIconDef | undefined {
  return registry.get(name);
}
