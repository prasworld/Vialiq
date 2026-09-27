import { expect } from '@wdio/globals';
import { render, html } from 'lit';
import './vi-popover.js';
import type { ViPopover } from './vi-popover.js';

describe('vi-popover', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render trigger element', async () => {
    render(
      html`
        <vi-popover>
          <button id="trigger">Open</button>
          <div slot="content">Content</div>
        </vi-popover>
      `,
      container
    );
    const popover = container.querySelector('vi-popover') as ViPopover;
    await popover.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    const trigger = popover.querySelector('#trigger');
    expect(trigger).toBeTruthy();
    expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('should open on click when trigger="click"', async () => {
    render(
      html`
        <vi-popover trigger="click">
          <button id="trigger">Open</button>
        </vi-popover>
      `,
      container
    );
    const popover = container.querySelector('vi-popover') as ViPopover;
    await popover.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    const trigger = popover.querySelector('#trigger') as HTMLButtonElement;
    
    expect(popover.open).toBe(false);
    trigger.click();
    expect(popover.open).toBe(true);
    trigger.click();
    expect(popover.open).toBe(false);
  });

  it('should reflect open property to DOM', async () => {
    render(
      html`
        <vi-popover open>
          <button>Open</button>
        </vi-popover>
      `,
      container
    );
    const popover = container.querySelector('vi-popover') as ViPopover;
    await popover.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    expect(popover.open).toBe(true);
    expect(popover.hasAttribute('open')).toBe(true);
  });

  it('should open on hover when trigger="hover"', async () => {
    render(
      html`
        <vi-popover trigger="hover">
          <button id="trigger">Hover Me</button>
        </vi-popover>
      `,
      container
    );
    const popover = container.querySelector('vi-popover') as ViPopover;
    await popover.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    const trigger = popover.querySelector('#trigger') as HTMLButtonElement;
    
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await new Promise(r => setTimeout(r, 150)); // Wait for 100ms showTimeout
    expect(popover.open).toBe(true);

    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    await new Promise(r => setTimeout(r, 150)); // Wait for 100ms hideTimeout
    expect(popover.open).toBe(false);
  });

  it('should open on focus when trigger="focus"', async () => {
    render(
      html`
        <vi-popover trigger="focus">
          <button id="trigger">Focus Me</button>
        </vi-popover>
      `,
      container
    );
    const popover = container.querySelector('vi-popover') as ViPopover;
    await popover.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    const trigger = popover.querySelector('#trigger') as HTMLButtonElement;
    
    trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
    expect(popover.open).toBe(true);

    trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true, relatedTarget: document.body }));
    expect(popover.open).toBe(false);
  });

  it('should close when pressing Escape', async () => {
    render(
      html`
        <vi-popover open trigger="click">
          <button id="trigger">Open</button>
        </vi-popover>
      `,
      container
    );
    const popover = container.querySelector('vi-popover') as ViPopover;
    await popover.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    expect(popover.open).toBe(true);
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(popover.open).toBe(false);
  });

  it('should close when clicking outside', async () => {
    render(
      html`
        <vi-popover open trigger="click">
          <button id="trigger">Open</button>
        </vi-popover>
      `,
      container
    );
    const popover = container.querySelector('vi-popover') as ViPopover;
    await popover.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    expect(popover.open).toBe(true);
    
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(popover.open).toBe(false);
  });

  it('should set aria-label when accessible-name is provided', async () => {
    render(
      html`
        <vi-popover accessible-name="My Popover">
          <button id="trigger">Open</button>
        </vi-popover>
      `,
      container
    );
    const popover = container.querySelector('vi-popover') as ViPopover;
    await popover.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    const panel = popover.shadowRoot?.querySelector('.popover-panel');
    expect(panel?.getAttribute('aria-label')).toBe('My Popover');
    expect(panel?.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('should set aria-labelledby when title is provided', async () => {
    render(
      html`
        <vi-popover title="Popover Title">
          <button id="trigger">Open</button>
        </vi-popover>
      `,
      container
    );
    const popover = container.querySelector('vi-popover') as ViPopover;
    await popover.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    const panel = popover.shadowRoot?.querySelector('.popover-panel');
    expect(panel?.getAttribute('aria-labelledby')).toBe('popover-title');
    expect(panel?.hasAttribute('aria-label')).toBe(false);
  });
});
