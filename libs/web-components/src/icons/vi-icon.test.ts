import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import { registerIcons } from './registry.js';
import './vi-icon.js';
import type { ViIcon } from './vi-icon.js';

describe('vi-icon', () => {
  let container: HTMLElement;

  beforeAll(() => {
    registerIcons({ name: 'test-icon', data: '<svg><path d="M0,0 H1"></path></svg>' });
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders nothing if icon is not registered', async () => {
    render(html`<vi-icon name="unknown"></vi-icon>`, container);
    const icon = await $('vi-icon');
    const span = await icon.shadow$('span');
    await expect(span).not.toExist();
  });

  it('renders decorative icon with aria-hidden when label is missing', async () => {
    render(html`<vi-icon name="test-icon"></vi-icon>`, container);
    const icon = await $('vi-icon');
    const span = await icon.shadow$('span');
    await expect(span).toExist();
    expect(await span.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders accessible icon with role=img and aria-label when label is provided', async () => {
    render(html`<vi-icon name="test-icon" label="Accessible Label"></vi-icon>`, container);
    const icon = await $('vi-icon');
    const span = await icon.shadow$('span');
    await expect(span).toExist();
    expect(await span.getAttribute('role')).toBe('img');
    expect(await span.getAttribute('aria-label')).toBe('Accessible Label');
  });

  it('sets and removes --vi-icon-size inline style based on size attribute', async () => {
    render(html`<vi-icon id="sized" name="test-icon" size="32"></vi-icon>`, container);
    const icon = await $('#sized');
    
    let style = await icon.getAttribute('style');
    expect(style).toContain('--vi-icon-size: 32px');

    // Remove the attribute to test the removeProperty branch
    await browser.execute((el: ViIcon) => {
      el.removeAttribute('size');
    }, await icon as unknown as ViIcon);

    await browser.pause(50); // wait for Lit update
    
    style = await icon.getAttribute('style');
    expect(style).not.toContain('--vi-icon-size');
  });
});
