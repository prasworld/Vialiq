import { a as autoUpdate, o as offset, f as flip, c as computePosition, d as size } from './floating-ui.dom-Dsl7AwNm.js';
import { O as OverlayManager } from './overlay-manager-DiQwTjfQ.js';

/**
 * FloatingController
 *
 * A Lit Reactive Controller that manages `@floating-ui/dom` positioning logic.
 * It abstracts away the complex math and event listeners (autoUpdate) required to
 * keep a popup/dropdown anchored to a reference element during scrolling/resizing.
 *
 * It also automatically registers the floating element with the `OverlayManager`
 * to ensure correct z-index stacking when `hoist` is true.
 */ class FloatingController {
    host;
    options;
    _cleanup;
    _overlayZIndex = null;
    constructor(host, options){
        this.host = host;
        this.options = options;
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
   */ start() {
        const ref = this.options.reference();
        const floating = this.options.floating();
        if (!ref || !floating) return;
        // autoUpdate automatically cleans up previous listeners if called multiple times,
        // but it's safer to just track and call cleanup manually.
        if (this._cleanup) this.stop();
        const hoist = this.options.hoist?.() ?? false;
        // Register with OverlayManager if hoisted
        if (hoist) {
            this._overlayZIndex = OverlayManager.register(floating, 'dropdown');
            floating.style.zIndex = this._overlayZIndex.toString();
        }
        this._cleanup = autoUpdate(ref, floating, ()=>this.updatePosition(), {
            animationFrame: false
        });
    }
    /**
   * Stops the floating UI `autoUpdate` listener cycle.
   * This should be called when the popover closes, or when the host component disconnects.
   *
   * It also releases its z-index back to the `OverlayManager`.
   */ stop() {
        if (this._cleanup) {
            this._cleanup();
            this._cleanup = undefined;
        }
        const floating = this.options.floating();
        if (floating && this._overlayZIndex !== null) {
            OverlayManager.unregister(floating);
            this._overlayZIndex = null;
            // Remove inline z-index only if we managed it
            floating.style.removeProperty('z-index');
        }
    }
    /**
   * Imperatively calculates and applies the new coordinates (`x`, `y`) using Floating UI.
   *
   * This method applies various CSS property resets (`margin`, `bottom`, `right`, `minWidth`)
   * to ensure that the base CSS of the floating element does not distort the absolute coordinates
   * provided by Floating UI.
   */ async updatePosition() {
        const ref = this.options.reference();
        const floating = this.options.floating();
        if (!ref || !floating) return;
        const placementStr = this.options.placement?.() ?? 'bottom-start';
        const hoist = this.options.hoist?.() ?? false;
        const boundaryOpt = this.options.boundary?.();
        let boundaryElement = 'clippingAncestors';
        if (boundaryOpt instanceof HTMLElement) {
            boundaryElement = boundaryOpt;
        } else if (typeof boundaryOpt === 'string' && boundaryOpt) {
            const customBoundary = document.querySelector(boundaryOpt);
            if (customBoundary) boundaryElement = customBoundary;
        }
        const middlewares = [
            offset(this.options.offset ?? 4),
            flip({
                boundary: boundaryElement,
                fallbackPlacements: [
                    'top-start',
                    'bottom-start',
                    'top-end',
                    'bottom-end'
                ]
            })
        ];
        const matchWidthVal = typeof this.options.matchWidth === 'function' ? this.options.matchWidth() : this.options.matchWidth;
        if (matchWidthVal !== 'none') {
            middlewares.push(size({
                apply: ({ rects })=>{
                    if (matchWidthVal !== false) {
                        Object.assign(floating.style, {
                            width: `${rects.reference.width}px`,
                            minWidth: 'auto'
                        });
                    } else {
                        Object.assign(floating.style, {
                            width: 'auto',
                            minWidth: `${rects.reference.width}px`
                        });
                    }
                }
            }));
        }
        const { x, y, placement } = await computePosition(ref, floating, {
            placement: placementStr,
            strategy: hoist ? 'fixed' : 'absolute',
            middleware: middlewares
        });
        floating.setAttribute('data-placement', placement);
        Object.assign(floating.style, {
            left: `${x}px`,
            top: `${y}px`,
            right: 'auto',
            bottom: 'auto',
            position: hoist ? 'fixed' : 'absolute',
            margin: '0'
        });
    }
}

export { FloatingController as F };
