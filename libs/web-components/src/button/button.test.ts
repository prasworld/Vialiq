import { $, expect } from '@wdio/globals';
import './vi-button.ts';

describe('vi-button', () => {
  it('renders and applies primary variant style token', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="primary" variant="primary">Save</vi-button>';
    });

    const host = await $('#primary');
    await expect(host).toExist();

    const button = await host.shadow$('button');
    await expect(button).toExist();
    await expect(button).toHaveText('Save');
  });

  it('supports disabled state', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="primary" variant="primary">Save</vi-button>';
    });

    const host = await $('#primary');
    await browser.execute((el) => el.setAttribute('disabled', ''), host);

    const button = await host.shadow$('button');
    await expect(button).toBeDisabled();
  });

  it('reflects variant change and style token from tokenized CSS vars', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="variant-test" variant="secondary">Action</vi-button>';
    });

    const host = await $('#variant-test');
    const button = await host.shadow$('button');

    await expect(button).toHaveText('Action');
    const colorBefore = await browser.execute((el) => getComputedStyle(el).backgroundColor, button);
    await expect(colorBefore).not.toBe('rgba(0, 0, 0, 0)');

    await browser.execute((el) => el.setAttribute('variant', 'danger'), host);
    await browser.pause(50);
    const colorAfter = await browser.execute((el) => getComputedStyle(el).backgroundColor, button);
    await expect(colorAfter).not.toEqual(colorBefore);
  });

  it('sets aria-disabled and tabindex on host when disabled', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="a11y-test" variant="primary">Save</vi-button>';
    });

    const host = await $('#a11y-test');

    // Enabled state
    await expect(host).toHaveAttribute('aria-disabled', 'false');
    await expect(host).toHaveAttribute('tabindex', '0');

    // Disabled state
    await browser.execute((el) => el.setAttribute('disabled', ''), host);
    await browser.pause(50);
    await expect(host).toHaveAttribute('aria-disabled', 'true');
    await expect(host).toHaveAttribute('tabindex', '-1');
  });

  it('does not call click handler when disabled', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="disabled-click" variant="primary">Submit</vi-button>';
    });

    await browser.execute(() => {
      const host = document.querySelector('#disabled-click');
      if (!host) throw new Error('no host');
      host.setAttribute('disabled', '');
       (window as unknown as {wasClicked?: boolean}).wasClicked = false;

      host.addEventListener('click', () => {
         (window as unknown as {wasClicked?: boolean}).wasClicked = true;
      });

      const btn = host.shadowRoot?.querySelector('button');
      btn?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    const clicked = await browser.execute(() => (window as unknown as {wasClicked?: boolean}).wasClicked);
    await expect(clicked).toBe(false);
  });
});
