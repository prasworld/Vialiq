import { expect } from '@wdio/globals';
import { html, render, LitElement } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { DraggableMixin } from './draggable-mixin.js';

@customElement('vi-test-draggable')
class ViTestDraggable extends DraggableMixin(LitElement) {
  @query('.target') accessor targetEl!: HTMLElement;
  @query('.handle') accessor handleEl!: HTMLElement;

  protected get _dragTarget(): HTMLElement | null {
    return this.targetEl;
  }

  protected get _dragHandle(): HTMLElement | null {
    return this.handleEl;
  }

  // Expose protected methods for testing
  public testResetDrag() {
    this._resetDrag();
  }

  public testStopDrag() {
    this._stopDrag();
  }

  override render() {
    return html`
      <div class="target" style="width: 200px; height: 200px; background: red; position: fixed; top: 100px; left: 100px;">
        <div class="handle" style="width: 100%; height: 50px; background: blue;">Handle</div>
      </div>
    `;
  }
}

describe('DraggableMixin', () => {
  let container: HTMLElement;
  let originalSetPointerCapture: any;
  let originalReleasePointerCapture: any;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Mock pointer capture for synthetic events
    originalSetPointerCapture = Element.prototype.setPointerCapture;
    originalReleasePointerCapture = Element.prototype.releasePointerCapture;
    Element.prototype.setPointerCapture = function() {};
    Element.prototype.releasePointerCapture = function() {};
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    
    Element.prototype.setPointerCapture = originalSetPointerCapture;
    Element.prototype.releasePointerCapture = originalReleasePointerCapture;
  });

  const getElement = () => container.querySelector('vi-test-draggable') as ViTestDraggable;

  it('does not attach drag listeners if draggable is false', async () => {
    render(html`<vi-test-draggable></vi-test-draggable>`, container);
    const el = getElement();
    await el.updateComplete;

    expect(el.draggable).toBe(false);
    expect(el.handleEl.style.cursor).toBe('');
    
    // Simulating a pointerdown shouldn't apply any transforms
    el.handleEl.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, clientX: 100, clientY: 100 }));
    document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 150, clientY: 150 }));
    
    expect(el.targetEl.style.transform).toBe('');
  });

  it('sets cursor to move and initiates drag when draggable is true', async () => {
    render(html`<vi-test-draggable draggable></vi-test-draggable>`, container);
    const el = getElement();
    await el.updateComplete;

    expect(el.draggable).toBe(true);
    expect(el.handleEl.style.cursor).toBe('grab');

    // Start drag
    el.handleEl.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, clientX: 100, clientY: 100 }));
    
    // Move
    document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 150, clientY: 120 }));
    
    // Check transform
    expect(el.targetEl.style.transform).toBe('translate3d(50px, 20px, 0px)');
    expect(document.body.style.userSelect).toBe('none');

    // End drag
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true }));
    
    expect(document.body.style.userSelect).toBe(''); // Restored
  });

  it('accumulates translation over multiple drags', async () => {
    render(html`<vi-test-draggable draggable></vi-test-draggable>`, container);
    const el = getElement();
    await el.updateComplete;

    // First drag (+50, +20)
    el.handleEl.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, clientX: 100, clientY: 100 }));
    document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 150, clientY: 120 }));
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true }));

    expect(el.targetEl.style.transform).toBe('translate3d(50px, 20px, 0px)');

    // Second drag (+10, -10) -> Total (60, 10)
    el.handleEl.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, clientX: 200, clientY: 200 }));
    document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 210, clientY: 190 }));
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true }));

    expect(el.targetEl.style.transform).toBe('translate3d(60px, 10px, 0px)');
  });

  it('can reset drag translation', async () => {
    render(html`<vi-test-draggable draggable></vi-test-draggable>`, container);
    const el = getElement();
    await el.updateComplete;

    el.handleEl.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, clientX: 100, clientY: 100 }));
    document.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 150, clientY: 120 }));
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, composed: true }));

    expect(el.targetEl.style.transform).toBe('translate3d(50px, 20px, 0px)');

    el.testResetDrag();

    expect(el.targetEl.style.transform).toBe('');
  });
});
