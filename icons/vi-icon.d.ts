import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
/**
 * vi-icon
 *
 * Renders a named SVG icon from the registry. Icons must be registered first
 * by importing their definition from @vialiq/icons and calling registerIcons():
 *
 *   import { checkIcon } from '@vialiq/icons/check';
 *   import { registerIcons } from '@vialiq/web-components';
 *   registerIcons([checkIcon]);
 *   // <vi-icon name="check"></vi-icon>
 *
 * @element vi-icon
 * @attr name  - The icon name to render (must be registered)
 * @attr size  - Width/height in px (default: 24)
 * @attr label - Accessible label; omit for decorative icons
 */
export declare class ViIcon extends ViElement {
    static styles: import('lit').CSSResult;
    /**
     * The registered icon name to render.
     * @attr
     */
    accessor name: string;
    /**
     * Size in pixels applied as a CSS custom property.
     * @attr
     */
    accessor size: number;
    /**
     * Accessible label. When set the SVG gets role="img" + aria-label.
     * When omitted the icon is treated as decorative (aria-hidden).
     * @attr
     */
    accessor label: string;
    private accessor _icon;
    willUpdate(changedProperties: PropertyValues): void;
    updated(changedProperties: PropertyValues): void;
    firstUpdated(changedProperties: PropertyValues): void;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-icon': ViIcon;
    }
}
//# sourceMappingURL=vi-icon.d.ts.map