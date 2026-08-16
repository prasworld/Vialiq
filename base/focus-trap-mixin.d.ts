import { LitElement } from 'lit';
type Constructor<T = object> = new (...args: any[]) => T;
/**
 * Type-only declaration of the shape FocusTrapMixin adds to a class.
 * `declare class` emits no runtime code — it is a TS-only contract.
 */
export declare class FocusTrapInterface {
    /**
     * Activates the focus trap.
     * Queries all focusable elements in the shadow root (and slotted content),
     * focuses the first one (or a provided initial target), and begins
     * intercepting Tab / Shift+Tab to cycle focus within the component.
     *
     * @param initialFocus - Optional element to focus first. Defaults to the
     *   first focusable element found in the shadow root.
     */
    protected _activateFocusTrap(initialFocus?: HTMLElement | null, autofocus?: boolean): void;
    /**
     * Deactivates the focus trap.
     * Removes the Tab intercept and restores focus to the specified returnFocus
     * element, or falls back to the element that was focused before activation.
     */
    protected _deactivateFocusTrap(returnFocus?: HTMLElement | null): void;
}
/**
 * FocusTrapMixin
 *
 * Traps keyboard focus within a component's shadow root.
 * Intended for overlay components: vi-modal, vi-dialog, vi-drawer.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HOW IT WORKS
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   activate  → snapshot pre-trap focus → focus initial element → listen Tab
 *   Tab       → if on last focusable → wrap to first
 *   Shift+Tab → if on first focusable → wrap to last
 *   deactivate→ remove listener → restore pre-trap focus
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CRITICAL: shadowRoot.activeElement vs document.activeElement
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   Inside a shadow root, `document.activeElement` returns the HOST element
 *   (e.g. the `<vi-modal>` tag), NOT the inner focused element.
 *   To correctly identify which inner element is focused, ALWAYS use:
 *
 *     this.shadowRoot!.activeElement
 *
 *   This is the deepest focused element within the shadow boundary.
 *   For slotted content (light DOM children), `shadowRoot.activeElement`
 *   returns the `<slot>` element, not the focused child — in that case,
 *   use `document.activeElement` to get the actual slotted focused element.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * FOCUSABLE ELEMENT COLLECTION
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   Two sources are queried and merged:
 *
 *   1. Shadow DOM: shadowRoot.querySelectorAll(FOCUSABLE_SELECTOR)
 *      Covers native elements (<button>, <input>, etc.) and vi-* host elements
 *      that use FocusableMixin (vi-button, vi-input, etc.).
 *
 *   2. Slotted content: each <slot>.assignedElements({ flatten: true })
 *      filtered by FOCUSABLE_SELECTOR.
 *      Covers focusable light-DOM children slotted into the component.
 *      Example: a <vi-button> slotted into <vi-modal>'s footer slot.
 *
 *   Both lists are combined and deduplicated into a single ordered array.
 *   DOM order is preserved (querySelector returns elements in tree order).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   class ViModal extends FocusTrapMixin(ViElement) {
 *     @property({ type: Boolean, reflect: true }) accessor open = false;
 *
 *     override updated(changed: PropertyValues): void {
 *       super.updated(changed);
 *       if (changed.has('open')) {
 *         if (this.open) {
 *           // Optional: pass a specific element to focus first.
 *           // If omitted, the first focusable in the shadow root is used.
 *           this._activateFocusTrap();
 *         } else {
 *           this._deactivateFocusTrap();
 *         }
 *       }
 *     }
 *   }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ACCESSIBILITY CONTRACT
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   - The trapping component MUST have role="dialog" (or "alertdialog") and
 *     aria-modal="true" so screen readers also confine their virtual cursor.
 *   - Escape key handling is NOT part of this mixin — the component owns that
 *     (it is component-specific: vi-modal may close on Escape, vi-drawer may not).
 *   - The trap does NOT prevent focus from moving to the browser chrome (URL bar,
 *     tab bar) — that is intentional and required by WCAG 2.1 SC 2.1.2.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * COMPOSITION ORDER
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   FocusTrapMixin does NOT require FocusableMixin. Most overlay components
 *   (vi-modal, vi-drawer) are NOT themselves focusable tab stops — they are
 *   focus containers. Use independently:
 *
 *     class ViModal extends FocusTrapMixin(ViElement) { ... }
 *
 *   If you need both (unusual — a container that is also a tab stop):
 *
 *     class ViPanel extends FocusTrapMixin(FocusableMixin(ViElement)) { ... }
 */
export declare function FocusTrapMixin<T extends Constructor<LitElement>>(Base: T): T & Constructor<FocusTrapInterface>;
export {};
//# sourceMappingURL=focus-trap-mixin.d.ts.map