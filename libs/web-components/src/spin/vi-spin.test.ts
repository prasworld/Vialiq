import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-spin.js';
import type { ViSpin } from './vi-spin.js';

describe('vi-spin', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders correctly', async () => {
    render(html`<vi-spin></vi-spin>`, container);
    const el = container.querySelector('vi-spin') as ViSpin;
    await el.updateComplete;

    expect(el).toBeTruthy();
    expect(el.spinning).toBe(true);
    expect(el.size).toBe('md');
  });

  it('renders tip correctly', async () => {
    render(html`<vi-spin tip="Loading..."></vi-spin>`, container);
    const el = container.querySelector('vi-spin') as ViSpin;
    await el.updateComplete;

    const tipEl = el.shadowRoot?.querySelector('.spin-text');
    expect(tipEl?.textContent).toBe('Loading...');
  });

  it('renders nested loading correctly when children are present', async () => {
    render(html`<vi-spin><div class="content">Content</div></vi-spin>`, container);
    const el = container.querySelector('vi-spin') as ViSpin;
    await el.updateComplete;

    const nestedEl = el.shadowRoot?.querySelector('.spin-nested-loading');
    expect(nestedEl).toBeTruthy();
  });

  it('delays showing spinner if delay is provided', async () => {
    render(html`<vi-spin delay="100"></vi-spin>`, container);
    const el = container.querySelector('vi-spin') as ViSpin;
    // We do not await updateComplete immediately because we want to catch the state before delay
    
    const wrapper = el.shadowRoot?.querySelector('.spin-wrapper');
    expect(wrapper).toBeFalsy();

    await new Promise((resolve) => setTimeout(resolve, 150));
    await el.updateComplete;

    const wrapperAfterDelay = el.shadowRoot?.querySelector('.spin-wrapper');
    expect(wrapperAfterDelay).toBeTruthy();
  });
});
