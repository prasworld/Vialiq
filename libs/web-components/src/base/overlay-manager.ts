export type OverlayType = 'modal' | 'dropdown' | 'tooltip' | 'toast';
export type ScrollStrategy = 'block' | 'noop';

interface OverlayRegistryItem {
  element: HTMLElement;
  type: OverlayType;
  zIndex: number;
  scrollStrategy: ScrollStrategy;
  noBackdrop?: boolean;
}

/**
 * OverlayManagerService
 *
 * A singleton service responsible for managing the z-index stacking context
 * of all floating elements (Modals, Dropdowns, Tooltips, Toasts) across the application.
 *
 * It ensures that newly opened overlays always appear on top of existing ones by
 * maintaining a registry and dynamically calculating the next highest z-index.
 * It also manages global state side-effects, such as locking `document.body` scroll
 * when a modal is active.
 */
class OverlayManagerService {
  private getBaseZIndex(element?: HTMLElement): number {
    if (
      typeof document !== 'undefined' &&
      typeof getComputedStyle !== 'undefined'
    ) {
      // Derive base stacking context from the modal z-index token (minus 10 to start slightly below it)
      // Read directly from the element if provided to support CSS variable scoping/theming.
      const target = element || document.documentElement;
      const cssVar = getComputedStyle(target)
        .getPropertyValue('--vi-modal-z-index')
        .trim();
      const parsed = parseInt(cssVar, 10);
      return !isNaN(parsed) ? parsed - 10 : 1040;
    }
    return 1040;
  }

  private overlays: OverlayRegistryItem[] = [];
  private _previousOverflow: string | null = null;
  private _previousPaddingRight: string | null = null;
  private _inertedElements: HTMLElement[] = [];

  /**
   * Registers an element as an active overlay.
   * Calculates and returns the appropriate z-index for this overlay.
   *
   * @param element The DOM element being registered (e.g., the modal dialog or dropdown listbox)
   * @param type The type of overlay, used to determine behaviors like scroll-locking.
   * @param scrollStrategy How this overlay interacts with background scrolling.
   * @returns The calculated z-index to be applied to the element.
   */
  public register(
    element: HTMLElement,
    type: OverlayType = 'dropdown',
    scrollStrategy?: ScrollStrategy,
    options?: { noBackdrop?: boolean }
  ): number {
    this.unregister(element); // Ensure no duplicates

    let highestZIndex = this.getBaseZIndex(element);
    if (this.overlays.length > 0) {
      highestZIndex = Math.max(...this.overlays.map((o) => o.zIndex), highestZIndex);
    }

    // Increment by 10 to allow room for backdrops (which typically sit at z-index - 1)
    const newZIndex = highestZIndex + 10;
    const finalStrategy = scrollStrategy ?? (type === 'modal' ? 'block' : 'noop');

    this.overlays.push({ 
      element, 
      type, 
      zIndex: newZIndex, 
      scrollStrategy: finalStrategy,
      noBackdrop: options?.noBackdrop
    });
    this._updateBodyScroll();
    this._syncInertState();

    return newZIndex;
  }

  /**
   * Unregisters an element, removing it from the overlay stack.
   * Should be called when the overlay is closed or disconnected from the DOM.
   *
   * @param element The DOM element to unregister.
   */
  public unregister(element: HTMLElement): void {
    this.overlays = this.overlays.filter((o) => o.element !== element);
    this._updateBodyScroll();
    this._syncInertState();
  }

  /**
   * Gets the assigned z-index for an element if it is currently registered.
   *
   * @param element The DOM element to query.
   * @returns The z-index number, or null if the element is not registered.
   */
  public getZIndex(element: HTMLElement): number | null {
    const item = this.overlays.find((o) => o.element === element);
    return item ? item.zIndex : null;
  }

  /**
   * Evaluates whether the provided element is currently the top-most active overlay.
   * Useful for trapping focus or handling global Escape key presses.
   *
   * @param element The DOM element to check.
   * @returns True if the element has the highest z-index in the registry.
   */
  public isTopOverlay(element: HTMLElement): boolean {
    if (this.overlays.length === 0) return false;
    const topOverlay = this.overlays.reduce((prev, current) =>
      prev.zIndex > current.zIndex ? prev : current,
    );
    return topOverlay.element === element;
  }

  /**
   * Syncs the `inert` attribute on `document.body` children based on the active overlay stack.
   * Modals with a backdrop trap focus globally, so everything beneath them must be `inert`.
   */
  private _syncInertState(): void {
    if (typeof document === 'undefined') return;

    // Find the topmost modal that requires a backdrop
    const blockingOverlays = this.overlays.filter((o) => o.type === 'modal' && !o.noBackdrop);
    const topBlocking = blockingOverlays.length > 0 ? blockingOverlays[blockingOverlays.length - 1] : null;

    if (!topBlocking) {
      // If no blocking overlays, clear all inert state
      this._inertedElements.forEach(el => {
        el.inert = false;
      });
      this._inertedElements = [];
      return;
    }

    // Determine which overlays should NOT be inert (the top blocking one and any above it)
    const activeOverlayElements = new Set<HTMLElement>();
    const topBlockingIndex = this.overlays.indexOf(topBlocking);
    for (let i = topBlockingIndex; i < this.overlays.length; i++) {
      activeOverlayElements.add(this.overlays[i].element);
    }

    // Mark children of body
    Array.from(document.body.children).forEach((child) => {
      const el = child as HTMLElement;

      // Never make the active overlays inert
      if (activeOverlayElements.has(el)) {
        if (this._inertedElements.includes(el)) {
          el.inert = false;
          this._inertedElements = this._inertedElements.filter(e => e !== el);
        }
        return;
      }

      // If it's not an active overlay, and not already inert, make it inert
      if (!el.inert) {
        el.inert = true;
        this._inertedElements.push(el);
      }
    });
  }

  /**
   * Locks or unlocks the document.body scroll based on the active overlays.
   * Modals (and other overlays with scrollStrategy='block') require the body 
   * to be unscrollable. It applies a utility class `vi-scroll-locked` to the body.
   */
  private _updateBodyScroll(): void {
    const hasBlock = this.overlays.some((o) => o.scrollStrategy === 'block');
    if (hasBlock) {
      // Prevent double-setting if already locked
      if (!document.body.classList.contains('vi-scroll-locked')) {
        // Calculate scrollbar width before removing overflow
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.classList.add('vi-scroll-locked');
        this._previousOverflow = document.body.style.getPropertyValue('overflow') || null;
        this._previousPaddingRight = document.body.style.getPropertyValue('padding-right') || null;
        
        document.body.style.setProperty('overflow', 'hidden', 'important');

        // Apply compensation padding to prevent layout shift
        if (scrollbarWidth > 0) {
          const currentPadding = parseFloat(window.getComputedStyle(document.body).paddingRight || '0');
          document.body.style.setProperty('padding-right', `${currentPadding + scrollbarWidth}px`, 'important');
        }
      }
    } else {
      if (document.body.classList.contains('vi-scroll-locked')) {
        document.body.classList.remove('vi-scroll-locked');
        
        if (this._previousOverflow !== null) {
          document.body.style.setProperty('overflow', this._previousOverflow);
        } else {
          document.body.style.removeProperty('overflow');
        }

        if (this._previousPaddingRight !== null) {
          document.body.style.setProperty('padding-right', this._previousPaddingRight);
        } else {
          document.body.style.removeProperty('padding-right');
        }

        this._previousOverflow = null;
        this._previousPaddingRight = null;
      }
    }
  }
}

// Export as a singleton
export const OverlayManager = new OverlayManagerService();
