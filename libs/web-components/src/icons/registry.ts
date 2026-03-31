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
 * Defence-in-depth guard for SVG data passed to registerIcons().
 *
 * registerIcons() is a **trusted-only** API. SVG data must originate from
 * @vialiq/icons or another vetted source — never from user-supplied strings.
 * This validation is not a substitute for a full sanitiser; it raises early
 * on the most obvious injection vectors (script elements, inline event handlers).
 */
function assertSafeSvg(name: string, data: string): void {
  const trimmed = data.trim();
  if (!trimmed.startsWith('<svg')) {
    throw new Error(`[vi-icon] Icon "${name}": SVG data must begin with an <svg> element.`);
  }
  if (/<script[\s>]/i.test(trimmed)) {
    throw new Error(`[vi-icon] Icon "${name}": SVG data must not contain <script> elements.`);
  }
  if (/\bon\w+\s*=/i.test(trimmed)) {
    throw new Error(`[vi-icon] Icon "${name}": SVG data must not contain inline event handlers (on*=).`);
  }
}

/**
 * Register one or more icons. Call this before using <vi-icon>.
 *
 * @param icons - Icon definitions from @vialiq/icons (trusted source only).
 */
export function registerIcons(icons: SvgIconDef | SvgIconDef[]): void {
  const list = Array.isArray(icons) ? icons : [icons];
  for (const icon of list) {
    assertSafeSvg(icon.name, icon.data);
    registry.set(icon.name, icon);
  }
}

/**
 * Look up a registered icon by name.
 */
export function getIcon(name: string): SvgIconDef | undefined {
  return registry.get(name);
}
