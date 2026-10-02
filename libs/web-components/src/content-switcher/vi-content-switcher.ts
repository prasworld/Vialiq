import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import switcherStyles from './vi-content-switcher.scss?inline';
import itemStyles from './vi-switcher-item.scss?inline';

export type ContentSwitcherSize = 'sm' | 'md' | 'lg';

/**
 * vi-content-switcher
 *
 * A pill-shaped segmented control for switching between a small set of mutually
 * exclusive views. Prefer this over `vi-tabs` when there are 2–5 options and the
 * options are compact labels (not tab panels with heavy content).
 *
 * @element vi-content-switcher
 *
 * @attr {string}  value    - Currently active item value. Reflects to HTML attribute.
 * @attr {string}  size     - Visual size: 'sm' | 'md' (default) | 'lg'
 * @attr {boolean} disabled - Disables all interactions
 *
 * @fires {CustomEvent<{ value: string; previousValue: string }>} vi-content-switcher-change
 *   Fired when the active item changes. `detail.value` is the new active value.
 *
 * @csspart track   - The outer pill container
 * @csspart indicator - The animated white sliding pill
 *
 * @slot - Place `<vi-switcher-item>` elements here
 *
 * @example
 * ```html
 * <vi-content-switcher value="design">
 *   <vi-switcher-item value="design">Design</vi-switcher-item>
 *   <vi-switcher-item value="json">JSON</vi-switcher-item>
 *   <vi-switcher-item value="preview">Preview</vi-switcher-item>
 * </vi-content-switcher>
 * ```
 */
@customElement('vi-content-switcher')
export class ViContentSwitcher extends ViElement {
  static formAssociated = true;

  static override styles = css`
    ${unsafeCSS(switcherStyles)}
  `;

  private _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * The currently active item value.
   * @attr value
   */
  @property({ type: String, reflect: true }) accessor value = '';

  /**
   * Visual size of the switcher.
   * @attr size
   */
  @property({ type: String, reflect: true })
  accessor size: ContentSwitcherSize = 'md';

  /**
   * If true, stretches the switcher to 100% of its parent's width.
   * @attr block
   */
  @property({ type: Boolean, reflect: true }) accessor block = false;

  /**
   * The name of the input for form submission.
   * @attr name
   */
  @property({ type: String, reflect: true }) accessor name = '';

  /**
   * Disables all item interactions.
   * @attr
   */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  // ── Private state ──────────────────────────────────────────────────────────

  /** Tracks known items from the slotted children */
  @state() private accessor _items: ViSwitcherItem[] = [];

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  private _defaultValue = '';

