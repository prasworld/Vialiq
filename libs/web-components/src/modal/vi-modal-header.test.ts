import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-modal-header.js';
import { ViModalHeader } from './vi-modal-header.js';

describe('vi-modal-header', () => {
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

  const getHeader = () => container.querySelector('vi-modal-header') as ViModalHeader;

  it('renders default state', async () => {
    render(html`<vi-modal-header></vi-modal-header>`, container);
    const el = getHeader();
    await el.updateComplete;

    expect(el).toBeTruthy();
    expect(el.closable).toBe(false);
    expect(el.maximizable).toBe(false);

    const closeBtn = el.shadowRoot!.querySelector('[part="close-btn"]');
    expect(closeBtn).toBeFalsy();
  });

  it('renders title and description', async () => {
    render(
      html`<vi-modal-header
        title="Test Title"
        description="Test description"
      ></vi-modal-header>`,
      container
    );
    const el = getHeader();
    await el.updateComplete;

    const titleEl = el.shadowRoot!.querySelector('.modal-title');
    expect(titleEl!.textContent?.trim()).toBe('Test Title');

    const descEl = el.shadowRoot!.querySelector('.modal-description');
    expect(descEl!.textContent?.trim()).toBe('Test description');
  });

  it('renders close button and fires event', async () => {
    render(html`<vi-modal-header closable></vi-modal-header>`, container);
    const el = getHeader();
    await el.updateComplete;

    const closeBtn = el.shadowRoot!.querySelector('[part="close-btn"]') as HTMLElement;
    expect(closeBtn).toBeTruthy();

    let eventFired = false;
    el.addEventListener('vi-modal-close-request', () => {
      eventFired = true;
    });

    closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(eventFired).toBe(true);
  });

  it('renders maximize button and fires event', async () => {
    render(html`<vi-modal-header maximizable></vi-modal-header>`, container);
    const el = getHeader();
    await el.updateComplete;

    const maxBtn = el.shadowRoot!.querySelector('[part="maximize-btn"]') as HTMLElement;
    expect(maxBtn).toBeTruthy();

    let eventFired = false;
    el.addEventListener('vi-modal-maximize-request', () => {
      eventFired = true;
    });

    maxBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(eventFired).toBe(true);
  });

  it('renders alert variant icon', async () => {
    render(html`<vi-modal-header alert-variant="warning"></vi-modal-header>`, container);
    const el = getHeader();
    await el.updateComplete;

    const icon = el.shadowRoot!.querySelector('vi-icon[name="triangle-warning"]');
    expect(icon).toBeTruthy();
  });
});
