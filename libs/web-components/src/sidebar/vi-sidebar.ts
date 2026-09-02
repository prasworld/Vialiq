import { css, html, unsafeCSS, type PropertyValues } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import { FocusTrapMixin } from '../base/focus-trap-mixin.js';
import sidebarStyles from './vi-sidebar.scss?inline';
import type { ViSidebarContainer } from './vi-sidebar-container.js';

export type SidebarMode = 'over' | 'push' | 'slide';
export type SidebarPosition =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'start'
  | 'end';

/**
 * A sidebar panel that supports multiple display modes (over, push, slide)
 * and optional resizing. Must be placed inside a `vi-sidebar-container`.
 *
 * @element vi-sidebar
 * @slot - The content of the sidebar
 *
 * @fires vi-open-start - Fired before the sidebar begins opening
 * @fires vi-opened - Fired when the sidebar becomes open
 * @fires vi-after-opened - Fired when the open transition finishes
 * @fires vi-close-start - Fired before the sidebar begins closing
 * @fires vi-closed - Fired when the sidebar becomes closed
 * @fires vi-after-closed - Fired when the close transition finishes
 * @fires vi-opened-change - Fired whenever `opened` changes. Detail: `{ opened: boolean }`
 * @fires vi-transition-end - Fired whenever any open/close transition ends
 */
@customElement('vi-sidebar')
export class ViSidebar extends FocusTrapMixin(ViElement) {
  static override styles = css`
    ${unsafeCSS(sidebarStyles)}
  `;

  /** Whether the sidebar is currently open. */
  @property({ type: Boolean, reflect: true })
  accessor opened = false;

  /** Display mode: `over` (floats above content), `push` (shifts content), `slide` (translates content). */
  @property({ type: String, reflect: true })
  accessor mode: SidebarMode = 'over';

  /** Position of the sidebar relative to the container. */
  @property({ type: String, reflect: true })
  accessor position: SidebarPosition = 'start';

  /**
   * When true, the sidebar uses a width-collapse animation instead of
   * sliding off-screen. Set `docked-size` to a non-zero value (e.g. `"60px"`)
   * to keep a persistent strip visible when closed.
   */
  @property({ type: Boolean, reflect: true })
  accessor dock = false;

  /**
   * How wide (or tall) the sidebar remains when docked and closed.
   * Defaults to `"0px"` (completely hidden).
   * Set to e.g. `"60px"` for an icon-rail style dock.
   */
  @property({ type: String, attribute: 'docked-size' })
  accessor dockedSize = '0px';

  /** Collapse the sidebar when the viewport width drops to or below this value (px). */
  @property({ type: Number, attribute: 'auto-collapse-width' })
  accessor autoCollapseWidth: number | undefined;

  /** Collapse the sidebar when the viewport height drops to or below this value (px). */
  @property({ type: Number, attribute: 'auto-collapse-height' })
  accessor autoCollapseHeight: number | undefined;

  /** Whether to check auto-collapse on initial connection. */
  @property({ type: Boolean, attribute: 'auto-collapse-on-init' })
  accessor autoCollapseOnInit = true;

  /** Enable/disable CSS transitions. */
  @property({ type: Boolean, reflect: true })
  accessor animations = true;

  /** Trap focus inside the sidebar while it is open. */
  @property({ type: Boolean, attribute: 'trap-focus' })
  accessor trapFocus = false;

  /** Automatically move focus to the first focusable element when opened. */
  @property({ type: Boolean, attribute: 'auto-focus' })
  accessor autoFocus = true;

  /** Request the container to show a backdrop when the sidebar is open. */
  @property({ type: Boolean, attribute: 'show-backdrop' })
  accessor showBackdrop = false;

  /** Close when the backdrop is clicked. */
  @property({ type: Boolean, attribute: 'close-on-click-backdrop' })
  accessor closeOnClickBackdrop = false;

  /** Close when a click occurs outside the sidebar. */
  @property({ type: Boolean, attribute: 'close-on-click-outside' })
  accessor closeOnClickOutside = false;

  /** Close when a key is pressed (default: Escape). */
  @property({ type: Boolean, attribute: 'key-close' })
  accessor keyClose = false;

  /** The keyboard key that closes the sidebar when `key-close` is enabled. */
  @property({ type: String, attribute: 'close-key' })
  accessor closeKey = 'Escape';

  /**
   * Allow the user to drag the sidebar edge to resize it.
   * Only effective on left/right (and top/bottom) positioned sidebars.
   */
  @property({ type: Boolean })
  accessor resizable = false;

  /** Minimum width (or height) when resizing. In px. */
  @property({ type: Number, attribute: 'resize-min' })
  accessor resizeMin = 100;

  /** Maximum width (or height) when resizing. In px. */
  @property({ type: Number, attribute: 'resize-max' })
  accessor resizeMax = 800;