  private _resizeObserver?: ResizeObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'radiogroup');
    this.addEventListener('keydown', this._onKeyDown);
    if (!this.hasAttribute('tabindex')) {
      // Form associated elements should be able to receive focus natively if needed,
      // but we handle tab indices internally on items.
    }
    // Capture initial value for form resets
    this._defaultValue = this.getAttribute('value') || '';

    this._resizeObserver = new ResizeObserver(() => {
      this._updateIndicator();
    });
    this._resizeObserver.observe(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._onKeyDown);
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = undefined;
    }
  }

  override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('value')) {
      this._internals.setFormValue(this.value);
    }
    
    // Ensure active state and tabindex are updated on programmatic changes
    if (changedProperties.has('value') || changedProperties.has('disabled')) {
      this._syncItems();
    }
  }

  // ── Form integration ───────────────────────────────────────────────────────

  formResetCallback(): void {
    this.value = this._defaultValue;
    this._syncItems();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  // ── Event handling ─────────────────────────────────────────────────────────

  private _onSlotChange(): void {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return;
    this._items = slot
      .assignedElements({ flatten: true })
      .filter((el): el is ViSwitcherItem => el instanceof ViSwitcherItem);
    this._syncItems();
  }

  private _onItemClick(e: Event): void {
    const item = (e.composedPath() as Element[]).find(
      (el): el is ViSwitcherItem => el instanceof ViSwitcherItem,
    );
    this._selectItem(item as ViSwitcherItem | undefined);
  }

  private _selectItem(item?: ViSwitcherItem): void {
    if (!item || item.disabled || this.disabled) return;

    const previousValue = this.value;
    if (item.value === previousValue) return;

    const beforeEvent = new CustomEvent('vi-content-switcher-before-change', {
      detail: { value: item.value, previousValue },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(beforeEvent);

    if (beforeEvent.defaultPrevented) return;

    this.value = item.value;
    this._syncItems();

    this.dispatchEvent(
      new CustomEvent('vi-content-switcher-change', {
        detail: { value: this.value, previousValue },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (this.disabled) return;
    const items = this._items.filter((i) => !i.disabled);
    if (!items.length) return;

    const activeItem = this._items.find((i) => i.value === this.value);
    const currentIndex = this._items.indexOf(
      activeItem || (e.target as ViSwitcherItem),
    );
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    const isRtl = this.matches(':dir(rtl)');

    const arrowLeft = isRtl ? 'ArrowRight' : 'ArrowLeft';
    const arrowRight = isRtl ? 'ArrowLeft' : 'ArrowRight';

    if (e.key === arrowRight || e.key === 'ArrowDown') {
      nextIndex = this._findNextEnabledItemIndex(currentIndex, 1);
    } else if (e.key === arrowLeft || e.key === 'ArrowUp') {
      nextIndex = this._findNextEnabledItemIndex(currentIndex, -1);
    } else if (e.key === 'Home') {
      nextIndex = this._findNextEnabledItemIndex(-1, 1);
    } else if (e.key === 'End') {
      nextIndex = this._findNextEnabledItemIndex(this._items.length, -1);
    } else {
      return;
    }

    e.preventDefault();
    if (nextIndex !== -1 && nextIndex !== currentIndex) {
      const nextItem = this._items[nextIndex];
      this._selectItem(nextItem);
      nextItem.focus();
    }
  };

  private _findNextEnabledItemIndex(
    startIndex: number,
    direction: 1 | -1,
  ): number {
    let index = startIndex + direction;
    while (index >= 0 && index < this._items.length) {
      if (!this._items[index].disabled) return index;
      index += direction;
    }

    // wrap around
    if (direction === 1) {
      for (let i = 0; i < startIndex; i++) {
        if (!this._items[i].disabled) return i;
      }
    } else {
      for (let i = this._items.length - 1; i > startIndex; i--) {
        if (!this._items[i].disabled) return i;
      }
    }
    return startIndex;
  }

  private _syncItems(): void {
    let hasActive = false;
    for (const item of this._items) {
      item.active = item.value === this.value;
      if (item.active) hasActive = true;
      // preserve item-level disabled (no-op removed)
      // Use internal method to set tabindex so it isn't completely controlled by the item itself
      item.tabIndex = (item.disabled || this.disabled) ? -1 : item.active ? 0 : -1;
    }

    // If no item is active, make the first non-disabled item focusable
    if (!hasActive && !this.disabled) {
      const firstEnabled = this._items.find((i) => !i.disabled);
      if (firstEnabled) firstEnabled.tabIndex = 0;
    }
    this._updateIndicator();
  }

  private _updateIndicator(): void {
    const activeItem = this._items.find((it) => it.value === this.value);

    if (!activeItem) {
      this.style.removeProperty('--_indicator-width');
      this.style.removeProperty('--_indicator-left');
      return;
    }

    // Await layout calculation if just rendered, then update the pill bounds.
    requestAnimationFrame(() => {
      const track = this.shadowRoot?.querySelector('.track');
      if (!track) return;

      const trackRect = track.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();

      // Compute left relative to the .track container
      const left = itemRect.left - trackRect.left;
      const width = itemRect.width;

      this.style.setProperty('--_indicator-width', `${width}px`);
      this.style.setProperty('--_indicator-left', `${left}px`);
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  override render(): TemplateResult {
    return html`
      <div part="track" class="track" @click=${this._onItemClick}>
        <div part="indicator" class="indicator" aria-hidden="true"></div>
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * vi-switcher-item
 *
 * A single option within `<vi-content-switcher>`.
 *
 * @element vi-switcher-item
 *
 * @attr {string}  value    - The value this item represents (required)
 * @attr {boolean} active   - Set by the parent switcher; do not set manually
 * @attr {boolean} disabled - Disables only this item
 *
 * @slot - Item label text
 */
@customElement('vi-switcher-item')
export class ViSwitcherItem extends ViElement {
  static override styles = css`
    ${unsafeCSS(itemStyles)}
  `;
  /**
   * The value this item represents. Must match the `value` on the parent switcher.
   * @attr value
   */
  @property({ type: String, reflect: true }) accessor value = '';

  /**
   * Whether this item is currently active. Managed by `vi-content-switcher`.
   * @attr
   */
  @property({ type: Boolean, reflect: true }) accessor active = false;

  /**
   * Disables this individual item.
   * @attr
   */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'radio');
  }

  override updated(): void {
    this.setAttribute('aria-checked', String(this.active));
    this.setAttribute('aria-disabled', String(this.disabled));
    // Focus management is handled by the parent switcher for correct radiogroup behavior
  }

  override render(): TemplateResult {
    return html`
      <slot name="icon"></slot>
      <span class="item-label">
        <slot></slot>
      </span>
    `;
  }
}

// ── Global type declarations ──────────────────────────────────────────────────

declare global {
  interface HTMLElementTagNameMap {
    'vi-content-switcher': ViContentSwitcher;
    'vi-switcher-item': ViSwitcherItem;
  }
}
