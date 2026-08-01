export type OverlayType = 'modal' | 'dropdown' | 'tooltip' | 'toast';

interface OverlayRegistryItem {
  element: HTMLElement;
  type: OverlayType;
  zIndex: number;
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
  private baseZIndex = 1040;
  private overlays: OverlayRegistryItem[] = [];
  private _previousOverflow: string | null = null;

  /**
   * Registers an element as an active overlay.
   * Calculates and returns the appropriate z-index for this overlay.
   * 
   * @param element The DOM element being registered (e.g., the modal dialog or dropdown listbox)
   * @param type The type of overlay, used to determine behaviors like scroll-locking.
   * @returns The calculated z-index to be applied to the element.
   */
  public register(element: HTMLElement, type: OverlayType = 'dropdown'): number {
    this.unregister(element); // Ensure no duplicates
    
    let highestZIndex = this.baseZIndex;
    if (this.overlays.length > 0) {
      highestZIndex = Math.max(...this.overlays.map(o => o.zIndex));
    }
    
    // Increment by 10 to allow room for backdrops (which typically sit at z-index - 1)
    const newZIndex = highestZIndex + 10;
    
    this.overlays.push({ element, type, zIndex: newZIndex });
    this._updateBodyScroll();
    
    return newZIndex;
  }

  /**
   * Unregisters an element, removing it from the overlay stack.
   * Should be called when the overlay is closed or disconnected from the DOM.
   * 
   * @param element The DOM element to unregister.
   */
  public unregister(element: HTMLElement): void {
    this.overlays = this.overlays.filter(o => o.element !== element);
    this._updateBodyScroll();
  }

  /**
   * Gets the assigned z-index for an element if it is currently registered.
   * 
   * @param element The DOM element to query.
   * @returns The z-index number, or null if the element is not registered.
   */
  public getZIndex(element: HTMLElement): number | null {
    const item = this.overlays.find(o => o.element === element);
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
    const topOverlay = this.overlays.reduce((prev, current) => (prev.zIndex > current.zIndex) ? prev : current);
    return topOverlay.element === element;
  }

  /**
   * Locks or unlocks the document.body scroll based on the presence of modals.
   * Modals require the body to be unscrollable to trap scroll inside the modal.
   * It applies a utility class `vi-scroll-locked` to the body.
   */
  private _updateBodyScroll(): void {
    const hasModal = this.overlays.some(o => o.type === 'modal');
    if (hasModal) {
      // Prevent double-setting if already locked
      if (!document.body.classList.contains('vi-scroll-locked')) {
        document.body.classList.add('vi-scroll-locked');
        this._previousOverflow = document.body.style.getPropertyValue('overflow') || null;
        document.body.style.setProperty('overflow', 'hidden', 'important');
      }
    } else {
      if (document.body.classList.contains('vi-scroll-locked')) {
        document.body.classList.remove('vi-scroll-locked');
        if (this._previousOverflow !== null) {
          document.body.style.setProperty('overflow', this._previousOverflow);
        } else {
          document.body.style.removeProperty('overflow');
        }
        this._previousOverflow = null;
      }
    }
  }
}

// Export as a singleton
export const OverlayManager = new OverlayManagerService();