  @state() private accessor _isResizing = false;

  // Track whether the sidebar was open before auto-collapse so we can re-open it.
  private _wasCollapsed = false;

  // Internal reference to parent container
  container?: ViSidebarContainer;

  private _resizeObserver?: ResizeObserver;
  private _clickOutsideHandler = this._onClickOutside.bind(this);
  private _keydownHandler = this._onKeydown.bind(this);

  override connectedCallback() {
    super.connectedCallback();

    // Initialize CSS variable for dock width immediately — before first paint.
    this._syncDockedSizeVar();

    if (this.autoCollapseWidth || this.autoCollapseHeight) {
      // Use window resize event — more reliable than ResizeObserver on body.
      this._resizeObserver = new ResizeObserver(() => this._checkAutoCollapse());
      this._resizeObserver.observe(document.documentElement);

      if (this.autoCollapseOnInit) {
        requestAnimationFrame(() => this._checkAutoCollapse());
      }
    }

    // Only attach global listeners when the features are actually enabled.
    if (this.closeOnClickOutside) {
      document.addEventListener('mousedown', this._clickOutsideHandler);
    }
    if (this.keyClose) {
      document.addEventListener('keydown', this._keydownHandler);
    }
    this.addEventListener('transitionend', this._onTransitionEnd);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    document.removeEventListener('mousedown', this._clickOutsideHandler);
    document.removeEventListener('keydown', this._keydownHandler);
    this.removeEventListener('transitionend', this._onTransitionEnd);

    // Clean up any lingering resize pointer listeners (in case removed mid-drag).
    document.removeEventListener('pointermove', this._onResizeMove);
    document.removeEventListener('pointerup', this._stopResize);
    document.body.style.cursor = '';
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    // Sync the CSS variable that drives the dock width/height animation.
    if (
      changedProperties.has('dock') ||
      changedProperties.has('dockedSize') ||
      changedProperties.has('opened')
    ) {
      this._syncDockedSizeVar();
    }

    // Re-attach/detach global listeners when their enabling properties change.
    if (changedProperties.has('closeOnClickOutside')) {
      if (this.closeOnClickOutside) {
        document.addEventListener('mousedown', this._clickOutsideHandler);
      } else {
        document.removeEventListener('mousedown', this._clickOutsideHandler);
      }
    }
    if (changedProperties.has('keyClose')) {
      if (this.keyClose) {
        document.addEventListener('keydown', this._keydownHandler);
      } else {
        document.removeEventListener('keydown', this._keydownHandler);
      }
    }

    if (changedProperties.has('opened')) {
      const eventName = this.opened ? 'vi-opened' : 'vi-closed';
      this.dispatchEvent(
        new CustomEvent(eventName, { bubbles: true, composed: true }),
      );
      this.dispatchEvent(
        new CustomEvent('vi-opened-change', {
          detail: { opened: this.opened },
          bubbles: true,
          composed: true,
        }),
      );

      this._updateContainer();

      if (this.opened) {
        if (this.trapFocus) {
          this._activateFocusTrap(null, this.autoFocus);
        } else if (this.autoFocus) {
          this._focusFirstElement();
        }
      } else {
        if (this.trapFocus) {
          this._deactivateFocusTrap();
        }
      }
    } else if (
      changedProperties.has('dock') ||
      changedProperties.has('dockedSize') ||
      changedProperties.has('mode') ||
      changedProperties.has('position')
    ) {
      this._updateContainer();
    }
  }

  override render() {
    // Sidebar is effectively invisible when dock=true and dockedSize=0px and closed.
    const effectivelyVisible = this.opened || (this.dock && parseFloat(this.dockedSize) > 0);

    return html`
      <aside
        part="base"
        class="vi-sidebar"
        aria-hidden=${!effectivelyVisible}
        role=${this.trapFocus ? 'dialog' : undefined}
        aria-modal=${this.trapFocus ? 'true' : undefined}
        aria-label=${this.trapFocus ? (this.getAttribute('aria-label') || 'Sidebar') : undefined}
      >
        <div class="vi-sidebar__content">
          <slot></slot>
        </div>
        ${this.resizable
          ? html`<div
              part="resizer"
              class="vi-sidebar__resizer"
              @pointerdown=${this._startResize}
            ></div>`
          : ''}
      </aside>
    `;
  }

  /** Opens the sidebar. */
  open() {
    if (!this.opened) {
      this.dispatchEvent(
        new CustomEvent('vi-open-start', { bubbles: true, composed: true }),
      );
      this.opened = true;
    }
  }

  /** Closes the sidebar. */
  close() {
    if (this.opened) {
      this.dispatchEvent(
        new CustomEvent('vi-close-start', { bubbles: true, composed: true }),
      );
      this.opened = false;
    }
  }

