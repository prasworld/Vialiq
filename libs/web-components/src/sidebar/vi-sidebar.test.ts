import { fixture, expect, html, nextFrame, waitUntil } from '@open-wc/testing';
import sinon from 'sinon';
import './vi-sidebar';
import type { ViSidebar } from './vi-sidebar';
import { sendKeys } from '@web/test-runner-commands';

describe('vi-sidebar', () => {
  it('should render closed by default', async () => {
    const el = await fixture<ViSidebar>(html`<vi-sidebar></vi-sidebar>`);
    expect(el.opened).to.be.false;
    const aside = el.shadowRoot!.querySelector('aside')!;
    expect(aside.getAttribute('aria-hidden')).to.equal('true');
  });

  it('should dispatch events on open/close', async () => {
    const el = await fixture<ViSidebar>(html`<vi-sidebar></vi-sidebar>`);
    const openedSpy = sinon.spy();
    el.addEventListener('vi-opened-change', openedSpy);

    el.open();
    await el.updateComplete;
    expect(el.opened).to.be.true;
    expect(openedSpy).to.have.been.calledOnce;
    expect(openedSpy.firstCall.args[0].detail.opened).to.be.true;

    el.close();
    await el.updateComplete;
    expect(el.opened).to.be.false;
    expect(openedSpy).to.have.been.calledTwice;
    expect(openedSpy.secondCall.args[0].detail.opened).to.be.false;
  });

  it('should close on Escape key when keyClose is true', async () => {
    const el = await fixture<ViSidebar>(html`<vi-sidebar key-close opened></vi-sidebar>`);
    await el.updateComplete;
    
    // Send Escape key
    await sendKeys({ press: 'Escape' });
    await el.updateComplete;
    expect(el.opened).to.be.false;
  });

  it('should apply ARIA dialog roles when trapFocus is true', async () => {
    const el = await fixture<ViSidebar>(html`<vi-sidebar trap-focus aria-label="My Sidebar"></vi-sidebar>`);
    const aside = el.shadowRoot!.querySelector('aside')!;
    expect(aside.getAttribute('role')).to.equal('dialog');
    expect(aside.getAttribute('aria-modal')).to.equal('true');
    expect(aside.getAttribute('aria-label')).to.equal('My Sidebar');
  });

  it('should NOT apply ARIA dialog roles when trapFocus is false', async () => {
    const el = await fixture<ViSidebar>(html`<vi-sidebar></vi-sidebar>`);
    const aside = el.shadowRoot!.querySelector('aside')!;
    expect(aside.hasAttribute('role')).to.be.false;
    expect(aside.hasAttribute('aria-modal')).to.be.false;
  });

  it('should trigger click outside correctly', async () => {
    const wrapper = await fixture(html`
      <div>
        <vi-sidebar close-on-click-outside opened></vi-sidebar>
        <button id="outside">Outside</button>
      </div>
    `);
    
    const sidebar = wrapper.querySelector('vi-sidebar')!;
    const btn = wrapper.querySelector('#outside') as HTMLButtonElement;
    
    expect(sidebar.opened).to.be.true;
    btn.click(); // Trigger click outside
    await sidebar.updateComplete;
    expect(sidebar.opened).to.be.false;
  });
});
