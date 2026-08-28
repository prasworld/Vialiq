import {
  css,
  html,
  nothing,
  unsafeCSS,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { ViElement } from '../base/vi-element.js';
import { ViTab } from './vi-tab.js';
import { ViTabPanel } from './vi-tab-panel.js';
import { registerIcons } from '../icons/registry.js';
import {
  chevronLeftIcon,
  chevronRightIcon,
  plusIcon,
  chevronDownIcon,
} from '@vialiq/icons';
import tabsStyles from './vi-tabs.scss?inline';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsVariant = 'line' | 'pill' | 'card' | 'enclosed' | 'secondary';
export type TabsActivation = 'automatic' | 'manual';
export type TabsOverflow = 'scroll' | 'menu' | 'wrap';

/**
 * `vi-tabs`
 *
 * Container that manages active tab state, keyboard navigation (WAI-ARIA APG),
 * overflow handling, and closable tab focus management.
 *
 * @element vi-tabs
 *
 * @attr {string}          active           - tab-id of the active tab
 * @attr {TabsOrientation} orientation      - 'horizontal' | 'vertical'
 * @attr {TabsVariant}     variant          - Visual style variant
 * @attr {TabsActivation}  activation       - 'manual' (default) | 'automatic'
 * @attr {TabsOverflow}    overflow         - 'scroll' (default) | 'menu' | 'wrap'
 * @attr {boolean}         anchor-closable  - Sort closable tabs to the end of the tablist
 *
 * @slot - Place `vi-tab` and `vi-tab-panel` elements here (slot assignment is automatic)
 *
 * @csspart tablist       - The `role="tablist"` container
 * @csspart tab-indicator - Active tab underline / indicator
 * @csspart tab-cursor    - Sliding selection background element
 * @csspart more-button   - The "More" overflow trigger button
 * @csspart more-menu     - The "More" dropdown menu
 *
 * @fires {CustomEvent<{fromTabId:string;toTabId:string}>} vi-tabs-before-change  - Cancelable. Fires before tab changes.
 * @fires {CustomEvent<{fromTabId:string;toTabId:string}>} vi-tabs-change         - Fires after tab changes.
 * @fires {CustomEvent<{tabId:string}>}                   vi-tabs-tab-close       - Fires after a closable tab is closed. Host must remove the element.
 */
@customElement('vi-tabs')
export class ViTabs extends ViElement {
  static override styles = css`
    ${unsafeCSS(tabsStyles)}
  `;

  // ── Public API ──────────────────────────────────────────────────────────────

  /** tab-id of the currently active tab. */
  @property({ type: String, reflect: true })
  accessor active = '';

  /** Layout direction. */
  @property({ type: String, reflect: true })
  accessor orientation: TabsOrientation = 'horizontal';

  /** Visual style. */
  @property({ type: String, reflect: true })
  accessor variant: TabsVariant = 'line';

  /**
   * Activation mode.
   * - `'manual'` (default): Arrow keys move focus only; Enter/Space activates.
   * - `'automatic'`: Focus immediately activates the tab.
   */
  @property({ type: String })
  accessor activation: TabsActivation = 'manual';

  /**
   * Overflow behavior when tabs exceed tablist width.
   * - `'scroll'` (default): Tablist scrolls horizontally.
   * - `'menu'`:  Extra tabs appear in a "More" dropdown. Selected tab swaps into visible area.
   * - `'wrap'`:  Tabs wrap to additional lines.
   */
  @property({ type: String, reflect: true })
  accessor overflow: TabsOverflow = 'scroll';

  /**
   * When true, closable tabs are visually sorted to the end of the tablist
   * (using CSS `order`). DOM order — and therefore ARIA reading order — is unchanged.
   */
  @property({ type: Boolean, attribute: 'anchor-closable' })
  accessor anchorClosable = false;

  /**
   * When true, renders an "Add tab" button at the end of the tablist.
   * Dispatches the `vialiq-add` event when clicked.
   */
  @property({ type: Boolean })
  accessor addable = false;

  // ── Internal state ──────────────────────────────────────────────────────────

  /** tab-ids currently hidden in the "More" overflow menu. */
  @state() private accessor _overflowTabIds: string[] = [];

  /** Whether the "More" dropdown is open. */
  @state() private accessor _moreMenuOpen = false;

  /** The physical order of tabs, updated on swap to persist positions. */
  private _visualOrder: string[] = [];

  // ── Internal refs ───────────────────────────────────────────────────────────

  private _tablistEl: HTMLElement | null = null;
  private _indicatorEl: HTMLElement | null = null;
  private _cursorEl: HTMLElement | null = null;
  private _resizeObserver?: ResizeObserver;

  @state() private accessor _isScrollable = false;
  @state() private accessor _isScrollStart = true;
  @state() private accessor _isScrollEnd = false;

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  private static _iconsRegistered = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!ViTabs._iconsRegistered) {
      registerIcons([
        chevronLeftIcon,
        chevronRightIcon,
        plusIcon,
        chevronDownIcon,
      ]);
      ViTabs._iconsRegistered = true;
    }
    this.addEventListener(
      'vi-tab-before-close',
      this._onTabBeforeClose as EventListener,
    );
    // keydown is handled via @keydown on [part="tablist"]
    document.addEventListener('click', this._onDocClick);

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener(
      'vi-tab-select',
      this._onTabSelect as EventListener,
    );
    this.removeEventListener(
      'vi-tab-before-close',
      this._onTabBeforeClose as EventListener,
    );
    document.removeEventListener('click', this._onDocClick);
    this._resizeObserver?.disconnect();
  }

  override firstUpdated(): void {
    this._tablistEl =
      this.shadowRoot?.querySelector('[part="tablist"]') ?? null;
    this._indicatorEl =
      this.shadowRoot?.querySelector('[part="tab-indicator"]') ?? null;
    this._cursorEl =
      this.shadowRoot?.querySelector('[part="tab-cursor"]') ?? null;

    if (this._tablistEl) {
      this._tablistEl.addEventListener('scroll', () =>
        this._updateScrollState(),
      );
    }

    this._resizeObserver = new ResizeObserver(() => {
      this._updateIndicator();
      if (this.overflow === 'menu') this._computeMenuOverflow();
      if (this.overflow === 'scroll') this._updateScrollState();
    });
    this._resizeObserver.observe(this);

    this._syncState();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);

    // If anchorClosable is toggled on, instantly sort the current visual order
    if (changed.has('anchorClosable') && this.anchorClosable) {
      const tabs = this._getTabs();
      this._visualOrder.sort((a, b) => {
        const tabA = tabs.find((t) => t.tabId === a);
        const tabB = tabs.find((t) => t.tabId === b);
        const aVal = tabA?.closable ? 1 : 0;
        const bVal = tabB?.closable ? 1 : 0;
        return aVal - bVal;
      });
    }

    if (
      changed.has('active') ||
      changed.has('orientation') ||
      changed.has('variant') ||
      changed.has('overflow') ||
      changed.has('anchorClosable')
    ) {
      this._syncState();
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private _getTabs(): ViTab[] {
    return Array.from(this.querySelectorAll<ViTab>('vi-tab'));
  }

  private _getPanels(): ViTabPanel[] {
    return Array.from(this.querySelectorAll<ViTabPanel>('vi-tab-panel'));
  }

  private _getEnabledTabs(): ViTab[] {
    return this._getTabs().filter((t) => !t.disabled);
  }

  /** Sync all state: slot assignment, active/ARIA attrs, tabindex, overflow order, indicator. */
  private _syncState(): void {
    const tabs = this._getTabs();
    const panels = this._getPanels();
    const total = tabs.length;

    // ── Auto-assign named slots ─────────────────────────────────────────────
    tabs.forEach((t) => {
      if (t.getAttribute('slot') !== 'tab') t.setAttribute('slot', 'tab');
    });
    panels.forEach((p) => {
      if (p.getAttribute('slot') !== 'panel') p.setAttribute('slot', 'panel');
    });

    // ── Maintain persistent visual order ────────────────────────────────────
    const currentIds = tabs.map((t) => t.tabId);
    this._visualOrder = this._visualOrder.filter((id) =>
      currentIds.includes(id),
    );

    const newTabs = tabs.filter((t) => !this._visualOrder.includes(t.tabId));
    if (newTabs.length > 0) {
      if (this.anchorClosable) {
        const newPinned = newTabs
          .filter((t) => !t.closable)
          .map((t) => t.tabId);
        const newClosable = newTabs
          .filter((t) => t.closable)
          .map((t) => t.tabId);
        let firstClosableIdx = this._visualOrder.findIndex(
          (id) => tabs.find((t) => t.tabId === id)?.closable,
        );
        if (firstClosableIdx === -1)
          firstClosableIdx = this._visualOrder.length;

        this._visualOrder.splice(firstClosableIdx, 0, ...newPinned);
        this._visualOrder.push(...newClosable);
      } else {
        this._visualOrder.push(...newTabs.map((t) => t.tabId));
      }
    }

    // Apply CSS order so the DOM visually matches our array
    tabs.forEach((t) => {
      t.style.order = String(this._visualOrder.indexOf(t.tabId));
    });

    // ── Ensure a valid active tab ───────────────────────────────────────────
    if (!this.active && tabs.length > 0) {
      const first = tabs.find((t) => !t.disabled);
      if (first) this.active = first.tabId;
    }

    // ── Per-tab ARIA + tabindex ─────────────────────────────────────────────
    tabs.forEach((tab, i) => {
      const isActive = tab.tabId === this.active;
      tab.active = isActive;
      tab.posinset = i + 1;
      tab.setsize = total;
      tab.tabIndex = isActive && !tab.disabled ? 0 : -1;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('id', tab.tabId);
      tab.setAttribute('aria-controls', `panel-${tab.tabId}`);
    });

    // ── Panel visibility ────────────────────────────────────────────────────
    panels.forEach((p) => {
      p.active = p.for === this.active;
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('id', `panel-${p.for}`);
      p.setAttribute('aria-labelledby', p.for);
      p.tabIndex = 0;
    });

    // ── Overflow ────────────────────────────────────────────────────────────
    if (this.overflow === 'menu') {
      requestAnimationFrame(() => this._computeMenuOverflow());
    } else if (this.overflow === 'scroll') {
      requestAnimationFrame(() => this._updateScrollState());
    }

    requestAnimationFrame(() => this._updateIndicator());
  }

  // ── Overflow: scroll ─────────────────────────────────────────────────────

  /** Updates the data-scroll-* attributes on the tablist based on current scroll position. */
  private _updateScrollState(): void {
    if (!this._tablistEl || this.overflow !== 'scroll') return;

    const { scrollWidth, clientWidth, scrollLeft } = this._tablistEl;

    // No scroll possible
    if (scrollWidth <= clientWidth) {
      this._tablistEl.setAttribute('data-scroll-none', '');
      this._tablistEl.removeAttribute('data-scroll-start');
      this._tablistEl.removeAttribute('data-scroll-end');
      this._isScrollable = false;
      return;
    }

    this._isScrollable = true;
    this._tablistEl.removeAttribute('data-scroll-none');

    // Scrolled to very start (allow 1px rounding)
    this._isScrollStart = scrollLeft <= 1;
    if (this._isScrollStart) {
      this._tablistEl.setAttribute('data-scroll-start', '');
    } else {
      this._tablistEl.removeAttribute('data-scroll-start');
    }

    // Scrolled to very end (allow 1px rounding)
    this._isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
    if (this._isScrollEnd) {
      this._tablistEl.setAttribute('data-scroll-end', '');
    } else {
      this._tablistEl.removeAttribute('data-scroll-end');
    }
  }

  // ── Overflow: menu (swap) ────────────────────────────────────────────────

  /**
   * Measure which tabs fit in the tablist width and partition them into
   * visible vs overflow arrays. Uses the persistent _visualOrder to decide.
   */
  private _computeMenuOverflow(): void {
    if (!this._tablistEl) return;

    const tabs = this._getTabs();

    // 1. Measure available width BEFORE modifying DOM (to avoid unhidden tabs stretching it)
    const listWidth = this.offsetWidth;
    const MORE_WIDTH = 68; // Reserve px for the "More" button

    // 2. Temporarily clear overflow to measure natural widths of the tabs
    tabs.forEach((t) => t.removeAttribute('data-overflow'));

    let totalTabsWidth = 0;
    const tabWidths = new Map<string, number>();
    for (const t of tabs) {
      const w = t.offsetWidth;
      tabWidths.set(t.tabId, w);
      totalTabsWidth += w;
    }

    // 3. If everything fits natively, clear overflow and return
    if (totalTabsWidth <= listWidth) {
      this._overflowTabIds = [];
      return;
    }

    // 3. Evaluate tabs strictly in their persistent _visualOrder
    const orderedTabs = this._visualOrder.map(
      (id) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tabs.find((t) => t.tabId === id)!,
    );

    const activeTabWidth = this.active ? tabWidths.get(this.active) || 0 : 0;
    const budgetedWidth = listWidth - MORE_WIDTH;
    const overflow: string[] = [];

    // Pre-allocate the active tab's width so it is mathematically guaranteed to fit
    let used = activeTabWidth;

    orderedTabs.forEach((tab) => {
      // The active tab is exempt from the budget check because it was pre-allocated
      if (tab.tabId === this.active) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tw = tabWidths.get(tab.tabId)!;
      // Keep adding to visible until we bust the budget
      if (used + tw <= budgetedWidth) {
        used += tw;
      } else {
        overflow.push(tab.tabId);
        tab.setAttribute('data-overflow', '');
      }
    });

    this._overflowTabIds = overflow;
  }

  /**
   * When a tab from the overflow menu is selected, swap its position
   * in the persistent _visualOrder array with the last visible tab.
   */
  private _swapFromOverflow(tabId: string): void {
    const tabs = this._getTabs();
    const overflowTab = tabs.find((t) => t.tabId === tabId);
    if (!overflowTab) return;

    // Find the last visible tab using our persistent order
    const visibleIds = this._visualOrder.filter(
      (id) => !this._overflowTabIds.includes(id),
    );
    const lastVisibleId = visibleIds[visibleIds.length - 1];

    if (lastVisibleId && lastVisibleId !== tabId) {
      const idxA = this._visualOrder.indexOf(lastVisibleId);
      const idxB = this._visualOrder.indexOf(tabId);

      if (idxA !== -1 && idxB !== -1) {
        // Swap their physical positions in the array
        this._visualOrder[idxA] = tabId;
        this._visualOrder[idxB] = lastVisibleId;

        // Update CSS order for ALL tabs to guarantee correct flex visual rendering
        this._updateVisualOrder();
      }
    }

    this._moreMenuOpen = false;
    this._activateTab(tabId);

    // Explicitly recalculate overflow to apply the new visual order immediately,
    // even if the active tab didn't change
    requestAnimationFrame(() => this._computeMenuOverflow());
  }

  /**
   * Applies the persistent visual order to the physical DOM via CSS order.
   * Flexbox defaults to order: 0, so we must explicitly number every tab.
   */
  private _updateVisualOrder(): void {
    const tabs = this._getTabs();
    tabs.forEach((tab) => {
      const idx = this._visualOrder.indexOf(tab.tabId);
      if (idx !== -1) {
        tab.style.order = String(idx);
      }
    });
  }

  // ── Indicator + cursor positioning ───────────────────────────────────────

  private _updateIndicator(): void {
    if (!this._tablistEl) return;

    const activeTabEl = this._getTabs().find((t) => t.tabId === this.active);
    if (!activeTabEl) {
      if (this._indicatorEl) this._indicatorEl.style.opacity = '0';
      if (this._cursorEl) this._cursorEl.style.opacity = '0';
      return;
    }

    const listRect = this._tablistEl.getBoundingClientRect();
    const tabRect = activeTabEl.getBoundingClientRect();
    const btnEl =
      activeTabEl.shadowRoot?.querySelector<HTMLElement>('[part="tab"]');
    const btnRect = btnEl ? btnEl.getBoundingClientRect() : tabRect;

    if (this.orientation === 'vertical') {
      if (this._indicatorEl) {
        this._indicatorEl.style.top = `${tabRect.top - listRect.top + this._tablistEl.scrollTop}px`;
        this._indicatorEl.style.height = `${tabRect.height}px`;
        this._indicatorEl.style.left = '';
        this._indicatorEl.style.width = '';
        this._indicatorEl.style.opacity = '1';
      }
      if (this._cursorEl) {
        this._cursorEl.style.top = `${tabRect.top - listRect.top + this._tablistEl.scrollTop}px`;
        this._cursorEl.style.height = `${tabRect.height}px`;
        this._cursorEl.style.left = '0';
        this._cursorEl.style.width = '100%';
        this._cursorEl.style.opacity = '1';
      }
    } else {
      if (this._indicatorEl) {
        this._indicatorEl.style.left = `${btnRect.left - listRect.left + this._tablistEl.scrollLeft}px`;
        this._indicatorEl.style.width = `${btnRect.width}px`;
        this._indicatorEl.style.top = '';
        this._indicatorEl.style.height = '';
        this._indicatorEl.style.opacity = '1';
      }
      if (this._cursorEl) {
        this._cursorEl.style.left = `${tabRect.left - listRect.left + this._tablistEl.scrollLeft}px`;
        this._cursorEl.style.width = `${tabRect.width}px`;
        this._cursorEl.style.top = '';
        this._cursorEl.style.height = '';
        this._cursorEl.style.opacity = '1';
      }
    }
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  private _onTabSelect(e: CustomEvent<{ tabId: string }>): void {
    this._activateTab(e.detail.tabId);
  }

  private _onTabBeforeClose = (e: CustomEvent<{ tabId: string }>): void => {
    // vi-tab has already fired vi-tab-before-close; if it was not cancelled by
    // the host app, vi-tab also fires vi-tab-close. We catch vi-tab-before-close
    // here so vi-tabs can handle focus BEFORE the element is removed from DOM.
    const tabId = e.detail.tabId;
    if (e.defaultPrevented) return;

    const tabs = this._getTabs();
    const closingIdx = tabs.findIndex((t) => t.tabId === tabId);

    // Move active to a neighbour if we're closing the active tab
    if (this.active === tabId) {
      const enabledBefore = tabs.slice(0, closingIdx).filter((t) => !t.disabled);
      const enabledAfter = tabs.slice(closingIdx + 1).filter((t) => !t.disabled);
      
      // Prefer tab just before; fall back to tab just after; else nothing
      const prevTab = enabledBefore[enabledBefore.length - 1] ?? enabledAfter[0] ?? null;
      if (prevTab) {
        this._activateTab(prevTab.tabId);
        prevTab.focus();
      }
    }

    // Notify host app — it must remove the vi-tab (and its panel) from the DOM
    this.dispatchEvent(
      new CustomEvent<{ tabId: string }>('vi-tabs-tab-close', {
        detail: { tabId },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _activateTab(toTabId: string): void {
    const tab = this._getTabs().find((t) => t.tabId === toTabId);
    if (!tab || tab.disabled || toTabId === this.active) return;

    const fromTabId = this.active;

    const beforeEvent = new CustomEvent<{ fromTabId: string; toTabId: string }>(
      'vi-tabs-before-change',
      {
        detail: { fromTabId, toTabId },
        bubbles: true,
        composed: true,
        cancelable: true,
      },
    );
    if (!this.dispatchEvent(beforeEvent)) return;

    this.active = toTabId;

    this.dispatchEvent(
      new CustomEvent<{ fromTabId: string; toTabId: string }>(
        'vi-tabs-change',
        {
          detail: { fromTabId, toTabId },
          bubbles: true,
          composed: true,
        },
      ),
    );
  }

  private _onKeydown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement;
    if (!target.closest('vi-tab')) return;

    const enabled = this._getEnabledTabs().filter(
      (t) => !t.hasAttribute('data-overflow'),
    );
    if (enabled.length === 0) return;

    const currentTabEl = (e.target as HTMLElement).closest<ViTab>('vi-tab');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentIndex = enabled.indexOf(currentTabEl!);
    if (currentIndex === -1) return;

    const isHorizontal = this.orientation === 'horizontal';
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
        if (!isHorizontal) return;
        nextIndex = (currentIndex + 1) % enabled.length;
        break;
      case 'ArrowLeft':
        if (!isHorizontal) return;
        nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
        break;
      case 'ArrowDown':
        if (isHorizontal) return;
        nextIndex = (currentIndex + 1) % enabled.length;
        break;
      case 'ArrowUp':
        if (isHorizontal) return;
        nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = enabled.length - 1;
        break;
      case 'Enter':
      case ' ':
        if (this.activation === 'manual') {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this._activateTab(enabled[currentIndex]!.tabId);
        }
        e.preventDefault();
        return;
      default:
        return;
    }

    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const targetTab = enabled[nextIndex]!;

    enabled.forEach((t, i) => {
      t.tabIndex = i === nextIndex ? 0 : -1;
    });
    targetTab.focus();

    if (this.activation === 'automatic') this._activateTab(targetTab.tabId);
  };

  private _onAddClick(): void {
    this.dispatchEvent(
      new CustomEvent('vi-tabs-add', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onDocClick = (e: MouseEvent): void => {
    if (this._moreMenuOpen && !this.contains(e.target as Node)) {
      this._moreMenuOpen = false;
    }
  };

  private _onSlotChange(): void {
    this._syncState();
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private _renderAddButton(): TemplateResult | typeof nothing {
    if (!this.addable) return nothing;
    return html`
      <button
        part="add-button"
        class="vi-tabs__add-btn"
        aria-label="Add tab"
        title="Add tab"
        @click=${this._onAddClick}
      >
        <vi-icon name="plus" size="20" aria-hidden="true"></vi-icon>
      </button>
    `;
  }

  private _renderMoreMenu(): TemplateResult | typeof nothing {
    if (this.overflow !== 'menu' || this._overflowTabIds.length === 0)
      return nothing;

    const overflowTabs = this._getTabs().filter((t) =>
      this._overflowTabIds.includes(t.tabId),
    );

    return html`
      <div class="vi-tabs__more-wrapper">
        <button
          part="more-button"
          class="vi-tabs__more-btn ${this._moreMenuOpen
            ? 'vi-tabs__more-btn--open'
            : ''}"
          aria-haspopup="true"
          aria-expanded=${this._moreMenuOpen ? 'true' : 'false'}
          aria-label="More tabs"
          @click=${() => {
            this._moreMenuOpen = !this._moreMenuOpen;
          }}
        >
          More
          <vi-icon
            class="vi-tabs__more-chevron"
            name="chevron-down"
            size="12"
            aria-hidden="true"
          ></vi-icon>
        </button>

        ${this._moreMenuOpen
          ? html` <div
              part="more-menu"
              class="vi-tabs__more-menu"
              role="menu"
              aria-label="Overflow tabs"
            >
              ${repeat(
                overflowTabs,
                (t) => t.tabId,
                (t) => html`
                  <button
                    class="vi-tabs__more-item ${t.tabId === this.active
                      ? 'vi-tabs__more-item--active'
                      : ''}"
                    role="menuitem"
                    ?disabled=${t.disabled}
                    @click=${() => this._swapFromOverflow(t.tabId)}
                  >
                    ${t.textContent?.trim()}
                  </button>
                `,
              )}
            </div>`
          : nothing}
      </div>
    `;
  }

  private _renderScrollArrow(
    dir: 'left' | 'right',
  ): TemplateResult | typeof nothing {
    if (this.overflow !== 'scroll' || !this._isScrollable) return nothing;
    const isLeft = dir === 'left';
    const disabled = isLeft ? this._isScrollStart : this._isScrollEnd;

    return html`
      <button
        class="vi-tabs__scroll-btn vi-tabs__scroll-btn--${dir}"
        aria-hidden="true"
        tabindex="-1"
        ?disabled=${disabled}
        @click=${() =>
          this._tablistEl?.scrollBy({
            left: isLeft ? -150 : 150,
            behavior: 'smooth',
          })}
      >
        <vi-icon name="chevron-${dir}" size="16" aria-hidden="true"></vi-icon>
      </button>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  override render(): TemplateResult {
    const hostClasses = {
      'vi-tabs': true,
      [`vi-tabs--${this.variant}`]: true,
      [`vi-tabs--${this.orientation}`]: true,
      [`vi-tabs--overflow-${this.overflow}`]: true,
    };

    return html`
      <div class=${classMap(hostClasses)}>
        ${this._renderScrollArrow('left')}
        <div
          part="tablist"
          class="vi-tabs__tablist"
          @keydown=${this._onKeydown}
        >
          <span
            part="tab-cursor"
            class="vi-tabs__cursor"
            aria-hidden="true"
          ></span>

          <div
            role="tablist"
            aria-orientation=${this.orientation}
            style="display: contents;"
          >
            <slot name="tab" @slotchange=${this._onSlotChange}></slot>
          </div>

          <span
            part="tab-indicator"
            class="vi-tabs__indicator"
            aria-hidden="true"
          ></span>

          ${this._renderAddButton()} ${this._renderMoreMenu()}
        </div>
        ${this._renderScrollArrow('right')}
        <slot name="panel"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-tabs': ViTabs;
  }
}
