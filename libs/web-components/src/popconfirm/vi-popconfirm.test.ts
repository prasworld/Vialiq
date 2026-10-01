import { expect } from '@wdio/globals';
import { render, html } from 'lit';
import './vi-popconfirm.js';
import type { ViPopconfirm } from './vi-popconfirm.js';
import sinon from 'sinon';

describe('vi-popconfirm', () => {
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
        <vi-popconfirm title="Are you sure?">
          <button id="trigger">Action</button>
        </vi-popconfirm>
      `,
      container,
    );
    const comp = container.querySelector('vi-popconfirm') as ViPopconfirm;
    const trigger = comp.querySelector('#trigger');
    expect(trigger).toBeTruthy();
  });

  it('should fire vi-popconfirm-confirm when OK button clicked', async () => {
    const spy = sinon.spy();
    render(
      html`
        <vi-popconfirm title="Are you sure?" @vi-popconfirm-confirm=${spy}>
          <button id="trigger">Action</button>
        </vi-popconfirm>
      `,
      container,
    );
    const comp = container.querySelector('vi-popconfirm') as ViPopconfirm;

    // Internal shadow dom elements
    // First we would normally click the trigger, but we can just invoke the inner method or dispatch click on the button
    // It's cleaner to test via the public component if possible.
    const trigger = comp.querySelector('#trigger') as HTMLButtonElement;
    trigger.click(); // opens popover

    // Wait a tick for lit to render popover
    await new Promise((r) => setTimeout(r, 0));

    // OK button is in the shadow DOM of vi-popconfirm (actually in the popover content slot)
    const buttons = comp.shadowRoot?.querySelectorAll('vi-button');
    const okBtn = buttons?.[1]; // Cancel is first, OK is second

    okBtn?.click();
    expect(spy.calledOnce).toBe(true);
  });

  it('should fire vi-popconfirm-cancel when Cancel button clicked', async () => {
    const spy = sinon.spy();
    render(
      html`
        <vi-popconfirm title="Are you sure?" @vi-popconfirm-cancel=${spy}>
          <button id="trigger">Action</button>
        </vi-popconfirm>
      `,
      container,
    );
    const comp = container.querySelector('vi-popconfirm') as ViPopconfirm;
    const trigger = comp.querySelector('#trigger') as HTMLButtonElement;
    trigger.click();

    await new Promise((r) => setTimeout(r, 0));

    const buttons = comp.shadowRoot?.querySelectorAll('vi-button');
    const cancelBtn = buttons?.[0];

    cancelBtn?.click();
    expect(spy.calledOnce).toBe(true);
  });

  it('should not open if disabled', async () => {
    render(
      html`
        <vi-popconfirm disabled title="Are you sure?">
          <button id="trigger">Action</button>
        </vi-popconfirm>
      `,
      container,
    );
    const comp = container.querySelector('vi-popconfirm') as ViPopconfirm;
    const trigger = comp.querySelector('#trigger') as HTMLButtonElement;

    await comp.updateComplete;
    const popover = comp.shadowRoot?.querySelector('vi-popover');
    await popover?.updateComplete;

    trigger.click();
    await new Promise((r) => setTimeout(r, 0));

    expect(popover?.open).toBe(false);
  });

  it('should render custom slotted content', async () => {
    render(
      html`
        <vi-popconfirm>
          <button id="trigger">Action</button>
          <div slot="title" class="custom-title">Custom Title</div>
          <div slot="description" class="custom-desc">Custom Desc</div>
        </vi-popconfirm>
      `,
      container,
    );
    const comp = container.querySelector('vi-popconfirm') as ViPopconfirm;
    const title = comp.querySelector('.custom-title');
    const desc = comp.querySelector('.custom-desc');
    expect(title).toBeTruthy();
    expect(desc).toBeTruthy();
  });
});
