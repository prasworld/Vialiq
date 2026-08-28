import { TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
/**
 * `vi-tab-panel`
 *
 * Content pane associated with a `vi-tab`. Visibility is controlled
 * by the parent `vi-tabs` container via the `active` property.
 *
 * @element vi-tab-panel
 *
 * @attr {string}  for  - The `tab-id` of the corresponding `vi-tab`
 * @attr {boolean} lazy - Only render slot content on first activation
 *
 * @slot - Panel content
 * @csspart panel - The `role="tabpanel"` container
 */
export declare class ViTabPanel extends ViElement {
    static shadowRootOptions: {
        delegatesFocus: boolean;
        clonable?: boolean;
        customElementRegistry?: CustomElementRegistry;
        mode: ShadowRootMode;
        serializable?: boolean;
        slotAssignment?: SlotAssignmentMode;
    };
    static styles: import('lit').CSSResult;
    /** The `tab-id` of the corresponding `vi-tab`. */
    accessor for: string;
    /**
     * When true, slot content is only stamped on first activation.
     * Subsequent tab switches keep the content alive but hidden.
     */
    accessor lazy: boolean;
    /**
     * Whether this panel is currently visible.
     * Managed by vi-tabs — do not set manually.
     */
    accessor active: boolean;
    /**
     * Internal flag: once the panel has been activated, lazy content is stamped.
     */
    private _hasBeenActivated;
    updated(): void;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-tab-panel': ViTabPanel;
    }
}
//# sourceMappingURL=vi-tab-panel.d.ts.map