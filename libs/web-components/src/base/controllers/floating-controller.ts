import { ReactiveController, ReactiveControllerHost } from 'lit';
import { computePosition, flip, offset, autoUpdate, size, type Placement, type Middleware } from '@floating-ui/dom';
import { OverlayManager } from '../overlay-manager.js';

/**
 * FloatingControllerOptions
 * 
 * Configuration options for the FloatingController.
 */
export interface FloatingControllerOptions {
  /** Function returning the reference element (e.g. trigger/input). */
  reference: () => HTMLElement | null;
  /** Function returning the floating element (e.g. popover/listbox). */
  floating: () => HTMLElement | null;
  /** Function returning the desired placement. */
  placement?: () => Placement;
  /** Space in px between reference and floating. */
  offset?: number;
  /** 
   * When true, uses `position: fixed` instead of `absolute`. 
   * This allows the floating element to escape tight `overflow: hidden` containers 
   * (like modals) without needing to be physically moved (teleported) in the DOM, 
   * preserving Shadow DOM encapsulation and slotting.
   */
  hoist?: () => boolean;
  /** Element or selector string to constrain flipping. */
  boundary?: () => HTMLElement | string | null;
  /** Whether the floating element should be forced to match the reference element's width. */
  matchWidth?: boolean;
}

/**
 * FloatingController
 * 
 * A Lit Reactive Controller that manages `@floating-ui/dom` positioning logic.
 * It abstracts away the complex math and event listeners (autoUpdate) required to 
 * keep a popup/dropdown anchored to a reference element during scrolling/resizing.
 * 
 * It also automatically registers the floating element with the `OverlayManager` 
 * to ensure correct z-index stacking when `hoist` is true.
 */
export class FloatingController implements ReactiveController {
  private _cleanup?: () => void;
  private _overlayZIndex: number | null = null;

  constructor(
    private host: ReactiveControllerHost,
    private options: FloatingControllerOptions
  ) {
    this.host.addController(this);
  }

  hostDisconnected() {
    this.stop();
  }

  /**
   * Starts the floating UI `autoUpdate` listener cycle.
   * This should be called when the popover physically opens (e.g., in `updated()`).
   * 
   * If `hoist` is true, it also acquires a high z-index from the `OverlayManager`.
   */
  start() {
    const ref = this.options.reference();
    const floating = this.options.floating();
    if (!ref || !floating) return;

    const hoist = this.options.hoist?.() ?? false;

    // Register with OverlayManager if hoisted
    if (hoist) {
      this._overlayZIndex = OverlayManager.register(floating, 'dropdown');
      floating.style.zIndex = this._overlayZIndex.toString();
    }

    // autoUpdate automatically cleans up previous listeners if called multiple times,
    // but it's safer to just track and call cleanup manually.
    if (this._cleanup) this.stop();

    this._cleanup = autoUpdate(
      ref,
      floating,
      () => this.updatePosition(),
      { animationFrame: false }
    );
  }

  /**
   * Stops the floating UI `autoUpdate` listener cycle.
   * This should be called when the popover closes, or when the host component disconnects.
   * 
   * It also releases its z-index back to the `OverlayManager`.
   */
  stop() {
    if (this._cleanup) {
      this._cleanup();
      this._cleanup = undefined;
    }

    const floating = this.options.floating();
    if (floating) {
      OverlayManager.unregister(floating);
      this._overlayZIndex = null;
      
      // Remove inline z-index
      floating.style.removeProperty('z-index');
    }
  }

  /**
   * Imperatively calculates and applies the new coordinates (`x`, `y`) using Floating UI.
   * 
   * This method applies various CSS property resets (`margin`, `bottom`, `right`, `minWidth`) 
   * to ensure that the base CSS of the floating element does not distort the absolute coordinates 
   * provided by Floating UI.
   */
  async updatePosition(): Promise<void> {
    const ref = this.options.reference();
    const floating = this.options.floating();
    if (!ref || !floating) return;

    const placementStr = this.options.placement?.() ?? 'bottom-start';
    const hoist = this.options.hoist?.() ?? false;
    const boundaryOpt = this.options.boundary?.();
    let boundaryElement: HTMLElement | 'clippingAncestors' = 'clippingAncestors';

    if (boundaryOpt instanceof HTMLElement) {
      boundaryElement = boundaryOpt;
    } else if (typeof boundaryOpt === 'string' && boundaryOpt) {
      const customBoundary = document.querySelector(boundaryOpt) as HTMLElement | null;
      if (customBoundary) boundaryElement = customBoundary;
    }

    const middlewares: Middleware[] = [
      offset(this.options.offset ?? 4),
      flip({ boundary: boundaryElement, fallbackPlacements: ['top-start', 'bottom-start', 'top-end', 'bottom-end'] })
    ];

    if (this.options.matchWidth) {
      middlewares.push(
        size({
          apply: ({ rects }) => {
            Object.assign(floating.style, {
              width: `${rects.reference.width}px`,
              minWidth: 'auto',
            });
          },
        })
      );
    }

    const { x, y, placement } = await computePosition(ref, floating, {
      placement: placementStr,
      strategy: hoist ? 'fixed' : 'absolute',
      middleware: middlewares,
    });

    floating.setAttribute('data-placement', placement);
    Object.assign(floating.style, {
      left: `${x}px`,
      top: `${y}px`,
      right: 'auto',
      bottom: 'auto',
      position: hoist ? 'fixed' : 'absolute',
      margin: '0',
    });
  }
}
