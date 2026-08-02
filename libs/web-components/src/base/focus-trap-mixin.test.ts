import { expect } from '@wdio/globals';
import { html, render, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { FocusTrapMixin } from './focus-trap-mixin.js';

@customElement('vi-test-focus-trap')
class ViTestFocusTrap extends FocusTrapMixin(LitElement) {
  @query('.first') accessor firstBtn!: HTMLElement;
  @query('.last') accessor lastBtn!: HTMLElement;
  @query('.container') accessor container!: HTMLElement;

  public testActivate(initialFocus?: HTMLElement | null, autofocus = true) {
    this._activateFocusTrap(initialFocus, autofocus);
  }

  public testDeactivate(returnFocus?: HTMLElement | null) {
    this._deactivateFocusTrap(returnFocus);
  }

  override render() {
    return html`
      <div class="container">
        <button class="first">First</button>
        <button class="middle">Middle</button>
        <button class="last">Last</button>
        <slot></slot>
      </div>
    `;
  }
}

describe('FocusTrapMixin', () => {
  let container: HTMLElement;
  let outsideBtn: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    outsideBtn = document.createElement('button');
    outsideBtn.textContent = 'Outside';
    document.body.appendChild(outsideBtn);
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    if (outsideBtn.parentNode) {
      document.body.removeChild(outsideBtn);
    }
  });

  const getElement = () => {
    const el = container.querySelector('vi-test-focus-trap') as ViTestFocusTrap;
    (el as any)._isActuallyFocusable = () => true;
    return el;
  };

  it('focuses the first focusable element on activate if autofocus is true', async () => {
    render(html`<vi-test-focus-trap></vi-test-focus-trap>`, container);
    const el = getElement();
    await el.updateComplete;

    outsideBtn.focus();
    expect(document.activeElement).toBe(outsideBtn);

    el.testActivate();
    await new Promise(r => requestAnimationFrame(r));
    
    // Focus should move to the first button inside the shadow DOM
    expect(el.shadowRoot?.activeElement).toBe(el.firstBtn);
  });

  it('restores focus to the originally focused element on deactivate', async () => {
    render(html`<vi-test-focus-trap></vi-test-focus-trap>`, container);
    const el = getElement();
    await el.updateComplete;

    outsideBtn.focus();
    el.testActivate();
    await new Promise(r => requestAnimationFrame(r));
    expect(el.shadowRoot?.activeElement).toBe(el.firstBtn);

    el.testDeactivate();
    expect(document.activeElement).toBe(outsideBtn);
  });

  it('restores focus to explicitly provided return target on deactivate', async () => {
    render(html`<vi-test-focus-trap></vi-test-focus-trap>`, container);
    const el = getElement();
    await el.updateComplete;

    const anotherBtn = document.createElement('button');
    document.body.appendChild(anotherBtn);

    outsideBtn.focus();
    el.testActivate();
    await new Promise(r => requestAnimationFrame(r));
    
    el.testDeactivate(anotherBtn);
    expect(document.activeElement).toBe(anotherBtn);
    
    anotherBtn.remove();
  });

  it('wraps focus to the first element when Tab is pressed on the last element', async () => {
    render(html`<vi-test-focus-trap></vi-test-focus-trap>`, container);
    const el = getElement();
    await el.updateComplete;

    el.testActivate();
    await new Promise(r => requestAnimationFrame(r));
    el.lastBtn.focus();
    expect(el.shadowRoot?.activeElement).toBe(el.lastBtn);

    // Simulate Tab on the last element
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, composed: true });
    el.dispatchEvent(tabEvent);

    expect(el.shadowRoot?.activeElement).toBe(el.firstBtn);
  });

  it('wraps focus to the last element when Shift+Tab is pressed on the first element', async () => {
    render(html`<vi-test-focus-trap></vi-test-focus-trap>`, container);
    const el = getElement();
    await el.updateComplete;

    el.testActivate();
    await new Promise(r => requestAnimationFrame(r));
    expect(el.shadowRoot?.activeElement).toBe(el.firstBtn);

    // Simulate Shift+Tab on the first element
    const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, composed: true });
    el.dispatchEvent(shiftTabEvent);

    expect(el.shadowRoot?.activeElement).toBe(el.lastBtn);
  });

  it('updates focusable elements when DOM mutates', async () => {
    render(html`<vi-test-focus-trap></vi-test-focus-trap>`, container);
    const el = getElement();
    await el.updateComplete;

    el.testActivate();
    await new Promise(r => requestAnimationFrame(r));
    
    // Add a new button at the end
    const newBtn = document.createElement('button');
    newBtn.className = 'new-last';
    newBtn.textContent = 'New Last';
    el.container.appendChild(newBtn);

    // Wait for mutation observer
    await new Promise(r => setTimeout(r, 100));

    // Now shift-tab from first should go to new-last
    el.firstBtn.focus();
    const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, composed: true });
    el.dispatchEvent(shiftTabEvent);

    expect(el.shadowRoot?.activeElement).toBe(newBtn);
  });
});
