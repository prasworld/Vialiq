import { css, html, unsafeCSS, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
  autoUpdate,
  type ComputePositionConfig,
} from '@floating-ui/dom';
import tooltipStyles from './vi-tooltip.scss?inline';

export type TooltipPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'right';

export type TooltipTrigger = 'hover focus' | 'hover' | 'focus' | 'click';

/**
 * vi-tooltip
 * A floating hint providing supplementary info on hover or focus using Floating UI.
 *
 * @element vi-tooltip
 * @attr content - Plain text tooltip content
 * @attr placement - Preferred position: top | top-start | top-end | bottom | bottom-start | bottom-end | left | right (default: top)
 * @attr trigger - Events that trigger: hover focus | hover | focus | click (default: hover focus)
 * @attr delay - Show delay in ms (default: 500)
 * @attr hide-delay - Hide delay in ms (default: 100)
 * @attr max-width - Max width of tooltip in px (default: 240)
 * @attr disabled - Suppress display of tooltip
 * @attr popper-options - Custom options passed directly to Floating UI's computePosition.
 *
 * @slot - Trigger element
 * @slot content - Rich/interactive tooltip content
 *
 * @csspart tooltip - Floating tooltip panel
 * @csspart content - Tooltip content container
 * @csspart arrow - Arrow pointer
 */
@customElement('vi-tooltip')
export class ViTooltip extends ViElement {
  static override styles = css`${unsafeCSS(tooltipStyles)}`;

  @property({ type: String }) accessor content = '';

  @property({ type: String, reflect: true }) accessor placement: TooltipPlacement = 'top';

  @property({ type: String }) accessor trigger: TooltipTrigger = 'hover focus';

  @property({ type: Number }) accessor delay = 500;

  @property({ type: Number, attribute: 'hide-delay' }) accessor hideDelay = 100;

  @property({ type: Number, attribute: 'max-width' }) accessor maxWidth = 240;

  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /**
   * Custom options passed directly to Floating UI's computePosition.
   * Exposes complete control of offset, flip, shift middlewares, strategy, and more.
   */
  @property({ type: Object, attribute: 'popper-options' }) accessor popperOptions: Partial<ComputePositionConfig> = {};

  @state() private accessor _open = false;

  @state() private accessor _isInteractive = false;

  @query('.tooltip-panel') private accessor _tooltipPanel!: HTMLDivElement | null;
  @query('slot:not([name])') private accessor _defaultSlot!: HTMLSlotElement | null;
  @query('slot[name="content"]') private accessor _contentSlot!: HTMLSlotElement | null;

  private _showTimeout?: number;
  private _hideTimeout?: number;
  private _triggerElement: HTMLElement | null = null;
  private _cleanupAutoUpdate?: () => void;
  
  private _panelId = `vi-tooltip-panel-${Math.random().toString(36).substring(2, 9)}`;

  constructor() {
    super();
    this._handleDocumentClick = this._handleDocumentClick.bind(this);
  }

  override connectedCallback(): void {
    super.connectedCallback();
  }

override disconnectedCallback(): void {
  this._clearTimeouts();
  document.removeEventListener('pointerdown', this._handleDocumentClick);

  if (this._cleanupAutoUpdate) {
    this._cleanupAutoUpdate();
    this._cleanupAutoUpdate = undefined;
  }
  this._removeTriggerAria();
  super.disconnectedCallback();
}

  protected override firstUpdated(): void {
    this._updateTriggerElement();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);

    if (changed.has('disabled') && this.disabled && this._open) {
      this._closeTooltip();
    }
    if (changed.has('maxWidth') && this._tooltipPanel) {
      this._tooltipPanel.style.setProperty('--vi-tooltip-max-width', `${this.maxWidth}px`);
    }
    if ((changed.has('placement') || changed.has('popperOptions')) && this._open) {
      this._positionTooltip();
    }
  }

  /** Force show the tooltip */
  show(): void {
    if (this.disabled) return;
    window.clearTimeout(this._hideTimeout);

    if (this._open) return;

    if (this.delay > 0) {
      window.clearTimeout(this._showTimeout);
      this._showTimeout = window.setTimeout(() => {
        this._openTooltip();
      }, this.delay);
    } else {
      this._openTooltip();
    }
  }

