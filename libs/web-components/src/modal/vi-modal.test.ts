import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import { ViModal } from './vi-modal.js';
import './vi-modal.js';
import './vi-modal-header.js';
import './vi-modal-footer.js';

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
    render(html`<vi-modal><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
    const el = getModal();
    await el.updateComplete;

    expect(el).toBeTruthy();
    expect(el.open).toBe(false);

    const dialog = el.shadowRoot!.querySelector('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog!.open).toBe(false);
  });

  it('opens and closes reflect on native dialog', async () => {
    render(html`<vi-modal><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
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
    render(html`<vi-modal variant="alert" size="lg"><vi-modal-header slot="header" alert-variant="warning"></vi-modal-header></vi-modal>`,
      container,
    );
    const el = getModal();
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;

    expect(el.variant).toBe('alert');
    const header = el.querySelector('vi-modal-header') as any;
    expect(header.alertVariant).toBe('warning');

    expect(dialog.classList.contains('modal-variant-alert')).toBe(true);
    expect(dialog.getAttribute('role')).toBe('alertdialog');

    // icon is rendered for alert variant
    const icon = header.shadowRoot!.querySelector('.modal-alert-icon vi-icon');
    expect(icon).toBeTruthy();
    expect(icon!.getAttribute('name')).toBe('triangle-warning');
  });

  it('fires correct events on close request', async () => {
    render(html`<vi-modal open><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
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
    render(html`<vi-modal open><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
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
    render(html`<vi-modal open><vi-modal-header slot="header" closable></vi-modal-header></vi-modal>`, container);
    const el = getModal();
    await el.updateComplete;

    let closeReason = '';
    el.addEventListener('vi-modal-close', (e: Event) => {
      closeReason = (e as CustomEvent).detail.reason;
    });

    const header = el.querySelector('vi-modal-header') as HTMLElement;
    const closeBtn = header.shadowRoot!.querySelector('[part="close-btn"]') as HTMLElement;
    expect(closeBtn).toBeTruthy();

    closeBtn.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    await new Promise((r) => setTimeout(r, 350));

    expect(closeReason).toBe('button');
    expect(el.open).toBe(false);
  });

  it('handles backdrop clicks depending on persistence', async () => {
    render(html`<vi-modal open persistent><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
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
    render(html`<vi-modal open><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
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
    render(html`<vi-modal open><vi-modal-header slot="header" maximizable></vi-modal-header></vi-modal>`, container);
    const el = getModal() as ViModal;
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.classList.contains('modal-size-fullscreen')).toBe(false);

    const header = el.querySelector('vi-modal-header') as HTMLElement;
    const maxBtn = header.shadowRoot!.querySelector('[part="maximize-btn"]') as HTMLElement;
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
    render(html`<vi-modal open size="full-width"><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
    const el = getModal() as ViModal;
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.classList.contains('modal-size-full-width')).toBe(true);

    el.remove();
  });

  it('supports position sizes', async () => {
    render(html`<vi-modal open position="top"><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
    const el = getModal() as ViModal;
    await el.updateComplete;

    const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.classList.contains('modal-position-top')).toBe(true);

    el.remove();
  });

  it('supports drawer variant', async () => {
    render(
      html`<vi-modal open variant="drawer" drawer-placement="left"><vi-modal-header slot="header"></vi-modal-header></vi-modal>`,
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
      html`<vi-modal open return-focus="#custom-return-target"><vi-modal-header slot="header"></vi-modal-header></vi-modal>`,
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
    expect(labelledBy).toBe('vi-modal-header-slot');

    const header = el.shadowRoot!.querySelector('#vi-modal-header-slot');
    expect(header).not.toBeNull();

    el.remove();
  });

  it('respects aria-label set on host modal', async () => {
    render(
      html`<vi-modal open aria-label="Accessible Modal"><vi-modal-header slot="header"></vi-modal-header></vi-modal>`,
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
    expect(dialog.getAttribute('aria-labelledby')).toBe('vi-modal-header-slot');

    const header = el.shadowRoot!.querySelector('#vi-modal-header-slot');
    expect(header).not.toBeNull();

    el.remove();
  });
  it('cleans up original parent and sibling references when closed', async () => {
    const wrapper = document.createElement('div');
    container.appendChild(wrapper);
    render(html`<vi-modal open><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, wrapper);
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

    render(html`<vi-modal><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
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
    render(html`<vi-modal open persistent><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
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
      render(html`<vi-modal draggable><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      expect(el.open).toBe(false);

      el.show();
      await el.updateComplete;

      const header = el.querySelector('vi-modal-header') as HTMLElement;
      console.log('MODAL HTML:', el.outerHTML);
      expect(header).toBeTruthy();
      expect(header.style.cursor).toBe('grab');

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
      render(html`<vi-modal open draggable><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
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
      render(html`<vi-modal open no-backdrop><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      const backdrop = el.shadowRoot!.querySelector('.modal-backdrop');
      expect(backdrop).toBeNull();
    });

    it('does not mark background elements inert when no-backdrop attribute is set', async () => {
      const sibling = document.createElement('button');
      sibling.textContent = 'Sibling Button';
      container.appendChild(sibling);

      render(html`<vi-modal open no-backdrop><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      expect(sibling.inert).toBe(false);
      sibling.remove();
    });

    it('does not set aria-modal="true" when no-backdrop attribute is set', async () => {
      render(html`<vi-modal open no-backdrop><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      const dialog = el.shadowRoot!.querySelector('dialog');
      expect(dialog?.hasAttribute('aria-modal')).toBe(false);
    });
  });

  // ─── Resizable ─────────────────────────────────────────────────────────────

  describe('Resizable', () => {
    it('renders 8 resize handles when resizable=true', async () => {
      render(html`<vi-modal open resizable><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      const handles = el.shadowRoot!.querySelectorAll('.resize-handle');
      expect(handles.length).toBe(8);
    });

    it('does not render resize handles when resizable=false (default)', async () => {
      render(html`<vi-modal open><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      const handles = el.shadowRoot!.querySelectorAll('.resize-handle');
      expect(handles.length).toBe(0);
    });

    it('suppresses resize via duck-type when maximized', async () => {
      render(html`<vi-modal open resizable maximizable><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      // Simulate maximize
      el.dispatchEvent(new CustomEvent('vi-modal-maximize-request'));
      await el.updateComplete;

      const dialog = el.shadowRoot!.querySelector('dialog');
      expect(dialog?.classList.contains('is-maximized')).toBe(true);

      // The handles should be hidden via CSS (.is-maximized .resize-handle { display: none; })
      // They still exist in DOM but are hidden
      const handles = el.shadowRoot!.querySelectorAll('.resize-handle');
      expect(handles.length).toBe(8);

      el.remove();
    });

    it('applies width and height via pointer events on se handle', async () => {
      render(html`<vi-modal open resizable><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
      const handle = el.shadowRoot!.querySelector('.resize-handle-se') as HTMLElement;
      expect(handle).toBeTruthy();

      handle.dispatchEvent(
        new PointerEvent('pointerdown', {
          button: 0,
          clientX: 100,
          clientY: 100,
          bubbles: true,
          composed: true,
        }),
      );
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 180, clientY: 160, bubbles: true }),
      );
      window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

      expect(dialog.style.width).toBeTruthy();
      expect(dialog.style.height).toBeTruthy();

      el.remove();
    });

    it('_resetResize clears inline width/height/maxWidth/maxHeight', async () => {
      render(html`<vi-modal open resizable><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      const dialog = el.shadowRoot!.querySelector('dialog') as HTMLDialogElement;
      dialog.style.width = '500px';
      dialog.style.height = '300px';
      dialog.style.maxWidth = '500px';
      dialog.style.maxHeight = '300px';

      (el as any)._resetResize();

      expect(dialog.style.width).toBe('');
      expect(dialog.style.height).toBe('');
      expect(dialog.style.maxWidth).toBe('');
      expect(dialog.style.maxHeight).toBe('');

      el.remove();
    });
  });

  // ─── append-to ─────────────────────────────────────────────────────────────

  describe('append-to', () => {
    it('teleports to document.body by default', async () => {
      render(html`<vi-modal open><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      expect(el.parentElement).toBe(document.body);
      el.remove();
    });

    it('teleports to custom container when append-to is a CSS selector', async () => {
      const portal = document.createElement('div');
      portal.id = 'test-portal';
      document.body.appendChild(portal);

      render(
        html`<vi-modal open append-to="#test-portal" no-backdrop><vi-modal-header slot="header"></vi-modal-header></vi-modal>`,
        container,
      );
      const el = getModal() as ViModal;
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      expect(el.parentElement).toBe(portal);

      el.remove();
      portal.remove();
    });

    it('falls back to body when append-to selector does not match', async () => {
      render(
        html`<vi-modal open append-to="#nonexistent" no-backdrop><vi-modal-header slot="header"></vi-modal-header></vi-modal>`,
        container,
      );
      const el = getModal() as ViModal;
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));

      expect(el.parentElement).toBe(document.body);
      el.remove();
    });

    it('returns to original parent after closing when using custom append-to', async () => {
      const portal = document.createElement('div');
      portal.id = 'test-portal-2';
      document.body.appendChild(portal);

      const wrapper = document.createElement('div');
      document.body.appendChild(wrapper);

      render(
        html`<vi-modal append-to="#test-portal-2" no-backdrop><vi-modal-header slot="header"></vi-modal-header></vi-modal>`,
        wrapper,
      );
      const el = wrapper.querySelector('vi-modal') as ViModal;
      await el.updateComplete;

      // Open — should teleport to portal
      el.show();
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));
      expect(el.parentElement).toBe(portal);

      // Close — should return to wrapper
      el.close();
      await new Promise((r) => setTimeout(r, 350));
      expect(el.parentElement).toBe(wrapper);

      el.remove();
      portal.remove();
      wrapper.remove();
    });
  });

  // ─── drag-containment ──────────────────────────────────────────────────────

  describe('drag-containment', () => {
    it('defaults to "none" (no clamping)', async () => {
      render(html`<vi-modal open draggable><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal() as ViModal;
      await el.updateComplete;

      expect((el as any).dragContainment).toBe('none');
      el.remove();
    });

    it('reflects drag-containment attribute', async () => {
      render(
        html`<vi-modal open draggable drag-containment="viewport"><vi-modal-header slot="header"></vi-modal-header></vi-modal>`,
        container,
      );
      const el = getModal() as ViModal;
      await el.updateComplete;

      expect((el as any).dragContainment).toBe('viewport');
      el.remove();
    });

    it('does not throw with drag-containment="viewport" during pointer events', async () => {
      render(
        html`<vi-modal open draggable drag-containment="viewport"><vi-modal-header slot="header"></vi-modal-header></vi-modal>`,
        container,
      );
      const el = getModal() as ViModal;
      await el.updateComplete;

      const header = el.querySelector('vi-modal-header') as HTMLElement;
      expect(header).toBeTruthy();

      let threw = false;
      try {
        header.dispatchEvent(
          new PointerEvent('pointerdown', {
            button: 0,
            clientX: 200,
            clientY: 200,
            bubbles: true,
            composed: true,
          }),
        );
        window.dispatchEvent(
          new PointerEvent('pointermove', { clientX: 250, clientY: 220, bubbles: true }),
        );
        window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      } catch {
        threw = true;
      }

      expect(threw).toBe(false);
      el.remove();
    });

    it('uses parentElement as fallback when target has no offsetParent for parent containment', async () => {
      // Create a container with fixed dimensions
      const parent = document.createElement('div');
      parent.id = 'test-parent';
      parent.style.position = 'relative';
      parent.style.width = '400px';
      parent.style.height = '400px';
      document.body.appendChild(parent);

      // We append it directly to the parent, setting append-to so it stays there
      render(
        html`<vi-modal open draggable drag-containment="parent" append-to="#test-parent" no-backdrop><vi-modal-header slot="header"></vi-modal-header></vi-modal>`,
        parent,
      );
      const el = parent.querySelector('vi-modal') as ViModal;
      await el.updateComplete;

      // Because the modal dialog has position: fixed, offsetParent is null.
      // It should fallback to this.parentElement.
      const header = el.querySelector('vi-modal-header') as HTMLElement;
      
      let threw = false;
      try {
        header.dispatchEvent(
          new PointerEvent('pointerdown', { button: 0, clientX: 10, clientY: 10, bubbles: true, composed: true }),
        );
        window.dispatchEvent(
          new PointerEvent('pointermove', { clientX: 500, clientY: 500, bubbles: true }),
        );
        window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
      } catch (_e) {
        threw = true;
      }

      expect(threw).toBe(false);
      
      // Cleanup
      el.remove();
      parent.remove();
    });
  });

  describe('Lifecycle Events', () => {
    it('should fire before-open and before-close events on property assignment', async () => {
      render(html`<vi-modal animation-duration="0"><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal();
      await el.updateComplete;

      let beforeOpenFired = false;
      let beforeCloseFired = false;

      el.addEventListener('vi-modal-before-open', () => { beforeOpenFired = true; });
      el.addEventListener('vi-modal-before-close', () => { beforeCloseFired = true; });

      el.open = true;
      await el.updateComplete;
      expect(beforeOpenFired).toBe(true);
      expect(el.open).toBe(true);
      expect(el.hasAttribute('open')).toBe(true);

      el.open = false;
      await el.updateComplete;
      expect(beforeCloseFired).toBe(true);
      expect(el.open).toBe(false);
      expect(el.hasAttribute('open')).toBe(false);
    });

    it('should prevent opening if vi-modal-before-open is canceled', async () => {
      render(html`<vi-modal animation-duration="0"><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal();
      await el.updateComplete;

      el.addEventListener('vi-modal-before-open', (e) => { e.preventDefault(); });

      el.open = true;
      expect(el.open).toBe(false); // State remains unchanged
      expect(el.hasAttribute('open')).toBe(false); // DOM remains synced
    });

    it('should prevent closing if vi-modal-before-close is canceled', async () => {
      render(html`<vi-modal animation-duration="0" open><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal();
      await el.updateComplete;
      
      el.addEventListener('vi-modal-before-close', (e) => { e.preventDefault(); });

      el.open = false;
      expect(el.open).toBe(true); // State remains unchanged
      expect(el.hasAttribute('open')).toBe(true); // DOM remains synced
    });

    it('should fire after-open and after-close after animations complete', async () => {
      render(html`<vi-modal animation-duration="0"><vi-modal-header slot="header"></vi-modal-header></vi-modal>`, container);
      const el = getModal();
      await el.updateComplete;

      let afterOpenFired = false;
      let afterCloseFired = false;

      el.addEventListener('vi-modal-after-open', () => { afterOpenFired = true; });
      el.addEventListener('vi-modal-after-close', () => { afterCloseFired = true; });

      el.open = true;
      
      await el.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(afterOpenFired).toBe(true);

      el.open = false;
      await el.updateComplete;
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(afterCloseFired).toBe(true);
    });
  });
});

