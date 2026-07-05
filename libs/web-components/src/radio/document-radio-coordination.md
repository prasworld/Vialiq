# Document-Wide Radio Coordination for Custom Elements

This document outlines the pattern for coordinating custom radio buttons across any depth or position in the DOM (outside of a strict parent-child container hierarchy) using the `name` attribute.

## The Problem
By default, native `<input type="radio">` grouping is scoped to the Document or ShadowRoot. Since custom elements are placed inside independent Shadow Roots, the browser's native radio grouping fails. Additionally, using a parent container (like `<vi-radio-group>`) restricts developers to placing options directly inside that group.

## The Solution
Use document-wide event broadcasting to inform all other instances of a radio button when one is selected. Each radio listens at the `document` level and unchecks itself if it shares the same `name` but is a different element reference.

### Code Pattern (Lit Implementation)

```typescript
import { LitElement, html, property } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('vi-radio')
export class ViRadio extends LitElement {
  @property({ type: String }) accessor name = '';
  @property({ type: String }) accessor value = '';
  @property({ type: Boolean, reflect: true }) accessor checked = false;

  override connectedCallback() {
    super.connectedCallback();
    // Register global event listener
    document.addEventListener('vi-radio-selected', this._handleRadioSelected);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up listener to prevent memory leaks
    document.removeEventListener('vi-radio-selected', this._handleRadioSelected);
  }

  // Called when the user clicks this radio option
  private _onUserSelect() {
    if (this.checked) return;

    this.checked = true;

    // Broadcast event to document to uncheck others with the same name
    document.dispatchEvent(
      new CustomEvent('vi-radio-selected', {
        detail: {
          name: this.name,
          source: this, // reference to this element
        },
      })
    );

    this.dispatchEvent(
      new CustomEvent('vialiq-change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  // Check if another radio with the same name was checked
  private _handleRadioSelected = (e: Event) => {
    const { name, source } = (e as CustomEvent).detail;
    if (name === this.name && source !== this) {
      this.checked = false;
    }
  };
}
```

### Form Integration (Form-Associated Custom Elements)
When using `ElementInternals` to associate with parent forms, call `this._internals.setFormValue()` to synchronize the selection state:
- Upon being checked: `this._internals.setFormValue(this.value)`
- Upon being unchecked (during the `_handleRadioSelected` callback): `this._internals.setFormValue(null)`
