import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import { ViModal } from './vi-modal.js';
import './vi-modal.js';

describe('vi-modal', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  const getModal = () => container.querySelector('vi-modal') as ViModal;

  it('renders closed by default', async () => {
    render(html`<vi-modal></vi-modal>`, container);
    const el = getModal();
    await el.updateComplete;

    expect(el).toBeTruthy();
    expect(el.open).toBe(false);

    const dialog = el.shadowRoot!.querySelector('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog!.open).toBe(false);
  });

  it('opens and closes reflect on native dialog', async () => {
    render(html`<vi-modal></vi-modal>`, container);
    const el = getModal();
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;

    // Test programatic show()
    el.show();
    await el.updateComplete;
    expect(el.open).toBe(true);
    expect(dialog.open).toBe(true);

    // Test programatic close()
    el.close();
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect(dialog.open).toBe(false);
  });

  it('renders correct variant and sizes', async () => {
    render(html`<vi-modal variant="alert" alert-variant="warning" size="lg"></vi-modal>`, container);
    const el = getModal();
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;

    expect(el.variant).toBe('alert');
    expect(el.alertVariant).toBe('warning');

    expect(dialog.classList.contains('modal-variant-alert')).toBe(true);
    expect(dialog.getAttribute('role')).toBe('alertdialog');

    // icon is rendered for alert variant
    const icon = el.shadowRoot!.querySelector('.modal-alert-icon vi-icon');
    expect(icon).toBeTruthy();
    expect(icon!.getAttribute('name')).toBe('triangle-warning');
  });

  it('fires correct events on close request', async () => {
    render(html`<vi-modal open></vi-modal>`, container);
    const el = getModal();
    await el.updateComplete;

    let requestCloseFired = false;
    let closeFired = false;

    el.addEventListener('vialiq-request-close', (e: Event) => {
      requestCloseFired = true;
      // Let it continue to actual close
    });

    el.addEventListener('vialiq-close', (e: Event) => {
      closeFired = true;
      expect((e as CustomEvent).detail.reason).toBe('programmatic');
    });

    el.close();
    await el.updateComplete;

    expect(requestCloseFired).toBe(true);
    expect(closeFired).toBe(true);
    expect(el.open).toBe(false);
  });

  it('can prevent default on request close', async () => {
    render(html`<vi-modal open></vi-modal>`, container);
    const el = getModal();
    await el.updateComplete;

    let closeFired = false;

    el.addEventListener('vialiq-request-close', (e: Event) => {
      e.preventDefault();
    });

    el.addEventListener('vialiq-close', (e: Event) => {
      closeFired = true;
    });

    el.close();
    await el.updateComplete;

    expect(closeFired).toBe(false);
    expect(el.open).toBe(true); // Should still be open
  });

  it('closes on header close button click', async () => {
    render(html`<vi-modal open closable></vi-modal>`, container);
    const el = getModal();
    await el.updateComplete;

    let closeReason = '';
    el.addEventListener('vialiq-close', (e: Event) => {
      closeReason = (e as CustomEvent).detail.reason;
    });

    const closeBtn = el.shadowRoot!.querySelector('[part="close-btn"]') as HTMLElement;
    expect(closeBtn).toBeTruthy();

    closeBtn.click();
    await el.updateComplete;

    expect(closeReason).toBe('button');
    expect(el.open).toBe(false);
  });

  it('handles backdrop clicks depending on persistence', async () => {
    // We cannot fully simulate a native backdrop click easily in JSDOM/lit tests
    // due to bounding client rect behavior of the native dialog,
    // but we can test the mouse event handling logic.

    render(html`<vi-modal open persistent></vi-modal>`, container);
    const el = getModal();
    await el.updateComplete;

    let requestCloseFired = false;
    el.addEventListener('vialiq-request-close', () => {
        requestCloseFired = true;
    });

    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;

    // Stub bounding rect to mimic a click OUTSIDE the dialog
    dialog.getBoundingClientRect = () => ({
        top: 100, bottom: 200, left: 100, right: 200, width: 100, height: 100, x: 100, y: 100, toJSON: () => {}
    });

    // Dispatch a click on the dialog element but at coordinates outside the mocked rect
    const clickEvent = new MouseEvent('click', { clientX: 10, clientY: 10 });
    dialog.dispatchEvent(clickEvent);

    await el.updateComplete;

    // Since it's persistent, it should fire request-close but NOT close automatically
    expect(requestCloseFired).toBe(true);
    expect(el.open).toBe(true);

    // Now make it non-persistent
    el.persistent = false;
    await el.updateComplete;

    let closeReason = '';
    el.addEventListener('vialiq-close', (e: Event) => {
      closeReason = (e as CustomEvent).detail.reason;
    });

    dialog.dispatchEvent(new MouseEvent('click', { clientX: 10, clientY: 10 }));
    await el.updateComplete;

    // Now it should close automatically with reason 'backdrop'
    expect(closeReason).toBe('backdrop');
    expect(el.open).toBe(false);
  });
});
