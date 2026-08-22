import { ViElement } from '../base/vi-element.js';
export declare class ViDatePickerInput extends ViElement {
    accessor kind: 'from' | 'to' | 'single';
    accessor label: string;
    accessor placeholder: string;
    accessor disabled: boolean;
    accessor required: boolean;
    accessor invalid: boolean;
    accessor validityMessage: string;
    accessor expanded: boolean;
    accessor value: string;
    private accessor _triggerBtn;
    static shadowRootOptions: {
        delegatesFocus: boolean;
        clonable?: boolean;
        customElementRegistry?: CustomElementRegistry;
        mode: ShadowRootMode;
        serializable?: boolean;
        slotAssignment?: SlotAssignmentMode;
    };
    /**
     * Returns the interactable element for Flatpickr to bind to.
     */
    get inputElement(): HTMLElement;
    focus(options?: FocusOptions): void;
    render(): import('lit-html').TemplateResult<1>;
    static styles: import('lit').CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-date-picker-input': ViDatePickerInput;
    }
}
//# sourceMappingURL=vi-date-picker-input.d.ts.map