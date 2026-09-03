import {
  css,
  html,
  unsafeCSS,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { FocusableMixin } from '../base/focusable-mixin.js';
import { ValidityMixin } from '../base/validity-mixin.js';
import { ViElement } from '../base/vi-element.js';
import { ifNonEmpty } from '../base/if-non-empty.js';
import selectStyles from './vi-select.scss?inline';
import '../icons/vi-icon.js';
import { registerIcons } from '../icons/registry.js';
import { chevronDownIcon, xIcon } from '@vialiq/icons';

import { FloatingController } from '../base/controllers/floating-controller.js';
import { ListboxKeyboardController } from '../shared/controllers/keyboard-controller.js';
import type {
  SlottedListboxItem,
  ListboxOption,
} from '../shared/types/listbox.types.js';
import type { DropdownPlacement } from '../combobox/vi-combobox.types.js';
import type { Placement } from '@floating-ui/dom';

import './vi-select-option.js';
import './vi-select-group.js';

// Register internally used icons so consumers do not need to do this explicitly.
registerIcons([chevronDownIcon, xIcon]);

/**
 * vi-select
 * Form-associated single-choice select control.
 *
 * @element vi-select
 * 
 * @fires {CustomEvent<{value:string; label:string}>} vi-select-change - Fires when selection changes
 * @fires {CustomEvent<void>} vi-select-clear - Fires when selection is cleared
 */
@customElement('vi-select')
export class ViSelect extends ValidityMixin(FocusableMixin(ViElement)) {
  static override styles = css`
    ${unsafeCSS(selectStyles)}
  `;

  @property({
    attribute: 'match-width',
    converter: {
      fromAttribute: (v: string | null) => v !== null && v !== 'false',
    },
  })
  accessor matchWidth = true;

  // ── Public API ─────────────────────────────────────────────────────────────
  @property({ type: String, reflect: true }) accessor value = '';
  @property() accessor name = '';
  @property() accessor placeholder = 'Select...';
  @property({ type: Boolean, reflect: true }) accessor disabled = false;
  @property({ type: Boolean }) accessor clearable = false;
  @property({ attribute: 'aria-label' }) accessor ariaLabel = '';

  @property({ type: Boolean, attribute: 'wrap-text' }) accessor wrapText =
    false;

  @property({ type: Boolean, reflect: true }) accessor open = false;
  @property({ type: String }) accessor placement: DropdownPlacement =
    'bottom-start';
  @property({ type: Boolean }) accessor hoist = true;
  @property({ type: String, attribute: 'flip-boundary' })
  accessor flipBoundary = '';
  @property({ attribute: false })
  accessor flipBoundaryElement: HTMLElement | null = null;

  // ── Internal State ─────────────────────────────────────────────────────────
  private _listboxId = `listbox-${Math.random().toString(36).substring(2, 11)}`;
  private _optionIdMap = new Map<string, string>();

  private _getOptionId(value: string): string {
    if (!this._optionIdMap.has(value)) {
      this._optionIdMap.set(
        value,
        `opt-${Math.random().toString(36).substring(2, 11)}`,
      );
    }
    return this._optionIdMap.get(value) ?? '';
  }
  @state() private accessor _selectedLabel = '';
  @state() private accessor _activeIndex = -1;
  @state() private accessor _slottedItems: SlottedListboxItem[] = [];

  @query('.select-trigger') private accessor _triggerEl!: HTMLDivElement | null;
  @query('.select-listbox') private accessor _listboxEl!: HTMLDivElement | null;

  private _slotMutationObserver: MutationObserver | null = null;
  @state() private accessor _typeAheadString = '';

  protected override get _focusableElement(): HTMLElement | null {
    return this._triggerEl;
  }

  // ── Controllers ────────────────────────────────────────────────────────────

  private _floatingController = new FloatingController(this, {
    reference: () => this._triggerEl,
    floating: () => this._listboxEl,
    placement: () => this.placement as unknown as Placement,
    offset: 4,
    hoist: () => this.hoist,
    boundary: () => this.flipBoundaryElement || this.flipBoundary || null,
    matchWidth: () => this.matchWidth,
  });

  private _keyboardController = new ListboxKeyboardController<unknown>(this, {
    getActiveIndex: () => this._activeIndex,
    setActiveIndex: (index: number) => {
      this._activeIndex = index;
    },
    getFilteredOptions: () => [], // No options prop array yet
    getSlottedItems: () => this._slottedItems,
    getVisibleSlottedItems: () => this._slottedItems.filter((i) => !i.hidden),
    getSelectedValues: () => (this.value ? [this.value] : []),
    updateSlottedActiveState: (index: number) =>
      this._updateSlottedActiveState(index),
    scrollToActiveIndex: () => this._scrollToActiveIndex(),
    selectOption: (opt: ListboxOption<unknown>) => this._selectOption(opt),
    handleCreate: () => {
      /* no-op */
    },
    removeTag: () => {
      /* no-op */
    },
    close: () => {
      this.open = false;
    },
    openDropdown: () => {
      this.open = true;
    },
    getQuery: () => '',
    onTypeAheadChange: (str: string) => {
      this._typeAheadString = str;
      this._syncHighlightToOptions();
    },
  });

  private _syncHighlightToOptions(): void {
    this._slottedItems.forEach((item) => {
      (item as unknown as { highlightText: string }).highlightText =
        this._typeAheadString;
    });
  }

  // Provide properties required by ListboxKeyboardControllerHost
  get isSearchable() {
    return false;
  }
  get mode() {
    return 'single' as const;
  }

  // ── ValidityMixin hook ─────────────────────────────────────────────────────

  protected _testValidity(): Partial<ValidityStateFlags> {
    if (this._internals.validity.customError) {
      return { customError: true };
    }
    if (this.required && !this.value) {
      const temp = document.createElement('select');
      temp.required = true;
      this.validityMessage = temp.validationMessage;
      return { valueMissing: true };
    }
    return {};
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeyDown);
    this.addEventListener(
      'vi-select-item-select',
      this._handleSlottedItemSelect as EventListener,
    );
    document.addEventListener('click', this._handleOutsideClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeyDown);
    this.removeEventListener(
      'vi-select-item-select',
      this._handleSlottedItemSelect as EventListener,
    );
    document.removeEventListener('click', this._handleOutsideClick);
    if (this._slotMutationObserver) this._slotMutationObserver.disconnect();
    this._floatingController.stop();
  }

  private _defaultValue = '';

  protected override firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    this._defaultValue = this.getAttribute('value') ?? '';
    this._observeSlottedItems();
  }

  formResetCallback(): void {
    this.value = this._defaultValue;
    super.formResetCallback();
  }

  override willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has('value')) {
      this._internals.setFormValue(this.value || null);
      this._syncSlottedSelectedState();
      this._syncSelectedLabel();
    }

    if (changedProperties.has('open')) {
      if (this.open) {
        if (this.disabled) {
          this.open = false;
        } else {
          if (this.value) {
            const idx = this._slottedItems
              .filter((i) => !i.hidden)
              .findIndex((i) => i.value === this.value);
            this._activeIndex = idx;
          } else {
            this._activeIndex = -1;
          }
        }
      } else {
        this._activeIndex = -1;
        this._typeAheadString = '';
      }
    }
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('wrapText')) {
      for (const item of this._slottedItems) {
        if ('wrapText' in item) {
          (item as unknown as { wrapText: boolean }).wrapText = this.wrapText;
        }
      }
    }

    if (changedProperties.has('disabled')) {
      this._setHostFocusable(!this.disabled);
    }

    if (changedProperties.has('open') && this.open !== changedProperties.get('open')) {
      if (this.open) {
        this._floatingController.start();
        if (this.value && this._activeIndex >= 0) {
          this._updateSlottedActiveState(this._activeIndex);
          this._scrollToActiveIndex();
        }
      } else {
        this._floatingController.stop();
        // Only focus if the select isn't disabled
        if (!this.disabled) {
          this._triggerEl?.focus();
        }
        window.clearTimeout(this._typeaheadTimeout);
        this._typeaheadBuffer = '';
        this._syncHighlightToOptions();
      }
    }
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  // ── Internal Methods ───────────────────────────────────────────────────────

  private _observeSlottedItems(): void {
    const slot = this.shadowRoot?.querySelector(
      'slot:not([name])',
    ) as HTMLSlotElement | null;
    if (!slot) return;

    const updateItems = () => {
      const assigned = slot.assignedElements({ flatten: true });
      const items: SlottedListboxItem[] = [];

      const collectOptions = (elements: Element[]) => {
        for (const el of elements) {
          if (el.tagName.toLowerCase() === 'vi-select-option') {
            items.push(el as unknown as SlottedListboxItem);
          } else if (el.tagName.toLowerCase() === 'vi-select-group') {
            collectOptions(Array.from(el.children));
          }
        }
      };

      collectOptions(assigned);
      this._slottedItems = items;

      // Sync initial properties to children
      for (const item of this._slottedItems) {
        if (item.value) {
          if (item.id) {
            this._optionIdMap.set(item.value, item.id);
          } else {
            item.id = this._getOptionId(item.value);
          }
        }
        (item as unknown as { wrapText: boolean }).wrapText = this.wrapText;
        (item as unknown as { highlightText: string }).highlightText =
          this._typeAheadString;
      }

      this._syncSlottedSelectedState();
      this._syncSelectedLabel();
    };

    updateItems();
    this._slotMutationObserver = new MutationObserver(() => updateItems());
    this._slotMutationObserver.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['value', 'label', 'disabled'],
    });
  }

  private _syncSlottedSelectedState(): void {
    for (const item of this._slottedItems) {
      item.selected = item.value === this.value;
    }
  }

  private _syncSelectedLabel(): void {
    const selectedItem = this._slottedItems.find(
      (item) => item.value === this.value,
    );
    if (selectedItem) {
      this._selectedLabel =
        selectedItem.label || selectedItem.textContent?.trim() || '';
    } else {
      this._selectedLabel = '';
    }
  }

  private _updateSlottedActiveState(activeIndex: number): void {
    const visible = this._slottedItems.filter((i) => !i.hidden);
    visible.forEach((item, i) => {
      item.active = i === activeIndex;
    });
  }

  private async _scrollToActiveIndex(): Promise<void> {
    await this.updateComplete;
    if (this._activeIndex < 0) return;
    const activeItem = this._slottedItems[
      this._activeIndex
    ] as unknown as HTMLElement;
    if (activeItem && typeof activeItem.scrollIntoView === 'function') {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  private _handleSlottedItemSelect = (
    e: CustomEvent<{ item: SlottedListboxItem }>,
  ): void => {
    e.stopPropagation();
    const item = e.detail.item;
    this._selectOption({
      value: item.value,
      label: item.label || item.value,
      disabled: item.disabled,
      data: item.data,
    });
  };

  private _selectOption(opt: ListboxOption<unknown>): void {
    if (opt.disabled) return;
    this.value = opt.value;
    this.close();

    this.dispatchEvent(
      new CustomEvent<{ value: string; label: string }>('vi-select-change', {
        detail: { value: this.value, label: opt.label },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _typeaheadBuffer = '';
  private _typeaheadTimeout = -1;

  private _handleKeyDown = (e: KeyboardEvent): void => {
    if (this.disabled) return;

    if (
      this.open &&
      e.key !== ' ' &&
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      this._typeaheadBuffer += e.key.toLowerCase();

      window.clearTimeout(this._typeaheadTimeout);
      this._typeaheadTimeout = window.setTimeout(() => {
        // Only clear the navigation buffer — do NOT clear the highlight here.
        // Highlight persists while dropdown is open and is cleared on close.
        this._typeaheadBuffer = '';
      }, 1000);

      // Sync highlight text so options visually highlight the typed query
      this._typeAheadString = this._typeaheadBuffer;
      this._syncHighlightToOptions();

      const visible = this._slottedItems.filter(
        (i) => !i.hidden && !i.disabled,
      );

      // Start searching from next index if repeating the same char, or current index if not
      const startIndex = this._activeIndex >= 0 ? this._activeIndex : 0;
      let matchIdx = -1;

      // Look forward
      for (let i = 1; i <= visible.length; i++) {
        const checkIdx = (startIndex + i) % visible.length;
        const itemLabel = (
          visible[checkIdx].label ||
          visible[checkIdx].textContent ||
          ''
        )
          .trim()
          .toLowerCase();

        if (itemLabel.startsWith(this._typeaheadBuffer)) {
          matchIdx = checkIdx;
          break;
        }
      }

      if (matchIdx >= 0) {
        this._activeIndex = matchIdx;
        this._updateSlottedActiveState(matchIdx);
        this._scrollToActiveIndex();
      }
      return;
    }

    this._keyboardController.handleKeyDown(e);
  };

  private _handleOutsideClick = (e: MouseEvent): void => {
    if (this.open && !e.composedPath().includes(this)) {
      this.close();
    }
  };

  private _onClear(e: Event): void {
    e.stopPropagation();
    e.preventDefault();
    if (this.disabled) return;
    this.clear();
  }

  private _toggleOpen(e: Event): void {
    if (this.disabled) return;

    // Prevent toggle if clicking clear button
    const path = e.composedPath();
    const isClearBtn = path.some((el) =>
      (el as HTMLElement).part?.contains('clear-btn'),
    );
    if (isClearBtn) return;

    this.open = !this.open;
  }

  // ── Public Imperative Methods ──────────────────────────────────────────────

  public toggle(): void {
    if (this.disabled) return;
    this.open = !this.open;
  }

  public show(): void {
    if (this.disabled || this.open) return;
    this.open = true;
  }

  public close(): void {
    if (!this.open) return;
    this.open = false;
  }

  public clear(): void {
    if (!this.value) return;
    this.value = '';
    this._selectedLabel = '';

    this.dispatchEvent(
      new CustomEvent<void>('vi-select-clear', {
        bubbles: true,
        composed: true,
      }),
    );

    this.dispatchEvent(
      new CustomEvent<{ value: string; label: string }>('vi-select-change', {
        detail: { value: '', label: '' },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  override render(): TemplateResult {
    const hasSelection = !!this.value;

    return html`
      <div class="select-field">
        <div
          class="select-wrapper ${this.status === 'invalid'
            ? 'is-invalid'
            : this.status === 'valid'
              ? 'is-valid'
              : ''}"
          part="wrapper"
        >
          <!-- Visual trigger element -->
          <div
            part="trigger"
            class="select-trigger ${hasSelection ? '' : 'is-placeholder'} ${this
              .disabled
              ? 'is-disabled'
              : ''}"
            tabindex=${this.disabled ? '-1' : '0'}
            aria-haspopup="listbox"
            aria-expanded=${this.open ? 'true' : 'false'}
            aria-controls=${this._listboxId}
            aria-activedescendant=${this.open &&
            this._activeIndex >= 0 &&
            this._slottedItems[this._activeIndex]
              ? this._getOptionId(this._slottedItems[this._activeIndex].value)
              : ''}
            aria-label=${ifNonEmpty(this.ariaLabel || this.placeholder)}
            aria-invalid=${this.status === 'invalid' ? 'true' : 'false'}
            aria-describedby=${this.validityMessage
              ? 'helper-text validation-message'
              : 'helper-text'}
            aria-errormessage=${ifNonEmpty(
              this.status === 'invalid' && this.validityMessage
                ? 'validation-message'
                : '',
            )}
            @click=${this._toggleOpen}
            title=${hasSelection ? this._selectedLabel : ''}
          >
            <div class="select-label-container">
              <span part="label" class="select-label">
                ${hasSelection ? this._selectedLabel : this.placeholder}
              </span>
              <div class="select-measurer" aria-hidden="true">
                <span>${this.placeholder}</span>
                ${this._slottedItems.map(
                  (item) =>
                    html`<span
                      >${item.label || item.textContent?.trim() || ''}</span
                    >`,
                )}
              </div>
            </div>
            <div class="select-icons">
              <button
                part="clear-btn"
                class="select-clear-btn"
                type="button"
                tabindex="-1"
                ?hidden=${!this.clearable || !hasSelection}
                @click=${this._onClear}
                aria-label="Clear selection"
              >
                <vi-icon name="x" size="14"></vi-icon>
              </button>
              <vi-icon
                name="chevron-down"
                class="select-chevron"
                part="chevron"
                size="16"
              ></vi-icon>
            </div>
          </div>

          <!-- Floating Listbox Dropdown -->
          <div
            id=${this._listboxId}
            part="listbox"
            class="select-listbox"
            role="listbox"
            ?hidden=${!this.open}
          >
            <slot></slot>
          </div>
        </div>

        <span id="helper-text" class="select-helper" part="helper">
          <slot name="helper"></slot>
        </span>
        <span
          id="validation-message"
          class="select-validation ${this.status === 'invalid'
            ? 'is-invalid'
            : this.status === 'valid'
              ? 'is-valid'
              : ''}"
          part="validation"
          role="alert"
          aria-live="polite"
          ?hidden=${!this.validityMessage}
        >
          ${this.validityMessage}
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-select': ViSelect;
  }
}
