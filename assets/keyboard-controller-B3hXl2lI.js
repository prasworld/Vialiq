import { a as autoUpdate, o as offset, f as flip, c as computePosition, s as size } from './floating-ui.dom-DwUTpXgb.js';
import { O as OverlayManager } from './overlay-manager-B43cq-OI.js';

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

class ListboxKeyboardController {
    host;
    config;
    _searchString = '';
    _searchTimeout;
    constructor(host, config){
        this.host = host;
        this.config = config;
        this.host.addController(this);
    }
    hostConnected() {}
    handleKeyDown(e) {
        if (this.host.disabled) return;
        const options = this.config.getFilteredOptions();
        const isSlotted = this.config.getSlottedItems().length > 0;
        const activeIndex = this.config.getActiveIndex();
        switch(e.key){
            case 'ArrowDown':
                e.preventDefault();
                if (!this.host.open) this.config.openDropdown();
                this._navigate(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!this.host.open) this.config.openDropdown();
                this._navigate(-1);
                break;
            case 'Enter':
                e.preventDefault();
                if (this.host.open) {
                    if (isSlotted) {
                        const visible = this.config.getVisibleSlottedItems();
                        if (activeIndex >= 0 && activeIndex < visible.length) {
                            const item = visible[activeIndex];
                            this.config.selectOption({
                                value: item.value,
                                label: item.label || item.value,
                                searchText: item.searchText.length > 0 ? item.searchText.join(' ') : undefined,
                                group: item.group || undefined,
                                disabled: item.disabled,
                                icon: item.icon || undefined,
                                description: item.description || undefined,
                                data: item.data
                            });
                        } else if (this.host.mode === 'tags' || this.host.mode === 'creatable') {
                            this.config.handleCreate();
                        }
                    } else if (activeIndex >= 0 && activeIndex < options.length) {
                        this.config.selectOption(options[activeIndex]);
                    } else if (this.host.mode === 'tags' || this.host.mode === 'creatable') {
                        this.config.handleCreate();
                    }
                } else if (this.host.mode === 'tags' || this.host.mode === 'creatable') {
                    this.config.handleCreate();
                } else {
                    this.config.openDropdown();
                }
                break;
            case ',':
                if (this.host.mode === 'tags') {
                    e.preventDefault();
                    this.config.handleCreate();
                }
                break;
            case 'Escape':
                if (this.host.open) {
                    e.preventDefault();
                    this.config.close();
                }
                break;
            case 'Backspace':
                if (this.host.isSearchable && !this.config.getQuery() && (this.host.mode === 'multi' || this.host.mode === 'tags')) {
                    const selected = this.config.getSelectedValues();
                    if (selected.length > 0) {
                        this.config.removeTag(selected[selected.length - 1]);
                    }
                }
                break;
            case 'Home':
                if (this.host.open) {
                    e.preventDefault();
                    const len = isSlotted ? this.config.getVisibleSlottedItems().length : options.length;
                    if (len > 0) this._navigate(1, 0);
                }
                break;
            case 'End':
                if (this.host.open) {
                    e.preventDefault();
                    const len = isSlotted ? this.config.getVisibleSlottedItems().length : options.length;
                    if (len > 0) this._navigate(-1, len - 1);
                }
                break;
            case ' ':
                if (!this.host.isSearchable && !this.host.open) {
                    e.preventDefault();
                    this.config.openDropdown();
                } else if (!this.host.isSearchable && this.host.open && this._searchString.length > 0) {
                    e.preventDefault();
                    this._handleTypeAhead(' ');
                }
                break;
            default:
                if (!this.host.isSearchable && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                    e.preventDefault();
                    this._handleTypeAhead(e.key);
                }
                break;
        }
    }
    _handleTypeAhead(char) {
        if (this._searchTimeout) {
            clearTimeout(this._searchTimeout);
        }
        this._searchTimeout = setTimeout(()=>{
            this._searchString = '';
            this.config.onTypeAheadChange?.(this._searchString);
        }, 1000);
        this._searchString += char.toLowerCase();
        this.config.onTypeAheadChange?.(this._searchString);
        const options = this.config.getFilteredOptions();
        const isSlotted = this.config.getSlottedItems().length > 0;
        const visible = isSlotted ? this.config.getVisibleSlottedItems() : [];
        const len = isSlotted ? visible.length : options.length;
        if (len === 0) return;
        const getLabel = (i)=>{
            if (isSlotted) {
                return (visible[i]?.label || visible[i]?.textContent || '').toLowerCase();
            }
            return (options[i]?.label || options[i]?.value || '').toLowerCase();
        };
        const isDisabled = (i)=>(isSlotted ? visible[i]?.disabled : options[i]?.disabled) ?? false;
        // Start searching from current active index + 1
        const startIdx = Math.max(0, this.config.getActiveIndex());
        let matchIdx = -1;
        // Search after current index
        for(let i = startIdx + 1; i < len; i++){
            if (!isDisabled(i) && getLabel(i).startsWith(this._searchString)) {
                matchIdx = i;
                break;
            }
        }
        // Wrap around to start
        if (matchIdx === -1) {
            for(let i = 0; i <= startIdx; i++){
                if (!isDisabled(i) && getLabel(i).startsWith(this._searchString)) {
                    matchIdx = i;
                    break;
                }
            }
        }
        if (matchIdx !== -1) {
            this.config.setActiveIndex(matchIdx);
            if (isSlotted) this.config.updateSlottedActiveState(matchIdx);
            this.config.scrollToActiveIndex();
        }
    }
    _navigate(direction, startFrom) {
        const options = this.config.getFilteredOptions();
        const isSlotted = this.config.getSlottedItems().length > 0;
        const visible = isSlotted ? this.config.getVisibleSlottedItems() : [];
        const len = isSlotted ? visible.length : options.length;
        const isDisabled = (i)=>(isSlotted ? visible[i]?.disabled : options[i]?.disabled) ?? false;
        if (len === 0) {
            this.config.setActiveIndex(-1);
            if (isSlotted) this.config.updateSlottedActiveState(-1);
            return;
        }
        let next = startFrom !== undefined ? startFrom : this.config.getActiveIndex();
        if (startFrom === undefined && next === -1) {
            next = direction === 1 ? -1 : 0;
        } else if (startFrom !== undefined) {
            if (!isDisabled(next)) {
                this.config.setActiveIndex(next);
                if (isSlotted) this.config.updateSlottedActiveState(next);
                this.config.scrollToActiveIndex();
                return;
            }
        }
        for(let step = 0; step < len; step++){
            next = (next + direction + len) % len;
            if (!isDisabled(next)) break;
        }
        if (isDisabled(next)) next = -1;
        this.config.setActiveIndex(next);
        if (isSlotted) this.config.updateSlottedActiveState(next);
        this.config.scrollToActiveIndex();
    }
}

export { FloatingController as F, ListboxKeyboardController as L };
