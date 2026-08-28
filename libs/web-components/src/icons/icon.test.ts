import { $, expect } from '@wdio/globals';
import './vi-icon.js';
import { registerIcons } from './registry.js';
import { checkIcon } from '@vialiq/icons/check';
import { xIcon } from '@vialiq/icons/x';

// Register icons before tests run
registerIcons([checkIcon, xIcon]);

describe('vi-icon', () => {
  it('renders svg for a registered icon', async () => {
    await browser.execute(() => {
      const icon = document.createElement('vi-icon');
      icon.id = 'icon-check';
      icon.setAttribute('name', 'check');
      document.body.appendChild(icon);
    });

    const host = await $('#icon-check');
    await expect(host).toExist();

    const span = await host.shadow$('span');
    await expect(span).toExist();

    const svg = await host.shadow$('svg');
    await expect(svg).toExist();
  });

  it('renders nothing for an unregistered icon name', async () => {
    await browser.execute(() => {
      const icon = document.createElement('vi-icon');
      icon.id = 'icon-missing';
      icon.setAttribute('name', 'does-not-exist');
      document.body.appendChild(icon);
    });

    const host = await $('#icon-missing');
    await expect(host).toExist();

    // Wait for Lit's async render cycle to complete
    await browser.executeAsync((el: any, done: () => void) => {
      el.updateComplete.then(done);
    }, host);

    // Use execute() to check shadow DOM directly — avoids wdio BiDi stale-ref issue with shadow$
    const hasSvg = await browser.execute((el: any) => !!el.shadowRoot?.querySelector('svg'), host);
    expect(hasSvg).toBe(false);
  });

  it('sets aria-hidden on decorative icons (no label)', async () => {
    await browser.execute(() => {
      const icon = document.createElement('vi-icon');
      icon.id = 'icon-decorative';
      icon.setAttribute('name', 'check');
      document.body.appendChild(icon);
    });

    const host = await $('#icon-decorative');
    const span = await host.shadow$('span[aria-hidden="true"]');
    await expect(span).toExist();
  });

  it('sets role="img" and aria-label on labelled icons', async () => {
    await browser.execute(() => {
      const icon = document.createElement('vi-icon');
      icon.id = 'icon-labelled';
      icon.setAttribute('name', 'check');
      icon.setAttribute('label', 'Confirmed');
      document.body.appendChild(icon);
    });

    const host = await $('#icon-labelled');
    const span = await host.shadow$('span[role="img"]');
    await expect(span).toExist();
    await expect(span).toHaveAttribute('aria-label', 'Confirmed');
  });

  it('applies size via CSS custom property', async () => {
    await browser.execute(() => {
      const icon = document.createElement('vi-icon');
      icon.id = 'icon-sized';
      icon.setAttribute('name', 'x');
      icon.setAttribute('size', '32');
      document.body.appendChild(icon);
    });

    const host = await $('#icon-sized');
    const iconSize = await browser.execute((el) => el.style.getPropertyValue('--vi-icon-size'), host);
    await expect(iconSize).toBe('32px');
  });
});
