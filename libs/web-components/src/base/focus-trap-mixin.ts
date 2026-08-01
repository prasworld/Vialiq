import { LitElement } from 'lit';
import { FOCUSABLE_SELECTOR } from './focusable-selector.js';

// any[] is required here — TypeScript mixin constructors must accept rest args.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  protected _activateFocusTrap(
    initialFocus?: HTMLElement | null,
    autofocus?: boolean,
  ): void;

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
export function FocusTrapMixin<T extends Constructor<LitElement>>(
  Base: T,
): T & Constructor<FocusTrapInterface> {
  class FocusTrapMixinClass extends Base {
    /**
     * The element that held focus before the trap was activated.
     * Restored on deactivate. Stored as a WeakRef so we don't prevent GC
     * if the element is removed from the DOM between activate and deactivate.
     */
    private _preTrapFocus: WeakRef<Element> | null = null;

    /**
     * Bound reference to the keydown handler.
     * Stored so the same function reference is used for add/remove.
     */
    private readonly _boundHandleKeydown = (e: KeyboardEvent) =>
      this._handleTrapKeydown(e);

    private _focusableElementsCache: HTMLElement[] | null = null;
    private _trapMutationObserver: MutationObserver | null = null;

    private _clearFocusableCache = () => {
      this._focusableElementsCache = null;
    };

    private _isActuallyFocusable(element: HTMLElement): boolean {
      // Exclude elements that are hidden via the `hidden` attribute
      if (element.hasAttribute('hidden')) return false;

      // Exclude elements or ancestors that are aria-hidden
      if (element.getAttribute('aria-hidden') === 'true') return false;
      if (element.closest('[aria-hidden="true"]')) return false;

      // Exclude elements inside an inert subtree
      if (element.hasAttribute('inert') || element.closest('[inert]'))
        return false;

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
     */
    private _getFocusableElements(): HTMLElement[] {
      if (this._focusableElementsCache) {
        return this._focusableElementsCache;
      }

      if (!this.shadowRoot) return [];

      // 1. Shadow DOM: native elements + vi-* hosts
      const shadowFocusable = Array.from(
        this.shadowRoot.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => this._isActuallyFocusable(el));

      // 2. Slotted light-DOM content
      const slottedFocusable: HTMLElement[] = [];
      this.shadowRoot.querySelectorAll('slot').forEach((slotEl) => {
        (slotEl as HTMLSlotElement)
          .assignedElements({ flatten: true })
          .forEach((el) => {
            if (el.nodeType === Node.ELEMENT_NODE) {
              const element = el as HTMLElement;
              if (
                element.matches(FOCUSABLE_SELECTOR) &&
                this._isActuallyFocusable(element)
              ) {
                slottedFocusable.push(element);
              }
              element
                .querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
                .forEach((descendant) => {
                  if (this._isActuallyFocusable(descendant)) {
                    slottedFocusable.push(descendant);
                  }
                });
            }
          });
      });

      // Merge: shadow first (DOM order), then slotted.
      // De-dupe via Set in case an element appears in both (shouldn't happen,
      // but be defensive).
      const allFocusable = [
        ...new Set([...shadowFocusable, ...slottedFocusable]),
      ];

      // Browsers order: tabIndex > 0 (ascending), then tabIndex <= 0 (DOM order).
      const positiveTabIndex = allFocusable.filter(el => el.tabIndex > 0);
      const defaultTabIndex = allFocusable.filter(el => el.tabIndex <= 0);

      positiveTabIndex.sort((a, b) => a.tabIndex - b.tabIndex);

      this._focusableElementsCache = [...positiveTabIndex, ...defaultTabIndex];
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
     */
    private _getActiveElement(): Element | null {
      const shadowActive = this.shadowRoot?.activeElement;
      if (shadowActive && shadowActive.tagName !== 'SLOT') {
        return shadowActive;
      }
      // Focus is on slotted content — document.activeElement has the real element.
      return document.activeElement;
    }

    /**
     * Keydown handler attached to the shadow root while the trap is active.
     *
     * Intercepts Tab and Shift+Tab only. All other keys pass through normally.
     * Wrapping logic:
     *   - Tab on last element      → focus first element
     *   - Shift+Tab on first element → focus last element
     */
    private _handleTrapKeydown(event: KeyboardEvent): void {
      if (event.key !== 'Tab') return;

      const focusable = this._getFocusableElements();
      if (focusable.length === 0) return;

      const active = this._getActiveElement();
      const currentIndex = focusable.indexOf(active as HTMLElement);

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

    protected _activateFocusTrap(
      initialFocus?: HTMLElement | null,
      autofocus = true,
    ): void {
      // Snapshot focus BEFORE we move it — this is what we restore on deactivate.
      // Use document.activeElement here (not shadowRoot) — we want the element
      // in the full document that currently has focus, which may be outside
      // this component entirely (e.g. the button that opened the modal).
      if (document.activeElement) {
        this._preTrapFocus = new WeakRef(document.activeElement);
      }

      // Attach keydown to the host element (`this`), not `shadowRoot`.
      // keydown bubbles from inner shadow/slotted elements up through the host,
      // so the listener fires for any key pressed while focus is within the trap.
      // Attaching to the host (rather than a global document listener) means the
      // handler is automatically inactive when focus leaves the component entirely.
      this.addEventListener('keydown', this._boundHandleKeydown);
      
      this._clearFocusableCache();
      this._trapMutationObserver = new MutationObserver(this._clearFocusableCache);
      this._trapMutationObserver.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ['tabindex', 'disabled', 'hidden', 'inert'] });
      if (this.shadowRoot) {
        this._trapMutationObserver.observe(this.shadowRoot, { childList: true, subtree: true, attributes: true, attributeFilter: ['tabindex', 'disabled', 'hidden', 'inert'] });
      }

      // Focus the initial element after the current call stack clears.
      // requestAnimationFrame ensures Lit has finished rendering the opened state
      // (e.g. display:none removed) before we attempt to focus.
      if (autofocus) {
        requestAnimationFrame(() => {
          const target = initialFocus ?? this._getFocusableElements()[0];
          target?.focus();
        });
      }
    }

    protected _deactivateFocusTrap(returnFocus?: HTMLElement | null): void {
      this.removeEventListener(
        'keydown',
        this._boundHandleKeydown,
      );
      
      if (this._trapMutationObserver) {
        this._trapMutationObserver.disconnect();
        this._trapMutationObserver = null;
      }
      this._clearFocusableCache();

      // Restore focus to returnFocus element or pre-trap element.
      // Dereference WeakRef — the element may have been removed from the DOM.
      let target: HTMLElement | null = returnFocus ?? null;
      if (!target) {
        const previous = this._preTrapFocus?.deref();
        if (previous && document.contains(previous)) {
          target = previous as HTMLElement;
        }
      }
      this._preTrapFocus = null;

      if (target && document.contains(target)) {
        target.focus?.();
      }
    }

    override disconnectedCallback(): void {
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
  return FocusTrapMixinClass as unknown as T & Constructor<FocusTrapInterface>;
}
