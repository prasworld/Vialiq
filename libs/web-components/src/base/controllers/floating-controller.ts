import { ReactiveController, ReactiveControllerHost } from 'lit';
import { computePosition, flip, offset, autoUpdate, size, type Placement, type Middleware } from '@floating-ui/dom';

export interface FloatingControllerOptions {
  /** Function returning the reference element (e.g. trigger/input). */
  reference: () => HTMLElement | null;
  /** Function returning the floating element (e.g. popover/listbox). */
  floating: () => HTMLElement | null;
  /** Function returning the desired placement. */
  placement?: () => Placement;
  /** Space in px between reference and floating. */
  offset?: number;
  /** Whether to use fixed positioning instead of absolute. */
  hoist?: () => boolean;
  /** Element or selector string to constrain flipping. */
  boundary?: () => HTMLElement | string | null;
  /** Whether the floating element should be forced to match the reference element's width. */
  matchWidth?: boolean;
}

/**
 * A Reactive Controller that manages @floating-ui/dom positioning.
 * Abstracts away the autoUpdate and positioning logic from complex components.
 */
export class FloatingController implements ReactiveController {
  private _cleanup?: () => void;

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
   * Starts the floating UI auto-update listener.
   * Call this when the popover opens.
   */
  start() {
    const ref = this.options.reference();
    const floating = this.options.floating();
    if (!ref || !floating) return;

    // autoUpdate automatically cleans up previous listeners if called multiple times,
    // but it's safer to just track and call cleanup manually.
    if (this._cleanup) this.stop();

    this._cleanup = autoUpdate(
      ref,
      floating,
      () => this.updatePosition()
    );
  }

  /**
   * Stops the floating UI auto-update listener.
   * Call this when the popover closes.
   */
  stop() {
    if (this._cleanup) {
      this._cleanup();
      this._cleanup = undefined;
    }
  }

  /**
   * Imperatively update position.
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
      position: hoist ? 'fixed' : 'absolute',
    });
  }
}
