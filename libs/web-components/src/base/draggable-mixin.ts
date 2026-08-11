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
 * It applies performant `transform: translate3d(x, y, 0)` positioning to `_dragTarget`.
 * 
 * Subclasses MUST implement:
 * - `_dragTarget`: The HTML element that moves (usually the outer container or dialog).
 * - `_dragHandle`: The HTML element that accepts pointer events to initiate the drag (usually a header).
 */
export function DraggableMixin<T extends Constructor<LitElement>>(
  Base: T
): T & Constructor<DraggableInterface> {
  class DraggableMixinClass extends Base {
    /**
     * Determines whether dragging is currently enabled.
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

    protected get _dragTarget(): HTMLElement | null {
      return null;
    }

    protected get _dragHandle(): HTMLElement | null {
      return null;
    }

    private _boundOnPointerDown = this._onPointerDown.bind(this);
    private _boundOnPointerMove = this._onPointerMove.bind(this);
    private _boundOnPointerUp = this._onPointerUp.bind(this);

    override connectedCallback() {
      super.connectedCallback();
      if (this.hasUpdated) {
        this._updateDragState();
      }
    }

    override updated(changedProperties: PropertyValues) {
      super.updated(changedProperties);
      if (changedProperties.has('draggable') || this.draggable) {
        this._updateDragState();
      }
    }

    /**
     * Centralized method to apply or remove drag event listeners based on `draggable` state.
     */
    protected _updateDragState() {
      const handle = this._dragHandle;
      if (handle) {
        if (this.draggable) {
          handle.style.cursor = 'move';
          handle.style.touchAction = 'none';
          handle.removeEventListener('pointerdown', this._boundOnPointerDown);
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
      if (!this.draggable || e.button !== 0) return;

      const target = this._dragTarget;
      const handle = this._dragHandle;
      if (!target || !handle) return;

      // Ignore clicks on interactive controls inside the header handle
      const composedPath = e.composedPath();
      const isInteractive = composedPath.some((node) => {
        if (node instanceof HTMLElement && node !== handle) {
          const tag = node.tagName.toLowerCase();
          const role = node.getAttribute('role');
          return (
            ['button', 'a', 'input', 'select', 'textarea', 'vi-button'].includes(tag) ||
            role === 'button' ||
            node.hasAttribute('data-no-drag')
          );
        }
        return false;
      });

      if (isInteractive) return;

      // Prevent native text selection or default drag behavior
      e.preventDefault();

      this._isDragging = true;
      this._dragStartX = e.clientX;
      this._dragStartY = e.clientY;
      this._initialTranslateX = this._currentTranslateX;
      this._initialTranslateY = this._currentTranslateY;

      // Unblock inline transform by cancelling any active Web Animations API effects
      if (typeof target.getAnimations === 'function') {
        target.getAnimations().forEach((anim) => anim.cancel());
      }

      target.style.transition = 'none';
      document.body.style.cursor = 'move';
      this._previousUserSelect = document.body.style.getPropertyValue('user-select') || null;
      document.body.style.setProperty('user-select', 'none', 'important');

      window.addEventListener('pointermove', this._boundOnPointerMove);
      window.addEventListener('pointerup', this._boundOnPointerUp);
      window.addEventListener('pointercancel', this._boundOnPointerUp);

      try {
        handle.setPointerCapture(e.pointerId);
      } catch {
        // Fallback if pointer capture fails
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

      // Remove event listeners before releasing pointer capture to avoid synthetic event triggers
      this._removeWindowListeners();

      const handle = this._dragHandle;
      if (handle) {
        try {
          if (handle.hasPointerCapture(e.pointerId)) {
            handle.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Ignore if release fails
        }
      }

      document.body.style.cursor = '';

      if (this._previousUserSelect !== null) {
        document.body.style.setProperty('user-select', this._previousUserSelect);
      } else {
        document.body.style.removeProperty('user-select');
      }
      this._previousUserSelect = null;

      const target = this._dragTarget;
      if (target) {
        target.style.transform = `translate3d(${this._currentTranslateX}px, ${this._currentTranslateY}px, 0)`;
        target.style.transition = 'none';
      }
    }

    private _removeWindowListeners() {
      window.removeEventListener('pointermove', this._boundOnPointerMove);
      window.removeEventListener('pointerup', this._boundOnPointerUp);
      window.removeEventListener('pointercancel', this._boundOnPointerUp);
    }
    
    /**
     * Resets the drag translation back to origin (0,0).
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
        target.style.transition = '';
      }
    }
  }

  return DraggableMixinClass as unknown as T & Constructor<DraggableInterface>;
}
