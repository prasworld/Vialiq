import { LitElement, html, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export declare class ResizableInterface {
  resizable: boolean;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  protected get _resizeTarget(): HTMLElement | null;
  protected _renderResizeHandles(): TemplateResult;
  protected _resetResize(): void;
}

/**
 * ResizableMixin
 *
 * Provides native 8-direction resize capabilities using Pointer Events.
 * Applies `width` and `height` inline styles to `_resizeTarget`.
 *
 * **Important**: All private fields use the `_rsz_` prefix to prevent
 * name collisions when composed with other mixins (e.g., DraggableMixin).
 *
 * Subclasses MUST implement:
 * - `_resizeTarget`: The HTML element that resizes (usually the dialog box).
 * - Render `${this._renderResizeHandles()}` inside the component's template.
 */
export function ResizableMixin<T extends Constructor<LitElement>>(
  Base: T,
): T & Constructor<ResizableInterface> {
  class ResizableMixinClass extends Base {
    /** Enable resizing */
    @property({ type: Boolean, reflect: true }) accessor resizable = false;

    /** Minimum width in pixels */
    @property({ type: Number, attribute: 'min-width' }) accessor minWidth = 200;

    /** Minimum height in pixels */
    @property({ type: Number, attribute: 'min-height' }) accessor minHeight = 120;

    /** Maximum width in pixels (0 = viewport width) */
    @property({ type: Number, attribute: 'max-width' }) accessor maxWidth = 0;

    /** Maximum height in pixels (0 = viewport height) */
    @property({ type: Number, attribute: 'max-height' }) accessor maxHeight = 0;

    // ── All private fields prefixed _rsz_ to prevent mixin collision ──

    private _rsz_isResizing = false;
    private _rsz_activeHandle: string | null = null;
    private _rsz_prevUserSelect: string | null = null;
    private _rsz_prevTransition: string | null = null;

    private _rsz_startX = 0;
    private _rsz_startY = 0;
    private _rsz_startWidth = 0;
    private _rsz_startHeight = 0;

    protected get _resizeTarget(): HTMLElement | null {
      return null;
    }

    // Bound handlers — arrow function class fields, uniquely named
    private readonly _rsz_onPointerMove = (e: PointerEvent) => this._rsz_handlePointerMove(e);
    private readonly _rsz_onPointerUp = (e: PointerEvent) => this._rsz_handlePointerUp(e);

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      this._rsz_removeListeners();
    }

    override updated(changedProperties: PropertyValues): void {
      super.updated(changedProperties);
    }

    private _rsz_onPointerDown(e: PointerEvent, handle: string): void {
      if (!this.resizable || e.button !== 0) return;

      // Duck-type: suppress resize when maximized
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((this as any)._maximized) return;

      const target = this._resizeTarget;
      if (!target) return;

      e.preventDefault();
      e.stopPropagation();

      this._rsz_isResizing = true;
      this._rsz_activeHandle = handle;

      this._rsz_startX = e.clientX;
      this._rsz_startY = e.clientY;

      const rect = target.getBoundingClientRect();
      this._rsz_startWidth = rect.width;
      this._rsz_startHeight = rect.height;

      // Cancel active animations so inline style takes over immediately
      if (typeof target.getAnimations === 'function') {
        target.getAnimations().forEach((anim) => anim.cancel());
      }

      this._rsz_prevTransition = target.style.transition;
      target.style.transition = 'none';

      this._rsz_prevUserSelect = document.body.style.getPropertyValue('user-select') || null;
      document.body.style.setProperty('user-select', 'none', 'important');
      document.body.style.cursor = `${handle}-resize`;

      window.addEventListener('pointermove', this._rsz_onPointerMove);
      window.addEventListener('pointerup', this._rsz_onPointerUp);
      window.addEventListener('pointercancel', this._rsz_onPointerUp);

      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Fallback silently
      }
    }

    private _rsz_handlePointerMove(e: PointerEvent): void {
      if (!this._rsz_isResizing || !this._rsz_activeHandle) return;

      e.preventDefault();

      const target = this._resizeTarget;
      if (!target) return;

      const deltaX = e.clientX - this._rsz_startX;
      const deltaY = e.clientY - this._rsz_startY;
      const handle = this._rsz_activeHandle;

      let newWidth = this._rsz_startWidth;
      let newHeight = this._rsz_startHeight;

      // Horizontal
      if (handle.includes('e')) {
        newWidth = this._rsz_startWidth + deltaX;
      } else if (handle.includes('w')) {
        newWidth = this._rsz_startWidth - deltaX;
      }

      // Vertical
      if (handle.includes('s')) {
        newHeight = this._rsz_startHeight + deltaY;
      } else if (handle.includes('n')) {
        newHeight = this._rsz_startHeight - deltaY;
      }

      // Enforce min/max (0 means use viewport)
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const effectiveMaxWidth = this.maxWidth > 0 ? this.maxWidth : vw;
      const effectiveMaxHeight = this.maxHeight > 0 ? this.maxHeight : vh;

      newWidth = Math.max(this.minWidth, Math.min(newWidth, effectiveMaxWidth));
      newHeight = Math.max(this.minHeight, Math.min(newHeight, effectiveMaxHeight));

      target.style.width = `${newWidth}px`;
      target.style.height = `${newHeight}px`;
      // Override any max-width/max-height from CSS so resize takes precedence
      target.style.maxWidth = `${newWidth}px`;
      target.style.maxHeight = `${newHeight}px`;
    }

    private _rsz_handlePointerUp(_e: PointerEvent): void {
      if (!this._rsz_isResizing) return;
      this._rsz_isResizing = false;
      this._rsz_activeHandle = null;

      document.body.style.cursor = '';
      if (this._rsz_prevUserSelect !== null) {
        document.body.style.setProperty('user-select', this._rsz_prevUserSelect);
      } else {
        document.body.style.removeProperty('user-select');
      }
      this._rsz_prevUserSelect = null;

      const target = this._resizeTarget;
      if (target) {
        if (this._rsz_prevTransition !== null) {
          target.style.transition = this._rsz_prevTransition;
        } else {
          target.style.removeProperty('transition');
        }
      }
      this._rsz_prevTransition = null;

      this._rsz_removeListeners();
    }

    private _rsz_removeListeners(): void {
      window.removeEventListener('pointermove', this._rsz_onPointerMove);
      window.removeEventListener('pointerup', this._rsz_onPointerUp);
      window.removeEventListener('pointercancel', this._rsz_onPointerUp);
    }

    /**
     * Clears any inline resize dimensions (called on open or maximize).
     */
    protected _resetResize(): void {
      this._rsz_isResizing = false;
      this._rsz_activeHandle = null;
      this._rsz_removeListeners();
      const target = this._resizeTarget;
      if (target) {
        target.style.width = '';
        target.style.height = '';
        target.style.maxWidth = '';
        target.style.maxHeight = '';
      }
    }

    /**
     * Renders 8 invisible hit-area divs for all resize directions.
     * Returns empty template when `resizable` is false.
     */
    protected _renderResizeHandles(): TemplateResult {
      if (!this.resizable) return html``;

      const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;
      return html`
        ${handles.map(
          (handle) => html`
            <div
              class="resize-handle resize-handle-${handle}"
              @pointerdown=${(e: PointerEvent) => this._rsz_onPointerDown(e, handle)}
              aria-hidden="true"
            ></div>
          `,
        )}
      `;
    }
  }

  return ResizableMixinClass as unknown as T & Constructor<ResizableInterface>;
}