/** Force hide the tooltip */
hide(immediate = false): void {
  window.clearTimeout(this._showTimeout);
  window.clearTimeout(this._hideTimeout);

  if (!this._open) return;

  if (this.hideDelay > 0 && !immediate) {
    this._hideTimeout = window.setTimeout(() => {
      this._closeTooltip();
    }, this.hideDelay);
  } else {
    this._closeTooltip();
  }
}

  private _openTooltip(): void {
    this._open = true;
    const panel = this._tooltipPanel;
    const trigger = this._triggerElement || this.shadowRoot?.querySelector('.trigger-wrapper') as HTMLElement;
    if (panel && trigger) {
      try {
        if (!panel.matches(':popover-open')) {
          panel.showPopover();
        }
      } catch {
        panel.style.display = 'block';
      }

      this._positionTooltip();
      
      // Start autoUpdate monitoring for bounds changes
      this._cleanupAutoUpdate = autoUpdate(trigger, panel, () => {
        this._positionTooltip();
      });

      if (this.trigger.includes('click')) {
        document.addEventListener('pointerdown', this._handleDocumentClick);
      }
    }
    
    this.dispatchEvent(new CustomEvent('vialiq-show', { bubbles: true, composed: true }));
  }

  private _closeTooltip(): void {
    this._open = false;
    const panel = this._tooltipPanel;
    if (panel) {
      try {
        if (panel.matches(':popover-open')) {
          panel.hidePopover();
        }
      } catch {
        panel.style.display = 'none';
      }
      if (this._cleanupAutoUpdate) {
        this._cleanupAutoUpdate();
        this._cleanupAutoUpdate = undefined;
      }
      document.removeEventListener('pointerdown', this._handleDocumentClick);
    }

    this.dispatchEvent(new CustomEvent('vialiq-hide', { bubbles: true, composed: true }));
  }

  private _clearTimeouts(): void {
    window.clearTimeout(this._showTimeout);
    window.clearTimeout(this._hideTimeout);
  }

  private _handleSlotChange(): void {
    this._removeTriggerAria();
    this._updateTriggerElement();
  }

  private _updateTriggerElement(): void {
    if (!this._defaultSlot) return;

    const assigned = this._defaultSlot.assignedElements({ flatten: true });
    const newTrigger = (assigned[0] as HTMLElement) || null;

    if (newTrigger !== this._triggerElement) {
      this._triggerElement = newTrigger;
    }
    
    this._updateTriggerAria();
  }

  private _hasInteractiveContent(): boolean {
    if (!this._contentSlot) return false;
    const assigned = this._contentSlot.assignedElements({ flatten: true });
    if (assigned.length === 0) return false;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'vi-button:not([disabled])',
      'vi-link',
      '[tabindex]:not([tabindex="-1"])'
    ];

    const hasFocusable = (el: Element): boolean => {
      if (focusableSelectors.some(selector => el.matches(selector))) return true;
      return Array.from(el.children).some(child => hasFocusable(child));
    };

    return assigned.some(el => hasFocusable(el));
  }

  private _updateTriggerAria(): void {
    const trigger = this._triggerElement;
    const isInteractive = this._hasInteractiveContent();
    this._isInteractive = isInteractive;

    if (!trigger) return;

    if (isInteractive) {
      trigger.setAttribute('aria-details', this._panelId);
      trigger.removeAttribute('aria-describedby');
    } else {
      trigger.setAttribute('aria-describedby', this._panelId);
      trigger.removeAttribute('aria-details');
    }
  }

  private _removeTriggerAria(): void {
    const trigger = this._triggerElement;
    if (trigger) {
      trigger.removeAttribute('aria-describedby');
      trigger.removeAttribute('aria-details');
    }
  }

  // ----------------------------------------------------------------------------
  // Pointer/Focus Events
  // ----------------------------------------------------------------------------

  private _onPointerEnter = (): void => {
    if (this.trigger.includes('hover')) {
      this.show();
    }
  };

  private _onPointerLeave = (): void => {
    if (this.trigger.includes('hover')) {
      this.hide();
    }
  };

  private _onFocusIn = (): void => {
    if (this.trigger.includes('focus')) {
      this.show();
    }
  };

  private _onFocusOut = (): void => {
    if (this.trigger.includes('focus')) {
      this.hide();
    }
  };

  private _onClick = (): void => {
    if (this.trigger.includes('click')) {
      if (this._open) {
        this.hide(true);
      } else {
        this.show();
      }
    }
  };

  private _onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.hide(true);
    }
  }

  private _handleDocumentClick(event: PointerEvent): void {
    const target = event.target as Node;
    const panel = this._tooltipPanel;
    if (this._open && panel && !panel.contains(target) && !this.contains(target)) {
      this.hide(true);
    }
  }

  // ----------------------------------------------------------------------------
  // Positioning Math using Floating UI
  // ----------------------------------------------------------------------------

  private _positionTooltip(): void {
    const panel = this._tooltipPanel;
    if (!panel) return;

    panel.style.setProperty('--vi-tooltip-max-width', `${this.maxWidth}px`);

    const trigger = this._triggerElement || this.shadowRoot?.querySelector('.trigger-wrapper') as HTMLElement;
    if (!trigger) return;

    const arrowEl = panel.querySelector('.tooltip-arrow') as HTMLElement;

    // Build default middleware list
    const defaultMiddleware = [
      offset(10), // Arrow size 6px + 4px gap
      flip(),
      shift({ padding: 8 }),
      arrowEl ? arrow({ element: arrowEl }) : null,
    ].filter(Boolean);

// Merge consumer popperOptions, allowing overrides for middleware, strategy, etc.
// (but keep `placement` controlled by the `placement` prop to avoid two sources of truth)
const { placement: _ignoredPlacement, ...popperOptions } = this.popperOptions ?? {};
const config: ComputePositionConfig = {
  placement: this.placement,
  strategy: popperOptions.strategy ?? 'absolute',
  middleware: popperOptions.middleware ?? defaultMiddleware,
  ...popperOptions,
};

    computePosition(trigger, panel, config).then(({ x, y, placement, strategy, middlewareData }) => {
      Object.assign(panel.style, {
        position: strategy,
        left: `${x}px`,
        top: `${y}px`,
      });

      // Update data-placement attribute to trigger arrow CSS styles
      panel.setAttribute('data-placement', placement);

      // Position the arrow if arrow middleware data exists
      if (arrowEl && middlewareData.arrow) {
        const { x: arrowX, y: arrowY } = middlewareData.arrow;
        
        // Find which side the arrow is on depending on placement
        const side = placement.split('-')[0];
        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[side];

        if (staticSide) {
          Object.assign(arrowEl.style, {
            left: arrowX != null ? `${arrowX}px` : '',
            top: arrowY != null ? `${arrowY}px` : '',
            right: '',
            bottom: '',
            [staticSide]: `${-arrowEl.offsetWidth / 2 || -6}px`, // position arrow exactly on edge
          });
        }
      }
    });
  }

  override render(): TemplateResult {
    const { _panelId, content, placement, _onPointerEnter, _onPointerLeave, _onFocusIn, _onFocusOut, _onClick, _onKeyDown } = this;

    return html`
      <span
        class="trigger-wrapper"
        @pointerenter=${_onPointerEnter}
        @pointerleave=${_onPointerLeave}
        @focusin=${_onFocusIn}
        @focusout=${_onFocusOut}
        @click=${_onClick}
        @keydown=${_onKeyDown}
      >
        <slot @slotchange=${this._handleSlotChange}></slot>
      </span>

      <div
        popover="manual"
        id=${_panelId}
        class="tooltip-panel"
        part="tooltip"
        role=${this._isInteractive ? 'dialog' : 'tooltip'}
        aria-modal=${this._isInteractive ? 'false' : nothing}
        placement=${placement}
        @pointerenter=${_onPointerEnter}
        @pointerleave=${_onPointerLeave}
        @focusin=${_onFocusIn}
        @focusout=${_onFocusOut}
      >
        <div class="tooltip-content" part="content">
          <slot name="content" @slotchange=${this._updateTriggerAria}>${content}</slot>
          <div class="tooltip-arrow" part="arrow"></div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-tooltip': ViTooltip;
  }
}
