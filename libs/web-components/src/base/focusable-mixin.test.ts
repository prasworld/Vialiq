import { expect } from '@wdio/globals';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FocusableMixin } from './focusable-mixin.js';

@customElement('vi-focusable-test')
class ViFocusableTest extends FocusableMixin(LitElement) {
  @property({ type: Boolean }) accessor disabled = false;

  override updated(changed: Map<string, unknown>) {
    super.updated(changed);
    if (changed.has('disabled')) {
      // Expose the protected method for testing
      (this as any)._setHostFocusable(!this.disabled);
    }
  }

  protected override get _focusableElement() {
    return this.shadowRoot?.querySelector('button') || null;
  }

  render() {
    return html`<button>Inner</button>`;
  }
}

@customElement('vi-focusable-null-test')
class ViFocusableNullTest extends FocusableMixin(LitElement) {
  // Uses default _focusableElement which returns null
  render() {
    return html`<div>Inner</div>`;
  }
}

describe('FocusableMixin', () => {
  describe('Standard Component', () => {
    let element: ViFocusableTest;
    
    beforeEach(async () => {
      element = document.createElement('vi-focusable-test') as ViFocusableTest;
      document.body.appendChild(element);
      await element.updateComplete;
    });

    afterEach(() => {
      element.remove();
    });

    it('sets default tabIndex to 0', () => {
      expect(element.tabIndex).toBe(0);
      expect(element.getAttribute('tabindex')).toBe('0');
    });

    it('respects consumer defined tabIndex', async () => {
      const customEl = document.createElement('vi-focusable-test') as ViFocusableTest;
      customEl.setAttribute('tabindex', '2');
      document.body.appendChild(customEl);
      await customEl.updateComplete;
      
      expect(customEl.tabIndex).toBe(2);
      customEl.remove();
    });

    it('manages tabIndex when disabled', async () => {
      expect(element.tabIndex).toBe(0);
      
      element.disabled = true;
      await element.updateComplete;
      
      expect(element.tabIndex).toBe(-1);
      
      element.disabled = false;
      await element.updateComplete;
      
      expect(element.tabIndex).toBe(0);
    });

    it('restores custom tabIndex after being re-enabled', async () => {
      const customEl = document.createElement('vi-focusable-test') as ViFocusableTest;
      customEl.setAttribute('tabindex', '2');
      document.body.appendChild(customEl);
      await customEl.updateComplete;
      
      customEl.disabled = true;
      await customEl.updateComplete;
      expect(customEl.tabIndex).toBe(-1);
      
      customEl.disabled = false;
      await customEl.updateComplete;
      expect(customEl.tabIndex).toBe(2);
      
      customEl.remove();
    });

    it('delegates focus to _focusableElement', () => {
      const innerButton = element.shadowRoot?.querySelector('button');
      
      element.focus();
      
      expect(document.activeElement).toBe(element); // shadow dom routing means host is active in light DOM
      expect(element.shadowRoot?.activeElement).toBe(innerButton); // inner element is focused in shadow DOM
    });

    it('delegates focus with FocusOptions', () => {
      const innerButton = element.shadowRoot?.querySelector('button');
      let optionsReceived: FocusOptions | undefined;
      
      // Stub inner focus
      innerButton!.focus = (options) => {
        optionsReceived = options;
      };
      
      element.focus({ preventScroll: true });
      expect(optionsReceived?.preventScroll).toBe(true);
    });
  });

  describe('Null Focusable Element', () => {
    let element: ViFocusableNullTest;
    
    beforeEach(async () => {
      element = document.createElement('vi-focusable-null-test') as ViFocusableNullTest;
      document.body.appendChild(element);
      // DON'T await updateComplete yet to test the pre-render state
    });

    afterEach(() => {
      element.remove();
    });

    it('safely falls back to super.focus() when _focusableElement is null', () => {
      // Calling focus before it renders or when the getter returns null
      expect(() => element.focus()).not.toThrow();
    });
  });
});
