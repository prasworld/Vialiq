import { ViInput } from '../input/vi-input.js';
/**
 * vi-masked-input
 * Form-associated single-line text input with masking support (via IMask).
 * Extends \`vi-input\` to reuse its entire UI, layout, and validation behavior.
 *
 * @element vi-masked-input
 *
 * @attr {string} mask     - The mask pattern (e.g. '(000) 000-0000')
 * @attr {string} rawValue - The unmasked underlying value (reflected)
 *
 * @fires {CustomEvent<{value: string, rawValue: string}>} vi-masked-input-change - Fired when the value is committed (e.g. blur)
 * @fires {CustomEvent<{value: string, rawValue: string}>} vi-masked-input-input  - Fired on every keystroke
 */
export declare class ViMaskedInput extends ViInput {
    /**
     * The mask pattern.
     * If not provided, it behaves exactly like a standard vi-input.
     * @attr mask
     */
    accessor mask: string;
    /**
     * Advanced IMask configuration object.
     * Useful for dynamic masks (e.g. Credit Cards) or RegExp masks.
     * Takes precedence over the string \`mask\` property.
     * @prop {any} maskOptions
     */
    accessor maskOptions: any;
    /**
     * The unmasked, raw underlying value.
     * @attr rawValue
     */
    accessor rawValue: string;
    private _maskInstance;
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
    updated(changedProperties: Map<string, any>): void;
    private _initMask;
    protected _onInput(e: Event): void;
    protected _onChange(e: Event): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-masked-input': ViMaskedInput;
    }
}
//# sourceMappingURL=vi-masked-input.d.ts.map