import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export declare class DraggableInterface {
  draggable: boolean;
  protected get _dragTarget(): HTMLElement | null;
  protected get _dragHandle(): HTMLElement | null;
  protected _resetDrag(): void;
  protected _stopDrag(): void;
}

/**
 * DraggableMixin
 * 
 * Provides native drag-and-drop capabilities using Pointer Events to any LitElement.
 * It is primarily designed for modals and dialogs that need to be repositioned by the user.
 * 
 * By default, this applies a `transform: translate3d(x, y, 0)` to the element returned 
 * by `_dragTarget`. This is highly performant and avoids reflowing the layout.
 * 
 * Subclasses MUST implement:
 * - `_dragTarget`: The HTML element that moves (usually the outer container or dialog).
 * - `_dragHandle`: The HTML element that accepts pointer events to initiate the drag (usually a header).
 * 
 * @example
 * ```typescript
 * class MyModal extends DraggableMixin(LitElement) {
 *   protected get _dragTarget() { return this.shadowRoot.querySelector('.modal'); }
 *   protected get _dragHandle() { return this.shadowRoot.querySelector('.header'); }
 * }
 * ```
 */
export function DraggableMixin<T extends Constructor<LitElement>>(
  Base: T
): T & Constructor<DraggableInterface> {
  class DraggableMixinClass extends Base {
    /**
     * Determines whether dragging is currently enabled.
     * When true, `cursor: move` is applied to the drag handle.
     */
    @property({ type: Boolean, reflect: true }) accessor draggable = false;

    private _isDragging = false;
    private _previousUserSelect: string | null = null;
    private _dragStartX = 0;
    private _dragStartY = 0;
    private _initialTranslateX = 0;
    private _initialTranslateY = 0;
    private _currentTranslateX = 0;
    private _currentTranslateY = 0;

    /**
     * Returns the DOM element that should actually be translated on the screen.
     */
    protected get _dragTarget(): HTMLElement | null {
      return null;
    }

    /**
     * Returns the DOM element that acts as the "handle" to initiate a drag operation.
     */
    protected get _dragHandle(): HTMLElement | null {
      return null;
    }

    private _boundOnPointerDown = this._onPointerDown.bind(this);
    private _boundOnPointerMove = this._onPointerMove.bind(this);
    private _boundOnPointerUp = this._onPointerUp.bind(this);

    /**
     * Reattaches the pointerdown listener if the element is disconnected and reconnected
     * to the DOM (e.g., when teleported to document.body).
     */
    override connectedCallback() {
      super.connectedCallback();
      // If the component was disconnected and reconnected (e.g. teleported),
      // we need to re-attach the event listener since disconnectedCallback removed it.
      if (this.hasUpdated) {
        this._updateDragState();
      }
    }

    /**
     * Ensures event listeners are attached or detached whenever the `movable` property changes.
     */
    override updated(changedProperties: PropertyValues) {
      super.updated(changedProperties);

      if (changedProperties.has('draggable')) {
        this._updateDragState();
      }
    }

    /**
     * Centralized method to apply or remove drag event listeners based on the `movable` state.
     */
    private _updateDragState() {
      const handle = this._dragHandle;
      if (handle) {
        if (this.draggable) {
          handle.style.cursor = 'move';
          handle.style.touchAction = 'none'; // Prevent scroll on touch devices
          handle.removeEventListener('pointerdown', this._boundOnPointerDown); // prevent duplicates
          handle.addEventListener('pointerdown', this._boundOnPointerDown);
        } else {
          handle.style.cursor = '';
          handle.style.touchAction = '';
          handle.removeEventListener('pointerdown', this._boundOnPointerDown);
          this._resetDrag();
        }
      }
    }

    override disconnectedCallback() {
      super.disconnectedCallback();
      const handle = this._dragHandle;
      if (handle) {
        handle.removeEventListener('pointerdown', this._boundOnPointerDown);
      }
      this._removeWindowListeners();
    }

    private _onPointerDown(e: PointerEvent) {
      if (!this.draggable || e.button !== 0) return; // Only left click

      const target = this._dragTarget;
      if (!target) return;

      // Check if the user is clicking on an interactive element inside the handle
      const composedPath = e.composedPath();
      const isInteractive = composedPath.some((node) => {
        if (node instanceof HTMLElement) {
          const tag = node.tagName.toLowerCase();
          return ['button', 'a', 'input', 'select', 'textarea'].includes(tag);
        }
        return false;
      });

      if (isInteractive) return;

      this._isDragging = true;
      this._dragStartX = e.clientX;
      this._dragStartY = e.clientY;

      // Extract current translation if any
      const style = window.getComputedStyle(target);
      const matrix = new DOMMatrixReadOnly(style.transform === 'none' ? undefined : style.transform);
      this._initialTranslateX = matrix.m41;
      this._initialTranslateY = matrix.m42;

      // Disable transitions during drag for immediate response
      target.style.transition = 'none';

      window.addEventListener('pointermove', this._boundOnPointerMove);
      window.addEventListener('pointerup', this._boundOnPointerUp);
      window.addEventListener('pointercancel', this._boundOnPointerUp);
      
      // Prevent text selection while dragging
      this._previousUserSelect = document.body.style.getPropertyValue('user-select') || null;
      document.body.style.setProperty('user-select', 'none', 'important');
      
      // Capture pointer so we don't lose it if moving too fast
      const handle = this._dragHandle;
      if (handle) {
        handle.setPointerCapture(e.pointerId);
      }
    }

    private _onPointerMove(e: PointerEvent) {
      if (!this._isDragging) return;

      e.preventDefault();

      const deltaX = e.clientX - this._dragStartX;
      const deltaY = e.clientY - this._dragStartY;

      this._currentTranslateX = this._initialTranslateX + deltaX;
      this._currentTranslateY = this._initialTranslateY + deltaY;

      const target = this._dragTarget;
      if (target) {
        target.style.transform = `translate3d(${this._currentTranslateX}px, ${this._currentTranslateY}px, 0)`;
      }
    }

    private _onPointerUp(e: PointerEvent) {
      if (!this._isDragging) return;
      this._isDragging = false;

      const handle = this._dragHandle;
      if (handle && handle.hasPointerCapture(e.pointerId)) {
        handle.releasePointerCapture(e.pointerId);
      }

      this._removeWindowListeners();
      
      if (this._previousUserSelect !== null) {
        document.body.style.setProperty('user-select', this._previousUserSelect);
      } else {
        document.body.style.removeProperty('user-select');
      }
      this._previousUserSelect = null;
      
      const target = this._dragTarget;
      if (target) {
        target.style.transition = ''; // Restore transition
      }
    }

    private _removeWindowListeners() {
      window.removeEventListener('pointermove', this._boundOnPointerMove);
      window.removeEventListener('pointerup', this._boundOnPointerUp);
      window.removeEventListener('pointercancel', this._boundOnPointerUp);
    }
    
    /**
     * Resets the drag translation back to origin (0,0).
     * Useful when the modal is closed and reopened so it doesn't appear
     * off-screen, or when the modal is maximized.
     * 
     * IMPORTANT: By removing the `transform` style entirely, we ensure that the dragged 
     * element does not accidentally establish a CSS containing block for `position: fixed`
     * descendants when it is not actively being dragged.
     */
    protected _resetDrag() {
      this._currentTranslateX = 0;
      this._currentTranslateY = 0;
      const target = this._dragTarget;
      if (target) {
        target.style.transform = '';
      }
    }

    /**
     * Stops the drag operation forcefully and cleans up state and listeners.
     */
    protected _stopDrag() {
      if (!this._isDragging) return;
      this._isDragging = false;

      this._removeWindowListeners();
      
      if (this._previousUserSelect !== null) {
        document.body.style.setProperty('user-select', this._previousUserSelect);
      } else {
        document.body.style.removeProperty('user-select');
      }
      this._previousUserSelect = null;
      
      const target = this._dragTarget;
      if (target) {
        target.style.transition = ''; // Restore transition
      }
    }
  }

  return DraggableMixinClass as unknown as T & Constructor<DraggableInterface>;
}
