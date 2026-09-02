/**
 * FOCUSABLE_SELECTOR
 *
 * A CSS selector that matches all tabbable elements within a container.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * WHY CUSTOM ELEMENTS MUST BE LISTED EXPLICITLY
 * ─────────────────────────────────────────────────────────────────────────
 *
 * CSS cannot see through a shadow root. A generic `[tabindex]:not([tabindex="-1"])`
 * will NOT match a `<vi-button>` even though vi-button has tabIndex=-1 on its
 * host and tabIndex=0 on its inner <button>. The inner <button> is inside the
 * shadow root and is invisible to an external querySelector.
 *
 * Each `vi-*` element listed here uses FocusableMixin, which means:
 *   - The host has tabIndex=-1 (not a sequential tab stop itself)
 *   - `delegatesFocus: true` routes clicks inward
 *   - Calling `.focus()` on the host delegates to the inner control
 *
 * So treating the host as the focusable unit is correct — the browser's
 * tab sequence reaches the inner control via the host, and programmatic
 * `.focus()` on the host works because of FocusableMixin.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MAINTENANCE RULE
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Update this file whenever a new focusable vi-* component ships.
 * This is the SINGLE source of truth. FocusTrapMixin, any roving-tabindex
 * manager, and a11y tests all import from here — do not duplicate this list.
 *
 * When adding a new component:
 *   1. Add its tag to PHASE_1_VI_COMPONENTS or PHASE_2_VI_COMPONENTS below.
 *   2. Uncomment it in the exported FOCUSABLE_SELECTOR when the component ships.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   import { FOCUSABLE_SELECTOR } from '../base/focusable-selector.js';
 *
 *   // All focusables in a shadow root (native + vi-* hosts):
 *   const focusable = [
 *     ...this.shadowRoot!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
 *   ];
 *
 *   // Include slotted content too (for components that slot focusable children):
 *   this.shadowRoot!.querySelectorAll('slot').forEach((slotEl) => {
 *     (slotEl as HTMLSlotElement)
 *       .assignedElements({ flatten: true })
 *       .forEach((el) => {
 *         if (el.matches(FOCUSABLE_SELECTOR)) {
 *           focusable.push(el as HTMLElement);
 *         }
 *       });
 *   });
 *
 * ─────────────────────────────────────────────────────────────────────────
 * DISABLED EXCLUSION RULES
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Native elements: :not([disabled]) excludes them from the selector.
 * vi-* elements: :not([disabled]) excludes the host — works because vi-*
 *   components reflect `disabled` as an attribute via @property({ reflect: true }).
 *
 * tabindex="-1" exclusion: intentionally NOT in this selector.
 * Rationale: elements with tabindex="-1" are programmatically focusable
 * but not in the sequential tab order. Whether to include them in a trap
 * is a caller decision (FocusTrapMixin excludes them via :not([tabindex="-1"])).
 */ // ── Native HTML focusable elements ───────────────────────────────────────────
const NATIVE_FOCUSABLE = [
    'a[href]:not([tabindex="-1"])',
    'area[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[contenteditable="true"]:not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])'
];
// ── Phase 1 vi-* components ───────────────────────────────────────────────────
// Add each component here when it ships. Keep commented until shipped.
const PHASE_1_VI_COMPONENTS = [
    'vi-button:not([disabled])',
    'vi-input:not([disabled])',
    'vi-checkbox:not([disabled])',
    'vi-switch:not([disabled])'
];
// ── Phase 2 vi-* components ───────────────────────────────────────────────────
// All commented until Phase 2 starts.
const PHASE_2_VI_COMPONENTS = [];
/**
 * A CSS selector matching all tabbable elements:
 *   - Native HTML controls (button, input, select, textarea, a, area)
 *   - Elements with an explicit non-negative tabindex
 *   - All focusable vi-* components (listed explicitly — see above)
 *
 * Disabled elements and elements with tabindex="-1" are excluded.
 */ const FOCUSABLE_SELECTOR = [
    ...NATIVE_FOCUSABLE,
    ...PHASE_1_VI_COMPONENTS,
    ...PHASE_2_VI_COMPONENTS
].join(', ');

