import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import sinon from 'sinon';
import './vi-sidebar-container.js';
import './vi-sidebar.js';
import type { ViSidebarContainer } from './vi-sidebar-container.js';
import type { ViSidebar } from './vi-sidebar.js';

describe('vi-sidebar-container', () => {
  let wrapper: HTMLElement;

  beforeEach(() => {
    wrapper = document.createElement('div');
    document.body.appendChild(wrapper);
  });

  afterEach(() => {
    wrapper.remove();
  });

  it('should render content correctly', async () => {
    render(html`
      <vi-sidebar-container>
        <div slot="content">Main Content</div>
      </vi-sidebar-container>
    `, wrapper);
    
    const host = await $('vi-sidebar-container');
    await expect(host).toExist();

    const el = document.querySelector('vi-sidebar-container') as ViSidebarContainer;
    const contentSlot = el.shadowRoot!.querySelector('slot[name="content"]') as HTMLSlotElement;
    
    // Fallback to plain expect
    expect(contentSlot).not.toBeNull();
    expect(contentSlot.assignedNodes().length).toBeGreaterThan(0);
  });

  it('should register sidebars and update layout', async () => {
    render(html`
      <vi-sidebar-container>
        <vi-sidebar slot="sidebar" mode="push" position="start" opened></vi-sidebar>
        <div slot="content">Content</div>
      </vi-sidebar-container>
    `, wrapper);
    
    const host = await $('vi-sidebar-container');
    await expect(host).toExist();

    const el = document.querySelector('vi-sidebar-container') as ViSidebarContainer;
    await el.updateComplete; // wait for firstUpdated + updateLayout to run
    const sidebar = el.querySelector('vi-sidebar') as ViSidebar;
    await sidebar.updateComplete;
    expect(sidebar.container).toBe(el);
    
    // In push mode with a start position, updateLayout sets style.padding on content-wrapper
    const contentWrapper = el.shadowRoot!.querySelector('.vi-sidebar-container__content-wrapper') as HTMLElement;
    expect(contentWrapper.style.padding).not.toBe('');
  });

  it('should show backdrop and emit event', async () => {
    render(html`<vi-sidebar-container></vi-sidebar-container>`, wrapper);
    
    const host = await $('vi-sidebar-container');
    await expect(host).toExist();

    const el = document.querySelector('vi-sidebar-container') as ViSidebarContainer;
    const backdropSpy = sinon.spy();
    el.addEventListener('vi-sidebar-show-backdrop-change', backdropSpy);

    el.requestBackdrop(true);
    await el.updateComplete; // wait for re-render to show backdrop element

    expect(el.showBackdrop).toBe(true);
    expect(backdropSpy.calledOnce).toBe(true);
    
    // Backdrop is rendered conditionally — just check the element exists
    const backdropEl = el.shadowRoot!.querySelector('.vi-sidebar-container__backdrop') as HTMLElement;
    expect(backdropEl).not.toBeNull();
  });

  it('should emit backdrop click event', async () => {
    render(html`<vi-sidebar-container show-backdrop></vi-sidebar-container>`, wrapper);
    
    const host = await $('vi-sidebar-container');
    await expect(host).toExist();

    const el = document.querySelector('vi-sidebar-container') as ViSidebarContainer;
    const clickSpy = sinon.spy();
    el.addEventListener('vi-sidebar-backdrop-click', clickSpy);
    
    const backdropEl = el.shadowRoot!.querySelector('.vi-sidebar-container__backdrop') as HTMLElement;
    backdropEl.click();
    
    expect(clickSpy.calledOnce).toBe(true);
  });
});
