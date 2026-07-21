import { css, html, unsafeCSS, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import { ValidityMixin } from '../base/validity-mixin.js';
import type { ViChip } from './vi-chip.js';
import groupStyles from './vi-chip-group.scss?inline';

/**
 * vi-chip-group
 * Manages a set of vi-chip children as a multiselect (or single-select) control.
 *
 * @element vi-chip-group
 * @attr value     - Currently selected chip values
 * @attr multi     - Allow multiple selections (default: true)
 * @attr name      - Form field name
 * @attr required  - At least one chip must be selected
 * @attr disabled  - Disable all chips
 * @attr wrap      - Chips wrap to next line (default: true)
 * @attr gap       - Gap between chips (default: '8px')
 *
 * @slot           - vi-chip elements
 *
 * @csspart group  - The <div> role="listbox" wrapper
 *
 * @fires vialiq-change - Fired when the selection changes
 * @fires invalid       - Fired when checkValidity() fails (cancelable)
 */
@customElement('vi-chip-group')
export class ViChipGroup extends ValidityMixin<string[]>(ViElement) {
  static styles = css`${unsafeCSS(groupStyles)}`;

  /** Currently selected chip values. */
  @property({ type: Array }) accessor value: string[] = [];

  /** Allow multiple selections. */
  @property({ type: Boolean }) accessor multi = true;

  /** Form field name. */
  @property({ type: String }) accessor name = '';

  /** At least one chip must be selected. */
  @property({ type: Boolean, reflect: true }) override accessor required = false;

  /** Disable all chips. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Chips wrap to next line. */
  @property({ type: Boolean }) accessor wrap = true;

  /** Gap between chips. */
  @property({ type: String }) accessor gap = '8px';

  @queryAssignedElements({ selector: 'vi-chip' })
  private accessor _chips!: ViChip[];

  private _mutationObserver: MutationObserver;

  constructor() {
    super();
    this._mutationObserver = new MutationObserver(() => this._syncChips());
    this.addEventListener('vialiq-select', this._handleChipSelect as EventListener);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._syncInternals();
    this._syncChips();
  }

  override firstUpdated(changed: PropertyValues): void {
    super.firstUpdated(changed);
    this._syncChips();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._mutationObserver.disconnect();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);

    if (changed.has('value') || changed.has('name')) {
      this._syncInternals();
      this._syncChips();
    }

    if (changed.has('disabled')) {
      this._syncChips();
    }
  }

  override formResetCallback(): void {
    this.value = [];
    super.formResetCallback();
  }

  protected override _testValidity(): Partial<ValidityStateFlags> {
    if (this.required && this.value.length === 0) {
      return { valueMissing: true };
    }
    return {};
  }

  /** Selects all available child chips (if multi is true) */
  selectAll(): void {
    if (!this.multi || !this._chips?.length) return;
    this.value = this._chips.map(chip => chip.value).filter(val => val !== undefined);
    this.dispatchEvent(new CustomEvent('vialiq-change', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  /** Deselects all child chips */
  clearAll(): void {
    this.value = [];
    this.dispatchEvent(new CustomEvent('vialiq-change', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  private _syncInternals(): void {
    if (this.name && this.name.trim().length > 0) {
      const formData = new FormData();
      this.value.forEach(val => formData.append(this.name, val));
      this._internals.setFormValue(formData);
    } else {
      this._internals.setFormValue(null);
    }
  }

  private _syncChips(): void {
    const chips = (this._chips && this._chips.length > 0)
      ? this._chips
      : Array.from(this.querySelectorAll<ViChip>('vi-chip'));

    if (chips.length === 0) return;

    let hasFocusable = false;

    chips.forEach(chip => {
      chip.selected = this.value.includes(chip.value);
      if (this.disabled) {
        chip.disabled = true;
      } else {
        chip.disabled = chip.isSelfDisabled;
      }

      // Roving tabindex: Only the first selected chip (or the first chip if none selected) is focusable
      if (!chip.disabled && (chip.selected || (!hasFocusable && this.value.length === 0))) {
        chip.tabIndex = 0;
        hasFocusable = true;
      } else {
        chip.tabIndex = -1;
      }
    });

    // If no chip was focusable yet (e.g. none selected), make the first non-disabled chip focusable
    if (!hasFocusable && chips.length > 0) {
      const firstEnabled = chips.find(c => !c.disabled);
      if (firstEnabled) firstEnabled.tabIndex = 0;
    }
  }

  private _handleSlotChange(): void {
    this._syncChips();

    // Disconnect old, connect new observers for child mutations
    this._mutationObserver.disconnect();
    this._chips.forEach(chip => {
      this._mutationObserver.observe(chip, { attributes: true, attributeFilter: ['value', 'disabled'] });
    });
  }

  private _handleChipSelect(e: CustomEvent<{ value: string; selected: boolean }>): void {
    e.stopPropagation(); // Stop the inner event
    const { value, selected } = e.detail;

    let newValue = [...this.value];

    if (this.multi) {
      if (selected) {
        if (!newValue.includes(value)) newValue.push(value);
      } else {
        newValue = newValue.filter(v => v !== value);
      }
    } else {
      if (selected) {
        newValue = [value];
      } else {
        // In single select, clicking a selected chip could deselect it depending on requirements.
        // Assuming it toggles.
        newValue = [];
      }
    }

    this.value = newValue;
    this.dispatchEvent(new CustomEvent('vialiq-change', { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    const focusableChips = this._chips.filter(c => !c.disabled);
    if (focusableChips.length === 0) return;

    const currentIndex = focusableChips.findIndex(c => c === document.activeElement || c.shadowRoot?.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % focusableChips.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = (currentIndex - 1 + focusableChips.length) % focusableChips.length;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = focusableChips.length - 1;
        break;
      default:
        return; // Let other keys do their thing
    }

    this._chips.forEach(c => c.tabIndex = -1);
    const nextChip = focusableChips[nextIndex];
    nextChip.tabIndex = 0;
    nextChip.focus();
  }

  override render(): TemplateResult {
    const style = `gap: ${this.gap}; flex-wrap: ${this.wrap ? 'wrap' : 'nowrap'};`;

    return html`
      <div
        part="group"
        role="listbox"
        aria-multiselectable=${this.multi ? 'true' : 'false'}
        aria-required=${this.required ? 'true' : 'false'}
        style=${style}
        @keydown=${this._handleKeyDown}
      >
        <slot @slotchange=${this._handleSlotChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-chip-group': ViChipGroup;
  }
}
