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

    expect(el).toExist();
    expect(el.variant).toBe('info');
    expect(el.getAttribute('role')).toBe('status');

    const root = el.shadowRoot!.querySelector('.alert-root');
    expect(root).toExist();
    expect(root!.getAttribute('data-variant')).toBe('info');

    // Default info icon
    const icon = el.shadowRoot!.querySelector('vi-icon');
    expect(icon).toExist();
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
    expect(titleSlot).toExist();

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

  it('fires vialiq-close on dismiss button click', async () => {
    render(html`<vi-alert dismissible>Dismissible message</vi-alert>`, container);
    const el = getAlert();
    await el.updateComplete;

    const closeBtn = el.shadowRoot!.querySelector('vi-button[part="close-btn"]') as HTMLElement;
    expect(closeBtn).toExist();

    let eventFired = false;
    el.addEventListener('vialiq-close', () => {
      eventFired = true;
    });

    // We mock Element.prototype.animate to immediately return a resolved promise
    // to bypass actual animation in tests
    const originalAnimate = Element.prototype.animate;
    try {
      Element.prototype.animate = function() {
        return {
          finished: Promise.resolve()
        } as any;
      };

      closeBtn.click();

      // Wait for async handleDismiss to complete
      await new Promise(r => setTimeout(r, 0));

      expect(eventFired).toBe(true);
    } finally {
      // Restore
      Element.prototype.animate = originalAnimate;
    }
  });
});