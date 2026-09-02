import { fixture, expect, html } from '@open-wc/testing';
import sinon from 'sinon';
import './vi-sidebar-container';
import './vi-sidebar';
import type { ViSidebarContainer } from './vi-sidebar-container';
import type { ViSidebar } from './vi-sidebar';

describe('vi-sidebar-container', () => {
  it('should render content correctly', async () => {
    const el = await fixture<ViSidebarContainer>(html`
      <vi-sidebar-container>
        <div slot="content">Main Content</div>
      </vi-sidebar-container>
    `);
    const contentSlot = el.shadowRoot!.querySelector('slot[name="content"]') as HTMLSlotElement;
    expect(contentSlot).to.exist;
    expect(contentSlot.assignedNodes().length).to.be.greaterThan(0);
  });

  it('should register sidebars and update layout', async () => {
    const el = await fixture<ViSidebarContainer>(html`
      <vi-sidebar-container>
        <vi-sidebar slot="sidebar" mode="push" position="start" opened></vi-sidebar>
        <div slot="content">Content</div>
      </vi-sidebar-container>
    `);
    
    const sidebar = el.querySelector('vi-sidebar') as ViSidebar;
    expect(sidebar.container).to.equal(el);
    
    // In push mode with a start position, it should add margin-left
    const wrapper = el.shadowRoot!.querySelector('.vi-sidebar-container__content-wrapper') as HTMLElement;
    expect(wrapper.style.marginLeft).to.not.equal('');
    expect(wrapper.style.marginRight).to.equal('0px');
  });

  it('should show backdrop and emit event', async () => {
    const el = await fixture<ViSidebarContainer>(html`
      <vi-sidebar-container></vi-sidebar-container>
    `);
    const backdropSpy = sinon.spy();
    el.addEventListener('vi-show-backdrop-change', backdropSpy);

    el.requestBackdrop(true);
    await el.updateComplete;

    expect(el.showBackdrop).to.be.true;
    expect(backdropSpy).to.have.been.calledOnce;
    
    const backdropEl = el.shadowRoot!.querySelector('.vi-sidebar-container__backdrop') as HTMLElement;
    expect(backdropEl).to.exist;
    expect(backdropEl.classList.contains('vi-sidebar-container__backdrop--visible')).to.be.true;
  });

  it('should emit backdrop click event', async () => {
    const el = await fixture<ViSidebarContainer>(html`
      <vi-sidebar-container show-backdrop></vi-sidebar-container>
    `);
    
    const clickSpy = sinon.spy();
    el.addEventListener('vi-backdrop-click', clickSpy);
    
    const backdropEl = el.shadowRoot!.querySelector('.vi-sidebar-container__backdrop') as HTMLElement;
    backdropEl.click();
    
    expect(clickSpy).to.have.been.calledOnce;
  });
});