function getDeepActiveElement(doc = document) {
    let activeElement = doc.activeElement;
    while(activeElement && activeElement.shadowRoot && activeElement.shadowRoot.activeElement){
        activeElement = activeElement.shadowRoot.activeElement;
    }
    return activeElement;
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
 */ function FocusTrapMixin(Base) {
    class FocusTrapMixinClass extends Base {
        /**
     * The element that held focus before the trap was activated.
     * Restored on deactivate. Stored as a WeakRef so we don't prevent GC
     * if the element is removed from the DOM between activate and deactivate.
     */ _preTrapFocus = null;
        /**
     * Bound reference to the keydown handler.
     * Stored so the same function reference is used for add/remove.
     */ _boundHandleKeydown = (e)=>this._handleTrapKeydown(e);
        _focusableElementsCache = null;
        _trapMutationObserver = null;
        _clearFocusableCache = ()=>{
            this._focusableElementsCache = null;
        };
        _isActuallyFocusable(element) {
            // Exclude elements that are hidden via the `hidden` attribute
            if (element.hasAttribute('hidden')) return false;
            // Exclude elements or ancestors that are aria-hidden
            if (element.getAttribute('aria-hidden') === 'true') return false;
            if (element.closest('[aria-hidden="true"]')) return false;
            // Exclude elements inside an inert subtree
            if (element.hasAttribute('inert') || element.closest('[inert]')) return false;
            // Exclude elements with no rendered box (covers display:none, visibility:hidden, etc.)
            if (element.getClientRects().length === 0) return false;
            return true;
        }
        /**
     * Returns all focusable elements within this component in DOM order.
     *
     * Combines:
     *   1. Shadow DOM focusables (native elements + vi-* hosts)
     *   2. Slotted light-DOM focusables (from each <slot> in the shadow root)
     *
     * Deduplication: slotted elements may also appear as the <slot> element's
     * own focusable — we filter those out by checking the element is not a
     * <slot> itself.
     */ _getFocusableElements() {
            if (this._focusableElementsCache) {
                return this._focusableElementsCache;
            }
            if (!this.shadowRoot) return [];
            // 1. Shadow DOM: native elements + vi-* hosts
            const shadowFocusable = Array.from(this.shadowRoot.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el)=>this._isActuallyFocusable(el));
            // 2. Slotted light-DOM content
            const slottedFocusable = [];
            this.shadowRoot.querySelectorAll('slot').forEach((slotEl)=>{
                slotEl.assignedElements({
                    flatten: true
                }).forEach((el)=>{
                    if (el.nodeType === Node.ELEMENT_NODE) {
                        const element = el;
                        // 1. Check the assigned element itself
                        if (element.matches(FOCUSABLE_SELECTOR) && this._isActuallyFocusable(element)) {
                            slottedFocusable.push(element);
                        } else {
                            // 2. Search its light DOM children
                            element.querySelectorAll(FOCUSABLE_SELECTOR).forEach((descendant)=>{
                                if (this._isActuallyFocusable(descendant)) {
                                    slottedFocusable.push(descendant);
                                }
                            });
                            // 3. Search its direct shadow DOM for internal focusables (e.g., vi-modal-header actions)
                            if (element.shadowRoot) {
                                element.shadowRoot.querySelectorAll(FOCUSABLE_SELECTOR).forEach((shadowDescendant)=>{
                                    if (this._isActuallyFocusable(shadowDescendant)) {
                                        slottedFocusable.push(shadowDescendant);
                                    }
                                });
                            }
                        }
                    }
                });
            });
            // Merge: shadow first (DOM order), then slotted.
            // De-dupe via Set in case an element appears in both (shouldn't happen,
            // but be defensive).
            const allFocusable = [
                ...new Set([
                    ...shadowFocusable,
                    ...slottedFocusable
                ])
            ];
            // Browsers order: tabIndex > 0 (ascending), then tabIndex <= 0 (DOM order).
            const positiveTabIndex = allFocusable.filter((el)=>el.tabIndex > 0);
            const defaultTabIndex = allFocusable.filter((el)=>el.tabIndex <= 0);
            positiveTabIndex.sort((a, b)=>a.tabIndex - b.tabIndex);
            this._focusableElementsCache = [
                ...positiveTabIndex,
                ...defaultTabIndex
            ];
            return this._focusableElementsCache;
        }
        /**
     * Returns the currently focused element within this component.
     *
     * Key distinction:
     *   - `this.shadowRoot.activeElement` → deepest focused element in shadow DOM
     *   - `document.activeElement`        → returns the HOST when focus is inside
     *
     * If `shadowRoot.activeElement` is a <slot>, the real focus is on a
     * slotted (light-DOM) element — fall through to `document.activeElement`.
     */ _getActiveElement() {
            const shadowActive = this.shadowRoot?.activeElement;
            if (shadowActive && shadowActive.tagName !== 'SLOT') {
                return shadowActive;
            }
            // Focus is on slotted content — document.activeElement has the host element.
            let active = document.activeElement;
            // If the active element is a container (like vi-modal-header), we must pierce 
            // its shadow root to find the actual element from our focusable list.
            const focusable = this._focusableElementsCache || [];
            while(active && active.shadowRoot && active.shadowRoot.activeElement){
                // Stop piercing if we hit a component that manages its own focus (e.g. vi-button)
                // and is in our list.
                if (focusable.includes(active)) {
                    break;
                }
                active = active.shadowRoot.activeElement;
            }
            return active;
        }
        /**
     * Keydown handler attached to the shadow root while the trap is active.
     *
     * Intercepts Tab and Shift+Tab only. All other keys pass through normally.
     * Wrapping logic:
     *   - Tab on last element      → focus first element
     *   - Shift+Tab on first element → focus last element
     */ _handleTrapKeydown(event) {
            if (this.hasAttribute('inert')) return;
            if (event.key !== 'Tab') return;
            const focusable = this._getFocusableElements();
            if (focusable.length === 0) return;
            const active = this._getActiveElement();
            const currentIndex = focusable.indexOf(active);
            // Intercept ALL tab events to strictly enforce our sorted order,
            // as browsers often struggle with native tab order across shadow boundaries
            // and mixed slot assignments.
            event.preventDefault();
            if (event.shiftKey) {
                // Shift+Tab: move to previous, or wrap to last if at beginning (or not found)
                if (currentIndex <= 0) {
                    focusable[focusable.length - 1].focus();
                } else {
                    focusable[currentIndex - 1].focus();
                }
            } else {
                // Tab: move to next, or wrap to first if at end (or not found)
                if (currentIndex === -1 || currentIndex === focusable.length - 1) {
                    focusable[0].focus();
                } else {
                    focusable[currentIndex + 1].focus();
                }
            }
        }
        _activateFocusTrap(initialFocus, autofocus = true) {
            // Snapshot focus BEFORE we move it — this is what we restore on deactivate.
            // Use getDeepActiveElement() to capture the exact element even inside nested shadow roots.
            if (document.activeElement) {
                this._preTrapFocus = new WeakRef(getDeepActiveElement() || document.activeElement);
            }
            // Attach keydown to the host element (`this`), not `shadowRoot`.
            // keydown bubbles from inner shadow/slotted elements up through the host,
            // so the listener fires for any key pressed while focus is within the trap.
            // Attaching to the host (rather than a global document listener) means the
            // handler is automatically inactive when focus leaves the component entirely.
            this.addEventListener('keydown', this._boundHandleKeydown);
            this._clearFocusableCache();
            this._trapMutationObserver = new MutationObserver(this._clearFocusableCache);
            this._trapMutationObserver.observe(this, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: [
                    'tabindex',
                    'disabled',
                    'hidden',
                    'inert'
                ]
            });
            if (this.shadowRoot) {
                this._trapMutationObserver.observe(this.shadowRoot, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: [
                        'tabindex',
                        'disabled',
                        'hidden',
                        'inert'
                    ]
                });
            }
            // Focus the initial element after the current call stack clears.
            // requestAnimationFrame ensures Lit has finished rendering the opened state
            // (e.g. display:none removed) before we attempt to focus.
            if (autofocus) {
                requestAnimationFrame(()=>{
                    const target = initialFocus ?? this._getFocusableElements()[0];
                    target?.focus();
                });
            }
        }
        _deactivateFocusTrap(returnFocus) {
            this.removeEventListener('keydown', this._boundHandleKeydown);
            if (this._trapMutationObserver) {
                this._trapMutationObserver.disconnect();
                this._trapMutationObserver = null;
            }
            this._clearFocusableCache();
            // Restore focus to returnFocus element or pre-trap element.
            // Dereference WeakRef — the element may have been removed from the DOM.
            let target = returnFocus ?? null;
            if (!target) {
                const previous = this._preTrapFocus?.deref();
                if (previous && document.contains(previous)) {
                    target = previous;
                }
            }
            this._preTrapFocus = null;
            if (target && document.contains(target)) {
                target.focus?.();
            }
        }
        disconnectedCallback() {
            // Safety: always clean up if the element is removed while trap is active.
            this.removeEventListener('keydown', this._boundHandleKeydown);
            if (this._trapMutationObserver) {
                this._trapMutationObserver.disconnect();
                this._trapMutationObserver = null;
            }
            this._focusableElementsCache = null;
            this._preTrapFocus = null;
            super.disconnectedCallback();
        }
    }
    // Cast required: TypeScript cannot reconcile LitElement's private fields
    // with the anonymous class return type. Same pattern as FocusableMixin.
    return FocusTrapMixinClass;
}

export { FocusTrapMixin as F };
