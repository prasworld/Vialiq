import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import { ViAlert } from './vi-alert.js';
import './vi-alert.js';

describe('vi-alert', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const getAlert = () => container.querySelector('vi-alert') as ViAlert;

  it('renders default info alert', async () => {
    render(html`<vi-alert>Default alert message</vi-alert>`, container);
    const el = getAlert();
    await el.updateComplete;

    expect(el).toBeTruthy();
    expect(el.variant).toBe('info');
    expect(el.getAttribute('role')).toBe('status');

    const root = el.shadowRoot!.querySelector('.alert-root');
    expect(root).toBeTruthy();
    expect(root!.getAttribute('data-variant')).toBe('info');

    // Default info icon
    const icon = el.shadowRoot!.querySelector('vi-icon');
    expect(icon).toBeTruthy();
    expect(icon!.getAttribute('name')).toBe('info');
  });

  it('renders with custom variant and role', async () => {
    render(html`<vi-alert variant="warning">Warning message</vi-alert>`, container);
    const el = getAlert();
    await el.updateComplete;

    expect(el.variant).toBe('warning');
    expect(el.getAttribute('role')).toBe('alert');

    const icon = el.shadowRoot!.querySelector('vi-icon');
    expect(icon!.getAttribute('name')).toBe('alert-triangle');
  });

  it('removes role when variant is neutral', async () => {
    render(html`<vi-alert variant="neutral">Neutral message</vi-alert>`, container);
    const el = getAlert();
    await el.updateComplete;

    expect(el.variant).toBe('neutral');
    expect(el.hasAttribute('role')).toBe(false);
  });

  it('renders title', async () => {
    render(html`<vi-alert title="Alert Title">Alert message</vi-alert>`, container);
    const el = getAlert();
    await el.updateComplete;

    const titleSlot = el.shadowRoot!.querySelector('slot[name="title"]') as HTMLSlotElement;
    expect(titleSlot).toBeTruthy();

    // Check innerText of the slot fallback or assigned content logic
    expect(titleSlot!.textContent?.trim()).toBe('Alert Title');
  });

  it('hides icon when no-icon is provided', async () => {
    render(html`<vi-alert no-icon>No icon message</vi-alert>`, container);
    const el = getAlert();
    await el.updateComplete;

    const iconContainer = el.shadowRoot!.querySelector('.alert-icon');
    expect(iconContainer).toBeNull();
  });

  it('allows custom icon via attribute', async () => {
    render(html`<vi-alert icon="settings">Custom icon message</vi-alert>`, container);
    const el = getAlert();
    await el.updateComplete;

    const icon = el.shadowRoot!.querySelector('vi-icon');
    expect(icon!.getAttribute('name')).toBe('settings');
  });

  it('fires vialiq-alert-close and sets hidden on dismiss button click', async () => {
    render(html`<vi-alert id="test-alert-1" dismissible>Dismissible message</vi-alert>`, container);
    const el = getAlert();
    await el.updateComplete;

    const closeBtn = el.shadowRoot!.querySelector('vi-button[part="close-btn"]') as HTMLElement;
    expect(closeBtn).toBeTruthy();

    let eventFired = false;
    let eventDetail: any = null;
    el.addEventListener('vialiq-alert-close', (e: Event) => {
      eventFired = true;
      eventDetail = (e as CustomEvent).detail;
    });

    const originalAnimate = Element.prototype.animate;
    try {
      Element.prototype.animate = function() {
        return {
          finished: Promise.resolve()
        } as any;
      };

      closeBtn.click();

      await new Promise(r => setTimeout(r, 0));

      expect(eventFired).toBe(true);
      expect(eventDetail).toEqual({ id: 'test-alert-1' });
      expect(el.hidden).toBe(true);
    } finally {
      Element.prototype.animate = originalAnimate;
    }
  });

  it('handles dismiss gracefully when Element.prototype.animate is missing or rejected', async () => {
    render(html`<vi-alert id="test-alert-2" dismissible>Dismissible fallback message</vi-alert>`, container);
    const el = getAlert();
    await el.updateComplete;

    const closeBtn = el.shadowRoot!.querySelector('vi-button[part="close-btn"]') as HTMLElement;
    let eventFired = false;
    let eventDetail: any = null;
    el.addEventListener('vialiq-alert-close', (e: Event) => {
      eventFired = true;
      eventDetail = (e as CustomEvent).detail;
    });

    const originalAnimate = Element.prototype.animate;
    try {
      // Test when animate returns a rejected promise
      Element.prototype.animate = function() {
        return {
          finished: Promise.reject(new Error('Animation cancelled'))
        } as any;
      };

      closeBtn.click();
      await new Promise(r => setTimeout(r, 0));

      expect(eventFired).toBe(true);
      expect(eventDetail).toEqual({ id: 'test-alert-2' });
      expect(el.hidden).toBe(true);
    } finally {
      Element.prototype.animate = originalAnimate;
    }
  });

  it('allows opening and closing declaratively via open property', async () => {
    render(html`<vi-alert id="test-alert-3" ?open=${false}>Initially closed message</vi-alert>`, container);
    const el = getAlert();
    await el.updateComplete;

    expect(el.open).toBe(false);
    expect(el.hidden).toBe(true);

    let showFired = false;
    let showDetail: any = null;
    el.addEventListener('vialiq-alert-show', (e: Event) => {
      showFired = true;
      showDetail = (e as CustomEvent).detail;
    });

    el.open = true;
    await el.updateComplete;

    expect(el.hidden).toBe(false);
    expect(showFired).toBe(true);
    expect(showDetail).toEqual({ id: 'test-alert-3' });
  });

  it('supports imperative show() and hide() methods', async () => {
    render(html`<vi-alert id="test-alert-4">Imperative alert message</vi-alert>`, container);
    const el = getAlert();
    await el.updateComplete;

    expect(el.open).toBe(true);

    let closeFired = false;
    el.addEventListener('vialiq-alert-close', () => {
      closeFired = true;
    });

    await el.hide();
    await el.updateComplete;

    expect(el.open).toBe(false);
    expect(el.hidden).toBe(true);
    expect(closeFired).toBe(true);

    let showFired = false;
    el.addEventListener('vialiq-alert-show', () => {
      showFired = true;
    });

    await el.show();
    await el.updateComplete;

    expect(el.open).toBe(true);
    expect(el.hidden).toBe(false);
    expect(showFired).toBe(true);
  });

  it('reflects floating attribute and property', async () => {
    render(html`<vi-alert floating>Floating alert message</vi-alert>`, container);
    const el = getAlert();
    await el.updateComplete;

    expect(el.floating).toBe(true);
    expect(el.hasAttribute('floating')).toBe(true);
  });

  it('automatically hides alert when auto-hide is enabled', async () => {
    render(html`<vi-alert auto-hide auto-hide-duration="50">Auto hide message</vi-alert>`, container);
    const el = getAlert();
    await el.updateComplete;

    expect(el.open).toBe(true);
    expect(el.hidden).toBe(false);

    // Wait for auto-hide timer to trigger
    await new Promise(r => setTimeout(r, 80));

    expect(el.open).toBe(false);
    expect(el.hidden).toBe(true);
  });
});