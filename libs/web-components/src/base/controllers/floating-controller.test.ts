import { expect } from '@wdio/globals';
import { html, render, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { FloatingController } from './floating-controller.js';
import { OverlayManager } from '../overlay-manager.js';

@customElement('vi-test-floating')
class ViTestFloating extends LitElement {
  @query('.ref') accessor referenceEl!: HTMLElement;
  @query('.float') accessor floatingEl!: HTMLElement;

  public doHoist = false;

  public floatingController = new FloatingController(this, {
    reference: () => this.referenceEl,
    floating: () => this.floatingEl,
    hoist: () => this.doHoist,
    placement: () => 'bottom',
  });

  override render() {
    return html`
      <div class="ref" style="width: 100px; height: 30px;">Reference</div>
      <div class="float" style="width: 200px; height: 100px; position: absolute;">Floating</div>
    `;
  }
}

describe('FloatingController', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  const getElement = () => container.querySelector('vi-test-floating') as ViTestFloating;

  it('initializes correctly without throwing', async () => {
    render(html`<vi-test-floating></vi-test-floating>`, container);
    const el = getElement();
    await el.updateComplete;

    expect(el.floatingController).toBeDefined();
  });

  it('does not register with OverlayManager if hoist is false', async () => {
    render(html`<vi-test-floating></vi-test-floating>`, container);
    const el = getElement();
    await el.updateComplete;

    el.floatingController.start();
    
    // Z-index should not be set by OverlayManager
    expect(OverlayManager.getZIndex(el.floatingEl)).toBeNull();
    
    el.floatingController.stop();
  });

  it('registers with OverlayManager if hoist is true', async () => {
    render(html`<vi-test-floating></vi-test-floating>`, container);
    const el = getElement();
    await el.updateComplete;

    el.doHoist = true;
    el.floatingController.start();
    
    const zIndex = OverlayManager.getZIndex(el.floatingEl);
    expect(zIndex).not.toBeNull();
    expect(el.floatingEl.style.zIndex).toBe(zIndex?.toString());

    el.floatingController.stop();
    expect(OverlayManager.getZIndex(el.floatingEl)).toBeNull();
  });

  it('cleans up when host is disconnected', async () => {
    render(html`<vi-test-floating></vi-test-floating>`, container);
    const el = getElement();
    await el.updateComplete;

    el.doHoist = true;
    el.floatingController.start();
    
    expect(OverlayManager.getZIndex(el.floatingEl)).not.toBeNull();

    // Removing the element simulates disconnection
    container.removeChild(el);
    
    // The controller hooks into hostDisconnected to call stop()
    expect(OverlayManager.getZIndex(el.floatingEl)).toBeNull();
  });
});
