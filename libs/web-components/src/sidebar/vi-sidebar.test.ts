import { $, expect, browser } from '@wdio/globals';
import { html, render } from 'lit';
import sinon from 'sinon';
import './vi-sidebar.js';
import type { ViSidebar } from './vi-sidebar.js';

describe('vi-sidebar', () => {
  let wrapper: HTMLElement;

  beforeEach(() => {
    wrapper = document.createElement('div');
    document.body.appendChild(wrapper);
  });

  afterEach(() => {
    wrapper.remove();
  });

  it('should render closed by default', async () => {
    render(html`<vi-sidebar></vi-sidebar>`, wrapper);
    const host = await $('vi-sidebar');
    await expect(host).toExist();

    const el = document.querySelector('vi-sidebar') as ViSidebar;
    expect(el.opened).toBe(false);

    const aside = await host.shadow$('aside');
    await expect(aside).toExist();
    await expect(aside).toHaveAttribute('aria-hidden', 'true');
  });

  it('should dispatch events on open/close', async () => {
    render(html`<vi-sidebar></vi-sidebar>`, wrapper);
    const host = await $('vi-sidebar');
    await expect(host).toExist();

    const el = document.querySelector('vi-sidebar') as ViSidebar;
    const openedSpy = sinon.spy();
    el.addEventListener('vi-sidebar-opened-change', openedSpy);

    el.open();
    await el.updateComplete;
    expect(el.opened).toBe(true);
    expect(openedSpy.calledOnce).toBe(true);
    expect(openedSpy.firstCall.args[0].detail.opened).toBe(true);

    el.close();
    await el.updateComplete;
    expect(el.opened).toBe(false);
    expect(openedSpy.calledTwice).toBe(true);
    expect(openedSpy.secondCall.args[0].detail.opened).toBe(false);
  });

  it('should close on Escape key when keyClose is true', async () => {
    render(html`<vi-sidebar key-close opened></vi-sidebar>`, wrapper);
    const host = await $('vi-sidebar');
    await expect(host).toExist();

    const el = document.querySelector('vi-sidebar') as ViSidebar;
    await el.updateComplete;
    
    // Send Escape key
    await browser.keys(['Escape']);
    await el.updateComplete;
    expect(el.opened).toBe(false);
  });

  it('should apply ARIA dialog roles when trapFocus is true', async () => {
    render(html`<vi-sidebar trap-focus aria-label="My Sidebar"></vi-sidebar>`, wrapper);
    const host = await $('vi-sidebar');
    await expect(host).toExist();

    const aside = await host.shadow$('aside');
    await expect(aside).toHaveAttribute('role', 'dialog');
    await expect(aside).toHaveAttribute('aria-modal', 'true');
    await expect(aside).toHaveAttribute('aria-label', 'My Sidebar');
  });

  it('should NOT apply ARIA dialog roles when trapFocus is false', async () => {
    render(html`<vi-sidebar></vi-sidebar>`, wrapper);
    const host = await $('vi-sidebar');
    await expect(host).toExist();

    const aside = () => document.querySelector('vi-sidebar')?.shadowRoot?.querySelector('aside');
    expect(aside()?.hasAttribute('role')).toBe(false);
    expect(aside()?.hasAttribute('aria-modal')).toBe(false);
  });

  it('should trigger click outside correctly', async () => {
    render(html`
      <div>
        <vi-sidebar close-on-click-outside opened></vi-sidebar>
        <button id="outside">Outside</button>
      </div>
    `, wrapper);
    const host = await $('vi-sidebar');
    await expect(host).toExist();
    
    const sidebar = document.querySelector('vi-sidebar') as ViSidebar;
    const btn = document.querySelector('#outside') as HTMLButtonElement;
    
    expect(sidebar.opened).toBe(true);
    btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true })); // Trigger click outside
    await sidebar.updateComplete;
    expect(sidebar.opened).toBe(false);
  });

  it('should constrain height and allow scrolling when slotted content is tall', async () => {
    render(html`
      <vi-sidebar opened style="height: 200px; display: block;">
        <div style="height: 1000px;">Tall content</div>
      </vi-sidebar>
    `, wrapper);
    const host = await $('vi-sidebar');
    await expect(host).toExist();
    
    const el = document.querySelector('vi-sidebar') as ViSidebar;
    
    // The host should remain at the constrained height
    expect(el.getBoundingClientRect().height).toBe(200);

    const contentArea = el.shadowRoot!.querySelector('.vi-sidebar__content')!;
    
    // The content area should shrink to fit within the host and become scrollable.
    expect(contentArea.clientHeight).toBeLessThanOrEqual(200);
    expect(contentArea.scrollHeight).toBeGreaterThanOrEqual(1000);
    expect(contentArea.scrollHeight).toBeGreaterThan(contentArea.clientHeight);
  });
});
