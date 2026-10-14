import {
  css,
  html,
  nothing,
  unsafeCSS,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import '../icons/vi-icon.js';
import { registerIcons } from '../icons/registry.js';
import { plusIcon, xIcon } from '@vialiq/icons';
import floatButtonStyles from './vi-float-button.scss?inline';
import { ViFloatButton, type FloatButtonShape } from './vi-float-button.js';

registerIcons([plusIcon, xIcon]);

export type FloatButtonGroupTrigger = 'click' | 'hover';

/**
 * vi-float-button-group
 * Speed-dial cluster container for multiple floating action buttons.
 *
 * @element vi-float-button-group
 * @attr shape - Geometry shape inherited by children: circle | square (default: circle)
 * @attr trigger - Interaction mode to expand menu: click | hover (default: hover)
 * @attr open - Expanded menu state
 * @attr close-icon - Icon name or fallback when menu is expanded
 *
 * @slot - Child <vi-float-button> items
 * @slot icon - Trigger icon (collapsed state)
 * @slot close-icon - Custom close icon (expanded state)
 * @slot description - Trigger description label
 *
 * @csspart group - Group container
 * @csspart trigger - Main toggle trigger button
 * @csspart menu - Speed dial menu container
 *
 * @fires vi-float-button-open-change - Dispatched when menu open state changes
 */
@customElement('vi-float-button-group')
export class ViFloatButtonGroup extends ViElement {
  static override styles = css`
    ${unsafeCSS(floatButtonStyles)}
  `;

  /** Geometry shape passed to child buttons. */
  @property({ type: String, reflect: true })
  accessor shape: FloatButtonShape = 'circle';

  /** Interaction trigger mode. */
  @property({ type: String, reflect: true })
  accessor trigger: FloatButtonGroupTrigger = 'hover';

  /** Expanded state. */
  @property({ type: Boolean, reflect: true })
  accessor open = false;

  /** Icon displayed on the trigger button when expanded. */
  @property({ type: String, reflect: true, attribute: 'close-icon' })
  accessor closeIcon = 'x';

  /** Accessible label for the group. */
  @property({ attribute: 'aria-label' })
  override accessor ariaLabel: string | null = null;

  @state() private accessor _hasSlottedIcon = false;
  @state() private accessor _hasSlottedCloseIcon = false;

  /**
   * When true, the next `updated()` cycle will focus the first menu item.
   * This avoids calling focus() before Lit has reflected the [open] attribute
   * (which controls CSS visibility).
   */
  private _pendingFocusOnOpen = false;

  /**
   * Tracks previously assigned menu items so that when a child is removed from the
   * group (or on group teardown), its standalone state can be restored.
   */
  private _previousMenuItems: ViFloatButton[] = [];

  private _restoreChild(item: ViFloatButton): void {
    item.inGroup = false;
    item.tabbable = true;
    (item as unknown as { _savedTabIndex?: number })._savedTabIndex =
      item.disabled ? -1 : 0;
    item.tabIndex = item.disabled ? -1 : 0;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeyDown, true);
    if (this.hasUpdated) {
      this._syncChildrenProps();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeyDown, true);
    this._previousMenuItems.forEach((item) => {
      this._restoreChild(item);
    });
    this._previousMenuItems = [];
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('open')) {
      // On close: return focus to trigger if it was inside a menu item
      if (
        !this.open &&
        this._getAllMenuItems().some((item) => item.matches(':focus-within'))
      ) {
        const triggerBtn = this.shadowRoot?.querySelector(
          '.float-button-group__trigger',
        ) as ViFloatButton | null;
        triggerBtn?.focus();
      }

      this._updateTabbableItems();

      // On open: focus the first item above trigger once the child has rendered.
      // visibility flips instantly (no CSS transition), so we only need
      // the child's inner <button> to have tabindex="0" before calling focus().
      if (this.open && this._pendingFocusOnOpen) {
        this._pendingFocusOnOpen = false;
        const items = this._getMenuItems();
        const activeItem = items[items.length - 1];
        if (activeItem) {
          this._setActiveItem(activeItem);
          void (async () => {
            await activeItem.updateComplete;
            if (!this.open) return;
            activeItem.focus({ focusVisible: true });
          })();
        }
      }

      const oldOpen = changedProperties.get('open');
      if (oldOpen !== undefined && oldOpen !== this.open) {
        this.dispatchEvent(
          new CustomEvent('vi-float-button-open-change', {
            bubbles: true,
            composed: true,
            detail: { open: this.open },
          }),
        );
      }
    }

    if (changedProperties.has('shape')) {
      this._syncChildrenProps();
    }
  }

  private _syncChildrenProps(): void {
    const currentItems = this._getAllMenuItems();

    // Restore standalone state on children removed from the group
    const removedItems = this._previousMenuItems.filter(
      (prev) => !currentItems.includes(prev),
    );
    removedItems.forEach((item) => {
      this._restoreChild(item);
    });

    currentItems.forEach((item) => {
      item.inGroup = true;
      if (!item.hasAttribute('shape')) {
        item.shape = this.shape;
      }
    });

    this._previousMenuItems = [...currentItems];
    this._updateTabbableItems();
  }

  private _getAllMenuItems(): ViFloatButton[] {
    const slot = this.shadowRoot?.querySelector(
      '.float-button-group__menu slot:not([name])',
    ) as HTMLSlotElement | null;
    if (!slot) return [];

    return slot
      .assignedElements()
      .filter((el): el is ViFloatButton => el instanceof ViFloatButton);
  }

  private _getMenuItems(): ViFloatButton[] {
    return this._getAllMenuItems().filter((el) => !el.disabled);
  }

  private _updateTabbableItems(): void {
    const allItems = this._getAllMenuItems();
    if (!this.open) {
      allItems.forEach((item) => {
        item.tabbable = false;
        item.tabIndex = -1;
      });
      return;
    }

    const enabledItems = this._getMenuItems();
    if (!enabledItems.length) {
      allItems.forEach((item) => {
        item.tabbable = false;
        item.tabIndex = -1;
      });
      return;
    }

    const focusedItem = enabledItems.find((item) =>
      item.matches(':focus-within'),
    );
    const activeItem = focusedItem ?? enabledItems[enabledItems.length - 1];
    this._setActiveItem(activeItem);
  }

  private _setActiveItem(activeItem?: ViFloatButton): void {
    const allItems = this._getAllMenuItems();
    allItems.forEach((item) => {
      const isTabbable = this.open && item === activeItem && !item.disabled;
      item.tabbable = isTabbable;
      item.tabIndex = isTabbable ? 0 : -1;
    });
  }

  private _handleFocusIn = (event: FocusEvent): void => {
    if (!this.open) return;
    const path = event.composedPath();
    const item = path.find(
      (el): el is ViFloatButton => el instanceof ViFloatButton,
    );
    const triggerBtn = this.shadowRoot?.querySelector(
      '.float-button-group__trigger',
    );
    if (item && item !== triggerBtn && !item.disabled) {
      this._setActiveItem(item);
    }
  };

  private _handleSlotChange(): void {
    this._syncChildrenProps();
  }

  private _handleTriggerClick(event: CustomEvent): void {
    const originalEvent = (
      event.detail as { originalEvent?: UIEvent } | undefined
    )?.originalEvent;
    const isKeyboard =
      !originalEvent ||
      originalEvent instanceof KeyboardEvent ||
      originalEvent.detail === 0;

    if (this.trigger === 'click' || isKeyboard) {
      event.stopPropagation();
      this.open = !this.open;
      if (this.open) {
        this._pendingFocusOnOpen = true;
      }
    }
  }

  private _handleMouseEnter(): void {
    if (this.trigger === 'hover' && !this.open) {
      this._pendingFocusOnOpen = true;
      this.open = true;
    }
  }

  private _handleMouseLeave(): void {
    if (this.trigger === 'hover') {
      this.open = false;
    }
  }

  private _handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.open) {
      event.preventDefault();
      this.open = false;
      const triggerBtn = this.shadowRoot?.querySelector(
        '.float-button-group__trigger',
      ) as ViFloatButton | null;
      triggerBtn?.focus();
      return;
    }

    if (!this.open) {
      if (
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown'
      ) {
        const triggerBtn = this.shadowRoot?.querySelector(
          '.float-button-group__trigger',
        ) as ViFloatButton | null;
        const isTrigger =
          event.target === this ||
          event.target === triggerBtn ||
          triggerBtn?.matches(':focus-within');

        if (isTrigger) {
          event.preventDefault();
          this._pendingFocusOnOpen = true;
          this.open = true;
          return;
        }
      }
      return;
    }

    if (this.open) {
      const items = this._getMenuItems();
      if (!items.length) return;

      if (event.key === 'Home') {
        event.preventDefault();
        const nextItem = items[0];
        this._setActiveItem(nextItem);
        nextItem?.focus();
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        const nextItem = items[items.length - 1];
        this._setActiveItem(nextItem);
        nextItem?.focus();
        return;
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        const activeIndex = items.findIndex((item) =>
          item.matches(':focus-within'),
        );
        let nextIndex = 0;

        if (event.key === 'ArrowUp') {
          nextIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
        } else {
          nextIndex =
            activeIndex >= items.length - 1 || activeIndex === -1
              ? 0
              : activeIndex + 1;
        }

        const nextItem = items[nextIndex];
        this._setActiveItem(nextItem);
        nextItem?.focus();
      }
    }
  };

  private _handleIconSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    this._hasSlottedIcon = slot.assignedElements().length > 0;
  }

  private _handleCloseIconSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    this._hasSlottedCloseIcon = slot.assignedElements().length > 0;
  }

  private _renderTriggerIcon(): TemplateResult {
    if (this.open) {
      const closeIconName = this.closeIcon?.trim() || 'x';
      return html`
        <slot
          name="close-icon"
          slot="icon"
          @slotchange="${this._handleCloseIconSlotChange}"
        >
          ${!this._hasSlottedCloseIcon
            ? html`<vi-icon
                name="${closeIconName}"
                class="default-icon"
              ></vi-icon>`
            : nothing}
        </slot>
      `;
    }

    return html`
      <slot name="icon" slot="icon" @slotchange="${this._handleIconSlotChange}">
        ${!this._hasSlottedIcon
          ? html`<vi-icon name="plus" class="default-icon"></vi-icon>`
          : nothing}
      </slot>
    `;
  }

  override render(): TemplateResult {
    return html`
      <div
        class="float-button-group"
        part="group"
        role="group"
        aria-label="${this.ariaLabel ?? 'Speed dial actions'}"
        @mouseenter="${this._handleMouseEnter}"
        @mouseleave="${this._handleMouseLeave}"
      >
        <div
          class="float-button-group__menu"
          part="menu"
          role="menu"
          aria-hidden="${!this.open}"
          @focusin="${this._handleFocusIn}"
        >
          <slot @slotchange="${this._handleSlotChange}"></slot>
        </div>

        <vi-float-button
          class="float-button-group__trigger"
          part="trigger"
          .shape="${this.shape}"
          in-group
          aria-haspopup="menu"
          aria-expanded="${this.open}"
          .ariaHasPopup="${'menu'}"
          .ariaExpanded="${this.open ? 'true' : 'false'}"
          aria-label="${this.ariaLabel ?? 'Speed dial actions'}"
          @vi-float-button-click="${this._handleTriggerClick}"
        >
          ${this._renderTriggerIcon()}
          <slot name="description" slot="description"></slot>
        </vi-float-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-float-button-group': ViFloatButtonGroup;
  }
}
