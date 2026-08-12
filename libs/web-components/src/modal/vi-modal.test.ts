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
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    // Clean up any teleported modals
    document.body.querySelectorAll('vi-modal').forEach((m) => m.remove());
  });

  const getModal = () =>
    document.body.querySelector('vi-modal') ||
    (container.querySelector('vi-modal') as ViModal);

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
    render(
      html`<vi-modal
        variant="alert"
        alert-variant="warning"
        size="lg"
      ></vi-modal>`,
      container,
    );
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

    el.addEventListener('vi-modal-request-close', () => {
      requestCloseFired = true;
      // Let it continue to actual close
    });

    el.addEventListener('vi-modal-close', (e: Event) => {
      closeFired = true;
      expect((e as CustomEvent).detail.reason).toBe('programmatic');
    });

    el.close();
    await new Promise((r) => setTimeout(r, 350));

    expect(requestCloseFired).toBe(true);
    expect(closeFired).toBe(true);
    expect(el.open).toBe(false);
  });

  it('can prevent default on request close', async () => {
    render(html`<vi-modal open></vi-modal>`, container);
    const el = getModal();
    await el.updateComplete;

    let closeFired = false;

    el.addEventListener('vi-modal-request-close', (e: Event) => {
      e.preventDefault();
    });

    el.addEventListener('vi-modal-close', () => {
      closeFired = true;
    });

    el.close();
    await new Promise((r) => setTimeout(r, 350));

    expect(closeFired).toBe(false);
    expect(el.open).toBe(true); // Should still be open
  });

  it('closes on header close button click', async () => {
    render(html`<vi-modal open closable></vi-modal>`, container);
    const el = getModal();
    await el.updateComplete;

    let closeReason = '';
    el.addEventListener('vi-modal-close', (e: Event) => {
      closeReason = (e as CustomEvent).detail.reason;
    });

    const closeBtn = el.shadowRoot!.querySelector(
      '[part="close-btn"]',
    ) as HTMLElement;
    expect(closeBtn).toBeTruthy();

    closeBtn.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    await new Promise((r) => setTimeout(r, 350));

    expect(closeReason).toBe('button');
    expect(el.open).toBe(false);
  });

  it('handles backdrop clicks depending on persistence', async () => {
    render(html`<vi-modal open persistent></vi-modal>`, container);
    const el = getModal() as ViModal;
    await el.updateComplete;

    let requestCloseFired = false;
    el.addEventListener('vi-modal-request-close', () => {
      requestCloseFired = true;
    });

    const backdrop = el.shadowRoot!.querySelector(
      '.modal-backdrop',
    ) as HTMLDivElement;
    expect(backdrop).toBeTruthy();

    // Dispatch a click on the backdrop div
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(clickEvent, 'target', { value: backdrop });
    backdrop.dispatchEvent(clickEvent);

    await el.updateComplete;

    // Since it's persistent, it should fire request-close but NOT close automatically
    expect(requestCloseFired).toBe(true);
    expect(el.open).toBe(true);

    // Now make it non-persistent
    el.persistent = false;
    await el.updateComplete;

    let closeReason = '';
    el.addEventListener('vi-modal-close', (e: Event) => {
      closeReason = (e as CustomEvent).detail.reason;
    });

    const clickEvent2 = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(clickEvent2, 'target', { value: backdrop });
    backdrop.dispatchEvent(clickEvent2);
    await new Promise((r) => setTimeout(r, 350));

    // Now it should close automatically with reason 'backdrop'
    expect(closeReason).toBe('backdrop');
    expect(el.open).toBe(false);
  });

  it('teleports to document.body when rendered and cleans up', async () => {
    render(html`<vi-modal open></vi-modal>`, container);
    const el = getModal() as ViModal;
    await el.updateComplete;

    // Wait a tick for teleportation if it happens in updated
    await new Promise((r) => setTimeout(r, 0));

    expect(el.parentElement).toBe(document.body);

    // Test cleanup
    el.remove();
    // Modal should be removed from body
    expect(document.body.querySelector('vi-modal')).toBeFalsy();
  });

  it('can be maximized and minimized', async () => {
    render(html`<vi-modal open maximizable></vi-modal>`, container);
    const el = getModal() as ViModal;
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.classList.contains('modal-size-fullscreen')).toBe(false);

    const maxBtn = el.shadowRoot!.querySelector(
      '[part="maximize-btn"]',
    ) as HTMLElement;
    maxBtn.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    await el.updateComplete;

    expect(dialog.classList.contains('modal-size-fullscreen')).toBe(true);

    // clicking again should minimize
    maxBtn.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    await el.updateComplete;

    expect(dialog.classList.contains('modal-size-fullscreen')).toBe(false);

    el.remove();
  });

  it('supports full-width size', async () => {
    render(html`<vi-modal open size="full-width"></vi-modal>`, container);
    const el = getModal() as ViModal;
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.classList.contains('modal-size-full-width')).toBe(true);

    el.remove();
  });

  it('supports position sizes', async () => {
    render(html`<vi-modal open position="top"></vi-modal>`, container);
    const el = getModal() as ViModal;
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.classList.contains('modal-position-top')).toBe(true);

    el.remove();
  });

  it('supports drawer variant', async () => {
    render(
      html`<vi-modal open variant="drawer" drawer-placement="left"></vi-modal>`,
      container,
    );
    const el = getModal() as ViModal;
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.classList.contains('modal-variant-drawer')).toBe(true);
    expect(dialog.classList.contains('placement-left')).toBe(true);

    el.remove();
  });

  it('returns focus to element specified by returnFocusSelector on close', async () => {
    const targetBtn = document.createElement('button');
    targetBtn.id = 'custom-return-target';
    container.appendChild(targetBtn);

    render(
      html`<vi-modal open return-focus="#custom-return-target"></vi-modal>`,
      container,
    );
    const el = getModal() as ViModal;
    await el.updateComplete;

    el.close();
    await new Promise((r) => setTimeout(r, 350));

    expect(document.activeElement).toBe(targetBtn);
    targetBtn.remove();
  });

  it('maintains valid aria-labelledby even when custom slot="header" is provided', async () => {
    render(
      html`<vi-modal open><h2 slot="header">Custom Title</h2></vi-modal>`,
      container,
    );
    const el = getModal() as ViModal;
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBe('modal-header');

    const header = el.shadowRoot!.querySelector('#modal-header');
    expect(header).not.toBeNull();

    el.remove();
  });

  it('respects aria-label set on host modal', async () => {
    render(
      html`<vi-modal open aria-label="Accessible Modal"></vi-modal>`,
      container,
    );
    const el = getModal() as ViModal;
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.getAttribute('aria-label')).toBe('Accessible Modal');
    expect(dialog.hasAttribute('aria-labelledby')).toBe(false);

    el.remove();
  });

  it('maintains valid aria-labelledby for alert variant when custom slot="header" is provided', async () => {
    render(
      html`<vi-modal open variant="alert"
        ><h3 slot="header">Warning Title</h3></vi-modal
      >`,
      container,
    );
    const el = getModal() as ViModal;
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.getAttribute('aria-labelledby')).toBe('modal-header');

    const header = el.shadowRoot!.querySelector('#modal-header');
    expect(header).not.toBeNull();

    el.remove();
  });
  it('cleans up original parent and sibling references when closed', async () => {
    const wrapper = document.createElement('div');
    container.appendChild(wrapper);
    render(html`<vi-modal open></vi-modal>`, wrapper);
    const el = document.body.querySelector('vi-modal') as ViModal;
    await el.updateComplete;

    // Close it so it returns to wrapper
    el.close();
    // Wait for exit animation to finish (default is 250ms)
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(el.parentElement).toBe(wrapper);
  });

  it('manages inert attribute on background elements', async () => {
    const sibling1 = document.createElement('div');
    const sibling2 = document.createElement('div');
    sibling1.id = 'sib1';
    sibling2.id = 'sib2';
    document.body.appendChild(sibling1);
    document.body.appendChild(sibling2);

    render(html`<vi-modal></vi-modal>`, container);
    const el = getModal() as ViModal;
    await el.updateComplete;

    expect(sibling1.inert).toBeFalsy();

    el.show();
    await el.updateComplete;
    // Wait a tick for teleport and inert application
    await new Promise((r) => setTimeout(r, 0));

    expect(sibling1.inert).toBe(true);
    expect(sibling2.inert).toBe(true);

    el.close();
    // Wait for exit animation
    await new Promise((r) => setTimeout(r, 350));

    expect(sibling1.inert).toBe(false);
    expect(sibling2.inert).toBe(false);

    sibling1.remove();
    sibling2.remove();
  });

  it('triggers shake animation instead of closing when persistent on Escape', async () => {
    render(html`<vi-modal open persistent></vi-modal>`, container);
    const el = getModal() as ViModal;
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;

    const originalAnimate = dialog.animate;
    let animateCalled = false;
    dialog.animate = function (keyframes: any, options: any) {
      animateCalled = true;
      return originalAnimate.call(this, keyframes, options);
    };

    const escEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(escEvent);

    await el.updateComplete;

    expect(el.open).toBe(true);
    expect(animateCalled).toBe(true);

    dialog.animate = originalAnimate;
  });

  describe('Draggable functionality', () => {
    it('attaches drag pointerdown listeners to header when open with draggable=true', async () => {
      render(html`<vi-modal draggable></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      expect(el.open).toBe(false);

      el.show();
      await el.updateComplete;

      const header = el.shadowRoot!.querySelector(
        '.modal-header',
      ) as HTMLElement;
      expect(header).toBeTruthy();
      expect(header.style.cursor).toBe('move');

      const dialog = el.shadowRoot!.querySelector(
        'dialog',
      ) as HTMLDialogElement;

      // Simulate pointerdown on header
      const pointerDownEvent = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        button: 0,
        bubbles: true,
        composed: true,
      });
      header.dispatchEvent(pointerDownEvent);

      // Simulate pointermove on window
      const pointerMoveEvent = new PointerEvent('pointermove', {
        clientX: 150,
        clientY: 120,
        bubbles: true,
      });
      window.dispatchEvent(pointerMoveEvent);

      expect(dialog.style.transform).toContain('translate3d(50px, 20px');

      // Simulate pointerup on window
      const pointerUpEvent = new PointerEvent('pointerup', {
        clientX: 150,
        clientY: 120,
        bubbles: true,
      });
      window.dispatchEvent(pointerUpEvent);
    });

    it('resets drag transform on resetDrag() or closing', async () => {
      render(html`<vi-modal open draggable></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      const dialog = el.shadowRoot!.querySelector(
        'dialog',
      ) as HTMLDialogElement;
      dialog.style.transform = 'translate3d(50px, 20px, 0)';

      el.close();
      await el.updateComplete;

      expect(dialog.style.transform).toBe('');
    });
  });

  describe('no-backdrop mode', () => {
    it('does not render backdrop overlay when no-backdrop attribute is set', async () => {
      render(html`<vi-modal open no-backdrop></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      const backdrop = el.shadowRoot!.querySelector('.modal-backdrop');
      expect(backdrop).toBeNull();
    });

    it('does not mark background elements inert when no-backdrop attribute is set', async () => {
      const sibling = document.createElement('button');
      sibling.textContent = 'Sibling Button';
      container.appendChild(sibling);

      render(html`<vi-modal open no-backdrop></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      expect(sibling.inert).toBe(false);
      sibling.remove();
    });

    it('does not set aria-modal="true" when no-backdrop attribute is set', async () => {
      render(html`<vi-modal open no-backdrop></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      const dialog = el.shadowRoot!.querySelector('dialog');
      expect(dialog?.hasAttribute('aria-modal')).toBe(false);
    });
  });
});
