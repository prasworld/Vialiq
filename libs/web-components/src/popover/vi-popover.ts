import { css, html, unsafeCSS, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
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
import popoverStyles from './vi-popover.scss?inline';

export type PopoverPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'right';

export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'contextmenu';

/**
 * vi-popover
 *
 * A floating panel for rich, interactive content.
 *
 * @element vi-popover
 * @attr placement - Preferred position: top | bottom | left | right (default: bottom)
 * @attr trigger - Events that trigger: click | hover | focus | contextmenu (default: click)
 * @attr title - Optional plain text title
 * @attr content - Optional plain text content
 * @attr open - Controls visibility programmatically
 * @attr popper-options - Custom config for Floating UI
 *
 * @slot - Trigger element
 * @slot content - Rich HTML content
 * @slot title - Custom HTML title
 */
@customElement('vi-popover')
export class ViPopover extends ViElement {
  static override styles = css`${unsafeCSS(popoverStyles)}`;

  @property({ type: String, reflect: true }) accessor placement: PopoverPlacement = 'bottom';
  @property({ type: String }) accessor trigger: PopoverTrigger = 'click';
  @property({ type: String }) accessor title = '';
  @property({ type: String }) accessor content = '';
  @property({ type: Boolean, reflect: true }) accessor open = false;

  @property({
    type: Object,
    attribute: 'popper-options',
    converter: {
      fromAttribute: (value) => {
        if (value == null || value === '') return {};
        try {
          return JSON.parse(value) as Partial<ComputePositionConfig>;
        } catch {
          return {};
        }
      },
    },
  })
  accessor popperOptions: Partial<ComputePositionConfig> = {};

  @query('.popover-panel') private accessor _panel!: HTMLDivElement | null;
  @query('.popover-arrow') private accessor _arrowEl!: HTMLDivElement | null;
  @query('slot:not([name])') private accessor _defaultSlot!: HTMLSlotElement | null;

  private _cleanupFloating?: () => void;
  private _triggerElement: HTMLElement | null = null;
  private _showTimeout?: number;
  private _hideTimeout?: number;
  private _contextMenuEvent?: MouseEvent;

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._handleDocumentClick);
    document.addEventListener('keydown', this._handleKeyDown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._cleanupPosition();
    this._detachTriggerListeners();
    document.removeEventListener('click', this._handleDocumentClick);
    document.removeEventListener('keydown', this._handleKeyDown);
    window.clearTimeout(this._showTimeout);
    window.clearTimeout(this._hideTimeout);
  }

  override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    
    if (changedProperties.has('trigger')) {
      this._detachTriggerListeners();
      this._attachTriggerListeners();
    }

    if (changedProperties.has('open')) {
      const wasOpen = changedProperties.get('open') as boolean | undefined;
      if (this._triggerElement) {
        this._triggerElement.setAttribute('aria-expanded', String(this.open));
      }

      if (this.open) {
        this._setupPosition();
        if (wasOpen === false || wasOpen === undefined) {
          this.dispatchEvent(new CustomEvent('vi-popover-show', { bubbles: true, composed: true }));
        }
      } else {
        this._cleanupPosition();
        if (wasOpen === true) {
          this.dispatchEvent(new CustomEvent('vi-popover-hide', { bubbles: true, composed: true }));
        }
      }
    } else if (this.open && (changedProperties.has('placement') || changedProperties.has('popperOptions'))) {
      this._setupPosition();
    }
  }

  private _getActualTrigger(nodes: Node[]): HTMLElement | null {
    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === 'SLOT') {
          const slot = el as HTMLSlotElement;
          const unwrapped = this._getActualTrigger(slot.assignedNodes({ flatten: true }));
          if (unwrapped) return unwrapped;
        } else {
          return el;
        }
      }
    }
    return null;
  }

  private _handleSlotChange() {
    this._detachTriggerListeners();
    const nodes = this._defaultSlot?.assignedNodes({ flatten: true }) || [];
    this._triggerElement = this._getActualTrigger(nodes);
    
    if (this._triggerElement) {
      this._triggerElement.setAttribute('aria-haspopup', 'dialog');
      this._triggerElement.setAttribute('aria-expanded', String(this.open));
      this._attachTriggerListeners();
      
      if (this.open) {
        this._setupPosition();
      }
    }
  }

  private _attachTriggerListeners() {
    if (!this._triggerElement) return;
    
    if (this.trigger === 'click') {
      this._triggerElement.addEventListener('click', this._handleTriggerClick);
      this._triggerElement.addEventListener('keydown', this._handleTriggerKeyDown);
    } else if (this.trigger === 'hover') {
      this._triggerElement.addEventListener('mouseenter', this._handleMouseEnter);
      this._triggerElement.addEventListener('mouseleave', this._handleMouseLeave);
      this.addEventListener('mouseenter', this._handleMouseEnter);
      this.addEventListener('mouseleave', this._handleMouseLeave);
    } else if (this.trigger === 'focus') {
      this.addEventListener('focusin', this._handleFocusIn);
      this.addEventListener('focusout', this._handleFocusOut);
    } else if (this.trigger === 'contextmenu') {
      this._triggerElement.addEventListener('contextmenu', this._handleContextMenu);
    }
  }

  private _detachTriggerListeners() {
    if (!this._triggerElement) return;
    this._triggerElement.removeEventListener('click', this._handleTriggerClick);
    this._triggerElement.removeEventListener('keydown', this._handleTriggerKeyDown);
    this._triggerElement.removeEventListener('mouseenter', this._handleMouseEnter);
    this._triggerElement.removeEventListener('mouseleave', this._handleMouseLeave);
    this.removeEventListener('focusin', this._handleFocusIn);
    this.removeEventListener('focusout', this._handleFocusOut);
    this._triggerElement.removeEventListener('contextmenu', this._handleContextMenu);
    this.removeEventListener('mouseenter', this._handleMouseEnter);
    this.removeEventListener('mouseleave', this._handleMouseLeave);
  }

  private _handleTriggerClick = () => {
    this.open = !this.open;
  };

  private _handleTriggerKeyDown = (e: KeyboardEvent) => {
    if (this.trigger === 'click' && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      this._handleTriggerClick();
    }
  };

  private _handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    this._contextMenuEvent = e;
    
    if (this.open) {
      this._setupPosition();
    } else {
      this.open = true;
    }
  };

  private _handleDocumentClick = (e: MouseEvent) => {
    if (!this.open) return;
    const path = e.composedPath();
    if (!path.includes(this)) {
      this.open = false;
    }
  };

  private _handleKeyDown = (e: KeyboardEvent) => {
    if (this.open && e.key === 'Escape') {
      this.open = false;
      if (this._triggerElement) {
        this._triggerElement.focus();
      }
    }
  };

  private _handleMouseEnter = () => {
    window.clearTimeout(this._hideTimeout);
    this._showTimeout = window.setTimeout(() => {
      this.open = true;
    }, 100);
  };

  private _handleMouseLeave = () => {
    window.clearTimeout(this._showTimeout);
    this._hideTimeout = window.setTimeout(() => {
      this.open = false;
    }, 100);
  };

  private _handleFocusIn = () => {
    this.open = true;
  };

  private _handleFocusOut = (e: FocusEvent) => {
    const relatedTarget = e.relatedTarget as Node | null;
    if (!this.contains(relatedTarget)) {
      this.open = false;
    }
  };

  private _setupPosition() {
    if (!this._triggerElement || !this._panel) return;

    this._cleanupPosition();

    let referenceElement: any = this._triggerElement;

    if (this.trigger === 'contextmenu' && this._contextMenuEvent) {
      const { clientX, clientY } = this._contextMenuEvent;
      referenceElement = {
        contextElement: this._triggerElement,
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: clientX,
            y: clientY,
            top: clientY,
            left: clientX,
            right: clientX,
            bottom: clientY,
          };
        }
      };
    }

    this._cleanupFloating = autoUpdate(
      referenceElement,
      this._panel,
      () => {
        if (!this._triggerElement || !this._panel) return;
        
        computePosition(referenceElement, this._panel, {
          placement: this.placement,
          middleware: [
            offset(8),
            flip(),
            shift({ padding: 8 }),
            ...(this._arrowEl ? [arrow({ element: this._arrowEl })] : [])
          ],
          ...this.popperOptions
        }).then(({ x, y, placement, middlewareData }) => {
          if (!this._panel) return;
          Object.assign(this._panel.style, {
            left: `${x}px`,
            top: `${y}px`,
          });

          if (middlewareData.arrow && this._arrowEl) {
            const { x: arrowX, y: arrowY } = middlewareData.arrow;
            const staticSide = ({
              top: 'bottom',
              right: 'left',
              bottom: 'top',
              left: 'right',
            } as Record<string, string>)[placement.split('-')[0]];

            Object.assign(this._arrowEl.style, {
              left: arrowX != null ? `${arrowX}px` : '',
              top: arrowY != null ? `${arrowY}px` : '',
              right: '',
              bottom: '',
              [staticSide]: '-4px',
            });
            
            // Hide the "inner" borders of the rotated square so it blends perfectly with the panel
            this._arrowEl.style.borderTopColor = (staticSide === 'bottom' || staticSide === 'left') ? 'transparent' : '';
            this._arrowEl.style.borderRightColor = (staticSide === 'top' || staticSide === 'left') ? 'transparent' : '';
            this._arrowEl.style.borderBottomColor = (staticSide === 'top' || staticSide === 'right') ? 'transparent' : '';
            this._arrowEl.style.borderLeftColor = (staticSide === 'bottom' || staticSide === 'right') ? 'transparent' : '';
          }
        });
      }
    );
  }

  private _cleanupPosition() {
    if (this._cleanupFloating) {
      this._cleanupFloating();
      this._cleanupFloating = undefined;
    }
  }

  @property({ type: String, attribute: 'accessible-name' }) accessor accessibleName = '';

  private get _hasTitle() {
    return this.title !== '' || this.querySelector('[slot="title"]') !== null;
  }

  override render() {
    const hasTitle = this._hasTitle;
    return html`
      <slot @slotchange=${this._handleSlotChange}></slot>
      
      <div class="popover-panel ${this.open ? 'open' : ''}" role="dialog" part="popover"
        aria-labelledby=${hasTitle ? 'popover-title' : nothing}
        aria-label=${!hasTitle && this.accessibleName ? this.accessibleName : nothing}
        @mouseenter=${this.trigger === 'hover' ? this._handleMouseEnter : nothing}
        @mouseleave=${this.trigger === 'hover' ? this._handleMouseLeave : nothing}
      >
        ${hasTitle ? html`
          <div class="popover-header" part="header" id="popover-title">
            <slot name="title">${this.title}</slot>
          </div>
        ` : nothing}
        <div class="popover-body" part="body">
          <slot name="content">${this.content}</slot>
        </div>
        <div class="popover-arrow" part="arrow"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-popover': ViPopover;
  }
}
