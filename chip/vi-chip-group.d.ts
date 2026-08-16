import { PropertyValues, TemplateResult } from 'lit';
import { ControlStatus } from '../base/validity-mixin.js';
declare const ViChipGroup_base: (new (...args: any[]) => import('lit').LitElement) & (new (...args: any[]) => import('../base/validity-mixin.js').ValidityInterface<string[]>);
/**
 * vi-chip-group
 * Manages a set of vi-chip children as a multiselect (or single-select) control.
 *
 * @element vi-chip-group
 * @attr value     - Currently selected chip values
 * @attr multi     - Allow multiple selections (default: true)
 * @attr name      - Form field name
 * @attr required  - At least one chip must be selected
 * @attr disabled  - Disable all chips
 * @attr wrap      - Chips wrap to next line (default: true)
 * @attr gap       - Gap between chips (default: '8px')
 *
 * @slot           - vi-chip elements
 *
 * @csspart group  - The <div> role="listbox" wrapper
 *
 * @fires vi-chip-group-change - Fired when the selection changes
 * @fires invalid       - Fired when checkValidity() fails (cancelable)
 */
export declare class ViChipGroup extends ViChipGroup_base {
    static styles: import('lit').CSSResult;
    /** Currently selected chip values. */
    accessor value: string[];
    /** Allow multiple selections. */
    accessor multi: boolean;
    /** Form field name. */
    accessor name: string;
    /** At least one chip must be selected. */
    accessor required: boolean;
    /** Disable all chips. */
    accessor disabled: boolean;
    /** Chips wrap to next line. */
    accessor wrap: boolean;
    /** Gap between chips. */
    accessor gap: string;
    accessor status: ControlStatus;
    accessor validityMessage: string;
    private accessor _chips;
    private _mutationObserver;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changed: PropertyValues): void;
    formResetCallback(): void;
    formStateRestoreCallback(state: string | File | FormData | null, _mode: 'restore' | 'autocomplete'): void;
    formDisabledCallback(disabled: boolean): void;
    protected _testValidity(): Partial<ValidityStateFlags>;
    /** Selects all available child chips (if multi is true) */
    selectAll(): void;
    /** Deselects all child chips */
    clearAll(): void;
    private _syncInternals;
    private _syncChips;
    private _handleSlotChange;
    private _handleChipSelect;
    private _handleKeyDown;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-chip-group': ViChipGroup;
    }
}
export {};
//# sourceMappingURL=vi-chip-group.d.ts.map