  /** Toggles the sidebar open/closed. */
  toggle() {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  /** Syncs `--vi-sidebar-docked-size` CSS variable to drive the dock animation. */
  private _syncDockedSizeVar() {
    const size = (this.dock && !this.opened) ? this.dockedSize : '0px';
    this.style.setProperty('--vi-sidebar-docked-size', size);
  }

  private _updateContainer() {
    if (this.container) {
      if (this.showBackdrop) {
        this.container.requestBackdrop(this.opened);
      }
      this.container.updateLayout();
    }
  }

  private _checkAutoCollapse() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    let shouldCollapse = false;

    if (this.autoCollapseWidth && width <= this.autoCollapseWidth) shouldCollapse = true;
    if (this.autoCollapseHeight && height <= this.autoCollapseHeight) shouldCollapse = true;

    if (shouldCollapse && this.opened) {
      this._wasCollapsed = true;
      this.close();
    } else if (!shouldCollapse && this._wasCollapsed && !this.opened) {
      // Re-open when viewport grows back above the threshold (matches ng-sidebar).
      this._wasCollapsed = false;
      this.open();
    }
  }

  private _onClickOutside(e: MouseEvent) {
    if (!this.opened || !this.closeOnClickOutside) return;

    const path = e.composedPath();
    if (!path.includes(this)) {
      const isBackdrop = (e.target as Element).classList?.contains(
        'vi-sidebar-container__backdrop',
      );
      if (!isBackdrop) {
        this.close();
      }
    }
  }

  private _startResize = (e: PointerEvent) => {
    e.preventDefault();
    if (this.dock && !this.opened) {
      this.open();
    }
    this._isResizing = true;
    this.setAttribute('resizing', '');
    const isHorizontal = this.position === 'top' || this.position === 'bottom';
    document.body.style.cursor = isHorizontal ? 'row-resize' : 'col-resize';
    document.addEventListener('pointermove', this._onResizeMove);
    document.addEventListener('pointerup', this._stopResize);
  };

  private _onResizeMove = (e: PointerEvent) => {
    if (!this._isResizing) return;

    requestAnimationFrame(() => {
      const rect = this.getBoundingClientRect();

      if (this.position === 'start' || this.position === 'left') {
        const newWidth = Math.max(this.resizeMin, Math.min(e.clientX - rect.left, this.resizeMax));
        this.style.setProperty('--vi-sidebar-width', `${newWidth}px`);
      } else if (this.position === 'end' || this.position === 'right') {
        const newWidth = Math.max(this.resizeMin, Math.min(rect.right - e.clientX, this.resizeMax));
        this.style.setProperty('--vi-sidebar-width', `${newWidth}px`);
      } else if (this.position === 'top') {
        const newHeight = Math.max(this.resizeMin, Math.min(e.clientY - rect.top, this.resizeMax));
        this.style.setProperty('--vi-sidebar-height', `${newHeight}px`);
      } else if (this.position === 'bottom') {
        const newHeight = Math.max(this.resizeMin, Math.min(rect.bottom - e.clientY, this.resizeMax));
        this.style.setProperty('--vi-sidebar-height', `${newHeight}px`);
      }

      this.container?.updateLayout();
    });
  };

  private _stopResize = () => {
    this._isResizing = false;
    this.removeAttribute('resizing');
    document.body.style.cursor = '';
    document.removeEventListener('pointermove', this._onResizeMove);
    document.removeEventListener('pointerup', this._stopResize);
  };

  private _onKeydown(e: KeyboardEvent) {
    if (this.keyClose && e.key === this.closeKey && this.opened) {
      this.close();
      e.preventDefault();
    }
  }

  private _onTransitionEnd = (e: TransitionEvent) => {
    // Fire post-transition events for both transform (over/push/slide) and
    // width/height (dock mode) transitions.
    if (
      e.target === this &&
      (e.propertyName === 'transform' ||
       e.propertyName === 'width' ||
       e.propertyName === 'height')
    ) {
      this.dispatchEvent(
        new CustomEvent('vi-transition-end', { bubbles: true, composed: true }),
      );
      if (this.opened) {
        this.dispatchEvent(
          new CustomEvent('vi-after-opened', { bubbles: true, composed: true }),
        );
      } else {
        this.dispatchEvent(
          new CustomEvent('vi-after-closed', { bubbles: true, composed: true }),
        );
      }
    }
  };

  private _focusFirstElement() {
    const focusable = this.shadowRoot
      ?.querySelector('slot')
      ?.assignedElements({ flatten: true })
      .flatMap((el) =>
        Array.from(
          el.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ),
      )
      .filter((el) => el.tabIndex >= 0);

    focusable?.[0]?.focus();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-sidebar': ViSidebar;
  }
}
