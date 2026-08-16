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
export interface SvgIconDef {
    name: string;
    data: string;
}
/**
 * Register one or more icons. Call this before using <vi-icon>.
 *
 * @param icons - Icon definitions from @vialiq/icons (trusted source only).
 */
export declare function registerIcons(icons: SvgIconDef | SvgIconDef[]): void;
/**
 * Look up a registered icon by name.
 */
export declare function getIcon(name: string): SvgIconDef | undefined;
//# sourceMappingURL=registry.d.ts.map